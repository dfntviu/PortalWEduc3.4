<template>
    <div class="app" :class="{'dark-mode': isDarkMode}">
      <div class="institucional-header">
        <img src="./assets/logo.fi-uaemex" id="logo-univ" alt="">
        <span class="institucional-name">
            Facultad de Ingenería - Universidad Autonóma del Estado de México
        </span>
      </div>

      <LayoutNavBar v-if="showNavBar" />

      <!-- ========================== -->
      <!--      CONTENIDO PRINCIPAL   -->
      <!-- ========================== -->
      <main class="main-content">
         <RouterView/>
      </main>
        
      <!-- ========================== -->
      <!--      PIE DE PAGINA       -->
      <!-- ========================== -->
       <footer   class="app-footer">
           <p>&copy; {{currentYear}} Portal Web Educativo FI-UAEMEX</p>
       </footer>
    </div>
</template>
<script setup lang="ts">  // Code_new: 2025-Nov-02
  import { computed, onMounted } from 'vue';
  import { useRoute } from 'vue-router'; //*
  // import { useAuthStore3 } from '@/stores/authStore3.ts'; 
  import LayoutNavBar from '@/components/LayoutNavBar.vue';
  
  const route = useRoute();
  const showNavBar = computed(() => route.meta.requiresAuth === true);
  // ===============
  //    COMPOSABLES
  // ===============
  // const authStore = useAuthStore3();

  // =======================
  //    COMPUTED PROPERTIES
  // =======================
   // const isAuthenticated = computed(()=> authStore.isAuthenticated);
    
    /**
     * Obtiene el Rol del Usuario
     * */
     // const userRole = computed(()=>authStore.role);

     /**
      * Mapea el Rol del store al formato navbar
      * 'alumno' → 'student'
      * 'professor' → 'teacher'
      *  */
    /*const  navBarRole = computed(()=> {
       if (userRole.value === 'alumno') return 'student';
        if( userRole.value === 'alumno') return 'teacher';
          return 'student';  // fallback
    });*/

    /**
     * Estado en Dark Mode(A posteriori, para futuras integraciones) 
     * */
    const isDarkMode = computed(()=> false);  // O bien, preferenias de la comunidad estudiantil.

     /**
      * Año actual para el footer
      * */
     const currentYear = computed(()=> new Date().getFullYear());      

   // =====================
   //     CICLO DE VIDA  
   // =====================
    onMounted(async()=>{
      isDarkMode;
        /*if (authStore.isLoading) {
            await authStore.checkAuthState();
        }*/
    });

    /** 24/01/2026
     No seguire depurando el proyecto hasta tomar la desicion informada y constatar con un 
    experto. No es posible correr el riesgo por medio de switch controlado, o cualq.
    otra tecnica q no se tenga la exp. Pues tengo la intuicion de que es posible salvarse
    corrigiendo con precision tecnica en tailwind.config.js y tsconfig.json
     Cambiar cualquier parametro sin conocer sus repercuciones podria afectarlo mas
     HASTA  garantizar su veracidad técnica. **/
 </script>

 <style scoped>
  #app {
     min-height: 100vh;
     display: flex;
     flex-direction: column;
     background-color: #f7fafc;
     transition: background-color 0.3s ease;
  }

  #app.dark-mode {
     background-color: #1a202c;
     color: #e2e8f0;
  }

  /*==========================
      ENCABEZADO INSTITUCIONAL
    ==========================*/
  .institucional-header{
     display: flex;
     align-items: center;
     gap: 1rem;
     background-color: #006400; /*Verde Institucional*/  
     color: #ffffff;
     padding: 0.75rem 2rem;
     box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  #logo-univ{
    height: 60px;
    width: auto;
  }

  .institucional-name{
    font-size: 0.95rem;
    font-weight: 600;
    letter-spacing: 0.5px;
  }
      /*** ==========================
            CONTENIDO PRINCIPAL   
           ========================== ***/
  .main-content{
    flex: 1;
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem;
  }

  @media (max-width: 768px){
     .main-content{
        padding: 1rem;
     }
  }

  /*================
        FOOTER
    ================*/
  
  .app-footer{
    background: white;
    border-top: 1px solid #e2e8f0;
    padding: 1.5rem 2rem;
    text-align: center;
    color: #718096;
    font-size: 0.875rem;
  }

  #app.dark-mode .app-footer{
    background: #2d3748;
    border-top-color: #4a5568;
    color: #cbd5e0;
  }
   
    /*======================
        HELPERS RESPONSIVOS
      ======================*/
    .d-none{
      display: none !important;
    }

    .d-lg-block {
      display: none  !important;  
    }

    @media (min-width: 992px) {
      .d-lg-block {
        display: flex !important
      }
    }
</style>