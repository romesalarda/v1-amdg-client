<template>
	<EventManagementLayout :event-id="id" :event="event?.data">
		<div class="pb-20 space-y-6">
			<section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
				<div class="px-6 py-5 border-b border-navy-50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
					<div>
						<h2 class="text-sm font-black text-primary uppercase tracking-widest">Event Sponsorship Management</h2>
						<p class="text-xs text-navy-400 mt-1">Switch between overview, sponsors, packages, and invites.</p>
					</div>
					<div class="flex flex-wrap gap-2">
						<button
							v-for="tab in sponsorTabs"
							:key="tab.id"
							class="px-3 py-2 rounded-xl text-xs font-bold border transition-colors inline-flex items-center gap-2"
							:class="activeTab === tab.id
								? 'bg-primary border-primary text-white'
								: 'bg-white border-navy-200 text-navy-700 hover:bg-mist-blue/40'"
							@click="activeTab = tab.id"
						>
							<span>{{ tab.label }}</span>
							<span
								v-if="tab.count && tab.count > 0"
								class="px-1.5 py-0.5 rounded-full text-[10px] font-black"
								:class="activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'"
							>
								{{ tab.count }}
							</span>
						</button>
					</div>
				</div>

				<div v-if="activeTab === 'overview'" class="p-6">
					<div v-if="overviewStatsLoading" class="space-y-4">
						<div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
							<div v-for="i in 8" :key="i" class="h-24 rounded-xl bg-mist-blue/60 animate-pulse" />
						</div>
						<div class="h-56 rounded-xl bg-mist-blue/40 animate-pulse" />
					</div>

					<div v-else class="space-y-4">
						<div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
							<div class="p-4 rounded-xl border border-navy-100 bg-mist-blue/40">
								<p class="text-[10px] uppercase tracking-wide text-navy-400 font-bold">Total Sponsors</p>
								<p class="text-2xl font-black text-navy-900 mt-1">{{ sponsorOverviewStats.total_sponsors ?? 0 }}</p>
							</div>
							<div class="p-4 rounded-xl border border-navy-100 bg-indigo-50/70">
								<p class="text-[10px] uppercase tracking-wide text-indigo-700 font-bold">Unique Organisations</p>
								<p class="text-2xl font-black text-indigo-700 mt-1">{{ sponsorOverviewStats.unique_organisations_sponsoring ?? 0 }}</p>
							</div>
							<div class="p-4 rounded-xl border border-navy-100 bg-emerald-50/70">
								<p class="text-[10px] uppercase tracking-wide text-emerald-700 font-bold">Commitments</p>
								<p class="text-2xl font-black text-emerald-700 mt-1">{{ formatMoney(sponsorOverviewStats.commitment_amount) }}</p>
							</div>
							<div class="p-4 rounded-xl border border-navy-100 bg-teal-50/70">
								<p class="text-[10px] uppercase tracking-wide text-teal-700 font-bold">Completed Revenue</p>
								<p class="text-2xl font-black text-teal-700 mt-1">{{ formatMoney(sponsorPaymentSummary.completed_revenue) }}</p>
							</div>
							<div class="p-4 rounded-xl border border-navy-100 bg-violet-50/70">
								<p class="text-[10px] uppercase tracking-wide text-violet-700 font-bold">Package Revenue</p>
								<p class="text-2xl font-black text-violet-700 mt-1">{{ formatMoney(sponsorPackageTotals.total_completed_revenue) }}</p>
							</div>
							<div class="p-4 rounded-xl border border-navy-100 bg-amber-50/70">
								<p class="text-[10px] uppercase tracking-wide text-amber-700 font-bold">Acceptance Rate</p>
								<p class="text-2xl font-black text-amber-700 mt-1">{{ formatPercent(sponsorInviteSummary.acceptance_rate) }}</p>
							</div>
							<div class="p-4 rounded-xl border border-navy-100 bg-cyan-50/70">
								<p class="text-[10px] uppercase tracking-wide text-cyan-700 font-bold">Response Rate</p>
								<p class="text-2xl font-black text-cyan-700 mt-1">{{ formatPercent(sponsorInviteSummary.response_rate) }}</p>
							</div>
							<div class="p-4 rounded-xl border border-navy-100 bg-fuchsia-50/70">
								<p class="text-[10px] uppercase tracking-wide text-fuchsia-700 font-bold">Converted Invites</p>
								<p class="text-2xl font-black text-fuchsia-700 mt-1">{{ sponsorInviteConversionSummary.accepted_with_resulting_sponsor ?? 0 }}</p>
							</div>
							<div class="p-4 rounded-xl border border-navy-100 bg-slate-50/80">
								<p class="text-[10px] uppercase tracking-wide text-slate-700 font-bold">Realization Rate</p>
								<p class="text-2xl font-black text-slate-700 mt-1">{{ formatPercent(sponsorOverviewStats.realization_rate) }}</p>
							</div>
						</div>

						<div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
							<div class="p-4 rounded-xl border border-navy-100 bg-white">
								<p class="text-[10px] uppercase tracking-wide text-navy-500 font-bold mb-2">Verification Status</p>
								<div class="flex flex-wrap gap-2">
									<span class="px-2 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700">Pending: {{ sponsorVerificationSummary.pending ?? 0 }}</span>
									<span class="px-2 py-1 rounded-full text-[11px] font-semibold bg-green-100 text-green-700">Verified: {{ sponsorVerificationSummary.verified ?? 0 }}</span>
									<span class="px-2 py-1 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-700">Rejected: {{ sponsorVerificationSummary.rejected ?? 0 }}</span>
									<span class="px-2 py-1 rounded-full text-[11px] font-semibold bg-indigo-100 text-indigo-700">Processed: {{ sponsorVerificationSummary.processed ?? 0 }}</span>
								</div>
							</div>

							<div class="p-4 rounded-xl border border-navy-100 bg-white">
								<p class="text-[10px] uppercase tracking-wide text-navy-500 font-bold mb-2">Payment Status</p>
								<div class="flex flex-wrap gap-2">
									<span class="px-2 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700">Completed: {{ sponsorPaymentSummary.completed ?? 0 }}</span>
									<span class="px-2 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700">Pending: {{ sponsorPaymentSummary.pending ?? 0 }}</span>
									<span class="px-2 py-1 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-700">Failed: {{ sponsorPaymentSummary.failed ?? 0 }}</span>
									<span class="px-2 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">Cancelled: {{ sponsorPaymentSummary.cancelled ?? 0 }}</span>
								</div>
							</div>
						</div>

						<div class="rounded-xl border border-navy-100 overflow-hidden">
							<div class="px-4 py-3 border-b border-navy-100 bg-mist-blue/30 flex items-center justify-between">
								<p class="text-xs font-black text-primary uppercase tracking-wider">Event Sponsorship Breakdown</p>
								<p class="text-[11px] text-navy-500">Top events by sponsors and realized revenue</p>
							</div>

							<div v-if="sponsorEventBreakdownRows.length" class="overflow-x-auto">
								<table class="w-full min-w-[760px]">
									<thead class="bg-white border-b border-navy-100">
										<tr class="text-left text-[10px] uppercase tracking-wide text-navy-500">
											<th class="px-4 py-3 font-bold">Event</th>
											<th class="px-4 py-3 font-bold">Sponsors</th>
											<th class="px-4 py-3 font-bold">Organisations</th>
											<th class="px-4 py-3 font-bold">Completed Revenue</th>
										</tr>
									</thead>
									<tbody class="divide-y divide-navy-50 bg-white">
										<tr v-for="row in sponsorEventBreakdownRows" :key="row.event_id" class="hover:bg-mist-blue/20 transition-colors">
											<td class="px-4 py-3 text-sm font-semibold text-navy-900">{{ row.event_title }}</td>
											<td class="px-4 py-3 text-sm text-navy-700">{{ row.sponsors }}</td>
											<td class="px-4 py-3 text-sm text-navy-700">{{ row.organisations }}</td>
											<td class="px-4 py-3 text-sm text-emerald-700 font-semibold">{{ formatMoney(row.completed_revenue) }}</td>
										</tr>
									</tbody>
								</table>
							</div>

							<div v-else class="p-6 text-center text-sm text-navy-500 bg-white">
								No sponsor event statistics available for this event yet.
							</div>
						</div>
					</div>
				</div>

				<div v-else-if="activeTab === 'sponsors'">
					<div class="px-6 py-5 border-b border-navy-50 flex items-center justify-between gap-3">
						<div>
							<h3 class="text-sm font-black text-primary uppercase tracking-widest">Event Sponsors</h3>
							<p class="text-xs text-navy-400 mt-1">Manage sponsor profiles, package assignment, and approval status.</p>
						</div>
						<button
							class="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary/90 transition-colors"
							:disabled="!canManage || sponsorMutating"
							@click="openCreateSponsorModal"
						>
							Add Sponsor
						</button>
					</div>

					<div class="px-6 py-4 border-b border-navy-50 bg-mist-blue/20 grid grid-cols-1 md:grid-cols-3 gap-3">
						<div>
							<label class="block text-[10px] font-bold uppercase tracking-wide text-navy-500 mb-1">Search Sponsors</label>
							<input
								v-model.trim="sponsorSearchTerm"
								type="text"
								placeholder="Name, org, package"
								class="w-full px-3 py-2 rounded-xl border border-navy-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
							/>
						</div>
						<div>
							<label class="block text-[10px] font-bold uppercase tracking-wide text-navy-500 mb-1">Status</label>
							<select
								v-model="sponsorStatusFilter"
								class="w-full px-3 py-2 rounded-xl border border-navy-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
							>
								<option value="all">All statuses</option>
								<option value="pending">Pending</option>
								<option value="verified">Verified</option>
								<option value="rejected">Rejected</option>
								<option value="processed">Processed</option>
							</select>
						</div>
						<div>
							<label class="block text-[10px] font-bold uppercase tracking-wide text-navy-500 mb-1">Organisation</label>
							<select
								v-model="sponsorOrganisationFilter"
								class="w-full px-3 py-2 rounded-xl border border-navy-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
							>
								<option :value="0">All organisations</option>
								<option v-for="org in sponsorFilterOrganisations" :key="org.id" :value="org.id">{{ org.title }}</option>
							</select>
						</div>
					</div>

					<div v-if="sponsorsLoading" class="p-6 space-y-3">
						<div v-for="i in 4" :key="i" class="h-20 rounded-xl bg-mist-blue/60 animate-pulse" />
					</div>

					<div v-else-if="filteredSponsors.length" class="overflow-x-auto">
						<table class="w-full min-w-[860px]">
							<thead class="bg-mist-blue/30 border-b border-navy-100">
								<tr class="text-left text-[10px] uppercase tracking-wide text-navy-500">
									<th class="px-6 py-3 font-bold">Sponsor</th>
									<th class="px-6 py-3 font-bold">Status</th>
									<th class="px-6 py-3 font-bold">Organisation</th>
									<th class="px-6 py-3 font-bold">Package</th>
									<th class="px-6 py-3 font-bold">Owned Packages</th>
									<th class="px-6 py-3 font-bold text-right">Actions</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-navy-50">
								<tr v-for="sponsor in filteredSponsors" :key="sponsor.sponsor_id" class="hover:bg-mist-blue/20 transition-colors align-top">
									<td class="px-6 py-4">
										<p class="text-sm font-bold text-navy-900">{{ sponsor.name }}</p>
										<p class="text-xs text-navy-500 mt-1">{{ sponsor.description || 'No sponsor description provided.' }}</p>
									</td>
									<td class="px-6 py-4">
										<span class="text-[10px] px-2 py-1 rounded-full font-semibold" :class="statusBadgeClass(sponsor.verification_status)">
											{{ sponsor.verification_status || 'pending' }}
										</span>
									</td>
									<td class="px-6 py-4 text-sm text-navy-700">
										{{ sponsor.organisation_name || `ID ${sponsor.organisation}` }}
									</td>
									<td class="px-6 py-4 text-sm text-navy-700">{{ sponsor.package_name || 'Unassigned' }}</td>
									<td class="px-6 py-4 text-sm text-navy-700">{{ sponsor.packages_count ?? 0 }}</td>
									<td class="px-6 py-4">
										<div class="flex items-center justify-end gap-2 flex-wrap">
											<button
												v-if="sponsor.can_approve && sponsor.is_pending"
												class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors"
												:disabled="sponsorMutating"
												@click="approveSponsor(sponsor)"
											>
												Approve
											</button>
											<button
												v-if="sponsor.can_approve && sponsor.is_pending"
												class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-colors"
												:disabled="sponsorMutating"
												@click="rejectSponsor(sponsor)"
											>
												Reject
											</button>
											<button
												class="p-2 rounded-lg text-navy-500 hover:text-navy-900 hover:bg-mist-blue transition-colors"
												:disabled="!canManage || sponsorMutating"
												@click="openEditSponsorModal(sponsor)"
												title="Edit sponsor"
											>
												<span class="material-symbols-outlined text-base">edit</span>
											</button>
											<button
												class="p-2 rounded-lg text-navy-500 hover:text-red-600 hover:bg-red-50 transition-colors"
												:disabled="!canManage || sponsorMutating"
												@click="deleteSponsor(sponsor)"
												title="Delete sponsor"
											>
												<span class="material-symbols-outlined text-base">delete</span>
											</button>
										</div>
									</td>
								</tr>
							</tbody>
						</table>
					</div>

					<div v-else-if="sponsors.length" class="p-10 text-center text-navy-500">
						<span class="material-symbols-outlined text-4xl text-navy-300 mb-2 block">filter_alt</span>
						<p class="text-sm">No sponsors match current filters.</p>
						<p class="text-xs text-navy-400 mt-1">Adjust search, status, or organisation filters.</p>
					</div>

					<div v-else class="p-10 text-center text-navy-500">
						<span class="material-symbols-outlined text-4xl text-navy-300 mb-2 block">handshake</span>
						<p class="text-sm">No sponsors added to this event yet.</p>
						<p class="text-xs text-navy-400 mt-1">Create a sponsor and assign a package to begin tracking sponsorships.</p>
					</div>
				</div>

				<div v-else-if="activeTab === 'packages'">
					<div class="px-6 py-5 border-b border-navy-50 flex items-center justify-between gap-3">
						<div>
							<h3 class="text-sm font-black text-primary uppercase tracking-widest">Sponsorship Packages</h3>
							<p class="text-xs text-navy-400 mt-1">Define tiered packages for sponsors to select.</p>
						</div>
						<button
							class="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary/90 transition-colors"
							:disabled="!canManage || packageMutating"
							@click="openCreatePackageModal"
						>
							Add Package
						</button>
					</div>

					<div v-if="packagesLoading" class="p-6 space-y-3">
						<div v-for="i in 3" :key="i" class="h-20 rounded-xl bg-mist-blue/60 animate-pulse" />
					</div>

					<div v-else-if="sponsorshipPackages.length" class="overflow-x-auto">
						<table class="w-full min-w-[760px]">
							<thead class="bg-mist-blue/30 border-b border-navy-100">
								<tr class="text-left text-[10px] uppercase tracking-wide text-navy-500">
									<th class="px-6 py-3 font-bold">Package</th>
									<th class="px-6 py-3 font-bold">Tier</th>
									<th class="px-6 py-3 font-bold">Base Amount</th>
									<th class="px-6 py-3 font-bold">Status</th>
									<th class="px-6 py-3 font-bold">Sponsors</th>
									<th class="px-6 py-3 font-bold text-right">Actions</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-navy-50">
								<tr v-for="pkg in sponsorshipPackages" :key="pkg.package_id" class="hover:bg-mist-blue/20 transition-colors align-top">
									<td class="px-6 py-4">
										<p class="text-sm font-bold text-navy-900">{{ pkg.package_name }}</p>
										<p class="text-xs text-navy-500 mt-1">{{ pkg.package_description || 'No package description provided.' }}</p>
									</td>
									<td class="px-6 py-4 text-sm text-navy-700">{{ pkg.tier ?? 1 }}</td>
									<td class="px-6 py-4 text-sm text-navy-700">{{ formatMoney(pkg.base_amount, pkg.base_amount_currency) }}</td>
									<td class="px-6 py-4">
										<span class="text-[10px] px-2 py-1 rounded-full font-semibold" :class="pkg.active ? 'bg-green-100 text-green-700' : 'bg-navy-100 text-navy-600'">
											{{ pkg.active ? 'Active' : 'Inactive' }}
										</span>
									</td>
									<td class="px-6 py-4 text-sm text-navy-700">{{ pkg.sponsors_count ?? 0 }}</td>
									<td class="px-6 py-4">
										<div class="flex items-center justify-end gap-2">
											<button
												class="p-2 rounded-lg text-navy-500 hover:text-navy-900 hover:bg-mist-blue transition-colors"
												:disabled="!canManage || packageMutating"
												@click="openEditPackageModal(pkg)"
												title="Edit package"
											>
												<span class="material-symbols-outlined text-base">edit</span>
											</button>
											<button
												class="p-2 rounded-lg text-navy-500 hover:text-red-600 hover:bg-red-50 transition-colors"
												:disabled="!canManage || packageMutating"
												@click="deletePackage(pkg)"
												title="Delete package"
											>
												<span class="material-symbols-outlined text-base">delete</span>
											</button>
										</div>
									</td>
								</tr>
							</tbody>
						</table>
					</div>

					<div v-else class="p-10 text-center text-navy-500">
						<span class="material-symbols-outlined text-4xl text-navy-300 mb-2 block">sell</span>
						<p class="text-sm">No sponsorship packages configured.</p>
						<p class="text-xs text-navy-400 mt-1">Create packages first, then assign them to sponsors.</p>
					</div>
				</div>

				<div v-else>
					<div class="px-6 py-5 border-b border-navy-50 flex items-center justify-between gap-3">
						<div>
							<h3 class="text-sm font-black text-primary uppercase tracking-widest">Sponsor Invites</h3>
							<p class="text-xs text-navy-400 mt-1">Invite organisations to sponsor this event and track responses.</p>
						</div>
					</div>

					<div class="p-6 border-b border-navy-50 bg-mist-blue/20 grid grid-cols-1 md:grid-cols-4 gap-3">
						<div class="md:col-span-2">
							<label class="block text-[10px] font-bold uppercase tracking-wide text-navy-500 mb-1">Invite Email</label>
							<input
								v-model.trim="inviteForm.email"
								type="email"
								placeholder="sponsor@example.com"
								class="w-full px-3 py-2 rounded-xl border border-navy-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
							/>
						</div>
						<div>
							<label class="block text-[10px] font-bold uppercase tracking-wide text-navy-500 mb-1">Organisation</label>
							<select
								v-model.number="inviteForm.organisation"
								class="w-full px-3 py-2 rounded-xl border border-navy-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
							>
								<option :value="null">Optional organisation</option>
								<option v-for="org in organisationOptions" :key="org.id" :value="org.id">{{ org.title }}</option>
							</select>
						</div>
						<div>
							<label class="block text-[10px] font-bold uppercase tracking-wide text-navy-500 mb-1">Chapter Location</label>
							<select
								v-model.number="inviteForm.chapter_location"
								class="w-full px-3 py-2 rounded-xl border border-navy-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
							>
								<option :value="null">Optional chapter</option>
								<option v-for="chapter in chapterOptions" :key="chapter.id" :value="chapter.id">
									{{ chapter.chapter_name }} ({{ chapter.cluster_name }})
								</option>
							</select>
						</div>
					</div>

					<div class="px-6 py-4 flex justify-end border-b border-navy-50">
						<button
							class="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-60"
							:disabled="!canManage || inviteMutating || !inviteForm.email"
							@click="createInvite"
						>
							Send Invite
						</button>
					</div>

					<div v-if="invitesLoading" class="p-6 space-y-3">
						<div v-for="i in 3" :key="i" class="h-20 rounded-xl bg-mist-blue/60 animate-pulse" />
					</div>

					<div v-else-if="eventInvites.length" class="overflow-x-auto">
						<table class="w-full min-w-[860px]">
							<thead class="bg-mist-blue/30 border-b border-navy-100">
								<tr class="text-left text-[10px] uppercase tracking-wide text-navy-500">
									<th class="px-6 py-3 font-bold">Email</th>
									<th class="px-6 py-3 font-bold">Status</th>
									<th class="px-6 py-3 font-bold">Organisation</th>
									<th class="px-6 py-3 font-bold">Sent At</th>
									<th class="px-6 py-3 font-bold">Token</th>
									<th class="px-6 py-3 font-bold text-right">Actions</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-navy-50">
								<tr v-for="invite in eventInvites" :key="invite.invite_id" class="hover:bg-mist-blue/20 transition-colors">
									<td class="px-6 py-4 text-sm font-semibold text-navy-900">{{ invite.email }}</td>
									<td class="px-6 py-4">
										<span class="text-[10px] px-2 py-1 rounded-full font-semibold" :class="inviteStatusClass(invite)">
											{{ inviteStatusLabel(invite) }}
										</span>
									</td>
									<td class="px-6 py-4 text-sm text-navy-700">{{ invite.organisation_name || 'Not linked' }}</td>
									<td class="px-6 py-4 text-sm text-navy-700">{{ formatInviteDate(invite.sent_at) }}</td>
									<td class="px-6 py-4 text-xs font-mono text-navy-700">{{ invite.token }}</td>
									<td class="px-6 py-4">
										<div class="flex items-center justify-end gap-2">
											<button
												class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-mist-blue text-navy-700 hover:bg-mist-blue/70 transition-colors"
												@click="copyInviteToken(invite.token)"
											>
												Copy Token
											</button>
											<button
												class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
												:disabled="!canManage || inviteMutating"
												@click="deleteInvite(invite.invite_id)"
											>
												Delete
											</button>
										</div>
									</td>
								</tr>
							</tbody>
						</table>
					</div>

					<div v-else class="p-10 text-center text-navy-500">
						<span class="material-symbols-outlined text-4xl text-navy-300 mb-2 block">mail</span>
						<p class="text-sm">No sponsor invites sent for this event.</p>
						<p class="text-xs text-navy-400 mt-1">Use invites to let organisations accept sponsorship by token.</p>
					</div>
				</div>
			</section>
		</div>

		<Teleport to="body">
			<div v-if="showSponsorModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
				<div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closeSponsorModal" />
				<div class="relative w-full max-w-xl bg-white border border-deep-navy/10 rounded-2xl shadow-drawn">
					<div class="px-6 py-5 border-b border-navy-50 flex items-center justify-between">
						<h4 class="text-sm font-black text-primary uppercase tracking-widest">
							{{ sponsorModalMode === 'create' ? 'Add Sponsor' : 'Edit Sponsor' }}
						</h4>
						<button class="p-1.5 rounded-lg hover:bg-mist-blue" @click="closeSponsorModal">
							<span class="material-symbols-outlined text-base">close</span>
						</button>
					</div>

					<form class="p-6 space-y-4" @submit.prevent="submitSponsor">
						<div>
							<label class="block text-xs font-semibold text-navy-600 mb-1">Sponsor Name</label>
							<input
								v-model="sponsorForm.name"
								type="text"
								class="w-full px-3 py-2 rounded-xl border border-navy-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
								placeholder="Acme Corp"
								required
							/>
						</div>
						<div>
							<label class="block text-xs font-semibold text-navy-600 mb-1">Description</label>
							<textarea
								v-model="sponsorForm.description"
								rows="3"
								class="w-full px-3 py-2 rounded-xl border border-navy-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
								placeholder="What this sponsor is supporting..."
							/>
						</div>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
							<div>
								<label class="block text-xs font-semibold text-navy-600 mb-1">Organisation</label>
								<input
									v-model.trim="organisationSearchTerm"
									type="text"
									class="w-full px-3 py-2 mb-2 rounded-xl border border-navy-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
									placeholder="Search organisations"
								/>
								<select
									v-model.number="sponsorForm.organisation"
									class="w-full px-3 py-2 rounded-xl border border-navy-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
									required
								>
									<option disabled :value="null">Select an organisation</option>
									<option v-for="org in organisationOptions" :key="org.id" :value="org.id">
										{{ org.title }} (ID {{ org.id }})
									</option>
								</select>
								<p class="text-[11px] text-navy-500 mt-1" v-if="selectedOrganisationLabel">
									Selected: {{ selectedOrganisationLabel }}
								</p>
							</div>
							<div>
								<label class="block text-xs font-semibold text-navy-600 mb-1">Chapter Location (optional)</label>
								<input
									v-model.trim="chapterSearchTerm"
									type="text"
									class="w-full px-3 py-2 mb-2 rounded-xl border border-navy-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
									placeholder="Search chapter location"
								/>
								<select
									v-model.number="sponsorForm.chapter_location"
									class="w-full px-3 py-2 rounded-xl border border-navy-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
								>
									<option :value="null">No chapter location</option>
									<option v-for="chapter in chapterOptions" :key="chapter.id" :value="chapter.id">
										{{ chapter.chapter_name }} ({{ chapter.cluster_name }})
									</option>
								</select>
								<p class="text-[11px] text-navy-500 mt-1" v-if="selectedChapterLabel">
									Selected: {{ selectedChapterLabel }}
								</p>
							</div>
						</div>
						<div>
							<label class="block text-xs font-semibold text-navy-600 mb-1">Package</label>
							<select
								v-model.number="sponsorForm.package"
								class="w-full px-3 py-2 rounded-xl border border-navy-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
							>
								<option :value="null">No package</option>
								<option v-for="pkg in sponsorshipPackages" :key="pkg.package_id" :value="pkg.id">
									{{ pkg.package_name }} (Tier {{ pkg.tier ?? 1 }})
								</option>
							</select>
						</div>

						<div class="flex justify-end gap-2 pt-1">
							<button type="button" class="px-4 py-2 text-sm rounded-xl hover:bg-mist-blue" @click="closeSponsorModal">Cancel</button>
							<button
								type="submit"
								class="px-4 py-2 text-sm rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-60"
								:disabled="sponsorMutating"
							>
								{{ sponsorModalMode === 'create' ? 'Create Sponsor' : 'Save Sponsor' }}
							</button>
						</div>
					</form>
				</div>
			</div>
		</Teleport>

		<Teleport to="body">
			<div v-if="showPackageModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
				<div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closePackageModal" />
				<div class="relative w-full max-w-xl bg-white border border-deep-navy/10 rounded-2xl shadow-drawn">
					<div class="px-6 py-5 border-b border-navy-50 flex items-center justify-between">
						<h4 class="text-sm font-black text-primary uppercase tracking-widest">
							{{ packageModalMode === 'create' ? 'Add Sponsorship Package' : 'Edit Sponsorship Package' }}
						</h4>
						<button class="p-1.5 rounded-lg hover:bg-mist-blue" @click="closePackageModal">
							<span class="material-symbols-outlined text-base">close</span>
						</button>
					</div>

					<form class="p-6 space-y-4" @submit.prevent="submitPackage">
						<div>
							<label class="block text-xs font-semibold text-navy-600 mb-1">Package Name</label>
							<input
								v-model="packageForm.package_name"
								type="text"
								class="w-full px-3 py-2 rounded-xl border border-navy-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
								placeholder="Gold Sponsor"
								required
							/>
						</div>
						<div>
							<label class="block text-xs font-semibold text-navy-600 mb-1">Description</label>
							<textarea
								v-model="packageForm.package_description"
								rows="3"
								class="w-full px-3 py-2 rounded-xl border border-navy-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
								placeholder="Benefits and visibility included in this package..."
							/>
						</div>
						<div class="grid grid-cols-1 md:grid-cols-3 gap-3">
							<div>
								<label class="block text-xs font-semibold text-navy-600 mb-1">Base Amount</label>
								<input
									v-model="packageForm.base_amount"
									type="number"
									step="0.01"
									min="0"
									class="w-full px-3 py-2 rounded-xl border border-navy-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
									required
								/>
							</div>
							<div>
								<label class="block text-xs font-semibold text-navy-600 mb-1">Currency</label>
								<select
									v-model="packageForm.base_amount_currency"
									class="w-full px-3 py-2 rounded-xl border border-navy-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
								>
									<option v-for="currency in supportedCurrencies" :key="currency" :value="currency">{{ currency }}</option>
								</select>
							</div>
							<div>
								<label class="block text-xs font-semibold text-navy-600 mb-1">Tier</label>
								<input
									v-model.number="packageForm.tier"
									type="number"
									min="1"
									class="w-full px-3 py-2 rounded-xl border border-navy-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
								/>
							</div>
						</div>
						<label class="flex items-center gap-2 text-sm text-navy-700">
							<input v-model="packageForm.active" type="checkbox" class="rounded border-navy-300" />
							Package is active
						</label>

						<div class="flex justify-end gap-2 pt-1">
							<button type="button" class="px-4 py-2 text-sm rounded-xl hover:bg-mist-blue" @click="closePackageModal">Cancel</button>
							<button
								type="submit"
								class="px-4 py-2 text-sm rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-60"
								:disabled="packageMutating"
							>
								{{ packageModalMode === 'create' ? 'Create Package' : 'Save Package' }}
							</button>
						</div>
					</form>
				</div>
			</div>
		</Teleport>
	</EventManagementLayout>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, watch } from 'vue'
