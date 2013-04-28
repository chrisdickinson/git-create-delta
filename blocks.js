module.exports = Blocks

var Bucket = require('./bucket')

function Blocks(num) {
  this.buckets = []
  this.num = num
}

var cons = Blocks
  , proto = cons.prototype

proto.get = function(key) {
  var hashed = hash(key)
    , idx = hashed % this.num
    , bucket = this.buckets[idx]

  return bucket ? bucket.get(key) : null
}

proto.set = function(key, val) {
  var hashed = hash(key)
    , idx = hashed % this.num
    , bucket = this.buckets[idx]

  if(bucket) {
    return void bucket.set(key, val)
  }

  this.buckets[idx] = new Bucket(key, val)
}

function hash(buf) {
  var cmp = 1
    , retval = 0

  for(var i = 0, len = buf.length; i < len;) {
    cmp *= 29
    cmp = cmp & ((2 << 29) - 1)
    retval += buf.readUInt8(i++) * cmp
    retval = retval & ((2 << 29) - 1)
  }

  return retval
}
