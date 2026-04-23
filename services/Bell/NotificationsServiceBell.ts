 import { getDocs, collection, addDoc, query, where, onSnapshot, updateDoc, doc, orderBy, limit,  Timestamp, deleteDoc} from 'firebase/firestore';
import { initializeFirebaseStorage } from '@/config/initializeFirebaseConf';

const { db } = initializeFirebaseStorage();


 export interface Notification {
 	   id?: string;
    tipo: 'material_aprobado' | 'material_rechazado' | 'material_pendiente' | 'comentario' | 'sistema';
    titulo: string;
    mensaje: string;
 	leido: string;
 	timestamp: date | Timestamp;
 	alumnoId?: string;
 	profesorId?:  string;
 	materilId? : string;
 	icon?:string;
 	link?: string;
 }

 	type NotificationListener = (notifications: Notification[]) => void;

 	export class NotificationServiceBll {
 		  private static unsuscribers: Map<string, () => void> = new Map();

 		  /**
 		   * Env notificacion a un alumno
 		   * */
 		  static async notifyStudent(
 		  	 studentId: string,
 		  	 tipo: Notification['tipo'],
 		  	 titulo: string,
 		  	 mensaje: string,
 		  	 materilId?: string,
 		  	 link?: string,
 		  	): Promise <void> {
	 		  	try{
	 		  		const notification: Omit<Notification, 'id'> = {
	 		  			tipo,
                		titulo,
                		mensaje,
                		leido: false,
                		timestamp: new Date(),
                		alumnoId,
                		materilId,
                		icon: this.getIconForType(tipo),
                		link,
	 		  		};

	 		  		await addDoc(collection(db,'notifications'), notification);
	 		  		console.log('[NotificationsService]: Notificación enviada a estudiante', studentId);
	 		  	}catch(error){	
	 		  		console.error('[NotificationService] Error al enviar notificación',error)
	 		  		   throw error;
	 		  	}
 		  }


 		  static suscribeToStudentNotifications( studentId: string, callback: NotificationListener): 
 		  () => void {
 		  	try{
 		  		const q = query(
 		  			collection(db, 'notifications'),
 		  			where('alumnoId', '===', studentId),
 		  			orderBy('timestamp','desc'),
 		  				limit(50)
 		  			);

 		  			const unsuscribe = onSnapshot(q, (snapshot) => {
 		  				const notifications: Notification[] = snapshot.docs.map(doc => ({
 		  					id: doc.id,
 		  					...doc.data(),
 		  					timestamp: doc.data().timestamp?.toDate() || new Date(),
 		  				})) as Notification[];

 		  				callback(notifications);

 		  			}, (error) => {
 		  				console.error('Error en listener de estudiante', error)
 		  			});
 		  				// Guardar el unsuscribe para limpieza
 		  			this.unsuscribers.set(`student- ${studentId}`, unsuscribe);

 		  		return unsuscribe;
 		  	} catch(error){
 		  		 console.error('Error al suscribirse a Notificaciones', error);
 		  		  throw error;
 		  	}
 		}
 			/**
 			 * Escuchar notificaciones de profesor en tiempo real
 			 * */
 		static suscribeToTeacherNotifications(teacherId: string,
 		   	callback: NotificationListener): ()=> void {
 		  
 		  	 try{
 		  	 	const  q = query(
 		  			collection(db, 'notificationsProfesor'),
 		  			where('profesorId', '===', studentId),
 		  			orderBy('timestamp','desc'),
 		  				limit(50)
 		  			);
 		  	 	const unsuscribe = onSnapshot(q, (snapshot) => {
 		  	 		const notifications: Notification[] = snapshot.docs.map(doc =>  ({ 
 		  	 			id: doc.id,
 		  	 			...doc.data(),
 		  	 			timestamp: doc.data().timestamp?.toDate() || new Date(),
 		  	 		}) as Notification[];

 		  	 		callback(notifications);
 		  	 	}, (error) =>{
 		  	 		console.error('[NotificationService] Error en el listener del profesor');
 		  	 	}

 		  	 	this.unsuscribers.set(`teacher- ${teacherId}`,unsuscribe);

 		  	 	return unsuscribe;
 		  	 }catch(error){
 		  	 	console.error('[NotificationService] Error al suscribirse a las notificaciones');
 		  	 	 throw error;
 		  	 }
 		}

 		 /**
     * Marcar notificación como leída
     */
    static async markAsRead(notificationId: string, isTeacher: boolean = false): Promise<void> {
        try {
            const collectionName = isTeacher ? 'notificationsProfessor' : 'notifications';
            const notifRef = doc(db, collectionName, notificationId);
            await updateDoc(notifRef, { leido: true });
        } catch (error) {
            console.error('[NotificationsService]: Error al marcar como leída', error);
            throw error;
        }
    }

     /**
     * Marcar notificación como leída
     */
    static async markAsRead(notificationId: string, isTeacher: boolean = false): Promise<void> {
        try {
            const collectionName = isTeacher ? 'notificationsProfessor' : 'notifications';
            const notifRef = doc(db, collectionName, notificationId);
            await updateDoc(notifRef, { leido: true });
        } catch (error) {
            console.error('[NotificationsService]: Error al marcar como leída', error);
            throw error;
        }
    }

    /**
     * Marcar todas como leídas
     */
    static async markAllAsRead(userId: string, isTeacher: boolean = false): Promise<void> {
        try {
            const collectionName = isTeacher ? 'notificationsProfessor' : 'notifications';
            const fieldName = isTeacher ? 'profesorId' : 'alumnoId';

            const q = query(
                collection(db, collectionName),
                where(fieldName, '==', userId),
                where('leido', '==', false)
            );

            const snapshot = await getDocs(q);
            
            const updates = snapshot.docs.map(doc => 
                updateDoc(doc.ref, { leido: true })
            );

            await Promise.all(updates);
         } catch (error) {
            console.error('[NotificationsServiceBell]: Error al marcar todas como leídas', error);
            throw error;
        }
    }

    static async deleteNotification(notificationId: string, isTeacher:boolean = false): Promise<void> {
    	try{
    		const collectionName = isTeacher ? 'notifcations-teacher' : 'notifications';
    		 await deleteDoc(doc, collectionName, notificationId);
     	}catch(error){
     		console.error('[NotificationsServiceBell]: Error al eliminar notificación');
     		throw error;
    	}
    }


    /**
     * Limpiar todos los listeners
     * */
    static unsuscribeAll(): void {
    	this.unsuscribers.forEach(unsuscribe =>unsuscribe());
    	this.unsuscribers.clear();
    }

       /**
     * Obtener todos segun el tipo
     * */
    private static getIconForType(tipo:Notification['tipo']): string{
    	const icons: Record<Notification['tipo'], string> = {
    		material_aprobado: '✅',
    		material_rechazado:'❌',
    		material_pendiente:'⏳',
    		comentario: '💬',
    		sistema: 'ℹ️',
    	};

    	return icons[tipo];
    }
 	
 	}