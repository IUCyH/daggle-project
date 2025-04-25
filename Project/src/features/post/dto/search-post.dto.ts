import { IsNotEmpty, IsIn } from "class-validator";
import { Order, OrderValues, SearchOption, SearchOptionValues } from "../interface/post-service.interface";

export class SearchPostDto {

    @IsNotEmpty()
    @IsIn(Object.values(SearchOption))
    option: SearchOptionValues = SearchOption.TITLE;

    @IsNotEmpty()
    keyword!: string;

    @IsNotEmpty()
    @IsIn(Object.values(Order))
    order: OrderValues = Order.RECENT;

    @IsNotEmpty()
    date!: string;
}