import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTradePointDto, UpdateTradePointDto } from './dto/trade-point.dto';

@Injectable()
export class TradePointsService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll() {
        return this.prisma.tradePoint.findMany({
            include: {
                couriers: {
                    include: { courier: { select: { id: true, name: true } } },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: number) {
        const point = await this.prisma.tradePoint.findUnique({
            where: { id },
            include: {
                couriers: {
                    include: { courier: { select: { id: true, name: true } } },
                },
            },
        });
        if (!point) throw new NotFoundException('Торговая точка не найдена');
        return point;
    }

    async create(dto: CreateTradePointDto) {
        return this.prisma.tradePoint.create({ data: dto });
    }

    async update(id: number, dto: UpdateTradePointDto) {
        await this.findOne(id);
        return this.prisma.tradePoint.update({
            where: { id },
            data: dto,
        });
    }

    async remove(id: number) {
        await this.findOne(id);
        return this.prisma.tradePoint.delete({ where: { id } });
    }
}
