/**
 * @service Servicio Base de Materiales
 * @description Servicio Base con Métodos compartidos entre roles
 * @pattern*/

  import  { getFirestore, collection, doc, getDoc, getDocs, setDoc, query, where, OrderBy, type DocumentsSnapshot, 
   type CollectionReference, Timestamp,addDoc } from 'firebase/firestore';
   import { getStorage, ref, uploadBytes, getDownloadURL} from 'firebase/storage';
   import { initializeFirebaseStorage } from '@/config/initializeFirebaseConf.ts';
  import type {Material} from '@/types/indexInterface.ts';

  const { auth,db } = initializeFirebaseStorage();  //exportar mas abajo si es necesario
 
  export class MaterialBseService {
  	 private static readonly COLLECTION = 'Students_Materials'; //*

     /*static getPathCustomize(userId: string): CollectionReference {
            const PATH_CUSTOMIZE = `${this.COLLECTION}/${userId}`
            console.log('Rta Pers. origen -', PATH_CUSTOMIZE);
        return PATH_CUSTOMIZE;
     }*/
  	 /**
  	  * ===========================
  	  *   MÉTODOS COMPARTIDOS (DRY)
  	  * ===========================*/

  	 /**
  	  * Obtiene la Referencia de la coleccion de Materiales
  	  * */
  	 static getMaterialsCollection(userId: string): CollectionReference {
  	 	const db = getFirestore();
  	 	  return collection(db,this.COLLECTION);
  	 }

     /**
      * Crear Materiales
      * */
     /**  static async saveMaterialsEduc(material: 
         { id?: string; titulo: string;
            descripcion: string;
             archivoURL?: string;
              fechaCreacion?: Date;
               autor?: string }){
      try{
        // Obligar a llenar los campos elementales(obligatorios)
          if(!material.titulo && !material.descripcion){  //*
             throw new ('El titulo y la descripcion del material son obligatorios');
          }

         const docRef = material.id 
           ? doc(db,this.COLLECTION,material.id) 
           : doc(collection(db,this.COLLECTION))
        
        const dataToSave = {
                titulo: material.titulo,  //#good
        descripcion_extract: material.descripcion  ?? null, //#bad in english not Sp
              archivoURL: material.archivoURL ?? null,
           fechaCreacion: material.fechaCreacion || new Date(),
             autorNombre: material.autorNombre ?? null,
                 autorId: material.autorId ?? null,
           // autor: material.autor || null,   # no existe en firebase
        }   // .--.--.--.--.--.--.--.--.--.--.--.--.--.--.--.--.--.--.--.--.--.--.--.--
            console.log('Material completo: =[', JSON.stringify(material),']=');
            console.log('Descripcion raw: [', material.description,']');
            console.log('Tipo de Nat de File: [', typeof material.description,']');
            console.log('Guardado de Datos: [', JSON.stringify(dataToSave),']');
          await setDoc(docRef,dataToSave,{ merge: true});//* importado tarde
      }catch(error){
          console.error('[MaterialDeployService]: Error al guardar material', error);
          throw error;
      }
    } **/

    static async saveMaterialEdStorageStudent(titulo: string, descripcion: string, file: File, userId: string): Promise<string> {
        console.log('ing a la f(n)');
        try {
                // Validacion de datos escenciales
            if(!titulo && !descripcion){  
                throw new Error('El titulo y la descripcion del material son obligatorios');
            }

            console.log('extension/nombre de archivo [', file,']');  //dom html
            // Acceso al alamcenamiento de Firebase
            const storage = getStorage();
            const storageReference = ref(storage, `${this.COLLECTION}/${userId}/${Date.now()}_${file.name}`);

            console.log('Nomb. Archivo ',file.name);
                // Subir el archivo y obtener  la URL
            const snapshot = await  uploadBytes(storageReference,file);
            const fileURL =  await getDownloadURL(snapshot.ref);
            // Preparar informacion para firestore
            const dataCollection = {
                autorId: userId,
                titulo: titulo,
                descripcion: descripcion ?? '', //nula
                nombreArchivo: file.name ?? '',  //vacia
                archivoURL: fileURL,
                fechaCreacion: Timestamp.now(),
                tipoArchivo: file.type,
            }
                //* validar la data completa
            console.log('Data a guardar:', dataCollection);
            // console.log('Data a guardar:', dataCollection);

                // Subir la informacion a la firetore
            const docRef = await addDoc(collection(db, this.COLLECTION), dataCollection);
                // regresar identificacion unica de la coleccion
            return docRef.id;
        }catch(error){
            console.error('[MtBase] Error al guardar en el Stg',error);
            throw error;
        }
    }
  	 /**Obtiene un material por ID(En ambos roles)
  	  *@param materialId -  Id del material
  	  * */
        static async getMaterialById(materialId:string): Promise<Material| null>{
 			try{   
 		  		    console.log(`[MaterialBaseService] 🔍Obteniendo el Material: ${materialId}`);
 		   	   		  const db = getFirestore();
 		             const docRef = doc(db, this.COLLECTION, materialId);
 		            const docSnap = await getDoc(docRef);
 		 
 		              if (docSnap.exists()) {
                      console.log('[MaterialBaseService] ✅ Material encontrado');
 		              	 return{
 		              	 	uid:docSnap.id,
 		              	 	...docSnap.data()
 		              	 } as Material;
 		              }
 		   	}catch(error: any){
           console.error('[MaterialBaseService]❌ Error al obtener material: ',error);
            throw new Error(`Error al obtener Material: ${error.message}`);
 		   	}
 		}

    /**
     * Buscar materiales por término(compartido por ambos roles) 
     * @param searchTerm - Término de Busqueda
     * @param materials -  Materiales donde buscar
     * */
    static async searchMaterials(searchTerm:string, materials: Material[]): Promise<Material[]>{
        
        try{
           const searchLower = searchTerm.toLowerCase().trim();
           // filtrada & Validada
           const filtered = materials.filter(material =>
               material.titulo?.toLowerCase().includes(searchLower) ||
               material.description?.toLowerCase().includes(searchLower) ||
               material.tags?.some(tag => tag.toLowerCase().includes(searchLower))
            );

            console.log(`[MaterialBaseService] ✅ ${filtered.length} resultados encontrados`);
            return filtered;
        }catch(error: any){
            console.error('[MaterialBaseService] ❌ Error en la búsqueda:',error);
             throw new Error(`Error en la búsqueda: ${error.message}`);
        }
    }

    /**
     * Valida datos del material
     * */
    protected static validateMaterialData(data: Partial<Material>): void{
       if (!data.titulo.trim()) {
          throw new Error(`El título es requerido`);
       }
       if (!data.autorId.trim()) {
        throw new Error(`El ID del Autor es requerido`);
       }
    }

    /**
     * Convierte Timestamp a Date(helper compartido)
     *  */
    protected static timestampToDate(timestamp: Timestamp | undefined): Date | undefined {
       return timestamp ? timestamp.toDate() : undefined;
    }
  
  }