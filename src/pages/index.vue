<template>
  <div>
    <!-- Main Content -->
    <main>
        <!-- Hero Section -->
        <section class="max-w-7xl mx-auto px-6 lg:px-10 py-20 lg:py-12">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <!-- Hero Text -->
            <div class="flex flex-col gap-8 order-2 lg:order-1">
              <div class="inline-flex items-center gap-2 text-primary border border-primary/40 bg-navy-accent/40 px-3 py-1 w-fit rounded-full text-[10px] uppercase tracking-[0.3em] font-bold">
                <span class="relative flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                BETA V.1.0
              </div>

              <h1 class="text-5xl lg:text-7xl font-bold leading-[1.1] text-white">
                AMDG: The <span class="gold-gradient-text italic">Digital Engine</span> behind every gathering.
              </h1>

              <p class="text-xl text-white/70 leading-relaxed max-w-xl">
                The Catholic Event Framework designed to architect, manage, and elevate spiritual gatherings worldwide with precision and grace.
              </p>

              <div class="flex flex-wrap gap-4 mt-4">
                <UButton 
                  label="My Dashboard"
                  icon="i-heroicons-document-text"
                  size="lg"
                  class="bg-primary text-background-dark px-8 py-4 rounded-sm font-bold uppercase tracking-widest text-sm shadow-lg shadow-primary/10"
                />
                <UButton 
                  label="Events"
                  icon="i-heroicons-map"
                  variant="outline"
                  size="lg"
                  class="border border-primary/50 text-primary px-8 py-4 rounded-sm font-bold uppercase tracking-widest text-sm hover:bg-primary/10 transition-colors"
                />
              </div>
            </div>

            <!-- Hero Image -->
            <div class="relative order-1 lg:order-2">
              <div class="absolute -inset-4 border border-primary/20 rounded-xl"></div>
              <div class="relative aspect-square w-full rounded-lg bg-navy-accent/30 border border-primary/30 overflow-hidden flex items-center justify-center p-8 group">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCE7Reuz_Sk3k1PcNhob_p03galHggz1HkaNZmJNGXhr_SXRT2-rd9ZACB4JQvY_x3fHtMNRw7FDTu1QcCHmLm0J7K1ISnSvsw-2I-QlJFj_0K9iYDCWMGK8W63n_79lLr8i5Zl6S2uHoewsqztqxsDgY90hbN53-tnpmtXMpsaZRWDNjm8pFBlpsQp-2A337vWYMRlqrZyWqixlXwqT2FSyAnpMlq4ilnOc6prBLsPM4WOZkJf7chCwWPjCBzDF9QGci1rOGTsRjNY" 
                  alt="Cathedral Blueprint"
                  class="w-full h-full object-cover border border-primary/20 transition-transform duration-1000 group-hover:scale-105"
                />
                <div class="absolute inset-0 bg-background-dark/30 group-hover:bg-background-dark/10 transition-colors"></div>
                <div class="absolute top-4 left-4 text-[10px] text-primary/60 font-mono tracking-tighter">SEC: 04 // ELEV: 1200'</div>
                <div class="absolute bottom-4 right-4 text-[10px] text-primary/60 font-mono tracking-tighter">REF: CATHEDRAL_BLUEPRINT_A1</div>
              </div>
            </div>
          </div>
        </section>

        <!-- Divider -->
        <div class="max-w-7xl mx-auto px-6 lg:px-10 py-10">
          <div class="flex items-center gap-4">
            <div class="h-px flex-1 bg-primary/20"></div>
            <UIcon name="i-heroicons-plus" class="text-primary/60" />
            <div class="h-px flex-1 bg-primary/20"></div>
          </div>
        </div>

        <!-- Upcoming Missions Section -->
        <section id="missions" class="max-w-7xl mx-auto px-6 lg:px-10 py-20">
          <div class="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 class="text-sm font-bold uppercase tracking-[0.4em] text-primary mb-4">Phase II</h2>
              <h3 class="text-4xl font-bold text-white">Upcoming Missions</h3>
            </div>
            <div class="flex gap-2">
              <button class="size-12 rounded-full border border-primary/30 flex items-center justify-center text-primary hover:bg-primary/10 transition-colors bg-navy-accent/20">
                <UIcon name="i-heroicons-arrow-left" />
              </button>
              <button class="size-12 rounded-full border border-primary/30 flex items-center justify-center text-primary hover:bg-primary/10 transition-colors bg-navy-accent/20">
                <UIcon name="i-heroicons-arrow-right" />
              </button>
            </div>
          </div>

          <div class="flex overflow-x-auto gap-8 pb-10 no-scrollbar">
            <!-- Event Card 1 -->
            <div v-for="event in upcomingEvents" :key="event.id" class="min-w-[320px] md:min-w-[400px] group">
              <div class="relative aspect-[16/10] mb-6 overflow-hidden border border-primary/30 rounded-sm">
                <div class="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
                     :style="`background-image: url('${event.image}');`">
                </div>
                <div class="absolute inset-0 bg-background-dark/50 group-hover:bg-background-dark/30 transition-colors"></div>
                <div class="absolute top-4 right-4 bg-background-dark/95 border border-primary/60 px-3 py-1 rounded-sm">
                  <span class="text-[10px] font-bold uppercase tracking-widest text-primary">{{ event.date }}</span>
                </div>
              </div>
              <div class="border-l-2 border-primary/30 pl-6">
                <h4 class="text-2xl font-bold text-white mb-2 group-hover:text-primary transition-colors">{{ event.title }}</h4>
                <p class="text-white/60 text-sm leading-relaxed mb-4">{{ event.description }}</p>
                <div class="flex items-center gap-4">
                  <span class="text-[10px] uppercase font-bold tracking-widest text-primary/70">Status: {{ event.status }}</span>
                  <div class="h-1 w-1 rounded-full bg-primary/40"></div>
                  <span class="text-[10px] uppercase font-bold tracking-widest text-primary/70">Loc: {{ event.location }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Foundation Section -->
        <section id="foundation" class="bg-navy-accent/20 py-24 border-y border-primary/10">
          <div class="max-w-7xl mx-auto px-6 lg:px-10">
            <div class="text-center mb-20">
              <h2 class="text-sm font-bold uppercase tracking-[0.5em] text-primary mb-4">Structural Integrity</h2>
              <h3 class="text-5xl font-bold text-white">Our Foundation</h3>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div v-for="pillar in foundationPillars" :key="pillar.id" class="flex flex-col gap-6 p-8 border border-primary/20 bg-background-dark/60 rounded-sm relative group overflow-hidden">
                <div class="absolute top-0 right-0 p-2 text-primary/5 font-mono text-4xl">{{ pillar.number }}</div>
                <UIcon :name="pillar.icon" class="text-4xl text-primary" />
                <h4 class="text-xl font-bold text-white uppercase tracking-wider">{{ pillar.title }}</h4>
                <p class="text-white/60 leading-relaxed">{{ pillar.description }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Parish Network Section -->
        <section id="network" class="max-w-7xl mx-auto px-6 lg:px-10 py-24">
          <div class="border border-primary/30 rounded-lg overflow-hidden relative min-h-[500px] flex items-center justify-center bg-navy-accent/10">
            <div class="absolute inset-0 bg-cover bg-center opacity-25" 
                 style="background-image: url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200');">
            </div>
            <div class="absolute inset-0 blueprint-grid opacity-30"></div>
            
            <div class="relative z-10 text-center max-w-2xl px-6">
              <div class="mb-8 inline-block border border-primary/60 px-4 py-2 text-primary font-mono text-xs uppercase tracking-[0.3em] bg-background-dark/90">
                System Status: Active // 4,209 Nodes Connected
              </div>
              <h2 class="text-4xl font-bold text-white mb-6">The Global Parish Network</h2>
              <p class="text-white/70 mb-10 leading-relaxed text-lg">
                Every parish is a vital component in the sacred blueprint. Our network provides the infrastructure for spiritual collaboration across borders.
              </p>
              <UButton 
                label="Locate Your Parish"
                size="lg"
                class="bg-primary text-background-dark px-10 py-4 rounded-sm font-bold uppercase tracking-[0.2em] text-sm hover:scale-105 transition-transform shadow-xl shadow-primary/10"
              />
            </div>

            <div class="absolute top-10 left-10 text-[8px] font-mono text-primary/50 uppercase leading-loose hidden sm:block">
              // INITIALIZING NETWORK_GRID...<br/>
              // SCANNING LAT/LONG COORDS...<br/>
              // ESTABLISHING CONNECTION...
            </div>
            <div class="absolute bottom-10 right-10 text-[8px] font-mono text-primary/50 uppercase leading-loose hidden sm:block text-right">
              // DATA_ENCRYPTION: ACTIVE<br/>
              // SYNC_STATUS: CALIBRATED<br/>
              // BUFFER_ZONE: 100%
            </div>
          </div>
        </section>
      </main>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  layout: 'default',
})

