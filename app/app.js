const app = require('app')
if (process.platform === 'darwin') {
  app.dock.hide()
}
const globalShortcut = require('global-shortcut')
const mkdirp = require('mkdirp')
const request = require('request-promise')
const BrowserWindow = require('browser-window')
const fs = require('fs')
const ipc = require('ipc')
const Menu = require('menu')
const Tray = require('tray')

const LocalStorage = require('node-localstorage').LocalStorage
const lsDir = app.getPath('appData')+'/gyazotlight/Local Storage/node'
mkdirp.sync(lsDir)
localStorage = new LocalStorage(lsDir)

const InputWindow = require('./inputWindow')
const openSettings = require('./openSettings')

let openInputWindow = (type) => {
  if (BrowserWindow.getAllWindows().length > 1) return
  const inputWindow = new InputWindow()
  inputWindow.show(`./static/input.html?${type||''}`)
}

function requestLogin () {
  let browser = new BrowserWindow({
    width: 800,
    height: 600,
  })
  browser.webContents.on('did-get-response-details', function (event,status,newUrl,originalUrl,httpResponseCode,requestMethod,referrer,headers) {
    if(/^https:\/\/gyazo.com\/search/.test(newUrl)){
      browser.webContents.session.cookies.get({url: 'https://gyazo.com', name: 'Gyazo_session'}, (error, cookies) => {
        fs.writeFileSync(app.getPath('appData')+'/gyazotlight/.Gyazo_session', cookies[0].value)
        browser.hide()
        let ws = require("nodejs-websocket")

        let server = ws.createServer(function (conn) {
            console.log("New connection")
            conn.on("text", function (text) {
              if (text !== 'open') return
              console.log('called')
              openInputWindow('browser')
            })
            conn.on("close", function (code, reason) {
                console.log("Connection closed")
            })
        }).listen(3652)
        ipc.on('synchronous-message', function(event, arg) {
          server.connections.forEach((conn) => {
            console.log('send: '+arg)
            conn.sendText(arg)
          })
        })
      })
    }
  })
  browser.loadUrl('https://gyazo.com/login')
}

let appIcon = null
app.on('ready', () => {
  appIcon = new Tray(`${__dirname}/Icon.png`)
  let contextMenu = Menu.buildFromTemplate([
    { label: 'Launch', click: openInputWindow},
    { label: 'Settings', click: openSettings },
    { label: 'Quit', click: app.quit}
  ])
  appIcon.setContextMenu(contextMenu)
  let keyComb = localStorage.getItem('keyComb') || 'Ctrl+Shift+G'
  globalShortcut.register(keyComb, openInputWindow)
  requestLogin()
})

app.on('will-quit', () => {
  let keyComb = localStorage.getItem('keyComb') || 'Ctrl+Shift+G'
  globalShortcut.unregister(keyComb)
  globalShortcut.unregisterAll()
})

ipc.on('change-hotkey', function(event, arg) {
  const oldComb = localStorage.getItem('keyComb') || 'Ctrl+Shift+G'
  const newComb = arg
  globalShortcut.unregister(oldComb)
  globalShortcut.register(newComb, openInputWindow)
  event.sender.send('saved-hotkey', '')
})
