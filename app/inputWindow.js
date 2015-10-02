const app = require('app')
const BrowserWindow = require('browser-window')

class InputWindow {
  constructor () {
    const ElectronScreen = require('screen')
    win = new BrowserWindow({
      width: 802,
      height: 45,
      x: (ElectronScreen.getPrimaryDisplay().workAreaSize.width - 800) / 2,
      y: 300,
      frame: false,
      transparent: true,
      resizable: false,
      show: false
    })
    win.on('blur', win.close)
    this.window = win

  }
  load (url) {
    if (!url) return
    if (!url.match(/^https?:/) || !url.match(/^file:/)) {
      // maybe local path
      const localAppPath = app.getAppPath()
      url = `file://${require('resolve-path')(localAppPath, 'app/'+url)}`
    }
    this.window.loadUrl(url)
    return true
  }
  show (url) {
    if (!this.load(url)) return
    this.window.focus()
    this.window.show()
  }
}

module.exports = InputWindow
