import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PERMISOS_POR_ROL } from '../src/common/constants/permisos';

const prisma = new PrismaClient();

// ============================================================
// SEED CATÁLOGO MÓDULOS / SUBMÓDULOS — SIPPCI DNB
// Lista extraída del frontend real:
//  - src/views/RegistroProfesionalView.vue (tramitesOficiales, 9 ítems)
//  - src/views/HomeView.vue (sectores SIPPCI / REGLAMENTACION / TURISMO)
//  - src/views/admin/FormulariosView.vue (agrupación Turismo)
// ============================================================

interface SubmoduloSeed {
  nombre: string;
  descripcion: string;
}

interface ModuloSeed {
  nombre: string;
  descripcion: string;
  submodulos: SubmoduloSeed[];
}

const catalogo: ModuloSeed[] = [
  {
    nombre: 'SIPPCI',
    descripcion:
      'Sistema de Inspección de Prevención y Protección Contra Incendios de la Dirección Nacional de Bomberos.',
    submodulos: [
      {
        nombre: 'Registro de Profesionales',
        descripcion: 'Inscripción de profesionales habilitados en materia de prevención y protección contra incendios.',
      },
      {
        nombre: 'Capacitación',
        descripcion: 'Registro de capacitaciones SIPPCI y personas capacitadas.',
      },
      {
        nombre: 'Cumplimiento SIPPCI',
        descripcion: 'Certificación de cumplimiento del SIPPCI (incluye declaración jurada) para personas naturales y jurídicas.',
      },
    ],
  },
  {
    nombre: 'REGLAMENTACION',
    descripcion:
      'Reglamentación de Armerías, Campos y Polígonos de Tiro: certificación de seguridad pasiva y activa.',
    submodulos: [
      {
        nombre: 'Armería',
        descripcion: 'Certificación de instalaciones de almacenamiento de armamento.',
      },
      {
        nombre: 'Campos de Tiro',
        descripcion: 'Delimitación técnica y protección perimetral de campos de entrenamiento.',
      },
      {
        nombre: 'Polígono de Tiro',
        descripcion: 'Certificación de polígonos de tiro.',
      },
    ],
  },
  {
    nombre: 'TURISMO',
    descripcion:
      'Reglamentación de seguridad contra incendios aplicada al sector turismo y hotelería.',
    submodulos: [
      {
        nombre: 'Actividades Aéreas',
        descripcion: 'Registro y certificación de actividades aéreas de turismo (alas delta, canopy, parapente, etc.).',
      },
      {
        nombre: 'Actividades Acuáticas',
        descripcion: 'Registro y certificación de actividades acuáticas de turismo (kayak, rafting, buceo, etc.).',
      },
      {
        nombre: 'Actividades Terrestres',
        descripcion: 'Registro y certificación de actividades terrestres de turismo (escalada, senderismo, cabalgata, etc.).',
      },
    ],
  },
];

