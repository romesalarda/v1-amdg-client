<template>
	<div class="min-h-screen bg-slate-100 text-slate-900" :class="{ 'checkout-lock': isCheckoutUiBusy }">
		<header class="relative h-[32vh] min-h-[280px] w-full overflow-hidden">
			<img :src="heroImageSrc" alt="Registration hero" class="absolute inset-0 h-full w-full object-cover" />
			<div class="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/45 to-slate-900/20"></div>

			<div class="absolute inset-x-0 top-0 z-10 p-6 md:p-8">
				<div class="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4">
					<div class="text-2xl font-black tracking-tight text-white md:text-3xl">AMDG</div>
					<div class="flex items-center gap-3">
						<div class="hidden rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/80 md:block">
							Registration flow
						</div>
						<UButton color="white" variant="soft" @click="goBack">Back to event</UButton>
					</div>
				</div>
			</div>

			<div class="absolute inset-x-0 bottom-0 z-10 px-6 pb-8 md:px-8 md:pb-10">
				<div class="mx-auto w-full max-w-[1200px]">
					<span class="inline-block rounded-full bg-blue-500/90 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-white">
						Step {{ activeStepIndex + 1 }} of {{ steps.length }}
					</span>
					<h1 class="mt-3 text-3xl font-black tracking-tight text-white md:text-5xl">
						{{ event?.title || 'Event Registration' }}
					</h1>
					<p class="mt-2 text-sm font-semibold uppercase tracking-wider text-white/80">
						Attendee {{ currentAttendeeNumber }} of {{ store.ticketCount || 1 }}
					</p>
					<div class="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/20 md:max-w-lg">
						<div
							class="h-full rounded-full bg-blue-400 transition-all duration-500 ease-out"
							:style="{ width: `${stepProgressPercent}%` }"
						></div>
					</div>
				</div>
			</div>
		</header>

		<section class="sticky top-0 z-20 border-y border-slate-200 bg-white/95 backdrop-blur">
			<div class="mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-4 px-6 py-4">
				<div class="flex flex-wrap items-center gap-x-8 gap-y-3">
					<div class="flex items-center gap-2">
						<UIcon name="i-heroicons-calendar-days" class="h-5 w-5 text-slate-400" />
						<div>
							<p class="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Date</p>
							<p class="text-sm font-bold text-slate-700">{{ reminderDate }}</p>
						</div>
					</div>
					<div class="flex items-center gap-2">
						<UIcon name="i-heroicons-clock" class="h-5 w-5 text-slate-400" />
						<div>
							<p class="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Time</p>
							<p class="text-sm font-bold text-slate-700">{{ reminderTime }}</p>
						</div>
					</div>
					<div class="flex items-center gap-2">
						<UIcon name="i-heroicons-map-pin" class="h-5 w-5 text-slate-400" />
						<div>
							<p class="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Location</p>
							<p class="text-sm font-bold text-slate-700">{{ reminderLocation }}</p>
						</div>
					</div>
				</div>
				<div class="flex flex-col items-end gap-2">
					<div class="rounded-full bg-slate-900 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white">
						Editing attendee {{ currentAttendeeNumber }}
					</div>
					<div
						v-if="showIntentCountdown"
						class="flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em]"
						:class="intentTimerToneClass"
					>
						<UIcon name="i-heroicons-clock" class="h-3.5 w-3.5" />
						<span>Session expires in {{ intentCountdownLabel }}</span>
					</div>
					<div
						v-if="isCheckoutUiBusy"
						class="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-blue-800"
					>
						<span class="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
						<span>{{ checkoutProcessingStageLabel }}</span>
					</div>
				</div>
			</div>
		</section>

		<div class="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-6 py-8 lg:flex-row lg:py-10">
			<div v-if="eventLoading" class="w-full rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
				Loading event details...
			</div>
			<div v-else-if="!event" class="w-full rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600 shadow-sm">
				Event not found.
			</div>
			<template v-else>
				<aside class="w-full space-y-4 lg:w-72 lg:flex-shrink-0">
					<div>
						<p class="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Registration group</p>
					</div>

					<button
						v-for="(attendee, index) in store.attendees"
						:key="index"
						type="button"
						@click="jumpToAttendee(index)"
						class="w-full rounded-2xl border p-4 text-left transition-all duration-300"
						:class="attendeeSidebarCardClass(index, attendee)"
					>
						<div class="flex items-start justify-between gap-3">
							<div>
								<div class="flex items-center gap-2">
									<p class="text-base font-black text-slate-900">
										{{ attendeeDisplayName(attendee, index) }}
									</p>
									<UBadge v-if="isAttendeeMinor(attendee)" color="amber" variant="subtle" size="xs">
										Minor
									</UBadge>
								</div>
								<p class="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
									{{ attendeeStepSummary(index) }}
								</p>
								<p v-if="isAttendeeMinor(attendee) && !minorHasEmergencyContact(attendee)" class="mt-1 text-[10px] font-bold text-red-600 uppercase tracking-wider">
									⚠ Emergency contact required
								</p>
							</div>
							<span
								class="rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider"
								:class="attendeeStatusBadgeClass(index, attendee)"
							>
								{{ attendeeStatusLabel(index, attendee) }}
							</span>
						</div>
					</button>

					<div class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5" v-if="!showCheckoutPricingSidebar">
						<p class="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Current attendee snapshot</p>
						<div v-if="currentAttendee" class="mt-3 space-y-2">
							<p class="text-sm font-bold text-slate-800">{{ attendeeDisplayName(currentAttendee, store.currentIndex) }}</p>
							<p class="text-xs text-slate-600">
								Email: {{ currentAttendee.email || 'Not provided yet' }}
							</p>
							<p class="text-xs text-slate-600">
								DOB: {{ currentAttendee.date_of_birth || 'Not provided yet' }}
							</p>
							<p class="text-xs text-slate-600">
								Package: {{ packageById(currentAttendee.packageId)?.name || 'Not selected' }}
							</p>
						</div>
						<p class="mt-3 text-[11px] leading-relaxed text-slate-500">
							Keep medical, dietary, and emergency details accurate to support safe event safeguarding.
						</p>
					</div>
					<div class="space-y-4 lg:sticky lg:top-24" v-if="showCheckoutPricingSidebar">
						<div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
							<div class="flex items-center justify-between">
								<h3 class="text-sm font-semibold text-slate-900">Payment breakdown</h3>
							</div>
							<p v-if="checkoutPreviewLoading" class="mt-3 text-xs text-slate-500">Refreshing payment breakdown...</p>
							<p v-else-if="checkoutPreviewError" class="mt-3 text-xs font-semibold text-red-600">{{ checkoutPreviewError }}</p>
							<div class="mt-3 space-y-2">
								<div
									v-for="item in breakdownLines"
									:key="item.id"
									class="rounded-lg border border-slate-100 bg-slate-50 px-3 py-3 text-sm"
								>
									<div class="flex items-center justify-between gap-3">
										<div>
											<p class="font-semibold text-slate-800">{{ item.name }}</p>
											<p class="text-xs text-slate-500">{{ item.description }}</p>
											<p v-if="item.discountHint" class="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">{{ item.discountHint }}</p>
										</div>
										<p class="font-semibold text-slate-900">{{ formatMoney(item.finalAmount, item.currency) }}</p>
									</div>
									<p class="mt-2 text-[11px] text-slate-600">
										{{ formatMoney(item.originalAmount, item.currency) }}
										<span class="text-slate-400"> - </span>
										<span class="text-emerald-700">{{ formatMoney(item.discountAmount, item.currency) }}</span>
										<span class="text-slate-400"> = </span>
										<span class="font-semibold text-slate-800">{{ formatMoney(item.finalAmount, item.currency) }}</span>
									</p>
								</div>
								<p v-if="!breakdownLines.length && !checkoutPreviewLoading" class="text-xs text-slate-500">No payable items selected yet.</p>
							</div>
							<div class="mt-4 border-t border-slate-100 pt-3 text-sm">
								<div class="flex items-center justify-between text-slate-600">
									<span>Subtotal</span>
									<span>{{ formatMoney(paymentBreakdownTotal.originalAmount, paymentBreakdownTotal.currency) }}</span>
								</div>
								<div class="mt-1 flex items-center justify-between text-emerald-700">
									<span>Total discount</span>
									<span>-{{ formatMoney(paymentBreakdownTotal.discountAmount, paymentBreakdownTotal.currency) }}</span>
								</div>
								<div class="mt-2 flex items-center justify-between text-base font-bold text-slate-900">
									<span>Total due</span>
									<span>{{ formatMoney(paymentBreakdownTotal.amount, paymentBreakdownTotal.currency) }}</span>
								</div>
								<p v-if="isPollingPaymentStatus" class="mt-2 text-xs font-semibold text-amber-700">{{ paymentProcessingMessage || 'Finalizing your payment...' }}</p>
							</div>
						</div>

						<div class="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
							<div class="flex items-center gap-2 font-semibold">
								<UIcon name="i-heroicons-lock-closed" class="h-4 w-4" />
								Powered and secured by Stripe
							</div>
							<p class="mt-1 text-xs text-emerald-700">We do not store any card data.</p>
						</div>
					</div>
				</aside>

				<main class="min-w-0 flex-1">
					<div class="rounded-3xl border-2 border-slate-900/80 bg-white shadow-[10px_10px_0px_0px_rgba(15,23,42,0.2)]">
						<div class="p-6 md:p-10">
							<div class="border-b border-slate-100 pb-6">
								<h2 class="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
									Details for {{ attendeeDisplayName(currentAttendee, store.currentIndex) }}
								</h2>
								<p class="mt-2 text-sm text-slate-500">Complete each step to prepare this attendee for checkout.</p>
							</div>

							<div class="mt-6 overflow-hidden pb-2">
								<Transition :name="stepperTransitionName" mode="out-in">
									<ol :key="`step-window-${stepWindowStart}`" class="flex items-center gap-2 md:gap-3">
										<li
											v-for="(step, localIndex) in visibleSteps"
											:key="step.index"
											class="flex flex-1 items-center"
										>
											<div class="flex items-center gap-2">
												<div
													class="flex h-8 w-8 items-center justify-center rounded-full border text-xs font-black transition-all duration-300"
													:class="
														step.index === activeStepIndex
															? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-200'
															: step.index < activeStepIndex
																? 'border-emerald-500 bg-emerald-500 text-white'
																: 'border-slate-300 bg-white text-slate-500'
													"
												>
													{{ step.index + 1 }}
												</div>
												<p
													class="text-[11px] font-bold uppercase tracking-[0.14em] transition-colors"
													:class="step.index <= activeStepIndex ? 'text-slate-800' : 'text-slate-400'"
												>
													{{ step.label }}
												</p>
											</div>
											<div
												v-if="localIndex < visibleSteps.length - 1"
												class="mx-2 h-px flex-1"
												:class="step.index < activeStepIndex ? 'bg-emerald-500' : 'bg-slate-300'"
											></div>
										</li>
									</ol>
								</Transition>
							</div>

							<div v-if="!currentAttendee" class="mt-8 text-sm text-slate-500">Preparing registration details...</div>

							<Transition name="step-fade" mode="out-in">
								<div v-if="currentAttendee" :key="`step-${store.currentIndex}-${activeStepIndex}`" class="mt-8 space-y-6">
									<div v-if="activeStepIndex === 0" class="space-y-6">
										<div>
											<h2 class="text-lg font-semibold text-gray-900">Attendee details</h2>
											<p class="text-sm text-gray-600" v-if="isRegistrarSelf">Please provide <b>YOUR</b> details.</p>
											<p class="text-sm text-gray-600" v-else>Tell us about this attendee and their relationship to you.</p>
										</div>

							<div class="grid gap-4 sm:grid-cols-2">
								<div>
									<label class="mb-1 block text-sm font-medium text-gray-700">First name <span class="text-red-500">*</span></label>
									<UInput
										:model-value="values.first_name"
										placeholder="First name"
										@update:model-value="
											(val) => {
												currentAttendee.first_name = val
												setFieldValue('first_name', val)
											}
										"
										:color="errors.first_name ? 'red' : 'gray'"
									/>
									<p v-if="errors.first_name" class="mt-1 text-xs text-red-500">{{ errors.first_name }}</p>
								</div>
								<div>
									<label class="mb-1 block text-sm font-medium text-gray-700">Last name <span class="text-red-500">*</span></label>
									<UInput
										:model-value="values.last_name"
										placeholder="Last name"
										@update:model-value="
											(val) => {
												currentAttendee.last_name = val
												setFieldValue('last_name', val)
											}
										"
										:color="errors.last_name ? 'red' : 'gray'"
									/>
									<p v-if="errors.last_name" class="mt-1 text-xs text-red-500">{{ errors.last_name }}</p>
								</div>
								<div>
									<label class="mb-1 block text-sm font-medium text-gray-700">Email</label>
									<UInput
										:model-value="values.email"
										type="email"
										placeholder="email@example.com"
										@update:model-value="
											(val) => {
												currentAttendee.email = val
												setFieldValue('email', val)
												void runSafeValidation()
											}
										"
										:color="errors.email ? 'red' : 'gray'"
									/>
									<p v-if="errors.email" class="mt-1 text-xs text-red-500">{{ errors.email }}</p>
								</div>
								<div>
									<label class="mb-1 block text-sm font-medium text-gray-700">Phone number</label>
									<UInput
										:model-value="values.phone_number"
										placeholder="Phone number"
										@update:model-value="
											(val) => {
												currentAttendee.phone_number = val
												setFieldValue('phone_number', val)
												void runSafeValidation()
											}
										"
										:color="errors.phone_number ? 'red' : 'gray'"
									/>
									<p v-if="errors.phone_number" class="mt-1 text-xs text-red-500">{{ errors.phone_number }}</p>
								</div>
								<div>
									<label class="mb-1 block text-sm font-medium text-gray-700">Date of birth <span class="text-red-500">*</span></label>
									<UInput
										:model-value="values.date_of_birth"
										type="date"
										@update:model-value="
											(val) => {
												currentAttendee.date_of_birth = val
												setFieldValue('date_of_birth', val)
												void runSafeValidation()
											}
										"
										:color="errors.date_of_birth ? 'red' : 'gray'"
									/>
									<p v-if="errors.date_of_birth" class="mt-1 text-xs text-red-500">{{ errors.date_of_birth }}</p>
									<p v-if="currentAttendeeAge !== null" class="mt-2 text-sm font-medium text-slate-600">
										Age: <span class="font-bold text-slate-900">{{ currentAttendeeAge }}</span> years old
									</p>
								</div>
								<div>
									<label class="mb-1 block text-sm font-medium text-gray-700">Gender</label>
									<USelectMenu
										:model-value="values.gender"
										:options="genderOptions"
										value-attribute="value"
										option-attribute="label"
										placeholder="Select gender"
										@update:model-value="
											(val) => {
												currentAttendee.gender = val
												setFieldValue('gender', val)
											}
										"
									/>
								</div>
								<div v-if="showRelationshipField && !isRegistrarSelf" class="sm:col-span-2">
									
									<label class="mb-1 block text-sm font-medium text-gray-700">Relationship to you <span class="text-red-500">*</span></label>
									<USelectMenu
										:model-value="values.relationship_to_user"
										:options="relationshipOptions"
										value-attribute="value"
										option-attribute="label"
										placeholder="Select relationship"
										@update:model-value="
											(val) => {
												currentAttendee.relationship_to_user = val
												setFieldValue('relationship_to_user', val)
											}
										"
										:disabled="isRegistrarSelf"
									/>
								</div>

								<div class="sm:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
									<p class="text-sm font-semibold text-slate-900">Area from <span class="text-red-500">*</span></p>
									<p class="mt-1 text-xs text-slate-600">
										Start typing to search for an area, then select from the list.
									</p>
									<div class="mt-4">
										<div class="relative">
											<UInput
												v-model="areaSearch"
												placeholder="Search area name (min 2 chars)"
												class="w-full"
											/>
											<div
												v-if="areaOptions.length > 0 && areaSearch.length >= 2"
												class="absolute top-full left-0 right-0 z-50 mt-2 rounded-lg border border-slate-200 bg-white shadow-lg"
											>
												<div class="max-h-64 overflow-y-auto">
													<button
														v-for="option in areaOptions"
														:key="option.value"
														type="button"
														class="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 transition-colors"
														:class="option.value === currentAttendee.area_from ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700'"
														@click="
															store.setAreaFrom(store.currentIndex, option.value, option.label);
															areaSearch = option.label;
														"
													>
														{{ option.label }}
													</button>
												</div>
											</div>
										</div>
										<p v-if="areaLookupLoading" class="mt-2 text-xs text-slate-500">Searching...</p>
									</div>
									<div v-if="hasCurrentAreaFrom" class="mt-3">
										<UButton size="xs" color="gray" variant="ghost" @click="clearAreaFrom">
											Change area
										</UButton>
									</div>
									<p class="mt-3 text-xs font-semibold" :class="hasCurrentAreaFrom ? 'text-emerald-700' : 'text-slate-500'">
										{{ hasCurrentAreaFrom ? `✓ Area locked: ${currentAttendee.area_from_name}` : 'Select an area to continue.' }}
									</p>
								</div>
							</div>
						</div>

						<div v-else-if="activeStepIndex === 1" class="space-y-6">
							<div>
								<h2 class="text-lg font-semibold text-gray-900">Event questions</h2>
								<p class="text-sm text-gray-600">Answer any questions the organizer added.</p>
							</div>

							<AttendeeQuestionAnswers
								:event="event"
								v-model="currentAttendee.questionAnswers"
							/>
						</div>

						<div v-else-if="activeStepIndex === 2" class="space-y-6">
							<div>
								<h2 class="text-lg font-semibold text-gray-900">Personal info</h2>
								<p class="text-sm text-gray-600">Add any dietary, medical, or accessibility needs.</p>
								<div v-if="isAttendeeMinor(currentAttendee)" class="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-4">
									<p class="text-sm font-semibold text-amber-800">⚠️ Emergency contact required</p>
									<p class="mt-1 text-xs text-amber-700">As this attendee is a minor, an emergency contact is required to continue.</p>
								</div>
							</div>

							<div class="grid gap-6">
								<!-- Dietary Requirements Section -->
								<div>
									<h3 class="text-sm font-semibold text-gray-900">Dietary requirements</h3>
									<div v-if="dietaryRequirements.length" class="mt-3 space-y-3">
										<div
											v-for="requirement in dietaryRequirements"
											:key="requirement.id"
											class="rounded-lg border border-gray-200 p-3 transition-all"
										>
											<div class="flex items-center gap-2">
												<input
													type="checkbox"
													:id="`dietary-${requirement.id}`"
													:value="requirement.id"
													:checked="hasPersonalInfoItem(currentAttendee.personalInfo.dietaryRequirements, requirement.id)"
													@change="toggleDietaryRequirement(requirement.id, $event)"
													class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
												/>
												<label :for="`dietary-${requirement.id}`" class="flex-1 text-sm font-medium text-gray-700 cursor-pointer">
													{{ requirement.label }}
												</label>
											</div>
											<div
												v-if="hasPersonalInfoItem(currentAttendee.personalInfo.dietaryRequirements, requirement.id)"
												class="mt-3 ml-6 space-y-3 pt-3 border-t border-gray-200"
											>
												<div>
													<label class="mb-1 block text-xs font-semibold text-gray-700">
														Details
														<span v-if="isOtherOption(requirement.id)" class="text-red-500">*</span>
													</label>
													<textarea
														:value="getDetailsForItem(requirement.id, currentAttendee.personalInfo.dietaryRequirements)"
														placeholder="Describe your dietary requirement..."
														@input="updateDietaryRequirementDetails(requirement.id, ($event.target as HTMLTextAreaElement).value)"
														class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary focus:border-primary"
														rows="2"
													/>
													<p class="mt-1 text-xs text-gray-500">Visible to event organizers and catering team</p>
													<p
														v-if="getPersonalInfoItemValidationError(currentAttendee.personalInfo.dietaryRequirements, requirement.id)"
														class="mt-1 text-xs text-red-600"
													>
														{{ getPersonalInfoItemValidationError(currentAttendee.personalInfo.dietaryRequirements, requirement.id) }}
													</p>
												</div>
											</div>
										</div>
									</div>
									<p v-else class="mt-2 text-xs text-gray-500">No dietary requirements available.</p>
								</div>

								<!-- Medical Conditions Section -->
								<div>
									<h3 class="text-sm font-semibold text-gray-900">Medical conditions</h3>
									<div v-if="medicalConditions.length" class="mt-3 space-y-3">
										<div
											v-for="condition in medicalConditions"
											:key="condition.id"
											class="rounded-lg border border-gray-200 p-3 transition-all"
										>
											<div class="flex items-center gap-2">
												<input
													type="checkbox"
													:id="`medical-${condition.id}`"
													:value="condition.id"
													:checked="hasPersonalInfoItem(currentAttendee.personalInfo.medicalConditions, condition.id)"
													@change="toggleMedicalCondition(condition.id, $event)"
													class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
												/>
												<label :for="`medical-${condition.id}`" class="flex-1 text-sm font-medium text-gray-700 cursor-pointer">
													{{ condition.label }}
												</label>
											</div>
											<div
												v-if="hasPersonalInfoItem(currentAttendee.personalInfo.medicalConditions, condition.id)"
												class="mt-3 ml-6 space-y-3 pt-3 border-t border-gray-200"
											>
												<div>
													<label class="mb-1 block text-xs font-semibold text-gray-700">Severity</label>
													<USelectMenu
														:model-value="currentAttendee.personalInfo.medicalConditions.find(d => d.id === condition.id)?.severity || ''"
														:options="[
															{ label: 'Mild', value: 'mild' },
															{ label: 'Moderate', value: 'moderate' },
															{ label: 'Severe', value: 'severe' }
														]"
														value-attribute="value"
														option-attribute="label"
														placeholder="Select severity"
														@update:model-value="(val) => updateMedicalConditionSeverity(condition.id, val as 'mild' | 'moderate' | 'severe' | null)"
													/>
												</div>
												<div>
													<label class="mb-1 block text-xs font-semibold text-gray-700">
														Details (public-facing)
														<span v-if="isOtherOption(condition.id)" class="text-red-500">*</span>
													</label>
													<textarea
														:value="getDetailsForItem(condition.id, currentAttendee.personalInfo.medicalConditions as unknown as PersonalInfoItemDraft[])"
														placeholder="Describe the condition..."
														@input="updateMedicalConditionDetails(condition.id, ($event.target as HTMLTextAreaElement).value)"
														class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary focus:border-primary"
														rows="2"
													/>
													<p class="mt-1 text-xs text-gray-500">Visible to event organizers and first aid team</p>
													<p
														v-if="getPersonalInfoItemValidationError(currentAttendee.personalInfo.medicalConditions as unknown as PersonalInfoItemDraft[], condition.id)"
														class="mt-1 text-xs text-red-600"
													>
														{{ getPersonalInfoItemValidationError(currentAttendee.personalInfo.medicalConditions as unknown as PersonalInfoItemDraft[], condition.id) }}
													</p>
												</div>
											</div>
										</div>
									</div>
									<p v-else class="mt-2 text-xs text-gray-500">No medical conditions available.</p>
								</div>

								<!-- Accessibility Requirements Section -->
								<div>
									<h3 class="text-sm font-semibold text-gray-900">Accessibility requirements</h3>
									<div v-if="accessibilityRequirements.length" class="mt-3 space-y-3">
										<div
											v-for="requirement in accessibilityRequirements"
											:key="requirement.id"
											class="rounded-lg border border-gray-200 p-3 transition-all"
										>
											<div class="flex items-center gap-2">
												<input
													type="checkbox"
													:id="`accessibility-${requirement.id}`"
													:value="requirement.id"
													:checked="hasPersonalInfoItem(currentAttendee.personalInfo.accessibilityRequirements, requirement.id)"
													@change="toggleAccessibilityRequirement(requirement.id, $event)"
													class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
												/>
												<label :for="`accessibility-${requirement.id}`" class="flex-1 text-sm font-medium text-gray-700 cursor-pointer">
													{{ requirement.label }}
												</label>
											</div>
											<div
												v-if="hasPersonalInfoItem(currentAttendee.personalInfo.accessibilityRequirements, requirement.id)"
												class="mt-3 ml-6 space-y-3 pt-3 border-t border-gray-200"
											>
												<div>
													<label class="mb-1 block text-xs font-semibold text-gray-700">
														Details (public-facing)
														<span v-if="isOtherOption(requirement.id)" class="text-red-500">*</span>
													</label>
													<textarea
														:value="getDetailsForItem(requirement.id, currentAttendee.personalInfo.accessibilityRequirements)"
														placeholder="Describe your accessibility needs..."
														@input="updateAccessibilityRequirementDetails(requirement.id, ($event.target as HTMLTextAreaElement).value)"
														class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary focus:border-primary"
														rows="2"
													/>
													<p class="mt-1 text-xs text-gray-500">Visible to event organizers and accessibility team</p>
													<p
														v-if="getPersonalInfoItemValidationError(currentAttendee.personalInfo.accessibilityRequirements, requirement.id)"
														class="mt-1 text-xs text-red-600"
													>
														{{ getPersonalInfoItemValidationError(currentAttendee.personalInfo.accessibilityRequirements, requirement.id) }}
													</p>
												</div>
											</div>
										</div>
									</div>
									<p v-else class="mt-2 text-xs text-gray-500">No accessibility requirements available.</p>
								</div>

								<!-- Emergency Contact Section -->
								<div>
									<div class="flex items-center justify-between">
										<h3 class="text-sm font-semibold text-gray-900">
											Emergency contact
											<span v-if="isAttendeeMinor(currentAttendee)" class="text-red-500">*</span>
										</h3>
										<UButton
											v-if="!currentAttendee?.personalInfo?.emergencyContact"
											size="xs"
											color="gray"
											variant="ghost"
											@click="addEmergencyContact"
										>
											Add contact
										</UButton>
									</div>

									<div
										v-if="currentAttendee?.personalInfo?.emergencyContact"
										class="mt-3 grid gap-4 sm:grid-cols-2"
									>
										<div>
											<label class="mb-1 block text-sm font-medium text-gray-700">First name <span class="text-red-500">*</span></label>
											<UInput 
												v-model="currentAttendee.personalInfo.emergencyContact.first_name"
												placeholder="First name"
											/>
										</div>
										<div>
											<label class="mb-1 block text-sm font-medium text-gray-700">Last name <span class="text-red-500">*</span></label>
											<UInput 
												v-model="currentAttendee.personalInfo.emergencyContact.last_name"
												placeholder="Last name"
											/>
										</div>
										<div>
											<label class="mb-1 block text-sm font-medium text-gray-700">Phone number <span class="text-red-500">*</span></label>
											<UInput 
												v-model="currentAttendee.personalInfo.emergencyContact.phone_number"
												placeholder="Phone number"
											/>
										</div>
										<div>
											<label class="mb-1 block text-sm font-medium text-gray-700">Relationship</label>
											<USelectMenu
												v-model="currentAttendee.personalInfo.emergencyContact.relationship"
												:options="emergencyRelationshipOptions"
												value-attribute="value"
												option-attribute="label"
												placeholder="Select relationship"
											/>
										</div>
										<div class="sm:col-span-2">
											<label class="mb-1 block text-sm font-medium text-gray-700">Email (optional)</label>
											<UInput 
												v-model="currentAttendee.personalInfo.emergencyContact.email" 
												type="email"
												placeholder="Email address"
											/>
										</div>
									</div>
									<p
										v-else-if="isAttendeeMinor(currentAttendee)"
										class="mt-2 text-xs font-semibold text-red-600"
									>
										Emergency contact is required for attendees under 18.
									</p>
								</div>
							</div>
						</div>

									<div v-else-if="activeStepIndex === 3" class="space-y-6">
							<div>
								<h2 class="text-lg font-semibold text-gray-900">Ticket package</h2>
								<p class="text-sm text-gray-600">Choose the package for this attendee.</p>
							</div>

							<div v-if="availableBookingPackages.length" class="grid gap-4 sm:grid-cols-2">
								<label
									v-for="pkg in availableBookingPackages"
									:key="pkg.id"
									class="flex cursor-pointer flex-col rounded-xl border p-4 text-sm"
									:class="pkg.id === currentAttendee.packageId ? 'border-primary bg-primary/5' : 'border-gray-200'"
								>
									<div class="flex items-center justify-between">
										<span class="font-semibold text-gray-900">{{ pkg.name }}</span>
										<input
											type="radio"
											class="h-4 w-4 text-primary"
											:value="pkg.id"
											v-model="currentAttendee.packageId"
										/>
									</div>
									<p class="mt-2 text-xs text-gray-600">{{ pkg.description || 'No description provided.' }}</p>
									<p class="mt-3 text-sm font-semibold text-gray-900">
										{{ pkg.modified_amount }} {{ pkg.base_amount_currency }}
									</p>
								</label>
							</div>
							<p v-else class="text-sm text-gray-500">No packages are currently available for this attendee.</p>
							<p v-if="currentAttendee.packageId && !isCurrentAttendeePackageAvailable" class="text-xs font-semibold text-amber-700">
								The previously selected package is outside its availability window. Please pick another package.
							</p>
						</div>

									<div v-else-if="activeStepIndex === 4" class="space-y-6">
										<div>
											<h2 class="text-lg font-semibold text-gray-900">Products</h2>
											<p class="text-sm text-gray-600">Optional add-ons linked to the selected package.</p>
										</div>

										<p v-if="!currentAttendee?.packageId" class="text-sm text-gray-500">
											Select a package first to see available products.
										</p>
										<p v-else-if="packageProductsLoading" class="text-sm text-gray-500">
											Loading package products...
										</p>
										<p v-else-if="packageProductsError" class="text-sm font-semibold text-red-600">
											{{ packageProductsError }}
										</p>

										<div v-else-if="currentPackageProducts.length" class="space-y-4">
											<div
												v-for="packageProduct in currentPackageProducts"
												:key="packageProduct.id"
												class="rounded-xl border border-gray-200 overflow-hidden"
											>
												<!-- Product Header -->
												<div class="border-b border-gray-200 bg-white p-4">
													<div class="flex flex-wrap items-start justify-between gap-3">
														<div>
															<p class="text-sm font-semibold text-gray-900">{{ packageProduct.productTitle }}</p>
															<p class="mt-1 text-xs text-gray-600">Pick a size, then choose your color.</p>
														</div>
														<UBadge color="gray" variant="soft" size="xs">
															Max {{ packageProduct.quantityPerAttendee }}
														</UBadge>
													</div>
												</div>

												<!-- Product Content: Image + Selection -->
												<div class="grid gap-4 p-4 sm:grid-cols-3 lg:grid-cols-4">
													<!-- Left: Product Image (Portrait) -->
													<div class="sm:col-span-1">
														<div class="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
															<img
																:src="getPackageProductImageSrc(packageProduct)"
																:alt="`${packageProduct.productTitle} image`"
																class="aspect-[3/4] w-full object-cover"
															/>
														</div>
													</div>

													<!-- Right: Selection Options -->
													<div class="sm:col-span-2 lg:col-span-3 flex flex-col gap-4">
														<!-- Step 1: Size Selection -->
														<div>
															<label class="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-600">Step 1: Size</label>
															<div v-if="getUniqueSizesForPackageProduct(packageProduct.id).length" class="flex flex-wrap gap-2">
																<button
																	v-for="sizeOption in getUniqueSizesForPackageProduct(packageProduct.id)"
																	:key="sizeOption.size"
																	type="button"
																	class="rounded-lg border px-4 py-2 text-sm font-medium transition"
																	:class="[
																		getSelectedSizeForProduct(packageProduct.id) === sizeOption.size
																			? 'border-blue-500 bg-blue-50 text-blue-700'
																			: 'border-slate-200 bg-white text-slate-700 hover:border-slate-300',
																		!sizeOption.Available ? 'cursor-not-allowed opacity-50' : ''
																	]"
																	:disabled="!sizeOption.Available"
																	@click="setSelectedSizeForProduct(packageProduct.id, sizeOption.size)"
																>
																	{{ sizeOption.size }}
																</button>
															</div>
															<p v-else class="text-xs text-amber-700 font-semibold">No sizes available.</p>
														</div>

														<!-- Step 2: Color Selection (only show if size selected) -->
														<div v-if="getSelectedSizeForProduct(packageProduct.id)">
															<label class="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-600">Step 2: Color</label>
															<div class="flex flex-wrap gap-3">
																<button
																	v-for="colorOption in getColorsForPackageProductAndSize(packageProduct.id, getSelectedSizeForProduct(packageProduct.id)!)"
																	:key="colorOption.colorHex"
																	type="button"
																	class="flex flex-col items-center gap-1 transition"
																	:disabled="!colorOption.isActive || colorOption.stockQuantity <= 0"
																	@click="
																		() => {
																			const variantId = getVariantIdForPackageProductSizeColor(packageProduct.id, getSelectedSizeForProduct(packageProduct.id)!, colorOption.colorHex)
																			if (variantId) {
																				setPackageProductVariantSelection(packageProduct.id, variantId)
																			}
																		}
																	"
																>
																	<!-- Color Swatch -->
																	<div
																		class="h-10 w-10 rounded-lg border-2 transition"
																		:style="{ backgroundColor: colorOption.colorHex }"
																		:class="[
																			getSelectionForPackageProduct(packageProduct.id)?.variantId === getVariantIdForPackageProductSizeColor(packageProduct.id, getSelectedSizeForProduct(packageProduct.id)!, colorOption.colorHex)
																				? 'border-blue-500 ring-2 ring-blue-300'
																				: 'border-slate-300',
																			!colorOption.isActive || colorOption.stockQuantity <= 0 ? 'opacity-50' : ''
																		]"
																	/>
																	<!-- Stock Label -->
																	<!-- <span class="text-xs font-semibold" :class="colorOption.stockQuantity > 0 ? 'text-emerald-700' : 'text-slate-500'">
																		{{ colorOption.stockQuantity > 0 ? `${colorOption.stockQuantity}` : 'Out' }}
																	</span> -->
																</button>
															</div>
														</div>


														<!-- Quantity and Pricing -->
														<div v-if="getSelectedSizeForProduct(packageProduct.id)" class="border-t border-slate-200 pt-4 space-y-4">
															<!-- Quantity Selection -->
															<div>
																<label class="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">Quantity</label>
																<UInput
																	type="number"
																	:min="1"
																	:max="packageProduct.quantityPerAttendee"
																	:disabled="!getSelectionForPackageProduct(packageProduct.id)"
																	:model-value="getSelectionForPackageProduct(packageProduct.id)?.quantity || 1"
																	@update:model-value="setPackageProductQuantity(packageProduct.id, Number($event || 1))"
																/>
																<p class="mt-1 text-xs text-slate-500">Up to {{ packageProduct.quantityPerAttendee }} per attendee</p>
															</div>

															<!-- Price Breakdown -->
															<div v-if="getSelectionForPackageProduct(packageProduct.id) && getSelectedVariantPriceInfo(packageProduct)" class="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-4 space-y-3">
																<p class="text-xs font-bold uppercase tracking-wide text-blue-900">Price breakdown</p>

																<!-- Standard vs Bundle Comparison -->
																<div class="space-y-2">
																	<div class="flex items-center justify-between">
																		<span class="text-xs text-slate-700">Standard price per unit</span>
																		<span class="text-sm font-semibold text-slate-900">{{ formatMoney(getSelectedVariantPriceInfo(packageProduct)!.standardPrice, packageProduct.currency) }}</span>
																	</div>

																	<div v-if="getSelectedVariantPriceInfo(packageProduct)!.bundledPrice !== getSelectedVariantPriceInfo(packageProduct)!.standardPrice" class="flex items-center justify-between">
																		<span class="text-xs text-emerald-700 font-semibold">Bundle price per unit</span>
																		<span class="text-sm font-bold text-emerald-700">{{ formatMoney(getSelectedVariantPriceInfo(packageProduct)!.bundledPrice, packageProduct.currency) }}</span>
																	</div>

																	<div v-if="getSelectedVariantPriceInfo(packageProduct)!.bundledPrice === getSelectedVariantPriceInfo(packageProduct)!.standardPrice" class="flex items-center justify-between">
																		<span class="text-xs text-slate-700">Bundle price per unit</span>
																		<span class="text-sm font-semibold text-slate-900">{{ formatMoney(getSelectedVariantPriceInfo(packageProduct)!.bundledPrice, packageProduct.currency) }}</span>
																	</div>
																</div>

																<!-- Total Cost -->
																<div class="border-t border-blue-300 pt-3 flex items-center justify-between">
																	<div>
																		<p class="text-xs text-slate-600">Total for {{ getSelectedVariantPriceInfo(packageProduct)!.quantity }} {{ getSelectedVariantPriceInfo(packageProduct)!.quantity === 1 ? 'item' : 'items' }}</p>
																		<p class="text-xs text-slate-500 mt-0.5">At checkout</p>
																	</div>
																	<div class="text-right">
																		<p class="text-2xl font-black text-blue-900">{{ formatMoney(getSelectedVariantPriceInfo(packageProduct)!.totalPrice, packageProduct.currency) }}</p>
																	</div>
																</div>
															</div>

															<!-- Action Buttons -->
															<div class="flex justify-end gap-2">
																<UButton
																	size="xs"
																	color="gray"
																	variant="ghost"
																	:disabled="!getSelectionForPackageProduct(packageProduct.id)"
																	@click="removePackageProductSelection(packageProduct.id)"
																>
																	Remove
																</UButton>
															</div>
														</div>
														<!-- Empty State Helper -->
														<div v-else class="flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-700">
															<UIcon name="i-heroicons-information-circle" class="h-4 w-4" />
															<span>Select a size to see available colors.</span>
														</div>
													</div>
												</div>
											</div>

											<div v-if="selectedAddOnsSummary.length" class="rounded-xl border border-slate-200 bg-slate-50 p-4">
												<p class="text-sm font-semibold text-slate-900">Selected add-ons</p>
												<ul class="mt-2 space-y-2">
													<li
														v-for="row in selectedAddOnsSummary"
														:key="`${row.packageProductId}-${row.variantLabel}`"
														class="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
													>
														<div class="text-slate-700">
															<p class="font-semibold text-slate-900">{{ row.productTitle }}</p>
															<p>{{ row.variantLabel }}</p>
														</div>
														<p class="font-semibold text-slate-800">x{{ row.quantity }}</p>
													</li>
												</ul>
											</div>
										</div>

										<p v-else class="text-sm text-gray-500">No package products available for this package.</p>
									</div>

									<div v-else-if="activeStepIndex === 5" class="space-y-6">
							<div>
								<h2 class="text-lg font-semibold text-gray-900">Consents</h2>
								<p class="text-sm text-gray-600">Review and accept event consents.</p>
							</div>

							<div v-if="consents.length" class="space-y-4">
								<label
									v-for="consent in consents"
									:key="consent.id"
									class="flex items-start gap-3 rounded-xl border border-gray-200 p-4"
								>
									<input
										type="checkbox"
										class="mt-1 h-4 w-4 rounded border-gray-300 text-primary"
										:checked="isConsentChecked(consent.id)"
										@change="toggleConsent(consent.id, $event)"
									/>
									<div>
										<div class="flex items-center gap-2">
											<span class="text-sm font-semibold text-gray-900">{{ consent.title }}</span>
											<UBadge v-if="consent.required" color="red" variant="soft" size="xs">Required</UBadge>
										</div>
										<p class="mt-1 text-xs text-gray-600">{{ consent.description }}</p>
										<a
											v-if="consent.external_link"
											:href="consent.external_link"
											target="_blank"
											class="mt-2 inline-block text-xs font-semibold text-primary"
										>
											View details
										</a>
									</div>
								</label>
							</div>
							<p v-else class="text-sm text-gray-500">No consents required for this event.</p>
						</div>

									<div v-else-if="activeStepIndex === reviewStepIndex" class="space-y-6">
							<div>
								<h2 class="text-lg font-semibold text-gray-900">Review and pay</h2>
								<p class="text-sm text-gray-600">Confirm attendee selections and choose a payment method.</p>
							</div>

							<div class="space-y-4">
								<div
									v-for="(attendee, index) in store.attendees"
									:key="index"
									class="rounded-xl border border-gray-200 p-4"
								>
									<div class="flex items-start justify-between">
										<div>
											<p class="text-sm font-semibold text-gray-900">
												Attendee {{ index + 1 }}: {{ attendee.first_name }} {{ attendee.last_name }}
											</p>
											<p class="mt-1 text-xs text-gray-600">
												Package: {{ packageById(attendee.packageId)?.name || 'Not selected' }}
											</p>
											<div class="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
												<span class="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">
													Age {{ calculateAge(attendee.date_of_birth || '') ?? 'N/A' }}
												</span>
												<span class="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">
													{{ attendee.personalInfo.medicalConditions.length }} medical
												</span>
												<span class="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">
													{{ attendee.personalInfo.dietaryRequirements.length }} dietary
												</span>
												<span class="rounded-full px-2.5 py-1 font-semibold" :class="attendeeReviewAmount(attendee, index).amount === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-50 text-emerald-700'">
													Due {{ attendeeReviewAmount(attendee, index).amount === 0 ? 'FREE' : formatMoney(attendeeReviewAmount(attendee, index).amount, attendeeReviewAmount(attendee, index).currency) }}
												</span>
											</div>
										</div>
										<UButton size="xs" color="gray" variant="ghost" @click="jumpToAttendee(index)">
											Edit
										</UButton>
									</div>
								</div>
							</div>

