class Component extends DCLogic {
  get s() { return this.state || {}; }

  chip(on) {
    return on
      ? 'border: 1px solid #FFFFFF; background: #FFFFFF; color: #0A0A0A;'
      : 'border: 1px solid #3A3A3A; background: rgba(15,15,15,0.85); color: #EDEDED;';
  }

  renderVals() {
    var self = this;
    var s = this.s;
    var accent = this.props.accent ?? '#FFFFFF';
    var motion = this.props.motion ?? true;
    var hideSummits = Date.now() < Date.parse('2026-10-24T11:00:00Z');
    var openRow = s.openRow === undefined ? 0 : s.openRow;
    var openFaq = s.openFaq === undefined ? 0 : s.openFaq;
    var zone = s.zone || 'scif';
    var ingest = s.ingest || 'opc-ua';
    var egress = s.egress || 'drop_all';
    var sent = !!s.sent;

    var operators = [
      { name: 'Shell', sector: 'GLOBAL ENERGY', logo: '/public/x/img/logo-shell.png', h: '48px' },
      { name: 'U.S. Air Force', sector: 'DEFENSE & AEROSPACE', logo: '/public/x/img/logo-us-air-force.png', h: '48px' },
      { name: 'Baker Hughes', sector: 'ENERGY TECHNOLOGY', logo: '/public/x/img/logo-baker-hughes.png', h: '30px' },
      { name: 'Con Edison', sector: 'POWER & UTILITIES', logo: '/public/x/img/logo-con-edison.png', h: '30px' },
      { name: 'Holcim', sector: 'BUILDING MATERIALS', logo: '/public/x/img/logo-holcim.png', h: '30px' },
      { name: 'U.S. DoD', sector: 'JOINT STRIKE FIGHTER F-35', logo: '/public/x/img/logo-dla.png', h: '52px' },
      { name: 'Koch Industries', sector: 'ADVANCED MANUFACTURING', logo: '/public/x/img/logo-koch.png', h: '26px' },
      { name: 'Duke Energy', sector: 'POWER & UTILITIES', logo: '/public/x/img/logo-duke-energy.png', h: '40px' }
    ];
    var ticker = [
      { k: 'P99 JITTER', v: '11.8ms' }, { k: 'COLD TTFT', v: '74ms' }, { k: 'EGRESS', v: '0 B · drop_all' },
      { k: 'FLEET READINESS', v: '+25%' }, { k: 'REQUISITION', v: '3m 48s' }, { k: 'AUDIT STREAM', v: 'APPEND-ONLY' },
      { k: 'OPC-UA', v: 'SECURE CHANNEL' }, { k: 'SAP RFC', v: '500 jobs / 15 min' }, { k: 'UPTIME', v: '99.2%' }
    ];
    var reports = [
      { ref: 'ENV-REF: TIER-1 POWER GRID HARMONIC DRIFT', sev: 'SEV-2', title: 'Root cause analysis & deployment cutover', lead: 'Harmonic distortion on the 138kV feeder peaked during the overnight EV charging window. Two prior vendors routed inference to a hosted endpoint the compliance boundary forbids. We moved the gateway onto a', secret: 'PrivateLink endpoint inside the client VPC', tail: 'and ran the balancing loop in shadow mode for 40 minutes before letting it write.', cutover: '02:14 local · feeder outage window', boundary: 'Hosted endpoint → in-VPC PrivateLink, drop_all', owner: 'Client grid ops · 18 months AMI replay' },
      { ref: 'ENV-REF: DEPOT TURNOVER QUEUE SATURATION', sev: 'SEV-3', title: 'Retrieval latency & read-hostile document corpus', lead: 'The depot was retrieval-bound, not compute-bound: forty years of technical orders OCR’d into scanned PDFs. We quantized weights to FP8 GGUF and built a', secret: 'hybrid BM25 + HNSW index on depot storage', tail: 'with egress pinned at the kernel. Maintainers ran the last three rebuilds unsupervised.', cutover: 'Weekend window · four-hour build', boundary: 'Hosted vector store → local hybrid index', owner: 'Client depot maintainers' },
      { ref: 'ENV-REF: PLANT EDGE CONTROL LOOP INTERLOCK', sev: 'SEV-2', title: 'Real-time control integration & interlock handover', lead: 'The kiln runs at 1,400°C and cannot pause for an untested control path. The model reads a', secret: 'read-only OPC-UA subscription and only proposes', tail: '— the existing interlocks decide. Every proposal was shadowed against lab tolerances first.', cutover: '02:40 local · refractory inspection', boundary: 'Bidirectional assumption → propose-only writes', owner: 'Client process engineers' }
    ];

    var log = [
      { version: 'v2.4.1', date: '2026-03-14', env: 'OSIsoft PI / Deepwater Fleet', problem: 'No predictive intervention on 10,000+ rotating assets', result: '72h lead · 99.2% uptime', notes: 'Streaming consumers were written directly against the PI archive rather than polling it, cutting historian read pressure by an order of magnitude so acoustic models score every channel. The edge cluster writes a scored anomaly, not an alert — operators wake up to a ranked list.', runtime: 'Edge inference on turbine-mounted nodes', egress: 'Store-and-forward over leased line', owner: 'Client reliability team' },
      { version: 'v2.3.7', date: '2026-01-22', env: 'AWS PrivateLink / 5M AMI Meters', problem: 'Harmonic drift from EV fast-charging and reverse power flow', result: 'sub-50ms TTFT · 10s loop', notes: 'State estimation was rewritten as a bounded, event-triggered pass that wakes on a topology or setpoint event rather than a fixed cadence. Routing stays inside the VPC, so feeder telemetry never crosses a public endpoint.', runtime: 'Deterministic state estimation + safety interlock', egress: 'PrivateLink endpoint only, zero retention', owner: 'Client grid operations' },
      { version: 'v2.2.9', date: '2025-11-08', env: 'SAP NetWeaver / S/4HANA', problem: '100,000+ purchase-order line items trapped in ERP silos', result: '88% faster · $100M+ surfaced', notes: 'Native BAPI and RFC connectors replace nightly file drops, so line items reconcile the day they are raised. Verification guardrails flag a discrepancy and cite the exact field, making output usable by procurement without review.', runtime: 'On-prem document reasoning in client SAP', egress: 'None — weights in client private repo', owner: 'Procurement operations' },
      { version: 'v2.2.3', date: '2025-09-30', env: 'Ruggedized Plant Edge / OPC-UA', problem: '1,400°C kiln fuel composition and draft instability', result: '40% less downtime · 3.2% fuel', notes: 'The control model proposes feeder rates and draft speed to the existing PLC and never writes to it. Every proposal passes a lab-tolerance check first, so the kiln keeps its own interlocks.', runtime: 'Control-room node, read-only OPC-UA', egress: 'Hardened telemetry tunnel, closed by default', owner: 'Client process engineers' },
      { version: 'v2.1.8', date: '2025-08-19', env: 'Confidential Enclave / HIPAA', problem: 'Manual clinician review against formulary criteria', result: '10x throughput · 100% audit', notes: 'PHI is stripped at the ingestion boundary and never reaches the model. Every adjudication emits a signed receipt an auditor can replay without re-running inference.', runtime: 'Zero-retention reasoning in confidential compute', egress: 'None — de-identified claims only', owner: 'Client formulary team' }
    ];

    var faqs = [
      { q: 'What is a Forward Deployed AI Engineer (FDE)?', a: 'An FDE embeds directly inside your engineering and operations teams to integrate, optimize and harden frontier AI systems inside existing mission-critical infrastructure. Stage-X engineers write production code, remove inference bottlenecks, build telemetry harnesses and are retained for verifiable production outcomes.' },
      { q: 'How do you integrate frontier LLMs into legacy systems?', a: 'Through zero-egress, air-gapped or hybrid inference bridges using Model Context Protocol and industrial connectors (OPC-UA, Modbus, OSIsoft PI, SAP RFC). Model actions pass through guardrail interlocks with read-only scopes and explicit propose-only write paths.' },
      { q: 'How do you design production-grade RAG and agentic workflows?', a: 'Hybrid vector-graph indexing, chunk-level provenance, strict context compaction and fallback escalation circuits. Tool-calling permissions are scoped per microservice, preventing uncontrolled multi-hop loops.' },
      { q: 'Is the runtime really open source?', a: 'Yes. The deployment runtime, connectors and orchestration harness are dual-licensed under MIT and Apache 2.0, fully self-hostable, and never license-check or call home at run time.' }
    ];

    var zoneOpts = [
      { id: 'scif', label: 'SCIF / Air-Gap', sub: 'No WAN path. Media carry-in, SBOM verified.' },
      { id: 'privatelink', label: 'PrivateLink / GovCloud', sub: 'VPC-peered endpoint only.' },
      { id: 'plant-floor', label: 'On-Prem Plant Floor', sub: 'Read-only subscription, propose-only writes.' },
      { id: 'hybrid-vpc', label: 'Hybrid VPC', sub: 'Hardened telemetry tunnel, closed by default.' }
    ];
    var ingestOpts = ['OSIsoft PI', 'OPC-UA', 'Modbus/TCP', 'SAP BAPI/RFC', 'Kafka'];
    var egressOpts = [
      { id: 'drop_all', sub: 'Discarded at the kernel in netfilter.' },
      { id: 'encrypted_tunnel', sub: 'Single hardened path, closed by default.' },
      { id: 'vpc_peered', sub: 'No internet-bound route at all.' }
    ];
    var subOn = 'color: #3A3A3A;';
    var subOff = 'color: #9A9A9A;';

    var EXPORT = typeof SX_EXPORT !== 'undefined';
    return {
      accent: accent,
      motionClass: motion ? '' : 'sx-still',
      showSummits: !hideSummits,
      hrefSummits: EXPORT ? '/summits.html' : 'Summits.dc.html',
      hrefContact: EXPORT ? '/contact' : 'Legal.dc.html',
      hrefResidency: EXPORT ? '/residency' : 'Residency.dc.html',
      mobileNav: (hideSummits ? [] : [['Summits', EXPORT ? '/summits.html' : 'Summits.dc.html']]).concat([['Residency', EXPORT ? '/residency' : 'Residency.dc.html'], ['Field Missions', '#missions'], ['Open Source', '#opensource'], ['About', EXPORT ? '/about' : 'Legal.dc.html'], ['Contact', EXPORT ? '/contact' : 'Legal.dc.html']]).map(function (x) { return { label: x[0], href: x[1] }; }),
      legalLinks: [['about', 'About Us'], ['contact', 'Contact Us'], ['terms', 'Terms & Conditions'], ['privacy', 'Privacy Policy'], ['delivery-policy', 'Service Delivery Policy']].map(function (x, i, a) { return { label: x[1], href: EXPORT ? '/' + x[0] : 'Legal.dc.html', more: i < a.length - 1 }; }),
      heroStats: [
        { value: '+25%', label: 'Fleet mission readiness, 90 days post-cutover' },
        { value: '< 4 min', label: 'Part requisition, down from 72 hours' },
        { value: '0 bytes', label: 'Classified data egress, enforced at the kernel' },
        { value: '< 80ms', label: 'Cold-start TTFT inside a SCIF air gap' }
      ],
      operatorsLoop: operators.concat(operators),
      tickerLoop: ticker.concat(ticker),
      reports: reports,
      chevrons: [{ c: 'sx-chev' }, { c: 'sx-chev sx-c2' }, { c: 'sx-chev sx-c3' }, { c: 'sx-chev sx-c4' }, { c: 'sx-chev sx-c5' }, { c: 'sx-chev sx-c6' }],
      footerLoop: ['STAGE-X SPACE', 'FORWARD DEPLOYED', 'STAGE-X SPACE', 'FORWARD DEPLOYED'],
      principles: [
        { n: '01', title: 'No slide decks. No advisory handoffs.', body: 'Engineers embed with your engineering team and ship production code from week one.' },
        { n: '02', title: 'Stress-tested, then hardened.', body: 'We break it before it breaks production — fuzzing, egress pinning and rehearsed rollbacks.' },
        { n: '03', title: 'Paid for outcomes, not outputs.', body: 'Outcome-guaranteed deployment contracts measured at your serving boundary.' }
      ],
      environments: [
        { src: '/public/x/img/hangar.jpg', alt: 'Aircraft maintenance hangar', tag: 'DEFENSE & AEROSPACE', title: 'Air-gapped depots' },
        { src: '/public/x/img/refinery.jpg', alt: 'Industrial refinery at dusk', tag: 'ENERGY & PROCESS', title: 'Refineries & plant floors' },
        { src: '/public/x/img/datacenter.jpg', alt: 'Server racks in a secure data center', tag: 'SOVEREIGN COMPUTE', title: 'On-prem inference' },
        { src: '/public/x/img/controlroom.jpg', alt: 'Operators in a grid control room', tag: 'POWER & UTILITIES', title: 'Grid operations' }
      ],
      missionTags: ['vLLM / FP8', 'Local GGUF', 'Zero-Egress PrivateLink', 'OPC-UA Bridge'],
      missionSteps: [
        { n: '01', label: 'SITUATION', color: '#8A8A8A', body: 'Depots lost weeks per turnaround. Technical orders spanned 40 years across three incompatible document systems, logs were hand-keyed from paper, and the facility sat behind an air gap.' },
        { n: '02', label: 'BOTTLENECK', color: '#C8C8C8', body: 'Retrieval, not inference. Technicians lost 30–70 minutes to search over scanned PDFs with no semantic layer and no route to a hosted vector store from inside the SCIF.' },
        { n: '03', label: 'ARCHITECTURAL FIX', color: '#FFFFFF', body: 'Everything moved inside the perimeter: FP8 GGUF weights on local vLLM, a hybrid BM25 + HNSW index on depot storage, and egress pinned to drop_all at the kernel.' }
      ],
      missionMetrics: [
        { value: '+25%', label: 'Fleet mission readiness rate' },
        { value: '< 4 min', label: 'Part requisition & resolution' },
        { value: '0 bytes', label: 'Classified data egress' }
      ],
      fieldLog: log.map(function (r, i) {
        var open = openRow === i;
        return Object.assign({}, r, {
          open: open,
          chev: open ? '−' : '+',
          bg: open ? '#121212' : '#0F0F0F',
          toggle: function () { self.setState({ openRow: open ? -1 : i }); }
        });
      }),
      phases: [
        { n: '01', title: 'RECON', body: 'Enumerate every hop between historian and systems of record. Packet capture on the plant floor, a container scan of the exact image digest, one working path through the oldest protocol.', exit: 'one reproducible failure' },
        { n: '02', title: 'FUSION', body: 'Write the connector, not the wrapper. Native BAPI/RFC and OPC-UA adapters, Kafka and gRPC fan-in, weights moved into your private repository.', exit: 'repo owned by the client' },
        { n: '03', title: 'HARDENING', body: 'Red-team fuzzing against parser and index, egress pinned to drop_all at the kernel, and a rollback drill rehearsed with your on-call in the room.', exit: 'signed artifacts + SBOM' },
        { n: '04', title: 'TRAINING', body: 'Paired on-call until your operators hold the runbook, dashboards and incident channel. The handover is the deliverable.', exit: 'client runs the shift' }
      ],
      sla: [
        { label: 'P99 TELEMETRY JITTER', value: '< 12ms', spark: '0,30 20,26 40,34 60,22 80,28 100,18 120,30 140,20 160,26 180,16 200,24 220,14 240,22 260,12 280,18 300,10', body: 'Across OSIsoft PI streaming consumers, measured at the bridge under full historian write load.' },
        { label: 'COLD-START INFERENCE', value: '< 80ms', spark: '0,8 30,12 60,10 90,20 120,18 150,28 180,26 210,34 240,32 270,38 300,40', body: 'Time to first token on a cold process inside a SCIF. No warm cache, weights resident in local storage.' },
        { label: 'PROTOCOL COVERAGE', value: 'Native', spark: '0,40 50,40 50,28 110,28 110,18 170,18 170,10 230,10 230,4 300,4', body: 'SAP S/4HANA over BAPI/RFC, OPC-UA v1.04 with secure channel, Kafka/gRPC fan-in. No polling shims.' }
      ],
      licenses: [
        { title: 'MIT License', tag: 'PERMISSIVE', body: 'Embed inference pipelines into proprietary software with zero friction.' },
        { title: 'Apache 2.0 License', tag: 'ENTERPRISE SAFE', body: 'Explicit patent grant and trademark safeguards for legal review.' },
        { title: 'Zero Vendor Lock-In', tag: 'SOVEREIGNTY', body: 'Swap models freely; run on-prem, air-gapped or in private cloud with no platform fees.' }
      ],
      briefs: [
        { id: 'BRIEF-001', cat: 'AIR-GAPPED · 2026', title: 'Sovereign Weights: Quantized 405B-class models in zero-egress environments', body: 'Standing up 405B-class models on in-house GPU nodes with no cloud egress — and why the first month went into FP8 layouts and scheduler defaults.', meta: '25 pp · Tech Report', cta: 'READ PDF →', href: 'https://www.stage-x.space/briefs/brief-001.pdf' },
        { id: 'BRIEF-002', cat: 'HIGH-THROUGHPUT · 2025', title: 'Petabyte-scale telemetry fusion at rotating-asset fleets', body: 'Streaming vibrational and thermal waveforms into PI and SCADA historians for ~1,000 assets, documenting the full spread of lead times.', meta: '38 pp · Field Report', cta: 'READ PDF →', href: 'https://www.stage-x.space/briefs/brief-002.pdf' },
        { id: 'BRIEF-003', cat: 'LATENCY · 2026', title: 'Sub-50ms TTFT under extreme concurrent load', body: 'Holding a 50 ms first-token target across five million meter streams under a zero-retention constraint.', meta: '33 pp · Tech Report', cta: 'READ PDF →', href: 'https://www.stage-x.space/briefs/brief-003.pdf' },
        { id: 'BRIEF-004', cat: 'RESEARCH · 2026', title: 'Fuel-burn control loops in 1,400°C kiln combustion', body: 'Early results: single-digit fuel-burn reduction and unplanned stops down roughly a third. Paper in review.', meta: 'Forthcoming', cta: 'REQUEST ACCESS →', href: '#dispatch' },
        { id: 'BRIEF-005', cat: 'HARDENING · 2025', title: 'Zero-knowledge clinical reasoning in confidential enclaves', body: 'PHI stripped before ingestion, run inside an enclave and cross-checked against current formularies.', meta: '26 pp · Tech Report', cta: 'READ PDF →', href: 'https://www.stage-x.space/briefs/brief-005.pdf' }
      ],
      tiers: [
        { id: 'TIER 01', title: 'Hyperscaler & Silicon', sub: 'Kernel runtimes & interconnect constraints', items: [
          { cat: 'HYPERSCALER', name: 'Amazon Web Services', transport: 'HTTPS 443 → VPC endpoint ENI', rollback: 'DynamoDB point-in-time restore' },
          { cat: 'HYPERSCALER', name: 'Microsoft Azure', transport: 'Private Link, TLS 1.3', rollback: 'Local enclave checkpoint' },
          { cat: 'HYPERSCALER', name: 'Google Cloud', transport: 'gRPC / HTTP2 → PSC', rollback: 'Stateless client' },
          { cat: 'AI SILICON', name: 'NVIDIA', transport: 'Triton C++ · FP8 on SM90+', rollback: 'Refuses unsafe kernel fallback' }
        ] },
        { id: 'TIER 02', title: 'Platform & Mission-Critical', sub: 'Historian, DCS, PLC & ERP interfaces', items: [
          { cat: 'DCS', name: 'Emerson DeltaV', transport: 'OPC-DA, TCP 135, read-only', rollback: 'Unload the bridge' },
          { cat: 'DCS', name: 'Honeywell Experion', transport: 'OPC-UA 1.04.11, plant-CA cert', rollback: 'Last good controller set' },
          { cat: 'PLC', name: 'Siemens TIA Portal', transport: 'S7comm / OPC-UA, TCP 102', rollback: 'No PLC state change' },
          { cat: 'ERP', name: 'SAP', transport: 'RFC / BAPI, outbound-only', rollback: 'Rebuild CD view' },
          { cat: 'HISTORIAN', name: 'OSIsoft PI', transport: 'AF SDK event stream', rollback: 'Delete derived tag set' },
          { cat: 'DEFENSE', name: 'Lockheed Martin', transport: 'Classified enclave, media carry-in', rollback: 'Re-image signed baseline' },
          { cat: 'ENERGY', name: 'Baker Hughes', transport: 'OPC-UA, MODBUS/TCP 502', rollback: 'Idempotent buffer replay' }
        ] }
      ],
      zones: zoneOpts.map(function (z) {
        var on = zone === z.id;
        return Object.assign({}, z, { on: on, style: self.chip(on), subStyle: on ? subOn : subOff, pick: function () { self.setState({ zone: z.id, sent: false }); } });
      }),
      ingests: ingestOpts.map(function (label) {
        var id = label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        var on = ingest === id;
        return { label: label, on: on, style: self.chip(on), pick: function () { self.setState({ ingest: id, sent: false }); } };
      }),
      egresses: egressOpts.map(function (e) {
        var on = egress === e.id;
        return { label: e.id, sub: e.sub, on: on, style: self.chip(on), subStyle: on ? subOn : subOff, pick: function () { self.setState({ egress: e.id, sent: false }); } };
      }),
      zone: zone,
      ingest: ingest,
      egress: egress,
      sent: sent,
      statusText: sent ? 'TRANSMITTED' : 'READY',
      transmitLabel: sent ? 'DISPATCH QUEUED — EDIT TO RESEND' : 'TRANSMIT TO ON-CALL →',
      transmit: function () { self.setState({ sent: true }); },
      faqs: faqs.map(function (f, i) {
        var open = openFaq === i;
        return Object.assign({}, f, {
          open: open,
          chev: open ? '−' : '+',
          chevStyle: open ? 'background: #FFFFFF; color: #0A0A0A; border: 1px solid #FFFFFF;' : 'background: transparent; color: #FFFFFF; border: 1px solid #4A4A4A;',
          toggle: function () { self.setState({ openFaq: open ? -1 : i }); }
        });
      })
    };
  }
}
