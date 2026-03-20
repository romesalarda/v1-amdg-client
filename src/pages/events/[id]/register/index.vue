<template>
	<div class="min-h-screen bg-slate-100 text-slate-900">
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
				<div class="rounded-full bg-slate-900 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white">
					Editing attendee {{ currentAttendeeNumber }}
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
				<aside class="w-full space-y-4 lg:w-80 lg:flex-shrink-0">
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

					<div class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
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

							<div class="mt-6 overflow-x-auto pb-2">
								<ol class="flex min-w-max items-center gap-2 md:gap-3">
									<li
										v-for="(label, index) in steps"
										:key="label"
										class="flex items-center"
									>
										<div class="flex items-center gap-2">
											<div
												class="flex h-8 w-8 items-center justify-center rounded-full border text-xs font-black transition-all duration-300"
												:class="
													index === activeStepIndex
														? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-200'
														: index < activeStepIndex
															? 'border-emerald-500 bg-emerald-500 text-white'
															: 'border-slate-300 bg-white text-slate-500'
												"
											>
												{{ index + 1 }}
											</div>
											<p
												class="text-[11px] font-bold uppercase tracking-[0.14em] transition-colors"
												:class="index <= activeStepIndex ? 'text-slate-800' : 'text-slate-400'"
											>
												{{ label }}
											</p>
										</div>
										<div
											v-if="index < steps.length - 1"
											class="mx-2 h-px w-6 md:w-10"
											:class="index < activeStepIndex ? 'bg-emerald-500' : 'bg-slate-300'"
										></div>
									</li>
								</ol>
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
								<div v-if="showRelationshipField" class="sm:col-span-2">
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
								<!-- <div v-else class="sm:col-span-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
									Relationship is set to <span class="font-bold">Self</span> for this registration mode.
								</div> -->
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
															toast.add({ title: 'Area locked', description: `${option.label} has been set for this attendee.`, color: 'green' })
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
										{{ hasCurrentAreaFrom ? `✓ Area locked: ${currentAttendee.area_from_name}` : '⚠ Select an area to continue.' }}
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
														Details (public-facing)
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
								</div>
							</div>
						</div>

									<div v-else-if="activeStepIndex === 3" class="space-y-6">
							<div>
								<h2 class="text-lg font-semibold text-gray-900">Ticket package</h2>
								<p class="text-sm text-gray-600">Choose the package for this attendee.</p>
							</div>

							<div v-if="bookingPackages.length" class="grid gap-4 sm:grid-cols-2">
								<label
									v-for="pkg in bookingPackages"
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
							<p v-else class="text-sm text-gray-500">No packages available for this attendee.</p>
						</div>

									<div v-else-if="activeStepIndex === 4" class="space-y-6">
							<div>
								<h2 class="text-lg font-semibold text-gray-900">Products</h2>
								<p class="text-sm text-gray-600">Optional add-ons will appear here when available.</p>
							</div>
							<div class="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
								No products available for this event.
							</div>
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
										</div>
										<UButton size="xs" color="gray" variant="ghost" @click="jumpToAttendee(index)">
											Edit
										</UButton>
									</div>
								</div>
							</div>

							<div>
								<label class="mb-1 block text-sm font-medium text-gray-700">Payment method</label>
								<USelectMenu
									v-if="paymentMethodOptions.length"
									v-model="selectedPaymentMethodId"
									:options="paymentMethodOptions"
									value-attribute="value"
									option-attribute="label"
									placeholder="Select a payment method"
								/>
								<p v-else class="text-sm text-gray-500">No payment methods available for this event.</p>
							</div>

							<div v-if="selectedPaymentMethod" class="rounded-xl border border-slate-200 bg-slate-50 p-4">
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
								</div>

								<div v-else-if="isStripeMethod" class="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
									Card payments will be processed securely through Stripe after submitting checkout.
								</div>
							</div>

							<div class="rounded-xl border border-slate-200 bg-white p-4">
								<div class="flex items-center justify-between">
									<h3 class="text-sm font-semibold text-slate-900">Payment breakdown</h3>
									<p class="text-xs text-slate-500">Per attendee</p>
								</div>
								<div class="mt-3 space-y-2">
									<div
										v-for="item in attendeePaymentBreakdown"
										:key="item.index"
										class="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
									>
										<div>
											<p class="font-semibold text-slate-800">{{ item.name }}</p>
											<p class="text-xs text-slate-500">{{ item.packageName }}</p>
										</div>
										<p class="font-semibold text-slate-900">{{ formatMoney(item.amount, item.currency) }}</p>
									</div>
								</div>
								<div class="mt-4 border-t border-slate-100 pt-3">
									<div class="flex items-center justify-between text-sm font-bold text-slate-900">
										<span>Total</span>
										<span>{{ formatMoney(paymentBreakdownTotal.amount, paymentBreakdownTotal.currency) }}</span>
									</div>
								</div>
							</div>
						</div>
									<div class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-6">
										<UButton color="gray" variant="ghost" @click="handleBack">Back</UButton>
										<div class="flex items-center gap-3">
											<UButton
												v-if="activeStepIndex === reviewStepIndex"
												color="primary"
												:loading="isSaving"
												:disabled="!canContinue"
												@click="handleCheckout"
											>
												Complete registration
											</UButton>
											<UButton
												v-else
												color="primary"
												:loading="isSaving"
												:disabled="!canContinue"
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
			</template>
				</div>
	</div>

	<UModal v-model="showIntentExpiredModal" :prevent-close="true" :ui="{ width: 'sm:max-w-xl' }">
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

	<UModal v-model="showCheckoutSuccessModal" :ui="{ width: 'sm:max-w-3xl' }">
		<div class="space-y-6 p-6 md:p-8">
			<div class="text-center">
				<div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
					<UIcon name="i-heroicons-check" class="h-9 w-9 text-emerald-600" />
				</div>
				<h3 class="mt-4 text-2xl font-black text-slate-900">Registration Complete</h3>
				<p class="mt-2 text-sm text-slate-600">
					You're going to {{ event?.title || 'this event' }}.
				</p>
			</div>

			<div class="grid gap-3 md:grid-cols-2">
				<div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
					<p class="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Booking reference</p>
					<p class="mt-1 text-base font-semibold text-slate-900">{{ checkoutResult?.booking_reference || 'N/A' }}</p>
				</div>
				<div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
					<p class="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Payment reference</p>
					<p class="mt-1 text-base font-semibold text-slate-900">{{ checkoutResult?.payment_reference || 'N/A' }}</p>
				</div>
				<div v-if="checkoutResult?.bank_transfer_reference" class="rounded-xl border border-blue-200 bg-blue-50 p-4 md:col-span-2">
					<p class="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">Bank transfer reference</p>
					<p class="mt-1 text-base font-semibold text-blue-900">{{ checkoutResult.bank_transfer_reference }}</p>
				</div>
				<div v-if="checkoutResult?.bank_transfer_instructions" class="rounded-xl border border-blue-200 bg-blue-50 p-4 md:col-span-2">
					<p class="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">Transfer instructions</p>
					<p class="mt-1 text-sm text-blue-900">{{ checkoutResult.bank_transfer_instructions }}</p>
				</div>
				<div v-if="checkoutResult?.stripe_client_secret" class="rounded-xl border border-emerald-200 bg-emerald-50 p-4 md:col-span-2">
					<p class="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-600">Stripe next step</p>
					<p class="mt-1 text-sm text-emerald-900">Your booking is created. Complete card payment using the provided Stripe flow.</p>
				</div>
			</div>

			<div class="flex justify-end">
				<UButton color="primary" @click="showCheckoutSuccessModal = false">Close</UButton>
			</div>
		</div>
	</UModal>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from '#ui/composables/useToast'
