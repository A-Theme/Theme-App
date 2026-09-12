const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const fs = require('fs');

/**
 * Desktop wrapper. The window opens index.html, the launcher page that offers
 * both editors; each editor is a plain relative link from there, so in-app
 * navigation is ordinary file:// navigation and needs nothing special.
 *
 * The editors are self-contained HTML with no Node use at all, which is why
 * nodeIntegration stays off and contextIsolation stays on.
 */

/**
 * Window icon. Electron accepts a PNG here on every platform; a Windows build
 * gets its executable icon from the packager (see package.json), not from this.
 * Resolved defensively because a missing icon path used to be a silent
 * annoyance: the file this pointed at (icon.ico) was never in the repo.
 */
function resolveIcon() {
  const candidates = [
    path.join(__dirname, 'icon.ico'),
    path.join(__dirname, 'icons', 'icon-512.png'),
    path.join(__dirname, 'icons', 'icon-192.png')
  ];
  return candidates.find(p => fs.existsSync(p));
}

function createWindow() {
  const icon = resolveIcon();

  const win = new BrowserWindow({
    width: 1320,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    ...(icon ? { icon } : {}),
    autoHideMenuBar: true,
    backgroundColor: '#0b1420',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  win.loadFile(path.join(__dirname, 'index.html'));

  // The launcher footer links to GitHub. Those belong in the user's browser,
  // not in a chromeless app window with no back button.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//.test(url)) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  win.webContents.on('will-navigate', (event, url) => {
    if (/^https?:\/\//.test(url)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
