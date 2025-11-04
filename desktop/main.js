const path = require('path');
const {app, BrowserWindow, shell, nativeTheme} = require('electron');

const isDevelopment =
  process.env.NODE_ENV === 'development' || !!process.env.ELECTRON_START_URL;
const START_URL =
  process.env.ELECTRON_START_URL || `file://${path.join(__dirname, '../web/dist/index.html')}`;

let mainWindow;

const hasSingleInstanceLock = app.requestSingleInstanceLock();

if (!hasSingleInstanceLock) {
  app.quit();
  process.exit(0);
}

const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 640,
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#000000' : '#ffffff',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.once('ready-to-show', () => {
    if (!mainWindow) {
      return;
    }
    mainWindow.show();
  });

  if (isDevelopment && /^https?:\/\//.test(START_URL)) {
    mainWindow.loadURL(START_URL);
    if (process.env.ELECTRON_DEBUG_TOOLS === 'true') {
      mainWindow.webContents.openDevTools({mode: 'detach'});
    }
  } else {
    mainWindow.loadURL(START_URL);
  }

  mainWindow.webContents.setWindowOpenHandler(({url}) => {
    shell.openExternal(url);
    return {action: 'deny'};
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.focus();
  }
});

app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
