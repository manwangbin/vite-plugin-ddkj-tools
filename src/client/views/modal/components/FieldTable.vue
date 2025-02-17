<script setup lang="ts">
import FormField from '@/client/service/api/modal/formfield';
import ModalTreeNode from '@/client/service/api/modal/modal-tree-node';
import { DeleteOutlined, FormOutlined } from '@ant-design/icons-vue';
import { Table, Tag, Tooltip } from 'ant-design-vue';

interface Prop {
    treeData: Array<ModalTreeNode>;
    tableBodyHeight: number;
    fields: Array<FormField>;
    aiEdit: boolean;
}

const props = withDefaults(defineProps<Prop>(), {
    treeData: () => [],
    tableBodyHeight: 0,
    fields: () => [],
    aiEdit: false
});

const emit = defineEmits<{
    edit: [value: FormField],
    delete: [value: FormField],
    sort: [value: { source: number, to: number }]
}>();

const fieldColumns = [
    {
        dataIndex: 'label',
        title: '名称',
        width: 140
    },
    {
        dataIndex: 'code',
        title: '编号',
        width: 140
    },
    {
        dataIndex: 'type',
        key: 'type',
        title: '类型',
    },
    {
        dataIndex: 'required',
        key: 'required',
        align: 'center',
        title: '必填',
        width: 100
    },
    {
        dataIndex: 'unique',
        key: 'unique',
        title: '唯一',
        align: 'center',
        width: 100
    },
    {
        dataIndex: 'help',
        title: '备注',
        width: 220
    },
    {
        key: 'action',
        title: '操作',
        align: 'right',
        width: 100
    }
];

const findModalByFullName = (fullName: string) => {
    const names: string[] = fullName.split(".");
    let node: ModalTreeNode | undefined;
    let currentChildren: Array<ModalTreeNode> | undefined = props.treeData;
    for (let i = 0; i < names.length; i++) {
        if (currentChildren) {
            const index = currentChildren?.findIndex((item) => item.key === names[i] || item.key === `form-${names[i]}`);
            if (index && index > -1) {
                node = currentChildren![index];
                currentChildren = node.children;
            }
        }
    }

    if (node) {
        return node.form?.title;
    }
}

const renderType = (value: any) => {
    if (!value || !value.name) {
        return '';
    }

    switch (value.name) {
        case 'String':
            let strContent = '文本;';
            if (value.rich) {
                strContent += '富文本框；'
            } else {
                strContent += '最大长度' + (value.maxLength && value.maxLength > 0 ? value.maxLength : 255) + ";"
            }

            if (value.format) {
                strContent += "格式 " + value.format + ";";
            }
            return strContent;

        case 'Number':
            let numContent = '数字;';
            if (value.decimal) {
                numContent += "小数保留" + value.decimal + "位;"
            }

            if (value.format) {
                numContent += "显示格式 " + value.format;
            }
            return numContent;

        case 'Boolean':
            return `布尔; true显示值${value.trueLabel}; false显示值${value.falseLabel}`;

        case 'Date':
            return `日期; 格式${value.format};`;

        case 'Struct':
            return `关联外键；关联模型：${findModalByFullName(value.fullName)}`;
    }
}

let dragItem: any = null;
let targItem: any = null;
const customRow = (record: any) => {
    return {
        draggable: true,
        ondrag() {
            dragItem = record
        },
        ondrop() {
            targItem = record
        },
        ondragend() {
            if (targItem && dragItem && dragItem !== targItem) {
                const sourceIndex = props.fields.indexOf(dragItem);
                const targetIndex = props.fields.indexOf(targItem);
                emit("sort", {source: sourceIndex, to: targetIndex});
            }
        },
        ondragover(e: any) {
            e.preventDefault()
            return false
        },
    }
}
</script>

<template>
    <Table size="small" bordered :columns="fieldColumns" :pagination="false" :custom-row="customRow"
        :scroll="{ y: props.tableBodyHeight }" :data-source="props.fields">
        <template #bodyCell="{ column, text, record }">
            <template v-if="column.key === 'type'">
                {{ renderType(text) }}
            </template>
            <template v-if="column.key === 'required'">
                <Tag :color="text ? 'red' : ''">{{ text ? '必填' : '非必填' }}</Tag>
            </template>
            <template v-else-if="column.key === 'unique'">
                <Tag :color="text ? 'blue' : ''">{{ text ? '数据唯一' : '' }}</Tag>
            </template>
            <template v-if="column.key === 'action'">
                <div class="flex flex-row justify-end gap-10px" v-show="!props.aiEdit">
                    <Tooltip>
                        <template #title>修改</template>
                        <FormOutlined @click="emit('edit', record as FormField)"
                            style="font-size: 16px; padding: 4px;" />
                    </Tooltip>
                    <Tooltip>
                        <template #title>删除</template>
                        <Popconfirm title="确认要删除此属性?" @click="emit('delete', record as FormField)">
                            <DeleteOutlined style="font-size: 16px; padding: 4px; color: red;" />
                        </Popconfirm>
                    </Tooltip>
                </div>
            </template>
        </template>
    </Table>
</template>
