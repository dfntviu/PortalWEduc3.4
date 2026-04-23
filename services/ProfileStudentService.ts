 import {createUserWithEmailAndPassword,getAuth} from 'firebase/auth';
 import {doc,setDoc} from 'firebase/firestore';
 import {BaseProfileService} from './BaseProfileService.ts';
 import { initializeFirebaseStorage } from '@/config/initializeFirebaseConf.ts';
 // import { StorageService } from './StorageService';
 // import type {Profile} from '@/interfaces/Profile.types.ts';

 interface ProfilePhotoOptions {
  	 uploadPhoto: boolean;
  	 photoFile?: File;
  	 photoURL?: string;
  }
  
  const { auth, db } = initializeFirebaseStorage();

  export class ProfileStudentService {
  	// private static readonly COLLECTION_1 = 'student_register';; //*
    private static readonly COLLECTION_2 = 'teacher_register';
  	private static readonly STORAGE_PATH = 'profiles_students';
    private static readonly collectionNameR1 = 'student_register'

  	/**
  	 * Guarda un perfil de estudiante con foto opcional
  	 * @param data - Datos del perfil
  	 * @param photoOptions - Opciónes de la foto(opc)
  	 * */
  	static async saveStudentProfile(
  		 data: Partial<Profile>,
         uid_student: string/*,
  		 photoOptions?: ProfilePhotoOptions*/
  		): Promise<void>{
            // revisar condicion d la 34
  		try{
  			if (!uid_student) {
  				throw new Error('El Uid del Estudiante es requerido');
  			}
  			console.log('[ProfileStudentService] Guardar perfil del Estudiante:',data.uid_profe);

  			// Procesar foto que se requiere
  			 // let photoURL = data.photoURL || '';

  			/*if (photoOptions?.uploadPhoto && photoOptions.value.photoFile) {
  			 	console.log('[ProfileStudentService] Subiendo foto de Perfil..');
  			 	  photoURL: this.uploadProfilePhoto(data.uid_profe, photoOptions.photoFile);
  			}*/

  			// Preparar datos para Firestore
  			const studentData: Partial<Profile> = {
  				...data,
  				role: 'student' as const,
  				//uid: uid_student, parametro directo
                uid_student: uid_student, //par. definido directo
                name: data.name,
                lname: data.lname,
                email: data.email ?? '',
                account: data.numCuenta ?? '',
  				updateAt: new Date(),
  				createdAt: data.createdAt || new Date(),
  				// photoURL,
  			};
            // El objeto enriquecido(directo), no crudo(su propiedad), para eso es el 2do arg
  			await BaseProfileService.saveProfile(this.collectionNameR1,uid_student,studentData);
  			console.log('[ProfileStudentService] Perfil guardado exitosamente ');

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
  	static async updateStudentProfile(uid: string, updates: Partial<Profile>, photoOptions?: ProfilePhotoOptions){
  		try{
  			let updatedData =  { ...updates };

  			if (photoOptions?.uploadPhoto && photoOptions.photoFile) {
  				console.log('[ProfileStudentService]: Actualizando Foto del Perfil');

  				// Eliminar foto anterio si existe
  				const currentProfile = await this.getStudentById(uid);
  				if (currentProfilez?.photoURL) {
  					await this.deleteProfilePhoto(uid);
  				}

  				// Subir nueva foto
  				const photoURL = await this.uploadProfilePhoto(uid, photoOptions.photoFile);
  				updatedData.photoURL = photoURL;
  			}else if (photoOptions?.uploadPhoto === 'false') {
  				await this.deleteProfilePhoto(uid);
  				updatedData.photoURL = '';
  			}

  			// Agregar timestamp de actualizacion
  			updatedData.updateAt = new Date();
  			 await BaseProfileService.updateProfile(this.COLLECTION_1, uid, updatedData);
			 console.log('[ProfileStudentService] Perfil actualizado Exitosamente');
  		}catch(error: any){
  			console.error('ProfileStudentService Perfil actualizado exitosamente',error);
  			 throw new Error(`Error al actualizar Perfil del Estudiante: ${error.message}`);
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
  	static async getStudentByEmail(email: string): Promise<Profile | null>{
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
    static async searchStudentByName(searchTer: string): Promise<Profile[]>{
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

  	//security Stg$$##$ <!- ABCda [-..1|^2..-]-->%%#%
  }