<template>
	<CommunitiesManagementLayout :organisation-id="organisationId" :organisation="organisation">
		<!-- <div class="space-y-10"> -->
			<div class="bg-gradient-to-br from-white via-slate-50 to-sky-50 border-2 border-deep-navy rounded-2xl shadow-drawn p-8 space-y-8">
				<div class="flex flex-col gap-4">
					<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
						<div>
							<p class="text-[10px] font-black text-deep-navy/60 uppercase tracking-[0.3em]">Community Sponsorships</p>
							<h1 class="text-3xl md:text-4xl font-black text-deep-navy uppercase tracking-tight">Inbound + Outbound Momentum</h1>
							<p class="mt-2 text-sm text-deep-navy/60 font-medium max-w-2xl">
								Track who sponsors your events, what you sponsor elsewhere, and move from selection to checkout in three clear steps.
							</p>
						</div>
						<div class="flex items-center gap-3">
							<div class="px-4 py-3 rounded-xl border-2 border-deep-navy/20 bg-white/80">
								<p class="text-[10px] font-black uppercase tracking-wider text-deep-navy/50">Net Revenue Delta</p>
								<p class="mt-1 text-lg font-black text-deep-navy">{{ formatMoney(String(netCompletedRevenueDelta), 'GBP') }}</p>
							</div>
							<div class="px-4 py-3 rounded-xl border-2 border-deep-navy/20 bg-white/80">
								<p class="text-[10px] font-black uppercase tracking-wider text-deep-navy/50">Net Sponsors</p>
								<p class="mt-1 text-lg font-black text-deep-navy">{{ netSponsorDelta }}</p>
							</div>
						</div>
					</div>

						<div class="grid grid-cols-3 gap-2 bg-deep-navy/5 rounded-xl p-2 border-2 border-deep-navy/10">
							<button
								type="button"
								@click="transitionTab('overview')"
								:class="activeTab === 'overview' ? 'bg-deep-navy text-white' : 'text-deep-navy hover:bg-deep-navy/10'"
								class="px-4 py-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all"
							>
								Overview
							</button>
							<button
								type="button"
								@click="transitionTab('flow')"
								:class="activeTab === 'flow' ? 'bg-deep-navy text-white' : 'text-deep-navy hover:bg-deep-navy/10'"
								class="px-4 py-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all"
							>
								Sponsor Flow
							</button>
							<button
								type="button"
								@click="transitionTab('invites')"
								:class="activeTab === 'invites' ? 'bg-deep-navy text-white' : 'text-deep-navy hover:bg-deep-navy/10'"
								class="px-4 py-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all"
							>
								Invite Responses
							</button>
						</div>

					<div v-if="activeTab === 'overview'" class="space-y-6">
						<div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
						<div class="p-5 rounded-2xl border-2 border-deep-navy/10 bg-white/80">
							<p class="text-[10px] font-black uppercase tracking-wider text-deep-navy/50">Inbound Sponsors</p>
							<p class="mt-2 text-2xl font-black text-deep-navy">{{ inboundSummary.total_sponsors }}</p>
							<p class="text-xs text-deep-navy/60 font-bold uppercase tracking-wider">Completed {{ formatMoney(String(inboundSummary.completed_revenue), 'GBP') }}</p>
						</div>
						<div class="p-5 rounded-2xl border-2 border-deep-navy/10 bg-white/80">
							<p class="text-[10px] font-black uppercase tracking-wider text-deep-navy/50">Outbound Sponsors</p>
							<p class="mt-2 text-2xl font-black text-deep-navy">{{ outboundSummary.total_sponsors }}</p>
							<p class="text-xs text-deep-navy/60 font-bold uppercase tracking-wider">Committed {{ formatMoney(String(outboundSummary.commitment_amount), 'GBP') }}</p>
						</div>
						<div class="p-5 rounded-2xl border-2 border-deep-navy/10 bg-white/80">
							<p class="text-[10px] font-black uppercase tracking-wider text-deep-navy/50">Average Completed / Sponsor</p>
							<p class="mt-2 text-2xl font-black text-deep-navy">{{ formatMoney(String(inboundSummary.average_completed_revenue_per_sponsor), 'GBP') }}</p>
							<p class="text-xs text-deep-navy/60 font-bold uppercase tracking-wider">Outbound {{ formatMoney(String(outboundSummary.average_completed_revenue_per_sponsor), 'GBP') }}</p>
						</div>
					</div>

					<div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
						<div class="p-5 rounded-2xl border-2 border-deep-navy/10 bg-white/80">
							<p class="text-[10px] font-black uppercase tracking-wider text-deep-navy/50">Top Inbound Sponsors</p>
							<div v-if="isLoadingSponsorFlow" class="mt-4 space-y-2">
								<USkeleton class="h-6 w-full" />
								<USkeleton class="h-6 w-5/6" />
							</div>
							<div v-else class="mt-4 h-[220px]">
								<PieChart
									:height="'220px'"
									:data="inboundSponsorChart"
									:donut="true"
									:show-legend="false"
								/>
							</div>
						</div>
						<div class="p-5 rounded-2xl border-2 border-deep-navy/10 bg-white/80">
							<p class="text-[10px] font-black uppercase tracking-wider text-deep-navy/50">Inbound Sponsors by Event</p>
							<div v-if="isLoadingSponsorFlow" class="mt-4 space-y-2">
								<USkeleton class="h-6 w-full" />
								<USkeleton class="h-6 w-5/6" />
							</div>
							<div v-else class="mt-4 h-[220px]">
								<BarChart
									:height="'220px'"
									:data="inboundEventChart"
									:color="'#0f766e'"
								/>
							</div>
						</div>
						<div class="p-5 rounded-2xl border-2 border-deep-navy/10 bg-white/80">
							<p class="text-[10px] font-black uppercase tracking-wider text-deep-navy/50">Outbound Sponsors by Event</p>
							<div v-if="isLoadingSponsorFlow" class="mt-4 space-y-2">
								<USkeleton class="h-6 w-full" />
								<USkeleton class="h-6 w-5/6" />
							</div>
							<div v-else class="mt-4 h-[220px]">
								<BarChart
									:height="'220px'"
									:data="outboundEventChart"
									:color="'#1d4ed8'"
								/>
							</div>
						</div>
					</div>
				</div>

				<div v-if="activeTab === 'overview'" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<div class="border-2 border-deep-navy/10 rounded-2xl p-6 space-y-5 bg-white">
						<div class="flex items-center justify-between">
							<div>
								<p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/50">Inbound</p>
								<h2 class="text-xl font-black text-deep-navy uppercase tracking-tight">Sponsors Funding Your Events</h2>
							</div>
							<span class="text-xs font-black uppercase tracking-wider text-deep-navy/40">{{ inboundCount }} results</span>
						</div>

						<div class="flex flex-col md:flex-row gap-3">
							<input
								v-model="ledgerSearch"
								type="text"
								placeholder="Search sponsor, event, or package"
								class="flex-1 px-4 py-3 rounded-xl border-2 border-deep-navy/20 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
							/>
							<button
								type="button"
								@click="ledgerUseSelectedEvent = !ledgerUseSelectedEvent"
								:class="ledgerUseSelectedEvent ? 'bg-deep-navy text-white' : 'border-2 border-deep-navy/30 text-deep-navy'"
								class="px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition"
							>
								{{ ledgerUseSelectedEvent ? 'Selected Event' : 'All Events' }}
							</button>
						</div>

						<div v-if="isLoadingInbound" class="space-y-3">
							<USkeleton class="h-20 w-full" />
							<USkeleton class="h-20 w-full" />
						</div>
						<div v-else-if="inboundSponsors.length === 0" class="text-center py-10 bg-deep-navy/5 border-2 border-dashed border-deep-navy/20 rounded-xl">
							<p class="text-sm font-bold text-deep-navy/60">No inbound sponsors match this view yet.</p>
						</div>
						<div v-else class="space-y-3">
							<div
								v-for="row in inboundSponsors"
								:key="row.sponsor_id"
								class="p-4 border-2 border-deep-navy/10 rounded-xl"
							>
								<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
									<div>
										<p class="text-xs font-black uppercase tracking-wider text-deep-navy/40">{{ row.event_title }}</p>
										<p class="text-base font-black text-deep-navy uppercase tracking-tight">{{ row.organisation_title }}</p>
										<p class="text-[10px] text-deep-navy/55 font-bold uppercase tracking-wider mt-1">
											{{ row.package_name || 'No package' }} • {{ formatDateSafe(row.added_at) }}
										</p>
									</div>
									<div class="flex items-center gap-2">
										<span class="px-3 py-1 rounded-full bg-blue-500/10 text-blue-700 text-[10px] font-black uppercase tracking-wider">
											{{ row.payment?.payment_reference ? row.payment.payment_reference.slice(0, 20).concat('...') : 'Awaiting payment' }}
										</span>
										<span class="text-xs font-black text-deep-navy uppercase tracking-wider">
											{{ row.payment?.base_amount ? formatMoney(row.payment.base_amount, 'GBP') : 'Pending' }}
										</span>
									</div>
								</div>
							</div>
						</div>

						<div class="pt-3 flex items-center justify-between">
							<p class="text-[10px] font-black uppercase tracking-wider text-deep-navy/40">Page {{ inboundPage }}</p>
							<UPagination v-model="inboundPage" :total="inboundCount" :page-count="ledgerPageSize" :max="5" />
						</div>
					</div>

					<div class="border-2 border-deep-navy/10 rounded-2xl p-6 space-y-5 bg-white">
						<div class="flex items-center justify-between">
							<div>
								<p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/50">Outbound</p>
								<h2 class="text-xl font-black text-deep-navy uppercase tracking-tight">Events You Sponsor</h2>
							</div>
							<span class="text-xs font-black uppercase tracking-wider text-deep-navy/40">{{ outboundCount }} results</span>
						</div>

						<div class="flex flex-col md:flex-row gap-3">
							<input
								v-model="ledgerSearch"
								type="text"
								placeholder="Search event or package"
								class="flex-1 px-4 py-3 rounded-xl border-2 border-deep-navy/20 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
							/>
							<button
								type="button"
								@click="ledgerUseSelectedEvent = !ledgerUseSelectedEvent"
								:class="ledgerUseSelectedEvent ? 'bg-deep-navy text-white' : 'border-2 border-deep-navy/30 text-deep-navy'"
								class="px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition"
							>
								{{ ledgerUseSelectedEvent ? 'Selected Event' : 'All Events' }}
							</button>
						</div>

						<div v-if="isLoadingOutbound" class="space-y-3">
							<USkeleton class="h-20 w-full" />
							<USkeleton class="h-20 w-full" />
						</div>
						<div v-else-if="outboundSponsors.length === 0" class="text-center py-10 bg-deep-navy/5 border-2 border-dashed border-deep-navy/20 rounded-xl">
							<p class="text-sm font-bold text-deep-navy/60">No outbound sponsorships match this view yet.</p>
						</div>
						<div v-else class="space-y-3">
							<div
								v-for="row in outboundSponsors"
								:key="row.sponsor_id"
								class="p-4 border-2 border-deep-navy/10 rounded-xl"
							>
								<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
									<div>
										<p class="text-xs font-black uppercase tracking-wider text-deep-navy/40">Sponsoring as {{ row.name }}</p>
										<p class="text-base font-black text-deep-navy uppercase tracking-tight">{{ row.event_title }}</p>
										<p class="text-[10px] text-deep-navy/55 font-bold uppercase tracking-wider mt-1">
											{{ row.package_name || 'No package' }} • {{ formatDateSafe(row.added_at) }}
										</p>
									</div>
									<div class="flex items-center gap-2">
										<span class="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 text-[10px] font-black uppercase tracking-wider">
											{{ row.payment?.payment_reference ? row.payment.payment_reference.slice(0,15).concat('...') : 'Awaiting payment' }}
										</span>
										<span class="text-xs font-black text-deep-navy uppercase tracking-wider">
											{{ row.payment?.base_amount ? formatMoney(row.payment.base_amount, 'GBP') : 'Pending' }}
										</span>
									</div>
								</div>
							</div>
						</div>

						<div class="pt-3 flex items-center justify-between">
							<p class="text-[10px] font-black uppercase tracking-wider text-deep-navy/40">Page {{ outboundPage }}</p>
							<UPagination v-model="outboundPage" :total="outboundCount" :page-count="ledgerPageSize" :max="5" />
						</div>
					</div>
				</div>

				<div v-else-if="activeTab === 'flow'" class="space-y-6">
					<div class="border-2 border-deep-navy/10 rounded-2xl p-8 space-y-6 bg-white">
					<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
						<div>
							<p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/50">Sponsor Flow</p>
							<h2 class="text-2xl font-black text-deep-navy uppercase tracking-tight">Sponsor An Event</h2>
							<p class="text-sm text-deep-navy/60 font-medium">Select the event, pick a package and payment method, then confirm checkout.</p>
						</div>
						<div class="flex items-center gap-2">
							<button
								type="button"
								class="px-4 py-2 rounded-xl border-2 border-deep-navy text-deep-navy text-xs font-black uppercase tracking-wider"
								@click="activeStep = Math.max(1, activeStep - 1)"
								:disabled="activeStep === 1"
							>
								Back
							</button>
							<button
								type="button"
								:class="{'px-4 py-2 rounded-xl bg-green-500 text-white text-xs font-black uppercase tracking-wider': canGoNextStep(), 'px-4 py-2 rounded-xl bg-gray-300 text-gray-500 text-xs font-black uppercase tracking-wider': !canGoNextStep()}"
								@click="goNextStep"
								:disabled="!canGoNextStep()"
							>
								Next
							</button>
						</div>
					</div>

					<div class="grid grid-cols-3 gap-3">
						<div
							v-for="step in steps"
							:key="step.id"
							class="flex items-center gap-3 p-3 rounded-xl border-2"
							:class="activeStep >= step.id ? 'border-deep-navy bg-deep-navy text-white' : 'border-deep-navy/20 text-deep-navy'"
						>
							<div class="h-8 w-8 rounded-full flex items-center justify-center text-xs font-black uppercase tracking-wider"
								:class="activeStep >= step.id ? 'bg-white/20 text-white' : 'bg-deep-navy/5 text-deep-navy'"
							>
								{{ step.id }}
							</div>
							<div>
								<p class="text-xs font-black uppercase tracking-wider">{{ step.label }}</p>
								<p class="text-[10px] uppercase tracking-wider opacity-80">{{ step.hint }}</p>
							</div>
						</div>
					</div>

					<div v-if="activeStep === 1" class="space-y-4">
						<div class="flex flex-col md:flex-row gap-3">
							<div class="flex-1">
								<label class="block text-[10px] font-black text-deep-navy/50 mb-2 uppercase tracking-[0.2em]">Search Events</label>
								<input
									v-model="eventSearch"
									type="text"
									placeholder="Search by title, code, or description"
									class="w-full px-4 py-3 bg-white border-2 border-deep-navy rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
								/>
							</div>
							<div class="flex flex-col justify-end">
								<button
									type="button"
									class="px-4 py-3 rounded-xl border-2 border-deep-navy/30 text-deep-navy text-xs font-black uppercase tracking-wider"
									@click="selectFirstEvent"
								>
									Auto Select
								</button>
							</div>
						</div>

						<div v-if="isLoadingSponsorableEvents" class="grid grid-cols-1 md:grid-cols-2 gap-3">
							<USkeleton class="h-20 w-full" />
							<USkeleton class="h-20 w-full" />
						</div>
						<div v-else-if="sponsorableEvents.length === 0" class="text-center py-8 bg-deep-navy/5 border-2 border-dashed border-deep-navy/20 rounded-xl">
							<p class="text-sm font-bold text-deep-navy/60">No sponsorable events found for your current filters.</p>
						</div>
						<div v-else class="space-y-3">
							<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
								<button
									v-for="event in sponsorableEvents"
									:key="event.event_id"
									type="button"
									@click="selectEvent(event)"
									class="text-left p-4 border-2 rounded-xl transition-all"
									:class="selectedEventId === event.event_id
										? 'border-deep-navy bg-deep-navy text-white'
										: 'border-deep-navy/20 bg-white text-deep-navy hover:border-deep-navy/40'"
								>
									<p class="text-sm font-black uppercase tracking-tight">{{ event.title }}</p>
									<p class="mt-1 text-xs font-bold uppercase tracking-wider opacity-80">{{ formatDateSafe(event.start_datetime) }}</p>
									<p class="mt-1 text-xs font-bold uppercase tracking-wider opacity-80">{{ event.active_sponsorship_packages_count }} active packages</p>
								</button>
							</div>

							<div class="flex items-center justify-between pt-2">
								<p class="text-xs font-bold text-deep-navy/55 uppercase tracking-wider">
									Page {{ eventPage }} • {{ sponsorableEventsCount }} results
								</p>
								<div class="flex items-center gap-2">
									<button
										type="button"
										@click="eventPage = Math.max(1, eventPage - 1)"
										:disabled="!hasPrevEventsPage"
										class="px-3 py-2 border-2 border-deep-navy/30 rounded-lg text-[10px] font-black text-primary uppercase tracking-wider disabled:opacity-40"
									>
										Prev
									</button>
									<button
										type="button"
										@click="eventPage = eventPage + 1"
										:disabled="!hasNextEventsPage"
										class="px-3 py-2 border-2 border-deep-navy/30 rounded-lg text-[10px] font-black text-primary uppercase tracking-wider disabled:opacity-40"
									>
										Next
									</button>
								</div>
							</div>
						</div>
					</div>

					<div v-else-if="activeStep === 2" class="space-y-4">
						<div v-if="checkoutBlockMessage" class="p-4 rounded-xl border-2 border-amber-500/40 bg-amber-500/10">
							<p class="text-xs font-bold text-deep-navy uppercase tracking-wider">{{ checkoutBlockMessage }}</p>
						</div>

						<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label class="block text-[10px] font-black text-deep-navy/50 mb-3 uppercase tracking-[0.2em]">
									Checkout Mode
								</label>
								<div class="grid grid-cols-2 gap-2 bg-deep-navy/5 rounded-xl p-2 border-2 border-deep-navy/10">
									<button
										type="button"
										:disabled="selectedEvent?.requires_invite_acceptance_for_checkout && acceptedInvites.length === 0"
										:class="checkoutForm.mode === 'direct' ? 'bg-deep-navy text-white' : 'text-deep-navy hover:bg-deep-navy/10'"
										class="px-3 py-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50"
										@click="checkoutForm.mode = 'direct'"
									>
										Direct
									</button>
									<button
										type="button"
										:class="checkoutForm.mode === 'token' ? 'bg-deep-navy text-white' : 'text-deep-navy hover:bg-deep-navy/10'"
										class="px-3 py-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all"
										@click="checkoutForm.mode = 'token'"
									>
										Invite Token
									</button>
								</div>
							</div>

							<div>
								<label class="block text-[10px] font-black text-deep-navy/50 mb-3 uppercase tracking-[0.2em]">
									Sponsor Name (Optional)
								</label>
								<input
									v-model="checkoutForm.name"
									type="text"
									placeholder="Defaults to organisation title"
									class="w-full px-4 py-4 bg-white border-2 border-deep-navy rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
								/>
							</div>
						</div>

						<div v-if="checkoutForm.mode === 'token'">
							<label class="block text-[10px] font-black text-deep-navy/50 mb-3 uppercase tracking-[0.2em]">
								Invite Token
							</label>
							<input
								v-model="checkoutForm.inviteToken"
								type="text"
								placeholder="Paste invite token"
								class="w-full px-4 py-4 bg-white border-2 border-deep-navy rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
							/>
						</div>

						<div>
							<label class="block text-[10px] font-black text-deep-navy/50 mb-3 uppercase tracking-[0.2em]">
								Sponsorship Package
							</label>
							<div v-if="isLoadingPackages" class="space-y-2">
								<USkeleton class="h-16 w-full" />
								<USkeleton class="h-16 w-full" />
							</div>
							<div v-else-if="sponsorshipPackages.length === 0" class="text-sm font-bold text-deep-navy/60">
								No active packages available for this event.
							</div>
							<div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
								<button
									v-for="pkg in sponsorshipPackages"
									:key="pkg.package_id"
									type="button"
									class="text-left p-4 border-2 rounded-xl transition-all"
									:class="checkoutForm.packageId === pkg.package_id
										? 'border-deep-navy bg-deep-navy text-white'
										: 'border-deep-navy/20 bg-white text-deep-navy hover:border-deep-navy/40'"
									@click="checkoutForm.packageId = pkg.package_id"
								>
									<p class="text-sm font-black uppercase tracking-tight">{{ pkg.package_name }}</p>
									<p class="mt-1 text-xs font-bold uppercase tracking-wider opacity-80">Tier {{ pkg.tier }}</p>
									<p class="mt-2 text-sm font-black">{{ formatMoney(pkg.modified_amount, pkg.base_amount_currency) }}</p>
								</button>
							</div>
						</div>

						<div>
							<label class="block text-[10px] font-black text-deep-navy/50 mb-3 uppercase tracking-[0.2em]">
								Payment Method
							</label>
							<div v-if="isLoadingPaymentMethods" class="space-y-2">
								<USkeleton class="h-16 w-full" />
							</div>
							<div v-else-if="paymentMethods.length === 0" class="text-sm font-bold text-deep-navy/60">
								No active payment methods found for this event.
							</div>
							<div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
								<button
									v-for="method in paymentMethods"
									:key="method.id"
									type="button"
									class="text-left p-4 border-2 rounded-xl transition-all"
									:class="checkoutForm.paymentMethodId === method.id
										? 'border-deep-navy bg-deep-navy text-white'
										: 'border-deep-navy/20 bg-white text-deep-navy hover:border-deep-navy/40'"
									@click="checkoutForm.paymentMethodId = method.id"
								>
									<p class="text-sm font-black uppercase tracking-tight">{{ method.title }}</p>
									<p class="mt-1 text-xs font-bold uppercase tracking-wider opacity-80">{{ formatMethodType(method.method_type) }}</p>
								</button>
							</div>
						</div>

						<div>
							<label class="block text-[10px] font-black text-deep-navy/50 mb-3 uppercase tracking-[0.2em]">
								Description (Optional)
							</label>
							<textarea
								v-model="checkoutForm.description"
								rows="3"
								placeholder="Optional note for this sponsorship"
								class="w-full px-4 py-4 bg-white border-2 border-deep-navy rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
							/>
						</div>
					</div>

					<div class="space-y-4" v-if="activeStep == 3">
						<div class="p-5 rounded-2xl border-2 border-deep-navy/10 bg-deep-navy/5">
							<p class="text-xs font-black uppercase tracking-wider text-deep-navy/60">Review Sponsorship</p>
							<div class="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<p class="text-[10px] font-black uppercase tracking-wider text-deep-navy/50">Event</p>
									<p class="text-sm font-black text-deep-navy">{{ selectedEvent?.title || 'None selected' }}</p>
								</div>
								<div>
									<p class="text-[10px] font-black uppercase tracking-wider text-deep-navy/50">Package</p>
									<p class="text-sm font-black text-deep-navy">{{ selectedPackage?.package_name || 'None selected' }}</p>
								</div>
								<div>
									<p class="text-[10px] font-black uppercase tracking-wider text-deep-navy/50">Payment Method</p>
									<p class="text-sm font-black text-deep-navy">{{ selectedPaymentMethod?.title || 'None selected' }}</p>
								</div>
								<div>
									<p class="text-[10px] font-black uppercase tracking-wider text-deep-navy/50">Amount</p>
									<p class="text-sm font-black text-deep-navy">{{ selectedPackageAmount }}</p>
								</div>
							</div>
						</div>

						<div class="flex justify-end">
							<button
							 	v-if="activeStep == 3"
								:disabled="!canCheckout || isCheckingOut"
								@click="submitCheckout"
								class="px-8 py-3 bg-deep-navy hover:bg-deep-navy/90 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50"
							>
								{{ isCheckingOut ? 'Initializing...' : 'Confirm Sponsor Checkout' }}
							</button>
						</div>

						<div v-if="checkoutResult" class="p-5 rounded-xl border-2 border-green-600/30 bg-green-500/10 space-y-2">
							<p class="text-sm font-black text-deep-navy uppercase tracking-tight">Checkout Initialized</p>
							<p class="text-xs font-bold text-deep-navy/70 uppercase tracking-wider">Sponsor ID: {{ checkoutResult.sponsor_id }}</p>
							<p class="text-xs font-bold text-deep-navy/70 uppercase tracking-wider">Payment Reference: {{ checkoutResult.payment_reference }}</p>
							<p class="text-xs font-bold text-deep-navy/70 uppercase tracking-wider">Status: {{ checkoutResult.payment_status }}</p>

							<div v-if="checkoutResult.payment_method_type === 'STRIPE'" class="mt-3 p-4 rounded-lg bg-white border border-green-700/20">
								<p class="text-xs font-black uppercase tracking-wider text-deep-navy">Stripe Payment Ready</p>
								<p class="mt-1 text-xs font-medium text-deep-navy/70">Client Secret: {{ checkoutResult.client_secret || 'Unavailable in response' }}</p>
								<p class="text-xs font-medium text-deep-navy/70">Payment Intent: {{ checkoutResult.payment_intent_id || 'Unavailable in response' }}</p>
							</div>

							<div v-if="checkoutResult.payment_method_type === 'BANK_TRANSFER'" class="mt-3 p-4 rounded-lg bg-white border border-green-700/20">
								<p class="text-xs font-black uppercase tracking-wider text-deep-navy">Bank Transfer Instructions</p>
								<p class="mt-1 text-xs font-medium text-deep-navy/70">Reference: {{ checkoutResult.bank_transfer_reference || 'Use payment reference above' }}</p>
								<pre class="mt-2 text-xs text-deep-navy/70 whitespace-pre-wrap">{{ stringifyDetails(checkoutResult.payment_instructions) }}</pre>
							</div>
						</div>
					</div>

					<div class="border-2 border-deep-navy/10 rounded-2xl p-6 space-y-4 bg-deep-navy/5" v-if="activeStep == 1">
						<h3 class="text-lg font-black text-deep-navy uppercase tracking-tight">Sponsorship Payments</h3>
						<div v-if="!selectedEvent" class="text-center py-6 bg-white border-2 border-dashed border-deep-navy/20 rounded-xl">
							<p class="text-sm font-bold text-deep-navy/60">Select an event to see payment history.</p>
						</div>
						<div v-else-if="isLoadingPaymentHistory" class="space-y-3">
							<USkeleton class="h-16 w-full" />
							<USkeleton class="h-16 w-full" />
						</div>
						<div v-else-if="!paymentHistory" class="text-center py-6 bg-white border-2 border-dashed border-deep-navy/20 rounded-xl">
							<p class="text-sm font-bold text-deep-navy/60">No sponsorship payment data available yet.</p>
						</div>
						<div v-else class="space-y-4">
							<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div class="p-4 rounded-xl border-2 border-deep-navy/10 bg-white">
									<p class="text-[10px] font-black uppercase tracking-wider text-deep-navy/50">Total Payments</p>
									<p class="mt-2 text-xl font-black text-deep-navy">{{ paymentSummaryCount }}</p>
								</div>
								<div class="p-4 rounded-xl border-2 border-deep-navy/10 bg-white">
									<p class="text-[10px] font-black uppercase tracking-wider text-deep-navy/50">Completed Amount</p>
									<p class="mt-2 text-xl font-black text-deep-navy">{{ paymentSummaryAmount }}</p>
								</div>
								<div class="p-4 rounded-xl border-2 border-deep-navy/10 bg-white">
									<p class="text-[10px] font-black uppercase tracking-wider text-deep-navy/50">Pending</p>
									<p class="mt-2 text-xl font-black text-deep-navy">{{ paymentSummaryPending }}</p>
								</div>
							</div>

							<div v-if="paymentTimeline.length === 0" class="text-center py-6 bg-white border-2 border-dashed border-deep-navy/20 rounded-xl">
								<p class="text-sm font-bold text-deep-navy/60">No payment timeline entries yet.</p>
							</div>

							<div v-else class="space-y-3">
								<div v-for="item in paymentTimeline" :key="item.payment_id" class="p-4 border-2 border-deep-navy/10 rounded-xl bg-white">
									<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
										<div>
											<p class="text-sm font-black text-deep-navy uppercase tracking-tight">{{ item.payment_reference }}</p>
											<p class="text-[10px] text-deep-navy/55 font-bold uppercase tracking-wider mt-1">
												{{ formatMethodType(item.method_type || 'UNKNOWN') }} • {{ formatDateSafe(item.created_at) }}
											</p>
										</div>
										<div class="flex items-center gap-2">
											<span class="px-3 py-1 rounded-full bg-blue-500/10 text-blue-700 text-[10px] font-black uppercase tracking-wider">{{ item.status }}</span>
											<span class="text-xs font-black text-deep-navy uppercase tracking-wider">{{ formatMoney(item.amount, item.currency) }}</span>
										</div>
									</div>
									<div class="" v-if="item.status == 'PENDING'">
										<p class="text-xs font-bold uppercase tracking-wider text-deep-navy/70 mt-2">Payment Instructions:</p>
										<div v-if="item.method_type === 'STRIPE'">
											<p class="text-xs font-medium text-deep-navy/70">As this is via stripe, no payment actions are required</p>
										</div>
										<div v-else>
											<pre class="mt-1 text-xs text-deep-navy/70 whitespace-pre-wrap">{{ item.method_provided_details }}</pre>
											<p class="text-deep-navy/80">Ensure you use this bank transfer reference in your transfer reference otherwise your payment may not be processed.</p>
											<p class="text-deep-navy">Bank transfer reference: <b>{{ item.bank_transfer_reference }}</b></p>
										</div>		
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				</div>

				<div v-else class="border-2 border-deep-navy/10 rounded-2xl p-6 space-y-4 bg-white">
						<div class="flex items-center justify-between">
							<div>
								<h2 class="text-lg font-black text-deep-navy uppercase tracking-tight">Invite Responses</h2>
								<p class="text-sm text-deep-navy/60 font-medium">Accept or decline sponsorship invites from event organisers.</p>
							</div>
							<span class="text-xs font-black uppercase tracking-wider text-deep-navy/50">Pending {{ pendingInvites.length }}</span>
						</div>

						<div v-if="!selectedEvent" class="text-center py-6 bg-deep-navy/5 border-2 border-dashed border-deep-navy/20 rounded-xl">
							<p class="text-sm font-bold text-deep-navy/60">Select an event to focus invite responses.</p>
						</div>

						<div v-if="isLoadingInvites" class="space-y-3">
							<USkeleton class="h-16 w-full" />
							<USkeleton class="h-16 w-full" />
						</div>

						<div
							v-else-if="eventInvites.length === 0"
							class="text-center py-10 bg-deep-navy/5 border-2 border-dashed border-deep-navy/20 rounded-xl"
						>
							<p class="text-sm font-bold text-deep-navy/60">No sponsor invites received yet.</p>
						</div>

						<div v-else class="space-y-3">
							<div
								v-for="invite in eventInvites"
								:key="invite.invite_id"
								class="p-5 border-2 border-deep-navy/10 rounded-xl"
							>
								<div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
									<div>
										<p class="text-sm font-black text-deep-navy uppercase tracking-tight">{{ invite.email }}</p>
										<p class="text-[10px] text-deep-navy/50 font-bold uppercase tracking-wider mt-1">
											Sent {{ formatDateSafe(invite.sent_at) }}
										</p>
										<p class="text-[10px] text-deep-navy/50 font-bold uppercase tracking-wider mt-1">
											Event {{ invite.event_name || 'Unknown Event' }}
										</p>
										<div class="mt-2 flex items-center gap-2">
											<span class="text-[10px] font-black uppercase tracking-wider text-deep-navy/50">Token</span>
											<code class="px-2 py-1 rounded bg-blue-500/10 text-blue-700 text-xs font-bold">{{ invite.token }}</code>
										</div>
									</div>

									<div class="flex flex-wrap items-center gap-2">
										<span :class="inviteBadgeClass(invite)" class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
											{{ inviteBadgeLabel(invite) }}
										</span>

										<button
											v-if="invite.is_valid && !invite.accepted && !invite.declined"
											:disabled="isAcceptingToken"
											@click="acceptInviteToken(invite.token)"
											class="px-4 py-2 border-2 border-green-600 text-green-700 hover:bg-green-600 hover:text-white rounded-xl font-black text-[10px] uppercase tracking-wider transition-all disabled:opacity-50"
										>
											Accept
										</button>
										<button
											v-if="invite.is_valid && !invite.accepted && !invite.declined"
											:disabled="isDecliningToken"
											@click="declineInviteToken(invite.token)"
											class="px-4 py-2 border-2 border-red-600 text-red-700 hover:bg-red-600 hover:text-white rounded-xl font-black text-[10px] uppercase tracking-wider transition-all disabled:opacity-50"
										>
											Decline
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
		</div>
	</CommunitiesManagementLayout>
