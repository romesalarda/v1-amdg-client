<template>
	<div class="relative h-96">
		<UCard v-if="isLoading" class="h-full">
			<div class="flex items-center justify-center h-full">
				<UIcon name="i-heroicons-arrow-path" class="text-4xl animate-spin" />
			</div>
		</UCard>

		<MapLibre
			v-else
			:map-style="props.mapStyle"
			:center="center"
			:zoom="zoom"
			:sources="sources"
			:layers="layers"
		/>
	</div>
  </template>
  
<script setup lang="ts">
import { ref, computed, type PropType } from 'vue'
import type { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson'
import MapLibre from '~/components/common/MapLibre.vue'

const props = defineProps({
	mapStyle: {
		type: String,
		default: 'https://demotiles.maplibre.org/style.json',
	},
	eventsGeoJson: {
		type: Object as PropType<FeatureCollection<Geometry, GeoJsonProperties> | null>,
		default: null,
	},
	leadersGeoJson: {
		type: Object as PropType<FeatureCollection<Geometry, GeoJsonProperties> | null>,
		default: null,
	},
	isLoading: {
		type: Boolean,
		default: false,
	},
})

const center = ref<[number, number]>([0, 20])
const zoom = ref(1)

const sources = computed(() => {
	const entries: { name: string; data: FeatureCollection<Geometry, GeoJsonProperties> }[] = []
	if (props.eventsGeoJson) {
		entries.push({
			name: 'events',
			data: props.eventsGeoJson,
		})
	}
	if (props.leadersGeoJson) {
		entries.push({
			name: 'leaders',
			data: props.leadersGeoJson,
		})
	}
	return entries
})

const layers = computed(() => {
	const entries: {
		id: string
		type: string
		source: string
		paint: Record<string, unknown>
	}[] = []
	if (props.eventsGeoJson) {
		entries.push({
			id: 'events-circle',
			type: 'circle',
			source: 'events',
			paint: {
				'circle-color': '#10b981',
				'circle-radius': 6,
				'circle-stroke-width': 2,
				'circle-stroke-color': '#ffffff',
			},
		})
	}
	if (props.leadersGeoJson) {
		entries.push({
			id: 'leaders-circle',
			type: 'circle',
			source: 'leaders',
			paint: {
				'circle-color': '#3b82f6',
				'circle-radius': 5,
				'circle-stroke-width': 1,
				'circle-stroke-color': '#ffffff',
			},
		})
	}
	return entries
})
</script>

  