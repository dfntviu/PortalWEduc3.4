 import { signInWithEmailAndPassword, getAuth, signOut, createUserWithEmailAndPassword, type User } from 'firebase/auth';
  import {doc, getDoc, setDoc, collection, query, getDocs, limit}  from 'firebase/firestore';  //*
  import { initializeFirebaseStorage } from '@/config/initializeFirebaseConf.ts';
 import type {ProfileTeacher, ProfileStudent, UserRole } from '@/types/interfacefVUn';

 /**
  * AuthService - Servicio de Autenticacion multiusuario
  * Maneja todas las operaciones de autenticacion sin Lógica de estado
  * Continua con el patron Services-Stores-Views*/

 // Crear las interfaces de types en dir interfaces
	const { auth, db } = initializeFirebaseStorage();

 	export class AuthService {
  	
  	 /**
  	  * Verifica si existe algún usuario en el Sistema
  	  * Útil para determinar si es la primera inicializacion
  	  * */
      //✅ Método que el store necesario
    async getUserRole(uid: string): Promise<UserRole | null> {
        const teacherRef = doc(db, 'teachers', uid);
        const teacherSnap = await getDoc(teacherRef);
        if (teacherSnap.exists()) return 'professor';

        const studentRef = doc(db, 'students', uid);
        const studentSnap = await getDoc(studentRef);
        if (studentSnap.exists()) return 'alumno';

        return null;
    }

  	async anyUserExists(): Promise<boolean> {  //?
  	  try{
  	 	 const teachersQuery = query(collection(db, 'teachers'), limit(1));
  	 	 const studentsQuery = query(collection(db, 'students'), limit(1));

	  	 	const [teacherSnapshot, studentsSnapshot] = await Promise.all([
	  	 	 	 getDocs(teachersQuery),
	  	 	 	 getDocs(studentsQuery)
			  ]);

				 return !teacherSnapshot.empty || !studentsQuery.empty;
  	  }catch(error){
  	      console.error('Error verificando existencia de usuarios', error);
  	      throw new Error('Error al verficar el Sistema');
      }
    }

    /**
     * Met de Testing: Obtener la autorizacion en Firebase - Identificar si
     * la autorizacion respondio del lado de Firebase (quitar cuando funcione)
     * */
    /*static async getCurrentUser(): Promise<User | null>{
          try{ // no entra al bloque
            const auth =  getAuth(); //obtiene la instancia de Firebase
             const currentUser = auth.currentUser;
              return currentUser;
          }catch (error: any){
            console.error(`Error la obtener: ${error}, el usuario actual`);
            return currentUser;
          }
       }  */
    /**
  	  * Crea el primer usuario profesor del Sistema
  	  * Solo debe ejecutarse cuando el Sistema esta vacío
  	  * */
   /** async anyUserExists2(): Promise<{
    	success: boolean;
    	email: string;
    	password: string;
    	message: string;
    }>{
        const intialEmail  =  'adm.teacher@teacher.uaemex.mx'
        const intialPasswd =  'Admin2025!';

        try{
        	  // Verificar si el sistema esta vacio
           	const userExist =  await this.anyUserExists();
       
           	if(userExist) {
           	 	return {
           	 	   success: false,
           	 	   email: '',
           	 	   password: '',
           	 	   message: 'El sistema cuenta con usuarios Registrados'
           	 	};
           	}
        
           		// Crear usuario en FirebaseAuth
    		 const userCredential =  await createUserWithEmailAndPassword(auth,
    		   intialEmail, intialPasswd);

    	   const teacherProfile: ProfileTeacher = {
        		uid: userCredential.user.uid,
        		name: 'Administrador',
        		apellido: 'Sistema',
        		email: initialEmail,
        		role: 'professor' as UserRole,
        		numCuenta: 'ADM-000',
        		area: 'Administración',
        		createdAt: new Date().toISOString()
      	};

      		await setDoc(doc(db, 'teachers', userCredential.user.uid), teacherProfile);

      		return {
      		  success: true,
      		  email: initialEmail,
      		  password: intialPasswd,
      		  message: 'Usuario administrador creado exitosamente'
      		}
    	}catch(error: any){
    		 console.error('Error al inicializar primer profesor:', error);
    		 throw new Error('Error al crear el usuario inicial: ' + error.message);
    	}
   } **/
    /**
     * Inicia Sesion med. credenciales
     * Devuelve el usuario de Firebase Auth*/
    async login(email: string, password: string){
      console.log('Leyendo metodo de Inicio de la capa de la comunicacion de Est y Desarollo');
    	try{
    		  if (!email || !password) {
       		  throw new Error('Email y contraseña son requeridos');
      		}
            console.log('Correo:',email, 'Contraseña: ', password);
             // const userMain =  auth.currentUser;
           //console.log('Autorizacion:', userMain.uid);
            //null => ({  no se puede leer prop nula})
            //'' => {no se reconoce funcion }
            // var => {no se reconoce la funcion} 
           // ign => {}
            console.log('[AuthService] auth:', auth);
console.log('[AuthService] email:', email, 'pwd:', password);
      		const userCredential = await signInWithEmailAndPassword(auth,email, password);
          console.log('[AuthService] userCredential:', userCredential);
            // isAuthenticated.value = true;
      		return userCredential.user;
    	}catch(error: any){
    		console.error('Error en login', error);
    			// Mensajes de Error amigables
	    	if (error.code === 'auth/user-not-found') {
	          throw new Error('Usuario no encontrado');
	        } else if (error.code === 'auth/wrong-password') {
	           throw new Error('Contraseña incorrecta');
	        } else if (error.code === 'auth/invalid-email') {
	           throw new Error('Formato de email inválido');
	    	} else {
	    		throw new Error('Error al iniciar Sesion: '+ error.message);
	    	}
       }
	}

	/**
     * Cierra la Sesion actual
     * */
	async logout(): Promise <void>{
     console.log('Cerrando Perímetro de Seg. de Firebase');
    try{
		const auth = getAuth();
       await signOut(auth);
			/*const res =*/ 
      // console.log('= ',res);
      // return auth;
		}catch(error: any){
		    console.error('Error al cerrar la Sesión:',error);
		    throw new Error( `Error al cerrar sesión: ${error.message}` );
		}
	}

  /**
   * Crea el primer usuario Profesor del Sistema. Unicamente sera ejecutado
   * cuando el Sistema esté vacío **/
  async initializeFirstTeacher(): Promise<{success:boolean; email:string; password: string; message:string}> {
    const initialEmail = 'usrdefault.teacher@fi.uaemex.mx';
    const initialPassword = 'admin2026';

    try{
      // Verificar si el sistema está vacío
      const userExist = await this.anyUserExists();
      if (userExist) {
        return {
          success: false,
          email: '',
          password: '',
          message: 'El sistema ya contiene usuarios registrados, pertencientes a la categoría'
        };
      }
      // Crear usuario med FirebaseAuth
      const userCredential = await createUserWithEmailAndPassword(auth,initialEmail, initialPassword);

      const teacherProfile =  ProfileTeacher = {
        uid: userCredential.user.uid,
        name: 'TeacherDefault',
        apellido: 'Sistema',
        email: initialEmail,
        role: 'professor' as UserRole,
        numCuenta: 'CADM-001',
        area: 'Control Administrador',
        createdAt: new Date().toISOString()
      };

        await setDoc(doc(db, 'teachers', userCredential.user.uid), teacherProfile);

        return {
          success: true,
          email: initialEmail,
          password: initialPassword,
          message: 'El Primer usuario con cuenta de Profesor, se creo exitosamente'
        };
    }catch(error: any){
       console.error('Error al inicializar primer profesor:', error);
      throw new Error('Error al crear el usuario inicial: ' + error.message);
    }
  }
	/**
     * Obtiene el Perfil del Profesor
     * */
  	async getTeacherProfile(uid: string): Promise <ProfileTeacher| null> {
      console.log('Perfil del Maestro');
  		try{
  			 const docRef = doc(db,'teachers', uid);
  			 const docSnap = await getDoc(docRef);
         // console.log('Tu pefil ha sido guardado:Capt Referenciada de la coleccion',docSnap);
  			 if (docSnap.exists()) {
  			 	return docSnap.data() as ProfileTeacher;
  			 }

  			 return null;
    		}catch (error: any) {
         	 console.error('Error al obtener perfil de profesor:', error);
          	   throw new Error('Error al cargar perfil de profesor');
    		}
    }

    /**
     * Obtiene el Perfil del Estudiante
     * */
	   async getStudentProfile(uid: string): Promise <ProfileStudent| null> {
  		  try{
  			 const docRef = doc(db,'students', uid);
  			 const docSnap = await getDoc(docRef);

    			 if (docSnap.exists()) {
    			 	return docSnap.data() as ProfileStudent;
    			 }

  			 return null;
    		}catch (error: any) {
         	 console.error('Error al obtener perfil de estudiante:', error);
          	   throw new Error('Error al cargar perfil de estudiante');
    		}
    }

    /**
     * Determina el perfil por completo del Usuario segun corresp
     * su Rol*/	 
    async getUserProfile(uid: string, role: UserRole): Promise<ProfileTeacher|ProfileStudent| null> {
    	try{
    		if (role === 'teacher') {
    			 return await this.getTeacherProfile(uid);
    		}else if (role === 'student') {
    			 return await this.getStudentProfile(uid);
    		}
    		 return null;
    	}catch (error: any) {
     	 console.error('Error al obtener perfil de profesor:', error);
      	  throw new Error('Error al cargar perfil de profesor');
    	}
    }

     /**
     * Valida el formato del email
     */
    validateEmail(email: string): boolean {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }	
    /**
     * Valida la fortaleza de la contrasena
     */
    validatePassword(password: string): { isValid: boolean; message: string } {
      if (password.length < 6) {
        return {
          isValid: false,
          message: 'La contraseña debe tener al menos 6 caracteres'
        };
      }
      return {
        isValid: true,
        message: 'Contraseña válida'
      };
    }

  }
export const authService = new AuthService();