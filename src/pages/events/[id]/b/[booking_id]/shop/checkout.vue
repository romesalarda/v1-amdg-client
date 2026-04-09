<template>
	<div class="min-h-screen bg-mist-blue">
		<div class="mx-auto max-w-screen-xl space-y-4 px-4 py-6 md:px-6">
			<section class="rounded-3xl border border-deep-navy/10 bg-white p-5 shadow-sm">
				<div class="flex flex-wrap items-center justify-between gap-2">
					<div>
						<p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/55">Checkout for {{ selectedAttendeeLabel }}</p>
						<h1 class="mt-1 text-2xl font-black text-deep-navy">Checkout</h1>
						<p class="mt-1 text-sm text-deep-navy/65">Choose payment method and place your order.</p>
						<p class="mt-1 text-[11px] text-deep-navy/45">Booking ref {{ bookingReference }}</p>
					</div>
					<div class="flex items-center gap-2">
						<NuxtLink
							:to="bookingWorkspaceHref"
							class="rounded-lg border border-deep-navy/20 px-3 py-2 text-xs font-black uppercase tracking-wide text-deep-navy hover:border-deep-navy"
						>
							Booking
						</NuxtLink>
						<NuxtLink
							:to="cartHref"
							class="rounded-lg border border-deep-navy/20 px-3 py-2 text-xs font-black uppercase tracking-wide text-deep-navy hover:border-deep-navy"
						>
							Back to Cart
						</NuxtLink>
					</div>
				</div>
			</section>

			<section v-if="!order" class="rounded-2xl border border-deep-navy/10 bg-white p-5 text-sm text-deep-navy/70">
				No draft cart found. Add items before checkout.
			</section>

			<section v-else class="grid grid-cols-1 gap-4 lg:grid-cols-12">
				<div class="space-y-4 lg:col-span-8">
					<article class="rounded-2xl border border-deep-navy/10 bg-white p-4">
						<p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/55">Order items</p>
						<div class="mt-3 space-y-2">
							<article
								v-for="item in checkoutDisplayItems"
								:key="item.id"
								class="rounded-xl border border-deep-navy/10 bg-mist-blue/60 p-3"
							>
								<div class="flex items-start gap-3">
									<img
										:src="item.imageUrl"
										:alt="item.title"
										class="h-14 w-14 rounded-lg border border-deep-navy/10 bg-white object-cover"
									>
									<div class="min-w-0 flex-1">
										<p class="text-xs font-black text-deep-navy">{{ item.title }}</p>
										<p class="text-[11px] text-deep-navy/65">{{ item.subtitle }}</p>
										<p class="text-[11px] text-deep-navy/65">Qty {{ item.quantity }}</p>
									</div>
									<div class="text-right">
										<p class="text-[11px] text-deep-navy/65">Unit {{ item.unitPrice }}</p>
										<p class="text-xs font-black text-deep-navy">{{ item.totalPrice}}</p>
									</div>
								</div>
							</article>
						</div>
					</article>

					<article
						v-if="isCheckoutLocked"
						class="rounded-2xl border border-amber-200 bg-amber-50 p-4"
					>
						<p class="text-[10px] font-black uppercase tracking-[0.2em] text-amber-900">Checkout unavailable</p>
						<p class="mt-2 text-sm text-amber-900">
							This order is {{ order?.status }}. Checkout is only available for draft orders.
						</p>
					</article>

					<article v-if="!isCheckoutLocked" class="rounded-2xl border border-deep-navy/10 bg-white p-4">
						<p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/55">Payment methods</p>

						<div v-if="paymentMethodsQuery.isLoading.value" class="mt-3 text-sm text-deep-navy/65">Loading payment methods...</div>

						<div v-else-if="paymentMethods.length === 0" class="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-800">
							No active payment methods are configured for this event.
						</div>

						<div v-else class="mt-3 space-y-2">
							<label
								v-for="method in paymentMethods"
								:key="method.id"
								class="flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-3"
								:class="selectedPaymentMethodId === method.id ? 'border-deep-navy bg-mist-blue' : 'border-deep-navy/10 bg-white hover:border-blue-300'"
							>
								<input v-model="selectedPaymentMethodId" :value="method.id" type="radio" class="mt-1">
								<div class="min-w-0 flex-1">
									<p class="text-sm font-black text-deep-navy">{{ method.title }}</p>
									<p class="text-xs text-deep-navy/65">{{ method.method_type.replace('_', ' ') }}</p>
									<p
										v-if="method.method_type === 'BANK_TRANSFER' && method.provided_details"
										class="mt-2 rounded border border-blue-200 bg-blue-50 px-2 py-2 text-xs text-blue-800"
									>
										Bank details are available after checkout confirmation.
									</p>
								</div>
							</label>
						</div>

						<div
							v-if="isStripeMethod"
							class="mt-4 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50 p-4"
						>
							<div class="flex items-start justify-between gap-3">
								<div class="flex items-center gap-2">
									<span class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 bg-white text-blue-700">
										<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
											<path d="M12 2a5 5 0 0 0-5 5v2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5Zm-3 7V7a3 3 0 1 1 6 0v2H9Z" fill="currentColor"/>
										</svg>
									</span>
									<div>
										<p class="text-xs font-black uppercase tracking-wide text-blue-900">Secure card payment</p>
										<p class="mt-1 text-xs text-blue-900/80">Enter your card details in the secure Stripe form below.</p>
									</div>
								</div>
								<div class="flex items-center gap-1 text-[10px] font-black uppercase tracking-wide text-blue-700/80">
									<span class="rounded border border-blue-200 bg-white px-2 py-1">Visa</span>
									<span class="rounded border border-blue-200 bg-white px-2 py-1">MC</span>
									<span class="rounded border border-blue-200 bg-white px-2 py-1">Amex</span>
								</div>
							</div>

							<div class="mt-3 rounded-lg border border-blue-200 bg-white p-3 shadow-sm">
								<div ref="stripeCardMountRef" class="min-h-[32px]" />
							</div>

							<div class="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-blue-200/70 bg-white px-3 py-2">
								<p class="text-[11px] text-blue-900/80">Transactions are encrypted and processed by Stripe.</p>
								<div class="inline-flex items-center gap-1 rounded-md bg-blue-600 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-white">
									<svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" aria-hidden="true">
										<path d="M13.5 2 6 13h5l-1 9 8-12h-5l.5-8Z" fill="currentColor"/>
									</svg>
									<span>Powered by Stripe</span>
								</div>
							</div>
							<p v-if="stripeCardError" class="mt-2 text-xs text-red-700">{{ stripeCardError }}</p>
						</div>

						<div
							v-if="isBankTransferMethod"
							class="mt-4 rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50 p-4"
						>
							<div class="flex items-start justify-between gap-3">
								<div>
									<p class="text-xs font-black uppercase tracking-wide text-teal-900">Bank transfer payment</p>
									<p class="mt-1 text-xs text-teal-900/75">Complete your payment by following the steps below.</p>
								</div>
								<span class="rounded-full border px-2 py-1 text-[10px] font-black uppercase tracking-wide"
									:class="hasCompleteBankDetails ? 'border-teal-300 bg-teal-100 text-teal-700' : 'border-teal-300 bg-teal-50 text-teal-700'"
								>
									{{ hasCompleteBankDetails ? 'Ready' : 'Pending' }}
								</span>
							</div>

							<div class="relative mt-4">
								<div class="pointer-events-none absolute left-3 top-8 bottom-8 w-px bg-teal-200" />
								<ol class="space-y-3">
									<li class="relative pl-10">
										<div class="absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full border border-teal-300 bg-teal-100 text-[11px] font-black text-teal-700">1</div>
										<div class="rounded-lg border border-teal-200 bg-white p-3">
											<p class="text-[10px] font-black uppercase tracking-wide text-teal-700">Use these account details</p>
											<div v-if="!hasCompleteBankDetails" class="mt-2 rounded-md border border-teal-300 bg-teal-50 px-2 py-2 text-xs text-teal-800">
												Bank details are loading. Please wait or try another method.
											</div>
											<div class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
												<div class="rounded-lg border border-teal-200 bg-teal-50/50 p-3">
													<p class="text-[9px] font-black uppercase tracking-widest text-teal-700">Account name</p>
													<p class="mt-2 break-words text-sm font-bold text-deep-navy">{{ bankDetails.account_name || '—' }}</p>
												</div>
												<div class="rounded-lg border border-teal-200 bg-teal-50/50 p-3">
													<p class="text-[9px] font-black uppercase tracking-widest text-teal-700">Sort code</p>
													<p class="mt-2 text-sm font-bold text-deep-navy">{{ bankDetails.sort_code || '—' }}</p>
												</div>
												<div class="rounded-lg border border-teal-200 bg-teal-50/50 p-3">
													<p class="text-[9px] font-black uppercase tracking-widest text-teal-700">Account number</p>
													<p class="mt-2 text-sm font-bold text-deep-navy">{{ bankDetails.account_number || '—' }}</p>
												</div>
											</div>
										</div>
									</li>

									<li class="relative pl-10">
										<div class="absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full border border-teal-300 bg-teal-100 text-[11px] font-black text-teal-700">2</div>
										<div class="rounded-lg border border-teal-200 bg-white p-3">
											<p class="text-[10px] font-black uppercase tracking-wide text-teal-700">Amount to pay</p>
											<p class="mt-2 text-2xl font-black text-deep-navy">{{ order?.total_amount || 'N/A' }}</p>
										</div>
									</li>

									<li class="relative pl-10">
										<div class="absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-black"
											:class="effectiveBankTransferReference ? 'border-teal-300 bg-teal-100 text-teal-700' : 'border-teal-300 bg-teal-100 text-teal-700'"
										>
											3
										</div>
										<div class="rounded-lg border border-teal-200 bg-white p-3">
											<p class="text-[10px] font-black uppercase tracking-wide text-teal-700">Your transfer reference</p>
											<p v-if="reservedBankTransferLoading" class="mt-3 text-xs text-teal-800">🔄 Reserving reference...</p>
											<div v-else-if="reservedBankTransferError" class="mt-3 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-800">
												<p class="font-semibold">⚠️ Unable to reserve reference</p>
												<p class="mt-1">{{ reservedBankTransferError }}</p>
												<button
													type="button"
													class="mt-2 rounded border border-red-300 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-red-700 hover:bg-red-100"
													@click="reserveBankTransferPayment(true)"
												>
													Retry
												</button>
											</div>
											<p v-else-if="effectiveBankTransferReference" class="mt-3 rounded-lg border-2 border-teal-400 bg-teal-50 px-3 py-3 text-sm font-bold text-teal-900 pulse-reference">
												{{ effectiveBankTransferReference }}
											</p>
											<p v-else class="mt-3 text-xs text-teal-700">Your unique reference will appear here once reserved.</p>
											<p v-if="checkoutResult?.bank_transfer_instructions" class="mt-3 rounded-md bg-teal-50 px-2 py-2 text-xs text-teal-800 font-medium">{{ checkoutResult.bank_transfer_instructions }}</p>
										</div>
									</li>
									<li v-if="isBankTransferEvidenceRequiredImmediately" class="relative pl-10">
										<div class="absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-black"
											:class="isBankTransferEvidenceFormReady ? 'border-teal-300 bg-teal-100 text-teal-700' : 'border-teal-300 bg-teal-100 text-teal-700'"
										>
											4
										</div>
										<div class="rounded-lg border border-teal-200 bg-white p-3">
											<p class="text-[10px] font-black uppercase tracking-wide text-teal-700">Upload payment proof (required)</p>
											<p class="mt-1 text-xs text-teal-800">📄 PDF, JPG, JPEG or PNG (max 10MB)</p>
											<div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
												<div class="sm:col-span-2">
													<label class="mb-2 block text-[11px] font-bold uppercase tracking-wide text-teal-700">Payment proof file <span class="text-red-600">*</span></label>
													<div class="relative">
														<input type="file" accept=".pdf,.jpg,.jpeg,.png" class="absolute inset-0 opacity-0 cursor-pointer" @change="onBankTransferEvidenceFileChange">
														<div class="rounded-lg border-2 border-dashed border-teal-300 bg-teal-50 px-4 py-4 text-center hover:bg-teal-100 transition">
															<p class="text-sm font-semibold text-teal-900">{{ bankTransferEvidence.evidence_file?.name || '📎 Choose file or drag & drop' }}</p>
															<p class="mt-1 text-xs text-teal-700">Click to browse or drop file here</p>
														</div>
													</div>
													<p v-if="bankTransferEvidenceErrors.evidence_file" class="mt-2 text-xs font-semibold text-red-600">{{ bankTransferEvidenceErrors.evidence_file }}</p>
												</div>
												<div>
													<label class="mb-2 block text-[11px] font-bold uppercase tracking-wide text-teal-700">Payer name <span class="text-red-600">*</span></label>
													<input v-model="bankTransferEvidence.payer_name" type="text" class="w-full rounded-lg border border-teal-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500" placeholder="Full name">
													<p v-if="bankTransferEvidenceErrors.payer_name" class="mt-1 text-xs font-semibold text-red-600">{{ bankTransferEvidenceErrors.payer_name }}</p>
												</div>
												<div>
													<label class="mb-2 block text-[11px] font-bold uppercase tracking-wide text-teal-700">Last 4 digits <span class="text-red-600">*</span></label>
													<input v-model="bankTransferEvidence.payer_account_last4" type="text" maxlength="4" class="w-full rounded-lg border border-teal-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500" placeholder="1234">
													<p v-if="bankTransferEvidenceErrors.payer_account_last4" class="mt-1 text-xs font-semibold text-red-600">{{ bankTransferEvidenceErrors.payer_account_last4 }}</p>
												</div>
												<div class="sm:col-span-2">
													<label class="mb-2 block text-[11px] font-bold uppercase tracking-wide text-teal-700">Amount transferred <span class="text-red-600">*</span></label>
													<input v-model.number="bankTransferEvidence.amount_on_evidence" type="number" min="0" step="0.01" class="w-full rounded-lg border border-teal-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500" placeholder="0.00">
													<p v-if="bankTransferEvidenceErrors.amount_on_evidence" class="mt-1 text-xs font-semibold text-red-600">{{ bankTransferEvidenceErrors.amount_on_evidence }}</p>
												</div>
											</div>
										</div>

										<div class="mt-3 rounded-lg border border-teal-200 bg-teal-50/50 px-3 py-3 text-xs text-teal-800">
											<p class="font-bold uppercase tracking-wide">📋 Evidence requirement</p>
											<p class="mt-1">
												{{ isBankTransferEvidenceRequiredImmediately
													? 'Please provide proof of payment now to complete your checkout.'
													: 'You can upload payment proof later before order completion.' }}
											</p>
										</div>
									</li>
								</ol>
							</div>

							<div class="mt-3 rounded-lg border border-teal-200 bg-white px-3 py-3 text-xs text-teal-800">
								<p class="font-black uppercase tracking-wide">Evidence policy</p>
								<p class="mt-1">
									{{ isBankTransferEvidenceRequiredImmediately
										? 'This method requires evidence upload during checkout.'
										: 'Evidence can be uploaded later before payment completion.' }}
								</p>
							</div>
						</div>
					</article>

					<article v-if="checkoutResult" class="rounded-2xl border border-deep-navy/10 bg-white p-4">
						<p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/55">Checkout response</p>
						<p class="mt-2 text-sm text-deep-navy/80">Order {{ checkoutResult.order_reference || checkoutResult.order_id }}</p>
						<p class="mt-1 text-sm text-deep-navy/80">Status {{ checkoutResult.status || 'pending' }}</p>

						<div v-if="checkoutResult.stripe_client_secret" class="mt-3 rounded-xl border border-blue-200 bg-blue-50 px-3 py-3 text-xs text-blue-900">
							Stripe payment intent created. Complete the inline card step to finish payment.
						</div>

						<div v-if="checkoutResult.bank_transfer_reference" class="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-xs text-amber-900">
							<p class="font-black">Reference: {{ checkoutResult.bank_transfer_reference }}</p>
							<p class="mt-1">{{ checkoutResult.bank_transfer_instructions || 'Use this reference when making the transfer.' }}</p>
						</div>

						<div v-if="checkoutResult.message" class="mt-3 rounded-xl border border-green-200 bg-green-50 px-3 py-3 text-xs text-green-900">
							{{ checkoutResult.message }}
						</div>
					</article>
				</div>

				<aside class="space-y-3 md:sticky md:top-14 md:self-start lg:col-span-4">
					<article class="rounded-2xl border border-deep-navy/10 bg-white p-4">
						<p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/55">Order summary</p>
						
						<div v-if="checkoutDisplayItems.length > 0" class="mt-4 space-y-3 max-h-56 overflow-y-auto pr-1">
							<div
								v-for="item in checkoutDisplayItems"
								:key="item.id"
								class="flex gap-3 rounded-lg border border-deep-navy/10 bg-mist-blue/40 p-3"
							>
								<img
									:src="item.imageUrl"
									:alt="item.title"
									class="h-16 w-16 rounded-md border border-deep-navy/10 bg-white object-cover flex-shrink-0"
								>
								<div class="min-w-0 flex-1">
									<p class="text-xs font-black text-deep-navy line-clamp-2">{{ item.title }}</p>
									<p class="text-[10px] text-deep-navy/65 line-clamp-1">{{ item.subtitle }}</p>
									<div class="mt-2 flex items-end justify-between gap-2">
										<p class="text-[10px] text-deep-navy/65">Qty <span class="font-bold">{{ item.quantity }}</span></p>
										<p class="text-xs font-bold text-deep-navy">{{ item.totalPrice }}</p>
									</div>
								</div>
							</div>
						</div>

						<div class="mt-4 space-y-3 border-t border-deep-navy/10 pt-4">
							<div class="flex items-center justify-between text-sm">
								<dt class="text-[11px] font-semibold text-deep-navy/70">Subtotal</dt>
								<dd class="font-semibold text-deep-navy">{{ order.total_amount }}</dd>
							</div>
							<div class="flex items-center justify-between text-sm">
								<dt class="text-[11px] font-semibold text-deep-navy/70">Discounts</dt>
								<dd class="font-semibold text-deep-navy/70">£0.00</dd>
							</div>
							<div class="flex items-center justify-between text-sm">
								<dt class="text-[11px] font-semibold text-deep-navy/70">Tax</dt>
								<dd class="font-semibold text-deep-navy/70">£0.00</dd>
							</div>
							<div class="border-t border-deep-navy/10 pt-3 flex items-center justify-between">
								<dt class="text-[11px] font-black uppercase tracking-wide text-deep-navy">Total</dt>
								<dd class="text-lg font-black text-deep-navy">{{ order.total_amount }}</dd>
							</div>
						</div>

						<button
							type="button"
							class="mt-4 w-full rounded-xl bg-deep-navy px-4 py-2 text-xs font-black uppercase tracking-wide text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
							:disabled="!canSubmitCheckout || checkoutMutation.isPending.value || isConfirmingStripePayment"
							@click="submitCheckout"
						>
							{{ ctaLabel }}
						</button>

						<label class="mt-3 flex items-start gap-2 rounded-lg border border-deep-navy/10 bg-mist-blue/30 p-3">
							<input
								v-model="hasAcceptedTerms"
								type="checkbox"
								class="mt-0.5 h-4 w-4 rounded border-deep-navy/30 text-deep-navy focus:ring-deep-navy"
							>
							<span class="text-[11px] text-deep-navy/85">
								I agree to the
								<NuxtLink to="/terms" class="font-semibold text-deep-navy underline underline-offset-2">terms and conditions</NuxtLink>
								and
								<NuxtLink to="/privacy" class="font-semibold text-deep-navy underline underline-offset-2">privacy policy</NuxtLink>.
							</span>
						</label>
						<p v-if="termsValidationError" class="mt-2 text-xs font-semibold text-red-600">{{ termsValidationError }}</p>
					</article>
				</aside>
			</section>
		</div>

		<Transition
			enter-active-class="transition duration-500 ease-out"
			enter-from-class="opacity-0 scale-95"
			enter-to-class="opacity-100 scale-100"
			leave-active-class="transition duration-250 ease-in"
			leave-from-class="opacity-100 scale-100"
			leave-to-class="opacity-0 scale-95"
		>
			<div
				v-if="showSuccessModal"
				class="fixed inset-0 z-50 flex items-center justify-center bg-deep-navy/55 px-4 backdrop-blur-sm"
			>
				<div class="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-green-200 bg-white p-6 shadow-2xl">
					<div class="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-green-100/70 to-transparent" />
					<div class="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-center gap-2 pt-4">
						<span class="h-2 w-2 rounded-full bg-green-400 animate-bounce" />
						<span class="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
						<span class="h-2 w-2 rounded-full bg-amber-400 animate-bounce" />
					</div>

					<div class="mt-6 text-center success-pop">
						<p class="text-[10px] font-black uppercase tracking-[0.22em] text-green-700">Thank you for your order</p>
						<h3 class="mt-2 text-3xl font-black text-deep-navy">{{ successModalTitle }}</h3>
						<p class="mx-auto mt-2 max-w-xl text-sm text-deep-navy/75">{{ successModalMessage }}</p>
					</div>

					<div class="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-center success-fade-in">
						<p class="text-[11px] font-black uppercase tracking-[0.14em] text-green-800">Redirecting automatically</p>
						<p class="mt-1 text-sm font-semibold text-green-900">Back to shop in {{ successModalCountdown }}s</p>
					</div>

					<div class="mt-5 flex flex-wrap justify-center gap-2">
						<button
							type="button"
							class="rounded-xl border border-deep-navy/20 bg-white px-5 py-2 text-xs font-black uppercase tracking-wide text-deep-navy hover:border-deep-navy"
							@click="closeSuccessModal"
						>
							Stay here
						</button>
						<button
							type="button"
							class="rounded-xl bg-deep-navy px-5 py-2 text-xs font-black uppercase tracking-wide text-white hover:bg-blue-700"
							@click="redirectToShopNow"
						>
							Go to Shop now
						</button>
					</div>
				</div>
			</div>
		</Transition>
	</div>
