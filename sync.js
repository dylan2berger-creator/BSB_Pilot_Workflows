(function () {
  "use strict";

  // Bridges app.js's local edits (localStorage, always-on) to the
  // Artifact's shared db, so a card/stage/day edit made by one viewer
  // appears live for everyone else with the page open. app.js works
  // exactly the same with or without this file -- it only ever talks to
  // the "bsb:edits-changed" / "bsb:remote-edit" events, never to db
  // directly, so it stays fully functional standalone (file://, no
  // window.claude) with this script simply absent.
  //
  // Collection shape: one doc per edits[] key ("s1-customer",
  // "stage:s1", "day:4", ...), each { value: <that key's overlay object> }.
  // Splitting per key (rather than one big shared doc) means two viewers
  // editing different cards at once never clobber each other; only two
  // edits to the exact same card at the exact same moment race, and the
  // second write simply wins -- an accepted tradeoff for a live
  // walkthrough, not a rigorous collaborative-editing guarantee.

  var COLLECTION_PATH = "edits";
  var db = null;
  var knownDocIds = {};

  function dispatchRemote(key, value) {
    window.dispatchEvent(new CustomEvent("bsb:remote-edit", { detail: { key: key, value: value } }));
  }

  function handleLocalChange(e) {
    if (!db) return;
    var key = e.detail.key;
    var value = e.detail.value;

    if (key === null) {
      // Revert all: remove every doc this view has seen. Each delete
      // reaches other viewers as its own "removed" change, so there's no
      // separate wipe signal to send.
      Object.keys(knownDocIds).forEach(function (id) {
        db.collection(COLLECTION_PATH).doc(id).delete().catch(function () { /* not ours to fix here */ });
      });
      knownDocIds = {};
      return;
    }

    db.collection(COLLECTION_PATH).doc(key).set({ value: value }).then(function () {
      knownDocIds[key] = true;
    }).catch(function () {
      /* likely a viewer without write access (signed out or outside the
         org) -- their own edit still applies locally via app.js; it just
         doesn't reach anyone else. */
    });
  }

  function subscribe() {
    db.collection(COLLECTION_PATH).onSnapshot(function (snap) {
      snap.docChanges().forEach(function (change) {
        var key = change.doc.id;
        if (change.type === "removed") {
          delete knownDocIds[key];
          dispatchRemote(key, null);
        } else {
          knownDocIds[key] = true;
          var data = change.doc.data();
          dispatchRemote(key, data ? data.value : null);
        }
      });
    }, function () {
      /* connection lost; app.js keeps working off its local copy */
    });
  }

  function init() {
    var claude = window.claude;
    if (!claude || typeof claude.use !== "function") return;

    claude.use("db").then(function (resolvedDb) {
      db = resolvedDb;
      if (!db) return;
      window.addEventListener("bsb:edits-changed", handleLocalChange);
      subscribe();
    }).catch(function () {});
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