</template>

<script lang="ts" setup>
import { extractCollection, useEventSponsorshipPackages } from '~/composables/resources/events/eventSponsors'
import { useOrganisation } from '~/composables/resources/organisation/organisations'
import {
	useSponsorableEvents,
	useAcceptOrganisationSponsorInviteByToken,
	useDeclineOrganisationSponsorInviteByToken,
	useOrganisationSponsorCheckout,
	useOrganisationSponsorInvites,
	useOrganisationSponsorshipPaymentHistory,
	useOrganisationInboundSponsors,
	useOrganisationOutboundSponsors,
	useOrganisationSponsorFlowStatistics,
	type SponsorCheckoutResponse,
} from '~/composables/resources/organisation/organisationSponsorInvites'
import type { EventSponsorLedger, SponsorableEventList, SponsorshipPaymentTimelineItem } from '~/api/types.gen'
import { usePaymentMethods } from '~/composables/resources/payments/paymentMethods'
import { formatDate } from '~/utils/time'
import PieChart from '~/components/charts/PieChart.vue'
import BarChart from '~/components/charts/BarChart.vue'
import Swal from 'sweetalert2'

definePageMeta({
	middleware: ['auth', 'organisation-controller'],
	layout: 'default',
})

useHead({
	title: 'Community Sponsorships',
})

