<template>
  <div class="map-picker">
    <el-input
      v-model="searchQuery"
      :placeholder="locale === 'zh-CN' ? '搜索地址...' : 'Search address...'"
      @keyup.enter="searchAddress"
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
      <el-card class="search-results">
        <div
          v-for="result in searchResults"
          :key="result.place_id"
          class="search-result-item"
          @click="selectResult(result)"
        >
          <el-icon><MapLocation /></el-icon>
          <span>{{ result.display_name }}</span>
        </div>
      </el-card>
    </el-scrollbar>

    <!-- 地图容器 -->
    <div ref="mapContainer" class="map-container"></div>

    <!-- 位置信息 -->
    <el-card v-if="modelValue.latitude && modelValue.longitude" class="location-info" style="margin-top: 10px;">
      <el-descriptions :column="1" size="small" border>
        <el-descriptions-item :label="locale === 'zh-CN' ? '中文地址' : 'Chinese Address'">
          {{ modelValue.location || (locale === 'zh-CN' ? '未知' : 'Unknown') }}
        </el-descriptions-item>
        <el-descriptions-item :label="locale === 'zh-CN' ? '英文地址' : 'English Address'">
          {{ modelValue.locationEn || (locale === 'zh-CN' ? '未知' : 'Unknown') }}
        </el-descriptions-item>
        <el-descriptions-item :label="locale === 'zh-CN' ? '纬度' : 'Latitude'">
          {{ modelValue.latitude?.toFixed(6) }}
        </el-descriptions-item>
        <el-descriptions-item :label="locale === 'zh-CN' ? '经度' : 'Longitude'">
          {{ modelValue.longitude?.toFixed(6) }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { Search, MapLocation } from '@element-plus/icons-vue'
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

const { locale } = useI18n()

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      latitude: null,
      longitude: null,
      location: '',
      locationEn: ''
    })
  }
})

const emit = defineEmits(['update:modelValue'])

const mapContainer = ref(null)
const searchQuery = ref('')
const searchResults = ref([])
const searching = ref(false)
const displayAddress = ref('')

let map = null
let marker = null

// Nominatim API 配置
const NOMINATIM_API = 'https://nominatim.openstreetmap.org'

onMounted(async () => {
  await nextTick()
  initMap()
  
  // 如果已有坐标，显示在地图上
  if (props.modelValue.latitude && props.modelValue.longitude) {
    setMarker(props.modelValue.latitude, props.modelValue.longitude)
    // 根据当前语言显示对应地址
    displayAddress.value = locale.value === 'zh-CN' 
      ? (props.modelValue.location || props.modelValue.locationEn)
      : (props.modelValue.locationEn || props.modelValue.location)
  }
})

// 初始化地图
const initMap = () => {
  if (!mapContainer.value || map) return

  // 默认中心点（苏格兰高地区域）
  const defaultLat = props.modelValue.latitude || 57.4778
  const defaultLng = props.modelValue.longitude || -4.2247
  
  map = L.map(mapContainer.value).setView([defaultLat, defaultLng], 13)
  
  // 添加 OpenStreetMap 图层
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  }).addTo(map)
  
  // 点击地图设置标记
  map.on('click', async (e) => {
    const { lat, lng } = e.latlng
    setMarker(lat, lng)
    
    // 反向地理编码获取地址
    await reverseGeocode(lat, lng)
  })
}

// 搜索地址
const searchAddress = async () => {
  if (!searchQuery.value.trim()) {
    ElMessage.warning(locale.value === 'zh-CN' ? '请输入地址' : 'Please enter address')
    return
  }
  
  searching.value = true
  searchResults.value = []
  
  try {
    const response = await fetch(
      `${NOMINATIM_API}/search?format=json&q=${encodeURIComponent(searchQuery.value)}&limit=5&accept-language=${locale.value === 'zh-CN' ? 'zh-CN,zh' : 'en'}`
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
const selectResult = async (result) => {
  const lat = parseFloat(result.lat)
  const lng = parseFloat(result.lon)
  
  setMarker(lat, lng)
  displayAddress.value = result.display_name
  searchResults.value = []
  searchQuery.value = result.display_name
  
  // 同时获取中英文地址
  await fetchBothLanguageAddresses(lat, lng)
}

// 反向地理编码（根据坐标获取地址）
const reverseGeocode = async (lat, lng) => {
  try {
    // 同时获取中英文地址
    await fetchBothLanguageAddresses(lat, lng)
  } catch (error) {
    console.error('Reverse geocode error:', error)
    // 即使反向地理编码失败，也更新坐标
    updateValue(lat, lng, '', '')
  }
}

// 同时获取中英文地址
const fetchBothLanguageAddresses = async (lat, lng) => {
  try {
    // 添加延迟避免频率限制
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))
    
    // 获取英文地址
    const responseEn = await fetch(
      `${NOMINATIM_API}/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`,
      {
        headers: {
          'User-Agent': 'HighlandNexus/1.0'
        }
      }
    )
    
    if (!responseEn.ok) throw new Error('Reverse geocode failed')
    const dataEn = await responseEn.json()
    const addressEn = dataEn.display_name || ''
    
    // 延迟1秒避免API频率限制
    await delay(1100)
    
    // 获取中文地址
    const responseZh = await fetch(
      `${NOMINATIM_API}/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=zh-CN,zh`,
      {
        headers: {
          'User-Agent': 'HighlandNexus/1.0'
        }
      }
    )
    
    let addressZh = addressEn // 默认使用英文地址
    if (responseZh.ok) {
      const dataZh = await responseZh.json()
      addressZh = dataZh.display_name || addressEn
    }
    
    // 根据当前语言设置显示地址
    displayAddress.value = locale.value === 'zh-CN' ? addressZh : addressEn
    searchQuery.value = locale.value === 'zh-CN' ? addressZh : addressEn
    
    // 更新表单数据，分别传入中英文地址
    updateValue(lat, lng, addressZh, addressEn)
  } catch (error) {
    console.error('Fetch both language addresses error:', error)
    ElMessage.error(locale.value === 'zh-CN' ? '获取地址失败' : 'Failed to fetch address')
    // 失败时也更新坐标，但地址为空
    updateValue(lat, lng, '', '')
  }
}

// 设置地图标记
const setMarker = (lat, lng) => {
  if (!map) return
  
  // 移除旧标记
  if (marker) {
    map.removeLayer(marker)
  }
  
  // 添加新标记
  marker = L.marker([lat, lng]).addTo(map)
  
  // 将地图中心移到新位置
  map.setView([lat, lng], 13)
}

// 更新值
const updateValue = (lat, lng, locationZh, locationEn) => {
  emit('update:modelValue', {
    latitude: lat,
    longitude: lng,
    location: locationZh, // 中文地址
    locationEn: locationEn // 英文地址
  })
}

// 监听 props 变化
watch(() => props.modelValue, (newVal) => {
  if (newVal.latitude && newVal.longitude && map) {
    setMarker(newVal.latitude, newVal.longitude)
    // 根据当前语言显示对应地址
    displayAddress.value = locale.value === 'zh-CN' 
      ? (newVal.location || newVal.locationEn)
      : (newVal.locationEn || newVal.location)
  }
}, { deep: true })
</script>

<style lang="scss" scoped>
.map-picker {
  .map-container {
    width: 100%;
    height: 400px;
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid #dcdfe6;
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
  
  .location-info {
    :deep(.el-descriptions__label) {
      font-weight: 600;
    }
  }
}
</style>

