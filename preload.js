const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("nativeStore", {
  get: (k) => ipcRenderer.sendSync("kv-get", String(k)),
  set: (k, v) => ipcRenderer.send("kv-set", String(k), String(v)),
  lastBackup: () => ipcRenderer.sendSync("bk-last"),
  backupNow: () => ipcRenderer.sendSync("bk-now"),
  openFolder: () => ipcRenderer.send("bk-open"),
});
