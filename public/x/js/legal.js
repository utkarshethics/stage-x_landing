class Component extends DCLogic {
  renderVals() {
    var self = this;
    var s = this.state || {};
    var EXPORT = typeof SX_EXPORT !== 'undefined';
    var KEYS = ['about', 'contact', 'terms', 'privacy', 'delivery-policy'];
    var cur = s.page || this.props.page || 'contact';
    if (KEYS.indexOf(cur) === -1) cur = 'contact';

    var ADDRESS = '';
    var UPDATED = '21 October 2026';

    var PAGES = {
      contact: {
        label: 'Contact Us', kicker: 'CONTACT', title: 'Contact Us', updated: '',
        lede: 'We reply to every message within 1 business day.',
        blocks: []
      },
      about: {
        label: 'About Us', kicker: 'ABOUT', title: 'About STAGE-X', updated: '',
        lede: "STAGE-X provides forward deployed AI engineering services for enterprises and industrial operations: our engineers embed inside client teams to integrate, optimize and harden frontier AI systems inside existing mission-critical infrastructure, including on-premise, private cloud and air-gapped environments.",
        blocks: [
          { h: 'What we do' },
          { ul: ['AI integration with existing systems such as SAP, Kafka, OSIsoft PI and cloud platforms', 'Retrieval (RAG) and monitoring setups for business data', "Hands-on training and handover so the client's team runs the system independently", 'Technical assessments and executive briefings'] },
          { h: 'Contact & Retainers' },
          { p: 'For enterprise engagements, technical briefings or dispatch requests, reach our engineering team directly at +1 (331) 328-7053 or connect@stage-x.space.' }
        ]
      },
      terms: {
        label: 'Terms & Conditions', kicker: 'LEGAL', title: 'Terms & Conditions', updated: UPDATED, lede: '',
        blocks: [
          { h: '1. About us' },
          { p: 'This website, stage-x.space, is operated by STAGE-X ("STAGE-X", "we", "us"). By using this website or buying our services, you agree to these terms.' },
          { h: '2. Our services' },
          { p: 'We provide IT services and computer consultancy, including AI integration, deployment, training and technical assessments, as described on our website and in the quote or order you accept.' },
          { h: '3. Quotes and orders' },
          { p: 'Prices are agreed in a written quote. An order is confirmed when we receive your payment or signed acceptance of a quote. The scope of work is what is written in the order or quote.' },
          { h: '4. Payments' },
          { p: 'Payments are made in US Dollars (USD) through our payment gateway partner, which accepts UPI, cards, net banking and wallets. We do not store your card or bank details. You receive an invoice by email for every payment.' },
          { h: '5. Client responsibilities' },
          { p: 'You agree to give us timely access to the systems, data and people needed to deliver the service, and to have the right to share any data you give us.' },
          { h: '6. Cancellations and refunds' },
          { p: 'For cancellations, billing or order enquiries, email connect@stage-x.space.' },
          { h: '7. Intellectual property' },
          { p: "Code and documents we create specifically for you become yours once paid in full, unless the order says otherwise. Our own tools, open-source components and know-how remain ours or their owners' and are licensed to you for use with the delivered work." },
          { h: '8. Confidentiality' },
          { p: 'We keep your business information confidential and use it only to deliver your services.' },
          { h: '9. Limitation of liability' },
          { p: 'Our total liability for any claim is limited to the amount you paid for the service concerned. We are not liable for indirect losses such as lost profits or data, except where the law does not allow this limit.' },
          { h: '10. Website use' },
          { p: 'You must not misuse this website, attempt to gain unauthorised access, or use it for anything unlawful.' },
          { h: '11. Changes' },
          { p: 'We may update these terms. The version on this page on the date of your order applies to that order.' },
          { h: '12. Governing law' },
          { p: 'These terms are governed by the laws of India. Courts in Bengaluru, Karnataka have exclusive jurisdiction.' },
          { h: '13. Contact' },
          { p: 'STAGE-X · +1 (331) 328-7053 · connect@stage-x.space' }
        ]
      },
      privacy: {
        label: 'Privacy Policy', kicker: 'LEGAL', title: 'Privacy Policy', updated: UPDATED,
        lede: 'This policy explains how STAGE-X collects and uses personal data through stage-x.space, in line with the Digital Personal Data Protection Act, 2023 and the Information Technology Act, 2000.',
        blocks: [
          { h: '1. What we collect' },
          { ul: ['Details you give us: name, company, email, phone number and the message you send through our forms.', 'Billing details: name, billing address and invoice details. Card, UPI and bank details are processed by our payment gateway partner, not stored by us.', 'Basic website data: IP address, browser type and pages visited, collected through cookies and analytics.'] },
          { h: '2. Why we use it' },
          { ul: ['To reply to enquiries and deliver the services you buy', 'To send invoices and payment confirmations', 'To improve our website and services', 'To meet legal and tax obligations'] },
          { h: '3. Sharing' },
          { p: 'We do not sell your data. We share it only with service providers who help us run the business (payment gateway, email and hosting providers), and with authorities when the law requires it.' },
          { h: '4. Storage and security' },
          { p: 'Your data is stored on secure servers and kept only as long as needed for the purposes above or as required by law.' },
          { h: '5. Your rights' },
          { p: 'You can ask to see, correct or delete your personal data, or withdraw consent, by emailing connect@stage-x.space. We respond within 30 days.' },
          { h: '6. Cookies' },
          { p: 'You can block cookies in your browser settings. Some parts of the site may not work properly without them.' },
          { h: '7. Changes' },
          { p: 'We may update this policy; the latest version is always on this page.' },
          { h: '8. Grievance officer' },
          { p: 'STAGE-X · connect@stage-x.space · +1 (331) 328-7053' }
        ]
      },
      'delivery-policy': {
        label: 'Service Delivery Policy', kicker: 'LEGAL', title: 'Service Delivery Policy', updated: UPDATED,
        lede: 'STAGE-X sells IT and consultancy services. We do not ship physical products.',
        blocks: [
          { h: '1. How services are delivered' },
          { p: "Services are delivered online (video calls, remote access, shared repositories and email) or on-site at the client's office when agreed in the order." },
          { h: '2. When delivery starts' },
          { p: 'Work starts within 3 working days of payment confirmation, or on the start date written in your order or quote.' },
          { h: '3. Timelines' },
          { ul: ['AI Readiness Assessment: written report within 5–7 working days', 'Pilot Deployment: typically 3–6 weeks, as set out in the project plan', 'Embedded Engineer: ongoing for the months paid for', 'Training & Handover: on the scheduled session date'] },
          { h: '4. Confirmation' },
          { p: 'You receive an email confirmation and invoice after payment, and a delivery note or report when each deliverable is handed over.' },
          { h: '5. Delays' },
          { p: 'If a delivery date will be missed, we tell you by email in advance with a new date.' },
          { h: '6. Questions' },
          { p: 'connect@stage-x.space · +1 (331) 328-7053' }
        ]
      }
    };

    var href = function (k) { return EXPORT ? '/' + k : '#legal-top'; };
    var pick = function (k) { return EXPORT ? null : function () { self.setState({ page: k }); }; };
    var p = PAGES[cur];

    var cardFor = {};
    var card = (cardFor[cur] || []).map(function (c) { return Object.assign({ span: 'auto', plain: !c.href, href: c.href || '' }, c); });

    var footerLabels = {
      about: 'About Us',
      contact: 'Contact Us',
      terms: 'Terms & Conditions',
      privacy: 'Privacy Policy',
      'delivery-policy': 'Service Delivery Policy'
    };

    var order = ['about', 'contact', 'terms', 'privacy', 'delivery-policy'];

    var chev = [0, 1, 2].map(function (i) {
      return { style: 'opacity: ' + ((i + 1) * 0.35) };
    });

    var hideSummits = Date.now() < Date.parse('2026-10-24T11:00:00Z');

    return {
      motionClass: (this.props.motion ?? true) ? '' : 'sx-still',
      hrefHome: EXPORT ? '/' : 'Main.dc.html',
      hrefSummits: EXPORT ? '/summits.html' : 'Summits.dc.html',
      mobileNav: [['Home', EXPORT ? '/' : 'Main.dc.html']].concat(hideSummits ? [] : [['Summits', EXPORT ? '/summits.html' : 'Summits.dc.html']]).concat([['Residency', EXPORT ? '/residency' : 'Residency.dc.html'], ['About', href('about')], ['Contact', href('contact')], ['Terms', href('terms')]]).map(function (x) {
        return { label: x[0], href: x[1] };
      }),
      chev: chev,
      p: p,
      tabs: order.map(function (k) {
        var on = k === cur;
        return { label: PAGES[k].label, href: href(k), pick: pick(k), current: on ? 'page' : 'false', line: on ? '#FFFFFF' : 'transparent', fg: on ? '#FFFFFF' : '#A8A8A8', weight: on ? '700' : '500' };
      }),
      showCard: false,
      card: [],
      isContact: cur === 'contact',
      sendMail: function (e) {
        if (e && e.preventDefault) e.preventDefault();
        var f = e && e.target && e.target.elements ? e.target.elements : (e && e.target ? e.target : null);
        if (!f) return;
        var name = (f.name && f.name.value) ? f.name.value.trim() : '';
        var company = (f.company && f.company.value) ? f.company.value.trim() : '';
        var email = (f.email && f.email.value) ? f.email.value.trim() : '';
        var phone = (f.phone && f.phone.value) ? f.phone.value.trim() : '';
        var msg = (f.message && f.message.value) ? f.message.value.trim() : '';

        var alertEl = document.getElementById('contact-success');
        if (alertEl) {
          alertEl.style.display = 'block';
          alertEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        var btn = document.getElementById('cf-submit-btn');
        if (btn) {
          btn.disabled = true;
          btn.style.opacity = '0.6';
          btn.textContent = 'Query Received';
        }

        var subject = 'Website enquiry from ' + name + (company ? ' (' + company + ')' : '');
        var body = msg + '\n\n— ' + name + '\nEmail: ' + email + (phone ? '\nPhone: ' + phone : '') + (company ? '\nCompany: ' + company : '');

        try {
          fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name, company: company, email: email, phone: phone, message: msg })
          }).catch(function () {});
        } catch (err) {}

        setTimeout(function () {
          window.location.href = 'mailto:connect@stage-x.space?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
        }, 350);

        var formEl = e && e.target && e.target.tagName === 'FORM' ? e.target : document.getElementById('contact-form');
        if (formEl && formEl.reset) formEl.reset();
      },
      siteLinks: [
        { label: 'Home', href: EXPORT ? '/' : 'Main.dc.html' },
        { label: 'Summits', href: EXPORT ? '/summits.html' : 'Summits.dc.html' },
        { label: 'Residency', href: EXPORT ? '/residency' : 'Residency.dc.html' },
        { label: 'Field Missions', href: EXPORT ? '/#missions' : 'Main.dc.html' },
        { label: 'Open Source', href: EXPORT ? '/#opensource' : 'Main.dc.html' },
        { label: 'Briefings', href: EXPORT ? '/#briefs' : 'Main.dc.html' },
        { label: 'Open a Dispatch', href: EXPORT ? '/#dispatch' : 'Main.dc.html' }
      ],
      legalLinks: order.map(function (k, i) { return { label: footerLabels[k], href: href(k), pick: pick(k), more: i < order.length - 1 }; })
    };
  }
}
