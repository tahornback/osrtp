<template>
  <div class="app">
    <header class="header">
      <h1>OSRS Grand Exchange Price Explorer</h1>
      <div class="tab-nav">
        <button 
          v-for="tab in tabs" 
          :key="tab"
          @click="activeTab = tab"
          :class="{ active: activeTab === tab }"
          class="tab-btn"
        >
          {{ tab }}
        </button>
      </div>
    </header>

    <main class="main">
      <LatestPrices v-if="activeTab === 'Latest Prices'" />
      <ItemSearch v-else-if="activeTab === 'Item Search'" />
      <PriceAverages v-else-if="activeTab === 'Price Averages'" />
      <TimeSeries v-else-if="activeTab === 'Time Series'" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LatestPrices from './components/LatestPrices.vue'
import ItemSearch from './components/ItemSearch.vue'
import PriceAverages from './components/PriceAverages.vue'
import TimeSeries from './components/TimeSeries.vue'

const tabs = ['Latest Prices', 'Item Search', 'Price Averages', 'Time Series']
const activeTab = ref('Latest Prices')
</script>

<style scoped>
.app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header {
  background: rgba(255, 255, 255, 0.95);
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header h1 {
  margin: 0 0 1rem 0;
  color: #333;
  text-align: center;
}

.tab-nav {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  background: #f0f0f0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
}

.tab-btn:hover {
  background: #e0e0e0;
}

.tab-btn.active {
  background: #667eea;
  color: white;
}

.main {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}
</style>