const remote = require('remote')
const app = remote.require('app')
const BrowserWindow = remote.require('browser-window')
const NativeImage = require('native-image')
const fs = require('fs')
const exec = require('child_process').exec
const React = require('react')

import events from './EventHandler'
import ImageList from './components/ImageList'

(function() {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('input').focus()
    React.render(<ImageList />, document.getElementById('imageListContainer'))
  })
})()

events.on('close', () => {
  let bw = BrowserWindow.getFocusedWindow()
  bw.close()
})
document.addEventListener('keyup', (event) => {
  events.emit('keyup' ,event)
})
document.addEventListener('keydown', (event) => {
  if (event.keyCode === 27) {
    events.emit('close')
  } else if (event.keyCode === 13) {
    event.preventDefault()
    events.emit('pressEnterKey')
    let bw = BrowserWindow.getFocusedWindow()
    bw.setSize(0,0)
  } else if (event.keyCode === 38) {
    // up
    event.preventDefault()
    events.emit('select', 'prev')
  } else if (event.keyCode === 40) {
    // down
    event.preventDefault()
    events.emit('select', 'next')
  }
})
