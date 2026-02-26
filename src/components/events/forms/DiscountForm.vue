<template>
  <form @submit="onSubmit" class="flex flex-col h-full text-background-dark-600">
    <!-- Scrollable Content Area -->
    <div class="flex-1 overflow-y-auto space-y-4 pb-20 pr-2">
      
      <!-- Section 1: Basic Information -->
      <div class="space-y-3">
        <div class="flex items-center gap-2 pb-2 border-b border-primary-500/20">
          <span class="material-symbols-outlined text-primary text-lg">description</span>
          <h3 class="text-xs font-black text-primary uppercase tracking-widest">Basic Information</h3>
        </div>
        
        <div class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2 md:col-span-2">
              <label class="block text-sm font-medium text-background-dark-600" for="discount-name">
                Discount Name <span class="text-red-500">*</span>
              </label>
              <input
                id="discount-name"
                v-model="name"
                v-bind="nameAttrs"
                type="text"
                placeholder="e.g. Early Bird, Student Discount"
                class="w-full rounded-xl border border-primary-500/20 bg-white px-4 py-2.5 text-sm text-background-dark-600 placeholder:text-background-dark-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p v-if="errors.name" class="text-xs text-red-500">{{ errors.name }}</p>
            </div>

            <div class="space-y-2 md:col-span-2">
              <label class="block text-sm font-medium text-background-dark-600" for="discount-description">
                Description
              </label>
              <textarea
                id="discount-description"
                v-model="description"
                v-bind="descriptionAttrs"
                placeholder="Additional details..."
                rows="2"
                class="w-full rounded-xl border border-primary-500/20 bg-white px-4 py-2.5 text-sm text-background-dark-600 placeholder:text-background-dark-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              ></textarea>
            </div>
          </div>

          <!-- Package Selector/Display -->
          <div v-if="!modelValue" class="space-y-2">
            <label class="block text-sm font-medium text-background-dark-600" for="discount-package">
              Booking Package <span class="text-red-500">*</span>
            </label>
            <select
              id="discount-package"
              v-model="packageId"
              v-bind="packageIdAttrs"
              :disabled="packages.length === 0"
              class="w-full rounded-xl border border-primary-500/20 bg-white px-4 py-2.5 text-sm text-background-dark-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
            >
              <option value="" disabled>Select a booking package</option>
              <option v-for="pkg in packages" :key="pkg.id" :value="pkg.id">
                {{ pkg.name }} - ${{ Number(pkg.base_amount).toFixed(2) }}
              </option>
            </select>
            <p v-if="packages.length === 0" class="text-xs text-orange-500">
              Create a booking package first
            </p>
            <p v-if="errors.packageId" class="text-xs text-red-500">{{ errors.packageId }}</p>
          </div>

          <div v-else-if="modelValue?.target_package" class="space-y-2">
            <label class="block text-sm font-medium text-background-dark-600">
              Linked Package
            </label>
            <div class="flex items-center gap-3 p-4 bg-mist-blue/40 rounded-lg border border-primary-500/20">
              <span class="material-symbols-outlined text-primary-500/60">inventory_2</span>
              <span class="font-medium text-background-dark-600">{{ modelValue.target_package.name }}</span>
              <span class="ml-auto text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Fixed</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 2: Discount Configuration -->
      <div class="space-y-3">
        <div class="flex items-center gap-2 pb-2 border-b border-primary-500/20">
          <span class="material-symbols-outlined text-primary text-lg">sell</span>
          <h3 class="text-xs font-black text-primary uppercase tracking-widest">Discount Configuration</h3>
        </div>
        
        <div class="space-y-4">
          <div class="space-y-3">
            <label class="block text-sm font-medium text-background-dark-600">
              Type <span class="text-red-500">*</span>
            </label>
            <div class="grid grid-cols-2 gap-3">
              <label
                v-for="type in discountTypes"
                :key="type.value"
                class="flex items-start gap-2 p-3 border-2 border-primary-500/20 rounded-lg hover:bg-mist-blue/50 transition-colors cursor-pointer"
                :class="{ 'border-primary bg-mist-blue/60': discount_type === type.value }"
              >
                <input
                  v-model="discount_type"
                  v-bind="discount_typeAttrs"
                  type="radio"
                  :value="type.value"
                  class="mt-0.5 h-4 w-4 border border-navy-300 bg-white accent-[rgb(0,33,71)]"
                />
                <div class="flex-1">
                  <span class="block font-medium text-primary text-sm">{{ type.label }}</span>
                  <p class="text-xs text-primary-500/60 mt-1">{{ type.description }}</p>
                </div>
              </label>
            </div>
            <p v-if="errors.discount_type" class="text-xs text-red-500">{{ errors.discount_type }}</p>
          </div>

          <!-- Value Fields -->
          <div v-if="discount_type === 'PERCENTAGE'" class="p-4 bg-mist-blue/40 rounded-lg space-y-2">
            <label class="block text-sm font-medium text-background-dark-600" for="discount-percentage">
              Percentage <span class="text-red-500">*</span>
            </label>
            <div class="flex items-center gap-3">
              <input
                id="discount-percentage"
                v-model="percentage"
                v-bind="percentageAttrs"
                type="text"
                inputmode="decimal"
                placeholder="10"
                class="flex-1 rounded-xl border border-primary-500/20 bg-white px-4 py-2.5 text-sm text-background-dark-600 placeholder:text-background-dark-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <span class="text-primary-500/60 font-medium text-lg">%</span>
            </div>
            <p v-if="errors.percentage" class="text-xs text-red-500">{{ errors.percentage }}</p>
          </div>

          <div v-if="discount_type === 'FIXED'" class="p-4 bg-mist-blue/40 rounded-lg space-y-2">
            <label class="block text-sm font-medium text-background-dark-600" for="discount-amount">
              Fixed Amount <span class="text-red-500">*</span>
            </label>
            <div class="flex items-center gap-3">
              <span class="text-primary-500/60 font-medium text-lg">$</span>
              <input
                id="discount-amount"
                v-model="amount"
                v-bind="amountAttrs"
                type="text"
                inputmode="decimal"
                placeholder="50.00"
                class="flex-1 rounded-xl border border-primary-500/20 bg-white px-4 py-2.5 text-sm text-background-dark-600 placeholder:text-background-dark-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <p v-if="errors.amount" class="text-xs text-red-500">{{ errors.amount }}</p>
          </div>

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
        </div>
      </div>

      <!-- Section 3: Eligibility Rules -->
      <div class="space-y-3">
        <div class="flex items-center justify-between pb-2 border-b border-primary-500/20">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-lg">rule</span>
            <h3 class="text-xs font-black text-primary uppercase tracking-widest">Eligibility Rules</h3>
            <span class="text-xs text-primary-500/60">({{ rules.length }}/2)</span>
          </div>
          <button
            type="button"
            @click="addRule"
            class="bg-primary text-white rounded-lg text-xs font-semibold px-3 py-1.5 hover:bg-navy-600 transition-all"
          >
            Add Rule
          </button>
        </div>
        
        <div class="space-y-3">
          <!-- Rules List -->
          <div v-if="rules.length > 0" class="space-y-3">
            <div
              v-for="(rule, index) in rules"
              :key="index"
              class="border border-primary-500/20 rounded-lg bg-mist-blue/20 overflow-hidden"
            >
              <!-- Rule Header -->
              <div class="flex items-center justify-between px-4 py-2 bg-white border-b border-primary-500/20">
                <div class="flex items-center gap-3">
                  <span class="text-sm font-semibold text-primary">Rule {{ index + 1 }}</span>
                  <span v-if="rule.value.name" class="text-sm text-primary-500/60">• {{ rule.value.name }}</span>
                </div>
                <button
                  type="button"
                  class="text-red-600 hover:bg-red-50 rounded-lg p-2 transition-all"
                  @click="removeRule(index)"
                  title="Delete rule"
                >
                  <span class="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>

              <!-- Rule Content -->
              <div class="p-4 space-y-3">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <!-- Rule Type -->
                  <div class="space-y-2">
                    <label class="block text-sm font-medium text-background-dark-600">
                      Type <span class="text-red-500">*</span>
                    </label>
                    <select
                      v-model="rules[index].value.rule_type"
                      class="w-full rounded-lg border border-primary-500/20 bg-white px-4 py-2.5 text-sm text-background-dark-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="" disabled>Select type</option>
                      <option v-for="opt in ruleTypeOptions" :key="opt.value" :value="opt.value">
                        {{ opt.label }}
                      </option>
                    </select>
                    <p v-if="(errors as any)[`rules.${index}.rule_type`]" class="text-xs text-red-500">
                      {{ (errors as any)[`rules.${index}.rule_type`] }}
                    </p>
                  </div>

                  <!-- Rule Name -->
                  <div class="space-y-2">
                    <label class="block text-sm font-medium text-background-dark-600">
                      Name <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="rules[index].value.name"
                      type="text"
                      placeholder="e.g. Student Discount"
                      class="w-full rounded-lg border border-primary-500/20 bg-white px-4 py-2.5 text-sm text-background-dark-600 placeholder:text-background-dark-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <p v-if="(errors as any)[`rules.${index}.name`]" class="text-xs text-red-500">
                      {{ (errors as any)[`rules.${index}.name`] }}
                    </p>
                  </div>

                  <!-- Conditional Value Field -->
                  <div v-if="ruleRequiresValue(rule.value.rule_type)" class="space-y-2">
                    <label class="block text-sm font-medium text-background-dark-600">
                      Value <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="rules[index].value.value"
                      :placeholder="getRuleValuePlaceholder(rule.value.rule_type)"
                      type="text"
                      :inputmode="isAgeRule(rule.value.rule_type) ? 'numeric' : 'text'"
                      class="w-full rounded-lg border border-primary-500/20 bg-white px-4 py-2.5 text-sm text-background-dark-600 placeholder:text-background-dark-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <p v-if="(errors as any)[`rules.${index}.value`]" class="text-xs text-red-500">
                      {{ (errors as any)[`rules.${index}.value`] }}
                    </p>
                  </div>

                  <!-- Active Checkbox -->
                  <div class="flex items-center">
                    <label class="flex items-center gap-2 mt-8">
                      <input
                        v-model="rules[index].value.active"
                        type="checkbox"
                        class="h-4 w-4 rounded border-gray-300 accent-[rgb(0,33,71)]"
                      />
                      <span class="text-sm text-background-dark-600">Active</span>
                    </label>
                  </div>
                </div>

                <!-- Rule Description -->
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-background-dark-600">
                    Description
                  </label>
                  <textarea
                    v-model="rules[index].value.description"
                    placeholder="Optional details..."
                    rows="2"
                    class="w-full rounded-lg border border-primary-500/20 bg-white px-4 py-2.5 text-sm text-background-dark-600 placeholder:text-background-dark-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  ></textarea>
                </div>

                <!-- Rule Type Info -->
                <p v-if="rule.value.rule_type" class="text-xs text-primary-500/60 italic px-1">
                  {{ getRuleTypeDescription(rule.value.rule_type) }}
                </p>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8 text-primary-500/60 border-2 border-dashed border-primary-500/20 rounded-lg bg-gray-50/50">
            <span class="material-symbols-outlined text-3xl text-primary-500/40 mb-2">rule</span>
            <p class="text-sm mb-3">No rules configured</p>
            <button
              type="button"
              @click="addRule"
              class="text-primary text-sm font-medium hover:underline"
            >
              Add your first rule
            </button>
          </div>
        </div>
      </div>

    </div>

    <!-- Floating Footer -->
    <div class="absolute bottom-0 left-0 right-0 bg-white border-t border-primary-500/20 px-6 py-4 shadow-lg">
      <div class="flex justify-between items-center gap-4">
        <div class="flex items-center gap-2 text-sm">
          <span v-if="Object.keys(errors).length > 0" class="flex items-center gap-2 text-red-600">
            <span class="material-symbols-outlined text-lg">error</span>
            <span>{{ Object.keys(errors).length }} error{{ Object.keys(errors).length !== 1 ? 's' : '' }}</span>
          </span>
          <span v-else class="flex items-center gap-2 text-green-600">
            <span class="material-symbols-outlined text-lg">check_circle</span>
            <span>Ready to save</span>
          </span>
        </div>
        <div class="flex gap-3">
          <button
            type="button"
            class="rounded-xl border-2 border-primary bg-white px-6 py-2.5 text-[11px] font-black uppercase tracking-widest text-primary transition-all hover:bg-primary hover:text-white"
            @click="$emit('cancel')"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isLoading"
            class="rounded-xl bg-primary px-8 py-2.5 text-[11px] font-black uppercase tracking-widest text-white transition-all hover:bg-navy-600 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span v-if="isLoading" class="flex items-center gap-2">
              <span class="material-symbols-outlined animate-spin text-base">progress_activity</span>
              Saving...
            </span>
            <span v-else>Save Discount</span>
          </button>
        </div>
      </div>
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
  if (rules.value.length >= 2) {
    toast.add({
      title: 'Maximum 2 rules allowed',
      description: 'Each discount can have a maximum of 2 eligibility rules',
      color: 'orange',
    })
    return
  }
  
  pushRule({
    rule_type: 'IS_EVENT_STAFF',
    name: '',
    description: '',
    value: '',
    active: true,
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
    
    // Manually sync rules with field array
    // Clear existing
    while (rules.value.length > 0) {
      removeRule(0)
    }
    // Add from modelValue
    const rulesArray = newValue.rules || []
    rulesArray.forEach((rule: any) => {
      pushRule({
        rule_type: rule.rule_type,
        name: rule.name,
        description: rule.description || '',
        value: rule.value || '',
        active: rule.active ?? true,
      })
    })
  }
}, { immediate: true })
</script>
