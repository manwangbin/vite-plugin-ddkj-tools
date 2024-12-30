<script setup lang="ts">
import { Drawer, Tree } from 'ant-design-vue';
import { reactive } from 'vue';

interface MenuState {
    open: boolean;
    loading: boolean;
}

const menuState = reactive({
    open: false,
    loading: false
} as MenuState);

function openMenu() {
    menuState.open = true;
    console.log("open menu");

}

defineExpose({
    openMenu
})
</script>

<template>
    <Drawer title="系统菜单" width="600px" placement="left" v-model:open="menuState.open" :maskClosable="false" footer=""
        :mask="false" rootClassName="menuDraw">
        <Tree />
    </Drawer>
</template>

<style lang="less" scoped>
.menuDraw {
    background: @color-background;
}
</style>