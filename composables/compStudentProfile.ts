  /**
   *  ═══════════════════════════════════════════
   *  	COMPOSABLE: comosableStudentProfile
   *  ═══════════════════════════════════════════
   *  Resposabilidad: Lógica reutilizable de UI + Manejo de formularios
   *  Encapsula interacciones repetitivas del store
   * 
   * @module  composables/compStudentProfile.ts
   * @architecture COMPOSABLE layer (Logica de abstraccion UI)
   * */
   
   import {ref,computed, reactive } from 'vue'; 
   import {useStudentProfileStore } from '@/stores/useStudentProfileStore';
   import type {StudentFormData, StudentEditFormData, StudentRegistrationData, StudentEditableData,
      Carrera, TipoDocumento } from '@/interfaces/students.types';

    /**═══════════════════════════════════════════
     * 	COMPOSABLE: PRINCIPAL
     * ═══════════════════════════════════════════ */

    export function useStudentProfile() {
    	const store = useStudentProfileStore();

    	const registrationForm = reactive<StudentFormData>({
    		name:  '',
    		lname: '',
    		carrera: '',
    		age: null,
    		password: '',
    		confirmPassword: '',
    		typeDocument: '' as TipoDocumento | '',
        photo: null as File | null // Fue aniadido *campo de tipo File*
    	});

    	const editForm = reactive<StudentFormData>({
    		name: '',
    		lname: '',
    		carrera: '' as Carrera | '',
    		age: null,
    		typeDocument: '' as TipoDocumento | '',
        photo: null as File | null // Fue aniadido *campo de tipo File*
    	});

    	// ────────────────────────────────────────
    	// 			PROPS COMPUTADAS
    	// ────────────────────────────────────────
      function manejadorArchivoPixelado(event: Event): void {
        const input = event.target as HTMLInpuntElement;
        const file = input.files?.[0] ?? null;

        registrationForm.photo = file;
      }
    	/**
    	 * Perfil del estudiante desde el store
    	 * */
    	const profile = computed(() => store.profile);
    	const loading = computed(()=> store.loading);
    	const error  = computed(()=> store.error);
    	const message  = computed(()=> store.message);
    	const fullName = computed(()=> store.fullName);

    	const isRegistrationFormValid = computed(() => {
    	  return(
    	      	registrationForm.name.trim() !== ''  &&
    	      	registrationForm.lname.trim() !==  '' &&
    	      	registrationForm.carrera.trim() !==  '' &&
    	      	registrationForm.password.length >= 8 &&
    	      	registrationForm.password.trim() === registrationForm.confirmPassword &&
    	      	registrationForm.typeDocument.trim()!== ''
    	     );
    	});

    	const isEditFormValid = computed(()=> {
    		return (
    			 editForm.name.trim() !== '' &&
    			 editForm.lname.trim() !== '' &&
    			 editForm.carrera.trim() !== '' &&
    			 editForm.age.trim() !== '' &&
    			 editForm.typeDocument !== ''
    			);
    	});

    /*function manejadorArchivoPixelado(event: Event): void {
      const input = event.target as HTMLInpuntElement;
      const file = input.files?.[0] ?? null;
          registrationForm.photo = file;
    }*/
    	// ─────────────────────────────────────────────────
    	// 			MÉTODOS DE REGISTRO
    	// ─────────────────────────────────────────────────
    /**
      * Maneja el regustro de un nuevo estudiante
      * */
    async function controllerRegistro(): Promise<boolean> {
    	try{
    		if (!isRegistrationFormValid.value) {
    			store.error = 'Completa correctamente todos los campos';
    			 return false;
    		}

          console.log('[Composable] photo:', registrationForm.photo);
    		const data: StudentRegistrationData = {
    			nombre: registrationForm.name.trim(),
    			apellido: registrationForm.lname.trim(),
    			carrera: registrationForm.carrera as Carrera,
    			edad: registrationForm.age ?? undefined,
    			email: registrationForm.email,  //*
          password: registrationForm.password,
    			typeDocument: registrationForm.typeDocument as TipoDocumento,
          photoFile: registrationForm.photo ?? undefined  //nuevo atributo agregado
    		}; 
    		
    		const result = await store.registerStudent(data,{uploadPhoto: registrationForm!== null, photoFile: registrationForm.photo ?? undefined});

    		 if (result.sucess) {
    		 	resetRegistrationForm();
    		 	 return true;
    		 }

    	}catch(error:any){
    		console.error('Error al registrar Estudiante: ',error);
    		 return false;
    	}
    }
    
    /** 
     *  Resetea el formulario de registro **/
    function resetRegistrationForm(): void {
    	registrationForm.name = '';
    	registrationForm.lname = '';
    	registrationForm.carrera = '' as Carrera || '';
    	registrationForm.age = null;
    	registrationForm.password = '';
      registrationForm.email  = ''; //*
    	registrationForm.confirmPassword = '';
    	registrationForm.typeDocument = '' as TipoDocumento | '';
      registrationForm.photo = null; //nuevo atributo agregado
    }

    /** 
     *  Carga los datos del perfil en el formulario de edicion **/
    function loadProfileEditForm():void {
    	if (!profile.value) {
    		console.warn('[composable-PerfilEstudiante]: No hay perfil por cargar');
    		 return;
    	}

    	editForm.name  =  profile.value.nombre;
    	editForm.lname =  profile.value.apellido;
    	editForm.carrera = profile.value.carrera;
    	editForm.age = profile.value.edad ?? null;
    	editForm.typeDocument = profile.value.typeDocument;
      editForm.photo        = null; //nuevo atributo agregado
    }

    /** 
     *  manipulación controlable en la actualizacion del Perfil **/
    async function controllerUpdate(): Promise<boolean> {
     	try{
         	if (!isEditFormValid.value) {
         	 	 store.error = 'Completa correctamente todos los campos';
         	 	  return false;
         	}

     	 	const data: StudentEditableData = {
     	 		nombre: editForm.name.trim(),
     	 		apellido: editForm.lname.trim(),
     	 		carrera: editForm.carrera as Carrera,
     	 		edad: editForm.age ?? undefined,
     	 		typeDocument: editForm.typeDocument as TipoDocumento,
     	 	};

            const photoOptions   = editForm.photo
                  ? { uploadPhoto: true, photoFile: editForm.photo }
                  : { uploadPhoto: false, photoFile: editForm.undefined };

     	 	 const result = await store.updateProfile(data);

     	 	    if (result.sucess) {
     	 	  		loadProfileEditForm();
     	 	  		return true;
     	 	    }

     	 	 return false;
     	}catch(error:any){
     		console.error('[ProfileStudent] - (Composable) Error al Actualizar la info del Estudiante: ',error);
    		 return false;
     	}
    }

    /**
     * Maneja la eliminación del perfil **/
    async function controllerDelete():Promise<boolean> {
    	try{
    		const confirmed = confirm('Estas seguro de que deseas eliminar tú Perfil?. Está acción no se puede deshacer.');

    		if (!confirmed) {
    			return false;
    		}

    		   const result = await store.deleteProfile();

    		if (result.sucess) {
    		 	resetEditForm();
    		 	  return true;
    		}

    		return false;

    	}catch(error: any){
    		console.error('[ProfileStudent] - (Composable) Error al Eliminar el  Perfil del Estudiante: ',error);
    		 return false;
    	}
    }

    /**
     * Resetea el Formulario de Edicion*/
    function resetEditForm(): void {
    	editForm.name = '';
    	editForm.lname= '';
    	editForm.carrera= '' as Carrera | '';
    	editForm.age=  null;
    	editForm.typeDocument = '' as TipoDocumento | '';
    }


    // ─────────────────────────────────────────────────
    //    METODOS DE CARGA
    // ─────────────────────────────────────────────────

    /**
     * Carga el Perfil del Estudiante actual desde el LocalStorage
     * */
    async function loadCurrentProfile(): Promise<boolean> {
     	try{   //se omitio la f(n) en la sesion temporal
     		  const loaded = await store.loadFromLocalStorage();

     		if(loaded){
     		 	loadProfileEditForm();
     		}

     		return loaded;

     	}catch(error: any){
     		console.error('[ProfileStudent] - (Composable) Error al CARGAR el PERFIL del Estudiante: ',error);
    		 return false;
     	}
    }	

  // ─────────────────────────────────────────────
  // 	******		UTILIDADES     ******
  // ─────────────────────────────────────────────

    /** 
     *  Limpia todos los mensajes **/
    function clearMessages(): void {
    	store.clearMessages();
    }

  // ────────────────────────────────────────────────────────────────────────────────────
  // 	RETORNO PÚBLICO: REGRESAR TODO LOS METODOS, COMPUTADOS, UTILIDADES,ETC P/UTILIZARLOS EN LA VISTA
  // ────────────────────────────────────────────────────────────────────────────────────

    	return {
    	  // Estado
        profile,
		 loading,
		 error,
		 message,
		 fullName,
		  // Formularios
		 registrationForm,
		 editForm,
     manejadorArchivoPixelado,
		  // Validaciones
		 isRegistrationFormValid,
		 isEditFormValid,
		  // Mets de Registro
		 controllerRegistro,
		 resetRegistrationForm,

		  // Mets de Edicion
		 loadProfileEditForm,
		 controllerUpdate,
		 controllerDelete,
		 resetEditForm,
		  // Met. de Carga
		 loadCurrentProfile,
		  // Utilidades
		 clearMessages
    	};
    }  //#_FIN termina el PRIMER composable

     /**══════════════════════════════════════════════
     * 	COMPOSABLE-02: MANIP EL CAMBIO DE CONTRASENIA
     * ═══════════════════════════════════════════════ */

    export function usePasswordChange() {
    	const store = useStudentProfileStore();

    	/**
    	 * Formulario de cambio de contrasenia
    	 * */
    	const passwordForm = reactive({
    		currentPassword: '',
    		newPassword: '',
    		confirmPassword: ''
    	});

    	/**
    	 * Validacion del formulario de contrasenia */
    	const isPasswordFormValid = computed(() => {
    		return (
    			passwordForm.currentPassword.length >= 7 &&
    			passwordForm.newPassword.length >= 7 &&
    			passwordForm.newPassword === passwordForm.confirmPassword &&
    			passwordForm.newPassword !== passwordForm.currentPassword
    		);
    	});


    	const passwordError = ref('');

    	/**
    	 * Maneja el cambio de la contrasenia */
    	async function controllerPasswordChange(): Promise<boolean> {
    		try{
    		 
    		if (!isPasswordFormValidv.value) {
    		 	 passwordError.value = 'Verifica que todos los campos sean correctos.';
    		 	  return false;
    		}

    		 		 const  result  = await store.changePassword(passwordForm);

    		 		if (result.success) {
    		 			resetPasswordForm();
    		 			return true;
    		 		}

    		 		passwordForm.value = result.error  || 'Error al cambiar la contraseña';
    		 		return false;

    		}catch(error: any){
    			console.error('[cambioContrasena] - (Composable2) Error al Cambiar La contraseña: ',error);
    		 return false;
    		}
    	}


  		/**
  		 * Resetea el formulario de contraseña*/
    	function resetPasswordForm(): void {
    		passwordForm.currentPassword  = '';
    		passwordForm.newPassword = '';
    		passwordForm.confirmPassword = '';
    		passwordError.value	 = '';
    	}

    	return {
    	   passwordForm,
         isPasswordFormValid,
    	   // isEditFormValid,
    	   passwordError,
    	   controllerPasswordChange,
    	   resetPasswordForm
    	};
    }//#_FIN termina el 2° composable