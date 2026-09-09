<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authService } from '../services/auth.service'
import API_URL from '../config/api'

const route = useRoute()
const router = useRouter()

const modoVista = ref(route.name === 'Login' ? 'login' : 'registro')

// --- ESTADO DEL FORMULARIO DE REGISTRO ---
const formularioRegistro = ref({
  ci: '',
  nombreCompleto: '',
  departamento: '',
  correo: '',
  representaEmpresa: 'no',
  nit: '',
  celular: '',
  formularioARegistrar: [] // Cambiado a un arreglo para permitir múltiples selecciones
})

const cargandoSegip = ref(false)
const cargandoRegistro = ref(false)
const cargandoLogin = ref(false)
const cargandoOtp = ref(false)
const cargandoReenvio = ref(false)
const errorRegistro = ref('')
const errorLogin = ref('')
const errorOtp = ref('')
const mensajeReenvio = ref('')

const formularioLogin = ref({
  correo: '',
  password: ''
})

// Estado para controlar la visibilidad de la contraseña en el login
const mostrarPassword = ref(false)

const departamentosBolivia = [
  { codigo: 'LP', nombre: 'La Paz' },
  { codigo: 'SC', nombre: 'Santa Cruz' },
  { codigo: 'CB', nombre: 'Cochabamba' },
  { codigo: 'OR', nombre: 'Oruro' },
  { codigo: 'PT', nombre: 'Potosí' },
  { codigo: 'CH', nombre: 'Chuquisaca' },
  { codigo: 'TJ', nombre: 'Tarija' },
  { codigo: 'BE', nombre: 'Beni' },
  { codigo: 'PD', nombre: 'Pando' }
]

const tramitesOficiales = [
  'Registro de Profesionales',
  'Capacitación',
  'Cumplimiento SIPPCI',
  'Armería',
  'Campos de Tiro',
  'Polígono de Tiro',
  'Actividades Aéreas',
  'Actividades Acuáticas',
  'Actividades Terrestres'
]

onMounted(() => {
  const param = route.params.formularioSeleccionado
  if (param) {
    const formatoModulo = param.replace(/-/g, ' ').toLowerCase()
    const encontrado = tramitesOficiales.find(t => t.toLowerCase() === formatoModulo)
    if (encontrado) {
      formularioRegistro.value.formularioARegistrar = [encontrado]
    }
  }
})

const buscarEnSegip = async () => {
  if (!formularioRegistro.value.ci || formularioRegistro.value.ci.length < 5) return

  cargandoSegip.value = true
  try {
    // Intenta primero vía authService (mock) y luego backend real si existe
    try {
      const segipRes = await authService.consultarSegip(formularioRegistro.value.ci)
      if (segipRes && segipRes.nombre_completo) {
        formularioRegistro.value.nombreCompleto = segipRes.nombre_completo
        return
      }
    } catch {}
    const respuesta = await fetch(`${API_URL}/segip/consultar?ci=${formularioRegistro.value.ci}`)
    if (respuesta.ok) {
      const datosPersona = await respuesta.json()
      if (datosPersona && (datosPersona.nombreCompleto || datosPersona.nombre_completo)) {
        formularioRegistro.value.nombreCompleto = datosPersona.nombreCompleto || datosPersona.nombre_completo
      }
    } else {
      console.warn('Consulta SEGIP en desarrollo o sin conexión estricta.')
    }
  } catch (error) {
    console.error('Error al consultar SEGIP:', error)
  } finally {
    cargandoSegip.value = false
  }
}