<div v-if="isBookingFree" class="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
							<div class="flex items-center gap-3">
								<UIcon name="i-heroicons-check-circle" class="h-5 w-5 text-emerald-600" />
								<div>
									<p class="font-semibold text-emerald-900">This event is FREE!</p>
									<p class="mt-1 text-xs text-emerald-700">No payment method required. Complete your registration below.</p>
								</div>
							</div>
						</div>

						<div v-else>
								<label class="mb-1 block text-sm font-medium text-gray-700">Payment method</label>
								<div v-if="paymentMethods.length" class="grid gap-3 sm:grid-cols-1 lg:grid-cols-1">
									<button
										v-for="method in paymentMethods"
										:key="method.id"
										type="button"
										class="rounded-xl border p-4 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
										:class="method.id === selectedPaymentMethodId ? 'border-slate-900 bg-slate-900 text-white shadow-lg' : 'border-slate-200 bg-white hover:border-slate-300'"
										:disabled="isCheckoutUiBusy"
										@click="selectedPaymentMethodId = method.id"
									>
										<div class="flex items-center justify-between gap-2">
											<div class="flex items-center gap-2">
												<UIcon :name="getMethodIcon(method.method_type)" class="h-5 w-5" />
												<p class="text-sm font-semibold">{{ method.title }}</p>
											</div>
											<UIcon
												v-if="method.id === selectedPaymentMethodId"
												name="i-heroicons-check-circle"
												class="h-5 w-5 text-emerald-400"
											/>
										</div>
										<p class="mt-2 text-xs uppercase tracking-[0.14em]" :class="method.id === selectedPaymentMethodId ? 'text-white/80' : 'text-slate-500'">
											{{ method.method_type?.replace('_', ' ') || 'Method' }}
										</p>
									</button>
								</div>
								<p v-else class="text-sm text-gray-500">No payment methods available for this event.</p>
							</div>

							<div v-if="selectedPaymentMethod && !isBookingFree" class="rounded-xl border border-slate-200 bg-slate-50 p-4">
								<div class="flex items-center justify-between gap-3">
									<p class="text-sm font-semibold text-slate-900">{{ selectedPaymentMethod.title }}</p>
									<span class="rounded-full bg-slate-200 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-700">
										{{ paymentMethodTypeLabel }}
									</span>
								</div>
								<div v-if="isBankTransferMethod" class="mt-4 grid gap-3 sm:grid-cols-2">
									<div class="rounded-lg border border-blue-200 bg-blue-50 p-3">
										<p class="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">Account name</p>
										<p class="mt-1 text-sm font-semibold text-blue-900">{{ bankDetails.account_name || 'TBA' }}</p>
									</div>
									<div class="rounded-lg border border-blue-200 bg-blue-50 p-3">
										<p class="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">Sort code</p>
										<p class="mt-1 text-sm font-semibold text-blue-900">{{ bankDetails.sort_code || 'TBA' }}</p>
									</div>
									<div class="rounded-lg border border-blue-200 bg-blue-50 p-3 sm:col-span-2">
										<p class="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">Account number</p>
										<p class="mt-1 text-sm font-semibold text-blue-900">{{ bankDetails.account_number || 'TBA' }}</p>
									</div>

									<!-- <div class="rounded-lg border border-amber-200 bg-amber-50 p-3 sm:col-span-2">
										<p class="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700">Evidence policy</p>
										<p class="mt-1 text-sm text-amber-900">
											{{ isBankTransferEvidenceRequiredImmediately
												? 'This method requires evidence upload during checkout.'
												: 'Evidence can be uploaded later before payment completion.' }}
										</p>
									</div> -->

									<div class="rounded-lg border border-blue-200 bg-blue-50 p-3 sm:col-span-2">
										<p class="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">Reserved transfer reference</p>
										<p v-if="reservedBankTransferLoading" class="mt-1 text-sm font-semibold text-blue-900">Reserving your reference...</p>
										<p v-else-if="reservedBankTransferReference" class="mt-1 text-lg font-black tracking-[0.16em] text-blue-900">{{ reservedBankTransferReference }}</p>
										<p v-else class="mt-1 text-sm text-blue-900">Select bank transfer to reserve your reference before checkout.</p>
										<p v-if="reservedBankTransferError" class="mt-2 text-xs font-semibold text-red-600">{{ reservedBankTransferError }}</p>
										<p v-else-if="reservedBankTransferPaymentReference" class="mt-2 text-[11px] text-blue-700">Draft payment {{ reservedBankTransferPaymentReference }} is reserved for this checkout.</p>
									</div>

									<div v-if="isBankTransferEvidenceRequiredImmediately" class="rounded-lg border border-amber-200 bg-white p-3 sm:col-span-2 space-y-3">
										<p class="text-xs font-semibold text-slate-800">Upload transfer evidence</p>
										<p class="text-[11px] text-slate-500">Your transfer reference is already reserved above so you can include it before checkout.</p>
										<div class="grid gap-3 sm:grid-cols-2">
											<div class="sm:col-span-2">
												<label class="mb-1 block text-[11px] font-semibold text-slate-700">Evidence file <span class="text-red-600">*</span></label>
												<input
													type="file"
													accept=".pdf,.jpg,.jpeg,.png"
													class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
													@change="onBankTransferEvidenceFileChange"
												>
												<p class="mt-1 text-[11px] text-slate-500">Accepted: PDF/JPG/JPEG/PNG up to 10MB.</p>
												<p v-if="bankTransferEvidenceErrors.evidence_file" class="mt-1 text-xs font-semibold text-red-600">{{ bankTransferEvidenceErrors.evidence_file }}</p>
											</div>
											<div>
												<label class="mb-1 block text-[11px] font-semibold text-slate-700">Payer name <span class="text-red-600">*</span></label>
												<UInput v-model="bankTransferEvidence.payer_name" placeholder="Full name on the transfer" />
												<p v-if="bankTransferEvidenceErrors.payer_name" class="mt-1 text-xs font-semibold text-red-600">{{ bankTransferEvidenceErrors.payer_name }}</p>
											</div>
											<div>
												<label class="mb-1 block text-[11px] font-semibold text-slate-700">Payer account last 4 <span class="text-red-600">*</span></label>
												<UInput v-model="bankTransferEvidence.payer_account_last4" placeholder="1234" maxlength="4" />
												<p v-if="bankTransferEvidenceErrors.payer_account_last4" class="mt-1 text-xs font-semibold text-red-600">{{ bankTransferEvidenceErrors.payer_account_last4 }}</p>
											</div>
											<div class="sm:col-span-2">
												<label class="mb-1 block text-[11px] font-semibold text-slate-700">Amount on evidence <span class="text-red-600">*</span></label>
												<UInput
													:model-value="bankTransferEvidence.amount_on_evidence ?? undefined"
													type="number"
													min="0"
													step="0.01"
													placeholder="0.00"
													@update:model-value="(val) => {
														if (val === '' || val === null || val === undefined) {
															bankTransferEvidence.amount_on_evidence = null
															return
														}
														const amount = Number(val)
														bankTransferEvidence.amount_on_evidence = Number.isFinite(amount) ? amount : null
													}"
												/>
												<p v-if="bankTransferEvidenceErrors.amount_on_evidence" class="mt-1 text-xs font-semibold text-red-600">{{ bankTransferEvidenceErrors.amount_on_evidence }}</p>
											</div>
										</div>
									</div>
								</div>

								<div v-else-if="isStripeMethod" class="mt-4 space-y-3">
										<div class="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
											<div class="flex items-center justify-between gap-2">
												<p>Enter your card details. Payment is processed securely with Stripe.</p>
												<div class="flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
													<UIcon name="i-heroicons-lock-closed" class="h-3.5 w-3.5" />
													Secured by Stripe
												</div>
											</div>
									</div>
										<div v-if="isStripeTestMode" class="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
											<p class="font-bold uppercase tracking-[0.12em]">Stripe test mode</p>
											<p class="mt-1">Use card number <span class="font-black">4242 4242 4242 4242</span>, any future expiry date, any CVC.</p>
											<div class="mt-3">
												<label class="mb-1 block text-[11px] font-semibold text-amber-900">Stripe publishable key override</label>
												<UInput v-model="manualStripePublicKey" placeholder="pk_test_..." />
											</div>
										</div>
										<div v-if="!effectiveStripePublishableKey" class="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
											Missing Stripe publishable key. Add it in test mode override or Stripe settings.
										</div>
									<div class="rounded-lg border border-slate-300 bg-white p-3">
										<div ref="stripeCardMountRef" class="min-h-[44px]"></div>
									</div>
									<p v-if="stripeCardError" class="text-xs font-semibold text-red-600">{{ stripeCardError }}</p>
									<p v-else-if="stripePaymentAttemptError" class="text-xs font-semibold text-red-600">
										{{ stripePaymentAttemptError }}
									</p>
									<p v-else-if="!stripeCardReady" class="text-xs text-slate-500">Complete card details to enable checkout.</p>
									<p v-else class="text-xs font-semibold text-emerald-700">Card details ready.</p>
								</div>
							</div>
						</div>
					<div class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-6">
										<UButton color="gray" variant="ghost" :disabled="isCheckoutUiBusy" @click="handleBack">Back</UButton>
										<div class="flex items-center gap-3">
											<UButton
												v-if="activeStepIndex === reviewStepIndex"
												color="primary"
												:loading="isCheckoutUiBusy"
												:disabled="!canContinue || shouldDisableCheckoutButton"
												@click="handleCheckout"
											>
												{{ checkoutPrimaryButtonLabel }}
											</UButton>
											<UButton
												v-else
												color="primary"
												:loading="isSaving"
												:disabled="!canContinue || isCheckoutUiBusy"
												@click="handleNext"
											>
												{{ primaryActionLabel }}
											</UButton>
										</div>
									</div>
								</div>
							</Transition>
						</div>
					</div>
				</main>

				<!-- <aside v-if="showCheckoutPricingSidebar" class="w-full lg:w-80 lg:flex-shrink-0"> -->
					<!-- <div class="space-y-4 lg:sticky lg:top-24">
						<div class="rounded-2xl border border-slate-900 bg-slate-900 p-4 text-white shadow-lg">
							<p class="text-[10px] font-black uppercase tracking-[0.18em] text-white/70">Live checkout pricing</p>
							<p class="mt-2 text-sm text-white/90">Transparent totals powered by server-side pricing rules.</p>
						</div>

						<div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
							<div class="flex items-center justify-between">
								<h3 class="text-sm font-semibold text-slate-900">Payment breakdown</h3>
								<p class="text-xs text-slate-500">Calculated server-side</p>
							</div>
							<p v-if="checkoutPreviewLoading" class="mt-3 text-xs text-slate-500">Refreshing payment breakdown...</p>
							<p v-else-if="checkoutPreviewError" class="mt-3 text-xs font-semibold text-red-600">{{ checkoutPreviewError }}</p>
							<div class="mt-3 space-y-2">
								<div
									v-for="item in breakdownLines"
									:key="item.id"
									class="rounded-lg border border-slate-100 bg-slate-50 px-3 py-3 text-sm"
								>
									<div class="flex items-center justify-between gap-3">
										<div>
											<p class="font-semibold text-slate-800">{{ item.name }}</p>
											<p class="text-xs text-slate-500">{{ item.description }}</p>
											<p v-if="item.discountHint" class="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">{{ item.discountHint }}</p>
										</div>
										<p class="font-semibold text-slate-900">{{ formatMoney(item.finalAmount, item.currency) }}</p>
									</div>
									<p class="mt-2 text-[11px] text-slate-600">
										{{ formatMoney(item.originalAmount, item.currency) }}
										<span class="text-slate-400">-</span>
										<span class="text-emerald-700">{{ formatMoney(item.discountAmount, item.currency) }}</span>
										<span class="text-slate-400">=</span>
										<span class="font-semibold text-slate-800">{{ formatMoney(item.finalAmount, item.currency) }}</span>
									</p>
								</div>
								<p v-if="!breakdownLines.length && !checkoutPreviewLoading" class="text-xs text-slate-500">No payable items selected yet.</p>
							</div>
							<div class="mt-4 border-t border-slate-100 pt-3 text-sm">
								<div class="flex items-center justify-between text-slate-600">
									<span>Subtotal</span>
									<span>{{ formatMoney(paymentBreakdownTotal.originalAmount, paymentBreakdownTotal.currency) }}</span>
								</div>
								<div class="mt-1 flex items-center justify-between text-emerald-700">
									<span>Total discount</span>
									<span>-{{ formatMoney(paymentBreakdownTotal.discountAmount, paymentBreakdownTotal.currency) }}</span>
								</div>
								<div class="mt-2 flex items-center justify-between text-base font-bold text-slate-900">
									<span>Total due</span>
									<span>{{ formatMoney(paymentBreakdownTotal.amount, paymentBreakdownTotal.currency) }}</span>
								</div>
								<p v-if="isPollingPaymentStatus" class="mt-2 text-xs font-semibold text-amber-700">{{ paymentProcessingMessage || 'Finalizing your payment...' }}</p>
							</div>
						</div>

						<div class="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
							<div class="flex items-center gap-2 font-semibold">
								<UIcon name="i-heroicons-lock-closed" class="h-4 w-4" />
								Powered and secured by Stripe
							</div>
							<p class="mt-1 text-xs text-emerald-700">Card data is tokenized by Stripe and never stored directly in AMDG forms.</p>
						</div>
					</div> -->
				<!-- </aside> -->
			</template>
		</div>
	</div>

	<Transition
		enter-active-class="transition duration-300 ease-out"
		enter-from-class="opacity-0"
		enter-to-class="opacity-100"
		leave-active-class="transition duration-200 ease-in"
		leave-from-class="opacity-100"
		leave-to-class="opacity-0"
	>
		<div
			v-if="isCheckoutUiBusy"
			class="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm"
		>
			<div class="w-full max-w-xl overflow-hidden rounded-3xl border border-blue-200 bg-white shadow-2xl">
				<div class="checkout-overlay-top" />
				<div class="space-y-4 px-6 pb-6 pt-5">
					<div class="flex items-start gap-3">
						<span class="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-700">
							<svg class="checkout-orbit h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
								<path d="M12 3a9 9 0 1 0 9 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
							</svg>
						</span>
						<div>
							<p class="text-[10px] font-black uppercase tracking-[0.2em] text-blue-700">Checkout in progress</p>
							<h3 class="mt-1 text-xl font-black text-slate-900">{{ checkoutProcessingStageLabel }}</h3>
							<p class="mt-1 text-sm text-slate-600">{{ checkoutProcessingDescription }}</p>
						</div>
					</div>

					<div class="rounded-xl border border-blue-200 bg-blue-50/70 p-3">
						<div class="checkout-progress-line">
							<span class="checkout-progress-dot" />
						</div>
						<p class="mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-800">Please keep this page open</p>
					</div>
				</div>
			</div>
		</div>
	</Transition>

	<UModal v-if="!showCheckoutSuccessModal" v-model="showIntentExpiredModal" :prevent-close="true" :ui="{ width: 'sm:max-w-xl' }">
		<div class="space-y-4 p-6 md:p-8">
			<div class="flex items-start gap-3">
				<div class="mt-0.5 rounded-full bg-amber-100 p-2">
					<UIcon name="i-heroicons-exclamation-triangle" class="h-5 w-5 text-amber-700" />
				</div>
				<div>
					<h3 class="text-lg font-bold text-slate-900">Registration session expired</h3>
					<p class="mt-1 text-sm text-slate-600">
						Your booking intent is no longer active. To protect checkout integrity, you'll be redirected to the event page.
					</p>
				</div>
			</div>
			<div class="flex justify-end">
				<UButton color="primary" @click="redirectToEventHome">Return to event</UButton>
			</div>
		</div>
	</UModal>

	<UModal v-model="showCheckoutSuccessModal" :prevent-close="true" :ui="{ width: 'sm:max-w-5xl' }">
		<div class="success-modal space-y-8 p-8 md:p-14">
			<div class="success-glow"></div>
			<div class="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-center gap-2 pt-4">
				<span class="h-2 w-2 rounded-full bg-emerald-400 animate-bounce" />
				<span class="h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
				<span class="h-2 w-2 rounded-full bg-amber-400 animate-bounce" />
			</div>
			<div class="success-pop text-center">
				<div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 ring-8 ring-emerald-100/60 md:h-24 md:w-24">
					<UIcon name="i-heroicons-check" class="h-11 w-11 text-emerald-600 success-check md:h-14 md:w-14" />
				</div>
				<h3 class="mt-5 text-4xl font-black tracking-tight text-slate-900 success-title md:text-5xl">Booking successful</h3>
				<p class="mt-4 text-lg font-semibold text-slate-600 success-event-lead md:text-2xl">You're going to</p>
				<p class="mt-2 text-4xl font-black tracking-tight text-emerald-700 success-event-name md:text-6xl">
					{{ event?.title || 'this event' }}
				</p>
				<div v-if="checkoutBankTransferReference" class="mx-auto mt-6 max-w-xl rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left">
					<p class="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-700">Bank transfer reference</p>
					<p class="mt-1 text-2xl font-black tracking-[0.12em] text-amber-900">{{ checkoutBankTransferReference }}</p>
					<p class="mt-2 text-xs text-amber-800">Use this exact reference when making the transfer so your payment can be matched quickly.</p>
					<p v-if="checkoutBankTransferInstructions" class="mt-2 text-xs text-amber-800">{{ checkoutBankTransferInstructions }}</p>
				</div>
			</div>

			<div class="flex justify-center success-cta-wrap">
				<UButton size="xl" color="primary" @click="closeSuccessModalAndRedirect">View your event dashboard</UButton>
			</div>
		</div>
	</UModal>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from '#ui/composables/useToast'
