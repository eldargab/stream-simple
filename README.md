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

The `.read()` is used for pulling data from stream. It accepts callback function with
node's standard signature `cb(err, item)`. The following rules apply:

  * End of stream MUST be indicated as `cb(null, undefined)`
  * Data chunk/item MUST be indicated as `cb(null, item)` where `item !== undefined`
  * Error MUST be indicated as `cb(err)` where `err` is an instance of `Error`
  * Stream MUST destroy itself and release all underlying resources in case it reports
  an error or EOF to `.read()` callback, however the exact moment of cleanup completion is undefined.
  * if stream is in a destroyed state it MUST return an error to `.read()`, however
  streams which supply data from some sort of internal queue MAY return already buffered
  data first.
  * Stream MAY (and it's recommended to) ignore stack overflow concerns and call callbacks synchronously.

The `.abort()` method is typically used for processing interruption.
It is a signal to release all underlying resources.
It accepts optional callback function with `cb(err)` signature which is called after completion of cleanup procedure.
The following rules apply:

  * Stream MUST handle multiple `.abort()` calls
  * Stream MUST call abort callbacks and only after completion of cleanup procedure
  * Stream MAY pass errors occured on cleanup to abort callbacks.

##F.A.Q

###Why not to support .read(n, cb)?

  1. It is a complexity
  2. It is not always needed
  3. It can be done with separate util without issues
  4. There is no performance benefits

The last argument requires some clarification. There are types
of streams (like file system streams) which indeed can produce
certain amount of data and optimize on that. However in any
system there are high-low watermark levels so that
if you pull data in chunks beyound that size boundary you get
either protocol or memory management overhead. For all modern systems
I am personally aware of the typical size of "optimal" chunk is much larger
than a typical size of protocol headers. Even if some parser currently wants
only 100b it's almost always better to pull 10kb in advance. On other hand there is no
much overhead in pulling 10kb instead of 100b as well as pulling 100kb in 10kb chunks.
Also that "optimal" chunk size is known at the moment of stream creation and there is no
need to pass it from outside.

Finally if some stream want's to support reading of certain amount of bytes it may do so,
however general purpose APIs should not rely on that.

###We taught that callbacks should always be called asynchronously

  1. Not all JavaScript environments have efficient `process.nextTick`
  and even in node it can be performance overhead
  2. With introduction of TCO by ES6 all that "next tick" stuff will become
  legacy quite soon
  3. It's not a problem. Indeed all edge cases could be handled
  in general purpose utils (like `consume`, `reduce`) and not bother developer at all.


##License

MIT
