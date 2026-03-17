<template>
	<EventManagementLayout :event-id="id" :event="event?.data">
		<div class="grid grid-cols-1 xl:grid-cols-12 gap-8 pb-20">
			<section class="xl:col-span-12 bg-white border border-deep-navy/10 rounded-2xl p-6 shadow-drawn">
				<div class="flex items-center justify-between mb-6">
					<div>
						<h2 class="text-sm font-black text-primary uppercase tracking-widest">Sponsor Overview</h2>
						<p class="text-xs text-navy-400 mt-1">Track package uptake, approval progress, and sponsor value.</p>
					</div>
				</div>

				<div class="grid grid-cols-2 lg:grid-cols-5 gap-3">
					<div class="p-4 rounded-xl border border-navy-100 bg-mist-blue/40">
						<p class="text-[10px] uppercase tracking-wide text-navy-400 font-bold">Sponsors</p>
						<p class="text-2xl font-black text-navy-900 mt-1">{{ sponsors.length }}</p>
					</div>
					<div class="p-4 rounded-xl border border-navy-100 bg-amber-50/70">
						<p class="text-[10px] uppercase tracking-wide text-amber-700 font-bold">Pending</p>
						<p class="text-2xl font-black text-amber-700 mt-1">{{ pendingSponsors }}</p>
					</div>
					<div class="p-4 rounded-xl border border-navy-100 bg-green-50/70">
						<p class="text-[10px] uppercase tracking-wide text-green-700 font-bold">Verified</p>
						<p class="text-2xl font-black text-green-700 mt-1">{{ verifiedSponsors }}</p>
					</div>
					<div class="p-4 rounded-xl border border-navy-100 bg-indigo-50/70">
						<p class="text-[10px] uppercase tracking-wide text-indigo-700 font-bold">Packages</p>
						<p class="text-2xl font-black text-indigo-700 mt-1">{{ sponsorshipPackages.length }}</p>
					</div>
					<div class="p-4 rounded-xl border border-navy-100 bg-emerald-50/70">
						<p class="text-[10px] uppercase tracking-wide text-emerald-700 font-bold">Net Revenue</p>
						<p class="text-2xl font-black text-emerald-700 mt-1">{{ formatMoney(performanceData?.total_net_revenue) }}</p>
					</div>
				</div>
			</section>

			<section class="xl:col-span-12 bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
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

				<div v-else-if="eventInvites.length" class="divide-y divide-navy-50">
					<div
						v-for="invite in eventInvites"
						:key="invite.invite_id"
						class="px-6 py-4 flex items-start justify-between gap-4 hover:bg-mist-blue/30 transition-colors"
					>
						<div class="min-w-0">
							<div class="flex items-center gap-2 flex-wrap">
								<h4 class="text-sm font-bold text-navy-900">{{ invite.email }}</h4>
								<span class="text-[10px] px-2 py-1 rounded-full font-semibold" :class="inviteStatusClass(invite)">
									{{ inviteStatusLabel(invite) }}
								</span>
							</div>
							<p class="text-xs text-navy-500 mt-1">Organisation: {{ invite.organisation_name || 'Not linked' }}</p>
							<div class="mt-2 text-[11px] text-navy-500 flex items-center gap-3 flex-wrap">
								<span>Sent: {{ formatInviteDate(invite.sent_at) }}</span>
								<span>Token: <strong class="text-navy-800">{{ invite.token }}</strong></span>
							</div>
						</div>
						<div class="flex items-center gap-2">
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
					</div>
				</div>

				<div v-else class="p-10 text-center text-navy-500">
					<span class="material-symbols-outlined text-4xl text-navy-300 mb-2 block">mail</span>
					<p class="text-sm">No sponsor invites sent for this event.</p>
					<p class="text-xs text-navy-400 mt-1">Use invites to let organisations accept sponsorship by token.</p>
				</div>
			</section>

			<section class="xl:col-span-5 bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
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

				<div v-else-if="sponsorshipPackages.length" class="divide-y divide-navy-50">
					<div
						v-for="pkg in sponsorshipPackages"
						:key="pkg.package_id"
						class="px-6 py-4 flex items-start justify-between gap-4 hover:bg-mist-blue/30 transition-colors"
					>
						<div class="min-w-0">
							<div class="flex items-center gap-2 flex-wrap">
								<h4 class="text-sm font-bold text-navy-900">{{ pkg.package_name }}</h4>
								<span class="text-[10px] px-2 py-1 rounded-full font-semibold"
									:class="pkg.active ? 'bg-green-100 text-green-700' : 'bg-navy-100 text-navy-600'"
								>
									{{ pkg.active ? 'Active' : 'Inactive' }}
								</span>
								<span class="text-[10px] px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 font-semibold">
									Tier {{ pkg.tier ?? 1 }}
								</span>
							</div>
							<p class="text-xs text-navy-500 mt-1">{{ pkg.package_description || 'No package description provided.' }}</p>
							<div class="mt-3 flex items-center gap-4 text-xs text-navy-500">
								<span>Base: <strong class="text-navy-800">{{ formatMoney(pkg.base_amount) }}</strong></span>
								<span>Sponsors: <strong class="text-navy-800">{{ pkg.sponsors_count ?? 0 }}</strong></span>
							</div>
						</div>
						<div class="flex items-center gap-2">
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
					</div>
				</div>

				<div v-else class="p-10 text-center text-navy-500">
					<span class="material-symbols-outlined text-4xl text-navy-300 mb-2 block">sell</span>
					<p class="text-sm">No sponsorship packages configured.</p>
					<p class="text-xs text-navy-400 mt-1">Create packages first, then assign them to sponsors.</p>
				</div>
			</section>

			<section class="xl:col-span-7 bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
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
					<div v-for="i in 4" :key="i" class="h-24 rounded-xl bg-mist-blue/60 animate-pulse" />
				</div>

				<div v-else-if="filteredSponsors.length" class="divide-y divide-navy-50">
					<div
						v-for="sponsor in filteredSponsors"
						:key="sponsor.sponsor_id"
						class="px-6 py-4 flex items-start justify-between gap-4 hover:bg-mist-blue/30 transition-colors"
					>
						<div class="min-w-0">
							<div class="flex items-center gap-2 flex-wrap">
								<h4 class="text-sm font-bold text-navy-900">{{ sponsor.name }}</h4>
								<span
									class="text-[10px] px-2 py-1 rounded-full font-semibold"
									:class="statusBadgeClass(sponsor.verification_status)"
								>
									{{ sponsor.verification_status || 'pending' }}
								</span>
							</div>
							<p class="text-xs text-navy-500 mt-1">{{ sponsor.description || 'No sponsor description provided.' }}</p>
							<div class="mt-3 flex items-center gap-4 text-xs text-navy-500 flex-wrap">
								<span>Organisation ID: <strong class="text-navy-800">{{ sponsor.organisation }}</strong></span>
								<span>
									Package:
									<strong class="text-navy-800">{{ sponsor.package_name || 'Unassigned' }}</strong>
								</span>
								<span>Packages owned: <strong class="text-navy-800">{{ sponsor.packages_count ?? 0 }}</strong></span>
							</div>
						</div>

						<div class="flex items-center gap-2 flex-wrap justify-end">
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
					</div>
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
								<label class="block text-xs font-semibold text-navy-600 mb-1">Modifier %</label>
								<input
									v-model="packageForm.percentage_modifier"
									type="number"
									step="0.1"
									class="w-full px-3 py-2 rounded-xl border border-navy-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
								/>
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
	useEventSponsorPackagePerformance,
	useEventSponsors,
	useEventSponsorshipPackages,
	useRejectEventSponsor,
	useUpdateEventSponsor,
	useUpdateEventSponsorshipPackage,
} from '~/composables/resources/events/eventSponsors'
import { useOrganisations } from '~/composables/resources/organisation/organisations'
import { useLocationChapters } from '~/composables/resources/locations/locationChapters'
import { useCurrentUserEventPermissions } from '~/composables/permissions'
import { formatDate } from '~/utils/time'