// Placeholder data for upcoming events
const upcomingEvents = ref([
  {
    id: 1,
    title: 'St. Jude Mission',
    description: 'Architectural Workshop & Sacred Geometry Seminar.',
    date: 'Oct 24',
    status: 'Enrolling',
    location: '41.8° N',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'
  },
  {
    id: 2,
    title: 'Vatican Council Plan',
    description: 'A symphonic masterclass in Sacred Music and Polyphony.',
    date: 'Nov 12',
    status: 'Finalizing',
    location: '41.9° N',
    image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800'
  },
  {
    id: 3,
    title: 'Grace Cathedral Summit',
    description: 'Theology Seminar: Architecting Grace in Modernity.',
    date: 'Dec 05',
    status: 'Open',
    location: '37.7° N',
    image: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800'
  }
])

// Foundation pillars data
const foundationPillars = ref([
  {
    id: 1,
    number: '01',
    icon: 'i-heroicons-building-library',
    title: 'Tradition as Granite',
    description: 'We build upon 2,000 years of liturgical precision and spiritual architectural excellence that cannot be moved.'
  },
  {
    id: 2,
    number: '02',
    icon: 'i-heroicons-building-office-2',
    title: 'Modern Specifications',
    description: 'Leveraging modern event-planning technology to host seamless, high-impact spiritual summits worldwide.'
  },
  {
    id: 3,
    number: '03',
    icon: 'i-heroicons-users',
    title: 'The Parish Network',
    description: 'A unified blueprint connecting individual parishes into a powerful, synchronized global movement.'
  }
])
</script>

<style scoped>
.gold-gradient-text {
  background: linear-gradient(to bottom, #fceabb 0%, #ecc813 50%, #c49300 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
