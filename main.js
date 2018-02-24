const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

const appPath = app.getAppPath();

let win
function createWindow() {
  win = new BrowserWindow({ width: 1800, height: 1000 })

  win.setMenu(null);

  // load the dist folder from Angular
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'dist/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools optionally:
  win.webContents.openDevTools()

  win.on('closed', () => {
    win = null
  })
}

app.on('ready', createWindow)


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})