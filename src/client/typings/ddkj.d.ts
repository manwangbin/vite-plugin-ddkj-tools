declare namespace Ddkj {

    interface Page {

        icon?: string;

        name: string;

        title: string;

        index: number;

        path?: string;

        developed?: boolean;

        children?: Array<Page>;
    }
}