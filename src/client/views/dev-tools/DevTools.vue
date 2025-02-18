<script setup lang="ts">
import { computed, reactive, Ref, ref } from 'vue';
import { useResizeObserver } from "@vueuse/core";
import { Icon } from '@iconify/vue';
import { Tooltip, Input, Divider, ConfigProvider, theme, message } from 'ant-design-vue';
import MenuDialog from '../menu/MenuDialog.vue';
import ModalPage from '../modal/ModalPage.vue';
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import toolApi from '@/client/service/api/tool.api';
import { ResultEnum } from '@/client/service/request/vaxios';
import SseClient from '@/client/service/sse/sseClient.api';
import 'virtual:uno.css'
import DataForm from '@/client/service/api/modal/dataform';

interface State {
  connected: boolean;
  showToolbar: boolean;
  inputContext: string;
  waitAiResponse: boolean;
}

const state: State = reactive({
  connected: false,
  inputContext: '',
  showToolbar: true,
  waitAiResponse: false
})

const screenWidth = ref(document.body.clientWidth);
const screenHeight = ref(document.body.clientHeight);
window.onresize = () => {
  return (() => {
    screenWidth.value = document.body.clientWidth;
    screenHeight.value = document.body.clientHeight;
  })();
};


const modalDialog = ref();
const sseClient = new SseClient();
const aiCreateModalHandler = (event: any): void => {
  if (event.data && modalDialog.value) {
    modalDialog.value.openModalDialog(JSON.parse(event.data) as DataForm)
  }
}

const aiTipHandler = (event: any) => {
  if (event.data && modalDialog.value) {
    state.inputContext = event.data;
  }
}

const aiComplateHandler = () => {
  onClickStopResponse();
}
const sseConnect = () => {
  sseClient.connted().then((res) => {
    if (res.state === 0) {
      state.connected = true;
      sseClient.registerHandler("createModal", aiCreateModalHandler);
      sseClient.registerHandler("complate", aiComplateHandler);
      sseClient.registerHandler("tip", aiTipHandler);
    }
  });
}
const getUrlQueryParam = (name: string) => {
  let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
  let r = window.location.search.substr(1).match(reg); //获取url中"?"符后的字符串并正则匹配
  let context = '';
  if (r) context = r[2];
  return context ? context : '';
}

const ddkjLogin = (useParam?: boolean) => {
  const urlParam = getUrlQueryParam("ddkj");
  let token = useParam ? urlParam : sessionStorage.getItem("ddkjDesignToken");
  if (!token) {
    token = urlParam;
  }

  toolApi.login(token).then(res => {
    if (res.state === ResultEnum.SUCCESS && res.data) {
      sessionStorage.setItem('ddkjDesignToken', res.data.token);
      sseConnect();
    } else {
      sessionStorage.removeItem("ddkjDesignToken");
      ddkjLogin(true);
    }
  })
}

ddkjLogin();

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

const logoIcon = computed(() => {
  if (state.connected) {
    if (state.waitAiResponse) {
      return "svg-spinners:pulse-multiple";

    } else {
      return "hugeicons:ai-chat-02";

    }

  } else {
    return "line-md:uploading-loop";
  }
});

const inputClass = computed(() => {
  if (state.connected) {
    if (state.waitAiResponse) {
      return "input-aitip";
    } else {
      return "";
    }
  } else {
    return "input-disable";
  }
});

const menuDialog = ref();
function openTreeDialog() {
  if (menuDialog.value) {
    menuDialog.value.openMenu();
  }
}

function openModalDialog() {
  if (modalDialog.value) {
    modalDialog.value.openModalDialog();
    state.showToolbar = false;
  }
}

function onModalClose() {
  state.showToolbar = true;
}

function onInputPressEnter() {
  if (!state.connected) {
    message.error("还没有连接到服务器！")
    return;
  }

  if (state.inputContext && state.inputContext.length > 0) {
    state.waitAiResponse = true;
    toolApi.say(state.inputContext).then(res => {
      if (res.state !== ResultEnum.SUCCESS) {
        message.error(res.msg);
      }
    });
  }
}

function onClickStopResponse() {
  if (state.waitAiResponse = true) {
    state.inputContext = '';
    state.waitAiResponse = false;
  }
}
</script>

<template>
  <ConfigProvider :locale="zhCN" :theme="{
    algorithm: theme.darkAlgorithm,
    token: {
      colorPrimary: '#177cb0',
    },
  }">
    <div>
      <div ref="toolbar" :class="['toolbar', state.waitAiResponse ? 'toolbar-aiing' : '']">
        <div :class="['flex', 'flex-row', 'items-center', 'chat', state.waitAiResponse ? 'chat-ani':'']">
          <Icon :icon="logoIcon" class="logo" />

          <Input v-model:value="state.inputContext" :class="['flex-1', 'input', inputClass]" :bordered="false"
            :placeholder="state.connected ? '请输入指令' : '正在唤醒您的开发组...'" :disabled="!state.connected"
            @pressEnter="onInputPressEnter" />

          <Divider type="vertical" />

          <Tooltip v-if="state.waitAiResponse">
            <template #title>停止接收内容</template>
            <div class="flex flex-row justify-end items-center stop-btn" @click="onClickStopResponse">
              <Icon icon="mdi:stop-pause-outline" style="font-size: 22px;" />
            </div>
          </Tooltip>

          <div v-else-if="state.connected" class="flex flex-row justify-end items-center gap-2">
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
      </div>

      <MenuDialog ref="menuDialog" />
      <ModalPage ref="modalDialog" :screen-height="screenHeight" @close="onModalClose" />
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
  animation: ddkj-glow 3s ease-out infinite;
}

.toolbar {
  --toolbarLeft: v-bind(toolbarLeft);
  position: fixed;
  left: var(--toolbarLeft);
  bottom: 10px;

  background: @color-background;
  border-radius: 3px;
  box-shadow: 0px 0px 10px #eacd7688;
  border: 1px solid #f2fdff88;
  padding: 4px;
  z-index: 99999;

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