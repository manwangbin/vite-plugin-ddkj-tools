import Type from "./type/type";

export default interface FormField {
    code?: string;

    label?: string;

    dbcolumn?: string;

    system: boolean;

    type?: Type;

    primary: boolean;

    required: boolean;

    unique: boolean;

    help?: string;
}