import DataForm from "./form/dataform";

export default interface ModalTreeNode {

    key: string;

    fullName: string;

    title: string;

    form?: DataForm;

    children?: Array<ModalTreeNode>;
}