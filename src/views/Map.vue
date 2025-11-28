<template>
  <div class="map-page page-container">
    <div class="page-header">
      <h1>{{ $t('map.title') }}</h1>
    </div>

    <!-- Search and Location List -->
    <el-row :gutter="20">
      <el-col :xs="24" :md="8">
        <el-card>
          <!-- 地址搜索 -->
          <el-input
            v-model="addressSearchQuery"
            :placeholder="locale === 'zh-CN' ? '搜索地址（按回车搜索）' : 'Search address (press Enter)'"
            @keyup.enter="searchAddress"
            clearable
            style="margin-bottom: 10px"
          >
            <template #append>
              <el-button :icon="Search" @click="searchAddress" :loading="searching">
                {{ locale === 'zh-CN' ? '搜索' : 'Search' }}
              </el-button>
            </template>
          </el-input>

          <!-- 搜索结果列表 -->
          <el-scrollbar v-if="searchResults.length > 0" max-height="200px" style="margin-bottom: 10px;">
            <el-card class="search-results" shadow="never">
              <div
                v-for="result in searchResults"
                :key="result.place_id"
                class="search-result-item"
                @click="selectSearchResult(result)"
              >
                <el-icon><MapLocation /></el-icon>
                <span>{{ result.display_name }}</span>
              </div>
            </el-card>
          </el-scrollbar>

          <!-- 地点列表过滤 -->
          <el-divider>{{ locale === 'zh-CN' ? '比赛地点列表' : 'Event Locations' }}</el-divider>
          <el-input
            v-model="locationFilterQuery"
            :placeholder="locale === 'zh-CN' ? '过滤地点...' : 'Filter locations...'"
            prefix-icon="Filter"
            clearable
            style="margin-bottom: 10px"
          />

          <div class="location-list">
            <div
              v-for="location in filteredLocations"
              :key="location.id"
              class="location-item"
              :class="{ active: selectedLocation?.id === location.id }"
              @click="selectLocation(location)"
            >
              <div class="location-icon">
                <el-icon size="24"><Location /></el-icon>
              </div>
              <div class="location-info">
                <h3>{{ locale === 'zh-CN' ? location.name : location.nameEn }}</h3>
                <p>{{ location.address }}</p>
              </div>
            </div>
          </div>

          <el-empty v-if="filteredLocations.length === 0" :description="$t('common.noData')" />
        </el-card>
      </el-col>

      <!-- Map Display -->
      <el-col :xs="24" :md="16">
        <el-card>
          <div class="map-container" ref="mapContainer"></div>
          
          <!-- 位置信息卡片 -->
          <el-card v-if="selectedLocation" class="location-detail" shadow="never" style="margin-top: 10px;">
            <el-descriptions :column="2" border>
              <el-descriptions-item :label="locale === 'zh-CN' ? '地点名称' : 'Location Name'">
                {{ locale === 'zh-CN' ? selectedLocation.name : selectedLocation.nameEn }}
              </el-descriptions-item>
              <el-descriptions-item :label="locale === 'zh-CN' ? '地址' : 'Address'">
                {{ selectedLocation.address }}
              </el-descriptions-item>
              <el-descriptions-item :label="locale === 'zh-CN' ? '纬度' : 'Latitude'">
                {{ selectedLocation.lat?.toFixed(6) }}
              </el-descriptions-item>
              <el-descriptions-item :label="locale === 'zh-CN' ? '经度' : 'Longitude'">
                {{ selectedLocation.lng?.toFixed(6) }}
              </el-descriptions-item>
            </el-descriptions>
            <el-button type="primary" @click="openInMaps" style="margin-top: 10px; width: 100%;">
              <el-icon><MapLocation /></el-icon>
              {{ locale === 'zh-CN' ? '在 Google Maps 中打开' : 'Open in Google Maps' }}
            </el-button>
          </el-card>
        </el-card>
      </el-col>
    </el-row>

    <!-- Events at Location -->
    <el-card v-if="selectedLocation" class="events-card">
      <template #header>
        <h2>{{ locale === 'zh-CN' ? '该地点的比赛' : 'Events at This Location' }}</h2>
      </template>

      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" v-for="event in eventsAtLocation" :key="event.id">
          <el-card class="event-card" shadow="hover">
            <img :src="event.image" class="event-image" />
            <h3>{{ locale === 'zh-CN' ? event.name : event.nameEn }}</h3>
            <div class="event-date">
              <el-icon><Calendar /></el-icon>
              {{ event.date }}
            </div>
            <el-button type="primary" size="small" @click="viewEvent(event.id)" style="width: 100%; margin-top: 10px">
              {{ $t('event.detail') }}
            </el-button>
          </el-card>
        </el-col>
      </el-row>

      <el-empty v-if="eventsAtLocation.length === 0" :description="$t('common.noData')" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useEventsStore } from '@/stores/events'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { Search, MapLocation } from '@element-plus/icons-vue'