type InviteItem = {
	invite_id: string
	event_name?: string
	email: string
	token: string
	accepted: boolean
	declined: boolean
	is_valid: boolean
	sent_at?: string
	responded_at?: string | null
}

type PackageItem = {
	package_id: string
	package_name: string
	tier: number
	modified_amount: string
	base_amount_currency: string
}

const route = useRoute()
const { $notyf } = useNuxtApp()

const organisationId = computed(() => Number(route.params.id))
const activeTab = ref<'overview' | 'flow' | 'invites'>('overview')
const activeStep = ref(1)
const steps = [
	{ id: 1, label: 'Event', hint: 'Choose a target' },
	{ id: 2, label: 'Package', hint: 'Set package + payment' },
	{ id: 3, label: 'Review', hint: 'Confirm checkout' },
]

const { data: organisationData } = useOrganisation(organisationId)
const organisation = computed(() => organisationData.value?.data)

const eventSearch = ref('')
const eventPage = ref(1)
const eventPageSize = 8
const selectedEventId = ref('')
const selectedEventSnapshot = ref<SponsorableEventList | null>(null)

const ledgerSearch = ref('')
const ledgerUseSelectedEvent = ref(false)
const ledgerPageSize = 6
const inboundPage = ref(1)
const outboundPage = ref(1)

