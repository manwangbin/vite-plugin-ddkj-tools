export default interface ModalTreeNode {
    key: string;

    title: string;

    children?: Array<ModalTreeNode>;
}