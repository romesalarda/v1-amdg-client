<template>
  <EventManagementLayout :event-id="id" :event="event?.data">
    <!-- View Toggle -->
    <div class="mb-6 flex items-center justify-between">
      <div class="flex bg-gray-100 rounded-lg p-0.5">
        <button
          @click="changeView('management')"
          :class="[
            'px-4 py-2 text-sm font-semibold rounded-md transition-colors',
            currentView === 'management'
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          ]"
        >
          <span class="flex items-center gap-2">
            <UIcon name="i-heroicons-cog-6-tooth" class="w-4 h-4" />
            Management
          </span>
        </button>
        <button
          @click="changeView('statistics')"
          :class="[
            'px-4 py-2 text-sm font-semibold rounded-md transition-colors',
            currentView === 'statistics'
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          ]"
        >
          <span class="flex items-center gap-2">
            <UIcon name="i-heroicons-chart-bar" class="w-4 h-4" />
            Statistics
          </span>
        </button>
      </div>
    </div>

    <!-- Management View -->
    <div v-if="currentView === 'management'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

            <section>
              <span class="text-[10px] font-bold text-navy-400 uppercase tracking-widest block mb-2">Step 2 - Required</span>
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
                            @click="openPackageAvailabilityModal(pkg.id)"
                            title="Manage Availability Windows"
                            class="p-1.5 text-navy-600 hover:text-primary transition-colors"
                          >
                            <span class="material-symbols-outlined text-lg">schedule</span>
                          </button>
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
              <span class="text-[10px] font-bold text-navy-400 uppercase tracking-widest block mb-2">Step 3 - Recommended</span>
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
              <p class="text-2xl font-bold text-primary">{{ discounts.filter(d => d.active).length }}</p>
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

    <!-- Package Availability Windows Modal -->
    <div v-if="showPackageAvailabilityModal" @click.self="closePackageAvailabilityModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div class="flex items-center justify-between px-6 py-4 border-b border-navy-50 flex-shrink-0">
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-primary text-xl">schedule</span>
            <div>
              <h3 class="text-sm font-black text-primary dark:text-white uppercase tracking-widest">
                Availability Windows
              </h3>
              <p class="text-xs text-navy-600 mt-0.5">{{ selectedPackageName }}</p>
            </div>
          </div>
          <button
            @click="closePackageAvailabilityModal"
            class="p-1.5 text-navy-600 hover:text-primary transition-colors"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto px-6 py-4">
          <!-- Add Window Button -->
          <div v-if="!editingAvailabilityWindow" class="mb-4">
            <button
              @click="openPackageAvailabilityWindowForm()"
              class="bg-primary text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-slate-800 transition-all text-xs font-bold uppercase tracking-tight"
            >
              <span class="material-symbols-outlined text-sm">add</span>
              <span>Add Window</span>
            </button>
          </div>

          <!-- Window Form -->
          <div v-if="editingAvailabilityWindow !== null" class="mb-6 p-5 border-2 border-primary/30 rounded-xl bg-primary/5">
            <div class="flex items-center justify-between mb-4">
              <h4 class="text-sm font-bold text-navy-900 uppercase tracking-wide">
                {{ editingAvailabilityWindow ? 'Edit Window' : 'New Window' }}
              </h4>
              <button
                @click="closePackageAvailabilityWindowForm"
                class="text-navy-600 hover:text-red-600 transition-colors"
              >
                <span class="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <form @submit.prevent="submitPackageAvailabilityForm" class="space-y-4">
              <!-- Window Name -->
              <div>
                <label class="block text-sm font-semibold text-navy-700 mb-2">Window Name *</label>
                <input
                  v-model="packageAvailabilityForm.name"
                  type="text"
                  placeholder="e.g., Early Bird Sales"
                  required
                  class="w-full rounded-lg border border-navy-300 bg-white px-4 py-2 text-sm text-navy-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <!-- Description -->
              <div>
                <label class="block text-sm font-semibold text-navy-700 mb-2">Description</label>
                <textarea
                  v-model="packageAvailabilityForm.description"
                  rows="2"
                  placeholder="Optional description..."
                  class="w-full rounded-lg border border-navy-300 bg-white px-4 py-2 text-sm text-navy-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                ></textarea>
              </div>

              <!-- Window Type -->
              <div>
                <label class="block text-sm font-semibold text-navy-700 mb-2">Window Type *</label>
                <div class="grid grid-cols-2 gap-3">
                  <label
                    v-for="option in BOOKING_AVAILABILITY_TYPE_OPTIONS"
                    :key="option.value"
                    class="flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all"
                    :class="packageAvailabilityForm.availability_type === option.value ? 'border-primary bg-primary/10' : 'border-navy-200 hover:border-navy-300'"
                  >
                    <input
                      v-model="packageAvailabilityForm.availability_type"
                      type="radio"
                      :value="option.value"
                      class="text-primary focus:ring-primary mt-1"
                    />
                    <div class="flex-1">
                      <div class="font-semibold text-navy-900 text-sm">{{ option.label }}</div>
                      <div class="text-xs text-navy-500 mt-0.5">{{ option.description }}</div>
                    </div>
                  </label>
                </div>
              </div>

              <!-- Date Range -->
              <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-navy-700 mb-2">Available From *</label>
                  <input
                    v-model="packageAvailabilityForm.available_from"
                    type="datetime-local"
                    required
                    class="w-full rounded-lg border border-navy-300 bg-white px-4 py-2 text-sm text-navy-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label class="block text-sm font-semibold text-navy-700 mb-2">Available To *</label>
                  <input
                    v-model="packageAvailabilityForm.available_to"
                    type="datetime-local"
                    required
                    class="w-full rounded-lg border border-navy-300 bg-white px-4 py-2 text-sm text-navy-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <!-- Quick Date Presets -->
              <div class="border border-gray-200 rounded-lg p-4 space-y-3">
                <div class="flex items-center gap-2 mb-2">
                  <span class="material-symbols-outlined text-sm text-navy-500">bolt</span>
                  <label class="text-sm font-semibold text-navy-700">Quick Date Presets</label>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <button
                    type="button"
                    @click="setPackageAvailabilityDates('today', 7)"
                    class="px-3 py-2 text-xs font-medium text-navy-700 bg-white border border-navy-300 rounded-lg hover:bg-navy-50 hover:border-primary transition-colors"
                  >
                    1 week from today
                  </button>
                  <button
                    type="button"
                    @click="setPackageAvailabilityDates('today', 14)"
                    class="px-3 py-2 text-xs font-medium text-navy-700 bg-white border border-navy-300 rounded-lg hover:bg-navy-50 hover:border-primary transition-colors"
                  >
                    2 weeks from today
                  </button>
                  <button
                    type="button"
                    @click="setPackageAvailabilityDates('today', 30)"
                    class="px-3 py-2 text-xs font-medium text-navy-700 bg-white border border-navy-300 rounded-lg hover:bg-navy-50 hover:border-primary transition-colors"
                  >
                    1 month from today
                  </button>
                  <button
                    type="button"
                    @click="setPackageAvailabilityDates('event', -7)"
                    class="px-3 py-2 text-xs font-medium text-navy-700 bg-white border border-navy-300 rounded-lg hover:bg-navy-50 hover:border-primary transition-colors"
                  >
                    1 week before event
                  </button>
                  <button
                    type="button"
                    @click="setPackageAvailabilityDates('event', -14)"
                    class="px-3 py-2 text-xs font-medium text-navy-700 bg-white border border-navy-300 rounded-lg hover:bg-navy-50 hover:border-primary transition-colors"
                  >
                    2 weeks before event
                  </button>
                  <button
                    type="button"
                    @click="setPackageAvailabilityDates('event', -30)"
                    class="px-3 py-2 text-xs font-medium text-navy-700 bg-white border border-navy-300 rounded-lg hover:bg-navy-50 hover:border-primary transition-colors"
                  >
                    1 month before event
                  </button>
                  <button
                    type="button"
                    @click="setPackageAvailabilityDates('during-event')"
                    class="px-3 py-2 text-xs font-medium text-navy-700 bg-white border border-navy-300 rounded-lg hover:bg-navy-50 hover:border-primary transition-colors"
                  >
                    During event
                  </button>
                  <button
                    type="button"
                    @click="setPackageAvailabilityDates('full-period')"
                    class="px-3 py-2 text-xs font-medium text-navy-700 bg-white border border-navy-300 rounded-lg hover:bg-navy-50 hover:border-primary transition-colors"
                  >
                    Now until event
                  </button>
                </div>
                <p class="text-xs text-navy-500 mt-2">Click to quickly set common date ranges</p>
              </div>
              </div>

              <!-- Timezone -->
              <div>
                <label class="block text-sm font-semibold text-navy-700 mb-2">Timezone</label>
                <input
                  v-model="packageAvailabilityForm.timezone"
                  type="text"
                  placeholder="UTC"
                  class="w-full rounded-lg border border-navy-300 bg-white px-4 py-2 text-sm text-navy-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <p class="text-xs text-navy-500 mt-1">
                  Defaults to event timezone: {{ event?.data?.timezone || 'UTC' }}
                </p>
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-3 pt-4 border-t border-navy-200">
                <button
                  type="button"
                  @click="closePackageAvailabilityWindowForm"
                  class="flex-1 px-4 py-2 border border-navy-300 text-navy-700 rounded-lg hover:bg-navy-50 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="addPackageAvailabilityWindow.isPending.value || updatePackageAvailabilityWindow.isPending.value"
                  class="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ editingAvailabilityWindow ? 'Update' : 'Create' }} Window
                </button>
              </div>
            </form>
          </div>

          <!-- Windows Loading State -->
          <div v-if="packageAvailabilityWindowsLoading" class="space-y-3">
            <div v-for="i in 3" :key="i" class="h-32 bg-slate-100 rounded-lg animate-pulse"></div>
          </div>

          <!-- Windows List -->
          <div v-else-if="packageAvailabilityWindows.length > 0" class="space-y-3">
            <div
              v-for="window in packageAvailabilityWindows"
              :key="window.availability_id"
              class="p-5 border-2 rounded-lg transition-all"
              :class="getPackageWindowStatusClass(window)"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-2">
                    <h4 class="font-bold text-navy-900 text-base">{{ window.name }}</h4>
                    <span class="px-2 py-1 rounded text-[10px] font-bold" :class="getPackageWindowStatusBadgeColor(window)">
                      {{ getPackageWindowStatus(window) }}
                    </span>
                    <span class="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded">
                      {{ window.availability_type === 'PRODUCT_WINDOW' ? 'Purchase' : 'Preview' }}
                    </span>
                  </div>
                  <p v-if="window.description" class="text-sm text-navy-600 mb-3">
                    {{ window.description }}
                  </p>
                  <div class="flex items-center gap-4 text-xs text-navy-500">
                    <div class="flex items-center gap-1">
                      <span class="material-symbols-outlined text-sm">calendar_today</span>
                      <span>{{ formatDateTimePackage(window.available_from) }}</span>
                    </div>
                    <span>→</span>
                    <div class="flex items-center gap-1">
                      <span class="material-symbols-outlined text-sm">calendar_today</span>
                      <span>{{ formatDateTimePackage(window.available_to) }}</span>
                    </div>
                  </div>
                  <div v-if="window.timezone" class="flex items-center gap-1 text-xs text-navy-400 mt-1">
                    <span class="material-symbols-outlined text-sm">public</span>
                    <span>{{ window.timezone }}</span>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    @click="openPackageAvailabilityWindowForm(window)"
                    class="p-1.5 text-navy-600 hover:text-primary transition-colors"
                  >
                    <span class="material-symbols-outlined text-lg">edit</span>
                  </button>
                  <button
                    @click="handleDeletePackageAvailabilityWindow(window.availability_id)"
                    :disabled="deletingAvailabilityWindowId === window.availability_id"
                    class="p-1.5 text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                  >
                    <span class="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else-if="!editingAvailabilityWindow" class="text-center py-16">
            <span class="material-symbols-outlined text-6xl text-navy-300 mb-4">schedule</span>
            <h4 class="text-base font-semibold text-navy-900 mb-2">No availability windows yet</h4>
            <p class="text-sm text-navy-500 mb-5">
              Add availability windows to control when this package can be purchased
            </p>
            <button
              @click="openPackageAvailabilityWindowForm()"
              class="bg-primary text-white px-4 py-2 rounded-lg inline-flex items-center space-x-2 hover:bg-slate-800 transition-all text-xs font-bold uppercase tracking-tight"
            >
              <span class="material-symbols-outlined text-sm">add</span>
              <span>Create First Window</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistics View -->
    <div v-else-if="currentView === 'statistics'">
      <NuxtPage />
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
  useBookingPackageAvailabilityWindows,
  useAddBookingPackageAvailabilityWindow,
  useUpdateBookingPackageAvailabilityWindow,
  useRemoveBookingPackageAvailabilityWindow 
} from '~/composables/resources/booking/bookingPackageAvailabilityWindows'
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
import { bookingsPackageAvailabilityWindowsList } from '~/api/sdk.gen'
import EventManagementLayout from '~/components/events/EventManagementLayout.vue'
import TicketTypeForm from '~/components/events/forms/TicketTypeForm.vue'
import BookingPackageForm from '~/components/events/forms/BookingPackageForm.vue'
import DiscountForm from '~/components/events/forms/DiscountForm.vue'
import type { AvailabilityWindow } from '~/api/types.gen'

