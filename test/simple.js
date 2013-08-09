var should = require('should')
var fs = require('fs')
var Simple = require('../index')

describe('readable -> simple stream', function() {
  describe('.consume(cb)', function() {
    it('Should consume binary stream', function(done) {
      Simple(fs.createReadStream(__filename)).consume(function(err, buf) {
        if (err) return done(err)
        Buffer.isBuffer(buf).should.be.true
        buf.toString().should.match(/Should consume binary stream/)
        done()
      })
    })
  })

  describe('.consume(encoding, cb)', function() {
    it('Should consume binary stream and return decoded results', function(done) {
      Simple(fs.createReadStream(__filename)).consume('utf8', function(err, string) {
        if (err) return done(err)
        string.should.match(/return decoded results/)
        done()
      })
    })
  })
})
