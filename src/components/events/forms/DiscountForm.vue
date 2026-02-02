<template>
  <form @submit="onSubmit" class="space-y-4">
    <!-- Basic Information -->
    <UFormGroup label="Discount Name" name="name" required :error="errors.name">
      <UInput 
        v-model="name" 
        v-bind="nameAttrs" 
        placeholder="e.g. Early Bird, Student Discount, Senior Rate" 
      />
    </UFormGroup>

    <UFormGroup label="Description" name="description" :error="errors.description">
      <UTextarea
        :model-value="description ?? ''"
        @update:model-value="(value) => description = value"
        placeholder="Additional details about this discount..."
        :rows="2"
      />
    </UFormGroup>

    <!-- Package Selector (for new discounts only) -->
    <UFormGroup 
      v-if="!modelValue"
      label="Booking Package" 
      name="packageId" 
      required 
      :error="errors.packageId"
    >
      <USelectMenu
        v-model="packageId"
        v-bind="packageIdAttrs"
        :options="packageOptions"
        value-attribute="value"
        option-attribute="label"
        placeholder="Select a booking package"
        :disabled="packages.length === 0"
      />
      <template #help>
        <span v-if="packages.length === 0" class="text-xs text-orange-500">
          Create a booking package first before adding discounts
        </span>
        <span v-else class="text-xs text-gray-500">
          This discount will apply to the selected booking package
        </span>
      </template>
    </UFormGroup>

    <!-- Package Display (for existing discounts) -->
    <UFormGroup 
      v-else-if="modelValue?.target_package"
      label="Linked to Package" 
    >
      <div class="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <UIcon name="i-heroicons-cube" class="w-5 h-5 text-gray-500" />
        <span class="font-medium text-gray-900">{{ modelValue.target_package.name }}</span>
        <UBadge color="gray" variant="subtle" size="xs" class="ml-auto">Package</UBadge>
      </div>
      <template #help>
        <span class="text-xs text-gray-500">
          Package association cannot be changed after creation
        </span>
      </template>
    </UFormGroup>

    <!-- Discount Type Selection -->
    <UFormGroup label="Discount Type" name="discount_type" required :error="errors.discount_type">
      <div class="space-y-3">
        <div
          v-for="type in discountTypes"
          :key="type.value"
          class="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
          :class="{ 'border-primary-500 bg-primary-50': discount_type === type.value }"
        >
          <URadio
            v-model="discount_type"
            v-bind="discount_typeAttrs"
            :value="type.value"
            :label="type.label"
          />
          <div class="flex-1 pt-0.5">
            <p class="text-sm text-gray-600">{{ type.description }}</p>
          </div>
        </div>
      </div>
    </UFormGroup>

    <!-- Conditional Amount/Percentage Fields -->
    <template v-if="discount_type === 'PERCENTAGE'">
      <div class="p-4 bg-gray-50 rounded-lg">
        <UFormGroup label="Percentage" name="percentage" required :error="errors.percentage">
          <UInput
            v-model="percentage"
            v-bind="percentageAttrs"
            type="text"
            inputmode="decimal"
            placeholder="e.g. 10 for 10% off"
          >
            <template #trailing>
              <span class="text-gray-500">%</span>
            </template>
          </UInput>
          <template #help>
            <span class="text-xs text-gray-500">Enter a value between 0 and 100</span>
          </template>
        </UFormGroup>
      </div>
    </template>

    <template v-if="discount_type === 'FIXED'">
      <div class="p-4 bg-gray-50 rounded-lg">
        <UFormGroup label="Fixed Amount" name="amount" required :error="errors.amount">
          <UInput
            v-model="amount"
            v-bind="amountAttrs"
            type="text"
            inputmode="decimal"
            placeholder="e.g. 50.00"
          >
            <template #leading>
              <span class="text-gray-500">$</span>
            </template>
          </UInput>
          <template #help>
            <span class="text-xs text-gray-500">Enter the fixed discount amount</span>
          </template>
        </UFormGroup>
      </div>
    </template>

    <!-- Active Toggle -->
    <UFormGroup name="active">
      <UCheckbox
        v-model="active"
        v-bind="activeAttrs"
        label="Active discount"
      />
    </UFormGroup>

    <!-- Rules Section -->
    <UDivider class="my-6" />
    
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h4 class="font-semibold text-gray-900">Eligibility Rules</h4>
          <p class="text-sm text-gray-600 mt-1">Define conditions for who can use this discount</p>
        </div>
        <UButton
          icon="i-heroicons-plus"
          label="Add Rule"
          size="sm"
          variant="outline"
          @click="addRule"
        />
      </div>

      <!-- Rules List -->
      <div v-if="rules.length > 0" class="space-y-3">
        <div
          v-for="(rule, index) in rules"
          :key="index"
          class="p-4 border border-gray-200 rounded-lg bg-white"
        >
          <div class="flex items-start gap-3">
            <div class="flex-1 space-y-3">
              <UFormGroup 
                :label="`Rule ${index + 1} - Type`" 
                :name="`rules.${index}.rule_type`" 
                :error="(errors as any)[`rules.${index}.rule_type`]"
                required
              >
                <USelectMenu
                  :model-value="rule.value.rule_type"
                  @update:model-value="(value) => updateRuleField(index, 'rule_type', value)"
                  :options="ruleTypeOptions"
                  value-attribute="value"
                  option-attribute="label"
                  placeholder="Select rule type"
                />
                <template #help>
                  <span v-if="rule.value.rule_type" class="text-xs text-gray-500">
                    {{ getRuleTypeDescription(rule.value.rule_type) }}
                  </span>
                </template>
              </UFormGroup>

              <UFormGroup 
                label="Rule Name" 
                :name="`rules.${index}.name`"
                :error="(errors as any)[`rules.${index}.name`]"
                required
              >
                <UInput
                  :model-value="rule.value.name"
                  @update:model-value="(value) => updateRuleField(index, 'name', value)"
                  placeholder="e.g. Student ID Required, Senior Discount"
                />
              </UFormGroup>

              <UFormGroup 
                label="Rule Description" 
                :name="`rules.${index}.description`"
                :error="(errors as any)[`rules.${index}.description`]"
              >
                <UTextarea
                  :model-value="rule.value.description"
                  @update:model-value="(value) => updateRuleField(index, 'description', value)"
                  placeholder="Optional description of this rule"
                  :rows="2"
                />
              </UFormGroup>

              <!-- Conditional Value Field -->
              <UFormGroup 
                v-if="ruleRequiresValue(rule.value.rule_type)"
                label="Value" 
                :name="`rules.${index}.value`"
                :error="(errors as any)[`rules.${index}.value`]"
                :required="ruleRequiresValue(rule.value.rule_type)"
              >
                <UInput
                  :model-value="rule.value.value"
                  @update:model-value="(value) => updateRuleField(index, 'value', value)"
                  :placeholder="getRuleValuePlaceholder(rule.value.rule_type)"
                  type="text"
                  :inputmode="isAgeRule(rule.value.rule_type) ? 'numeric' : 'text'"
                />
              </UFormGroup>

              <UFormGroup :name="`rules.${index}.active`">
                <UCheckbox
                  :model-value="rule.value.active"
                  @update:model-value="(value) => updateRuleField(index, 'active', value)"
                  label="Active rule"
                />
              </UFormGroup>
            </div>

            <UButton
              icon="i-heroicons-trash"
              color="red"
              variant="ghost"
              size="sm"
              @click="removeRule(index)"
            />
          </div>
        </div>
      </div>

      <div v-else class="text-center py-8 text-gray-500 border border-dashed rounded-lg">
        <p class="text-sm">No rules added yet</p>
        <p class="text-xs mt-1">Click "Add Rule" to create eligibility conditions</p>
      </div>
    </div>

    <!-- Form Actions -->
    <UDivider class="my-6" />
    
    <div class="flex justify-end gap-2 pt-2">
      <UButton
        label="Cancel"
        variant="ghost"
        @click="$emit('cancel')"
      />
      <UButton
        label="Save Discount"
        type="submit"
        :loading="isLoading"
      />
    </div>
  </form>
