import {
  initialLineState,
  tokenizeLine,
  TokenType,
  TokenMap,
} from '../src/tokenizeHtml.js'

const DEBUG = true

const expectTokenize = (text, state = initialLineState.state) => {
  const lineState = {
    state,
  }
  const tokens = []
  const lines = text.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const result = tokenizeLine(lines[i], lineState)
    lineState.state = result.state
    tokens.push(...result.tokens.map((token) => token.type))
    tokens.push(TokenType.NewLine)
  }
  tokens.pop()
  return {
    toEqual(...expectedTokens) {
      if (DEBUG) {
        expect(tokens.map((token) => TokenMap[token])).toEqual(
          expectedTokens.map((token) => TokenMap[token])
        )
      } else {
        expect(tokens).toEqual(expectedTokens)
      }
    },
  }
}

test('basic', () => {
  expectTokenize('<h1></h1>').toEqual(
    TokenType.PunctuationTag,
    TokenType.TagName,
    TokenType.PunctuationTag,
    TokenType.PunctuationTag,
    TokenType.PunctuationTag,
    TokenType.TagName,
    TokenType.PunctuationTag
  )
})

test('invalid end tag', () => {
  expectTokenize('<h123></h123/h123>').toEqual(
    TokenType.PunctuationTag,
    TokenType.TagName,
    TokenType.PunctuationTag,
    TokenType.PunctuationTag,
    TokenType.PunctuationTag,
    TokenType.TagName,
    TokenType.Text,
    TokenType.Text
  )
})

test('partial attribute', () => {
  expectTokenize('<h1 class=></h1>').toEqual(
    TokenType.PunctuationTag,
    TokenType.TagName,
    TokenType.Whitespace,
    TokenType.AttributeName,
    TokenType.Punctuation,
    TokenType.PunctuationTag,
    TokenType.PunctuationTag,
    TokenType.PunctuationTag,
    TokenType.TagName,
    TokenType.PunctuationTag
  )
})

test('invalid html', () => {
  expectTokenize('<h1234567 class""=></h1234567>').toEqual(
    TokenType.PunctuationTag,
    TokenType.TagName,
    TokenType.Whitespace,
    TokenType.AttributeName,
    TokenType.PunctuationString,
    TokenType.PunctuationString,
    TokenType.Text,
    TokenType.PunctuationTag,
    TokenType.PunctuationTag,
    TokenType.PunctuationTag,
    TokenType.TagName,
    TokenType.PunctuationTag
  )
})

test.skip('multiple attribute equal signs', () => {
  expectTokenize(`<h1 class==""></h1>`).toEqual()
})

test('invalid character in start tag', () => {
  expectTokenize(`<h1 =></h1>`).toEqual(
    TokenType.PunctuationTag,
    TokenType.TagName,
    TokenType.Whitespace,
    TokenType.Text,
    TokenType.Text,
    TokenType.PunctuationTag,
    TokenType.PunctuationTag,
    TokenType.TagName,
    TokenType.PunctuationTag
  )
})

test('invalid open angle bracket', () => {
  expectTokenize('abc<  ').toEqual(
    TokenType.Text,
    TokenType.Text,
    TokenType.Text
  )
})

test('empty tag name', () => {
  expectTokenize('<><div>').toEqual(
    TokenType.PunctuationTag,
    TokenType.PunctuationTag,
    TokenType.PunctuationTag,
    TokenType.TagName,
    TokenType.PunctuationTag
  )
})

test('multiple attributes without value', () => {
  expectTokenize('<input disabled autofocus>').toEqual(
    TokenType.PunctuationTag,
    TokenType.TagName,
    TokenType.Whitespace,
    TokenType.AttributeName,
    TokenType.Whitespace,
    TokenType.AttributeName,
    TokenType.PunctuationTag
  )
})
