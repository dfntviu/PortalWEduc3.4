/**
 * Composable para modulo de fechas
 * Gestiona la Lógica en formato de timestamps de Firebase
 * 
 *  La correcion fue correctamente aplicada, el retorno estaba dentro, no fuera
 * */
import {ref,computed} from 'vue';

 interface DateFormatterOption {
 	locale?: string;
 	 dateStyle?: 'full' | 'long'| 'short';
 	 timeStyle?: 'full' | 'long'| 'short';
 }
 	
 	type TimestampInput = { toDate: () => Date } | Date | string | number;

  export function useDateFormatter(options_d: DateFormatterOption) {
  const { locale = 'es-MX', dateStyle, timeStyle } = options_d ?? {};

  const formatearFecha = (timestamp: TimestampInput): string => {
    if (timestamp === null || timestamp === undefined) { //!timestamp
      throw new Error('El formato de fecha no fue proporcionado');
    }
    try {
      const fecha = (timestamp as { toDate?: () => Date }).toDate
        ? (timestamp as { toDate: () => Date }).toDate()
        : new Date(timestamp as string | number | Date);

      if (isNaN(fecha.getTime())) {
        throw new Error('Fecha no válida');
      }

      if (dateStyle || timeStyle) {
        const intlOptions: Intl.DateTimeFormatOptions = {};
        if (dateStyle) intlOptions.dateStyle = dateStyle;
        if (timeStyle) intlOptions.timeStyle = timeStyle;
        return new Intl.DateTimeFormat(locale, intlOptions).format(fecha);
      }

      return fecha.toLocaleDateString(locale);
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      throw error;
    }
  };

    const formatearFechaRelativa = (timestamp: any):string => {
       if (!timestamp) return 'Fecha no disponible';  
    	try{
    		const fecha = timestamp.toDate() ? timestamp.toDate() : new Date(timestamp);
    		const ahora = new Date();
    		const diffMs = ahora.getTime() - fecha.getTime();
    	    // const  diffSegundos = Math.floor(diffMs/1000);
    	    const  diffMinutos = Math.floor(diffMs/60);
    	    const  diffHoras = Math.floor(diffMs/60);
    	    const  diffDias = Math.floor(diffMs/24); 

    	    /*if (diffSegundos<60) return 'Hace un momento';
    	     if (diffMinutos < 60) return `Hace ${diffMinutos} minuto ${diffMinutos}>1 ? 's' : '' `;*/
           if (diffHoras<1) return `Hace menos de una Hora`;
    	     if (diffHoras<24) return `Hace ${diffHoras} hora ${diffHoras} > 1 ? 's' : '' `;
    	     if (diffDias<7) return `Hace ${diffDias} día ${diffDias} > 1 ? 's' : '' `;
     		
     		 return formatearFecha(timestamp);
     	}catch(error){
     		console.error('Error al formatear la Fecha de Actualidad: ',error);
     		return 'Fecha desconocida';
     	}
    };
    
    const esHoy = (timestamp: any): boolean => {
    	try{
    		 const fecha = timestamp.toDate ? timestamp.toDate()  : new Date(timestamp);
    		 const hoy  = new Date();

    		 return ( fecha.getDate()  === hoy.getDate()  &&
    		     	    fecha.getMonth() === hoy.getMonth() &&
    		     	 fecha.getFullYear() === hoy.getFullYear()
    		     	);
    	}catch{
    		return false
    	}
    }

      return {
      	formatearFecha,
      	formatearFechaRelativa,
      	esHoy,
      };
    
    }