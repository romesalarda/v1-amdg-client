<template>
  <div class="bg-white text-deep-navy">

    <!-- Hero Section -->
    <section class="relative h-64 md:h-80 overflow-hidden flex items-center justify-center">
      <div class="absolute inset-0 z-0 bg-deep-navy">
        <UiFlowingBackground position="absolute" :speed="3" :soft="8" :palette="4" />

        <div class="absolute inset-0 bg-gradient-to-b from-deep-navy/80 to-deep-navy/95" />
      </div>
      <div class="relative z-10 text-center px-4">
        <h1 class="text-4xl md:text-6xl font-black text-white uppercase tracking-tight drop-shadow-md">
          Legal &amp; Privacy
        </h1>
        <p class="text-lg text-white/80 mt-4 max-w-2xl mx-auto font-medium leading-relaxed">
          Ad Majorem Dei Gloriam: Our commitment to transparency and the protection of our community.
        </p>
      </div>
    </section>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 md:px-16 py-12">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        <!-- Sticky Sidebar Navigation -->
        <aside class="lg:col-span-3 sticky top-24 hidden lg:block">
          <div class="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <h4 class="text-[9px] font-black text-gray-400 uppercase tracking-[0.25em] mb-6">On this page</h4>
            <nav class="flex flex-col gap-3">
              <button
                v-for="section in sections"
                :key="section.id"
                class="text-left text-sm font-bold transition-all duration-200"
                :class="activeSection === section.id
                  ? 'text-deep-navy border-l-4 border-deep-navy pl-3 -ml-px'
                  : 'text-gray-500 hover:text-deep-navy pl-4'"
                @click="scrollToSection(section.id)"
              >
                {{ section.label }}
              </button>
            </nav>
          </div>

          <div class="mt-6 bg-deep-navy rounded-xl p-6 text-white shadow-lg">
            <p class="text-[9px] font-black uppercase tracking-[0.25em] text-white/50 mb-1">LAST UPDATED</p>
            <p class="font-bold text-sm">November 14, 2024</p>
          </div>
        </aside>

        <!-- Legal Document -->
        <article class="lg:col-span-9 bg-white rounded-2xl p-8 md:p-16 shadow-sm border border-gray-100 legal-content">

          <!-- Terms of Service -->
          <section id="terms">
            <div class="flex items-center gap-3 mb-2">
              <span class="material-symbols-outlined text-deep-navy/30 text-xl">gavel</span>
              <span class="text-[9px] font-black text-deep-navy/40 uppercase tracking-[0.25em]">Document 01</span>
            </div>
            <h2>Terms of Service</h2>
            <p>
              Welcome to AMDG (Ad Majorem Dei Gloriam). These Terms of Service ("Terms") govern your access to and
              use of our events management platform, website, and services. By using AMDG, you agree to be bound by
              these Terms.
            </p>
            <h3>1. Acceptance of Terms</h3>
            <p>
              By accessing or using our services, you confirm your capacity to form a binding contract with AMDG. If
              you are using the services on behalf of an organization (such as a parish or ministry), you represent
              that you have the authority to bind that entity to these Terms.
            </p>
            <h3>2. Use of the Platform</h3>
            <p>
              AMDG provides tools for organizing, promoting, and managing Catholic community events. You agree to use
              the platform only for lawful purposes and in accordance with the mission and values of the Church.
              Prohibited activities include:
            </p>
            <ul>
              <li>Engaging in any activity that is fraudulent, defamatory, or promotes hate speech.</li>
              <li>Attempting to interfere with the proper functioning of the service.</li>
              <li>Using automated systems to scrape data from the platform.</li>
              <li>Impersonating any person or entity, including AMDG staff or representatives.</li>
            </ul>
            <h3>3. Event Content and Conduct</h3>
            <p>
              Users are responsible for the content they post. AMDG reserves the right to remove any content that
              violates our community standards or the spiritual integrity of the platform.
            </p>
          </section>

          <div class="my-16 border-t border-gray-100" />

          <!-- Privacy Policy -->
          <section id="privacy">
            <div class="flex items-center gap-3 mb-2">
              <span class="material-symbols-outlined text-deep-navy/30 text-xl">security</span>
              <span class="text-[9px] font-black text-deep-navy/40 uppercase tracking-[0.25em]">Document 02</span>
            </div>
            <h2>Privacy Policy</h2>
            <p>
              Your privacy is of paramount importance to us. This Privacy Policy explains how AMDG collects, uses,
              and protects your personal information when you use our services.
            </p>
            <h3>1. Information We Collect</h3>
            <p>
              We collect information that you provide directly to us, such as when you create an account, register
              for an event, or contact us for support. This may include:
            </p>
            <ul>
              <li>Name and contact information (email, phone number).</li>
              <li>Ecclesiastical affiliation (parish, diocese, or ministry).</li>
              <li>Payment information (processed securely through third-party providers).</li>
              <li>Profile pictures and community interests.</li>
            </ul>
            <div class="bg-deep-navy/5 rounded-xl p-8 my-8 border border-deep-navy/10">
              <h4 class="flex items-center gap-2 text-sm font-bold text-deep-navy mb-2">
                <span class="material-symbols-outlined text-base">info</span>
                Data Protection Notice
              </h4>
              <p class="text-sm text-gray-600 mb-0">
                We never sell your personal data to third-party advertisers. Your information is used strictly to
                facilitate community engagement and service improvements.
              </p>
            </div>
            <h3>2. How We Use Your Information</h3>
            <p>
              We use the data we collect to provide and improve our services, facilitate event registrations,
              communicate important updates, and ensure the security of our platform.
            </p>
          </section>

          <div class="my-16 border-t border-gray-100" />

          <!-- Cookie Policy -->
          <section id="cookies">
            <div class="flex items-center gap-3 mb-2">
              <span class="material-symbols-outlined text-deep-navy/30 text-xl">cookie</span>
              <span class="text-[9px] font-black text-deep-navy/40 uppercase tracking-[0.25em]">Document 03</span>
            </div>
            <h2>Cookie Policy</h2>
            <p>
              AMDG uses cookies and similar technologies to enhance your experience. Cookies are small text files
              stored on your device that help us remember your preferences and analyze how you interact with our site.
            </p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div class="p-6 rounded-xl bg-gray-50 border border-gray-100">
                <h4 class="font-bold text-deep-navy mb-2 text-sm">Essential Cookies</h4>
                <p class="text-sm text-gray-600">
                  Necessary for the website to function. These cannot be disabled in our systems.
                </p>
              </div>
              <div class="p-6 rounded-xl bg-gray-50 border border-gray-100">
                <h4 class="font-bold text-deep-navy mb-2 text-sm">Analytical Cookies</h4>
                <p class="text-sm text-gray-600">
                  Help us understand how visitors use the site so we can improve the user experience.
                </p>
              </div>
            </div>
          </section>

          <div class="my-16 border-t border-gray-100" />

          <!-- Compliance -->
          <section id="compliance">
            <div class="flex items-center gap-3 mb-2">
              <span class="material-symbols-outlined text-deep-navy/30 text-xl">verified_user</span>
              <span class="text-[9px] font-black text-deep-navy/40 uppercase tracking-[0.25em]">Document 04</span>
            </div>
            <h2>Compliance</h2>
            <p>
              AMDG is committed to complying with applicable data protection regulations, including the UK General
              Data Protection Regulation (UK GDPR) and the Data Protection Act 2018. We implement appropriate
              technical and organizational measures to ensure the security of your personal data.
            </p>
            <h3>1. Your Rights</h3>
            <p>
              Under data protection law, you have rights including the right to access, correct, or delete your
              personal data, and the right to object to processing. To exercise these rights, please contact us at
              the address below.
            </p>
          </section>

          <div class="my-16 border-t border-gray-100" />

          <!-- Contact Legal -->
          <section id="contact">
            <div class="flex items-center gap-3 mb-2">
              <span class="material-symbols-outlined text-deep-navy/30 text-xl">mail</span>
              <span class="text-[9px] font-black text-deep-navy/40 uppercase tracking-[0.25em]">Contact</span>
            </div>
            <h2>Contact Legal</h2>
            <p>
              If you have any questions about these policies or wish to exercise your legal rights, please contact
              our legal team at
              <a href="mailto:legal@amdg.co.uk" class="text-deep-navy font-semibold underline hover:opacity-70 transition-opacity">
                legal@amdg.co.uk
              </a>.
            </p>
          </section>

        </article>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'booking' })

const sections = [
  { id: 'terms', label: 'Terms of Service' },
  { id: 'privacy', label: 'Privacy Policy' },
  { id: 'cookies', label: 'Cookie Policy' },
  { id: 'compliance', label: 'Compliance' },
  { id: 'contact', label: 'Contact Legal' },
]

const activeSection = ref('terms')

function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          activeSection.value = entry.target.id
        }
      }
    },
    { rootMargin: '-30% 0px -60% 0px', threshold: 0 },
  )

  sections.forEach(({ id }) => {
    const el = document.getElementById(id)
    if (el) observer.observe(el)
  })

  onUnmounted(() => observer.disconnect())
})
</script>

<style scoped>
.legal-content h2 {
  @apply text-3xl font-black text-deep-navy mt-12 mb-6 scroll-mt-32 uppercase tracking-tight;
}
.legal-content h3 {
  @apply text-base font-black text-deep-navy/70 uppercase tracking-widest mt-8 mb-4;
}
.legal-content p {
  @apply text-base text-gray-600 mb-4 leading-relaxed;
}
.legal-content ul {
  @apply list-disc list-outside ml-6 mb-6 space-y-2 text-gray-600 text-base;
}
</style>