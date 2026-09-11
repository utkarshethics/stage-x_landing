#!/usr/bin/env node
/**
 * chromium-guardrails.js
 * Policy engine mirroring ChatGPT Work enterprise controls for headless Chromium.
 *
 * Provides ALLOW/BLOCK per origin, permission gates, dry-run defaults,
 * approvalDuration (per-turn | per-thread), and audit trace logging.
 *
 * All browser automations must pass through `Guardrails.check()` before
 * any irreversible action (click submit, fill+send, upload, purchase).
 *
 * Usage:
 *   const { Guardrails, ORIGIN_POLICIES } = require('./chromium-guardrails');
 *   const g = new Guardrails({ dryRun: true });
 *   if (!g.isAllowed('https://lu.ma/stage-x-sf-2026')) throw new Error('blocked');
 *   const decision = g.check({ type: 'click', target: 'submit', url });
 *   if (decision.blocked) { console.log('human takeover required'); }
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ── Origin policies (ChatGPT Work: Allow / Block per origin) ─────────────────
const ORIGIN_POLICIES = Object.freeze({
  // Always allowed - stage-x owned + public summit sources
  ALLOW: [
    'https://stage-x.space',
    'https://www.stage-x.space',
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'https://lu.ma',
    'https://*.luma.com',
    'https://api.luma.com',
    'https://www.eventbrite.com',
    'https://www.eventbriteapi.com',
    'https://outlook.office.com',
    'https://outlook.live.com',
  ],
  // Blocked - sensitive / ToS-risky unless explicitly approved
  BLOCK: [
    'https://www.linkedin.com', // gated behind --send + caps
    'https://web.whatsapp.com',
    'https://web.telegram.org',
    'https://*.facebook.com',
    'https://*.ebay.com',
  ],
  // Allowed only in dry-run / no-submit mode
  DRY_RUN_ONLY: [
    'https://web.whatsapp.com',
    'https://web.telegram.org',
    'https://www.linkedin.com',
    'https://www.facebook.com',
    'https://www.ebay-kleinanzeigen.de',
    'https://www.backmarket.com',
    'https://www.grover.com',
  ],
});

// ── Sensitive action types (require approval) ────────────────────────────────
const SENSITIVE_ACTIONS = new Set([
  'click_submit',
  'click_send',
  'click_purchase',
  'click_connect',
  'fill_submit',
  'upload_file',
  'download',
  'navigation_external',
  'permission_change',
  'delete',
]);

const APPROVAL_DURATIONS = ['per-turn', 'per-thread'];

class Guardrails {
  constructor(options = {}) {
    this.dryRun = options.dryRun !== false; // default true (safe)
    this.approvalDuration = APPROVAL_DURATIONS.includes(options.approvalDuration)
      ? options.approvalDuration
      : 'per-turn';
    this.allowList = [...ORIGIN_POLICIES.ALLOW, ...(options.allowList || [])];
    this.blockList = [...ORIGIN_POLICIES.BLOCK, ...(options.blockList || [])];
    this.dryRunOnlyList = [...ORIGIN_POLICIES.DRY_RUN_ONLY];
    this.autoReview = options.autoReview || false;
    this.traceDir = options.traceDir || path.join(__dirname, '.opencode', 'traces');
    this.approvedThread = new Set(); // for per-thread approvals
    this.logger = options.logger || console;
    this.caps = {
      linkedinPerCompany: options.linkedinPerCompany || 25,
      linkedinPerDay: options.linkedinPerDay || 50,
      marketplacePerDay: options.marketplacePerDay || 5,
      ...options.caps,
    };
    this._ensureTraceDir();
  }

  _ensureTraceDir() {
    try {
      fs.mkdirSync(this.traceDir, { recursive: true });
    } catch {}
  }

  _matchOrigin(url, patterns) {
    if (!url) return false;
    let origin;
    try {
      origin = new URL(url).origin + new URL(url).pathname;
    } catch {
      origin = url;
    }
    return patterns.some((p) => {
      if (p.includes('*')) {
        const regex = new RegExp('^' + p.replace(/\./g, '\\.').replace(/\*/g, '.*') + '.*');
        return regex.test(url) || regex.test(origin);
      }
      return url.startsWith(p) || origin.startsWith(p);
    });
  }

  isAllowed(url) {
    if (!url) return true;
    if (this._matchOrigin(url, this.blockList)) {
      // Blocked origins are only allowed in dry-run if explicitly in ALLOW
      if (this.dryRun && this._matchOrigin(url, this.allowList)) return true;
      // Dry-run-only list: allowed only when dryRun = true
      if (this._matchOrigin(url, this.dryRunOnlyList) && this.dryRun) return true;
      return false;
    }
    return true;
  }

  isDryRunOnly(url) {
    return this._matchOrigin(url, this.dryRunOnlyList);
  }

  requiresApproval(action) {
    if (!action || !action.type) return false;
    if (SENSITIVE_ACTIONS.has(action.type)) return true;
    if (action.type === 'click' && /submit|send|purchase|pay|book|confirm|connect/i.test(action.target || '')) return true;
    if (action.type === 'fill' && action.submit === true) return true;
    if (action.type === 'navigate' && !this.isAllowed(action.url)) return true;
    return false;
  }

  /**
   * Main gate — call before every action.
   * Returns { allowed, blocked, reason, requiresHuman, approvalRequired }
   */
  check(action = {}) {
    const url = action.url || action.targetUrl || '';
    const result = {
      allowed: true,
      blocked: false,
      reason: null,
      requiresHuman: false,
      approvalRequired: false,
      dryRun: this.dryRun,
    };

    // 1) Origin block
    if (url && !this.isAllowed(url)) {
      result.allowed = false;
      result.blocked = true;
      result.reason = `origin blocked: ${url}`;
      result.requiresHuman = true;
      return result;
    }

    // 2) Dry-run-only origin with send intent
    if (url && this.isDryRunOnly(url) && !this.dryRun && this.requiresApproval(action)) {
      result.allowed = false;
      result.blocked = true;
      result.reason = `dry-run-only origin requires --dry-run: ${url} action=${action.type}`;
      result.requiresHuman = true;
      return result;
    }

    // 3) Sensitive action without approval
    if (this.requiresApproval(action)) {
      if (this.dryRun) {
        result.allowed = false;
        result.blocked = true;
        result.reason = `sensitive action blocked in dry-run: ${action.type} ${action.target || ''}`;
        result.approvalRequired = true;
        result.requiresHuman = true;
        return result;
      }
      // In non-dry-run, check per-thread approval cache
      if (this.approvalDuration === 'per-thread' && this.approvedThread.has(this._actionKey(action))) {
        result.allowed = true;
        result.approvalRequired = false;
      } else {
        result.approvalRequired = true;
        result.requiresHuman = true;
        // Do not block outright — caller must prompt and then call approve()
        result.allowed = false;
        result.reason = `approval required for ${action.type}`;
      }
    }

    // 4) Caps (LinkedIn etc.)
    const capCheck = this._checkCaps(action);
    if (capCheck.blocked) return capCheck;

    return result;
  }

  _actionKey(action) {
    return `${action.type}:${action.target || ''}:${action.url || ''}`;
  }

  approve(action) {
    if (this.approvalDuration === 'per-thread') {
      this.approvedThread.add(this._actionKey(action));
    }
  }

  resetApprovals() {
    this.approvedThread.clear();
  }

  _checkCaps(action) {
    // Generic cap structure — caller should provide counts via action.meta
    if (!action || !action.meta) return { allowed: true, blocked: false };
    const meta = action.meta;
    if (meta.linkedinCompanyCount !== undefined && meta.linkedinCompanyCount >= this.caps.linkedinPerCompany) {
      return { allowed: false, blocked: true, reason: `linkedin per-company cap ${this.caps.linkedinPerCompany} reached`, requiresHuman: true };
    }
    if (meta.linkedinDayCount !== undefined && meta.linkedinDayCount >= this.caps.linkedinPerDay) {
      return { allowed: false, blocked: true, reason: `linkedin per-day cap ${this.caps.linkedinPerDay} reached`, requiresHuman: true };
    }
    if (meta.marketplaceDayCount !== undefined && meta.marketplaceDayCount >= this.caps.marketplacePerDay) {
      return { allowed: false, blocked: true, reason: `marketplace per-day cap ${this.caps.marketplacePerDay} reached`, requiresHuman: true };
    }
    return { allowed: true, blocked: false };
  }

  logTrace(entry) {
    try {
      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      const file = path.join(this.traceDir, `trace-${ts}-${Math.random().toString(16).slice(2, 6)}.json`);
      const payload = {
        ts: new Date().toISOString(),
        pid: process.pid,
        dryRun: this.dryRun,
        ...entry,
      };
      fs.writeFileSync(file, JSON.stringify(payload, null, 2));
      return file;
    } catch (e) {
      this.logger.warn && this.logger.warn('[guardrails] trace write failed', e.message);
      return null;
    }
  }

  assertAllowed(action) {
    const decision = this.check(action);
    if (decision.blocked) {
      const err = new Error(decision.reason || 'blocked by guardrails');
      err.decision = decision;
      throw err;
    }
    if (decision.approvalRequired) {
      const err = new Error(decision.reason || 'approval required');
      err.decision = decision;
      err.approvalRequired = true;
      throw err;
    }
    return decision;
  }
}

module.exports = { Guardrails, ORIGIN_POLICIES, SENSITIVE_ACTIONS };
