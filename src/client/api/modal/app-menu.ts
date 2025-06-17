export default interface AppMenu {
    
    id: number;

    code: string;

    icon: string;

    title: string;

    showMenu: boolean;

    path: string;

    component: string;

    children: Array<AppMenu>;
}