watch(eventSearch, () => {
	eventPage.value = 1
})

watch(ledgerSearch, () => {
	inboundPage.value = 1
	outboundPage.value = 1
})

const { data: sponsorableEventsResponse, isLoading: isLoadingSponsorableEvents } = useSponsorableEvents(computed(() => ({
	organisation: organisationId.value,
	search: eventSearch.value.trim() || undefined,
	page: eventPage.value,
	page_size: eventPageSize,
	ordering: 'start_datetime',
})))

const sponsorableEvents = computed(() => sponsorableEventsResponse.value?.events || [])
const sponsorableEventsCount = computed(() => sponsorableEventsResponse.value?.count || 0)
const hasNextEventsPage = computed(() => !!sponsorableEventsResponse.value?.next)
const hasPrevEventsPage = computed(() => !!sponsorableEventsResponse.value?.previous)

watch(
	sponsorableEvents,
	(value) => {
		if (!selectedEventId.value && value.length > 0) {
			selectedEventId.value = value[0].event_id
			selectedEventSnapshot.value = value[0]
			return
		}

		const updated = value.find(event => event.event_id === selectedEventId.value)
		if (updated) {
			selectedEventSnapshot.value = updated
		}
	},
	{ immediate: true },
)

const selectedEvent = computed(() => {
	const inCurrentPage = sponsorableEvents.value.find(event => event.event_id === selectedEventId.value)
	return inCurrentPage || selectedEventSnapshot.value
})

