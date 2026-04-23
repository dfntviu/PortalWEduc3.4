 import { initializeFirebaseStorage } from '@/config/initializeFirebaseConf.ts';
import  { getFirestore, collection, doc, setDoc, updateDoc, deleteDoc, getDocs, query, where, orderBy, Timestamp} from 'firebase/firestore';
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";
 import { MaterialBseService } from './MaterialBaseService.ts';
 import { MaterialStatus } from '@/interfaces/materialTypes';
 import type {MaterialBase} from '@/intefaces/interfaceToast.ts';

 // const { db } = initializeFirebaseStorage();

  export class MaterialStudentService extends MaterialBseService {
    // public static COLLECTION = 'Students_Materials';
    /** ==============================
     *      METODOS DE LECTURA(ALUMNO)
     * ===============================*/

    /**
     * Obtiene TODOS los materiales del alumno(cualquier estado) 
     * @param userId - ID del Alumno 
     * */
    static async getMyMaterials(userId: string): Promise<MaterialBase[]>{
          console.log('------ TODOS los Materiales -----');
        try{
            console.log('Uid en sesion = ',userId);
            const q = query(this.getMaterialsCollection(userId),
              where('autorId', '==', userId),
              // where('deleted', '==', false),
              orderBy('fechaCreacion', 'desc')
            );
            console.log('consulta Fill1', q);
            // Se deconoce la naturaleza: No llega la consulta, el acceso a todas las colecciones del usuario 'student'
            const snapshot = await getDocs(q);
            const materials = snapshot.docs.map( doc=>({
                uid: doc.id,
                ...doc.data(),
            })) as MaterialBase[];
                // snapshot.forEach(doc => console.log('in ',doc.id, doc.data()))); habilitar, cuando se necesite test rec. de listado mt del student

            console.log(`[MaterialStudentService] ✅ ${materials.length} materiales propios`);

            return materials;
        }catch(error:any){
            console.log(`Error al obtener los materiales: ${error.message} `);
             throw new Error(`Error al obtener Materiales: ${error.message} `);
        }
    }

    /**
     * Obtiene los materiales APROBADOS de OTROS alumnos
     * @param excludeUserId - ID del Alumno actual(excluir sus propios materiales) */
    static async getApprovedMaterials(userId?:string): Promise<MaterialBase[]> {
        try{
                     const q = query(
                this.getMaterialsCollection(),  // ← Usa esto
                where('status', '==', MaterialStatus.APPROVED),
                where('autorId', '!=', userId),
                orderBy('autorId'),
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                uid: doc.id,
                ...doc.data()
            } as MaterialBase));

        }catch(error: any){
            console.error('[MaterialStudentService] ❌ Error:', error);
            throw new Error(`Error al obtener materiales aprobados: ${error.message}`);
        }
    }

    /**
     * Obtiene TODOS los materiales visibles para el Alumno
     * (Materiales propios + materiales aprobados) */
    static async getAllVisibleMaterials(userId: string): Promise<MaterialBase[]> {
        try{
            console.log(`[MaterialStudentService] 📚 Obteniendo materiales visibles para  ${userId}`);
 
            const [myMaterials, approvedMaterials] = await Promise.all([
                this.getMyMaterials(userId),
                this.getApprovedMaterials(userId)
            ]);
 
            const combined = [...myMaterials, ...approvedMaterials];
            // Nuevo aplicar timestamp al despliegue
            combined.sort((a,b) => {
                const toMillis = (d:any) => {
                    d instanceof  Object && typeof d.toMillis === 'function'
                      ? (d as Timestamp).toMillis()
                      : 0;
                      return toMillis(b.createdAt) - toMillis(a.createdAt);
                }
            });

            console.log(`[MaterialStudentService] ✅ ${combined.length} materiales visibles, en total`);
            return combined;
        }catch(error: any){
            console.error('[MaterialStudentService] ❌ Error:', error);
            throw new Error(`Error al obtener materiales visibles: ${error.message}`);
        }
    }

    /**
     * Mostrar solo los materiales de hoy
     * */
    static async getTodayMaterials(userId: string): Promise<MaterialBase[]>{
        console.log('------- Materiales POR DÍA ---------');
         try{ 
            const storage = getStorage();
        const folderRef = ref(storage, `Students_Materials/${userId}`);
        const result = await listAll(folderRef);

        // Mapeo mínimo para que el contrato MaterialBase[] se cumpla
        // y el filter de myMaterials tenga algo con qué trabajar
        const mapped = await Promise.all(result.items.map(async (itemRef) => ({
            autorId:  userId,          // ← permite que myMaterials.filter pase
            NombreFile: itemRef.name,
            PathCustom: itemRef.fullPath,
            archivoURL:  await getDownloadURL(itemRef),
            fecha: Timestamp.now(),
            // resto de campos requeridos por MaterialBase con valores mock
        } as MaterialBase)));

        console.log('[Test] Items encontrados:', mapped.length);
        return mapped; // ← contrato cumplido
            /*      ====== TRY ONE ======
             const db = getFirestore();
            const ref = doc(db, "Student_Materials",userId);
                //materials, no acepta exp regs, y tampoco subniveles inexistentes, la cadena vacia no la soporta
            const materialRef = collection(ref, '^177[1-9]{10}_[a-z]{10,65}\.pdf$');
            console.log('Mats >',materialRef);
            const snapshot = await getDocs(materialRef);
            
            for (const docSnap of snapshot.docs) {
             console.log('-',docSnap.id, docSnap.data());
            }*/

        /** ====== TRY TWO ====== 
         * const db = getFirestore();
                const start = new Date();
            start.setHours(0,0,0,0);
            
            const end = new Date();
            end.setHours(23, 59, 59, 999);
            // seguir buscando error con el directorio, las f(n)s firestore, con 1,3,5 segmentos ademas del uso de docs,collections. mtds firebase(x si acaso)
            const materialsRef =  collection(db,'Students_Materials');
             console.log('Est de coleccion -> ',materialsRef);

             const folderRef = ref(storage, "Students_Materials/YmJbYC2Pkmbp2D3j4rGkCZG03lm2");

            const result =  listAll(folderRef);

            const q = query(
                materialsRef,
                where('autorId', '==', userId),
                where('deleted',      '==', false),
                where('fechaCreacion', '>=', Timestamp.fromDate(start)),
                where('fechaCreacion', '<=', Timestamp.fromDate(end)),
                orderBy('fechaCreacion', 'desc')
            );
            console.log('>>> Nuevos Materiales >>> ');

                const snapshot = await getDocs(q);
                console.log('lits Docs: ', snapshot);
           const materialsBase: MaterialBase[] = [];

             console.log('Total de Materiales -> ',materialsBase);

                snapshot.forEach(doc => {
                    materialsBase.push({id:doc.id, ...doc.data() } as MaterialBase)
                });
                  console.log('Log.Arreglo Materiales => ',materialsBase);
             return materialsBase;  **/
            /** *  BUILD OF ALGHORITHM **/
            /*const folderRef = ref(storage, Students_Materials/${userId});
             const result =  await listAll(folderRef);
             result.items.forEach((itemRef)=>{
                console.log(itemRef.name);
            });
            return result;*/
        }catch(error: any){
            console.error('[MatStSrv]: Error filtro del día de Hoy', error);
             throw new Error(`Error al obtener los materiales de Hoy: ${error.message}`);
             /**/
        }

            /*const customPath = MaterialBseService.getPathCustomize(userId);
            console.log('Contenido de la ruta del uid de Estudiantes ', customPath);*/
            /*return snapshot.docs.map(doc => ({id: doc.id, doc.data() })as MaterialBase[]);*/
    }

    /**
     * Consulta Material Por Estado
     * @param userId - ID del alumno
     * @param materialId - ID del material
     * cuando es una composicion ente <> se declara con llaves*/
    static async getMyMaterialMyStatus(userId: string, materialId: string):Promise<{status:string; moderateAt?: Date; reason?: string}> {
        
        try{    
              const material = this.getMaterialById(materialId);
      
              if (!material) {
                  throw new Error('Material no Encontrado');
              }
      
              if (material.autorId !== userId) {
               throw new Error('No tienes Permiso para ver el Material')
              }
      
              return {
                  status: material.status || 'pending',
                  moderateAt:  this.timestampToDate(material.moderatedAt as Timestamp),
                  reason: material.rejectReason
              };
        }catch(error: any){
            console.error('[MaterialStudentService] ❌ Error:', error);
            throw error;
        }
    }

    async getMaterialsByAutor(uid: string): Promise<MaterialBase[]>{
        const db = getFirestore()

        const q = query(collection(db, this.getMaterialsCollection()),
            where('autorId', '==', uid)
            );

        const snapshot = await getDocs(q)
        return snapshot.docs.map(doc =>({ id: doc.id, ...doc.data()} as MaterialBase));
    }

    static async createMaterial(userId: string, data: Partial<Material>, file: File): Promise<string> {
        console.log('Fn visitada');
        try{

            this.validateMaterialData({...data,autorId: userId});

            const materialData: Partial<MaterialBase> = {
                ...data,
                autorId: userId,
                titulo: data.titulo  ?? '',
                descripcion: data.description ?? '',
                nombreArchivo: data.name ?? '',   // file ? file.name
                archivoURL: data.archivoURL,
                fechaCreacion: new Date(),
                tipoArchivo: data.type,
            }
            console.log('Descripcion:', materialData.descripcion);
            console.log('Nombre del Archivo PDF:', materialData.nombreArchivo);
                // F(n) composicion efectua todo el algoritmo de firebase
            const docReference = await MaterialBseService.saveMaterialEdStorageStudent(
                materialData.titulo ?? '', materialData.descripcion ?? '', file, userId);

            console.log( `✅ Material creado con Id: ${docReference}`);

        }catch(error: any){
            console.log('Error al crear el material: ', error);
            throw new Error(` Error al crear material: ${error.message}`);
        }
    }
   /* static async createMaterial(userId: string, data: Partial<Material>, file: File): Promise<string> {
        try{
            
            this.validateMaterialData({...data,autorId: userId});
        
            const materialData: Partial<MaterialBase> = {
                ...data,
                autorId: userId,
                titulo: data.titulo,
                descripcion: data.descripcion,
                fechaCreacion: new Date(),
                nombreArchivo: file.name,
                // archivoURL: data.archivoURL, 
                // status: 'pending',
            };
                const docReference = MaterialBseService.saveMaterialsEduc(materialData);
                    console.error(`✅ El Material ha sido creado con Id: ${docReference.id}` );
                    
                    return docReference.id;
        }catch(error:any){
            console.error(`[MaterialStudentService]: Error al crear Material: `,error);
            throw new Error(`Error al crear material: ${error.message}`);
        }
    }*/

    /**
     * Actualiza un material Propio(Si y solo su edo es pendiente) 
     * @param userId - Id del Alumno
     * @param materialId - Id del Material
     * @param updates - Datos a actualizar 
     * */
    static async updateMyMaterial(userId: string, materialId: string, updates: Partial<Material>): Promise<void>{
        try{

             const material = await this.getMaterialById(materialId);

             if (!material) {
                throw new Error('Aún no subes el Primer Material. O el Material NO fue encontrado');
             }

             if (material.autorId !== userId) {
                 throw new Error('No tienes permiso para editar el Material'); 
             }

             if (material.status !== 'pending') {
                 throw new Error('Solo puedes Editar Materiales Pendientes..');
             }

               const db = getFirestore();
               const docRef = doc(db, this.COLLECTION, materialId);

                await updateDoc(docRef,
                     {...updates,
                        updateAt: serverTimestamp()
                     });

                console.log(`[MaterialStudentService] ✅El Material fue actualizado`);
        }catch(error: any){
            console.error(`[MaterialStudentService] ❌Error al actualizar él Material: ${error}`)  ;
            throw error;
        }
    }

    /**
     * Elimina un material PROPIO (soft delete)
     * @param userId - ID del alumno
     * @param materialId - ID del material
     */
    static async deleteMyMaterial(userId: string,materialId: string ): Promise<void> {
         try{
            console.log(`[MatStudentServ] ✏️ Actualizando material: ${materialId}`);

            // Verificar propiedad y estado
                const material = await this.getMaterialById(materialId);  //falto el signo igual caray

                if (!material) {
                    throw new Error('El Material NO fue Encontrado');
                }

                if (material.autorId !== userId) {
                 throw new Error('No tienes permiso para editar el Material');
                }

                 const db = getFirestore();
               const docRef = doc(db, this.COLLECTION, materialId);

               await deleteDoc(docRef,{
                       deleted: true,
                       deleteAt: serverTimestamp(),
                       status: 'deleted'
                     });

                 console.log('[MatStudentServ] ✅ El material fue Eliminado');

        }catch(error: any){
            console.error(`[MaterialStudentService] ❌ Error al ELIMINAR él Material: ${error}`)  ;
            throw error;
        }    
    }

        /*const db = getFirestore();
            const q = query(
                collection(db, 'Student_Materials', userId, 'materials'), // ← subcolección
                where('deleted',  '==', false),
                orderBy('createdAt', 'desc')
                // where autorId ya no necesario — userId está en el path
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                uid: doc.id,
                ...doc.data()
            } as MaterialBase));*/
  }