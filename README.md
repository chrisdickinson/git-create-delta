# git-create-delta

based largely off of [@tarruda's magnificent work](https://github.com/tarruda/node-git-core), `git-create-delta` creates binary deltas between buffer objects.

```javascript
var create = require('git-create-delta')
  , apply = require('git-apply-delta')

var from = new Buffer(1024)
  , to = new Buffer(1024)

var delta = create(from, to)

apply(delta, from) // returns a buffer matching `to`

```

# license

MIT
