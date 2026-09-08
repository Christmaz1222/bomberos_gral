const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createUser() {
  try {
    // Generar el hash para la contraseña "123456"
    const passwordHash = await bcrypt.hash('123456', 10);
    console.log('✅ Hash generado:', passwordHash);
    
    // Crear el usuario
    const user = await prisma.usuario.create({
      data: {
        ci: '8888888',
        nombre_completo: 'Prueba Login',
        email: 'prueba@login.com',
        telefono: '77777777',
        password_hash: passwordHash,
        tipo_persona: 'NATURAL',
        departamento: 'La Paz',
        provincia: 'Murillo',
        municipio: 'La Paz',
        area: 'Centro',
        activo: true,
        verificado: true,
      },
    });
    
    console.log('✅ Usuario creado exitosamente:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Contraseña: 123456`);
    console.log(`   ID: ${user.id}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createUser();