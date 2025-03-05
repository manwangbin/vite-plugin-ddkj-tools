<script setup lang="ts">
import { computed, Ref, ref } from 'vue';
import { useResizeObserver } from "@vueuse/core";
import { Icon } from '@iconify/vue';
import { Tooltip, Input, Divider, ConfigProvider, theme, message } from 'ant-design-vue';
import MenuDialog from '../menu/MenuDialog.vue';
import ModalPage from '../modal/ModalPage.vue';
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import DdkjService, { STATUS } from './ddkj.service';
import Chatbox from '@/client/components/chatbox.vue';
import 'virtual:uno.css';
import TaskCreate from '@/client/service/sse/modal/taskCreateResult';
import { registSseHandler } from '@/client/api/ws.api';

const screenWidth = ref(document.body.clientWidth);
const screenHeight = ref(document.body.clientHeight);
window.onresize = () => {
  return (() => {
    screenWidth.value = document.body.clientWidth;
    screenHeight.value = document.body.clientHeight;
  })();
};

const service = new DdkjService();

const connted = computed(() => service.state.status === STATUS.CONNECTED || service.state.status === STATUS.REQUESETNEWTASK);
const modalDialog = ref();


const taskCreateHandler = (event: any) => {
  if (!event.data) {
    return;
  }

  const taskCreate = event.data as TaskCreate;
  if (taskCreate.type === "Modal" && modalDialog.value) {
    modalDialog.value.openModalDialog();
  }
}

registSseHandler("TaskCreate", taskCreateHandler);

service.ddkjLogin()
  .then(() => console.log("login success"))
  .catch(error => message.error(error.msg || "服务器错误！"));

const toolbar = ref();
const toolbarWidth: Ref<number> = ref(12);
useResizeObserver(toolbar, (entries: any) => {
  const entry = entries[0]
  const { width } = entry.contentRect
  toolbarWidth.value = width + 24;
});

const toolbarLeft = computed(() => {
  let left = (screenWidth.value - toolbarWidth.value) / 2;
  if (left < 0) {
    left = 0;
  }
  return `${left}px`;
});

const toolbarAnimationClass = computed(() => {
  if (service.state.status === STATUS.CONNECTIING) {
    return 'tool-connecting';

  } else if (service.state.status === STATUS.RESPONSEING) {
    return 'toolbar-aiing';

  }

  return '';
})

const menuDialog = ref();
function openTreeDialog() {
  if (menuDialog.value) {
    menuDialog.value.openMenu();
  }
}

function openModalDialog() {
  if (modalDialog.value) {
    modalDialog.value.openModalDialog();
  }
}

function onModalClose() {
}

function onPromptInputHandler() {
  service.onInputPressEnter();
}

</script>

<template>
  <ConfigProvider :locale="zhCN" :theme="{
    algorithm: theme.darkAlgorithm,
    token: {
      colorPrimary: '#177cb0',
    },
  }">
    <div ref="toolbar" :class="['toolbar', toolbarAnimationClass]">
      <Chatbox v-if="service.state.status === STATUS.RESPONSEING && service.session"
        :title="service.session.state.title || '新的对话'" :msgs="service.session.allMsgs.value" class="chat-box" />

      <div class="flex flex-row justify-start items-center gap-2 ddkj-loading"
        v-if="service.state.status === STATUS.CONNECTIING">
        <div class="wake"></div>
        <span>唤醒开发组...</span>
      </div>

      <div v-else-if="connted" class="flex flex-row items-center chat">
        <Icon icon="hugeicons:ai-chat-02" class="logo" />

        <Input v-model:value="service.state.inputContext" class="flex-1 input" :bordered="false" placeholder="请输入指令"
          :disabled="service.state.status !== STATUS.CONNECTED" @pressEnter="onPromptInputHandler" />

        <Divider type="vertical" />

        <div v-if="service.state.status === STATUS.REQUESETNEWTASK">
          <Icon icon="svg-spinners:90-ring-with-bg" />
        </div>

        <div v-else class="flex flex-row justify-end items-center gap-2">
          <Tooltip>
            <template #title>数据模型</template>
            <div class="flex flex-row justify-center items-center action zl" @click="openModalDialog">
              <Icon icon="fluent:form-24-regular" />
            </div>
          </Tooltip>

          <Tooltip>
            <template #title>配置菜单</template>
            <div class="flex flex-row justify-center items-center action dz" @click="openTreeDialog">
              <Icon icon="icon-park-outline:tree-list" />
            </div>
          </Tooltip>

          <Tooltip>
            <template #title>页面设计</template>
            <div class="flex flex-row justify-center items-center action wj" @click="openTreeDialog">
              <Icon icon="qlementine-icons:page-setup-16" />
            </div>
          </Tooltip>
        </div>
      </div>

      <MenuDialog ref="menuDialog" />
      <ModalPage ref="modalDialog" :screen-height="screenHeight" :ai-edit="service.state.status === STATUS.RESPONSEING"
        @close="onModalClose" />
    </div>
  </ConfigProvider>
