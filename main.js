const { app, BrowserWindow, Menu, shell, ipcMain } = require("electron");
const path = require("path");
const { createStore } = require("./storage");

const gotLock = app.requestSingleInstanceLock();

if (!gotLock) {
  app.quit();
} else {
  let store;

  function createWindow() {
    const win = new BrowserWindow({
      width: 1200,
      height: 800,
      title: "CBC School Results Analytics",
      autoHideMenuBar: true,
      icon: path.join(__dirname, "build", "icon.png"),
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
        preload: path.join(__dirname, "preload.js"),
      },
    });
    Menu.setApplicationMenu(null);
    win.loadFile(path.join(__dirname, "app", "index.html"));
    win.webContents.setWindowOpenHandler(({ url }) => {
      if (/^https?:/.test(url)) shell.openExternal(url);
      return { action: "deny" };
    });
  }

  app.whenReady().then(() => {
    store = createStore(app.getPath("userData"));
    store.load();
    try { store.backup(); } catch (e) {}

    ipcMain.on("kv-get", (e, k) => { e.returnValue = store.get(k); });
    ipcMain.on("kv-set", (e, k, v) => { store.set(k, v); });
    ipcMain.on("bk-last", (e) => { e.returnValue = store.lastBackup(); });
    ipcMain.on("bk-now", (e) => {
      try { store.flush(); store.backup(); } catch (x) {}
      e.returnValue = store.lastBackup();
    });
    ipcMain.on("bk-open", () => {
      require("fs").mkdirSync(store.backupDir, { recursive: true });
      shell.openPath(store.backupDir);
    });

    createWindow();
  });

  app.on("before-quit", () => {
    if (!store) return;
    try { store.flush(); store.backup(); } catch (e) {}
  });

  app.on("second-instance", () => {
    const [w] = BrowserWindow.getAllWindows();
    if (w) { if (w.isMinimized()) w.restore(); w.focus(); }
  });
  app.on("window-all-closed", () => app.quit());
}
