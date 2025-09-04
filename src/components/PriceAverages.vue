<template>
  <div class="price-averages">
    <div class="controls">
      <select v-model="timeframe" class="timeframe-select">
        <option value="5m">5 Minute Average</option>
        <option value="1h">1 Hour Average</option>
      </select>
      <button @click="loadAverages" :disabled="loading" class="load-btn">
        {{ loading ? 'Loading...' : 'Load Averages' }}
      </button>
    </div>

    <div v-if="error" class="error">
      {{ error }}
    </div>

    <div v-if="loading" class="loading">
      Loading averaged prices...
    </div>

    <div v-else-if="topItems.length" class="averages-content">
      <h3>Top {{ topItems.length }} Items by Volume</h3>
      <div class="stats-grid">
        <div 
          v-for="item in topItems" 
          :key="item.id"
          class="stat-card"
        >
          <h4>{{ item.name }}</h4>
          <div class="stat-row">
            <span class="stat-label">Avg Buy Price:</span>
            <span class="stat-value high">{{ formatPrice(item.avgHighPrice) }} gp</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Buy Volume:</span>
            <span class="stat-value">{{ formatNumber(item.highPriceVolume) }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Avg Sell Price:</span>
            <span class="stat-value low">{{ formatPrice(item.avgLowPrice) }} gp</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Sell Volume:</span>
            <span class="stat-value">{{ formatNumber(item.lowPriceVolume) }}</span>
          </div>
          <div class="stat-row highlight">
            <span class="stat-label">Total Volume:</span>
            <span class="stat-value">{{ formatNumber(item.totalVolume) }}</span>
          </div>
          <div class="stat-row highlight">
            <span class="stat-label">Avg Margin:</span>
            <span class="stat-value margin">{{ formatPrice(item.avgHighPrice - item.avgLowPrice) }} gp</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import OSRTPClient, { type AveragedPrices, type ItemMapping } from '../client'

const client = new OSRTPClient()
const timeframe = ref<'5m' | '1h'>('5m')
const averages = ref<AveragedPrices | null>(null)
const mapping = ref<ItemMapping[]>([])
const loading = ref(false)
const error = ref('')

const topItems = computed(() => {
  if (!averages.value || !mapping.value.length) return []
  
  const itemsWithData = Object.entries(averages.value)
    .map(([id, data]) => {
      const item = mapping.value.find(m => m.id === parseInt(id))
      if (!item) return null
      
      return {
        id: parseInt(id),
        name: item.name,
        ...data,
        totalVolume: data.highPriceVolume + data.lowPriceVolume
      }
    })
    .filter(item => item !== null && item.totalVolume > 0)
    
  return itemsWithData
    .sort((a, b) => b!.totalVolume - a!.totalVolume)
    .slice(0, 20)
})

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

const loadAverages = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const [avgData, mappingData] = await Promise.all([
      timeframe.value === '5m' ? client.get5mAvg() : client.get1hAvg(),
      mapping.value.length ? Promise.resolve(mapping.value) : client.getMapping()
    ])
    
    averages.value = avgData
    mapping.value = mappingData
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load averages'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.price-averages {
  background: white;
  border-radius: 12px;
  padding: 2rem;
}

.controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.timeframe-select {
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
}

.timeframe-select:focus {
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

.averages-content h3 {
  margin-bottom: 1.5rem;
  color: #333;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: #f8f8f8;
  border-radius: 8px;
  padding: 1.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-card h4 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #e0e0e0;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  padding: 0.25rem 0;
}

.stat-row.highlight {
  background: rgba(102, 126, 234, 0.1);
  padding: 0.5rem;
  border-radius: 4px;
  margin-top: 0.5rem;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

.stat-value {
  font-weight: bold;
  color: #333;
}

.stat-value.high {
  color: #e74c3c;
}

.stat-value.low {
  color: #27ae60;
}

.stat-value.margin {
  color: #3498db;
}
</style>