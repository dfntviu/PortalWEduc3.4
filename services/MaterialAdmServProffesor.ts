// ═══════════════════════════════════════════════════════════
// 1. IMPORTS
// ═══════════════════════════════════════════════════════════
// Firebase SDK
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy,
  Timestamp,
  type DocumentData,
  type QueryConstraint,
} from 'firebase/firestore';

// Config interna
import { initializeFirebaseStorage } from '@/config/initializeFirebaseConf';

const { db } = initializeFirebaseStorage();

// Tipos TypeScript
import type { Material } from '@/types';

// ═══════════════════════════════════════════════════════════
// 2. CONSTANTES DE CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════
const COLLECTION_NAME = 'Students_Materials';
const REQUEST_TIMEOUT = 15000; // 15 segundos
const MAX_RETRIES = 3;

// ═══════════════════════════════════════════════════════════
// 3. TIPOS PRIVADOS
// ═══════════════════════════════════════════════════════════
/**
 * Estructura de documento Material en Firebase
 * Solo para uso interno del servicio
 */
interface FirebaseMaterialDTO extends DocumentData {
  title: string;
  uploadedAt: Timestamp;
  uploadedBy: string;
  type?: string;
  description?: string;
  url?: string;
  status?: string;
}

/**
 * Opciones de filtrado temporal
 */
interface TimeFilterOptions {
  startDate: Date;
  endDate: Date;
}

// ═══════════════════════════════════════════════════════════
// 4. CLASE DEL SERVICIO
// ═══════════════════════════════════════════════════════════
/**
 * Servicio para gestión de materiales educativos desde perspectiva del profesor
 * 
 * Responsabilidades:
 * - Comunicación con Firebase Firestore
 * - Transformación FirebaseDTO → Material TypeScript
 * - Manejo de errores de red
 * 
 * Prohibido:
 * - Lógica de negocio (eso va en store)
 * - Estado reactivo
 * - Validaciones de reglas de negocio
 */
export class DesplegarMaterialServiceR2 {
  private readonly collectionRef;


  constructor() {
   console.warn('Consumiendo servicio Alm. de Firebase...')
    this.collectionRef = collection(db, COLLECTION_NAME);
  }

  // ───────────────────────────────────────────────────────────
  // MÉTODOS PÚBLICOS - API del servicio
  // ───────────────────────────────────────────────────────────

  /**
   * Obtiene TODOS los materiales subidos por estudiantes
   * Sin filtros aplicados
   * 
   * @returns Array de materiales transformados
   * @throws {Error} Si falla la comunicación con Firebase
   */
  async getAllStudentsMaterials(): Promise<Material[]> {
      console.log('Hiciste click en: Filtro "todos los materiales"');
    try {
      console.log('Coleccion a mostrar', this.collectionRef);
      const snapshot = await getDocs(this.collectionRef);
      console.log('Obj Coleccion cargada', snapshot);
          /*Modificar cualquier o aniadir cualquier atributo nuevo, pues ahí a pesar de no
          aplicar los cambios en las capas previas, el sistema seguira mostrando error */
      return snapshot.docs.map(doc => 
        this._transformFirebaseToMaterial(doc.id, doc.data())
      );
    } catch (error) {
      throw this._handleFirebaseError(error, 'getAllStudentsMaterials');
    }
  }
  
  /**
   * Obtiene materiales ordenados por fecha de subida (más recientes primero)
   * 
   * @returns Array de materiales ordenados descendentemente por uploadedAt
   * @throws {Error} Si falla la query a Firebase
   * [Es correcta]
   */
  async getMaterialsSortedByLatest(): Promise<Material[]> {
      console.warn('Hiciste click en: Materiales subidos "Las ultimas 2 semanas".')
      // Los operadores estaban invertidos, imposible rankear, en limites inexistentes
    try {
        const range = this._getLastNDaysRange(14);
      const q = query(
        this.collectionRef,
        where('fechaCreacion', '>=', Timestamp.fromDate(range.startDate)),
        where('fechaCreacion', '<=', Timestamp.fromDate(range.endDate)),
          orderBy('fechaCreacion', 'desc')
      );
      console.log('Colleccion Filtro 2 -> ', this.collectionRef);
          // orderBy('fechaCreacion', 'desc')
      const snapshot = await getDocs(q);
      
      const filter2 = snapshot.docs.map(doc => 
        this._transformFirebaseToMaterial(doc.id, doc.data())
      );
      console.warn('Materiales de las ult. 2 filtrados  "Las ultimas 2 WEEKS" son: [', filter2,']');
      return filter2;
    } catch (error) {
      console.log('[ERROR de Firebase]: Debes Ingresar el indíce compuesto', error);
      throw this._handleFirebaseError(error, 'getMaterialsSortedByLatest');
    }
  }

