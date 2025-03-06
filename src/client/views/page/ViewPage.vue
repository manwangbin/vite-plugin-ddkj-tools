<script setup lang="ts">
import { Modal } from 'ant-design-vue';
import Sender from '@/client/components/ai/sender.vue'
import { registSseHandler, removeRegistHandler } from '@/client/api/ws.api';
import DdkjService from '../ddkj.service';
import Bubble from '@/client/components/ai/bubble.vue';
import { reactive } from 'vue';

interface ModalState {
    open: boolean;
}
const modalState:ModalState = reactive({open: false});
const emit = defineEmits(['close']);
const service = DdkjService.inject();

const aiUpdateModal = (event: any) => {
    if (event.data) {

    }
}

const openModalDialog = () => {
    if (!modalState.open) {
        registSseHandler("Modal", aiUpdateModal);
    }

    modalState.open = true;
}

const onClose = () => {
    removeRegistHandler("Modal", aiUpdateModal);
    emit('close');
}

defineExpose({
    openModalDialog
})
</script>

<template>
    <Modal size="small" width="100%" v-model:open="modalState.open" title="页面设计" wrap-class-name="ddkj-data-modal"
        footer="" :centered="true" :mask="false" @cancel="onClose">
        <div class="context">
            <div class="left">

            </div>

            <div class="right">
                <div class="msgbox">
                    <Bubble :role="item.role" :msg="item.content" :end="item.finished" v-for="(item, index) in service.session?.allMsgs.value"  :key="index" />
                </div>
                
                <Sender :edit="true" />
            </div>
        </div>
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

        .ant-modal-close {
            top: 12px !important;
        }

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

    .context {
        display: flex;
        flex-direction: row;
        gap: 1px;
        width: 100%;
        height: calc(100vh - 50px);

        .left {
            display: flex;
            flex-direction: column;
            flex: 1;
            height: calc(100vh - 50px);
            border-radius: 4px 0px 0px 4px;
            background-color: #141414;

            .tree {
                flex: 1;
                width: 240px;
                overflow: auto;
                padding: 6px;
                border-radius: 0px 0px 4px 4px;
            }
        }

        .right {
            width: 400px;
            padding: 0px 10px;
            border-radius: 0px 4px 4px 0px;
            background-color: #141414;
            display: flex;
            flex-direction: column;

            .msgbox {
                overflow-y: auto;
                flex: 1;
            }

        }
    }
}
</style>