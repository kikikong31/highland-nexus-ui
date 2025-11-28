<template>
  <div class="admin-events-page">
    <el-button type="primary" @click="handleAdd" style="margin-bottom: 20px">
      <el-icon><Plus /></el-icon>
      {{ $t("admin.add") }}
    </el-button>

    <el-card>
      <el-table :data="eventsStore.events" stripe>
        <el-table-column type="index" label="#" width="60" />

        <el-table-column :label="$t('admin.eventForm.name')" min-width="200">
          <template #default="scope">
            <div>
              <div>
                {{ locale === "zh-CN" ? scope.row.name : scope.row.nameEn }}
              </div>
              <el-text size="small" type="info">{{ scope.row.date }}</el-text>
            </div>
          </template>
        </el-table-column>

        <el-table-column :label="$t('event.location')" min-width="150">
          <template #default="scope">
            {{ locale === "zh-CN" ? scope.row.location : scope.row.locationEn }}
          </template>
        </el-table-column>

        <el-table-column :label="$t('event.participants')" width="120">
          <template #default="scope">
            {{ scope.row.currentParticipants }}/{{ scope.row.maxParticipants }}
          </template>
        </el-table-column>

        <el-table-column :label="$t('admin.eventForm.status')" width="120">
          <template #default="scope">
            <el-tag :type="getStatusType(calculateStatus(scope.row.date))">
              {{ $t(`event.status.${calculateStatus(scope.row.date)}`) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column
          :label="$t('common.operation')"
          width="180"
          fixed="right"
        >
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              link
              @click="handleEdit(scope.row)"
            >
              {{ $t("admin.edit") }}
            </el-button>
            <el-button
              type="danger"
              size="small"
              link
              @click="handleDelete(scope.row)"
            >
              {{ $t("admin.delete") }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Add/Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? $t('admin.edit') : $t('admin.add')"
      width="900px"
    >
      <el-form
        :model="formData"
        :rules="rules"
        ref="formRef"
        label-width="140px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              :label="locale === 'zh-CN' ? '中文名称' : 'Chinese Name'"
              prop="name"
            >
              <el-input
                v-model="formData.name"
                :placeholder="$t('admin.eventForm.namePlaceholder')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              :label="locale === 'zh-CN' ? '英文名称' : 'English Name'"
              prop="nameEn"
            >
              <el-input
                v-model="formData.nameEn"
                placeholder="Event Name (English)"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('admin.eventForm.date')" prop="date">
              <el-date-picker
                v-model="formData.date"
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              :label="$t('admin.eventForm.maxParticipants')"
              prop="maxParticipants"
            >
              <el-input-number
                v-model="formData.maxParticipants"
                :min="1"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item
          :label="locale === 'zh-CN' ? '比赛地点' : 'Event Location'"
          prop="location"
        >
          <MapPicker v-model="locationData" />
        </el-form-item>

        <el-form-item :label="$t('admin.eventForm.status')" prop="status">
          <el-alert type="info" :closable="false" style="margin-bottom: 10px">
            <template #title>
              {{
                locale === "zh-CN"
                  ? "提示：比赛状态将根据比赛日期自动计算，此字段仅用于数据存储"
                  : "Note: Event status will be calculated based on event date. This field is for storage only."
              }}
            </template>
          </el-alert>
          <el-radio-group v-model="formData.status">
            <el-radio label="upcoming">{{
              $t("event.status.upcoming")
            }}</el-radio>
            <el-radio label="ongoing">{{
              $t("event.status.ongoing")
            }}</el-radio>
            <el-radio label="finished">{{
              $t("event.status.finished")
            }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          :label="locale === 'zh-CN' ? '中文介绍' : 'Description (CN)'"
          prop="description"
        >
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            :placeholder="$t('admin.eventForm.descriptionPlaceholder')"
          />
        </el-form-item>

        <el-form-item
          :label="locale === 'zh-CN' ? '英文介绍' : 'Description (EN)'"
          prop="descriptionEn"
        >
          <el-input
            v-model="formData.descriptionEn"
            type="textarea"
            :rows="3"
            placeholder="Description (English)"
          />
        </el-form-item>

        <el-form-item
          :label="locale === 'zh-CN' ? '比赛图片' : 'Event Image'"
          prop="image"
        >
          <ImageUpload v-model="formData.image" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              :label="locale === 'zh-CN' ? '中文要求' : 'Requirements (CN)'"
              prop="requirements"
            >
              <el-input
                v-model="formData.requirements"
                type="textarea"
                :rows="2"
                placeholder="参赛要求"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              :label="locale === 'zh-CN' ? '英文要求' : 'Requirements (EN)'"
              prop="requirementsEn"
            >
              <el-input
                v-model="formData.requirementsEn"
                type="textarea"
                :rows="2"
                placeholder="Requirements (English)"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              :label="locale === 'zh-CN' ? '中文奖品' : 'Prize (CN)'"
              prop="prize"
            >
              <el-input
                v-model="formData.prize"
                type="textarea"
                :rows="2"
                placeholder="奖品说明"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              :label="locale === 'zh-CN' ? '英文奖品' : 'Prize (EN)'"
              prop="prizeEn"
            >
              <el-input
                v-model="formData.prizeEn"
                type="textarea"
                :rows="2"
                placeholder="Prize (English)"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">{{
          $t("admin.cancel")
        }}</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          {{ $t("admin.save") }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from "vue";
import { useEventsStore } from "@/stores/events";
import { useI18n } from "vue-i18n";
import { ElMessage, ElMessageBox } from "element-plus";
import ImageUpload from "@/components/ImageUpload.vue";
import MapPicker from "@/components/MapPicker.vue";
import { eventsApi } from "@/api/events";
import { calculateEventStatus } from "@/utils/eventStatus";

const eventsStore = useEventsStore();
const { locale, t } = useI18n();

// 计算状态的辅助函数
const calculateStatus = (date) => calculateEventStatus(date);

// 加载比赛列表
onMounted(() => {
  loadEvents();
});

const loadEvents = async () => {
  try {
    const response = await eventsApi.getEvents();
    if (response.success) {
      eventsStore.setEvents(response.data.items);
    }
  } catch (error) {
    console.error("Load events error:", error);
  }
};

const dialogVisible = ref(false);
const isEdit = ref(false);
const loading = ref(false);
const formRef = ref(null);
const editingId = ref(null);

const formData = reactive({
  name: "",
  nameEn: "",
  date: "",
  location: "",
  locationEn: "",
  latitude: null,
  longitude: null,
  description: "",
  descriptionEn: "",
  requirements: "",
  requirementsEn: "",
  prize: "",
  prizeEn: "",
  maxParticipants: 50,
  status: "upcoming",
  image: "",
});

// 地图选择器的数据
const locationData = computed({
  get: () => ({
    latitude: formData.latitude,
    longitude: formData.longitude,
    location: formData.location,
    locationEn: formData.locationEn,
  }),
  set: (val) => {
    formData.latitude = val.latitude;
    formData.longitude = val.longitude;
    formData.location = val.location;
    formData.locationEn = val.locationEn;
  },
});

const rules = {
  name: [
    {
      required: true,
      message: t("admin.eventForm.namePlaceholder"),
      trigger: "blur",
    },
  ],
  nameEn: [{ required: true, message: "Required", trigger: "blur" }],
  date: [{ required: true, message: "Required", trigger: "blur" }],
  location: [
    {
      required: true,
      message: t("admin.eventForm.locationPlaceholder"),
      trigger: "blur",
    },
  ],
  maxParticipants: [{ required: true, message: "Required", trigger: "blur" }],
};

const getStatusType = (status) => {
  const types = { upcoming: "warning", ongoing: "success", finished: "info" };
  return types[status] || "info";
};

const handleAdd = () => {
  isEdit.value = false;
  resetForm();
  dialogVisible.value = true;
};

const handleEdit = async (row) => {
  isEdit.value = true;
  editingId.value = row.id;

  // 显示加载提示
  const loading = ElMessage({
    message: locale.value === "zh-CN" ? "加载中..." : "Loading...",
    type: "info",
    duration: 0, // 不自动关闭
  });

  // 从 API 获取完整的比赛详情
  try {
    const response = await eventsApi.getEventById(row.id);
    loading.close();

    if (response.success) {
      // 使用完整的数据填充表单
      Object.assign(formData, response.data);
      dialogVisible.value = true;
    } else {
      ElMessage.error(
        response.message ||
          (locale.value === "zh-CN" ? "获取详情失败" : "Failed to load details")
      );
    }
  } catch (error) {
    loading.close();
    console.error("Load event detail error:", error);
    ElMessage.error(
      locale.value === "zh-CN" ? "获取详情失败" : "Failed to load details"
    );
  }
};

const handleDelete = (row) => {
  ElMessageBox.confirm(t("admin.deleteConfirm"), t("common.confirm"), {
    confirmButtonText: t("common.confirm"),
    cancelButtonText: t("common.cancel"),
    type: "warning",
  })
    .then(async () => {
      try {
        const response = await eventsApi.deleteEvent(row.id);
        if (response.success) {
          ElMessage.success(t("admin.deleteSuccess"));
          loadEvents(); // 重新加载列表
        } else {
          ElMessage.error(response.message || t("admin.deleteFailed"));
        }
      } catch (error) {
        console.error("Delete error:", error);
        ElMessage.error(t("admin.deleteFailed"));
      }
    })
    .catch(() => {
      // 用户取消删除
    });
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;

      try {
        const eventData = {
          name: formData.name,
          nameEn: formData.nameEn,
          date: formData.date,
          location: formData.location,
          locationEn: formData.locationEn,
          latitude: formData.latitude,
          longitude: formData.longitude,
          description: formData.description,
          descriptionEn: formData.descriptionEn,
          requirements: formData.requirements,
          requirementsEn: formData.requirementsEn,
          prize: formData.prize,
          prizeEn: formData.prizeEn,
          maxParticipants: formData.maxParticipants,
          status: formData.status,
          image: formData.image,
        };

        let response;
        if (isEdit.value) {
          response = await eventsApi.updateEvent(editingId.value, eventData);
        } else {
          response = await eventsApi.createEvent(eventData);
        }

        if (response.success) {
          ElMessage.success(t("admin.saveSuccess"));
          dialogVisible.value = false;
          loadEvents(); // 重新加载列表
        } else {
          ElMessage.error(response.message || t("admin.saveFailed"));
        }
      } catch (error) {
        console.error("Submit error:", error);
        ElMessage.error(t("admin.saveFailed"));
      } finally {
        loading.value = false;
      }
    }
  });
};

const resetForm = () => {
  Object.assign(formData, {
    name: "",
    nameEn: "",
    date: "",
    location: "",
    locationEn: "",
    latitude: null,
    longitude: null,
    description: "",
    descriptionEn: "",
    requirements: "",
    requirementsEn: "",
    prize: "",
    prizeEn: "",
    maxParticipants: 50,
    status: "upcoming",
    image: "",
  });
};
</script>

<style lang="scss" scoped>
.admin-events-page {
  // Styles
}
</style>

