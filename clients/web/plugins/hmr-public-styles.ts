// Based on:
// - https://github.com/vitejs/vite/issues/3233#issuecomment-842527710
// - https://stackoverflow.com/a/71036343/1116098
import {HmrContext, PluginOption} from "vite";

export default function hmrPublicStyles(): PluginOption {
    return {
        name: 'hmr-public-styles',
        handleHotUpdate({file, server}: HmrContext) {
            if (file.includes('public/styles')) {
                server.ws.send({
                    type: 'full-reload',
                    path: '*'
                });
            }
        }
    };
}