import { eventsApi } from '@/api/events'
import { enrichEventsWithStatus } from '@/utils/eventStatus'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// 修复 Leaflet 默认图标问题
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
})

const router = useRouter()
const route = useRoute()
const eventsStore = useEventsStore()
const { locale, t } = useI18n()

const addressSearchQuery = ref('') // 地址搜索
const locationFilterQuery = ref('') // 地点列表过滤
const selectedLocation = ref(null)
const mapContainer = ref(null)
const events = ref([])
const locations = ref([])
const searchResults = ref([]) // 地址搜索结果
const searching = ref(false)

let map = null
let markers = []
let searchMarker = null // 搜索结果标记

// Nominatim API 配置
const NOMINATIM_API = 'https://nominatim.openstreetmap.org'

// 加载比赛数据
onMounted(async () => {
  await loadEvents()
  await nextTick()
  initMap()
  
  // 如果从其他页面传来了地点参数，自动选择该地点
  if (route.query.location) {
    const location = locations.value.find(loc => 
      loc.name === route.query.location || loc.nameEn === route.query.location
    )
    if (location) {
      selectLocation(location)
    }
  } else if (locations.value.length > 0) {
    // 默认选择第一个地点
    selectLocation(locations.value[0])
  }
})

// 加载比赛数据
const loadEvents = async () => {
  try {
    const response = await eventsApi.getEvents({ page: 1, pageSize: 1000 })
    if (response.success) {
      const allEvents = response.data?.items || response.data || []
      events.value = enrichEventsWithStatus(allEvents)
      
      // 从比赛中提取地点（有经纬度的）
      extractLocations()
    }
  } catch (error) {
    console.error('Load events error:', error)
  }
}

// 从比赛中提取地点
const extractLocations = () => {
  const locationMap = new Map()
  
  events.value.forEach(event => {
    if (event.latitude && event.longitude) {
      const key = `${event.latitude},${event.longitude}`
      if (!locationMap.has(key)) {
        locationMap.set(key, {
          id: locationMap.size + 1,
          name: event.location,
          nameEn: event.locationEn,
          address: event.location || event.locationEn,
          lat: event.latitude,
          lng: event.longitude
        })
      }
    }
  })
  
  locations.value = Array.from(locationMap.values())
}

// 初始化地图
const initMap = () => {
  if (!mapContainer.value || map) return
  
  // 默认中心点（苏格兰高地区域）
  const defaultLat = 57.4778
  const defaultLng = -4.2247
  
  map = L.map(mapContainer.value).setView([defaultLat, defaultLng], 8)
  
  // 添加 OpenStreetMap 图层
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  }).addTo(map)
  
  // 添加所有地点标记
  addAllMarkers()
}

// 添加所有地点标记
const addAllMarkers = () => {
  if (!map) return
  
  // 清除旧标记
  markers.forEach(m => map.removeLayer(m))
  markers = []
  
  // 添加新标记
  locations.value.forEach(location => {
    const marker = L.marker([location.lat, location.lng])
      .addTo(map)
      .bindPopup(`
        <div style="text-align: center;">
          <strong>${locale.value === 'zh-CN' ? location.name : location.nameEn}</strong><br>
          ${location.address}
        </div>
      `)
      .on('click', () => {
        selectLocation(location)
      })
    
    markers.push(marker)
  })
}

// 地址搜索功能
const searchAddress = async () => {
  if (!addressSearchQuery.value.trim()) {
    ElMessage.warning(locale.value === 'zh-CN' ? '请输入地址' : 'Please enter address')
    return
  }
  
  searching.value = true
  searchResults.value = []
  
  try {
    const response = await fetch(
      `${NOMINATIM_API}/search?format=json&q=${encodeURIComponent(addressSearchQuery.value)}&limit=5&accept-language=${locale.value === 'zh-CN' ? 'zh-CN,zh' : 'en'}`,
      {
        headers: {
          'User-Agent': 'HighlandNexus/1.0'
        }
      }
    )
    
    if (!response.ok) throw new Error('Search failed')
    
    const data = await response.json()
    
    if (data.length === 0) {
      ElMessage.warning(locale.value === 'zh-CN' ? '未找到匹配的地址' : 'No matching addresses found')
    } else {
      searchResults.value = data
    }
  } catch (error) {
    console.error('Search error:', error)
    ElMessage.error(locale.value === 'zh-CN' ? '搜索失败' : 'Search failed')
  } finally {
    searching.value = false
  }
}

