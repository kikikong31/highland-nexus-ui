<template>
  <el-container class="admin-layout">
    <el-aside width="260px" class="sidebar">
      <div class="logo">
        <el-icon size="30"><Setting /></el-icon>
        <span>{{ $t("nav.admin") }}</span>
      </div>

      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        @select="handleMenuSelect"
      >
        <el-menu-item index="/admin">
          <el-icon><Odometer /></el-icon>
          <span>{{ $t("admin.dashboard") }}</span>
        </el-menu-item>
        <el-menu-item index="/admin/events">
          <el-icon><Trophy /></el-icon>
          <span>{{ $t("admin.events") }}</span>
        </el-menu-item>
        <el-menu-item index="/admin/registrations">
          <el-icon><Document /></el-icon>
          <span>{{ $t("admin.registrations") }}</span>
        </el-menu-item>
        <el-menu-item index="/admin/winners">
          <el-icon><Medal /></el-icon>
          <span>{{ $t("admin.winners") }}</span>
        </el-menu-item>
      </el-menu>

      <div class="back-button">
        <el-button @click="router.push('/')" style="width: 100%">
          <el-icon><Back /></el-icon>
          {{ $t("common.back") }}
        </el-button>
      </div>
    </el-aside>

    <el-container>
      <el-header class="admin-header">
        <div class="header-content">
          <h2>{{ pageTitle }}</h2>
          <div class="header-actions">
            <el-dropdown @command="handleLanguageChange" trigger="click">
              <el-button>
                <el-icon><Globe /></el-icon>
                <span style="margin-left: 5px">{{
                  locale === "zh-CN" ? "简体中文" : "English"
                }}</span>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    command="zh-CN"
                    :disabled="locale === 'zh-CN'"
                    >简体中文</el-dropdown-item
                  >
                  <el-dropdown-item
                    command="en-US"
                    :disabled="locale === 'en-US'"
                    >English</el-dropdown-item
                  >
                </el-dropdown-menu>
              </template>
            </el-dropdown>

            <el-dropdown @command="handleUserCommand">
              <el-button>
                <el-icon><User /></el-icon>
                <span style="margin-left: 5px">{{ authStore.user?.name }}</span>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="logout">{{
                    $t("nav.logout")
                  }}</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </el-header>

      <el-main class="admin-main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useLanguageStore } from "@/stores/language";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const languageStore = useLanguageStore();
const { locale, t } = useI18n();

const activeMenu = computed(() => route.path);

const pageTitle = computed(() => {
  const titles = {
    "/admin": t("admin.dashboard"),
    "/admin/events": t("admin.events"),
    "/admin/registrations": t("admin.registrations"),
    "/admin/winners": t("admin.winners"),
  };
  return titles[route.path] || t("nav.admin");
});

const handleMenuSelect = (index) => {
  router.push(index);
};

const handleLanguageChange = (lang) => {
  locale.value = lang;
  languageStore.setLanguage(lang);
  ElMessage.success(t("common.success"));
};

const handleUserCommand = (command) => {
  if (command === "logout") {
    authStore.logout();
    ElMessage.success(t("auth.logoutSuccess"));
    router.push("/");
  }
};
</script>

<style lang="scss" scoped>
.admin-layout {
  min-height: 100vh;
}

.sidebar {
  background: #001529;
  color: white;
  //display: flex;
  flex-direction: column;

  .logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 20px;
    font-size: 18px;
    font-weight: bold;
    color: #ffffff;
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  }

  .sidebar-menu {
    flex: 1;
    border-right: none;
    background: transparent;

    :deep(.el-menu-item) {
      color: rgba(255, 255, 255, 0.85);
      transition: all 0.3s;

      &:hover {
        background-color: rgba(255, 255, 255, 0.08);
        color: #ffffff;
      }

      &.is-active {
        background-color: #1890ff;
        color: #ffffff;
      }

      .el-icon {
        color: inherit;
      }
    }
  }

  .back-button {
    padding: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.15);

    .el-button {
      background-color: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.2);
      color: rgba(255, 255, 255, 0.85);

      &:hover {
        background-color: rgba(255, 255, 255, 0.15);
        border-color: rgba(255, 255, 255, 0.3);
        color: #ffffff;
      }
    }
  }
}

.admin-header {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;

  .header-content {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
      margin: 0;
      font-size: 20px;
    }

    .header-actions {
      display: flex;
      gap: 10px;
    }
  }
}

.admin-main {
  background: #f0f2f5;
  padding: 24px;
}
</style>
