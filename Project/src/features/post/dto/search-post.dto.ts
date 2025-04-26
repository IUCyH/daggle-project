import { IsNotEmpty, IsIn } from "class-validator";
import { Order, OrderValues, SearchOption, SearchOptionValues } from "../interface/post-service.interface";
import { ApiProperty } from "@nestjs/swagger";

export class SearchPostDto {

    @ApiProperty({ example: "title" })
    @IsNotEmpty()
    @IsIn(Object.values(SearchOption))
    option: SearchOptionValues = SearchOption.TITLE;

    @ApiProperty({ example: "키워드" })
    @IsNotEmpty()
    keyword!: string;

    @ApiProperty({ example: "recent" })
    @IsNotEmpty()
    @IsIn(Object.values(Order))
    order: OrderValues = Order.RECENT;

    @ApiProperty({ example: "0" })
    @IsNotEmpty()
    date!: string;
}