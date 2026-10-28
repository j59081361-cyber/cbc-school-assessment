// File-based key/value store + automatic dated backups (no Electron dependency, so it can be unit-tested).
const fs = require("fs");
const path = require("path");

const pad = (n) => String(n).padStart(2, "0");
const dayStamp = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function createStore(dir, opts = {}) {
  const keep = opts.keep || 30;
  const file = path.join(dir, "data.json");
  const bakFile = file + ".bak";
  const backupDir = path.join(dir, "backups");
  let data = {};
  let timer = null;
  let dirty = false;

  fs.mkdirSync(dir, { recursive: true });

  function readJson(f) {
    try {
      const o = JSON.parse(fs.readFileSync(f, "utf8"));
      return o && typeof o === "object" && !Array.isArray(o) ? o : null;
    } catch (e) {
      return null;
    }
  }

  function load() {
    data = readJson(file) || readJson(bakFile) || {};
    return data;
  }

  function flush() {
    if (timer) { clearTimeout(timer); timer = null; }
    if (!dirty) return;
    const tmp = file + ".tmp";
    fs.writeFileSync(tmp, JSON.stringify(data));
    if (fs.existsSync(file)) { try { fs.copyFileSync(file, bakFile); } catch (e) {} }
    fs.renameSync(tmp, file);
    dirty = false;
  }

  function get(k) {
    return Object.prototype.hasOwnProperty.call(data, k) ? data[k] : null;
  }

  function set(k, v) {
    data[String(k)] = String(v);
    dirty = true;
    if (!timer) timer = setTimeout(() => { timer = null; try { flush(); } catch (e) {} }, 300);
  }

  function listBackups() {
    try {
      return fs.readdirSync(backupDir).filter((n) => /^backup-\d{4}-\d{2}-\d{2}\.json$/.test(n)).sort();
    } catch (e) {
      return [];
    }
  }

  // Writes backups/backup-YYYY-MM-DD.json (one per day, overwritten the same day). Skips if nothing is saved yet.
  function backup() {
    let st = [];
    try { st = JSON.parse(data["ra-store"] || "[]"); } catch (e) {}
    if (!Array.isArray(st) || !st.length) return null;
    fs.mkdirSync(backupDir, { recursive: true });
    const payload = { app: "cbc-analytics", v: 1, saved: Date.now(), auto: true, store: st, data: data["ra-data-jss2"] || "" };
    const target = path.join(backupDir, `backup-${dayStamp()}.json`);
    const tmp = target + ".tmp";
    fs.writeFileSync(tmp, JSON.stringify(payload));
    fs.renameSync(tmp, target);
    const all = listBackups();
    for (const n of all.slice(0, Math.max(0, all.length - keep))) {
      try { fs.unlinkSync(path.join(backupDir, n)); } catch (e) {}
    }
    return target;
  }

  function lastBackup() {
    const all = listBackups();
    if (!all.length) return null;
    const n = all[all.length - 1];
    try { return { name: n, time: fs.statSync(path.join(backupDir, n)).mtimeMs }; } catch (e) { return null; }
  }

  return { load, get, set, flush, backup, lastBackup, listBackups, backupDir, file };
}

module.exports = { createStore, dayStamp };
