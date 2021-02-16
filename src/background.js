'use strict'

import { app, protocol, BrowserWindow, ipcMain } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import ExcelHandler from './utils/excel'
import Store from './Store'
const isDevelopment = process.env.NODE_ENV !== 'production'

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

const store = new Store({
  fileName: 'spring-settings.json',
  defaults: {
    windowBounds: { width: 1024, height: 768 }
  }
})

let win

async function createWindow() {
  // Create the browser window.
  const { width, height } = store.get('windowBounds')

  win = new BrowserWindow({
    width: width,
    height: height,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      enableRemoteModule: true,
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) {
      win.webContents.openDevTools()
    }
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})


app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// Disable top menu bar for all windows
app.on('browser-window-created', function (e, window) {
  window.setMenu(null);
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }

  createWindow()

  win.on('resize', () => {
    // The event doesn't pass us the window size, so we call the `getBounds` method which returns an object with
    // the height, width, and x and y coordinates.
    let { width, height } = win.getBounds();
    // Now that we have them, save them using the `set` method.
    store.set({ key: 'windowBounds', value: { width, height }});
  })
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

// @TODO: this might cause issues
ipcMain.handle('open-xslx-file', async (event, path) => {
  const data = await openFile(event, path)

  const jsonFile = new Store(`${data.fileName}.json`)
  jsonFile.set(data)
  store.set({ key: 'lastOpenedFile', value: `${data.fileName}.json` })
})

ipcMain.handle('last-opened-file', () => {
  return store.get('lastOpenedFile')
})

async function openFile (event, path) {
  const fileContent = await ExcelHandler(event, path)
  const response = Object.freeze({...fileContent, fileName: path.replace(/^.*[\\\/]/, '')})

  win.webContents.send(
    'opened-file',
    response
  )

  return response
}
