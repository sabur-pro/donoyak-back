import {
    Controller, Get, Post, Patch, Delete,
    Body, Param, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { TradePointsService } from './trade-points.service';
import { CreateTradePointDto, UpdateTradePointDto } from './dto/trade-point.dto';
import { Roles, RolesGuard } from '../common/guards';

@Controller('trade-points')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class TradePointsController {
    constructor(private readonly tradePointsService: TradePointsService) { }

    @Get()
    @Roles(Role.ADMIN)
    findAll() {
        return this.tradePointsService.findAll();
    }

    @Get(':id')
    @Roles(Role.ADMIN)
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.tradePointsService.findOne(id);
    }

    @Post()
    @Roles(Role.ADMIN)
    create(@Body() dto: CreateTradePointDto) {
        return this.tradePointsService.create(dto);
    }

    @Patch(':id')
    @Roles(Role.ADMIN)
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateTradePointDto,
    ) {
        return this.tradePointsService.update(id, dto);
    }

    @Delete(':id')
    @Roles(Role.ADMIN)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.tradePointsService.remove(id);
    }
}