import { useCurrentUserEventPermissions } from '~/composables/permissions'
import Swal from 'sweetalert2'

definePageMeta({
  layout: false,
})

const route = useRoute()
const router = useRouter()
const id = computed(() => String(route.params.id))
const toast = useToast()

// View toggle state
const currentView = ref<'management' | 'statistics'>(
  route.path.includes('/statistics') ? 'statistics' : 'management'
)

// Fetch event data
const { data: event } = useEvent(id)

// Extract event PK from the event data
const event_pk = computed(() => event.value?.data?.id || null)

// Fetch booking data
const eventIdFilter = computed(() => ({ event_id: route.params.id as string }))
const { data: ticketTypesData, isLoading: ticketTypesLoading, refetch: refetchTicketTypes } = useBookingTicketTypes(eventIdFilter)
const { data: packagesData, isLoading: packagesLoading, refetch: refetchPackages } = useBookingPackages(eventIdFilter)
const { data: signInsData, isLoading: signInsLoading, refetch: refetchSignIns } = useBookingAlternativeSignins(eventIdFilter)

// Fetch discounts for this event using the same event filter
const { data: discountsData, isLoading: discountsLoading, refetch: refetchDiscounts } = usePaymentDiscounts(eventIdFilter)

const ticketTypes = computed(() => ticketTypesData.value?.data?.results || [])
const packages = computed(() => packagesData.value?.data?.results || [])
const signIns = computed(() => signInsData.value?.data?.results || [])
const discounts = computed(() => discountsData.value?.data?.results || [])

