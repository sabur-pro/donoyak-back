import { Module } from '@nestjs/common';
import { TradePointsService } from './trade-points.service';
import { TradePointsController } from './trade-points.controller';

@Module({
    controllers: [TradePointsController],
    providers: [TradePointsService],
    exports: [TradePointsService],
})
export class TradePointsModule { }