import EventManagementLayout from '~/components/events/EventManagementLayout.vue'
import { useEvent } from '~/composables/resources/events/events'
import {
	extractCollection,
	useApproveEventSponsor,
	useCreateEventSponsor,
	useCreateEventSponsorInvite,
	useCreateEventSponsorshipPackage,
	useDeleteEventSponsorInvite,
	useDeleteEventSponsor,
	useDeleteEventSponsorshipPackage,
	useEventSponsorInvites,
	useEventSponsors,
	useEventSponsorshipPackages,
	useRejectEventSponsor,
	useUpdateEventSponsor,
	useUpdateEventSponsorshipPackage,
} from '~/composables/resources/events/eventSponsors'
import {
	useOrganisationSponsorInviteConversionStatistics,
	useOrganisationSponsorPackagesPerformanceStatistics,
	useOrganisationSponsorsOverviewStatistics,
} from '~/composables/statistics/organisations/organisation-statistics'
import { useOrganisations } from '~/composables/resources/organisation/organisations'
import { useLocationChapters } from '~/composables/resources/locations/locationChapters'
import { useCurrentUserEventPermissions } from '~/composables/permissions'
import { formatDate } from '~/utils/time'

definePageMeta({
	layout: false,
})

type SponsorStatus = 'pending' | 'verified' | 'rejected' | 'processed'
type SponsorTab = 'overview' | 'sponsors' | 'packages' | 'invites'

