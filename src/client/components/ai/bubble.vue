<script setup lang="ts">
import { Avatar } from 'ant-design-vue';
import { Icon } from '@iconify/vue';

interface Prop {
  role: string;
  msg: string;
  end: boolean;
}

const props = defineProps<Prop>();
</script>

<template>
  <div class="bubble-container  justify-start" v-if="props.role === 'assistant'">
    <Avatar class="avatar">
      <template #icon>
        <span class="anticon">
          <Icon icon="hugeicons:ai-chat-02" />
        </span>
      </template>
    </Avatar>
    <div class="bubble receive" :class="{'reasoning' : !props.end}">
      <div class="msg">{{ props.msg }}</div>
      <div class="flex flex-row justify-between item-center controls" v-show="!props.end">
        <div>正在思考</div>
        <div>
          <Icon icon="svg-spinners:90-ring-with-bg" />
        </div>
      </div>
    </div>
  </div>

  <div class="bubble-container justify-end" v-else-if="props.role === 'user'">
    <div class="bubble send">
      <div class="msg">{{ props.msg }}</div>
    </div>
  </div>

  <div class="system-tip" v-else>
    {{ props.msg }}
  </div>
</template>

<style lang="less" scoped>
.bubble-container {
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 12px;

  .avatar {
    z-index: 10;
    margin-top: 4px;
    background-color: @color-primary;
  }

  .bubble {
    min-width: 60px;
    position: relative;
    padding: 10px 12px;
    font-size: 12px;
    line-height: 18px;
    min-height: 18px;
    color: #000;
    background: #fff;
    border: 1px solid #f0f0f0;
    border-radius: 10px;
    align-self: flex-start;
    max-width: calc(100% - 100px);
    text-align: left;

    .to {
      color: blue;
      padding: 0px 4px;
      cursor: pointer;
    }

    .send {
      color: #000000f0;
      padding: 0px 4px;
      cursor: pointer;
    }

    .controls {
      padding-top: 6px;
      font-size: 10px;
      color: @color-primary;
      line-height: 14px;
    }
  }

  .reasoning {
    padding-bottom: 4px !important;
  }

  .receive {
    &::before {
      content: "";
      position: absolute;
      top: 10px;
      height: 25px;
      left: -10px;
      width: 23px;
      background-color: #fff;
      border-bottom-right-radius: 16px 14px;
    }

    &::after {
      content: "";
      position: absolute;
      top: 10px;
      height: 25px;
      left: -26px;
      width: 26px;
      background-color: #F0F0F0;
      border-bottom-right-radius: 14px;
    }
  }

  .send {
    &::before {
      content: "";
      position: absolute;
      top: 10px;
      height: 25px;
      right: -10px;
      width: 23px;
      background-color: #fff;
      border-bottom-left-radius: 16px 14px;
    }

    &::after {
      content: "";
      position: absolute;
      top: 10px;
      height: 25px;
      right: -26px;
      width: 26px;
      background-color: #F0F0F0;
      border-bottom-left-radius: 14px;
    }
  }

  .system-tip {
    color: #000000f0;
    font-size: 11px;
    width: 100%;
    line-height: 20px;
    text-align: center;
  }
}
</style>