</template>

<script setup lang="ts">
import { loadStripe } from '@stripe/stripe-js'
import type { Stripe, StripeCardElement, StripeElements } from '@stripe/stripe-js'
import type { PaymentMethod } from '~/api/types.gen'
import { useBookingShop } from '~/composables/booking/useBookingShop'
import { useStripeConfig } from '~/composables/resources/common/stripe'
import { useCheckoutProductOrder, useReserveProductOrderBankTransferPayment } from '~/composables/resources/products/productOrders'
import { usePaymentMethods } from '~/composables/resources/payments/paymentMethods'
import { toMultipartFormData } from '~/composables/registration/checkout'

definePageMeta({
	layout: 'booking',
})

const toast = useToast()

const {
	store,
	eventId,
	bookingReference,
	attendees,
	selectedAttendeeId,
	eventUUID,
	eventUrlSafeTitle,
	activeOrderId,
	activeOrderQuery,
} = useBookingShop()

const order = computed(() => activeOrderQuery.data.value?.data || null)
const lockedCheckoutStatuses = new Set(['pending', 'processing', 'completed'])
const isCheckoutLocked = computed(() => lockedCheckoutStatuses.has(String(order.value?.status || '').toLowerCase()))
const itemCount = computed(() => {
	const rows = order.value?.order_items || []
	return rows.reduce((sum, row) => sum + Number(row.quantity || 0), 0)
})

