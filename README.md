#stream-simple

This project is an util for converting node readable streams
to [simple-stream](https://github.com/creationix/js-git/blob/master/specs/simple-stream.md)
format suggested by Tim Caswell.

##Example

http echo server

```javascript
var Simple = require('stream-simple')
var http = require('http')

http.createServer(function(req, res) {
  var body = Simple(req)

  res.on('error', function() {
    body.abort()
  })

  res.writeHead(200, {
    'Content-Type': req.headers['content-type']
  })

  ;(function read() {
    body.read(function(err, chunk) {
      if (err) return res.destroy()
      if (!chunk) return res.end()
      res.write(chunk)
      read()
    })
  })()
})
```

##Installation

via npm

```
npm install stream-simple
```

##License

MIT
