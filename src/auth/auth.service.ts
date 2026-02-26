import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) { }

    async login(dto: LoginDto): Promise<{ access_token: string }> {
        const user = await this.prisma.user.findUnique({
            where: { login: dto.login },
            include: { courier: true },
        });

        if (!user) {
            throw new UnauthorizedException('Неверный логин или пароль');
        }

        const isPasswordValid = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Неверный логин или пароль');
        }

        const payload = {
            sub: user.id,
            login: user.login,
            role: user.role,
            courierId: user.courier?.id ?? null,
        };

        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async seedAdmin(): Promise<{ message: string }> {
        const existingAdmin = await this.prisma.user.findFirst({
            where: { role: Role.ADMIN },
        });

        if (existingAdmin) {
            return { message: 'Админ уже существует' };
        }

        const hashedPassword = await bcrypt.hash('admin123', 10);

        await this.prisma.user.create({
            data: {
                login: 'admin',
                password: hashedPassword,
                role: Role.ADMIN,
            },
        });

        return { message: 'Админ создан: login=admin, password=admin123' };
    }

    async getProfile(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                login: true,
                role: true,
                courier: {
                    select: { id: true, name: true },
                },
            },
        });
        return user;
    }
}
