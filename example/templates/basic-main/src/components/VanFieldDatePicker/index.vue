<script setup lang="ts">
import type { DatePickerProps, FieldProps, PopupProps } from 'vant'
import { pick } from 'lodash-es'

defineOptions({
  name: 'VanFieldDatePicker',
})

const props = defineProps<{
  // field
  label?: FieldProps['label']
  name?: FieldProps['name']
  id?: FieldProps['id']
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
  leftIcon?: FieldProps['leftIcon']
  rightIcon?: FieldProps['rightIcon']
  rules?: FieldProps['rules']
  // popup
  round?: PopupProps['round']
  // date-picker
  columnsType?: DatePickerProps['columnsType']
  minDate?: DatePickerProps['minDate']
  maxDate?: DatePickerProps['maxDate']
  formatter?: DatePickerProps['formatter']
}>()

const fieldProps = computed(() => pick(props, ['label', 'name', 'id', 'size', 'placeholder', 'border', 'colon', 'required', 'center', 'arrowDirection', 'labelClass', 'labelWidth', 'labelAlign', 'leftIcon', 'rightIcon', 'rules']))
const popupProps = computed(() => pick(props, ['round']))
const datePickerProps = computed(() => pick(props, ['columnsType', 'minDate', 'maxDate', 'formatter']))

const value = defineModel<string[]>()
const valueDate = ref<string[]>(value.value ?? [])
const valueStr = computed(() => {
  return value.value ? value.value.join('-') : ''
})

const showPicker = ref(false)
function onConfirm({ selectedValues }: { selectedValues: string[] }) {
  value.value = selectedValues
  showPicker.value = false
}
</script>

<template>
  <van-field :model-value="valueStr" v-bind="fieldProps" is-link readonly @click="showPicker = true" />
  <van-popup v-model:show="showPicker" v-bind="popupProps" position="bottom" teleport="body">
    <van-date-picker v-model="valueDate" v-bind="datePickerProps" @confirm="onConfirm" @cancel="showPicker = false" />
  </van-popup>
</template>