const ledgerEventId = computed(() => {
	if (!ledgerUseSelectedEvent.value) {
		return undefined
	}
	return selectedEventId.value || undefined
})

const inboundLedgerQuery = computed(() => ({
	organisation_id: organisationId.value,
	search: ledgerSearch.value.trim() || undefined,
	page: inboundPage.value,
	page_size: ledgerPageSize,
	ordering: '-added_at',
	event_id: ledgerEventId.value,
}))

const outboundLedgerQuery = computed(() => ({
	organisation_id: organisationId.value,
	search: ledgerSearch.value.trim() || undefined,
	page: outboundPage.value,
	page_size: ledgerPageSize,
	ordering: '-added_at',
	event_id: ledgerEventId.value,
}))

const { data: inboundResponse, isLoading: isLoadingInbound } = useOrganisationInboundSponsors(inboundLedgerQuery)
const { data: outboundResponse, isLoading: isLoadingOutbound } = useOrganisationOutboundSponsors(outboundLedgerQuery)

const inboundSponsors = computed<EventSponsorLedger[]>(() => inboundResponse.value?.rows || [])
const outboundSponsors = computed<EventSponsorLedger[]>(() => outboundResponse.value?.rows || [])
const inboundCount = computed(() => inboundResponse.value?.count || 0)
const outboundCount = computed(() => outboundResponse.value?.count || 0)

