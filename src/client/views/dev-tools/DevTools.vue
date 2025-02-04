<script setup lang="ts">
import { computed, reactive, Ref, ref } from 'vue';
import { useResizeObserver } from "@vueuse/core";
import { Icon } from '@iconify/vue';
import { Tooltip, Input, Divider, ConfigProvider, theme } from 'ant-design-vue';
import MenuDialog from '../menu/MenuDialog.vue';
import ModalDialog from '../modal/ModalDialog.vue';
import zhCN from 'ant-design-vue/es/locale/zh_CN';

interface State {
  showToolbar: boolean;
}

const state: State = reactive({
  showToolbar: true
})

const screenWidth = ref(document.body.clientWidth);
const screenHeight = ref(document.body.clientHeight);
window.onresize = () => {
  return (() => {
    screenWidth.value = document.body.clientWidth;
    screenHeight.value = document.body.clientHeight;
  })();
};

const toolbar = ref();
const toolbarWidth: Ref<number> = ref(12);
useResizeObserver(toolbar, (entries: any) => {
  const entry = entries[0]
  const { width } = entry.contentRect
  toolbarWidth.value = width + 24;
  console.log("useResizeObserver", toolbar);
});

const toolbarLeft = computed(() => {
  let left = (screenWidth.value - toolbarWidth.value) / 2;
  if (left < 0) {
    left = 0;
  }

  console.log("left", screenWidth.value, toolbarWidth.value);

  return `${left}px`;
})

const menuDialog = ref();
function openTreeDialog() {
  if (menuDialog.value) {
    menuDialog.value.openMenu();
  }
}

const modalDialog = ref();
function openModalDialog() {
  if (modalDialog.value) {
    modalDialog.value.openModalDialog();
    state.showToolbar = false;
  }
}

function onModalClose() {
  state.showToolbar = true;
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
      <div ref="toolbar" class="flex flex-row justify-center items-center gap-2 toolbar">
        <Icon icon="hugeicons:ai-chat-02" class="logo" />
        <div class="flex flex-row items-center chat">
          <Input class="flex-1 input" :bordered="false" placeholder="请输入指令" />

          <!-- <div class="flex flex-row justify-end items-center">
          <span style="color: #666;padding-right: 6px;">常用</span>
          <Tag class="cytag" color="#f50" @click="openModalDialog">新数据管理</Tag>
        </div> -->

          <Divider type="vertical" />

          <div class="flex flex-row justify-end items-center gap-2">
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
      <ModalDialog ref="modalDialog" :screen-height="screenHeight" @close="onModalClose" />
    </div>
  </ConfigProvider>
</template>

<style lang="less" scoped>
.toolbar {
  --toolbarLeft: v-bind(toolbarLeft);
  position: fixed;
  left: var(--toolbarLeft);
  bottom: 10px;

  background: @color-background;
  border-radius: 6px;
  box-shadow: 0px 0px 4px #666666;
  padding: 6px;
  z-index: 99999;

  .logo {
    font-size: 26px;
    color: @color-primary;
  }

  .chat {
    height: 32px;
    line-height: 32px;
    padding: 0px 6px;
    background-color: #fff;
    border-radius: 4px;
    font-size: 13px;

    .input {
      width: 260px;
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