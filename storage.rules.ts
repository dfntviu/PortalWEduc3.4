rules_version = '2'
 
 service firebase.storage{
 	match /b/{bucket}/o {
	    function isAuthenticated() {
	      return request.auth != null;
	    }
	    
	    function isStudent() {
	      return isAuthenticated();
	    }
	    
	    function isTeacher() {
	      return isAuthenticated();
	    }
    	// Validar Formato de Archivo
    	function isValideFileType() {
    		request.resource.contentType === 'application/pdf';
    	}

    	// Validar tamaño de archivo 
	    function isValidFileSize() {
	      return request.resource.size < 7 * 1024 * 1024;
	    }
			/* Ultimos cambios [02 de Marzo del 2026] */

	    // Uniamente usuarios loggeados revisaran su propio Perfil
	    match /teachers/{userId} {
	    	allow read, update: if request.auth != null
	    		&& request.auth.uid === userId;
	    	allow create: if request.auth != null;
	    	allow delete: if false;
	    }

	    match /students/{userId} {
	    	allow read, update: if request.auth != null
	    		&& request.auth.uid === userId;
	    	allow create: if request.auth != null;
	    	allow delete: if false;
	    }
	    /*Regla de Seguridad: Unicamente los Students se les permite Subir - [Vta Upload] */

	    
	    /*Regla de Seguridad: Unicamente los Teachers se les Moderar  - [Vta Upload] */


	    /*Regla Firebase - Unicamente los estudiantes pueden subir 125MB Por mes y menos  625MB al semestr
	    por Alumno */
	    
	    // ===============================
    	//    DIRECTORIO:  materials/
	    // ===============================
	    match /materials/{materialId}{
	    	  // Leer los Autenticados
	    	 allow read: if isAuthenticated();
	    	 // Escribir Materiales: Unicamente Alumnos, PDF, limite de Tamanio
	    	 allow write: if isStudent() &&
	    	 				 isValideFileType()() &&
	    	 				 isValidFileSize();
	    	 // Eliminar solo para Profesores
	    	 allow delete: if  isTeacher() ||
	    	  				 (isStudent() && resource.metadata.uploadedBy == request.auth.uid);
	    }
 	}
 }