<template>
  <EventManagementLayout :event-id="id" :event="event?.data">
    <!-- Help Button -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Content with Stepper (2/3) -->
      <div class="lg:col-span-2">
        <div class="flex gap-6">
          <!-- Stepper -->
          <div class="hidden md:flex flex-col items-center pt-12 relative" style="width: 48px;">
            <div class="absolute top-0 bottom-0 left-1/2 w-[1px] -translate-x-1/2 stepper-line"></div>
            
            <div class="relative z-10 mb-[380px]">
              <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold shadow-lg">1</div>
            </div>
            <div class="relative z-10 mb-[480px]">
              <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold shadow-lg">2</div>
            </div>
            <div class="relative z-10">
              <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold shadow-lg">3</div>
            </div>
          </div>

          <!-- Sections -->
          <div class="flex-1 space-y-12">
            <!-- Booking Packages Section (Step 1) -->
            <section>
              <span class="text-[10px] font-bold text-navy-400 uppercase tracking-widest block mb-2">Step 1 - Required</span>
              <div class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
                <div class="flex items-center gap-2 p-6 pb-4 border-b border-navy-50">
                  <span class="material-symbols-outlined text-primary">inventory_2</span>
                  <div class="flex-1">
                    <h3 class="text-sm font-black text-primary dark:text-white uppercase tracking-widest">Booking Packages</h3>
                    <p class="text-xs text-navy-600 mt-1">Create pricing packages linked to ticket types</p>
                  </div>
                  <button
                    @click="openPackageModal()"
                    :disabled="!ticketTypes.length"
                    v-if="canCreateRegistration"
                    class="bg-primary text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-slate-800 transition-all text-xs font-bold uppercase tracking-tight disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span class="material-symbols-outlined text-sm">add</span>
                    <span>Add Package</span>
                  </button>
                </div>

                <div class="p-6 space-y-4">
                  <div v-if="packagesLoading" class="space-y-3">
                    <div v-for="i in 3" :key="i" class="h-28 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse"></div>
                  </div>

                  <div v-else-if="packages.length" class="space-y-3">
                    <div
                      v-for="pkg in packages"
                      :key="pkg.id"
                      class="p-4 border border-deep-navy/10 rounded-xl bg-mist-blue/40 hover:bg-mist-blue/60 transition-colors"
                    >
                      <div class="flex items-start justify-between">
                        <div class="flex-1">
                          <h4 class="font-semibold text-navy-900">{{ pkg.name }}</h4>
                          <p v-if="pkg.description" class="text-sm text-navy-600 mt-1">{{ pkg.description }}</p>
                          <div class="flex items-center gap-2 mt-2">
                            <span class="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded border border-blue-100">
                              {{ formatAmount(pkg.base_amount, pkg.base_amount_currency) }}
                            </span>
                            <span class="text-xs text-navy-500">
                              Ticket: {{ getTicketTypeName(pkg.ticket_type) }}
                            </span>
                          </div>
                        </div>
                        <div class="flex items-center space-x-3">
                          <button
                            @click="togglePackageStatus(pkg.id, !pkg.is_active)"
                            :disabled="!canUpdateRegistration"
                            type="button"
                            class="w-10 h-5 rounded-full relative transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary/30" 
                            :class="pkg.is_active ? 'bg-primary hover:bg-primary/90' : 'bg-navy-200 hover:bg-navy-300'"
                          >
                            <div class="absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all duration-200 ease-in-out" :class="pkg.is_active ? 'right-1' : 'left-1'"></div>
                          </button>
                          <button
                            @click="openPackageModal(pkg)"
                            :disabled="!canUpdateRegistration"
                            class="p-1.5 text-navy-600 hover:text-primary transition-colors disabled:opacity-50"
                          >
                            <span class="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button
                            @click="removePackage(pkg.id)"
                            :disabled="!canDeleteRegistration"
                            class="p-1.5 text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                          >
                            <span class="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-else class="text-center py-8 text-navy-600">
                    <p v-if="!ticketTypes.length">Create ticket types first before adding packages</p>
                    <p v-else>No packages yet. Create one to get started.</p>
                  </div>
                </div>
              </div>
            </section>

            <!-- Discounts Section (Step 2) -->
            <section>
              <span class="text-[10px] font-bold text-navy-400 uppercase tracking-widest block mb-2">Step 2 - Recommended</span>
              <div class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
                <div class="flex items-center gap-2 p-6 pb-4 border-b border-navy-50">
                  <div class="flex-1">
                    <h3 class="text-sm font-black text-primary dark:text-white uppercase tracking-widest">Discounts</h3>
                    <p class="text-xs text-navy-600 mt-1">Configure discount rules with eligibility criteria</p>
                  </div>
                  <button
                    @click="openDiscountModal()"
                    :disabled="!packages.length"
                    v-if="canCreateRegistration"
                    class="bg-primary text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-slate-800 transition-all text-xs font-bold uppercase tracking-tight disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span class="material-symbols-outlined text-sm">add</span>
                    <span>Add Discount</span>
                  </button>
                </div>

                <div class="p-6 space-y-4">
                  <div v-if="discountsLoading" class="space-y-3">
                    <div v-for="i in 3" :key="i" class="h-28 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse"></div>
                  </div>

                  <div v-else-if="discounts.length" class="space-y-3">
                    <div
                      v-for="discount in discounts"
                      :key="discount.discount_id"
                      class="p-4 border border-deep-navy/10 rounded-xl bg-mist-blue/40 hover:bg-mist-blue/60 transition-colors"
                    >
                      <div class="flex items-start justify-between">
                        <div class="flex-1">
                          <div class="flex items-center gap-2 mb-2">
                            <h3 class="font-semibold text-navy-900">{{ discount.name }}</h3>
                            <!-- <span class="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded">
                              {{ discount.discount_type === 'PERCENTAGE' ? `${discount.discount_value}%` : formatAmount(discount.discount_value, discount.) }}
                            </span> -->
                          </div>
                          <div class="text-sm text-navy-600 space-y-1">
                            <div v-if="discount.description" class="mb-1">
                              {{ discount.description }}
                            </div>
                            <div v-if="discount.rules">
                              <ul class="list-disc list-inside text-xs text-navy-500">
                                <li v-for="(rule, index) in discount.rules" :key="index">
                                  {{ rule.name}}
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                        <div class="flex items-center space-x-3">
                          <button
                            @click="toggleDiscountStatus(discount.discount_id, !discount.active)"
                            type="button"
                            class="w-10 h-5 rounded-full relative transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/30" 
                            :class="discount.active ? 'bg-primary hover:bg-primary/90' : 'bg-navy-200 hover:bg-navy-300'"
                          >
                            <div class="absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all duration-200 ease-in-out" :class="discount.active ? 'right-1' : 'left-1'"></div>
                          </button>
                          <button
                            @click="openDiscountModal(discount)"
                            class="p-1.5 text-navy-600 hover:text-primary transition-colors"
                          >
                            <span class="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button
                            @click="removeDiscount(discount.discount_id)"
                            class="p-1.5 text-red-400 hover:text-red-600 transition-colors"
                          >
                            <span class="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-else class="text-center py-8 text-navy-600">
                    <p>No discounts configured yet</p>
                    <p class="text-xs mt-2 text-navy-400">Create discounts with eligibility rules for your event</p>
                  </div>
                </div>
              </div>
            </section>

            <!-- Ticket Types Section (Step 3) -->
            <section>
              <span class="text-[10px] font-bold text-navy-400 uppercase tracking-widest block mb-2">Step 3 - Required</span>
              <div class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
                <div class="flex items-center gap-2 p-6 pb-4 border-b border-navy-50">
                  <span class="material-symbols-outlined text-primary">confirmation_number</span>
                  <div class="flex-1">
                    <h3 class="text-sm font-black text-primary dark:text-white uppercase tracking-widest">Ticket Types</h3>
                    <p class="text-xs text-navy-600 mt-1">Define ticket categories with scopes and validity periods</p>
                  </div>
                  <button
                    @click="openTicketTypeModal()"
                    v-if="canCreateRegistration"
                    class="bg-primary text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-slate-800 transition-all text-xs font-bold uppercase tracking-tight"
                  >
                    <span class="material-symbols-outlined text-sm">add</span>
                    <span>Add Ticket Type</span>
                  </button>
                </div>

                <div class="p-6 space-y-4">
                  <div v-if="ticketTypesLoading" class="space-y-3">
                    <div v-for="i in 3" :key="i" class="h-24 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse"></div>
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
                            <span class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                              {{ ticketType.scope?.replace(/_/g, ' ') }}
                            </span>
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
                        <div class="flex items-center space-x-3">
                          <button
                            @click="toggleTicketTypeStatus(ticketType.id, !ticketType.is_active)"
                            :disabled="!canUpdateRegistration"
                            type="button"
                            class="w-10 h-5 rounded-full relative transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary/30" 
                            :class="ticketType.is_active ? 'bg-primary hover:bg-primary/90' : 'bg-navy-200 hover:bg-navy-300'"
                          >
                            <div class="absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all duration-200 ease-in-out" :class="ticketType.is_active ? 'right-1' : 'left-1'"></div>
                          </button>
                          <button
                            @click="openTicketTypeModal(ticketType)"
                            :disabled="!canUpdateRegistration"
                            class="p-1.5 text-navy-600 hover:text-primary transition-colors disabled:opacity-50"
                          >
                            <span class="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button
                            @click="removeTicketType(ticketType.id)"
                            :disabled="!canDeleteRegistration"
                            class="p-1.5 text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                          >
                            <span class="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-else class="text-center py-8 text-navy-600">
                    <p>No ticket types yet. Create one to get started.</p>
                  </div>
                </div>
              </div>
            </section>

            <!-- Alternative Sign-ins Section -->
            <section class="mt-8">
              <div class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
                <div class="flex items-center gap-2 p-6 pb-4 border-b border-navy-50">
                  <span class="material-symbols-outlined text-primary">login</span>
                  <div class="flex-1">
                    <h3 class="text-sm font-black text-primary dark:text-white uppercase tracking-widest">Alternative Sign-ins</h3>
                    <p class="text-xs text-navy-600 dark:text-slate-400 mt-1">Optional: Configure alternative check-in methods</p>
                  </div>
                  <button
                    @click="openSignInModal()"
                    v-if="canCreateRegistration"
                    class="bg-primary text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-slate-800 transition-all text-xs font-bold uppercase tracking-tight"
                  >
                    <span class="material-symbols-outlined text-sm">add</span>
                    <span>Add Method</span>
                  </button>
                </div>

                <div class="p-6">
                  <div v-if="signInsLoading" class="space-y-3">
                    <div v-for="i in 2" :key="i" class="h-16 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse"></div>
                  </div>

                  <div v-else-if="signIns.length" class="space-y-3">
                    <div
                      v-for="signIn in signIns"
                      :key="signIn.id"
                      class="p-3 border border-deep-navy/10 rounded-xl bg-mist-blue/40 hover:bg-mist-blue/60 transition-colors"
                    >
                      <div class="flex items-center justify-between">
                        <div class="flex-1">
                          <h4 class="font-semibold text-navy-900 text-sm">{{ signIn.title }}</h4>
                          <p v-if="signIn.description" class="text-xs text-navy-600 mt-1">{{ signIn.description }}</p>
                          <div class="flex items-center gap-2 mt-2 text-xs text-navy-500">
                            <span v-if="signIn.format_match">Pattern: {{ getPatternLabel(signIn.format_match) }}</span>
                            <span v-if="signIn.max_uses_per_signin">• Max uses: {{ signIn.max_uses_per_signin }}</span>
                          </div>
                        </div>
                        <div class="flex items-center gap-2">
                          <button
                            @click="openSignInModal(signIn)"
                            class="p-1.5 text-navy-600 hover:text-primary transition-colors"
                          >
                            <span class="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button
                            @click="removeSignIn(signIn.id)"
                            class="p-1.5 text-red-400 hover:text-red-600 transition-colors"
                          >
                            <span class="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-else class="text-center py-8 text-navy-600">
                    <p>No alternative sign-in methods configured</p>
                    <p class="text-xs mt-2 text-navy-400">Add methods like QR codes, RFID, etc.</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <!-- Sidebar (1/3) -->
      <div class="space-y-6">
        <!-- Booking Status Card -->
        <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
          <div class="bg-primary px-6 py-4">
            <h3 class="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
              <span class="material-symbols-outlined text-base">analytics</span>
              Booking Status
            </h3>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <p class="text-xs text-navy-500 mb-1">Ticket Types</p>
              <p class="text-2xl font-bold text-primary">{{ ticketTypes.length }}</p>
            </div>
            <div>
              <p class="text-xs text-navy-500 mb-1">Packages</p>
              <p class="text-2xl font-bold text-primary">{{ packages.length }}</p>
            </div>
            <div>
              <p class="text-xs text-navy-500 mb-1">Active Discounts</p>
              <p class="text-2xl font-bold text-primary">{{ discounts.filter((d: any) => d.active).length }}</p>
            </div>
            <div>
              <p class="text-xs text-navy-500 mb-1">Sign-in Methods</p>
              <p class="text-2xl font-bold text-primary">{{ signIns.length }}</p>
            </div>
          </div>
        </section>

        <!-- Help Card -->
        <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
          <div class="px-6 py-4 border-b border-navy-50 flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-xl">lightbulb</span>
            <h3 class="text-[11px] font-black text-primary uppercase tracking-widest">Setup Tips</h3>
          </div>
          <div class="p-6 text-sm space-y-3 text-navy-600">
            <p>
              This page is for configuring your event's booking system. Follow the steps in order to set up your ticketing and registration options.
            </p>
            <p>
              <strong>Step 1:</strong> Create booking packages to define base pricing tiers (e.g., Standard, Early Bird).
            </p>
            <p>
              <strong>Step 2:</strong> Add discounts for special categories within packages (e.g., Students, Staff).
            </p>
            <p>
              <strong>Step 3:</strong> Define ticket types to control access scope (e.g., Single Day, Full Event, Workshop Pass).
            </p>
             <button
              @click="showSetupGuide = true"
              class="flex items-center space-x-2 px-4 py-2 border-2 border-primary rounded-xl font-semibold text-xs hover:bg-primary hover:text-white transition-all shadow-sm"
            >
              <span class="material-symbols-outlined text-base">help</span>
              <span>Setup Guide</span>
            </button>
          </div>
        </section>
      </div>
    </div>

    <!-- Setup Guide Modal -->
    <div v-if="showSetupGuide" @click.self="showSetupGuide = false" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white  border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex items-center gap-3 mb-6 pb-4 border-b border-navy-50">
          <span class="material-symbols-outlined text-primary text-2xl">school</span>
          <h3 class="text-base font-black text-primary dark:text-white uppercase tracking-widest">Booking Setup Guide</h3>
        </div>

        <div class="space-y-6 text-navy-900 dark:text-slate-200">
          <div class="flex gap-4">
            <div class="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
              1
            </div>
            <div class="flex-1">
              <h4 class="font-bold text-primary mb-2">Booking Packages (Required)</h4>
              <p class="text-sm text-primary">
                Start by creating booking packages. These define your base pricing tiers and what attendees will purchase. 
                For example: "Standard Registration", "Early Bird Special", or "VIP Package". Each package is linked to 
                one or more ticket types and has a base price.
              </p>
              <p class="text-xs text-navy-500 mt-2 italic text-primary">
                💡 Tip: Create different packages for different registration periods or attendee categories.
              </p>
            </div>
          </div>

          <div class="flex gap-4">
            <div class="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
              2
            </div>
            <div class="flex-1">
              <h4 class="font-bold text-primary dark:text-white mb-2">Discounts (Optional)</h4>
              <p class="text-sm leading-relaxed text-navy-700 dark:text-slate-300 text-primary">
                Add discounts for special groups within each package. For instance, students might get 10% off the 
                Standard Registration package, or event staff might get 20% off. You can define eligibility rules 
                to automatically apply discounts based on attendee attributes like age, role, or organization.
              </p>
              <p class="text-xs text-navy-500 mt-2 italic text-primary">
                💡 Tip: Use eligibility rules to automatically validate who qualifies for each discount.
              </p>
            </div>
          </div>

          <div class="flex gap-4">
            <div class="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
              3
            </div>
            <div class="flex-1">
              <h4 class="font-bold text-primary dark:text-white mb-2">Ticket Types (Required)</h4>
              <p class="text-sm leading-relaxed text-navy-700 dark:text-slate-300 text-primary">
                Finally, create ticket types to define what access attendees get. These control authorization and scope. 
                For example: "Single Day Pass" (one day only), "Full Event Pass" (all days), or "Workshop Pass" (workshops only). 
                Ticket types have validity periods and define what parts of your event attendees can access.
              </p>
              <p class="text-xs text-navy-500 mt-2 italic text-primary">
                💡 Tip: Ticket types must be created before packages, as packages reference them.
              </p>
            </div>
          </div>

          <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div class="flex items-start gap-3">
              <span class="material-symbols-outlined text-blue-600 text-xl">info</span>
              <div class="text-sm">
                <p class="font-semibold text-blue-400 mb-1">Order Matters!</p>
                <p class="text-blue-800 text-xs leading-relaxed">
                  Create <strong>Ticket Types</strong> first, then <strong>Packages</strong> (which reference ticket types), 
                  and finally <strong>Discounts</strong> (which apply to specific packages).
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end mt-6 pt-4 border-t border-navy-50">
          <button
            @click="showSetupGuide = false"
            class="bg-primary text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-navy-600 transition-all"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Ticket Type Modal -->
    <div v-if="showTicketTypeModal" @click.self="closeTicketTypeModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
    </div>

    <!-- Add/Edit Package Modal -->
    <div v-if="showPackageModal" @click.self="closePackageModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
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
    </div>

    <!-- Add/Edit Alternative Sign-in Modal -->
    <div v-if="showSignInModal" @click.self="closeSignInModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
    </div>

    <!-- Add/Edit Discount Modal -->
    <div v-if="showDiscountModal" @click.self="closeDiscountModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden max-w-3xl w-full">
        <div class="flex items-center gap-3 px-6 py-4 border-b border-navy-50">
          <span class="material-symbols-outlined text-primary text-xl">percent</span>
          <h3 class="text-sm font-black text-primary dark:text-white uppercase tracking-widest">
            {{ editingDiscount ? 'Edit Discount' : 'Add Discount' }}
          </h3>
        </div>

        <div class="relative h-[600px] px-6 py-4 w-full">
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
      </div>
    </div>
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

