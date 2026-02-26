import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TradePointsModule } from './trade-points/trade-points.module';
import { CouriersModule } from './couriers/couriers.module';
import { RoutesModule } from './routes/routes.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    TradePointsModule,
    CouriersModule,
    RoutesModule,
  ],
})
export class AppModule { }
