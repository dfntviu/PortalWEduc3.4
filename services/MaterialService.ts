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
  status?: 'approved' | 'pending' | 'rejected'
  url?: string
  uid_alumno: string
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
          nombre_material: data.nombre_material || data.nombre || 'Sin nombre',
          fechaSubida: data.fechaCreacion?.toDate() || data.fecha_subida || new Date().toISOString(),
          size: data.size || data.tamano || 0,
          status: data.status || data.estado || 'pending',
          url: data.url || data.downloadURL || '',
          uid_alumno: data.autorId || uid
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

      const docRef = doc(db, this.COLLECTION_STUDENTS, uid)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        return null
      }

      const data = docSnap.data()

      return {
        uid,
        uid_alumno: uid,
        username: data.email?.split('@')[0] || '',
        name: data.nombre || data.name || '',
        lname: data.apellido || data.lastName || '',
        email: data.email || '',
        role: 'alumno',
        autorRole: 'alumno',
        numCuenta: data.numCuenta || data.cuenta || ''
      } as StudentUser

    } catch (error: any) {
      console.error('[MaterialService] Error al obtener perfil:', error)
      throw new Error(`No se pudo obtener el perfil: ${error.message}`)
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // DOWNLOAD MATERIAL
  // ═══════════════════════════════════════════════════════════════════════
  static async downloadMaterial(materialId: string): Promise<void> {
    try {
      if (!materialId?.trim()) {
        throw new Error('ID de material inválido')
      }

      // Get material document
      const docRef = doc(db, this.COLLECTION_MATERIALS, materialId)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        throw new Error('Material no encontrado')
      }

      const data = docSnap.data()
      const storagePath = data.storagePath || data.path

      if (!storagePath) {
        throw new Error('Ruta de almacenamiento no disponible')
      }

      // Get download URL from Storage
      const fileRef = storageRef(storage, storagePath)
      const downloadURL = await getDownloadURL(fileRef)

      // Trigger download
      const link = document.createElement('a')
      link.href = downloadURL
      link.download = data.nombre_material || 'material.pdf'
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

    } catch (error: any) {
      console.error('[MaterialService] Error al descargar material:', error)
      throw new Error(`No se pudo descargar el material: ${error.message}`)
    }
  }
}