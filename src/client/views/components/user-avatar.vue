<script setup lang="ts">
import { Avatar } from 'ant-design-vue';
import { UserOutlined } from '@ant-design/icons-vue';
import { useDdkjToolStore } from '@/client/store/ddkj.store';

defineOptions({
  name: 'UserAvatar'
});

const toolStore = useDdkjToolStore();
</script>

<template>
  <div class="flex flex-row flex-center gap-8px">
    <Avatar size="small">
      <template #icon>
        <UserOutlined />
      </template>
    </Avatar>
    {{ toolStore.userInfo.name }}
  </div>
</template>

<style lang="less" scoped>
.avatar {
  cursor: pointer;
  font-family: zylx;
  font-size: 18px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 4px;
  border-radius: 8px;
  transition: all 0.5s ease-in-out;

  img {
    width: 20px;
    height: 20px;
  }

  @keyframes typing {
    from {
      width: 0;
    }

    to {
      width: v-bind(animationLength);
    }
  }

  .content {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: none;
  }

  .input-animation {
    animation: typing v-bind(animationDuration) steps(v-bind(stepNum), end), step-end 2s infinite;
  }

  &:hover {
    background-color: #d6ecf066;
    box-shadow: 0px 0px 2px #f2ecde;
  }
}

// .avatar-empty {
//   width: 250px;
// }</style>
