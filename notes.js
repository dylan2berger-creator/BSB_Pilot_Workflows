(function () {
  "use strict";

  var LOCAL_KEY = "bsb-pilot-notes-v1";

  var els = {};
  var db = null;
  var user = null;
  var myId = null;
  var isOwner = false;
  var mode = "loading"; // "shared" | "local" | "loading"
  var unsubscribe = null;
  var currentContext = null; // { id, label } | null
  var localNotes = [];

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
  // Local (per-browser) fallback storage
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

  function renderSharedNotes(docs) {
    updateBadge(docs.length);
    if (!docs.length) { renderEmpty(); return; }

    var ids = [];
    docs.forEach(function (d) { if (d.authorId && ids.indexOf(d.authorId) === -1) ids.push(d.authorId); });

    Promise.resolve(user ? user.profiles(ids) : {}).then(function (profiles) {
      els.list.innerHTML = "";
      docs.forEach(function (d) {
        var profile = d.authorId ? profiles[d.authorId] : null;
        var authorName = profile && profile.name ? profile.name : "Someone";
        var avatarUrl = profile ? profile.avatarUrl : "";
        var canDelete = !!(d.authorId && myId && d.authorId === myId) || isOwner;
        els.list.appendChild(buildNoteEl(d, {
          authorName: authorName,
          avatarUrl: avatarUrl,
          canDelete: canDelete,
          onDelete: deleteSharedNote
        }));
      });
      els.list.scrollTop = els.list.scrollHeight;
    });
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
  // Shared (db) mode
  // ---------------------------------------------------------------------
  function setModeNote(text) {
    els.modeNote.textContent = text;
  }

  function subscribeShared() {
    var query = db.collection("notes").orderBy("createdAt", "asc").limit(500);
    unsubscribe = query.onSnapshot(
      function (snap) {
        var docs = snap.docs.map(function (d) {
          var data = d.data() || {};
          return {
            id: d.id,
            text: typeof data.text === "string" ? data.text : "",
            authorId: data.authorId || null,
            createdAt: data.createdAt || new Date().toISOString(),
            context: data.context || null
          };
        });
        renderSharedNotes(docs);
      },
      function (err) {
        if (err.code === "revoked") {
          setModeNote("Notes are no longer available for this session.");
        } else {
          els.error.textContent = "Notes feed lost connection (" + err.code + ").";
        }
      }
    );
  }

  function addSharedNote(text, context) {
    return db.collection("notes").add({
      text: text,
      authorId: myId,
      createdAt: new Date().toISOString(),
      context: context
    });
  }

  function deleteSharedNote(note) {
    db.collection("notes").doc(note.id).delete().catch(function () {
      els.error.textContent = "Couldn't delete that note.";
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

    var result;
    if (mode === "shared") {
      result = addSharedNote(text, context);
    } else {
      addLocalNote(text, context);
      result = Promise.resolve();
    }
    result.then(function () {
      els.input.value = "";
    }).catch(function (err) {
      var code = err && err.code;
      if (code === "quota_exceeded") {
        els.error.textContent = "This session's note store is full.";
      } else if (code === "resource_exhausted") {
        els.error.textContent = "Too many notes too fast — try again in a moment.";
      } else {
        els.error.textContent = "Couldn't save that note — try again.";
      }
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

    var claude = window.claude;
    if (!claude || typeof claude.use !== "function") {
      startLocalMode();
      return;
    }

    Promise.all([claude.use("db"), claude.use("user")]).then(function (res) {
      db = res[0];
      user = res[1];
      if (!db) { startLocalMode(); return; }

      var idPromise = user ? user.id() : Promise.resolve(null);
      var ownerPromise = user ? user.isOwner() : Promise.resolve(false);
      Promise.all([idPromise, ownerPromise]).then(function (r) {
        myId = r[0];
        isOwner = r[1];
        mode = "shared";
        setModeNote("Shared with everyone viewing this page.");
        subscribeShared();
      });
    }).catch(function () {
      startLocalMode();
    });
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
