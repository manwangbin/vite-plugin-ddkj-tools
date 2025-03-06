<script setup lang="ts">
import { Icon } from '@iconify/vue/dist/iconify.js';
import { Input } from 'ant-design-vue';

const props = withDefaults(defineProps<{edit:boolean}>(), {edit: true});
</script>

<template>
    <div class="flex flex-row justify-between items-center sender">
        <Input class="input" :disabled="!props.edit"/>
        <div class="tag">
            <Icon :icon="props.edit ? 'tabler:send' : 'eos-icons:loading'" />
        </div>
    </div>
</template>

<style lang="less" scoped>
.sender {
    background-color: #fff;
    border-radius: 4px;
    font-size: 13px;
    
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

    .tag {
        color: @primary-color;
        font-size: 20px;
    }
}
</style>