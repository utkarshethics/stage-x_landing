class Component extends DCLogic {
  renderVals() {
    var self = this;
    var s = this.state || {};
    var EXPORT = typeof SX_EXPORT !== 'undefined';
    var L = function (k) { return EXPORT ? '/' + k : 'Legal.dc.html'; };
    var FEE = 6, POOL = 12000;
    var CITIES = [
      { slug: 'sf', name: 'San Francisco', demo: 'OCT 31', start: Date.UTC(2026, 9, 31, 16), theme: 'Energy Transition: Utilities, Solar & Grid Storage', img: '/public/x/img/summit-sf.jpg', alt: 'Golden Gate Bridge and San Francisco at dusk' },
      { slug: 'nyc', name: 'New York', demo: 'NOV 7', start: Date.UTC(2026, 10, 7, 14), theme: 'Power Grids & Utilities: Reliability, Demand & Outages', img: '/public/x/img/summit-nyc.jpg', alt: 'Hudson Yards and the Manhattan skyline at night' },
      { slug: 'boston', name: 'Boston', demo: 'NOV 14', start: Date.UTC(2026, 10, 14, 14), theme: 'Advanced Manufacturing: AI on the Factory Floor', img: '/public/x/img/summit-boston.jpg', alt: 'Boston skyline across the Charles River' },
      { slug: 'toronto', name: 'Toronto', demo: 'NOV 21', start: Date.UTC(2026, 10, 21, 14), theme: 'Process Manufacturing: Steel, Chemicals & Materials', img: '/public/x/img/summit-toronto.jpg', alt: 'Toronto skyline with the CN Tower' },
      { slug: 'london', name: 'London', demo: 'NOV 28', start: Date.UTC(2026, 10, 28, 9), theme: 'Offshore Energy: North Sea Oil & Gas and Wind', img: '/public/x/img/summit-london.jpg', alt: 'Canary Wharf at night' },
      { slug: 'berlin', name: 'Berlin', demo: 'DEC 5', start: Date.UTC(2026, 11, 5, 8), theme: 'Automotive & Industrial Manufacturing', img: '/public/x/img/summit-berlin.jpg', alt: 'Berlin TV tower and the Spree river' },
      { slug: 'mumbai', name: 'Mumbai', demo: 'DEC 5', start: Date.UTC(2026, 11, 5, 3, 30), theme: 'Refining, Petrochemicals & Power', img: '/public/x/img/summit-mumbai.jpg', alt: 'Mumbai skyline and the Bandra-Worli Sea Link' },
      { slug: 'melbourne', name: 'Melbourne', demo: 'DEC 12', start: Date.UTC(2026, 11, 11, 22), theme: 'Mining & Resources: Heavy Equipment & Remote Sites', img: '/public/x/img/summit-melbourne.jpg', alt: 'Melbourne skyline and South Wharf' },
      // Dubai moved to 2027 on Lu.ma (date not announced yet); placeholder start keeps it "upcoming".
      { slug: 'dubai', name: 'Dubai', demo: '2027', start: Date.UTC(2027, 0, 1), theme: 'Upstream Oil & Gas: Production, Drilling & Pipelines', img: '/public/x/img/summit-dubai.jpg', alt: 'Dubai skyline with the Museum of the Future' }
    ];
    var now = Date.now();
    var firstOpen = CITIES.filter(function (c) { return c.start > now; })[0] || CITIES[0];
    var city = s.city || firstOpen.slug;
    var size = s.size || 1;
    var cityObj = CITIES.filter(function (c) { return c.slug === city; })[0];
    var faqOpen = s.faq === undefined ? 0 : s.faq;
    var faqs = [
      ['Who can join?', 'AI enthusiasts and college students. You can join on your own or as a team of up to four.'],
      ['What will we build?', 'A prototype for a real AI use case brought by manufacturing, oil & gas or energy companies attending your city’s summit, such as predictive maintenance, quality inspection or demand forecasting.'],
      ['How much does it cost?', 'Registration is $6 per person. A team of four pays $24 in total.'],
      ['How do I pay?', 'Send your registration from this page. We reply by email with a secure payment link, and your spot is confirmed once payment is received.'],
      ['Where and when does it happen?', 'In person, in all nine summit cities. Each sprint lasts 1–2 weeks and ends on that city’s summit weekend, where finalists demo their prototypes to the attending companies.'],
      ['What can we win?', 'Every city has its own prize pool of $12,000, in US dollars.'],
      ['Can I get a refund?', 'Refunds follow our Refund & Cancellation Policy. Email connect@stage-x.space with your name, invoice number and reason.']
    ];

    var CHIP_ON = 'border: 1px solid #FFFFFF; background: #FFFFFF; color: #0A0A0A;';
    var CHIP_OFF = 'border: 1px solid #3A3A3A; background: #0F0F0F; color: #EDEDED;';
    var ticker = ['$12,000 PER CITY', 'REAL INDUSTRY USE CASES', 'MANUFACTURING · OIL & GAS · ENERGY', 'TEAMS OF 1–4', '$6 PER PERSON', 'DEMO AT THE SUMMIT'];

    return {
      motionClass: (this.props.motion ?? true) ? '' : 'sx-still',
      hrefHome: EXPORT ? '/' : 'Main.dc.html',
      hrefSummits: EXPORT ? '/summits.html' : 'Summits.dc.html',
      hrefPricing: L('pricing'),
      hrefContact: L('contact'),
      hrefRefund: L('refund-policy'),
      totalPool: (POOL * CITIES.length).toLocaleString('en-US'),
      heroStats: [{ v: '9', k: 'Cities' }, { v: '1–4', k: 'Per team' }, { v: '$6', k: 'Per person' }],
      tickerLoop: ticker.concat(ticker, ticker),
      steps: [
        { n: '01', t: 'Register', d: 'Pick your city and team (1–4 people). Registration is $6 per person.' },
        { n: '02', t: 'Build', d: 'Pick a real use case from the manufacturing, oil & gas and energy companies attending your city’s summit, and build a prototype in person over 1–2 weeks.' },
        { n: '03', t: 'Demo', d: 'Finalists present their prototypes to those companies at the STAGE-X Summit weekend in their city.' },
        { n: '04', t: 'Win', d: 'Each city awards its own $12,000 prize pool.' }
      ],
      facts: [
        { k: 'OPEN TO', v: 'Students & AI enthusiasts', d: 'College students and anyone who builds with AI.' },
        { k: 'TEAM SIZE', v: '1–4 people', d: 'Come solo or bring up to three teammates.' },
        { k: 'REGISTRATION', v: '$6 / person', d: 'Paid through a secure link we email you.' },
        { k: 'FORMAT', v: 'In person', d: 'In the city you choose, ending at its summit.' }
      ],
      cities: CITIES.map(function (c) {
        var past = c.start <= now;
        return Object.assign({}, c, {
          status: past ? 'DEMO DAY PASSED' : (c === firstOpen ? 'NEXT UP' : 'REGISTRATION OPEN'),
          badgeBg: past ? '#3A3A3A' : (c === firstOpen ? '#FF3B30' : '#FFFFFF'),
          badgeFg: past ? '#D4D4D4' : (c === firstOpen ? '#FFFFFF' : '#0A0A0A'),
          summitHref: EXPORT ? '/summits/' + c.slug + '-2026.html' : 'Summit.dc.html',
          pick: function () { self.setState({ city: c.slug }); }
        });
      }),
      faqs: faqs.map(function (f, i) {
        var open = faqOpen === i;
        return { q: f[0], a: f[1], open: open, chev: open ? '−' : '+',
          chevStyle: open ? 'background: #FFFFFF; color: #0A0A0A; border: 1px solid #FFFFFF;' : 'background: transparent; color: #FFFFFF; border: 1px solid #4A4A4A;',
          toggle: function () { self.setState({ faq: open ? -1 : i }); } };
      }),
      cityLabel: cityObj.name.toUpperCase() + ' · DEMO ' + cityObj.demo,
      cityOptions: CITIES.map(function (c) {
        var on = c.slug === city;
        return { name: c.name, demo: c.demo, on: on, style: on ? CHIP_ON : CHIP_OFF, pick: function () { self.setState({ city: c.slug }); } };
      }),
      sizes: [1, 2, 3, 4].map(function (n) { return { n: n, on: n === size, style: n === size ? CHIP_ON : CHIP_OFF, pick: function () { self.setState({ size: n }); } }; }),
      teamSize: size + (size === 1 ? ' person' : ' people'),
      total: size * FEE,
      submit: function (e) {
        if (e && e.preventDefault) e.preventDefault();
        var f = e && e.target && e.target.elements;
        if (!f) return;
        var subject = 'Residency registration — ' + cityObj.name + ' — team of ' + size;
        var body = 'City: ' + cityObj.name + ' (demo day ' + cityObj.demo + ')\nTeam size: ' + size + ' (total $' + (size * FEE) + ')\n\nTeam lead: ' + f.name.value + '\nEmail: ' + f.email.value + '\nPhone / WhatsApp: ' + f.phone.value + (f.org.value ? '\nCollege / company: ' + f.org.value : '') + (f.team.value ? '\n\nOther members:\n' + f.team.value : '') + (f.idea.value ? '\n\nWhat we want to build:\n' + f.idea.value : '');
        window.location.href = 'mailto:connect@stage-x.space?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      },
      mobileNav: [['Home', EXPORT ? '/' : 'Main.dc.html'], ['Summits', EXPORT ? '/summits.html' : 'Summits.dc.html'], ['Cities', '#cities'], ['Register', '#register'], ['Pricing', L('pricing')], ['Contact', L('contact')]].map(function (x) { return { label: x[0], href: x[1] }; }),
      siteLinks: [
        { label: 'Home', href: EXPORT ? '/' : 'Main.dc.html' },
        { label: 'Summits', href: EXPORT ? '/summits.html' : 'Summits.dc.html' },
        { label: 'Residency', href: '#residency-top' },
        { label: 'Register', href: '#register' }
      ],
      legalLinks: [['about', 'About Us'], ['pricing', 'Pricing'], ['contact', 'Contact Us'], ['terms', 'Terms & Conditions'], ['privacy', 'Privacy Policy'], ['refund-policy', 'Refund & Cancellation'], ['delivery-policy', 'Service Delivery Policy']].map(function (x, i, a) { return { label: x[1], href: L(x[0]), more: i < a.length - 1 }; })
    };
  }
}
