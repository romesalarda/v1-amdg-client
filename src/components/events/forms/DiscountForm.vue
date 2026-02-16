<template>
  <form @submit="onSubmit" class="space-y-4 text-background-dark-600">
    <!-- Basic Information -->
    <div class="space-y-2">
      <label class="block text-sm font-medium text-background-dark-600" for="discount-name">
        Discount Name <span class="text-red-500">*</span>
      </label>
      <input
        id="discount-name"
        v-model="name"
        v-bind="nameAttrs"
        type="text"
        placeholder="e.g. Early Bird, Student Discount, Senior Rate"
        class="w-full rounded-xl border border-primary-500/20 bg-white px-4 py-2 text-sm text-background-dark-600 placeholder:text-background-dark-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
      <p v-if="errors.name" class="text-xs text-red-500">{{ errors.name }}</p>
    </div>

    <div class="space-y-2">
      <label class="block text-sm font-medium text-background-dark-600" for="discount-description">
        Description
      </label>
      <textarea
        id="discount-description"
        v-model="description"
        v-bind="descriptionAttrs"
        placeholder="Additional details about this discount..."
        rows="2"
        class="w-full rounded-xl border border-primary-500/20 bg-white px-4 py-2 text-sm text-background-dark-600 placeholder:text-background-dark-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
      ></textarea>
      <p v-if="errors.description" class="text-xs text-red-500">{{ errors.description }}</p>
    </div>

    <!-- Package Selector (for new discounts only) -->
    <div v-if="!modelValue" class="space-y-2">
      <label class="block text-sm font-medium text-background-dark-600" for="discount-package">
        Booking Package <span class="text-red-500">*</span>
      </label>
      <select
        id="discount-package"
        v-model="packageId"
        v-bind="packageIdAttrs"
        :disabled="packages.length === 0"
        class="w-full rounded-xl border border-primary-500/20 bg-white px-4 py-2 text-sm text-background-dark-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
      >
        <option value="" disabled>Select a booking package</option>
        <option v-for="pkg in packages" :key="pkg.id" :value="pkg.id">
          {{ pkg.name }} - ${{ Number(pkg.base_amount).toFixed(2) }}
        </option>
      </select>
      <p v-if="packages.length === 0" class="text-xs text-orange-500">
        Create a booking package first before adding discounts
      </p>
      <p v-else class="text-xs text-primary-500/60">
        This discount will apply to the selected booking package
      </p>
      <p v-if="errors.packageId" class="text-xs text-red-500">{{ errors.packageId }}</p>
    </div>

    <!-- Package Display (for existing discounts) -->
    <div v-else-if="modelValue?.target_package" class="space-y-2">
      <label class="block text-sm font-medium text-background-dark-600">
        Linked to Package
      </label>
      <div class="flex items-center gap-2 p-3 bg-mist-blue/40 rounded-lg border border-primary-500/20">
        <span class="inline-block w-5 h-5 text-primary-500/60">📦</span>
        <span class="font-medium text-background-dark-600">{{ modelValue.target_package.name }}</span>
        <span class="ml-auto text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Package</span>
      </div>
      <p class="text-xs text-primary-500/60">
        Package association cannot be changed after creation
      </p>
    </div>

    <!-- Discount Type Selection -->
    <div class="space-y-2">
      <label class="block text-sm font-medium text-background-dark-600">
        Discount Type <span class="text-red-500">*</span>
      </label>
      <div class="space-y-3">
        <label
          v-for="type in discountTypes"
          :key="type.value"
          class="flex items-start gap-3 p-3 border border-primary-500/20 rounded-lg hover:bg-mist-blue/50 transition-colors cursor-pointer"
          :class="{ 'border-primary bg-mist-blue/60': discount_type === type.value }"
        >
          <input
            v-model="discount_type"
            v-bind="discount_typeAttrs"
            type="radio"
            :value="type.value"
            class="mt-1 h-4 w-4 border border-navy-300 bg-white accent-[rgb(0,33,71)]"
          />
          <div class="flex-1">
            <span class="block font-medium text-primary">{{ type.label }}</span>
            <p class="text-sm text-primary-500/60">{{ type.description }}</p>
          </div>
        </label>
      </div>
      <p v-if="errors.discount_type" class="text-xs text-red-500">{{ errors.discount_type }}</p>
    </div>

    <!-- Conditional Amount/Percentage Fields -->
    <template v-if="discount_type === 'PERCENTAGE'">
      <div class="p-4 bg-mist-blue/40 rounded-lg space-y-2">
        <label class="block text-sm font-medium text-background-dark-600" for="discount-percentage">
          Percentage <span class="text-red-500">*</span>
        </label>
        <div class="flex items-center gap-2">
          <input
            id="discount-percentage"
            v-model="percentage"
            v-bind="percentageAttrs"
            type="text"
            inputmode="decimal"
            placeholder="e.g. 10 for 10% off"
            class="flex-1 rounded-xl border border-primary-500/20 bg-white px-4 py-2 text-sm text-background-dark-600 placeholder:text-background-dark-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <span class="text-primary-500/60">%</span>
        </div>
        <p class="text-xs text-primary-500/60">Enter a value between 0 and 100</p>
        <p v-if="errors.percentage" class="text-xs text-red-500">{{ errors.percentage }}</p>
      </div>
    </template>

    <template v-if="discount_type === 'FIXED'">
      <div class="p-4 bg-mist-blue/40 rounded-lg space-y-2">
        <label class="block text-sm font-medium text-background-dark-600" for="discount-amount">
          Fixed Amount <span class="text-red-500">*</span>
        </label>
        <div class="flex items-center gap-2">
          <span class="text-primary-500/60">$</span>
          <input
            id="discount-amount"
            v-model="amount"
            v-bind="amountAttrs"
            type="text"
            inputmode="decimal"
            placeholder="e.g. 50.00"
            class="flex-1 rounded-xl border border-primary-500/20 bg-white px-4 py-2 text-sm text-background-dark-600 placeholder:text-background-dark-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <p class="text-xs text-primary-500/60">Enter the fixed discount amount</p>
        <p v-if="errors.amount" class="text-xs text-red-500">{{ errors.amount }}</p>
      </div>
    </template>

    <!-- Active Toggle -->
    <label class="flex items-center justify-between rounded-xl border border-primary-500/20 bg-white px-4 py-3">
      <span class="text-sm font-medium text-background-dark-600">Active discount</span>
      <span class="relative inline-flex h-6 w-11 items-center">
        <input
          v-model="active"
          v-bind="activeAttrs"
          type="checkbox"
          class="peer sr-only"
        />
        <span class="h-6 w-11 rounded-full bg-primary-500/20 transition peer-checked:bg-primary"></span>
        <span class="absolute left-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5"></span>
      </span>
    </label>

    <!-- Rules Section -->
    <div class="border-t border-primary-500/20 py-6 space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h4 class="font-semibold text-background-dark-600">Eligibility Rules</h4>
          <p class="text-sm text-primary-500/60 mt-1">Define conditions for who can use this discount</p>
        </div>
        <button
          type="button"
          class="bg-white border border-primary text-primary rounded-xl text-[11px] font-black uppercase tracking-widest px-3 py-2 hover:bg-primary hover:text-white transition-all"
          @click="addRule"
        >
          + Add Rule
        </button>
      </div>

      <!-- Rules List -->
      <div v-if="rules.length > 0" class="space-y-3">
        <div
          v-for="(rule, index) in rules"
          :key="index"
          class="p-4 border border-primary-500/20 rounded-lg bg-white space-y-3"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1 space-y-3">
              <!-- Rule Type Dropdown -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-background-dark-600">
                  Rule {{ index + 1 }} - Type <span class="text-red-500">*</span>
                </label>
                <select
                  :model-value="rule.value.rule_type"
                  @update:model-value="(value: any) => updateRuleField(index, 'rule_type', value)"
                  class="w-full rounded-xl border border-primary-500/20 bg-white px-4 py-2 text-sm text-background-dark-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="" disabled>Select rule type</option>
                  <option v-for="opt in ruleTypeOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
                <p v-if="(errors as any)[`rules.${index}.rule_type`]" class="text-xs text-red-500">
                  {{ (errors as any)[`rules.${index}.rule_type`] }}
                </p>
                <p v-if="rule.value.rule_type" class="text-xs text-primary-500/60">
                  {{ getRuleTypeDescription(rule.value.rule_type) }}
                </p>
              </div>

              <!-- Rule Name -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-background-dark-600">
                  Rule Name <span class="text-red-500">*</span>
                </label>
                <input
                  :model-value="rule.value.name"
                  @update:model-value="(value: any) => updateRuleField(index, 'name', value)"
                  type="text"
                  placeholder="e.g. Student ID Required, Senior Discount"
                  class="w-full rounded-xl border border-primary-500/20 bg-white px-4 py-2 text-sm text-background-dark-600 placeholder:text-background-dark-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p v-if="(errors as any)[`rules.${index}.name`]" class="text-xs text-red-500">
                  {{ (errors as any)[`rules.${index}.name`] }}
                </p>
              </div>

              <!-- Rule Description -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-background-dark-600">
                  Rule Description
                </label>
                <textarea
                  :model-value="rule.value.description"
                  @update:model-value="(value: any) => updateRuleField(index, 'description', value)"
                  placeholder="Optional description of this rule"
                  rows="2"
                  class="w-full rounded-xl border border-primary-500/20 bg-white px-4 py-2 text-sm text-background-dark-600 placeholder:text-background-dark-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                ></textarea>
                <p v-if="(errors as any)[`rules.${index}.description`]" class="text-xs text-red-500">
                  {{ (errors as any)[`rules.${index}.description`] }}
                </p>
              </div>

              <!-- Conditional Value Field -->
              <div v-if="ruleRequiresValue(rule.value.rule_type)" class="space-y-2">
                <label class="block text-sm font-medium text-background-dark-600">
                  Value <span class="text-red-500">*</span>
                </label>
                <input
                  :model-value="rule.value.value"
                  @update:model-value="(value: any) => updateRuleField(index, 'value', value)"
                  :placeholder="getRuleValuePlaceholder(rule.value.rule_type)"
                  type="text"
                  :inputmode="isAgeRule(rule.value.rule_type) ? 'numeric' : 'text'"
                  class="w-full rounded-xl border border-primary-500/20 bg-white px-4 py-2 text-sm text-background-dark-600 placeholder:text-background-dark-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p v-if="(errors as any)[`rules.${index}.value`]" class="text-xs text-red-500">
                  {{ (errors as any)[`rules.${index}.value`] }}
                </p>
              </div>

              <!-- Active Rule Checkbox -->
              <label class="flex items-center gap-2">
                <input
                  :model-value="rule.value.active"
                  @update:model-value="(value: any) => updateRuleField(index, 'active', value)"
                  type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 accent-[rgb(0,33,71)]"
                />
                <span class="text-sm text-background-dark-600">Active rule</span>
              </label>
            </div>

            <!-- Delete Button -->
            <button
              type="button"
              class="bg-white border border-red-200 text-red-600 rounded-lg p-2 hover:bg-red-50 transition-all flex-shrink-0 mt-1"
              @click="removeRule(index)"
              title="Delete rule"
            >
              <span class="text-lg">🗑️</span>
            </button>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-8 text-primary-500/60 border border-dashed border-primary-500/20 rounded-lg">
        <p class="text-sm">No rules added yet</p>
        <p class="text-xs mt-1">Click "Add Rule" to create eligibility conditions</p>
      </div>
    </div>

    <!-- Form Actions -->
    <div class="border-t border-primary-500/20 pt-6 flex justify-end gap-2">
      <button
        type="button"
        class="rounded-xl border border-primary bg-white px-4 py-2 text-[11px] font-black uppercase tracking-widest text-primary transition-all hover:bg-primary hover:text-white"
        @click="$emit('cancel')"
      >
        Cancel
      </button>
      <button
        type="submit"
        :disabled="isLoading"
        class="rounded-xl bg-primary px-4 py-2 text-[11px] font-black uppercase tracking-widest text-white transition-all hover:bg-navy-600 disabled:opacity-70"
      >
        Save Discount
      </button>
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
    discount_name: values.name,
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
