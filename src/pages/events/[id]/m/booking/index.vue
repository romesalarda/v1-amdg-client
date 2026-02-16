<template>
  <EventManagementLayout :event-id="id" :event="event?.data">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Content (2/3) -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Ticket Types Section -->
        <section class="bg-white dark:bg-navy-900 border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden p-8">
          <div class="flex items-center gap-2 mb-6 pb-4 border-b border-navy-50">
            <span class="material-symbols-outlined text-primary">confirmation_number</span>
            <div class="flex-1">
              <h2 class="text-sm font-black text-primary dark:text-white uppercase tracking-widest">Ticket Types</h2>
              <p class="text-sm text-navy-600 mt-1">Define ticket categories with scopes and validity periods</p>
            </div>
            <UButton
              icon="i-heroicons-plus"
              size="sm"
              class="bg-primary text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-navy-600 transition-all"
              @click="openTicketTypeModal()"
            >
              Add Ticket Type
            </UButton>
          </div>

          <div v-if="ticketTypesLoading" class="space-y-3">
            <USkeleton v-for="i in 3" :key="i" class="h-24" />
          </div>

          <div v-else-if="ticketTypes.length" class="space-y-3">
            <div
              v-for="ticketType in ticketTypes"
              :key="ticketType.id"
              class="p-4 border border-deep-navy/10 rounded-xl bg-mist-blue/40 hover:bg-mist-blue/60 transition-colors"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <h3 class="font-semibold text-navy-900">{{ ticketType.title }}</h3>
                    <UBadge
                      :label="ticketType.scope?.replace(/_/g, ' ')"
                      :color="ticketType.scope === 'FULL_EVENT' ? 'blue' : ticketType.scope === 'SINGLE_DAY' ? 'purple' : ticketType.scope === 'WORKSHOP_ONLY' ? 'orange' : 'gray'"
                      variant="subtle"
                      size="xs"
                    />
                  </div>
                  <div class="text-sm text-navy-600 space-y-1">
                    <div v-if="ticketType.valid_from || ticketType.valid_until" class="flex items-center gap-2">
                      <span class="font-medium">Valid:</span>
                      <span>
                        {{ formatDate(ticketType.valid_from) || 'Start' }} - {{ formatDate(ticketType.valid_until) || 'End' }}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <UToggle
                    :model-value="ticketType.is_active"
                    color="green"
                    @update:model-value="toggleTicketTypeStatus(ticketType.id, $event)"
                  />
                  <UButton
                    icon="i-heroicons-pencil"
                    size="xs"
                    class="bg-white border border-navy-100 text-primary rounded-lg hover:bg-mist-blue/60 transition-all"
                    @click="openTicketTypeModal(ticketType)"
                  />
                  <UButton
                    icon="i-heroicons-trash"
                    size="xs"
                    class="bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-all"
                    @click="removeTicketType(ticketType.id)"
                  />
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8 text-navy-600">
            <p>No ticket types yet. Create one to get started.</p>
          </div>
        </section>

        <!-- Discounts Section -->
        <section class="bg-white dark:bg-navy-900 border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden p-8">
          <div class="flex items-center gap-2 mb-6 pb-4 border-b border-navy-50">
            <span class="material-symbols-outlined text-primary">percent</span>
            <div class="flex-1">
              <h2 class="text-sm font-black text-primary dark:text-white uppercase tracking-widest">Discounts</h2>
              <p class="text-sm text-navy-600 mt-1">Configure discount codes and eligibility rules</p>
            </div>
            <UButton
              icon="i-heroicons-plus"
              size="sm"
              class="bg-primary text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-navy-600 transition-all"
              @click="openDiscountModal()"
              :disabled="!packages.length"
            >
              Add Discount
            </UButton>
          </div>

          <div v-if="discountsLoading" class="space-y-3">
            <USkeleton v-for="i in 3" :key="i" class="h-28" />
          </div>

          <div v-else-if="discounts.length" class="space-y-3">
            <div
              v-for="discount in discounts"
              :key="discount.id"
              class="p-4 border border-deep-navy/10 rounded-xl bg-mist-blue/40 hover:bg-mist-blue/60 transition-colors"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <h3 class="font-semibold text-navy-900">{{ discount.name }}</h3>
                    <UBadge
                      :label="discount.discount_type === 'PERCENTAGE' ? `${(discount as any).percentage}%` : `$${formatAmount((discount as any).amount || 0)}`"
                      :color="discount.discount_type === 'PERCENTAGE' ? 'blue' : 'green'"
                      variant="subtle"
                      size="xs"
                    />
                    <UBadge
                      v-if="discount.target_package"
                      :label="discount.target_package.name"
                      color="purple"
                      variant="subtle"
                      size="xs"
                      icon="i-heroicons-cube"
                    />
                    <UBadge
                      v-if="!discount.active"
                      label="Inactive"
                      color="gray"
                      variant="subtle"
                      size="xs"
                    />
                  </div>
                  <div class="text-sm text-navy-600 space-y-1">
                    <p v-if="discount.description">{{ discount.description }}</p>
                    <div v-if="discount.rules && discount.rules.length > 0" class="mt-2">
                      <details class="cursor-pointer">
                        <summary class="font-medium text-primary hover:text-navy-700">
                          {{ discount.rules.length }} eligibility rule{{ discount.rules.length !== 1 ? 's' : '' }}
                        </summary>
                        <ul class="mt-2 ml-4 space-y-1 list-disc">
                          <li v-for="rule in discount.rules" :key="rule.rule_id" class="text-xs">
                            {{ rule.name }}
                            <span v-if="!rule.active" class="text-navy-400">(inactive)</span>
                          </li>
                        </ul>
                      </details>
                    </div>
                    <p v-else class="text-xs text-navy-400 mt-2">No eligibility rules - available to all</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <UToggle
                    :model-value="discount.active"
                    color="green"
                    @update:model-value="toggleDiscountStatus(discount.discount_id, $event)"
                  />
                  <UButton
                    icon="i-heroicons-pencil"
                    size="xs"
                    class="bg-white border border-navy-100 text-primary rounded-lg hover:bg-mist-blue/60 transition-all"
                    @click="openDiscountModal(discount)"
                  />
                  <UButton
                    icon="i-heroicons-trash"
                    size="xs"
                    class="bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-all"
                    @click="removeDiscount(discount.discount_id)"
                  />
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8 text-navy-600">
            <p>No discounts configured yet</p>
            <p class="text-xs mt-2 text-navy-400">Create discounts with eligibility rules for your event</p>
          </div>
        </section>

        <!-- Booking Packages Section -->
        <section class="bg-white dark:bg-navy-900 border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden p-8">
          <div class="flex items-center gap-2 mb-6 pb-4 border-b border-navy-50">
            <span class="material-symbols-outlined text-primary">inventory_2</span>
            <div class="flex-1">
              <h2 class="text-sm font-black text-primary dark:text-white uppercase tracking-widest">Booking Packages</h2>
              <p class="text-sm text-navy-600 mt-1">Create pricing packages linked to ticket types</p>
            </div>
            <UButton
              icon="i-heroicons-plus"
              size="sm"
              class="bg-primary text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-navy-600 transition-all"
              @click="openPackageModal()"
              :disabled="!ticketTypes.length"
            >
              Add Package
            </UButton>
          </div>

          <div v-if="packagesLoading" class="space-y-3">
            <USkeleton v-for="i in 3" :key="i" class="h-28" />
          </div>

          <div v-else-if="packages.length" class="space-y-3">
            <div
              v-for="pkg in packages"
              :key="pkg.id"
              class="p-4 border border-deep-navy/10 rounded-xl bg-mist-blue/40 hover:bg-mist-blue/60 transition-colors"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <h3 class="font-semibold text-navy-900">{{ pkg.name }}</h3>
                  </div>
                  <div class="text-sm text-navy-600 space-y-1">
                    <div class="flex items-center gap-2">
                      <span class="font-medium">Ticket Type:</span>
                      <span>{{ getTicketTypeName(pkg.ticket_type) }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="font-medium">Price:</span>
                      <span class="text-primary font-semibold">{{ formatAmount(pkg.base_amount, pkg.base_amount_currency) }}</span>
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <UToggle
                    :model-value="pkg.is_active"
                    color="green"
                    @update:model-value="togglePackageStatus(pkg.id, $event)"
                  />
                  <UButton
                    icon="i-heroicons-pencil"
                    size="xs"
                    class="bg-white border border-navy-100 text-primary rounded-lg hover:bg-mist-blue/60 transition-all"
                    @click="openPackageModal(pkg)"
                  />
                  <UButton
                    icon="i-heroicons-trash"
                    size="xs"
                    class="bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-all"
                    @click="removePackage(pkg.id)"
                  />
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8 text-navy-600">
            <p v-if="!ticketTypes.length">Create ticket types first before adding packages</p>
            <p v-else>No packages yet. Create one to get started.</p>
          </div>
        </section>

        <!-- Alternative Sign-ins Section -->
        <section class="bg-white dark:bg-navy-900 border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden p-8">
          <div class="flex items-center gap-2 mb-6 pb-4 border-b border-navy-50">
            <span class="material-symbols-outlined text-primary">login</span>
            <div class="flex-1">
              <h2 class="text-sm font-black text-primary dark:text-white uppercase tracking-widest">Alternative Sign-ins</h2>
              <p class="text-sm text-navy-600 mt-1">Configure additional check-in methods for attendees</p>
            </div>
            <UButton
              icon="i-heroicons-plus"
              size="sm"
              class="bg-primary text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-navy-600 transition-all"
              @click="openSignInModal()"
            >
              Add Method
            </UButton>
          </div>

          <div v-if="signInsLoading" class="space-y-3">
            <USkeleton v-for="i in 2" :key="i" class="h-16" />
          </div>

          <div v-else-if="signIns.length" class="space-y-3">
            <div
              v-for="signIn in signIns"
              :key="signIn.id"
              class="p-3 border border-deep-navy/10 rounded-xl bg-mist-blue/40 hover:bg-mist-blue/60 transition-colors"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h3 class="font-semibold text-navy-900">{{ signIn.title }}</h3>
                  <p v-if="(signIn as any).description" class="text-sm text-navy-600 mt-1">
                    {{ (signIn as any).description }}
                  </p>
                  <div v-if="(signIn as any).format_match" class="mt-2 flex items-center gap-2">
                    <UBadge color="blue" variant="subtle" size="xs">
                      Pattern: {{ getPatternLabel((signIn as any).format_match) }}
                    </UBadge>
                    <span v-if="signIn.max_uses_per_signin" class="text-xs text-navy-500">
                      Max uses: {{ signIn.max_uses_per_signin }}
                    </span>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <UButton
                    icon="i-heroicons-pencil"
                    size="xs"
                    class="bg-white border border-navy-100 text-primary rounded-lg hover:bg-mist-blue/60 transition-all"
                    @click="openSignInModal(signIn)"
                  />
                  <UButton
                    icon="i-heroicons-trash"
                    size="xs"
                    class="bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-all"
                    @click="removeSignIn(signIn.id)"
                  />
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8 text-navy-600">
            <p>No alternative sign-in methods configured</p>
            <p class="text-xs mt-2 text-navy-400">Add methods like QR codes, RFID, etc.</p>
          </div>
        </section>
      </div>

      <!-- Sidebar (1/3) -->
      <div class="space-y-6">
        <!-- Booking Status Card -->
        <section class="bg-white dark:bg-navy-900 border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
          <div class="bg-primary px-6 py-4">
            <h3 class="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
              <span class="material-symbols-outlined text-base">dashboard</span>
              Booking Status
            </h3>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <div class="text-2xl font-bold text-navy-900">{{ ticketTypes.length }}</div>
              <div class="text-sm text-navy-600">Total Ticket Types</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-navy-900">{{ packages.length }}</div>
              <div class="text-sm text-navy-600">Total Packages</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-green-600">{{ activePackagesCount }}</div>
              <div class="text-sm text-navy-600">Active Packages</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-blue-600">{{ discounts.length }}</div>
              <div class="text-sm text-navy-600">Configured Discounts</div>
            </div>
          </div>
        </section>

        <!-- Help Card -->
        <section class="bg-white dark:bg-navy-900 border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
          <div class="px-6 py-4 border-b border-navy-50 flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-xl">lightbulb</span>
            <h3 class="text-[11px] font-black text-primary uppercase tracking-widest">Setup Tips</h3>
          </div>
          <div class="p-6 text-sm space-y-3 text-navy-600">
            <p>
              <strong>Ticket Types</strong> define the scope and validity of tickets (full event, single day, or custom range).
            </p>
            <p>
              <strong>Packages</strong> are pricing tiers linked to ticket types. Create multiple packages for different pricing options.
            </p>
            <p>
              <strong>Alternative Sign-ins</strong> provide additional ways for attendees to check in (QR codes, RFID cards, etc.).
            </p>
          </div>
        </section>
      </div>
    </div>

    <!-- Add/Edit Ticket Type Modal -->
    <UModal v-model="showTicketTypeModal" size="lg">
      <div class="bg-white dark:bg-navy-900 border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden p-6">
        <div class="flex items-center gap-2 mb-6 pb-4 border-b border-navy-50">
          <span class="material-symbols-outlined text-primary">confirmation_number</span>
          <h3 class="text-sm font-black text-primary dark:text-white uppercase tracking-widest">
            {{ editingTicketType ? 'Edit Ticket Type' : 'Add Ticket Type' }}
          </h3>
        </div>

        <TicketTypeForm
          :model-value="editingTicketType"
          :event-start-date="event?.data?.start_datetime"
          :event-end-date="event?.data?.end_datetime"
          @submit="handleTicketTypeSubmit"
          @cancel="closeTicketTypeModal"
        />
      </div>
    </UModal>

    <!-- Add/Edit Package Modal -->
    <UModal v-model="showPackageModal" size="xl">
      <div class="bg-white dark:bg-navy-900 border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden p-6">
        <div class="flex items-center gap-2 mb-6 pb-4 border-b border-navy-50">
          <span class="material-symbols-outlined text-primary">inventory_2</span>
          <h3 class="text-sm font-black text-primary dark:text-white uppercase tracking-widest">
            {{ editingPackage ? 'Edit Booking Package' : 'Add Booking Package' }}
          </h3>
        </div>

        <BookingPackageForm
          :model-value="editingPackage"
          :event-id="Number(id)"
          :ticket-types="ticketTypes"
          @submit="handlePackageSubmit"
          @cancel="closePackageModal"
        />
      </div>
    </UModal>

    <!-- Add/Edit Alternative Sign-in Modal -->
    <UModal v-model="showSignInModal" size="lg">
      <div class="bg-white dark:bg-navy-900 border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden p-6">
        <div class="flex items-center gap-2 mb-6 pb-4 border-b border-navy-50">
          <span class="material-symbols-outlined text-primary">login</span>
          <h3 class="text-sm font-black text-primary dark:text-white uppercase tracking-widest">
            {{ editingSignIn ? 'Edit Sign-in Method' : 'Add Sign-in Method' }}
          </h3>
        </div>

        <form @submit="onSubmitSignIn" class="space-y-4 text-background-dark-600">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-background-dark-600" for="signin-title">
              Method Name <span class="text-red-500">*</span>
            </label>
            <input
              id="signin-title"
              v-model="signInForm.title"
              type="text"
              placeholder="e.g. Community ID, RFID Card, QR Code"
              required
              class="w-full rounded-xl border border-primary-500/20 bg-white px-4 py-2 text-sm text-background-dark-600 placeholder:text-background-dark-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-background-dark-600" for="signin-description">
              Description
            </label>
            <textarea
              id="signin-description"
              v-model="signInForm.description"
              placeholder="Describe how this sign-in method works..."
              rows="3"
              class="w-full rounded-xl border border-primary-500/20 bg-white px-4 py-2 text-sm text-background-dark-600 placeholder:text-background-dark-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            ></textarea>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-background-dark-600" for="format-pattern">
              ID Format Pattern (Optional)
            </label>
            <select
              id="format-pattern"
              v-model="signInForm.patternType"
              class="w-full rounded-xl border border-primary-500/20 bg-white px-4 py-2 text-sm text-background-dark-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option v-for="option in patternOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
            
            <div v-if="signInForm.patternType === 'custom'" class="p-3 bg-mist-blue/40 rounded-lg space-y-2">
              <input
                v-model="signInForm.format_match"
                type="text"
                placeholder="Enter custom regex pattern"
                class="w-full rounded-lg border border-primary-500/20 bg-white px-3 py-2 text-sm text-background-dark-600 placeholder:text-background-dark-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p class="text-xs text-primary-500/60">
                Advanced: Enter a regular expression pattern
              </p>
            </div>
            
            <div v-else-if="signInForm.patternType && signInForm.patternType !== 'none'" class="p-3 bg-mist-blue/40 rounded-lg">
              <p class="text-sm text-background-dark-600">
                <strong>Pattern:</strong> <span class="font-mono text-primary">{{ (patternExamples as Record<string, any>)[signInForm.patternType]?.example }}</span>
              </p>
              <p class="text-xs text-primary-500/60 mt-1">
                {{ (patternExamples as Record<string, any>)[signInForm.patternType]?.description }}
              </p>
            </div>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-background-dark-600" for="max-uses">
              Max Uses Per Sign-in (Optional)
            </label>
            <input
              id="max-uses"
              v-model="signInForm.max_uses_per_signin"
              type="number"
              min="1"
              placeholder="Leave empty for unlimited"
              class="w-full rounded-xl border border-primary-500/20 bg-white px-4 py-2 text-sm text-background-dark-600 placeholder:text-background-dark-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button
              type="button"
              class="rounded-xl border border-primary bg-white px-4 py-2 text-[11px] font-black uppercase tracking-widest text-primary transition-all hover:bg-primary hover:text-white"
              @click="closeSignInModal()"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="signInMutationLoading"
              class="rounded-xl bg-primary px-4 py-2 text-[11px] font-black uppercase tracking-widest text-white transition-all hover:bg-navy-600 disabled:opacity-70"
            >
              {{ editingSignIn ? 'Update Method' : 'Create Method' }}
            </button>
          </div>
        </form>
      </div>
    </UModal>

    <!-- Add/Edit Discount Modal -->
    <UModal v-model="showDiscountModal" size="xl">
      <div class="bg-white dark:bg-navy-900 border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden p-6">
        <div class="flex items-center gap-2 mb-6 pb-4 border-b border-navy-50">
          <span class="material-symbols-outlined text-primary">percent</span>
          <h3 class="text-sm font-black text-primary dark:text-white uppercase tracking-widest">
            {{ editingDiscount ? 'Edit Discount' : 'Add Discount' }}
          </h3>
        </div>

        <DiscountForm
          :model-value="editingDiscount"
          :event-id="Number(id)"
          :is-loading="discountMutationLoading"
          :packages="packages"
          :selected-package-id="selectedPackageForDiscount"
          @submit="handleDiscountSubmit"
          @cancel="closeDiscountModal"
        />
      </div>
    </UModal>
  </EventManagementLayout>
</template>

<script setup lang="ts">
import { useEvent } from '~/composables/resources/events/events'
import { 
  useBookingTicketTypes, 
  useCreateBookingTicketType, 
  usePartialUpdateBookingTicketType,
  useDeleteBookingTicketType 
} from '~/composables/resources/booking/bookingTicketTypes'
import { 
  useBookingPackages, 
  useCreateBookingPackage, 
  usePartialUpdateBookingPackage,
  useDeleteBookingPackage 
} from '~/composables/resources/booking/bookingPackages'
import { 
  useBookingAlternativeSignins, 
  useCreateBookingAlternativeSignin,
  usePartialUpdateBookingAlternativeSignin,
  useDeleteBookingAlternativeSignin 
} from '~/composables/resources/booking/bookingAlternativeSignins'
import { 
  usePaymentDiscounts,
  useUpdatePaymentDiscount,
  usePartialUpdatePaymentDiscount,
  useDeletePaymentDiscount,
} from '~/composables/resources/payments/paymentDiscounts'
import { useCreateBookingPackageDiscount } from '~/composables/resources/booking/bookingPackageDiscounts'
import { 
  useCreatePaymentDiscountRule,
  useDeletePaymentDiscountRule,
} from '~/composables/resources/payments/paymentDiscountRules'
import EventManagementLayout from '~/components/events/EventManagementLayout.vue'
import TicketTypeForm from '~/components/events/forms/TicketTypeForm.vue'
import BookingPackageForm from '~/components/events/forms/BookingPackageForm.vue'
import DiscountForm from '~/components/events/forms/DiscountForm.vue'

definePageMeta({
  layout: false,
})

const route = useRoute()
const id = computed(() => String(route.params.id))
const toast = useToast()

// Fetch event data
const { data: event } = useEvent(id)

// Extract event PK from the event data
const event_pk = computed(() => event.value?.data?.id || null)

// Fetch booking data
const eventIdFilter = computed(() => ({ event__event_id: route.params.id as string }))
const { data: ticketTypesData, isLoading: ticketTypesLoading, refetch: refetchTicketTypes } = useBookingTicketTypes(eventIdFilter)
const { data: packagesData, isLoading: packagesLoading, refetch: refetchPackages } = useBookingPackages(eventIdFilter)
const { data: signInsData, isLoading: signInsLoading, refetch: refetchSignIns } = useBookingAlternativeSignins(eventIdFilter)

// Fetch discounts for this event using the same event filter
const { data: discountsData, isLoading: discountsLoading, refetch: refetchDiscounts } = usePaymentDiscounts(eventIdFilter)

const ticketTypes = computed(() => ticketTypesData.value?.data?.results || [])
const packages = computed(() => packagesData.value?.data?.results || [])
const signIns = computed(() => signInsData.value?.data?.results || [])
const discounts = computed(() => discountsData.value?.data?.results || [])

const activePackagesCount = computed(() => packages.value.filter((p: any) => p.is_active).length)

// Ticket Type Modal & CRUD
const showTicketTypeModal = ref(false)
const editingTicketType = ref<any>(null)

const createTicketTypeMutation = useCreateBookingTicketType()
const updateTicketTypeMutation = usePartialUpdateBookingTicketType()
const deleteTicketTypeMutation = useDeleteBookingTicketType()

const ticketTypeMutationLoading = computed(() => 
  createTicketTypeMutation.isPending.value || updateTicketTypeMutation.isPending.value
)

const openTicketTypeModal = (ticketType?: any) => {
  editingTicketType.value = ticketType || null
  showTicketTypeModal.value = true
}

const closeTicketTypeModal = () => {
  showTicketTypeModal.value = false
  editingTicketType.value = null
}

const handleTicketTypeSubmit = async (data: any) => {
  try {
    if (editingTicketType.value) {
      await updateTicketTypeMutation.mutateAsync({
        ticketTypeId: editingTicketType.value.id,
        body: data,
      })
      toast.add({
        title: 'Ticket type updated',
        color: 'green',
      })
    } else {
      await createTicketTypeMutation.mutateAsync({
        ...data,
        event: Number(route.params.id),
      })
      toast.add({
        title: 'Ticket type created',
        color: 'green',
      })
    }

    closeTicketTypeModal()
    refetchTicketTypes()
  } catch (error) {
    toast.add({
      title: editingTicketType.value ? 'Failed to update ticket type' : 'Failed to create ticket type',
      description: error instanceof Error ? error.message : 'An error occurred',
      color: 'red',
    })
  }
}

const toggleTicketTypeStatus = async (ticketTypeId: number, isActive: boolean) => {
  try {
    await updateTicketTypeMutation.mutateAsync({
      ticketTypeId,
      body: { is_active: isActive },
    })
    toast.add({
      title: 'Status updated',
      color: 'green',
    })
    refetchTicketTypes()
  } catch (error) {
    toast.add({
      title: 'Failed to update status',
      description: error instanceof Error ? error.message : 'An error occurred',
      color: 'red',
    })
  }
}

const removeTicketType = async (ticketTypeId: number) => {
  if (!confirm('Remove this ticket type? This may affect existing packages.')) return

  try {
    await deleteTicketTypeMutation.mutateAsync(ticketTypeId)
    toast.add({
      title: 'Ticket type removed',
      color: 'green',
    })
    refetchTicketTypes()
    refetchPackages()
  } catch (error) {
    toast.add({
      title: 'Failed to remove ticket type',
      description: error instanceof Error ? error.message : 'An error occurred',
      color: 'red',
    })
  }
}

// Package Modal & CRUD
const showPackageModal = ref(false)
const editingPackage = ref<any>(null)

const createPackageMutation = useCreateBookingPackage()
const updatePackageMutation = usePartialUpdateBookingPackage()
const deletePackageMutation = useDeleteBookingPackage()

const packageMutationLoading = computed(() => 
  createPackageMutation.isPending.value || updatePackageMutation.isPending.value
)

const openPackageModal = (pkg?: any) => {
  editingPackage.value = pkg || null
  showPackageModal.value = true
}

const closePackageModal = () => {
  showPackageModal.value = false
  editingPackage.value = null
}

const handlePackageSubmit = async (data: any) => {
  try {
    if (editingPackage.value) {
      await updatePackageMutation.mutateAsync({
        packageId: editingPackage.value.id,
        body: data,
      })
      toast.add({
        title: 'Package updated',
        color: 'green',
      })
    } else {
      await createPackageMutation.mutateAsync({
        ...data,
        event: Number(event.value?.data.id),
      })
      toast.add({
        title: 'Package created',
        color: 'green',
      })
    }

    closePackageModal()
    refetchPackages()
  } catch (error) {
    toast.add({
      title: editingPackage.value ? 'Failed to update package' : 'Failed to create package',
      description: error instanceof Error ? error.message : 'An error occurred',
      color: 'red',
    })
  }
}

const togglePackageStatus = async (packageId: number, isActive: boolean) => {
  try {
    await updatePackageMutation.mutateAsync({
      packageId,
      body: { is_active: isActive },
    })
    toast.add({
      title: 'Status updated',
      color: 'green',
    })
    refetchPackages()
  } catch (error) {
    toast.add({
      title: 'Failed to update status',
      description: error instanceof Error ? error.message : 'An error occurred',
      color: 'red',
    })
  }
}

const removePackage = async (packageId: number) => {
  if (!confirm('Remove this booking package?')) return

  try {
    await deletePackageMutation.mutateAsync(packageId)
    toast.add({
      title: 'Package removed',
      color: 'green',
    })
    refetchPackages()
  } catch (error) {
    toast.add({
      title: 'Failed to remove package',
      description: error instanceof Error ? error.message : 'An error occurred',
      color: 'red',
    })
  }
}

// Discount Modal & CRUD
const showDiscountModal = ref(false)
const editingDiscount = ref<any>(null)
const selectedPackageForDiscount = ref<number | null>(null)

const createDiscountMutation = useCreateBookingPackageDiscount()
const updateDiscountMutation = usePartialUpdatePaymentDiscount()
const deleteDiscountMutation = useDeletePaymentDiscount()
const createDiscountRuleMutation = useCreatePaymentDiscountRule()
const deleteDiscountRuleMutation = useDeletePaymentDiscountRule()

const discountMutationLoading = computed(() => 
  createDiscountMutation.isPending.value || updateDiscountMutation.isPending.value
)

const openDiscountModal = (discount?: any, packageId?: number) => {
  editingDiscount.value = discount || null
  selectedPackageForDiscount.value = packageId || null
  showDiscountModal.value = true
}

const closeDiscountModal = () => {
  showDiscountModal.value = false
  editingDiscount.value = null
  selectedPackageForDiscount.value = null
}

const handleDiscountSubmit = async (data: any) => {
  try {    
    const discountData = {
      name: data.name,
      description: data.description || undefined,
      discount_type: data.discount_type,
      percentage: data.discount_type === 'PERCENTAGE' ? data.percentage : undefined,
      amount: data.discount_type === 'FIXED' ? data.amount : undefined,
      active: data.active,
    }

    let discountId: number

    if (editingDiscount.value) {
      // Update existing discount
      const result = await updateDiscountMutation.mutateAsync({
        discountId: editingDiscount.value.discount_id,
        body: discountData,
      })
      discountId = editingDiscount.value.id

      // Smart rule diffing: only modify what changed
      const existingRules = editingDiscount.value.rules || []
      const newRules = data.rules || []
      
      // Since rules don't have IDs in the form (they're created fresh),
      // we'll use a simple strategy: delete all and recreate
      // This is simpler than trying to match rules by content
      // Future enhancement: Add rule IDs to form to enable smart diffing
      const deletePromises = existingRules.map((rule: any) =>
        deleteDiscountRuleMutation.mutateAsync(rule.rule_id)
      )
      
      try {
        await Promise.allSettled(deletePromises)
      } catch (error) {
        console.error('Error deleting rules:', error)
        // Continue with creation even if deletion fails
      }

      toast.add({
        title: 'Discount updated',
        color: 'green',
      })
    } else {
      // Create new discount - must have a package selected
      const packageId = data.packageId || selectedPackageForDiscount.value
      if (!packageId) {
        toast.add({
          title: 'Please select a booking package',
          color: 'orange',
        })
        return
      }

      // Use the new package-specific endpoint
      const result = await createDiscountMutation.mutateAsync({
        packageId,
        discount: discountData
      })
      discountId = (result.data as any)?.id

      toast.add({
        title: 'Discount created',
        color: 'green',
      })
    }

    // Create rules if any
    if (data.rules && data.rules.length > 0) {
      const createRulePromises = data.rules.map((rule: any) =>
        createDiscountRuleMutation.mutateAsync({
          rule_type: rule.rule_type,
          name: rule.name,
          description: rule.description || undefined,
          value: rule.value || undefined,
          active: rule.active ?? true,
          discount: discountId,
        })
      )

      try {
        const results = await Promise.allSettled(createRulePromises)
        const failed = results.filter((r: any) => r.status === 'rejected').length
        if (failed > 0) {
          toast.add({
            title: `Warning: ${failed} rule(s) failed to create`,
            color: 'orange',
          })
        }
      } catch (error) {
        // Individual failures already handled by Promise.allSettled
        console.error('Error creating rules:', error)
      }
    }

    closeDiscountModal()
    refetchDiscounts()
  } catch (error) {
    toast.add({
      title: editingDiscount.value ? 'Failed to update discount' : 'Failed to create discount',
      description: error instanceof Error ? error.message : 'An error occurred',
      color: 'red',
    })
  }
}

const toggleDiscountStatus = async (discountId: string, isActive: boolean) => {
  try {
    await updateDiscountMutation.mutateAsync({
      discountId,
      body: { active: isActive },
    })
    toast.add({
      title: 'Status updated',
      color: 'green',
    })
    refetchDiscounts()
  } catch (error) {
    toast.add({
      title: 'Failed to update status',
      description: error instanceof Error ? error.message : 'An error occurred',
      color: 'red',
    })
  }
}

const removeDiscount = async (discountId: string) => {
  if (!confirm('Remove this discount? This will also delete all associated rules.')) return

  try {
    await deleteDiscountMutation.mutateAsync(discountId)
    toast.add({
      title: 'Discount removed',
      color: 'green',
    })
    refetchDiscounts()
  } catch (error) {
    toast.add({
      title: 'Failed to remove discount',
      description: error instanceof Error ? error.message : 'An error occurred',
      color: 'red',
    })
  }
}

// Alternative Sign-in Modal & CRUD
const showSignInModal = ref(false)
const signInForm = reactive({
  title: '',
  description: '',
  patternType: 'none',
  format_match: '',
  max_uses_per_signin: '',
})

// Pattern options for user-friendly selection
const patternOptions = [
  { label: 'No Pattern (Any Format)', value: 'none' },
  { label: 'Numeric Only (e.g., 12345)', value: 'numeric' },
  { label: 'Alphanumeric (e.g., ABC123)', value: 'alphanumeric' },
  { label: 'Dashed Numbers (e.g., 1234-5678-9012)', value: 'dashed-numeric' },
  { label: 'Email Format', value: 'email' },
  { label: 'Custom Regex', value: 'custom' },
]

const patternExamples: Record<string, { regex: string; example: string; description: string }> = {
  numeric: {
    regex: String.raw`^\d+$`,
    example: '12345',
    description: 'Only numbers allowed'
  },
  alphanumeric: {
    regex: String.raw`^[A-Za-z0-9]+$`,
    example: 'ABC123',
    description: 'Letters and numbers only'
  },
  'dashed-numeric': {
    regex: String.raw`^\d{4}-\d{4}-\d{4}$`,
    example: '1234-5678-9012',
    description: 'Four digits, dash, four digits, dash, four digits'
  },
  email: {
    regex: String.raw`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`,
    example: 'user@example.com',
    description: 'Valid email address format'
  }
}

const selectedPatternLabel = computed(() => {
  const option = patternOptions.find(o => o.value === signInForm.patternType)
  return option?.label || ''
})

const editingSignIn = ref<any>(null)
const addSignInMutation = useCreateBookingAlternativeSignin()
const updateSignInMutation = usePartialUpdateBookingAlternativeSignin()
const deleteSignInMutation = useDeleteBookingAlternativeSignin()

const signInMutationLoading = computed(() => 
  addSignInMutation.isPending.value || updateSignInMutation.isPending.value
)

// Helper to detect pattern type from regex
const detectPatternType = (formatMatch: string | null): string => {
  if (!formatMatch) return 'none'
  
  for (const [key, pattern] of Object.entries(patternExamples)) {
    if (pattern.regex === formatMatch) {
      return key
    }
  }
  return 'custom'
}

const openSignInModal = (signIn?: any) => {
  if (signIn) {
    editingSignIn.value = signIn
    const detectedType = detectPatternType(signIn.format_match)
    signInForm.title = signIn.title || ''
    signInForm.description = signIn.description || ''
    signInForm.patternType = detectedType
    signInForm.format_match = detectedType === 'custom' ? (signIn.format_match || '') : ''
    signInForm.max_uses_per_signin = signIn.max_uses_per_signin ? String(signIn.max_uses_per_signin) : ''
  } else {
    editingSignIn.value = null
    signInForm.title = ''
    signInForm.description = ''
    signInForm.patternType = 'none'
    signInForm.format_match = ''
    signInForm.max_uses_per_signin = ''
  }
  showSignInModal.value = true
}

const closeSignInModal = () => {
  showSignInModal.value = false
  editingSignIn.value = null
  signInForm.title = ''
  signInForm.description = ''
  signInForm.patternType = 'none'
  signInForm.format_match = ''
  signInForm.max_uses_per_signin = ''
}

const onSubmitSignIn = async (e: Event) => {
  e.preventDefault()

  try {
    // Get the regex pattern based on selection
    let formatMatch = null
    if (signInForm.patternType === 'custom') {
      formatMatch = signInForm.format_match || null
    } else if (signInForm.patternType !== 'none' && patternExamples[signInForm.patternType]) {
      formatMatch = patternExamples[signInForm.patternType].regex
    }

    const data = {
      title: signInForm.title,
      description: signInForm.description || undefined,
      format_match: formatMatch,
      max_uses_per_signin: signInForm.max_uses_per_signin ? Number(signInForm.max_uses_per_signin) : null,
      is_active: true,
    }

    if (editingSignIn.value) {
      // Update existing sign-in method
      await updateSignInMutation.mutateAsync({
        signinId: editingSignIn.value.id,
        body: data,
      })
      toast.add({
        title: 'Sign-in method updated',
        color: 'green',
      })
    } else {
      // Create new sign-in method
      await addSignInMutation.mutateAsync({
        ...data,
        event: Number(event_pk.value),
      })
      toast.add({
        title: 'Sign-in method created',
        color: 'green',
      })
    }

    closeSignInModal()
    refetchSignIns()
  } catch (error) {
    toast.add({
      title: editingSignIn.value ? 'Failed to update sign-in method' : 'Failed to create sign-in method',
      description: error instanceof Error ? error.message : 'An error occurred',
      color: 'red',
    })
  }
}

const removeSignIn = async (signInId: string) => {
  if (!confirm('Remove this sign-in method?')) return

  try {
    await deleteSignInMutation.mutateAsync(signInId)
    toast.add({
      title: 'Sign-in method removed',
      color: 'green',
    })
    refetchSignIns()
  } catch (error) {
    toast.add({
      title: 'Failed to remove sign-in method',
      description: error instanceof Error ? error.message : 'An error occurred',
      color: 'red',
    })
  }
}

// Helper functions
const formatDate = (date: string | null) => {
  if (!date) return null
  return new Date(date).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  })
}

const formatAmount = (amount: string | number, currency?: string) => {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: currency || 'USD' 
  }).format(Number(amount))
}

const getTicketTypeName = (ticketTypeId: number) => {
  const ticketType = ticketTypes.value.find((t: any) => t.id === ticketTypeId)
  // filter any _
  return ticketType?.title.replace(/_/g, ' ') || 'Unknown'
}

const getPatternLabel = (formatMatch: string | null): string => {
  if (!formatMatch) return 'None'
  
  const patternType = detectPatternType(formatMatch)
  if (patternType === 'custom') return 'Custom Regex'
  
  const pattern = patternExamples[patternType]
  return pattern ? pattern.example : 'Custom'
}
</script>