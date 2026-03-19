<template>
	<ClientOnly>
		<div class="relative">
			<div ref="mapContainer" class="h-[384px] w-full bg-slate-100"></div>
			<div
				class="absolute left-2 top-2 z-10 rounded bg-white/90 px-2 py-1 text-[11px] text-gray-700 shadow"
			>
				Map status: {{ status }}
			</div>
		</div>
	</ClientOnly>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch, type PropType } from 'vue'
import maplibregl, { type Map as MapLibreMap } from 'maplibre-gl'
import type { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson'
import 'maplibre-gl/dist/maplibre-gl.css'

type MapSource = {
	name: string
	data: FeatureCollection<Geometry, GeoJsonProperties>
}

type MapLayer = {
	id: string
	type: string
	source: string
	paint?: Record<string, unknown>
	layout?: Record<string, unknown>
}

const props = defineProps({
	mapStyle: {
		type: String,
		required: true,
	},
	center: {
		type: Array as unknown as PropType<[number, number]>,
		required: true,
	},
	zoom: {
		type: Number,
		required: true,
	},
	sources: {
		type: Array as PropType<MapSource[]>,
		default: () => [],
	},
	layers: {
		type: Array as PropType<MapLayer[]>,
		default: () => [],
	},
})

const mapContainer = ref<HTMLDivElement | null>(null)
const map = ref<MapLibreMap | null>(null)
const status = ref('init')
const currentLayerIds = ref<string[]>([])
const currentSourceNames = ref<string[]>([])

const initMap = () => {
	if (!mapContainer.value || map.value) return
	status.value = 'creating'
	const instance = new maplibregl.Map({
		container: mapContainer.value,
		style: props.mapStyle,
		center: props.center,
		zoom: props.zoom,
	})
	map.value = instance
	instance.on('load', () => {
		status.value = 'loaded'
		applySourcesAndLayers()
		requestAnimationFrame(() => map.value?.resize())
	})
	instance.on('error', (event) => {
		const message = (event?.error as Error | undefined)?.message || 'unknown'
		status.value = `error: ${message}`
	})

	nextTick(() => {
		map.value?.resize()
	})
}

const removeExistingLayers = () => {
	if (!map.value) return
	for (const layerId of currentLayerIds.value) {
		if (map.value.getLayer(layerId)) {
			map.value.removeLayer(layerId)
		}
	}
	currentLayerIds.value = []
}

const removeExistingSources = () => {
	if (!map.value) return
	for (const sourceName of currentSourceNames.value) {
		if (map.value.getSource(sourceName)) {
			map.value.removeSource(sourceName)
		}
	}
	currentSourceNames.value = []
}

const applySourcesAndLayers = () => {
	if (!map.value) return
	removeExistingLayers()
	removeExistingSources()

	props.sources.forEach((source) => {
		map.value?.addSource(source.name, {
			type: 'geojson',
			data: source.data,
		})
		currentSourceNames.value.push(source.name)
	})

	props.layers.forEach((layer) => {
		if (!map.value?.getSource(layer.source)) return
		const layerPayload: {
			id: string
			type: never
			source: string
			paint?: Record<string, unknown>
			layout?: Record<string, unknown>
		} = {
			id: layer.id,
			type: layer.type as never,
			source: layer.source,
		}
		if (layer.paint) {
			layerPayload.paint = layer.paint
		}
		if (layer.layout) {
			layerPayload.layout = layer.layout
		}
		map.value.addLayer(layerPayload)
		currentLayerIds.value.push(layer.id)
	})
}

onMounted(() => {
	status.value = 'mounted'
	if (!mapContainer.value) {
		status.value = 'waiting for container'
		return
	}
	initMap()
})

watch(
	() => mapContainer.value,
	(value) => {
		if (value) {
			initMap()
		}
	}
)

watch(
	() => [props.sources, props.layers],
	() => {
		if (map.value?.loaded()) {
			applySourcesAndLayers()
		}
	},
	{ deep: true }
)

watch(
	() => props.center,
	(center) => {
		if (map.value) {
			map.value.setCenter(center)
		}
	},
	{ deep: true }
)

watch(
	() => props.zoom,
	(zoom) => {
		if (map.value) {
			map.value.setZoom(zoom)
		}
	}
)

onBeforeUnmount(() => {
	map.value?.remove()
	map.value = null
})
</script>
