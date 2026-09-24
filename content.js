window.BSB_CONTENT = {
  meta: {
    title: "Who Contacts the Customer with BodyShop Booster On",
    facts: "4 Lanes · 6 Stages · 24 Cards"
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
        { text: "BSB adds a 24hour callback and a note to the assignment", manual: true },
        { text: "For assignments that are already scheduled BSB still sends a message to the customer but it does not include a request to schedule" }
      ],
      systems: [],
      questions: [
        { q: "What specifically does BSB need to put in the note so that CSR and Call Center know not to work it", owner: "Boyd" },
        { q: "Does BSB need to ignore supplement assignments? BSB will filter by subject line = NEW Assignment and other metrics to make sure that the assignment is not unique", owner: "Both" },
        { q: "Does BSB need to handle assignments that come in that are already scheduled?  BSB has logic to send assignments that already have something scheduled a message that does not ask for something to be scheduled. ", owner: "Both" },
        { q: "How should BSB handle imported/downloaded assignment? Not handled by BSB", owner: "Both" },
        { q: "How should BSB handle open shop assignments (not from a DRP)?  BSB won't handle these.", owner: "Both" },
        { q: "How do we handle failure cases in the email forward to BSB?", owner: "Both" },
        { q: "What is the expected volume of new assignments per pilot shop per day?", owner: "Both" },
        { q: "What is the expected SLA for the manual BSB step to add a callback and an initial note? - target: TBD", owner: "Both" }
      ]
    },
    {
      stage: "s1", lane: "shop",
      head: "Assignment Received. No Action.",
      card: "No new/different actions required from the shop (BSB handles new assignments shop and contact center handle the rest)",
      slide: "No action.",
      quiet: true,
      steps: [
        { text: "No action expected from the shop at this stage for assignments that BSB is handling." }
      ],
      systems: [],
      questions: [
      ]
    },
    {
      stage: "s1", lane: "contact-center",
      head: "No Action",
      card: "No new/different actions required from the contact center (BSB handles new assignments the contact center and shop handle the rest)",
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
        { text: "BSB adds activity log to autoverse", manual: true },
        { text: "BSB adds a note to the assignment in CCCone contact center", manual: true }
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
        { text: "BSB owns the first 24 hours; no proactive shop action." }
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
        { text: "No proactive outreach on assignments being handled by BSB as noted in the file in CCCone." }
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
        { text: "BSB calendar syncs manually with the CCCone calendar - both ways.", manual: true },
        { text: "BSB adds activity log to autoverse", manual: true },
        { text: "BSB adds activity log to CCCone contact center notes", manual: true },
        { text: "If the the customer schedules via the BSB link then BSB will enter the RO in CCCone", manual: true }
      ],
      systems: [],
      questions: [
        { q: "What should the messaging hours be for the pilot?", owner: "Both" },
        { q: "Need to correctly schedule estimates with the estimator that handles the carrier.", owner: "Both" },
        { q: "Need to define an SLA for making sure that the BSB calendar mirrors the shop's calendar.", owner: "Both" },
        { q: "What phone number should BSB include in the message - shop or contact center?", owner: "Both" },
        { q: "What happens in the scenario where a customer calls into the shop or contact center but no repair major date event (repair plan created)?", owner: "Both" }
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
      card: "Receives message to view the estimate and committ to scheduling vehicle drop off with the shop.",
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
        { text: "BSB proactively reaches out on days 1, 2, 5, 7, 9 and 11 asking the customer to commit to scheduling a drop-off." },
        { text: "BSB in CCCone adds a note in the RO so that the shop knows that BSB is also contacting the customer", manual: true }
      ],
      systems: [],
      questions: [
      ]
    },
    {
      stage: "s5", lane: "shop",
      head: "CSR/Estimator/GM: Continued Follow-up",
      card: "Shop front lines still follow-up with the customer but BSB is assisting",
      slide: "**CSR/Estimator:** If scheduled, update the RO and create the repair plan. The scheduled-arrive date stops the BSB follow-up (via BSB secure share app).",
      steps: [
        { text: "Review BSB portal - if the customer committed via BSB eSign/authorization to schedule then reach out to the customer and update the RO and create the repair plan taking into shop calendar, DDCP etc.", manual: true },
        { text: "In parallel to BSB reaching out to the customer follow the typical cadence of reaching out to the customer, but take into account notes in the BSB portal.", manual: true },
        { text: "Review BSB portal for customers that need follow-up", manual: true }
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
        { q: "Emails to the shop should be to a distro vs an individual", owner: "Both" },
        { q: "What is the best way for BSB to consider shop capacity when scheduling estimates and repairs? - Answer: not applicable because the shop will reach out to the customer to schedule same as they do today. ", owner: "Both" }
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
        { q: "Need to understand which specific users need access to BSB", owner: "Both" }
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

  journeys: [
    {
      id: "new-assignment",
      title: "New Assignment",
      summary: "Three automated messages, then the Contact Center picks it up at hour 24. If the customer books then the automated Text + email stops.",
      steps: [
        { lane: "bsb", when: "T + 90 sec", who: "BSB", title: "Video + scheduling link", how: "Text + email" },
        { lane: "bsb", when: "+6 hrs", who: "BSB", title: "Second nudge", how: "Text + email" },
        { lane: "bsb", when: "+16 hrs", who: "BSB", title: "Third nudge", how: "Text + email" },
        { lane: "contact-center", when: "Hour 24+", who: "Contact Center", title: "First call from a person", how: "Phone" }
      ]
    },
    {
      id: "estimate-followup",
      title: "Estimate Follow Up",
      summary: "Twelve-days of follow-up starts when the Opportunity is added to BSB",
      steps: [
        { lane: "bsb", when: "Day 1", who: "BSB", title: "View + authorize estimate", how: "Text + email" },
        { lane: "bsb", when: "Day 2", who: "BSB", title: "Follow-up", how: "Text + email" },
        { lane: "shop", when: "Day 3", who: "Shop CSR", title: "Phone call", how: "BSB prompts CSR" },
        { lane: "quiet", when: "Day 4" },
        { lane: "bsb", when: "Day 5", who: "BSB", title: "Follow-up", how: "Text + email" },
        { lane: "quiet", when: "Day 6" },
        { lane: "bsb", when: "Day 7", who: "BSB", title: "Follow-up", how: "Text + email" },
        { lane: "quiet", when: "Day 8" },
        { lane: "bsb", when: "Day 9", who: "BSB", title: "Follow-up", how: "Text + email" },
        { lane: "quiet", when: "Day 10" },
        { lane: "bsb", when: "Day 11", who: "BSB", title: "Follow-up", how: "Text + email" },
        { lane: "shop", when: "Day 12", who: "Shop CSR", title: "Last phone call", how: "BSB prompts CSR" }
      ]
    }
  ]
};
