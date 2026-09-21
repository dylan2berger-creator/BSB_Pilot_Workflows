window.BSB_CONTENT = {
  meta: {
    title: "Who Contacts the Customer with BodyShop Booster On",
    facts: "4 Lanes · 6 Stages · 24 Cards · 12-Day Cadence",
    cadenceHeading: "The 12 Days"
  },

  lanes: [
    { id: "customer", name: "Customer", sub: "Vehicle owner / driver" },
    { id: "bsb", name: "BodyShop Booster", sub: "AI outreach and scheduling" },
    { id: "shop", name: "Shop", sub: "CSR · GM · Estimator" },
    { id: "contact-center", name: "Contact Center", sub: "Gerber agents, all locations" }
  ],

  stages: [
    {
      id: "s1",
      when: "T + 0",
      what: "Assignment created",
      owner: "BodyShop Booster",
      exit: "Assignment logged; customer's shop decision still pending.",
      note: "The customer is still deciding where the car goes. BSB gets the assignment notification via `CCCone` forwarded email the moment it exists."
    },
    {
      id: "s2",
      when: "90 seconds",
      what: "First contact",
      owner: "BodyShop Booster",
      exit: "Automated text & email sent within 90 seconds, every day of the week.",
      note: "Messaging hours run 7am–9pm in the shop's local time zone."
    },
    {
      id: "s3",
      when: "+6 hr, +16 hr",
      what: "Assignment Follow-up",
      owner: "BodyShop Booster",
      exit: "Two more automated touches sent, 6 and 16 hours after the prior message.",
      note: "Hours outside the messaging window don't count against the clock. BSB calendar syncs manually with the `CCCone` calendar."
    },
    {
      id: "s4",
      when: "24 hr",
      what: "Call Center takes it",
      owner: "Contact Center",
      exit: "Anything BSB hasn't booked by hour 24 moves to the Call Center.",
      note: "The shop stays out of assignment follow-up from here for the pilot. Contact Center is inbound-only up to this point."
    },
    {
      id: "s5",
      when: "Days 1 to 12",
      what: "Estimate Follow-up",
      owner: "BodyShop Booster / Shop",
      exit: "Estimate closed and RO created, or follow-up continues per the day cadence.",
      note: "Unclosed estimates get added to BSB's proactive reach-out cadence on days 1, 2, 5, 7, 9 and 11. A scheduled drop-off date stops BSB's follow-up via the BSB secure share app.",
      light: true
    },
    {
      id: "s6",
      when: "Days 3 & 12",
      what: "Human touchpoints",
      owner: "Shop (CSR)",
      exit: "Customer has heard from a person at least twice across the twelve days.",
      note: "CSR calls on day 3 and day 12 run alongside the automated cadence, not instead of it.",
      light: true
    }
  ],

  boxes: [
    {
      stage: "s1", lane: "customer",
      head: "Deciding Where The Car Goes",
      card: "Deciding where the car goes.",
      slide: "Deciding where the car goes.",
      steps: [
      ],
      systems: [],
      questions: [
      ]
    },
    {
      stage: "s1", lane: "bsb",
      head: "Gets The Assignment Notification",
      card: "Booster gets the assignment notification via CCCone forwarded email.",
      slide: "Booster gets the assignment notification via CCCone forwarded email.",
      steps: [
        { text: "BSB receives the assignment notification via CCCone forwarded email." },
        { text: "BSB adds a 24hour callback and a note to the assignment", manual: true }
      ],
      systems: [],
      questions: [
        { q: "What specifically does BSB need to put in the note so that CSR and Call Center know not to work it", owner: "Boyd" },
        { q: "Does BSB need to ignore supplement assignments?", owner: "Both" },
        { q: "Does BSB need to handle assignments that come in that are already scheduled?", owner: "Both" },
        { q: "How should BSB handle imported assignments?", owner: "Both" },
        { q: "How should BSB handle open shop assignments (not from a DRP)?", owner: "Both" }
      ]
    },
    {
      stage: "s1", lane: "shop",
      head: "Assignment Received. No Action.",
      card: "No action.",
      slide: "No action.",
      quiet: true,
      steps: [
        { text: "No action expected from the shop at this stage." }
      ],
      systems: [],
      questions: [
      ]
    },
    {
      stage: "s1", lane: "contact-center",
      head: "No Action",
      card: "No action.",
      slide: "No action.",
      quiet: true,
      steps: [
        { text: "No action expected from the Contact Center at this stage." }
      ],
      systems: [],
      questions: [
      ]
    },
    {
      stage: "s2", lane: "customer",
      head: "Text & Email With Video",
      card: "Receives text and email with a video on why Gerber, and a link to schedule an estimate.",
      slide: "**Text and email:** With a video on why Gerber to schedule an estimate.",
      steps: [
      ],
      systems: [],
      questions: [
        { q: "Is the content of the message and video finalized?", owner: "Both" }
      ]
    },
    {
      stage: "s2", lane: "bsb",
      head: "Automated Text & Email",
      card: "Contacts the customer within 90 seconds, 7 days a week.",
      slide: "**Automated text & email:** Contacts the customer within 90 seconds, 7 days a week. Messaging hours run 7am to 9pm in the shop's local time zone.",
      steps: [
        { text: "BSB contacts the customer within 90 seconds, 7 days a week." },
        { text: "Messaging hours run 7am to 9pm in the shop's local time zone." },
        { text: "BSB adds activity log to autoverse", manual: true }
      ],
      systems: [],
      questions: [
      ]
    },
    {
      stage: "s2", lane: "shop",
      head: "No Action - BSB Owns First 24 Hours",
      card: "BSB owns the first 24 hours. Handle inbound dials from the customer as needed.",
      slide: "**No action:** BSB owns the first 24 hours. Drop the one-hour call on assignments BSB is working. Handle inbound dials from the customer – update CCC as needed.",
      quiet: true,
      steps: [
        { text: "BSB owns the first 24 hours; no proactive shop action." },
        { text: "Handle inbound dials from the customer and update `CCC` as needed." }
      ],
      systems: [],
      questions: [
      ]
    },
    {
      stage: "s2", lane: "contact-center",
      head: "Inbound Only",
      card: "Take the calls the shop cannot. No proactive outreach on assignments.",
      slide: "**Inbound only:** Take the calls the shop cannot. No proactive outreach on assignments.",
      steps: [
        { text: "Contact Center takes the calls the shop cannot handle." },
        { text: "No proactive outreach on assignments." }
      ],
      systems: [],
      questions: [
      ]
    },
    {
      stage: "s3", lane: "customer",
      head: "Books When It Suits Them",
      card: "Books when it suits them.",
      slide: "Books when it suits them.",
      steps: [
      ],
      systems: [],
      questions: [
      ]
    },
    {
      stage: "s3", lane: "bsb",
      head: "Two More Touches",
      card: "Text and email 6 and 16 hours after the previous message. Manual sync of BSB calendar with CCCone calendar.",
      slide: "**Two more touches:** 6 and 16 hours after the previous message (text & email); hours outside the window do not count against the clock. Manual sync of BSB calendar with CCCone calendar.",
      steps: [
        { text: "BSB sends two more touches (text & email) 6 and 16 hours after the previous message." },
        { text: "Hours outside the messaging window don't count against the clock." },
        { text: "BSB calendar syncs manually with the CCCone calendar.", manual: true },
        { text: "BSB adds activity log to autoverse and CCCone" }
      ],
      systems: [],
      questions: [
        { q: "What does BSB need to enter in CCCone in order for the estimator to take over", owner: "Both" }
      ]
    },
    {
      stage: "s3", lane: "shop",
      head: "No Action - No Chasing",
      card: "No chasing, and no cancelling the assignment on attempt four. BSB is still on it.",
      slide: "**No action:** No chasing, and no cancelling the assignment on attempt four. BSB is still on it. Handle inbound dials from the customer – update CCC as needed.",
      quiet: true,
      steps: [
        { text: "No chasing; the assignment isn't cancelled after attempt four — BSB is still on it." },
        { text: "Handle inbound dials from the customer and update `CCC` as needed." }
      ],
      systems: [],
      questions: [
      ]
    },
    {
      stage: "s3", lane: "contact-center",
      head: "Inbound Only",
      card: "Take the calls the shop cannot. No proactive outreach on assignments.",
      slide: "**Inbound only:** Take the calls the shop cannot. No proactive outreach on assignments.",
      steps: [
        { text: "Contact Center takes the calls the shop cannot handle." },
        { text: "No proactive outreach on assignments." }
      ],
      systems: [],
      questions: [
      ]
    },
    {
      stage: "s4", lane: "customer",
      head: "Still Have Not Booked",
      card: "Still have not booked.",
      slide: "Still have not booked.",
      steps: [
      ],
      systems: [],
      questions: [
      ]
    },
    {
      stage: "s4", lane: "bsb",
      head: "Mirrors Into CCC",
      card: "BSB manually writes contact activity into CCC.",
      slide: "**Mirrors into CCC:** BSB manually writes its contact activity into CCC.",
      steps: [
        { text: "BSB manually writes its contact activity into `CCC`.", manual: true }
      ],
      systems: [],
      questions: [
      ]
    },
    {
      stage: "s4", lane: "shop",
      head: "CSR/Estimator: Follow-Up on unbooked assignments",
      card: "Typical assignment follow-up process",
      slide: "**CSR/Estimator:** Assignment follow-up belongs to the Call Center from here. The shop stays out of it for the pilot.",
      steps: [
        { text: "CSR follows standard assignment follow-up taking into account the touchpoints BSB had" }
      ],
      systems: [],
      questions: [
        { q: "Does the shop ignore assignments that have a callback reminder?", owner: "Boyd" }
      ]
    },
    {
      stage: "s4", lane: "contact-center",
      head: "Typical Assignment Follow-up",
      card: "Typical assignment follow-up process",
      slide: "**Owns it from here:** Everything BSB has not booked by hour 24 comes here.",
      steps: [
        { text: "Unbooked assignments will be added back to the contact center queue" }
      ],
      systems: [],
      questions: [
      ]
    },
    {
      stage: "s5", lane: "customer",
      head: "Reviews & Authorizes Estimate",
      card: "Receives message to view the estimate, authorize it and pick a drop-off date.",
      slide: "**Receives message to view the estimate, authorize it and pick a drop-off date.**",
      steps: [
      ],
      systems: [],
      questions: [
      ]
    },
    {
      stage: "s5", lane: "bsb",
      head: "Ten Touch Points, Twelve Days",
      card: "Unclosed estimates get proactive reach-outs on days 1, 2, 5, 7, 9 and 11.",
      slide: "**Ten touch points, twelve days:** Any estimate the shop does not close is added (manually for the pilot) to BSB for follow-up: proactive reach outs on days 1, 2, 5, 7, 9 and 11.",
      steps: [
        { text: "Unclosed estimates are manually added to BSB for follow-up (pilot process).", manual: true },
        { text: "BSB proactively reaches out on days 1, 2, 5, 7, 9 and 11." }
      ],
      systems: [],
      questions: [
      ]
    },
    {
      stage: "s5", lane: "shop",
      head: "CSR/Estimator: Updates The RO",
      card: "If scheduled, update the RO and create the repair plan.",
      slide: "**CSR/Estimator:** If scheduled, update the RO and create the repair plan. The scheduled-arrive date stops the BSB follow-up (via BSB secure share app).",
      steps: [
        { text: "If scheduled, update the `RO` and create the repair plan.", manual: true },
        { text: "The scheduled-arrive date stops BSB's follow-up via the BSB secure share app." }
      ],
      systems: [],
      questions: [
      ]
    },
    {
      stage: "s5", lane: "contact-center",
      head: "No Action",
      card: "Handle inbound dials from the customer – update CCC as needed.",
      slide: "**No action:** Handle inbound dials from the customer – update CCC as needed.",
      quiet: true,
      steps: [
        { text: "Handle inbound dials from the customer and update `CCC` as needed." }
      ],
      systems: [],
      questions: [
      ]
    },
    {
      stage: "s6", lane: "customer",
      head: "Hears From A Person Twice",
      card: "Hears from a person twice in the twelve days, not only from the automation.",
      slide: "Hears from a person twice in the twelve days, not only from the automation.",
      steps: [
      ],
      systems: [],
      questions: [
      ]
    },
    {
      stage: "s6", lane: "bsb",
      head: "Two Human Touches",
      card: "**Two human touches:** on day 3 and day 12, BSB emails the CSR to get on the phone.",
      slide: "**Two human touches:** On day 3 and day 12 BSB emails the CSR: this customer has not booked, get on the phone. The automated cadence keeps running around those two calls.",
      steps: [
        { text: "On day 3 and day 12, BSB emails the CSR that the customer hasn't booked." },
        { text: "The automated cadence keeps running around those two human calls." }
      ],
      systems: [],
      questions: [
      ]
    },
    {
      stage: "s6", lane: "shop",
      head: "CSR Reaches Out",
      card: "CSR reaches out on day 3 and day 12.",
      slide: "**CSR:** CSR reaches out on day 3 and day 12.",
      steps: [
        { text: "CSR reaches out to the customer on day 3.", manual: true },
        { text: "CSR reaches out to the customer on day 12.", manual: true }
      ],
      systems: [],
      questions: [
      ]
    },
    {
      stage: "s6", lane: "contact-center",
      head: "No Action",
      card: "Handle inbound dials from the customer – update CCC as needed.",
      slide: "**No action:** Handle inbound dials from the customer – update CCC as needed.",
      quiet: true,
      steps: [
        { text: "Handle inbound dials from the customer and update `CCC` as needed." }
      ],
      systems: [],
      questions: [
      ]
    }
  ],

  days: [
    { day: 1, kind: "auto", label: "Text + Email", detail: "Automated text and email cadence continues." },
    { day: 2, kind: "auto", label: "Text + Email", detail: "Automated text and email cadence continues." },
    { day: 3, kind: "human", label: "CSR Phone Call", detail: "CSR reaches out by phone — one of the two human touchpoints in the twelve days." },
    { day: 4, kind: "quiet", label: "Quiet", detail: "No outreach scheduled." },
    { day: 5, kind: "auto", label: "Text + Email", detail: "BSB proactive reach-out — one of the ten touch points for unclosed estimates." },
    { day: 6, kind: "quiet", label: "Quiet", detail: "No outreach scheduled." },
    { day: 7, kind: "auto", label: "Text + Email", detail: "BSB proactive reach-out — one of the ten touch points for unclosed estimates." },
    { day: 8, kind: "quiet", label: "Quiet", detail: "No outreach scheduled." },
    { day: 9, kind: "auto", label: "Text + Email", detail: "BSB proactive reach-out — one of the ten touch points for unclosed estimates." },
    { day: 10, kind: "quiet", label: "Quiet", detail: "No outreach scheduled." },
    { day: 11, kind: "auto", label: "Pullback Offer", detail: "The pullback offer goes out via text + email." },
    { day: 12, kind: "human", label: "CSR Phone Call", detail: "CSR reaches out by phone — the second human touchpoint in the twelve days." }
  ]
};
