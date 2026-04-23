import { createApp } from 'vue';
import router from '@/router/index.js';
import { initializeFirebaseStorage } from '@/config/initializeFirebaseConf.ts'; //configuracion Firebase centralizado
import { createPinia} from 'pinia';  // # Aniadir pinia
import '@/assets/styles/materialColors.css';
import App from '@/App.vue';
 
  // Inicializacion de Firebase
 const { auth, db, storage } = initializeFirebaseStorage();


 // modulos de Pinia & Vue
 const pinia = createPinia();
 const app   = createApp(App);

 app.use(pinia);
  // console.log('Nacio el edo de Autorizacion: ', pinia);
 // console.log('Habilitar Pinia', enabled);

  // Iniciar la App de montaje
 // import {useAuthStore3} from '@/stores/authStore3.ts';

 // const authStore3 = useAuthStore3();
 //  const result = await authStore3.initializeFirstUser();
 //  console.log('[Primer Uso] Credenciales:', result);
  // Iniciar Ambos modulos 
 app.use(router);
 app.mount('#app');


   //  o bien: F(n) de apoyo Alternativo, deberia ayudar, y enviar de inmediato al primer acceso
 /* async  function sysInitialization() {
      const authStore3 = useAuthStore3();
       await authStore3.initializeFirstUser();
      authStore3.initAuthListener();
      Al iniciar su primera creacion, no ingresa en el metodo. En consec, la inter. no tiene sentido
   }*/

// npm install -D tailwindcss@latest postcss@latest autoprefixer@latest [ready]