</template>

<script setup lang="ts">
import { useForm, useFieldArray } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { 
  discountSchema,
  discountTypeLabels,
  discountTypeDescriptions,
  discountRuleTypeLabels,
  discountRuleTypeDescriptions,
  ruleTypeRequiresValue,
  ruleTypeValuePlaceholders,
  type DiscountFormData,
  type DiscountRuleType,
} from '~/schemas/events/discount'

interface Props {
  modelValue?: any
  eventId: number
  isLoading?: boolean
  packages?: any[]
  selectedPackageId?: number | null
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  isLoading: false,
  packages: () => [],
  selectedPackageId: null,
})

const emit = defineEmits<{
  submit: [data: DiscountFormData]
  cancel: []
}>()

// Define discount types for radio buttons
const discountTypes = [
  {
    value: 'PERCENTAGE',
    label: discountTypeLabels.PERCENTAGE,
    description: discountTypeDescriptions.PERCENTAGE,
  },
  {
    value: 'FIXED',
    label: discountTypeLabels.FIXED,
    description: discountTypeDescriptions.FIXED,
  },
]

// Define rule type options for dropdown
const ruleTypeOptions = Object.entries(discountRuleTypeLabels).map(([value, label]) => ({
  value,
  label,
}))

// Setup form with vee-validate
const { errors, handleSubmit, defineField, resetForm, values } = useForm({
  validationSchema: toTypedSchema(discountSchema),
  initialValues: {
    name: props.modelValue?.name || '',
    description: props.modelValue?.description || '',
    packageId: props.selectedPackageId || undefined,
    discount_type: props.modelValue?.discount_type || 'PERCENTAGE',
    percentage: props.modelValue?.percentage || '',
    amount: props.modelValue?.amount || '',
    active: props.modelValue?.active ?? true,
    rules: props.modelValue?.rules || [],
  },
})

