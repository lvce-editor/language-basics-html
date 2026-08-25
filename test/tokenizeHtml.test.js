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
