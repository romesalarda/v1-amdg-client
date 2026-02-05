<template>
  <div>
    <!-- Main Content -->
    <main>
        <!-- Hero Section -->
        <section class="max-w-5xl mx-auto px-6 lg:px-10 py-2 lg:py-16 text-center">
          <div class="mb-6 flex justify-center items-center gap-4 opacity-40">
            <div class="h-[1px] w-12 bg-primary"></div>
            <span class="text-[10px] uppercase tracking-[0.5em] text-primary">Technical Order & Divine Grace</span>
            <div class="h-[1px] w-12 bg-primary"></div>
          </div>

          <h1 class="text-white font-light text-5xl md:text-7xl leading-tight mb-8">
            The <span class="gold-gradient-text italic font-black glow-gold">Digital Engine</span><br/>
            behind every Catholic gathering
          </h1>

          <p class="max-w-2xl mx-auto text-white/60 text-lg leading-relaxed">
            Building the architectural foundation for Catholic fellowship through technical precision and divine order.
          </p>

          <!-- <div class="flex justify-center gap-6">
            <UButton 
              label="View Events"
              size="lg"
              class="bg-primary text-background-dark px-10 py-4 font-bold uppercase tracking-widest text-sm hover:scale-105 transition-transform"
            />
          </div> -->
        </section>

        <!-- About Us Section -->
        <section class="max-w-4xl mx-auto px-6 lg:px-10 mb-12">
          <div class="architectural-border p-12 bg-background-dark/80">
            <div class="flex flex-col md:flex-row gap-12 items-start">
              <div class="md:w-1/3">
                <h2 class="text-primary font-display text-3xl font-bold mb-4">About Us</h2>
                <div class="w-12 h-1 bg-primary mb-6"></div>
                <div class="text-[10px] text-primary/50 font-mono space-y-1 uppercase tracking-tighter">
                  <p>SCALE: 1:1 SPIRITUAL</p>
                  <p>REF: VATICAN II</p>
                  <p>COORD: 41.9029° N, 12.4534° E</p>
                </div>
              </div>
              <div class="md:w-2/3">
                <p class="text-white/80 font-display text-xl leading-relaxed italic mb-6">
                  "Our mission is to provide the digital scaffolding that allows faith-based communities to flourish, combining modern technology with timeless tradition."
                </p>
                <p class="text-white/60 leading-relaxed">
                  AMDG is a platform dedicated to the technical and spiritual success of Catholic events. We believe that technology, when ordered toward the good, serves as the modern cathedral—a space for assembly, prayer, and community growth. Every line of code is written <i>Ad Maiorem Dei Gloriam</i>.
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- Upcoming Missions Section -->
        <!-- <section id="missions" class="max-w-7xl mx-auto px-6 lg:px-10 py-20">
          <div class="text-center mb-16">
            <div class="flex items-center justify-center gap-4 mb-4">
              <div class="h-[1px] w-12 bg-primary/40"></div>
              <h2 class="text-[10px] font-bold uppercase tracking-[0.5em] text-primary">Phase II</h2>
              <div class="h-[1px] w-12 bg-primary/40"></div>
            </div>
            <h3 class="text-4xl font-bold text-white">Upcoming Missions</h3>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div v-for="event in upcomingEvents" :key="event.id" class="group">
              <div class="relative aspect-[16/10] mb-6 overflow-hidden border border-primary/30">
                <div class="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
                     :style="`background-image: url('${event.image}');`">
                </div>
                <div class="absolute inset-0 bg-background-dark/50 group-hover:bg-background-dark/30 transition-colors"></div>
                <div class="absolute top-4 right-4 bg-background-dark/95 border border-primary/60 px-3 py-1">
                  <span class="text-[10px] font-bold uppercase tracking-widest text-primary">{{ event.date }}</span>
                </div>
              </div>
              <div class="border-l-2 border-primary pl-6">
                <h4 class="text-2xl font-bold text-white mb-2 group-hover:text-primary transition-colors">{{ event.title }}</h4>
                <p class="text-white/60 text-sm leading-relaxed mb-4">{{ event.description }}</p>
                <div class="flex items-center gap-4">
                  <span class="text-[10px] uppercase font-bold tracking-widest text-primary/70">Status: {{ event.status }}</span>
                  <div class="h-1 w-1 rounded-full bg-primary/40"></div>
                  <span class="text-[10px] uppercase font-bold tracking-widest text-primary/70">{{ event.location }}</span>
                </div>
              </div>
            </div>
          </div>
        </section> -->

        <!-- Foundation Section -->
        <section id="foundation" class="max-w-6xl mx-auto px-6 lg:px-10 py-24">
          <div class="text-center mb-16">
            <h2 class="text-white font-display text-4xl font-bold mb-2">Our Foundation</h2>
            <p class="text-primary/60 text-xs uppercase tracking-[0.3em]">Built upon the rock of tradition</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div v-for="pillar in foundationPillars" :key="pillar.id" class="group relative p-8 border border-primary/10 hover:border-primary/40 transition-all duration-500">
              <div class="absolute top-4 right-4 text-primary/20 group-hover:text-primary transition-colors">
                <UIcon :name="pillar.icon" class="text-4xl" />
              </div>
              <h3 class="text-primary font-display text-xl font-bold mb-4 uppercase tracking-wider">{{ pillar.title }}</h3>
              <p class="text-white/50 text-sm leading-relaxed">{{ pillar.description }}</p>
              <div class="mt-6 pt-6 border-t border-primary/10 flex items-center justify-between text-[10px] font-mono text-primary/40">
                <span>DRAWING NO. {{ pillar.number }}</span>
                <span>{{ pillar.status }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Parish Network Section -->
        <section id="network" class="max-w-4xl mx-auto px-6 lg:px-10 py-24">
          <div class="architectural-border p-12 bg-background-dark/60 text-center">
            <div class="mb-8 inline-block border border-primary/60 px-4 py-2 text-primary font-mono text-xs uppercase tracking-[0.3em]">
              System Status: Active // 4,209 Nodes
            </div>
            <h2 class="text-4xl font-bold text-white mb-6">The Global Parish Network</h2>
            <p class="text-white/60 mb-10 leading-relaxed max-w-2xl mx-auto">
              Every parish is a vital component in the sacred blueprint. Our network provides the infrastructure for spiritual collaboration across borders.
            </p>
            <UButton 
              label="Locate Your Parish"
              size="lg"
              class="bg-primary text-background-dark px-10 py-4 font-bold uppercase tracking-[0.2em] text-sm hover:scale-105 transition-transform"
            />
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
    title: 'Precision',
    status: 'VERIFIED',
    description: 'Every event requires technical excellence. From ticketing to registration, our systems are built with 99.9% uptime reliability to ensure focus remains on the mission.'
  },
  {
    id: 2,
    number: '02',
    icon: 'i-heroicons-squares-2x2',
    title: 'Order',
    status: 'STRUCTURED',
    description: 'Divine order is reflected in clean architecture. Our UI is designed to be intuitive, reverent, and free of the noise that plagues modern digital tools.'
  },
  {
    id: 3,
    number: '03',
    icon: 'i-heroicons-arrow-trending-up',
    title: 'Tradition',
    status: 'PERENNIAL',
    description: 'We don\'t just build software; we build tools that honor 2,000 years of heritage. Our platform is a servant to the sacraments and the community.'
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
