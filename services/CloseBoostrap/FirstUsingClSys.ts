import {initializeFirebaseStorage} from '@/config/initializeFirebaseConf';
import {createUserWithEmailAndPassword, signInWithEmailAndPasssword} from 'firebase/auth';
import {initializeFirebaseStorage} from '@/config/initializeFirebaseConf.ts';
import {query,collection, where, doc, addDoc,setDoc,getDoc,getDocs} from 'firebase/firestore'; //getDoc
import type { ProfileStudent, ProfileTeacher } from '@/interfaces/Profile.types.ts';

const {auth,db} = initializeFirebaseStorage();
const COLLECT_TEACHER = 'teacher_register';  //* aumentar/quitar singular, ajustar cuanto todo este ok
const COLLECT_CONFIG = 'system_config';  // ** coleccion de configuracion
const DOC_BOOTSTRAP = 'bootstrap';	 //  documento unico de control **

	// ... interfaces y métodos auxiliares sin cambios...

	//	, sendCredentials() [Son Identicos]

	
	/**===================================================
	 * Verifica si el bootstrap ya fue completo al menos una vez. 
		===================================================
	 * */
	console.log('Sistema Vacío. Iniciando el primer Registro');
	export class RoleFirstUsingService {
		
		static  getInitUser(): ProfileTeacher {
  		  console.log('Comenzando la captura de datos correctos.');
  		  return {
  		 	  uid: '007',
		  	  username: 'user_admin',
   				name: 'Adal',
   				lname: 'Marquez',
   				email: 'amarquez02@profesor.mx',
   				password_pr: 'testing007', 
   				acct_number: '100007',
   				role: 'teacher',
   			  area: 'Sociologia',
  		  };
  		}

		static async getInitCredentials(): Promise<{email: string, password:string}> {
		 	  const initUser =  this.getInitUser();
	  	 	  const credentials =  {
	  	 	  	email: initUser.email,
	  	 	  	password: initUser.password_pr,
	  	 	  };
		 	  console.log('[F(n) Intermediaria]: Enviando credenciales por defecto', credentials);

		 	  return credentials;
		 	  console.log('Final-Result ', credentials);
		}
  	
	  	static  async nameDuplicatedCheck(name:string, lname: string): Promise <NameCheckResult> {
			const q = query(collection(db, COLLECT_TEACHER), where('name', '==', name));
			const save_snapshot = await getDocs(q);

			let     exact = false;
			let nameMatch = false;

			save_snapshot.forEach(docSnap => {
				 const data = docSnap.data();
				  if (data.lname===lname) {
				  	exact = true;
				  }else{
				  	nameMatch = true
				  }
			});

			      // console.log("Usuario agregado correctamente:", save_snapshot);
				 return {exact, nameMatch};
		}

		static async isBootstrapCompleted(): Promise <boolean> {
			const bootstrapRef = doc(db, COLLECT_CONFIG,this.DOC_BOOTSTRAP);
			const bootstrapSnap = await getDocs(bootstrapRef);
				return bootstrapSnap.exists() && bootstrapSnap.data()?.completed === true;
		}


	    /** ========================================================
	     *   Verifica si ya existen usuarios registrados
	     * ======================================================== */
	    static async anyUserExist(): Promise<boolean> {
	        const usersSnapShot = await getDocs(collection(db, COLLECT_TEACHER));
	        return !usersSnapShot.empty;
	    }

	    static async createdUser(user: Omit<ProfileTeacher| ProfileStudent, 'email'>,email:string, password: string): 
		  Promise<ServiceResult<ProfileTeacher | ProfileStudent>>{
			try{
				 console.log('[db type]', db?.type, db?.constructor?.name);
				 // console.log('f(n) visitada...');
			    // Crear usuario en FirebaseAuth y registrarlo en Firestore 
		      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
		      	// console.log('Credenciales Guardadas: ',userCredential);
		    const userDocRef = doc(db,COLLECT_TEACHER,userCredential.user.uid); //#
		    	// Verificar si existe el documento
          // console.log('Aqui va mi coleccion referenciada: ', userDocRef);
		      // Si no existe crear documento 
		     	 await setDoc(userDocRef,{...user,uid: userCredential.user.uid,email});

		     	 // console.log('Coleccion creada correctamente');

		     	return{ 
		     	    success: true,
		     	    message:'Usuario creado correctamente',
		     	    user:{ ...user, email, uid:userCredential.user.uid },
		     	};

			}catch(error: any){
				return{ 
		     	    success: false,
		     	    message:error.message
		     	 }; //#e_return
			}// #catch
		}

	      /*===================================================
	        	Inicializa el Primer uso del Sistema
	        ===================================================*/
	    static async initialingFirstUse(): Promise<ServiceResult<ProfileTeacher>> {
	    	console.log('Main Methof of Class First User');
	        try {
	            console.log('[InitUserService] Verificando si existen usuarios...');

	            if (await this.anyUserExist()) {
	                return {
	                    success: false,
	                    message: 'El Sistema tiene usuarios registrados. No se puede crear el primer usuario',
	                };
	            }

	            const credentials = await this.getInitCredentials();
	            const initUser    = this.getInitUser();
	            const verificarNombre = await this.nameDuplicatedCheck(initUser.name, initUser.lname);

	            if (verificarNombre.exact) {
	                return {
	                    success: false,
	                    message: 'Existe un mismo usuario con el mismo nombre y Apellido.',
	                };
	            } else if (verificarNombre.nameMatch) {
	                console.warn('Nombre idéntico pero Apellido distinto. Se permite la creación.');
	            }

	            const new_user = await this.createdUser(initUser, initUser.email, initUser.password_pr);

	            if (!new_user.success) {
	            	return new_user;
	            }

	            /*Escribir bandera en bootrap, para determinar(marcar, que ha sido completado) 
	            Unicamente marcaremos, que el system fue inicializado y se inhabilita*/
	            // BLOQUE:  REAJUSTADO
	             // ─────────────────────────────────────────────────────────────
	            await setDoc(doc(db, COLLECT_CONFIG, DOC_BOOTSTRAP),{
	            	completed: true,
	            	completedAt: new Date(),
	            	firstUser: initUser.email
	            });
	            console.log('[Bootstrap] Sistema inicializado. Flag escrito en Firestore.');
	            // ─────────────────────────────────────────────────────────────

	            return {
	            	success: true,
	            	message: `Prime usuario ${initUser} creado correctamente`,
	            	user: initUser,
	            	 credentials: {
	            	 	email:    initUser.email,
                    password: initUser.password_pr,
	            	 },
	            	 new_user,
	            };
	    }catch (error: any) {
            console.error('[Bootstrap] Error al crear usuario:', error.message);
            return { success: false, message: error.message };
        }
    }
    /** ==========================================================
     *   Envias las credenciales del primer usuario(solo lectura)
     * ===========================================================*/
		static async sendCredentials(router: any, nextTick:()=> Promise<void>){ 

		      // console.log('Inicializacion ', credentials);
		  	try{
		   	  // acceso al metodo Intermediaria pre-centralizado
		   	  const credentials = await this.getInitCredentials();
		   	  console.log('incializar sess: ', credentials);
		        // if (credentials.success) {
		        	    /*const  credential1 = credentials.user.email
		        	    const  credential2 = credentials.user.password_pr*/
		        	       // console.log('referencias obtenidas',credential1,credential2);
		        	   
		           return {
		           	success: true,
		           	email: credentials.email,
		           	password: credentials.password,
		           };   // console.log('1: ', email,'2:', password)
		       /*}else{*/
		       	 // console.warn('Error al intentar obtener las primeras credentials de Firestore',credentials.message);
		       	  // return {success: false, message: credentials.message};
		       // }
		 	 }catch(error: any){
		  	  console.log('Error en SendCreandialts: ', error.message);
		  	  return {success: false, message: error.message};
		  	}
		}
		/*La clase no cumplio su proposito y no hace nada en el met. principal*/
	}