<template>
	<div class="space-y-5">

		<!-- Header -->
		<div class="border-b-2 pb-4 mb-3">
			<p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/50">Sponsor Flow</p>
			<h2 class="text-2xl font-black text-deep-navy uppercase tracking-tight">Sponsor An Event</h2>
			<p class="text-sm text-deep-navy/60 font-medium mt-1">Select the event, pick a package and payment method, then confirm checkout.</p>
		</div>

		<!-- Step indicator -->
		<UStepper
			:model-value="activeStep - 1"
			:items="stepperItems"
			:connector-width="200"
			@update:model-value="val => activeStep = val + 1"
		/>

		<!-- Step panels -->
		<div class="min-h-[300px] max-w-4xl mx-auto">

			<!-- Step 1: Event selection -->
			<div v-if="activeStep === 1" class="space-y-4">

				<!-- Search bar -->
				<div class="flex flex-col md:flex-row gap-3">
					<div class="flex-1">
						<label class="block text-[10px] font-black text-deep-navy/50 mb-2 uppercase tracking-[0.2em]">Search Events</label>
						<input
							v-model="eventSearch"
							type="text"
							placeholder="Search by title, code, or description"
							class="w-full px-4 py-3 bg-white border-2 border-deep-navy/20 rounded-xl focus:border-deep-navy focus:outline-none font-medium text-sm text-deep-navy placeholder:text-deep-navy/30 transition-colors"
						/>
					</div>
					<div class="flex flex-col justify-end">
						<button
							type="button"
							class="px-4 py-3 rounded-xl border-2 border-deep-navy/20 text-deep-navy text-xs font-black uppercase tracking-wider hover:border-deep-navy/40 transition-colors"
							@click="selectFirstEvent"
						>
							Auto Select
						</button>
					</div>
				</div>

				<!-- Event list -->
				<div v-if="isLoadingSponsorableEvents" class="grid grid-cols-1 md:grid-cols-2 gap-3">
					<div v-for="i in 4" :key="i" class="aspect-[16/9] rounded-xl bg-deep-navy/5 animate-pulse" />
				</div>
				<div v-else-if="sponsorableEvents.length === 0" class="text-center py-10 border-2 border-dashed border-deep-navy/15 rounded-2xl">
					<p class="text-sm font-black uppercase tracking-wider text-deep-navy/40">No sponsorable events found.</p>
				</div>
				<div v-else class="space-y-3">
					<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
						<button
							v-for="event in sponsorableEvents"
							:key="event.event_id"
							type="button"
							@click="handleSelectEvent(event)"
							class="group text-left border-2 rounded-xl overflow-hidden transition-all"
							:class="selectedEventId === event.event_id
								? 'border-deep-navy ring-2 ring-deep-navy'
								: 'border-deep-navy/15 hover:border-deep-navy/40'"
						>
							<!-- Image -->
							<div class="relative aspect-[16/9] overflow-hidden bg-deep-navy/5">
								<img
									v-if="event.main_landing_image?.image"
									:src="resolveImageUrl(event.main_landing_image.image_urls?.medium || event.main_landing_image.image_urls?.original)"
									:alt="event.title"
									class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
									@error="onImageError"
								/>
								<div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-deep-navy/10 to-deep-navy/20">
									<svg class="w-10 h-10 text-deep-navy/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
									</svg>
								</div>
								<!-- Selected tick -->
								<div v-if="selectedEventId === event.event_id" class="absolute top-2 right-2 h-6 w-6 rounded-full bg-deep-navy flex items-center justify-center">
									<svg class="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
										<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
									</svg>
								</div>
							</div>
							<!-- Info -->
							<div class="p-3">
								<p class="text-sm font-black text-deep-navy uppercase tracking-tight leading-snug line-clamp-1">{{ event.title }}</p>
								<p class="mt-0.5 text-[10px] font-black uppercase tracking-wider text-deep-navy/50">{{ formatDateSafe(event.start_datetime) }} &bull; {{ event.active_sponsorship_packages_count }} packages</p>
							</div>
						</button>
					</div>

					<div class="flex items-center justify-between pt-1">
						<p class="text-[10px] font-black text-deep-navy/40 uppercase tracking-wider">
							Page {{ eventPage }} of {{ Math.ceil(sponsorableEventsCount / 8) || 1 }} &bull; {{ sponsorableEventsCount }} results
						</p>
						<div class="flex items-center gap-2">
							<button
								type="button"
								@click="eventPage = Math.max(1, eventPage - 1)"
								:disabled="!hasPrevEventsPage"
								class="px-3 py-2 border-2 border-deep-navy/20 rounded-lg text-[10px] font-black text-deep-navy uppercase tracking-wider disabled:opacity-30 hover:border-deep-navy/40 transition-colors"
							>
								Prev
							</button>
							<button
								type="button"
								@click="eventPage = eventPage + 1"
								:disabled="!hasNextEventsPage"
								class="px-3 py-2 border-2 border-deep-navy/20 rounded-lg text-[10px] font-black text-deep-navy uppercase tracking-wider disabled:opacity-30 hover:border-deep-navy/40 transition-colors"
							>
								Next
							</button>
						</div>
					</div>
				</div>

				<!-- Payment history panel -->
				<section class="rounded-xl border border-deep-navy/10 bg-white/95 p-4 space-y-4 shadow-sm">
					<p class="text-[10px] font-black uppercase tracking-[0.22em] text-deep-navy">Sponsorship Payments</p>

					<div v-if="!selectedEvent" class="rounded-xl border border-deep-navy/10 bg-slate-50 p-4 text-sm font-medium text-deep-navy/50">
						Select an event above to view its payment history.
					</div>
					<div v-else-if="isLoadingPaymentHistory" class="space-y-3">
						<USkeleton class="h-24 w-full rounded-xl" />
						<USkeleton class="h-24 w-full rounded-xl" />
					</div>
					<div v-else-if="!paymentHistoryData" class="rounded-xl border border-deep-navy/10 bg-slate-50 p-4 text-sm font-medium text-deep-navy/50">
						No payment data available for this event yet.
					</div>
					<template v-else>
						<!-- Summary totals -->
						<div class="grid grid-cols-3 gap-2">
							<div class="rounded-xl border border-deep-navy/10 bg-slate-50 p-3 flex items-start gap-2.5">
								<span class="material-symbols-outlined rounded-lg bg-white p-1.5 text-deep-navy shadow-sm" style="font-size:16px;line-height:1;font-variation-settings:'FILL' 1,'wght' 700">receipt_long</span>
								<div>
									<p class="text-[9px] font-black uppercase tracking-wider text-deep-navy/45">Total</p>
									<p class="mt-1 text-lg font-black text-deep-navy leading-none">{{ paymentSummaryCount }}</p>
								</div>
							</div>
							<div class="rounded-xl border border-deep-navy/10 bg-slate-50 p-3 flex items-start gap-2.5">
								<span class="material-symbols-outlined rounded-lg bg-white p-1.5 text-emerald-600 shadow-sm" style="font-size:16px;line-height:1;font-variation-settings:'FILL' 1,'wght' 700">check_circle</span>
								<div>
									<p class="text-[9px] font-black uppercase tracking-wider text-deep-navy/45">Completed</p>
									<p class="mt-1 text-lg font-black text-deep-navy leading-none">{{ paymentSummaryAmount }}</p>
								</div>
							</div>
							<div class="rounded-xl border border-deep-navy/10 bg-slate-50 p-3 flex items-start gap-2.5">
								<span class="material-symbols-outlined rounded-lg bg-white p-1.5 text-amber-500 shadow-sm" style="font-size:16px;line-height:1;font-variation-settings:'FILL' 1,'wght' 700">pending</span>
								<div>
									<p class="text-[9px] font-black uppercase tracking-wider text-deep-navy/45">Pending</p>
									<p class="mt-1 text-lg font-black text-deep-navy leading-none">{{ paymentSummaryPending }}</p>
								</div>
							</div>
						</div>

						<!-- Timeline -->
						<div v-if="paymentTimeline.length === 0" class="rounded-xl border border-deep-navy/10 bg-slate-50 p-4 text-sm font-medium text-deep-navy/50">
							No payment entries yet.
						</div>
						<div v-else class="space-y-3">
							<article v-for="item in paymentTimeline" :key="item.payment_id" class="rounded-xl border border-deep-navy/10 bg-white p-4 shadow-sm">
								<!-- Header row -->
								<div class="flex items-start justify-between gap-3">
									<div class="min-w-0">
										<p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/40">Sponsorship Payment</p>
										<p class="mt-0.5 truncate text-sm font-mono text-deep-navy">{{ item.payment_reference }}</p>
										<p class="mt-0.5 text-[10px] font-medium text-deep-navy/55">{{ formatMethodType(item.method_type || 'UNKNOWN') }} &bull; {{ formatDateSafe(item.created_at) }}</p>
									</div>
									<span class="shrink-0 rounded px-2 py-0.5 text-[10px] font-black uppercase tracking-wider" :class="sponsorPaymentStatusClass(item.status)">
										{{ item.status }}
									</span>
								</div>

								<!-- Amount + method tiles -->
								<div class="mt-3 grid grid-cols-2 gap-2">
									<div class="rounded-xl border border-deep-navy/10 bg-slate-50 p-3">
										<div class="flex items-start gap-2.5">
											<span class="material-symbols-outlined rounded-lg bg-white p-1.5 text-deep-navy shadow-sm" style="font-size:16px;line-height:1;font-variation-settings:'FILL' 1,'wght' 700">payments</span>
											<div>
												<p class="text-[9px] font-black uppercase tracking-wider text-slate-500">Amount</p>
												<p class="mt-1 text-lg font-black text-deep-navy leading-none">{{ formatMoney(item.amount, item.currency) }}</p>
											</div>
										</div>
									</div>
									<div class="rounded-xl border border-deep-navy/10 bg-slate-50 p-3">
										<div class="flex items-start gap-2.5">
											<span class="material-symbols-outlined rounded-lg bg-white p-1.5 text-primary shadow-sm" style="font-size:16px;line-height:1;font-variation-settings:'FILL' 1,'wght' 700">{{ sponsorPaymentMethodIcon(item.method_type) }}</span>
											<div class="min-w-0">
												<p class="text-[9px] font-black uppercase tracking-wider text-slate-500">Method</p>
												<p class="mt-1 text-xs font-black text-deep-navy leading-none">{{ item.method_title || formatMethodType(item.method_type || 'UNKNOWN') }}</p>
											</div>
										</div>
									</div>
								</div>

								<!-- Bank transfer instructions (PENDING non-stripe) -->
								<div v-if="item.status === 'PENDING' && item.method_type !== 'STRIPE'" class="mt-3 space-y-2 rounded-xl border border-blue-200 bg-blue-50 p-3">
									<p class="text-[10px] font-black uppercase tracking-[0.2em] text-blue-700">Bank Transfer Instructions</p>
									<div class="rounded-xl border border-white bg-white/90 p-2.5">
										<p class="text-[10px] font-black uppercase tracking-wider text-blue-700/70">Transfer Reference</p>
										<p class="mt-1 break-all text-xs font-black text-blue-900">{{ item.bank_transfer_reference || '—' }}</p>
									</div>
									<p class="text-xs font-medium text-blue-800/80">Use this reference in your bank transfer so the payment can be matched.</p>
								</div>

								<!-- Stripe pending note -->
								<div v-else-if="item.status === 'PENDING' && item.method_type === 'STRIPE'" class="mt-3 rounded-xl border border-deep-navy/10 bg-slate-50 p-3">
									<p class="text-xs font-medium text-deep-navy/60">No action required — this payment is handled via Stripe.</p>
								</div>
							</article>
						</div>
					</template>
				</section>

			</div>

			<!-- Step 2: Package + payment method -->
			<div v-else-if="activeStep === 2" class="space-y-5">
				<div v-if="checkoutBlockMessage" class="p-4 rounded-xl border-2 border-amber-400/40 bg-amber-50">
					<p class="text-xs font-black text-deep-navy uppercase tracking-wider">{{ checkoutBlockMessage }}</p>
				</div>

				<!-- Checkout mode + sponsor name -->
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label class="block text-[10px] font-black text-deep-navy/50 mb-2 uppercase tracking-[0.2em]">Checkout Mode</label>
						<div class="flex gap-2 bg-deep-navy/5 rounded-xl p-1.5 border-2 border-deep-navy/10">
							<button
								type="button"
								:disabled="selectedEvent?.requires_invite_acceptance_for_checkout && acceptedInvitesCount === 0"
								:class="checkoutForm.mode === 'direct' ? 'bg-deep-navy text-white shadow' : 'text-deep-navy hover:bg-deep-navy/5'"
								class="flex-1 px-3 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all disabled:opacity-40"
								@click="checkoutForm.mode = 'direct'"
							>
								Direct
							</button>
							<button
								type="button"
								:class="checkoutForm.mode === 'token' ? 'bg-deep-navy text-white shadow' : 'text-deep-navy hover:bg-deep-navy/5'"
								class="flex-1 px-3 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all"
								@click="checkoutForm.mode = 'token'"
							>
								Invite Token
							</button>
						</div>
					</div>
					<div>
						<label class="block text-[10px] font-black text-deep-navy/50 mb-2 uppercase tracking-[0.2em]">Sponsor Name (Optional)</label>
						<input
							v-model="checkoutForm.name"
							type="text"
							placeholder="Defaults to organisation title"
							class="w-full px-4 py-3 bg-white border-2 border-deep-navy/20 rounded-xl focus:border-deep-navy focus:outline-none font-medium text-sm text-deep-navy placeholder:text-deep-navy/30 transition-colors"
						/>
					</div>
				</div>

				<!-- Invite token field -->
				<div v-if="checkoutForm.mode === 'token'">
					<label class="block text-[10px] font-black text-deep-navy/50 mb-2 uppercase tracking-[0.2em]">Invite Token</label>
					<input
						v-model="checkoutForm.inviteToken"
						type="text"
						placeholder="Paste your invite token here"
						class="w-full px-4 py-3 bg-white border-2 border-deep-navy/20 rounded-xl focus:border-deep-navy focus:outline-none font-medium text-sm text-deep-navy placeholder:text-deep-navy/30 transition-colors"
					/>
				</div>

				<!-- Package selection -->
				<div>
					<label class="block text-[10px] font-black text-deep-navy/50 mb-3 uppercase tracking-[0.2em]">Sponsorship Package</label>
					<div v-if="isLoadingPackages" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
						<div v-for="i in 3" :key="i" class="h-56 rounded-xl bg-deep-navy/5 animate-pulse" />
					</div>
					<div v-else-if="sponsorshipPackages.length === 0" class="py-8 text-center border-2 border-dashed border-deep-navy/15 rounded-2xl">
						<p class="text-sm font-black uppercase tracking-wider text-deep-navy/40">No active packages available for this event.</p>
					</div>
					<div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
						<SponsorPackageCard
							v-for="pkg in styledPackages"
							:key="pkg.package_id"
							:pkg="pkg"
							:selected="checkoutForm.packageId === pkg.package_id"
							:selectable="true"
							@select="checkoutForm.packageId = pkg.package_id"
						/>
					</div>
				</div>

				<!-- Payment method -->
				<div>
					<label class="block text-[10px] font-black text-deep-navy/50 mb-3 uppercase tracking-[0.2em]">Payment Method</label>
					<div v-if="isLoadingPaymentMethods">
						<USkeleton class="h-16 w-full" />
					</div>
					<div v-else-if="paymentMethods.length === 0" class="py-8 text-center border-2 border-dashed border-deep-navy/15 rounded-2xl">
						<p class="text-sm font-black uppercase tracking-wider text-deep-navy/40">No active payment methods found for this event.</p>
					</div>
					<div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
						<button
							v-for="method in paymentMethods"
							:key="method.id"
							type="button"
							class="text-left p-4 border-2 rounded-xl transition-all flex items-start gap-3"
							:class="checkoutForm.paymentMethodId === method.id
								? 'border-deep-navy bg-deep-navy text-white'
								: 'border-deep-navy/20 bg-white text-deep-navy hover:border-deep-navy/40'"
							@click="checkoutForm.paymentMethodId = method.id"
						>
							<!-- Method type icon indicator -->
							<div
								class="mt-0.5 h-8 w-8 flex-shrink-0 rounded-lg flex items-center justify-center text-base"
								:class="checkoutForm.paymentMethodId === method.id ? 'bg-white/15' : 'bg-deep-navy/5'"
							>
								<span v-if="method.method_type === 'STRIPE'"><UIcon name="i-heroicons-credit-card"/></span>
								<span v-else-if="method.method_type === 'BANK_TRANSFER'"><UIcon name="i-heroicons-banknotes"/></span>
								<span v-else-if="method.method_type === 'CASH'"><UIcon name="i-heroicons-cash"/></span>
								<span v-else><UIcon name="i-heroicons-currency-dollar"/></span>
							</div>
							<div class="flex-1 min-w-0">
								<p class="text-sm font-black uppercase tracking-tight">{{ method.title }}</p>
								<p class="mt-0.5 text-[10px] font-black uppercase tracking-wider opacity-60">{{ formatMethodType(method.method_type) }}</p>
								<p v-if="method.method_type === 'STRIPE'" class="mt-1 text-[10px] font-medium opacity-60 normal-case tracking-normal">Pay securely by card — processed instantly.</p>
								<p v-else-if="method.method_type === 'BANK_TRANSFER'" class="mt-1 text-[10px] font-medium opacity-60 normal-case tracking-normal">Transfer funds directly — reference provided after checkout.</p>
								<p v-else-if="method.method_type === 'CASH'" class="mt-1 text-[10px] font-medium opacity-60 normal-case tracking-normal">Pay in person — arrange with the organiser.</p>
							</div>
							<!-- Check indicator -->
							<svg v-if="checkoutForm.paymentMethodId === method.id" class="mt-0.5 h-4 w-4 flex-shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
								<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
							</svg>
						</button>
					</div>
				</div>

				<!-- Description -->
				<div>
					<label class="block text-[10px] font-black text-deep-navy/50 mb-2 uppercase tracking-[0.2em]">Description (Optional)</label>
					<textarea
						v-model="checkoutForm.description"
						rows="3"
						placeholder="Optional note for this sponsorship"
						class="w-full px-4 py-3 bg-white border-2 border-deep-navy/20 rounded-xl focus:border-deep-navy focus:outline-none font-medium text-sm text-deep-navy placeholder:text-deep-navy/30 transition-colors resize-none"
					/>
				</div>
			</div>

			<!-- Step 3: Review + confirm -->
			<div v-else-if="activeStep === 3" class="space-y-4">

				<!-- Review summary -->
				<div class="rounded-2xl border-2 border-deep-navy/10 bg-deep-navy/[0.02] p-6">
					<p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/50 mb-4">Review Sponsorship</p>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
						<div>
							<p class="text-[9px] font-black uppercase tracking-[0.15em] text-deep-navy/40">Event</p>
							<p class="mt-1 text-sm font-black text-deep-navy">{{ selectedEvent?.title || '—' }}</p>
						</div>
						<div>
							<p class="text-[9px] font-black uppercase tracking-[0.15em] text-deep-navy/40">Package</p>
							<p class="mt-1 text-sm font-black text-deep-navy">{{ selectedPackage?.package_name || '—' }}</p>
						</div>
						<div>
							<p class="text-[9px] font-black uppercase tracking-[0.15em] text-deep-navy/40">Payment Method</p>
							<p class="mt-1 text-sm font-black text-deep-navy">{{ selectedPaymentMethod?.title || '—' }}</p>
						</div>
						<div>
							<p class="text-[9px] font-black uppercase tracking-[0.15em] text-deep-navy/40">Amount</p>
							<p class="mt-1 text-sm font-black text-deep-navy">{{ selectedPackageAmount }}</p>
						</div>
						<div v-if="checkoutForm.name">
							<p class="text-[9px] font-black uppercase tracking-[0.15em] text-deep-navy/40">Sponsor Name</p>
							<p class="mt-1 text-sm font-black text-deep-navy">{{ checkoutForm.name }}</p>
						</div>
						<div v-if="checkoutForm.description">
							<p class="text-[9px] font-black uppercase tracking-[0.15em] text-deep-navy/40">Description</p>
							<p class="mt-1 text-sm font-black text-deep-navy">{{ checkoutForm.description }}</p>
						</div>
					</div>
				</div>

				<!-- Stripe card form -->
				<div v-if="isStripeMethod && !checkoutResult" class="space-y-2">
					<label class="block text-[10px] font-black text-deep-navy/50 mb-2 uppercase tracking-[0.2em]">Card Details</label>
					<div
						ref="stripeCardMountRef"
						class="px-4 py-4 bg-white border-2 border-deep-navy/20 rounded-xl"
					/>
					<p v-if="stripeCardError" class="text-xs font-black text-red-600 uppercase tracking-wider">{{ stripeCardError }}</p>
					<p v-if="stripePaymentAttemptError" class="text-xs font-black text-red-600 uppercase tracking-wider">{{ stripePaymentAttemptError }}</p>
				</div>
			</div>
		</div>

		<!-- Navigation -->
		<div class="flex items-center justify-between pt-2 border-t-2 border-deep-navy/10">
			<button
				v-if="activeStep > 1"
				type="button"
				class="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-deep-navy/20 text-sm font-black uppercase tracking-wider text-deep-navy hover:border-deep-navy/40 transition-colors"
				@click="activeStep = activeStep - 1"
			>
				<span class="material-symbols-outlined text-base">chevron_left</span>
				Back
			</button>
			<div v-else />

			<button
				v-if="activeStep < 3"
				type="button"
				:disabled="!canGoNextStep()"
				class="flex items-center gap-2 px-6 py-3 rounded-xl bg-deep-navy text-white text-sm font-black uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed hover:bg-deep-navy/80 transition-colors"
				@click="goNextStep"
			>
				Next
				<span class="material-symbols-outlined text-base">chevron_right</span>
			</button>
			<button
				v-else
				type="button"
				:disabled="!canCheckout || isCheckingOut || isConfirmingStripePayment || (isStripeMethod && !checkoutResult && !stripeCardReady)"
				class="flex items-center gap-2 px-6 py-3 rounded-xl bg-deep-navy text-white text-sm font-black uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed hover:bg-deep-navy/80 transition-colors"
				@click="submitCheckout"
			>
				<span
					v-if="isCheckingOut || isConfirmingStripePayment"
					class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
				/>
				<template v-else>
					{{ isStripeMethod ? 'Pay Now' : 'Confirm Sponsorship' }}
					<span class="material-symbols-outlined text-base">check</span>
				</template>
			</button>
		</div>
	</div>

	<!-- Processing overlay -->
	<Teleport to="body">
		<Transition
			enter-active-class="transition duration-200 ease-out"
			enter-from-class="opacity-0"
			enter-to-class="opacity-100"
			leave-active-class="transition duration-150 ease-in"
			leave-from-class="opacity-100"
			leave-to-class="opacity-0"
		>
			<div
				v-if="isProcessingCheckout"
				class="fixed inset-0 z-40 flex items-center justify-center bg-deep-navy/60 backdrop-blur-sm"
			>
				<div class="w-full max-w-sm rounded-3xl border border-deep-navy/10 bg-white p-8 shadow-2xl text-center">
					<div class="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-deep-navy/20 border-t-deep-navy" />
					<p class="mt-5 text-sm font-black uppercase tracking-[0.15em] text-deep-navy">Processing sponsorship</p>
					<p class="mt-1 text-xs text-deep-navy/60">Please do not close or refresh this page.</p>
				</div>
			</div>
		</Transition>
	</Teleport>

	<!-- Success modal -->
	<Teleport to="body">
		<Transition
			enter-active-class="transition duration-500 ease-out"
			enter-from-class="opacity-0 scale-95"
			enter-to-class="opacity-100 scale-100"
			leave-active-class="transition duration-250 ease-in"
			leave-from-class="opacity-100 scale-100"
			leave-to-class="opacity-0 scale-95"
		>
			<div
				v-if="checkoutResult"
				class="fixed inset-0 z-50 flex items-center justify-center bg-deep-navy/55 px-4 backdrop-blur-sm"
			>
				<div class="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-green-200 bg-white p-6 shadow-2xl">
					<div class="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-green-100/70 to-transparent" />
					<div class="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-center gap-2 pt-4">
						<span class="h-2 w-2 rounded-full bg-green-400 animate-bounce" />
						<span class="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
						<span class="h-2 w-2 rounded-full bg-amber-400 animate-bounce" />
					</div>

					<div class="mt-6 text-center">
						<p class="text-[10px] font-black uppercase tracking-[0.22em] text-green-700">Sponsorship Confirmed</p>
						<h3 class="mt-2 text-3xl font-black text-deep-navy">
							{{ checkoutResult.payment_method_type === 'STRIPE' ? 'Payment Successful!' : 'Checkout Initiated!' }}
						</h3>
						<p class="mx-auto mt-2 max-w-xl text-sm text-deep-navy/75">
							{{ checkoutResult.payment_method_type === 'STRIPE'
								? 'Your card payment has been confirmed. Thank you for sponsoring this event.'
								: 'Your sponsorship has been initiated. Please complete the bank transfer using the details below.'
							}}
						</p>
					</div>

					<div class="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4 space-y-2">
						<div class="grid grid-cols-2 gap-x-6 gap-y-2">
							<div>
								<p class="text-[9px] font-black uppercase tracking-[0.15em] text-green-800">Sponsor ID</p>
								<p class="text-xs font-semibold text-green-900 font-mono">{{ checkoutResult.sponsor_id }}</p>
							</div>
							<div>
								<p class="text-[9px] font-black uppercase tracking-[0.15em] text-green-800">Payment Reference</p>
								<p class="text-xs font-semibold text-green-900 font-mono">{{ checkoutResult.payment_reference }}</p>
							</div>
							<div>
								<p class="text-[9px] font-black uppercase tracking-[0.15em] text-green-800">Status</p>
								<p class="text-xs font-semibold text-green-900 uppercase">{{ checkoutResult.payment_status }}</p>
							</div>
							<div v-if="checkoutResult.payment_method_type === 'STRIPE' && checkoutResult.payment_intent_id">
								<p class="text-[9px] font-black uppercase tracking-[0.15em] text-green-800">Payment Intent</p>
								<p class="text-xs font-semibold text-green-900 font-mono truncate">{{ checkoutResult.payment_intent_id }}</p>
							</div>
						</div>
					</div>

					<div
						v-if="checkoutResult.payment_method_type === 'BANK_TRANSFER'"
						class="mt-4 rounded-2xl border border-deep-navy/10 bg-white p-4"
					>
						<p class="text-[10px] font-black uppercase tracking-[0.15em] text-deep-navy mb-2">Bank Transfer Instructions</p>
						<p class="text-xs font-semibold text-deep-navy/70 mb-1">
							Reference: <span class="font-mono">{{ checkoutResult.bank_transfer_reference || checkoutResult.payment_reference }}</span>
						</p>
						<pre class="text-xs text-deep-navy/60 whitespace-pre-wrap">{{ stringifyDetails(checkoutResult.payment_instructions) }}</pre>
					</div>

					<div class="mt-5 flex flex-wrap justify-center gap-2">
						<button
							type="button"
							class="rounded-xl bg-deep-navy px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:bg-deep-navy/80 transition-colors"
							@click="handleStartNewSponsorship"
						>
							Start New Sponsorship
						</button>
					</div>
				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useSponsorFlow } from '~/composables/communities/sponsors/useSponsorFlow'
