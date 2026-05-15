    // Material Extendido(Generico)
export interface MaterialToast {
      id: string;
      titulo: string;
      descripcion: string;
      autorNombre: string;
      autorEmail: string;
      autorId: string;
      estado: MaterialStatus;
      fechaCreacion?: Date;
      fechaActualizacion?: Date;
      fechaAprobacion?: Date;
      archivoURL: string;
      archivoNombre?: string;
      archivoTipo?: string;
      categoria: string;
      tags: string[];
      tamanioBytes: number;
      moderadorId?: string;
      moderadorNombre?: string;
      vistas?: number;
      descargas?: number;
    }
    // 29/03/2026
export interface MaterialBase {
    autorId: string; 
    titulo: string;
    descripcion: string;
    nombreArchivo: string;
    archivoURL: string;
    fechaCreacion: Date; // new 30/03/26
    // status: string;
    tipoArchivo: string; //*
}
 
 export interface UploadMaterialDTO {
    titulo: string;
    descripcion: string;
    file:File;
 }

		
	export type MaterialStatus = 'aprobado' | 'rechazado' | 'pendiente';
	
	/* ═════════════════════════*/
	/* 		TIPOS P/LOS REPORTES*/
	/* ═════════════════════════*/

   export interface MaterialReport extends Omit<Material, 'tamanioBytes'> {
   	  tamanioMB: number;
   	  recientemente_aprobado: boolean;
   }

   export interface ReportData {
   	  semanaPasada: MaterialReport[];
   	     mesPasado: MaterialReport[];
   	  totalSemanaPasada: number;
   	  totalMesPasado: number;
   }

   export interface DataRange {
   	  comienzo: Date;
   	  fin: Date;
   }

    export type ReportPeriod = 'week' | 'month' | 'custom';

     export interface ReportFilters {
     	  periodo: ReportPeriod;
     	  fechaRango: DataRange;
     	  categoria?: string;
     	  estado?: MaterialStatus;
     	  autorId?: string;
     	}

     export interface ReporteEstadisticas {
      	  totalMateriales: number;
      	  aprobados: number;
      	  rechazados: number;
      	  pendientes: number;
      	  aprobados: number;
      	  categorias: Record<string, number>;
      	  tamanioPromedioMB: number;
      	  tamanioTotalMB: number;
      	  recientementeAprobados: number;
      	  archivosGrandes: number; //>5MB
      }

      /**
       * ══════════════════════════════════════════
       *        TIPOS PARA EXPORTACION
       * ══════════════════════════════════════════
       * */
       export type FormatType = 'pdf' | 'docx' | 'xls';

       export interface ConversionResult {
           success: boolean;
           message: string;
           blob?: Blob;
           nombre_archivo?: string;
       }

       export interface ExportOptions {
         format: FormatType;
         filename: string;
         includeStats?: boolean;
         customFields?: string[];
       }

      /**
 		* ══════════════════════════════════════════
 		*   TIPOS PARA TOASTS/NOTIFICACIONES
 		* ══════════════════════════════════════════
 	  */


 	export enum ToastType {
	 	 SUCCESS = 'success';
	 	 ERROR = 'error';
	 	 WARNING = 'warning';
	 	 INFO = 'info';
 	 }	

 	export enum ToastPosition {
 	 	TOP_RIGTH= 'top-right' ;
 	 	TOP_LEFT=  'top-left' ;
 	 	TOP_CENTER= 'top-center' ;
 	 	BOTTOM_RIGTH= 'bottom-right' ;
 	 	BOTTOM_LEFT = 'bottom-left';
            BOTTOM_CENTER = 'bottom-center';
 	}

 	export interface ToastOptions {
 	 	titulo: string;
 	 	mensaje: string;
 	 	tipo:ToastType;
 	 	duracion?: number;
 	 	posicion?: ToastOptions
 	 	desestimable?: boolean;
 	 	icono?: string;
 	 	onClose?: ()=>void;
 	}

 	 export interface ToastType extends ToastOptions {
 	 	id: string;
 	 	timestamp: Date;
 	 	isVisible: boolean;
 	 }


 	/**
 	 * ══════════════════════════════════════════
 	 *      TIPOS PARA USUARIOS (para el modal de reportes- [Welcomes- Vws-Bienvenida])
 	 * ══════════════════════════════════════════*/ 	
 	export UserRole = 'alumno' | 'profesor';  /*| 'admin';*/


 	 	export interface UserProfile {
  			uid: string;
  			name: string;
  			apellido: string;
  			email: string;	
  			role: UserRole;
  			carrera?: string;
  			numCuenta?: string;
  			// photoURL?: string;
  			createdAt: Date;
  			lastLogin?: Date;	
	   }
