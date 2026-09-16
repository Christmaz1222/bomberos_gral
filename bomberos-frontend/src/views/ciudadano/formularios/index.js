/**
 * Mapa de formularios por submódulo y tipo_persona
 * Clave: ID del submódulo
 * Valor: Componente Vue (o mapa por tipo_persona)
 *
 * Para agregar un nuevo formulario:
 * 1. Importar el componente
 * 2. Agregarlo al mapa con su submodulo_id
 */
// FASE 3a: Formularios reales de Registro de Profesionales (legacy formbns03/04)
import FormularioProfesionalJuridica from './FormularioProfesionalJuridica.vue'
import FormularioProfesionalNatural from './FormularioProfesionalNatural.vue'
// FASE 3b: Formularios reales de Certificación SIPPCI (legacy formbns01/02)
import FormularioCertificacionJuridica from './FormularioCertificacionJuridica.vue'
import FormularioCertificacionNatural from './FormularioCertificacionNatural.vue'
// FASE 3c: Formularios reales de Capacitación y Declaración Jurada (legacy formbns05/06)
import FormularioCapacitacion from './FormularioCapacitacion.vue'
import FormularioDeclaracionJurada from './FormularioDeclaracionJurada.vue'
import FormularioGenerico from './FormularioGenerico.vue'

export const FORMULARIOS_POR_SUBMODULO = {
  1: {
    // Registro de Profesionales (SIPPCI) — legacy REGPROF-JUR / REGPROF-NAT
    NATURAL: FormularioProfesionalNatural,
    EMPRESA: FormularioProfesionalJuridica,
    JURIDICA: FormularioProfesionalJuridica,
  },
  2: {
    // Capacitación (SIPPCI) — legacy CAPACI-JUR
    NATURAL: FormularioCapacitacion,
    EMPRESA: FormularioCapacitacion,
    JURIDICA: FormularioCapacitacion,
  },
  3: {
    // Cumplimiento SIPPCI (SIPPCI) — legacy SIPPCI-JUR / SIPPCI-NAT
    NATURAL: FormularioCertificacionNatural,
    EMPRESA: FormularioCertificacionJuridica,
    JURIDICA: FormularioCertificacionJuridica,
  },
  10: {
    // Declaración Jurada Única (SIPPCI) — legacy DECLA-JUR
    NATURAL: FormularioDeclaracionJurada,
    EMPRESA: FormularioDeclaracionJurada,
    JURIDICA: FormularioDeclaracionJurada,
  },
  // Próximos formularios (FASE 3d / Reglamentación y Turismo):
  // 4: { ... FormularioArmeria },
  // 5: { ... FormularioCamposTiro },
  // 6: { ... FormularioPoligonoTiro },
  // 7: { ... FormularioActividadesAereas },
  // 8: { ... FormularioActividadesAcuaticas },
  // 9: { ... FormularioActividadesTerrestres },
}

/**
 * Devuelve el componente de formulario según submódulo y tipo de persona
 * @param {number} submoduloId - ID del submódulo
 * @param {string} tipoPersona - NATURAL | EMPRESA | JURIDICA
 */
export function getFormulario(submoduloId, tipoPersona = 'NATURAL') {
  const entry = FORMULARIOS_POR_SUBMODULO[submoduloId]

  if (!entry) return FormularioGenerico
  if (typeof entry === 'function') return entry

  return entry[tipoPersona] || entry.NATURAL || FormularioGenerico
}

export { FormularioGenerico }