const procesarRegistro = async () => {
  if (formularioRegistro.value.representaEmpresa === 'si' && !formularioRegistro.value.nit) {
    errorRegistro.value = 'Por favor, introduzca el número de NIT de su empresa.'
    return
  }

  if (formularioRegistro.value.formularioARegistrar.length === 0) {
    errorRegistro.value = 'Por favor, seleccione al menos un trámite o área de destino.'
    return
  }

  cargandoRegistro.value = true
  errorRegistro.value = ''
  try {
    const resultado = await authService.register({
      ci: formularioRegistro.value.ci,
      nombre_completo: formularioRegistro.value.nombreCompleto,
      nombreCompleto: formularioRegistro.value.nombreCompleto,
      email: formularioRegistro.value.correo,
      correo: formularioRegistro.value.correo,
      telefono: String(formularioRegistro.value.celular),
      celular: String(formularioRegistro.value.celular),
      departamento: formularioRegistro.value.departamento,
      representaEmpresa: formularioRegistro.value.representaEmpresa,
      tipo_persona: formularioRegistro.value.representaEmpresa === 'si' ? 'EMPRESA' : 'NATURAL',
      password: 'Bomberos2026*',
    })

    alert(`¡Registro Exitoso!\nSe han enviado sus credenciales de acceso al correo: ${formularioRegistro.value.correo}.`)
    modoVista.value = 'login' 
    // Prellenar login
    formularioLogin.value.correo = formularioRegistro.value.correo
  } catch (error) {
    console.error('Error de registro:', error)
    const status = error.statusCode || error.status
    const msg = error.message || ''
    if (status === 409 || msg.toLowerCase().includes('ya existe') || msg.toLowerCase().includes('ya registrado') || msg.toLowerCase().includes('existe')) {
      mostrarModalUsuarioExistente.value = true
    } else {
      errorRegistro.value = msg || 'Error en el registro: Verifique los datos'
    }
  } finally {
    cargandoRegistro.value = false
  }
}

const mostrarModal2FA = ref(false)
const codigoOTP = ref('')
const mostrarModalUsuarioExistente = ref(false)
const mostrarModalRecuperacion = ref(false)

const irALogin = () => {
  formularioLogin.value.correo = formularioRegistro.value.correo
  mostrarModalUsuarioExistente.value = false
  modoVista.value = 'login'
  router.push('/login')
}

const abrirRecuperacion = () => {
  mostrarModalRecuperacion.value = true
}

const irAContactos = () => {
  mostrarModalRecuperacion.value = false
  router.push('/contactos')
}

const procesarLogin = async () => {
  cargandoLogin.value = true
  errorLogin.value = ''
  try {
    const resultado = await authService.login({
      correo: formularioLogin.value.correo,
      email: formularioLogin.value.correo,
      password: formularioLogin.value.password
    })

    if (resultado.requiereOtp) {
      errorOtp.value = ''
      codigoOTP.value = ''
      mostrarModal2FA.value = true
    } else if (resultado.token) {
      // Caso sin OTP (no esperado en fase 1 pero manejado)
      router.push('/admin/formularios')
    } else {
      errorLogin.value = resultado.message || 'Acceso denegado'
    }
  } catch (error) {
    console.error('Error de login:', error)
    errorLogin.value = error.message || 'No se pudo conectar con el servidor para iniciar sesión.'
  } finally {
    cargandoLogin.value = false
  }
}

const verificarCodigoOTP = async () => {
  if (!codigoOTP.value || codigoOTP.value.length !== 6) {
    errorOtp.value = 'Por favor, introduzca un código válido de 6 dígitos.'
    return
  }
  cargandoOtp.value = true
  errorOtp.value = ''
  try {
    const resultado = await authService.verifyOtp({
      email: formularioLogin.value.correo,
      correo: formularioLogin.value.correo,
      codigo: codigoOTP.value
    })
    // auth.service ya guarda token y userRole en localStorage
    mostrarModal2FA.value = false
    codigoOTP.value = ''
    alert('¡Código verificado con éxito! Redirigiendo a sus formularios asignados.')
    router.push('/admin/formularios')
  } catch (error) {
    console.error('Error OTP:', error)
    const msg = error.message || 'Código incorrecto'
    // Mensajes específicos según backend: expirado, bloqueado, inválido
    if (msg.toLowerCase().includes('expirado')) {
      errorOtp.value = 'Código expirado. Solicite uno nuevo con Reenviar código.'
    } else if (msg.toLowerCase().includes('bloqueado') || msg.toLowerCase().includes('intentos')) {
      errorOtp.value = 'Código bloqueado por exceso de intentos. Solicite uno nuevo.'
    } else if (msg.toLowerCase().includes('incorrecto') || msg.toLowerCase().includes('inválido')) {
      errorOtp.value = 'Código OTP incorrecto. Verifique e intente nuevamente.'
    } else {
      errorOtp.value = msg
    }
  } finally {
    cargandoOtp.value = false
  }
}

