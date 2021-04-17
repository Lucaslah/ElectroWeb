const { app, BrowserWindow } = require('electron');

let mainWindow;

app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') {
  app.quit();
  }
});

app.on('ready', function() {
  mainWindow = new BrowserWindow({ width: 1024, height: 768, webPreferences: { nodeIntegration: true, webviewTag: true } });
  mainWindow.loadURL('file://' + __dirname + '/browser.html');
});