import { useSponsorPackageStyling } from '~/composables/communities/sponsors/useSponsorPackageStyling'
import SponsorPackageCard from '~/components/communities/sponsors/SponsorPackageCard.vue'
import UStepper from '~/components/UStepper.vue'
import type { StepperItem } from '~/components/UStepper.vue'
import { formatMoney } from '~/utils/money'
import { formatDate } from '~/utils/time'
import { resolveImageUrl, onImageError } from '~/utils/image'
import type { SponsorableEventList } from '~/api/types.gen'

const stepperItems: StepperItem[] = [
	{ key: 'event', label: 'Event', description: 'Choose an event to sponsor' },
	{ key: 'package', label: 'Package', description: 'Set package & payment' },
	{ key: 'review', label: 'Review', description: 'Confirm checkout' },
]

const props = defineProps<{
	organisationId: string
	organisationNumericId: number | undefined
	selectedEventId: string
}>()

const emit = defineEmits<{
	(e: 'update:selectedEventId', value: string): void
}>()

// Writable local refs that sync with the page via emit
const localSelectedEventId = ref(props.selectedEventId)
const localSelectedEventSnapshot = ref<SponsorableEventList | null>(null)

watch(() => props.selectedEventId, (val) => {
	localSelectedEventId.value = val
})

