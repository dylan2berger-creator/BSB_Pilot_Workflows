(function () {
  "use strict";

  var ALLOWED_OWNERS = ["BSB", "Boyd", "Both"];
  var EDIT_STORAGE_KEY = "bsb-pilot-edits-v1";
  var EDITABLE_FIELDS = ["head", "card", "slide"];
  var STAGE_EDITABLE_FIELDS = ["when", "what", "owner", "exit", "note"];
  var DAY_EDITABLE_FIELDS = ["label", "detail"];

  // ---------------------------------------------------------------------
  // Formatting: escape HTML, then apply `code` chips and **bold**.
  // ---------------------------------------------------------------------
  function escapeHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatText(str) {
    var s = escapeHtml(str);
    s = s.replace(/`([^`]+)`/g, '<span class="mono-chip">$1</span>');
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    return s;
  }

  // ---------------------------------------------------------------------
  // Storage helpers (edit mode overrides) - never throw.
  // ---------------------------------------------------------------------
  function loadEdits() {
    try {
      var raw = window.localStorage.getItem(EDIT_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  // changedKey is the specific edits[] entry that just changed (a box id,
  // "stage:<id>", or "day:<n>"), or null for a full wipe (Revert all).
  // Always persists to this browser's localStorage; also broadcasts
  // "bsb:edits-changed" so a hosted-only script can additionally push the
  // change to a shared backend, without app.js knowing or caring whether
  // one is listening.
  function saveEdits(changedKey) {
    try {
      window.localStorage.setItem(EDIT_STORAGE_KEY, JSON.stringify(edits));
    } catch (e) {
      /* storage unavailable - edits stay in-memory only for this session */
    }
    window.dispatchEvent(new CustomEvent("bsb:edits-changed", {
      detail: { key: changedKey, value: changedKey ? edits[changedKey] : null }
    }));
  }

  function clearEdits() {
    try {
      window.localStorage.removeItem(EDIT_STORAGE_KEY);
    } catch (e) {
      /* ignore */
    }
  }

  // ---------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------
  function validateSteps(rawSteps, path, errors) {
    var steps = [];
    if (Array.isArray(rawSteps)) {
      rawSteps.forEach(function (s, si) {
        if (!s || typeof s.text !== "string") {
          errors.push(path + "[" + si + "] is missing text — step skipped.");
          return;
        }
        steps.push({ text: s.text, manual: !!s.manual });
      });
    }
    return steps;
  }

  function validateContent(raw) {
    var errors = [];
    var result = {
      meta: { title: "BSB Pilot Workflow", facts: "", cadenceHeading: "12-Day Cadence" },
      lanes: [],
      stages: [],
      boxes: [],
      days: []
    };

    if (!raw || typeof raw !== "object") {
      errors.push('content.js: window.BSB_CONTENT is missing or not an object.');
      return { data: result, errors: errors };
    }

    // meta
    if (raw.meta && typeof raw.meta === "object") {
      result.meta.title = typeof raw.meta.title === "string" ? raw.meta.title : result.meta.title;
      result.meta.facts = typeof raw.meta.facts === "string" ? raw.meta.facts : "";
      result.meta.cadenceHeading = typeof raw.meta.cadenceHeading === "string" ? raw.meta.cadenceHeading : result.meta.cadenceHeading;
    } else {
      errors.push("content.js: meta is missing or malformed — using fallback title/labels.");
    }

    // lanes
    var laneIds = {};
    if (Array.isArray(raw.lanes)) {
      raw.lanes.forEach(function (lane, i) {
        if (!lane || typeof lane.id !== "string" || !lane.id) {
          errors.push("content.js: lanes[" + i + "].id is missing — lane skipped.");
          return;
        }
        if (laneIds[lane.id]) {
          errors.push("content.js: lanes[" + i + "].id \"" + lane.id + "\" is a duplicate — lane skipped.");
          return;
        }
        laneIds[lane.id] = true;
        result.lanes.push({
          id: lane.id,
          name: typeof lane.name === "string" ? lane.name : lane.id,
          sub: typeof lane.sub === "string" ? lane.sub : ""
        });
      });
    } else {
      errors.push("content.js: lanes is missing or not an array.");
    }

    // stages
    var stageIds = {};
    if (Array.isArray(raw.stages)) {
      raw.stages.forEach(function (stage, i) {
        if (!stage || typeof stage.id !== "string" || !stage.id) {
          errors.push("content.js: stages[" + i + "].id is missing — stage skipped.");
          return;
        }
        if (stageIds[stage.id]) {
          errors.push("content.js: stages[" + i + "].id \"" + stage.id + "\" is a duplicate — stage skipped.");
          return;
        }
        stageIds[stage.id] = true;
        result.stages.push({
          id: stage.id,
          when: typeof stage.when === "string" ? stage.when : "",
          what: typeof stage.what === "string" ? stage.what : stage.id,
          owner: typeof stage.owner === "string" ? stage.owner : "",
          exit: typeof stage.exit === "string" ? stage.exit : "",
          note: typeof stage.note === "string" ? stage.note : "",
          light: !!stage.light
        });
      });
    } else {
      errors.push("content.js: stages is missing or not an array.");
    }

    // boxes
    var seenPairs = {};
    if (Array.isArray(raw.boxes)) {
      raw.boxes.forEach(function (box, i) {
        if (!box || typeof box !== "object") {
          errors.push("content.js: boxes[" + i + "] is not an object — skipped.");
          return;
        }
        var path = "content.js: boxes[" + i + "]";
        if (!stageIds[box.stage]) {
          errors.push(path + ".stage \"" + box.stage + "\" does not match any stage id — box skipped.");
          return;
        }
        if (!laneIds[box.lane]) {
          errors.push(path + ".lane \"" + box.lane + "\" does not match any lane id — box skipped.");
          return;
        }
        var pairKey = box.stage + "|" + box.lane;
        if (seenPairs[pairKey]) {
          errors.push(path + ": duplicate box for stage \"" + box.stage + "\" × lane \"" + box.lane + "\" — box skipped.");
          return;
        }
        seenPairs[pairKey] = true;

        var questions = [];
        if (Array.isArray(box.questions)) {
          box.questions.forEach(function (q, qi) {
            if (!q || typeof q.q !== "string") {
              errors.push(path + ".questions[" + qi + "] is missing text — question skipped.");
              return;
            }
            var owner = q.owner;
            if (ALLOWED_OWNERS.indexOf(owner) === -1) {
              errors.push(path + ".questions[" + qi + "].owner \"" + owner + "\" is not one of BSB/Boyd/Both — question skipped.");
              return;
            }
            questions.push({ q: q.q, owner: owner, notes: typeof q.notes === "string" ? q.notes : "" });
          });
        }

        var steps = validateSteps(box.steps, path + ".steps", errors);

        result.boxes.push({
          id: box.stage + "-" + box.lane,
          stage: box.stage,
          lane: box.lane,
          head: typeof box.head === "string" ? box.head : "",
          card: typeof box.card === "string" ? box.card : "",
          slide: typeof box.slide === "string" ? box.slide : "",
          quiet: !!box.quiet,
          steps: steps,
          systems: Array.isArray(box.systems) ? box.systems.filter(function (s) { return typeof s === "string"; }) : [],
          questions: questions
        });
      });
    } else {
      errors.push("content.js: boxes is missing or not an array.");
    }

    // days
    if (Array.isArray(raw.days)) {
      raw.days.forEach(function (day, i) {
        if (!day || typeof day.day === "undefined") {
          errors.push("content.js: days[" + i + "].day is missing — day skipped.");
          return;
        }
        result.days.push({
          day: day.day,
          kind: ["auto", "human", "quiet"].indexOf(day.kind) !== -1 ? day.kind : "quiet",
          label: typeof day.label === "string" ? day.label : "",
          detail: typeof day.detail === "string" ? day.detail : ""
        });
      });
    } else {
      errors.push("content.js: days is missing or not an array.");
    }

    return { data: result, errors: errors };
  }

  // ---------------------------------------------------------------------
  // App state
  // ---------------------------------------------------------------------
  var baseContent = null;   // validated content, unedited
  var content = null;       // baseContent + edit overrides merged in
  var edits = {};           // { boxId: { head, card, slide, steps: {idx:text}, questions: {idx:text} } }
  var editMode = false;
  var boxById = {};         // id -> box (post-merge)
  var laneById = {};
  var stageById = {};
  var panelOrder = [];      // [{id, kind, stageId, laneId, day}]
  var panelIndexById = {};
  var currentPanelId = null;
  var lastFocusedBeforePanel = null;
  var lastFocusedBeforeModal = null;

  // Merges one pristine step list (already tagged with .origIndex) with its
  // overlay of {steps: {origIndex:text}, stepManual: {origIndex:bool},
  // removedSteps: [origIndex...], addedSteps: [{text,manual}...]}. Used for
  // both the box's default step list and each authored step category, so a
  // step's identity (and therefore every edit keyed by it) stays stable
  // across merges regardless of what's added or removed elsewhere.
  function stepKeyOf(step) {
    return step.added ? ("added:" + step.addedIndex) : ("orig:" + step.origIndex);
  }

  function mergeStepList(baseSteps, overlay) {
    var removedSteps = (overlay && overlay.removedSteps) || [];
    var textOverlay = (overlay && overlay.steps) || {};
    var manualOverlay = (overlay && overlay.stepManual) || {};
    var addedSteps = (overlay && overlay.addedSteps) || [];
    var stepOrder = (overlay && overlay.stepOrder) || null;

    var result = [];
    baseSteps.forEach(function (step) {
      if (removedSteps.indexOf(step.origIndex) !== -1) return;
      var merged = { text: step.text, manual: step.manual, origIndex: step.origIndex };
      if (typeof textOverlay[step.origIndex] === "string") merged.text = textOverlay[step.origIndex];
      if (typeof manualOverlay[step.origIndex] !== "undefined") merged.manual = manualOverlay[step.origIndex];
      result.push(merged);
    });
    addedSteps.forEach(function (as, ai) {
      result.push({ text: as.text, manual: !!as.manual, added: true, addedIndex: ai });
    });

    // A saved order (from drag/move-up/move-down) is a list of step keys.
    // Anything not mentioned in it -- most often a step added since the
    // order was last saved -- falls back to the end, in its natural order.
    if (stepOrder && stepOrder.length) {
      var byKey = {};
      result.forEach(function (s) { byKey[stepKeyOf(s)] = s; });
      var ordered = [];
      stepOrder.forEach(function (k) {
        if (byKey[k]) { ordered.push(byKey[k]); delete byKey[k]; }
      });
      result.forEach(function (s) {
        var k = stepKeyOf(s);
        if (byKey[k]) { ordered.push(s); delete byKey[k]; }
      });
      result = ordered;
    }

    return result;
  }

  function applyEdits(base, editsMap) {
    var clone = JSON.parse(JSON.stringify(base));
    clone.boxes.forEach(function (box) {
      // Always tag each original step with a stable index, whether or not
      // this box has any edits yet -- the UI addresses steps by this key
      // even before a first edit exists.
      box.steps.forEach(function (step, i) { step.origIndex = i; });
      box.questions.forEach(function (q, i) { q.origIndex = i; });

      var ov = editsMap[box.id] || {};

      EDITABLE_FIELDS.forEach(function (f) {
        if (typeof ov[f] === "string") box[f] = ov[f];
      });

      // Steps: text edits, manual toggle, and removal are all keyed by a
      // step's ORIGINAL content.js index, which stays stable across every
      // merge because this function always starts from a pristine clone of
      // base -- never from a previously-merged array. New in-session steps
      // are tracked separately (ov.addedSteps) and appended after.
      box.steps = mergeStepList(box.steps, {
        steps: ov.steps, stepManual: ov.stepManual, removedSteps: ov.removedSteps, addedSteps: ov.addedSteps,
        stepOrder: ov.stepOrder
      });

      // Questions: text/owner edits and removal are keyed by a question's
      // ORIGINAL index (stable for the same reason steps are); added
      // questions live in their own list, addressed by position in it.
      var removedQuestions = ov.removedQuestions || [];
      var survivingQuestions = [];
      box.questions.forEach(function (q) {
        if (removedQuestions.indexOf(q.origIndex) !== -1) return;
        if (ov.questions && typeof ov.questions[q.origIndex] === "string") q.q = ov.questions[q.origIndex];
        if (ov.questionOwner && typeof ov.questionOwner[q.origIndex] === "string") q.owner = ov.questionOwner[q.origIndex];
        if (ov.questionNotes && typeof ov.questionNotes[q.origIndex] === "string") q.notes = ov.questionNotes[q.origIndex];
        survivingQuestions.push(q);
      });
      if (ov.addedQuestions && ov.addedQuestions.length) {
        ov.addedQuestions.forEach(function (aq, ai) {
          survivingQuestions.push({ q: aq.q, owner: aq.owner, notes: aq.notes || "", added: true, addedIndex: ai });
        });
      }
      box.questions = survivingQuestions;
    });

    clone.stages.forEach(function (stage) {
      var editsKey = "stage:" + stage.id;
      var ov = editsMap[editsKey] || {};
      STAGE_EDITABLE_FIELDS.forEach(function (f) {
        if (typeof ov[f] === "string") stage[f] = ov[f];
      });
    });

    clone.days.forEach(function (day) {
      var editsKey = "day:" + day.day;
      var ov = editsMap[editsKey] || {};
      DAY_EDITABLE_FIELDS.forEach(function (f) {
        if (typeof ov[f] === "string") day[f] = ov[f];
      });
      if (typeof ov.kind === "string" && DAY_KINDS.indexOf(ov.kind) !== -1) {
        day.kind = ov.kind;
      }
    });

    return clone;
  }

  function rebuildIndexes() {
    boxById = {};
    laneById = {};
    stageById = {};
    content.boxes.forEach(function (b) { boxById[b.id] = b; });
    content.lanes.forEach(function (l) { laneById[l.id] = l; });
    content.stages.forEach(function (s) { stageById[s.id] = s; });
  }

  function buildPanelOrder() {
    panelOrder = [];
    content.stages.forEach(function (stage) {
      panelOrder.push({ id: "stage-" + stage.id, kind: "stage", stageId: stage.id });
      content.lanes.forEach(function (lane) {
        var boxId = stage.id + "-" + lane.id;
        if (boxById[boxId]) {
          panelOrder.push({ id: boxId, kind: "box", stageId: stage.id, laneId: lane.id });
        }
      });
    });
    content.days.forEach(function (day) {
      panelOrder.push({ id: "day-" + day.day, kind: "day", day: day.day });
    });
    panelIndexById = {};
    panelOrder.forEach(function (p, i) { panelIndexById[p.id] = i; });
  }

  // ---------------------------------------------------------------------
  // Error banner
  // ---------------------------------------------------------------------
  function renderErrorBanner(errors) {
    var banner = document.getElementById("error-banner");
    if (!errors.length) {
      banner.hidden = true;
      banner.innerHTML = "";
      return;
    }
    banner.hidden = false;
    var html = "<strong>" + errors.length + " problem" + (errors.length === 1 ? "" : "s") + " found in content.js</strong> — the rest of the page still rendered.";
    html += "<ul>" + errors.map(function (e) { return "<li>" + escapeHtml(e) + "</li>"; }).join("") + "</ul>";
    banner.innerHTML = html;
  }

  // ---------------------------------------------------------------------
  // Grid rendering
  // ---------------------------------------------------------------------
  function laneColorVar(laneId) {
    return "var(--color-lane-" + laneId + ", var(--color-accent))";
  }

  function renderGrid() {
    var grid = document.getElementById("grid");
    grid.innerHTML = "";
    grid.style.gridTemplateColumns = "190px repeat(" + content.stages.length + ", minmax(160px, 1fr))";

    var corner = document.createElement("div");
    corner.className = "cell corner-cell";
    grid.appendChild(corner);

    content.stages.forEach(function (stage) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "stage-header" + (stage.light ? " stage-header-light" : "");
      btn.dataset.panelId = "stage-" + stage.id;
      btn.innerHTML =
        '<div class="stage-when">' + formatText(stage.when) + "</div>" +
        '<div class="stage-what">' + formatText(stage.what) + "</div>";
      btn.addEventListener("click", function () { openPanelById(btn.dataset.panelId); });
      grid.appendChild(btn);
    });

    content.lanes.forEach(function (lane) {
      var laneHeader = document.createElement("div");
      laneHeader.className = "lane-header lane-" + lane.id;
      laneHeader.innerHTML =
        '<div class="lane-name">' + formatText(lane.name) + "</div>" +
        '<div class="lane-sub">' + formatText(lane.sub) + "</div>";
      grid.appendChild(laneHeader);

      content.stages.forEach(function (stage) {
        var cell = document.createElement("div");
        cell.className = "cell";
        var boxId = stage.id + "-" + lane.id;
        var box = boxById[boxId];
        if (box) {
          cell.appendChild(renderCard(box, lane));
        } else {
          var ph = document.createElement("div");
          ph.className = "placeholder-cell";
          ph.textContent = "—";
          cell.appendChild(ph);
        }
        grid.appendChild(cell);
      });
    });
  }

  function renderCard(box, lane) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "card" + (box.quiet ? " quiet" : "");
    btn.style.setProperty("--card-lane-color", laneColorVar(lane.id));
    btn.dataset.panelId = box.id;

    var tags = [];
    if (box.steps.length) {
      tags.push('<span class="tag">' + box.steps.length + " step" + (box.steps.length === 1 ? "" : "s") + "</span>");
    }
    if (box.steps.some(function (s) { return s.manual; })) {
      tags.push('<span class="tag tag-manual">MANUAL</span>');
    }
    if (box.questions.length) {
      tags.push('<span class="tag tag-questions">' + box.questions.length + " open</span>");
    }

    btn.innerHTML =
      '<div class="card-head">' + formatText(box.head) + "</div>" +
      '<div class="card-summary">' + formatText(box.card) + "</div>" +
      '<div class="card-tags">' + tags.join("") + "</div>";

    btn.addEventListener("click", function () { openPanelById(box.id); });
    return btn;
  }

  // ---------------------------------------------------------------------
  // Cadence strip
  // ---------------------------------------------------------------------
  var KIND_COLOR_VAR = { auto: "--color-legend-auto", human: "--color-legend-human", quiet: "--color-legend-quiet" };

  function renderCadence() {
    document.getElementById("cadence-heading").textContent = content.meta.cadenceHeading;
    var strip = document.getElementById("cadence-strip");
    strip.innerHTML = "";
    content.days.forEach(function (day) {
      var chip = document.createElement("button");
      chip.type = "button";
      chip.className = "day-chip";
      chip.style.setProperty("--chip-color", "var(" + (KIND_COLOR_VAR[day.kind] || KIND_COLOR_VAR.quiet) + ")");
      chip.dataset.panelId = "day-" + day.day;
      chip.innerHTML =
        '<div class="day-num">Day ' + escapeHtml(day.day) + "</div>" +
        '<div class="day-label">' + formatText(day.label) + "</div>";
      chip.addEventListener("click", function () { openPanelById(chip.dataset.panelId); });
      strip.appendChild(chip);
    });
  }

  // ---------------------------------------------------------------------
  // Panel rendering
  // ---------------------------------------------------------------------
  function ownerTagHtml(owner) {
    return '<span class="owner-tag">' + escapeHtml(owner) + "</span>";
  }

  function editableAttr() {
    return editMode ? ' contenteditable="true" spellcheck="false"' : "";
  }

  function fieldValue(box, field) {
    return box[field] || "";
  }

  function renderBoxPanel(box) {
    var lane = laneById[box.lane];
    var stage = stageById[box.stage];
    var html = "";

    html += '<div class="panel-eyebrow">' + escapeHtml(stage ? stage.what : box.stage) + "</div>";
    html += '<span class="panel-lane-pill lane-' + box.lane + '">' + escapeHtml(lane ? lane.name : box.lane) + "</span>";
    html += '<h2 class="panel-title" id="edit-field-head" data-field="head"' + editableAttr() + ">" +
      (editMode ? escapeHtml(fieldValue(box, "head")) : formatText(box.head)) +
      "</h2>";

    html += '<div class="panel-section" id="edit-field-card-wrap"><h3>Summary</h3><p id="edit-field-card" data-field="card"' + editableAttr() + ">" +
      (editMode ? escapeHtml(fieldValue(box, "card")) : formatText(box.card)) +
      "</p></div>";

    html += '<div class="panel-section"><h3>Steps</h3><ol class="panel-steps" id="edit-field-steps">';
    box.steps.forEach(function (step, i) {
      var stepKey = step.added ? ("added:" + step.addedIndex) : ("orig:" + step.origIndex);
      html += '<li><span class="step-num">' + (i + 1) + '.</span><span class="step-body">' +
        '<span data-field="step" data-step-key="' + stepKey + '"' + editableAttr() + ">" +
        (editMode ? escapeHtml(step.text) : formatText(step.text)) +
        "</span>" +
        '<label class="step-manual-toggle">' +
        '<input type="checkbox" class="step-manual-checkbox" data-step-key="' + stepKey + '"' + (step.manual ? " checked" : "") + ">" +
        "Manual</label>" +
        (editMode ?
          '<span class="step-reorder">' +
          '<button type="button" class="step-move-up" data-step-key="' + stepKey + '" aria-label="Move step up"' + (i === 0 ? " disabled" : "") + ">&uarr;</button>" +
          '<button type="button" class="step-move-down" data-step-key="' + stepKey + '" aria-label="Move step down"' + (i === box.steps.length - 1 ? " disabled" : "") + ">&darr;</button>" +
          "</span>" : "") +
        '<button type="button" class="step-delete" data-step-key="' + stepKey + '" aria-label="Remove this step">&times;</button>' +
        "</span></li>";
    });
    if (!box.steps.length) html += '<li class="no-steps"><span class="step-body">No steps recorded.</span></li>';
    html += "</ol>";

    html += '<form class="add-step-form" id="add-step-form">' +
      '<input type="text" class="add-step-input" id="add-step-input" placeholder="Add a step&hellip;" required>' +
      '<div class="add-step-row">' +
      '<label class="step-manual-toggle"><input type="checkbox" id="add-step-manual">Manual</label>' +
      '<button type="submit" class="btn btn-primary">Add step</button>' +
      '</div></form>';
    html += "</div>";

    if (box.systems.length) {
      html += '<div class="panel-section"><h3>Systems</h3><div class="panel-systems">';
      box.systems.forEach(function (s) { html += '<span class="tag">' + formatText(s) + "</span>"; });
      html += "</div></div>";
    }

    html += '<div class="panel-section"><h3>Open Questions' + (box.questions.length ? " (" + box.questions.length + ")" : "") + '</h3><ul class="panel-questions" id="edit-field-questions">';
    box.questions.forEach(function (q) {
      var qKey = q.added ? ("added:" + q.addedIndex) : ("orig:" + q.origIndex);
      html += '<li class="question-item">';
      html += '<div class="question-row">';
      html += '<select class="question-owner-select" data-question-key="' + qKey + '">';
      ALLOWED_OWNERS.forEach(function (o) {
        html += '<option value="' + o + '"' + (q.owner === o ? " selected" : "") + ">" + o + "</option>";
      });
      html += "</select>";
      html += '<span class="question-body">';
      if (q.added) html += '<span class="new-marker">NEW</span> ';
      html += '<span data-field="question" data-question-key="' + qKey + '"' + editableAttr() + ">" +
        (editMode ? escapeHtml(q.q) : formatText(q.q)) +
        "</span></span>";
      html += '<button type="button" class="question-delete" data-question-key="' + qKey + '" aria-label="Remove this question">&times;</button>';
      html += "</div>";
      var notesId = "qnotes-" + box.id + "-" + qKey;
      html += '<div class="question-notes">' +
        '<label class="question-notes-label" for="' + notesId + '">Notes / Answer</label>' +
        '<textarea class="question-notes-input" id="' + notesId + '" data-question-key="' + qKey + '" placeholder="Add notes or an answer&hellip;" rows="1">' +
        escapeHtml(q.notes || "") +
        "</textarea></div>";
      html += "</li>";
    });
    if (!box.questions.length) html += '<li class="no-questions">No open questions on this card.</li>';
    html += "</ul>";

    html += '<form class="add-question-form" id="add-question-form">' +
      '<textarea class="add-question-input" id="add-question-input" placeholder="Add a question that came up&hellip;" rows="2" required></textarea>' +
      '<div class="add-question-row">' +
      '<select class="add-question-owner" id="add-question-owner">' +
      '<option value="Both" selected>Both</option>' +
      '<option value="BSB">BSB</option>' +
      '<option value="Boyd">Boyd</option>' +
      '</select>' +
      '<button type="submit" class="btn btn-primary">Add question</button>' +
      '</div></form>';
    html += "</div>";

    return html;
  }

  function renderStagePanel(stage) {
    var html = "";
    html += '<div class="panel-eyebrow" data-field="when"' + editableAttr() + ">" +
      (editMode ? escapeHtml(stage.when) : formatText(stage.when)) +
      "</div>";
    html += '<h2 class="panel-title" data-field="what"' + editableAttr() + ">" +
      (editMode ? escapeHtml(stage.what) : formatText(stage.what)) +
      "</h2>";
    html += '<dl class="panel-meta-row">';
    html += '<dt>Owner</dt><dd data-field="owner"' + editableAttr() + ">" +
      (editMode ? escapeHtml(stage.owner) : formatText(stage.owner)) + "</dd>";
    html += '<dt>Exit criteria</dt><dd data-field="exit"' + editableAttr() + ">" +
      (editMode ? escapeHtml(stage.exit) : formatText(stage.exit)) + "</dd>";
    html += '<dt>Note</dt><dd data-field="note"' + editableAttr() + ">" +
      (editMode ? escapeHtml(stage.note) : formatText(stage.note)) + "</dd>";
    html += "</dl>";
    return html;
  }

  var DAY_KINDS = ["auto", "human", "quiet"];

  function renderDayPanel(day) {
    var html = "";
    html += '<div class="panel-eyebrow">Day ' + escapeHtml(day.day) + " · ";
    if (editMode) {
      html += '<select class="day-kind-select" data-day="' + day.day + '">';
      DAY_KINDS.forEach(function (k) {
        html += '<option value="' + k + '"' + (day.kind === k ? " selected" : "") + ">" + k + "</option>";
      });
      html += "</select>";
    } else {
      html += escapeHtml(day.kind);
    }
    html += "</div>";
    html += '<h2 class="panel-title" data-field="label"' + editableAttr() + ">" +
      (editMode ? escapeHtml(day.label) : formatText(day.label)) +
      "</h2>";
    html += '<p data-field="detail"' + editableAttr() + ">" +
      (editMode ? escapeHtml(day.detail) : formatText(day.detail)) +
      "</p>";
    return html;
  }

  // editsKey is a box's id for a box panel, or "stage:<id>" for a stage
  // panel -- both are just keys into the same edits store. "step" and
  // "question" only ever occur in a box panel; every other field (box
  // head/card/slide, or stage when/what/owner/exit/note) is a plain
  // string overlay keyed by its own data-field name.
  function attachEditableListeners(editsKey) {
    if (!editMode || !editsKey) return;
    var panelContentEl = document.getElementById("panel-content");
    var editableEls = panelContentEl.querySelectorAll("[contenteditable='true']");
    editableEls.forEach(function (el) {
      el.addEventListener("blur", function () {
        var field = el.dataset.field;
        var text = el.textContent;
        var ov = edits[editsKey] || (edits[editsKey] = {});
        if (field === "step") {
          var stepKey = parseStepKey(el.dataset.stepKey);
          if (stepKey.added) {
            ov.addedSteps = ov.addedSteps || [];
            if (ov.addedSteps[stepKey.index]) ov.addedSteps[stepKey.index].text = text;
          } else {
            ov.steps = ov.steps || {};
            ov.steps[stepKey.index] = text;
          }
        } else if (field === "question") {
          var qKey = parseQuestionKey(el.dataset.questionKey);
          if (qKey.added) {
            ov.addedQuestions = ov.addedQuestions || [];
            if (ov.addedQuestions[qKey.index]) ov.addedQuestions[qKey.index].q = text;
          } else {
            ov.questions = ov.questions || {};
            ov.questions[qKey.index] = text;
          }
        } else {
          ov[field] = text;
        }
        saveEdits(editsKey);
        content = applyEdits(baseContent, edits);
        rebuildIndexes();
        buildPanelOrder();
        renderGrid();
        renderCadence();
        updateOpenQuestionsCount();
      });
    });
  }

  // ---------------------------------------------------------------------
  // Creating, editing (text + owner), and removing open questions. All
  // always available (not gated by edit mode, except text edits which
  // follow the same edit-mode gating as everything else's text), stored
  // the same way as other in-app changes. A question's address is
  // "orig:<N>" (stable original index, for one of content.js's own
  // questions) or "added:<N>" (position in this box's addedQuestions
  // list, for one raised live) -- same scheme as steps.
  // ---------------------------------------------------------------------
  function parseQuestionKey(key) {
    var parts = String(key).split(":");
    return { added: parts[0] === "added", index: Number(parts[1]) };
  }

  function commitQuestionChange(boxId) {
    saveEdits(boxId);
    content = applyEdits(baseContent, edits);
    rebuildIndexes();
    buildPanelOrder();
    renderGrid();
    renderCadence();
    updateOpenQuestionsCount();
  }

  function addQuestion(boxId, text, owner) {
    text = text.trim();
    if (!text) return;
    if (ALLOWED_OWNERS.indexOf(owner) === -1) owner = "Both";
    var ov = edits[boxId] || (edits[boxId] = {});
    ov.addedQuestions = ov.addedQuestions || [];
    ov.addedQuestions.push({ q: text, owner: owner });
    commitQuestionChange(boxId);
    if (currentPanelId === boxId) {
      openPanelById(boxId, { skipFocus: true, skipHash: true });
      var input = document.getElementById("add-question-input");
      if (input) input.focus();
    }
  }

  function deleteQuestion(boxId, questionKeyRaw) {
    var key = parseQuestionKey(questionKeyRaw);
    var ov = edits[boxId] || (edits[boxId] = {});
    if (key.added) {
      ov.addedQuestions = ov.addedQuestions || [];
      ov.addedQuestions.splice(key.index, 1);
    } else {
      ov.removedQuestions = ov.removedQuestions || [];
      if (ov.removedQuestions.indexOf(key.index) === -1) ov.removedQuestions.push(key.index);
    }
    commitQuestionChange(boxId);
    if (currentPanelId === boxId) {
      openPanelById(boxId, { skipFocus: true, skipHash: true });
    }
  }

  function setQuestionOwner(boxId, questionKeyRaw, owner) {
    if (ALLOWED_OWNERS.indexOf(owner) === -1) return;
    var key = parseQuestionKey(questionKeyRaw);
    var ov = edits[boxId] || (edits[boxId] = {});
    if (key.added) {
      ov.addedQuestions = ov.addedQuestions || [];
      if (ov.addedQuestions[key.index]) ov.addedQuestions[key.index].owner = owner;
    } else {
      ov.questionOwner = ov.questionOwner || {};
      ov.questionOwner[key.index] = owner;
    }
    commitQuestionChange(boxId);
  }

  function setQuestionNotes(boxId, questionKeyRaw, notes) {
    var key = parseQuestionKey(questionKeyRaw);
    var ov = edits[boxId] || (edits[boxId] = {});
    if (key.added) {
      ov.addedQuestions = ov.addedQuestions || [];
      if (ov.addedQuestions[key.index]) ov.addedQuestions[key.index].notes = notes;
    } else {
      ov.questionNotes = ov.questionNotes || {};
      ov.questionNotes[key.index] = notes;
    }
    commitQuestionChange(boxId);
  }

  // ---------------------------------------------------------------------
  // Creating, editing, toggling manual, and removing steps within a box.
  // Always available (not gated by edit mode, except text edits which
  // follow the same edit-mode gating as everything else's text), stored
  // the same way as other in-app changes. A step's address is "orig:<N>"
  // (stable original index) or "added:<N>" (position in this box's
  // addedSteps list) -- same scheme as questions.
  // ---------------------------------------------------------------------
  function parseStepKey(compoundKey) {
    var parts = String(compoundKey).split(":");
    return { added: parts[0] === "added", index: Number(parts[1]) };
  }

  function commitStepChange(boxId) {
    saveEdits(boxId);
    content = applyEdits(baseContent, edits);
    rebuildIndexes();
    buildPanelOrder();
    renderGrid();
    renderCadence();
    updateOpenQuestionsCount();
  }

  function setStepManual(boxId, stepKeyRaw, manual) {
    var key = parseStepKey(stepKeyRaw);
    var ov = edits[boxId] || (edits[boxId] = {});
    if (key.added) {
      ov.addedSteps = ov.addedSteps || [];
      if (ov.addedSteps[key.index]) ov.addedSteps[key.index].manual = manual;
    } else {
      ov.stepManual = ov.stepManual || {};
      ov.stepManual[key.index] = manual;
    }
    commitStepChange(boxId);
  }

  function addStep(boxId, text, manual) {
    text = text.trim();
    if (!text) return;
    var ov = edits[boxId] || (edits[boxId] = {});
    ov.addedSteps = ov.addedSteps || [];
    ov.addedSteps.push({ text: text, manual: !!manual });
    commitStepChange(boxId);
    if (currentPanelId === boxId) {
      openPanelById(boxId, { skipFocus: true, skipHash: true });
      var input = document.getElementById("add-step-input");
      if (input) input.focus();
    }
  }

  function deleteStep(boxId, stepKeyRaw) {
    var key = parseStepKey(stepKeyRaw);
    var ov = edits[boxId] || (edits[boxId] = {});
    if (key.added) {
      ov.addedSteps = ov.addedSteps || [];
      ov.addedSteps.splice(key.index, 1);
    } else {
      ov.removedSteps = ov.removedSteps || [];
      if (ov.removedSteps.indexOf(key.index) === -1) ov.removedSteps.push(key.index);
    }
    commitStepChange(boxId);
    if (currentPanelId === boxId) {
      openPanelById(boxId, { skipFocus: true, skipHash: true });
    }
  }

  // Swaps a step with its neighbor and saves the resulting key order as
  // ov.stepOrder, read by mergeStepList on the next render.
  function moveStep(boxId, stepKeyRaw, direction) {
    var box = boxById[boxId];
    if (!box) return;
    var keys = box.steps.map(stepKeyOf);
    var idx = keys.indexOf(stepKeyRaw);
    var swapIdx = idx + direction;
    if (idx === -1 || swapIdx < 0 || swapIdx >= keys.length) return;
    var tmp = keys[idx];
    keys[idx] = keys[swapIdx];
    keys[swapIdx] = tmp;
    var ov = edits[boxId] || (edits[boxId] = {});
    ov.stepOrder = keys;
    commitStepChange(boxId);
    if (currentPanelId === boxId) {
      openPanelById(boxId, { skipFocus: true, skipHash: true });
    }
  }

  function attachStepListeners(box) {
    var panelContentEl = document.getElementById("panel-content");
    panelContentEl.querySelectorAll(".step-manual-checkbox").forEach(function (cb) {
      cb.addEventListener("change", function () {
        setStepManual(box.id, cb.dataset.stepKey, cb.checked);
      });
    });
    panelContentEl.querySelectorAll(".step-move-up").forEach(function (btn) {
      btn.addEventListener("click", function () {
        moveStep(box.id, btn.dataset.stepKey, -1);
      });
    });
    panelContentEl.querySelectorAll(".step-move-down").forEach(function (btn) {
      btn.addEventListener("click", function () {
        moveStep(box.id, btn.dataset.stepKey, 1);
      });
    });
    panelContentEl.querySelectorAll(".step-delete").forEach(function (btn) {
      btn.addEventListener("click", function () {
        deleteStep(box.id, btn.dataset.stepKey);
      });
    });
    var addForm = panelContentEl.querySelector("#add-step-form");
    if (addForm) {
      addForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var input = document.getElementById("add-step-input");
        var manualCheckbox = document.getElementById("add-step-manual");
        addStep(box.id, input.value, manualCheckbox.checked);
      });
    }
  }

  // ---------------------------------------------------------------------
  // A day's kind (auto/human/quiet) drives its cadence-strip color, so it's
  // edited via a select rather than free text -- same edit-mode gating as
  // its label/detail (handled by attachEditableListeners via "day:<n>").
  // ---------------------------------------------------------------------
  function setDayKind(dayNumber, kind) {
    if (DAY_KINDS.indexOf(kind) === -1) return;
    var editsKey = "day:" + dayNumber;
    var ov = edits[editsKey] || (edits[editsKey] = {});
    ov.kind = kind;
    saveEdits(editsKey);
    content = applyEdits(baseContent, edits);
    rebuildIndexes();
    buildPanelOrder();
    renderGrid();
    renderCadence();
    updateOpenQuestionsCount();
  }

  function attachDayKindListener(day) {
    var select = document.querySelector(".day-kind-select");
    if (select) {
      select.addEventListener("change", function () {
        setDayKind(day.day, select.value);
      });
    }
  }

  function attachQuestionFormListeners(box) {
    var panelContentEl = document.getElementById("panel-content");
    var form = panelContentEl.querySelector("#add-question-form");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var input = document.getElementById("add-question-input");
        var ownerSelect = document.getElementById("add-question-owner");
        addQuestion(box.id, input.value, ownerSelect.value);
      });
    }
    panelContentEl.querySelectorAll(".question-delete").forEach(function (btn) {
      btn.addEventListener("click", function () {
        deleteQuestion(box.id, btn.dataset.questionKey);
      });
    });
    panelContentEl.querySelectorAll(".question-owner-select").forEach(function (sel) {
      sel.addEventListener("change", function () {
        setQuestionOwner(box.id, sel.dataset.questionKey, sel.value);
      });
    });
    panelContentEl.querySelectorAll(".question-notes-input").forEach(function (ta) {
      ta.addEventListener("blur", function () {
        setQuestionNotes(box.id, ta.dataset.questionKey, ta.value);
      });
    });
  }

  function updatePanelPosition() {
    var idx = panelIndexById[currentPanelId];
    document.getElementById("panel-position").textContent = (idx + 1) + " / " + panelOrder.length;
    document.getElementById("panel-prev").disabled = idx <= 0;
    document.getElementById("panel-next").disabled = idx >= panelOrder.length - 1;
  }

  // Fires whenever the detail panel opens, switches, or closes, carrying
  // enough for another script (e.g. a hosted page's notes drawer) to know
  // what's currently on screen without reaching into app.js internals.
  // detail.id/kind/label are null when the panel just closed.
  function dispatchPanelChange(entry) {
    var label = null;
    if (entry) {
      if (entry.kind === "box") label = boxById[entry.id] ? boxById[entry.id].head : null;
      else if (entry.kind === "stage") label = stageById[entry.stageId] ? stageById[entry.stageId].what : null;
      else if (entry.kind === "day") {
        var d = content.days.filter(function (x) { return "day-" + x.day === entry.id; })[0];
        label = d ? d.label : null;
      }
    }
    window.dispatchEvent(new CustomEvent("bsb:panel-change", {
      detail: { id: entry ? entry.id : null, kind: entry ? entry.kind : null, label: label }
    }));
  }

  function openPanelById(id, opts) {
    opts = opts || {};
    var entry = panelOrder[panelIndexById[id]];
    if (!entry) return;
    currentPanelId = id;

    var body = "";
    if (entry.kind === "box") {
      body = renderBoxPanel(boxById[id]);
    } else if (entry.kind === "stage") {
      body = renderStagePanel(stageById[entry.stageId]);
    } else if (entry.kind === "day") {
      var day = content.days.filter(function (d) { return d.day === entry.day; })[0];
      body = day ? renderDayPanel(day) : "";
    }

    document.getElementById("panel-content").innerHTML = body;
    updatePanelPosition();

    if (entry.kind === "box") {
      attachEditableListeners(boxById[id].id);
      attachQuestionFormListeners(boxById[id]);
      attachStepListeners(boxById[id]);
    } else if (entry.kind === "stage") {
      attachEditableListeners("stage:" + stageById[entry.stageId].id);
    } else if (entry.kind === "day" && day) {
      attachEditableListeners("day:" + day.day);
      attachDayKindListener(day);
    }

    var panel = document.getElementById("panel");
    var backdrop = document.getElementById("panel-backdrop");
    if (panel.hidden) {
      lastFocusedBeforePanel = document.activeElement;
      panel.hidden = false;
      backdrop.hidden = false;
      panel.setAttribute("aria-hidden", "false");
    }

    if (!opts.skipHash) {
      if (history.replaceState) {
        history.replaceState(null, "", "#" + id);
      } else {
        window.location.hash = id;
      }
    }
    if (!opts.skipFocus) {
      var closeBtn = document.getElementById("panel-close");
      closeBtn.focus();
    }
    dispatchPanelChange(entry);
  }

  function closePanel() {
    var panel = document.getElementById("panel");
    if (panel.hidden) return;
    panel.hidden = true;
    document.getElementById("panel-backdrop").hidden = true;
    panel.setAttribute("aria-hidden", "true");
    currentPanelId = null;
    if (history.replaceState) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    if (lastFocusedBeforePanel && lastFocusedBeforePanel.focus) {
      lastFocusedBeforePanel.focus();
    }
    dispatchPanelChange(null);
  }

  // ---------------------------------------------------------------------
  // Open Questions modal
  // ---------------------------------------------------------------------
  function totalQuestionCount() {
    var n = 0;
    content.boxes.forEach(function (b) { n += b.questions.length; });
    return n;
  }

  function updateOpenQuestionsCount() {
    document.getElementById("oq-count").textContent = totalQuestionCount();
  }

  function renderQuestionsModal() {
    var body = document.getElementById("modal-body");
    body.innerHTML = "";
    content.stages.forEach(function (stage) {
      var groupBoxes = content.boxes.filter(function (b) { return b.stage === stage.id && b.questions.length; });
      if (!groupBoxes.length) return;
      var groupCount = groupBoxes.reduce(function (sum, b) { return sum + b.questions.length; }, 0);

      var group = document.createElement("div");
      group.className = "modal-group";
      var h3 = document.createElement("h3");
      h3.innerHTML = formatText(stage.what) + ' <span class="modal-group-count">(' + groupCount + ")</span>";
      group.appendChild(h3);

      groupBoxes.forEach(function (box) {
        var lane = laneById[box.lane];
        box.questions.forEach(function (q) {
          var item = document.createElement("button");
          item.type = "button";
          item.className = "modal-question-item";
          item.innerHTML =
            '<span class="modal-question-lane">' + escapeHtml(lane ? lane.name : box.lane) + "</span>" +
            "<span>" + (q.added ? '<span class="new-marker">NEW</span> ' : "") + formatText(q.q) + " " + ownerTagHtml(q.owner) + "</span>";
          item.addEventListener("click", function () {
            closeModal();
            openPanelById(box.id);
          });
          group.appendChild(item);
        });
      });

      body.appendChild(group);
    });
  }

  function openModal() {
    renderQuestionsModal();
    lastFocusedBeforeModal = document.activeElement;
    document.getElementById("questions-modal").hidden = false;
    document.getElementById("modal-backdrop").hidden = false;
    document.getElementById("modal-close").focus();
  }

  function closeModal() {
    var modal = document.getElementById("questions-modal");
    if (modal.hidden) return;
    modal.hidden = true;
    document.getElementById("modal-backdrop").hidden = true;
    if (lastFocusedBeforeModal && lastFocusedBeforeModal.focus) {
      lastFocusedBeforeModal.focus();
    }
  }

  function copyAllQuestionsText() {
    var lines = [];
    content.stages.forEach(function (stage) {
      var groupBoxes = content.boxes.filter(function (b) { return b.stage === stage.id && b.questions.length; });
      if (!groupBoxes.length) return;
      lines.push(stage.what);
      groupBoxes.forEach(function (box) {
        box.questions.forEach(function (q) {
          lines.push("- " + q.q + " [" + q.owner + "]");
        });
      });
      lines.push("");
    });
    return lines.join("\n").trim() + "\n";
  }

  function showToast(msg) {
    var toast = document.getElementById("copy-toast");
    toast.textContent = msg;
    toast.hidden = false;
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(function () { toast.hidden = true; }, 1800);
  }

  function copyToClipboard(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(
          function () { showToast("Copied to clipboard"); },
          function () { fallbackCopy(text); }
        );
        return;
      }
    } catch (e) { /* fall through */ }
    fallbackCopy(text);
  }

  function fallbackCopy(text) {
    try {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      showToast("Copied to clipboard");
    } catch (e) {
      showToast("Copy failed — select and copy manually");
    }
  }

  // ---------------------------------------------------------------------
  // Edit mode: top bar extras
  // ---------------------------------------------------------------------
  function updateEditToggleUi() {
    var btn = document.getElementById("edit-toggle");
    btn.setAttribute("aria-pressed", editMode ? "true" : "false");
    btn.textContent = "Edit mode: " + (editMode ? "On" : "Off");

    var actions = document.querySelector(".topbar-actions");
    var revertBtn = document.getElementById("revert-all-btn");
    var downloadBtn = document.getElementById("download-btn");

    if (editMode) {
      if (!revertBtn) {
        revertBtn = document.createElement("button");
        revertBtn.id = "revert-all-btn";
        revertBtn.type = "button";
        revertBtn.className = "btn btn-ghost";
        revertBtn.textContent = "Revert all";
        revertBtn.addEventListener("click", revertAllEdits);
        actions.insertBefore(revertBtn, btn);
      }
      if (!downloadBtn) {
        downloadBtn = document.createElement("button");
        downloadBtn.id = "download-btn";
        downloadBtn.type = "button";
        downloadBtn.className = "btn btn-ghost";
        downloadBtn.textContent = "Download content.js";
        downloadBtn.addEventListener("click", downloadContentJs);
        actions.insertBefore(downloadBtn, btn);
      }
    } else {
      if (revertBtn) revertBtn.remove();
      if (downloadBtn) downloadBtn.remove();
    }
  }

  function revertAllEdits() {
    edits = {};
    clearEdits();
    window.dispatchEvent(new CustomEvent("bsb:edits-changed", { detail: { key: null, value: null } }));
    content = applyEdits(baseContent, edits);
    rebuildIndexes();
    buildPanelOrder();
    renderGrid();
    renderCadence();
    updateOpenQuestionsCount();
    if (currentPanelId && panelIndexById[currentPanelId] !== undefined) {
      openPanelById(currentPanelId, { skipFocus: true, skipHash: true });
    }
  }

  function toggleEditMode() {
    editMode = !editMode;
    updateEditToggleUi();
    if (currentPanelId && panelIndexById[currentPanelId] !== undefined) {
      openPanelById(currentPanelId, { skipFocus: true, skipHash: true });
    }
  }

  // ---------------------------------------------------------------------
  // Serialize content back into a content.js-shaped source file.
  // ---------------------------------------------------------------------
  function jsString(s) {
    return '"' + String(s == null ? "" : s)
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\n/g, "\\n") + '"';
  }

  function serializeContent(data) {
    var out = [];
    out.push("window.BSB_CONTENT = {");

    out.push("  meta: {");
    out.push("    title: " + jsString(data.meta.title) + ",");
    out.push("    facts: " + jsString(data.meta.facts) + ",");
    out.push("    cadenceHeading: " + jsString(data.meta.cadenceHeading));
    out.push("  },");
    out.push("");

    out.push("  lanes: [");
    data.lanes.forEach(function (l, i) {
      out.push("    { id: " + jsString(l.id) + ", name: " + jsString(l.name) + ", sub: " + jsString(l.sub) + " }" + (i < data.lanes.length - 1 ? "," : ""));
    });
    out.push("  ],");
    out.push("");

    out.push("  stages: [");
    data.stages.forEach(function (s, i) {
      out.push("    {");
      out.push("      id: " + jsString(s.id) + ",");
      out.push("      when: " + jsString(s.when) + ",");
      out.push("      what: " + jsString(s.what) + ",");
      out.push("      owner: " + jsString(s.owner) + ",");
      out.push("      exit: " + jsString(s.exit) + ",");
      out.push("      note: " + jsString(s.note) + (s.light ? "," : ""));
      if (s.light) out.push("      light: true");
      out.push("    }" + (i < data.stages.length - 1 ? "," : ""));
    });
    out.push("  ],");
    out.push("");

    out.push("  boxes: [");
    data.boxes.forEach(function (b, i) {
      out.push("    {");
      out.push("      stage: " + jsString(b.stage) + ", lane: " + jsString(b.lane) + ",");
      out.push("      head: " + jsString(b.head) + ",");
      out.push("      card: " + jsString(b.card) + ",");
      out.push("      slide: " + jsString(b.slide) + (b.quiet ? "," : ","));
      if (b.quiet) out.push("      quiet: true,");
      out.push("      steps: [");
      b.steps.forEach(function (st, si) {
        out.push("        { text: " + jsString(st.text) + (st.manual ? ", manual: true" : "") + " }" + (si < b.steps.length - 1 ? "," : ""));
      });
      out.push("      ],");
      out.push("      systems: [" + b.systems.map(jsString).join(", ") + "],");
      out.push("      questions: [");
      b.questions.forEach(function (q, qi) {
        out.push("        { q: " + jsString(q.q) + ", owner: " + jsString(q.owner) +
          (q.notes ? ", notes: " + jsString(q.notes) : "") +
          " }" + (qi < b.questions.length - 1 ? "," : ""));
      });
      out.push("      ]");
      out.push("    }" + (i < data.boxes.length - 1 ? "," : ""));
    });
    out.push("  ],");
    out.push("");

    out.push("  days: [");
    data.days.forEach(function (d, i) {
      out.push("    { day: " + d.day + ", kind: " + jsString(d.kind) + ", label: " + jsString(d.label) + ", detail: " + jsString(d.detail) + " }" + (i < data.days.length - 1 ? "," : ""));
    });
    out.push("  ]");

    out.push("};");
    return out.join("\n") + "\n";
  }

  function downloadContentJs() {
    var merged = applyEdits(baseContent, edits);
    var src = serializeContent(merged);
    var blob = new Blob([src], { type: "text/javascript" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "content.js";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  // ---------------------------------------------------------------------
  // Wiring
  // ---------------------------------------------------------------------
  function isEditingField(el) {
    return el && (el.isContentEditable || el.tagName === "INPUT" || el.tagName === "TEXTAREA");
  }

  function wireEvents() {
    document.getElementById("panel-close").addEventListener("click", closePanel);
    document.getElementById("panel-backdrop").addEventListener("click", closePanel);
    document.getElementById("panel-prev").addEventListener("click", function () { stepPanel(-1); });
    document.getElementById("panel-next").addEventListener("click", function () { stepPanel(1); });

    document.getElementById("open-questions-btn").addEventListener("click", openModal);
    document.getElementById("modal-close").addEventListener("click", closeModal);
    document.getElementById("modal-backdrop").addEventListener("click", closeModal);
    document.getElementById("copy-questions").addEventListener("click", function () {
      copyToClipboard(copyAllQuestionsText());
    });

    document.getElementById("edit-toggle").addEventListener("click", toggleEditMode);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        if (!document.getElementById("questions-modal").hidden) { closeModal(); return; }
        if (!document.getElementById("panel").hidden) { closePanel(); return; }
      }
      if (isEditingField(document.activeElement)) return;
      if (document.getElementById("panel").hidden) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); stepPanel(-1); }
      if (e.key === "ArrowRight") { e.preventDefault(); stepPanel(1); }
    });

    window.addEventListener("hashchange", function () {
      var id = window.location.hash.replace(/^#/, "");
      if (id && panelIndexById[id] !== undefined) {
        openPanelById(id, { skipHash: true });
      } else if (!id) {
        closePanel();
      }
    });

    // Fired by a hosted-only script (e.g. sync.js) when another viewer's
    // edit arrives from the shared backend. null value means that key was
    // deleted there (also used for a remote "Revert all", which arrives as
    // one such event per key that got removed). Only re-renders the open
    // panel if the change is actually for the card/stage/day on screen, so
    // an edit elsewhere never yanks focus from someone mid-edit here.
    window.addEventListener("bsb:remote-edit", function (e) {
      var key = e.detail.key;
      var value = e.detail.value;
      if (value === null || typeof value === "undefined") {
        delete edits[key];
      } else {
        edits[key] = value;
      }
      try {
        window.localStorage.setItem(EDIT_STORAGE_KEY, JSON.stringify(edits));
      } catch (err) { /* storage unavailable */ }
      content = applyEdits(baseContent, edits);
      rebuildIndexes();
      buildPanelOrder();
      renderGrid();
      renderCadence();
      updateOpenQuestionsCount();
      if (currentOpenEditsKey() === key) {
        openPanelById(currentPanelId, { skipFocus: true, skipHash: true });
      }
    });
  }

  function currentOpenEditsKey() {
    if (!currentPanelId) return null;
    var entry = panelOrder[panelIndexById[currentPanelId]];
    if (!entry) return null;
    if (entry.kind === "box") return entry.id;
    if (entry.kind === "stage") return "stage:" + entry.stageId;
    if (entry.kind === "day") return "day:" + entry.day;
    return null;
  }

  function stepPanel(delta) {
    if (currentPanelId === null) return;
    var idx = panelIndexById[currentPanelId] + delta;
    if (idx < 0 || idx >= panelOrder.length) return;
    openPanelById(panelOrder[idx].id, { skipFocus: true });
  }

  // ---------------------------------------------------------------------
  // Keep the top bar's real height in a CSS var so the side panel and
  // modal can sit below it instead of covering its buttons.
  // ---------------------------------------------------------------------
  function syncTopbarHeight() {
    var topbar = document.querySelector(".topbar");
    if (!topbar) return;
    var banner = document.getElementById("error-banner");
    var bannerHeight = banner && !banner.hidden ? banner.offsetHeight : 0;
    document.documentElement.style.setProperty("--topbar-h", (bannerHeight + topbar.offsetHeight) + "px");
  }

  // ---------------------------------------------------------------------
  // Init
  // ---------------------------------------------------------------------
  function init() {
    var validated = validateContent(window.BSB_CONTENT);
    baseContent = validated.data;
    renderErrorBanner(validated.errors);

    edits = loadEdits();
    content = applyEdits(baseContent, edits);
    rebuildIndexes();
    buildPanelOrder();

    document.getElementById("meta-title").textContent = content.meta.title;
    document.getElementById("meta-facts").textContent = content.meta.facts;

    renderGrid();
    renderCadence();
    updateOpenQuestionsCount();
    updateEditToggleUi();
    wireEvents();

    syncTopbarHeight();
    window.addEventListener("resize", syncTopbarHeight);

    var initialHash = window.location.hash.replace(/^#/, "");
    if (initialHash && panelIndexById[initialHash] !== undefined) {
      openPanelById(initialHash, { skipHash: true, skipFocus: true });
    }
  }

  init();
})();
