<script setup lang="ts">
import type { CalendarProps, FieldProps } from 'vant'
import dayjs from '@/utils/dayjs'
import { pick } from 'lodash-es'

defineOptions({
  name: 'VanFieldCalendar',
})

const props = withDefaults(
  defineProps<{
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
    // calendar
    color?: CalendarProps['color']
    minDate?: CalendarProps['minDate']
    maxDate?: CalendarProps['maxDate']
    formatter?: CalendarProps['formatter']
    showConfirm?: CalendarProps['showConfirm']
    confirmText?: CalendarProps['confirmText']
    firstDayOfWeek?: CalendarProps['firstDayOfWeek']
    round?: CalendarProps['round']
    // 自定义
    format?: string
    valueFormat?: string
  }>(),
  {
    format: 'YYYY-MM-DD',
    valueFormat: '',
  },
)

const fieldProps = computed(() => pick(props, ['label', 'name', 'id', 'size', 'placeholder', 'border', 'colon', 'required', 'center', 'arrowDirection', 'labelClass', 'labelWidth', 'labelAlign', 'leftIcon', 'rightIcon', 'rules']))
const calendarProps = computed(() => pick(props, ['color', 'minDate', 'maxDate', 'formatter', 'showConfirm', 'confirmText', 'firstDayOfWeek', 'round']))

const value = defineModel<string>()
const valueStr = computed(() => value.value && dayjs(value.value).format(props.format))
const valueDate = computed(() => dayjs(value.value).toDate())
const showCalendar = ref(false)

function onConfirm(date: Date) {
  value.value = dayjs(date).format(props.valueFormat)
  showCalendar.value = false
}
</script>

<template>
  <van-field :model-value="valueStr" v-bind="fieldProps" is-link readonly @click="showCalendar = true" />
  <van-calendar v-model:show="showCalendar" v-bind="calendarProps" :default-date="valueDate" teleport="body" @confirm="onConfirm" />
</template>
