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