interface EventSponsorItem {
	id: number
	sponsor_id: string
	name: string
	description?: string | null
	organisation: number
	organisation_name?: string
	package?: number | null
	package_name?: string | null
	verification_status?: SponsorStatus
	is_pending: boolean
	is_verified: boolean
	is_rejected: boolean
	can_approve: boolean
	packages_count?: number
}

interface EventSponsorshipPackageItem {
	id: number
	package_id: string
	package_name: string
	package_description?: string | null
	base_amount: string
	base_amount_currency?: string
	active?: boolean
	tier?: number
	sponsors_count?: number
}

interface EventSponsorInviteItem {
	invite_id: string
	email: string
	token: string
	accepted: boolean
	declined: boolean
	is_valid: boolean
	sent_at: string
	organisation_name?: string | null
}

interface SponsorOverviewStats {
	total_sponsors?: number
	unique_organisations_sponsoring?: number
	verification_summary?: Record<string, number>
	payment_summary?: Record<string, number>
	invite_summary?: Record<string, number>
	commitment_amount?: number
	realization_rate?: number
	event_breakdown?: Array<{
		event_id: string
		event_title: string
		sponsors: number
		organisations: number
		completed_revenue: number
	}>
}

interface SponsorInviteConversionStats {
	summary?: Record<string, number>
}