async function main() {
  for (const modulo of catalogo) {
    const mod = await prisma.modulo.upsert({
      where: { nombre: modulo.nombre },
      update: { descripcion: modulo.descripcion },
      create: { nombre: modulo.nombre, descripcion: modulo.descripcion },
    });

    for (const sub of modulo.submodulos) {
      await prisma.submodulo.upsert({
        where: { modulo_id_nombre: { modulo_id: mod.id, nombre: sub.nombre } },
        update: { descripcion: sub.descripcion, tipo_persona: 'AMBOS' },
        create: {
          modulo_id: mod.id,
          nombre: sub.nombre,
          descripcion: sub.descripcion,
          tipo_persona: 'AMBOS',
        },
      });
    }
  }

  const totalModulos = await prisma.modulo.count();
  const totalSubmodulos = await prisma.submodulo.count();
  console.log(`✅ Seed catálogo completado: ${totalModulos} módulos, ${totalSubmodulos} submódulos.`);

  // ============================================
  // G-Ra: SEED — Usuarios internos de prueba
  // ============================================

  console.log('🌱 Sembrando usuarios internos...');

  const usuariosInternos = [
    {
      external_id: 'DNB-ADMIN-001',
      nombre: 'Administrador DNB',
      email: 'admin.dnb@bomberos.gob.bo',
      password_hash: await bcrypt.hash('AdminDNB2026*', 10),
      rol: 'ADMIN',
      permisos: { all: true } as any,
      activo: true,
    },
    {
      external_id: 'DNB-INSP-001',
      nombre: 'Inspector DNB',
      email: 'inspector.dnb@bomberos.gob.bo',
      password_hash: await bcrypt.hash('InspectorDNB2026*', 10),
      rol: 'INSPECTOR',
      permisos: {
        solicitudes: ['read', 'inspect'],
        inspecciones: ['create', 'update'],
      } as any,
      activo: true,
    },
    {
      external_id: 'DNB-CAJA-001',
      nombre: 'Cajero DNB',
      email: 'cajero.dnb@bomberos.gob.bo',
      password_hash: await bcrypt.hash('CajeroDNB2026*', 10),
      rol: 'CAJERO',
      permisos: {
        pagos: ['read', 'verify'],
      } as any,
      activo: true,
    },
  ];

  for (const ui of usuariosInternos) {
    await prisma.usuarioInterno.upsert({
      where: { email: ui.email },
      update: {},
      create: ui,
    });
    console.log(`  ✅ Usuario interno: ${ui.email} (${ui.rol})`);
  }

  // ============================================
  // RBAC1: SEED — Permisos por rol
  // ============================================

  console.log('🌱 Sembrando permisos por rol (RBAC1)...');

  const todosLosInternos = await prisma.usuarioInterno.findMany();

  for (const usuario of todosLosInternos) {
    const permisos = PERMISOS_POR_ROL[usuario.rol] || [];

    await prisma.usuarioInterno.update({
      where: { id: usuario.id },
      data: {
        permisos: permisos as any, // Array de strings, p. ej. ["solicitudes.read", ...]
      },
    });

    console.log(`  ✅ ${usuario.email} (${usuario.rol}): ${permisos.length} permisos`);
  }

  // ============================================
  // G-Rb1: SEED — Parámetros del sistema
  // ============================================

  console.log('🌱 Sembrando parámetros del sistema...');

  const parametros = [
    {
      clave: 'VIGENCIA_CERTIFICADO_ANIOS',
      valor: '2',
      descripcion: 'Vigencia del certificado en años (Art. 13 Reglamento SIPPCI)',
      categoria: 'GENERAL',
      editable: false,
    },
    {
      clave: 'UFV_VALOR_ACTUAL',
      valor: '2.45',
      descripcion: 'Valor de la UFV para cálculo de tarifas (actualizar diariamente)',
      categoria: 'PAGOS',
      editable: true,
    },
    {
      clave: 'DIAS_ALERTA_VENCIMIENTO',
      valor: '30',
      descripcion: 'Días previos al vencimiento para generar alertas',
      categoria: 'NOTIFICACIONES',
      editable: true,
    },
    {
      clave: 'MAX_INTENTOS_LOGIN',
      valor: '5',
      descripcion: 'Máximo de intentos fallidos de login antes de bloqueo temporal',
      categoria: 'SEGURIDAD',
      editable: true,
    },
    {
      clave: 'MINUTOS_BLOQUEO_LOGIN',
      valor: '15',
      descripcion: 'Minutos de bloqueo tras exceder intentos',
      categoria: 'SEGURIDAD',
      editable: true,
    },
    {
      clave: 'OTP_VIGENCIA_MINUTOS',
      valor: '10',
      descripcion: 'Minutos de vigencia del OTP',
      categoria: 'SEGURIDAD',
      editable: false,
    },
    {
      clave: 'TAMANO_MAXIMO_DOCUMENTO_MB',
      valor: '10',
      descripcion: 'Tamaño máximo de documento subido en MB',
      categoria: 'GENERAL',
      editable: true,
    },
    {
      clave: 'PROVEEDOR_PAGO_ACTIVO',
      valor: 'LIBELULA',
      descripcion: 'Proveedor de pagos activo (LIBELULA, BANCO_UNION, etc.)',
      categoria: 'PAGOS',
      editable: true,
    },
  ];

  for (const param of parametros) {
    await prisma.parametroSistema.upsert({
      where: { clave: param.clave },
      update: {},
      create: param,
    });
    console.log(`  ✅ Parámetro: ${param.clave} = ${param.valor}`);
  }

  // ============================================
  // G-N1b2b: SEED — Tarifas en ConfiguracionModulo
  // ============================================

  console.log('🌱 Sembrando tarifas de módulos...');

  const submodulos = await prisma.submodulo.findMany({
    include: { modulo: true },
  });

  const tarifasPorModulo: Record<string, { ufv: number; bs: number }> = {
    'SIPPCI': { ufv: 20, bs: 49.0 },
    'REGLAMENTACION': { ufv: 15, bs: 36.75 },
    'TURISMO': { ufv: 10, bs: 24.5 },
    'CAPACITACION': { ufv: 5, bs: 12.25 },
  };

  for (const sm of submodulos) {
    const tarifa = tarifasPorModulo[sm.modulo.nombre.toUpperCase()];
    if (tarifa) {
      await prisma.configuracionModulo.upsert({
        where: { submodulo_id: sm.id },
        update: {},
        create: {
          submodulo_id: sm.id,
          activo: true,
          requiere_pago: true,
          monto_ufv: tarifa.ufv,
          monto_bs: tarifa.bs,
        },
      });
      console.log(`  ✅ Tarifa: ${sm.nombre} = ${tarifa.ufv} UFV (${tarifa.bs} Bs)`);
    }
  }
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });