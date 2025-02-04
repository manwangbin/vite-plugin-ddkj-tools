<script setup lang="ts">
import modalApi from '@/client/service/api/modal.api';
import { ResultEnum } from '@/client/service/request/vaxios';
import { Modal, Table, Tooltip, Tree } from 'ant-design-vue';
import { computed, reactive, ref } from 'vue';
import { Icon } from '@iconify/vue';
import ModalTreeNode from '@/client/service/api/modal/modal-tree-node';
import EditModalDialog from './EditModalDialog.vue';

interface ModalDialogState {
    open: boolean;
    loading: boolean;
    treeData: Array<ModalTreeNode>;
}

const modalState = reactive({
    open: false,
    loading: false
} as ModalDialogState);

const emit = defineEmits(['close']);
const fieldColumns = [
    {}
];

const categoryTree = computed(() => {
    const categryArray = [];
    if (modalState.treeData) {
        for (let i = 0; i < modalState.treeData.length; i++) {
            const item = copyNode(modalState.treeData[i]);
            if (item) {
                categryArray.push(item);
            }
        }
    }

    return categryArray;
});

const copyNode = (item: ModalTreeNode) => {
    if (item.children && item.children.length > 0) {
        const copy = { key: item.key, title: item.title } as ModalTreeNode;
        for (let i = 0; i < item.children.length; i++) {
            const child = copyNode(item.children[i]);
            if (child) {
                if (!copy.children) {
                    copy.children = [];
                }

                copy.children.push(child);
            }
        }
        return copy;
    }
}

const openModalDialog = () => {
    modalState.open = true;
    modalApi.getModalTrees(10).then(res => {
        if (res.state === ResultEnum.SUCCESS && res.data) {
            modalState.treeData = res.data;
        }
    });
}

const onClose = () => {
    emit('close');
}

const editModalDialog = ref();
const onNewModal = () => {
    if (editModalDialog.value) {
        editModalDialog.value.openNewDialog();
    }
}

defineExpose({
    openModalDialog
})
</script>

<template>
    <Modal size="small" width="100%" v-model:open="modalState.open" title="数据模型" wrap-class-name="ddkj-data-modal" footer=""
        :centered="true" @cancel="onClose">
        <div class="context">
            <div class="left">
                <div class="toolbar">
                    <Tooltip>
                        <template #title>新建数据模型</template>
                        <div class="flex flex-row justify-center items-center action" @click="onNewModal">
                            <Icon icon="qlementine-icons:new-16" />
                        </div>
                    </Tooltip>

                    <Tooltip>
                        <template #title>刷新</template>
                        <div class="flex flex-row justify-center items-center action" @click="openModalDialog">
                            <Icon icon="hugeicons:reload" />
                        </div>
                    </Tooltip>
                </div>
                <Tree class="flex-1 tree" :tree-data="modalState.treeData" :show-line="true" :show-icon="true"
                    :default-expand-all="true" :auto-expand-parent="true" :block-node="true" :draggable="true" />
            </div>

            <Table class="table" :columns="fieldColumns"></Table>
        </div>

        <EditModalDialog ref="editModalDialog" :categories="categoryTree" />
    </Modal>
</template>

<style lang="less">
.ddkj-data-modal {
    .ant-modal {
        max-width: calc(100% - 20px);
        top: 0;
        padding-bottom: 0;
        margin: 0;

        .ant-modal-content {
            padding: 10px !important;
        }
    }

    .left {
        display: flex;
        flex-direction: column;
        height: calc(100vh - 70px);
        border: 1px solid;
        border-radius: 4px;

        .toolbar {
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            align-items: center;
            gap: 10px;
            padding: 0px 6px;
            height: 30px;
            margin-bottom: 1px;
            background-color: #141414;

            .action {
                cursor: pointer;
                padding: 4px;
                font-size: 18px;
                border-radius: 4px;
                color: @color-primary;
            }
        }

        .tree {
            flex: 1;
            width: 240px;
            overflow: auto;
            padding: 6px;
        }
    }

    .context {
        display: flex;
        flex-direction: row;
        gap: 6px;
        width: 100%;
        height: calc(100vh - 70px);

        .table {
            flex: 1;
            min-height: 400px;
        }
    }
}
</style>