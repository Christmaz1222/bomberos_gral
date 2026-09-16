-- CreateEnum
CREATE TYPE "Role" AS ENUM ('EXTERNO', 'ADMIN', 'OFICIAL', 'CAPACITOR');

-- AlterTable (generado por prisma migrate diff --from-url --to-schema-datamodel --script)
ALTER TABLE "Usuario" DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'EXTERNO';
