<script setup lang="ts">
import DataForm from '@/client/typings/modal/dataform';
import FormField from '@/client/typings/modal/formfield';
import { AutoComplete, Checkbox, Col, Form, FormItem, Input, Row, Select } from 'ant-design-vue';
import { FormInstance, Rule } from 'ant-design-vue/es/form';
import { computed, Ref, ref, watch } from 'vue';

interface FormState {
    searchText?: string;
    category?: string;
    code?: string;
    title?: string;
    titleField?: string;
    isTree?: boolean;
    persistence?: boolean;
    enabledCache?: boolean;
    note?: string;
}

const props = defineProps<{
    categories: Array<{ value: string }>,
    fields: Array<FormField>,
    form: DataForm,
}>();
const inputForm = ref<FormInstance>();

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
const formState: Ref<FormState> = ref({
    category: formateCategory(props.form.category),
    code: props.form.code,
    title: props.form.title,
    titleField: props.form.titleField,
    isTree: props.form.isTree,
    persistence: props.form.persistence,
    enabledCache: props.form.enabledCache,
    note: props.form.note
});

watch(() => props.form, () => {
    formState.value = {
        category: formateCategory(props.form.category),
        code: props.form.code,
        title: props.form.title,
        titleField: props.form.titleField,
        isTree: props.form.isTree,
        persistence: props.form.persistence,
        enabledCache: props.form.enabledCache,
        note: props.form.note
    };
})

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
    if (formState.value.searchText && formState.value.searchText.length > 0) {
        options.push({value: formState.value.searchText});
    }

    options.push(...props.categories);
    console.log("categoryOptions", options);
    
    return options;
})

const parseCategory = (category: string) => {
    return category.split(".");
}

const getFormData = () => {
    return new Promise((resolve, reject) => {
        if (inputForm.value) {
            inputForm.value
                .validate()
                .then(() => {
                    const inputData = { ...formState.value } as any;
                    if (inputData.category) {
                        inputData.category = parseCategory(inputData.category);
                    }

                    resolve(inputData);
                })
                .catch((err: any) => {
                    reject(err);
                })
        } else {
            reject({ error: 'fail' })
        }
    })
}

const onCategoriesSearch = (searchText: string) => {
  formState.value.searchText = searchText;
  console.log("on search ", searchText);
};

defineExpose({
    getFormData
})
</script>

<template>
    <Form ref="inputForm" :model="formState" :label-col="{ span: 4 }" class="base-form" :rules="rules">
        <Row :gutter="16" align="middle">
            <Col :span="8">
            <FormItem name="category" label="分组">
                <AutoComplete v-model:value="formState.category" placeholder="填写分组，多级分组用点号('.')隔开"
                    :options="categoryOptions" style="width: 100%;" @search="onCategoriesSearch"/>
            </FormItem>
            </Col>
            <Col :span="8">
            <FormItem label="编号" name="code">
                <Input v-model:value="formState.code" placeholder="请填写编号"></Input>
            </FormItem>
            </Col>
            <Col :span="8">
            <FormItem label="标题列" name="titleField">
                <Select v-model:value="formState.titleField" :options="props.fields"
                    :field-names="{ label: 'label', value: 'code' }"></Select>
            </FormItem>
            </Col>
            <Col :span="16">
            <FormItem name="note" label="备注" :label-col="{ span: 2 }">
                <Input v-model:value="formState.note" :rows="4" placeholder="请输入备注" />
            </FormItem>
            </Col>
            <Col :span="8">
            <div class="flex flex-row justify-between items-center">
                <FormItem name="isTree">
                    <Checkbox v-model:checked="formState.isTree">树形模型</Checkbox>
                </FormItem>
                <FormItem name="persistence">
                    <Checkbox v-model:checked="formState.persistence">存储</Checkbox>
                </FormItem>
                <FormItem name="enabledCache">
                    <Checkbox v-model:checked="formState.enabledCache">使用缓存</Checkbox>
                </FormItem>
            </div>
            </Col>
        </Row>
    </Form>
</template>