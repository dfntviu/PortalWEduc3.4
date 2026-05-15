/**
 * ══════════════════════════════════════════════
 * 			TIPOS Y ENUMS
 * ══════════════════════════════════════════════
 * */
 enum ToastType {
 	SUCCESS = 'success',
 	  ERROR = 'error',
 	WARNING = 'warning',
	INFO = 'info'
 }

export enum ToastPosition {
 	 TOP_RIGTH = 'top-rigth',
 	 TOP_LEFT = 'top-left',
 	 TOP_CENTER = 'top_center',
 	 BOTTOM_RIGTH = 'bottom-rigth',
 	 BOTTOM_LEFT = 'bottom-left',
 	 BOTTOM_CENTER = 'bottom-center'
 }


 interface ToastOptions {
 	title: string;
 	message: string;
 	type: ToasType;
 	duration?: number;
 	position?: ToastPosition;
 	dimmissible?: boolean;
 	icon?: string;
 	onClose?: () => void;
 }


 interface Toast extends ToastOptions {
 	id: string;
 	timestamp: Date;
 	isVisible: boolean;
 }

 /**
  *  ═══════════════════════════════════════
  *    CLASE PRINCIPAL DEL SERVICIO
  *  ═══════════════════════════════════════
  * */
  export  class ToastServiceClass {
    	private toasts: Toast[] = [];  //omiti los parentesis
    	private listeners: Set<(toasts: Toast[]) => void> = new Set();
    	private defaultDuration = 3000; // 3 segundos
    	private defaultPosition = ToastPosition.TOP_RIGTH;
    	private maxToasts = 5;

    	/**
  		 * ───────────────────────────────────────────
  		 *	 MÉTODOS PÚBLICOS - MOSTRAR TOASTS
  		 * ───────────────────────────────────────────
   		*/

   		/**
   		 * Mostrar toast de exito
   		 * */
    	success(title: string, message: string, duration?:number): string {
    		return this.show({
    			title,
    			message,
    			type: ToasType.SUCCESS,
    			duration: duration || this.defaultDuration,
    			icon: '✓'
    		});
    	}

    	/**
    	 * Mostrar toast de error
    	 * */
    	error(title: string, message: string, duration?: number): string {
    		return this.show({
    			title,
    			message,
    			type: ToasType.ERROR,
    			duration: duration || this.defaultDuration * 2,
    			icon: '✕'
    		});
    	}

    	warning(title: string, message: string, duration?: number): string {
    		return this.show({
    			title,
    			message,
    			type: ToasType.INFO,
    			duration: duration || this.defaultDuration * 2,
    			icon: '¡'
    		});
    	}

    	show(options: ToastPosition): string {

    		const id = this.generateId();

    		toast: Toast  = {
    			id,
    			title: options.title,
    			type: options.type,
    			duration: options.duration ||  this.defaultDuration,
    			position: options.duration || this.defaultPosition,
    			dimmissible: options.dimmissible !== false,
    			icon: options.icon,
    			timestamp: new Date(),
    			isVisible: true,
    			onClose: options.onClose
    		};

    		this.toast.push(toast);


    		if (this.toasts.length > this.maxToasts) {
    			this.remove(toasts[0].id);
    		}

    		this.notifyListeners();

    		if (toast.duration>0) {
    			setTimeOut(() => {
    				this.remove(id);
    			}, toast.duration);
    		}

    		return id;
    	}


    	/***
    	 * ───────────────────────────────────────────────
    	 * 	MÉTODOS PÚBLICOS - GESTION  DE TOASTS
    	 *  ───────────────────────────────────────────────
    	 */


    	/**
    	 * Remover toast por ID
    	 * */
    	remove(id:string): void {
    		const index = this.toast.findIndex(t => t.id === id );

    		if (index === -1) return;

    		const toast = this.toast[index];
    		  // Llamar al calback onClose si existe
    		if (toast.onClose) {
    			toast.onClose();
    		}

    		// Remover test
    		this.toast.splice(index, 1);
    		this.notifyListeners();
    	}

    	/**
    	 * Remover todos los toasts
    	 * */
    	clear(): void {
    		this.toasts = [];
    		this.notifyListeners();
    	}

    	/**
    	 * Obtener todos los toasts
    	 * */
    	getAll(): Toast[] {
    		return [...this.toasts];
    	}

      /**  
   	  *  ─────────────────────────────────────────────── 
   	  * 	 MÉTODOS PÚBLICOS - GESTION  DE TOASTS
   	  *  ───────────────────────────────────────────────
   	  **/

      /**
       * Configurar la duracion por defecto
       * */
        setDefaultConfiguration(duration: number): void {
      	  this.defaultDuration = duration;
        }

       /**
        * Configurar la posicion por defecto
        * */
        setDefaultPosition(position: ToastPosition): void {
        	this.defaultPosition = position;
        }


        /**
         * Configurar posicion por defecto
         * */
        setMaxtToasts(max: number): void {
        	this.maxToasts = max;


        	while(this.toasts.length > max){
        		this.remove(this.toasts[0].id);
        	}
        }

         /**
         * ─────────────────────────────────────────────── 
         * 			METODOS PUBLICOS
         * ───────────────────────────────────────────────
   	 	 **/

        
        /**
         * Suscribirse a cambios en los toasts
         * */

        suscribe(callback: (toasts: Toast[]) => void): () => void {
        	this.listeners.add(callback);

        	 // Notificar inmediatamente al estado actual
        	callback(this.getAll());

        	return () => {
        		this.listeners.delete(callback);
        	};
        }


        /**
         * ─────────────────────────────────────────────── 
         * 			METODOS PRIVADOS
         * ───────────────────────────────────────────────
   	 	 **/

        /**
         * Generate ID único
         * */
        private generateId(): string {
        	return `toast_ ${Date.now}_ ${Math.random().toString(36).substr(2,9)}`;
        }

		/**
         * Notificar a todos los liteners
         * */
        private notifyListeners(): void {
        	const toasts = this.getAll();
        	this.listeners.forEach(callBack => callback(toasts));
        }

    }


    /**
 	* ═════════════════════════════════════════
 	* EXPORTACIÓN DEL SINGLETON
 	* ═════════════════════════════════════════
 	*/
   export const ToastService = new ToastServiceClass();