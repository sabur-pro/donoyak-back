import { IsString, IsOptional, IsInt, IsArray, MinLength } from 'class-validator';

export class CreateCourierDto {
    @IsString()
    name!: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsString()
    login!: string;

    @IsString()
    @MinLength(4)
    password!: string;
}

export class UpdateCourierDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    phone?: string;
}

export class AssignTradePointsDto {
    @IsArray()
    @IsInt({ each: true })
    tradePointIds!: number[];
}
