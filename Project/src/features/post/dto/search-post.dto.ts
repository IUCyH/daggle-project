import { IsNotEmpty, IsIn } from "class-validator";
import { SearchOption, SearchOptionValues } from "../interface/post-service.interface";

export class SearchPostDto {

    @IsNotEmpty()
    @IsIn(Object.values(SearchOption))
    option: SearchOptionValues = SearchOption.TITLE;

    @IsNotEmpty()
    keyword!: string;
}