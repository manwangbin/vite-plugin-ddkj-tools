<script setup lang="ts">
import { Modal, Table, Tree } from 'ant-design-vue';
import { TreeProps } from 'ant-design-vue/es/vc-tree';
import { reactive } from 'vue';

interface ModalDialogState {
    open: boolean;
    loading: boolean;
    treeData: TreeProps['treeData'];
}

const fieldColumns = [
    {}
];

const modalState = reactive({
    open: false,
    loading: false
} as ModalDialogState);

const openModalDialog = () => {
    modalState.open = true;
}

defineExpose({
    openModalDialog
})
</script>

<template>
    <Modal size="small" width="100%" v-model:open="modalState.open" title="数据模型" wrap-class-name="full-modal" footer=""
        :centered="true">
        <div class="context">
            <Tree style="width: 280px; height: 400px; border: 1px solid #f0f0f0; border-radius: 6px;" :height="400" :tree-data="modalState.treeData"></Tree>
            <Table class="table" :columns="fieldColumns"></Table>
        </div>
    </Modal>
</template>

<style lang="less" scoped>
.full-modal {
    .ant-modal {
        top: 0;
        padding-bottom: 0;
        margin: 0;
    }

    .tree {
        width: 280px;
        height: 400px;
        border: 1px solid #f0f0f0;
        border-radius: 6px;
    }

    .context {
        display: flex;
        flex-direction: row;
        gap: 6px;
        width: 100%;
        height: calc(100vh - 100px);

        .table {
            flex: 1;
            height: 400px;
        }
    }
}
</style>