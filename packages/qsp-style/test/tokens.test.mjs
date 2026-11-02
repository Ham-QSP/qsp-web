import {test} from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {contrastRatio, renderCssVariables, renderScssVariables, validateTokens} from '../scripts/build.mjs'

const tokens = JSON.parse(readFileSync(new URL('../tokens.json', import.meta.url), 'utf8'))

test('tokens match the spec', () => {
  assert.equal(tokens.color.primary, '#00A3FF')
  assert.equal(tokens.color.onPrimary, '#0D1117')
  assert.equal(tokens.color.background, '#0D1117')
  assert.equal(tokens.color.surface, '#151B24')
  assert.equal(tokens.color.border, '#333D4D')
  assert.equal(tokens.color.text, '#E6E9EF')
})

test('every text colour reaches AA', () => {
  for (const role of ['text', 'textSecondary', 'primary', 'error', 'success', 'warning']) {
    for (const ground of ['background', 'surface']) {
      const ratio = contrastRatio(tokens.color[role], tokens.color[ground])
      assert.ok(ratio >= 4.5, `${role} on ${ground}: ${ratio}`)
    }
  }
  assert.ok(contrastRatio(tokens.color.onPrimary, tokens.color.primary) >= 4.5)
})

test('contrastRatio is correct', () => {
  assert.ok(Math.abs(contrastRatio('#000000', '#FFFFFF') - 21) < 0.01)
})

test('css variables', () => {
  const css = renderCssVariables(tokens)
  assert.match(css, /^:root \{[\s\S]*\}\s*$/)
  assert.ok(css.includes('--qsp-color-on-primary: #0D1117;'))
  assert.ok(css.includes('--qsp-radius-card: 8px;'))
})

test('scss variables', () => {
  assert.ok(renderScssVariables(tokens).includes('$qsp-color-primary: #00A3FF;'))
})

test('missing token fails', () => {
  const broken = structuredClone(tokens)
  delete broken.color.textSecondary
  assert.throws(() => validateTokens(broken), /textSecondary/)
})
