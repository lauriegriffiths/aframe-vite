
import { defineConfig } from 'vite'
import mkcert from 'vite-plugin-mkcert'

export default defineConfig(({ command }) => ({
  // GitHub Pages serves from /aframe-vite/; dev server uses root
  base: command === 'build' ? '/aframe-vite/' : '/',
  // mkcert generates local SSL certs — not needed (and broken) in CI
  plugins: command === 'serve' ? [mkcert()] : [],
}))
