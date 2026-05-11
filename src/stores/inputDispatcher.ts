import {defineStore} from 'pinia'
import {useAgentControlStore} from '@/stores/agentControl'

export type InputAction = 'frequ_up' | 'frequ_down' | 'frequ_up_fine' | 'frequ_down_fine' | 'test'

interface KeyboardShortcut {
  code: string
  shiftKey?: boolean
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
      return event.code === shortcut.code
        && event.shiftKey === Boolean(shortcut.shiftKey)
    },
    dispatchAction(action: InputAction) {
      const frequencyIncrement = FREQUENCY_INCREMENT_MAPPING[action]

      if (frequencyIncrement !== undefined) {
        const agentControlStore = useAgentControlStore()
        agentControlStore.increaseFrequency(frequencyIncrement)
        return
      }

      if (action === 'test') {
        console.log('Input action: test')
      }
    },
  },
})
