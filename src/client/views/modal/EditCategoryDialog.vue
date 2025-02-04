<script setup lang="ts">
import ModalTreeNode from '@/client/service/api/modal/modal-tree-node';
import { Cascader, Form, FormInstance, Input, Modal } from 'ant-design-vue';
import { FormItem, Rule } from 'ant-design-vue/es/form';
import { reactive, Ref, ref } from 'vue';

interface DialogState {
    open: boolean;
}

interface FormState {
    parent?: Array<string>;
    code?: string;
}

const props = defineProps<{categories: Array<ModalTreeNode>}>();
const dialogState: DialogState = reactive({
    open: false
})

const inputForm = ref<FormInstance>();
const formState: Ref<FormState> = ref({});
const rules: Record<string, Rule[]> = {
    code: [
        { required: true, message: "编号", trigger: "change" },
        { min: 2, max: 10, message: "编号长度存在2-10个字符之间", trigger: "blur" },
    ]
};
</script>

<template>
    <Modal size="small" :width="500" v-model:open="dialogState.open" title="数据分组">
        <Form ref="inputForm" :model="formState" :rules="rules" :labelCol="{ span: 2 }">
            <FormItem name="code" label="名称">
                <Cascader v-model:value="formState.parent" placeholder="请选择父节点" :options="props.categories"/>
            </FormItem>
            <FormItem name="code" label="名称">
                <Input v-model:value="formState.code" placeholder="请输入名称" show-count :minLength="2"
                    :maxlength="10" />
            </FormItem>
        </Form>
    </Modal>
</template>