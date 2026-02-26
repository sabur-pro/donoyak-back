import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const adminLogin = 'donoyak';
    const adminPassword = 'dono1234';

    const existing = await prisma.user.findUnique({
        where: { login: adminLogin },
    });

    if (existing) {
        console.log(`⚠️  Admin "${adminLogin}" already exists, skipping.`);
        return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = await prisma.user.create({
        data: {
            login: adminLogin,
            password: hashedPassword,
            role: Role.ADMIN,
        },
    });

    console.log(`✅ Admin created: id=${admin.id}, login="${admin.login}"`);
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
