// Version bureau : ouvre Trame Studio (un seul fichier HTML) dans une fenêtre native, sans serveur.
const { app, BrowserWindow, shell, Menu, nativeTheme } = require('electron');
const path = require('path');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1000,
    minHeight: 640,
    title: 'Trame Studio',
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#12181b' : '#e6eaec',
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true },
  });

  // Les liens externes (déclencheur « ouvrir une URL ») s'ouvrent dans le navigateur par défaut.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });

  // Exports HTML / SCORM et sauvegardes : Electron affiche la boîte « Enregistrer sous ».
  win.webContents.session.on('will-download', (event, item) => {
    item.setSaveDialogOptions({ title: 'Enregistrer', defaultPath: item.getFilename() });
  });

  win.loadFile(path.join(__dirname, '..', 'app', 'index.html'));
}

Menu.setApplicationMenu(Menu.buildFromTemplate([
  { label: 'Fichier', submenu: [{ role: 'quit', label: 'Quitter' }] },
  { label: 'Édition', submenu: [
    { role: 'undo', label: 'Annuler' }, { role: 'redo', label: 'Rétablir' }, { type: 'separator' },
    { role: 'cut', label: 'Couper' }, { role: 'copy', label: 'Copier' }, { role: 'paste', label: 'Coller' }, { role: 'selectAll', label: 'Tout sélectionner' },
  ] },
  { label: 'Affichage', submenu: [
    { role: 'reload', label: 'Recharger' }, { type: 'separator' },
    { role: 'zoomIn', label: 'Zoom avant' }, { role: 'zoomOut', label: 'Zoom arrière' }, { role: 'resetZoom', label: 'Taille réelle' },
    { type: 'separator' }, { role: 'togglefullscreen', label: 'Plein écran' }, { role: 'toggleDevTools', label: 'Outils de développement' },
  ] },
]));

// Une seule instance : relancer l'application ramène la fenêtre existante au premier plan.
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
  app.whenReady().then(createWindow);
}
app.on('window-all-closed', () => app.quit());
