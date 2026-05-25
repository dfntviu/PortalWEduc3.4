import { createApp } from 'vue';
import router from '@/router/index.js';
import { initializeFirebaseStorage } from '@/config/initializeFirebaseConf.ts'; //configuracion Firebase centralizado
import { createPinia} from 'pinia';  // # Aniadir pinia
import  '@/assets/main.css'
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
 
    // Recorte 01 - Metodo funcional sin vite
 /* async  function sysInitialization() {
      const authStore3 = useAuthStore3();
       await authStore3.initializeFirstUser();
      authStore3.initAuthListener();
      Al iniciar su primera creacion, no ingresa en el metodo. En consec, la inter. no tiene sentido
   }*/

   // Recorte 02 - Metodo funcional con vite + Sistema al 98%, utilizarlo cuando  se termine de limpiar
   // y los parches sean innecesarios -> watch e inmediate(solo es una solucion parcial) la tota es iniciar
   // desde el inicio de Vue
 /* import { onAuthStateChanged, getAuth } from 'firebase/auth';
  const  authStore3 = useAuthStore3();
 const initApp = async ()=>{
  await new Promise ((resolve) => {
     const unsuscribe = onAuthStateChanged(getAuth(), () => {
        authStore3.isInitialized = true;  # importarlo #
         unsuscribe();
         resolve();
     });
  });
 app.mount('#app');
}
 initApp()*/
