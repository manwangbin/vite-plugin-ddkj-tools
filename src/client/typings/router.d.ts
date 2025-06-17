import type { defineComponent } from 'vue';
import 'vue-router';

declare module 'vue-router' {
  interface RouteMeta {
    /**
     * Title of the route
     *
     * It can be used in document title
     */
    title: string;
    /**
     * I18n key of the route
     *
     * It's used in i18n, if it is set, the title will be ignored
     */
    i18nKey?: App.I18n.I18nKey;

    /** Whether to cache the route */
    keepAlive?: boolean;
    /**
     * Is constant route
     *
     * Does not need to login, and the route is defined in the front-end
     */
    constant?: boolean;
    /**
     * Iconify icon
     *
     * It can be used in the menu or breadcrumb
     */
    icon?: string;
    /**
     * Local icon
     *
     * In "src/assets/svg-icon", if it is set, the icon will be ignored
     */
    localIcon?: string;
    /** Router order */
    order?: number;
    /** The outer link of the route */
    href?: string;
    /** Whether to hide the route in the menu */
    hideMenu?: boolean;
    /**
     * The menu key will be activated when entering the route
     *
     * The route is not in the menu
     *
     * @example
     *   the route is "user_detail", if it is set to "user_list", the menu "user_list" will be activated
     */
    activeMenu?: string;
    /** By default, the same route path will use one tab, if set to true, it will use multiple tabs */
    multiTab?: boolean;
    /** If set, the route will be fixed in tabs, and the value is the order of fixed tabs */
    fixedIndexInTab?: number;
  }

  export type Component<T = any> =
    | ReturnType<typeof defineComponent>
    | (() => Promise<typeof import('*.vue')>)
    | (() => Promise<T>);

  export interface AppRouteRecordRaw extends Omit<RouteRecordRaw, 'children' | 'meta'> {
    name: string;
    meta: RouteMeta;
    component?: Component | string;
    children?: AppRouteRecordRaw[];
    props?: Recordable;
    fullPath?: string;
    actions?: string[];
  }

  // export type AppRouteModule = RouteModule | AppRouteRecordRaw;
  export type AppRouteModule = AppRouteRecordRaw;
}
