import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';
import path, {dirname, resolve} from 'path';
import {fileURLToPath} from 'url';

	const __filename = fileURLToPath(import.meta.url);
	const __dirname = dirname(__filename);

 export default defineConfig({
 	root: './',
 	plugins: [vue()],
 	resolve:{
 		alias: {
 			'@': path.resolve(__dirname,'src'),
 			'@composables': path.resolve(__dirname,'./src/composables'),
 			// '@components': path.resolve(__dirname,'./src/components')
 			// 'pinia': resolve(__dirname, 'node_modules/pinia/dist/pinia.mjs')
 		},
 		// dedupe: [ 'vue', 'pinia', 'vue-router' ]
 	},
 	server:{
 		port: 5173,// differet (el puerto fue variado en el swtich controlado)
 	},
 
 });

 /*Nota el src  era src_ref y el src_legacy fue src*/