import {
    Controller, Get, Post, Body, Param,
    ParseIntPipe, UseGuards, Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { RoutesService } from './routes.service';
import { CreateRouteDto } from './dto/route.dto';
import { Roles, RolesGuard } from '../common/guards';

@Controller('routes')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class RoutesController {
    constructor(private readonly routesService: RoutesService) { }

    @Get()
    @Roles(Role.COURIER)
    findAll(@Request() req: any) {
        return this.routesService.findAllByCourier(req.user.courierId);
    }

    @Post()
    @Roles(Role.COURIER)
    create(@Request() req: any, @Body() dto: CreateRouteDto) {
        return this.routesService.create(req.user.courierId, dto);
    }

    @Post(':id/delete')
    @Roles(Role.COURIER)
    remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
        return this.routesService.remove(id, req.user.courierId);
    }

    // ========= Route Session / Tracking =========

    /** Start a route session — courier begins following a route */
    @Post(':id/start')
    @Roles(Role.COURIER)
    startSession(@Param('id', ParseIntPipe) routeId: number, @Request() req: any) {
        return this.routesService.startSession(routeId, req.user.courierId);
    }

    /** Get active session for courier */
    @Get('session/active')
    @Roles(Role.COURIER)
    getActiveSession(@Request() req: any) {
        return this.routesService.getActiveSession(req.user.courierId);
    }

    /** Update track points during an active session */
    @Post('session/:id/track')
    @Roles(Role.COURIER)
    updateTrack(
        @Param('id', ParseIntPipe) sessionId: number,
        @Request() req: any,
        @Body() body: { trackPoints: { lat: number; lng: number; timestamp: number; accuracy?: number }[]; totalDistance: number },
    ) {
        return this.routesService.updateTrack(sessionId, req.user.courierId, body);
    }

    /** Finish an active session */
    @Post('session/:id/finish')
    @Roles(Role.COURIER)
    finishSession(@Param('id', ParseIntPipe) sessionId: number, @Request() req: any) {
        return this.routesService.finishSession(sessionId, req.user.courierId);
    }

    // ========= Admin endpoints =========

    /** Admin: get all sessions for a specific route */
    @Get(':id/sessions')
    @Roles(Role.ADMIN)
    getRouteSessions(@Param('id', ParseIntPipe) routeId: number) {
        return this.routesService.getRouteSessions(routeId);
    }

    /** Admin: get all sessions for a specific courier */
    @Get('sessions/courier/:courierId')
    @Roles(Role.ADMIN)
    getCourierSessions(@Param('courierId', ParseIntPipe) courierId: number) {
        return this.routesService.getCourierSessions(courierId);
    }

    /** Admin: get all recent sessions */
    @Get('sessions/all')
    @Roles(Role.ADMIN)
    getAllSessions() {
        return this.routesService.getAllSessions();
    }
}