const checkoutDisplayItems = computed(() => {
	const rows = order.value?.order_items || []
	return rows.map((item: any) => {
		const details = item?.product_variant_details || {}
		const color = typeof details?.color === 'string' ? details.color.trim() : ''
		const size = typeof details?.size === 'string' ? details.size.trim() : ''
		const subtitle = [color, size].filter(Boolean).join(' · ') || 'Variant details unavailable'
		const imageUrl = typeof details?.image_url === 'string' && details.image_url
			? details.image_url
			: 'https://placehold.co/120x120?text=Variant'

		return {
			id: item.id,
			title: details?.product_title || `Variant #${item.product_variant || '-'}`,
			subtitle,
			imageUrl,
			quantity: Number(item.quantity || 0),
			unitPrice: item.unit_price,
			totalPrice: item.total_price,
		}
	})
})

const currencyCode = computed(() => 'GBP')

const paymentMethodsQuery = usePaymentMethods(
	computed(() => {
		if (!eventUrlSafeTitle.value) return undefined
		return {
			event: eventUrlSafeTitle.value,
			is_active: true,
			page_size: 20,
		}
	})
)

const paymentMethods = computed<PaymentMethod[]>(() => {
	const rows = paymentMethodsQuery.data.value?.data?.results
	return Array.isArray(rows) ? (rows as PaymentMethod[]) : []
})

