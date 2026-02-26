import { IsString, IsInt, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class RoutePointDto {
    @IsInt()
    tradePointId!: number;

    @IsInt()
    order!: number;
}

export class CreateRouteDto {
    @IsString()
    name!: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RoutePointDto)
    points!: RoutePointDto[];
}
