import Type from "./type/type";

export default interface FormField {
    code: string;

    lable: string;

    dbcolumn: string;

    system: boolean;

    type: Type;

    primary: boolean;

    required: boolean;

    unique: boolean;
}