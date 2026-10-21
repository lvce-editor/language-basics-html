import assert from 'node:assert/strict'
import test from 'node:test'
import { initialLineState, tokenizeLine } from '../src/tokenizeHtml.js'

test('reports inline style content as embedded CSS', () => {
  const line = '<style>h1 {color:red}</style>'

  const result = tokenizeLine(line, structuredClone(initialLineState))

  assert.equal(result.embeddedLanguage, 'css')
  assert.equal(result.embeddedLanguageStart, '<style>'.length)
  assert.equal(result.embeddedLanguageEnd, line.indexOf('</style>'))

  const nextResult = tokenizeLine('<h1>hello</h1>', result)
  assert.equal(nextResult.embeddedLanguage, '')
})

test('reports text/plain script content as embedded plaintext', () => {
  const line =
    '<script type="text/plain">0123 const "quoted" <tag></script><p>html</p>'

  const result = tokenizeLine(line, structuredClone(initialLineState))

  assert.equal(result.embeddedLanguage, 'plaintext')
  assert.equal(
    result.embeddedLanguageStart,
    '<script type="text/plain">'.length,
  )
  assert.equal(result.embeddedLanguageEnd, line.indexOf('</script>'))

  const nextResult = tokenizeLine('<p>html</p>', result)
  assert.equal(nextResult.embeddedLanguage, '')
})

test('preserves text/plain script type across multiline opening tags', () => {
  for (const typeAttribute of ["type='text/plain'", 'type="text/plain"']) {
    let lineState = structuredClone(initialLineState)
    lineState = tokenizeLine('<script', lineState)
    lineState = tokenizeLine(` ${typeAttribute}`, lineState)
    lineState = tokenizeLine(' data-example="yes">', lineState)

    const bodyLine = '0123 const "quoted" <tag>'
    lineState = tokenizeLine(bodyLine, lineState)

    assert.equal(lineState.embeddedLanguage, 'plaintext')
    assert.equal(lineState.embeddedLanguageStart, 0)
    assert.equal(lineState.embeddedLanguageEnd, bodyLine.length)

    const closingLine = tokenizeLine('</script><p>html</p>', lineState)
    assert.equal(closingLine.embeddedLanguage, 'plaintext')

    const followingLine = tokenizeLine('<p>html</p>', closingLine)
    assert.equal(followingLine.embeddedLanguage, '')
  }
})
