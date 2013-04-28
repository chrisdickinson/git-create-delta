module.exports = Bucket

function Bucket(key, value) {
  this.key = key
  this.value = [value]
  this.next = null
}

var cons = Bucket
  , proto = cons.prototype

proto.get = function(key) {
  var node = this
  while(node && !eq(node.key, key)) {
    node = node.next
  }

  return node ? node.value : null
}

proto.set = function(key, val) {
  var node = this
  while(true) {
    if(eq(node.key, key)) {
      node.value.push(val)
      return
    }
    if(!node.next) {
      break
    }
    node = node.next
  }

  node.next = new Bucket(key, val)
}

function eq(lhs, rhs) {
  if(lhs.length !== rhs.length) {
    return false
  }

  for(var i = 0, len = lhs.length; i < len; ++i) {
    if(lhs.readUInt8(i) !== rhs.readUInt8(i)) {
      break
    }
  }

  return i === len
}