// Define form fields
const [name, nameAttrs] = defineField('name')
const [description, descriptionAttrs] = defineField('description')
const [packageId, packageIdAttrs] = defineField('packageId')
const [discount_type, discount_typeAttrs] = defineField('discount_type')
const [percentage, percentageAttrs] = defineField('percentage')
const [amount, amountAttrs] = defineField('amount')
const [active, activeAttrs] = defineField('active')

// Package options for dropdown
const packageOptions = computed(() => 
  props.packages.map((pkg: any) => ({
    value: pkg.id,
    label: `${pkg.name} - $${Number(pkg.base_amount).toFixed(2)}`,
  }))
)

// Field array for rules
const { fields: rules, push: pushRule, remove: removeRule, update: updateRule } = useFieldArray<any>('rules')

// Add a new rule
const addRule = () => {
  pushRule({
    rule_type: 'IS_EVENT_STAFF',
    name: '',
    description: '',
    value: '',
    active: true,
  })
}

// Update a specific field in a rule
const updateRuleField = (index: number, field: string, value: any) => {
  const currentRule = rules.value[index].value
  
  // Ensure 'value' field is always stored as string (backend will cast as needed)
  const processedValue = field === 'value' && value !== null && value !== undefined
    ? String(value)
    : value
  
  updateRule(index, {
    ...currentRule,
    [field]: processedValue,
  })
}

// Helper functions
const ruleRequiresValue = (ruleType?: string) => {
  if (!ruleType) return false
  return ruleTypeRequiresValue[ruleType as DiscountRuleType]
}

const getRuleTypeDescription = (ruleType?: string) => {
  if (!ruleType) return ''
  return discountRuleTypeDescriptions[ruleType as DiscountRuleType]
}

const getRuleValuePlaceholder = (ruleType?: string) => {
  if (!ruleType) return ''
  return ruleTypeValuePlaceholders[ruleType as DiscountRuleType]
}

const isAgeRule = (ruleType?: string) => {
  return ruleType === 'IS_AGE_LT' || ruleType === 'IS_AGE_GT'
}

// Handle form submission
const toast = useToast()

const onSubmit = handleSubmit((values) => {
  // Clean up the data based on discount type
  const cleanedData: any = {
    name: values.name,
    description: values.description || undefined,
    packageId: values.packageId,
    discount_type: values.discount_type,
    active: values.active,
  }

  if (values.discount_type === 'PERCENTAGE') {
    cleanedData.percentage = values.percentage
  } else if (values.discount_type === 'FIXED') {
    cleanedData.amount = values.amount
  }

  // Don't include rules in the main discount data - they will be created separately
  // The parent component will handle creating the rules after the discount is created
  cleanedData.rules = values.rules

  emit('submit', cleanedData)
}, (validationErrors) => {
  // Handle validation errors
  console.error('Form validation errors:', validationErrors)
  
  // Find the first error to show
  const errorEntries = Object.entries(validationErrors.errors)
  const firstError = errorEntries.length > 0 ? errorEntries[0][1] : undefined
  
  toast.add({
    title: 'Validation Error',
    description: firstError || 'Please fix the errors in the form before submitting',
    color: 'red',
  })
})

// Watch for changes in modelValue and reset form
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    resetForm({
      values: {
        name: newValue.name || '',
        description: newValue.description || '',
        discount_type: newValue.discount_type || 'PERCENTAGE',
        percentage: newValue.percentage || '',
        amount: newValue.amount || '',
        active: newValue.active ?? true,
        rules: newValue.rules || [],
      },
    })
  }
}, { immediate: true })
</script>
