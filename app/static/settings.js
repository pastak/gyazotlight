(function () {
  const app = require('remote').require('app')
  const ipc = require('ipc')

  const LocalStorage = require('node-localstorage').LocalStorage
  const lsDir = app.getPath('appData')+'/gyazotlight/Local Storage/node'
  const _nodeLocalStorage = new LocalStorage(lsDir)
  document.querySelector('#keyComb').value = _nodeLocalStorage.getItem('keyComb') || ''
  document.querySelector('#keyComb').focus()

  ipc.on('saved-hotkey', (arg) => {
    let savedHotkey = document.querySelector('#savedHotkey')
    savedHotkey.classList.add('show')
    window.setTimeout(() => {savedHotkey.classList.remove('show')}, 4500)
  })
  document.querySelector('#saveHotkey').addEventListener('click', (event) => {
    const newKeyComb = document.querySelector('#keyComb').value
    _nodeLocalStorage.setItem('keyComb', newKeyComb)
    ipc.send('change-hotkey', newKeyComb)
  })
  document.querySelector('#keyComb').addEventListener('keydown', function (event) {
    event.preventDefault()
    let newKeyComb = ''
    if (event.keyCode >= 48 && 90 >= event.keyCode) {
      // alphabet
      newKeyComb += String.fromCharCode(event.keyCode)
    } else if (!event.keyIdentifier.match(/^U+/)) {
      // success getKeyName
      newKeyComb += event.keyIdentifier
    } else {
      switch (event.keyCode) {
        case 8:
          newKeyComb += 'Delete'
          break
        case 9:
          newKeyComb += 'Tab'
          break
        case 27:
          newKeyComb += 'Esc'
          break
        case 32:
          newKeyComb += 'Space'
          break
      }
    }
    if (!newKeyComb) return
    if (!newKeyComb.includes('Control') && event.ctrlKey) {
      newKeyComb += '+Control'
    }
    if (newKeyComb.includes('Meta')){
      newKeyComb = newKeyComb.replace('Meta','Super')
    } else if (event.metaKey) {
      newKeyComb += '+Super'
    }
    if (!newKeyComb.includes('Alt') && event.altKey) {
      newKeyComb += '+Alt'
    }
    if (!newKeyComb.includes('Shift') && event.shiftKey) {
      newKeyComb += '+Shift'
    }

    event.target.value = newKeyComb
  })
})()