interface SponsorPackagePerformanceStats {
	totals?: Record<string, number>
}

interface OrganisationOption {
	id: number
	title: string
}

interface ChapterOption {
	id: number
	chapter_name: string
	cluster_name: string
}

const route = useRoute()
const toast = useToast()
const id = computed(() => String(route.params.id))

const { can } = useCurrentUserEventPermissions(id)
const canManage = computed(() => can('REGISTRATION', 'update').value.allowed)

const { data: event } = useEvent(id)
const eventInternalId = computed(() => event.value?.data?.id)

const sponsorsQuery = useEventSponsors(id)
const packagesQuery = useEventSponsorshipPackages(id)
const invitesQuery = useEventSponsorInvites(id)

const sponsorStatisticsQuery = computed(() => ({
	event_id: id.value,
	format: 'raw' as const,
}))

const sponsorPackageStatisticsQuery = computed(() => ({
	event_id: id.value,
	format: 'raw' as const,
	limit: 5,
}))

const sponsorOverviewStatisticsQuery = useOrganisationSponsorsOverviewStatistics(sponsorStatisticsQuery)
const sponsorPackagePerformanceStatisticsQuery = useOrganisationSponsorPackagesPerformanceStatistics(sponsorPackageStatisticsQuery)
const sponsorInviteConversionStatisticsQuery = useOrganisationSponsorInviteConversionStatistics(sponsorStatisticsQuery)