const selectedPaymentMethodId = computed({
	get: () => store.selectedPaymentMethodId,
	set: (next: number | null) => store.setSelectedPaymentMethod(next),
})

const selectedPaymentMethod = computed(() => {
	if (!selectedPaymentMethodId.value) return null
	return paymentMethods.value.find((item) => item.id === selectedPaymentMethodId.value) || null
})

const isStripeMethod = computed(() => selectedPaymentMethod.value?.method_type === 'STRIPE')
const isBankTransferMethod = computed(() => selectedPaymentMethod.value?.method_type === 'BANK_TRANSFER')
const isBankTransferEvidenceRequiredImmediately = computed(
	() => isBankTransferMethod.value && !!selectedPaymentMethod.value?.bank_transfer_required_immediately
)

const asTrimmedString = (value: unknown) => String(value ?? '').trim()

const bankTransferEvidence = reactive({
	transfer_id: '',
	evidence_file: null as File | null,
	payer_name: '',
	payer_account_last4: '',
	amount_on_evidence: null as number | null,
})

const bankTransferEvidenceErrors = reactive({
	evidence_file: '',
	payer_name: '',
	payer_account_last4: '',
	amount_on_evidence: '',
})

const clearBankTransferEvidenceErrors = () => {
	bankTransferEvidenceErrors.evidence_file = ''
	bankTransferEvidenceErrors.payer_name = ''
	bankTransferEvidenceErrors.payer_account_last4 = ''
	bankTransferEvidenceErrors.amount_on_evidence = ''
}

