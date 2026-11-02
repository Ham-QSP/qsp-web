import {test} from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'

const repository = new URL('../../../', import.meta.url)

test('no hardcoded colour', () => {
  for (const file of ['src/components/TransceiverControl.vue', 'src/components/AppFooter.vue']) {
    const source = readFileSync(new URL(file, repository), 'utf8')
    assert.doesNotMatch(source, /#[0-9a-fA-F]{6}\b/, file)
    assert.ok(!source.includes('rgba(25'), file)
    assert.ok(!source.includes('Roboto'), file)
  }
})

test('portal theme takes text and border from tokens', () => {
  const source = readFileSync(new URL('src/plugins/vuetify.ts', repository), 'utf8')
  assert.ok(source.includes("'on-background': tokens.color.text"))
  assert.ok(source.includes("'on-surface': tokens.color.text"))
  assert.ok(source.includes("'border-color': tokens.color.border"))
})

test('dividers use the border token', () => {
  const source = readFileSync(new URL('src/App.vue', repository), 'utf8')
  assert.match(source, /\.v-divider\s*\n\s*color: rgb\(var\(--v-border-color\)\)/)
})
