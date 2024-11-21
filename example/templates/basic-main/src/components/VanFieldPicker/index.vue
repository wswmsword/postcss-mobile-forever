<script setup lang="ts">
import type { FieldProps, PickerOption, PopupProps } from 'vant'
import { pick } from 'lodash-es'

defineOptions({
  name: 'VanFieldPicker',
})

const props = defineProps<{
  // field
  label?: FieldProps['label']
  name?: FieldProps['name']
  id?: FieldProps['id']
  type?: FieldProps['type']
  size?: FieldProps['size']
  placeholder?: FieldProps['placeholder']
  border?: FieldProps['border']
  colon?: FieldProps['colon']
  required?: FieldProps['required']
  center?: FieldProps['center']
  arrowDirection?: FieldProps['arrowDirection']
  labelClass?: FieldProps['labelClass']
  labelWidth?: FieldProps['labelWidth']
  labelAlign?: FieldProps['labelAlign']
  autosize?: FieldProps['autosize']
  leftIcon?: FieldProps['leftIcon']
  rightIcon?: FieldProps['rightIcon']
  rules?: FieldProps['rules']
  // popup
  round?: PopupProps['round']
  // picker
  columns?: PickerOption[]
}>()

const fieldProps = computed(() => pick(props, ['label', 'name', 'id', 'type', 'size', 'placeholder', 'border', 'colon', 'required', 'center', 'arrowDirection', 'labelClass', 'labelWidth', 'labelAlign', 'autosize', 'leftIcon', 'rightIcon', 'rules']))
const popupProps = computed(() => pick(props, ['round']))
const pickerProps = computed(() => pick(props, ['columns']))

const value = defineModel<string | number>()
const valuePicker = ref<any>([value.value])
const valueStr = computed(() => props.columns?.find((item: any) => item.value === value.value)?.text)

const showPicker = ref(false)
</script>

<template>
  <van-field :model-value="valueStr" v-bind="fieldProps" is-link readonly @click="showPicker = true" />
  <van-popup v-model:show="showPicker" v-bind="popupProps" position="bottom" teleport="body">
    <van-picker :model-value="valuePicker" v-bind="pickerProps" @confirm="({ selectedOptions }) => { value = selectedOptions[0]?.value; showPicker = false }" @cancel="showPicker = false" />
  </van-popup>
</template>
