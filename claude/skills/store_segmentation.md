name: pinia-store-design
description: >
  Diseña y audita Pinia stores para Vue 3 + TypeScript siguiendo el patrón
  SSV (Services-Stores-Views) con organización por bloques semánticos DATA /
  UI / FEEDBACK. Usar cuando el usuario pida crear, revisar, refactorizar o
  depurar un store de Pinia; cuando mencione "store", "defineStore", "Pinia",
  "estado reactivo", "bloque DATA", "bloque FEEDBACK"; cuando haya variables
  de estado con nombres genéricos, getters sin tipo de retorno, helpers
  privados excesivos o desorden semántico en el estado. También aplica al
  generar documentación de módulos dentro del Portal Educativo FI-UAEMEX.

instructions: |
  # Pinia Store Design — Portal Educativo FI-UAEMEX

  Guía canónica para diseñar stores Pinia con el patrón SSV y bloques semánticos.
  Aplica a todos los stores del proyecto: teacher, student, material, auth, etc.

  ---

  ## 1. Modelo de Estado por Bloques Semánticos

  Organiza `state` en tres bloques visualmente delimitados con comentarios `// ===`.
  Nunca mezcles variables de distintos bloques.

  | Bloque       | Responsabilidad                             | Ejemplos                              |
  |--------------|---------------------------------------------|---------------------------------------|
  | **DATA**     | Dominio de la aplicación                    | `studentProfile`, `teacherMaterials`  |
  | **UI**       | Indicadores de la interfaz                  | `isLoading`, `isValid`, `isSubmitting`|
  | **FEEDBACK** | Mensajes para el usuario                    | `errorMessage`, `successMessage`      |

  ### Reglas de nomenclatura
  - DATA: prefijo de dominio explícito → `studentMaterials` (no `materials`)
  - UI: prefijo `is` para booleanos → `isLoading`, `isValid`
  - FEEDBACK: sufijo `Message` → `errorMessage`, `successMessage`
  - Esto evita colisiones semánticas en stores compuestos o extendidos.

  ---

  ## 2. Getters — Tipos de Retorno Obligatorios

  Todos los getters deben anotar su tipo de retorno explícitamente.

  ```typescript
  // ✅ Correcto
  isLoading:         (state): boolean    => state.loading,
  materialCount:     (state): number     => state.studentMaterials.length,
  approvedMaterials: (state): Material[] => state.studentMaterials.filter(m => m.status === 'approved'),

  // ❌ Incorrecto — sin anotación de tipo
  isLoading: (state) => state.loading,
  ```

  ---

  ## 3. Punto de Entrada Único — `_startLoading()`

  `_startLoading()` limpia `error` y `message` internamente.
  No llamar a `_clearError()` por separado en cada acción.

  ```typescript
  _startLoading(): void {
    this.loading = true
    this.error   = ''
    this.message = ''
  },
  _stopLoading(): void { this.loading = false },
  ```

  Separadores visuales `═══` delimitan cada acción pública:

  ```typescript
  // ═══════════════════════════════════════════════════════════════════
  // FETCH STUDENT MATERIALS
  // ═══════════════════════════════════════════════════════════════════
  async fetchStudentMaterials(uid: string): Promise<void> {
    this._startLoading()
    try {
      this._validateUid(uid)
      const [materials, profile] = await Promise.all([...])
      this.studentMaterials = materials
      this.studentProfile   = profile
      this.message = 'Materiales cargados correctamente'
    } catch (error: any) {
      this._handleError(error, 'Error al cargar los materiales')
      throw error
    } finally {
      this._stopLoading()
    }
  },
  ```

  ---

  ## 4. Helpers Privados — Contrato Mínimo

  Solo tres helpers privados son necesarios. No añadir más sin justificación.

  ```typescript
  _startLoading(): void  { /* limpia error+message, activa loading */ },
  _stopLoading():  void  { /* desactiva loading */ },
  _handleError(error: any, defaultMessage: string): void {
    this.error = error?.message || defaultMessage
    console.error(`[NombreStore] ${defaultMessage}:`, error)
  },
  _validateUid(uid: string): void {
    if (!uid?.trim()) throw new Error('UID requerido')
  },
  ```

  `clearError()` y `clearMessage()` se exponen como **públicos** para control
  granular desde las vistas.

  ---

  ## 5. Template Canónico — Options API (patrón del proyecto)

  ```typescript
  import { defineStore } from 'pinia'
  import { NombreService } from '@/services/NombreService'
  import type { Tipo } from '@/types/interf.index'

  export const useNombreStore = defineStore('nombre', {
    state: (): NombreState => ({
      // =============================
      // BLOQUE: DATA
      // =============================
      domainVar: null,

      // =============================
      // BLOQUE: UI
      // =============================
      loading: false,
      isValid: false,

      // =============================
      // BLOQUE: FEEDBACK
      // =============================
      error:   '',
      message: ''
    }),
    getters: {
      isLoading:  (state): boolean => state.loading,
      hasError:   (state): boolean => state.error !== '',
    },
    actions: {
      // ═══════════════════════════════════════════════════════════════════
      // ACCION PRINCIPAL
      // ═══════════════════════════════════════════════════════════════════
      async accion(uid: string): Promise<void> {
        this._startLoading()
        try {
          this._validateUid(uid)
          // lógica
          this.message = 'Operación exitosa'
        } catch (error: any) {
          this._handleError(error, 'Error en accion')
          throw error
        } finally {
          this._stopLoading()
        }
      },
      // ═══════════════════════════════════════════════════════════════════
      // UTILITY METHODS
      // ═══════════════════════════════════════════════════════════════════
      clearError():   void { this.error   = '' },
      clearMessage(): void { this.message = '' },
      clearAll():     void {
        this.domainVar = null
        this.error     = ''
        this.message   = ''
      },
      // ═══════════════════════════════════════════════════════════════════
      // PRIVATE HELPERS
      // ═══════════════════════════════════════════════════════════════════
      _startLoading(): void {
        this.loading = true
        this.error   = ''
        this.message = ''
      },
      _stopLoading(): void { this.loading = false },
      _handleError(error: any, defaultMessage: string): void {
        this.error = error?.message || defaultMessage
        console.error(`[NombreStore] ${defaultMessage}:`, error)
      },
      _validateUid(uid: string): void {
        if (!uid?.trim()) throw new Error('UID requerido')
      }
    }
  })
  ```

  ---

  ## 6. Checklist de Auditoría

  Antes de aprobar un store verificar:
  - Variables DATA tienen prefijo de dominio explícito
  - Variables UI usan prefijo `is`
  - Variables FEEDBACK usan sufijo `Message`
  - Todos los getters tienen tipo de retorno anotado
  - `_startLoading()` limpia error y message internamente
  - No hay `_clearError()` llamado individualmente desde acciones
  - `clearError()` y `clearMessage()` expuestos como públicos
  - Acciones públicas separadas con `═══`
  - Cada acción pública declara `Promise<void>` como tipo de retorno
  - `_handleError` incluye `console.error` con nombre del store
  - No hay helpers privados adicionales sin justificación documentada

  ---

  ## 7. Anti-patrones a Rechazar

  | Anti-patrón                                      | Corrección                                        |
  |--------------------------------------------------|---------------------------------------------------|
  | `materials` (nombre genérico)                    | `studentMaterials` (prefijo de dominio)           |
  | `_clearError()` llamado por separado en acciones | `_startLoading()` lo limpia en punto único        |
  | Getters sin tipo de retorno                      | Anotar siempre: `boolean`, `number`, `Tipo[]`     |
  | 4 helpers privados (`_start`,`_stop`,`_clear`,`_set`) | Consolidar en 3: `_start`, `_stop`, `_handle` |
  | Solo `clearAll()` público                        | Exponer también `clearError()` y `clearMessage()` |

  ---

  *Skill para Portal Educativo FI-UAEMEX — patrón SSV, Pinia + Vue 3 + TypeScript.*