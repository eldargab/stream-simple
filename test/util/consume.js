
module.exports = function(stream, done) {
  var out = []
  ;(function read() {
    stream.read(function(err, buf) {
      if (err) return done(err)
      if (!buf) return done(null, Buffer.concat(out).toString())
      out.push(buf)
      read()
    })
  })()
}
