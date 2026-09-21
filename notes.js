(function () {
  "use strict";

  var SUPABASE_URL = "https://woxiufyxdvrfdhdbzjih.supabase.co";
  var SUPABASE_ANON_KEY = "sb_publishable_9DSKbmUvLyi9On_2PDFfrg_BxvDubjT";

  var NAME_KEY = "bsb-viewer-name";
  var MINE_KEY = "bsb-my-note-ids";
  var LOCAL_KEY = "bsb-pilot-notes-v1";

  var els = {};
  var client = null;
  var mode = "loading"; // "shared" | "local"
  var currentContext = null; // { id, label } | null
  var localNotes = [];
  var sharedNotes = [];

  function $(id) { return document.getElementById(id); }

  function cacheEls() {
    els.toggle = $("notes-toggle");
    els.badge = $("notes-count");
    els.drawer = $("notes-drawer");
    els.close = $("notes-close");
    els.list = $("notes-list");
    els.modeNote = $("notes-mode-note");
    els.compose = $("notes-compose");
    els.input = $("notes-input");
    els.error = $("notes-error");
    els.contextLabelWrap = $("notes-context-label");
    els.contextCheckbox = $("notes-attach-context");
    els.contextText = $("notes-context-text");
  }

  // ---------------------------------------------------------------------
  // No-login identity: a per-browser display name, auto-generated so the
  // first interaction isn't blocked by a prompt, renameable any time.
  // ---------------------------------------------------------------------
  function getViewerName() {
    try {
      var stored = window.localStorage.getItem(NAME_KEY);
      if (stored) return stored;
    } catch (e) { /* ignore */ }
    var name = "Guest " + Math.floor(100 + Math.random() * 900);
    try { window.localStorage.setItem(NAME_KEY, name); } catch (e) { /* ignore */ }
    return name;
  }

  function setViewerName(name) {
    name = (name || "").trim();
    if (!name) return;
    try { window.localStorage.setItem(NAME_KEY, name); } catch (e) { /* ignore */ }
    if (mode === "shared") renderModeNote();
  }

  function escapeHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function myNoteIds() {
    try {
      var raw = window.localStorage.getItem(MINE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  function rememberMyNoteId(id) {
    var ids = myNoteIds();
    ids.push(id);
    try { window.localStorage.setItem(MINE_KEY, JSON.stringify(ids)); } catch (e) { /* ignore */ }
  }

  // ---------------------------------------------------------------------
  // Local (per-browser) fallback storage, used only if Supabase can't be
  // reached (offline, misconfigured, blocked network).
  // ---------------------------------------------------------------------
  function loadLocalNotes() {
    try {
      var raw = window.localStorage.getItem(LOCAL_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveLocalNotes(notes) {
    try {
      window.localStorage.setItem(LOCAL_KEY, JSON.stringify(notes));
    } catch (e) {
      /* storage unavailable - notes stay in-memory only for this view */
    }
  }

  // ---------------------------------------------------------------------
  // Context: which card/stage/day is currently open in the detail panel.
  // app.js dispatches "bsb:panel-change" on every open/switch/close, so
  // that's the live source of truth; readCurrentContext() only seeds the
  // initial value from the DOM, since app.js's own initial (hash-driven)
  // open can fire before this script has registered its listener.
  // ---------------------------------------------------------------------
  function readCurrentContext() {
    var panel = $("panel");
    if (!panel || panel.hidden) return null;
    var titleEl = document.querySelector("#panel-content .panel-title");
    var label = titleEl ? titleEl.textContent.trim() : "";
    if (!label) return null;
    var id = window.location.hash.replace(/^#/, "") || null;
    return { id: id, label: label };
  }

  function applyContextChip() {
    if (currentContext) {
      els.contextLabelWrap.hidden = false;
      els.contextText.textContent = "Attach to: " + currentContext.label;
    } else {
      els.contextLabelWrap.hidden = true;
    }
  }

  function refreshContextChip() {
    applyContextChip();
  }

  // ---------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------
  function formatRelativeTime(iso) {
    var then = new Date(iso).getTime();
    if (isNaN(then)) return "";
    var diffSec = Math.round((Date.now() - then) / 1000);
    if (diffSec < 10) return "just now";
    if (diffSec < 60) return diffSec + "s ago";
    var diffMin = Math.round(diffSec / 60);
    if (diffMin < 60) return diffMin + "m ago";
    var diffHr = Math.round(diffMin / 60);
    if (diffHr < 24) return diffHr + "h ago";
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }

  function buildNoteEl(note, opts) {
    var li = document.createElement("div");
    li.className = "note-item";

    var img = document.createElement("img");
    img.className = "note-avatar";
    img.alt = "";
    img.src = opts.avatarUrl || "";
    li.appendChild(img);

    var body = document.createElement("div");
    body.className = "note-body";

    var meta = document.createElement("div");
    meta.className = "note-meta";

    var author = document.createElement("span");
    author.className = "note-author";
    author.textContent = opts.authorName || "Someone";
    meta.appendChild(author);

    var time = document.createElement("span");
    time.className = "note-time";
    time.textContent = formatRelativeTime(note.createdAt);
    meta.appendChild(time);

    if (note.context && note.context.label) {
      var ctx = document.createElement("span");
      ctx.className = "note-context";
      ctx.textContent = note.context.label;
      meta.appendChild(ctx);
    }
    body.appendChild(meta);

    var text = document.createElement("div");
    text.className = "note-text";
    text.textContent = note.text;
    body.appendChild(text);

    if (opts.canDelete) {
      var del = document.createElement("button");
      del.type = "button";
      del.className = "note-delete";
      del.textContent = "Delete";
      del.addEventListener("click", function () { opts.onDelete(note); });
      body.appendChild(del);
    }

    li.appendChild(body);
    return li;
  }

  function renderEmpty() {
    els.list.innerHTML = "";
    var p = document.createElement("p");
    p.className = "notes-empty";
    p.textContent = "No notes yet. Add the first one below.";
    els.list.appendChild(p);
  }

  function updateBadge(count) {
    if (count > 0) {
      els.badge.hidden = false;
      els.badge.textContent = String(count);
    } else {
      els.badge.hidden = true;
    }
  }

  function renderShared() {
    updateBadge(sharedNotes.length);
    if (!sharedNotes.length) { renderEmpty(); return; }
    var mine = myNoteIds();
    els.list.innerHTML = "";
    sharedNotes.forEach(function (n) {
      els.list.appendChild(buildNoteEl(n, {
        authorName: n.authorName,
        avatarUrl: "",
        canDelete: mine.indexOf(n.id) !== -1,
        onDelete: deleteSharedNote
      }));
    });
    els.list.scrollTop = els.list.scrollHeight;
  }

  function renderLocalNotes() {
    updateBadge(localNotes.length);
    if (!localNotes.length) { renderEmpty(); return; }
    els.list.innerHTML = "";
    localNotes.forEach(function (n) {
      els.list.appendChild(buildNoteEl(n, {
        authorName: "You",
        avatarUrl: "",
        canDelete: true,
        onDelete: deleteLocalNote
      }));
    });
    els.list.scrollTop = els.list.scrollHeight;
  }

  // ---------------------------------------------------------------------
  // Shared (Supabase) mode -- open to anyone with the link, no login.
  // ---------------------------------------------------------------------
  function setModeNote(text) {
    els.modeNote.textContent = text;
  }

  function renderModeNote() {
    els.modeNote.innerHTML = "Shared with everyone viewing this page — posting as <strong>" +
      escapeHtml(getViewerName()) + '</strong> <button type="button" id="notes-change-name" class="notes-change-name-btn">change</button>.';
    var btn = document.getElementById("notes-change-name");
    if (btn) {
      btn.addEventListener("click", function () {
        var next = window.prompt("Your name, for notes you add:", getViewerName());
        if (next !== null) setViewerName(next);
      });
    }
  }

  function mapRow(row) {
    return {
      id: row.id,
      text: row.text,
      authorName: row.author_name || "Someone",
      createdAt: row.created_at,
      context: row.context_label ? { id: row.context_id, label: row.context_label } : null
    };
  }

  function upsertLocalCache(note) {
    var idx = sharedNotes.findIndex(function (n) { return n.id === note.id; });
    if (idx === -1) sharedNotes.push(note); else sharedNotes[idx] = note;
    sharedNotes.sort(function (a, b) { return new Date(a.createdAt) - new Date(b.createdAt); });
  }

  function subscribeShared() {
    client.from("bsb_notes").select("*").order("created_at", { ascending: true }).limit(500)
      .then(function (res) {
        if (res.error) { setModeNote("Couldn't load shared notes."); return; }
        sharedNotes = (res.data || []).map(mapRow);
        renderShared();
      });

    client.channel("bsb_notes_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "bsb_notes" }, function (payload) {
        if (payload.eventType === "DELETE") {
          sharedNotes = sharedNotes.filter(function (n) { return n.id !== payload.old.id; });
        } else {
          upsertLocalCache(mapRow(payload.new));
        }
        renderShared();
      })
      .subscribe();
  }

  function addSharedNote(text, context) {
    return client.from("bsb_notes").insert({
      text: text,
      author_name: getViewerName(),
      context_id: context ? context.id : null,
      context_label: context ? context.label : null
    }).select().single().then(function (res) {
      if (res.error) throw res.error;
      rememberMyNoteId(res.data.id);
      upsertLocalCache(mapRow(res.data));
      renderShared();
    });
  }

  function deleteSharedNote(note) {
    client.from("bsb_notes").delete().eq("id", note.id).then(function (res) {
      if (res.error) {
        els.error.textContent = "Couldn't delete that note.";
        return;
      }
      sharedNotes = sharedNotes.filter(function (n) { return n.id !== note.id; });
      renderShared();
    });
  }

  // ---------------------------------------------------------------------
  // Local mode
  // ---------------------------------------------------------------------
  function addLocalNote(text, context) {
    localNotes.push({
      id: "n" + Date.now() + Math.random().toString(36).slice(2, 7),
      text: text,
      createdAt: new Date().toISOString(),
      context: context
    });
    saveLocalNotes(localNotes);
    renderLocalNotes();
  }

  function deleteLocalNote(note) {
    localNotes = localNotes.filter(function (n) { return n.id !== note.id; });
    saveLocalNotes(localNotes);
    renderLocalNotes();
  }

  // ---------------------------------------------------------------------
  // Drawer open/close + form
  // ---------------------------------------------------------------------
  function openDrawer() {
    refreshContextChip();
    els.drawer.hidden = false;
    els.drawer.setAttribute("aria-hidden", "false");
    els.input.focus();
  }

  function closeDrawer() {
    els.drawer.hidden = true;
    els.drawer.setAttribute("aria-hidden", "true");
  }

  function handleSubmit(e) {
    e.preventDefault();
    var text = els.input.value.trim();
    if (!text) return;
    els.error.textContent = "";
    var context = (currentContext && els.contextCheckbox.checked) ? currentContext : null;

    var result = mode === "shared" ? addSharedNote(text, context) : (addLocalNote(text, context), Promise.resolve());
    result.then(function () {
      els.input.value = "";
    }).catch(function () {
      els.error.textContent = "Couldn't save that note — try again.";
    });
  }

  function wire() {
    els.toggle.addEventListener("click", function () {
      if (els.drawer.hidden) openDrawer(); else closeDrawer();
    });
    els.close.addEventListener("click", closeDrawer);
    els.compose.addEventListener("submit", handleSubmit);
    // app.js uses history.replaceState for card/stage/day navigation, which
    // never fires "hashchange" -- so it dispatches this custom event instead
    // on every open, switch, and close of the detail panel.
    window.addEventListener("bsb:panel-change", function (e) {
      currentContext = (e.detail && e.detail.id) ? { id: e.detail.id, label: e.detail.label } : null;
      if (!els.drawer.hidden) applyContextChip();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape" || els.drawer.hidden) return;
      // Let app.js's own Escape handler close the modal/detail panel first
      // when one is on top; only close notes once nothing else is open, so
      // one Escape press closes one thing at a time.
      var modal = $("questions-modal");
      var panel = $("panel");
      var somethingElseOpen = (modal && !modal.hidden) || (panel && !panel.hidden);
      if (!somethingElseOpen) closeDrawer();
    });
  }

  // ---------------------------------------------------------------------
  // Init
  // ---------------------------------------------------------------------
  function init() {
    cacheEls();
    currentContext = readCurrentContext();
    wire();
    setModeNote("Connecting…");

    if (!window.supabase || typeof window.supabase.createClient !== "function" ||
        SUPABASE_URL.indexOf("REPLACE_WITH") === 0) {
      startLocalMode();
      return;
    }

    try {
      client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch (e) {
      startLocalMode();
      return;
    }

    mode = "shared";
    renderModeNote();
    subscribeShared();
  }

  function startLocalMode() {
    mode = "local";
    localNotes = loadLocalNotes();
    setModeNote("Saved to this browser only.");
    renderLocalNotes();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
