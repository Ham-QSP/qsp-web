/*
 * Copyright 2026 Florian MAZEN
 * SPDX-License-Identifier: Apache-2.0
 *
 * Generates the CSS and SCSS variables from tokens.json and compiles the base styles.
 */

import {mkdirSync, readFileSync, writeFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import * as sass from 'sass'

const REQUIRED_TOKENS = {
  color: ['primary', 'onPrimary', 'background', 'surface', 'border', 'text', 'textSecondary', 'error', 'success', 'warning'],
  font: ['sans', 'mono'],
  radius: ['control', 'card'],
}

export function validateTokens(tokens) {
  for (const [group, names] of Object.entries(REQUIRED_TOKENS)) {
    for (const name of names) {
      const value = tokens?.[group]?.[name]
      if (typeof value !== 'string' || value.trim() === '') {
        throw new Error(`Missing token: ${group}.${name}`)
      }
    }
  }
}

function kebab(name) {
  return name.replace(/[A-Z]/g, (letter) => '-' + letter.toLowerCase())
}

function entries(tokens) {
  validateTokens(tokens)
  return Object.entries(REQUIRED_TOKENS).flatMap(([group, names]) =>
    names.map((name) => [`qsp-${group}-${kebab(name)}`, tokens[group][name]]))
}

export function renderCssVariables(tokens) {
  const lines = entries(tokens).map(([name, value]) => `  --${name}: ${value};`)
  return `:root {\n  color-scheme: dark;\n${lines.join('\n')}\n}\n`
}

export function renderScssVariables(tokens) {
  return entries(tokens).map(([name, value]) => `$${name}: ${value};`).join('\n') + '\n'
}

function luminance(hex) {
  const channels = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255)
  const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrastRatio(hexA, hexB) {
  const [light, dark] = [luminance(hexA), luminance(hexB)].sort((a, b) => b - a)
  return (light + 0.05) / (dark + 0.05)
}

function build() {
  const root = new URL('..', import.meta.url)
  const tokens = JSON.parse(readFileSync(new URL('tokens.json', root), 'utf8'))
  const base = sass.compile(fileURLToPath(new URL('src/base.scss', root)), {style: 'expanded'}).css

  mkdirSync(new URL('dist', root), {recursive: true})
  writeFileSync(new URL('dist/_tokens.scss', root), renderScssVariables(tokens))
  writeFileSync(new URL('dist/qsp-style.css', root), renderCssVariables(tokens) + '\n' + base + '\n')
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  build()
}
