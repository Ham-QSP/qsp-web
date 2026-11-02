/*
    Copyright (C) 2026 Florian MAZEN

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'
import tokens from '@ham-qsp/qsp-style/tokens.json'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: 'qspDark',
    themes: {
      qspDark: {
        dark: true,
        colors: {
          'primary': tokens.color.primary,
          'on-primary': tokens.color.onPrimary,
          'background': tokens.color.background,
          'on-background': tokens.color.text,
          'surface': tokens.color.surface,
          'on-surface': tokens.color.text,
          'error': tokens.color.error,
          'success': tokens.color.success,
          'warning': tokens.color.warning,
        },
        variables: {
          'border-color': tokens.color.border,
          'border-opacity': 1,
        },
      },
    },
  },
})
