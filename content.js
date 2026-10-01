window.BSB_CONTENT = {
  meta: {
    title: "BodyShop Booster Customer Journeys and Workflows"
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
      owner: "",
      exit: "",
      note: ""
    },
    {
      id: "s2",
      when: "90 seconds",
      what: "First contact",
      owner: "",
      exit: "",
      note: ""
    },
    {
      id: "s3",
      when: "+6 hr, +16 hr",
      what: "Assignment Follow-up",
      owner: "",
      exit: "",
      note: ""
    },
    {
      id: "s4",
      when: "24 hr",
      what: "Call Center takes it",
      owner: "",
      exit: "",
      note: ""
    },
    {
      id: "s4b",
      when: "Any Time",
      what: "Customer Books",
      owner: "BodyShop Booster / Shop",
      exit: "Customer has booked; BSB notifies the shop and stops its automated outreach.",
      note: "Booking can happen any time during the automated outreach window (T + 90 sec through +16 hr) -- once booked, BSB's text/email cadence stops and Contact Center is never involved.",
      light: true
    },
    {
      id: "s5",
      when: "Days 1 to 12",
      what: "Estimate Follow-up",
      owner: "",
      exit: "",
      note: "",
      light: true
    },
    {
      id: "s6",
      when: "Days 3 & 12",
      what: "Human touchpoints",
      owner: "",
      exit: "",
      note: "",
      light: true
    },
    {
      id: "s6b",
      when: "Any Time",
      what: "Customer Books",
      owner: "BodyShop Booster / Shop",
      exit: "Customer has authorized and scheduled a drop-off; the shop creates the repair plan and BSB's day-cadence outreach stops.",
      note: "Booking can happen at any point across the 12-day cadence -- once scheduled, BSB's day-by-day reach-outs and the day 3/12 human touchpoints both stop.",
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
        { text: "BSB adds a 24hour callback and a note to the assignment in CCCone", manual: true },
        { text: "BSB will copy into CCCone new assignments from Mitchell", manual: true },
        { text: "For assignments that are already scheduled BSB still sends a message to the customer but it does not include a request to schedule" }
      ],
      systems: [],
      questions: [
        { q: "What specifically does BSB need to put in the note so that CSR and Call Center know not to work it", owner: "Boyd", notes: "Need to schedule a breakout to train the BSB team on best practices and SOPs Boyd uses in CCCone. " },
        { q: "Does BSB need to ignore supplement assignments? ", owner: "Both", notes: "BSB will filter by subject line = NEW Assignment and other metrics to make sure that the assignment is not unique" },
        { q: "Does BSB need to handle assignments that come in that are already scheduled? ", owner: "Both", notes: "BSB has logic to send assignments that already have something scheduled a message that does not ask for something to be scheduled." },
        { q: "How should BSB handle imported/downloaded assignment?", owner: "Both", notes: "These won't be handled by BSB" },
        { q: "How should BSB handle open shop assignments (not from a DRP)? ", owner: "Both", notes: "BSB won't handle these." },
        { q: "How do we handle failure cases in the email forward to BSB?", owner: "Both", notes: "It's rare that these failures happen, in the event they do BSB plans to audit new assignments in their own system." },
        { q: "What is the expected volume of new assignments per pilot shop per day?", owner: "Both", notes: "Data will be provided" },
        { q: "What is the expected SLA for the manual BSB step to add a callback and an initial note?", owner: "BSB", notes: "BSB will provide an SLA - but ideal is under 10 minutes" },
        { q: "Is BSB handling Mitchell assignments?", owner: "Both", notes: "BSB won't reach out to new Mitchell assignments - all are already scheduled by the insurance carrier" },
        { q: "What about Fleet assignments?", owner: "Both", notes: "We want BSB to ignore fleet assignments." }
      ]
    },
    {
      stage: "s1", lane: "shop",
      head: "Assignment Received. No Action.",
      card: "No new/different actions required from the shop (BSB handles new assignments shop and contact center handles the rest)",
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
        { text: "No action expected from the shop at this stage for assignments that BSB is handling." },
        { text: "Continue to handle Mitchell Assignments as they're handled today" }
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
        { text: "BSB adds activity log to autoverse", manual: true },
        { text: "BSB adds a note to the assignment in CCCone contact center", manual: true }
      ],
      systems: [],
      questions: [
        { q: "What email address is the BSB email set from?", owner: "Both", notes: "It can be a @gerbercollision.com domain" }
      ]
    },
    {
      stage: "s2", lane: "shop",
      head: "No Action - BSB Owns First 24 Hours",
      card: "BSB owns the first 24 hours. Handle inbound dials from the customer as needed.",
      slide: "**No action:** BSB owns the first 24 hours. Drop the one-hour call on assignments BSB is working. Handle inbound dials from the customer – update CCC as needed.",
      quiet: true,
      steps: [
        { text: "No proactive shop action for the assignments that BSB owns as noted in CCCone." }
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
        { text: "BSB sends two more touches (text & email) 6 and 16 hours after the previous message -hours outside the messaging window don't count against the clock." },
        { text: "BSB calendar syncs manually with the CCCone calendar - both ways.", manual: true },
        { text: "BSB adds activity log to autoverse", manual: true },
        { text: "BSB adds activity log to CCCone contact center notes", manual: true }
      ],
      systems: [],
      questions: [
        { q: "What should the messaging hours be for the pilot?", owner: "Boyd", notes: "Need an answer" },
        { q: "Need to correctly schedule estimates with the estimator that handles the carrier.", owner: "Boyd", notes: "Boyd to provide the mappings of estimator to carrier - N/A if Boyd enters the RO" },
        { q: "Need to define an SLA for making sure that the BSB calendar mirrors the shop's calendar.", owner: "Both" },
        { q: "What phone number should BSB include in the message - shop or contact center?", owner: "Both" },
        { q: "What happens in the scenario where a customer calls into the shop or contact center but no repair major date event (repair plan created)?", owner: "Both", notes: "BSB will continue with sending scheduled texts & email to the customer" },
        { q: "Should BSB be entering ROs or should we lean on central services?", owner: "Both", notes: "Jackie and Nicole propose that TBG enters the ROs" }
      ]
    },
    {
      stage: "s3", lane: "shop",
      head: "No Chasing - BSB Still On It",
      card: "No chasing, BSB is still on it.",
      slide: "**No action:** No chasing, and no cancelling the assignment on attempt four. BSB is still on it. Handle inbound dials from the customer – update CCC as needed.",
      quiet: true,
      steps: [
        { text: "No chasing; the assignment isn't cancelled after attempt four — BSB is still on it." },
        { text: "Handle inbound dials from the customer and update CCCone as needed." }
      ],
      systems: [],
      questions: [
        { q: "Will Shop CSR/GM/Estimator need to log into BSB portal to understand what happening with new assignments?", owner: "Both", notes: "No - BSB will handle the first 24hours of new assignments reach outs - at the end of 24hours if the customer has not booked the Shop will see notes on the file from BSB" }
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
        { q: "Will the call center need to log into BSB portal to understand what happening with new assignments?", owner: "Both", notes: "No - BSB will handle the first 24hours of new assignments reach outs - at the end of 24hours if the customer has not booked the Shop will see notes on the file from BSB" }
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
        { text: "BSB manually writes its contact activity into CCCone.", manual: true }
      ],
      systems: [],
      questions: [
      ]
    },
    {
      stage: "s4", lane: "shop",
      head: "CSR/Estimator: Follow-Up on unbooked assignments",
      card: "Assignment follow-up belongs to the Call Center from here. The shop stays out of it for the pilot.",
      slide: "**CSR/Estimator:** Assignment follow-up belongs to the Call Center from here. The shop stays out of it for the pilot.",
      steps: [
        { text: "CSR follows standard assignment follow-up taking into account the touchpoints BSB had" }
      ],
      systems: [],
      questions: [
        { q: "How will the shop know that an assignment that was handled by BSB should be reached out to?", owner: "Both", notes: "By the notes BSB has added to the file" }
      ]
    },
    {
      stage: "s4", lane: "contact-center",
      head: "Typical Assignment Follow-up",
      card: "Everything BSB has not booked by hour 24 comes to the contact center.",
      slide: "**Owns it from here:** Everything BSB has not booked by hour 24 comes here.",
      steps: [
        { text: "Unbooked assignments will be added back to the contact center queue" }
      ],
      systems: [],
      questions: [
        { q: "How will the call center know that an assignment that was handled by BSB should be reached out to?", owner: "Both", notes: "Because the 24hour callback that BSB set will eclipse and the assignment will be added to the call center queue." }
      ]
    },
    {
      stage: "s4b", lane: "customer",
      head: "Schedules Via BSB Link",
      card: "Books an appointment using the BSB scheduling link sent by text or email.",
      slide: "Books an appointment using the BSB scheduling link sent by text or email.",
      steps: [
      ],
      systems: [],
      questions: [
      ]
    },
    {
      stage: "s4b", lane: "bsb",
      head: "Notifies The Shop",
      card: "BSB notifies the shop so an RO can be created if needed, and stops its automated outreach.",
      slide: "**Notifies the shop:** If the customer schedules via the BSB link, BSB notifies the shop so an RO can be created if needed. The automated text/email cadence stops.",
      steps: [
        { text: "If the customer schedules via the BSB link, BSB notifies the Shop so that an RO can be created if needed.", manual: true },
        { text: "BSB's automated text and email cadence stops once the customer has booked." }
      ],
      systems: [],
      questions: [
      ]
    },
    {
      stage: "s4b", lane: "shop",
      head: "Creates The RO",
      card: "Creates the RO if needed — may require reaching out to the customer that booked, or creating it when they arrive.",
      slide: "**Creates the RO:** Create the RO if needed — may require reaching out to the customer that booked and/or create the RO when the customer comes into the shop. Reconcile Enterprise rental availability if needed.",
      steps: [
        { text: "Create RO if needed — may require reaching out to the customer that booked and/or create the RO when the customer comes into the shop." },
        { text: "Reconcile Enterprise rental availability if needed." }
      ],
      systems: [],
      questions: [
      ]
    },
    {
      stage: "s4b", lane: "contact-center",
      head: "No Action",
      card: "No action required — BSB and the customer resolved this before Contact Center would have been involved.",
      slide: "No action required — BSB and the customer resolved this before Contact Center would have been involved.",
      quiet: true,
      steps: [
        { text: "No action required; the assignment was booked before Contact Center's hour-24 follow-up would begin." }
      ],
      systems: [],
      questions: [
      ]
    },
    {
      stage: "s5", lane: "customer",
      head: "Reviews & Authorizes Estimate",
      card: "Receives message to view the estimate and authorize scheduling a drop-off",
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
        { text: "Unclosed estimates are manually added to BSB for follow-up.", manual: true },
        { text: "BSB proactively reaches out on days 1, 2, 5, 7, 9 and 11 asking the customer to commit to scheduling a drop-off." },
        { text: "BSB in CCCone adds a note in the RO so that the shop knows that BSB is also contacting the customer", manual: true }
      ],
      systems: [],
      questions: [
      ]
    },
    {
      stage: "s5", lane: "shop",
      head: "CSR/Estimator/GM: Reviews For Follow-up",
      card: "Reviews the BSB portal to identify customers who still need follow-up.",
      slide: "**CSR/Estimator:** Reviews the BSB portal for customers that need follow-up.",
      steps: [
        { text: "Review BSB portal for customers that need follow-up" }
      ],
      systems: [],
      questions: [
        { q: "How will the shop front line roles know how to navigate BSB?", owner: "Both", notes: "Training will be provided to CSR, Estimator, and GMs of pilot locations." }
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
        { q: "What is the best way for BSB to consider shop capacity when scheduling estimates and repairs? ", owner: "Both", notes: "Not applicable because the shop will reach out to the customer to schedule same as they do today." }
      ]
    },
    {
      stage: "s6", lane: "shop",
      head: "CSR Reaches Out",
      card: "CSR reaches out on day 3 and day 12.",
      slide: "**CSR:** CSR reaches out on day 3 and day 12.",
      steps: [
        { text: "CSR reaches out to the customer on day 3." },
        { text: "CSR reaches out to the customer on day 12." }
      ],
      systems: [],
      questions: [
        { q: "Need to understand which specific users need access to BSB", owner: "Both", notes: "GMs, CSRs, and Estimators - list of individuals per shop being compiled" }
      ]
    },
    {
      stage: "s6", lane: "contact-center",
      head: "No Action",
      card: "Handle inbound dials from the customer – update CCCone as needed.",
      slide: "**No action:** Handle inbound dials from the customer – update CCC as needed.",
      quiet: true,
      steps: [
        { text: "Handle inbound dials from the customer and update CCCone as needed." }
      ],
      systems: [],
      questions: [
      ]
    },
    {
      stage: "s6b", lane: "customer",
      head: "Authorizes & Schedules Drop-off",
      card: "Authorizes the estimate via BSB eSign and commits to a drop-off date.",
      slide: "Authorizes the estimate via BSB eSign and commits to a drop-off date.",
      steps: [
      ],
      systems: [],
      questions: [
      ]
    },
    {
      stage: "s6b", lane: "bsb",
      head: "Sends Reminders & Notifies Shop",
      card: "Sends drop-off reminder notifications and emails the shop once the customer authorizes scheduling.",
      slide: "**Sends reminders & notifies shop:** Sends drop-off reminder notifications via text and email, and emails the shop once the customer authorizes scheduling. Mitchell assignments get the same reminders.",
      steps: [
        { text: "If a customer has scheduled a drop off BSB will send reminder notifications via text and email" },
        { text: "BSB ingested Mitchell assignments and will follow-up with customers to remind the of drop off date & time." },
        { text: "If a customer authorizes to schedule a drop-off BSB will email the shop.", manual: true }
      ],
      systems: [],
      questions: [
        { q: "What about Mitchell?", owner: "Both", notes: "BSB will have data for new assignments that are from Mitchell and will follow-up/remind customers of drop-off date & time. " }
      ]
    },
    {
      stage: "s6b", lane: "shop",
      head: "Updates RO & Creates Repair Plan",
      card: "If scheduled, updates the RO and creates the repair plan.",
      slide: "**CSR/Estimator:** If scheduled, update the RO and create the repair plan. The scheduled-arrive date stops the BSB follow-up (via BSB secure share app).",
      steps: [
        { text: "Review BSB portal - if the customer committed via BSB eSign/authorization to schedule then reach out to the customer and update the RO and create the repair plan taking into shop calendar, DDCP etc.", manual: true }
      ],
      systems: [],
      questions: [
      ]
    },
    {
      stage: "s6b", lane: "contact-center",
      head: "No Action",
      card: "No action required — the shop and BSB handle the booked drop-off directly.",
      slide: "No action required — the shop and BSB handle the booked drop-off directly.",
      quiet: true,
      steps: [
        { text: "No action required once the customer has booked; handled directly between BSB and the shop." }
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
        { lane: "bsb", when: "T + 90 sec", who: "BSB", title: "Video + scheduling link", how: "Text + email", stage: "s2" },
        { lane: "bsb", when: "+6 hrs", who: "BSB", title: "Second nudge", how: "Text + email", stage: "s3" },
        { lane: "bsb", when: "+16 hrs", who: "BSB", title: "Third nudge", how: "Text + email", stage: "s3" },
        { lane: "contact-center", when: "Hour 24+", who: "Contact Center", title: "First call from a person", how: "Phone", stage: "s4" }
      ]
    },
    {
      id: "estimate-followup",
      title: "Estimate Follow Up",
      summary: "Twelve-days of follow-up starts when the Opportunity is added to BSB. If the repair is scheduled then the automated Text + email stops.",
      steps: [
        { lane: "bsb", when: "Day 1", who: "BSB", title: "View + authorize estimate", how: "Text + email", stage: "s5" },
        { lane: "bsb", when: "Day 2", who: "BSB", title: "Follow-up", how: "Text + email", stage: "s5" },
        { lane: "shop", when: "Day 3", who: "Shop CSR", title: "Phone call", how: "BSB prompts CSR", stage: "s6" },
        { lane: "quiet", when: "Day 4", stage: "s5" },
        { lane: "bsb", when: "Day 5", who: "BSB", title: "Follow-up", how: "Text + email", stage: "s5" },
        { lane: "quiet", when: "Day 6", stage: "s5" },
        { lane: "bsb", when: "Day 7", who: "BSB", title: "Follow-up", how: "Text + email", stage: "s5" },
        { lane: "quiet", when: "Day 8", stage: "s5" },
        { lane: "bsb", when: "Day 9", who: "BSB", title: "Follow-up", how: "Text + email", stage: "s5" },
        { lane: "quiet", when: "Day 10", stage: "s5" },
        { lane: "bsb", when: "Day 11", who: "BSB", title: "Follow-up", how: "Text + email", stage: "s5" },
        { lane: "shop", when: "Day 12", who: "Shop CSR", title: "Last phone call", how: "BSB prompts CSR", stage: "s6" }
      ]
    }
  ]
};
