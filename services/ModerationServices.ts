import { initializeFirebaseStorage } from '@/config/initializeFirebaseConf.ts';
import { collection,doc,getDoc,getDocs,addDoc,updateDoc, deleteDoc, query, where, 
         orderBy, Timestamp, serverTimestamp, writeBatch, increment } from 'firebase/firestore';
  import { initializeFirebaseStorage } from '@/config/initializeFirebaseConf.js'
 import type { Material, Comentario} from '@/interfaces/Profile.types';  //##


 // interfaces temporales

   interface EstadisticasModeracion {
      pendingsTotal: number;
      aprovatesTotal: number;
      rejectedTotal: number;
   }

   interface MaterialFirestore {
     id?: string;
     titulo: string;
     materialTipo: string;
     nombreAlumno: string;
     alumnoId: string;
     profesorId?: string;
     estado: 'pendiente' | 'aprobado' | 'rechazado';
     fechaSubida: Timestamp;
     fechaModeracion?: Timestamp;
     razonRechazo?: string;
     tipoArchivo: string;
     urlArchivo: string;
     [key: string]: any;
   }

   interface ComentarioFirestore {
      id?: string;
      materialId: string;
      profesorId: string;
      profesorNombre: string;
      mensaje: string;
      destacado: boolean;
      fechaCreacion: Timestamp;
      fechaActualizacion: Timestamp;
   }
 // ========================== 
 // CONFIGURACIÓN DEL SERVICIO
 // ==========================

  const { db } = initializeFirebaseStorage();

  const COLLECTIONS = {
     Materiales: 'Students_Materials',
     Comentarios: 'Comments_Moderation',
     Notificaciones:'Notifications',
     Estadisticas: 'Moderation_Statistics'
  } as const;

  const ERROR_MSGS = {
     MATERIAL_NO_ENCONTRADO: 'Material No Encontrado',
     COMENTARIO_NO_ENCONTRADO: 'Comentario No Encontrado',
     ERROR_FIREBASE:'Error al comunicarse con Firebase',
     PERMISOS_INSUFICIENTES: 'No tienes los permisos necesarios, p/está operación',
     DATOS_INVALIDOS: 'Los datos proporcionados son inválidos'
  } as const;

   // =================================== 
   // GESTIÓN DE MATERIALES PENDIENTES
   // ===================================
  
  /**
   * Obtiene todos los materiales pendientes de moderación
   * @returns Promise<Material[]> Array de materiales pendientes
   * @throws Error si falla la consulta a Firebase
   */

  export class ModerationService{

      static async getPendientes(): Promise<Material[]> {
        console.log('[ModerationStore]: Obteniendo materiales Pendientes');

        try{
            const materialesReference = collection(db,COLLECTIONS.Materiales);
            const qry =  query(materialesReference, where('estado', '==', 'pendiente' ),
                          orderBy('uploadDate', 'pending')
            );

            const snapshot = await getDocs(qry);
            
            if (snapshot.empty) {
               console.log('[ModerationServ]: No hay materiales Pendientes');
                return [];
            }

            const materiales: Material[] = snapshot.docs.map( doc=> {
               const data = doc.data() as MaterialFirestore;
                return this.convertirFirestoreAMaterial(doc.id, data);
            });

            console.log(`[ModerationServ] ${materiales.length} materiales pendientes..`);

            return materiales;
        }catch(error: any){
           console.error('[ModerationServ] Error al obtener los mats. PENDIENTES:', error);
            throw new Error(`${ERROR_MSGS.ERROR_FIREBASE}: ${error.message || 'Error Desconocido'}`);
        }
      }

      static async aprobarMaterialEduc(materialId: string, alumnoId: string, razon?: string)
       :Promise <void> {
         console.log(`[ModerationServ] Aprovando material ${materialId}..`);

         try{
            const profesorId = await this.obtMaterialProfesorActual();
              // Crear bath para operacion atomica
            const batch = writeBeach(db);
               // 1. Actualizar estado del Material
            const materialRef = doc(db,COLLECTIONS.Materiales, materialId);
            batch.update(materialRef, {
               estado: 'rechazado',
               fechaModeracion: serverTimestamp(),
               profesorModeradorId: profesorId,
               razonRechazo: razon || 'No especificada'
            });
               // 2. Actualizar Estadisticas
              const statsRef = doc(db, COLLECTIONS.Estadisticas, 'global');
              batch.set(
                statsRef,
                {
                  totalRechazados: increment(1),
                  ultimaActualizacion: serverTimestamp(),

                },
                 {merge: true}
              );
              //  Ejecutar Batch
              batch.comit();
                // 3. Notificar al Alumno con la razon
              const mensaje = razon
                 ? `Tú material ha sido rechazado. Razon ${razon}`
                 : `Tú material ha sido rechazado`;

              await this.notificarAlumno(alumnoId, 'rechazado', materialId, mensaje);
               console.log(`[ModerationServ] ${materialId} rechazado exitosamente..`);

         }catch(error: any){
           console.error('[ModerationService] Error al rechazar material:', error);
           throw new Error(`Error al rechazar Material: ${error.message}`);
         }
   }

    // ================================
    //     MODÚLO DE COMENTARIOS
    // ================================

      /**
      * Agrega un comentario de profesor a un material
      * @param materialId ID del material
      * @param mensaje Contenido del comentario
      * @param destacado Si el comentario es destacado
      * @returns Promise<Comentario> El comentario creado
      * @throws Error si falla la creación
      */
   static async agregarCommentarioProff(materialId: string, mensaje: string, destacado: boolean)
      :Promise<Comentario>{
          console.log(`[ModerationService] Agregando comentario al material ${materialId}...`);

      try{

            if (!mensaje || mensaje.trim().length === 0) {
               throw new Error('El comentario no puede exceder 1000 caracteres');
            }

            if (mensaje.length > 200) {
               throw new Error('El comentario no puede exceder 1000 caracteres');
            }

            const profesorId = await this.obtenerIdProfesorActual();
            const profesorPorNombre = await this.obtenerNombreProfesor(profesorId);

            const comentarioData: Omit<ComentarioFirestore, 'id'> = {
               materialId,
               profesorId,
               profesorNombre,
               mensaje,
               destacado,
               fechaCreacion: Timestamp.now(),
               fechaActualizacion: Timestamp.now()
            };

            const cometariosRefer = collection(db, COLLECTIONS.Comentarios);
            const docRefer =  await addDoc(cometariosRefer,comentarioData);

            const comentario: Comentario = {
               id: docRefer.id,
               materialId,
               autorId: profesorId,
               autorNombre: profesorNombre,
               mensaje: mensaje.trim(),
               destacado,
               fechaCreacion:   new Date(),
               fechaActualizacion:  new Date()
            };

             console.log(`[ModerationService] Comentario ${docRef.id} agregado exitosamente`);
             return comentario;
      }catch(error: any){
          console.error('[ModerationService] Error al agregar comentario:', error);
          throw new Error(`Error al agregar comentario: ${error.message}`);   
      }
   }

   static async rechazarMaterial(materialId: string, alumnoId: string, razon?: string): Promise<void> {
        console.log(`[ModerationService] Rechazando material ${material}...`);

        try {
            const profesorId = await obtenerIdProfesorActual();
            const batch = writeBeach(db);

            // 1. Actualizar el estado del material
            const materialRef = doc(db, COLLECTIONS.Materiales, materialId);
            batch.update(materialRef, {
                estado: 'rejected',
                fechaModeracion: serverTimestamp(),
                profesorModeradorId: profesorId,
                razonRechazo: razon || 'No especificada'
            });

            const statsRef = doc(db, COLLECTIONS.Estadisticas, 'global');
            batch.set(statsRef, {
                totalRechazados: increment(1),
                ultimaActualizacion: serverTimestamp()
            }, {merge: true });

              await batch.comit();

              const mensaje = razon
                ? `Tu materiales ha sido Rechazado. Razón ${razon}`
                : 'Tu material ha sido rechazado';
                 await this.notificarAlumno(alumnoId, 'rejected', materialId, mensaje);
        } catch(error: any){
            console.error(`[ModerationService] Error al rechazar material`,error);
             throw new Error(`Error al rechazar material: ${error.message}`);
        }
   }
   /**
    * Obtiene todos los comentarios de un Material
    * */
   static async obtenerComentariosDeMaterial(materialId: string)
    :Promise<Comentario[]>{
         console.log(
        `[ModerationService] Obteniendo Comentarios del material: ${materialId} `);

         try{
            const comentariosRef = collection(db, COLLECTIONS.Comentarios);
         const consulta = query(comentariosRef, where('materialId', '==', materialId),
                                 orderBy('fechaCreacion', 'desc') );

               const snapshot = await getDocs(consulta);

            if (snapshot.empty) {
                 console.log(`[ModerationService] No hay comentarios para: ${materialId}`);
                 return[];
            }

            const commentarios: Comentario[] = snapshot.docs.map(doc=>{
               const data = doc.data() as ComentarioFirestore;
                   return this.convertirFirestoreAMaterial(doc.id, data);
            });

            return commentarios;
         }catch(error: any){
             console.error('[ModerationService] Error al obtener comentarios:', error);
                throw new Error(`Error al obtener comentarios: ${error.message}`);
         }
   }
      
      /**
       * Actualiza un comentario Existente
       * */
      static async actualizarComentario(comentarioId: string, nuevoMensaje: string, destacado?: boolean)
       :Promise <void> {

          console.log(`[ModerationService] Actualizando Comentario ${comentarioId} `);

         try{

            if (!nuevoMensaje || nuevoMensaje.trim().length === 0) {
                throw new Error('El comentario no debe estar vacío');
            }

            const comentariosRef = doc(db, COLLECTIONS.Comentarios, comentarioId);

            const comentarioDoc = await getDoc(comentariosRef);

            if (!comentarioDoc.exists()) {
               throw new Error(ERROR_MSGS.COMENTARIO_NO_ENCONTRADO);
            }
            
                    // Gracia gran Editor por ayudarme
            const updateData: any = {
                mensaje: nuevoMensaje.trim(),
                fechaActualizacion: serverTimestamp()
            };

            if (destacado!== undefined) {
               updateData.destacado = destacado;
            }

             await updateDoc(comentarioRef, updateData);

              console.log(`[ModerationService] Comentario ${comentarioId} ACTUALIZADO Exitosamente..`);
         }catch(error: any){
             console.error('[ModerationService] Error al actualizar comentario:', error);
           throw new Error(`Error al actualizar comentario: ${error.message}`);
         }
      }

      /**
       * Elimina un comentario
       * @param comentarioId ID del comentario a eliminar
       * @returns Promise<void>
       * @throws Error si falla la eliminacion
       * */
      static async eliminarComentario(comentarioId: string): Promise<void> {
          console.log(`[ModerationService]: Eliminando comentario ${comentarioId}... `);
          
         try{
               const comentarioRef = doc(db, COLLECTIONS.Comentarios, comentarioId);

               // Verificar que el comentario existe
               const comentarioDoc = await getDoc(comentariosRef);
            
            if (!comentarioDoc.exists()) {
              throw new Error(ERROR_MSGS.COMENTARIO_NO_ENCONTRADO); 
            }
                  // Eliminar
                await deleteDoc(comentarioRef);
            
               console.log(`[ModerationService] Comentario ${comentarioId} ELIMINADO Exitosamente..`);

         }catch(error: any){
            console.error(`[ModerationService] Error al Eliminar Comentario:`, error);
            throw new Error(`Error al Eliminar Comentario: ${error.mensaje}`);
         }
      }

      // =========================
      //     ESTADISTÍCAS
      // =========================
      
      /**
       * @returns Obtiene las Estadistícas<EstadisticasModeracion
       * @throws Error si falla la consulta
       * */
      static async obtenerEstadisticas(): Promise<EstadisticasModeracion> {
         console.log('[ModerationService] Obteniendo Estadísticas...');

         try{
              // Obtener conteos directamente de Firestore
             const materialesRef = collection(db, COLLECTIONS.Materiales); 

              // Query para pendientes
             const qPendientes = query(
                  materialesRef,
                   where('estado', '==', 'pendiente')
               );

             const snapshotPendientes =  await getDocs(qPendientes);

               // Query para aprobados
             const qAprobados = query(materialesRef, where('estado', '==', 'aprovado'));
             const snapshotAprobados = await getDocs(qAprobados);

             // Query para rechazados
               const qRechazados =  query(
                   materialesRef,
                   where('estado', '==', 'rechazado')
               );

               const snapshotRechazados =  await getDocs(qRechazados);

               const stats: EstadisticasModeracion = {
                  pendingsTotal: snapshotPendientes.size,
                  aprovatesTotal: snapshotAprobados.size,
                  rejectedTotal: snapshotRechazados.size             
               };

               console.log(`[ModerationService] Estadísticas obtenidas:`, stats);
             return stats;
         }catch(error: any){
             console.error(`[ModerationService] Error al obtener las Estadísticas:`,error);
              throw new Error(`Error al obtener las Estadísticas: ${error.message}`);
         }
      } 

      // ===============================
      //    METODOS AUXILIARES PRIVADOS
      // ===============================

      /**
       * Notifica al alumno sobre el estado de su material
       * @param alumnoId del alumno
       * @param estado Estado del material(aprovado/rechazado) 
       * @param materialId ID del material
       * @param mensaje Mensaje personalizado
       * @returns Promise<void>
       * @private
       *  */
      private static async notificarAlumno(alumnoId: string, estado: 'approved' | 'rejected', materialId: string, mensaje: string)
       :Promise<void>{

         try{
             const notificationData = {
                userId: alumnoId,
                tipo: 'moderacion',
                estado,
                materialId,
                mensaje,
                leida: false,
                fechaCreacion: serverTimestamp()
             };

             const notificacionesRef = collection(db, COLLECTIONS.Notificaciones);
              await addDoc(notificacionesRef, notificationData);

              console.log(`[ModerationService] Notificación envíada al Estudiante ${alumnoId}`);
         }catch(error: any){
             console.warn(`[ModerationService] Error al envíar Notificación: ${error.message}`);
         }
      }
      
      /**
       * Obtiene el ID del profesor actualmente logueado
       * @returns Promise<string> ID del profesor
       * @private
       * */
      private static async obtenerIdProfesorActual(): Promise<string> {
           // TODO: Implementar integración con AuthStore
           // ahora retorna un ID de placeholder
           // En producción debería obtener el ID del usuario autenticado


          // const authStore = useAuthStore();
          // return authStore.user?.uid || '';

         console.warn('[ModerationService] Usando ID de profesor placeholder - implementar AuthStore');
         return 'profesor_placeholder_id';

      }


      private static async obtenerNombProfesorActual(profesorId: string): Promise<string> {
           // TODO: Implementar integración con AuthStore
           // ahora retorna un ID de placeholder
           // En producción debería obtener el ID del usuario autenticado


          // const authStore = useAuthStore();
          // return authStore.user?.uid || '';

         console.warn('[ModerationService] Usando Nombre de profesor placeholder - implementar AuthStore');
         return 'Profesor';
      }

      /**
       * Convierte el documento de Firestore a Material
       * @param id ID del documento
       * @param de Datos del documento
       * @returns Material Objeto Material tipado
       * @private
       * */
      private static convertirFirestoreAMaterial(id: string, data: MaterialFirestore): Material {
          return {
             id,
             titulo:  data.titulo,
             materia: data.materia,
             nombreAlumno: data.nombreAlumno,
             alumnoId: data.alumnoId,
             estado: data.estado,
             fechaSubida: 
               data.fechaSubida instanceof Timestamp
                  ? data.fechaSubida.toDate()
                  : new Date(),
             tipoArchivo: data.tipoArchivo,
             urlArchivo: data.urlArchivo,
             razonRechazo: data.razonRechazo,
             profesorModeradorId: data.profesorId
          } as Material;
      }

      /**
       * Convierte el documento de Firestore a Comentario
       * @param id ID del documento
       * @param data Datos del documento
       * @returns Comentario Objeto Comentario tipado
       * @private
       * */
      private static convertirFirestoreAComentario(id: string, data: ComentarioFirestore)
       :Promise <Comentario> {

         return {
            id,
            materialId: data.materialId,
            autorId: data.profesorId,
            autorNombre: data.profesorNombre,
            mensaje: data.mensaje,
            destacado: data.destacado,
            fechaCreacion:
              data.fechaCreacion instanceof Timestamp
                ? data.fechaCreacion.toDate()
                : new Date(),
               fechaActualizacion:
                 data.fechaActualizacion instanceof Timestamp
                  ? data.fechaActualizacion.toDate()
                  : new Date()
         };
      }

      /**
       * Valida que el material existe y esta en estado pendiente
       * @param materialId ID del material
       * @returns Promise<boolean> true si es valido
       * @throws Error si el material no existe o no esta pendiente
       * @private
       * **/   
      private static async validarMaterialPendiente(materialId: string):
        Promise<boolean> {
         try{
                const materialsRef = doc(db, COLLECTIONS.Materiales, materialId);
                const materialesDoc = await getDoc(materialsRef);

                 if (!materialesDoc.exists()) {
                   throw new Error(ERROR_MSGS.MATERIAL_NO_ENCONTRADO);
                 }

                 const data = materialesDoc.data() as MaterialFirestore;

                 if (data.estado !== 'pending') {
                   throw new Error('El material no está en estado de Pendiente');
                 }

                 return true;
         }catch(error: any){
            console.error('[ModerationService] Error al validar material:', error);
            throw error;
         }
      }
   }   
   // ============================
   // EXPORTACIÓN POR DEFECTO
   // ============================
  export default ModerationService;