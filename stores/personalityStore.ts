/**
 * personalityStore.ts 
 * Pinia Store para la gestión de personalización de temas
 * Arquitectura: Store Layer **/
 import { defineStore } from 'pinia';
 import { ref, computed } from 'vue';
 import  {PersonalityServiceRoles2} from '@/services/PersonalityServiceRoles2';
  import type { ThemePreferences, RoleThemeOptions, ColorPalette, BackgroundImage, UserRole, PaletteType ,ProfilePhotoStyle, PersonalityServiceResponse, AppliedTheme, CSSVariables } from '@/interfaces/Personality.types.ts'

  const usePersonalityStore = defineStore('personality', ()=> {
  	  const currentTheme = ref<AppliedTheme | null>(null);
  	  const themePreferences = ref<ThemePreferences | null >(null);
  	  const isLoading = ref<string | null>(null);
  	  const error = ref<string | null<(null);
      const availablePalettes = ref<ColorPalette[]>([]);
      const availableBackgrounds = ref<BackgroundImage[]>([]);
      const isPreviewMode = ref(false);
      const previewTheme = ref(AppliedTheme | null)(null);

      // =============== GETTERS ===============
        const activeTheme = computed(()=>{
           return isPreviewMode.value ? previewTheme.value : currentTheme.value;
        });

        const hasCustomTheme = computed(()=>{
           return themePreference.value !== null;
        });

        const currentPalette = computed(()=> {
              return activeTheme.value?.palette || null;
        });

        const currentBackgroundImage = computed(()=> {
             return activeTheme.value?.backgroundImage || null;
        });

        const profilePhotoStyle = computed(()=> {
             return activeTheme.value?.profilePhotoStyle || 'circle';
        });

        /**
         * Gen las CSS variable basadas en el tema activo
         * */
        const cssVariables = computed<CSSVariables| null>(()=>{
            if (!activeTheme.value) return null;

            const palette = activeTheme.value.palette;
            const bgImage = activeTheme.value.backgroundImage;

                return {
                  '--primary-color': palette.colors.primary,
                  '--secondary-color': palette.colors.primary,
                  '--accent-color':  palette.colors.accent,
                  '--bg-color': palette.colors.workspaceBackground,
                  '--card-border-color': activeTheme.value.customColors.workspaceBackground,
                  '--text-primary': palette.colors.textPrimary,
                  '--text-secondary': palette.colors.textSecondary,
                  '--bg-image-url':  bgImage ? `url(${bgImage.url})` : 'none',
                  '--profile-style':  getProfileStyleCSS(activeTheme.value.profilePhotoStyle)
                };
        });

        // ========== ACTIONS ==========

        /**
         * Inicializa el tema del usuario 
         * */

        async function initializeTheme(userId: string, role: UserRole): Promise<void> {
            isLoading.value = true;
            error.value = null;

            try{
                const options = personalityService.getRoleThemeOptions(role);
                 availablePalettes.value = options.availablePalettes;
                 availablePalettes.value = options.availableBackgrounds;

                const response = personalityService.getUserThemePreferences(userId)

                if (response.success && response.data) {
                     // Usuario tiene temea personalizado
                     themePreferences.value = response.data;
                      currentTheme.value =  personalityService.buildAppliedTheme(response.data,
                                            role);
                } else {

                    // Aplicar el Tema por defecto
                    const defaultTheme = options.defaultTheme as Partial <ThemePreferences>;
                        const defaultsPrefs: ThemePreferences = {
                          userId,
                             palette: defaultTheme.backgroundColor!,
                             backgroundColor: defaultTheme.backgroundColor!,
                             backgroundImageId: null,
                             backgroundImageURL: null,
                             profilePhotoStyle:  defaultTheme.profilePhotoStyle!,
                              createdAt: new Date(),
                              updtaedAt: new Date(),
                        };

                        themePreferences.value = defaultsPrefs;
                         currentTheme.value = personalityService.buildAppliedTheme(
                                defaultsPrefs,
                                role
                            );  

                }
                        // File in the Interface for personality
                    applyCSSVariables();

            }catch(err){
                error.value = 'Error al inicializar el Tema';
                console.error('Error  initializing theme: ', err);
            } finally {
                isLoading.value = false;
            }
        }

        /**
         * Actualiza la paleta de Colores
         * */
        async function updatePalette(paletteId: PaletteType, userId: string, role: UserRole): Promise<boolean> {
            // Anunciar el comienzo
              if(!themePreferences.value) return false;

              isLoading.value = true;

            try{
                const updatePrefs = {
                    ...themePreferences.value,
                     palette: paletteId
                };

                 const response = await personalityService.saveUserThemePreferences(updatePrefs)

                    if (response.success) {
                        themePreferences.value = updatePrefs;
                          currentTheme.value = personalityService.buildAppliedTheme(
                                updatePrefs,
                                role
                            );
                          applyCSSVariables();
                            return true;
                    }

                    error.value = response.error || 'Error al actualizar la paleta';
                     return false;

            }catch(err){
                error.value = 'Error al Actualizar la Paleta'
                console.error('Error updating palette:',err);
                 return false;
            } finally {
                isLoading.value = false;
            }

            // return true;
        }
        /**
         * Actualiza el fondo de Pantalla del Perfil
         * */
        async function updateBackgroundImage(imageId:string, userId:string, role: UserRole):
          Promise<boolean> {

            if (!themePreferences.value) return false;

            isLoading.value = true;

            try{
                const backgroundImage = imageId;
                  ? personalityService.getBackgroundImageById(imageId, role)
                  : null;

                const updatePrefs = {
                    ...themePreferences.value,
                     backgroundImageId: imageId,
                     backgroundImageURL: backgroundImage?.url || null
                };

                 const response = personalityService.saveUserThemePreferences(updatePrefs);

                 if (response.success) {
                      themePreferences.value = updatePrefs;
                      currentTheme.value = await personalityService.buildAppliedTheme(
                                updatePrefs,
                                role
                            );
                        applyCSSVariables();
                         return true;
                 }
                    error.value = response.error  || 'Error al actualizar la Imagen de Fondo';
                     return false;

            }catch(error){
                error.value = response.error || 'Error al actualizar la Imagen de Fondo';
                  console.log('Error updating background image: ',err);
            }finally {
               isLoading.value = false;
            }
        }
        
        /**
         * Actualiza el estilo de la foto de Perfil
         * */
        async function updateProfilePhotoStyle(style: string, role: UserRole): Promise<boolean> {
            if (!themePreferences.value) return false;

            isLoading.value = true;

            try{
                const updatePrefs = {
                        ...themePreferences.value,
                        profilePhotoStyle: style
                    };

                    const response = personalityService.saveUserThemePreferences(updatePrefs);

                if (response.success) {
                    themePreferences.value = updatePrefs;
                     currentTheme.value = personalityService.buildAppliedTheme(updatePrefs,role);
                      applyCSSVariables(); 
                        return true;
                }

                    error.value = response.error  || 'Error al actualizar el estilo de Foto';
                        return false;

            }catch(error){
                error.value = response.error || 'Error al actualizar la Imagen de Fondo';
                  console.log('Error updating background image: ',err);
            }finally{
                isLoading = false;
            }
        }
        
        /**
         * Actualiza los colores personalizados
         * */
        async function updateCustomColors(
                       colors: {colors cardBorder?: string; workspaceBackground?: string},
                       userId: string,
                       role: UserRole ): Promise <boolean>{

            if (!themePreferences.value) return false;
            
            isLoading.value = true;

            try{
                const updatePrefs = {
                    ...themePreferences.value,
                  backgroundColor: colors.workspaceBackground || themePreferences.value.backgroundColor,
                  borderColor: colors.cardBorder || themePreferences.value.borderColor,
                  customColors: colors
                };

                const response = personalityService.saveUserThemePreferences(updatePrefs);

                if (response.success) {
                    const updatePrefs.value = updatePrefs;
                     currentTheme.value = personalityService.buildAppliedTheme(updatePrefs,role);
                      applyCSSVariables();
                        return true;
                }

                error.value = response.error  || 'Error al actualizar las tonalidades de colores';
                         return false;
            }catch(){
                error.value = 'Error al actualizar los colores'
                console.error('Error updating custom colors:', err);
                  return false;
            } finally {
                 isLoading = false;
            }
        }
        
        /**
         * Restablecer el Tema por Defecto
         * */
        async function restedTheme(userId: string, role: UserRole): Promise <boolean>{
             isLoading.value = true;
                
                try{
                    
                    const response = await personalityService.resetToDefaultTheme(userId, role);

                    if (response.success) {
                        await initializeTheme(userId,role)  
                         return true;
                    }

                    error.value = response.error || 'Error al resetear el tema';
                     return false;
                }catch(err){
                    error.value =  'Error al resetear el tema';
                    console.log('Error resetting theme:',err );
                      return false;
                } finally {
                    isLoading.value = false;
                }
        }

        function $reset() {
            currentTheme.value = null;
            themePreferences.value = null;
            isLoading.value = null;
            error.value = null;
            availablePalettes.value = [];
            availableBackgrounds.value = false;
            previewTheme.value = null;
        }

        return {
            $reset,
        }
   });