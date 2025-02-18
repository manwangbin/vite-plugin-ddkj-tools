<script setup lang="ts">
import DataForm from '@/client/service/api/modal/dataform';
import { AutoComplete, Form, FormInstance, Input, Modal } from 'ant-design-vue';
import { FormItem, Rule } from 'ant-design-vue/es/form';
import { computed, reactive, Ref, ref } from 'vue';

interface DialogState {
    open: boolean;
    confirmLoading: boolean;
    edit: boolean;
    editData?: DataForm;
    searchText?: string;
}

interface FormState {
    category?: string;
    code?: string;
    title?: string;
}

const emit = defineEmits<{ok: [value: DataForm]}>();
const props = defineProps<{ categories: Array<{value: string}> }>();
const dialogState: DialogState = reactive({
    open: false,
    confirmLoading: false,
    edit: false
})

const inputForm = ref<FormInstance>();
const formState: Ref<FormState> = ref({});
const rules: Record<string, Rule[]> = {
    code: [
        { required: true, message: "编号", trigger: "change" },
        { min: 2, max: 20, message: "编号长度存在2-20个字符之间", trigger: "blur" },
    ],
    title: [
        { required: true, message: "请填写名称", trigger: "change" },
        { min: 2, max: 20, message: "名称长度存在2-20个字符之间", trigger: "blur" },
    ],
};

const categoryOptions = computed(() => {
    const options = [];
    if (dialogState.searchText && dialogState.searchText.length > 0) {
        options.push({value: dialogState.searchText});
    }

    options.push(...props.categories);
    return options;
})

const formateCategory = (categories: Array<string>) => {
    if (categories && categories.length > 0) {
        let category = categories[0];
        for (let i = 1; i < categories.length; i++) {
            category += '.' + categories[i];
        }

        return category;
    } else {
        return undefined;
    }
}

const onOk = () => {
    dialogState.confirmLoading = true;
  if (inputForm.value) {
    inputForm.value
      .validate()
      .then(() => {
        const inputData = {
          ...formState.value,
        } as any;

        if (dialogState.edit) {
         const value = Object.assign(dialogState.editData!, inputData);
         emit('ok', value);
         dialogState.open = false;

        } else {
          emit('ok', inputData);
          dialogState.open = false;

        }
      })
      .catch((err: any) => {
        console.error(err);
      })
      .finally(() => {
        dialogState.confirmLoading = false;
      });
  }
}

const openNewDialog = () => {
    formState.value = {};
    inputForm.value?.resetFields();

    dialogState.edit = false;
    dialogState.open = true;
}

const openEditDialog = (dataModal: DataForm) => {
    dialogState.editData = dataModal;
    formState.value = { category: formateCategory(dataModal.category), code: dataModal.code, title: dataModal.title };
    inputForm.value?.resetFields();

    dialogState.edit = true;
    dialogState.open = true;
}

const onCategoriesSearch = (searchText: string) => {
  dialogState.searchText = searchText;
};

defineExpose({
    openNewDialog,
    openEditDialog
})
</script>

<template>
    <Modal :width="500" v-model:open="dialogState.open" :title="dialogState.edit ? '修改数据模型' : '新建数据模型'"
        :maskClosable="false" :confirmLoading="dialogState.confirmLoading" @ok="onOk">
        <Form ref="inputForm" class="ddkj-editmodal-form" :model="formState" :rules="rules">
            <FormItem name="category" label="分组">
                <AutoComplete v-model:value="formState.category" placeholder="填写分组，多级分组用点号('.')隔开"
                    :options="categoryOptions" style="width: 100%;" @search="onCategoriesSearch"/>
            </FormItem>
            <FormItem name="code" label="编号">
                <Input v-model:value="formState.code" placeholder="请填写编号" />
            </FormItem>
            <FormItem name="title" label="名称">
                <Input v-model:value="formState.title" placeholder="请填写名称" />
            </FormItem>
        </Form>
    </Modal>
</template>

<style lang="less">
.ddkj-editmodal-form {
    .ant-form-item-label>label {
        color: rgba(255, 255, 255, 0.85);
    }
}
</style>