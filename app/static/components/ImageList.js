import React from 'react'
import request from 'request-promise'
import ImageItem from'./ImageItem'
import events from '../EventHandler'

export default class ImageList extends React.Component {
  constructor(props) {
    super(props)
    this.timerId = null
    this.state = {
      selectedIndex: 0,
      data: []
    }
  }
  componentDidMount() {
    events.on('keyup', this._keyup.bind(this))
    events.on('changeSelectedIndex', (index) => {
      this.setState({selectedIndex: index})
    })
    events.on('select', (direction) => {
      if (['next', 'prev'].indexOf(direction) < 0) return
      let index = this.state.selectedIndex
      if (direction === 'next') {
        index = Math.min(index + 1, this.state.data.length - 1)
      } else if (direction === 'prev') {
        index = Math.max(0, index - 1)
      }
      this.setState({selectedIndex: index})
    })
  }
  _keyup (event) {
    if (event.keyCode === 13 || event.keyCode === 38 || event.keyCode === 40) return true
    if (this.timerId) {
      window.clearTimeout(this.timerId)
      this.timerId = null
    }
    this.timerId = window.setTimeout(() => {
      this.timerId = null
      const queryText = document.querySelector('input').value
      if (!queryText) return
      let cookieVal = fs.readFileSync(app.getPath('appData')+'/gyazotlight/.Gyazo_session')
      let url = `https://gyazo.com/images/search?q=${encodeURIComponent(queryText)}`
      request({uri: url, headers: {
        cookie: `Gyazo_session=${cookieVal}`,
        accept: 'application/json'
      }}).promise().bind(this)
        .then((data) => {
          data = JSON.parse(data).filter((item) => {
            return item.image_id && item.url
          })
          const windowHeight = 50 + Math.min(data.length * 60, 360)
          BrowserWindow.getFocusedWindow().setSize(800, windowHeight)
          this.setState({data: data})
        })
    }, 200)
  }
  render () {
    if (this.state.data.length < 1) return null
    const items = this.state.data.map((item, index) => {
      return (
        <ImageItem
          key={item.image_id}
          image={item}
          index={index}
          selected={index === this.state.selectedIndex}
        />
      )
    })
    return (<div>{items}</div>)
  }
}
