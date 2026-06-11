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

import {defineStore} from 'pinia'
import {useAgentControlStore} from '@/stores/agentControl'

export type InputAction = 'frequ_up' | 'frequ_down' | 'frequ_up_fine' | 'frequ_down_fine' | 'mode_next' | 'test'

interface KeyboardShortcut {
  code?: string
  key?: string
  shiftKey?: boolean
  ctrlKey?: boolean
}

type KeyboardMapping = Record<InputAction, KeyboardShortcut>
type FrequencyIncrementMapping = Partial<Record<InputAction, number>>

const DEFAULT_KEYBOARD_MAPPING: KeyboardMapping = {
  frequ_up: {
    code: 'ArrowUp',
  },
  frequ_down: {
    code: 'ArrowDown',
  },
  frequ_up_fine: {
    code: 'ArrowUp',
    shiftKey: true,
  },
  frequ_down_fine: {
    code: 'ArrowDown',
    shiftKey: true,
  },
  mode_next: {
    key: 'm',
    ctrlKey: true,
  },
  test: {
    code: 'Enter',
  }
}

const FREQUENCY_INCREMENT_MAPPING: FrequencyIncrementMapping = {
  frequ_up: 1000,
  frequ_down: -1000,
  frequ_up_fine: 100,
  frequ_down_fine: -100,
}

export const useInputDispatcherStore = defineStore('inputDispatcher', {
  state: () => {
    const keyboardMapping = ref<KeyboardMapping>({...DEFAULT_KEYBOARD_MAPPING})

    return {keyboardMapping}
  },
  actions: {
    dispatchKeyboardEvent(event: KeyboardEvent) {
      const action = Object.entries(this.keyboardMapping).find(([, shortcut]) =>
        this.eventMatchesShortcut(event, shortcut)
      )?.[0] as InputAction | undefined

      if (action === undefined) {
        return
      }

      event.preventDefault()
      this.dispatchAction(action)
    },
    eventMatchesShortcut(event: KeyboardEvent, shortcut: KeyboardShortcut) {
      return (shortcut.code === undefined || event.code === shortcut.code)
        && (shortcut.key === undefined || event.key.toLowerCase() === shortcut.key.toLowerCase())
        && event.shiftKey === Boolean(shortcut.shiftKey)
        && event.ctrlKey === Boolean(shortcut.ctrlKey)
    },
    dispatchAction(action: InputAction) {
      const frequencyIncrement = FREQUENCY_INCREMENT_MAPPING[action]
      const agentControlStore = useAgentControlStore()

      if (frequencyIncrement !== undefined) {
        agentControlStore.increaseFrequency(frequencyIncrement)
        return
      }

      if (action === 'mode_next') {
        agentControlStore.selectNextMode()
        return
      }
    },
  },
})
