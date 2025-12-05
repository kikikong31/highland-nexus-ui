<template>
  <el-container class="main-layout">
    <el-header class="header">
      <div class="header-content">
        <div class="logo" @click="router.push('/')">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3050/3050414.png"
            alt="Logo"
          />
          <span>{{ $t("home.title") }}</span>
        </div>

        <!-- 导航 -->
        <div class="quick-nav">
          <a href="#" @click.prevent="router.push('/')" class="nav-link">
            {{ locale === "zh-CN" ? "首页" : "home" }}
          </a>
          <span class="nav-divider">/</span>
          <a
            href="#"
            @click.prevent="handleQuickRegister"
            class="nav-link"
            :class="{ disabled: !authStore.isLoggedIn }"
          >
            {{ locale === "zh-CN" ? "比赛" : "Competitions" }}
          </a>
          <span class="nav-divider">/</span>
          <a href="#" @click.prevent="router.push('/winners')" class="nav-link">
            {{ locale === "zh-CN" ? "获奖者" : "Winners" }}
          </a>
          <span class="nav-divider">/</span>
          <a href="#" @click.prevent="router.push('/map')" class="nav-link">
            {{ locale === "zh-CN" ? "地图" : "Map" }}
          </a>
          <span class="nav-divider" v-if="authStore.isAdmin">/</span>
          <a
            href="#"
            @click.prevent="router.push('/admin')"
            class="nav-link admin-link"
            v-if="authStore.isAdmin"
          >
            {{ locale === "zh-CN" ? "管理" : "Admin" }}
          </a>
        </div>

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
                <el-dropdown-item command="zh-CN" :disabled="locale === 'zh-CN'"
                  >简体中文</el-dropdown-item
                >
                <el-dropdown-item command="en-US" :disabled="locale === 'en-US'"
                  >English</el-dropdown-item
                >
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <template v-if="!authStore.isLoggedIn">
            <el-button @click="router.push('/login')">{{
              $t("nav.login")
            }}</el-button>
            <el-button type="primary" @click="router.push('/register')">{{
              $t("nav.register")
            }}</el-button>
          </template>
          <template v-else>
            <el-dropdown @command="handleUserCommand">
              <el-button circle>
                <el-icon><User /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item disabled>{{
                    authStore.user?.name
                  }}</el-dropdown-item>
                  <el-dropdown-item divided command="profile">{{
                    $t("nav.profile")
                  }}</el-dropdown-item>
                  <el-dropdown-item command="logout">{{
                    $t("nav.logout")
                  }}</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </div>
      </div>
    </el-header>

    <el-main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </el-main>

    <el-footer class="footer">
      <div class="footer-content">
        <p>&copy; 2026 {{ $t("home.title") }}. All rights reserved.</p>
        <p>{{ $t("home.subtitle") }}</p>
      </div>
    </el-footer>
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

const handleLanguageChange = (lang) => {
  locale.value = lang;
  languageStore.setLanguage(lang);
  ElMessage.success(t("common.success"));
};

const handleQuickRegister = () => {
  if (!authStore.isLoggedIn) {
    ElMessage.warning(
      locale.value === "zh-CN"
        ? "请先登录后再报名"
        : "Please login first to apply"
    );
    router.push("/login");
    return;
  }
  // 跳转到比赛列表，用户可以选择要报名的比赛
  router.push("/events");
};

const handleUserCommand = (command) => {
  if (command === "logout") {
    authStore.logout();
    ElMessage.success(t("auth.logoutSuccess"));
    router.push("/");
  } else if (command === "profile") {
    router.push("/profile");
  }
};
</script>

<style lang="scss" scoped>
.main-layout {
  min-height: 100vh;
}

.header {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;

  .header-content {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    padding: 0 20px;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    font-size: 20px;
    font-weight: bold;
    color: var(--primary-color);
    white-space: nowrap;

    img {
      height: 40px;
    }
  }

  .quick-nav {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0 30px;
    flex: 1;
    font-size: 15px;

    .nav-link {
      color: #333;
      text-decoration: none;
      font-weight: 500;
      transition: all 0.3s;
      white-space: nowrap;
      padding: 4px 8px;
      border-radius: 4px;

      &:hover:not(.disabled) {
        color: var(--primary-color);
        background-color: rgba(0, 94, 184, 0.05);
      }

      &.disabled {
        color: #999;
        cursor: not-allowed;
      }

      &.admin-link {
        color: #f56c6c;
        font-weight: 600;

        &:hover {
          color: #f56c6c;
          background-color: rgba(245, 108, 108, 0.1);
        }
      }
    }

    .nav-divider {
      color: #ddd;
      font-weight: 300;
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }
}

.main-content {
  width: 100%;
  padding: 0;
  min-height: calc(100vh - 200px);
}

.footer {
  background: #001529;
  color: white;
  text-align: center;
  height: auto;

  .footer-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px;

    p {
      margin: 5px 0;
      font-size: 14px;

      &:first-child {
        font-weight: 500;
      }

      &:last-child {
        opacity: 0.8;
      }
    }
  }
}

@media (max-width: 992px) {
  .quick-nav {
    display: none;
  }
}

@media (max-width: 768px) {
  .header {
    .logo span {
      display: none;
    }

    .header-actions {
      gap: 5px;

      .el-button span {
        display: none;
      }
    }
  }
}
</style>

