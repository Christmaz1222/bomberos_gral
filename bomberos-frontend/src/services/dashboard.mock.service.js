const simulateDelay = () => new Promise((resolve) => setTimeout(resolve, 300))

export const dashboardMockService = {
  async getMetricas() {
    await simulateDelay()
    return {
      tramitesTotales: { valor: '1,248', cambio: '+12% este mes', tendencia: 'up' },
      enInspeccion: { valor: '84', cambio: 'Asignados hoy', tendencia: 'neutral' },
      aprobados: { valor: '912', cambio: 'Firma digital', tendencia: 'up' },
      observados: { valor: '32', cambio: 'Requieren revisión', tendencia: 'down' },
    }
  },

  async getDistribucionModulos() {
    await simulateDelay()
    return [
      { nombre: 'SIPPCI — Inspección de Infraestructuras', tramites: 171, porcentaje: 70, color: 'bomberos-navy' },
      { nombre: 'Reglamentación — Armería, Campos y Polígonos', tramites: 45, porcentaje: 18, color: 'bomberos-red' },
      { nombre: 'Turismo — Actividades Aéreas, Acuáticas y Terrestres', tramites: 28, porcentaje: 12, color: 'bomberos-gold' },
    ]
  },

  async getUltimasCarpetas() {
    await simulateDelay()
    return [
      {
        nroTramite: 'INF-2026-894',
        contribuyente: 'YPFB Estación de Servicio',
        tipo: 'Jurídica',
        modulo: 'SIPPCI',
        sector: 'Hidrocarburos',
        ingreso: 'Hoy 14:20',
        prioridad: 'Alta',
        estado: 'Pendiente',
      },
      {
        nroTramite: 'REG-ARM-2026-045',
        contribuyente: 'Defensa S.A.',
        tipo: 'Jurídica',
        modulo: 'Reglamentación',
        sector: 'Armería',
        ingreso: 'Ayer 16:30',
        prioridad: 'Alta',
        estado: 'Pendiente',
      },
      {
        nroTramite: 'TUR-AER-2026-012',
        contribuyente: 'Club de Vuelo Andino',
        tipo: 'Jurídica',
        modulo: 'Turismo',
        sector: 'Alas Delta',
        ingreso: 'Ayer 10:15',
        prioridad: 'Media',
        estado: 'Aprobado',
      },
    ]
  },

  async getMetricasSippci() {
    await simulateDelay()
    return {
      pendientes: 42,
      enRevision: 28,
      aprobadas: 184,
      observadas: 16,
    }
  },

  async getProfesionales() {
    await simulateDelay()
    return [
      {
        codigo: 'SIPPCI-PN-2026-001',
        solicitante: 'Juan Pérez Mamani',
        tipo: 'Natural',
        ci: '1234567 LP',
        departamento: 'La Paz',
        fecha: '15/09/2026',
        estado: 'Pendiente',
      },
      {
        codigo: 'SIPPCI-PJ-2026-002',
        solicitante: 'ABC S.R.L.',
        tipo: 'Jurídica',
        ci: '1023456789',
        departamento: 'Santa Cruz',
        fecha: '14/09/2026',
        estado: 'En Revisión',
      },
      {
        codigo: 'SIPPCI-PN-2026-003',
        solicitante: 'María González',
        tipo: 'Natural',
        ci: '7654321 CB',
        departamento: 'Cochabamba',
        fecha: '13/09/2026',
        estado: 'Aprobado',
      },
    ]
  },

  async getMetricasProfesionales() {
    await simulateDelay()
    return {
      pendientes: 12,
      enRevision: 5,
      aprobadas: 45,
      observadas: 3,
    }
  },

  async getEmpresas() {
    await simulateDelay()
    return [
      {
        nit: '1023456789',
        razonSocial: 'ABC S.R.L.',
        tipo: 'S.R.L.',
        representante: 'Ing. Marcelo Quiroga',
        departamento: 'Santa Cruz',
        estado: 'Activa',
      },
      {
        nit: '1098765432',
        razonSocial: 'Defensa S.A.',
        tipo: 'S.A.',
        representante: 'Lic. Roberto Morales',
        departamento: 'La Paz',
        estado: 'Activa',
      },
      {
        nit: '1056789012',
        razonSocial: 'Inversiones Retail S.A.',
        tipo: 'S.A.',
        representante: 'Dra. Patricia Vaca',
        departamento: 'Cochabamba',
        estado: 'Pendiente',
      },
      {
        nit: '1089012345',
        razonSocial: 'Minera San Cristóbal S.A.',
        tipo: 'S.A.',
        representante: 'Ing. Jorge Valenzuela',
        departamento: 'Potosí',
        estado: 'Suspendida',
      },
    ]
  },

  async getMetricasEmpresas() {
    await simulateDelay()
    return {
      registradas: 87,
      activas: 72,
      pendientes: 10,
      suspendidas: 5,
    }
  },

  async getContadoresSidebar() {
    await simulateDelay()
    return {
      sippci: 171,
      reglamentacion: 45,
      turismo: 28,
    }
  },
}
