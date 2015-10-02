const app = require('app')
const BrowserWindow = require('browser-window')
module.exports = () => {
  win = new BrowserWindow({ width: 800, height: 600 })
  win.loadUrl(`file://${require('resolve-path')(app.getAppPath(), 'app/static/settings.html')}`)
}