import { useRegistrationStore } from '~/stores/registration'
import { useForm } from 'vee-validate'
import { z } from 'zod'
import { isMinor, validatePersonalInfoItem } from '~/schemas/registration'

// Use middleware to validate booking intent and URL parameters
definePageMeta({
  middleware: 'register',
})
import { useEvent } from '~/composables/resources/events/events'
import { useEventVenues } from '~/composables/resources/events/eventVenues'
import { useEventQuestions } from '~/composables/resources/events/eventQuestions'
import { useCreateBookingIntent, usePingBookingIntent } from '~/composables/resources/booking/bookingIntents'
import { useDietaryRequirements } from '~/composables/resources/attendee/attendeeDietaryRequirements'
import { useMedicalConditions } from '~/composables/resources/attendee/bookingMedicalConditions'
import { useAccessibilityRequirements } from '~/composables/resources/attendee/accessibilityRequirements'
import { useConsents } from '~/composables/resources/attendee/attendeeConsents'
import { useBookingPackages } from '~/composables/resources/booking/bookingPackages'
import { usePaymentMethods } from '~/composables/resources/payments/paymentMethods'
import { useCheckoutBooking } from '~/composables/resources/booking/bookings'
import { locationsAreasList } from '~/api/sdk.gen'
import { buildCheckoutPayload, createIdempotencyKey } from '~/composables/registration/checkout'
import { resolveImageUrl } from '~/utils/image'
import { formatDate, formatTime } from '~/utils/time'
import type { AttendeeDraft, PersonalInfoItemDraft, MedicalConditionItemDraft } from '~/stores/registration'