const reenviarCodigo = async () => {
  if (!formularioLogin.value.correo) {
    errorOtp.value = 'No hay correo para reenviar el código.'
    return
  }
  cargandoReenvio.value = true
  errorOtp.value = ''
  mensajeReenvio.value = ''
  try {
    await authService.resendOtp({ email: formularioLogin.value.correo, correo: formularioLogin.value.correo })
    mensajeReenvio.value = 'Nuevo código enviado a su correo electrónico.'
    setTimeout(() => mensajeReenvio.value = '', 4000)
  } catch (error) {
    console.error('Error reenvío:', error)
    errorOtp.value = error.message || 'No se pudo reenviar el código.'
  } finally {
    cargandoReenvio.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center p-6 animate-fade-in">
    <div class="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200/60 p-8 relative">
      
      <div class="absolute top-4 right-6">
        <button 
          @click="modoVista = modoVista === 'registro' ? 'login' : 'registro'"
          class="relative p-2 text-xs font-bold text-red-600 hover:text-red-700 no-underline hover:underline cursor-pointer select-none"
        >
          {{ modoVista === 'registro' ? 'Ya tengo cuenta (Ingresar)' : 'No tengo cuenta (Registrarme)' }}
        </button>
      </div>

      <div v-if="modoVista === 'registro'" class="animate-fade-in">
        <div class="text-center mb-8">
          <div class="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-md shadow-red-600/20 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Registro Inicial</h2>
          <p class="text-xs text-slate-500 mt-1">Complete sus datos para solicitar sus credenciales de acceso al sistema.</p>
        </div>

        <form @submit.prevent="procesarRegistro" class="space-y-5">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Cédula de Identidad</label>
              <div class="relative">
                <input 
                  v-model.trim="formularioRegistro.ci" 
                  @blur="buscarEnSegip"
                  type="text" 
                  required 
                  placeholder="Ej. 1234567" 
                  class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-red-500 bg-slate-50/30 transition-all" 
                />
                <span v-if="cargandoSegip" class="absolute right-3 top-3 text-xs text-red-600 animate-pulse">Buscando...</span>
              </div>
            </div>
            <div class="md:col-span-2">
              <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Nombre Completo (Verificado SEGIP)</label>
              <input 
                v-model="formularioRegistro.nombreCompleto" 
                type="text" 
                required 
                placeholder="Ej. Juan Pérez Mamani" 
                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-red-500 bg-slate-50/30 transition-all" 
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Departamento (Sede)</label>
              <select v-model="formularioRegistro.departamento" required class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-red-500 bg-white text-slate-700">
                <option value="" disabled selected>Seleccione un departamento</option>
                <option v-for="dep in departamentosBolivia" :key="dep.codigo" :value="dep.nombre">{{ dep.nombre }}</option>
              </select>
            </div>
            <div>
              <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Número de Celular</label>
              <input v-model.number="formularioRegistro.celular" type="tel" pattern="[0-9]{7,8}" required placeholder="Ej. 71234567" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-red-500 bg-slate-50/30 transition-all" />
            </div>
          </div>

          <div>
            <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Correo Electrónico</label>
            <input v-model.trim="formularioRegistro.correo" type="email" required placeholder="ejemplo@correo.com" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-red-500 bg-slate-50/30 transition-all" />
          </div>

          <div class="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-3">
            <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-600">¿Representa a una empresa institucional / privada?</label>
            <div class="flex items-center space-x-6">
              <label class="flex items-center text-sm font-medium text-slate-700 cursor-pointer select-none">
                <input type="radio" v-model="formularioRegistro.representaEmpresa" value="no" class="accent-red-600 h-4 w-4" />
                <span class="ml-2">No, actúo de forma independiente</span>
              </label>
              <label class="flex items-center text-sm font-medium text-slate-700 cursor-pointer select-none">
                <input type="radio" v-model="formularioRegistro.representaEmpresa" value="si" class="accent-red-600 h-4 w-4" />
                <span class="ml-2">Sí, represento a una empresa</span>
              </label>
            </div>
            <div v-if="formularioRegistro.representaEmpresa === 'si'" class="pt-2 animate-slide-down">
              <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Número de NIT</label>
              <input v-model.trim="formularioRegistro.nit" type="text" required placeholder="Introduzca el NIT de la empresa" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-red-500 bg-white" />
            </div>
          </div>

          <!-- CUADRÍCULA DE TRÁMITES MÚLTIPLES (Checkboxes) -->
          <div>
            <div class="flex justify-between items-center mb-2">
              <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-600">Seleccione los Trámites o Áreas de Destino (Puede elegir varios)</label>
              <span class="text-[10px] text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                {{ formularioRegistro.formularioARegistrar.length }} seleccionados
              </span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto p-1 border border-slate-200 rounded-xl bg-slate-50/50">
              <label 
                v-for="tramite in tramitesOficiales" 
                :key="tramite"
                :class="[
                  'flex items-center p-3 rounded-lg border text-xs font-medium cursor-pointer transition-all select-none',
                  formularioRegistro.formularioARegistrar.includes(tramite) 
                    ? 'bg-red-50 border-red-500 text-red-900 shadow-xs' 
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                ]"
              >
                <input 
                  type="checkbox" 
                  :value="tramite" 
                  v-model="formularioRegistro.formularioARegistrar" 
                  class="accent-red-600 h-4 w-4 rounded mr-2.5" 
                />
                {{ tramite }}
              </label>
            </div>
          </div>

          <p v-if="errorRegistro" class="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ errorRegistro }}</p>

          <button type="submit" :disabled="cargandoRegistro" class="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm py-3 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2">
            <span v-if="!cargandoRegistro">Solicitar Registro e Ingreso</span>
            <span v-else>Enviando registro...</span>
            <svg v-if="!cargandoRegistro" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </form>
      </div>

      <div v-else class="animate-fade-in py-6 max-w-md mx-auto">
        <div class="text-center mb-8">
          <div class="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Ingreso al Sistema</h2>
          <p class="text-xs text-slate-500 mt-1">Introduzca las credenciales institucionales enviadas a su correo.</p>
        </div>

        <form @submit.prevent="procesarLogin" class="space-y-5">
          <div>
            <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Correo Electrónico</label>
            <input 
              v-model.trim="formularioLogin.correo" 
              type="email" 
              required 
              placeholder="ejemplo@correo.com" 
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-red-500 bg-slate-50/30 transition-all" 
            />
          </div>

          <div>
            <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Contraseña de Acceso</label>
            <div class="relative">
              <input 
                v-model="formularioLogin.password" 
                :type="mostrarPassword ? 'text' : 'password'" 
                required 
                autocomplete="current-password"
                placeholder="••••••••" 
                class="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-red-500 bg-slate-50/30 transition-all" 
              />
              <button 
                type="button"
                @click="mostrarPassword = !mostrarPassword"
                :aria-label="mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 rounded-md p-1 cursor-pointer transition-colors"
              >
                <svg v-if="!mostrarPassword" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.07 10.07 0 014.136-5.4M9.88 9.88l-3.53-3.53m6.18 6.18l3.53 3.53M3 3l18 18" />
                </svg>
              </button>
            </div>
          </div>

          <p v-if="errorLogin" class="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ errorLogin }}</p>

          <button 
            type="submit" 
            :disabled="cargandoLogin"
            class="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm py-3 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 active:scale-[0.99] mt-2"
          >
            <span>{{ cargandoLogin ? 'Validando...' : 'Validar Credenciales' }}</span>
            <svg v-if="!cargandoLogin" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </button>

          <div class="text-center -mt-1">
            <button
              type="button"
              @click="abrirRecuperacion"
              class="text-xs font-medium text-red-600 hover:text-red-700 hover:underline cursor-pointer"
            >
              ¿Olvidaste tu contraseña? 
            </button>
          </div>
        </form>
      </div>

    </div>
    
    <div v-if="mostrarModal2FA" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
        <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200/80 p-6 relative animate-scale-up">
          
          <button @click="mostrarModal2FA = false" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          <div class="text-center mb-5">
            <div class="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-red-100">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 class="text-lg font-bold text-slate-900">Verificación de Seguridad</h3>
            <p class="text-xs text-slate-500 mt-1 leading-normal">
              Hemos enviado un código de confirmación de 6 dígitos a su correo electrónico registrado.
            </p>
          </div>

          <form @submit.prevent="verificarCodigoOTP" class="space-y-4">
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 text-center">Código de Acceso (OTP)</label>
              <input 
                v-model.trim="codigoOTP"
                type="text" 
                maxlength="6"
                required
                placeholder="000000" 
                class="w-full text-center tracking-[0.5em] text-lg font-mono font-bold px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500 bg-slate-50/50"
              />
            </div>

            <p v-if="errorOtp" class="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center">{{ errorOtp }}</p>
            <p v-if="mensajeReenvio" class="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-center">{{ mensajeReenvio }}</p>

            <button type="submit" :disabled="cargandoOtp" class="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2">
              <span>{{ cargandoOtp ? 'Verificando...' : 'Confirmar Código e Ingresar' }}</span>
              <svg v-if="!cargandoOtp" xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </button>
          </form>

          <div class="text-center mt-4">
            <p class="text-[11px] text-slate-400">
              ¿No recibió el correo electrónico? 
              <button @click="reenviarCodigo" :disabled="cargandoReenvio" type="button" class="text-red-600 font-bold hover:underline ml-1 cursor-pointer disabled:opacity-50">{{ cargandoReenvio ? 'Enviando...' : 'Reenviar código' }}</button>
            </p>
          </div>

        </div>
      </div>

      <div v-if="mostrarModalUsuarioExistente" class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
        <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200/80 p-6 text-center animate-scale-up">
          <div class="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-100">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" /></svg>
          </div>
          <h3 class="text-lg font-bold text-slate-900">Usuario ya registrado</h3>
          <p class="text-sm text-slate-500 mt-2 leading-relaxed">
            Los datos proporcionados ya están asociados a una cuenta. Puede iniciar sesión con sus credenciales.
          </p>
          <div class="flex flex-col sm:flex-row gap-3 mt-6">
            <button @click="mostrarModalUsuarioExistente = false" type="button" class="flex-1 border border-slate-200 text-slate-700 font-semibold text-sm py-2.5 rounded-xl hover:bg-slate-50 transition-colors">Cerrar</button>
            <button @click="irALogin" type="button" class="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors">Ir a iniciar sesión</button>
          </div>
        </div>
      </div>

      <div v-if="mostrarModalRecuperacion" class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
        <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200/80 p-6 text-center animate-scale-up">
          <div class="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9a4 4 0 100-8 4 4 0 000 8zm0 2c-4.418 0-8 1.79-8 4v2h16v-2c0-2.21-3.582-4-8-4z" /></svg>
          </div>
          <h3 class="text-lg font-bold text-slate-900">Recuperación de contraseña</h3>
          <p class="text-sm text-slate-500 mt-2 leading-relaxed">
            La recuperación automática está en desarrollo. Por ahora, comuníquese con soporte técnico mediante los canales oficiales.
          </p>
          <div class="flex flex-col sm:flex-row gap-3 mt-6">
            <button @click="mostrarModalRecuperacion = false" type="button" class="flex-1 border border-slate-200 text-slate-700 font-semibold text-sm py-2.5 rounded-xl hover:bg-slate-50 transition-colors">Cerrar</button>
            <button @click="irAContactos" type="button" class="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors">Ver contactos</button>
          </div>
        </div>
      </div>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
.animate-slide-down { animation: slideDown 0.2s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideDown { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
.animate-scale-up {
  animation: scaleUp 0.2s ease-out forwards;
}

@keyframes scaleUp {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>