const clearBankTransferEvidenceForm = () => {
	bankTransferEvidence.transfer_id = ''
	bankTransferEvidence.evidence_file = null
	bankTransferEvidence.payer_name = ''
	bankTransferEvidence.payer_account_last4 = ''
	bankTransferEvidence.amount_on_evidence = null
	clearBankTransferEvidenceErrors()
}

const onBankTransferEvidenceFileChange = (event: Event) => {
	const input = event.target as HTMLInputElement
	bankTransferEvidence.evidence_file = input.files?.[0] || null
	bankTransferEvidenceErrors.evidence_file = ''
}

const isBankTransferEvidenceFormReady = computed(() => {
	if (!isBankTransferEvidenceRequiredImmediately.value) return true
	if (!bankTransferEvidence.evidence_file) return false
	if (!asTrimmedString(bankTransferEvidence.payer_name)) return false
	if (bankTransferEvidence.payer_account_last4 && !/^\d{4}$/.test(bankTransferEvidence.payer_account_last4)) return false
	if (bankTransferEvidence.amount_on_evidence === null || Number(bankTransferEvidence.amount_on_evidence) <= 0) return false
	return true
})

const validateBankTransferEvidenceForm = () => {
	clearBankTransferEvidenceErrors()
	if (!isBankTransferEvidenceRequiredImmediately.value) return true

	let valid = true
	if (!bankTransferEvidence.evidence_file) {
		bankTransferEvidenceErrors.evidence_file = 'Evidence file is required.'
		valid = false
	}
	if (!asTrimmedString(bankTransferEvidence.payer_name)) {
		bankTransferEvidenceErrors.payer_name = 'Payer name is required.'
		valid = false
	}
	if (bankTransferEvidence.amount_on_evidence === null || Number(bankTransferEvidence.amount_on_evidence) <= 0) {
		bankTransferEvidenceErrors.amount_on_evidence = 'Amount on evidence must be greater than zero.'
		valid = false
	}
	if (bankTransferEvidence.payer_account_last4 && !/^\d{4}$/.test(bankTransferEvidence.payer_account_last4)) {
		bankTransferEvidenceErrors.payer_account_last4 = 'Use exactly 4 digits.'
		valid = false
	}

	return valid
}





