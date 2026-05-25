import { 
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc
} from 'firebase/firestore'
import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage'
import { initializeFirebaseStorage } from '@/config/initializeFirebaseConf.js'
import type { StudentUser } from '@/types/interf.index'

const { db } = initializeFirebaseStorage()
const storage = getStorage()

interface Material {
  id_material: string
  nombre_material: string
  fechaSubida: string
  size?: number
  status?: 'approved' | 'pending' | 'rejected' | 'aprobado' | 'rechazado' | 'pendiente' // *ajustado*
  url?: string
  uid_alumno: string
  nombreAlumno?: string   //new add Date: May 26th, 2026 
  uploadedBy?: string  //new add Date: May 26th, 2026 
  /*archivoURL?: string  // [no existe]*/
}
  // El nombre era incorrecto: se tenia 'materials' en lugar del actual
export class MaterialService {
  private static readonly COLLECTION_MATERIALS = 'Students_Materials'
  private static readonly COLLECTION_STUDENTS = 'form_students-register'

  // ═══════════════════════════════════════════════════════════════════════
  // GET MATERIALS BY STUDENT ID
  // ═══════════════════════════════════════════════════════════════════════
  static async getMaterialsByStudentId(uid: string): Promise<Material[]> {
    try {
      if (!uid?.trim()) {
        throw new Error('UID es requerido')
      }

      const materialsRef = collection(db, this.COLLECTION_MATERIALS)
      const q = query(materialsRef, where('autorId', '==', uid))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        return []
      }

      const materials: Material[] = []

      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data()
        // me faltaba un propiedad y tambien se deberia aplicar reactividad. La informacion deberá subirse estrictamente
        // alinearse en naming con la herramienta. Ademas de verificar los detalles menores de las clases de Tiempo, Espacio, entre otras
        // Se deme tener estricto cuidado para la destructuracion del uid y recibirse unicamente por medio de StoreToRefs, por extranio
        // que parezca user.uid no funciona y no lo reconce.
        //  LA paginacion esta debbugenadose, para solucionarse. y ajustar lo que haga falta
        materials.push({
          id_material: docSnap.id,
          nombre_material: data.titulo ||  data.nombre_material || data.nombre || 'Sin nombre', //*ajustado*
          fechaSubida: data.fechaCreacion?.toDate() || data.fecha_subida || new Date().toISOString(),
          size: data.size || data.tamano || 0,
          status: data.status || data.estado || 'pending',
          url: data.archivoURL || data.url || data.downloadURL || '', //*ajustado*
          uid_alumno: data.autorId || uid,
          nombreAlumno: data.nombreAlumno || '', //unico detalle mostrar en [admiMaterialStudent]
          uploadedBy: data.nombreAlumno || '' //fecha en la misma que la 67 (<> objetivo[contrato])
        }) 
      }
//uid_alumno: lineas: 41,60 ❌
      return materials

    } catch (error: any) {
      console.error('[MaterialService] Error al obtener materiales:', error)
      throw new Error(`No se pudieron obtener los materiales: ${error.message}`)
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // GET STUDENT PROFILE
  // ═══════════════════════════════════════════════════════════════════════
  static async getStudentProfile(uid: string): Promise<StudentUser | null> {
    try {
      if (!uid?.trim()) {
        throw new Error('UID es requerido')
      }

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('[Service] 🔎 Buscando Perfil para UID: ', uid);
      console.log('[Service] 📁 Colección: ', this.COLLECTION_STUDENTS);
      console.log('[Service] 🖇️ La RUTA Completa: ', `${this.COLLECTION_STUDENTS}/${uid}` );

        const docRef = doc(db, this.COLLECTION_MATERIALS, uid);
          // const docRef = doc(db, this.COLLECTION_MATERIALS, studentUidProfile, materialId);backup line
      const docSnap = await getDoc(docRef);

      console.log('[Service] 📄 El documento existe: ', this.COLLECTION_STUDENTS);
      if (!docSnap.exists()) {
        console.warn('[Service] El Perfil no fue ECNONTRADO');
        console.warn('[Service] El UID buscado: ', uid);
        console.warn('[Service] La Colección: ',this.COLLECTION_STUDENTS);
        console.warn('[Service] Revisar en Firebase Console. La Herramienta');
        console.warn(`[Service] 1. Existe ${this.COLLECTION_STUDENTS}?`);
        console.warn(`[Service] 2. ¿Existe el documento con ID: ${uid}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        return null;
      }

      const data = docSnap.data()
      console.log('[Service] El Perfil ha sido HALLADO/ENCONTRADO: ',data);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      return {
        uid: currentUser.uid,
        uid_alumno: currentUser.uid,
        username: currentUser.email?.split('@')[0] || 'estudiante',
        name: currentUser.displayName?.split(' ')[0] || 'Estudiante',
        lname: currentUser.displayName?.split(' ').slice(1).join(' ') || '',
        email: currentUser.email || '',
        role: 'alumno',
        autorRole: 'alumno',
        numCuenta: ''
      } as StudentUser
        // console.log('¿Quien eres?: > ', profile_user.uid);
       // return profile_user;
        // console.log('UID procesado, comienza tú Descarga');
        // deberia
    } catch (error: any) {
      console.error('[MaterialService] Error al obtener perfil:', error)
      throw new Error(`No se pudo obtener el perfil: ${error.message}`)
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // DOWNLOAD MATERIAL
  // ═══════════════════════════════════════════════════════════════════════
  static async downloadMaterial(materialId: string, studentUid: string): Promise<void> {
    try {
      if (!materialId?.trim()) {
        throw new Error('ID de material inválido')
      }

      // Get material document
      const docRef = doc(db, this.COLLECTION_MATERIALS,materialId);

      console.log('[Service] Ruta Firestore:', `${this.COLLECTION_MATERIALS}/${materialId}`);

      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Material no encontrado');
      }

      const data = docSnap.data();
       /*console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
       console.log('[Service] 📄 DOCUMENTO COMPLETO:', JSON.stringify(data, null, 2));
       console.log('[Service] 📄 CAMPOS DISPONIBLES:', Object.keys(data));
       console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        const storagePath = data.storagePath || data.path*/

      const downloadURL =  data.archivoURL || data.storagePath || data.path || data.URL || data.downloadURL
      
      if (!downloadURL) {
        console.log('[Service] 📄 CAMPOS DISPONIBLES:', Object.keys(data));
        console.error('[Service] ❌ Valores:', data);
        throw new Error('URL no Disponible');
      }
      const filename = 
      data.titulo ||           
      data.nombre_material ||
      data.name ||
      'material.pdf'

      /*if (!storagePath) {
        throw new Error('Ruta de almacenamiento no disponible')
      }*/

      // Get download URL from Storage
      /*const fileRef = storageRef(storage, storagePath)
      const downloadURL = await getDownloadURL(fileRef)*/
      /*Solo es funcional con los usuario creados por la f(n) de crear usuarios independiente
      en usuarios ya creados es infuncional*/

      // Trigger download
      const link = document.createElement('a')
      link.href = downloadURL
      link.download = data.nombre_material || 'material.pdf'
      link.target = `${filename}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

    } catch (error: any) {
      console.error('[MaterialService] Error al descargar material:', error)
      throw new Error(`No se pudo descargar el material: ${error.message}`)
    }
  } 

       // Cargar los materiales propios del rol: 'student' estudiante, con sesion activa [23/5/26]
    static async fetchStudentMaterials(userId: string): Promise<Material[]>{
      const q = query(
        collection(db, this.COLLECTION_MATERIALS),
          where('autorId', '==', userId),
          where('deleted', '==', false),
          where('createdAt', '==', 'desc')
        );

        const snapshot = await getDocs(q);
        
        return snapshot.docs.map( doc => ({
            id: doc.id,
             ...doc.data()
        })) as Material[]
    }
      // Control del recurso: valida que el material tiene una URL previa la abrir el modal [23/5/26]
    static resolvePreviewUrl(material: Material): string | null {
      console.log('Material completo :-> ',JSON.stringify(material) );
      return material.archivoURL ?? material.url  ?? null;
    }
  }