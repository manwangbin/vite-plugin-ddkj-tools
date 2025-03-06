import Type from "./type";

export default interface EnumType extends Type {

    options: Array<EnumOptions>;
    
}

export interface EnumOptions {

    value: number;

    label: string;

    icon: string;

    color: string;
}