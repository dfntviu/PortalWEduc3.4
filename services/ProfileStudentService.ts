 import {createUserWithEmailAndPassword,updatePassword,reauthenticateWithCredential,EmailAuthProvider,getAuth} from 'firebase/auth';
 import {doc,addDoc,setDoc, collection} from 'firebase/firestore'; //colecciones
 import {getStorage, ref, uploadBytes,getDownloadURL} from 'firebase/storage';  // almacenamiento
 import {BaseProfileService} from './BaseProfileService.ts';
 import { initializeFirebaseStorage } from '@/config/initializeFirebaseConf.ts';
 // import { StorageService } from './StorageService';
 import type {Profile} from '@/interfaces/Profile.types.ts';

 interface ProfilePhotoOptions {
  	 uploadPhoto: boolean;
  	 photoFile?: File;
  	 photoURL?: string;
  }
  
  const { auth, db } = initializeFirebaseStorage();

  export class ProfileStudentService {
  	// private static readonly COLLECTION_1 = 'student_register';; //*
    private static readonly COLLECTION_2 = 'teacher_register';
  	private static readonly STORAGE_PATH = 'profiles_students';   //-> collecion de Imagenes
    private static readonly collectionNameR1 = 'student_register'
      private static readonly COLLLECTION_PROFILE = 'student';   // a prueba

  	/**
  	 * Guarda un perfil de estudiante con foto opcional
  	 * @param data - Datos del perfil
  	 * @param photoOptions - Opciónes de la foto(opc)
  	 * Unica y exclusivamente para ESTUDIANTES [Alumnos] */
  	static async saveStudentProfile(
  		 data: Partial<Profile>,
         uid_student: string,
  		 photoOptions?: ProfilePhotoOptions
  		): Promise<void>{
            // revisar condicion d la 34
  		try{
          console.log('[Service] photoOptions:', photoOptions);
  			if (!uid_student) {
  				throw new Error('El Uid del Estudiante es requerido');
  			}
  			console.log('[ProfileStudentService] Guardar perfil del Estudiante:',data.uid_student);

  			 // Habilitar cuando este 100% funcional [esta funcional 14/05/26]
  			// Procesar foto que se requiere 
              let photoURL = data.photoURL || '';
              let photoCount = data.photoCount ?? 0;
            if (photoOptions?.uploadPhoto && photoOptions.photoFile) { 
  			 	   ({photoURL,photoCount} = await this.uploadProfilePhoto2(uid_student, photoOptions.photoFile,0));
                  console.log('[Service] entra al if?:', !!photoOptions?.uploadPhoto && !!photoOptions?.photoFile);
            }

  			// Preparar datos para Firestore
  			const studentData: Partial<Profile> = {
  				...data,
  				role: 'student' as const,
                uid_student, //el parametro unico definido
                email: data.email ?? '',
                edad: data.edad ?? null,  // *apply change*
                carrera: data.carrera ?? '',   // *apply change*
                nombre: data.nombre,
                apellido: data.apellido,
                passwd : data.password,  // *apply change*
                typeDoc: data.typeDocument ?? '',  // *apply change*
                photoURL,  // Direccion electronica de la foto *
                photoCount,  // Contador de Fotos *
  				createdAt: data.createdAt || new Date(),
  				updateAt: new Date(),
                size: file.size, //atributo nuevo: tamanio por Material
  			};
            // El objeto enriquecido(directo), no crudo(su propiedad), para eso es el 2do arg
  			const profile = await BaseProfileService.saveProfileRoles(this.collectionNameR1,uid_student,studentData);
  			
                console.log('[ProfileStudentService] Perfil guardado exitosamente ');
            return profile; //pasao clave
  		}catch(error: any){
  			 console.error('[ProfileStudentService] Error al guardar perfil: ',error);
  			 throw new Error(`Error al guardar perfil de estudiante: ${error.message}`);
  		}
  	}

    static async createAccountEmailAndPassword(email:string , password:string ){
    try{
        console.log('Visitando la f(n)');
         // 0. Obtener la referencia a Firebase
        const auth = getAuth();
        console.log('Inf. del autetificacion: ', auth);
      console.log()
        // 1. Metodo para traer la credenciales de firebase
            const  userCredential = await createUserWithEmailAndPassword(auth,email,password);
        // 2. Extraer el usuario creado
            const user = userCredential.user;
            console.log('Inf. de Primer role1 - Prof: ', user); //genera uid
    
        // 3. Asociar la coleccion con las credenciales(base para profesor)
            const reference = doc(db,this.COLLECTION_2, user.uid);
              await setDoc(reference, { email: user.email, uid_profesor: user.uid, status: 'active'});
            console.log('Usuario > ',user);
        // 4. devolver el usuario con la coleccion 
              return user;
    }catch(error){
      console.error('[ProfileTeacherService]: Error al crear usuario de profesor con email y contraseña', error);
        throw error;
    }
  }

  	/**
  	 * Obtiene un perfil de estudiante con su UID
  	 * @param uid - ID del usuario
  	 * @param Perfil encontrado o null sino existe
  	 * */
  	static async getStudentById(uid: string): Promise<Profile | null> {
  		try{
  			console.log('[ProfileStudentService] 🔎Obteniendo Perfil del Estudiante: ',uid);

  			const profile = await BaseProfileService.getProfile(this.collectionNameR1,uid);  //* las colecciones deben coincidir

  			if (profile) {
  				console.log('Estudiante Encontrado');
  			}else{
  				console.log('Estudiante NO Encontrado');
  			}
  			return profile;
  		}catch(error: any){
  			console.error('❌ Error al Obtener al Estudiante');
  			 throw error;
  		}
  	}

  	/**
  	 * Analiza el  perfil del estudiante con foto opcional
  	 * @param uid - ID del Usuario
  	 * @param updates - Campos a Actualizar
  	 * @param photoOptions - Opciones de foto
  	 * */
  	static async updateStudentProfile(uid: string, updates: Partial<Profile>, photoOptions?: ProfilePhotoOptions): Promise<void>{
  		try{  //debes pasar por Welcome
            // Validacion exp (solo por si acaso)
            if (!uid || uid.trim().length === 0) {
                throw new Error('El uid del Estudiante es requerido para actualizar..');
            }

             let updatedData: Partial<Profile> = { ...updates };

                if (photoOptions?.uploadPhoto && photoOptions.photoFile) {

                  // 1. Leer photoCount REAL de Firestore antes de cualquier operación
                  const currentProfile = await this.getStudentById(uid);
                  const counter_actual  = currentProfile?.photoCount ?? 0;

                  // 2. Desestructurar correctamente — no asignar el objeto completo
                  const { photoURL, photoCount } = await this.uploadProfilePhoto2(
                    uid,
                    photoOptions.photoFile,
                    counter_actual  // ← valor real, no updates.photoCount
                  );

                  updatedData.photoURL   = photoURL;   // string limpio
                  updatedData.photoCount = photoCount; // número incrementado

                } else if (photoOptions?.uploadPhoto === false) {
                  // 3. photoURL declarada aquí para que exista en este scope
                  const currentProfile = await this.getStudentById(uid);
                  console.log('[ProfStudentServ] 🗑️ Eliminando foto:', currentProfile?.photoURL);
                  await this.deleteProfilePhoto(uid);
                  updatedData.photoURL   = '';
                  updatedData.photoCount = 0;
                }

                updatedData.updateAt = new Date();
                await BaseProfileService.updateProfile(this.collectionNameR1, uid, updatedData);
                console.log('[ProfileStudentService] ✅ Perfil actualizado exitosamente');
              // return {update, photoCount: counter_updated};
  		}catch(error: any){
  			console.error('ProfileStudentService Perfil NO FUE actualizado exitosamente',error);
            console.error('[ProfStudentServ]✅ Contexto de Sub de la Act.  del Perfil: ',{
                uid, updates, photoOptions, collection: this.collectionNameR1,
            });
  			 throw new Error(`Error al actualizar tú Perfil : ${error.message}`);
  		}
  	}

  	/**
  	 * Obtiene todos los Estudiantes Registrados
  	 * @param limit - Limite de resultados
  	 * @param Array de Perfiles de Estudiante
  	 * */
  	static async getAllStudents(limit?: number): Promise<Profile[]> {
  	 	try{
  	 		console.log('[ProfileStudentService]: 🔎Obteniendo todos los estudiates..');

  	 		const students = BaseProfileService.getAllProfiles(this.COLLECTION_1, limit);

  	 		console.log(`[ProfileStudentService] ✅ ${student.length} estudiantes obtenidos`);

  	 		return students;
  	 	}catch(error: any){
  	 		console.error('[ProfileStudentService] ❌ Error al obtener estudiantes: ',error);
  	 		throw error;
  	 	}
  	}

  	/**
  	 * Busca estudiantes por email
  	 * @param email  - Email del estudiante
  	 * @param Perfil del Estudiante
  	 * */
  	static async getStudentByEmail(email: string): Promise<Profile | null> {
  	 	try{
  	 		console.log('[ProfileStudentService] 🔍 Buscando Estudiante por Correo-Elec:', email);

  	 		const student = BaseProfileService.getProfileByEmail(this.COLLECTION_1, email);

  	 		if (student) {
  	 			console.log('[ProfileStudentService]✅ Estudiante Encontrado por E-mail');
  	 		}else{
  	 			console.log('[ProfileStudentService] ❌Estudiante NO Encontrado por E-mail');
  	 		}

  	 		return student;
  	 	}catch(error: any){
  	 		console.log('[ProfileStudentService] ❌ Error en la búsqueda por E-mail: ',error);
  	 		throw error;
  	 	}
  	}
    /**
     * Busca estudiantes por nombre(busq parcial)
     * @param email  - Term de busqueda
     * @param Array de perfiles que coinciden
     * */
    static async searchStudentByName(searchTer: string): Promise<Profile[]> {
        try{
                console.log('');
            const allStudents = await this.getAllStudents();
            const term = searchTer.toLowerCase();

                const results = allStudents.filter(student =>{
                    const fullName = `${student.nombre} ${student.appellidos}`.toLowerCase();
                      return fullName.includes(term);
                });
                console.log('')
                return results;
        }catch(error:any){
            console.log('');
            throw error;
        }
    }   
    /**
     * Desactiva el perfil del estudiantes 
     * @param email  - Email del estudiante
     * @param Perfil del Estudiante
     * */
    static async deleteStudent(uid: string): Promise<void> {
        try{
            this.deleteProfilePhoto(uid);

            await BaseProfileService.deleteProfile(this.COLLECTION_1,uid);

            console.log('');
        }catch(error: any){
            console.log('')
            throw error;
        }
    }

    /**
     * Sube la Foto de Perfil del estudiante
     * @param uid - UID del estudiante
     * @param file - Archivo de imagen
     * @returns URL de la foto subida
     * */
    static async uploadProfilePhoto(uid:string, file:File): Promise<string> {
        try{
            const filePath =  `${this.STORAGE_PATH}/${uid}/profile. ${file.name.split('.').pop()}`;
            const downloandURL = StorageService.uploadFile(file, filePath);
            
            console.log('')
            return downloandURL;
        }catch(error: any){
            console.error('');
            throw new Error('');
        }
    }

    private static async uploadProfilePhoto2(uid:string, photoFile:File, currentCount: number):
     Promise<{photoURL: string, photoCount: number}>
    {
        const storage = getStorage();
        const nextCount = currentCount + 1;
        const index = String(nextCount).padStart(2,'0');


        // 1.Crear el directorio raiz mediante Firestore y añadir el cambio [new] 
           await addDoc(collection(db, this.STORAGE_PATH),{
                fileName:`/imgProfile${index}`, //indice convencion imagen
                photoCount: nextCount,
                createdAt: new Date(),
           });

           // 2. referenciar correctamente al Storage p/guardar perfiles
        const storageReference = ref(storage,`${this.STORAGE_PATH}/${uid}/imgProfile${index}`);
            // 2a) recibir archivos binarios [distintos formatos imagen]
          await uploadBytes(storageReference,photoFile);
          const photoURL = await getDownloadURL(storageReference);

          return {photoURL,photoCount: nextCount};
    }
    /**
     * Elimina la foto de perfil del Estudiante
     * @param uid  - UID del estudiante
     * */
    static async deleteProfilePhoto(uid:string): Promise<void> {
        try{
            const folderPath = `${this.STORAGE_PATH}/${uid}`;
             await StorageService.deleteFolder(folderPath);

            console.log('[ProfileStudentService] ✅ Foto de perfil eliminada');
        }catch(error: any){
            console.warn('[ProfileStudentService]:No se pudo eliminar la foto', error);
        }
    }
     /**
    * Verifica si un estudiante tiene foto de perfil
    * @param uid - UID del estudiante
    * @returns true si tiene foto, false si no
    */
    static async hasProfilePhoto(uid: string): Promise<boolean> {
      try {
          const profile = await this.getStudentById(uid);
          return !!(profile?.photoURL);
      } catch (error) {
         return false;
     }
    }

    //*
    static async hasProfilePhotoStudent(uid: string): Promise <{}>{

        try{
            const students = await this.getAllStudents();

            const stats = {
                total: students.length,
                whithPhoto: students.filter(s => s.photoURL).length,
                whithoutPhoto: students.filter(s => !s.photoURL).length,
                active: students.filter(s => s.activo !==false).length
            };
                 console.log('[ProfileStudentService] 📊 Estadísticas:', stats);
            return stats;
        }catch(error: any){
            console.log('[ProfileStudentService] ❌ Error al obtener estadísticas:', error);
        }
    }
    /*Cambiar la contraseña del usuario: Es recomendable utilizar 
     cuentas de correo reales, en caso de que la cuenta llegara a bloquearse
     Si se tiene una falsa, firebase nunca enviaría un email para recuperar la cuenta.
     Y esta seria irrecuperable*/
    static async changePasswordStudent(data){
        console.warn('He ingresado al Servicio [C3]..')
        // P0 Destructurar las propiedades en el objeto Data
        const { passwd, newPassword }= data;
    try{
        // P1 Obtener al usuario
       const user_current = auth.currentUser;
        // PAux Validar que el usuario tenga la sesion activa
         if (!user_current || !user_current.email) {
           throw new Error("No hay usuario autenticado")
         }
         // Debbugging
         console.log('Email:', user_current.email);
         console.log('Passwd actual recibida:', passwd);
            
           // Obligar al alumno a tener contrasenia de longitud definida
         if (!newPassword || newPassword.length<8) {
            return {success: false, error:'La nueva contraseña es invalida'};
         }  //Usuario DEMO: DGomezP391
         /*P1. Obtener la reutenticacion de credenciales*/
         const credential = EmailAuthProvider.credential(user_current.email,passwd);
           await reauthenticateWithCredential(user_current, credential);
           console.log('1️⃣ Reautenticación OK');

           console.log('2️⃣ Nueva Contraseña aplicar: ',JSON.stringify(newPassword));

          /*P3 ActualizaR la contrasenia*/
           await updatePassword(user_current, newPassword);
           console.log('3️⃣ Actualizacion de Contraseña COMPLETADO')
           return {success: true}

    }catch(error){
       console.error('[PerfilServicioEstudi]- Error especifíco',error.code, error.message);
       return {success: false, error: error.message};
        // throw error;
    }
  }

  	//security Stg$$##$ <!- ABCda [-..1|^2..-]-->%%#%
  }