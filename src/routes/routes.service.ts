import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRouteDto } from './dto/route.dto';

@Injectable()
export class RoutesService {
    constructor(private readonly prisma: PrismaService) { }

    async findAllByCourier(courierId: number) {
        return this.prisma.route.findMany({
            where: { courierId },
            include: {
                points: {
                    include: { tradePoint: true },
                    orderBy: { order: 'asc' },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async create(courierId: number, dto: CreateRouteDto) {
        return this.prisma.route.create({
            data: {
                name: dto.name,
                courierId,
                points: {
                    create: dto.points.map((p) => ({
                        order: p.order,
                        tradePointId: p.tradePointId,
                    })),
                },
            },
            include: {
                points: {
                    include: { tradePoint: true },
                    orderBy: { order: 'asc' },
                },
            },
        });
    }

    async remove(id: number, courierId: number) {
        const route = await this.prisma.route.findUnique({ where: { id } });
        if (!route) throw new NotFoundException('Маршрут не найден');
        if (route.courierId !== courierId) {
            throw new ForbiddenException('Нет доступа к этому маршруту');
        }
        await this.prisma.route.delete({ where: { id } });
        return { message: 'Маршрут удалён' };
    }

    // ========= Route Sessions =========

    async startSession(routeId: number, courierId: number) {
        // Check route belongs to courier
        const route = await this.prisma.route.findUnique({ where: { id: routeId } });
        if (!route) throw new NotFoundException('Маршрут не найден');
        if (route.courierId !== courierId) {
            throw new ForbiddenException('Нет доступа к этому маршруту');
        }

        // Close any existing active session
        await this.prisma.routeSession.updateMany({
            where: { courierId, isActive: true },
            data: { isActive: false, finishedAt: new Date() },
        });

        // Create new session
        return this.prisma.routeSession.create({
            data: {
                routeId,
                courierId,
                trackPoints: [],
                totalDistance: 0,
                isActive: true,
            },
            include: {
                route: {
                    include: {
                        points: {
                            include: { tradePoint: true },
                            orderBy: { order: 'asc' },
                        },
                    },
                },
            },
        });
    }

    async getActiveSession(courierId: number) {
        const session = await this.prisma.routeSession.findFirst({
            where: { courierId, isActive: true },
            include: {
                route: {
                    include: {
                        points: {
                            include: { tradePoint: true },
                            orderBy: { order: 'asc' },
                        },
                    },
                },
            },
        });
        return session || null;
    }

    async updateTrack(
        sessionId: number,
        courierId: number,
        body: {
            trackPoints: { lat: number; lng: number; timestamp: number; accuracy?: number }[];
            totalDistance: number;
        },
    ) {
        const session = await this.prisma.routeSession.findUnique({ where: { id: sessionId } });
        if (!session) throw new NotFoundException('Сессия не найдена');
        if (session.courierId !== courierId) throw new ForbiddenException('Нет доступа');
        if (!session.isActive) throw new BadRequestException('Сессия уже завершена');

        // Append new track points
        const existingPoints = (session.trackPoints as any[]) || [];
        const allPoints = [...existingPoints, ...body.trackPoints];

        return this.prisma.routeSession.update({
            where: { id: sessionId },
            data: {
                trackPoints: allPoints,
                totalDistance: body.totalDistance,
            },
        });
    }

    async finishSession(sessionId: number, courierId: number) {
        const session = await this.prisma.routeSession.findUnique({ where: { id: sessionId } });
        if (!session) throw new NotFoundException('Сессия не найдена');
        if (session.courierId !== courierId) throw new ForbiddenException('Нет доступа');

        return this.prisma.routeSession.update({
            where: { id: sessionId },
            data: {
                isActive: false,
                finishedAt: new Date(),
            },
            include: {
                route: {
                    include: {
                        points: {
                            include: { tradePoint: true },
                            orderBy: { order: 'asc' },
                        },
                    },
                },
            },
        });
    }

    // ========= Admin views =========

    async getRouteSessions(routeId: number) {
        return this.prisma.routeSession.findMany({
            where: { routeId },
            include: {
                courier: { select: { id: true, name: true } },
                route: { select: { id: true, name: true } },
            },
            orderBy: { startedAt: 'desc' },
        });
    }

    async getCourierSessions(courierId: number) {
        return this.prisma.routeSession.findMany({
            where: { courierId },
            include: {
                route: { select: { id: true, name: true } },
            },
            orderBy: { startedAt: 'desc' },
            take: 50,
        });
    }

    async getAllSessions() {
        return this.prisma.routeSession.findMany({
            include: {
                courier: { select: { id: true, name: true } },
                route: { select: { id: true, name: true } },
            },
            orderBy: { startedAt: 'desc' },
            take: 100,
        });
    }
}
