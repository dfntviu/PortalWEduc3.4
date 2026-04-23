<template>
	<div class="bg-white rounded-lg shadow-lg border-l-4 p-4 flex items-start gap-3 animate-slide-up"
	  class="[borderColorClass,'min-w-[320px]' 'max-w-md']">
	  	<div class="flex-shrink-0">
	  		<span class="text-2xl">{{icon}}</span>
	  	</div>

	  	<div class="class flex-1 min-w-0">
	  		<h4 class="font-semibold text-gray-900 text-sm mb-1"></h4>
	  		<p class="text-sm text-gray-600">
	  			{{toast.title}}
	  		</p>
	  		<button class="mt-2 text-sm font-medium hover:underline"
	  			v-if="toast.action"
	  			:class="actionColorClass" 
	  			@click="controllAction"
	  		>
	  				{{toast.action.label}}
	  		</button>
	  	</div>
	  	<!-- Boton de Cerrado -->
	  	<button class="flex-shrink-0 text-gray-400 hover:text-gray-600 transitions-colors">
	  		<span class="text-lg">
	  			✕
	  		</span>
	  	</button>

	  	<!-- Barra de Progreso -->
	  	<div class="absolute bottom-0 left-0 h-1 bg-current opacity-300 rounded-bl"
	  		:class="progressColorClass"
	  		:style="{
	  			width: '100%',
	  			animation = `shrink ${toast.duration}ms linear`
	  		}"
	  	  >
	  	</div>
	</div>
</template>
<script setup lang="ts">
	import {computed} from 'vue';
	import  type {Toast } from '@/services/NotificationServiceBll';

	interface Props {
		toast: Toast;
	}

	const props = defineProps<Props>();
	const emit = defineEmits<{
		close: [];
	}>();

	const icon = computed(() => {
		const icons = {
			success: '✅',
			error: '❌',
			warning: '⚠️',
			info: 'ℹ️',
		};
		 return icons[props.toast.type];
	});

	const borderColorClass = computed(() =>{
		const colors = {
			success:  'border-green-500',
			error:  'boder-red-500',
			warning:  'border-yellow-500',
			info:  'border-blue-500',
		};

		return colors[props.toast.type];
	});

	const actionColorClass = computed(() => {
		const colors = {
			success:  'text-green-600 hover:text-green-700',
			error:  'text-red-600 hover: text-red-700',
			warning:  'text-yellow-600 hover:text-yellow-700',
			info:  'text-blue-600 hover:text-blue-700',
		}

		return colors[props.toast.type];
	});

	const progressColorClass = computed(() => {
		const colors = {
			success:  'text-green-500',
			error:  'text-red-500',
			warning:  'text-yellow-500',
			info:  'text-blue-500',
		};
		return colors[props.toast.type];
	});

	const controllAction = () =>{
		 if(props.toast.action) {
		 	props.toast.action.onClick();
		 	 emit('close');
		 }
	};

</script>

<style>
	@keyframes shrink {
		from {
    width: 100%;
  }
  to {
    width: 0%;
  }
	}
</style>