const sponsors = computed(() => extractCollection<EventSponsorItem>(sponsorsQuery.data.value?.data))
const sponsorshipPackages = computed(() => extractCollection<EventSponsorshipPackageItem>(packagesQuery.data.value?.data))
const eventInvites = computed(() => extractCollection<EventSponsorInviteItem>(invitesQuery.data.value?.data))
const sponsorOverviewStats = computed(() => (sponsorOverviewStatisticsQuery.data.value?.data || {}) as SponsorOverviewStats)
const sponsorInviteConversionStats = computed(() => (sponsorInviteConversionStatisticsQuery.data.value?.data || {}) as SponsorInviteConversionStats)
const sponsorPackagePerformanceStats = computed(() => (sponsorPackagePerformanceStatisticsQuery.data.value?.data || {}) as SponsorPackagePerformanceStats)

const sponsorVerificationSummary = computed(() => sponsorOverviewStats.value.verification_summary || {})
const sponsorPaymentSummary = computed(() => sponsorOverviewStats.value.payment_summary || {})
const sponsorInviteSummary = computed(() => sponsorOverviewStats.value.invite_summary || {})
const sponsorInviteConversionSummary = computed(() => sponsorInviteConversionStats.value.summary || {})
const sponsorPackageTotals = computed(() => sponsorPackagePerformanceStats.value.totals || {})

