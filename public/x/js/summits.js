class Component extends DCLogic {
  componentDidMount() { this._t = setInterval(() => this.forceUpdate(), 1000); }
  componentWillUnmount() { clearInterval(this._t); }

  renderVals() {
    var self = this;
    var s = this.state || {};
    var motion = this.props.motion ?? true;
    var EXPORT = typeof SX_EXPORT !== 'undefined';
    var cityHref = function (slug) { return EXPORT ? '/summits/' + slug + '-2026.html' : 'Summit.dc.html'; };
    var IMG = {
      sf: '/public/x/img/summit-sf.jpg', nyc: '/public/x/img/summit-nyc.jpg', boston: '/public/x/img/summit-boston.jpg',
      toronto: '/public/x/img/summit-toronto.jpg', london: '/public/x/img/summit-london.jpg', berlin: '/public/x/img/summit-berlin.jpg',
      dubai: '/public/x/img/summit-dubai.jpg', mumbai: '/public/x/img/summit-mumbai.jpg', melbourne: '/public/x/img/summit-melbourne.jpg'
    };
    var cities = [
      { slug: 'sf', name: 'San Francisco', dates: 'October 31–November 1, 2026', venue: 'The Presidio', status: '12 Seats Left', title: 'San Francisco — Air-Gapped Frontier Model Orchestration & Sovereign Weights', desc: 'Examining isolated on-premises deployments of 70B+ and MoE frontier models in classified, defense, and sovereign enterprise environments without cloud connectivity.', tags: ['Air-Gapped', 'Zero-Trust VPC', 'Defense Tech'], alt: 'Golden Gate Bridge and San Francisco at dusk' },
      { slug: 'nyc', name: 'New York', dates: 'November 7–8, 2026', venue: 'Hudson Yards', status: 'Applications Open', title: 'New York — Deterministic Latency & High-Throughput Energy / Financial Inference', desc: 'Architecture teardowns of sub-50ms TTFT under extreme concurrent load. Integration patterns across legacy SCADA, power grids (Con Edison, Shell), and institutional trading systems.', tags: ['Sub-50ms TTFT', 'Grid Telemetry', 'Trading Infra'], alt: 'Hudson Yards and the Manhattan skyline at night' },
      { slug: 'boston', name: 'Boston', dates: 'November 14–15, 2026', venue: 'Kendall Square', status: 'Applications Open', title: 'Boston — Frontier Deep Tech, Bio-Pharma Reasoning & Physical AI Robotics', desc: 'Deploying multimodal frontier models in regulated biomedical research, high-throughput automated laboratory discovery, and real-time physical robotics control loops.', tags: ['Bio-Pharma', 'FDA 21 CFR 11', 'Physical AI'], alt: 'Boston skyline across the Charles River from Cambridge' },
      { slug: 'toronto', name: 'Toronto', dates: 'November 21–22, 2026', venue: 'MaRS Discovery District', status: 'Applications Open', title: 'Toronto — Cross-Border Enterprise Compute & Sovereign North American Mesh', desc: 'Architectural topologies for multi-national financial institutions navigating cross-border data sovereignty, PIPEDA / SOC2 boundaries, and distributed hybrid inference.', tags: ['PIPEDA', 'Hybrid Mesh', 'Banking Core'], alt: 'Toronto skyline with the CN Tower at blue hour' },
      { slug: 'london', name: 'London', dates: 'November 28–29, 2026', venue: 'Canary Wharf', status: 'Applications Open', title: 'London — EU AI Act Compliance, Data Sovereignty & Heavy Industrial Edge', desc: 'Deploying frontier models directly onto industrial plant hardware and edge compute clusters (Holcim, Baker Hughes) with strict immutable audit trails and zero data egress.', tags: ['EU AI Act', 'Industrial Edge', 'Zero Egress'], alt: 'Canary Wharf towers reflected in the docks at night' },
      { slug: 'berlin', name: 'Berlin', dates: 'December 5–6, 2026', venue: 'Factory Berlin', status: 'Applications Open', title: 'Berlin — Industrial SCADA Automation, Automotive Edge & Hardware Security', desc: 'Real-time model inference embedded into automotive assembly lines, robotic manufacturing cells, and safety-critical industrial SCADA controllers.', tags: ['Automotive Edge', 'SCADA RT', 'Safety Controls'], alt: 'Berlin TV tower and the Spree river at blue hour' },
      { slug: 'dubai', name: 'Dubai', dates: 'December 12–13, 2026', venue: 'DIFC & Museum of the Future', status: 'Applications Open', title: 'Dubai — Sovereign Energy Grids, Upstream Oil & Gas Telemetry & High-Cap Compute', desc: 'High-density frontier model infrastructure powering remote oil rigs, regional sovereign cloud enclaves, and autonomous desalination & microgrid balancing.', tags: ['Upstream Energy', 'Sovereign Enclave', 'Desalination'], alt: 'Dubai skyline with the Museum of the Future at dusk' },
      { slug: 'mumbai', name: 'Mumbai', dates: 'December 19–20, 2026', venue: 'Jio World Convention Centre', status: 'Applications Open', title: 'Mumbai — Hyper-Scale BFSI Transaction Gateways & Sovereign Telecom AI Stacks', desc: 'High-throughput reasoning architectures handling billions of daily real-time UPI and telecom telemetry transactions with zero downtime and strict domestic data localization.', tags: ['UPI Telemetry', 'RBI Compliance', '5G Stacks'], alt: 'Mumbai skyline and the Bandra-Worli Sea Link at night' },
      { slug: 'melbourne', name: 'Melbourne', dates: 'December 26–27, 2026', venue: 'MCEC South Wharf', status: 'Applications Open', title: 'Melbourne — Autonomous Heavy Mining Fleets, Natural Resources & Remote Edge Compute', desc: 'Ruggedized edge AI compute powering autonomous haulage trucks, sub-surface seismic exploration models, and isolated mine site orchestration.', tags: ['Autonomous Fleets', 'Seismic Models', 'Mining AI'], alt: 'Melbourne skyline and South Wharf on the Yarra at dusk' }
    ].map(function (c, i) {
      var hot = c.status.indexOf('Seats') !== -1;
      return Object.assign({}, c, { img: IMG[c.slug], href: cityHref(c.slug), stop: i + 1, badgeBg: hot ? '#FF3B30' : '#FFFFFF', badgeFg: hot ? '#FFFFFF' : '#0A0A0A' });
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
      countdownLabel: diff > 0 ? 'CIRCUIT OPENS · SAN FRANCISCO · OCT 31' : 'CIRCUIT IN SESSION',
      countdown: [{ k: 'DAYS', v: pad(d) }, { k: 'HOURS', v: pad(h) }, { k: 'MIN', v: pad(m) }, { k: 'SEC', v: pad(sec) }],
      heroStats: [{ v: '9', k: 'Summits' }, { v: '3', k: 'Circuits' }, { v: '40', k: 'Seats each' }, { v: '360', k: 'Total seats' }],
      seats: seats,
      protocols: [
        { n: '01', title: 'Strict Chatham House Rule', body: 'Participants are free to use the information and code strategies received, but neither the identity nor the affiliation of the speaker or any participant may be revealed. Absolute operational candor is required.' },
        { n: '02', title: 'Zero Slide Decks & Pitches', body: 'No vendor pitches, marketing narratives, or high-level hypotheticals. Every session centers on architecture diagrams, kernel optimization profiles, latency traces, and live infrastructure code.' },
        { n: '03', title: 'Principals & Builders Only', body: 'Strictly capped at 40 participants per summit. Attendees must hold direct technical authority over mission-critical enterprise compute, forward deployment teams, or frontier model engineering stacks.' }
      ],
      mapCities: [
        { name: 'San Francisco', short: 'OCT 31', x: 27, y: 79, lx: 27, ly: 106, dy: 119, anchor: 'start' },
        { name: 'New York', short: 'NOV 07', x: 200, y: 69, lx: 206, ly: 96, dy: 109, anchor: 'start' },
        { name: 'Boston', short: 'NOV 14', x: 210, y: 63, lx: 226, ly: 52, dy: 65, anchor: 'start' },
        { name: 'Toronto', short: 'NOV 21', x: 181, y: 58, lx: 172, ly: 30, dy: 43, anchor: 'end' },
        { name: 'London', short: 'NOV 28', x: 464, y: 30, lx: 456, ly: 58, dy: 71, anchor: 'end' },
        { name: 'Berlin', short: 'DEC 05', x: 512, y: 27, lx: 522, ly: 52, dy: 65, anchor: 'start' },
        { name: 'Dubai', short: 'DEC 12', x: 662, y: 124, lx: 650, ly: 150, dy: 163, anchor: 'end' },
        { name: 'Mumbai', short: 'DEC 19', x: 725, y: 146, lx: 738, ly: 172, dy: 185, anchor: 'start' },
        { name: 'Melbourne', short: 'DEC 26', x: 982, y: 349, lx: 970, ly: 334, dy: 321, anchor: 'end' }
      ],
      phases: [
        { label: 'PHASE 01', name: 'North American Frontier', when: 'Oct 31 – Nov 15, 2026 • SF, NYC, Boston', focus: 'Air-gapped defense, grid telemetry & bio-pharma physical robotics.', stroke: '#FFFFFF', anchor: '#circuit-1' },
        { label: 'PHASE 02', name: 'Transatlantic Corridor', when: 'Nov 21 – Dec 6, 2026 • Toronto, London, Berlin', focus: 'Cross-border banking mesh, EU AI Act compliance & industrial SCADA.', stroke: '#BDBDBD', anchor: '#circuit-2' },
        { label: 'PHASE 03', name: 'Middle East & APAC', when: 'Dec 12 – Dec 27, 2026 • Dubai, Mumbai, Melbourne', focus: 'Sovereign national LLM clusters, hyper-scale BFSI & remote mining fleets.', stroke: '#8A8A8A', anchor: '#circuit-3' }
      ],
      circuits: [
        { id: 'circuit-1', label: 'CIRCUIT PHASE 01 • Q4 2026', name: 'North American Frontier', focus: 'Air-gapped defense architectures, sub-millisecond financial telemetry, and bio-pharma physical robotics.', meta: '3 SUMMITS • 120 TOTAL SEATS', cities: cities.slice(0, 3) },
        { id: 'circuit-2', label: 'CIRCUIT PHASE 02 • Q4 2026', name: 'Transatlantic & European Corridor', focus: 'Cross-border sovereign data mesh, EU AI Act compliance pipelines, and automotive SCADA automation.', meta: '3 SUMMITS • 120 TOTAL SEATS', cities: cities.slice(3, 6) },
        { id: 'circuit-3', label: 'CIRCUIT PHASE 03 • Q4 2026', name: 'Middle East & Asia-Pacific Expansion', focus: 'National sovereign LLM clusters, hyper-scale real-time transaction gateways, and remote industrial edge fleets.', meta: '3 SUMMITS • 120 TOTAL SEATS', cities: cities.slice(6, 9) }
      ],
      agenda: [
        { n: '01', track: 'MODEL QUANTIZATION & KERNEL TUNING', title: 'FP8 / FP4 Serving Without Accuracy Degradation', body: 'Deep dive into real-world benchmarks contrasting native FP16 execution with vLLM, TensorRT-LLM, and SGLang FP8 kernels across enterprise reasoning workloads. Live telemetry on GPU memory pressure and cache eviction.' },
        { n: '02', track: 'ADVERSARIAL HARDENING', title: 'Eliminating Non-Deterministic Hallucinations in Critical Ops', body: 'Hard-constraint decoding, grammar-constrained sampling, and formal verification frameworks for frontier model outputs deployed in defense, energy grid balancing, and predictive healthcare pipelines.' },
        { n: '03', track: 'ENTERPRISE VPC TOPOLOGY', title: 'Zero-Trust Cross-Boundary Frontier Model Gateway', body: 'Reference architectures for embedding OpenAI, Anthropic, Google DeepMind, and open-weight models into multi-tenant VPCs with hardware security modules (HSMs) and zero plain-text data logging.' },
        { n: '04', track: 'TCO & MODEL GOVERNANCE', title: 'Frontier Open Source vs. Closed Lab APIs: The 2026 Audit', body: 'Comprehensive capital expenditure and operational expenditure audit: training/fine-tuning cluster costs vs. token-based cloud bills at 100M+ tokens/day scale with full IP ownership.' }
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
        { v: 'sf', label: 'San Francisco • October 31 – November 1, 2026 (Air-Gapped & Sovereign)' },
        { v: 'nyc', label: 'New York • November 7-8, 2026 (Latency & Critical Infra)' },
        { v: 'boston', label: 'Boston • November 14-15, 2026 (Bio-ML & Autonomous Robotics)' },
        { v: 'toronto', label: 'Toronto • November 21-22, 2026 (Vector Search & Distributed Training)' },
        { v: 'london', label: 'London • November 28-29, 2026 (EU AI Act & Heavy Industrial)' },
        { v: 'berlin', label: 'Berlin • December 5-6, 2026 (Embedded Systems & Edge Telemetry)' },
        { v: 'dubai', label: 'Dubai • December 12-13, 2026 (National LLM Clusters & Sovereign Compute)' },
        { v: 'mumbai', label: 'Mumbai • December 19-20, 2026 (High-Concurrency Voice Agents & Real-Time Scale)' },
        { v: 'melbourne', label: 'Melbourne • December 26-27, 2026 (Decentralized AI Networks & Resilient Grids)' }
      ],
      sent: !!s.sent,
      notSent: !s.sent,
      formStatus: s.sent ? 'RECEIVED' : 'SECURE',
      submit: function (e) { if (e && e.preventDefault) e.preventDefault(); self.setState({ sent: true }); },
      reset: function () { self.setState({ sent: false }); }
    };
  }
}
