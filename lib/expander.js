const emmet = require('emmet')

const find = (text, regex) => {
  const result = regex.exec(text)
  if (result) {
    const match = result[0]
    const start = result.index
    const end = start + match.length
    return { match, start, end }
  } else {
    return { match: '', start: 0, end: 0 }
  }
}


function extract(line, cursorPos) {

  const before = line.substring(0, cursorPos)
  const after = line.substring(cursorPos, line.length)
  const ABBR_BEFORE = /((({[^{}]+})|(\[[^\[\]]+\])|[\w\.\*\>\+\-#]+)+({[^\{\}]*)?)$/
  const ABBR_AFTER = /^(([^\{\}]*})?(({[^{}]+})|(\[[^\[\]]+\])|([\w\.\*\>\+\-#]+))+)/
  const { match: abbrBefore, start: startBefore, end: endBefore } = find(before, ABBR_BEFORE)
  const { match: abbrAfter, start: startAfter, end: endAfter } = find(after, ABBR_AFTER)

  return {
    abbr: abbrBefore + abbrAfter,
    abbrStart: startBefore,
    abbrEnd: before.length + endAfter
  }
}

module.exports = { extract }