watch(localSelectedEventId, (val) => {
	emit('update:selectedEventId', val)
})

const {
	eventSearch,
	eventPage,
	activeStep,
	checkoutForm,
	checkoutResult,
	isLoadingSponsorableEvents,
	isLoadingPackages,
	isLoadingPaymentMethods,
	isLoadingPaymentHistory,
	isCheckingOut,
	sponsorableEvents,
	sponsorableEventsCount,
	hasNextEventsPage,
	hasPrevEventsPage,
	selectedEvent,
	sponsorshipPackages,
	paymentMethods,
	selectedPackage,
	selectedPaymentMethod,
	selectedPackageAmount,
	paymentHistoryData,
	paymentSummaryCount,
	paymentSummaryPending,
	paymentSummaryAmount,
	paymentTimeline,
	canCheckout,
	checkoutBlockMessage,
	canGoNextStep,
	goNextStep,
	selectEvent,
	selectFirstEvent,
	submitCheckout,
	resetFlow,
	stripeCardMountRef,
	stripeCardReady,
	stripeCardError,
	stripePaymentAttemptError,
	isConfirmingStripePayment,
	isStripeMethod,
} = useSponsorFlow(
	computed(() => props.organisationId),
	computed(() => props.organisationNumericId),
	localSelectedEventId,
	localSelectedEventSnapshot,
)