const sponsorEventBreakdownRows = computed(() => {
	const rows = sponsorOverviewStats.value.event_breakdown
	if (!Array.isArray(rows)) {
		return []
	}

	return [...rows].sort((a, b) => b.sponsors - a.sponsors)
})

const overviewStatsLoading = computed(() => (
	sponsorOverviewStatisticsQuery.isLoading.value
	|| sponsorInviteConversionStatisticsQuery.isLoading.value
	|| sponsorPackagePerformanceStatisticsQuery.isLoading.value
))

const sponsorsLoading = computed(() => sponsorsQuery.isLoading.value)
const packagesLoading = computed(() => packagesQuery.isLoading.value)
const invitesLoading = computed(() => invitesQuery.isLoading.value)

const activeTab = ref<SponsorTab>('overview')
const outstandingInviteCount = computed(() => eventInvites.value.filter(invite => !invite.accepted && !invite.declined && invite.is_valid).length)
const sponsorTabs = computed(() => ([
	{ id: 'overview' as const, label: 'Overview' },
	{ id: 'sponsors' as const, label: 'Event Sponsors' },
	{ id: 'packages' as const, label: 'Packages' },
	{ id: 'invites' as const, label: 'Invites', count: outstandingInviteCount.value },
]))

const sponsorSearchTerm = ref('')
const sponsorStatusFilter = ref<'all' | SponsorStatus>('all')
const sponsorOrganisationFilter = ref(0)

const sponsorFilterOrganisations = computed(() => {
	const map = new Map<number, string>()
	for (const sponsor of sponsors.value) {
		if (sponsor.organisation && sponsor.organisation_name) {
			map.set(sponsor.organisation, sponsor.organisation_name)
		}
	}
	return Array.from(map.entries())
		.map(([orgId, title]) => ({ id: orgId, title }))
		.sort((a, b) => a.title.localeCompare(b.title))
})

const filteredSponsors = computed(() => {
	const term = sponsorSearchTerm.value.toLowerCase()

	return sponsors.value.filter((sponsor) => {
		const statusOk = sponsorStatusFilter.value === 'all' || sponsor.verification_status === sponsorStatusFilter.value
		const orgOk = sponsorOrganisationFilter.value === 0 || sponsor.organisation === sponsorOrganisationFilter.value
		const searchOk = !term
			|| sponsor.name.toLowerCase().includes(term)
			|| (sponsor.description || '').toLowerCase().includes(term)
			|| (sponsor.organisation_name || '').toLowerCase().includes(term)
			|| (sponsor.package_name || '').toLowerCase().includes(term)

		return statusOk && orgOk && searchOk
	})
})

const createSponsorMutation = useCreateEventSponsor()
const updateSponsorMutation = useUpdateEventSponsor()
const deleteSponsorMutation = useDeleteEventSponsor()
const approveSponsorMutation = useApproveEventSponsor()
const rejectSponsorMutation = useRejectEventSponsor()
const createInviteMutation = useCreateEventSponsorInvite()
const deleteInviteMutation = useDeleteEventSponsorInvite()

const createPackageMutation = useCreateEventSponsorshipPackage()
const updatePackageMutation = useUpdateEventSponsorshipPackage()
const deletePackageMutation = useDeleteEventSponsorshipPackage()

const sponsorMutating = computed(() => {
	return createSponsorMutation.isPending.value
		|| updateSponsorMutation.isPending.value
		|| deleteSponsorMutation.isPending.value
		|| approveSponsorMutation.isPending.value
		|| rejectSponsorMutation.isPending.value
})

