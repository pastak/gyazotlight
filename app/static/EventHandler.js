import { EventEmitter } from 'events'
e = new EventEmitter
e.setMaxListeners(0)
module.exports = e