definePageMeta({
	layout: false,
})

type SponsorStatus = 'pending' | 'verified' | 'rejected' | 'processed'

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
	percentage_modifier?: string
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

interface SponsorPerformance {
	total_net_revenue?: string
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
const performanceQuery = useEventSponsorPackagePerformance(computed(() => ({ event_id: id.value })))

const sponsors = computed(() => extractCollection<EventSponsorItem>(sponsorsQuery.data.value?.data))
const sponsorshipPackages = computed(() => extractCollection<EventSponsorshipPackageItem>(packagesQuery.data.value?.data))
const eventInvites = computed(() => extractCollection<EventSponsorInviteItem>(invitesQuery.data.value?.data))
const performanceData = computed(() => (performanceQuery.data.value?.data || {}) as SponsorPerformance)

const sponsorsLoading = computed(() => sponsorsQuery.isLoading.value)
const packagesLoading = computed(() => packagesQuery.isLoading.value)
const invitesLoading = computed(() => invitesQuery.isLoading.value)

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

const pendingSponsors = computed(() => sponsors.value.filter(s => s.verification_status === 'pending').length)
const verifiedSponsors = computed(() => sponsors.value.filter(s => s.verification_status === 'verified').length)

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
	percentage_modifier: '',
	active: true,
	tier: 1,
})

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
	packageForm.percentage_modifier = ''
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
	packageForm.percentage_modifier = pkg.percentage_modifier || ''
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
		percentage_modifier: packageForm.percentage_modifier || '0',
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

function formatMoney(value: string | number | undefined | null) {
	const amount = Number(value || 0)
	if (Number.isNaN(amount)) {
		return '0.00'
	}
	return amount.toLocaleString(undefined, {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	})
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
