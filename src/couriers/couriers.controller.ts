import {
    Controller, Get, Post, Patch, Delete,
    Body, Param, Query, ParseIntPipe, UseGuards, Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { CouriersService } from './couriers.service';
import { CreateCourierDto, UpdateCourierDto, AssignTradePointsDto } from './dto/courier.dto';
import { Roles, RolesGuard } from '../common/guards';

@Controller('couriers')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class CouriersController {
    constructor(private readonly couriersService: CouriersService) { }

    @Get()
    @Roles(Role.ADMIN)
    findAll() {
        return this.couriersService.findAll();
    }

    @Get('me/trade-points')
    @Roles(Role.COURIER)
    getMyTradePoints(
        @Request() req: any,
        @Query('search') search?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.couriersService.getMyTradePoints(
            req.user.courierId,
            search,
            page ? parseInt(page, 10) : 1,
            limit ? parseInt(limit, 10) : 50,
        );
    }

    @Get(':id')
    @Roles(Role.ADMIN)
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.couriersService.findOne(id);
    }

    @Post()
    @Roles(Role.ADMIN)
    create(@Body() dto: CreateCourierDto) {
        return this.couriersService.create(dto);
    }

    @Patch(':id')
    @Roles(Role.ADMIN)
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateCourierDto,
    ) {
        return this.couriersService.update(id, dto);
    }

    @Delete(':id')
    @Roles(Role.ADMIN)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.couriersService.remove(id);
    }

    @Post(':id/trade-points')
    @Roles(Role.ADMIN)
    assignTradePoints(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: AssignTradePointsDto,
    ) {
        return this.couriersService.assignTradePoints(id, dto);
    }
}
