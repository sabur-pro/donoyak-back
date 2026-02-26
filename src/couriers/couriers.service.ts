import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourierDto, UpdateCourierDto, AssignTradePointsDto } from './dto/courier.dto';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class CouriersService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll() {
        return this.prisma.courier.findMany({
            include: {
                user: { select: { id: true, login: true, role: true } },
                tradePoints: {
                    include: { tradePoint: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: number) {
        const courier = await this.prisma.courier.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, login: true, role: true } },
                tradePoints: {
                    include: { tradePoint: true },
                },
            },
        });
        if (!courier) throw new NotFoundException('Курьер не найден');
        return courier;
    }

    async create(dto: CreateCourierDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { login: dto.login },
        });
        if (existingUser) {
            throw new ConflictException('Пользователь с таким логином уже существует');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        return this.prisma.courier.create({
            data: {
                name: dto.name,
                phone: dto.phone,
                user: {
                    create: {
                        login: dto.login,
                        password: hashedPassword,
                        role: Role.COURIER,
                    },
                },
            },
            include: {
                user: { select: { id: true, login: true, role: true } },
            },
        });
    }

    async update(id: number, dto: UpdateCourierDto) {
        await this.findOne(id);
        return this.prisma.courier.update({
            where: { id },
            data: dto,
            include: {
                user: { select: { id: true, login: true, role: true } },
            },
        });
    }

    async remove(id: number) {
        const courier = await this.findOne(id);
        // Delete user too (cascade will handle courier)
        await this.prisma.user.delete({ where: { id: courier.userId } });
        return { message: 'Курьер удалён' };
    }

    async assignTradePoints(courierId: number, dto: AssignTradePointsDto) {
        await this.findOne(courierId);

        // Remove existing assignments
        await this.prisma.courierTradePoint.deleteMany({
            where: { courierId },
        });

        // Create new assignments
        if (dto.tradePointIds.length > 0) {
            await this.prisma.courierTradePoint.createMany({
                data: dto.tradePointIds.map((tradePointId) => ({
                    courierId,
                    tradePointId,
                })),
            });
        }

        return this.findOne(courierId);
    }

    async getMyTradePoints(
        courierId: number,
        search?: string,
        page = 1,
        limit = 50,
    ) {
        const where: any = { courierId };

        if (search && search.trim()) {
            where.tradePoint = {
                OR: [
                    { name: { contains: search.trim(), mode: 'insensitive' } },
                    { address: { contains: search.trim(), mode: 'insensitive' } },
                ],
            };
        }

        const [assignments, total] = await Promise.all([
            this.prisma.courierTradePoint.findMany({
                where,
                include: { tradePoint: true },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { tradePoint: { name: 'asc' } },
            }),
            this.prisma.courierTradePoint.count({ where }),
        ]);

        return {
            data: assignments.map((a) => a.tradePoint),
            total,
            page,
            limit,
        };
    }
}
