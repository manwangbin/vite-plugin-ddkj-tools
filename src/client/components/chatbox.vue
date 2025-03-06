<script setup lang="ts">
import Bubble from './bubble.vue';
import { Icon } from '@iconify/vue';
import { watch, ref } from 'vue';
import AiMessage from '../api/modal/aimessage';

const props = defineProps<{ title?: string, msgs: Array<AiMessage> }>();

watch(()=>props.msgs, () => scrollToBottom())

const chatbox = ref();
function scrollToBottom() {
  setTimeout(() => {
    chatbox.value.scrollTop = chatbox.value.scrollHeight;
  }, 20);
}
</script>

<template>
  <div class="chat-container">
    <div class="flex flex-row justify-between items-center title-bar">
      <div class="title">{{ props.title }}</div>
      <div class="loading-btn">
        <Icon icon="svg-spinners:90-ring-with-bg" />
      </div>
    </div>
    <div ref="chatbox" class="flex flex-col justify-start items-start gap-10px chatbox">
      <Bubble :role="item.role" :msg="item.content" :end="item.finished" v-for="(item, index) in props.msgs"  :key="index" />
    </div>
  </div>
</template>

<style lang="less" scoped>
.chat-container {
  .title-bar {
    width: 100%;
    color: #fffffff0;
    font-size: 20px;
    line-height: 30px;

    .title {
      font-size: 13px;
    }

    .loading-btn {
      cursor: pointer;
      font-size: 20px;
      width: fit-content;
      height: fit-content;
    }
  }

  .chatbox {
    width: calc(100% - 20px);
    height: 100%;
    background: #F0F0F0;
    padding: 10px 10px 30px 10px;
    border-radius: 6px 6px 0px 0px;
    overflow-y: auto;
    max-height: 200px;

    &::-webkit-scrollbar {
      display: none;
    }

    .message {
      padding-bottom: 20px;
    }

    .footer {
      position: absolute;
      background: #fff;
      border: 6px;
    }
  }
}
</style>
