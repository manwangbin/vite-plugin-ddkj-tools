<script setup lang="ts">
import FormField from '@/client/typings/modal/formfield';
import ModalTreeNode from '@/client/typings/modal/modal-tree-node';
import BooleanType from '@/client/typings/modal/type/boolean.type';
import DateType from '@/client/typings/modal/type/date.type';
import NumberType from '@/client/typings/modal/type/number.type';
import StringType from '@/client/typings/modal/type/string.type';
import StructType from '@/client/typings/modal/type/struct.type';
import { Col, Form, FormInstance, FormItem, Input, InputNumber, Modal, Row, Select, SelectOption, Switch, TreeSelect } from 'ant-design-vue';
import { Rule } from 'ant-design-vue/es/form';
import { reactive, Ref, ref } from 'vue';

interface DialogState {
    open: boolean;
    confirmLoading: boolean;
    edit: boolean;
}

interface Prop {
    treeData: Array<ModalTreeNode>;
}
const props = defineProps<Prop>();
const dialogState: DialogState = reactive({ open: false, confirmLoading: false, edit: false });

interface FormState {
    code?: string;
    label?: string;
    type?: string;
    maxLength?: number;
    rich?: boolean;
    decimal?: number;
    format?: string;
    fullName?: string;
    trueLabel?: string;
    falseLabel?: string;
    required: boolean;
    unique: boolean;
    help?: string;
}

const inputForm = ref<FormInstance>();
const formState: Ref<FormState> = ref({ required: false, unique: false });
const rules: Record<string, Rule[]> = {
    code: [
        { required: true, message: "清选择编号", trigger: "change" },
        { min: 2, max: 20, message: "编号长度存在2-20个字符之间", trigger: "blur" },
    ],
    label: [
        { required: true, message: "请填写名称", trigger: "change" },
        { min: 1, max: 20, message: "名称长度存在2-20个字符之间", trigger: "blur" },
    ],
    type: [
        { required: true, message: "请选择类型", trigger: "change" },
    ],
};

const allTypes: Array<{ value: string, label: string }> = [
    { value: 'String', label: '文本' },
    { value: 'Number', label: '数字' },
    { value: 'Boolean', label: '布尔' },
    { value: 'Date', label: '日期' },
    { value: 'Enum', label: '枚举' },
    { value: 'Struct', label: '外键' }
];

const openDialog = (field: FormField) => {
    formState.value = { code: field.code, label: field.label, type: field.type?.name, required: field.required, unique: field.unique };
    inputForm.value?.resetFields();
    dialogState.edit = field.type !== undefined && field.type !== null;
    dialogState.confirmLoading = false;

    dialogState.open = true;
}

const emit = defineEmits<{ ok: [value: FormField] }>();

const copyNode = (item: ModalTreeNode) => {
    if (item.children && item.children.length > 0) {
        const copy = { key: item.key, title: item.title } as ModalTreeNode;
        for (let i = 0; i < item.children.length; i++) {
            const child = copyNode(item.children[i]);
            if (child) {
                if (!copy.children) {
                    copy.children = [];
                }

                copy.children.push(child);
            }
        }
        return copy;
    }
}

const onOk = () => {
    dialogState.confirmLoading = true;
    if (inputForm.value) {
        inputForm.value
            .validate()
            .then(() => {
                const inputData = { ...formState.value } as any;
                if (inputData.type) {
                    if (inputData.type === 'String') {
                        const type = { name: inputData.type } as StringType;
                        type.maxLength = inputData.maxLength;
                        type.rich = inputData.rich;
                        type.format = inputData.format;
                        inputData.type = type;

                    } else if (inputData.type === 'Number') {
                        const type = { name: inputData.type } as NumberType;
                        type.decimal = inputData.decimal;
                        type.format = inputData.format;
                        inputData.type = type;

                    } else if (inputData.type === 'Date') {
                        const type = { name: inputData.type } as DateType;
                        type.format = inputData.format;
                        inputData.type = type;

                    } else if (inputData.type === 'Boolean') {
                        const type = { name: inputData.type } as BooleanType;
                        type.trueLabel = inputData.trueLabel;
                        type.falseLabel = inputData.falseLabel;
                        inputData.type = type;

                    } else if (inputData.type === 'Struct') {
                        const type = { name: inputData.type } as StructType;
                        type.fullName = inputData.fullName;
                        inputData.type = type;
                    }
                }
                emit('ok', inputData);
                dialogState.open = false;
            })
            .catch((err: any) => {
                console.error(err);
            })
            .finally(() => {
                dialogState.confirmLoading = false;
            });
    }
}

