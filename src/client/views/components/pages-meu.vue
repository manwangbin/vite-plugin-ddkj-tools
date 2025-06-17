<script setup lang="ts">
import { Spin, Tree } from 'ant-design-vue';
import { onMounted, reactive } from 'vue';
import DdkjService from '../ddkj.service';
import { RouteRecordRaw } from 'vue-router';
import { useDdkjToolStore } from '../../store/ddkj.store';
import { CarryOutOutlined } from '@ant-design/icons-vue';
import { ResultEnum } from '@/client/typings/requestType';

interface ComponentState {
    loading: boolean;
    pages: Array<Ddkj.Page>;
    pathMap: Map<string, string>;
}

const state: ComponentState = reactive({
    loading: true,
    pages: [],
    pathMap: new Map()
});

const formateRouter = (router: RouteRecordRaw): Ddkj.Page => {
    if (router.children && router.children.length > 0) {
        const children = router.children.map(item => formateRouter(item));
        return { name: router.name || router.path, title: router.meta?.title, path: router.path, children: children } as Ddkj.Page;

    } else {
        return { name: router.name?.toString() || router.path, title: router.meta?.title || router.path, path: router.path } as Ddkj.Page;

    }
}

const ddkjToolStore = useDdkjToolStore();
const service = DdkjService.inject();

const handleAddPage = (page: Ddkj.Page) => {
    if (page.path) {
        let path = page.path;
        const index = path.indexOf(":");
        if (index > -1) {
            path = path.substring(0, index);
        }

        state.pathMap.set(page.name, path);
    }
}

const initFramePage = () => {
    const framePages = {
        index: 0,
        name: 'ddkj-frame-pages',
        title: '通用页面',
        children: []
    } as Ddkj.Page;

    if (ddkjToolStore.router && ddkjToolStore.router.options && ddkjToolStore.router.options.routes) {
        for (var i = 0; i < ddkjToolStore.router.options.routes.length; i++) {
            const option = ddkjToolStore.router.options.routes[i];
            if (option.children) {
                for (var j = 0; j < option.children.length; j++) {
                    const page = formateRouter(option.children[j]);
                    framePages.children?.push(page);
                    handleAddPage(page);
                }

            } else {
                const page = formateRouter(option);
                framePages.children?.push(page);
                handleAddPage(page);

            }
        }
    }

    state.pages.push(framePages);

    loadServerPages();

}

const loadServerPages = () => {
    service.getAppMenus().finally(() => state.loading = false);
}

onMounted(() => {
    setTimeout(() => {
        initFramePage();
    }, 800);
})

const handleTreeSelected = (paths: any) => {
    if (!ddkjToolStore.router) {
        return;
    }

    if (!paths || paths.length === 0) {
        return;
    }

    const lastPage = paths[paths.length - 1];
    const url = state.pathMap.get(lastPage);
    if (url) {
        ddkjToolStore.router.push(url);
    }
}

</script>

<template>
    <div class="tree-loading" v-if="state.loading">
        <Spin />
    </div>
    <Tree v-else :show-icon="true" :show-line="true" :tree-data="state.pages" :fieldNames="{ key: 'name' }"
        :defaultExpandAll="true" @select="handleTreeSelected">
        <template><carry-out-outlined /></template>
    </Tree>
</template>

<style lang="less" scoped>
.tree-loading {
    width: 100%;
    height: 100%;
    min-height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}
</style>