  /**
   * Obtiene materiales agrupados/ordenados por nombre de usuario
   * 
   * @returns Array de materiales ordenados por uploadedBy
   * @throws {Error} Si falla la query a Firebase
   */
  async getMaterialsByUsername(): Promise<Material[]> {
    console.warn('Hiciste click en: Materiales organizados "por Nombre de AUTH/Usuario".')
    try {   
            /** se debio corregir el indice compuesto,  Unicamente por el nombre de ID(exactamente identico a la misma propiedad )de cuando
             este fue registrado  -> MODIFQUE LA LINEA 152 **/
      const q = query(
        this.collectionRef,
        orderBy('autorId', 'asc'),
        orderBy('fechaCreacion', 'desc') // Secundario: más recientes primero dentro de cada usuario
      );
      console.log('Colleccion Filtro 3 -> ', this.collectionRef);
      const snapshot = await getDocs(q);
      
      const filter3 =  snapshot.docs.map(doc => 
        this._transformFirebaseToMaterial(doc.id, doc.data())
      );
      console.warn('Materiales del FILTRo  "obtenidos por Autor" son: [', filter3,']');
       return filter3;
    } catch (error) {
      console.log('[ERROR Firebase]: Debes Ingresar el indíce compuesto', error);
      throw this._handleFirebaseError(error, 'getMaterialsByUsername');
    }
  }

  /**
   * Obtiene materiales subidos HOY (desde las 00:00 hasta ahora)
   * 
   * @returns Array de materiales del día actual
   * @throws {Error} Si falla la query temporal
   */
  async getMaterialsToday(): Promise<Material[]> {
    try {
      console.warn('Hiciste click en: Materiales filtrados "Por hoy".')
      const today = this._getTodayRange();
        console.log('Coleccion a mostrar ', this.collectionRef);
      const q = query(
        this.collectionRef,
        where('fechaCreacion', '>=', Timestamp.fromDate(today.startDate)),
        where('fechaCreacion', '<=', Timestamp.fromDate(today.endDate)),
        orderBy('fechaCreacion', 'desc')
      );

      const snapshot = await getDocs(q);
      console.log('load of Colecction', snapshot);
      
      const Filter4 = snapshot.docs.map(doc => 
        this._transformFirebaseToMaterial(doc.id, doc.data())
      );
      console.error('Materiales del FILTRo  "Mats de Hoy" son: [', Filter4,']');
      return Filter4;
    } catch (error) {
      console.log('[ERROR de Firebase]: Debes Ingresar el indíce compuesto', error);
      throw this._handleFirebaseError(error, 'getMaterialsToday');
    }
  }

  /**
   * Obtiene materiales de los últimos 2 días (48 horas hacia atrás)
   * 
   * @returns Array de materiales de las últimas 48 horas
   * @throws {Error} Si falla la query temporal
   */
  async getMaterialLast2Days(): Promise<Material[]> {
    // console.warn('Hiciste click en: Materiales organizados "por los Ultimos 2 días"')
    try {
      const range = this._getLastNDaysRange(2);
      
      const q = query(
        this.collectionRef,
        where('fechaCreacion', '>=', Timestamp.fromDate(range.startDate)),
        where('fechaCreacion', '<=', Timestamp.fromDate(range.endDate)),
        orderBy('fechaCreacion', 'desc'),
        // orderBy('uploadDate', 'desc')
      );
       console.log('Est. de Coleccion: ', this.collectionRef);
      const snapshot = await getDocs(q);
       console.log('Capt. de la Coll - Data >', snapshot);
      return snapshot.docs.map(doc => 
        this._transformFirebaseToMaterial(doc.id, doc.data())
      );
      /*El index fue creado correctamente solo habra que subir 3 materiales diferentes: En 1 dia, 2 dias
      y volver a realizar la consulta, para motrar los  cambios visibles.*/
    } catch (error) {
      console.log('[ERROR de Firebase]: Debes Ingresar el indíce compuesto', error);
      throw this._handleFirebaseError(error, 'getMaterialLast2Days');
      /**
       * La tecnica esta en tener la excepsion trivial del catch para que el msg de advertencia
       * sea visualizado. Una vez nos otorga el permiso, lo habilitamos y nos olvidamos de la linea
       * Al  no tener la linea de excepcion propia del modulo catch, este la oculto*/
    }
  }

