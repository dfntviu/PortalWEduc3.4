/**
 * @service: ProfileTeacherService
 * @description: Servicio Personalizado para operaciónes de Perfiles de Profesores
 * @features
 * - CRUD completo de perfiles
 * - Manejo opcional de Foto de Perfil
 * - Busqueda y filtrado avanzado
 * - Gest. de Archivos en Storage
 * 
 *  Uso:
 *  -  Utilizado por profileStore p/gestion de Profesores
 *  -  Delega operaciones base a BaseProfileService*/ 

  import {MaterialBseService} from './materials/MaterialBaseService.ts';
  import {BaseProfileService} from './BaseProfileService.ts';
  import { addDoc,collection} from 'firebase/firestore';
  import { getStorage, ref as storageRef,uploadBytes, getDownloadURL} from "firebase/storage";
  // import { StorageService } from './StorageService';
  import type {Profile} from '@/types/interfaces.ts';


  interface ProfilePhotoOptions {
  	 uploadPhoto: boolean;
  	 photoFile?: File;
  	 photoURL?: string;
  }

   export class ProfileTeacherService {
   	  private static readonly COLLECTION_02 = 'teacher_register';  //*cambio_2
   	  private static readonly STORAGE_PATH = 'profiles/teachers';

   	  /**
   	   * Guarda un perfil de profesor con foto opcional
   	   * @param data - Datos del perfil
   	   * @param photoOptions - Opciones de foto(opc) 
   	   * */   //cambio_03
   	    static async saveTeacherProfile(data: Partial<Profile>,uid_teacher:string,
   	  	 photoFile?: File | null  //par. opcional(subir la foto)
   	    ): Promise<void> {
   	    	// console.log('Metadatos > ', data.nombre); 
   	    	console.log('Metadatos > ', data.name); //*
   	    	console.log('Metadatos > ', data.lname);
   	    	console.log('Metadatos > ', data.numCuenta);
   	    	console.warn('Uid Prof >',data.uid_teacher);
	   	  	try{
	   	  	 	if (!uid_teacher) {  
	   	  	 		throw new Error('El UID del profesor es requerido');
	   	  	 	}	
	   	  	 		console.log('[ProfileTeacherService]: Comenzado el proceso de guardando el Perfil del Profesor');
	   	  	 		
	   	  	 		// definicion de acumulador de foto
	   	  	 		let photoURL = '';
	   	  	 		let photoCount = 0;

	   	  	 		if (photoFile) {
	   	  	 			const storage = getStorage();
	   	  	 			const photoRef = storageRef(storage, `teachers/${uid_teacher}/profile.jpg`);
	   	  	 			await uploadBytes(photoRef, photoFile);
	   	  	 			photoURL = await getDownloadURL(photoRef);
	   	  	 			photoCount = 1;
	   	  	 		}

	   	  	 	const teacherData: Partial<Profile> = {
	   	  	 		// ...dataRole2, la informacion no llega a pesar de tener naming correcto vista, store
	   	  	 		role: 'teacher' as const,  //*
	   	  	 		uid_teacher: uid_teacher,  //* no importa si es uid o
	   	  	 		  nombre: data.name ?? '',   //English equal of profileData the trad register [no mover]
               lname: data.lname ?? '',  //English equal of profileData the trad register  [...]
               email: data.email ?? '',  //English equal of profileData the trad register
               numCuenta: data.numCuenta ?? '',  //English equal of profileData vthe trad register
               passwd: data.password ?? '',  //English equal of profileData the trad register [no mover]
               area: data.area ?? '',
	   	  	 		 photoURL,   //cambios para personalizar perfil
	   	  	 		 photoCount, //cambios para personalizar perfil
	   	  	 		 updateAt: new Date(),
	   	  	 		 createdAt: data.createdAt || new Date(),
	   	  	 		  // photoURL,
	   	  	 	};
	   	  	 		console.log('Datos Rol Profesor:', teacherData);
							console.log('uid Profesor:', uid_teacher); // C2.1 Base: El uid lo reconoce pero nunca se reciben los valores
							await BaseProfileService.saveProfileRoles(this.COLLECTION_02,uid_teacher, teacherData);
	   	  	 	    // const docRefRole2 = await addDoc(collection(db, this.COLLECTION_02), teacherData);

	   	  	 	 return data.uid;
	   	  	}catch(error: any){
	   	  		console.error('[ProfileTeacherService]❌ Error al guardar perfil:', error);
	   	  		throw new Error(`Error al guardar perfil de profesor: ${error.message}`);
	   	  	}
	   	  	 	/*if (data?.photoUrl && photoOptions.photoFile) {
	   	  	 		console.log('[ProfileTeacherService]  Subiendo Foto de Perfil... ');	
	   	  	 		  photoURL = this.uploadProfilePhoto(uid, photoOptions.photoFile);
	   	  	 	}*/
   	    }

   	    /** Guardar data de Profesor en la Firestore [eliminar code]
  static async saveTeacherProfile(data_teacher:{nombre:string;apellido:string;correo:string;passwd:string,cuenta:string,areaJob:string,role: 'student' | 'teacher';uid_teacher: string| null;}) {
    try {
      const docRef = teacher.id ? doc(db, this.collectionNameR2, teacher.id) : doc(collection(db, this.collectionNameR2));
      const data_role2 = {
        ...data_teacher
      };
      await setDoc(docRef, data, { merge: true });
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('[ProfileTeachersService]: Error al guardar perfil Profesor', error);
      throw error;
    }
  } **/

   	    static async getTeacherById(uid: string): Promise< Profile|null>{
   	    	 console.log('[ProfileTeacherService] 🔍 Obteniendo perfil del profesor:', uid);
   	    	try{  //se modifico a coleccion existente
	   	    	const profile = await BaseProfileService.getProfile(this.COLLECTION_02,uid);

	   	    	if (profile) {
	   	    		console.log('[ProfileTeacherService] ✅ Profesor Encontrado');
	   	    	}else{
	   	    		console.log('[ProfileTeacherService] ❌ Profesor NO Encontrado');
	   	    	}

   	    		return profile;
   	       	}catch(error: any){
   	       		console.error( '[ProfileTeacherService] Error al obtener el Profesor; ',error );
   	       		throw error;
   	       	}
   	    }

   	    /**
   	     * Actualiza la foto del perfil del profesor con foto opcional
   	     * @param uid - Id del usuario
   	     * @param updates - Campos a Actualizar
   	     * @param opciones de la foto*/
   	    static async updateTeacherProfile(uid: string, updates: Partial<Profile>, photoOptions?: ProfilePhotoOptions): Promise<void>{
   	    	try{
   	    		console.log('[ProfileTeacherService] Actualizando la foto del Perfil del Profesor:',uid);

   	    		let updatedData = {...updates};

   	    		if (photoOptions?.uploadPhoto && photoOptions.photoFile) {
   	    			 console.log('[ProfileTeacherService] 🔍 Actualizando la foto perfil de perfil...');

   	    			 const currentProfile =	 await this.getTeacherById(uid);
   	    			  if (currentProfile?.photoURL) {
   	    			  	  this.deleteProfilePhoto(uid);
   	    			  }
   	    			   // Subir nueva foto
   	    			  const photoURL = this.uploadProfilePhoto(uid, photoOptions.photoFile);
   	    			  updateAt.photoURL = photoURL;
				} else if (photoOptions?.uploadPhoto === false) {
					await this.deleteProfilePhoto(uid)
					 updatedData.photoURL = '';
				}
					// Agregar timestamp de actualizacion
				updateAt.updateAt = new Date();

					BaseProfileService.updateProfile(this.COLLECTION_2,uid, updatedData);	

				  console.log('[ProfileTeacherService]: ✅El Perfil fue actualizado exitosamente');   	    
   	    	}catch(error: any){
   	    		console.error( '[ProfileTeacherService]: ❌ Error al actualizar el Perfil',error);
   	    		  throw new Error(`Error al actualizar profesor: ${error.message}`);
   	    	}
   	    }

   	    static async getAllTeachers(limit?: number): Promise <Profile[]>{
   	    	try{
   	    		console.log('[ProfileTeacherService] 🗒️ Obteniendo los profesores...');

   	    		const teachers = BaseProfileService.getAllProfiles(this.COLLECTION_2, limit);

   	    		 console.log(`[ProfileTeacherService]: ✅${teachers.length} profesores obtenidos:`);

   	    		 return teachers;
   	    	}catch(error: any){
   	    			 console.log('[ProfileTeacherService] ❌ eRROR al obtener los profesores:', uid);
   	    			 throw error;
   	    	}
   	    }

   	    /**
   	     * Busca correo por Email
   	     * @param email - Email del profesor
   	     * @returns Perfil del Profesor o nulo
   	     * */
   	    static async getTeacherByEmail(email: string): Promise < Profile| null>{

   	    	try{
   	    	   	    console.log('[ProfileTeacherService] 🔍 Busq. de Profesor por E-mail: ',email);
   	    	   	    	  
	   	    	  const teacher = BaseProfileService.getProfileByEmail(this.COLLECTION_2, email);
	
	   	    	  if (teacher) {
	   	    	  	 console.log('[ProfileTeacherService] ✅ Profesor encontrado por Email');
	   	    	  } else {
	   	    	  	  console.log('[ProfileTeacherService]⚠️ Profesor no Encontrado');
	   	    	  }
	
	   	    	  return teacher;

   	    	}catch(error: any){
   	    		 console.error('[ProfileTeacherService] ❌ Error en la busqueda pro email: ',error);
   	    		 throw error;
   	    	}
   	    }

   	    /**
   	     * Buscar profesores por nombre(busq parcial) 
   	     * @param searchTerm - Termino de busqueda
   	     * @retruns Array de perfiles que coinciden
   	     * */
   	    static async searchTeachersByName(searchTerm: string):Promise<Profile[]>{
   	    	try{
   	    		console.log('[ProfileTeacherService] 🔍 Buscando profesores por Nombre: ',searchTerm);

   	    		const allTeachers = await this.getAllTeachers();
   	    		const term = searchTerm.toLowerCase();

   	    		const results = allTeachers.filter(teacher => {
   	    			const fullName = `${teacher.name} ${teacher.lname}.toLowerCase()`;
   	    				return fullName.includes(term);
   	    		});

   	    		 console.log(`[ProfileTeacherService]  Obteniendo ${results.length} coincidentes:`);

   	    		 return results;
   	    	}catch(error: any){
   	    		console.error('[ProfileTeacherService] ❌ Error de búsqueda por nombre:', error);
   	    		  throw error;
   	    	}
   	    }

   	    static async deleteProfilePhoto(uid: string): Promise <void> {
   	     	try{
   	     		const folderPath =   `${this.STORAGE_PATH}/${uid}`;
   	     		 await StorageService.deleteFolder(folderPath);

   	     		  console.log('[ProfileTeacherService] ✅Foto del perfil eliminad:');
   	     	}catch(error: any){
   	     		console.warn('[ProfileTeacherService]: No se pudo eliminar la Foto:',error.message)
   	     	}
   	    }

   	    static async hasProfilePhoto(uid: string):Promise<boolean>{
   	    	try{
   	    		 const profile = this.getTeacherById(uid);
   	    		  return !!(profile?.photoURL);
   	    	}catch(error){
   	    		return false;
   	    	}
   	    } 

   	    static async uploadProfilePhoto(uid: string, file: File): Promise <string>{
   	    	try{
   	    		const filePath =  `${this.STORAGE_PATH}/${uid}/profile.${file.name.split('.').pop()}`;
   	    		const downloadURL =  await StorageService.uploadFile(file,filePath);

   	    		console.log('ProfileTeacherService ✅ Foto de perfil subida correctamente');

   	    		return downloadURL;
   	    	}catch(err: any){
   	    		console.error('[ProfileTeacherService]: ❌ Error al subir la foto',error);
   	    		 throw new Error(`Error al subir foto de perfil: ${error.message}`);
   	    	}
   	    }

   	    /**
   	     * Desactiva el perfil del profesor
   	     * @param uid - UID del profesor
   	     */
   	    static async deleteTeacher(uid: string): Promise <void>{
   	    	 try{
   	    	 	 console.log('[ProfileTeacherService] 🧹 Desactivando perfil del Profesor:', uid);

   	    	 	 await this.deleteProfilePhoto(this.COLLECTION_2,uid);

   	    	 	 await BaseProfileService.deleteProfile(this.COLLECTION_2, uid);

   	    	 	  console.log('[ProfileTeacherService] ✅ Profesor desactivado exitosamente:');
   	    	 }catch(err: any){
   	    	 	console.error('[ProfileTeacherService] Profesor desactivado exitosamente');
   	    	 	throw error;
   	    	 }
   	    }

   	    /**
   	     * Buscar profesores por Area/Especialidad
   	     *  @param area - Area, campo de registro: area de trabajo act.
   	     * @return Array de profesores registrados al inicio
   	     */
   	    static async getTeachersByArea(area: string): Promise<Profile>{
   	    	 try{
   	    	 	   console.log('[ProfileTeacherService] 🔍Buscando profesores por Área: ',area);

   	    	 	   const allTeachers = await this.getAllTeachers();
   	    	 	   const term = area.toLowerCase();

   	    	 	   const results = allTeachers.filter(teacher => {
   	    	 	   	  const areas = teacher.area?.map(m => m.toLowerCase())	|| [];
   	    	 	   	   return areas.some(s => s.includes(term));
   	    	 	   });

   	    	 	   console.log(`[ProfileTeacherService] ${results.length} profesores encontrados`);
   	    	 	   return results;
   	    	 }catch(error: any){
   	    	 		console.error('[ProfileTeacherService] ❌ Error en búsqueda por Área: ',error);
   	    	 		 throw error;
   	    	 }
   	    }
    }	