const activePackagesCount = computed(() => packages.value.filter(p => p.is_active).length)

// Setup Guide Modal
const showSetupGuide = ref(false)

// Flag to prevent watcher loops when manually opening modals
const isManualModalOpen = ref(false)
const hasSearchedForPackage = ref(false)

// Watch for packages to load, then search for package if we only have window-id
watch(
  () => ({ 
    packagesLoaded: packages.value.length > 0,
    windowId: route.query['window-id'],
    packageId: route.query['package-id']
  }),
  async ({ packagesLoaded, windowId, packageId }) => {
    // Only search once if we have window-id but no package-id
    if (!packagesLoaded || hasSearchedForPackage.value || !windowId || packageId) {
      return
    }
    
    hasSearchedForPackage.value = true
    
    try {
      // Search through all packages to find which one has this window
      for (const pkg of packages.value) {
        const response = await bookingsPackageAvailabilityWindowsList({ 
          path: { id: pkg.id } 
        })
        
        const results = (response.data as any)?.results
        if (results && Array.isArray(results)) {
          const foundWindow = results.find((w: any) => w.availability_id === windowId)
          
          if (foundWindow) {
            // Found it! Update URL with package-id
            router.replace({ 
              query: { 
                ...route.query, 
                'package-id': pkg.id.toString(), 
                'window-id': windowId 
              } 
            })
            break
          }
        }
      }
    } catch (error) {
      console.error('Error finding package for window:', error)
    }
  },
  { immediate: true }
)