import { useRegistrationStore } from '~/stores/registration'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { attendeeValidationSchema } from '~/schemas/registration'

// Use middleware to validate booking intent and URL parameters
definePageMeta({
  middleware: 'register',
})
import { useEvent } from '~/composables/resources/events/events'
import { useEventVenues } from '~/composables/resources/events/eventVenues'
import { useEventQuestions } from '~/composables/resources/events/eventQuestions'
import { useDietaryRequirements } from '~/composables/resources/attendee/attendeeDietaryRequirements'
import { useMedicalConditions } from '~/composables/resources/attendee/bookingMedicalConditions'
import { useAccessibilityRequirements } from '~/composables/resources/attendee/accessibilityRequirements'
import { useConsents } from '~/composables/resources/attendee/attendeeConsents'
import { useBookingPackages } from '~/composables/resources/booking/bookingPackages'
import { useCheckoutBooking } from '~/composables/resources/booking/bookings'
import { useCheckoutPreview } from '~/composables/resources/booking/checkoutPreview'
import { useStripeConfig } from '~/composables/resources/common/stripe'
import { bookingsListRetrieve, locationsAreasList, paymentsListRetrieve } from '~/api/sdk.gen'
import {
	buildCheckoutPayload,
	buildCheckoutMultipartPayload,
	buildCheckoutPreviewPayload,
	createIdempotencyKey,
} from '~/composables/registration/checkout'
import { useBookingIntentManager } from '~/composables/registration/useBookingIntentManager'
import { usePackageProductManager } from '~/composables/registration/usePackageProductManager'
import { usePersonalInfoManager } from '~/composables/registration/usePersonalInfoManager'
import { useRegistrationStepManager } from '~/composables/registration/useRegistrationStepManager'
import { usePaymentMethodManager } from '~/composables/registration/usePaymentMethodManager'
import { uploadMultipart } from '~/utils/upload'
import { onImageError, resolveImageUrl } from '~/utils/image'
import { formatDate, formatTime } from '~/utils/time'
import type { AttendeeDraft } from '~/stores/registration'
import type { Stripe, StripeCardElement, StripeElements } from '@stripe/stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { formatMoney } from '~/utils/money'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const store = useRegistrationStore()
const runtimeConfig = useRuntimeConfig()
const currentIndex = computed(() => store.currentIndex)
const checkoutCompleted = ref(false)

