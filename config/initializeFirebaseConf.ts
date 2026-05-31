 // 📁 - VERSIÓN SEGURA 

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

export const initializeFirebaseStorage = () => {
   const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
        measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
   };
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(app); //*Importante gracias a esto se puede ver la conexion en todo el FrontEnd*
    const storage = getStorage(app);

    return { app, db, auth, storage, firebaseConfig };
      // console.log('Conexion Satisfactoria, Gracias por usar Firebase');
};
   /*console.log('Clave de Acceso:' ,import.meta.env.VITE_FIREBASE_API_KEY);
     console.log('Clave de Acceso- ',firebaseConfig.apiKey);
     AIzaSyD4B3irImFN1Tc-TtbWfaHSKuaAI_CvQrg*/

// Verificar la 2da referencia del script de configuracion