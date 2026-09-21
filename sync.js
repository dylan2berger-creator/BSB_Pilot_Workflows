(function () {
  "use strict";

  // Same Supabase project as notes.js -- this file only touches bsb_edits.
  var SUPABASE_URL = "https://woxiufyxdvrfdhdbzjih.supabase.co";
  var SUPABASE_ANON_KEY = "sb_publishable_9DSKbmUvLyi9On_2PDFfrg_BxvDubjT";

  // Bridges app.js's local edits (localStorage, always-on) to a shared
  // Supabase table, open to anyone with the link -- no Claude account and
  // no org membership required. app.js works exactly the same with or
  // without this file -- it only ever talks to the "bsb:edits-changed" /
  // "bsb:remote-edit" events, never to Supabase directly, so it stays
  // fully functional standalone (file://, no network at all) with this
  // script simply absent.
  //
  // Table shape: one row per edits[] key ("s1-customer", "stage:s1",
  // "day:4", ...): { key text primary key, value jsonb }. Splitting per
  // key (rather than one shared blob) means two viewers editing different
  // cards at once never clobber each other; only two edits to the exact
  // same card at the exact same moment race, and the second write simply
  // wins -- an accepted tradeoff for a live walkthrough, not a rigorous
  // collaborative-editing guarantee.

  var TABLE = "bsb_edits";
  var client = null;

  function dispatchRemote(key, value) {
    window.dispatchEvent(new CustomEvent("bsb:remote-edit", { detail: { key: key, value: value } }));
  }

  function handleLocalChange(e) {
    if (!client) return;
    var key = e.detail.key;
    var value = e.detail.value;

    if (key === null) {
      // Revert all: clear every row. Each deletion reaches other viewers
      // as its own DELETE change, so there's no separate wipe signal.
      client.from(TABLE).delete().neq("key", "").then(function () {});
      return;
    }

    client.from(TABLE).upsert({ key: key, value: value }).then(function (res) {
      if (res.error) {
        // This edit still applies locally via app.js, but other viewers
        // won't see it until this succeeds -- most often a Supabase RLS
        // policy on bsb_edits, or the table missing from the project's
        // realtime publication. Logged (not shown in the UI) so it's
        // diagnosable via devtools without alarming everyone mid-session.
        console.error("[bsb sync] failed to save edit for \"" + key + "\":", res.error);
      }
    });
  }

  function subscribe() {
    client.from(TABLE).select("*").then(function (res) {
      if (res.error) {
        console.error("[bsb sync] failed to load edits from Supabase:", res.error);
        return;
      }
      (res.data || []).forEach(function (row) { dispatchRemote(row.key, row.value); });
    });

    client.channel(TABLE + "_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: TABLE }, function (payload) {
        if (payload.eventType === "DELETE") {
          dispatchRemote(payload.old.key, null);
        } else {
          dispatchRemote(payload.new.key, payload.new.value);
        }
      })
      // status is "SUBSCRIBED" once the realtime channel is actually live;
      // "CHANNEL_ERROR"/"TIMED_OUT" here means other viewers' edits won't
      // arrive live even though local edits still save fine to the table.
      .subscribe(function (status) {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.error("[bsb sync] realtime subscription to \"" + TABLE + "\" failed:", status);
        }
      });
  }

  function init() {
    if (!window.supabase || typeof window.supabase.createClient !== "function" ||
        SUPABASE_URL.indexOf("REPLACE_WITH") === 0) {
      return;
    }
    try {
      client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch (e) {
      return;
    }
    window.addEventListener("bsb:edits-changed", handleLocalChange);
    subscribe();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
