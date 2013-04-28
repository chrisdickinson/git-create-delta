var Buffer = require('buffer').Buffer
  , Blocks = require('./blocks')

var MIN_COPY_LENGTH = 4

module.exports = diff 

function diff(source, target) {
  var match_offsets
    , insert_length
    , insert_buffer
    , buffered_len
    , opcodes
    , blocks
    , block
    , match
    , ret
    , len
    , i

  opcodes = []
  buffered_len = 0
  insert_buffer = new Buffer(127)
  blocks = new Blocks(Math.ceil(source.length / 17))

  encode_header(opcodes, source.length, target.length)

  i = 0
  len = source.length
  while(i < len) {
    block = slice(source, i)
    blocks.set(block, i)
    i += block.length
  }

  i = 0
  len = target.length
  while(i < len) {
    block = slice(target, i)
    match = null
    match_offsets = blocks.get(block)
    if(match_offsets) {
      match = choose(source, match_offsets, target, i)
    }

    !match || match.length < MIN_COPY_LENGTH ?
      build() : emit()
  }

  if(buffered_len) {
    emit_insert(opcodes, insert_buffer, buffered_len)
    buffered_len = 0
  }

  ret = new Buffer(opcodes)
  return ret

  function build() {
    insert_length = block.length + (match ? match.length : 0)

    buffered_len + insert_length <= insert_buffer.length ?
      buffer() : insert()

    i += insert_length
  }

  function buffer() {
    copy(target, insert_buffer, buffered_len, i, i + insert_length)
    buffered_len += insert_length
  }

  function insert() {
    emit_insert(opcodes, insert_buffer, buffered_len)
    copy(target, insert_buffer, 0, i, i + insert_length)
    buffered_len = insert_length
  }

  function emit() {
    if(buffered_len) {
      emit_insert(opcodes, insert_buffer, buffered_len)
      buffered_len = 0
    }

    emit_copy(opcodes, source, match.offset, match.length)
    i += match.length
  }
}

function copy(from, to, to_start, from_start, from_end) {
  from.copy(to, to_start, from_start, from_end)
}

function emit_insert(opcodes, buffer, length) {
  opcodes[opcodes.length] = length

  for(var i = 0; i < length; ++i) {
    opcodes.push(buffer.readUInt8(i))
  }
}

function emit_copy(opcodes, source, offset, length) {
  var code_idx = opcodes.length
    , code = 0x80
    , mask = 0xff
    , curs = 1
    , result

  opcodes[code_idx] = 0

  for(var i = 0; i < 4; ++i) {
    if(result = (offset & mask)) {
      code |= curs
      opcodes[opcodes.length] = result
    }
    curs <<= 1
    mask <<= 8
  }

  mask = 0xff
  for(var i = 0; i < 3; ++i) {
    if(result = (length & mask)) {
      code |= curs
    }
    curs <<= 1
    mask <<= 8
  }

  opcodes[code_idx] = code
}

function encode_header(opcodes, base_size, target_size) {
  encode(opcodes, base_size)
  encode(opcodes, target_size)
}

function encode(opcodes, size) {
  opcodes[opcodes.length] = size & 0x7F
  size >>>= 7
  while(size > 0) {
    opcodes[opcodes.length - 1] |= 0x80
    opcodes[opcodes.length] = size & 0x7F
    size >>>= 7
  }
}

function slice(buf, pos) {
  var j = pos
    , last

  while(j < buf.length && (last = buf.readUInt8(j)) !== 10 && (j - pos < 90)) {
    ++j
  }

  if(last === 10) {
    ++j
  }

  return buf.slice(pos, j)
}

function choose(source, source_positions, target, target_position) {
  var spos
    , tpos
    , ret
    , len

  for(var i = 0, length = source_positions.length; i < length; ++i) {
    len = 0
    if(ret && spos < (ret.offset + ret.length)) {
      continue
    }

    while(spos < source.length && source.readUInt8(spos++) === target.readUInt8(tpos)) {
      ++len
      ++tpos
    }

    if(!ret) {
      ret = {length: len, offset: source_positions[i]}
    } else {
      ret.length = len
      ret.offset = source_positions[i]
    }

    if(ret.length > (source.length / 5) | 0) {
      break
    }
  }

  return ret
}
