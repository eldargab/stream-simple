#stream-simple

This project is an util for converting node readable streams
to [simple-stream](https://github.com/creationix/js-git/blob/master/specs/simple-stream.md)
format suggested by Tim Caswell, as well as more strict and detailed version of original spec.

##Example

http file server

```javascript
var Simple = require('stream-simple')
var http = require('http')
var fs = require('fs')

http.createServer(function(req, res) {
  var stream = Simple(fs.createReadStream(req.url.slice(1)))

  res.on('error', function() {
    stream.abort()
  })

  res.writeHead(200, {
    'Content-Type': 'text/plain'
  })

  ;(function push() {
    stream.read(function(err, chunk) {
      if (err) return res.destroy()
      if (!chunk) return res.end()
      res.write(chunk)
      push()
    })
  })()
})
```

##Installation

via npm

```
npm install stream-simple
```

##spec

Simple stream is an object with two methods `.read(cb)` and `.abort([cb])`.

The `.read()` method recieves a callback with node's standard signature `cb(err, item)` and
obeys to the following rules:

  * End of stream MUST be encoded as `cb(null, undefined)`
  * Data chunk/item MUST be encoded as `cb(null, item)` where `item !== undefined`
  * Error MUST be encoded as `cb(err)` where the `err` is an instance of `Error`
  * Stream MUST destroy itself and release all underlying resources in case it reports
  an error or EOF to read callback, however the exact moment of cleanup completion is undefined.
  * Stream MUST yield an error on attempt to read from it if it is in destroyed state, however
  streams which supply data from some sort of internal queue MAY yield already buffered
  data events first.
  * Stream MAY (and it's recommended to) ignore stack overflow concerns and call callbacks synchronously.

The `.abort()` method is typically used for interrupting of stream processing and releasing of all underlying resources.
It receives optional callback function with `cb(err)` signature which is called after completion of cleanup procedure.
The following rules apply:

  * Stream MUST accept multiple `.abort()` calls.
  * Stream MUST call abort callbacks only after completion of cleanup procedure.
  * Stream MAY pass errors occured on cleanup to abort callbacks.

##License

MIT
