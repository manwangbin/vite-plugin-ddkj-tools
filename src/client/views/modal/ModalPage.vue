<script setup lang="ts">
import modalApi from '@/client/service/api/modal.api';
import { ResultEnum } from '@/client/service/request/vaxios';
import { Card, Modal, Tooltip, Tree, Button } from 'ant-design-vue';
import { computed, reactive, ref } from 'vue';
import { Icon } from '@iconify/vue';
import ModalTreeNode from '@/client/service/api/modal/modal-tree-node';
import DataForm from '@/client/service/api/modal/dataform';
import { Key } from 'ant-design-vue/es/_util/type';
import EditFieldDialog from './EditFieldDialog.vue';
import FormField from '@/client/service/api/modal/formfield';
import SseClient from '@/client/service/sse/sseClient.api';
import FieldTable from './components/FieldTable.vue';
import BaseInfoForm from './components/BaseInfoForm.vue';

interface Prop {
    screenHeight: number;
}

interface ModalDialogState {
    open: boolean;
    loading: boolean;
    treeData: Array<ModalTreeNode>;
    aiEdit: boolean;
    dataForm?: DataForm;
}

const modalState: ModalDialogState = reactive({
    open: false,
    loading: false,
    aiEdit: false
} as ModalDialogState);

const props = defineProps<Prop>();
const emit = defineEmits(['close']);

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

