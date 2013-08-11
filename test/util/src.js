var Emitter = require('events').EventEmitter

module.exports = Src

function Src() {
  Emitter.call(this)
}

Src.prototype = Object.create(Emitter.prototype)

Src.prototype.pause = function() {
  this.paused = true
}

Src.prototype.resume = function() {
  this.paused = false
}

Src.prototype.destroy = function() {
  this.destroyed = true
}
