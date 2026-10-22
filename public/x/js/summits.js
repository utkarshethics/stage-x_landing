class Component extends DCLogic {
  componentDidMount() { this._t = setInterval(() => this.forceUpdate(), 1000); }
  componentWillUnmount() { clearInterval(this._t); }

  renderVals() {
    var self = this;
    var s = this.state || {};
    var motion = this.props.motion ?? true;
    var EXPORT = typeof SX_EXPORT !== 'undefined';
    var cityHref = function (slug) { return EXPORT ? '/summits/' + slug + '-2026.html' : 'Summit.dc.html'; };
    // Date order, matching the Lu.ma listings (Mumbai Dec 5, Melbourne Dec 12, Dubai 2027).
    var DATE_ORDER = ['sf', 'nyc', 'boston', 'toronto', 'london', 'berlin', 'mumbai', 'melbourne', 'dubai'];
    var IMG = {
      sf: '/public/x/img/summit-sf.jpg', nyc: '/public/x/img/summit-nyc.jpg', boston: '/public/x/img/summit-boston.jpg',
      toronto: '/public/x/img/summit-toronto.jpg', london: '/public/x/img/summit-london.jpg', berlin: '/public/x/img/summit-berlin.jpg',
      dubai: '/public/x/img/summit-dubai.jpg', mumbai: '/public/x/img/summit-mumbai.jpg', melbourne: '/public/x/img/summit-melbourne.jpg'
    };
    var cities = [
      { slug: 'sf', name: 'San Francisco', dates: 'October 31–November 1, 2026', venue: 'The Presidio', status: '12 Seats Left', title: 'San Francisco — Energy Transition: AI for Utilities, Solar & Grid Storage', desc: 'Where AI pays off for power producers, utilities and storage operators, from forecasting renewable output to keeping batteries and substations healthy.', tags: ['Renewables', 'Grid Storage', 'Utilities'], alt: 'Golden Gate Bridge and San Francisco at dusk' },
      { slug: 'nyc', name: 'New York', dates: 'November 7–8, 2026', venue: 'Hudson Yards', status: 'Applications Open', title: 'New York — Power Grids & Utilities: AI for Reliability, Demand and Outage Response', desc: 'AI use cases for utilities running dense city grids: predicting demand, finding failing equipment before it trips, and speeding up outage response.', tags: ['Grid Reliability', 'Demand Forecasting', 'Outage Response'], alt: 'Hudson Yards and the Manhattan skyline at night' },
      { slug: 'boston', name: 'Boston', dates: 'November 14–15, 2026', venue: 'Kendall Square', status: 'Applications Open', title: 'Boston — Advanced Manufacturing: AI on the Factory Floor', desc: 'Use cases for manufacturers: vision-based quality inspection, predictive maintenance on production lines, and robots that adapt to new parts.', tags: ['Quality Inspection', 'Predictive Maintenance', 'Robotics'], alt: 'Boston skyline across the Charles River from Cambridge' },
      { slug: 'toronto', name: 'Toronto', dates: 'November 21–22, 2026', venue: 'MaRS Discovery District', status: 'Applications Open', title: 'Toronto — Process Manufacturing: AI for Steel, Chemicals & Materials', desc: 'Use cases for continuous-process plants: keeping quality on target, cutting energy per tonne and reducing off-spec batches.', tags: ['Process Control', 'Energy Efficiency', 'Yield'], alt: 'Toronto skyline with the CN Tower at blue hour' },
      { slug: 'london', name: 'London', dates: 'November 28–29, 2026', venue: 'Canary Wharf', status: 'Applications Open', title: 'London — Offshore Energy: AI for North Sea Oil & Gas and Wind', desc: 'Use cases for offshore operators: asset integrity, faster inspection and maintenance planning across platforms and wind farms.', tags: ['Offshore', 'Asset Integrity', 'Wind'], alt: 'Canary Wharf towers reflected in the docks at night' },
      { slug: 'berlin', name: 'Berlin', dates: 'December 5–6, 2026', venue: 'Factory Berlin', status: 'Applications Open', title: 'Berlin — Automotive & Industrial Manufacturing: AI Across the Plant and Supply Chain', desc: 'Use cases for automotive and machinery makers: in-line inspection, equipment health and early warning of supply-chain disruption.', tags: ['Automotive', 'Assembly Lines', 'Supply Chain'], alt: 'Berlin TV tower and the Spree river at blue hour' },
      { slug: 'dubai', name: 'Dubai', dates: '2027 · Date to be announced', venue: 'Dubai World Trade Centre', status: 'Coming in 2027', luma: 'https://luma.com/75r1zd6d', title: 'Dubai — Upstream Oil & Gas: AI for Production, Drilling and Pipelines', desc: 'Use cases for oil and gas producers: production optimisation, drilling support and pipeline monitoring across remote assets.', tags: ['Upstream', 'Drilling', 'Pipelines'], alt: 'Dubai skyline with the Museum of the Future at dusk' },
      { slug: 'mumbai', name: 'Mumbai', dates: 'December 5, 2026', venue: 'Jio World Convention Centre', status: 'Registration Open', luma: 'https://luma.com/y2o1cuts', title: 'Mumbai — Refining, Petrochemicals & Power: AI for Large Process Plants', desc: 'Use cases for refineries, petrochemical complexes and power plants: energy efficiency, equipment reliability and safer operations.', tags: ['Refining', 'Petrochemicals', 'Power Plants'], alt: 'Mumbai skyline and the Bandra-Worli Sea Link at night' },
      { slug: 'melbourne', name: 'Melbourne', dates: 'December 12, 2026', venue: 'MCEC South Wharf', status: 'Registration Open', luma: 'https://luma.com/kfjfo5lh', title: 'Melbourne — Mining & Resources: AI for Heavy Equipment and Remote Sites', desc: 'Use cases for mining and resources companies: haul-fleet maintenance, ore processing and running remote sites with fewer people on site.', tags: ['Mining', 'Heavy Equipment', 'Remote Sites'], alt: 'Melbourne skyline and South Wharf on the Yarra at dusk' }
    ].sort(function (a, b) { return DATE_ORDER.indexOf(a.slug) - DATE_ORDER.indexOf(b.slug); }).map(function (c, i) {
      var hot = c.status.indexOf('Seats') !== -1;
      var later = c.status.indexOf('2027') !== -1;
      return Object.assign({}, c, { img: IMG[c.slug], href: cityHref(c.slug), stop: i + 1, luma: c.luma || 'https://lu.ma', badgeBg: hot ? '#FF3B30' : (later ? '#3A3A3A' : '#FFFFFF'), badgeFg: hot ? '#FFFFFF' : (later ? '#EDEDED' : '#0A0A0A') });
    });

    // Countdown to the first summit (San Francisco, Oct 31 2026, 09:00 PDT)
    var target = Date.UTC(2026, 9, 31, 16, 0, 0);
    var diff = Math.max(0, target - Date.now());
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    var d = Math.floor(diff / 86400000), h = Math.floor(diff / 3600000) % 24, m = Math.floor(diff / 60000) % 60, sec = Math.floor(diff / 1000) % 60;

    var seats = [];
    for (var i = 0; i < 40; i++) {
      seats.push({ c: 'sx-seat', style: 'animation-delay: ' + (i * 0.075).toFixed(2) + 's; background: transparent;' });
    }

    var ops = [
      { name: 'Shell', role: 'Global Energy • Upstream AI', logo: '/public/x/img/logo-shell.png', h: '44px' },
      { name: 'U.S. Air Force', role: 'Rapid Sustainment • Defense Ops', logo: '/public/x/img/logo-us-air-force.png', h: '44px' },
      { name: 'Baker Hughes', role: 'Energy Tech • Industrial AI', logo: '/public/x/img/logo-baker-hughes.png', h: '28px' },
      { name: 'Con Edison', role: 'Grid Reliability • NYC Metro', logo: '/public/x/img/logo-con-edison.png', h: '28px' },
      { name: 'Holcim', role: 'Global Building Materials • Plants', logo: '/public/x/img/logo-holcim.png', h: '28px' },
      { name: 'Dept of Defense', role: 'Predictive Readiness • Logistics', logo: '/public/x/img/logo-dla.png', h: '48px' },
      { name: 'Koch Industries', role: 'Manufacturing • Supply Chains', logo: '/public/x/img/logo-koch.png', h: '24px' },
      { name: 'SmithRx', role: 'Health Tech • Pharmacy Data', logo: '/public/x/img/logo-smithrx.png', h: '30px' }
    ];

    return {
      motionClass: motion ? '' : 'sx-still',
      hrefHome: EXPORT ? '/' : 'Main.dc.html',
      hrefContact: EXPORT ? '/contact' : 'Legal.dc.html',
      hrefResidency: EXPORT ? '/residency' : 'Residency.dc.html',
      mobileNav: [['Home', EXPORT ? '/' : 'Main.dc.html'], ['Calendar', '#calendar'], ['Residency', EXPORT ? '/residency' : 'Residency.dc.html'], ['Request Invite', '#apply'], ['Contact', EXPORT ? '/contact' : 'Legal.dc.html']].map(function (x) { return { label: x[0], href: x[1] }; }),
      legalLinks: [['about', 'About Us'], ['contact', 'Contact Us'], ['terms', 'Terms & Conditions'], ['privacy', 'Privacy Policy'], ['delivery-policy', 'Service Delivery Policy']].map(function (x, i, a) { return { label: x[1], href: EXPORT ? '/' + x[0] : 'Legal.dc.html', more: i < a.length - 1 }; }),
      countdownLabel: diff > 0 ? 'CIRCUIT OPENS · SAN FRANCISCO · OCT 31' : 'CIRCUIT IN SESSION',
      countdown: [{ k: 'DAYS', v: pad(d) }, { k: 'HOURS', v: pad(h) }, { k: 'MIN', v: pad(m) }, { k: 'SEC', v: pad(sec) }],
      heroStats: [{ v: '9', k: 'Summits' }, { v: '3', k: 'Circuits' }, { v: '40', k: 'Seats each' }, { v: '360', k: 'Total seats' }],
      seats: seats,
      protocols: [
        { n: '01', title: 'Strict Chatham House Rule', body: 'Participants may use the information and code strategies received, but neither the identity nor the affiliation of the speaker or any participant may be revealed. Absolute operational candor is required.' },
        { n: '02', title: 'Zero Slide Decks & Pitches', body: 'No vendor pitches or marketing narratives. Every session starts from a real operational problem: downtime, quality, energy, safety. It ends with a use case and the data it needs.' },
        { n: '03', title: 'Industry Leaders Only', body: 'Strictly capped at 40 participants per summit: operations, engineering, plant and digital leaders from manufacturing, oil & gas and energy companies, alongside STAGE-X engineers.' }
      ],
      mapCities: [
        { name: 'San Francisco', short: 'OCT 31', x: 27, y: 79, lx: 27, ly: 106, dy: 119, anchor: 'start' },
        { name: 'New York', short: 'NOV 07', x: 200, y: 69, lx: 206, ly: 96, dy: 109, anchor: 'start' },
        { name: 'Boston', short: 'NOV 14', x: 210, y: 63, lx: 226, ly: 52, dy: 65, anchor: 'start' },
        { name: 'Toronto', short: 'NOV 21', x: 181, y: 58, lx: 172, ly: 30, dy: 43, anchor: 'end' },
        { name: 'London', short: 'NOV 28', x: 464, y: 30, lx: 456, ly: 58, dy: 71, anchor: 'end' },
        { name: 'Berlin', short: 'DEC 05', x: 512, y: 27, lx: 522, ly: 52, dy: 65, anchor: 'start' },
        { name: 'Mumbai', short: 'DEC 05', x: 725, y: 146, lx: 738, ly: 172, dy: 185, anchor: 'start' },
        { name: 'Melbourne', short: 'DEC 12', x: 982, y: 349, lx: 970, ly: 334, dy: 321, anchor: 'end' },
        { name: 'Dubai', short: '2027', x: 662, y: 124, lx: 650, ly: 150, dy: 163, anchor: 'end' }
      ],
      phases: [
        { label: 'PHASE 01', name: 'North American Frontier', when: 'Oct 31 – Nov 15, 2026 • SF, NYC, Boston', focus: 'Energy transition, city power grids & advanced manufacturing.', stroke: '#FFFFFF', anchor: '#circuit-1' },
        { label: 'PHASE 02', name: 'Transatlantic Corridor', when: 'Nov 21 – Dec 6, 2026 • Toronto, London, Berlin', focus: 'Process manufacturing, offshore oil, gas & wind, and automotive plants.', stroke: '#BDBDBD', anchor: '#circuit-2' },
        { label: 'PHASE 03', name: 'Middle East & APAC', when: 'Dec 5 – Dec 12, 2026 • Mumbai, Melbourne · Dubai 2027', focus: 'Refining & power, mining, and upstream oil & gas.', stroke: '#8A8A8A', anchor: '#circuit-3' }
      ],
      circuits: [
        { id: 'circuit-1', label: 'CIRCUIT PHASE 01 • Q4 2026', name: 'North American Frontier', focus: 'AI use cases for renewables and grid storage, city power grids, and advanced manufacturing.', meta: '3 SUMMITS • 120 TOTAL SEATS', cities: cities.slice(0, 3) },
        { id: 'circuit-2', label: 'CIRCUIT PHASE 02 • Q4 2026', name: 'Transatlantic & European Corridor', focus: 'AI use cases for steel and chemicals plants, offshore oil, gas and wind, and automotive manufacturing.', meta: '3 SUMMITS • 120 TOTAL SEATS', cities: cities.slice(3, 6) },
        { id: 'circuit-3', label: 'CIRCUIT PHASE 03 • DEC 2026 – 2027', name: 'Asia-Pacific & Middle East', focus: 'AI use cases for refineries and power plants, mining operations, and upstream oil and gas.', meta: '3 SUMMITS • 120 TOTAL SEATS', cities: cities.slice(6, 9) }
      ],
      agenda: [
        { n: '01', track: 'USE-CASE DISCOVERY', title: 'Where AI Pays Off in Your Operations', body: 'Plant, field and control-room leaders map their biggest operational problems (downtime, quality, energy, safety) and rank where AI can help first.' },
        { n: '02', track: 'DATA READINESS', title: 'What Data Each Use Case Needs', body: 'A practical look at historians, SCADA, maintenance systems and ERP data: what is usable today, what is missing, and how to close the gap.' },
        { n: '03', track: 'RESIDENCY DEMOS', title: 'Prototypes Built on Real Use Cases', body: 'STAGE-X Residency teams present the prototypes they built during the 1–2 week sprint, around use cases from the companies in the room.' },
        { n: '04', track: 'FROM USE CASE TO PILOT', title: 'Planning a Pilot That Reaches Production', body: 'Scoping a first pilot: how success is measured, the team it needs, security and safety requirements, and how to take it from one site to many.' }
      ],
      opsLoop: ops.concat(ops),
      labs: [
        { name: 'OpenAI', models: 'GPT-4o / o1 Architecture' },
        { name: 'Anthropic', models: 'Claude 3.5 Sonnet / Opus' },
        { name: 'Google DeepMind', models: 'Gemini 1.5 Pro / Flash' },
        { name: 'Meta AI', models: 'Llama 3.1 405B / 70B' },
        { name: 'DeepSeek', models: 'DeepSeek-V3 / R1 MoE' },
        { name: 'Mistral AI', models: 'Mistral Large 2 / Pixtral' }
      ],
      channels: [
        { name: 'Lu.ma', tag: 'EXECUTIVE CALENDAR • MOBILE PASSES', body: 'Direct RSVP synchronization for executive guests. Automated integration with Google Calendar, Outlook 365, and Apple Wallet. Private peer guest directories vetted under Chatham House Rule credentials.', points: ['Instant Calendar Hold • Direct Google & Outlook .ics Sync', 'Confidential Guest List Verification • No Public Scraping', 'Direct Executive Mobile Pass QR • On-Site Biometric Check-in'], cta: 'View Summits on Lu.ma', href: 'https://lu.ma' },
        { name: 'Eventbrite', tag: 'CORPORATE PROCUREMENT • INVOICING • PO', body: 'Institutional purchasing pathways for enterprise organizations, public sector entities, and defense contractors. Streamlined vendor compliance, Net 30 corporate PO invoicing, and centralized expense auditing.', points: ['Enterprise PO & Institutional Invoicing Compliance', 'Multi-Seat Enterprise Delegation & Group Billing Passes', 'Centralized Tax Receipting & W-9 / Vendor Packets'], cta: 'View Summits on Eventbrite', href: 'https://www.eventbrite.com' }
      ],
      formOptions: [
        { v: 'sf', label: 'San Francisco • October 31 – November 1, 2026 (Energy Transition & Utilities)' },
        { v: 'nyc', label: 'New York • November 7–8, 2026 (Power Grids & Utilities)' },
        { v: 'boston', label: 'Boston • November 14–15, 2026 (Advanced Manufacturing)' },
        { v: 'toronto', label: 'Toronto • November 21–22, 2026 (Process Manufacturing)' },
        { v: 'london', label: 'London • November 28–29, 2026 (Offshore Oil, Gas & Wind)' },
        { v: 'berlin', label: 'Berlin • December 5–6, 2026 (Automotive & Industrial Manufacturing)' },
        { v: 'mumbai', label: 'Mumbai • December 5, 2026 (Refining, Petrochemicals & Power)' },
        { v: 'melbourne', label: 'Melbourne • December 12, 2026 (Mining & Resources)' },
        { v: 'dubai', label: 'Dubai • 2027, date to be announced (Upstream Oil & Gas)' }
      ],
      industries: [
        { name: 'Manufacturing', img: '/public/x/img/factory.jpg', who: 'Automotive, machinery, steel, chemicals and materials makers looking for AI that holds up on the shop floor.', cases: ['Vision-based quality inspection', 'Predictive maintenance on lines and robots', 'Energy use per unit of output', 'Early warning of supply disruptions'], cities: 'Boston, Toronto, Berlin' },
        { name: 'Oil & Gas', img: '/public/x/img/refinery.jpg', who: 'Upstream producers, offshore operators, refineries and petrochemical complexes with large, remote or hazardous assets.', cases: ['Well and production optimisation', 'Pipeline leak and corrosion detection', 'Drone and subsea inspection review', 'Furnace, boiler and equipment reliability'], cities: 'London, Dubai, Mumbai' },
        { name: 'Energy & Utilities', img: '/public/x/img/controlroom.jpg', who: 'Power producers, grid operators, renewables and storage companies, and mining operations with heavy energy needs.', cases: ['Demand and renewable output forecasting', 'Transformer and cable failure prediction', 'Faster outage response', 'Heavy equipment health at remote sites'], cities: 'San Francisco, New York, Melbourne' }
      ],
      takeaways: [
        { n: '01', t: 'A ranked shortlist of AI use cases for your operations' },
        { n: '02', t: 'The data each one needs, and what you already have' },
        { n: '03', t: 'Prototypes to react to, and a plan for a first pilot' }
      ],
      sent: !!s.sent,
      notSent: !s.sent,
      formStatus: s.sent ? 'RECEIVED' : 'SECURE',
      submit: function (e) { if (e && e.preventDefault) e.preventDefault(); self.setState({ sent: true }); },
      reset: function () { self.setState({ sent: false }); }
    };
  }
}
