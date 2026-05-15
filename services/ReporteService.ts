 import { collection, query, where, getDocs,Timestamp, orderBy} from 'firebase/firestore';
 import { initializeFirebaseStorage } from '@/config/initializeFirebaseConf';
 import { ServiceFormatMaterialsClass } from './ServiceFormatMaterials';
   import type { FormatType } from '@/types/interfces_formato.ts';
   import type { Material } from '@/types/interfces_formato2.ts';
   // import JSZip from 'jszip';
   import  { saveAs } from 'file-saver';
   /*RevisarServiceFormatMaterials cuando la compilacion llegue hasta ahi */
   const { db } = initializeFirebaseStorage();
 /**
  * ════════════════════════════════════════
  *    	INTERFACES Y TIPOS
  * ════════════════════════════════════════
  */

 export interface MaterialReport {
 	id: string;
 	titulo: string;
 	descripcion: string;
 	autorNombre: string;
 	autorEmail: string;
 	autorId: string;
 	estado: 'approved'| 'rejected' | 'pending';
 	fechaDeCreacion: Date;
 	archivoURL: string;
 	archivoNombre?: string;
 	categoria: string;
 	tags: string[];
 	tamanioMB: number;
 	recientemente_aprobado: boolean; 
 }

 export interface ReportData {
 	semanaPasada: MaterialReport[];
 	mesPasado: MaterialReport[];
 	totalSemanaPasada: number;
 	totalMesPasado: number;
 }

 interface DateRange {
 	comienzo: Date;
 	fin: Date;
 }

 /**
  *  ════════════════════════════════════════
  *       CLASE PRINCIPAL DEL SERVICIO
  *  ════════════════════════════════════════
  * */
   export class ReportService {  Students_Materials
   	   private static readonly COLLECTION_NAME = 'Students_Materials';
   	   private readonly RECENT_APPROVAL_DAYS = 7;


   	   /**
   	    * ──────────────────────────────────────────
   	    *   OBTENCION DE DATOS
   	    * ──────────────────────────────────────────
   	    * */

   	   /**
   	    * Obtener Materiales por rango de fechas según el rol
   	    * */
   	  static async obtenerMaterialesRango(
   	   	  role: 'student' | 'teacher',
   	   	  userId?: string
   	   	): Promise <ReportData> {
   	   	  	try{
				     const rangoSemanal = this.obtenerFechaRango(8);
				     const rangoMensual = this.obtenerFechaRango(30);

				    // Obtener materiales
				    const [semanaPasada, mesPasado] = await Promise.all([
                    this.recuperarMaterialesPorRango(rangoSemanal, role, userId),  //*
                    this.recuperarMaterialesPorRango(rangoMensual, role, userId) //*
                ]);
                  return {
                    semanaPasada,
                    mesPasado,
                    totalSemanaPasada: semanaPasada.length,
                    totalMesPasado: mesPasado.length
                  };

   	   	  	}catch(error){
   	   	  		console.error('Error al obtener el material por Rango',error);
   	   	  		throw new Error('No fue posible, obtener los materiales al Reporte');
   	   	  	}
   	   }

          /**  
           * Obtener rango de fechas desde hoy hacia atras
           **  [sin sincronia no contiene f(n)s de dicha nat]*/ 
         private static obtenerFechaRango(dias: number): DateRange {
            const  fin = new Date();
            const  inicio = new Date();

            inicio.setDate(inicio.getDate() - dias);
            inicio.setHours(0, 0 ,0, 0);
            fin.setHours(23, 59, 59, 999);


            return { inicio, fin };
         }


         /**
          * Buscar Materiales en Firestore segun rango y rol
          * */
         private static async recuperarMaterialesPorRango(rango: DateRange, role: 'student' | 'teacher', usuarioId?: string): 
         Promise<MaterialReport[]> 
         {
            // rango habia sido 'number'
            try{
               console.log('Coleccion Estudiantes: ', this.COLLECTION_NAME);
                 const  materialsRef = collection(db, this.COLLECTION_NAME);

                 let q;
                 // alert('Consolidacion Rango: ',rango);

                 if (role === 'student' && usuarioId) {
                      // Alumnos solo ven sus propios materiales
                     q = query(materialsRef,
                           where('autorId', '==', usuarioId),
                           where('fechaCreacion' , '>=', Timestamp.fromDate(rango.inicio)),
                           where('fechaCreacion',  '<=', Timestamp.fromDate(rango.fin)),
                              orderBy('fechaCreacion', 'desc')
                              );
                        // omití la ','
                 } else if (role === 'teacher') { //*se detiene ->132* 
                     q = query(
                           materialsRef,
                           where('estado', 'in', ['aprobado','pendiente']),
                           where('fechaCreacion', '>=', Timestamp.fromDate(rango.inicio)),
                           where('fechaCreacion', '>=', Timestamp.fromDate(rango.fin)),
                              orderBy('fechaDeCreacion', 'desc')
                        );
                 } else {
                     // La opcion por defecto si no se satisfacen las condiciones anteriores(nunca aparece, hasta q existe un 3er rol)
                     q = query( materialsRef,
                           where('fechaCreacion', '>=', Timestamp.fromDate(rango.inicio)),
                           where('fechaCreacion', '<=', Timestamp.fromDate(rango.fin)),
                              orderBy('fechaCreacion', 'desc')
                        );
                 }

                  const snapshot = await getDocs(q);
                  // Se define a doc, pero doc es referenciado a 'docs'
                   return snapshot.docs.map( doc => {
                           const data = doc.data() 
                            return this.transformarMaterialEnReporte(doc.id, data);
                   });
            }catch(error){
               console.error('Error al obt. los materiales por Rango');
               throw error;
            }
         }

         /**
          * Tranformar documento de Firestore a Reporte Material
          * */
         private static transformarMaterialEnReporte(id: string, data: any): MaterialReport {
            const fechaDeCreacion = data.fechaDeCreacion?.toDate() ?? new Date();  //*
            const fechaAprobacion = data.fechaAprobacion?.toDate() ?? new Date();

            const recentlyApproved = this.esRecientementeAprobada(fechaAprobacion);

             return {
                id,
                titulo: data.titulo || 'Sin Título',
                descripcion: data.descripcion || '',
                autorNombre: data.autorNombre || '',
                autorEmail: data.autorEmail || '',
                autorId: data.autorId || 'pendiente',
                fechaDeCreacion,
                archivoURL: data.archivoURL || '' , 
                archivoNombre: data.archivoNombre || '',
                categoria: data.categoria || 'Sin categoría',
                tags: Array.isArray(data.tags) ? data.tags : [],
                tamanioMB: data.tamanioMB ? data.tamanioBytes / (1024 * 1024) : 0, //*
                recientemente_aprobado: recentlyApproved
             };
         }

         private static esRecientementeAprobada(fechaAprobacion?: Date): boolean {
            if (!fechaAprobacion) return false;

            const ahora = new Date();

            const diferentesDias = Math.floor(
                (ahora.getTime() - fechaAprobacion.getTime()) / ( 1000 * 60 * 60 * 24)
               );
               //* falto devolver
              return diferentesDias <= this.RECENT_APPROVAL_DAYS;
         }


         static async exportarAPDF(data: MaterialReport[], nombreArchivo: string): Promise<void> {
            try{
               
               const materiales = convertirReporteAMaterial(data);

               const resultado = await ServiceFormatMaterials.classifyForFormat(materiales, 'pdf', nombreArchivo);

                  if (!resultado.success) {
                      throw new Error(resultado.message);
                  }


            }catch(error){
               console.error('Error al exportar el Reporte de los últimos materiales a PDF', error);
                throw new Error('No fue posible generar el archivo PDF');
            }
         }

         static async exportarAExcel(data: MaterialReport[], nombreArchivo: string): Promise<void>  {
            try{  
                  const materiales = convertirReporteAMaterial(data);
                     //* omití, pagarla sincronica
                  const resultado = await ServiceFormatMaterials.classifyForFormat(materiales, 'xlsx', nombreArchivo);

                  if (!resultado.success) {
                     throw new Error(resultado.message);
                  }

            }catch(error){
               console.error('Error al exportar el Reporte de los últimos materiales a Excel', error);
                throw new Error('No fue posible generar el archivo Excel');
            }
         }


         static async exportarADocx(data: MaterialReport[], nombreArchivo: string): Promise<void> {
            try{

               const materiales =  convertirReporteAMaterial(data);

               const resultado = await ServiceFormatMaterials.classifyForFormat(materiales, 'DOCX', nombreArchivo);

               if (!resultado.success) {
                   throw new Error(resultado.message)
               }

            }catch(error){
               console.error('Error al exportar el Reporte de los últimos materiales a DOCX', error);
                throw new Error('No fue posible generar el archivo en formato DOCX');
            }
         } 


         private static convertirReporteAMaterial(reportes: MaterialReport[]): Material[] {
            return reportes.map( reporte => {
                id: reporte.id;  //*
                titulo: reporte.titulo; //*
                descripcion: reporte.descripcion; //...
                autorNombre: reporte.autorNombre;
                autorEmail: reporte.autorEmail;
                autorId: reporte.autorId;
                estado: reporte.estado;
                fechaCreacion: reporte.fechaCreacion;
                archivoURL: reporte.archivoURL;
                archivoNombre: reporte.archivoNombre;
                categoria: reporte.categoria;
                tags: reporte.tags;
                tamanioBytes: reporte.tamanioMB * 1024 * 1024 //*
            }) as Material[];
         }

         /**
          * Descarga de materiales de la semana como ZIP (unic. p/alumnos)
          * */
         /*async descargaSemanalMaterialesZIP(materialesZIP: MaterialReport[]): Promise<void> {
            try{

               if (!materiales.length) {
                   throw new Error('Ningún tipo de Material para su descarga');
               }

                const zip = new JSZip();
                const directorio = zip.folder('materiales-de-la_semana') as JSZip;

                // Descargar cada archivo y agregarlo a zip
                const downloandPromises = material.map(async (material, index) => {   //*
                    try{
                       const respuesta =  await fetch(material.archivoURL);
                       const objDataIndiv = await respuesta.blob();

                          // Generar el nombre de archivo unico
                        const extension = materiales.archivoNombre?.split('').pop() || 'pdf';
                        const nombreArchivo = `${index + 1}_ ${this.sanitizarNombreArchivo(material.titulo)}.${extension}`;

                         directorio.file(nombreArchivo,objDataIndiv);

                    }catch(error){
                       console.error(`Error descargando: ${material.titulo}`, error);
                    }
               });

                await Promise.all(downloandPromises);

                const zipBlob = await zip.generateAsync({ type: 'blob' });
                saveAs(zipBlob, `materiales-de-la_semana_${new Date().toISOString().split('T')[0]}.zip`);
            }catch(error){
               console.error('Error al generar materiales en ZIP ', error); //*
                throw new Error('No fue posible, generar el archivo ZIP');
            }
         }*/


         /**
          * Sanitizar el nombre del archivo
          * */  // *bara demas*
         private static sanitizarNombreArchivo(nombreArchivo: string): string {
               return nombreArchivo  
                .replace(/[^a-z0-9_-]/gi, '_')
                .replace(/_+/g, '_')
                .substring(0,50);
         }

         /**
          *  ══════════════════════════════════════ 
          *         VALIDACIONES
          *  ══════════════════════════════════════*/

         /**
          *   Validar que los datos del reporte no esten vacios
          * */
         static validarReportePorDia(data: MaterialReport[]): boolean {
             return Array.isArray(data) && data.length > 0;
         }

         /**
          *  Obtener formato recomendado segun la ctd de materiales
          * */
         static obtenerElFormatoRecomendado(contador: number): FormatType {
            if (contador <= 20) return 'pdf';         //lectura inmediata
               if (contador <= 100) return 'docx';    // consigo la edicion del mat
                  return 'xlsx';    //mejorar el analisis, si de graficos se trata
                  //*[la coma fuera no dentro] *
         }

         /**
          *  ══════════════════════════════════════ 
          *         EXPORTACION DEL SINGLETON
          *  ══════════════════════════════════════*/
         // convertirDeReport eAMaterial(reporetes: MaterialReport[], nombreArchivo: string): Promise<void> 
   }

   // Solo una forma de importar