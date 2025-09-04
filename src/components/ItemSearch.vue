<template>
  <div class="item-search">
    <div class="search-container">
      <input 
        v-model="searchQuery"
        type="text"
        placeholder="Search for an item..."
        class="search-input"
        @input="searchItems"
      >
    </div>

    <div v-if="loading" class="loading">
      Searching items...
    </div>

    <div v-if="searchResults.length" class="results">
      <h3>Search Results ({{ searchResults.length }})</h3>
      <div class="item-grid">
        <div 
          v-for="item in searchResults" 
          :key="item.id"
          class="item-card"
          @click="selectItem(item)"
          :class="{ selected: selectedItem?.id === item.id }"
        >
          <h4>{{ item.name }}</h4>
          <p class="examine">{{ item.examine }}</p>
          <div class="item-details">
            <span class="badge">ID: {{ item.id }}</span>
            <span class="badge" :class="{ members: item.members }">
              {{ item.members ? 'Members' : 'F2P' }}
            </span>
          </div>
          <div class="alch-prices">
            <div>High Alch: {{ item.highalch }} gp</div>
            <div>Low Alch: {{ item.lowalch }} gp</div>
            <div>Store: {{ item.value }} gp</div>
            <div>Buy Limit: {{ item.limit }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="selectedItem && itemPrice" class="selected-item">
      <h3>Current Price: {{ selectedItem.name }}</h3>
      <div class="price-display">
        <div class="price-box">
          <span class="price-label">Buy Price</span>
          <span class="price-value high">{{ formatPrice(itemPrice.high) }} gp</span>
          <span class="price-time">{{ formatTime(itemPrice.highTime) }}</span>
        </div>
        <div class="price-box">
          <span class="price-label">Sell Price</span>
          <span class="price-value low">{{ formatPrice(itemPrice.low) }} gp</span>
          <span class="price-time">{{ formatTime(itemPrice.lowTime) }}</span>
        </div>
        <div class="price-box">
          <span class="price-label">Profit Margin</span>
          <span class="price-value margin">{{ formatPrice(itemPrice.high - itemPrice.low) }} gp</span>
          <span class="price-time">{{ ((itemPrice.high - itemPrice.low) / itemPrice.low * 100).toFixed(1) }}% ROI</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import OSRTPClient, { type ItemMapping, type LatestPrice } from '../client'

const client = new OSRTPClient()
const allItems = ref<ItemMapping[]>([])
const searchQuery = ref('')
const searchResults = ref<ItemMapping[]>([])
const selectedItem = ref<ItemMapping | null>(null)
const itemPrice = ref<LatestPrice | null>(null)
const loading = ref(false)

const searchItems = () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }
  
  const query = searchQuery.value.toLowerCase()
  searchResults.value = allItems.value
    .filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.id.toString().includes(query)
    )
    .slice(0, 50)
}

const selectItem = async (item: ItemMapping) => {
  selectedItem.value = item
  try {
    const prices = await client.getLatestPrices()
    itemPrice.value = prices[item.id.toString()] || null
  } catch (error) {
    console.error('Failed to fetch price:', error)
    itemPrice.value = null
  }
}

const formatPrice = (price: number) => {
  if (price >= 1000000) {
    return (price / 1000000).toFixed(2) + 'M'
  } else if (price >= 1000) {
    return (price / 1000).toFixed(1) + 'K'
  }
  return price.toLocaleString()
}

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp * 1000)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const mins = Math.floor(diff / 60000)
  
  if (mins < 60) {
    return `${mins} mins ago`
  } else if (mins < 1440) {
    return `${Math.floor(mins / 60)} hours ago`
  } else {
    return `${Math.floor(mins / 1440)} days ago`
  }
}

onMounted(async () => {
  loading.value = true
  try {
    allItems.value = await client.getMapping()
  } catch (error) {
    console.error('Failed to load items:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.item-search {
  background: white;
  border-radius: 12px;
  padding: 2rem;
}

.search-container {
  margin-bottom: 2rem;
}

.search-input {
  width: 100%;
  padding: 1rem;
  font-size: 1.1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.results h3 {
  margin-bottom: 1rem;
  color: #333;
}

.item-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.item-card {
  background: #f8f8f8;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.item-card:hover {
  background: #f0f0f0;
  transform: translateY(-2px);
}

.item-card.selected {
  border-color: #667eea;
  background: #f0f4ff;
}

.item-card h4 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.examine {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  font-style: italic;
}

.item-details {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.badge {
  padding: 0.25rem 0.5rem;
  background: #e0e0e0;
  border-radius: 4px;
  font-size: 0.85rem;
}

.badge.members {
  background: #fff3cd;
  color: #856404;
}

.alch-prices {
  font-size: 0.85rem;
  color: #666;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.25rem;
}

.selected-item {
  background: #f8f8f8;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 2rem;
}

.selected-item h3 {
  margin-bottom: 1.5rem;
  color: #333;
}

.price-display {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.price-box {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
}

.price-label {
  display: block;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.price-value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.price-value.high {
  color: #e74c3c;
}

.price-value.low {
  color: #27ae60;
}

.price-value.margin {
  color: #3498db;
}

.price-time {
  display: block;
  color: #999;
  font-size: 0.85rem;
}
</style>