  /**
   * Obtiene materiales de la última semana (7 días hacia atrás)
   * 
   * @returns Array de materiales de los últimos 7 días
   * @throws {Error} Si falla la query temporal
   * [Es correcta]
   */
  async getMaterialsLastWeek(): Promise<Material[]> {
    console.warn('Hiciste click en: Materiales organizados "por la Semana Anterior(Pasada)".')
    try {
      const range = this._getLastNDaysRange(7);
      
      const q = query(
        this.collectionRef,
        where('fechaCreacion', '>=', Timestamp.fromDate(range.startDate)),
        where('fechaCreacion', '<=', Timestamp.fromDate(range.endDate)),
        orderBy('fechaCreacion', 'desc')
      );

      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => 
        this._transformFirebaseToMaterial(doc.id, doc.data())
      );
    } catch (error) {
      console.log('[ERROR de Firebase]: Debes Ingresar el indíce compuesto', error);
      throw this._handleFirebaseError(error, 'getMaterialsLastWeek');
    }
  }

  /*async getMaterialsByAuthorFill7(): Promise<Material[]> {
    alert('Autor con Datos Especificicos');
  }*/

  // ───────────────────────────────────────────────────────────
  // MÉTODOS PRIVADOS - Helpers internos
  // ───────────────────────────────────────────────────────────

  /**
   * Transforma documento de Firebase a tipo Material de TypeScript
   * 
   * @private
   * @param id - ID del documento de Firebase
   * @param data - Datos crudos de Firebase
   * @returns Material tipado y transformado
   */
  private _transformFirebaseToMaterial(id: string, data: DocumentData): Material {
    const firebaseData = data as FirebaseMaterialDTO;
    
    return {
      id,
      title: firebaseData.nombreArchivo || 'Sin título',
      description: firebaseData.descripcion,
      url: firebaseData.archivoURL,
      uploadedBy: firebaseData.autorId || 'Anónimo',
      uploadedAt: firebaseData.fechaCreacion || Timestamp.now(),
      status: firebaseData.estado || 'pendiente',
      size: firebaseData.size ?? data.fileSize ?? 0,
      type: firebaseData.tipoArchivo || 'PDF',
      nombreAlumno:  firebaseData.nombreAlumno,  //atributo de oro, lo unico que omiti
    };
  }

  /**
   * Calcula el rango de fechas para "hoy"
   * Desde las 00:00:00 hasta 23:59:59 del día actual
   * 
   * @private
   * @returns Objeto con startDate y endDate
   */
  private _getTodayRange(): TimeFilterOptions {
    const now = new Date();
      /*Verificar el timeStamp para que corresponda con El TimeStamp de Firebase*/
    const startDate = new Date(now);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);
    
    return { startDate, endDate };
  }

  /**
   * Calcula el rango de fechas para los últimos N días
   * Desde N días atrás a las 00:00 hasta ahora
   * 
   * @private
   * @param days - Número de días hacia atrás
   * @returns Objeto con startDate y endDate
   */
  private _getLastNDaysRange(days: number): TimeFilterOptions {
    const now = new Date();
    
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(now);
    
    return { startDate, endDate };
  }

  /**
   * Maneja errores de Firebase y los transforma en errores descriptivos
   * 
   * @private
   * @param error - Error capturado de Firebase
   * @param operation - Nombre de la operación que falló
   * @returns Error con mensaje user-friendly
   */
  private _handleFirebaseError(error: any, operation: string): Error {
    const errorMessage = error.message || 'Error desconocido';
    const errorCode = error.code || 'UNKNOWN';

    // Log para debugging (solo desarrollo)
    if (import.meta.env.DEV) {
      console.error(`[MaterialDeployServiceR2.${operation}]`, {
        code: errorCode,
        message: errorMessage,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });
    }

    // Mapeo de errores Firebase a mensajes user-friendly
    const friendlyMessages: Record<string, string> = {
      'permission-denied': 'No tienes permisos para acceder a los materiales',
      'not-found': 'No se encontraron materiales',
      'unavailable': 'El servicio de materiales no está disponible temporalmente. Intenta de nuevo en unos momentos',
      'cancelled': 'La operación fue cancelada',
      'deadline-exceeded': 'La operación tardó demasiado tiempo. Verifica tu conexión',
      'resource-exhausted': 'Se alcanzó el límite de consultas. Intenta de nuevo más tarde',
      'failed-precondition': 'Error de configuración en Firebase. Contacta al administrador',
      'aborted': 'La operación fue interrumpida. Intenta de nuevo',
      'out-of-range': 'Parámetros de consulta fuera de rango',
      'unauthenticated': 'Debes iniciar sesión para acceder a los materiales',
      'already-exists': 'El material ya existe',
    };

    const friendlyMessage = friendlyMessages[errorCode] || 
      `Error al obtener materiales en ${operation}: ${errorMessage}`;

    return new Error(friendlyMessage);
  }

  /**
   * Implementación de retry logic con exponential backoff
   * NO USADO actualmente, pero disponible para operaciones críticas
   * 
   * @private
   */
  private async _retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = MAX_RETRIES
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;
        
        // No reintentar en errores que no son transitorios
        const nonRetriableErrors = [
          'permission-denied',
          'unauthenticated',
          'not-found',
          'failed-precondition',
        ];
        
        if (nonRetriableErrors.includes(error.code)) {
          throw error;
        }
        
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt) * 1000;
        await this._sleep(delay);
      }
    }
    
    throw lastError || new Error('Operación falló después de varios intentos');
  }

  /**
   * Helper para delays en retry logic
   * @private
   */
  private _sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ═══════════════════════════════════════════════════════════
// 5. EXPORTACIÓN
// ═══════════════════════════════════════════════════════════
/**
 * Factory function para crear instancia del servicio
 * Permite dependency injection si se necesita en el futuro
 */
  // Exportación por defecto (singleton)
 /* const desplegarMatServiceR2 =  new DesplegarMaterialServiceR2();
  export default desplegarMatServiceR2;*/
  // return new DesplegarMaterialServiceR2();
 // Exportación compuesta

/*  export const desplegarMatServiceR2 = (): DesplegarMaterialServiceR2 => {
    return new DesplegarMaterialServiceR2();
  };
};*/