import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
    plugins: [viteSingleFile()],
    build: {
        chunkSizeWarningLimit: 5120, // 5MB limit warning
        cssCodeSplit: false,
        rollupOptions: {
            output: { manualChunks: undefined },
        },
    },
});