// Initialize form (will be reset when currentAttendee changes)
const { values, errors, setFieldValue, resetForm, validate } = useForm({
	validationSchema: toTypedSchema(attendeeValidationSchema),
	initialValues: {
		first_name: '',
		last_name: '',
		email: '',
		phone_number: '',
		date_of_birth: '',
		gender: '',
		relationship_to_user: '',
	},
})

const runSafeValidation = async () => {
	try {
		return await validate()
	} catch {
		return { valid: false }
	}
}

const eventId = computed(() => String(route.params.id || ''))
const ticketCount = computed(() => Number(route.query.tickets || 1))
const registrationMode = computed(() => {
	const mode = String(route.query.mode || '').toLowerCase()
	if (mode === 'multiple') return 'multiple'
	if (mode === 'self') return 'self'
	return Number(route.query.tickets || 1) > 1 ? 'multiple' : 'self'
})
const registrarAttending = computed(() => {
	if (route.query.uia !== undefined) {
		const attending = String(route.query.uia).toLowerCase()
		return attending === 'true' || attending === '1'
	}

	if (route.query.o !== undefined) {
		// Legacy behavior: o=false used to mean registrar is attending.
		const legacy = String(route.query.o).toLowerCase()
		if (legacy === 'false' || legacy === '0') return true
		if (legacy === 'true' || legacy === '1') return false
	}

	return true
})