const { data: sponsorFlowResponse, isLoading: isLoadingSponsorFlow } = useOrganisationSponsorFlowStatistics(
	computed(() => ({
		organisation_id: organisationId.value,
		event_id: ledgerEventId.value,
		format: 'raw',
	})),
)

const sponsorFlowStats = computed(() => sponsorFlowResponse.value)

const inboundSummary = computed(() =>
	parseSummaryStats(sponsorFlowStats.value?.inbound_summary),
)
const outboundSummary = computed(() =>
	parseSummaryStats(sponsorFlowStats.value?.outbound_summary),
)
const netSummary = computed(() =>
	parseNetSummary(sponsorFlowStats.value?.net_summary),
)

const { data: packagesResponse, isLoading: isLoadingPackages } = useEventSponsorshipPackages(selectedEventId)

const sponsorshipPackages = computed<PackageItem[]>(() => {
	const payload = packagesResponse.value?.data
	return extractCollection<PackageItem>(payload)
})

const { data: paymentMethodsResponse, isLoading: isLoadingPaymentMethods } = usePaymentMethods(computed(() => {
	if (!selectedEventId.value) {
		return undefined
	}

	return {
		event: selectedEventId.value,
		is_active: true,
		page_size: 100,
	}
}))

const paymentMethods = computed<any[]>(() => {
	const payload = paymentMethodsResponse.value?.data
	return extractCollection<any>(payload)
})

