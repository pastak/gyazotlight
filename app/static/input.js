(function() {
  const request = require('request-promise')
  const remote = require('remote')
  const app = remote.require('app')
  const clipboard = require('clipboard')
  const BrowserWindow = remote.require('browser-window')
  const NativeImage = require('native-image')
  const fs = require('fs')
  const ipc = require('ipc')
  const exec = require('child_process').exec

  let cookieVal = fs.readFileSync(app.getPath('appData')+'/gyazotlight/.Gyazo_session')
  let timerId = null

  let getDataUrlfromImageUrl = (imageUrl) => {
    return new Promise((resolve) => {
      var img = document.createElement('img')
      document.body.appendChild(img)
      img.onload = () => {
        var _c = document.createElement('canvas')
        _c.width = img.width
        _c.height = img.height
        var _ctx = _c.getContext('2d')
        _ctx.drawImage(img, 0, 0)
        document.body.removeChild(img)
        resolve(_c.toDataURL())
      }
      img.src = imageUrl
    })
  }
  let getTargetIndex = (target) => {
    return Array.prototype.slice.apply(document.querySelector('#imageListContainer').childNodes)
      .filter(function (node) {
        return node.nodeType === 1
      })
    .indexOf(target)
  }

  let changeSelect = (target) => {
    if (!target) return
    let selected = document.querySelector('.image-list.selected')
    selected.classList.remove('selected')
    target.classList.add('selected')
    const targetTop = target.getBoundingClientRect().top - 50
    if (targetTop < 0) {
      document.querySelector('#imageListContainer').scrollTop += targetTop
    } else if (targetTop >= window.innerHeight - 60) {
      let index = getTargetIndex(target)
      document.querySelector('#imageListContainer').scrollTop = 60 * (index - 5)
    }
  }

  document.addEventListener('keydown', (event) => {
    let selected = document.querySelector('.image-list.selected')
    if (event.keyCode === 27) {
      let bw = BrowserWindow.getFocusedWindow()
      bw.close()
    } else if (event.keyCode === 13) {
      event.preventDefault()
      let bw = BrowserWindow.getFocusedWindow()
      bw.setSize(0,0)
      getDataUrlfromImageUrl(document.querySelector('.image-list.selected').getAttribute('data-url')).then((dataUrl) => {
        const imageUrl = selected.getAttribute('data-url')
        const permalinkUrl = selected.getAttribute('data-permalink')
        if (location.search.slice(1) === 'browser') {
          ipc.send('synchronous-message', JSON.stringify({
            url: permalinkUrl,
            imageUrl: imageUrl
          }))
        } else {
          clipboard.write({
            image: NativeImage.createFromDataUrl(dataUrl),
            text: permalinkUrl,
            html: `<a href='${permalinkUrl}'><img src='${imageUrl}' /></a>`
          })
        }
        bw.close()
      })

      /*
      exec(`osascript -l JavaScript ${require('resolve-path')(app.getAppPath(), './scripts/insert.js')} amazon.com`, () => {
        bw.close()
      })
      */
    } else if (event.keyCode === 38) {
      // up
      event.preventDefault()
      changeSelect(selected.previousElementSibling)
    } else if (event.keyCode === 40) {
      // down
      event.preventDefault()
      changeSelect(selected.nextElementSibling)
    }
  })

  document.addEventListener('keyup', (event) => {
    if (event.keyCode === 13 || event.keyCode === 38 || event.keyCode === 40) return true
    if (timerId) {
      window.clearTimeout(timerId)
      timerId = null
    }
    timerId = window.setTimeout(function () {
      const queryText = document.querySelector('input').value
      if (!queryText) return
      let url = `https://gyazo.com/images/search?q=${encodeURIComponent(queryText)}`
      request({uri: url, headers: {
        cookie: `Gyazo_session=${cookieVal}`,
        accept: 'application/json'
      }})
        .then((data) => {
          data = JSON.parse(data)
          const windowHeight = 50 + Math.min(data.length * 60, 360)
          BrowserWindow.getFocusedWindow().setSize(800, windowHeight)
          let html = ''
          data.forEach((item, index) => {
            const thumbUrl = item['search_thumb_url']
            const permalinkUrl = item['permalink_url']
            const imageUrl = item['url']
            html += `<div class='image-list ${(index === 0 ? 'selected':'')}'
                data-thumb='${thumbUrl}' data-url='${imageUrl}' data-permalink='${permalinkUrl}'
              >
              <img src='${thumbUrl}' />
              <span>${item['desc'] || item['metadata'] && item['metadata']['title'] || permalinkUrl}</span>
              </div>`
          })
          document.querySelector('#imageListContainer').innerHTML = html
        })
        .catch((error) => {
          console.log(JSON.stringify(error))
        })
    }, 200)
  })
  document.querySelector('input').focus()
})()