watchEffect(() => {
	if (!eventId.value) return
	if (store.eventId !== eventId.value || store.ticketCount !== ticketCount.value || store.registrarAttending !== registrarAttending.value) {
		store.init(eventId.value, ticketCount.value, registrarAttending.value)
	}
})

const eventQuery = useEvent(eventId)
const event = computed(() => eventQuery.data.value?.data || null)
const event_uuid = computed(() => event.value?.event_id || '')
const eventLoading = computed(() => eventQuery.isLoading.value)
const { data: eventVenuesData } = useEventVenues(
	computed(() => ({
		event: eventId.value,
	}))
)
const primaryVenue = computed(() => eventVenuesData.value?.data?.results?.[0] || null)

const fallbackHeroImage = '/assets/images/hero-cathedral.png'
const heroImageSrc = computed(() => resolveImageUrl(event.value?.main_landing_image?.image, fallbackHeroImage))
const reminderDate = computed(() => (event.value?.start_datetime ? formatDate(event.value.start_datetime, 'MMM d, yyyy') : 'TBA'))
const reminderTime = computed(() => {
	if (!event.value?.start_datetime) return 'TBA'
	const start = formatTime(event.value.start_datetime, event.value?.timezone)
	if (!event.value?.end_datetime) return start
	return `${start} - ${formatTime(event.value.end_datetime, event.value?.timezone)}`
})
const reminderLocation = computed(() => {
	if (primaryVenue.value?.venue_name) return primaryVenue.value.venue_name
	if (event.value?.organisation_name) return event.value.organisation_name
	return 'Location TBA'
})

const areaLookupLoading = ref(false)
const areaSearch = ref('')
const areaOptions = ref<Array<{ label: string; value: number }>>([])
let areaSearchDebounceTimer: ReturnType<typeof setTimeout> | null = null
const {
	showIntentExpiredModal,
	showIntentCountdown,
	intentCountdownLabel,
	intentTimerToneClass,
	pingBookingIntent,
	stopIntentPing,
	stopIntentCountdown,
	redirectToEventHome,
} = useBookingIntentManager({
	event,
	eventId,
	ticketCount,
	bookingIntentId: computed(() => store.bookingIntentId),
	checkoutCompleted,
	setBookingIntentId: (intentId) => store.setBookingIntentId(intentId),
	resetRegistrationStore: () => store.reset(),
	onIntentExpired: () => {
		showCheckoutSuccessModal.value = false
	},
})

const {
	steps,
	attendeeStepCount,
	reviewStepIndex,
	activeStepIndex,
	stepperTransitionName,
	stepWindowStart,
	visibleSteps,
	stepProgressPercent,
	attendeeDisplayName,
	attendeeStatusLabel,
	attendeeStatusBadgeClass,
	attendeeSidebarCardClass,
	attendeeStepSummary,
} = useRegistrationStepManager({
	currentIndex,
	isAttendeeReady: (attendee) => isAttendeeReady(attendee),
	maxVisibleStepperSteps: 3,
})

const currentAttendee = computed(() => store.attendees[currentIndex.value])
const currentAttendeeNumber = computed(() => currentIndex.value + 1)
const isRegistrarSelf = computed(() => store.registrarAttending && store.currentIndex === 0)
const showRelationshipField = computed(() => !(registrationMode.value === 'self' && isRegistrarSelf.value && store.ticketCount === 1))
const hasCurrentAreaFrom = computed(() => !!currentAttendee.value?.area_from)

const {
	relationshipOptions,
	genderOptions,
	emergencyRelationshipOptions,
	isAttendeeMinor,
	minorHasEmergencyContact,
	hasPersonalInfoItem,
	hasValidPersonalInfoItems,
	getPersonalInfoItemValidationError,
	toggleDietaryRequirement,
	toggleMedicalCondition,
	toggleAccessibilityRequirement,
	updateDietaryRequirementDetails,
	updateMedicalConditionSeverity,
	updateMedicalConditionDetails,
	updateAccessibilityRequirementDetails,
	isOtherOption,
	getDetailsForItem,
	addEmergencyContact,
} = usePersonalInfoManager({
	currentAttendee,
	currentIndex,
	setPersonalInfo: (index, personalInfo) => store.setPersonalInfo(index, personalInfo),
})

watchEffect(() => {
	if (!currentAttendee.value) return
	if (registrationMode.value === 'self' && isRegistrarSelf.value && store.ticketCount === 1) {
		currentAttendee.value.relationship_to_user = 'self'
	}
})

const dietaryRequirementsQuery = useDietaryRequirements()
const medicalConditionsQuery = useMedicalConditions()
const accessibilityRequirementsQuery = useAccessibilityRequirements()

const dietaryRequirements = computed(() => dietaryRequirementsQuery.data.value?.data?.results || [])
const medicalConditions = computed(() => medicalConditionsQuery.data.value?.data?.results || [])
const accessibilityRequirements = computed(() => accessibilityRequirementsQuery.data.value?.data?.results || [])

const consentsQuery = useConsents(
	computed(() => (event.value?.event_id ? { event: String(event.value.url_safe_title), page_size: 100 } : undefined))
)
const consents = computed(() => consentsQuery.data.value?.data?.results || [])

const eventQuestionsQuery = useEventQuestions(
	computed(() => (event.value?.url_safe_title ? { event: event.value.url_safe_title, page_size: 100 } : undefined)),
	{ enabled: computed(() => !!event.value?.event_id) }
)
const eventQuestions = computed(() => eventQuestionsQuery.data.value?.data?.results || [])
const requiredQuestionIds = computed(() => eventQuestions.value.filter((question) => question.required).map((question) => question.id))

const bookingPackagesQuery = useBookingPackages(
	computed(() => {
		return { event_id: event_uuid.value }
	})
)

const bookingPackages = computed(() => bookingPackagesQuery.data.value?.data?.results || [])
const allPackagesQuery = useBookingPackages(
	computed(() => {
		return { event_id: event_uuid.value, page_size: 200 }
	})
)
const allPackages = computed(() => allPackagesQuery.data.value?.data?.results || [])
const packageById = (packageId?: number) => allPackages.value.find((pkg) => pkg.id === packageId)

type AvailabilityWindow = {
	available_from?: string | null
	available_to?: string | null
}

const isDateWithinAvailabilityWindow = (window: AvailabilityWindow, now: Date) => {
	const from = window.available_from ? new Date(window.available_from) : null
	const to = window.available_to ? new Date(window.available_to) : null

	if (from && Number.isNaN(from.getTime())) return false
	if (to && Number.isNaN(to.getTime())) return false

	if (from && now < from) return false
	if (to && now > to) return false
	return true
}

const isPackageCurrentlyAvailable = (pkg: any) => {
	const windows = Array.isArray(pkg?.availability_windows) ? pkg.availability_windows as AvailabilityWindow[] : []
	if (!windows.length) return true
	const now = new Date()
	return windows.some((window) => isDateWithinAvailabilityWindow(window, now))
}

const availableBookingPackages = computed(() => bookingPackages.value.filter((pkg) => isPackageCurrentlyAvailable(pkg)))
const isCurrentAttendeePackageAvailable = computed(() => {
	if (!currentAttendee.value?.packageId) return false
	const pkg = packageById(currentAttendee.value.packageId)
	if (!pkg) return false
	return isPackageCurrentlyAvailable(pkg)
})

const {
	packageProductsLoading,
	packageProductsError,
	currentPackageProducts,
	currentAttendeeProductSelections,
	selectedAddOnsSummary,
	variantOptionLabel,
	handlePackageProductVariantChange,
	getSelectionForPackageProduct,
	getVariantsForPackageProduct,
	getUniqueSizesForPackageProduct,
	getColorsForPackageProductAndSize,
	getVariantIdForPackageProductSizeColor,
	setSelectedSizeForProduct,
	getSelectedSizeForProduct,
	getSelectedVariantPriceInfo,
	hasAnyVariantsForPackageProduct,
	hasSelectableVariantsForPackageProduct,
	getBundleMultiplier,
	getBundledVariantEstimate,
	getSelectedVariantForPackageProduct,
	getSelectedBundledVariantEstimate,
	setPackageProductVariantSelection,
	setPackageProductQuantity,
	removePackageProductSelection,
	loadPackageProductsForCurrentAttendee,
} = usePackageProductManager({
	currentAttendee,
	currentIndex,
	setProductSelections: (index, selections) => store.setProductSelections(index, selections),
})

