/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SIGNALING_SERVER_PREFIX: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