// Create validation schema for attendee details
const attendeeValidationSchema = z.object({
	first_name: z
		.string()
		.min(1, 'First name is required')
		.min(2, 'First name must be at least 2 characters'),
	last_name: z
		.string()
		.min(1, 'Last name is required')
		.min(2, 'Last name must be at least 2 characters'),
	email: z
		.string()
		.optional()
		.refine(
			(val) => !val || /^[^@]+@[^@]+\.[^@]+$/.test(val),
			'Please enter a valid email address'
		),
	phone_number: z
		.string()
		.optional()
		.refine(
			(val) => !val || /^[+]?[\d\s\-()]{10,}$/i.test(val),
			'Please enter a valid phone number'
		),
	date_of_birth: z
		.string()
		.min(1, 'Date of birth is required')
		.refine(
			(val) => !val || new Date(val) < new Date(),
			'Date of birth cannot be in the future'
		),
	gender: z.string().optional(),
	relationship_to_user: z.string().optional(),
}) as z.ZodType<{
	first_name: string
	last_name: string
	email?: string
	phone_number?: string
	date_of_birth: string
	gender?: string
	relationship_to_user?: string
}>

const route = useRoute()
const router = useRouter()
const toast = useToast()
const store = useRegistrationStore()

// Initialize form (will be reset when currentAttendee changes)
const { values, errors, setFieldValue, resetForm } = useForm({
	validationSchema: attendeeValidationSchema,
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
		event__event_id: eventId.value,
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

const bookingIntentMutation = useCreateBookingIntent()
const pingBookingIntentMutation = usePingBookingIntent()
const isCreatingIntent = ref(false)
const showIntentExpiredModal = ref(false)
const areaLookupLoading = ref(false)
const areaSearch = ref('')
const areaOptions = ref<Array<{ label: string; value: number }>>([])
let areaSearchDebounceTimer: ReturnType<typeof setTimeout> | null = null

watchEffect(() => {
	if (!event.value || store.bookingIntentId || isCreatingIntent.value) return
	isCreatingIntent.value = true
	bookingIntentMutation
		.mutateAsync({
			event: event.value.event_id,
			intended_ticket_count: store.ticketCount,
		})
		.then((response) => {
			const intentId = response.data?.booking_intent_id
			if (intentId) {
				store.setBookingIntentId(intentId)
			}
		})
		.catch(() => {
			toast.add({ title: 'Error', description: 'Failed to create booking intent.', color: 'red' })
		})
		.finally(() => {
			isCreatingIntent.value = false
		})
})

const steps = [
	'Attendee details',
	'Event questions',
	'Personal info',
	'Ticket package',
	'Products',
	'Consents',
	'Review & pay',
]
const attendeeStepCount = 6
const reviewStepIndex = attendeeStepCount
const activeStepIndex = ref(0)

const currentAttendee = computed(() => store.attendees[store.currentIndex])
const currentAttendeeNumber = computed(() => store.currentIndex + 1)
const isRegistrarSelf = computed(() => store.registrarAttending && store.currentIndex === 0)
const showRelationshipField = computed(() => !(registrationMode.value === 'self' && isRegistrarSelf.value && store.ticketCount === 1))
const stepProgressPercent = computed(() => ((activeStepIndex.value + 1) / steps.length) * 100)
const hasCurrentAreaFrom = computed(() => !!currentAttendee.value?.area_from)

watchEffect(() => {
	if (!currentAttendee.value) return
	if (registrationMode.value === 'self' && isRegistrarSelf.value && store.ticketCount === 1) {
		currentAttendee.value.relationship_to_user = 'self'
	}
})

const attendeeDisplayName = (attendee?: AttendeeDraft | null, index?: number) => {
	if (!attendee) return 'Attendee'
	const fullName = `${attendee.first_name || ''} ${attendee.last_name || ''}`.trim()
	if (fullName) return fullName
	if (typeof index === 'number') return `Attendee ${index + 1}`
	return 'Attendee'
}

const attendeeStatusLabel = (index: number, attendee: AttendeeDraft) => {
	if (index === store.currentIndex) return 'Editing'
	if (isAttendeeReady(attendee)) return 'Ready'
	if (index < store.currentIndex) return 'Needs info'
	return 'Queued'
}

const attendeeStatusBadgeClass = (index: number, attendee: AttendeeDraft) => {
	if (index === store.currentIndex) return 'bg-blue-100 text-blue-700'
	if (isAttendeeReady(attendee)) return 'bg-emerald-100 text-emerald-700'
	if (index < store.currentIndex) return 'bg-amber-100 text-amber-700'
	return 'bg-slate-100 text-slate-500'
}

const attendeeSidebarCardClass = (index: number, attendee: AttendeeDraft) => {
	if (index === store.currentIndex) {
		return 'border-slate-900 bg-white shadow-[4px_4px_0px_0px_rgba(15,23,42,0.2)]'
	}
	if (isAttendeeReady(attendee)) {
		return 'border-emerald-200 bg-emerald-50 hover:border-emerald-300'
	}
	if (index < store.currentIndex) {
		return 'border-amber-200 bg-amber-50 hover:border-amber-300'
	}
	return 'border-slate-200 bg-slate-50/90 hover:border-slate-300'
}

const attendeeStepSummary = (index: number) => {
	if (index === store.currentIndex) return steps[activeStepIndex.value] || 'In progress'
	if (index < store.currentIndex) return 'Previously edited'
	return 'Waiting'
}

/**
 * Check if an attendee is a minor (under 18 years old)
 */
const isAttendeeMinor = (attendee: AttendeeDraft): boolean => {
	return isMinor(attendee.date_of_birth)
}

/**
 * Check if a minor has an emergency contact
 */
const minorHasEmergencyContact = (attendee: AttendeeDraft): boolean => {
	if (!isAttendeeMinor(attendee)) return true // Not a minor, so requirement doesn't apply
	return !!attendee.personalInfo.emergencyContact && !!attendee.personalInfo.emergencyContact.first_name && !!attendee.personalInfo.emergencyContact.last_name
}

const relationshipOptions = [
	{ label: 'Self', value: 'self' },
	{ label: 'Spouse', value: 'spouse' },
	{ label: 'Child', value: 'child' },
	{ label: 'Friend', value: 'friend' },
	{ label: 'Parent', value: 'parent' },
	{ label: 'Sibling', value: 'sibling' },
	{ label: 'Other', value: 'other' },
]

const genderOptions = [
	{ label: 'Female', value: 'female' },
	{ label: 'Male', value: 'male' },
	{ label: 'Other', value: 'other' },
	{ label: 'Prefer not to say', value: 'prefer_not_to_say' },
]

const emergencyRelationshipOptions = [
	{ label: 'Parent', value: 'parent' },
	{ label: 'Sibling', value: 'sibling' },
	{ label: 'Child', value: 'child' },
	{ label: 'Spouse', value: 'spouse' },
	{ label: 'Friend', value: 'friend' },
	{ label: 'Other', value: 'other' },
]

const dietaryRequirementsQuery = useDietaryRequirements()
const medicalConditionsQuery = useMedicalConditions()
const accessibilityRequirementsQuery = useAccessibilityRequirements()

const dietaryRequirements = computed(() => dietaryRequirementsQuery.data.value?.data?.results || [])
const medicalConditions = computed(() => medicalConditionsQuery.data.value?.data?.results || [])
const accessibilityRequirements = computed(() => accessibilityRequirementsQuery.data.value?.data?.results || [])

const consentsQuery = useConsents(
	computed(() => (event.value?.event_id ? { event: String(event.value.event_id), page_size: 100 } : undefined))
)
const consents = computed(() => consentsQuery.data.value?.data?.results || [])

const eventQuestionsQuery = useEventQuestions(
	computed(() => (event.value?.id ? { event: event.value.id, page_size: 100 } : undefined)),
	{ enabled: computed(() => !!event.value?.id) }
)
const eventQuestions = computed(() => eventQuestionsQuery.data.value?.data?.results || [])
const requiredQuestionIds = computed(() => eventQuestions.value.filter((question) => question.required).map((question) => question.id))

const bookingPackagesQuery = useBookingPackages(
	computed(() => {
		return { event__event_id: event_uuid.value }
	})
)

const bookingPackages = computed(() => bookingPackagesQuery.data.value?.data?.results || [])
const allPackagesQuery = useBookingPackages(
	computed(() => {
		return { event__event_id: event_uuid.value, page_size: 200 }
	})
)
const allPackages = computed(() => allPackagesQuery.data.value?.data?.results || [])
const packageById = (packageId?: number) => allPackages.value.find((pkg) => pkg.id === packageId)

const paymentMethodsQuery = usePaymentMethods(
	computed(() => ({ event__event_id: event_uuid.value, page_size: 100 }))
)
const paymentMethods = computed(() => paymentMethodsQuery.data.value?.data?.results || [])
const paymentMethodOptions = computed(() =>
	paymentMethods.value.map((method) => ({
		label: method.title,
		value: method.id,
	}))
)
const selectedPaymentMethodId = ref<number | undefined>(undefined)
const selectedPaymentMethod = computed(() => paymentMethods.value.find((method) => method.id === selectedPaymentMethodId.value))

const paymentMethodTypeLabel = computed(() => {
	if (!selectedPaymentMethod.value?.method_type) return 'Method'
	if (selectedPaymentMethod.value.method_type === 'BANK_TRANSFER') return 'Bank transfer'
	if (selectedPaymentMethod.value.method_type === 'STRIPE') return 'Stripe'
	if (selectedPaymentMethod.value.method_type === 'CASH') return 'Cash'
	return selectedPaymentMethod.value.method_type
})

const isBankTransferMethod = computed(() => selectedPaymentMethod.value?.method_type === 'BANK_TRANSFER')
const isStripeMethod = computed(() => selectedPaymentMethod.value?.method_type === 'STRIPE')

const bankDetails = computed(() => {
	const details = selectedPaymentMethod.value?.provided_details as Record<string, unknown> | undefined
	return {
		account_name: typeof details?.account_name === 'string' ? details.account_name : '',
		sort_code: typeof details?.sort_code === 'string' ? details.sort_code : '',
		account_number: typeof details?.account_number === 'string' ? details.account_number : '',
	}
})

const checkoutMutation = useCheckoutBooking()
const idempotencyKey = ref(createIdempotencyKey())

const isSaving = ref(false)
const checkoutResult = ref<any>(null)
const showCheckoutSuccessModal = ref(false)

const attendeePaymentBreakdown = computed(() =>
	store.attendees.map((attendee, index) => {
		const pkg = packageById(attendee.packageId)
		return {
			index,
			name: attendeeDisplayName(attendee, index),
			packageName: pkg?.name || 'No package selected',
			amount: Number(pkg?.modified_amount || 0),
			currency: pkg?.base_amount_currency || checkoutResult.value?.currency || 'GBP',
		}
	})
)

const paymentBreakdownTotal = computed(() => {
	const amount = attendeePaymentBreakdown.value.reduce((sum, item) => sum + item.amount, 0)
	const currency = attendeePaymentBreakdown.value.find((item) => item.currency)?.currency || checkoutResult.value?.currency || 'GBP'
	return { amount, currency }
})

const formatMoney = (value: number | string, currency: string = 'GBP') => {
	const amount = typeof value === 'number' ? value : Number(value || 0)
	return `${amount.toFixed(2)} ${currency}`
}

const requiredConsentsMissing = computed(() => {
	if (!consents.value.length) return 0
	return consents.value.filter((consent) => consent.required && !isConsentChecked(consent.id)).length
})

const requiredConsentIds = computed(() => consents.value.filter((consent) => consent.required).map((consent) => consent.id))

const hasPersonalInfoItem = (items: PersonalInfoItemDraft[] | MedicalConditionItemDraft[], id: number) => {
	return items.some((item) => item.id === id)
}

const updatePersonalInfoItems = <T extends PersonalInfoItemDraft | MedicalConditionItemDraft>(
	items: T[],
	id: number,
	checked: boolean,
) => {
	const next = items.filter((item) => item.id !== id) as T[]
	if (checked) {
		next.push({ id } as T)
	}
	return next
}

const toggleDietaryRequirement = (id: number, eventTarget: Event) => {
	if (!currentAttendee.value) return
	const checked = (eventTarget.target as HTMLInputElement).checked
	const updated = updatePersonalInfoItems(currentAttendee.value.personalInfo.dietaryRequirements, id, checked)
	store.setPersonalInfo(store.currentIndex, { ...currentAttendee.value.personalInfo, dietaryRequirements: updated })
}

const toggleMedicalCondition = (id: number, eventTarget: Event) => {
	if (!currentAttendee.value) return
	const checked = (eventTarget.target as HTMLInputElement).checked
	const updated = updatePersonalInfoItems(currentAttendee.value.personalInfo.medicalConditions, id, checked)
	store.setPersonalInfo(store.currentIndex, { ...currentAttendee.value.personalInfo, medicalConditions: updated })
}

const toggleAccessibilityRequirement = (id: number, eventTarget: Event) => {
	if (!currentAttendee.value) return
	const checked = (eventTarget.target as HTMLInputElement).checked
	const updated = updatePersonalInfoItems(currentAttendee.value.personalInfo.accessibilityRequirements, id, checked)
	store.setPersonalInfo(store.currentIndex, { ...currentAttendee.value.personalInfo, accessibilityRequirements: updated })
}

/**
 * Update details for a dietary requirement item
 */
const updateDietaryRequirementDetails = (id: number, details: string | null) => {
	if (!currentAttendee.value) return
	const item = currentAttendee.value.personalInfo.dietaryRequirements.find((d) => d.id === id)
	if (item) {
		item.details = details && details.trim() !== '' ? details : null
	}
}

/**
 * Update severity for a medical condition item
 */
const updateMedicalConditionSeverity = (id: number, severity: 'mild' | 'moderate' | 'severe' | null) => {
	if (!currentAttendee.value) return
	const item = currentAttendee.value.personalInfo.medicalConditions.find((d) => d.id === id)
	if (item) {
		item.severity = severity
	}
}

/**
 * Update details for a medical condition item
 */
const updateMedicalConditionDetails = (id: number, details: string | null) => {
	if (!currentAttendee.value) return
	const item = currentAttendee.value.personalInfo.medicalConditions.find((d) => d.id === id)
	if (item) {
		item.details = details && details.trim() !== '' ? details : null
	}
}

/**
 * Update details for an accessibility requirement item
 */
const updateAccessibilityRequirementDetails = (id: number, details: string | null) => {
	if (!currentAttendee.value) return
	const item = currentAttendee.value.personalInfo.accessibilityRequirements.find((d) => d.id === id)
	if (item) {
		item.details = details && details.trim() !== '' ? details : null
	}
}

/**
 * Check if an item is "OTHER" (typically indicated by a special ID pattern)
 * You can customize this based on your backend's "OTHER" ID convention
 */
const isOtherOption = (id: number): boolean => {
	// Customize this based on your actual "OTHER" ID from backend
	// This is a placeholder - adjust according to your API response
	return id === -1 || String(id).toLowerCase().includes('other')
}

/**
 * Get the details field for a requirement item
 */
const getDetailsForItem = (id: number, items: PersonalInfoItemDraft[]): string => {
	const item = items.find((d) => d.id === id)
	return item?.details || ''
}

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
	return hasNames && hasRelationship && hasDob && hasAreaFrom && hasPackage && hasEmergencyContactIfMinor && attendeeHasRequiredAnswers(attendee) && attendeeHasRequiredConsents(attendee)
}

const canContinue = computed(() => {
	if (!currentAttendee.value) return false
	if (activeStepIndex.value === 0) {
		const hasNames = !!values.first_name && !!values.last_name
		const hasRelationship = !!currentAttendee.value.relationship_to_user || isRegistrarSelf.value
		const hasDob = !!values.date_of_birth
		const hasAreaFrom = !!currentAttendee.value.area_from
		const hasNoErrors = !hasAttendeeDetailsErrors.value && !errors.value.email && !errors.value.phone_number
		return hasNames && hasRelationship && hasDob && hasAreaFrom && hasNoErrors
	}
	if (activeStepIndex.value === 1) {
		return attendeeHasRequiredAnswers(currentAttendee.value)
	}
	if (activeStepIndex.value === 2) {
		// Personal info step: enforce emergency contact for minors
		if (isAttendeeMinor(currentAttendee.value)) {
			return minorHasEmergencyContact(currentAttendee.value)
		}
		return true
	}
	if (activeStepIndex.value === 3) {
		return !!currentAttendee.value.packageId
	}
	if (activeStepIndex.value === 5) {
		return requiredConsentsMissing.value === 0
	}
	if (activeStepIndex.value === reviewStepIndex) {
		const allAttendeesReady = store.attendees.every((attendee) => isAttendeeReady(attendee))
		return !!store.bookingIntentId && !!selectedPaymentMethodId.value && allAttendeesReady
	}
	return true
})

const primaryActionLabel = computed(() => {
	if (activeStepIndex.value === attendeeStepCount - 1) {
		return store.currentIndex === store.attendees.length - 1 ? 'Review payment' : 'Next attendee'
	}
	return 'Continue'
})

const addEmergencyContact = () => {
	if (!currentAttendee.value?.personalInfo) return
	currentAttendee.value.personalInfo.emergencyContact = {
		first_name: '',
		last_name: '',
		phone_number: '',
		relationship: undefined,
		email: '',
		primary_contact: true,
	}
}

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

const redirectToEventHome = () => {
	showIntentExpiredModal.value = false
	store.reset()
	// Redirect to dashboard after intent expiration
	router.push({ path: '/' })
}

const markIntentExpired = () => {
	showIntentExpiredModal.value = true
}

const pingBookingIntent = async (silent: boolean = true) => {
	if (isCreatingIntent.value) {
		return true
	}

	if (!store.bookingIntentId) {
		markIntentExpired()
		return false
	}

	try {
		const response = await pingBookingIntentMutation.mutateAsync({
			intent: store.bookingIntentId,
		})
		const data = response.data as {
			is_active?: boolean
			redirect_required?: boolean
		}

		if (!data?.is_active || data?.redirect_required) {
			markIntentExpired()
			return false
		}

		return true
	} catch (error: any) {
		const statusCode = error?.status || error?.response?.status
		if (statusCode === 400 || statusCode === 404) {
			markIntentExpired()
			return false
		}

		if (!silent) {
			toast.add({ title: 'Warning', description: 'Unable to verify booking intent right now.', color: 'amber' })
		}
		return true
	}
}

let intentPingTimer: ReturnType<typeof setInterval> | null = null

const stopIntentPing = () => {
	if (!intentPingTimer) return
	clearInterval(intentPingTimer)
	intentPingTimer = null
}

const startIntentPing = () => {
	stopIntentPing()
	if (!store.bookingIntentId) return
	intentPingTimer = setInterval(() => {
		void pingBookingIntent(true)
	}, 120000)
}

watch(
	() => store.bookingIntentId,
	(intentId) => {
		if (!intentId) {
			stopIntentPing()
			return
		}
		void pingBookingIntent(true)
		startIntentPing()
	},
	{ immediate: true }
)

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
	if (!canContinue.value) return
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
	if (!canContinue.value || !store.bookingIntentId || !selectedPaymentMethodId.value) return
	if (!(await pingBookingIntent(false))) return
	isSaving.value = true
	checkoutResult.value = null

	try {
		const payload = buildCheckoutPayload({
			bookingIntentId: store.bookingIntentId,
			paymentMethodId: selectedPaymentMethodId.value,
			attendees: store.attendees,
		})
		const response = await checkoutMutation.mutateAsync({
			body: payload,
			idempotencyKey: idempotencyKey.value,
		})
		checkoutResult.value = response.data
		showCheckoutSuccessModal.value = true
		toast.add({ title: 'Success', description: 'Checkout completed.', color: 'green' })
	} catch (error) {
		console.error('Checkout failed', error)
		toast.add({ title: 'Error', description: 'Checkout failed. Please try again.', color: 'red' })
	} finally {
		isSaving.value = false
	}
}

const goBack = () => {
	if (event.value?.event_id) {
		router.push({ path: `/events/${event.value.event_id}` })
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
</style>