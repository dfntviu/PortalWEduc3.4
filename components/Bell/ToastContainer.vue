.<template>
	<div class="fixed top-4 right-4 z-[999] flex flex-col gap-3 max-w-md w-full pointer-events-none">
		<TransitionGroup name="Toast">
			<ToastItem 
				v-for="toast in toastStore.toats"
				:key="toast.id"
				:toast="toast"
				@close="toasStore.remove(toast.id)"
				class="pointer-events-auto"
			/>
		</TransitionGroup>
	</div>
</template>

<script>
	import { onMounted, onUnMounted } from 'vue';
	import { useNotificationsStoreBell } from '@/stores/notificationsStoreBll';
	import { NotificationServiceBll } from '@/services/NotificationServiceBll';
	import { ToastItem } from './ToastItem.vue';

	const toastStore = useNotificationsStoreBell();
	let unsuscribe: (() => void ) | null = null;

	onMounted(() => {
		unsuscribe = NotificationServiceBll.suscribe((toast) => {
		 	toastStore.add(toast);
		});
	});

	onUnMounted(() => {
		if(unsuscribe){
			unsuscribe();
		}
	});

</script>

<style scoped>
	.toast-enter-active{
		transition: all  0.3s ease-in;
	}

	..toast-leave-active{
			transition: all  0.2s ease-out;	
	}
</style>