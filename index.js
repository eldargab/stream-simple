
module.exports = function(src) {
  return new Simple(src)
}

function Simple(src) {
  this.src = src
  this.closed = false
  this.ended = false
  this.queue = []
  this._push = null
  this.init()
}

Simple.prototype.init = function() {
  var self = this

  this.src.on('error', function(err) {
    self.push(err)
  })

  this.src.on('data', function(data) {
    this.pause()
    self.push(null, data)
  })

  this.src.on('end', function() {
    self.ended = true
    self.push()
  })

  this.src.on('close', function() {
    self.closed = true
    self.push(new Error('The stream is destroyed'))
  })

  this.src.pause()
}

Simple.prototype.read = function(cb) {
  var call = this.queue.shift()
  if (call) return cb.apply(null, call)
  this._push = cb
  this.src.resume()
}

Simple.prototype.abort = function(cb) {
  this.src.destroy()
  if (!cb) return
  if (this.closed || this.ended) return cb()
  this.src.on('close', cb)
}

Simple.prototype.push = function(err, data) {
  var push = this._push
  this._push = null
  if (push) return push(err, data)
  this.queue.push(arguments)
}
