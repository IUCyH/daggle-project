import { IsNotEmpty, IsIn } from "class-validator";
import { Order, OrderValues } from "../interface/post-service.interface";
import { ApiProperty } from "@nestjs/swagger";

export class GetPostDto {

    @ApiProperty({ example: "0" })
    @IsNotEmpty()
    date!: string;

    @ApiProperty({ example: "recent" })
    @IsNotEmpty()
    @IsIn(Object.values(Order))
    order: OrderValues = Order.RECENT;
}