const bankDetails = computed(() => {
	const details = selectedPaymentMethod.value?.provided_details as Record<string, unknown> | undefined
	return {
		account_name: typeof details?.account_name === 'string' ? details.account_name : '',
		sort_code: typeof details?.sort_code === 'string' ? details.sort_code : '',
		account_number: typeof details?.account_number === 'string' ? details.account_number : '',
	}
})

watch(
	paymentMethods,
	(rows) => {
		if (!rows.length) {
			store.setSelectedPaymentMethod(null)
			return
		}

		if (!store.selectedPaymentMethodId || !rows.find((item) => item.id === store.selectedPaymentMethodId)) {
			store.setSelectedPaymentMethod(rows[0].id)
		}
	},
	{ immediate: true }
)



const checkoutMutation = useCheckoutProductOrder()
const reserveBankTransferMutation = useReserveProductOrderBankTransferPayment()
const checkoutResult = ref<Record<string, any> | null>(null)
const stripeConfigQuery = useStripeConfig()
const reservedBankTransferPaymentId = ref('')
const reservedBankTransferReference = ref('')
const reservedBankTransferLoading = ref(false)
const reservedBankTransferError = ref('')

const stripeCardMountRef = ref<HTMLElement | null>(null)
const stripeInstance = ref<Stripe | null>(null)
const stripeElements = ref<StripeElements | null>(null)
const stripeCardElement = ref<StripeCardElement | null>(null)
const stripeCardReady = ref(false)
const stripeCardError = ref('')
const isConfirmingStripePayment = ref(false)
const shouldPreventLockedRedirect = ref(false)
const hasAcceptedTerms = ref(false)
const termsValidationError = ref('')
const showSuccessModal = ref(false)
const successRedirectSeconds = 10
const successModalCountdown = ref(successRedirectSeconds)
const successModalTitle = ref('Payment successful')
const successModalMessage = ref('Your purchase has been confirmed.')
let successRedirectTimer: ReturnType<typeof setTimeout> | null = null
let successCountdownTimer: ReturnType<typeof setInterval> | null = null

const clearReservedBankTransferPayment = () => {
	reservedBankTransferPaymentId.value = ''
	reservedBankTransferReference.value = ''
	reservedBankTransferError.value = ''
	reservedBankTransferLoading.value = false
}

watch(
	() => selectedPaymentMethodId.value,
	() => {
		if (!isBankTransferMethod.value) {
			clearReservedBankTransferPayment()
		}
		if (!isBankTransferEvidenceRequiredImmediately.value) {
			clearBankTransferEvidenceForm()
		} else {
			clearBankTransferEvidenceErrors()
		}
	}
)

watch(
	[() => isBankTransferMethod.value, () => activeOrderId.value, () => selectedPaymentMethodId.value],
	([bankSelected, orderId, methodId]) => {
		if (!bankSelected || !orderId || !methodId) {
			clearReservedBankTransferPayment()
			return
		}
		void reserveBankTransferPayment(false)
	},
	{ immediate: true }
)

const canSubmitCheckout = computed(() => {
	if (isCheckoutLocked.value) return false
	if (!hasAcceptedTerms.value) return false
	const baseReady = !!activeOrderId.value && !!selectedPaymentMethodId.value && itemCount.value > 0
	if (!baseReady) return false
	if (isStripeMethod.value) return stripeCardReady.value
	if (isBankTransferMethod.value) {
		if (reservedBankTransferLoading.value || !reservedBankTransferPaymentId.value || !effectiveBankTransferReference.value) {
			return false
		}
		if (isBankTransferEvidenceRequiredImmediately.value) return isBankTransferEvidenceFormReady.value
	}
	return true
})

const ctaLabel = computed(() => {
	if (checkoutMutation.isPending.value) return 'Initializing payment...'
	if (isConfirmingStripePayment.value) return 'Confirming card payment...'
	if (isStripeMethod.value) return 'Pay now'
	return 'Checkout now'
})

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const isPurchaseSuccessfulStatus = (status: string) => {
	return status === 'processing' || status === 'completed'
}

const effectiveBankTransferReference = computed(() => {
	const checkoutRef = asTrimmedString(checkoutResult.value?.bank_transfer_reference)
	if (checkoutRef) return checkoutRef
	return asTrimmedString(reservedBankTransferReference.value)
})



const reserveBankTransferPayment = async (force: boolean = false) => {
	if (!isBankTransferMethod.value || !activeOrderId.value || !selectedPaymentMethodId.value) {
		clearReservedBankTransferPayment()
		return
	}

	if (!force && reservedBankTransferPaymentId.value && reservedBankTransferReference.value) {
		return
	}

	reservedBankTransferLoading.value = true
	reservedBankTransferError.value = ''
	try {
		const response = await reserveBankTransferMutation.mutateAsync({
			orderId: activeOrderId.value,
			body: {
				payment_method_id: selectedPaymentMethodId.value,
			},
		})
		const payload = (response as { data?: Record<string, unknown> }).data || {}
		reservedBankTransferPaymentId.value = asTrimmedString(payload.payment_id)
		reservedBankTransferReference.value = asTrimmedString(payload.bank_transfer_reference)

		if (!reservedBankTransferPaymentId.value || !reservedBankTransferReference.value) {
			reservedBankTransferError.value = 'Could not reserve a bank transfer reference for this order.'
		}
	} catch (error: unknown) {
		const payload = (error as any)?.data || (error as any)?.response?._data || (error as any)?.response?.data
		let message = error instanceof Error ? error.message : 'Could not reserve bank transfer reference.'
		if (typeof payload === 'string' && payload) {
			message = payload
		} else if (payload && typeof payload === 'object') {
			const first = Object.values(payload)[0] as any
			if (Array.isArray(first) && first[0]) message = String(first[0])
			else if (typeof first === 'string') message = first
		}
		reservedBankTransferError.value = message
		reservedBankTransferPaymentId.value = ''
		reservedBankTransferReference.value = ''
	} finally {
		reservedBankTransferLoading.value = false
	}
}

