import React from 'react'
import ipc from 'ipc'
import clipboard from 'clipboard'
import events from '../EventHandler'

export default class ImageItem extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  componentDidMount () {
    events.once('pressEnterKey', this.enter.bind(this))
  }
  componentDidUpdate () {
    if (!this.props.selected) {
      return events.removeListener('pressEnterKey', this.enter.bind(this))
    }
    events.once('pressEnterKey', this.enter.bind(this))
    this._forceScroll()
  }
  getDataUrl () {
    const image = this.props.image
    const imageUrl = image['url']
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
  _onMouseOver () {
    events.emit('changeSelectedIndex', this.props.index)
  }
  _forceScroll () {
    const index  = this.props.index
    const target = React.findDOMNode(this)
    const targetTop = target.getBoundingClientRect().top - 50
    if (targetTop < 0) {
      document.querySelector('#imageListContainer').scrollTop += targetTop
    } else if (targetTop >= window.innerHeight - 60) {
      document.querySelector('#imageListContainer').scrollTop = 60 * (index - 5)
    }
  }
  enter () {
    if (!this.props.selected) return
    this.getDataUrl().then((dataUrl) => {
      const permalinkUrl = this.props.image['permalink_url']
      const imageUrl = this.props.image['url']
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
      events.emit('close')
    })
  }
  render () {
    const image = this.props.image
    return (
      <div
        className={`image-list ${this.props.selected ? 'selected' : ''}`}
        onClick={this.enter.bind(this)}
        onMouseOver={this._onMouseOver.bind(this)}
      >
        <img src={image['thumb_url']} />
        <span>
          {image.desc || (image.metadata && image.metadata.title) || image['permalink_url']}
        </span>
      </div>
    )
  }
}
