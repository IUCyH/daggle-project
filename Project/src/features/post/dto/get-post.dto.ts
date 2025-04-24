import { IsNotEmpty, IsIn } from "class-validator";
import { Order, OrderValues } from "../interface/post-service.interface";

export class GetPostDto {

    @IsNotEmpty()
    date!: string;

    @IsNotEmpty()
    @IsIn(Object.values(Order))
    order: OrderValues = Order.RECENT;
}