import { useCurrentUserEventPermissions } from '~/composables/permissions'
import Swal from 'sweetalert2'

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

// Setup Guide Modal
const showSetupGuide = ref(false)

// Ticket Type Modal & CRUD
const showTicketTypeModal = ref(false)
const editingTicketType = ref<any>(null)

const createTicketTypeMutation = useCreateBookingTicketType()
const updateTicketTypeMutation = usePartialUpdateBookingTicketType()
const deleteTicketTypeMutation = useDeleteBookingTicketType()

const { can } = useCurrentUserEventPermissions(id, {
  refetchInterval: 30000,
  refetchOnWindowFocus: true,
  staleTime: 15000
})

const canUpdateRegistration = computed(() => can('REGISTRATION', 'update').value.allowed)
const canDeleteRegistration = computed(() => can('REGISTRATION', 'delete').value.allowed)
const canCreateRegistration = computed(() => can('REGISTRATION', 'create').value.allowed)

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
        body: {
          ...data,
          event: route.params.id,
        },
      })
      toast.add({
        title: 'Ticket type updated',
        color: 'green',
      })
    } else {
      await createTicketTypeMutation.mutateAsync({
        ...data,
        event: event.value?.data?.id,
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

  Swal.fire({
    title: 'Are you sure?',
    text: 'This will remove the ticket type and all associated references.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, remove it!',
    cancelButtonText: 'Cancel',
  }).then(async (result) => {
    if (result.isConfirmed) {
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
  })

 
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

  Swal.fire({
    title: 'Are you sure?',
    text: 'This will remove the package and all associated discounts.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, remove it!',
    cancelButtonText: 'Cancel',
  }).then(async (result) => {
    if (result.isConfirmed) {
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
  })
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
      rules: data.rules || [],  // Include rules in main payload
    }

    if (editingDiscount.value) {
      // Update existing discount - now includes rules in one call
      await updateDiscountMutation.mutateAsync({
        discountId: editingDiscount.value.discount_id,
        body: discountData,
      })
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

      // Use the package-specific endpoint - now includes rules in one call
      await createDiscountMutation.mutateAsync({
        packageId,
        discount: discountData
      })
      toast.add({
        title: 'Discount created',
        color: 'green',
      })
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

  Swal.fire({
    title: 'Are you sure?',
    text: 'This will remove the discount and all associated rules.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, remove it!',
    cancelButtonText: 'Cancel',
  }).then(async (result) => {
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
  })
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

<style scoped>
.stepper-line {
  background-image: linear-gradient(to bottom, #0F172A 50%, transparent 50%);
  background-size: 1px 12px;
  background-repeat: repeat-y;
}
</style>