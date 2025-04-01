<script setup lang="ts">
import { Modal } from 'ant-design-vue';
import Sender from '@/client/components/ai/sender.vue'
import DdkjService from '../ddkj.service';
import Bubble from '@/client/components/ai/bubble.vue';
import { reactive } from 'vue';
import { registSseHandler, removeRegistHandler } from '@/client/api/ws.api';

interface ModalState {
    open: boolean;
}
const modalState:ModalState = reactive({open: false});
const emit = defineEmits(['close']);
const service = DdkjService.inject();
console.log("sevice", service);


const aiUpdateModal = (event: any) => {
    if (event.data) {

    }
}

const openDialog = () => {
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
    openDialog
})
</script>

<template>
    <Modal size="small" width="100%" v-model:open="modalState.open" title="页面设计" wrap-class-name="ddkj-view"
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
.ddkj-view {
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
        gap: 2px;
        width: 100%;
        height: calc(100vh - 50px);

        .left {
            display: flex;
            flex-direction: column;
            flex: 1;
            height: calc(100vh - 50px);
            border-radius: 4px;
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
            width: 360px;
            padding: 10px;
            border-radius: 4px;
            border: 1px solid #424242;
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