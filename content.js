window.BSB_CONTENT = {
  meta: {
    title: "BSB Pilot Workflow — BodyShop Booster × Boyd",
    facts: "4 Lanes · 6 Stages · 24 Cards · 12-Day Cadence",
    cadenceHeading: "12-Day Pilot Cadence"
  },

  lanes: [
    { id: "customer", name: "Customer", sub: "Vehicle owner / claimant" },
    { id: "bsb", name: "BSB", sub: "BodyShop Booster platform" },
    { id: "shop", name: "Shop", sub: "Boyd repair facility staff" },
    { id: "contact-center", name: "Contact Center", sub: "Boyd centralized contact center" }
  ],

  stages: [
    {
      id: "s1",
      when: "Day 0–1",
      what: "Referral & First Contact",
      owner: "Contact Center",
      exit: "Estimate appointment requested or scheduled",
      note: "Referral can arrive by inbound call, insurance DRP feed, or the Boyd website form. `CCC ONE` is the system of record for the claim the moment it exists."
    },
    {
      id: "s2",
      when: "Day 1–2",
      what: "Estimate & Scheduling",
      owner: "BSB",
      exit: "Drop-off appointment confirmed in `CCC ONE`",
      note: "BSB owns the scheduling link and the reminder cadence; the shop only touches this stage to confirm capacity."
    },
    {
      id: "s3",
      when: "Day 2–3",
      what: "Vehicle Check-In & Teardown",
      owner: "Shop",
      exit: "Supplement filed and repair plan approved",
      note: "Teardown findings drive the supplement. This is the stage most likely to slip the 12-day cadence if parts are back-ordered."
    },
    {
      id: "s4",
      when: "Day 3–8",
      what: "Repair Production",
      owner: "Shop",
      exit: "Vehicle passes internal QC checklist",
      note: "Longest stage by design. BSB's automated cadence is what keeps the customer from calling in during this window — that's the whole pitch."
    },
    {
      id: "s5",
      when: "Day 8–9",
      what: "Quality Control & Ready-for-Pickup",
      owner: "Shop",
      exit: "Ready-for-pickup notification sent",
      note: "Photo-based QC checklist is new for this pilot — shops have historically done this verbally."
    },
    {
      id: "s6",
      when: "Day 9–12",
      what: "Delivery & Follow-Up",
      owner: "Both",
      exit: "Vehicle delivered, CSAT survey sent and closed",
      note: "CSAT response rate is the headline pilot metric. Contact Center picks up anything BSB's automated survey doesn't close out."
    }
  ],

  boxes: [
    // ---------- Stage 1: Referral & First Contact ----------
    {
      stage: "s1", lane: "customer",
      head: "Reports Damage",
      card: "Customer contacts Boyd by phone, web form, or insurance referral to report vehicle damage and request a repair.",
      slide: "Customer initiates contact through their preferred channel — phone, web, or DRP referral.",
      steps: [
        { text: "Customer discovers damage and decides where to take the vehicle (direct, insurance-steered, or DRP referral)." },
        { text: "Customer calls the shop or contact center, or submits the Boyd website intake form.", manual: true },
        { text: "Customer provides basic vehicle, insurance, and contact details." }
      ],
      systems: ["CCC ONE", "Boyd Website"],
      questions: [
        { q: "Does the website form feed directly into `CCC ONE`, or does someone re-key it?", owner: "Boyd" },
        { q: "What happens to a referral if no contact center agent is available and the customer doesn't leave a message?", owner: "Both" }
      ]
    },
    {
      stage: "s1", lane: "bsb",
      head: "Captures Lead",
      card: "BSB ingests the referral as soon as it lands in `CCC ONE` and sends the customer a welcome text introducing the automated cadence.",
      slide: "BSB's platform picks up the new claim record within minutes of creation and opens the SMS channel.",
      steps: [
        { text: "BSB polls `CCC ONE` for new claim records tagged to a pilot shop." },
        { text: "BSB sends an opt-in text: who we are, what to expect, how to reach a human.", manual: true },
        { text: "BSB creates the customer's cadence timeline in the BSB Portal." }
      ],
      systems: ["BSB Portal", "SMS/Text", "CCC ONE"],
      questions: [
        { q: "What's the polling interval, and does a delay here just eat into the 12-day cadence silently?", owner: "BSB" },
        { q: "Opt-in text goes out before the shop has actually accepted the vehicle — is that a problem for any DRP partner?", owner: "Boyd" }
      ]
    },
    {
      stage: "s1", lane: "shop",
      head: "Reviews New Referral",
      card: "Shop advisor scans the incoming referral queue and confirms the vehicle is one they can take.",
      slide: "Shop reviews the referral and confirms capacity before it moves to scheduling.",
      steps: [
        { text: "Advisor checks the referral queue in `CCC ONE` each morning." },
        { text: "Advisor flags anything outside the shop's capability (e.g. frame, EV high-voltage) for reassignment.", manual: true }
      ],
      systems: ["CCC ONE"],
      questions: [
        { q: "Is there a queue SLA for how fast the shop has to triage a new referral?", owner: "Boyd" },
        { q: "If a shop declines a referral (out of capability), does BSB's cadence timeline get cancelled automatically or does it keep running against the wrong shop?", owner: "Both" }
      ]
    },
    {
      stage: "s1", lane: "contact-center",
      head: "Logs Intake Call",
      card: "When the customer calls in directly, the contact center logs the claim and hands it to the shop's referral queue.",
      slide: "Contact center is the default channel for inbound calls and logs every intake into `CCC ONE`.",
      steps: [
        { text: "Agent answers, gathers vehicle and insurance information." },
        { text: "Agent creates the claim shell in `CCC ONE`.", manual: true },
        { text: "Agent assigns the claim to the nearest or customer-preferred pilot shop." }
      ],
      systems: ["CCC ONE", "Phone/IVR"],
      questions: [
        { q: "Do contact center agents know which shops are in the BSB pilot, or could they route a pilot customer to a non-pilot shop?", owner: "Boyd" },
        { q: "Should the agent mention BSB's text cadence on the call, or let the automated welcome text be the first the customer hears of it?", owner: "Both" }
      ]
    },

    // ---------- Stage 2: Estimate & Scheduling ----------
    {
      stage: "s2", lane: "customer",
      head: "Books Estimate Appointment",
      card: "Customer picks a drop-off slot from the link BSB texts them, or calls in if they'd rather talk to someone.",
      slide: "Customer self-schedules via the BSB link; phone remains a fallback.",
      steps: [
        { text: "Customer opens the scheduling link from the BSB text." },
        { text: "Customer selects an available drop-off window." },
        { text: "Customer receives a confirmation text with a calendar attachment." }
      ],
      systems: ["BSB Portal", "SMS/Text"],
      questions: [
        { q: "If the customer never opens the link, when does BSB escalate to a phone call?", owner: "BSB" }
      ]
    },
    {
      stage: "s2", lane: "bsb",
      head: "Sends Scheduling Link",
      card: "BSB generates a self-serve scheduling link against the shop's live capacity and manages the reminder sequence.",
      slide: "Self-service scheduling replaces phone tag, backed by a two-touch reminder sequence.",
      steps: [
        { text: "BSB reads shop capacity/availability from `CCC ONE`." },
        { text: "BSB texts the scheduling link within 15 minutes of lead capture.", manual: true },
        { text: "BSB sends a reminder 24 hours before the appointment and one the morning of." }
      ],
      systems: ["BSB Portal", "SMS/Text", "Calendar Sync"],
      questions: [
        { q: "Does BSB's read of shop capacity account for loaner car availability, or just bay time?", owner: "BSB" },
        { q: "Who owns the reminder copy — can Boyd's marketing/legal review the exact wording before pilot launch?", owner: "Both" }
      ]
    },
    {
      stage: "s2", lane: "shop",
      head: "Confirms Estimate Slot",
      card: "Shop reviews the BSB-booked appointment against the schedule board and flags conflicts before drop-off day.",
      slide: "Shop has visibility into BSB-booked appointments and can override if capacity changed.",
      steps: [
        { text: "Advisor reviews next-day BSB bookings against the physical schedule board.", manual: true },
        { text: "Advisor flags any double-booking or capacity conflict back to BSB." }
      ],
      systems: ["CCC ONE", "BSB Portal"],
      questions: [
        { q: "If the shop overrides a BSB-booked slot, does the customer get an automatic reschedule text, or does someone have to call them?", owner: "Both" }
      ]
    },
    {
      stage: "s2", lane: "contact-center",
      head: "Handles Reschedule Requests",
      card: "Contact center takes reschedule and cancellation calls that come in outside the BSB self-serve flow.",
      slide: "Contact center remains the escape hatch for anything the self-serve link can't resolve.",
      steps: [
        { text: "Agent receives a reschedule or cancel call." },
        { text: "Agent updates the appointment in `CCC ONE`.", manual: true },
        { text: "Agent notifies BSB (or the change syncs automatically) so the cadence timeline updates." }
      ],
      systems: ["CCC ONE", "Phone/IVR", "BSB Portal"],
      questions: [
        { q: "Is the `CCC ONE` ↔ BSB Portal sync for reschedules automatic, or does the agent have to notify BSB separately?", owner: "BSB" },
        { q: "What's the cutoff for a same-day reschedule before the shop has already prepped a bay?", owner: "Boyd" }
      ]
    },

    // ---------- Stage 3: Vehicle Check-In & Teardown ----------
    {
      stage: "s3", lane: "customer",
      head: "Drops Off Vehicle",
      card: "Customer arrives, hands over the vehicle and keys, and receives a text confirming check-in and loaner status.",
      slide: "Drop-off triggers an immediate check-in confirmation and, where applicable, loaner instructions.",
      steps: [
        { text: "Customer arrives at the shop with the vehicle and keys." },
        { text: "Advisor walks the vehicle with the customer and notes existing condition.", manual: true },
        { text: "Customer receives loaner car instructions (if applicable)." }
      ],
      systems: ["CCC ONE"],
      questions: [
        { q: "If there's no loaner available at drop-off, does BSB's cadence still assume one, or does that message get suppressed?", owner: "BSB" },
        { q: "Who's responsible for the walk-around photos — shop staff or a BSB-provided kiosk/app?", owner: "Boyd" }
      ]
    },
    {
      stage: "s3", lane: "bsb",
      head: "Sends Check-In Confirmation",
      card: "BSB fires a check-in confirmation text the moment the shop marks the vehicle received in `CCC ONE`.",
      slide: "Check-in status change in `CCC ONE` is the trigger for the first in-repair cadence message.",
      steps: [
        { text: "BSB watches for the vehicle status to flip to \"Checked In\" in `CCC ONE`." },
        { text: "BSB sends a confirmation text with the estimated timeline based on stage averages.", manual: true }
      ],
      systems: ["BSB Portal", "CCC ONE", "SMS/Text"],
      questions: [
        { q: "Where does the \"estimated timeline\" number come from — shop-specific historicals or a fleet-wide average that may not fit this shop?", owner: "BSB" }
      ]
    },
    {
      stage: "s3", lane: "shop",
      head: "Performs Teardown & Supplement",
      card: "Technician tears down the vehicle, documents hidden damage, and the estimator files a supplement for approval.",
      slide: "Teardown surfaces hidden damage; the supplement is written and sent for insurance approval.",
      steps: [
        { text: "Technician removes damaged panels/parts to expose hidden damage.", manual: true },
        { text: "Technician photographs and documents all findings." },
        { text: "Estimator writes the supplement in `CCC ONE` / Mitchell and submits for insurance approval.", manual: true },
        { text: "Estimator orders parts once the supplement is approved." }
      ],
      systems: ["CCC ONE", "Mitchell"],
      questions: [
        { q: "Does BSB's cadence pause automatically while a supplement is pending, or does it keep sending timeline messages that are now wrong?", owner: "BSB" },
        { q: "Average supplement approval turnaround by carrier — do we have that data to set expectations for the pilot?", owner: "Boyd" },
        { q: "Who tells the customer if the supplement changes the completion date by more than a day or two?", owner: "Both" }
      ]
    },
    {
      stage: "s3", lane: "contact-center",
      head: "Notifies Insurance of Teardown Findings",
      card: "Contact center liaises with the insurance adjuster when a supplement needs a call instead of a portal submission.",
      slide: "Contact center handles adjuster relationships that require a live conversation.",
      steps: [
        { text: "Agent calls the assigned adjuster if the supplement portal submission stalls." },
        { text: "Agent logs the adjuster conversation outcome in `CCC ONE`.", manual: true }
      ],
      systems: ["CCC ONE", "Phone/IVR"],
      questions: [
        { q: "At what point does a stalled supplement get escalated to the contact center versus staying with the shop estimator?", owner: "Boyd" }
      ]
    },

    // ---------- Stage 4: Repair Production ----------
    {
      stage: "s4", lane: "customer",
      quiet: true,
      head: "Waits for Updates",
      card: "No action expected from the customer during repair — BSB's cadence is designed to answer \"is it done yet?\" before they have to call.",
      slide: "This is the stage BSB is built to cover: the customer should not need to call during production.",
      steps: [
        { text: "Customer receives scheduled status texts and does not need to take any action." }
      ],
      systems: ["SMS/Text"],
      questions: []
    },
    {
      stage: "s4", lane: "bsb",
      head: "Sends Automated Status Updates",
      card: "BSB pushes a status text on a fixed cadence pulled from `CCC ONE` repair-order milestones, with photos where available.",
      slide: "Automated cadence replaces the manual \"just checking in\" call.",
      steps: [
        { text: "BSB reads repair-order milestone changes from `CCC ONE` (parts received, in paint, in reassembly)." },
        { text: "BSB sends a status text at each milestone, plus a standing every-2-day update if no milestone has fired.", manual: true },
        { text: "BSB attaches an in-progress photo when the shop has uploaded one." }
      ],
      systems: ["BSB Portal", "CCC ONE", "SMS/Text"],
      questions: [
        { q: "What milestones in `CCC ONE` actually map to BSB's cadence triggers — do we have the field list?", owner: "BSB" },
        { q: "If a shop never uploads an in-progress photo, does the cadence message just go out without one, or does BSB nudge the shop?", owner: "Both" }
      ]
    },
    {
      stage: "s4", lane: "shop",
      head: "Executes Repair Plan",
      card: "Technicians complete body, paint, and reassembly work per the approved estimate, updating `CCC ONE` at each milestone.",
      slide: "Production proceeds through body, paint, and reassembly, each logged as a milestone.",
      steps: [
        { text: "Body technician completes structural and panel repair.", manual: true },
        { text: "Vehicle moves to paint; painter matches and applies finish.", manual: true },
        { text: "Reassembly technician reinstalls trim, glass, and components." },
        { text: "Advisor updates the milestone status in `CCC ONE` after each phase." }
      ],
      systems: ["CCC ONE"],
      questions: [
        { q: "Milestone updates are manual — what happens to the customer's cadence accuracy if a tech forgets to update `CCC ONE`?", owner: "Boyd" },
        { q: "Is there a target SLA per phase (body/paint/reassembly) the pilot is measuring against?", owner: "Boyd" }
      ]
    },
    {
      stage: "s4", lane: "contact-center",
      head: "Fields Status Inquiry Calls",
      card: "Contact center takes the calls that come in anyway — tracking whether BSB's cadence is actually suppressing call volume is a core pilot metric.",
      slide: "Inbound status calls during production are the metric the pilot is trying to move.",
      steps: [
        { text: "Agent receives an inbound \"is it done\" call." },
        { text: "Agent looks up the current milestone in `CCC ONE` and relays it.", manual: true },
        { text: "Agent tags the call as \"status inquiry during production\" for pilot reporting." }
      ],
      systems: ["CCC ONE", "Phone/IVR"],
      questions: [
        { q: "Is the \"status inquiry during production\" tag consistently used today, or do we need to train agents on it before the pilot starts counting?", owner: "Boyd" },
        { q: "What's the baseline call volume per repair order before BSB, so we know if the pilot actually moved the number?", owner: "Both" },
        { q: "Do BSB and the contact center see the same milestone data, or could an agent tell the customer something different from the last text?", owner: "Both" }
      ]
    },

    // ---------- Stage 5: Quality Control & Ready-for-Pickup ----------
    {
      stage: "s5", lane: "customer",
      head: "Receives Ready Notification",
      card: "Customer gets a text that the vehicle passed QC and is ready, with pickup hours and any balance due.",
      slide: "Ready-for-pickup notification includes hours and balance due, sent as soon as QC clears.",
      steps: [
        { text: "Customer receives the ready-for-pickup text with pickup hours." },
        { text: "Customer reviews balance due (deductible, betterment) shown in the message." }
      ],
      systems: ["SMS/Text"],
      questions: [
        { q: "Can the customer pay the balance due directly from the text link, or do they have to do that in person?", owner: "BSB" }
      ]
    },
    {
      stage: "s5", lane: "bsb",
      head: "Triggers QC Checklist & Photos",
      card: "BSB prompts the shop to complete a photo-based QC checklist before it will send the ready-for-pickup message.",
      slide: "Photo-based QC checklist gates the ready notification — new for this pilot.",
      steps: [
        { text: "BSB sends the shop a QC checklist prompt when the repair-order status hits \"final detail.\"" },
        { text: "Shop completes the checklist and uploads required photos in the BSB Portal.", manual: true },
        { text: "BSB sends the ready-for-pickup text once the checklist is complete." }
      ],
      systems: ["BSB Portal", "CCC ONE", "SMS/Text"],
      questions: [
        { q: "Is the QC checklist content the same for every shop, or does it need to reflect Boyd's existing QC standard?", owner: "Boyd" },
        { q: "What happens if the shop marks the vehicle ready in `CCC ONE` but hasn't completed the BSB checklist — does the text get blocked or does it go out anyway?", owner: "BSB" }
      ]
    },
    {
      stage: "s5", lane: "shop",
      head: "Performs Final QC & Detail",
      card: "Advisor and detailer run the final quality check, clean the vehicle, and complete the new photo-based checklist.",
      slide: "Final QC and detail close out production before the vehicle is marked ready.",
      steps: [
        { text: "Advisor test-drives and inspects panel gaps, paint match, and function.", manual: true },
        { text: "Detailer washes and details the vehicle." },
        { text: "Advisor photographs the completed vehicle for the BSB QC checklist.", manual: true },
        { text: "Advisor marks the repair order \"ready\" in `CCC ONE`." }
      ],
      systems: ["CCC ONE", "BSB Portal"],
      questions: [
        { q: "Does the photo QC checklist replace or duplicate the shop's existing paper/verbal QC process?", owner: "Boyd" },
        { q: "How much extra time per vehicle does the checklist add, and did the pilot budget for that?", owner: "Boyd" }
      ]
    },
    {
      stage: "s5", lane: "contact-center",
      quiet: true,
      head: "No Action — BSB Sends Notification",
      card: "Contact center does not send the ready notification; BSB owns it end to end once QC clears.",
      slide: "Ready-for-pickup messaging is fully automated; contact center only gets involved if the customer calls in confused.",
      steps: [
        { text: "No standing action — agent only engages if a customer calls about the ready text." }
      ],
      systems: ["CCC ONE"],
      questions: [
        { q: "If a customer calls the contact center after the ready text with a question, does the agent have visibility into the QC photos BSB used?", owner: "Both" }
      ]
    },

    // ---------- Stage 6: Delivery & Follow-Up ----------
    {
      stage: "s6", lane: "customer",
      head: "Picks Up Vehicle & Reviews Repair",
      card: "Customer arrives, walks the repair with the advisor, settles any balance, and takes delivery.",
      slide: "Delivery walkaround and balance settlement close out the physical repair.",
      steps: [
        { text: "Customer arrives and reviews the completed repair with the advisor.", manual: true },
        { text: "Customer settles any balance due (deductible, betterment)." },
        { text: "Customer signs off and receives the keys and paperwork." }
      ],
      systems: ["CCC ONE"],
      questions: [
        { q: "Is there a standard delivery script/checklist the advisor walks the customer through, or does it vary by shop?", owner: "Boyd" },
        { q: "Does BSB's pre-pay-at-text-link flow (from Stage 5) reduce the in-person settlement step, or is it always redone at pickup?", owner: "Both" }
      ]
    },
    {
      stage: "s6", lane: "bsb",
      head: "Sends CSAT Survey",
      card: "BSB texts a CSAT survey shortly after the repair order closes in `CCC ONE`, and flags low scores for immediate follow-up.",
      slide: "CSAT survey and low-score alerting is the headline metric for the pilot.",
      steps: [
        { text: "BSB detects the repair order closing as \"delivered\" in `CCC ONE`." },
        { text: "BSB sends a CSAT survey text 2–4 hours after delivery.", manual: true }
      ],
      systems: ["BSB Portal", "CCC ONE", "SMS/Text"],
      questions: [
        { q: "What CSAT score triggers an automatic alert, and who receives it — the shop, the contact center, or both?", owner: "BSB" },
        { q: "Is the CSAT survey question set the same one Boyd already uses, or a new instrument BSB is introducing for the pilot?", owner: "Both" }
      ]
    },
    {
      stage: "s6", lane: "shop",
      head: "Completes Delivery Walkaround",
      card: "Advisor conducts the in-person delivery walkaround, closes the repair order, and hands the vehicle back.",
      slide: "Shop closes the loop in person and marks the order delivered in `CCC ONE`.",
      steps: [
        { text: "Advisor walks the vehicle with the customer, pointing out the repair and any warranty details.", manual: true },
        { text: "Advisor collects final payment/settlement if not already handled." },
        { text: "Advisor marks the repair order \"Delivered\" in `CCC ONE`, which triggers the BSB survey." }
      ],
      systems: ["CCC ONE"],
      questions: [
        { q: "Is warranty paperwork handed over physically, or does BSB also send a digital copy via text/email?", owner: "Both" },
        { q: "How quickly after physical delivery does the advisor actually mark the order \"Delivered\" — same-day, or does it lag?", owner: "Boyd" }
      ]
    },
    {
      stage: "s6", lane: "contact-center",
      head: "Handles Post-Delivery Follow-Up",
      card: "Contact center follows up on low CSAT scores, unresolved comebacks, and any billing disputes after delivery.",
      slide: "Contact center owns service recovery once BSB flags a low score or the customer calls back with an issue.",
      steps: [
        { text: "Agent receives a low-CSAT alert or an inbound comeback/billing call." },
        { text: "Agent reviews the repair history and QC photos in `CCC ONE` / BSB Portal.", manual: true },
        { text: "Agent resolves the issue directly or schedules a comeback appointment with the shop." }
      ],
      systems: ["CCC ONE", "BSB Portal", "Phone/IVR"],
      questions: [
        { q: "What's the target response time for a low-CSAT alert — same day, next business day?", owner: "Boyd" },
        { q: "Does the contact center have a documented service-recovery playbook, or is this pilot the first time low scores get routed anywhere?", owner: "Boyd" },
        { q: "Who has authority to approve a goodwill credit on a comeback — the contact center agent or does it always go to the shop manager?", owner: "Boyd" }
      ]
    }
  ],

  days: [
    { day: 1, kind: "human", label: "Referral & First Contact", detail: "Claim enters `CCC ONE` via phone, web, or DRP referral. Contact center or shop triages within the same business day." },
    { day: 2, kind: "auto", label: "Estimate Scheduled", detail: "BSB sends the self-serve scheduling link; customer books a drop-off window, confirmed automatically." },
    { day: 3, kind: "human", label: "Vehicle Check-In", detail: "Customer drops off the vehicle. Advisor walks the vehicle and BSB fires the check-in confirmation text." },
    { day: 4, kind: "quiet", label: "Teardown & Supplement Filed", detail: "Technician tears down the vehicle; estimator files the supplement and submits for insurance approval." },
    { day: 5, kind: "auto", label: "Repair Kickoff Notification", detail: "Parts confirmed and repair begins. BSB sends the first in-production status text." },
    { day: 6, kind: "quiet", label: "Repair In Progress — Body", detail: "Structural and panel repair continues. No customer-facing action expected." },
    { day: 7, kind: "quiet", label: "Repair In Progress — Paint", detail: "Vehicle moves through paint. BSB's standing 2-day cadence covers any gap in milestone updates." },
    { day: 8, kind: "human", label: "Mid-Repair Status Call (if needed)", detail: "Contact center fields any inbound status calls that come in despite the automated cadence — tracked for the pilot metric." },
    { day: 9, kind: "auto", label: "QC Checklist Triggered", detail: "Reassembly completes. BSB prompts the shop for the photo-based QC checklist before it will send the ready notice." },
    { day: 10, kind: "human", label: "Final Detail & Walkaround Prep", detail: "Advisor completes final inspection, detail, and QC photos; marks the order ready in `CCC ONE`." },
    { day: 11, kind: "auto", label: "Ready Notification Sent", detail: "BSB texts the customer that the vehicle is ready, with pickup hours and any balance due." },
    { day: 12, kind: "human", label: "Delivery & CSAT Survey", detail: "Customer picks up the vehicle; advisor closes the order and BSB sends the CSAT survey within hours." }
  ]
};
