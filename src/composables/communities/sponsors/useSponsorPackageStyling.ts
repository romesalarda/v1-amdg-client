import type { MaybeRefOrGetter } from 'vue'
import { computed, toValue } from 'vue'

export interface SponsorPackageBase {
  package_id: string
  package_name: string
  package_description?: string | null
  tier?: number | null
  modified_amount?: string
  base_amount?: string
  base_amount_currency?: string
  active?: boolean
  sponsors_count?: number
}

export interface StyledSponsorPackage extends SponsorPackageBase {
  cardClass: string
  iconWrapClass: string
  iconClass: string
  tierTextClass: string
  icon: string
  showPremiumBadge: boolean
  premiumBadgeClass: string
  selectedClass: string
}

function getPackageStyle(tier: number | null | undefined): Omit<StyledSponsorPackage, keyof SponsorPackageBase> {
  const t = tier ?? 99

  if (t === 1) {
    return {
      cardClass: 'shadow-[0_0_20px_rgba(212,175,55,0.15)] border border-[rgba(212,175,55,0.3)]',
      iconWrapClass: 'bg-yellow-50 border-yellow-100',
      iconClass: 'text-yellow-600',
      tierTextClass: 'text-yellow-600',
      icon: 'workspace_premium',
      showPremiumBadge: true,
      premiumBadgeClass: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      selectedClass: 'ring-2 ring-yellow-400 ring-offset-1 !border-yellow-400',
    }
  }

  if (t === 2) {
    return {
      cardClass: 'shadow-[0_0_20px_rgba(192,192,192,0.15)] border border-[rgba(192,192,192,0.3)]',
      iconWrapClass: 'bg-slate-50 border-slate-100',
      iconClass: 'text-slate-500',
      tierTextClass: 'text-slate-500',
      icon: 'stars',
      showPremiumBadge: false,
      premiumBadgeClass: '',
      selectedClass: 'ring-2 ring-slate-400 ring-offset-1 !border-slate-400',
    }
  }

  if (t === 3) {
    return {
      cardClass: 'shadow-[0_0_20px_rgba(205,127,50,0.1)] border border-[rgba(205,127,50,0.2)]',
      iconWrapClass: 'bg-orange-50 border-orange-100',
      iconClass: 'text-orange-700',
      tierTextClass: 'text-orange-700',
      icon: 'military_tech',
      showPremiumBadge: false,
      premiumBadgeClass: '',
      selectedClass: 'ring-2 ring-orange-400 ring-offset-1 !border-orange-400',
    }
  }

  return {
    cardClass: 'border border-[#c6c6ce]/40',
    iconWrapClass: 'bg-[#f1f4f9] border-[#ebeef3]',
    iconClass: 'text-[#45464d]',
    tierTextClass: 'text-[#45464d]',
    icon: 'group',
    showPremiumBadge: false,
    premiumBadgeClass: '',
    selectedClass: 'ring-2 ring-deep-navy ring-offset-1 !border-deep-navy',
  }
}

export function useSponsorPackageStyling(packages: MaybeRefOrGetter<SponsorPackageBase[]>) {
  const styledPackages = computed<StyledSponsorPackage[]>(() =>
    [...toValue(packages)]
      .sort((a, b) => {
        const tierA = a.tier ?? 99
        const tierB = b.tier ?? 99
        if (tierA !== tierB) return tierA - tierB
        return a.package_name.localeCompare(b.package_name)
      })
      .map((pkg) => ({
        ...pkg,
        ...getPackageStyle(pkg.tier),
      })),
  )

  return { styledPackages }
}