// 选择搜索结果
const selectSearchResult = (result) => {
  const lat = parseFloat(result.lat)
  const lng = parseFloat(result.lon)
  
  // 清除搜索结果
  searchResults.value = []
  
  // 在地图上显示搜索位置
  if (map) {
    // 移除旧的搜索标记
    if (searchMarker) {
      map.removeLayer(searchMarker)
    }
    
    // 创建蓝色标记（与比赛地点标记区分）
    const blueIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    })
    
    // 添加搜索标记
    searchMarker = L.marker([lat, lng], { icon: blueIcon })
      .addTo(map)
      .bindPopup(`
        <div style="text-align: center;">
          <strong>${locale.value === 'zh-CN' ? '搜索位置' : 'Search Location'}</strong><br>
          ${result.display_name}
        </div>
      `)
      .openPopup()
    
    // 移动地图到搜索位置
    map.setView([lat, lng], 13)
  }
  
  // 清空选中的地点（因为这是搜索位置，不是比赛地点）
  selectedLocation.value = null
}

// 地点列表过滤
const filteredLocations = computed(() => {
  if (!locationFilterQuery.value) {
    return locations.value
  }
  return locations.value.filter(loc =>
    loc.name.toLowerCase().includes(locationFilterQuery.value.toLowerCase()) ||
    loc.nameEn.toLowerCase().includes(locationFilterQuery.value.toLowerCase()) ||
    loc.address.toLowerCase().includes(locationFilterQuery.value.toLowerCase())
  )
})

const eventsAtLocation = computed(() => {
  if (!selectedLocation.value) return []
  return events.value.filter(event =>
    event.latitude === selectedLocation.value.lat &&
    event.longitude === selectedLocation.value.lng
  )
})

const selectLocation = (location) => {
  selectedLocation.value = location
  
  // 更新地图中心点
  if (map) {
    map.setView([location.lat, location.lng], 15)
    
    // 高亮选中的标记（打开popup）
    markers.forEach(m => {
      const latlng = m.getLatLng()
      if (latlng.lat === location.lat && latlng.lng === location.lng) {
        m.openPopup()
      }
    })
  }
}

const openInMaps = () => {
  if (selectedLocation.value) {
    // 在新窗口中打开Google Maps
    const url = `https://www.google.com/maps?q=${selectedLocation.value.lat},${selectedLocation.value.lng}`
    window.open(url, '_blank')
  }
}

const viewEvent = (eventId) => {
  router.push(`/events/${eventId}`)
}
</script>

<style lang="scss" scoped>
.map-page {
  .location-list {
    max-height: 600px;
    overflow-y: auto;

    .location-item {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 15px;
      border: 1px solid #e8e8e8;
      border-radius: 8px;
      margin-bottom: 10px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        background: #f5f5f5;
        border-color: #409eff;
      }

      &.active {
        background: #ecf5ff;
        border-color: #409eff;
      }

      .location-icon {
        flex-shrink: 0;
        color: #409eff;
      }

      .location-info {
        flex: 1;

        h3 {
          margin: 0 0 5px 0;
          font-size: 16px;
        }

        p {
          margin: 0;
          font-size: 14px;
          color: #666;
        }
      }
    }
  }

  .map-container {
    width: 100%;
    height: 600px;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #dcdfe6;
  }
  
  .location-detail {
    :deep(.el-descriptions__label) {
      font-weight: 600;
    }
  }

  .events-card {
    margin-top: 20px;

    h2 {
      margin: 0;
    }

    .event-card {
      margin-bottom: 20px;

      .event-image {
        width: 100%;
        height: 150px;
        object-fit: cover;
        border-radius: 4px;
        margin-bottom: 10px;
      }

      h3 {
        margin: 0 0 10px 0;
        font-size: 16px;
      }

      .event-date {
        display: flex;
        align-items: center;
        gap: 5px;
        color: #666;
        font-size: 14px;
      }
    }
  }
}

  .search-results {
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    
    .search-result-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px;
      cursor: pointer;
      transition: background-color 0.3s;
      
      &:hover {
        background-color: #f5f7fa;
      }
      
      &:not(:last-child) {
        border-bottom: 1px solid #ebeef5;
      }
      
      .el-icon {
        color: #409eff;
        font-size: 18px;
      }
      
      span {
        flex: 1;
        font-size: 14px;
      }
    }
  }


@media (max-width: 768px) {
  .map-container {
    height: 400px !important;
  }
}
</style>

