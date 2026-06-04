<template>
  <router-view v-if="isPublicRoute" />
  <el-container v-else class="app-container">
    <el-aside width="220px" class="app-sidebar">
      <div class="sidebar-logo">
        <el-icon :size="28"><VideoCamera /></el-icon>
        <span>舞蹈素材库</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        background-color="#1a1a2e"
        text-color="#a0a0b8"
        active-text-color="#e040fb"
        router
      >
        <el-menu-item index="/actions">
          <el-icon><Film /></el-icon>
          <span>动作素材库</span>
        </el-menu-item>
        <el-menu-item index="/choreography">
          <el-icon><Grid /></el-icon>
          <span>编排组合</span>
        </el-menu-item>
        <el-menu-item index="/share">
          <el-icon><Share /></el-icon>
          <span>分享管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-main class="app-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const isPublicRoute = computed(() => route.path.startsWith('/share/'))

const activeMenu = computed(() => {
  if (route.path.startsWith('/choreography')) return '/choreography'
  if (route.path.startsWith('/share')) return '/share'
  return '/actions'
})
</script>