const getPackageProductImageSrc = (packageProduct: { imageUrl: string | null }) => {
	return resolveImageUrl(packageProduct.imageUrl)
}

const attendeeReviewAmount = (attendee: AttendeeDraft, index: number) => {
	const previewAttendees = checkoutPreview.value?.attendees || []
	const previewAttendee = previewAttendees[index]
	if (previewAttendee?.attendee_total) {
		return {
			amount: Number(previewAttendee.attendee_total || 0),
			currency: previewAttendee.currency || checkoutPreview.value?.currency || 'GBP',
		}
	}

	const pkg = packageById(attendee.packageId)
	return {
		amount: Number(pkg?.modified_amount || 0),
		currency: pkg?.base_amount_currency || checkoutPreview.value?.currency || 'GBP',
	}
}
const {
	paymentMethods,
	selectedPaymentMethodId,
	selectedPaymentMethod,
	getMethodIcon,
	paymentMethodTypeLabel,
	isBankTransferMethod,
	isStripeMethod,
	isBankTransferEvidenceRequiredImmediately,
	bankDetails,
	reservedBankTransferPaymentId,
	reservedBankTransferPaymentReference,
	reservedBankTransferReference,
	reservedBankTransferLoading,
	reservedBankTransferError,
	clearReservedBankTransferPayment,
	reserveBankTransferPayment,
	bankTransferEvidence,
	bankTransferEvidenceErrors,
	clearBankTransferEvidenceForm,
	onBankTransferEvidenceFileChange,
	isBankTransferEvidenceFormReady,
	validateBankTransferEvidenceForm,
	uploadBankTransferEvidenceForCheckout,
} = usePaymentMethodManager({
	eventUuid: event_uuid,
	bookingIntentId: computed(() => store.bookingIntentId),
})

type PreviewDiscountLine = {
	name?: string
	amount?: string
}

type PreviewPackage = {
	package_name?: string
	final_amount?: string
	discount_total?: string
	currency?: string
	applied_discounts?: PreviewDiscountLine[]
}

type PreviewProductLine = {
	product_title?: string
	quantity?: number
	line_total?: string
	currency?: string
	applied_discounts?: PreviewDiscountLine[]
}

type PreviewAttendee = {
	attendee_name?: string
	package?: PreviewPackage
	products?: PreviewProductLine[]
	attendee_total?: string
	currency?: string
}

type CheckoutPreviewData = {
	total_amount?: string
	currency?: string
	attendees?: PreviewAttendee[]
}

type BreakdownLine = {
	id: string
	name: string
	description: string
	originalAmount: number
	discountAmount: number
	finalAmount: number
	currency: string
	discountHint?: string
}

const checkoutPreviewMutation = useCheckoutPreview()
const checkoutMutation = useCheckoutBooking()
const stripeConfigQuery = useStripeConfig()
const isStripeTestMode = computed(() => !!runtimeConfig.public.stripeTestMode)
const testModeStripePublishableKey = computed(() => String(runtimeConfig.public.stripeTestPublishableKey || '').trim())
const manualStripePublicKey = ref(testModeStripePublishableKey.value)
const effectiveStripePublishableKey = computed(() => {
	const manualKey = manualStripePublicKey.value.trim()
	if (isStripeTestMode.value && manualKey) {
		return manualKey
	}
	const apiKey = stripeConfigQuery.data.value?.data?.publishable_key?.trim()
	if (apiKey) {
		return apiKey
	}
	return testModeStripePublishableKey.value
})

const idempotencyKey = ref(createIdempotencyKey())
const isSaving = ref(false)
const checkoutResult = ref<any>(null)
const showCheckoutSuccessModal = ref(false)
const checkoutPreview = ref<CheckoutPreviewData | null>(null)
const checkoutPreviewError = ref('')
const checkoutPreviewLoading = computed(() => checkoutPreviewMutation.isPending.value)

const stripeCardMountRef = ref<HTMLElement | null>(null)
const stripeInstance = ref<Stripe | null>(null)
const stripeElements = ref<StripeElements | null>(null)
const stripeCardElement = ref<StripeCardElement | null>(null)
const stripeCardReady = ref(false)
const stripeCardError = ref('')
const stripePaymentAttemptError = ref('')
const stripeClientSecret = ref<string | null>(null)

const isCheckoutUiBusy = computed(() => isSaving.value || isPollingPaymentStatus.value)
const shouldDisableCheckoutButton = computed(() => checkoutCompleted.value || isCheckoutUiBusy.value)

const checkoutPrimaryButtonLabel = computed(() => {
	if (isPollingPaymentStatus.value) return 'Finalizing payment...'
	if (isSaving.value && isStripeMethod.value) return 'Processing card payment...'
	if (isSaving.value && isBankTransferMethod.value) return 'Submitting transfer checkout...'
	if (isSaving.value) return 'Completing checkout...'
	return 'Complete registration'
})

const checkoutProcessingStageLabel = computed(() => {
	if (isPollingPaymentStatus.value) return 'Finalizing your registration'
	if (isStripeMethod.value) return 'Confirming card payment'
	if (isBankTransferMethod.value) return 'Submitting bank transfer checkout'
	return 'Submitting checkout'
})

const checkoutProcessingDescription = computed(() => {
	if (isPollingPaymentStatus.value) {
		return paymentProcessingMessage.value || 'We are verifying payment status and preparing your booking.'
	}
	if (isStripeMethod.value) {
		return 'Your card is being securely processed via Stripe. Please do not close this page.'
	}
	if (isBankTransferMethod.value) {
		return 'We are locking in your transfer details and creating your booking.'
	}
	return 'We are completing your checkout request.'
})

const getStripeAccountIdFromPaymentMethod = (paymentMethod: typeof selectedPaymentMethod.value): string | null => {
	const details = paymentMethod?.provided_details
	if (!details || typeof details !== 'object' || Array.isArray(details)) return null
	const stripeAccountId = (details as Record<string, unknown>).stripe_account_id
	return typeof stripeAccountId === 'string' && stripeAccountId.trim().length ? stripeAccountId.trim() : null
}

const requireStripeAccountIdFromPaymentMethod = (paymentMethod: typeof selectedPaymentMethod.value, context: string): string => {
	const stripeAccountId = getStripeAccountIdFromPaymentMethod(paymentMethod)
	console.debug(`[${context}] Stripe payment method inspection`, {
		paymentMethodId: paymentMethod?.id || null,
		paymentMethodTitle: paymentMethod?.title || null,
		methodType: paymentMethod?.method_type || null,
		hasProvidedDetails: !!paymentMethod?.provided_details,
		stripeAccountId,
	})

	if (!stripeAccountId) {
		const error = new Error(
			`Stripe checkout requires provided_details.stripe_account_id on the selected payment method (${paymentMethod?.id || 'unknown'}).`
		)
		console.error(`[${context}] ${error.message}`, {
			paymentMethod,
			providedDetails: paymentMethod?.provided_details ?? null,
		})
		throw error
	}

	return stripeAccountId
}

const isPollingPaymentStatus = ref(false)
const paymentProcessingMessage = ref('')

let previewDebounceTimer: ReturnType<typeof setTimeout> | null = null
let paymentPollingTimer: ReturnType<typeof setInterval> | null = null

const checkoutBankTransferReference = computed(() => {
	const value = checkoutResult.value?.bank_transfer_reference
	return typeof value === 'string' && value.trim().length ? value.trim() : null
})

const checkoutBankTransferInstructions = computed(() => {
	const value = checkoutResult.value?.bank_transfer_instructions
	return typeof value === 'string' && value.trim().length ? value.trim() : null
})

const parseDiscountAmount = (value: string | undefined) => Math.abs(Number(value || 0))

const previewTriggerSignature = computed(() => JSON.stringify(
	store.attendees.map((attendee) => ({
		attendeeId: attendee.attendeeId || null,
		firstName: attendee.first_name,
		lastName: attendee.last_name,
		dob: attendee.date_of_birth,
		relationship: attendee.relationship_to_user || null,
		areaFrom: attendee.area_from || null,
		packageId: attendee.packageId || null,
		products: attendee.productSelections || [],
		consents: attendee.consents,
		answers: attendee.questionAnswers,
	}))
))

const breakdownLines = computed<BreakdownLine[]>(() => {
	const previewAttendees = Array.isArray(checkoutPreview.value?.attendees)
		? checkoutPreview.value!.attendees!
		: []

	if (!previewAttendees.length) {
		return store.attendees.map((attendee, index) => {
			const pkg = packageById(attendee.packageId)
			const amount = Number(pkg?.modified_amount || 0)
			const currency = pkg?.base_amount_currency || checkoutResult.value?.currency || 'GBP'
			return {
				id: `fallback-${index}`,
				name: attendeeDisplayName(attendee, index),
				description: pkg?.name || 'No package selected',
				originalAmount: amount,
				discountAmount: 0,
				finalAmount: amount,
				currency,
			}
		})
	}

	const lines: BreakdownLine[] = []
	previewAttendees.forEach((attendee, attendeeIndex) => {
		const attendeeName = attendee.attendee_name || `Attendee ${attendeeIndex + 1}`
		const packageLine = attendee.package
		if (packageLine) {
			const packageDiscount = parseDiscountAmount(packageLine.discount_total)
			const packageFinal = Number(packageLine.final_amount || 0)
			const discountHint = packageLine.applied_discounts?.length
				? `${packageLine.applied_discounts.length} discount(s)`
				: undefined
			lines.push({
				id: `package-${attendeeIndex}`,
				name: attendeeName,
				description: packageLine.package_name || 'Package',
				originalAmount: packageFinal + packageDiscount,
				discountAmount: packageDiscount,
				finalAmount: packageFinal,
				currency: packageLine.currency || checkoutPreview.value?.currency || 'GBP',
				discountHint,
			})
		}

		attendee.products?.forEach((product, productIndex) => {
			const productDiscount = (product.applied_discounts || []).reduce((sum, discount) => {
				return sum + parseDiscountAmount(discount.amount)
			}, 0)
			const productFinal = Number(product.line_total || 0)
			const discountHint = product.applied_discounts?.length
				? `${product.applied_discounts.length} discount(s)`
				: undefined
			lines.push({
				id: `product-${attendeeIndex}-${productIndex}`,
				name: `${attendeeName} add-on`,
				description: `${product.product_title || 'Product'} x${product.quantity || 1}`,
				originalAmount: productFinal + productDiscount,
				discountAmount: productDiscount,
				finalAmount: productFinal,
				currency: product.currency || checkoutPreview.value?.currency || 'GBP',
				discountHint,
			})
		})
	})

	return lines
})

const paymentBreakdownTotal = computed(() => {
	if (checkoutPreview.value?.total_amount) {
		const computedOriginal = breakdownLines.value.reduce((sum, item) => sum + item.originalAmount, 0)
		const computedDiscount = breakdownLines.value.reduce((sum, item) => sum + item.discountAmount, 0)
		return {
			originalAmount: computedOriginal,
			discountAmount: computedDiscount,
			amount: Number(checkoutPreview.value.total_amount || 0),
			currency: checkoutPreview.value.currency || 'GBP',
		}
	}

	const originalAmount = breakdownLines.value.reduce((sum, item) => sum + item.originalAmount, 0)
	const discountAmount = breakdownLines.value.reduce((sum, item) => sum + item.discountAmount, 0)
	const amount = breakdownLines.value.reduce((sum, item) => sum + item.finalAmount, 0)
	const currency = breakdownLines.value.find((item) => item.currency)?.currency || checkoutResult.value?.currency || 'GBP'
	return { originalAmount, discountAmount, amount, currency }
})

const showCheckoutPricingSidebar = computed(() => activeStepIndex.value === reviewStepIndex)

// const formatMoney = (value: number | string, currency: string = 'GBP') => {
// 	const amount = typeof value === 'number' ? value : Number(value || 0)
// 	return `${amount.toFixed(2)} ${currency}`
// }

const requiredConsentsMissing = computed(() => {
	if (!consents.value.length) return 0
	return consents.value.filter((consent) => consent.required && !isConsentChecked(consent.id)).length
})

const requiredConsentIds = computed(() => consents.value.filter((consent) => consent.required).map((consent) => consent.id))

const hasQuestionAnswerContent = (answer: AttendeeDraft['questionAnswers'][number]) => {
	if (typeof answer.answerText === 'string' && answer.answerText.trim().length > 0) return true
	if (typeof answer.answerText === 'number') return true
	if (answer.selectedOptionIds && answer.selectedOptionIds.length > 0) return true
	if (answer.uploadResourceId) return true
	if (answer.uploadUrl) return true
	return false
}

const attendeeHasRequiredAnswers = (attendee: AttendeeDraft) => {
	if (!requiredQuestionIds.value.length) return true
	return requiredQuestionIds.value.every((questionId) => {
		const answer = attendee.questionAnswers.find((entry) => entry.questionId === questionId)
		return !!answer && hasQuestionAnswerContent(answer)
	})
}

const attendeeHasRequiredConsents = (attendee: AttendeeDraft) => {
	if (!requiredConsentIds.value.length) return true
	return requiredConsentIds.value.every((consentId) =>
		attendee.consents.some((consent) => consent.consentId === consentId && consent.consentGiven)
	)
}

const isAttendeeReady = (attendee: AttendeeDraft) => {
	const hasNames = !!attendee.first_name && !!attendee.last_name
	const hasRelationship = !!attendee.relationship_to_user || (store.registrarAttending && attendee === store.attendees[0])
	const hasDob = !!attendee.date_of_birth
	const hasAreaFrom = !!attendee.area_from
	const hasPackage = !!attendee.packageId
	const hasEmergencyContactIfMinor = minorHasEmergencyContact(attendee)
	const hasPersonalInfoValidity = hasValidPersonalInfoItems(attendee)
	return hasNames && hasRelationship && hasDob && hasAreaFrom && hasPackage && hasEmergencyContactIfMinor && hasPersonalInfoValidity && attendeeHasRequiredAnswers(attendee) && attendeeHasRequiredConsents(attendee)
}

