import { fileURLToPath, URL } from "node:url"; // url o'rniga node:url tavsiya etiladi
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig(({ command, mode }) => {
  return {
    // Electron va Mobile (Capacitor) uchun './' juda muhim. 
    // Webda ham muammosiz ishlashi uchun nisbiy yo'lni qoldiramiz.
    base: './',

    server: {
      host: "0.0.0.0",
      port: 5173,
    },

    define: {
      "process.env": {},
    },

    plugins: [vue()],

    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
        // Agar ~ belgisi bilan muammo bo'lsa, shunday qoldiring:
        "~": fileURLToPath(new URL("./node_modules", import.meta.url)),
      },
    },

    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
      chunkSizeWarningLimit: 2000,
      
      // CommonJS modullarini (masalan, ayrim Electron paketlarini) to'g'ri o'qish uchun
      commonjsOptions: {
        transformMixedEsModules: true,
      },

      rollupOptions: {
        // MIME xatolarini oldini olish uchun external-ni ehtiyotkorlik bilan ishlating
        external: ["emoji-mart-vue-fast/data/all.json"],
        
        output: {
          // Fayl nomlarida chalkashlik bo'lmasligi uchun tartiblaymiz
          entryFileNames: `assets/[name].js`,
          chunkFileNames: `assets/[name]-[hash].js`,
          assetFileNames: `assets/[name]-[hash].[ext]`,
          
          manualChunks(id) {
            if (id.includes('node_modules')) {
              // Kutubxonalarni alohida chunklarga bo'lish (Web tezligi uchun)
              return id.toString().split('node_modules/')[1].split('/')[0].toString();
            }
          }
        }
      }
    }
  };
});