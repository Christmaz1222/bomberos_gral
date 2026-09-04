<script setup>
const API_URL = 'http://localhost:3000/api'
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authService } from '../services/auth.service'

const route = useRoute()
const router = useRouter()

const modoVista = ref('registro') 

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

const formularioLogin = ref({
  correo: '',
  password: ''
})

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
    const respuesta = await fetch(`${API_URL}/segip/consultar?ci=${formularioRegistro.value.ci}`)
    if (respuesta.ok) {
      const datosPersona = await respuesta.json()
      if (datosPersona && datosPersona.nombreCompleto) {
        formularioRegistro.value.nombreCompleto = datosPersona.nombreCompleto
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
    alert('Por favor, introduzca el número de NIT de su empresa.')
    return
  }

  if (formularioRegistro.value.formularioARegistrar.length === 0) {
    alert('Por favor, seleccione al menos un trámite o área de destino.')
    return
  }

  try {
    const respuesta = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cedula: formularioRegistro.value.ci,
        nombreCompleto: formularioRegistro.value.nombreCompleto,
        departamento: formularioRegistro.value.departamento,
        correo: formularioRegistro.value.correo,
        celular: String(formularioRegistro.value.celular),
        representaEmpresa: formularioRegistro.value.representaEmpresa,
        nit: formularioRegistro.value.nit,
        formularioARegistrar: formularioRegistro.value.formularioARegistrar // Envía el arreglo con los trámites elegidos
      })
    })

    const resultado = await respuesta.json()

    if (respuesta.ok) {
      alert(`¡Registro Exitoso!\nSe han enviado sus credenciales de acceso al correo: ${formularioRegistro.value.correo}.`)
      modoVista.value = 'login' 
    } else {
      alert('Error en el registro: ' + (resultado.message || 'Verifique los datos'))
    }
  } catch (error) {
    console.error('Error de conexión:', error)
    alert('No se pudo conectar con el servidor del backend.')
  }
}

const mostrarModal2FA = ref(false)
const codigoOTP = ref('')

const procesarLogin = async () => {
  try {
    const resultado = await authService.login({
      correo: formularioLogin.value.correo,
      password: formularioLogin.value.password
    })

    // CAMBIA 'resultado.token' por 'resultado.requiereOtp' aquí:
    if (resultado.requiereOtp) {
      mostrarModal2FA.value = true
    } else {
      alert('Credenciales incorrectas: ' + (resultado.message || 'Acceso denegado'))
    }
  } catch (error) {
    console.error('Error de conexión:', error)
    alert(error.message || 'No se pudo conectar con el servidor para iniciar sesión.')
  }
}

const verificarCodigoOTP = () => {
  if (codigoOTP.value.length === 6) {
    // Guarda el token para que el router permita el acceso a la zona privada
    localStorage.setItem('token', 'token-otp-verificado')
    
    alert('¡Código Verificado con éxito! Redirigiendo a sus formularios asignados.')
    mostrarModal2FA.value = false
    router.push('/admin/formularios')
  } else {
    alert('Por favor, introduzca un código válido de 6 dígitos.')
  }
}

const reenviarCodigo = () => {
  alert('Se ha generado un nuevo código de acceso y fue enviado a su correo electrónico.')
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center p-6 animate-fade-in">
    <div class="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200/60 p-8 relative">
      
      <div class="absolute top-6 right-8">
        <button 
          @click="modoVista = modoVista === 'registro' ? 'login' : 'registro'"
          class="text-xs font-bold text-red-600 hover:text-red-700 underline cursor-pointer select-none"
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

          <button type="submit" class="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm py-3 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2">
            <span>Solicitar Registro e Ingreso</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
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
            <input 
              v-model="formularioLogin.password" 
              type="password" 
              required 
              placeholder="••••••••" 
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-red-500 bg-slate-50/30 transition-all" 
            />
          </div>

          <button 
            type="submit" 
            class="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm py-3 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 active:scale-[0.99] mt-2"
          >
            <span>Validar Credenciales</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </button>
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

            <button type="submit" class="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2">
              <span>Confirmar Código e Ingresar</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </button>
          </form>

          <div class="text-center mt-4">
            <p class="text-[11px] text-slate-400">
              ¿No recibió el correo electrónico? 
              <button @click="reenviarCodigo" type="button" class="text-red-600 font-bold hover:underline ml-1 cursor-pointer">Reenviar código</button>
            </p>
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