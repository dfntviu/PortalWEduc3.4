/**
 * @service BaseProfileService
 * @description Servicio base para operaciones CRUD en perfiles de Firestore
 * @Proposito 
 * - Eliminar duplicacion entre ProfileStntServ y ProfileTeacherSrv
 * - Centralizar lógica común de Firestore
 * - Facilitar el matenimiento(cambia 1, afecta a todos) 
 * 
 * Uso:
 * - Los servicios especifícos(Student/Teacher) delegan a este servicio Base
 * - Este servicio NO se usa directamente desde stores/vistas
 * */
import {  getFirestore, doc, setDoc, getDoc,
      collection, query, where, getDocs,
       updateDoc, deleteDoc,serverTimestamp, type Timestamp } from 'firebase/firestore';
  import type { Profile } from '@/types/interf.index.ts';

  export class BaseProfileService {
   /*F(n) en Fase de RunTime(Ejecucion)*/
   static async saveProfileRoles(collectionName: 'student_register' | 'teacher_register', uid: string, data:Partial<Profile>): Promise <void>{
      try{
         const db = getFirestore();
         console.log(`[BaseProfileService] Guardando perfil en '${collectionName}':`, uid);

         const role = collectionName === 'student_register' ? 'student' : 'teacher';
         const uid_role_key = `uid_${role}`as const;

          // --- Base compartida, los atributos que ambos roles comparten--- 
           const baseData = {
             uid,
             [uid_role_key]: uid,
             role,
             nombre: data.nombre ?? '',
             apellido: data.apellido ?? '',
             email: data.email ?? '',
           }

           const profileData =
               collectionName === 'student_register'
                ? {
                   ...baseData,
                   uid_student: uid,
                   createAt: data.createAt ?? serverTimestamp(),
                   carrera: data.carrera ?? '', //*
                   edad: data.edad ?? null, //*
                   typeDoc: data.typeDocument ?? '', //*
                   passwd: data.password,
                }
                :{
                  // No guarda Numero de Cuenta y apellido del prof
                   ...baseData,
                   uid_teacher:  uid,
                   // lname: data.lname ?? '',
                   numCuenta: data.numCuenta ?? '',
                 };

                 const docReference = doc(db, collectionName, uid);
                 await setDoc(docReference, profileData);
                 console.log(`[BseProfileService] El perfil fue guardado Exitosamente en  ${collectionName} `)

                 return profileData;
      }catch(error: any){
          console.error('[BaseProfileService] ❌ Error al guardar perfil:', error);
            throw new Error(`Error al guardar perfil en ${collectionName}: ${error.message}`);
      }
   }
   /**
     * Guarda un perfil completo en Firestore
     * @param collectionName - Nombre de la colección ('students' o 'teachers')
     * @param uid - ID del usuario (debe coincidir con Firebase Auth)
     * @param data - Datos del perfil a guardar
     */        //es funcional solo para registro de Profesores
   /*static async saveProfile(collectionName: 'student_register' | 'teacher_register', uid: string, data: Partial<Profile>): Promise<void> {
  	  	try {
            const db = getFirestore();
            console.log(`[BaseProfileService] Guardando perfil en '${collectionName}':`, uid);

            const role = collectionName === 'student_register' ?  'student' : 'teacher';
            const uid_role_key =  `uid_${role}` as const;
            
            // Preparar datos para Firestore
            const profileData = {
            	...data,
            	uid,
               [uid_role_key]: uid,  //simetrico al rol
                name: data.name ?? '',
                lname: data.lname ?? '',
                email: data.email ?? '',
                numCuenta: data.numCuenta ?? '',
            	status: 'active',
            	createAt: data.createAt ?? serverTimestamp(),
            	updateAt: serverTimestamp(),
            }
               //  C2.2 - Composicion-01 Teacher, las propiedades se reciben vacias en Firestore
            const docRef = doc(db, collectionName, uid);
            await setDoc(docRef, profileData);

             console.log(`[BaseProfileService] ✅ Perfil guardado exitosamente en '${collectionName}'`);

  	   }catch (error: any) {
            console.error('[BaseProfileService] ❌ Error al guardar perfil:', error);
            throw new Error(`Error al guardar perfil en ${collectionName}: ${error.message}`);
      }
   }*/

    	/**
     	* Obtiene un perfil por su UID
     	* @param collectionName - Nombre de la colección
     	* @param uid - ID del usuario
     	* @returns Perfil encontrado o null si no existe
    	 */

   static async getProfile(collectionName:'student_register' | 'teacher_register', uid: string): Promise<Profile| null> {
     	 try{

     	 	const db = getFirestore();
            const docRef = doc(db, collectionName, uid);

            
     	 	  console.log(`[BaseProfileService] ✅ Obteniendo Perfil de ${collectionName}: `, uid);

     	 	     const docSnap = await getDoc(docRef);

     	 	     if (docSnap.exists()) {
     	 	     	 const data = docSnap(docRef);
     	 	     	 	console.log(`[BaseProfileService] ✅  Perfil Encontrado`);

     	 	     	    return{
     	 	     	   	  uid: docSnap.id,
                    	  ...data
     	 	     	    } as Profile;
     	 	    }
     	 	     	  console.log(`[BaseProfileService] ⚠️ Perfil no encontrado`);
				    return null;

     	 }catch(error: any){
     	 	console.error('[BaseProfileService] ❌ Error al obtener perfil:', error);
            throw new Error(`Error al obtener perfil: ${error.message}`);
     	 }
   }

    /**
     	* Act. los campos especificos de tu perfil 
     	* @param collectionName - Nombre de la colección
     	* @param uid - ID del usuario
     	*  @param updates - Campos a actualizar
     	* 
    	 */
      static async updateProfile(collectionName: 'students' |'teachers', uid: string, updates: Partial<Profile>):Promise<void>{
       		try{

	     	 	const db = getFirestore();
	            const docRef = doc(db, collectionName, uid);

	            
	     	 	  console.log(`[BaseProfileService] ✅ Actualizando Perfil en ${collectionName}: `, uid);

	     	 	     await updateDoc(docRef,{
	     	 	     	...updates,
	     	 	     	updatedAt: serverTimestamp(),
	     	 	     });

					 console.log(`[BaseProfileService] ⚠️ Perfil Actualizado`);

     	 	}catch(error: any){
     	 		 console.error('[BaseProfileService] ❌ Error al actualizar perfil:', error);
     	 		  throw new Error(`Error al actualizar perfil: ${error.message}`);
     	 	}
      }

       /**
     * Obtiene todos los perfiles de una colección (con límite opcional)
     * @param collectionName - Nombre de la colección
     * @param limit - Límite de resultados (opcional)
     * @returns Array de perfiles
     */
   static async getAllProfiles(collectionName: 'students' | 'teachers', limit?: number): Promise<Profile[]> {
    		try{
    		
    			     	 	const db = getFirestore();
    			            const collectionRef = doc(db, collectionName, uid);
    	
    			     	 	  console.log(`[BaseProfileService] ✅ Obteniendo todos los Perfiles de ${collectionName}: `);

    			     const snapshot = getDocs(collectionRef);

    			     let profiles = snapshot.docs.map(doc =>({
    			     	uid: doc.id,
    			     	...doc.data()
    			     })) as Profile[];

    			     // Aplicar limite si se especifica
    			     if (limit) {
    			     	profiles = profiles.slice(0,limit);
    			     }

    			    	console.log(`[BaseProfileService] ${profiles.length} perfiles obtenidos`);

    			    return profiles;
    		}catch(error: any){
    			 console.error('[BaseProfileService] ❌ Error al obtener perfiles:', error);
    			 throw new Error(`Error obtenido al obtener perfiles: ${error.message}`);
    		}
   }

    /**
     * Busca perfs x email
     *  @param  collectionName - Nombra la coleccion
     * @param email - Email a buscar
     * @param Perfil encontrado o nulo*/
    static async getProfileByEmail(collectionName: 'students' | 'teachers', email: string):Promise<Profile[]> {

     	try{
     	    		
     	    	const db = getFirestore();
    	    const collectionRef = doc(db, collectionName, uid);

			const qr = query(collectionRef(collectionRef,where('email', '==', email)));
			const snapshot = await getDocs(qr);

			if (snapshot.empty) {
				return null;
			}

     	    	const doc = snapshot.docs[0];
	
			return{
 	 	     	   	  uid: doc.id,
                	  ...doc.data()
 	 	     	    } as Profile;
     	}catch(error: any){
     	    console.error('[BaseProfileService] ❌ Error al buscar por email:', error);
     	     throw new Error(`Error al buscar perfil: ${error.message}`);
     	}
    }
  /**
     * Elimina el perfil
     *  @param  collectionName - Nombra la coleccion
     * @param uid: ID del usuario
     * */

   static async deleteProfile(collectionName: 'students' | 'teachers', uid: string):Promise<void>{
    	try{
    	    		
    	    			const db = getFirestore();
    	    			const collectionRef = doc(db, collectionName, uid);
    	    			console.log(`[BaseProfileService] ✅ Desactivando Perfil en ${collectionName}: `);

    	    	 await updateDoc(docRef,{
	     	 	     	...updates,
	     	 	     	updatedAt: serverTimestamp(),
	     	 	     });

    			console.log(`[BaseProfileService] El perfil se ha  sido desactivado`);
    	}catch(error: any){
    		  console.error('[BaseProfileService] ❌ Error al eliminar perfil:', error);
            throw new Error(`Error al eliminar perfil: ${error.message}`);
    	}
   }


     /**
     * Busca permanentemente el perfil(hard-delete)
     *  @param  collectionName - Nombra la coleccion
     * @param uid: ID del usuario*/
   static async hardDeleteProfile(collectionName: 'students' | 'teachers', uid: string): Promise<void> {
		try{
 	    		
 	    	const db = getFirestore();
	    const docRef = doc(db, collectionName, uid);

	     console.warn(`[BaseProfileService] ⚠️ ELIMINACIÓN PERMANENTE en '${collectionName}':`, uid);

	     await deleteDoc(docRef);

	      console.log(`[BaseProfileService] ✅ Eliminado permanentemente`);
	  }catch(error: any){
		 console.error('[BaseProfileService] ❌ Error al eliminar permanentemente el perfil');
		 throw new Error(`Error al eliminar Perfil ${error.message}`);
	  }
   }

  }