const { data: invitesResponse, isLoading: isLoadingInvites } = useOrganisationSponsorInvites(computed(() => {
	if (!selectedEventId.value) {
		return undefined
	}

	return {
		event_id: selectedEventId.value,
		page_size: 100,
	}
}))

const eventInvites = computed<InviteItem[]>(() => invitesResponse.value?.invites as InviteItem[] || [])
const pendingInvites = computed(() => eventInvites.value.filter(invite => invite.is_valid && !invite.accepted && !invite.declined))
const acceptedInvites = computed(() => eventInvites.value.filter(invite => invite.accepted))

const { data: paymentHistory, isLoading: isLoadingPaymentHistory } = useOrganisationSponsorshipPaymentHistory(computed(() => {
	if (!selectedEventId.value || !organisationId.value) {
		return undefined
	}

	return {
		event_id: selectedEventId.value,
		organisation_id: organisationId.value,
	}
}))

const paymentSummary = computed<Record<string, unknown>>(() => {
	const source = paymentHistory.value?.summary
	if (!source || typeof source !== 'object') {
		return {}
	}

	return source as Record<string, unknown>
})

const paymentSummaryCount = computed(() => {
	const value = paymentSummary.value.total_payments ?? paymentSummary.value.payments_count ?? paymentSummary.value.count
	return typeof value === 'number' ? value : Number(value || 0)
})

const paymentSummaryPending = computed(() => {
	const value = paymentSummary.value.pending_payments ?? paymentSummary.value.pending_count ?? 0
	return typeof value === 'number' ? value : Number(value || 0)
})

const paymentSummaryAmount = computed(() => {
	const amount = paymentSummary.value.total_completed_amount || '0'
	const currency = typeof paymentSummary.value.currency === 'string' ? paymentSummary.value.currency : 'GBP'
	return formatMoney(String(amount), currency)
})

const paymentTimeline = computed<SponsorshipPaymentTimelineItem[]>(() => paymentHistory.value?.timeline || [])

const acceptInviteMutation = useAcceptOrganisationSponsorInviteByToken()
const declineInviteMutation = useDeclineOrganisationSponsorInviteByToken()
const checkoutMutation = useOrganisationSponsorCheckout()

const checkoutForm = reactive({
	mode: 'direct' as 'direct' | 'token',
	inviteToken: '',
	packageId: '',
	paymentMethodId: null as number | null,
	name: '',
	description: '',
})

const checkoutResult = ref<SponsorCheckoutResponse | null>(null)

const isAcceptingToken = computed(() => acceptInviteMutation.isPending.value)
const isDecliningToken = computed(() => declineInviteMutation.isPending.value)
const isCheckingOut = computed(() => checkoutMutation.isPending.value)

const checkoutBlockMessage = computed(() => {
	if (!selectedEvent.value) {
		return 'Select an event to continue with sponsorship checkout.'
	}

	if (!selectedEvent.value.can_checkout) {
		return selectedEvent.value.sponsor_checkout_policy_notes || 'Checkout is currently not available for this event under its sponsorship policy.'
	}

	if (selectedEvent.value.requires_invite_acceptance_for_checkout && checkoutForm.mode === 'direct' && acceptedInvites.value.length === 0) {
		return 'This event requires an accepted invite before direct checkout. Use Invite Token mode after accepting an invite.'
	}

	return ''
})

const canCheckout = computed(() => {
	if (!selectedEvent.value?.can_checkout) {
		return false
	}

	const hasCoreFields = !!checkoutForm.packageId && !!checkoutForm.paymentMethodId
	if (!hasCoreFields) {
		return false
	}

	if (checkoutForm.mode === 'token') {
		return checkoutForm.inviteToken.trim().length > 0
	}

	if (selectedEvent.value?.requires_invite_acceptance_for_checkout && acceptedInvites.value.length === 0) {
		return false
	}

	return !!selectedEventId.value
})

const selectedPackage = computed(() =>
	sponsorshipPackages.value.find(pkg => pkg.package_id === checkoutForm.packageId) || null,
)
const selectedPaymentMethod = computed(() =>
	paymentMethods.value.find(method => method.id === checkoutForm.paymentMethodId) || null,
)
const selectedPackageAmount = computed(() => {
	if (!selectedPackage.value) {
		return 'N/A'
	}
	return formatMoney(selectedPackage.value.modified_amount, selectedPackage.value.base_amount_currency)
})

const netCompletedRevenueDelta = computed(() => netSummary.value.completed_revenue_delta)
const netSponsorDelta = computed(() => netSummary.value.sponsor_count_delta)

const inboundSponsorChart = computed(() => {
	const rows = sponsorFlowStats.value?.inbound_by_sponsor as Array<Record<string, unknown>> | undefined
	if (!rows) {
		return []
	}
	return rows
		.map(item => ({
			name: String(item.organisation_title || 'Unknown'),
			value: asNumber(item.committed_amount),
		}))
		.filter(item => item.value > 0)
})

const inboundEventChart = computed(() => {
	const rows = sponsorFlowStats.value?.inbound_by_event as Array<Record<string, unknown>> | undefined
	if (!rows) {
		return []
	}
	return rows.map(item => ({
		label: String(item.event_title || 'Unknown'),
		value: asNumber(item.sponsor_count),
	}))
})

const outboundEventChart = computed(() => {
	const rows = sponsorFlowStats.value?.outbound_by_event as Array<Record<string, unknown>> | undefined
	if (!rows) {
		return []
	}
	return rows.map(item => ({
		label: String(item.event_title || 'Unknown'),
		value: asNumber(item.sponsor_count),
	}))
})

watch(
	() => selectedEvent.value?.requires_invite_acceptance_for_checkout,
	(requiresInvite) => {
		if (requiresInvite && acceptedInvites.value.length === 0) {
			checkoutForm.mode = 'token'
		}
	},
	{ immediate: true },
)

watch(selectedEventId, () => {
	activeStep.value = 1
})

function selectEvent(event: SponsorableEventList) {
	selectedEventId.value = event.event_id
	selectedEventSnapshot.value = event
	checkoutResult.value = null
	checkoutForm.packageId = ''
	checkoutForm.paymentMethodId = null
	checkoutForm.description = ''
	checkoutForm.inviteToken = ''
}

function selectFirstEvent() {
	const first = sponsorableEvents.value[0]
	if (first) {
		selectEvent(first)
	}
}