const openSuccessModal = (title: string, message: string) => {
	successModalTitle.value = title
	successModalMessage.value = message
	showSuccessModal.value = true
}

const clearSuccessModalTimers = () => {
	if (successRedirectTimer) {
		clearTimeout(successRedirectTimer)
		successRedirectTimer = null
	}
	if (successCountdownTimer) {
		clearInterval(successCountdownTimer)
		successCountdownTimer = null
	}
}

const startSuccessModalRedirect = () => {
	clearSuccessModalTimers()
	successModalCountdown.value = successRedirectSeconds
	successCountdownTimer = setInterval(() => {
		successModalCountdown.value = Math.max(0, successModalCountdown.value - 1)
	}, 1000)
	successRedirectTimer = setTimeout(() => {
		showSuccessModal.value = false
		void navigateTo(shopHref.value)
	}, successRedirectSeconds * 1000)
}

const closeSuccessModal = () => {
	showSuccessModal.value = false
	clearSuccessModalTimers()
}

const redirectToShopNow = () => {
	clearSuccessModalTimers()
	showSuccessModal.value = false
	void navigateTo(shopHref.value)
}

const waitForOrderStatusAfterStripePayment = async () => {
	const maxAttempts = 8
	for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
		await activeOrderQuery.refetch()
		const latestStatus = String(activeOrderQuery.data.value?.data?.status || '').toLowerCase()
		if (latestStatus && latestStatus !== 'pending') return latestStatus
		if (attempt < maxAttempts - 1) {
			await sleep(1200)
		}
	}

	return String(activeOrderQuery.data.value?.data?.status || '').toLowerCase()
}

const shopHref = computed(() => `/events/${eventId.value}/b/${bookingReference.value}/shop`)
const cartHref = computed(() => `/events/${eventId.value}/b/${bookingReference.value}/shop/cart`)
const bookingWorkspaceHref = computed(() => `/events/${eventId.value}/b/${bookingReference.value}`)

const selectedAttendeeLabel = computed(() => {
	const attendee = attendees.value.find((item) => item.id === selectedAttendeeId.value)
	if (!attendee) return 'selected attendee'
	return attendee.name || attendee.display_id || 'selected attendee'
})

watch(
	isCheckoutLocked,
	(locked) => {
		if (!locked || shouldPreventLockedRedirect.value) return
		void navigateTo(cartHref.value)
	},
	{ immediate: true }
)

watch(
	showSuccessModal,
	(visible) => {
		if (visible) {
			startSuccessModalRedirect()
			return
		}
		clearSuccessModalTimers()
	}
)

watch(
	hasAcceptedTerms,
	(accepted) => {
		if (accepted) {
			termsValidationError.value = ''
		}
	}
)

const hasCompleteBankDetails = computed(() => {
	return Boolean(
		asTrimmedString(bankDetails.value.account_name) &&
		asTrimmedString(bankDetails.value.sort_code) &&
		asTrimmedString(bankDetails.value.account_number)
	)
})

const stripePublishableKey = computed(() => {
	return String(stripeConfigQuery.data.value?.data?.publishable_key || '').trim()
})

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
	if (!isStripeMethod.value) return
	if (stripeCardElement.value) return

	const key = stripePublishableKey.value
	if (!key) {
		stripeCardError.value = 'Stripe is not configured yet for this event.'
		return
	}

	await nextTick()
	if (!stripeCardMountRef.value) return

	const stripe = await loadStripe(key)
	if (!stripe) {
		stripeCardError.value = 'Unable to initialize Stripe card form.'
		return
	}

	stripeInstance.value = stripe
	stripeElements.value = stripe.elements()
	stripeCardElement.value = stripeElements.value.create('card', { hidePostalCode: true })
	stripeCardElement.value.mount(stripeCardMountRef.value)
	stripeCardElement.value.on('change', (event) => {
		stripeCardError.value = event.error?.message || ''
		stripeCardReady.value = !!event.complete && !event.error
	})
}

watch(
	[isStripeMethod, stripePublishableKey],
	([stripeSelected, key], [wasStripeSelected, previousKey]) => {
		if (!stripeSelected) {
			teardownStripeElements()
			return
		}

		if (!wasStripeSelected || key !== previousKey) {
			teardownStripeElements()
		}

		void ensureStripeCardMounted()
	},
	{ immediate: true }
)

onBeforeUnmount(() => {
	clearSuccessModalTimers()
	teardownStripeElements()
})

