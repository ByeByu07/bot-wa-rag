/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_WHATSAPP_API_URL: string
  readonly VITE_APP_NAME: string
  // Add more env variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 