const acceptedInvitesCount = computed(() =>
	(selectedEvent.value as any)?.accepted_invites_count ?? 0,
)

const { styledPackages } = useSponsorPackageStyling(computed(() => sponsorshipPackages.value))
const isProcessingCheckout = computed(() => isCheckingOut.value || isConfirmingStripePayment.value)

function handleStartNewSponsorship() {
	resetFlow()
	activeStep.value = 1
}

function handleSelectEvent(event: SponsorableEventList) {
	selectEvent(event)
}

function formatDateSafe(value?: string | null) {
	if (!value) return 'Unknown date'
	return formatDate(value)
}

function formatMethodType(methodType: string) {
	if (methodType === 'BANK_TRANSFER') return 'Bank Transfer'
	if (methodType === 'STRIPE') return 'Stripe'
	if (methodType === 'CASH') return 'Cash'
	return methodType
}

function sponsorPaymentStatusClass(status: string) {
	if (status === 'COMPLETED') return 'bg-emerald-100 text-emerald-800'
	if (status === 'PENDING') return 'bg-amber-100 text-amber-800'
	if (status === 'FAILED') return 'bg-red-100 text-red-800'
	if (status === 'REFUNDED') return 'bg-blue-100 text-blue-800'
	return 'bg-slate-100 text-slate-700'
}

function sponsorPaymentMethodIcon(methodType: string | null) {
	if (methodType === 'STRIPE') return 'credit_card'
	if (methodType === 'BANK_TRANSFER') return 'account_balance'
	if (methodType === 'CASH') return 'payments'
	return 'money'
}

function stringifyDetails(value: unknown) {
	if (!value) return 'No additional instructions returned.'
	try {
		return JSON.stringify(value, null, 2)
	} catch {
		return String(value)
	}
}
</script>
