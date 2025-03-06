import Type from "./type";

export default interface StringType extends Type {

    minLength: number;

    maxLength: number;

    rich: boolean;

    format: string;
}