const modalFieldValues = computed(() => {
    if (modalState.dataForm) {
        return modalState.dataForm.fields;
    }

    return [];
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

const aiUpdateModal = (event: any) => {
    if (event.data) {
        modalState.dataForm = JSON.parse(event.data) as DataForm;
    }
}

const aiComplateHandler = () => {
    modalState.aiEdit = false;
}

const sseClient = SseClient.inject();
const openModalDialog = (newModal?: DataForm) => {
    modalState.open = true;
    modalApi.getModalTrees().then(res => {
        if (res.state === ResultEnum.SUCCESS && res.data) {
            modalState.treeData = res.data;
        }
    });

    if (newModal) {
        modalState.aiEdit = true;
        modalState.dataForm = newModal;
        sseClient.registerHandler("modalUpdate", aiUpdateModal);
        sseClient.registerHandler("complate", aiComplateHandler);
    }
}

const onClose = () => {
    sseClient.removeHandler("modalUpdate", aiUpdateModal);
    sseClient.removeHandler("complate", aiComplateHandler);
    emit('close');
}

const findNode = (categories: Array<string>, nodes: Array<ModalTreeNode>) => {
    if (categories && categories.length > 0 && nodes && nodes.length > 0) {
        let currentNode = undefined;
        let collections = nodes;
        for (let i = 0; i < categories.length; i++) {
            const findNodes = collections.filter((value) => value.key === categories[i]);
            if (findNodes && findNodes.length > 0) {
                currentNode = findNodes[0];
                collections = [];
                if (currentNode.children) {
                    collections = currentNode.children;
                }
            }
        }

        return currentNode;
    }
}

const onRefreshTree = () => {
    modalState.treeData = [];
    modalApi.getModalTrees().then(res => {
        if (res.state === ResultEnum.SUCCESS && res.data) {
            modalState.treeData = res.data;
        }
    });
}

const editModalDialog = ref();
const onNewModal = () => {
    if (editModalDialog.value) {
        editModalDialog.value.openNewDialog();
    }
}

const onTreeSelected = (keys: Key[], e: any) => {
    if (e) {
        const dataForm = e.node.dataRef.form as DataForm;
        if (dataForm) {
            if (dataForm.id) {
                modalApi.detail(dataForm.id).then((res) => {
                    if (res.state === ResultEnum.SUCCESS && res.data) {
                        modalState.dataForm = res.data;
                    }
                });
            } else {
                modalState.dataForm = dataForm;
            }
        }
    }
}

const basicForm = ref();
const onClickSave = () => {
    if (basicForm.value) {
        basicForm.value.getFormData((data: DataForm) => {
            const key = `form-${data.code}`;
            data.fields = modalFieldValues.value;
            
            const categoryNode = findNode(data.category, modalState.treeData);
            if (categoryNode) {
                if (!categoryNode.children) {
                    categoryNode.children = [];
                }
                categoryNode.children.push({ key, title: data.title, form: data });

            } else {
                modalState.treeData.push({ key, title: data.title, form: data });

            }
            modalState.dataForm = data;
        });
    }
}

const tableBodyHeight = computed(() => {
    return props.screenHeight - 350;
});

const editFieldDialog = ref();
const onClickNewField = () => {
    editFieldDialog.value.openDialog({ required: false, unique: false });
}

const onClickEditField = (field: FormField) => {
    editFieldDialog.value.openDialog(field);
}

const onClickDelField = (field: FormField) => {
    if (modalState.dataForm && modalState.dataForm.fields) {
        let index = modalState.dataForm.fields.findIndex((item) => item.code === field.code);
        if (index > -1) {
            modalState.dataForm.fields.splice(index, 1);
        }
    }
}

const onFieldDataSort = (event: { source: number, to: number }) => {
    if (modalState.dataForm && modalState.dataForm.fields) {
        const fields = [...modalState.dataForm.fields];
        const deleted = fields.splice(event.source, 1);
        if (event.to > event.source) {
            fields.splice((event.to - 1), 0, ...deleted);
        } else {
            fields.splice(event.to, 0, ...deleted);
        }

        modalState.dataForm.fields = [...fields];
    }
}

const onEditFieldOk = (field: FormField) => {
    if (modalState.dataForm) {
        if (!modalState.dataForm.fields) {
            modalState.dataForm.fields = [];
        }

        let index = modalState.dataForm.fields.findIndex((item) => item.code === field.code);
        if (index > -1) {
            modalState.dataForm.fields.splice(index, 1, field);
        } else {
            modalState.dataForm.fields.push(field);
        }
    }
}

defineExpose({
    openModalDialog
})
</script>

<template>
    <Modal size="small" width="100%" v-model:open="modalState.open" title="数据模型" wrap-class-name="ddkj-data-modal"
        footer="" :centered="true" :mask="false" @cancel="onClose">
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
                        <div class="flex flex-row justify-center items-center action" @click="onRefreshTree">
                            <Icon icon="hugeicons:reload" />
                        </div>
                    </Tooltip>
                </div>
                <Tree size="small" v-if="modalState.treeData?.length > 0" class="flex-1 tree"
                    :tree-data="modalState.treeData" :show-line="true" :show-icon="true" :default-expand-all="true"
                    :auto-expand-parent="true" :block-node="true" :draggable="true" @select="onTreeSelected" />
            </div>

            <Card size="small" class="right" v-if="modalState.dataForm"
                :title="`${modalState.dataForm.title}[${modalState.dataForm.code || ''}]`">
                <template #extra>
                    <div class="save-btn" @click="onClickSave">
                        <Icon icon="lucide-lab:save" style="font-size: 22px;" />
                    </div>
                </template>
                <div>
                    <BaseInfoForm ref="basicForm" :categories="categoryTree" :fields="modalFieldValues"
                        :form="modalState.dataForm" />

                    <div class="flex flex-row justify-between sub-title-bar">
                        <div class="title">属性列表</div>
                        <div><Button v-show="!modalState.aiEdit" size="small" type="primary"
                                @click="onClickNewField">创建新属性</Button>
                        </div>
                    </div>

                    <FieldTable class="table" :tree-data="modalState.treeData" :table-body-height="tableBodyHeight"
                        :fields="modalFieldValues" :ai-edit="modalState.aiEdit" @edit="onClickEditField"
                        @delete="onClickDelField" @sort="onFieldDataSort" />
                </div>
            </Card>
        </div>

        <EditFieldDialog ref="editFieldDialog" @ok="onEditFieldOk" />
    </Modal>
</template>

<style lang="less">
.ddkj-data-modal {
    overflow: hidden !important;

    .ant-modal {
        max-width: 100%;
        padding-bottom: 0;
        top: 0;
        margin: 0;

        .ant-modal-content {
            overflow: hidden;
            padding: 10px !important;
            border-radius: 0px !important;
            background: #1f1f1ff0 !important;

            .ant-modal-header {
                background: #1f1f1f00 !important;
            }
        }
    }

    .left {
        display: flex;
        flex-direction: column;
        width: 240px;
        height: calc(100vh - 50px);
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
            border-radius: 4px 4px 0px 0px;
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
            border-radius: 0px 0px 4px 4px;
        }
    }

    .context {
        display: flex;
        flex-direction: row;
        gap: 6px;
        width: 100%;
        height: calc(100vh - 50px);

        .right {
            width: 100%;

            .save-btn {
                font-size: 20px;
                color: @color-primary;
            }

            .base-form {
                .ant-form-item {
                    margin-bottom: 10px !important;
                }
            }

            .sub-title-bar {
                padding: 6px 0px;

                .title {
                    font-size: 14px;
                    font-weight: bold;
                }
            }

            .table {
                flex: 1;
                min-height: 10px;
                width: 100%;
            }
        }
    }
}
</style>