<template>
    <header>
        <title>Profesor - Registrar Estudiante</title>
    </header>
   <div class="vista-estudiantes">
       <nav class="navegacion-paneles">
          <button class="btn-nav"> Registrar Estudiante </button>
          <button class="btn-nav"> Editar el Perfil </button>
       </nav>

     <!-- =======================================
              CONTENEDOR DE PANELES
          ======================================= -->

          <Transition name="slide-fade" mode="out-in">
             <div v-if="currentPanel === 'register'" key="register" class="panel-activo">
                <RegisterStudentView/>
             </div>
             <div v-else-if="currentPanel === 'edit'" key="edit" class="panel-activo">
                <ProfileStudentView/>
             </div>
        </Transition>



  <!-- =====================================
         MODAL DE CAMBIO DE CONTRASENIA
       ===================================== -->
     <ChangePasswordModal
       :is-open="isPasswordModalOpen"
       @close="closePasswordModal"
       @success="openPasswordChangeSuccess"
     />
   </div>
</template>

<script setup lang="ts">
   /**
    * FLUJO DE DESAROLLO
    * 1. El Script Base (este -  vwRegisterStudent)
    * 2.  RegisterStudentView → Componente de Registro
    * 3.  ProfileStudentView → Componente de Edicion
    * 4. ChangePasswordModal  → Comp. Modal de camb. de Passwd*/
   import { ref, onMounted } from 'vue';
   import  RegisterStudentView from '@/components/RegisterStudentView.vue';
   import  ProfileStudentView  from '@/components/ProfileStudentView.vue';
   import  ChangePasswordModal from  '@/components/ChangePasswordModal.vue';
   import  { useStudentProfileStore } from '@/stores/useStudentProfileStore.ts';

   // ══════════════════════════════════════════
   //  ESTADO LOCAL
   // ══════════════════════════════════════════
   
   /**
    * Panel actual mostrado ('register'| 'edit') 
    * */
   const currentPanel = ref<'register'| 'edit'>('register');

   /**
    * Estado del modal de cambio de contrasenia*/
   const isPasswordModalOpen = ref(false);
   
   // ════════════════════════════════════════
   //    STORE
   // ════════════════════════════════════════
   const store_profile = useStudentProfileStore();

   // ═════════════════════════════════════
   //     LYFECICLE HOOKS
   // ═════════════════════════════════════

   onMounted(async () => {
    // Intetar cargar de perfil desde localStorage al montar
     const loaded =  await store_profile.loadFromLocalStorage(); 

     if(loaded){
        console.log('[vwStudentRegister] Perfil cargado desde el localStorage');
     } else {
        console.log('[vwStudentRegister] No hay perfil en el localStorage, mostrando registro..');
     }
   });


   // ═══════════════════════════════════════
   //        MTDOS DE NAVEGACIÓN
   // ═══════════════════════════════════════

   /**
    * Cambiar el panel actual
    * */
    function changePanel(panel: 'registrar' | 'edit'): void {
        store_profile.clearMessages();

        currentPanel.value = panel;

        console.log(`[vwStudentRegister] El panel fue cambiado a: ${panel} `);
   }

   // ═══════════════════════════════════════
   //        MTDOS DEL  MODAL
   // ═══════════════════════════════════════
   /**
    * Abre el modal de cambio de contrasenia
    * */
   function openPasswordModal(): void {
      isPasswordModalOpen.value = true;
   }
   /**
    * Cierra el modal de cambio de contrasenia
    * */
   function closePasswordModal():void {
      isPasswordModalOpen.value = false;
   }
   /**
    * Maneja el exito de cambio de contrasenia
    * */
   function openPasswordChangeSuccess(): void {
       console.log('[vwStudentRegister] La contraseña fue cambiada, redirigiendo...');
       // Limpiar el estado
       store_profile.resetState();
        // Cambiar a panel de Registro
       currentPanel.value = 'register';
         // Cerrar el modal
       closePasswordModal();
   }

</script>

<style scoped>
    .vista-estudiantes {
        min-height:100vh;
        background:linear-gradient();
        padding:2rem 1rem;
    }

    .navegacion-paneles {
     display:flex;
     justify-content:center;
     gap: 1rem;
     margin-bottom:2rem;
     flex-wrap:wrap;
    }
    /** no se mueve el caracter invisible por mas que quite espacion en las tabulaciones o rescriba la clase 2 **/
    .vista-estudiantes {
        padding:2rem 1rem;
    }

    .btn-nav {
        padding: 0.75rem 1.5rem;
        font-size:1rem;
        border:2px solid rgba(255,255,255,0.3);
        border-radius:50px;
        background-color:rgba(255, 255, 255, 0.1);
        color:white;
        cursor:pointer;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
    }

    .btn-nav:hover {
        background-color: rgba(255,255,255,0.2);
        color:#667ea;
        border-color:white;
        box-shadow: 0 4px rgba(0,0,0,0.3);
    }

    .btn-nav.activo {
        background-color:white;
        color:#667eea;
        border-color:white;
        box-shadow:0 4px rgba(0,0,0,0.3);
    } 

    .btn-nav.activo:hover {
        transform:translateY(-2px);
    }

    .contenedor-paneles {
        max-width:800px;
        margin: 0 auto;
        position:relative;
    }

    .panel {
        width: 100%;
    }

    /*CONTENEDOR ENTRE PANELES*/
    .contenedor-paneles {
        max-width:800px;
        margin:0 auto;
        position:relative;
    }

    .panel {
        width:100%;
    }

    /*==================== Animaciones en transicion ====================*/
    .slide-fade-enter-active,
    .slide-leave-active {
        transition: all 0.4s cubic-bazier(0.4,0,0.2,1);
    }

    .slide-enter-from {
        opacity:0;
        transform:translateY(30px);
    }

    .slide-leave-to {
        opacity:0;
        transform:-30px;
    }

     /* Disenio Responsivo */
     @media(max-width:768px) {
        .vista-estudiantes{
            padding: 1rem 0.5rem;
        }
        .navegacion {
            gap: 0.5rem;
        }
        .btn-nav {
            padding:0.6rem 1rem;
            font-size:0.9rem;
        }
     }

     @media(max-width:480px) {
        .navegacion-paneles {
            flex-direction:column;
            align-items:strech;
        }
        .btn-nav{
            width:100%;
        }
     }

     /*Aplicar glaformismo en los botones*/
     .btn-nav {
        -web-kit-backdrop-filter:blur(10px);
        backdrop-filter:blur(10px);
     }

     @keyframes fadeInUp {
        from {
         opacity:1;
         transform:translateY(30px);
        }

        to {
            opacity:1;
            transform: translateY(0);
        }
     }
      /*anularon espacios por eso 5 lineas menos a StdB2*/
     .vista-estudiantes{
        animation: fadeInUp 0.6s ease-in-out;
     }
</style>