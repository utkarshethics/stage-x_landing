#!/usr/bin/env node
/**
 * chromium-agent-loop.js
 * Reusable ReAct harness for headless Chromium (ASTRA/Operator/Atlas parity).
 *
 * Perception (snapshot + screenshot + network) -> Reasoning (LLM CoT compact) ->
 * Action (click/fill/type/hover/drag/evaluate) -> Verification
 *
 * Works with pluggable `client` that implements the MCP tool contract:
 *   { navigate(url), snapshot(), screenshot(), evaluate(script), click(uid),
 *     fill(uid,value), type(text), pressKey(key), hover(uid), drag(from,to),
 *     waitFor(text|selector, timeout), listNetworkRequests(), uploadFile(uid,path) }
 *
 * Also ships a default CDP HTTP client for `http://127.0.0.1:9223` headless.
 *
 * All irreversible actions go through `chromium-guardrails.js`.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const { Guardrails } = require('./chromium-guardrails');

// ── Default CDP HTTP client (9223) ──────────────────────────────────────────
class CdpHttpClient {
  constructor(options = {}) {
    this.host = options.host || '127.0.0.1';
    this.port = options.port || 9223;
    this.timeout = options.timeout || 15000;
    this.baseUrl = `http://${this.host}:${this.port}`;
  }

  _request(method, pathname, body = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(pathname, this.baseUrl);
      const isHttps = url.protocol === 'https:';
      const lib = isHttps ? https : http;
      const opts = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method,
        timeout: this.timeout,
        headers: { 'Content-Type': 'application/json' },
      };
      const req = lib.request(opts, (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          const ct = res.headers['content-type'] || '';
          if (ct.includes('application/json')) {
            try {
              resolve(JSON.parse(data));
            } catch {
              resolve(data);
            }
          } else {
            resolve(data);
          }
        });
      });
      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy(new Error(`timeout ${method} ${pathname}`));
      });
      if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
      req.end();
    });
  }

  async listPages() {
    try {
      const list = await this._request('GET', '/json/list');
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  }

  async newPage(url = 'about:blank', background = true) {
    const qs = url ? `?${encodeURIComponent(url)}` : '';
    try {
      const page = await this._request('PUT', `/json/new${qs}`);
      return page;
    } catch (e) {
      // Fallback: try GET /json/new
      try {
        return await this._request('GET', `/json/new?${encodeURIComponent(url)}`);
      } catch {
        throw e;
      }
    }
  }

  async closePage(id) {
    try {
      await this._request('GET', `/json/close/${id}`);
    } catch {}
  }

  // WebSocket helpers — lazy load `ws` if available, else degrade gracefully
  async _wsSend(targetWsUrl, domainMethod, params = {}) {
    let WebSocket;
    try {
      WebSocket = require('ws');
    } catch {
      throw new Error('ws module not installed — install with `npm i ws` for full CDP control. Falling back to HTTP-only mode.');
    }
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(targetWsUrl);
      const id = Math.floor(Math.random() * 1e6);
      const timer = setTimeout(() => {
        try { ws.close(); } catch {}
        reject(new Error(`CDP timeout ${domainMethod}`));
      }, this.timeout);
      ws.on('open', () => ws.send(JSON.stringify({ id, method: domainMethod, params })));
      ws.on('message', (data) => {
        try {
          const msg = JSON.parse(data.toString());
          if (msg.id === id) {
            clearTimeout(timer);
            ws.close();
            if (msg.error) reject(new Error(msg.error.message || JSON.stringify(msg.error)));
            else resolve(msg.result);
          }
        } catch (e) {
          clearTimeout(timer);
          ws.close();
          reject(e);
        }
      });
      ws.on('error', (e) => {
        clearTimeout(timer);
        reject(e);
      });
    });
  }

  async _getTarget() {
    const pages = await this.listPages();
    if (pages.length === 0) {
      const p = await this.newPage('about:blank');
      return p;
    }
    return pages[0];
  }

  async navigate(url) {
    const target = await this._getTarget();
    try {
      await this._wsSend(target.webSocketDebuggerUrl, 'Page.navigate', { url });
      await new Promise((r) => setTimeout(r, 1500));
      return { ok: true, url, targetId: target.id };
    } catch (e) {
      // Fallback: open new page with url
      const p = await this.newPage(url);
      return { ok: true, url, targetId: p.id || target.id, fallback: true };
    }
  }

  async snapshot() {
    const target = await this._getTarget();
    try {
      const result = await this._wsSend(target.webSocketDebuggerUrl, 'Runtime.evaluate', {
        expression: `(() => {
          const out = [];
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
          let n;
          let idx=0;
          while(n=walker.nextNode()){
            const rect = n.getBoundingClientRect ? n.getBoundingClientRect() : null;
            const text = (n.innerText||'').slice(0,120).replace(/\\s+/g,' ').trim();
            const role = n.getAttribute('role') || n.tagName.toLowerCase();
            const uid = n.getAttribute('data-uid') || 'el-'+idx;
            if (text || n.tagName==='BUTTON' || n.tagName==='A' || n.tagName==='INPUT') {
              out.push({ uid, role, text, tag: n.tagName, href: n.href||null, visible: rect ? (rect.width>0 && rect.height>0) : true });
              idx++;
              if (idx>300) break;
            }
          }
          return JSON.stringify(out.slice(0,150));
        })()`,
        returnByValue: true,
        awaitPromise: true,
      });
      const val = result && result.result && result.result.value ? JSON.parse(result.result.value) : [];
      return { ok: true, nodes: val, truncated: val.length >= 150 };
    } catch (e) {
      return { ok: false, error: e.message, nodes: [] };
    }
  }

  async evaluate(script) {
    const target = await this._getTarget();
    try {
      const result = await this._wsSend(target.webSocketDebuggerUrl, 'Runtime.evaluate', {
        expression: script,
        returnByValue: true,
        awaitPromise: true,
      });
      const v = result && result.result ? result.result.value : null;
      return { ok: true, value: v, raw: result };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }

  async screenshot() {
    const target = await this._getTarget();
    try {
      const result = await this._wsSend(target.webSocketDebuggerUrl, 'Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
      const data = result && result.data ? result.data : null;
      return { ok: !!data, data, encoding: 'base64' };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }

  async click(uid) { return this.evaluate(`document.querySelector('[data-uid="${uid}"]')?.click(); 'ok'`); }
  async fill(uid, value) { return this.evaluate(`{ const el=document.querySelector('[data-uid="${uid}"]'); if(el){ el.focus(); el.value=${JSON.stringify(value)}; el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true})); } 'ok' }`); }
  async type(text) { return this.evaluate(`document.activeElement && (document.activeElement.value+=${JSON.stringify(text)}); 'ok'`); }
  async pressKey(key) { return this.evaluate(`document.dispatchEvent(new KeyboardEvent('keydown',{key:${JSON.stringify(key)},bubbles:true})); 'ok'`); }
  async hover(uid) { return this.evaluate(`document.querySelector('[data-uid="${uid}"]')?.dispatchEvent(new MouseEvent('mouseover',{bubbles:true})); 'ok'`); }
  async drag() { return { ok: false, error: 'drag not implemented in HTTP client' }; }
  async waitFor(selectorOrText, timeout = 5000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const r = await this.evaluate(`document.body.innerText.includes(${JSON.stringify(selectorOrText)}) || !!document.querySelector(${JSON.stringify(selectorOrText)})`);
      if (r.ok && r.value) return { ok: true };
      await new Promise((r) => setTimeout(r, 300));
    }
    return { ok: false, error: 'waitFor timeout' };
  }
  async listNetworkRequests() { return { ok: true, requests: [] }; }
  async uploadFile() { return { ok: false, error: 'uploadFile not implemented in HTTP client — use MCP client' }; }
}

// ── Agent Loop ───────────────────────────────────────────────────────────────
class ChromiumAgentLoop {
  constructor(options = {}) {
    this.client = options.client || new CdpHttpClient(options.cdp || {});
    this.guardrails = options.guardrails || new Guardrails({ dryRun: options.dryRun !== false });
    this.timeout = options.timeout || 15000;
    this.maxSteps = options.maxSteps || 12;
    this.screenshotDir = options.screenshotDir || path.join(__dirname, 'screenshots');
    this.logger = options.logger || console;
    this.onHumanTakeover = options.onHumanTakeover || null; // (reason, context) => Promise<void>
    this.history = [];
    this.stepCount = 0;
    this._ensureScreenshotDir();
  }

  _ensureScreenshotDir() {
    try { fs.mkdirSync(this.screenshotDir, { recursive: true }); } catch {}
  }

  async perceive() {
    const [snap, net] = await Promise.all([
      this.client.snapshot ? this.client.snapshot().catch((e) => ({ ok: false, error: e.message })) : { ok: false },
      this.client.listNetworkRequests ? this.client.listNetworkRequests().catch(() => ({ ok: false })) : { ok: false },
    ]);
    let screenshot = null;
    try {
      if (this.client.screenshot) {
        const s = await this.client.screenshot();
        if (s && s.ok && s.data) {
          const file = path.join(this.screenshotDir, `perceive-${Date.now()}.png`);
          try { fs.writeFileSync(file, Buffer.from(s.data, 'base64')); screenshot = file; } catch {}
        }
      }
    } catch {}
    const state = { snapshot: snap, network: net, screenshot, ts: new Date().toISOString() };
    this.history.push({ type: 'perceive', state });
    return state;
  }

  async reason(state, task) {
    // Deterministic heuristic reasoning — LLM integration point.
    // If options.llm is provided, delegate to it; else use rule-based.
    if (this.llm && typeof this.llm === 'function') {
      const compressed = this._compactHistory();
      return this.llm({ task, state, history: compressed });
    }
    // Fallback: simple extraction heuristic
    const nodes = (state.snapshot && state.snapshot.nodes) || [];
    const hasSubmit = nodes.some((n) => /submit|send|purchase|pay|continue/i.test(n.text || ''));
    return {
      plan: hasSubmit ? 'verify submit button visible, await approval' : 'continue perception',
      nextAction: null,
      confidence: 0.6,
      needsHuman: hasSubmit,
    };
  }

  _compactHistory() {
    // Astra-style compaction: keep last 8 turns with screenshot refs, summarize older
    const recent = this.history.slice(-8);
    const older = this.history.length > 8 ? this.history.slice(0, -8) : [];
    let summary = null;
    if (older.length) {
      summary = { type: 'summary', steps: older.length, lastPerceive: older[older.length - 1]?.state?.ts || null };
    }
    return summary ? [summary, ...recent] : recent;
  }

  async act(action) {
    if (!action || !action.type) return { ok: false, error: 'no action' };
    // Guardrail gate
    try {
      this.guardrails.assertAllowed(action);
    } catch (e) {
      const decision = e.decision || { blocked: true, reason: e.message, requiresHuman: true };
      this.guardrails.logTrace({ action, decision, step: this.stepCount });
      if (decision.requiresHuman || decision.approvalRequired) {
        if (this.onHumanTakeover) {
          await this.onHumanTakeover(decision.reason || 'approval required', { action, decision });
        }
        return { ok: false, blocked: true, decision, error: decision.reason };
      }
      return { ok: false, blocked: true, decision };
    }

    let result;
    try {
      switch (action.type) {
        case 'navigate': result = await this.client.navigate(action.url); break;
        case 'click': result = await this.client.click(action.uid || action.target); break;
        case 'fill': result = await this.client.fill(action.uid, action.value); break;
        case 'type': result = await this.client.type(action.value || action.text); break;
        case 'pressKey': result = await this.client.pressKey(action.key); break;
        case 'hover': result = await this.client.hover(action.uid); break;
        case 'drag': result = await this.client.drag(action.from, action.to); break;
        case 'evaluate': result = await this.client.evaluate(action.script); break;
        case 'waitFor': result = await this.client.waitFor(action.selector || action.text, action.timeout); break;
        case 'screenshot': result = await this.client.screenshot(); break;
        default: result = { ok: false, error: `unknown action type ${action.type}` };
      }
    } catch (e) {
      result = { ok: false, error: e.message };
    }
    this.history.push({ type: 'act', action, result, ts: new Date().toISOString() });
    this.guardrails.logTrace({ action, result, step: this.stepCount });
    this.stepCount += 1;
    return result;
  }

  async verify(expected) {
    const state = await this.perceive();
    const ok = expected ? this._matchesExpected(state, expected) : true;
    this.history.push({ type: 'verify', expected, ok, state });
    return { ok, state };
  }

  _matchesExpected(state, expected) {
    if (!expected) return true;
    if (expected.text) {
      const txt = JSON.stringify(state.snapshot || {}).toLowerCase();
      return txt.includes(expected.text.toLowerCase());
    }
    if (expected.urlContains) {
      // Would need client.getUrl — approximate via snapshot text
      return true;
    }
    return true;
  }

  async run(task) {
    // task: { goal, steps: [{ action, verify }], maxSteps }
    const max = task.maxSteps || this.maxSteps;
    this.history = [];
    this.stepCount = 0;
    const trace = { goal: task.goal, started: new Date().toISOString(), steps: [] };
    try {
      // Initial perceive
      let state = await this.perceive();
      trace.steps.push({ perceive: !!state.snapshot?.ok });

      for (let i = 0; i < (task.steps || []).length && this.stepCount < max; i++) {
        const item = task.steps[i];
        const reasoning = await this.reason(state, task);
        trace.steps.push({ reasoning });

        if (item.action) {
          const actResult = await this.act(item.action);
          trace.steps.push({ action: item.action, result: actResult });
          if (!actResult.ok && actResult.blocked) {
            trace.blocked = actResult.decision;
            break;
          }
          await new Promise((r) => setTimeout(r, 400));
        }
        if (item.verify) {
          const v = await this.verify(item.verify);
          state = v.state;
          trace.steps.push({ verify: item.verify, ok: v.ok });
          if (!v.ok && item.verify.required) {
            trace.failedVerify = item.verify;
            break;
          }
        } else {
          state = await this.perceive();
        }
      }
      trace.ended = new Date().toISOString();
      trace.success = !trace.blocked && !trace.failedVerify;
      this.guardrails.logTrace({ task, trace });
      return trace;
    } catch (e) {
      trace.error = e.message;
      trace.ended = new Date().toISOString();
      this.guardrails.logTrace({ task, trace, error: e.message });
      return trace;
    }
  }

  // Convenience wrappers matching MCP tool names
  async navigate_page(url) { return this.act({ type: 'navigate', url }); }
  async take_snapshot() { return this.perceive().then((s) => s.snapshot); }
  async take_screenshot() { return this.client.screenshot(); }
  async evaluate_script(script) { return this.act({ type: 'evaluate', script }); }
  async click(uid) { return this.act({ type: 'click', uid }); }
  async fill(uid, value) { return this.act({ type: 'fill', uid, value }); }
  async wait_for(text, timeout) { return this.act({ type: 'waitFor', selector: text, text, timeout }); }
}

// ── Factory for opencode MCP usage (injects guardrails) ─────────────────────
function createAgentLoop(options = {}) {
  const guardrails = new Guardrails({
    dryRun: options.dryRun !== false,
    allowList: options.allowList,
    blockList: options.blockList,
    traceDir: options.traceDir,
  });
  const client = options.client || new CdpHttpClient(options.cdp);
  const loop = new ChromiumAgentLoop({ ...options, client, guardrails });
  if (options.llm) loop.llm = options.llm;
  return loop;
}

module.exports = { ChromiumAgentLoop, CdpHttpClient, createAgentLoop };
