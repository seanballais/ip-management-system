import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react-swc'
import hmrPublicStyles from './plugins/hmr-public-styles.ts';

// https://vite.dev/config/
export default defineConfig({
    base: '/',
    plugins: [
        react(),
        hmrPublicStyles()
    ],
    preview: {
        port: 8080,
        host: true,
        strictPort: true
    },
    server: {
        port: 8080,
        strictPort: true,
        host: true,
        origin: 'http://0.0.0.0:8080',
        watch: {
            usePolling: true
        }
    }
})
