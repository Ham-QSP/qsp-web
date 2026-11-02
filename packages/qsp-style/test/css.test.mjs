import {test, before} from 'node:test'
import assert from 'node:assert/strict'
import {execFileSync} from 'node:child_process'
import {readFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'

const root = new URL('..', import.meta.url)
let css = ''

before(() => {
  execFileSync(process.execPath, [fileURLToPath(new URL('scripts/build.mjs', root))])
  css = readFileSync(new URL('dist/qsp-style.css', root), 'utf8')
})

test('defines every class', () => {
  for (const name of ['page', 'card', 'title', 'label', 'input', 'button', 'link', 'error', 'success']) {
    assert.ok(css.includes(`.qsp-${name}`), `.qsp-${name} missing`)
  }
})

test('no external dependency', () => {
  assert.ok(!css.includes('@import'))
  assert.ok(!css.includes('url('))
  assert.ok(!css.includes('http'))
})

test('dark controls', () => {
  assert.ok(css.includes('color-scheme: dark'))
})

test('narrow popup', () => {
  assert.ok(css.includes('box-sizing: border-box'))
  assert.ok(css.includes('overflow-wrap'))
  assert.match(css, /\.qsp-card \{[^}]*max-width: (100%|min\()/)
})

test('keyboard focus', () => {
  for (const name of ['input', 'button', 'link']) {
    assert.ok(css.includes(`.qsp-${name}:focus-visible`), `.qsp-${name}:focus-visible missing`)
  }
})

test('uses tokens', () => {
  const source = readFileSync(new URL('src/base.scss', root), 'utf8')
  assert.doesNotMatch(source, /#[0-9a-fA-F]{3,8}\b/)
})
