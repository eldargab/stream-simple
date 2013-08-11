var should = require('should')
var fs = require('fs')
var Simple = require('../index')
var Src = require('./util/src')
var consume = require('./util/consume')
var fixture = require('path').join.bind(null, __dirname, 'fixture')

describe('readable -> simple stream', function() {
  var src, stream, received

  beforeEach(function() {
    src = new Src
    stream = Simple(src)
    received = []
  })

  function read() {
    stream.read(function(err, chunk) {
      received.push(err || chunk)
    })
  }

  it('Should queue data events', function() {
    src.emit('data', 'a')

    read()
    received.should.eql(['a'])

    read()
    received.should.eql(['a'])
    src.emit('data', 'b')
    received.should.eql(['a', 'b'])

    src.emit('end')
    read()
    received.should.eql(['a', 'b', undefined])
  })

  it('Should queue error events', function() {
    var error = new Error
    src.emit('error', error)
    read()
    received.should.eql([error])
  })

  it('Should pause src on creation', function() {
    src.paused.should.be.true
  })

  it('Should pause src on data event', function() {
    read()
    src.emit('data', 'a')
    src.paused.should.be.true
  })

  it('Should resume src on read', function() {
    read()
    src.paused.should.be.false
  })

  it('Should yield an error on attempt to read a closed src', function() {
    src.emit('close')
    read()
    received[0].should.be.an.instanceOf(Error)
    received[0].message.should.equal('The stream is destroyed')
  })

  describe('.abort([cb])', function() {
    it('Should destroy src', function() {
      stream.abort()
      src.destroyed.should.be.true
    })

    it('Should call callback on close event', function() {
      var called = false
      stream.abort(function() {
        called = true
      })
      called.should.be.false
      src.emit('close')
      called.should.be.true
    })

    it('Should call callback immediately when the src was already closed', function() {
      src.emit('close')
      var called = false
      stream.abort(function() {
        called = true
      })
      called.should.be.true
    })

    it('Should call callback immediately when the src was already ended', function() {
      src.emit('end')
      var called = false
      stream.abort(function() {
        called = true
      })
      called.should.be.true
    })
  })

  it('Should work with fs streams', function(done) {
    var stream = Simple(fs.createReadStream(fixture('bigfile.txt')))
    consume(stream, function(err, out) {
      if (err) return done(err)
      out.should.match(/Lorem ipsum/)
      done()
    })
  })

  it('Should work with http streams', function(done) {
    var http = require('http')
    var server = http.createServer(function(req, res) {
      res.writeHead(200, {
        'Content-Type': 'text/plain'
      })
      fs.createReadStream(fixture('bigfile.txt')).pipe(res)
    })
    server.listen(0)
    var port = server.address().port

    http.request({hostname: '127.0.0.1', port: port, method: 'GET'}, function(res) {
      var stream = Simple(res)
      consume(stream, function(err, out) {
        if (err) return done(err)
        out.should.match(/Lorem ipsum/)
        done()
      })
    }).on('error', done).end()
  })
})
