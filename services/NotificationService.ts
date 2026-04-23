/**  @service NotificationService_Final
 *   @description Servicio unificado para gestión de Materiales
 *   @Proposito Unificar el servicio de Notificaciones(amb. roles)
 * - Coleccion unica
 * - 8 Metodos Avanzados
 * - Filtros por estado y edicion
 *   
 * REMPLAZA:
 * - NotificationsStudentServ
 * - NotificationsProfessorServ
 * */

import { 
    collection, doc, setDoc, getDoc, getDocs, updateDoc, 
    deleteDoc, addDoc, query, where, Timestamp 
} from 'firebase/firestore';
import { initializeFirebaseStorage } from '@/config/initializeFirebaseConf.ts';
import type { Notification } from '@/types/Profile.types';

const { db } = initializeFirebaseStorage(); 

export class NotificationService {
    
    // ============================================
    // COLECCIONES
    // ============================================
    
    private static getCollection(role: 'student' | 'teacher') {
        return role === 'student' ? 'notifications' : 'notificationsProfessor';
    }

    // ============================================
    // CREAR NOTIFICACIONES
    // ============================================
    
    /**
     * Notifica a un alumno
     */
    static async notifyStudent(studentId: string, mensaje: string) {
        try {
            const newDocRef = doc(collection(db, this.getCollection('student')));
            const notification: Notification = {
                alumnoId: studentId,
                mensaje,
                leido: false,
                timestamp: new Date(),
            };
            
            await setDoc(newDocRef, notification);
            return { id: newDocRef.id, ...notification };
            
        } catch (error) {
            console.error('[NotificationService] Error al notificar alumno:', error);
            throw error;
        }
    }

    /**
     * Agrega notificación de profesor
     */
    static async addTeacherNotification(mensaje: string): Promise<Notification> {
        try {
            const notification: Omit<Notification, 'id'> = {
                mensaje,
                fecha: Timestamp.now(),
                leido: false,
            };

            const docRef = await addDoc(
                collection(db, this.getCollection('teacher')), 
                notification
            );

            return { id: docRef.id, ...notification };
            
        } catch (error) {
            console.error('[NotificationService] Error al agregar notificación:', error);
            throw error;
        }
    }

    // ============================================
    // LEER NOTIFICACIONES
    // ============================================

    /**
     * Obtiene todas las notificaciones de un usuario
     */
    static async getNotifications(
        userId: string, 
        role: 'student' | 'teacher'
    ): Promise<Notification[]> {
        try {
            const userField = role === 'student' ? 'alumnoId' : 'profesorId';
            
            const q = query(
                collection(db, this.getCollection(role)),
                where(userField, '==', userId)
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Notification));
            
        } catch (error) {
            console.error('[NotificationService] Error al obtener notificaciones:', error);
            throw error;
        }
    }

    /**
     * Obtiene notificaciones no leídas
     */
    static async getUnreadNotifications(
        userId: string, 
        role: 'student' | 'teacher'
    ): Promise<Notification[]> {
        try {
            const userField = role === 'student' ? 'alumnoId' : 'profesorId';
            
            const q = query(
                collection(db, this.getCollection(role)),
                where(userField, '==', userId),
                where('leido', '==', false)
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Notification));
            
        } catch (error) {
            console.error('[NotificationService] Error al obtener no leídas:', error);
            throw error;
        }
    }

    /**
     * Obtiene notificaciones leídas
     */
    static async getReadNotifications(
        userId: string, 
        role: 'student' | 'teacher'
    ): Promise<Notification[]> {
        try {
            const userField = role === 'student' ? 'alumnoId' : 'profesorId';
            
            const q = query(
                collection(db, this.getCollection(role)),
                where(userField, '==', userId),
                where('leido', '==', true)
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Notification));
            
        } catch (error) {
            console.error('[NotificationService] Error al obtener leídas:', error);
            throw error;
        }
    }

    /**
     * Obtiene notificaciones por estado (solo profesores)
     */
    static async getNotificationsByStatus(
        profesorId: string, 
        estado: 'aprobado' | 'rechazado'
    ): Promise<Notification[]> {
        try {
            const q = query(
                collection(db, this.getCollection('teacher')),
                where('profesorId', '==', profesorId),
                where('estado', '==', estado)
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Notification));
            
        } catch (error) {
            console.error('[NotificationService] Error al obtener por estado:', error);
            throw error;
        }
    }

    // ============================================
    // ACTUALIZAR NOTIFICACIONES
    // ============================================

    /**
     * Marca como leída
     */
    static async markAsRead(
        notificationId: string, 
        role: 'student' | 'teacher'
    ): Promise<void> {
        try {
            const docRef = doc(db, this.getCollection(role), notificationId);
            await updateDoc(docRef, { leido: true });
            
        } catch (error) {
            console.error('[NotificationService] Error al marcar como leída:', error);
            throw error;
        }
    }

    /**
     * Marca como no leída
     */
    static async markAsUnread(
        notificationId: string, 
        role: 'student' | 'teacher'
    ): Promise<void> {
        try {
            const docRef = doc(db, this.getCollection(role), notificationId);
            await updateDoc(docRef, { leido: false });
            
        } catch (error) {
            console.error('[NotificationService] Error al marcar como no leída:', error);
            throw error;
        }
    }

    /**
     * Edita mensaje de notificación
     */
    static async editNotification(
        notificationId: string, 
        nuevoMensaje: string,
        role: 'student' | 'teacher'
    ): Promise<void> {
        try {
            const docRef = doc(db, this.getCollection(role), notificationId);
            await updateDoc(docRef, {
                mensaje: nuevoMensaje,
                fechaEdicion: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('[NotificationService] Error al editar:', error);
            throw error;
        }
    }

    /**
     * Actualiza estado de material (solo profesores)
     */
    static async updateMaterialStatus(
        notificationId: string,
        estado: 'aprobado' | 'rechazado',
        comentario: string
    ): Promise<void> {
        try {
            const docRef = doc(db, this.getCollection('teacher'), notificationId);
            await updateDoc(docRef, {
                estado,
                mensaje: comentario,
                leido: true
            });
            
        } catch (error) {
            console.error('[NotificationService] Error al actualizar estado:', error);
            throw error;
        }
    }

    // ============================================
    // ELIMINAR NOTIFICACIONES
    // ============================================

    /**
     * Elimina una notificación
     */
    static async deleteNotification(
        notificationId: string,
        role: 'student' | 'teacher'
    ): Promise<void> {
        try {
            const docRef = doc(db, this.getCollection(role), notificationId);
            await deleteDoc(docRef);
            console.log(`[NotificationService] Notificación ${notificationId} eliminada`);
            
        } catch (error) {
            console.error('[NotificationService] Error al eliminar:', error);
            throw error;
        }
    }
}