const isBookingFree = computed(() => {
	return paymentBreakdownTotal.value.amount === 0
})

const canContinue = computed(() => {
	if (!currentAttendee.value) return false
	if (activeStepIndex.value === 0) {
		const hasNames = !!values.first_name && !!values.last_name
		const hasRelationship = !!currentAttendee.value.relationship_to_user || isRegistrarSelf.value
		const hasDob = !!values.date_of_birth
		const hasAreaFrom = !!currentAttendee.value.area_from
		const parsed = attendeeValidationSchema.safeParse({
			first_name: values.first_name || '',
			last_name: values.last_name || '',
			email: values.email || '',
			phone_number: values.phone_number || '',
			date_of_birth: values.date_of_birth || '',
			gender: values.gender || '',
			relationship_to_user: values.relationship_to_user || '',
		})
		const hasNoErrors = parsed.success
		return hasNames && hasRelationship && hasDob && hasAreaFrom && hasNoErrors
	}
	if (activeStepIndex.value === 1) {
		return attendeeHasRequiredAnswers(currentAttendee.value)
	}
	if (activeStepIndex.value === 2) {
		const hasValidPersonalInfo = hasValidPersonalInfoItems(currentAttendee.value)
		// Personal info step: enforce emergency contact for minors
		if (isAttendeeMinor(currentAttendee.value)) {
			return minorHasEmergencyContact(currentAttendee.value) && hasValidPersonalInfo
		}
		return hasValidPersonalInfo
	}
	if (activeStepIndex.value === 3) {
		return !!currentAttendee.value.packageId && isCurrentAttendeePackageAvailable.value
	}
	if (activeStepIndex.value === 5) {
		return requiredConsentsMissing.value === 0
	}
	if (activeStepIndex.value === reviewStepIndex) {
		const allAttendeesReady = store.attendees.every((attendee) => isAttendeeReady(attendee))
		if (checkoutCompleted.value || !store.bookingIntentId || !allAttendeesReady || isPollingPaymentStatus.value) {
			return false
		}
		// For free bookings, skip payment method requirement
		if (isBookingFree.value) {
			return true
		}
		// For paid bookings, require payment method selection
		if (!selectedPaymentMethodId.value) {
			return false
		}
		if (isStripeMethod.value) {
			return stripeCardReady.value && !stripeCardError.value
		}
		if (isBankTransferEvidenceRequiredImmediately.value) {
			return isBankTransferEvidenceFormReady.value && !!reservedBankTransferReference.value && !reservedBankTransferLoading.value
		}
		if (isBankTransferMethod.value) {
			return !!reservedBankTransferReference.value && !reservedBankTransferLoading.value
		}
		return true
	}
	return true
})

const getCannotContinueMessage = () => {
	if (!currentAttendee.value) return 'Please complete required information before continuing.'

	if (activeStepIndex.value === 0) {
		if (errors.value.first_name) return errors.value.first_name
		if (errors.value.last_name) return errors.value.last_name
		if (errors.value.date_of_birth) return errors.value.date_of_birth
		if (errors.value.email) return errors.value.email
		if (errors.value.phone_number) return errors.value.phone_number
		if (!currentAttendee.value.area_from) return 'Please select an area to continue.'
		if (!currentAttendee.value.relationship_to_user && !isRegistrarSelf.value) return 'Please select relationship to user.'
		return 'Please complete attendee details to continue.'
	}

	if (activeStepIndex.value === 1) {
		return 'Please answer all required event questions before continuing.'
	}

	if (activeStepIndex.value === 2) {
		if (isAttendeeMinor(currentAttendee.value) && !minorHasEmergencyContact(currentAttendee.value)) {
			return 'Emergency contact is required for minors.'
		}
		if (!hasValidPersonalInfoItems(currentAttendee.value)) {
			return 'Please add details for selected OTHER requirements.'
		}
		return 'Please complete personal information to continue.'
	}

	if (activeStepIndex.value === 3) {
		return 'Please select a ticket package to continue.'
	}

	if (activeStepIndex.value === 5) {
		return 'Please accept all required consents before continuing.'
	}

	if (activeStepIndex.value === reviewStepIndex) {
		if (isStripeMethod.value && stripeCardError.value) return stripeCardError.value
		if (isStripeMethod.value && !stripeCardReady.value) return 'Please complete your card details before continuing.'
		if (isBankTransferEvidenceRequiredImmediately.value && !isBankTransferEvidenceFormReady.value) {
			return 'Evidence file, payer details, and amount are required for this bank transfer method.'
		}
		if (isBankTransferMethod.value && !reservedBankTransferReference.value) {
			return reservedBankTransferError.value || 'Please wait for your bank transfer reference to be reserved.'
		}
		if (!isBookingFree.value && !selectedPaymentMethodId.value) return 'Please choose a payment method.'
		return 'Some attendees are missing required information.'
	}

	return 'Please complete required information before continuing.'
}

const primaryActionLabel = computed(() => {
	if (activeStepIndex.value === attendeeStepCount - 1) {
		if (store.currentIndex === store.attendees.length - 1) {
			return isBookingFree.value ? 'Complete registration' : 'Review payment'
		}
		return 'Next attendee'
	}
	return 'Continue'
})

const isConsentChecked = (consentId: number) => {
	return currentAttendee.value?.consents?.some((consent) => consent.consentId === consentId && consent.consentGiven) || false
}

const toggleConsent = (consentId: number, eventTarget: Event) => {
	if (!currentAttendee.value) return
	const checked = (eventTarget.target as HTMLInputElement).checked
	const existing = currentAttendee.value.consents || []
	const updated = existing.filter((consent) => consent.consentId !== consentId)
	updated.push({ consentId, consentGiven: checked })
	store.setConsents(store.currentIndex, updated)
}

const refreshCheckoutPreview = async () => {
	if (!store.bookingIntentId) return
	if (activeStepIndex.value !== reviewStepIndex) return

	checkoutPreviewError.value = ''
	try {
		const payload = buildCheckoutPreviewPayload({
			bookingIntentId: store.bookingIntentId,
			attendees: store.attendees,
		})
		const response = await checkoutPreviewMutation.mutateAsync(payload)
		checkoutPreview.value = (response.data || null) as CheckoutPreviewData | null
	} catch (error) {
		checkoutPreview.value = null
		checkoutPreviewError.value = 'Unable to refresh payment breakdown right now.'
		console.error('Checkout preview failed', error)
	}
}

const scheduleCheckoutPreviewRefresh = () => {
	if (previewDebounceTimer) {
		clearTimeout(previewDebounceTimer)
	}
	previewDebounceTimer = setTimeout(() => {
		void refreshCheckoutPreview()
	}, 350)
}

watch(
	[() => activeStepIndex.value, () => store.bookingIntentId, () => selectedPaymentMethodId.value, previewTriggerSignature],
	() => {
		if (activeStepIndex.value !== reviewStepIndex) return
		scheduleCheckoutPreviewRefresh()
	},
	{ immediate: true }
)

const teardownStripeElements = () => {
	if (stripeCardElement.value) {
		stripeCardElement.value.unmount()
		stripeCardElement.value = null
	}
	stripeElements.value = null
	stripeInstance.value = null
	stripeCardReady.value = false
	stripeCardError.value = ''
}

const ensureStripeCardMounted = async () => {
	if (!isStripeMethod.value || activeStepIndex.value !== reviewStepIndex) return
	if (stripeCardElement.value) return

	const publishableKey = effectiveStripePublishableKey.value
	if (!publishableKey) return

	const stripeAccountId = requireStripeAccountIdFromPaymentMethod(selectedPaymentMethod.value, 'register checkout stripe init')
	console.debug('[register checkout stripe init] loading Stripe.js', {
		paymentMethodId: selectedPaymentMethod.value?.id || null,
		paymentMethodTitle: selectedPaymentMethod.value?.title || null,
		stripeAccountId,
	})

	await nextTick()
	if (!stripeCardMountRef.value) return

	const stripe = await loadStripe(publishableKey, { stripeAccount: stripeAccountId } as any)
	if (!stripe) {
		stripeCardError.value = 'Could not initialize Stripe card form.'
		return
	}

	stripeInstance.value = stripe
	stripeElements.value = stripe.elements()
	stripeCardElement.value = stripeElements.value.create('card', {
		hidePostalCode: true,
	})
	stripeCardElement.value.mount(stripeCardMountRef.value)
	stripeCardElement.value.on('change', (event) => {
		stripeCardError.value = event.error?.message || ''
		stripeCardReady.value = !!event.complete && !event.error
		if (stripePaymentAttemptError.value) {
			stripePaymentAttemptError.value = ''
		}
	})
}

watch(
	[() => isStripeMethod.value, () => activeStepIndex.value, () => effectiveStripePublishableKey.value],
	([stripeSelected, step, key], [, , previousKey]) => {
		if (!stripeSelected || step !== reviewStepIndex) {
			teardownStripeElements()
			return
		}
		if (key !== previousKey) {
			teardownStripeElements()
		}
		void ensureStripeCardMounted()
				.catch((error) => {
					console.error('[register checkout stripe init] Stripe card mount failed', error)
				})
	},
	{ immediate: true }
)

const stopPaymentStatusPolling = () => {
	if (!paymentPollingTimer) return
	clearInterval(paymentPollingTimer)
	paymentPollingTimer = null
	isPollingPaymentStatus.value = false
}

const startPaymentStatusPolling = (paymentId: string, bookingId?: number) => {
	stopPaymentStatusPolling()
	isPollingPaymentStatus.value = true
	paymentProcessingMessage.value = 'Processing your card payment and issuing tickets...'

	let attempts = 0
	const maxAttempts = 20

	paymentPollingTimer = setInterval(async () => {
		attempts += 1
		try {
			const paymentResponse = await paymentsListRetrieve({ path: { payment_id: paymentId } })
			const paymentData = paymentResponse.data as any
			const hasCompletedPayment = paymentData?.status === 'COMPLETED'
			const finalizedBookingId = Number(paymentData?.metadata?.booking_id || bookingId || 0)

			if (hasCompletedPayment) {
				if (finalizedBookingId > 0) {
					try {
						await bookingsListRetrieve({ path: { id: finalizedBookingId } })
					} catch {
						// Booking finalization may still be committing. Keep polling.
						return
					}
				}
				stopPaymentStatusPolling()
				checkoutResult.value = {
					...checkoutResult.value,
					status: 'confirmed',
					booking_id: finalizedBookingId > 0 ? finalizedBookingId : checkoutResult.value?.booking_id,
					booking_reference: paymentData?.metadata?.booking_reference || checkoutResult.value?.booking_reference,
				}
				showCheckoutSuccessModal.value = true
				toast.add({
					title: 'Payment confirmed',
					description: 'Your card payment was confirmed and registration is complete.',
					color: 'green',
				})
			}
		} catch (error) {
			console.error('Payment status polling failed', error)
		}

		if (attempts >= maxAttempts) {
			stopPaymentStatusPolling()
			paymentProcessingMessage.value = 'Payment is still processing. You can safely refresh this page later.'
			showCheckoutSuccessModal.value = true
			toast.add({
				title: 'Payment processing',
				description: 'Stripe confirmation completed. Ticket issuance may take a little longer.',
				color: 'amber',
			})
		}
	}, 3000)
}

watch(
	() => store.currentIndex,
	() => {
		areaSearch.value = ''
		areaOptions.value = []
	}
)

watch(
	() => areaSearch.value,
	(term) => {
		if (areaSearchDebounceTimer) {
			clearTimeout(areaSearchDebounceTimer)
			areaSearchDebounceTimer = null
		}

		const query = term.trim()
		if (query.length < 2) {
			areaOptions.value = []
			return
		}

		areaSearchDebounceTimer = setTimeout(async () => {
			areaLookupLoading.value = true
			try {
				const response = await locationsAreasList({
					query: {
						search: query,
						page_size: 5,
					},
				})
				const options = (response.data?.results || []).map((area) => ({
					label: area.area_name,
					value: area.id,
				}))
				areaOptions.value = options
			} catch {
				areaOptions.value = []
			} finally {
				areaLookupLoading.value = false
			}
		}, 300)
	}
)

const clearAreaFrom = () => {
	if (!currentAttendee.value) return
	store.setAreaFrom(store.currentIndex, null, null)
	areaSearch.value = ''
	areaOptions.value = []
}

// Calculate age from date of birth
const calculateAge = (dateOfBirth: string): number | null => {
	if (!dateOfBirth) return null
	const today = new Date()
	const birthDate = new Date(dateOfBirth)
	let age = today.getFullYear() - birthDate.getFullYear()
	const monthDiff = today.getMonth() - birthDate.getMonth()
	if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
		age--
	}
	return age < 0 ? null : age
}

const currentAttendeeAge = computed(() => {
	return calculateAge(values.date_of_birth || currentAttendee.value?.date_of_birth || '')
})

// Track validation errors state
const hasAttendeeDetailsErrors = computed(() => {
	if (activeStepIndex.value !== 0) return false
	// Check for required fields with errors
	return !!(errors.value.first_name || errors.value.last_name || errors.value.date_of_birth)
})

// Sync form values when current attendee changes
watchEffect(() => {
	if (!currentAttendee.value || activeStepIndex.value !== 0) return
	resetForm({
		values: {
			first_name: currentAttendee.value.first_name || '',
			last_name: currentAttendee.value.last_name || '',
			email: currentAttendee.value.email || '',
			phone_number: currentAttendee.value.phone_number || '',
			date_of_birth: currentAttendee.value.date_of_birth || '',
			gender: currentAttendee.value.gender || '',
			relationship_to_user: currentAttendee.value.relationship_to_user || '',
		},
	})
})

const handleNext = async () => {
	if (activeStepIndex.value === 0) {
		await runSafeValidation()
	}
	if (!canContinue.value) {
		toast.add({
			title: 'Cannot continue',
			description: getCannotContinueMessage(),
			color: 'red',
		})
		return
	}
	if (!(await pingBookingIntent(true))) return

	if (activeStepIndex.value < attendeeStepCount - 1) {
		activeStepIndex.value += 1
		return
	}

	if (store.currentIndex < store.attendees.length - 1) {
		store.setCurrentIndex(store.currentIndex + 1)
		activeStepIndex.value = 0
	} else {
		activeStepIndex.value = reviewStepIndex
	}
}

