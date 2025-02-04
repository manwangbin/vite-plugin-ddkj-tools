import Type from "./type";

export default interface CollectionType extends Type {

    sort: boolean;

    mapped: string ;

    orders: Array<string> ;

    pageSize: number ;

    searchFields: Array<string>;

    mtmTable: ManyToManyTable;
}

export interface ManyToManyTable {

    tableName: string;

    joinColumn: string;

    inverseColumn: string;
}