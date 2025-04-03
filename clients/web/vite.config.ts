import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react-swc'
import hmrPublicStyles from './plugins/hmr-public-styles.ts';

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        hmrPublicStyles()
    ],
})
