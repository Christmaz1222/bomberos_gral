import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // ⚠️ Password placeholder. Los usuarios INTERNOS no usan password.
  // Entran vía Kerveros SSO. Este hash solo cumple con el schema NOT NULL.
  const password_hash = await bcrypt.hash(`seed-placeholder-${Date.now()}`, 10);

  const usuarios = [
    {
      ci: '7711111',
      email: 'admin@bomberos.gob.bo',
      nombre_completo: 'Admin Sistema',
      telefono: '70000001',
      tipo_persona: 'INTERNO',
      role: 'ADMIN' as const,
      grado: null,
      unidad: 'Comando Nacional',
    },
    {
      ci: '9905200',
      email: 'oficial@bomberos.gob.bo',
      nombre_completo: 'Oficial Supervisor',
      telefono: '70000002',
      tipo_persona: 'INTERNO',
      role: 'OFICIAL' as const,
      grado: 'CAPITÁN',
      unidad: 'Unidad Bomberos La Paz',
    },
    {
      ci: '6622222',
      email: 'capacitor@bomberos.gob.bo',
      nombre_completo: 'Capacitor Instructor',
      telefono: '70000003',
      tipo_persona: 'INTERNO',
      role: 'CAPACITOR' as const,
      grado: null,
      unidad: 'Academia Nacional de Bomberos',
    },
  ];

  for (const u of usuarios) {
    const result = await prisma.usuario.upsert({
      where: { ci: u.ci },
      update: {
        email: u.email,
        nombre_completo: u.nombre_completo,
        telefono: u.telefono,
        tipo_persona: u.tipo_persona,
        role: u.role,
        grado: u.grado,
        unidad: u.unidad,
        password_hash,
        verificado: true,
        activo: true,
      },
      create: {
        ci: u.ci,
        email: u.email,
        nombre_completo: u.nombre_completo,
        telefono: u.telefono,
        tipo_persona: u.tipo_persona,
        role: u.role,
        grado: u.grado,
        unidad: u.unidad,
        password_hash,
        departamento: u.unidad || '',
        verificado: true,
        activo: true,
      },
    });
    console.log(`✓ Upsert ${u.role}: ${u.email} (ci ${u.ci}) id=${result.id}`);
  }

  console.log('\n✅ Seed completado: 3 usuarios internos');
  console.log('- ADMIN: admin@bomberos.gob.bo (ci 7711111)');
  console.log('- OFICIAL: oficial@bomberos.gob.bo (ci 9905200)');
  console.log('- CAPACITOR: capacitor@bomberos.gob.bo (ci 6622222)');
  console.log('Password placeholder (no usado, SSO Kerveros) — hash bcrypt 10 rounds');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
