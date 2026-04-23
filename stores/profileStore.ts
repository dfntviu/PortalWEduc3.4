  /**
 * @Store ProfileStore
 * @description Store unificado para gestión de perfiles de estudiantes y profesores
 * @features
 * - CRUD completo para ambos roles
 * - Manejo opcional de fotos de perfil
 * - Búsqueda y filtrado avanzado
 * - Estadísticas de perfiles
 * - Validación de datos
 * 
 * Usa: ProfileStudentService y ProfileTeacherService
 */
import  {defineStore}  from 'pinia';
import {ProfileStudentService} from '@/services/ProfileStudentService';
import {ProfileTeacherService} from '@/services/ProfileTeacherService';
import type { Profile } from '@/types/Profile.type.ts';

  interface ProfilePhotoOptions {
    uploadPhoto: boolean;
    photoFile?: File;
    photoURL?: string;
  }

  interface ProfileState {
    profile: Profile | null;
    profiles: Profile[];
    loading: boolean;
    error: string;
    searchResults: Profile[];
    stats: {
      students: {
        total: number;
        withPhoto: number;
        withoutPhoto: number;
        active: number;
      };
      teachers: {
        total: number;
        withPhoto: number;
        withoutPhoto: number;
        active: number;
        bySubject: Record<string, number>;
      };
    } | null;
    message: string; //**
  }

export const useProfileStore = defineStore('profile', {
  // ===========================
  //  STATE
  // ===========================
  state: (): ProfileState => ({
    profile: null,
    profiles: [],
    loading: false,
    error: '',
    searchResults: [],
    stats: null,
    message: '', //**
  }),

  // ===========================
  //  GETTERS
  // ===========================
  getters: {
    /**
     * Verifica si hay un perfil cargado
     */
    hasProfile: (state): boolean => {
      return state.profile !== null;
    },

    /**
     * Obtiene el rol del perfil actual
     */
    currentRole: (state): 'student' | 'teacher' | null => {
      return state.profile?.role || null;
    },

    /**
     * Verifica si el perfil actual tiene foto
     */
    hasProfilePhoto: (state): boolean => {
      return !!(state.profile?.photoURL);
    },

    /**
     * Nombre completo del usuario actual
     */
    fullName: (state): string => {
      if (!state.profile) return '';
      return `${state.profile.nombre} ${state.profile.apellidos}`;
    },

    /**
     * Perfiles de estudiantes
     */
    students: (state): Profile[] => {
      return state.profiles.filter(p => p.role === 'student');
    },

    /**
     * Perfiles de profesores
     */
    teachers: (state): Profile[] => {
      return state.profiles.filter(p => p.role === 'teacher');
    },

    /**
     * Perfiles activos
     */
    activeProfiles: (state): Profile[] => {
      return state.profiles.filter(p => p.activo !== false);
    },

    /**
     * Perfiles con foto
     */
    profilesWithPhoto: (state): Profile[] => {
      return state.profiles.filter(p => p.photoURL);
    },

    /**
     * Perfiles sin foto
     */
    profilesWithoutPhoto: (state): Profile[] => {
      return state.profiles.filter(p => !p.photoURL);
    },
  },

  // ===========================
  //  ACTIONS
  // ===========================
  actions: {
    // ==================
    // ESTUDIANTES
    // ==================

    /**
     * Guarda un perfil de estudiante
     * @param data - Datos del perfil
     * @param photoOptions - Opciones de foto (opcional)
     */
    async saveStudentProfile(data: Partial<Profile>, photoOptions?: ProfilePhotoOptions) {
      this.loading = true;
      this.error = '';

      try {
        await ProfileStudentService.saveStudentProfile(data, photoOptions);
        console.log('[ProfileStore] ✅ Perfil de estudiante guardado');
      } catch (err: any) {
        this.error = err.message || 'Error al guardar perfil de estudiante';
        console.error('[ProfileStore] ❌', this.error);
        throw err;
      } finally {
        this.loading = false;
      }
    },
    //*** Simetrico de Student for role1, Vista 3 del Rol ['Teacher']
    async registerTraditional(data:{nombre:string;apellido:string;correo:string;passwd:string,cuenta:string,areaTrab:string,role: 'student' | 'teacher';uid_teacher: string| null;}){
        this.loading = true;
        this.error = '';
          console.log('Ingrese a al f(n).........');
        try{  
          const user = await ProfileStudentService.createAccountEmailAndPassword(data.correo, data.passwd);

           if (!user?.uid) throw new Error('No se obtuvo UID del registro');

          const profileData = {
            // ...data  nombre indefinido
            uid_teacher: user.uid,
            name: data.nombre,
            lname: data.apellido,
            email: data.correo,
            password: data.passwd,
            numCuenta: data.cuenta,
            area: data.areaTrab,
            role: data.role,
          };  
            // C1 - Los valores de los atributos se reciben completos
              /*Recordando: El naming de los atribs deberan ser identicos a los atribs de la f(n) del layer1 */
              console.log('Nombre del Profesor >', profileData.name);
              console.log('Uid del Profesor >', profileData.uid_teacher);
              console.log('Are de t Profesor >', profileData.area);
              //ui o el obj.prop completo
          if (data.role === 'teacher') {
              console.log('[Store]_ profileData ANTES de Guardar: ',JSON.parse(JSON.stringify(profileData)));
             await ProfileTeacherService.saveTeacherProfile({...profileData},  profileData.uid_teacher);
          } else {
               await ProfileStudentService.saveStudentProfile(profileData, user.uid);
          }
        }catch(err: any){
          this.error = err.message || 'Error al registrar el usuario';
          throw err;
        } finally {
           this.loading = false;
        }
    },
      //** new ajustar **
   /**  async registerTraditional(data:{nomb:string,apellido:string,correo:string,passwd:string,cuenta:number,areaTr:string},uid_teacher:string) {
            this.error = '';
            this.message = '';
            this.loading = true;
            try {
                if (!data.email || !data.password || !data.name)
                    throw new Error('Completa todos los campos requeridos (nombre, correo y contraseña).');
                const creadetUser = ProfileStudentServ_ts_1.ProfileStudentService.creadetUserWithEmail(data.email, data.password);
                if (!creadetUser || !creadetUser.uid)
                    throw new Error('Error: no se obtuvo el identificador del registro');
                const userId = creadetUser.uid;
                await ProfileStudentServ_ts_1.ProfileStudentService.saveStudentProfile({
                    ...data,
                    uid_alumno: userId,
                });
                this.message = 'Registro completado y perfil guardado satisfactoriamente';
            }
            catch (err) {
                this.error = err.message || 'Error al registrar el usuario.';
            }
            finally {
                this.loading = false;
            }
        },

    /**
     * Obtiene un estudiante por UID
     * @param uid - ID del estudiante
     */
    async getStudentById(uid: string) {
      this.loading = true;
      this.error = '';

      try {
        const student = await ProfileStudentService.getStudentById(uid);
        if (student) {
          this.profile = student;
        }
        return student;
      } catch (err: any) {
        this.error = err.message || 'Error al obtener estudiante';
        console.error('[ProfileStore] ❌', this.error);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Actualiza un perfil de estudiante
     * @param uid - ID del estudiante
     * @param updates - Datos a actualizar
     * @param photoOptions - Opciones de foto (opcional)
     */
    async updateStudentProfile(
      uid: string,
      updates: Partial<Profile>,
      photoOptions?: ProfilePhotoOptions
    ) {
      this.loading = true;
      this.error = '';

      try {
        await ProfileStudentService.updateStudentProfile(uid, updates, photoOptions);
        
        // Actualizar perfil local si es el usuario actual
        if (this.profile?.uid === uid) {
          this.profile = { ...this.profile, ...updates };
        }

        console.log('[ProfileStore] ✅ Perfil de estudiante actualizado');
      } catch (err: any) {
        this.error = err.message || 'Error al actualizar estudiante';
        console.error('[ProfileStore] ❌', this.error);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Obtiene todos los estudiantes
     * @param limit - Límite de resultados
     */
    async getAllStudents(limit?: number) {
      this.loading = true;
      this.error = '';

      try {
        const students = await ProfileStudentService.getAllStudents(limit);
        this.profiles = students;
        return students;
      } catch (err: any) {
        this.error = err.message || 'Error al obtener estudiantes';
        console.error('[ProfileStore] ❌', this.error);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Busca estudiantes por nombre
     * @param searchTerm - Término de búsqueda
     */
    async searchStudents(searchTerm: string) {
      this.loading = true;
      this.error = '';

      try {
        const results = await ProfileStudentService.searchStudentsByName(searchTerm);
        this.searchResults = results;
        return results;
      } catch (err: any) {
        this.error = err.message || 'Error en búsqueda de estudiantes';
        console.error('[ProfileStore] ❌', this.error);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Elimina un estudiante
     * @param uid - ID del estudiante
     */
    async deleteStudent(uid: string) {
      this.loading = true;
      this.error = '';

      try {
        await ProfileStudentService.deleteStudent(uid);
        this.profiles = this.profiles.filter(p => p.uid !== uid);
        console.log('[ProfileStore] ✅ Estudiante eliminado');
      } catch (err: any) {
        this.error = err.message || 'Error al eliminar estudiante';
        console.error('[ProfileStore] ❌', this.error);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // ==================
    // PROFESORES
    // ==================

    /**
     * Guarda un perfil de profesor
     * @param data - Datos del perfil
     * @param photoOptions - Opciones de foto (opcional)
     */
    async saveTeacherProfile(data: Partial<Profile>, photoOptions?: ProfilePhotoOptions) {
      this.loading = true;
      this.error = '';

      try {
        await ProfileTeacherService.saveTeacherProfile(data, photoOptions);
        console.log('[ProfileStore] ✅ Perfil de profesor guardado');
      } catch (err: any) {
        this.error = err.message || 'Error al guardar perfil de profesor';
        console.error('[ProfileStore] ❌', this.error);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Obtiene un profesor por UID
     * @param uid - ID del profesor
     */
    async getTeacherById(uid: string) {
      this.loading = true;
      this.error = '';

      try {
        const teacher = await ProfileTeacherService.getTeacherById(uid);
        if (teacher) {
          this.profile = teacher;
        }
        return teacher;
      } catch (err: any) {
        this.error = err.message || 'Error al obtener profesor';
        console.error('[ProfileStore] ❌', this.error);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Actualiza un perfil de profesor
     * @param uid - ID del profesor
     * @param updates - Datos a actualizar
     * @param photoOptions - Opciones de foto (opcional)
     */
    async updateTeacherProfile(
      uid: string,
      updates: Partial<Profile>,
      photoOptions?: ProfilePhotoOptions
    ) {
      this.loading = true;
      this.error = '';

      try {
        await ProfileTeacherService.updateTeacherProfile(uid, updates, photoOptions);
        
        // Actualizar perfil local si es el usuario actual
        if (this.profile?.uid === uid) {
          this.profile = { ...this.profile, ...updates };
        }

        console.log('[ProfileStore] ✅ Perfil de profesor actualizado');
      } catch (err: any) {
        this.error = err.message || 'Error al actualizar profesor';
        console.error('[ProfileStore] ❌', this.error);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Obtiene todos los profesores
     * @param limit - Límite de resultados
     */
    async getAllTeachers(limit?: number) {
      this.loading = true;
      this.error = '';

      try {
        const teachers = await ProfileTeacherService.getAllTeachers(limit);
        this.profiles = teachers;
        return teachers;
      } catch (err: any) {
        this.error = err.message || 'Error al obtener profesores';
        console.error('[ProfileStore] ❌', this.error);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Busca profesores por nombre
     * @param searchTerm - Término de búsqueda
     */
    async searchTeachers(searchTerm: string) {
      this.loading = true;
      this.error = '';

      try {
        const results = await ProfileTeacherService.searchTeachersByName(searchTerm);
        this.searchResults = results;
        return results;
      } catch (err: any) {
        this.error = err.message || 'Error en búsqueda de profesores';
        console.error('[ProfileStore] ❌', this.error);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Busca profesores por materia
     * @param subject - Materia
     */
    async searchTeachersBySubject(subject: string) {
      this.loading = true;
      this.error = '';

      try {
        const results = await ProfileTeacherService.getTeachersBySubject(subject);
        this.searchResults = results;
        return results;
      } catch (err: any) {
        this.error = err.message || 'Error en búsqueda por materia';
        console.error('[ProfileStore] ❌', this.error);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Elimina un profesor
     * @param uid - ID del profesor
     */
    async deleteTeacher(uid: string) {
      this.loading = true;
      this.error = '';

      try {
        await ProfileTeacherService.deleteTeacher(uid);
        this.profiles = this.profiles.filter(p => p.uid !== uid);
        console.log('[ProfileStore] ✅ Profesor eliminado');
      } catch (err: any) {
        this.error = err.message || 'Error al eliminar profesor';
        console.error('[ProfileStore] ❌', this.error);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // ==================
    // ESTADÍSTICAS
    // ==================

    /**
     * Obtiene estadísticas completas
     */
    async loadStats() {
      this.loading = true;
      this.error = '';

      try {
        const [studentStats, teacherStats] = await Promise.all([
          ProfileStudentService.getStudentStats(),
          ProfileTeacherService.getTeacherStats(),
        ]);

        this.stats = {
          students: studentStats,
          teachers: teacherStats,
        };

        console.log('[ProfileStore] 📊 Estadísticas cargadas');
      } catch (err: any) {
        this.error = err.message || 'Error al cargar estadísticas';
        console.error('[ProfileStore] ❌', this.error);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // ==================
    // UTILIDADES
    // ==================

    /**
     * Establece el perfil actual
     * @param profile - Perfil a establecer
     */
    setCurrentProfile(profile: Profile) {
      this.profile = profile;
    },

    /**
     * Limpia los resultados de búsqueda
     */
    clearSearchResults() {
      this.searchResults = [];
    },

    /**
     * Reset del store
     */
    $reset() {
      this.profile = null;
      this.profiles = [];
      this.loading = false;
      this.error = '';
      this.searchResults = [];
      this.stats = null;
    },
  },
});