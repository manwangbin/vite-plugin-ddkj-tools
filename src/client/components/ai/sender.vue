<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { Input } from 'ant-design-vue';

const props = withDefaults(defineProps<{ edit: boolean }>(), { edit: true });
</script>

<template>
    <div class="flex flex-row justify-between items-center sender">
        <Input class="input" :bordered="false" :disabled="!props.edit" />
        <div class="flex flex-col justify-center items-center tag">
            <Icon :icon="props.edit ? 'tabler:send' : 'eos-icons:loading'" />
        </div>
    </div>
</template>

<style lang="less" scoped>
.sender {
    border-radius: 4px;
    font-size: 13px;
    background-color: #fff;
    box-shadow: 0px 0px 10px #eacd7688;
    border: 1px solid #000;

    .input {
        flex: 1;
        color: black;
        line-height: 32px;
    }

    input::placeholder {
        color: gray;
    }

    .input-disable::placeholder {
        color: red;
    }

    .tag {
        padding: 0px 10px;
        width: fit-content;
        height: fit-content;
        cursor: pointer;
        color: @ddkj-primary;
        font-size: 20px;
    }
}
</style>