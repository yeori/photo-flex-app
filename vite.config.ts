import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    dts({
      copyDtsFiles: false,
      insertTypesEntry: true,
      rollupTypes: true,
      staticImport: true,
    }),
  ],
  build: {
    sourcemap: true,
    emptyOutDir: true,
    lib: {
      entry: 'src/index.ts',
      name: 'PhotoFlex',
      fileName: 'photo-flex',
    },
  },
})
