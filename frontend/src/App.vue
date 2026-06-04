<template>
  <div class="app-container">
    <header class="app-header">
      <div class="header-content">
        <h1 class="retro-title header-title">
          <el-icon class="header-icon"><Van /></el-icon>
          复古汽车修复进度跟踪
        </h1>
        <p class="header-subtitle">记录每一辆经典车的重生之旅</p>
      </div>
    </header>
    <main class="app-main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <footer class="app-footer">
      <p>© 2024 复古汽车修复工作室 | 匠心传承，经典永恒</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.app-container {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: linear-gradient(180deg, var(--retro-bg-medium), var(--retro-bg-dark));
  border-bottom: 3px solid var(--retro-gold);
  padding: 20px 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  text-align: center;
}

.header-title {
  font-size: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 8px;
}

.header-icon {
  font-size: 3rem;
  color: var(--retro-gold);
}

.header-subtitle {
  color: var(--retro-text-secondary);
  font-style: italic;
  font-size: 1.1rem;
  letter-spacing: 1px;
}

.app-main {
  flex: 1;
  padding: 30px 20px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.app-footer {
  background: var(--retro-bg-dark);
  border-top: 2px solid var(--retro-border);
  padding: 20px;
  text-align: center;
  color: var(--retro-text-secondary);
  font-size: 0.9rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

@media (max-width: 768px) {
  .header-title {
    font-size: 1.8rem;
    flex-direction: column;
    gap: 10px;
  }

  .header-icon {
    font-size: 2.5rem;
  }

  .header-subtitle {
    font-size: 0.95rem;
  }

  .app-main {
    padding: 20px 15px;
  }
}
</style>