async function submitCheckout() {
	if (!canSubmitCheckout.value || !activeOrderId.value || !selectedPaymentMethodId.value) return
	if (isStripeMethod.value) {
		await ensureStripeCardMounted()
		if (!stripeCardElement.value || !stripeInstance.value) {
			toast.add({
				title: 'Stripe unavailable',
				description: stripeCardError.value || 'Card form could not be initialized.',
				color: 'red',
				timeout: 4500,
			})
			return
		}
	}

	try {
		if (!hasAcceptedTerms.value) {
			termsValidationError.value = 'You must accept the terms and conditions before checkout.'
			toast.add({
				title: 'Terms required',
				description: 'Please accept the terms and conditions to continue.',
				color: 'amber',
				timeout: 3500,
			})
			return
		}

		if (!validateBankTransferEvidenceForm()) {
			toast.add({
				title: 'Missing transfer evidence',
				description: 'Add required bank transfer evidence before submitting checkout.',
				color: 'red',
				timeout: 4500,
			})
			return
		}

		let checkoutToastTitle = 'Checkout submitted'
		let checkoutToastDescription = isStripeMethod.value
			? 'Payment has been initialized and card confirmation was attempted.'
			: 'Payment has been initialized for this order.'
		let checkoutToastColor: 'green' | 'amber' = 'green'
		shouldPreventLockedRedirect.value = true

		const response = await checkoutMutation.mutateAsync({
			orderId: activeOrderId.value,
			body: isBankTransferEvidenceRequiredImmediately.value
				? toMultipartFormData({
					payment_method_id: selectedPaymentMethodId.value,
					payment_id: isBankTransferMethod.value ? reservedBankTransferPaymentId.value : undefined,
					bank_transfer_evidence: {
						evidence_file: bankTransferEvidence.evidence_file as File,
						payer_name: asTrimmedString(bankTransferEvidence.payer_name),
						payer_account_last4: asTrimmedString(bankTransferEvidence.payer_account_last4),
						amount_on_evidence: Number(bankTransferEvidence.amount_on_evidence),
					},
				})
				: {
					payment_method_id: selectedPaymentMethodId.value,
					payment_id: isBankTransferMethod.value ? reservedBankTransferPaymentId.value : undefined,
				},
		})

		checkoutResult.value = ((response as { data?: Record<string, any> }).data || null) as Record<string, any> | null

		if (isStripeMethod.value) {
			const clientSecret = checkoutResult.value?.stripe_client_secret
			if (!clientSecret) {
				const backendStatus = String(checkoutResult.value?.status || 'unknown')
				const selectedTitle = selectedPaymentMethod.value?.title || 'Selected method'
				toast.add({
					title: 'Unable to start card payment',
					description: `${selectedTitle} returned status "${backendStatus}" without Stripe client secret. Verify this method is configured as STRIPE and try again.`,
					color: 'red',
					timeout: 5000,
				})
				return
			}

			await ensureStripeCardMounted()
			if (!stripeInstance.value || !stripeCardElement.value) {
				toast.add({
					title: 'Card form unavailable',
					description: stripeCardError.value || 'Unable to initialize the Stripe card form. Please refresh and try again.',
					color: 'red',
					timeout: 5000,
				})
				return
			}

			isConfirmingStripePayment.value = true
			const result = await stripeInstance.value.confirmCardPayment(clientSecret, {
				payment_method: {
					card: stripeCardElement.value,
				},
			})
			isConfirmingStripePayment.value = false

			if (result.error) {
				stripeCardError.value = result.error.message || 'Card payment could not be confirmed.'
				toast.add({
					title: 'Card payment failed',
					description: stripeCardError.value,
					color: 'red',
					timeout: 4500,
				})
				return
			}

			const statusValue = result.paymentIntent?.status || 'processing'

			const orderStatus = await waitForOrderStatusAfterStripePayment()
			if (isPurchaseSuccessfulStatus(orderStatus)) {
				checkoutToastTitle = 'Order payment recorded'
				checkoutToastDescription = 'Your order moved to processing after Stripe confirmation.'
				checkoutToastColor = 'green'
				openSuccessModal(
					'Payment received',
					'Thank you. Your card payment has been confirmed and your order is now being processed.'
				)
			} else {
				checkoutToastTitle = 'Payment confirmed, awaiting sync'
				checkoutToastDescription = 'Stripe confirmed your payment. Order status update may take a few seconds.'
				checkoutToastColor = 'amber'
			}
		} else {
			// For bank transfer, give server a moment to process then refetch
			await sleep(500)
			await activeOrderQuery.refetch()
			const orderStatus = String(activeOrderQuery.data.value?.data?.status || '').toLowerCase()
			if (isPurchaseSuccessfulStatus(orderStatus)) {
				openSuccessModal(
					'Order confirmed',
					'Thank you. Your checkout was successful and your order has been recorded.'
				)
			} else {
				// Show success modal anyway after checkout submission for bank transfer
				openSuccessModal(
					'Order submitted',
					'Your order has been submitted. We\'ll confirm once we receive your bank transfer.'
				)
			}
		}

		if (checkoutToastColor !== 'green') {
			toast.add({
				title: checkoutToastTitle,
				description: checkoutToastDescription,
				color: checkoutToastColor,
				timeout: 2800,
			})
		}
	} catch (error: unknown) {
		isConfirmingStripePayment.value = false
		shouldPreventLockedRedirect.value = false
		const payload = (error as any)?.data || (error as any)?.response?._data || (error as any)?.response?.data
		let description = error instanceof Error ? error.message : 'Unable to complete checkout.'
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
		toast.add({
			title: 'Checkout failed',
			description,
			color: 'red',
			timeout: 4500,
		})
	}
}
</script>

<style scoped>
.success-pop {
	animation: successPop 420ms ease-out;
}

.success-fade-in {
	animation: successFadeIn 520ms ease-out;
}

@keyframes successPop {
	0% {
		opacity: 0;
		transform: translateY(10px) scale(0.98);
	}
	100% {
		opacity: 1;
		transform: translateY(0) scale(1);
	}
}

@keyframes successFadeIn {
	0% {
		opacity: 0;
		transform: translateY(8px);
	}
	100% {
		opacity: 1;
		transform: translateY(0);
	}
}

@keyframes pulse {
	0%, 100% {
		box-shadow: 0 0 0 0 rgba(13, 148, 136, 0.7);
	}
	50% {
		box-shadow: 0 0 0 10px rgba(13, 148, 136, 0);
	}
}

.pulse-reference {
	animation: pulse 2s infinite;
}
</style>