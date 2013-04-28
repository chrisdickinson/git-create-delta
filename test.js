var apply = require('git-apply-delta')
  , Buffer = require('buffer').Buffer
  , test = require('tape')

var create = require('./index')

test('test that create-delta works as expected', function(assert) {
  var size = 1024 + ((Math.random() * 1024) | 0)
    , from = new Buffer(size)
    , to = new Buffer(size)
    , val


  for(var i = 0; i < size; ++i) {
    val = Math.random() * 0xFF & 0xFF
    from.writeUInt8(val, i)
    to.writeUInt8(Math.random() > 0.4 ? val : (val + 1) & 0xFF, i)
  }

  var delta = create(from, to) 
    , undeltad = apply(delta, from)

  for(var i = 0; i < size; ++i) {
    assert.equal(undeltad[i], to[i])
  }

  assert.end()
})
