<template>
  <div class="time-series">
    <div class="controls">
      <input 
        v-model="itemSearch"
        type="text"
        placeholder="Search for an item..."
        class="search-input"
        @input="searchItems"
      >
      <select v-model="selectedTimeStep" class="timestep-select">
        <option value="5m">5 Minutes</option>
        <option value="1h">1 Hour</option>
        <option value="6h">6 Hours</option>
        <option value="24h">24 Hours</option>
      </select>
      <button 
        @click="loadTimeSeries" 
        :disabled="!selectedItem || loading"
        class="load-btn"
      >
        {{ loading ? 'Loading...' : 'Load Chart' }}
      </button>
    </div>

    <div v-if="searchResults.length" class="search-results">
      <div 
        v-for="item in searchResults" 
        :key="item.id"
        @click="selectItem(item)"
        class="search-result-item"
        :class="{ selected: selectedItem?.id === item.id }"
      >
        {{ item.name }} (ID: {{ item.id }})
      </div>
    </div>

    <div v-if="selectedItem" class="selected-info">
      Selected: <strong>{{ selectedItem.name }}</strong>
    </div>

    <div v-if="error" class="error">
      {{ error }}
    </div>

    <div v-if="loading" class="loading">
      Loading time series data...
    </div>

    <div v-if="timeSeriesData.length" class="chart-container">
      <h3>Price History: {{ selectedItem?.name }}</h3>
      <div class="chart">
        <canvas ref="chartCanvas"></canvas>
      </div>
      <div class="stats">
        <div class="stat-box">
          <span class="stat-label">Average Buy Price</span>
          <span class="stat-value high">{{ formatPrice(avgHighPrice) }} gp</span>
        </div>
        <div class="stat-box">
          <span class="stat-label">Average Sell Price</span>
          <span class="stat-value low">{{ formatPrice(avgLowPrice) }} gp</span>
        </div>
        <div class="stat-box">
          <span class="stat-label">Price Volatility</span>
          <span class="stat-value">{{ volatility.toFixed(1) }}%</span>
        </div>
        <div class="stat-box">
          <span class="stat-label">Total Volume</span>
          <span class="stat-value">{{ formatNumber(totalVolume) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import OSRTPClient, { type ItemMapping, type TimeSeriesData, type TimeStep } from '../client'

const client = new OSRTPClient()
const itemSearch = ref('')
const searchResults = ref<ItemMapping[]>([])
const selectedItem = ref<ItemMapping | null>(null)
const selectedTimeStep = ref<TimeStep>('5m')
const timeSeriesData = ref<TimeSeriesData[]>([])
const allItems = ref<ItemMapping[]>([])
const loading = ref(false)
const error = ref('')
const chartCanvas = ref<HTMLCanvasElement | null>(null)

const avgHighPrice = computed(() => {
  if (!timeSeriesData.value.length) return 0
  const sum = timeSeriesData.value.reduce((acc, d) => acc + d.avgHighPrice, 0)
  return sum / timeSeriesData.value.length
})

const avgLowPrice = computed(() => {
  if (!timeSeriesData.value.length) return 0
  const sum = timeSeriesData.value.reduce((acc, d) => acc + d.avgLowPrice, 0)
  return sum / timeSeriesData.value.length
})

const volatility = computed(() => {
  if (!timeSeriesData.value.length) return 0
  const prices = timeSeriesData.value.map(d => (d.avgHighPrice + d.avgLowPrice) / 2)
  const mean = prices.reduce((a, b) => a + b, 0) / prices.length
  const variance = prices.reduce((acc, p) => acc + Math.pow(p - mean, 2), 0) / prices.length
  return (Math.sqrt(variance) / mean) * 100
})

const totalVolume = computed(() => {
  if (!timeSeriesData.value.length) return 0
  return timeSeriesData.value.reduce((acc, d) => acc + d.highPriceVolume + d.lowPriceVolume, 0)
})

const searchItems = () => {
  if (!itemSearch.value.trim()) {
    searchResults.value = []
    return
  }
  
  const query = itemSearch.value.toLowerCase()
  searchResults.value = allItems.value
    .filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.id.toString().includes(query)
    )
    .slice(0, 10)
}

const selectItem = (item: ItemMapping) => {
  selectedItem.value = item
  searchResults.value = []
  itemSearch.value = item.name
}

const loadTimeSeries = async () => {
  if (!selectedItem.value) return
  
  loading.value = true
  error.value = ''
  
  try {
    timeSeriesData.value = await client.getTimeSeries(selectedItem.value.id, selectedTimeStep.value)
    drawChart()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load time series data'
  } finally {
    loading.value = false
  }
}

const drawChart = () => {
  if (!chartCanvas.value || !timeSeriesData.value.length) return
  
  const canvas = chartCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  canvas.width = canvas.offsetWidth * 2
  canvas.height = 400
  
  const data = timeSeriesData.value
  const padding = 40
  const width = canvas.width - padding * 2
  const height = canvas.height - padding * 2
  
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.scale(2, 1)
  
  const minPrice = Math.min(...data.flatMap(d => [d.avgHighPrice, d.avgLowPrice]))
  const maxPrice = Math.max(...data.flatMap(d => [d.avgHighPrice, d.avgLowPrice]))
  const priceRange = maxPrice - minPrice
  
  const xScale = width / (data.length - 1)
  const yScale = height / priceRange
  
  ctx.strokeStyle = '#e74c3c'
  ctx.lineWidth = 2
  ctx.beginPath()
  data.forEach((d, i) => {
    const x = padding + i * xScale
    const y = padding + (maxPrice - d.avgHighPrice) * yScale
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  })
  ctx.stroke()
  
  ctx.strokeStyle = '#27ae60'
  ctx.beginPath()
  data.forEach((d, i) => {
    const x = padding + i * xScale
    const y = padding + (maxPrice - d.avgLowPrice) * yScale
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  })
  ctx.stroke()
  
  ctx.setTransform(1, 0, 0, 1, 0, 0)
}

const formatPrice = (price: number) => {
  if (!price && price !== 0) return '0'
  if (price >= 1000000) {
    return (price / 1000000).toFixed(2) + 'M'
  } else if (price >= 1000) {
    return (price / 1000).toFixed(1) + 'K'
  }
  return price.toLocaleString()
}

const formatNumber = (num: number) => {
  if (!num && num !== 0) return '0'
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toLocaleString()
}

onMounted(async () => {
  try {
    allItems.value = await client.getMapping()
  } catch (error) {
    console.error('Failed to load items:', error)
  }
})

watch(timeSeriesData, () => {
  if (timeSeriesData.value.length) {
    setTimeout(drawChart, 100)
  }
})
</script>

<style scoped>
.time-series {
  background: white;
  border-radius: 12px;
  padding: 2rem;
}

.controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 200px;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
}

.timestep-select {
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
}

.timestep-select:focus {
  outline: none;
  border-color: #667eea;
}

.load-btn {
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
}

.load-btn:hover:not(:disabled) {
  background: #5a67d8;
}

.load-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.search-results {
  background: #f8f8f8;
  border-radius: 8px;
  margin-bottom: 1rem;
  max-height: 200px;
  overflow-y: auto;
}

.search-result-item {
  padding: 0.75rem;
  cursor: pointer;
  border-bottom: 1px solid #e0e0e0;
}

.search-result-item:hover {
  background: #f0f0f0;
}

.search-result-item.selected {
  background: #e8eaff;
}

.selected-info {
  background: #f0f4ff;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  color: #333;
}

.error {
  background: #fee;
  color: #c00;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.chart-container h3 {
  margin-bottom: 1.5rem;
  color: #333;
}

.chart {
  background: #f8f8f8;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.chart canvas {
  width: 100%;
  height: 200px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-box {
  background: #f8f8f8;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
}

.stat-label {
  display: block;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  display: block;
  font-size: 1.3rem;
  font-weight: bold;
  color: #333;
}

.stat-value.high {
  color: #e74c3c;
}

.stat-value.low {
  color: #27ae60;
}
</style>