function goNextStep() {
	if (activeStep.value === 1 && !selectedEventId.value) {
		$notyf.error('Select an event to continue.')
		return
	}

	if (activeStep.value === 2 && !canCheckout.value) {
		$notyf.error(checkoutBlockMessage.value || 'Complete package and payment details first.')
		return
	}

	activeStep.value = Math.min(3, activeStep.value + 1)
}

function canGoNextStep() {
	if (activeStep.value === 1) {
		return !!selectedEventId.value
	}

	if (activeStep.value === 2) {
		return canCheckout.value
	}

	return false
}

function formatMoney(amount: string, currency?: string) {
	const parsed = Number(amount)
	if (Number.isNaN(parsed)) {
		return `${amount} ${currency || ''}`.trim()
	}

	return new Intl.NumberFormat('en-GB', {
		style: 'currency',
		currency: currency || 'GBP',
		minimumFractionDigits: 2,
	}).format(parsed)
}

function asNumber(value: unknown, fallback = 0) {
	if (typeof value === 'number') {
		return value
	}
	const parsed = Number(value)
	return Number.isNaN(parsed) ? fallback : parsed
}

function parseNetSummary(source?: Record<string, unknown> | null) {
	const summary = source || {}
	return {
		sponsor_count_delta: asNumber(summary.sponsor_count_delta),
		commitment_amount_delta: asNumber(summary.commitment_amount_delta),
		completed_revenue_delta: asNumber(summary.completed_revenue_delta),
		average_commitment_per_sponsor_delta: asNumber(summary.average_commitment_per_sponsor_delta),
		average_completed_revenue_per_sponsor_delta: asNumber(summary.average_completed_revenue_per_sponsor_delta),
	}
}

function parseSummaryStats(source?: Record<string, unknown> | null) {
	const summary = source || {}
	return {
		total_sponsors: asNumber(summary.total_sponsors),
		unique_organisations: asNumber(summary.unique_organisations),
		commitment_amount: asNumber(summary.commitment_amount),
		completed_revenue: asNumber(summary.completed_revenue),
		pending_revenue: asNumber(summary.pending_revenue),
		average_commitment_per_sponsor: asNumber(summary.average_commitment_per_sponsor),
		average_completed_revenue_per_sponsor: asNumber(summary.average_completed_revenue_per_sponsor),
		total_payments: asNumber(summary.total_payments),
		completed_payments: asNumber(summary.completed_payments),
		pending_payments: asNumber(summary.pending_payments),
		failed_payments: asNumber(summary.failed_payments),
		cancelled_payments: asNumber(summary.cancelled_payments),
	}
}

function formatDateSafe(value?: string | null) {
	if (!value) {
		return 'Unknown date'
	}

	return formatDate(value)
}

function formatMethodType(methodType: string) {
	if (methodType === 'BANK_TRANSFER') {
		return 'Bank Transfer'
	}

	if (methodType === 'STRIPE') {
		return 'Stripe'
	}

	if (methodType === 'CASH') {
		return 'Cash'
	}

	return methodType
}

function inviteBadgeLabel(invite: InviteItem) {
	if (invite.accepted) {
		return 'Accepted'
	}

	if (invite.declined) {
		return 'Declined'
	}

	if (!invite.is_valid) {
		return 'Expired'
	}

	return 'Pending'
}

function inviteBadgeClass(invite: InviteItem) {
	if (invite.accepted) {
		return 'bg-green-600 text-white'
	}

	if (invite.declined) {
		return 'bg-red-600 text-white'
	}

	if (!invite.is_valid) {
		return 'bg-gray-500 text-white'
	}

	return 'bg-blue-600 text-white'
}

function stringifyDetails(value: unknown) {
	if (!value) {
		return 'No additional instructions returned.'
	}

	try {
		return JSON.stringify(value, null, 2)
	} catch {
		return String(value)
	}
}

function extractErrorMessage(error: unknown) {
	const fallback = 'Something went wrong. Please try again.'
	const err = error as any
	const data = err?.response?.data || err?.data

	if (typeof data?.error === 'string') {
		return data.error
	}

	if (typeof data?.detail === 'string') {
		return data.detail
	}

	if (data && typeof data === 'object') {
		const first = Object.values(data)[0]
		if (Array.isArray(first) && typeof first[0] === 'string') {
			return first[0]
		}
		if (typeof first === 'string') {
			return first
		}
	}

	if (err?.message) {
		return err.message
	}

	return fallback
}

async function acceptInviteToken(token: string) {
	try {
		await acceptInviteMutation.mutateAsync(token)
		$notyf.success('Invite marked as accepted.')
	} catch (error) {
		$notyf.error(extractErrorMessage(error))
	}
}

const transitionTab = (tab: string) => {
	if (activeTab.value === tab) {
		return
	}

	if (activeStep.value !== 1) {
		Swal.fire({
			title: 'Are you sure?',
			text: 'Switching tabs will reset your current sponsorship checkout progress.',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Yes, switch tabs',
			cancelButtonText: 'No, stay here',
		}).then((result) => {
			if (result.isConfirmed) {
				activeTab.value = tab as any
				activeStep.value = 1
				checkoutResult.value = null
				checkoutForm.packageId = ''
				checkoutForm.paymentMethodId = null
				checkoutForm.description = ''
				checkoutForm.inviteToken = ''
			}
		})
	} else {
		activeTab.value = tab as any
	}

	
}

async function declineInviteToken(token: string) {
	try {
		await declineInviteMutation.mutateAsync(token)
		$notyf.success('Invite marked as declined.')
	} catch (error) {
		$notyf.error(extractErrorMessage(error))
	}
}

async function submitCheckout() {
	if (!canCheckout.value) {
		$notyf.error(checkoutBlockMessage.value || 'Complete package, payment method, and mode details before checkout.')
		return
	}

	const payload: any = {
		package_id: checkoutForm.packageId,
		payment_method_id: checkoutForm.paymentMethodId,
	}

	if (selectedEventId.value) {
		payload.event_id = selectedEventId.value
	}

	if (checkoutForm.mode === 'token') {
		payload.invite_token = checkoutForm.inviteToken.trim()
	} else {
		payload.organisation_id = organisationId.value
	}

	if (checkoutForm.name.trim()) {
		payload.name = checkoutForm.name.trim()
	}

	if (checkoutForm.description.trim()) {
		payload.description = checkoutForm.description.trim()
	}

	try {
		const response = await checkoutMutation.mutateAsync(payload)
		checkoutResult.value = (response?.data || null) as SponsorCheckoutResponse | null

		if (response.error) {
			$notyf.error(extractErrorMessage(response.error))
			return
		}
		$notyf.success('Checkout initialized successfully.')
		activeStep.value = 1
	} catch (error) {
		$notyf.error(extractErrorMessage(error))
	}
}
</script>