defineExpose({
    openDialog
})
</script>

<template>
    <Modal :width="820" v-model:open="dialogState.open" :title="dialogState.edit ? '修改数据模型' : '新建数据模型'"
        :maskClosable="false" :confirmLoading="dialogState.confirmLoading" @ok="onOk">
        <Form ref="inputForm" class="ddkj-editmodal-form" :model="formState" :rules="rules" :labelCol="{ span: 4 }">
            <Row :gutter="16">
                <Col :span="12">
                <FormItem name="code" label="编号">
                    <Input v-model:value="formState.code" placeholder="请填写编号" />
                </FormItem>
                </Col>

                <Col :span="12">
                <FormItem name="label" label="名称">
                    <Input v-model:value="formState.label" placeholder="请填写名称" />
                </FormItem>
                </Col>

                <Col :span="12">
                <FormItem name="type" label="类型">
                    <Select v-model:value="formState.type" placeholder="请选择类型" :options="allTypes" />
                </FormItem>
                </Col>

                <Col :span="12" v-if="formState.type === 'String'">
                <FormItem name="rich" label="富文本">
                    <Switch v-model:checked="formState.rich" />
                </FormItem>
                </Col>

                <Col :span="12" v-if="formState.type === 'String'">
                <FormItem name="maxLength" label="最大长度">
                    <InputNumber v-model:value="formState.maxLength" placeholder="请填写最大长度" style="width: 100%;" />
                </FormItem>
                </Col>

                <Col :span="12" v-if="formState.type === 'Number'">
                <FormItem name="decimal" label="小数精度">
                    <InputNumber v-model:value="formState.decimal" :options="allTypes" style="width: 100%;" />
                </FormItem>
                </Col>

                <Col :span="12" v-if="formState.type === 'String' || formState.type === 'Number'">
                <FormItem name="format" label="数据格式">
                    <Input v-model:value="formState.format" placeholder="请填写数据格式" />
                </FormItem>
                </Col>

                <Col :span="12" v-if="formState.type === 'Date'">
                <FormItem name="format" label="日期格式">
                    <Select v-model:value="formState.format" placeholder="请选择日期格式">
                        <SelectOption value="yyyy-MM-dd HH:mm:ss">yyyy-MM-dd HH:mm:ss</SelectOption>
                        <SelectOption value="yyyy-MM-dd">yyyy-MM-dd</SelectOption>
                        <SelectOption value="HH:mm:ss">HH:mm:ss</SelectOption>
                    </Select>
                </FormItem>
                </Col>

                <Col :span="12" v-if="formState.type === 'Struct'">
                <FormItem name="fullName" label="关联字段">
                    <TreeSelect v-model:value="formState.fullName" show-search style="width: 100%"
                        :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }" placeholder="清选择"
                        allow-clear tree-default-expand-all :tree-data="props.treeData" tree-node-filter-prop="label"
                        :replaceFields="{children:'children', label:'title', value: 'fullName'}">
                    </TreeSelect>
                </FormItem>
                </Col>

                <Col :span="12" v-if="formState.type === 'Boolean'">
                <FormItem name="trueValue" label="true显示">
                    <Input v-model:value="formState.trueLabel" />
                </FormItem>
                </Col>
                <Col :span="12" v-if="formState.type === 'Boolean'">
                <FormItem name="falseValue" label="false显示">
                    <Input v-model:value="formState.falseLabel" />
                </FormItem>
                </Col>
            </Row>

            <Row :gutter="16">
                <Col :span="12">
                <FormItem name="unique" label="唯一">
                    <Switch v-model:checked="formState.unique" />
                </FormItem>
                </Col>
                <Col :span="12">
                <FormItem name="required" label="必填">
                    <Switch v-model:checked="formState.required" />
                </FormItem>
                </Col>
            </Row>
            <FormItem name="help" label="备注" :label-col="{ span: 2 }">
                <Input.TextArea v-model:value="formState.help" :rows="4" placeholder="请输入备注" />
            </FormItem>
        </Form>
    </Modal>
</template>