</template>

<style lang="less" scoped>
@keyframes ddkj-glow {
  0% {
    box-shadow: 0px 0px 10px #eacd7688;
  }

  25% {
    box-shadow: 0px 0px 20px #eacd7688;
  }

  50% {
    box-shadow: 0px 0px 30px #eacd7688;
  }

  75% {
    box-shadow: 0px 0px 15px #eacd7688;
  }

  100% {
    box-shadow: 0px 0px 0px #eacd7688;
  }
}

@keyframes ddkj-chat-animation {
  0% {
    box-shadow: inset 0px 1px 6px #eacd7688;
  }

  25% {
    box-shadow: inset -1px 0px 6px #eacd7688;
  }

  50% {
    box-shadow: inset 0px -1px 6px #eacd7688;
  }

  75% {
    box-shadow: inset 1px 0px 6px #eacd7688;
  }

  100% {
    box-shadow: inset 0px 1px 6px #eacd7688;
  }
}

.toolbar-aiing {
  bottom: 0px !important;
  animation: ddkj-glow 3s ease-out infinite;
}

.tool-connecting {
  padding: 6px 10px !important;
  border-radius: 10px 10px 0px 0px !important;
  font-size: 13px;
  color: red;
  bottom: 0px !important;
}

.toolbar {
  --toolbarLeft: v-bind(toolbarLeft);
  position: fixed;
  left: var(--toolbarLeft);
  bottom: 10px;
  width: fit-content;
  height: fit-content;

  background: @color-background;
  border-radius: 3px;
  box-shadow: 0px 0px 10px #eacd7688;
  border: 1px solid #f2fdff88;
  padding: 4px;
  z-index: 99999;
  transition: all 0.5s;

  .chat-box {
    width: 90vw;
  }

  .ddkj-loading {
    width: fit-content;

    .wake {
      width: 20px;
      aspect-ratio: 1;
      color: #ce0800;
      border: 2px solid;
      box-sizing: border-box;
      border-radius: 50%;
      background-color: #f0f0f0 !important;
      background:
        radial-gradient(circle 2px, #000 95%, #0000),
        linear-gradient(180deg, #000 50%, #0000 0) center/1px 70%,
        linear-gradient(90deg, #000 50%, #0000 0) center/50% 2px;
      background-repeat: no-repeat;
      position: relative;
      animation: l9 1s infinite;
    }

    .wake:before,
    .wake:after {
      content: "";
      position: absolute;
      border-radius: 8px 8px 0 0;
      inset: -7px calc(50% - 4px);
      transform: rotate(40deg);
      background:
        linear-gradient(currentColor 0 0) top /100% 4px,
        linear-gradient(currentColor 0 0) bottom/2px 4px;
      background-repeat: no-repeat;
    }

    .wake:after {
      transform: rotate(-40deg);
    }

    @keyframes l9 {

      0%,
      70%,
      100% {
        transform: translateY(0) rotate(0)
      }

      75%,
      85%,
      95% {
        transform: translateY(-3px) rotate(10deg)
      }

      80%,
      90% {
        transform: translateY(-3px) rotate(-10deg)
      }
    }
  }

  .chat-ani {
    animation: ddkj-chat-animation 3s ease-out infinite;
  }

  .chat {
    width: 580px;
    height: 30px;
    line-height: 30px;
    padding: 0px 6px;
    background-color: #fff;
    border-radius: 4px;
    font-size: 13px;

    .logo {
      font-size: 28px;
      color: @color-primary;
    }

    .input {
      flex: 1;
      color: black;
    }

    input::placeholder {
      color: gray;
    }

    .input-disable::placeholder {
      color: red;
    }

    .input-aitip {
      color: @color-primary;
    }

    .stop-btn {
      cursor: pointer;
      color: @color-primary;
    }

    .cytag {
      cursor: pointer;
    }

    .action {
      cursor: pointer;
      padding: 4px;
      font-size: 18px;
      background: @color-primary;
      border-radius: 4px;
      color: #fff;
    }

    .bl {
      background-color: #4b5cc4;
    }

    .zl {
      background-color: #3b2e7e;
    }

    .dz {
      background-color: #574266;
    }

    .wj {
      background-color: #a78e44;
    }
  }
}
</style>