const packageMutating = computed(() => {
	return createPackageMutation.isPending.value
		|| updatePackageMutation.isPending.value
		|| deletePackageMutation.isPending.value
})

const inviteMutating = computed(() => {
	return createInviteMutation.isPending.value
		|| deleteInviteMutation.isPending.value
})

const inviteForm = reactive({
	email: '',
	organisation: null as number | null,
	chapter_location: null as number | null,
})

const showSponsorModal = ref(false)
const sponsorModalMode = ref<'create' | 'edit'>('create')
const editingSponsor = ref<EventSponsorItem | null>(null)

const sponsorForm = reactive({
	name: '',
	description: '',
	organisation: null as number | null,
	package: null as number | null,
	chapter_location: null as number | null,
})

const organisationSearchTerm = ref('')
const chapterSearchTerm = ref('')

const organisationQuery = computed(() => ({
	page_size: 20,
	ordering: 'title',
	search: organisationSearchTerm.value || undefined,
}))

const chapterQuery = computed(() => ({
	page_size: 20,
	ordering: 'chapter_name',
	search: chapterSearchTerm.value || undefined,
	active: true,
}))

const organisationsQuery = useOrganisations(organisationQuery)
const chaptersQuery = useLocationChapters(chapterQuery)

const organisationOptions = computed(() => extractCollection<OrganisationOption>(organisationsQuery.data.value?.data))
const chapterOptions = computed(() => extractCollection<ChapterOption>(chaptersQuery.data.value?.data))

const selectedOrganisationLabel = computed(() => {
	if (!sponsorForm.organisation) {
		return ''
	}
	const selected = organisationOptions.value.find(org => org.id === sponsorForm.organisation)
	if (selected) {
		return `${selected.title} (ID ${selected.id})`
	}
	return `Organisation ID ${sponsorForm.organisation}`
})

const selectedChapterLabel = computed(() => {
	if (!sponsorForm.chapter_location) {
		return ''
	}
	const selected = chapterOptions.value.find(chapter => chapter.id === sponsorForm.chapter_location)
	if (selected) {
		return `${selected.chapter_name} (${selected.cluster_name})`
	}
	return `Chapter ID ${sponsorForm.chapter_location}`
})

watch(
	() => event.value?.data?.organisation,
	(organisationId) => {
		if (organisationId && sponsorModalMode.value === 'create' && !sponsorForm.organisation) {
			sponsorForm.organisation = organisationId
		}
		if (organisationId && !inviteForm.organisation) {
			inviteForm.organisation = organisationId
		}
	},
	{ immediate: true },
)

const showPackageModal = ref(false)
const packageModalMode = ref<'create' | 'edit'>('create')
const editingPackage = ref<EventSponsorshipPackageItem | null>(null)

const packageForm = reactive({
	package_name: '',
	package_description: '',
	base_amount: '',
	base_amount_currency: 'GBP',
	active: true,
	tier: 1,
})

const supportedCurrencies = ['GBP', 'USD', 'EUR']

function resetSponsorForm() {
	sponsorForm.name = ''
	sponsorForm.description = ''
	sponsorForm.organisation = event.value?.data?.organisation || null
	sponsorForm.package = null
	sponsorForm.chapter_location = null
	organisationSearchTerm.value = ''
	chapterSearchTerm.value = ''
}

function resetInviteForm() {
	inviteForm.email = ''
	inviteForm.organisation = event.value?.data?.organisation || null
	inviteForm.chapter_location = null
}

function resetPackageForm() {
	packageForm.package_name = ''
	packageForm.package_description = ''
	packageForm.base_amount = ''
	packageForm.base_amount_currency = 'GBP'
	packageForm.active = true
	packageForm.tier = 1
}

function openCreateSponsorModal() {
	sponsorModalMode.value = 'create'
	editingSponsor.value = null
	resetSponsorForm()
	showSponsorModal.value = true
}

function openEditSponsorModal(sponsor: EventSponsorItem) {
	sponsorModalMode.value = 'edit'
	editingSponsor.value = sponsor
	sponsorForm.name = sponsor.name
	sponsorForm.description = sponsor.description || ''
	sponsorForm.organisation = sponsor.organisation
	sponsorForm.package = sponsor.package ?? null
	sponsorForm.chapter_location = null
	organisationSearchTerm.value = sponsor.organisation_name || ''
	chapterSearchTerm.value = ''
	showSponsorModal.value = true
}

function closeSponsorModal() {
	showSponsorModal.value = false
}

function openCreatePackageModal() {
	packageModalMode.value = 'create'
	editingPackage.value = null
	resetPackageForm()
	showPackageModal.value = true
}

function openEditPackageModal(pkg: EventSponsorshipPackageItem) {
	packageModalMode.value = 'edit'
	editingPackage.value = pkg
	packageForm.package_name = pkg.package_name
	packageForm.package_description = pkg.package_description || ''
	packageForm.base_amount = pkg.base_amount
	packageForm.base_amount_currency = pkg.base_amount_currency || 'GBP'
	packageForm.active = Boolean(pkg.active)
	packageForm.tier = pkg.tier || 1
	showPackageModal.value = true
}

function closePackageModal() {
	showPackageModal.value = false
}

async function submitSponsor() {
	if (!eventInternalId.value) {
		toast.add({ title: 'Event not loaded', color: 'red' })
		return
	}

	if (!sponsorForm.organisation) {
		toast.add({ title: 'Organisation is required', color: 'red' })
		return
	}

	const body = {
		name: sponsorForm.name,
		description: sponsorForm.description || null,
		organisation: sponsorForm.organisation,
		event: Number(eventInternalId.value),
		package: sponsorForm.package ?? null,
		chapter_location: sponsorForm.chapter_location ?? null,
	}

	try {
		if (sponsorModalMode.value === 'create') {
			await createSponsorMutation.mutateAsync({ eventId: id.value, body })
			toast.add({ title: 'Sponsor created', color: 'green' })
		}
		else {
			if (!editingSponsor.value) {
				return
			}
			await updateSponsorMutation.mutateAsync({
				eventId: id.value,
				sponsorId: editingSponsor.value.sponsor_id,
				body,
			})
			toast.add({ title: 'Sponsor updated', color: 'green' })
		}
		closeSponsorModal()
	}
	catch (error: unknown) {
		toast.add({
			title: 'Could not save sponsor',
			description: getErrorMessage(error, 'Please review fields and try again.'),
			color: 'red',
		})
	}
}

