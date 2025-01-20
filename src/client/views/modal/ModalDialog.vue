<script setup lang="ts">
import { DirectoryTree, Modal, Table } from 'ant-design-vue';
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
    <Modal v-model:open="modalState.open" title="数据模型" width="100%" wrap-class-name="full-modal" footer="">
        <div class="flex flex-row wh-full">
            <DirectoryTree :tree-data="modalState.treeData" class="tree"></DirectoryTree>
            <Table class="table" :columns="fieldColumns"></Table>
        </div>
    </Modal>
</template>

<style lang="less" scoped>
.full-modal {
    .ant-modal {
        max-width: 100%;
        top: 0;
        padding-bottom: 0;
        margin: 0;
    }

    .ant-modal-content {
        display: flex;
        flex-direction: column;
        height: calc(100vh);
    }

    .ant-modal-body {
        flex: 1;
    }

    .context {
        display: flex;
        flex-direction: row;
        width: 100%;

        .tree {
            width: 260px;
        }

        .table {
            flex: 1;
        }
    }
}
</style>