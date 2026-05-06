  import { collection, getDocs,docs, query, where, Timestamp } from 'firebase/firestore';
  import { initializeFirebaseStorage } from '@/config/initializeFirebaseConf';
  import type {MaterialT} from '@/interfaces/initializeFirebaseConf';

   // Destructuracion del objeto db de firestore
  const { db } = initializeFirebaseStorage();
  
  interface TeacherStatistics {
     totalMaterials: number;
     approvedMaterials: number;
     rejectedMaterials: number;
     pendingReview: number;
     inReview: number;
  	  rejectedCommentsCount: number;
   }
   

   interface StudentStatistics {
      totalMaterials: number;
      approved: number;
      rejected: number;
      pending: number;
      approvalRate: number;
   }

 	
   interface DailySummary {
   	date: string;
   	activitiesCount: number;
   	 activities: Array <{
   	 	studentId: string;
   	 	materialType: string;
   	 	timestamp: Date;
   	 	status: string;
   	 	message: string;
   	 }>;
   }

  interface AdminStatistics {
  		totalStudents: number;
  		totalTeachers: number;
  		totalMaterials: number;
  		materialsApproved: number;
  		materialsRejected: number;
  		materialsPending: number;
  }
  	// NO actualiza el contador, falta iun store para invocar al metodo getStudents de este servicio
	// El Segmento: Bloque-3 de la interfaz es infuncional. Verificar la interfaz: 'TeacherMetrics' para depurar y consolidar errores
	export class StaticsServiceUn {
		private static readonly MATERIALS_COLL   =  'Students_Materials' //materials
		private static readonly STUDENTS_COLL    = 'student_register';
		private static readonly TEACHERS_COLL    = 'teacher_register';
		private static readonly NOTIFICAION_PROF = 'notifications';
				//  ── Profesor ─────────────────────
		static async getTeacherStatistics(): Promise <TeacherStatistics> {
			try {
				 const reference = collection(db, this.MATERIALS_COLL);

				 const [allSnap, approvedSnap, rejectedSnap, pendingSnap, inReviewSnap] = 
				 	await Promise.all([
				 		getDocs(query(reference)),
				 		getDocs(query(reference, where('estado', '==', 'aprovado'))),
				 		getDocs(query(reference, where('estado', '==', 'rechazado'))),
				 		getDocs(query(reference, where('estado', '==', 'pendiente'))),
				 		// getDocs(query(reference, where('estado', '==', 'in_review'))),
				 	]);

				 	let rejectedCommentsCount = 0;

				 	rejectedSnap.docs.forEach(doc =>{
				 		if (doc.data().rejectionReason) rejectedCommentsCount++;
				 	});

				 	return {
						totalMaterials:    allSnap.size,
						approvedMaterials: approvedSnap.size,
						rejectedMaterials: rejectedSnap.size,
						pendingReview:     pendingSnap.size,
						// inReview:          inReviewSnap.size,
						rejectedCommentsCount: rejectedCommentsCount,
					};  /*value*/
					 	/*return {
					 		totalMaterials:     allSnap.alumnoId,
					 		approvedMaterials:  approvedSnap.tipoMaterial,
					 		rejectedMaterials:  rejectedSnap.size,
					 		pendingReview:     pendingSnap.size,
					 		inReview:          inReviewSnap.size,
					 		rejectedCommentsCount,
					 	};*/
			}catch(error: any){
				 throw new Error(`Error al obtener estadísticas del profesor ${error.message}`);
			}
		}

		static async getTotalMaterials(): Promise <number> {
			try{
				const snap = await getDocs(collection(db,this.MATERIALS_COLL));
				 return snap.size;
			}catch(error: any){
				  throw new Error(`Error al obtener total de materiales: ${error.message}`);
			}
		}

		static async getApprovedMaterials(): Promise < number> {
			try {
				const qy = query(collection(db, this.MATERIALS_COLL), where('status', '==', 'approved'));

				const snap = await getDocs(qy);
				return snap.size;
			} catch(error: any){
				throw new Error(`Error al obtener los materiales aprobados: ${error.message}`);
			}
		}

		static async getRejectedMaterials(): Promise < number> {
			try {
				const qy = query(collection(db, this.MATERIALS_COLL), where('status', '==', 'rechazado'));

				const snap = await getDocs(qy);
				return snap.size;
			} catch(error: any){
				throw new Error(`Error al obtener los materiales rechazados: ${error.message}`);
			}
		}

		static async getPendingMaterials(): Promise < number> {
			try {
				const qy = query(collection(db, this.MATERIALS_COLL), where('estado', '==', 'pendiente'));

				const snap = await getDocs(qy);
				return snap.size;
			} catch(error: any){
				throw new Error(`Error al obtener los materiales pendientes: ${error.message}`);
			}
		}
			// [ready]
		static async getInReviewMaterials(): Promise < number> {
			try {
				const qy = query(collection(db, this.MATERIALS_COLL), where('estado', '==', 'in_review'));

				const snap = await getDocs(qy);
				return snap.size;
			} catch(error: any){
				throw new Error(`Error al obtener los materiales en revision: ${error.message}`);
			}
		}

		static async getRejectedCommentsCount(): Promise <number>{
			try{
				const qy = query(collection(db, this.MATERIALS_COLL), where('estado', '==', 'rejected'));
				const snap = await getDocs(qy);
				let count = 0;

				snap.docs.forEach(doc=>{
					const data =  doc.data();
					if (data.comentarioRechazo || data.rejectionReason) count++;
				});

				return count;
			}catch(error: any){
				throw new Error(`Error al contar comentarios de rechazo: ${error.message}`);
			}
		}
			//  ── Estudiante ─────────────────────
		static async getStudentStatistics(studentId: string): Promise<StudentStatistics> {
			try{
				const reference = collection(db, this.MATERIALS_COLL);

				const [allSnap, approvedSnap,rejectedSnap, pendingSnap] = await Promise.all([
					getDocs(query(reference, where('autor_id', '==', studentId))),
					getDocs(query(reference, where('autor_id', '==', studentId)), where('status', '==', 'aprobado')),
					getDocs(query(reference, where('autor_id', '==', studentId)), where('status', '==', 'rechazado')),
					getDocs(query(reference, where('autor_id', '==', studentId)), where('status', '==', 'pendiente')),
				]);

				const total = allSnap.size;
				const approvedCount =  approvedSnap.size;

				const approvalRate = total > 0 ? Math.round((approvedCount / total) * 10000) / 100 : 0;


				return {
					totalMaterials: total,
					approved: approvedCount,
					rejected: rejectedSnap.size,
					pending: pendingSnap.size,
					approvalRate,
				};
			
			}catch(error: any){
				throw new Error(`Error al obtener Estadistícas del Alumno: ${error.message}`);
			}
		}

		static async getStudentApprovalRate(studentId: string): Promise <number> {
			try{
				const stats = await this.getStudentStatistics(studentId);

				return stats.approvalRate;
			}catch(error: any){
				throw new Error(`Error al calcular la tasa de aprobación:  ${error.message}`);
			}
		}
		  // ── Administrador del Sys ────────────────────────────────────────────────── [fixed]
		static async getAdminStatistics(): Promise<AdminStatistics> {
			try{
				const matRef = collection(db,this.MATERIALS_COLL);

				const [
					studentsSnap,
					teachersSnap,
					allMatsSnap,
					approvedSnap,
					rejectedSnap,
					pendingSnap,
				] = await Promise.all([
					getDocs(collection(db, this.STUDENTS_COLL)),
					getDocs(collection(db,this.TEACHERS_COLL)),
					getDocs(collection(db, this.MATERIALS_COLL)),
					getDocs(query(matRef, where('estado', '==', 'aprobado'))),
					getDocs(query(matRef, where('estado', '==', 'rechazado'))),
					getDocs(query(matRef, where('estado', '==', 'pendiente'))),
				]);

				const stats: AdminStatistics = {
					totalStudents: studentsSnap.size,
					totalTeachers: teachersSnap.size,
					totalMaterials: allMatsSnap.size,
					materialsApproved: approvedSnap.size,
					materialsRejected: rejectedSnap.size,
					materialsPending: pendingSnap.size,
				};

				return stats;
			}catch(error: any){
				throw new Error(`Error al obtener las Estadistícas globales ${error.message}`);
			}
		}

		static async getTotalTeachers(): Promise<number> {
			try{
				const snap = await getDocs(collection(db, this.TEACHERS_COLL));
				return snap.size;
			}catch(error: any){
				console.error('Error al obtener total de Profesores', error);
				throw error;
			}
		}

		static async getTotalStudents(): Promise<number> {
			try{
				const snap = await getDocs(collection(db, this.STUDENTS_COLL));
				return snap.size;
			}catch(error: any){
				console.error('Error al obtener el total de Estudiantes', error);
				throw error;
			}
		}
		  // ── Resumenes temporales ──────────────────────────────────────────────────
		static async getSemesterSummary(professorId: string): Promise<number> {
			try{
				const now = new Date();
				const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(),0,0,0);
				const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(),23,59,59);

				const qy = query(collection(db, this.NOTIFICAION_PROF),
					where('professorId', '==', professorId),
					where('timestamp', '>=', Timestamp.fromDate(startOfDay)),
					where('timestamp', '<=', Timestamp.fromDate(endOfDay)),
				);
					const snap = await getDocs(qy);
					const activities = snap.docs.map( doc => {
						const data = doc.data();
							return {
								studentId:  data.alumnoId || 'N/A',
								materialType:  data.tipoMaterial ||  'Material',
								timestamp:  data.timestamp?.toDate() || new Date(),
								 status: data.estado || 'pendiente',
								message: data.mensaje || '',
							}
					});

						return {
								date: now.toISOString().split('T')[0],
								activitiesCount: activities.length,
								activities,
							};
			} catch(error: any){
				throw new Error(`Error al obtener el resumen Semestral: ${error.message}`);
			}
		}
		// [ready]
		static async getDailySummary(profesorId: string): Promise<number>{
			try{
				const now = new Date();
				const  startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(),-6, 1);
				const endOfPeriod = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 23, 59,59);
				
				const query_SumDaily = query(collection(db, this.NOTIFICAION_PROF),
					where('profesorId', '==', profesorId),
					where('timestamp', '>=', Timestamp.fromDate(startOfDay)),
					where('timestamp', '<=', Timestamp.fromDate(endOfPeriod)),
				);

				const snap = await getDocs(query_SumDaily);
				const activities = snap.docs.map(doc => {
					const data = doc.data();
							return {
								studentId:  data.alumnoId  || 'N/A',
								materialType:  data.tipoMaterial ||  'Material',
								timestamp:  data.timestamp?.toDate() || new Date(),
								status: data.estado || 'pendiente',
								message: data.mensaje || '',
							}
					});

					return {
					 date: 			now.toLocaleDateString('es-MX'),
					 activitiesCount:   activities.length,
					 activities,
				 };
			}catch(error: any){
				 throw new Error(`Error al obtener el resument semestral: ${error.message}`);

			}
		}
	}