async function submitPackage() {
	if (!eventInternalId.value) {
		toast.add({ title: 'Event not loaded', color: 'red' })
		return
	}

	const body = {
		event: Number(eventInternalId.value),
		package_name: packageForm.package_name,
		package_description: packageForm.package_description || null,
		base_amount: packageForm.base_amount,
		base_amount_currency: packageForm.base_amount_currency,
		active: packageForm.active,
		tier: packageForm.tier || 1,
	}

	try {
		if (packageModalMode.value === 'create') {
			await createPackageMutation.mutateAsync({ eventId: id.value, body })
			toast.add({ title: 'Package created', color: 'green' })
		}
		else {
			if (!editingPackage.value) {
				return
			}
			await updatePackageMutation.mutateAsync({
				eventId: id.value,
				packageId: editingPackage.value.package_id,
				body,
			})
			toast.add({ title: 'Package updated', color: 'green' })
		}
		closePackageModal()
	}
	catch (error: unknown) {
		toast.add({
			title: 'Could not save package',
			description: getErrorMessage(error, 'Please review fields and try again.'),
			color: 'red',
		})
	}
}

async function deleteSponsor(sponsor: EventSponsorItem) {
	if (!window.confirm(`Delete sponsor "${sponsor.name}"?`)) {
		return
	}

	try {
		await deleteSponsorMutation.mutateAsync({
			eventId: id.value,
			sponsorId: sponsor.sponsor_id,
		})
		toast.add({ title: 'Sponsor deleted', color: 'green' })
	}
	catch (error: unknown) {
		toast.add({
			title: 'Could not delete sponsor',
			description: getErrorMessage(error, 'Sponsor could not be deleted.'),
			color: 'red',
		})
	}
}

async function deletePackage(pkg: EventSponsorshipPackageItem) {
	if (!window.confirm(`Delete package "${pkg.package_name}"?`)) {
		return
	}

	try {
		await deletePackageMutation.mutateAsync({
			eventId: id.value,
			packageId: pkg.package_id,
		})
		toast.add({ title: 'Package deleted', color: 'green' })
	}
	catch (error: unknown) {
		toast.add({
			title: 'Could not delete package',
			description: getErrorMessage(error, 'This package may already be used by payments or sponsors.'),
			color: 'red',
		})
	}
}

async function createInvite() {
	if (!eventInternalId.value) {
		toast.add({ title: 'Event not loaded', color: 'red' })
		return
	}

	if (!inviteForm.email) {
		toast.add({ title: 'Invite email is required', color: 'red' })
		return
	}

	try {
		await createInviteMutation.mutateAsync({
			body: {
				event: Number(eventInternalId.value),
				email: inviteForm.email,
				organisation: inviteForm.organisation,
				chapter_location: inviteForm.chapter_location,
			},
		})
		toast.add({ title: 'Sponsor invite sent', color: 'green' })
		resetInviteForm()
	}
	catch (error: unknown) {
		toast.add({
			title: 'Could not send invite',
			description: getErrorMessage(error, 'Please review the invite details and try again.'),
			color: 'red',
		})
	}
}

async function deleteInvite(inviteId: string) {
	if (!window.confirm('Delete this sponsor invite?')) {
		return
	}

	try {
		await deleteInviteMutation.mutateAsync({ inviteId })
		toast.add({ title: 'Sponsor invite deleted', color: 'green' })
	}
	catch (error: unknown) {
		toast.add({
			title: 'Could not delete invite',
			description: getErrorMessage(error, 'Invite could not be deleted.'),
			color: 'red',
		})
	}
}

async function copyInviteToken(token: string) {
	try {
		await navigator.clipboard.writeText(token)
		toast.add({ title: 'Invite token copied', color: 'green' })
	}
	catch {
		toast.add({ title: 'Could not copy invite token', color: 'red' })
	}
}

async function approveSponsor(sponsor: EventSponsorItem) {
	try {
		await approveSponsorMutation.mutateAsync({ eventId: id.value, sponsorId: sponsor.sponsor_id })
		toast.add({ title: `${sponsor.name} approved`, color: 'green' })
	}
	catch (error: unknown) {
		toast.add({
			title: 'Could not approve sponsor',
			description: getErrorMessage(error, 'Approval request failed.'),
			color: 'red',
		})
	}
}

async function rejectSponsor(sponsor: EventSponsorItem) {
	try {
		await rejectSponsorMutation.mutateAsync({ eventId: id.value, sponsorId: sponsor.sponsor_id })
		toast.add({ title: `${sponsor.name} rejected`, color: 'green' })
	}
	catch (error: unknown) {
		toast.add({
			title: 'Could not reject sponsor',
			description: getErrorMessage(error, 'Rejection request failed.'),
			color: 'red',
		})
	}
}

function statusBadgeClass(status: SponsorStatus | undefined) {
	if (status === 'verified') {
		return 'bg-green-100 text-green-700'
	}
	if (status === 'rejected') {
		return 'bg-rose-100 text-rose-700'
	}
	if (status === 'processed') {
		return 'bg-indigo-100 text-indigo-700'
	}
	return 'bg-amber-100 text-amber-700'
}

function inviteStatusLabel(invite: EventSponsorInviteItem) {
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

function inviteStatusClass(invite: EventSponsorInviteItem) {
	if (invite.accepted) {
		return 'bg-green-100 text-green-700'
	}
	if (invite.declined) {
		return 'bg-rose-100 text-rose-700'
	}
	if (!invite.is_valid) {
		return 'bg-navy-100 text-navy-600'
	}
	return 'bg-amber-100 text-amber-700'
}

function formatInviteDate(value?: string) {
	if (!value) {
		return 'Unknown'
	}

	return formatDate(value)
}

function formatMoney(value: string | number | undefined | null, currency = 'GBP') {
	const amount = Number(value || 0)
	if (Number.isNaN(amount)) {
		return '0.00'
	}
	return amount.toLocaleString(undefined, {
		style: 'currency',
		currency,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	})
}

function formatPercent(value: number | string | undefined | null) {
	const amount = Number(value || 0)
	if (Number.isNaN(amount)) {
		return '0.00%'
	}
	return `${amount.toFixed(2)}%`
}

function getErrorMessage(error: unknown, fallback: string) {
	if (error && typeof error === 'object') {
		const err = error as { body?: { detail?: string }; message?: string }
		if (err.body?.detail) {
			return err.body.detail
		}
		if (err.message) {
			return err.message
		}
	}
	return fallback
}
</script>
