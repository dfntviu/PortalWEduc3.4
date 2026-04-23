import { getAuth } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL} from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
 class HookClass {
  // Flujo✅  correcto
    /*Obtener usuario autenticado
    Validar archivos (1–5 PDFs)
    Subir cada archivo a Storage
    Obtener URL
    Guardar documento en Firestore con:
    UID
    metadata
    URL del PDF*/

  // Forma # 1 (symbolic)
  static async saveMaterialsEduc(material: {
    id?: string;
    titulo: string;
    descripcion: string;
    archivo?: File; // mejor usar el archivo directamente
    fechaCreacion?: Date;
    autorNombre?: string;
    autorId?: string;
  }) {
  try {
      // Validación correcta
      if (!material.titulo || !material.descripcion) {
        throw new Error('El título y la descripción del material son obligatorios');
      }

      // Referencia a Firestore
      const docRef = material.id
        ? doc(db, this.COLLECTION, material.id)
        : doc(collection(db, this.COLLECTION));

      // Storage
      const storage = getStorage();

      let archivoURL: string | null = null;

      // Subir archivo si existe
      if (material.archivo) {
        const storageRef = ref(storage, `materiales/${docRef.id}.pdf`);
        
        await uploadBytes(storageRef, material.archivo);

        archivoURL = await getDownloadURL(storageRef);
      }

      // Datos a guardar
      const dataToSave = {
        titulo: material.titulo,
        descripcion: material.descripcion,
        archivoURL: archivoURL,
        fechaCreacion: material.fechaCreacion || new Date(),
        autorNombre: material.autorNombre ?? null,
        autorId: material.autorId ?? null,
      };

      console.log('Guardando:', dataToSave);

      // Guardar en Firestore
      await setDoc(docRef, dataToSave);

      return docRef.id;

    } catch (error) {
      console.error('[MaterialDeployService]: Error al guardar material', error);
      throw error;
    }
  }

  // Forma # 2
  static async saveMaterialsEduc(files: File[]) {
  try {
    // Validar mínimo 5 documentos
    if (!files || files.length < 5) {
      throw new Error('Debes subir al menos 5 documentos PDF');
    }

    const storage = getStorage();
    const uploadPromises: Promise<any>[] = [];

    let counter = 1;

    for (const file of files) {
      // Validar tipo PDF
      if (file.type !== 'application/pdf') {
        throw new Error(`El archivo ${file.name} no es un PDF`);
      }

      const storageRef = ref(
        storage,
        `materiales/lote_${Date.now()}/documento_${counter}.pdf`
      );

      counter++;

      // Subir archivo
      const uploadTask = uploadBytes(storageRef, file);
      uploadPromises.push(uploadTask);
    }

    // Esperar a que todos se suban
    const results = await Promise.all(uploadPromises);

    console.log('Archivos subidos correctamente:', results.length);

    return results;

  } catch (error) {
    console.error('[MaterialDeployService]: Error al subir materiales', error);
    throw error;
  }
  }
// Forma # 3: Ideal de forma no tan comun
   static async saveMaterialsEducative(material:{
     titulo: string;
     descripcion: string;
     archivos: File[];
    }){
         try{
           const auth = getAuth();
           const user = auth.currentUser;
            // 1 Validar el archivo autenticado
           if (!user) {
             throw new Error('Usuario no autenticado');
           }
       
           const uid = user.uid;
           // 2. Validaciones generales
           if (material.titulo && material.descripcion) {
              throw new Error('Título y descripción obligatorios');
           }
       
           if (!material.archivos || material.archivos.length === 0) {
              throw new Error('Debes subir al menos un archivo');
           }
       
           if (material.archivos.length > 5 ) {
              throw new Error('Maximo 5 archivos permitidos');
           }
       
            // 3.1 Guardar la coleccion de documentos en la firestore
           const storage = getStorage();
           const urls: string[] = [];
       
           const loteId = `lote_ ${Date.now()}`;
       
           const index = 1;
       
           for(const file  of  material.archivos){
             if (file.type !== 'application/pdf'){
               throw new Error(`El archivo:  ${file.name} no es PDF`:
             }
       
               // - Personalizacion de la ruta
              const storageRef = ref(
               storage,
             `Students_Materials/${uid}/${loteId}/doc_0${index}.pdf`);   //Students_Materials/0h124a/lote_20250402/doc_1.pdf
       
             const snapshot = uploadBytes(storageRef, file);
             const url = getDownloadURL(snapshot.ref);
       
             urls.push(url);
             index++;
          }
      // 4. Guardar los otros datos en la firestore
       const materialsReference = collection(db, this.COLLECTION);

       const results = [];

           for(const url  urls){
             const docRef = addDoc(materialsReference,{
                titulo: material.titulo,
               descripcion: material.descripcion,
               archivoURL: url,
               uid: uid,
               fechaCreacion: new Date(),
       
                 results.push(docRef.id);
            });
                 console.log('Materiales Guardados: ',results);
          }
   
             return results;
     }catch(error){
      console.error('[MaterialDeployService]: Error', error);
      throw error;
     }
  }

  /** ###############################################
     * 30/Marzo/2025
     * Crear Materiales ---  Obtiene TODOS los materiales visibles para el Alumno
     * (Materiales propios + materiales aprobados) f(n) legacy
     * solo para texto llano,
     * Esta f(n) fue ajustada en el Serv: MaterialStudentService
     * para la subida de documentos en la storage de Firebase ---*/
  
   static async saveMaterialsEduc(material: 
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
           descripcion_extract: material.description  ?? null, //#bad in english not Sp
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
            // .--.--.--.--.--.--.--.--.--.--.--.--.--.--.--.--.--.--.--.--.--.--.--.--
          await setDoc(docRef,dataToSave,{ merge: true});//* importado tarde
      }catch(error){
          console.error('[MaterialDeployService]: Error al guardar material', error);
          throw error;
      }
  
    }
    // 00006 F(n) obsoleta, se rompe con datos tpo file
    // ###############################################
    static async createMaterial(userId: string, data: Partial<Material>, file: File): Promise<string> {
        try{
            
            this.validateMaterialData({...data,autorId: userId});
        
            const materialData: Partial<MaterialBase> = {
                ...data,
                autorId: userId,
                titulo: data.titulo,
                descripcion: data.descripcion,
                archivoURL: data.archivoURL, 
                fechaCreacion: new Date(),
                nombreArchivo: file.name,
                // status: 'pending',
            };
                const docReference = MaterialBseService.saveMaterialEdStorageStudent(materialData.titulo!, materialData.descripcion!,file, userId);
                    console.error(`✅ El Material ha sido creado con Id: ${docReference}` );
                    
                    return docReference.id;
        }


         /**
      * Cargar y/o guardar los materiales del role: student, por vez primera
      * en el Storage [Firebase]  -- Noche [30/03/2026]
      *  unicamente util cuando ha sido aniadida la primera coleccion
      * */
    static async saveMaterialEdStorageStudent(titulo:string,descripcion: string,archivos:File[]): Promise<string[]>
    {
        try{
            const auth = getAuth();
            const user = auth.currentUser;

            if (!user) {
                throw new Error('El usuario no fue autenticado');
            }

            const uid = user.uid;

            if (!material.titulo || !material.description) {
                throw new Error('El Título y la descripcion son campos obligatorios');
            }

            if (!material.archivos.length){
                throw new Error('Debes de subir al menos un archivo PDF/DOCx');
            }

            if (material.archivos.length > 5) {
                throw new ('El titulo y la descripcion del material son obligatorios');
            }

            const storage = getStorage();
            const materialsReference = collection(db, this.COLLECTION);

            const loteId = `lote_${Date.now()}`;
            const results: string[] = [];

            let index = 1;

            for (const file of archivos) {
                const allowedTypes = [
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                ];

                if(!allowedTypes.includes(file.type)){ 
                    throw new (`El archivo: ${file.name} no fue permitido`);
                }

                    const extension = file.name.split('.').pop();

                    const snapshot = uploadBytes(storage, `Students_Materials/${uid}/${loteId}/doc_${index}.${extension}`);
                    const url = getDownloadURL(snapshot.ref);

                    const docReference = addDoc(materialsReference, {
                         titulo: material.titulo,
                         descripcion: material.descripcion,
                         archivoURL: url,
                         nombreArchivo: file.type,
                         uid,
                         loteId,
                         fechaCreacion: Timestamp.now()
                    });
                    
                    results.push(docReference.id);
                    index++;
            }
        }catch(error){
             console.error('[MaterialDeployService]: Error', error);
            throw error;
        }
    }
}

    /**
     * Cambios aplicados en la view: vUploadMaterials*/
// Cambio aplicado en la f(n) Nche 30/03/2026
  watch(selectedFilter, async (value) => {
      if(value === 'today'){
         await materialStore.fetchTodayMaterials();
      }else{
         await materialStore.fetchMyMaterials();
      }
  });
  // cmbi 30/03/2026 hook de montaje
    onMounted( async() => {
     await materialStore.fetchMyMaterials();
    });
    /*Layer 1  - MaterialStudentService 
        intentando guardar el file es la misma f(n) d: 00006 */
 static async createMaterial(userId: string, payload: UploadMaterialDTO): Promise<string> {
        try{
            
            // this.validateMaterialData({...data,autorId: userId});

            if (!payload.file) {
                throw new Error('El nombre del archivo es obligatorio');
            }
        
            const materialData: Partial<MaterialBase> = {
                // ...data,
                titulo: payload.titulo,
                descripcion: payload.descripcion,
                nombreArchivo: payloadfile.name,
                tipoArchivo: payload.file.type,
                autorId: userId,
                fechaCreacion: new Date(),
                 archivoURL: payload.archivoURL, 
                // status: 'pending',
            };
            
                const docReference = MaterialBseService.saveMaterialEdStorageStudent(payload.titulo, payload.descripcion,payload.file, userId);
                    console.error(`✅ El Material ha sido creado con Id: ${docReference}` );
                    
                    return docReference.id;
        }catch(error:any){
            console.error(`[MaterialStudentService]: Error al crear Material: `,error);
            throw new Error(`Error al crear material: ${error.message}`);
        }
    }