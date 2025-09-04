<template>
  <div class="latest-prices">
    <div class="controls">
      <input 
        v-model="searchTerm"
        type="text"
        placeholder="Filter items by name..."
        class="search-input"
      >
      <button @click="refreshPrices" :disabled="loading" class="refresh-btn">
        {{ loading ? 'Loading...' : 'Refresh Prices' }}
      </button>
    </div>

    <div v-if="error" class="error">
      {{ error }}
    </div>

    <div v-if="loading && !prices" class="loading">
      Loading prices...
    </div>

    <div v-else-if="filteredItems.length" class="price-grid">
      <div 
        v-for="item in paginatedItems" 
        :key="item.id"
        class="price-card"
      >
        <h3>{{ item.name }}</h3>
        <div class="price-info">
          <div class="price-row">
            <span class="label">Buy:</span>
            <span class="price high">{{ formatPrice(item.high) }} gp</span>
          </div>
          <div class="price-row">
            <span class="label">Sell:</span>
            <span class="price low">{{ formatPrice(item.low) }} gp</span>
          </div>
          <div class="price-row">
            <span class="label">Margin:</span>
            <span class="price margin">{{ formatPrice(item.high - item.low) }} gp</span>
          </div>
          <div class="price-row">
            <span class="label">ROI:</span>
            <span class="price roi">{{ calculateROI(item.high, item.low) }}%</span>
          </div>
        </div>
        <div class="meta">
          <span class="members-tag" :class="{ members: item.members }">
            {{ item.members ? 'Members' : 'F2P' }}
          </span>
          <span class="limit">Limit: {{ item.limit }}</span>
        </div>
      </div>
    </div>

    <div v-if="filteredItems.length > itemsPerPage" class="pagination">
      <button 
        @click="currentPage--" 
        :disabled="currentPage === 1"
        class="page-btn"
      >
        Previous
      </button>
      <span class="page-info">
        Page {{ currentPage }} of {{ totalPages }}
      </span>
      <button 
        @click="currentPage++" 
        :disabled="currentPage === totalPages"
        class="page-btn"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import OSRTPClient, { type LatestPrices, type ItemMapping } from '../client'

const client = new OSRTPClient()
const prices = ref<LatestPrices | null>(null)
const mapping = ref<ItemMapping[]>([])
const loading = ref(false)
const error = ref('')
const searchTerm = ref('')
const currentPage = ref(1)
const itemsPerPage = 50

const filteredItems = computed(() => {
  if (!prices.value || !mapping.value.length) return []
  
  return mapping.value
    .filter(item => {
      const hasPrice = prices.value![item.id.toString()]
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.value.toLowerCase())
      return hasPrice && matchesSearch
    })
    .map(item => {
      const price = prices.value![item.id.toString()]
      return {
        ...item,
        high: price.high,
        low: price.low,
        highTime: price.highTime,
        lowTime: price.lowTime
      }
    })
    .sort((a, b) => (b.high - b.low) - (a.high - a.low))
})

const totalPages = computed(() => 
  Math.ceil(filteredItems.value.length / itemsPerPage)
)

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredItems.value.slice(start, start + itemsPerPage)
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

const calculateROI = (high: number, low: number) => {
  if (low === 0) return 0
  return ((high - low) / low * 100).toFixed(1)
}

const refreshPrices = async () => {
  loading.value = true
  error.value = ''
  currentPage.value = 1
  
  try {
    const [pricesData, mappingData] = await Promise.all([
      client.getLatestPrices(),
      mapping.value.length ? Promise.resolve(mapping.value) : client.getMapping()
    ])
    
    prices.value = pricesData
    mapping.value = mappingData
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load prices'
  } finally {
    loading.value = false
  }
}

onMounted(refreshPrices)
</script>

<style scoped>
.latest-prices {
  background: white;
  border-radius: 12px;
  padding: 2rem;
}

.controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
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

.refresh-btn {
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
}

.refresh-btn:hover:not(:disabled) {
  background: #5a67d8;
}

.refresh-btn:disabled {
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

.price-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.price-card {
  background: #f8f8f8;
  border-radius: 8px;
  padding: 1.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.price-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.price-card h3 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.1rem;
}

.price-info {
  margin-bottom: 1rem;
}

.price-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.label {
  color: #666;
}

.price {
  font-weight: bold;
}

.price.high {
  color: #e74c3c;
}

.price.low {
  color: #27ae60;
}

.price.margin {
  color: #3498db;
}

.price.roi {
  color: #9b59b6;
}

.meta {
  display: flex;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
  font-size: 0.9rem;
}

.members-tag {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background: #e0e0e0;
  color: #666;
}

.members-tag.members {
  background: #fff3cd;
  color: #856404;
}

.limit {
  color: #666;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.page-btn {
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.page-btn:hover:not(:disabled) {
  background: #5a67d8;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #666;
}
</style>