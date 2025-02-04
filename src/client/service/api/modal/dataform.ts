export default interface DataForm {
    id?: number;
    code: string;
    version?: number;
    category: Array<string>;
    title: string;
    titleField?: string;
    valueField?: string;
    tableName?: string;
    isTree?: boolean;
    treePathField?: string;
    treeParentField?: string;
    persistence?: boolean;
    enabledCache?: boolean;
    note?: string;
}
