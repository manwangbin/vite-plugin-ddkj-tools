import type { AppRouteModule } from 'vue-router';
import AppMenu from '../api/modal/app-menu';
import { useDdkjToolStore } from '../store/ddkj.store';

// Turn background objects into routing objects
// 将背景对象变成路由对象
export function transformObjToRoute(menus: AppMenu[]): AppRouteModule[] {
  const appRouters = new Array<AppRouteModule>();
  if (menus && menus.length > 0) {
    menus.forEach(menu => {
      const component = menu.component as string;
      if (component) {
        const route = transformItem(menu);
        if (menu.children) {
          const childrenRoutes = asyncImportRoute(menu.code, menu.children);
          if (childrenRoutes) {
            route.children = [...childrenRoutes];
          }
        }

        appRouters.push(route);

      } else if (menu.children) {
        const route = transformItem({ ...menu, component: 'LAYOUT' });
        const childrenRoutes = asyncImportRoute(menu.code, menu.children);
        if (childrenRoutes) {
          route.children = [...childrenRoutes];
        }

        appRouters.push(route);

      }
    });
  }
  return appRouters;
}

// Dynamic introduction
function asyncImportRoute(parent: string, menus: AppMenu[] | undefined): Array<AppRouteModule> | undefined {
  if (!menus) return undefined;

  const children: Array<AppRouteModule> = [];
  menus.forEach(menu => {
    const item = transformItem(menu, parent);
    if (menu.children) {
      const childrenRoutes = asyncImportRoute(menu.code, menu.children);
      if (childrenRoutes) {
        item.children = [...childrenRoutes];
      }
    }
    children.push(item);
  });

  return children;
}

function transformItem(item: AppMenu, parent?: string): AppRouteModule {
  const route = { name: item.code, path: item.path, meta: { title: item.title, icon: item.icon } } as AppRouteModule;
  const { component } = item;

  if (component) {
    const layoutFound = component.toUpperCase();
    if (layoutFound === 'LAYOUT') {
      const ddkjToolStore = useDdkjToolStore();
      route.component = ddkjToolStore.layoutModules['./layouts/base-layout/index.vue']
    } else {
      route.component = dynamicImport(component as string);
    }
  }

  if (parent) {
    route.name = parent + "_" + item.code;
  }

  return route;
}

function dynamicImport(component: string) {
  const ddkjToolStore = useDdkjToolStore();

  const matchKeys = ddkjToolStore.viewModuleKeys.filter(key => {
    const k = key.replace('./views', '');
    const startFlag = component.startsWith('/');
    const endFlag = component.endsWith('.vue') || component.endsWith('.tsx');
    const startIndex = startFlag ? 0 : 1;
    const lastIndex = endFlag ? k.length : k.lastIndexOf('.');
    return k.substring(startIndex, lastIndex) === component;
  });
  if (matchKeys?.length > 0) {
    const matchKey = matchKeys[0];
    return ddkjToolStore.dynamicViewsModules[matchKey];
  }

  return ddkjToolStore.layoutModules['./layouts/blank-layout/index.vue'];
}
