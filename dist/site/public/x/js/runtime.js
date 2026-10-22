/* Stage-X page runtime: renders a <template> with {{holes}}, <sc-for>, <sc-if>,
   delegated click/submit handlers, and hydrates pre-rendered markup in place. */
class DCLogic {
  constructor(props) { this.props = props; this.state = {}; }
  setState(patch) { Object.assign(this.state, patch); window.sxSchedule(); }
  forceUpdate() { window.sxSchedule(); }
}

window.sxBoot = function (Component, props) {
  var tpl = document.getElementById('sx-template');
  var mount = document.getElementById('sx-root');
  var comp = new Component(props || {});
  // Build in an inert document so <img src="{{…}}"> placeholders are never fetched.
  var inert = document.implementation.createHTMLDocument('');
  var HOLE = /\{\{\s*([^}]+?)\s*\}\}/g;
  var WHOLE = /^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/;

  function lookup(path, scope) {
    if (path === 'true') return true;
    if (path === 'false') return false;
    if (path === 'null') return null;
    if (/^-?\d+(\.\d+)?$/.test(path)) return Number(path);
    var parts = path.split('.'), v = scope;
    for (var i = 0; i < parts.length; i++) { if (v == null) return undefined; v = v[parts[i]]; }
    return v;
  }
  function interp(str, scope) {
    return str.replace(HOLE, function (_, p) { var v = lookup(p, scope); return v == null ? '' : String(v); });
  }
  function processAttrs(el, scope) {
    Array.prototype.slice.call(el.attributes).forEach(function (a) {
      if (a.value.indexOf('{{') === -1) return;
      var whole = a.value.match(WHOLE);
      if (whole && /^on/i.test(a.name)) {
        var fn = lookup(whole[1], scope);
        el.removeAttribute(a.name);
        if (typeof fn === 'function') (el.__listeners = el.__listeners || {})[a.name.slice(2).toLowerCase()] = fn;
        return;
      }
      el.setAttribute(a.name, interp(a.value, scope));
    });
  }
  function walk(node, scope) {
    Array.prototype.slice.call(node.childNodes).forEach(function (child) {
      if (child.nodeType === 3) {
        if (child.nodeValue.indexOf('{{') !== -1) child.nodeValue = interp(child.nodeValue, scope);
        return;
      }
      if (child.nodeType !== 1) return;
      var tag = child.tagName.toLowerCase();
      if (tag === 'sc-for') {
        var list = lookup((child.getAttribute('list') || '').replace(/[{}\s]/g, ''), scope) || [];
        var as = child.getAttribute('as') || 'item';
        var frag = inert.createDocumentFragment();
        list.forEach(function (item, i) {
          var holder = inert.createElement('div');
          Array.prototype.slice.call(child.childNodes).forEach(function (c) { holder.appendChild(c.cloneNode(true)); });
          var s = Object.create(scope); s[as] = item; s.$index = i;
          walk(holder, s);
          while (holder.firstChild) frag.appendChild(holder.firstChild);
        });
        child.parentNode.replaceChild(frag, child);
        return;
      }
      if (tag === 'sc-if') {
        var val = lookup((child.getAttribute('value') || '').replace(/[{}\s]/g, ''), scope);
        if (val) {
          walk(child, scope);
          var f = inert.createDocumentFragment();
          while (child.firstChild) f.appendChild(child.firstChild);
          child.parentNode.replaceChild(f, child);
        } else {
          child.parentNode.removeChild(child);
        }
        return;
      }
      processAttrs(child, scope);
      walk(child, scope);
    });
  }
  function build() {
    var holder = inert.createElement('div');
    holder.innerHTML = tpl.innerHTML;
    walk(holder, comp.renderVals());
    // adoptNode keeps the same node objects, so the __listeners attached during walk() survive.
    return document.adoptNode(holder.firstElementChild);
  }
  function patch(a, b) {
    if (a.nodeType !== b.nodeType || a.nodeName !== b.nodeName) { a.parentNode.replaceChild(b, a); return; }
    if (a.nodeType === 3) { if (a.nodeValue !== b.nodeValue) a.nodeValue = b.nodeValue; return; }
    if (a.nodeType !== 1) return;
    Array.prototype.slice.call(a.attributes).forEach(function (at) { if (!b.hasAttribute(at.name)) a.removeAttribute(at.name); });
    Array.prototype.slice.call(b.attributes).forEach(function (at) { if (a.getAttribute(at.name) !== at.value) a.setAttribute(at.name, at.value); });
    a.__listeners = b.__listeners;
    var ac = Array.prototype.slice.call(a.childNodes), bc = Array.prototype.slice.call(b.childNodes);
    for (var i = 0; i < bc.length; i++) { if (i < ac.length) patch(ac[i], bc[i]); else a.appendChild(bc[i]); }
    for (var j = bc.length; j < ac.length; j++) a.removeChild(ac[j]);
  }
  function render() {
    var fresh = build();
    var old = mount.firstElementChild;
    if (!old) mount.appendChild(fresh); else patch(old, fresh);
  }
  var pending = false;
  window.sxSchedule = function () {
    if (pending) return; pending = true;
    requestAnimationFrame(function () { pending = false; render(); });
  };
  ['click', 'submit', 'change'].forEach(function (type) {
    document.addEventListener(type, function (e) {
      var n = e.target;
      while (n && n !== document) {
        if (n.__listeners && n.__listeners[type]) { n.__listeners[type](e); return; }
        n = n.parentNode;
      }
    });
  });
  render();
  if (typeof comp.componentDidMount === 'function') comp.componentDidMount();
};
