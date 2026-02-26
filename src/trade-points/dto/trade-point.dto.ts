import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateTradePointDto {
    @IsString()
    name!: string;

    @IsString()
    address!: string;

    @IsNumber()
    lat!: number;

    @IsNumber()
    lng!: number;
}

export class UpdateTradePointDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsNumber()
    lat?: number;

    @IsOptional()
    @IsNumber()
    lng?: number;
}
