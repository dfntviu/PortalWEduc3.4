import { defineStore } from 'pinia';
import { NotificationService } from '@/services/NotificationService';
import type { Notification } from '@/services/NotificationService';
import { useAuthStore3 } from './authStore3.ts';

	export const useNotificationsStoreBell = defineStore('notification', {
		state: () => ({
			notifications: [] as Notification[],
			unreadCount: 0,
			loading: false,
			error: '',
			listener: null as (() => void) | null,
		}),

		getters: {
			unreadNotifications: (state) => 
				state.notifications.filter(!n=>n.leido),

			recentNotifications: (state) => 
				state.notifications.slice(0,5),

			hasUnread: (state) => state.unreadCount > 0,

			notificationsByType: (state) => (tipo: Notification['tipo']) =>
				state.notifications.filter(n => n.tipo === tipo),
		},

		actions: {
			/**
			 * Iniciar listener de notificaciones
			 * */
			startListening() {
				const authStore = useAuthStore3();
				if (!authStore.user?.uid) {
					console.warn('[NotificationsStore]: No hay usuario autenticado..');
						return;
				}

				this.stopListening();

				this.loading = true;

				try {
					const isTeacher = authStore.role === 'teacher';

					if(isTeacher){
						this.listener = NotificationService.suscribeToTeacherNotifications(
							authStore.user.uid,
							this.handleNotificationsUpdate
						);
					} else {
						this.listener = NotificationService.suscribeToStudentNotifications(
							authStore.user.uid,
							this.handleNotificationsUpdate
						);
					}

					console.log('[NotificationsStore]: Listener iniciado correctamente');
				}catch(err: any){
					this.error = err.message || 'Error al iniciar listener';
					console.error('[NotificationsStore]:', this.error);
				} finally {
					this.loading = false;
				}
			},
			/**
			 * Callback que funciona para actualizar notificaciones 
			 * */
			handleNotificationsUpdate(notifications: Notification[]){
				this.notifications = notifications;
				this.unreadCount = notifications.filter( n =>!n.leido).length;
					// Reproducir sonido si hay nuevas no leídas
				if (this.unreadCount > 0 && this.shouldPlaySound()) {
					this.playNotificationSound();
				}
			},
			/**
			 * Detener listener
			 * */
			stopListening() {
				if (this.listener) {
					this.listener();
					  this.listener = null;
					  console.log('[NotificationsStore] El listener ha sido detenido');
				}
			},

			async markAsRead(notificationId: string) {
	            const authStore = useAuthStore();
	            const isTeacher = authStore.role === 'teacher';

	            try {
	                await NotificationsService.markAsRead(notificationId, isTeacher);
	            } catch (err: any) {
	                this.error = err.message || 'Error al marcar como leída';
	                throw err;
	            }
        	},

        	async markAllAsRead() {
        		const authStore = useAuthStore3();
        			if (!authStore.user?.uid) return;

        			const isTeacher = authStore.role === 'teacher';

        			try{
        				await NotificationService.markAllAsRead(authStore.user.uid, isTeacher);
        			} catch(err: any){
        				 this.error = err.message || 'Error al marcar todas como leídas';
                		throw err;
        			}
        	},
        	/**
         * Eliminar notificación
         */
        async deleteNotification(notificationId: string) {
            const authStore = useAuthStore();
            const isTeacher = authStore.role === 'profesor';

            try {
                await NotificationsService.deleteNotification(notificationId, isTeacher);
            } catch (err: any) {
                this.error = err.message || 'Error al eliminar notificación';
                throw err;
            }
        },

        /**
         * Enviar notificacion(p/profesores) 
         * */
        async sendNotification(
        	targetId: string,
        	tipo: Notification['tipo'],
        	titulo: string,
        	mensaje: string,
        		options?: {
        			materialId?: string;
        			link?: string;
        		}
        	){

        	const authStore = useAuthStore3();


        	try{
        		if (authStore.role === 'teacher') {
        			NotificationService.notifyStudent(
        				targetId,
        				tipo,
        				titulo,
        				mensaje,
        				options?.materialId,
        				options?.link
        			);
        		}
        	}catch (err: any){
        		this.error = err.message || 'Error al enviar not';
        		 throw err;
        	}
        },
		
		shouldPlaySound(): boolean {
			const lastSound = localStorage.getItem('lasNotificationSound');

			if (!lastSound) return true;

			const timeSince = Date.now() - parseInt(lastSound);

			return timeSince > 5000;  // tan solo cada 5 segundos
		},

		playNotificationSound() {
			try{
				const audio = new Audio('/personalitynotification_sound', Date.now().toString());
				audio.volume = 0.3;

				audio.play().catch(( ) => {
					// Sino es reproducido el sonido, es debido a Politicas de Seguridad del Navegador
				});

				localStorage.setItem('lastNotificationSound', Date.now().toString());
			}catch (error){
				// Silenciar errorres de audio
			}
		},

		 /**
         * Limpiar estado
         */
        clearAll() {
            this.stopListening();
            this.notifications = [];
            this.unreadCount = 0;
            this.error = '';
        },

		}

	});