const handleBack = async () => {
	if (!(await pingBookingIntent(true))) return

	if (activeStepIndex.value > 0 && activeStepIndex.value <= attendeeStepCount - 1) {
		activeStepIndex.value -= 1
		return
	}

	if (activeStepIndex.value === reviewStepIndex) {
		activeStepIndex.value = attendeeStepCount - 1
		return
	}

	if (store.currentIndex > 0) {
		store.setCurrentIndex(store.currentIndex - 1)
		activeStepIndex.value = attendeeStepCount - 1
		return
	}

	goBack()
}

const jumpToAttendee = async (index: number) => {
	if (!(await pingBookingIntent(true))) return
	store.setCurrentIndex(index)
	activeStepIndex.value = 0
}

const handleCheckout = async () => {
	if (checkoutCompleted.value) return
	if (!canContinue.value || !store.bookingIntentId) return
	// Only require payment method for paid bookings
	if (!isBookingFree.value && !selectedPaymentMethodId.value) return
	if (!(await pingBookingIntent(false))) return
	isSaving.value = true
	checkoutResult.value = null
	stripeCardError.value = ''
	stripePaymentAttemptError.value = ''

	try {
		const missingPackageAttendeeIndex = store.attendees.findIndex((attendee) => !attendee.packageId)
		if (missingPackageAttendeeIndex >= 0) {
			toast.add({
				title: 'Missing ticket package',
				description: `Please select a package for attendee ${missingPackageAttendeeIndex + 1}.`,
				color: 'red',
			})
			return
		}

		if (!validateBankTransferEvidenceForm()) {
			toast.add({
				title: 'Missing transfer evidence',
				description: 'Add required bank transfer evidence before completing checkout.',
				color: 'red',
			})
			return
		}

		if (isBankTransferMethod.value && !reservedBankTransferReference.value) {
			await reserveBankTransferPayment()
		}

		if (isBankTransferMethod.value && !reservedBankTransferReference.value) {
			toast.add({
				title: 'Missing transfer reference',
				description: reservedBankTransferError.value || 'Please reserve the bank transfer reference before checkout.',
				color: 'red',
			})
			return
		}

		const paymentMethodId = isBookingFree.value ? -1 : (selectedPaymentMethodId.value as number)

		let bankTransferEvidenceId: string | undefined
		if (isBankTransferEvidenceRequiredImmediately.value) {
			bankTransferEvidenceId = await uploadBankTransferEvidenceForCheckout()
		}

		const bankTransferPaymentId = reservedBankTransferPaymentId.value || undefined
		const hasQuestionFiles = store.attendees.some((attendee) =>
			attendee.questionAnswers.some((answer) => Boolean(answer.uploadFile))
		)

		const checkoutBody = hasQuestionFiles
			? buildCheckoutMultipartPayload({
				bookingIntentId: store.bookingIntentId,
				paymentMethodId,
				attendees: store.attendees,
				paymentId: bankTransferPaymentId,
				bankTransferEvidenceId,
			})
			: buildCheckoutPayload({
				bookingIntentId: store.bookingIntentId,
				paymentMethodId,
				attendees: store.attendees,
				paymentId: bankTransferPaymentId,
				bankTransferEvidenceId,
				// TODO missing: stripePaymentIntentId:
			})

		const response = await checkoutMutation.mutateAsync({
			body: checkoutBody as any,
			idempotencyKey: idempotencyKey.value,
		})
		const normalizedCheckoutResponse = response as Record<string, any>
		checkoutResult.value = ((normalizedCheckoutResponse?.data ?? normalizedCheckoutResponse) || null) as any

		if (isBankTransferMethod.value && !checkoutResult.value?.bank_transfer_reference) {
			const paymentId = Number(checkoutResult.value?.payment_id || 0)
			if (paymentId > 0) {
				try {
					const paymentResponse = await paymentsListRetrieve({ path: { payment_id: String(paymentId) } })
					const paymentData = paymentResponse.data as Record<string, unknown> | undefined
					const fetchedReference = typeof paymentData?.bank_transfer_reference === 'string'
						? paymentData.bank_transfer_reference
						: null
					const fetchedInstructions = typeof paymentData?.bank_transfer_instructions === 'string'
						? paymentData.bank_transfer_instructions
						: null

					checkoutResult.value = {
						...checkoutResult.value,
						bank_transfer_reference: fetchedReference || checkoutResult.value?.bank_transfer_reference || null,
						bank_transfer_instructions: fetchedInstructions || checkoutResult.value?.bank_transfer_instructions || null,
					}
				} catch (paymentLookupError) {
					console.warn('Unable to hydrate bank transfer reference from payment details', paymentLookupError)
				}
			}
		}

		if (isStripeMethod.value) {
			stripeClientSecret.value = checkoutResult.value?.stripe_client_secret || null
			if (!stripeClientSecret.value) {
				throw new Error('Missing Stripe client secret in checkout response.')
			}

			await ensureStripeCardMounted()
			if (!stripeInstance.value || !stripeCardElement.value) {
				throw new Error('Stripe card form is not ready yet.')
			}

			const stripeAccountOption = requireStripeAccountIdFromPaymentMethod(selectedPaymentMethod.value, 'register checkout stripe confirm')
			console.debug('[register checkout stripe confirm] confirming card payment', {
				paymentMethodId: selectedPaymentMethod.value?.id || null,
				paymentMethodTitle: selectedPaymentMethod.value?.title || null,
				stripeAccountId: stripeAccountOption,
				clientSecretTail: stripeClientSecret.value.slice(-6),
			})

			const confirmation = await stripeInstance.value.confirmCardPayment(
				stripeClientSecret.value,
				{
					payment_method: {
						card: stripeCardElement.value,
						billing_details: {
							name: attendeeDisplayName(store.attendees[0], 0),
							email: store.attendees[0]?.email || undefined,
						},
					},
				},
				({ stripeAccount: stripeAccountOption } as any)
			)
			isSaving.value = false

			if (confirmation.error) {
				console.error('[register checkout stripe confirm] Stripe confirmation failed', {
					paymentMethodId: selectedPaymentMethod.value?.id || null,
					stripeAccountId: stripeAccountOption,
					message: confirmation.error.message || null,
					code: (confirmation.error as any)?.code || null,
					type: (confirmation.error as any)?.type || null,
				})
				stripePaymentAttemptError.value = confirmation.error.message || 'Card confirmation failed.'
				idempotencyKey.value = createIdempotencyKey()
				toast.add({ title: 'Payment failed', description: stripePaymentAttemptError.value, color: 'red' })
				return
			}

			console.info('[register checkout stripe confirm] Stripe confirmation succeeded', {
				paymentMethodId: selectedPaymentMethod.value?.id || null,
				stripeAccountId: stripeAccountOption,
				paymentIntentId: confirmation.paymentIntent?.id || null,
				status: confirmation.paymentIntent?.status || null,
			})

			if (confirmation.paymentIntent?.status === 'succeeded') {
				checkoutCompleted.value = true

				const paymentId = String(checkoutResult.value?.payment_id || '')
				const bookingId = Number(checkoutResult.value?.booking_id || 0)
				if (paymentId) {
					startPaymentStatusPolling(paymentId, bookingId > 0 ? bookingId : undefined)
					toast.add({
						title: 'Payment confirmed',
						description: 'Stripe confirmed your payment. Finalizing your registration now.',
						color: 'amber',
					})
					return
				}

				showCheckoutSuccessModal.value = true
				toast.add({
					title: 'Payment confirmed',
					description: 'Stripe payment confirmed. Registration is complete.',
					color: 'green',
				})
				return
			}

			toast.add({
				title: 'Payment processing',
				description: 'Stripe is still processing your payment.',
				color: 'amber',
			})
			checkoutCompleted.value = true
			showCheckoutSuccessModal.value = true
			return
		}

		checkoutCompleted.value = true
		showCheckoutSuccessModal.value = true
		if (isBankTransferMethod.value) {
			const description = checkoutBankTransferReference.value
				? `Registration completed. Use reference ${checkoutBankTransferReference.value} for your transfer.`
				: 'Registration completed. Your transfer reference will appear in payment details shortly.'
			toast.add({ title: 'Registration submitted', description, color: 'green' })
			clearReservedBankTransferPayment()
		} else {
			toast.add({ title: 'Success', description: 'Registration completed.', color: 'green' })
		}
	} catch (error) {
		console.error('Checkout failed', error)
		idempotencyKey.value = createIdempotencyKey()
		let description = 'Checkout failed. Please try again.'
		if (error instanceof Error && error.message) {
			description = error.message
		}
		const payload = (error as any)?.data || (error as any)?.response?._data || (error as any)?.response?.data
		if (typeof payload === 'string' && payload) {
			description = payload
		} else if (payload && typeof payload === 'object') {
			const firstValue = Object.values(payload)[0] as any
			if (Array.isArray(firstValue) && firstValue[0]) {
				description = String(firstValue[0])
			} else if (typeof firstValue === 'string') {
				description = firstValue
			}
		}
		toast.add({ title: 'Error', description, color: 'red' })
	} finally {
		isSaving.value = false
	}
	}

const closeSuccessModalAndRedirect = () => {
	showCheckoutSuccessModal.value = false
	showIntentExpiredModal.value = false
	stopIntentPing()
	stopIntentCountdown()
	store.reset()
	if (event.value?.event_id) {
		router.push({ path: `/events/${event.value.url_safe_title}/b` })
		return
	}
	router.push({ path: '/events' })
}

onBeforeUnmount(() => {
	if (previewDebounceTimer) {
		clearTimeout(previewDebounceTimer)
		previewDebounceTimer = null
	}
	if (areaSearchDebounceTimer) {
		clearTimeout(areaSearchDebounceTimer)
		areaSearchDebounceTimer = null
	}
	stopIntentPing()
	stopIntentCountdown()
	stopPaymentStatusPolling()
	teardownStripeElements()
})

const goBack = () => {
	if (event.value?.event_id) {
		router.push({ path: `/events/${event.value.url_safe_title}` })
		return
	}
	router.back()
}
</script>

<style scoped>
.step-fade-enter-active,
.step-fade-leave-active {
	transition: opacity 0.24s ease, transform 0.24s ease;
}

.step-fade-enter-from,
.step-fade-leave-to {
	opacity: 0;
	transform: translateY(8px);
}

.stepper-slide-forward-enter-active,
.stepper-slide-forward-leave-active,
.stepper-slide-back-enter-active,
.stepper-slide-back-leave-active {
	transition: opacity 0.24s ease, transform 0.24s ease;
}

.stepper-slide-forward-enter-from,
.stepper-slide-back-leave-to {
	opacity: 0;
	transform: translateX(20px);
}

.stepper-slide-forward-leave-to,
.stepper-slide-back-enter-from {
	opacity: 0;
	transform: translateX(-20px);
}

.success-modal {
	position: relative;
	overflow: hidden;
	background: linear-gradient(180deg, #f8fafc 0%, #ffffff 62%);
}

.success-glow {
	pointer-events: none;
	position: absolute;
	inset: -90px -10% auto;
	height: 210px;
	background: radial-gradient(circle at 50% 30%, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.06) 38%, rgba(255, 255, 255, 0) 70%);
}

.success-pop {
	position: relative;
	animation: successRise 0.75s ease-out;
}

.success-check {
	animation: successPulse 1.2s ease-out;
}

.success-title {
	animation: successFadeIn 0.9s ease-out;
}

.success-event-lead {
	opacity: 0;
	animation: successFadeIn 0.9s ease-out 0.5s forwards;
}

.success-event-name {
	opacity: 0;
	animation: successFadeIn 1s ease-out 0.8s forwards;
}

.success-stagger .success-card {
	opacity: 0;
	animation: successCardIn 0.65s ease both;
	animation-delay: 1.15s;
}

.success-stagger .success-card:nth-child(2) {
	animation-delay: 1.28s;
}

.success-stagger .success-card:nth-child(3) {
	animation-delay: 1.4s;
}

.success-stagger .success-card:nth-child(4) {
	animation-delay: 1.52s;
}

.success-stagger .success-card:nth-child(5) {
	animation-delay: 1.64s;
}

.success-stagger .success-card:nth-child(6) {
	animation-delay: 1.76s;
}

.success-cta-wrap {
	opacity: 0;
	animation: successFadeIn 0.9s ease-out 1.95s forwards;
}

.checkout-lock {
	user-select: none;
}

.checkout-overlay-top {
	height: 72px;
	background: linear-gradient(180deg, rgba(219, 234, 254, 0.85) 0%, rgba(255, 255, 255, 0) 100%);
}

.checkout-orbit {
	animation: checkoutOrbit 1.1s linear infinite;
	transform-origin: center;
}

.checkout-progress-line {
	position: relative;
	height: 6px;
	border-radius: 999px;
	background: rgba(59, 130, 246, 0.25);
	overflow: hidden;
}

.checkout-progress-dot {
	position: absolute;
	top: 50%;
	left: 0;
	width: 110px;
	height: 110%;
	border-radius: 999px;
	background: linear-gradient(90deg, rgba(37, 99, 235, 0), rgba(37, 99, 235, 0.95), rgba(37, 99, 235, 0));
	transform: translateY(-50%);
	animation: checkoutProgress 1.4s ease-in-out infinite;
}

@keyframes successRise {
	from {
		opacity: 0;
		transform: translateY(10px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

@keyframes successPulse {
	0% {
		transform: scale(0.5) rotate(-12deg);
		opacity: 0;
	}
	60% {
		transform: scale(1.14) rotate(0deg);
		opacity: 1;
	}
	100% {
		transform: scale(1);
	}
}

@keyframes successCardIn {
	from {
		opacity: 0;
		transform: translateY(12px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

@keyframes successFadeIn {
	from {
		opacity: 0;
		transform: translateY(8px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

@keyframes checkoutOrbit {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}

@keyframes checkoutProgress {
	0% {
		left: -28%;
	}
	50% {
		left: 42%;
	}
	100% {
		left: 100%;
	}
}
</style>