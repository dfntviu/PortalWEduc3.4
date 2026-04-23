export type UserRole = 'student' | 'teacher';

 export interface Profile {
 	uid: string;
 	uid_profe: string;
 	nombre: string;
 	apellidos: string;
 	email: string;
 	role: UserRole;

 	telefono?: string;
 	activo?: boolean;
 	createdAt?: Date | Timestamp;
 	updateAt?: Date | Timestamp;

 	materias?: string[];
 	departamento?: string;
 	especialidad?: string;
 }
    //new (any thougth)
   export interface Notification {
     id: string;
     title: string;
     message: string;
     timestamp: number;  //unix timestamp
     read: boolean;
     
    /* name: string; 
     lname: string;  //apellido
     email: string;
     age: number;
     typeDocument[0]: string;
     password: string;*/
   }


 export interface ProfilePhotoOptions {
  /** Si se debe subir una foto **/
  uploadPhoto: boolean;
  /**  Archivo de foto a subir (solo si uploadPhoto es true)**/
  photoFile?: File;/**
   * URL de foto existente (para preview) **/
  photoURL?: string;
}

export interface ProfesorUser {
      name: string;
     lname: string;
     email: string;
     password: string;
     numCuenta: string;
     username: string;
      area: string;
      role: "profesor";
   }

export interface Material {
      id: string;
      titulo: string;
      descripcion: string;
      autorNombre: string;
      autorEmail: string;
      autorId: string;
      estado: MaterialStatus;
      fechaCreacion?: Date;
}
   export interface Comentario {
    id: string;
    mensaje: string;
    destacado: boolean;
    fecha: Date;
  }

  interface Moderation {
    id_material: string; //id del material relacionado
    id_autor: string;   //id del autor(perfil del Alumno)
    snapshot:  'adm_materials' | 'alumno';  // estado/origen de la relación
    fecha: Date| number  // fecha de moderación o tiemstamp
    criterio: boolean;   // true = aprobado, false = rechazado
        //correction-2 en Fecha
       // snapshot:  'adm_materials' | User.value='alumno';
  }
  
  export interface TipoDocumento {

  }