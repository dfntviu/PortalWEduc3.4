
 import { MaterialBseService } from './MaterialBaseService.ts';
 import type {MaterialBase} from '@/intefaces/interfaceToast.ts';


	class MaterialUserService extends MaterialBseService {
 	 
 	 static MAX_WEEKLY_MATERIALS = 8;
 	 static MAX_MONTHLY_MATERIALS = 31;

 	 /**
 	  * Subir multiples materiales en el mes
 	  *  */
 	static async uploadWeeklyMaterials(materials: Partial<MaterialBase>[], uid: string){
 	 	try{
 	 		const currentWeekMaterials = this.getWeeklyMaterials(uid);
 	 		const totalAfterUpload = currentWeekMaterials.length + materials.length;

 	 		if(totalAfterUpload > MAX_MONTHLY_MATERIALS){
 	 			throw new Error(`No es posible subir más de  ${this.MAX_MONTHLY_MATERIALS} materiales por semana`);
 	 		}

 	 		for (const mats of materials) {
 	 			await super.saveMaterialsEduc({
 	 				titulo: mats.titulo,
					descripcion: mats.descripcion,
					archivoURL: mats.archivoURL,
					fechaCreacion: mats.fechaCreacion,
					autorNombre: mats.autorNombre,
					autorMaterialUid: mats.autorId
 	 			});
 	 		}
 	 			console.log(`[MaterialUserService] Se subieron ${materials.length} materiales para ${id_material}`)
 	 	}catch(error){
 	 		console.error('[MaterialUserService] ❌ Error en uploadWeeklyMaterials:', error);
			 throw error;
 	 	}
 	}

 	/**
 	 * Consultar materiales por semana
 	 * */
 	static async getWeeklyMaterials(uid: string): Promise<MaterialBase[]> {
 	 	try{
 	 		const db = getFirestore();
 	 		const now = new Date();

 	 		const startOfWeek = new Date(now);
			startOfWeek.setDate(now.getDate() - now.getDay());
			startOfWeek.setHours(0,0,0,0);

			const endOfWeek = new Date(now);
			startOfWeek.setDate(now.getDate() (6 -now.getDay());
			startOfWeek.setHours(23,59,59,999);

			const materialsReference = collection(db,this.COLLECTION);
			const q = query(
				materialsReference,
					where('autorMaterialUid', '==', autorId),
					where('fechaCreacion', '>=', startOfWeek),
					where('fechaCreacion', '<=', endOfWeek)
				);

			const snap = await getDocs(q);
			return  snap.map(doc => ({uid: doc.id, ...doc.data()} as MaterialBase));
 	 	}catch(error){
 	 		console.error('[MaterialUserService] Error al obtener los mats X Semana');
 	 		 throw error;
 	 	}
 	}

 	/**
 	 * Consultar los materiales del mes
 	 * */

 	static async getMonthlyMaterials(uid: string): Promise[]<MaterialBase> {
 		try{
 			const db = getFirestore();
 	 		const now = new Date();

 	 		const  startOfMonth = new Date(now.getFullYear() - now.getMonth(),1);
 	 		const  endtOfMonth = new Date(now.getFullYear() - now.getMonth(),+1,0 23, 59,59);

 	 		const materialsRef = collection(db, this.COLLECTION);
		      const q = query(
		        materialsRef,
		        where('autorId', '==', uid),
		        where('fechaCreacion', '>=', startOfMonth),
		        where('fechaCreacion', '<=', endOfMonth)
		      );

				const snap = await getDocs(q);
				return snap.docs.map(doc => ({ uid: doc.id, ...doc.data() } as Material));
 		}catch(){
 			 const snap = await getDocs(q);
			  return snap.docs.map(doc => ({ uid: doc.id, ...doc.data() } as Material));
 		}
 	}

	} 