<template>
  <div class="event-list-page page-container">
    <div class="page-header">
      <h1>{{ $t("event.title") }}</h1>
    </div>

    <!-- Search Bar -->
    <el-card class="search-card">
      <el-form :inline="true">
        <el-form-item>
          <el-input
            v-model="searchQuery"
            :placeholder="$t('event.searchPlaceholder')"
            prefix-icon="Search"
            clearable
            style="width: 300px"
          />
        </el-form-item>
        <el-form-item>
          <el-select
            v-model="statusFilter"
            :placeholder="locale === 'zh-CN' ? '比赛状态' : 'Status'"
            clearable
            style="width: 150px"
          >
            <el-option :label="$t('event.status.upcoming')" value="upcoming" />
            <el-option :label="$t('event.status.ongoing')" value="ongoing" />
            <el-option :label="$t('event.status.finished')" value="finished" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">{{
            $t("common.search")
          }}</el-button>
          <el-button @click="handleReset">{{ $t("common.reset") }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Event List -->
    <div class="event-list" v-loading="loading">
      <el-row :gutter="20">
        <el-col
          :xs="24"
          :sm="12"
          :lg="8"
          v-for="event in events"
          :key="event.id"
        >
          <el-card
            class="event-card"
            :body-style="{ padding: '0' }"
            shadow="hover"
          >
            <div class="event-image-wrapper">
              <img :src="event.image" class="event-image" />
              <el-tag
                :type="getStatusType(event.computedStatus)"
                class="status-tag"
              >
                {{ $t(`event.status.${event.computedStatus}`) }}
              </el-tag>
            </div>

            <div class="event-content">
              <h3>{{ locale === "zh-CN" ? event.name : event.nameEn }}</h3>

              <div class="event-info">
                <div class="info-item">
                  <el-icon><Calendar /></el-icon>
                  <span>{{ event.date }}</span>
                </div>
                <div class="info-item">
                  <el-icon><Location /></el-icon>
                  <span>{{
                    locale === "zh-CN" ? event.location : event.locationEn
                  }}</span>
                </div>
                <div class="info-item">
                  <el-icon><User /></el-icon>
                  <span
                    >{{ event.currentParticipants }}/{{
                      event.maxParticipants
                    }}</span
                  >
                </div>
              </div>

              <el-progress
                :percentage="
                  (
                    (event.currentParticipants / event.maxParticipants) *
                    100
                  ).toFixed(0)
                "
                :color="
                  getProgressColor(
                    event.currentParticipants,
                    event.maxParticipants
                  )
                "
                :show-text="false"
                style="margin: 15px 0"
              />

              <div class="event-actions">
                <el-button
                  type="primary"
                  @click="viewDetail(event.id)"
                  style="flex: 1"
                >
                  {{ $t("event.detail") }}
                </el-button>
                <el-button
                  v-if="event.computedStatus === 'upcoming'"
                  type="success"
                  @click="registerEvent(event.id)"
                  :disabled="event.currentParticipants >= event.maxParticipants"
                  style="flex: 1"
                >
                  {{
                    event.currentParticipants >= event.maxParticipants
                      ? locale === "zh-CN"
                        ? "已满"
                        : "Full"
                      : $t("event.register")
                  }}
                </el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-empty
        v-if="events.length === 0 && !loading"
        :description="$t('common.noData')"
      />

      <!-- 分页 -->
      <el-pagination
        v-if="total > 0"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[9, 18, 27, 36]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
        style="margin-top: 20px; justify-content: center"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import { eventsApi } from "@/api/events";
import { enrichEventsWithStatus } from "@/utils/eventStatus";

const router = useRouter();
const authStore = useAuthStore();
const { locale, t } = useI18n();

const searchQuery = ref("");
const statusFilter = ref("");
const loading = ref(false);

// 分页数据
const events = ref([]);
const currentPage = ref(1);
const pageSize = ref(9);
const total = ref(0);

// 加载比赛列表
onMounted(() => {
  loadEvents();
});

const loadEvents = async () => {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      search: searchQuery.value || undefined,
      // 状态过滤在前端通过计算状态处理，因为后端存储的状态可能不准确
    };

    const response = await eventsApi.getEvents(params);

    if (response.success) {
      // 为所有事件添加计算后的状态
      const eventsWithStatus = enrichEventsWithStatus(
        response.data.items || []
      );

      // 如果有状态过滤，在前端过滤
      if (statusFilter.value) {
        events.value = eventsWithStatus.filter(
          (event) => event.computedStatus === statusFilter.value
        );
        // 注意：这里 total 不准确，但是为了简单起见暂时这样处理
        total.value = events.value.length;
      } else {
        events.value = eventsWithStatus;
        total.value = response.data.total || 0;
      }
    } else {
      ElMessage.error(
        response.message ||
          (locale.value === "zh-CN" ? "加载失败" : "Load failed")
      );
    }
  } catch (error) {
    console.error("Load events error:", error);
    ElMessage.error(locale.value === "zh-CN" ? "加载失败" : "Load failed");
  } finally {
    loading.value = false;
  }
};

const getStatusType = (status) => {
  const types = {
    upcoming: "warning",
    ongoing: "success",
    finished: "info",
  };
  return types[status] || "info";
};

const getProgressColor = (current, max) => {
  const percentage = (current / max) * 100;
  if (percentage >= 90) return "#f56c6c";
  if (percentage >= 70) return "#e6a23c";
  return "#67c23a";
};

const handleSearch = () => {
  currentPage.value = 1; // 重置到第一页
  loadEvents();
};

const handleReset = () => {
  searchQuery.value = "";
  statusFilter.value = "";
  currentPage.value = 1;
  loadEvents();
};

const handlePageChange = () => {
  loadEvents();
};

const handleSizeChange = () => {
  currentPage.value = 1; // 改变每页数量时重置到第一页
  loadEvents();
};

// 监听状态过滤变化
watch(statusFilter, () => {
  currentPage.value = 1;
  loadEvents();
});

const viewDetail = (id) => {
  router.push(`/events/${id}`);
};

const registerEvent = (id) => {
  if (!authStore.isLoggedIn) {
    ElMessage.warning(
      locale.value === "zh-CN" ? "请先登录" : "Please login first"
    );
    router.push({ name: "Login", query: { redirect: `/registration/${id}` } });
    return;
  }
  router.push(`/registration/${id}`);
};
</script>

<style lang="scss" scoped>
.event-list-page {
  .search-card {
    margin-bottom: 20px;
  }

  .event-list {
    .event-card {
      margin-bottom: 20px;
      border-radius: 12px;
      overflow: hidden;
      transition: transform 0.3s;

      &:hover {
        transform: translateY(-5px);
      }

      .event-image-wrapper {
        position: relative;

        .event-image {
          width: 100%;
          height: 220px;
          object-fit: cover;
        }

        .status-tag {
          position: absolute;
          top: 10px;
          right: 10px;
        }
      }

      .event-content {
        padding: 20px;

        h3 {
          margin: 0 0 15px 0;
          font-size: 20px;
          font-weight: bold;
        }

        .event-info {
          .info-item {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 10px;
            color: #666;
            font-size: 14px;
          }
        }

        .event-actions {
          display: flex;
          gap: 10px;
          margin-top: 15px;
        }
      }
    }
  }
}
</style>