// View change handler
function changeView(view: 'management' | 'statistics') {
  currentView.value = view
  if (view === 'statistics') {
    // Navigate to the statistics child route
    router.push(`/events/${id.value}/m/booking/statistics`)
  } else {
    // Navigate back to the parent booking route
    router.push(`/events/${id.value}/m/booking`)
  }
}

// Watch route changes to update currentView
watch(() => route.path, (newPath) => {
  currentView.value = newPath.includes('/statistics') ? 'statistics' : 'management'
})

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
  
  // Update URL if editing existing ticket
  if (ticketType?.id) {
    isManualModalOpen.value = true
    router.replace({ query: { ...route.query, 'ticket-id': ticketType.id.toString() } })
  }
}

const closeTicketTypeModal = () => {
  showTicketTypeModal.value = false
  editingTicketType.value = null
  
  // Clear URL parameter
  if (route.query['ticket-id']) {
    router.replace({ query: { ...route.query, 'ticket-id': undefined } })
  }
  isManualModalOpen.value = false
}

const handleTicketTypeSubmit = async (data: any) => {
  try {
    if (editingTicketType.value) {
      await updateTicketTypeMutation.mutateAsync({
        ticketTypeId: editingTicketType.value.id,
        body: {
          ...data,
          event: event.value?.data?.id,
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
  
  // Update URL if editing existing package
  if (pkg?.id) {
    isManualModalOpen.value = true
    router.replace({ query: { ...route.query, 'package-id': pkg.id.toString() } })
  }
}

const closePackageModal = () => {
  showPackageModal.value = false
  editingPackage.value = null
  
  // Clear URL parameter
  if (route.query['package-id']) {
    router.replace({ query: { ...route.query, 'package-id': undefined } })
  }
  isManualModalOpen.value = false
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
  
  // Update URL if editing existing discount
  if (discount?.discount_id) {
    isManualModalOpen.value = true
    router.replace({ query: { ...route.query, 'discount-id': discount.discount_id } })
  }
}

const closeDiscountModal = () => {
  showDiscountModal.value = false
  editingDiscount.value = null
  selectedPackageForDiscount.value = null
  
  // Clear URL parameter
  if (route.query['discount-id']) {
    router.replace({ query: { ...route.query, 'discount-id': undefined } })
  }
  isManualModalOpen.value = false
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
    
    // Update URL if editing existing sign-in
    if (signIn.id) {
      isManualModalOpen.value = true
      router.replace({ query: { ...route.query, 'signin-id': signIn.id.toString() } })
    }
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
  
  // Clear URL parameter
  if (route.query['signin-id']) {
    router.replace({ query: { ...route.query, 'signin-id': undefined } })
  }
  isManualModalOpen.value = false
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
  const ticketType = ticketTypes.value.find(t => t.id === ticketTypeId)
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

// ===== AVAILABILITY WINDOWS FOR BOOKING PACKAGES =====

type AvailabilityWindowFormData = {
  window_id?: string
  name: string
  description?: string
  availability_type: 'PAYMENT_PACKAGE_WINDOW' | 'PAYMENT_PACKAGE_PREVIEW_WINDOW'
  available_from: string
  available_to: string
  timezone: string
}

// Availability window modal state
const showPackageAvailabilityModal = ref(false)
const selectedPackageId = ref<number | null>(null)
const editingAvailabilityWindow = ref<AvailabilityWindowFormData | null>(null)
const deletingAvailabilityWindowId = ref<string | null>(null)

// Fetch availability windows for selected package
const { 
  data: packageAvailabilityWindowsData, 
  isLoading: packageAvailabilityWindowsLoading, 
  refetch: refetchPackageAvailabilityWindows 
} = useBookingPackageAvailabilityWindows(
  computed(() => selectedPackageId.value || undefined)
)

const packageAvailabilityWindows = computed(() => {
  if (!packageAvailabilityWindowsData.value?.data) return []
  return packageAvailabilityWindowsData.value.data.results || []
})

// Availability window type options
const BOOKING_AVAILABILITY_TYPE_OPTIONS = [
  { value: 'PAYMENT_PACKAGE_WINDOW', label: 'Purchase Window', description: 'Package can be purchased during this time' },
  { value: 'PAYMENT_PACKAGE_PREVIEW_WINDOW', label: 'Preview Window', description: 'Package is visible but cannot be purchased' },
] as const

// Availability window form data
const packageAvailabilityForm = reactive({
  name: '',
  description: '',
  availability_type: 'PAYMENT_PACKAGE_WINDOW' as 'PAYMENT_PACKAGE_WINDOW' | 'PAYMENT_PACKAGE_PREVIEW_WINDOW',
  available_from: '',
  available_to: '',
  timezone: '',
})

// Availability window mutations
const addPackageAvailabilityWindow = useAddBookingPackageAvailabilityWindow()
const updatePackageAvailabilityWindow = useUpdateBookingPackageAvailabilityWindow()
const removePackageAvailabilityWindow = useRemoveBookingPackageAvailabilityWindow()

function openPackageAvailabilityModal(packageId: number) {
  selectedPackageId.value = packageId
  editingAvailabilityWindow.value = null
  showPackageAvailabilityModal.value = true
  
  // Update URL with package-id
  isManualModalOpen.value = true
  router.replace({ query: { ...route.query, 'package-id': packageId.toString() } })
}

function openPackageAvailabilityWindowForm(window?: AvailabilityWindow) {
  if (window) {
    // Populate form with existing window data
    editingAvailabilityWindow.value = {
      window_id: window.availability_id,
      name: window.name,
      description: window.description || '',
      availability_type: (window.availability_type === 'PAYMENT_PACKAGE_WINDOW' || window.availability_type === 'PAYMENT_PACKAGE_PREVIEW_WINDOW') 
        ? window.availability_type 
        : 'PAYMENT_PACKAGE_WINDOW',
      available_from: window.available_from ? formatDateTimeForInputPackage(window.available_from) : '',
      available_to: window.available_to ? formatDateTimeForInputPackage(window.available_to) : '',
      timezone: window.timezone || event.value?.data?.timezone || 'UTC'
    }
    packageAvailabilityForm.name = window.name
    packageAvailabilityForm.description = window.description || ''
    packageAvailabilityForm.availability_type = (window.availability_type === 'PAYMENT_PACKAGE_WINDOW' || window.availability_type === 'PAYMENT_PACKAGE_PREVIEW_WINDOW') 
      ? window.availability_type 
      : 'PAYMENT_PACKAGE_WINDOW'
    packageAvailabilityForm.available_from = window.available_from ? formatDateTimeForInputPackage(window.available_from) : ''
    packageAvailabilityForm.available_to = window.available_to ? formatDateTimeForInputPackage(window.available_to) : ''
    packageAvailabilityForm.timezone = window.timezone || event.value?.data?.timezone || 'UTC'
    
    // Update URL with window-id
    if (selectedPackageId.value) {
      router.replace({ query: { ...route.query, 'package-id': selectedPackageId.value.toString(), 'window-id': window.availability_id } })
    }
  } else {
    // Reset form for new window - use empty object to indicate form is open
    editingAvailabilityWindow.value = {
      name: '',
      description: '',
      availability_type: 'PAYMENT_PACKAGE_WINDOW',
      available_from: '',
      available_to: '',
      timezone: event.value?.data?.timezone || 'UTC'
    }
    packageAvailabilityForm.name = ''
    packageAvailabilityForm.description = ''
    packageAvailabilityForm.availability_type = 'PAYMENT_PACKAGE_WINDOW'
    packageAvailabilityForm.available_from = ''
    packageAvailabilityForm.available_to = ''
    packageAvailabilityForm.timezone = event.value?.data?.timezone || 'UTC'
  }
}

function closePackageAvailabilityWindowForm() {
  editingAvailabilityWindow.value = null
  
  // Clear window-id from URL but keep package-id
  if (route.query['window-id'] && selectedPackageId.value) {
    router.replace({ query: { ...route.query, 'window-id': undefined, 'package-id': selectedPackageId.value.toString() } })
  }
}

function closePackageAvailabilityModal() {
  showPackageAvailabilityModal.value = false
  selectedPackageId.value = null
  editingAvailabilityWindow.value = null
  
  // Clear package-id and window-id from URL
  if (route.query['package-id'] || route.query['window-id']) {
    router.replace({ query: { ...route.query, 'package-id': undefined, 'window-id': undefined } })
  }
  isManualModalOpen.value = false
}

function setPackageAvailabilityDates(preset: 'today' | 'event' | 'during-event' | 'full-period', offsetDays?: number) {
  const now = new Date()
  const startDate = new Date()
  const endDate = new Date()
  
  if (preset === 'today' && offsetDays) {
    // X days from today
    startDate.setDate(now.getDate())
    startDate.setHours(0, 0, 0, 0)
    endDate.setDate(now.getDate() + offsetDays)
    endDate.setHours(23, 59, 59, 999)
  } else if (preset === 'event' && offsetDays && event.value?.data?.start_datetime) {
    // X days before/after event start
    const eventStart = new Date(event.value.data.start_datetime)
    startDate.setTime(now.getTime()) // Start from now
    startDate.setHours(0, 0, 0, 0)
    endDate.setTime(eventStart.getTime())
    endDate.setDate(endDate.getDate() + offsetDays) // Negative offset for "before"
    endDate.setHours(23, 59, 59, 999)
  } else if (preset === 'during-event' && event.value?.data?.start_datetime && event.value?.data?.end_datetime) {
    // During the event
    startDate.setTime(new Date(event.value.data.start_datetime).getTime())
    endDate.setTime(new Date(event.value.data.end_datetime).getTime())
  } else if (preset === 'full-period' && event.value?.data?.start_datetime) {
    // Now until event start
    startDate.setTime(now.getTime())
    startDate.setHours(0, 0, 0, 0)
    endDate.setTime(new Date(event.value.data.start_datetime).getTime())
  }
  
  // Format for datetime-local input: YYYY-MM-DDTHH:mm
  const formatForInput = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
  }
  
  packageAvailabilityForm.available_from = formatForInput(startDate)
  packageAvailabilityForm.available_to = formatForInput(endDate)
}

async function submitPackageAvailabilityForm() {
  // Validation
  if (!packageAvailabilityForm.name) {
    toast.add({
      title: 'Validation Error',
      description: 'Please enter a window name',
      color: 'red',
    })
    return
  }

  if (!packageAvailabilityForm.available_from || !packageAvailabilityForm.available_to) {
    toast.add({
      title: 'Validation Error',
      description: 'Please specify both start and end dates',
      color: 'red',
    })
    return
  }

  // Validate dates
  const fromDate = new Date(packageAvailabilityForm.available_from)
  const toDate = new Date(packageAvailabilityForm.available_to)
  
  if (toDate <= fromDate) {
    toast.add({
      title: 'Validation Error',
      description: 'End date must be after start date',
      color: 'red',
    })
    return
  }

  if (!selectedPackageId.value) return

  const windowPayload = {
    name: packageAvailabilityForm.name,
    description: packageAvailabilityForm.description || null,
    availability_type: packageAvailabilityForm.availability_type,
    available_from: packageAvailabilityForm.available_from,
    available_to: packageAvailabilityForm.available_to,
    timezone: packageAvailabilityForm.timezone || 'UTC',
  }

  try {
    if (editingAvailabilityWindow.value?.window_id) {
      // Update existing window
      await updatePackageAvailabilityWindow.mutateAsync({
        packageId: selectedPackageId.value,
        windowId: editingAvailabilityWindow.value.window_id,
        body: windowPayload,
      })

      toast.add({
        title: 'Success',
        description: 'Availability window updated successfully',
        color: 'green',
      })
    } else {
      // Create new window
      await addPackageAvailabilityWindow.mutateAsync({
        packageId: selectedPackageId.value,
        body: windowPayload,
      })

      toast.add({
        title: 'Success',
        description: 'Availability window created successfully',
        color: 'green',
      })
    }

    refetchPackageAvailabilityWindows()
    closePackageAvailabilityWindowForm()
  } catch (err: any) {
    toast.add({
      title: 'Error',
      description: err.message || 'Failed to save availability window',
      color: 'red',
    })
  }
}

async function handleDeletePackageAvailabilityWindow(windowId: string) {
  if (!confirm('Are you sure you want to delete this availability window?')) return
  if (!selectedPackageId.value) return

  deletingAvailabilityWindowId.value = windowId

  try {
    await removePackageAvailabilityWindow.mutateAsync({
      packageId: selectedPackageId.value,
      windowId: windowId,
    })

    toast.add({
      title: 'Success',
      description: 'Availability window deleted successfully',
      color: 'green',
    })

    refetchPackageAvailabilityWindows()
  } catch (err: any) {
    toast.add({
      title: 'Error',
      description: err.message || 'Failed to delete availability window',
      color: 'red',
    })
  } finally {
    deletingAvailabilityWindowId.value = null
  }
}

// Helper functions for window status display
function getPackageWindowStatus(window: AvailabilityWindow): string {
  const now = new Date()
  const from = new Date(window.available_from || '')
  const to = new Date(window.available_to || '')
  
  if (now < from) return 'Upcoming'
  if (now > to) return 'Expired'
  return 'Active'
}

function getPackageWindowStatusBadgeColor(window: AvailabilityWindow): string {
  const status = getPackageWindowStatus(window)
  if (status === 'Active') return 'text-green-700 bg-green-100'
  if (status === 'Upcoming') return 'text-blue-700 bg-blue-100'
  return 'text-gray-700 bg-gray-100'
}

function getPackageWindowStatusClass(window: AvailabilityWindow): string {
  const status = getPackageWindowStatus(window)
  if (status === 'Active') return 'border-green-300 bg-green-50'
  if (status === 'Upcoming') return 'border-blue-300 bg-blue-50'
  return 'border-gray-300 bg-gray-50'
}

function formatDateTimePackage(dateString: string | undefined): string {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleString('en-GB', { 
    dateStyle: 'medium', 
    timeStyle: 'short' 
  })
}

function formatDateTimeForInputPackage(dateString: string | undefined): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  // Format: YYYY-MM-DDTHH:mm
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const selectedPackageName = computed(() => {
  if (!selectedPackageId.value) return ''
  const pkg = packages.value.find(p => p.id === selectedPackageId.value)
  return pkg?.name || ''
})

// Handle query parameters for direct window editing
watch(
  () => ({ 
    packageId: route.query['package-id'], 
    windowId: route.query['window-id'],
    packagesLoaded: packages.value.length > 0
  }),
  ({ packageId, windowId, packagesLoaded }) => {
    // Skip if manually opening a modal (prevents loops)
    if (isManualModalOpen.value) {
      isManualModalOpen.value = false
      return
    }
    
    // Only handle if both package-id and window-id are present
    if (packageId && windowId && packagesLoaded) {
      const pkgId = parseInt(packageId as string, 10)
      if (!isNaN(pkgId)) {
        // Open the package availability modal
        openPackageAvailabilityModal(pkgId)
        
        // Wait for the availability windows to load
        nextTick(() => {
          // Find the window with the given ID
          const window = packageAvailabilityWindows.value.find(w => w.availability_id === windowId)
          if (window) {
            openPackageAvailabilityWindowForm(window)
          }
        })
      }
    }
  }
)

// Handle query parameters for direct modal opening
watch(
  () => ({
    packageId: route.query['package-id'],
    ticketId: route.query['ticket-id'],
    discountId: route.query['discount-id'],
    signinId: route.query['signin-id'],
    packagesLoaded: packages.value.length > 0,
    ticketsLoaded: ticketTypes.value.length > 0,
    discountsLoaded: discounts.value.length > 0,
    signInsLoaded: signIns.value.length > 0
  }),
  ({ packageId, ticketId, discountId, signinId, packagesLoaded, ticketsLoaded, discountsLoaded, signInsLoaded }) => {
    // Skip if manually opening a modal (prevents loops)
    if (isManualModalOpen.value) {
      isManualModalOpen.value = false
      return
    }
    
    // Only handle if we're not also opening a window (window-id takes precedence)
    if (route.query['window-id']) return

    // Open package modal
    if (packageId && packagesLoaded && !showPackageAvailabilityModal.value) {
      const pkgId = parseInt(packageId as string, 10)
      if (!isNaN(pkgId)) {
        const pkg = packages.value.find(p => p.id === pkgId)
        if (pkg) {
          openPackageModal(pkg)
        }
      }
    }

    // Open ticket type modal
    if (ticketId && ticketsLoaded) {
      const tktId = parseInt(ticketId as string, 10)
      if (!isNaN(tktId)) {
        const ticket = ticketTypes.value.find(t => t.id === tktId)
        if (ticket) {
          openTicketTypeModal(ticket)
        }
      }
    }

    // Open discount modal
    if (discountId && discountsLoaded) {
      const discount = discounts.value.find(d => d.discount_id === discountId)
      if (discount) {
        openDiscountModal(discount)
      }
    }

    // Open sign-in modal
    if (signinId && signInsLoaded) {
      const signin = signIns.value.find(s => s.id === signinId)
      if (signin) {
        openSignInModal(signin)
      }
    }
  }
)

</script>

<style scoped>
.stepper-line {
  background-image: linear-gradient(to bottom, #0F172A 50%, transparent 50%);
  background-size: 1px 12px;
  background-repeat: repeat-y;
}
</style>