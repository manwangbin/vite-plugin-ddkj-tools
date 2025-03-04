import Type from "./type";

export default interface NumberType extends Type {

    decimal: number;

    big: boolean;

    format: string;
}