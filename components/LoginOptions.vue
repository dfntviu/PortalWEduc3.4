 <template>
 	<div class="space-y-4">
 		<div class="text-center mb-6">
 			<h2 class="text-2xl font-bold text-gray-900 dark:text-white">
 				Iniciar Sesión, como: {{roleLabel}}
 			</h2>
 			  <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
 			  	Elige él Método de Autentificación Preferido
 			  </p>
 		</div>
 			<!-- Botones de Redes Sociales -->
 		<div class="space-y-4">
 			<!-- Google -->
 			<button class="w-full flex" @click="controladoraGoogleLogin" :disabled="loading" class="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-dark-800 border-2 border-gray-300 dark:border-dark-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700 transition-all disabled:opacity-50">
 				 <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/*.svg" alt="Google" class="w-5 h-5">
 				 <span>Continuar con Google</span>
 			</button>

 			<!-- Facebook -->
 		</div>
 		<!-- Email Normal -->

 		<!-- Divider -->
        <div class="relative">
            <div class="absolute inset-0 items-center">
                <div class="w-full border-t border-gray-300 dark:border-dark-600"></div>
            </div>
            <div class="relative flex">
                <span class="px-2">Continua con Email</span>
            </div>
        </div>

 		<!-- Link de Registro -->
        <div class="text-center text-sm">
            <span class="text-gray-600">
                <button @click="$emit('swith-to-register')">Registrate Aquí</button>
            </span>
        </div>
 	</div>
 </template>

<script setup lang="ts">
    import {ref} from 'vue';
    import {useRouter} from 'vue-router';
    import {usePersonalityStore} from '@/stores/personalityStore.ts';
    import type {UserRole} from '@/services/PersonalityServiceRoles';

    interface Props {
    	role: UserRole;
    }

    const props = defineProps<Props>();
    const emit = defineEmits<{
    	'swith-to-register' : [];
    	'login-success': [];
    }>();

    const router = useRouter();
    const personalityStore = usePersonalityStore();

    const email = ref('')
    const password = ref('');
    const loading = ref(false);

    const roleLabel = props.role === 'alumno' ? 'Estudiante': 'Profesor';

    const controladoraGoogleLogin = async ()=>{
    	loading.value = true;

    	try{
    		const success = await personalityStore.loginWithGoogle(props.role);

    		if (success) {
    			emit('login-success');
    			redirectAfterLogin();
    		} 
    	}finally{
    		loading.value= false;
    	}

    }
   
    const controladoraFacebookLogin = async()=> {
       loading.value = true;
       
       try{
          const  success = await personalityStore.loginWithFacebook(props.role);

          if (success) {
             emit('login-success');
             redirectAfterLogin();
          }
        }finally{
            loading.value = false;
        }
    }

    const controladoraEmailLogin =async()=>{
            loading.value = true;
       try{
            const success = await personalityStore.loginWithEmail(props.role);
          if (success) {
             emit('login-success');
             redirectAfterLogin();
          }
        }finally{
            loading.value = false;
        }
    }

    const redirectAfterLogin = async ()=>{
    	const route = props.role === 'alumno';
    	  ? '/bienvenida-students'
    	  : '/vw-bienvenida-teachers';

    	  router.push(route);
    };
</script>   