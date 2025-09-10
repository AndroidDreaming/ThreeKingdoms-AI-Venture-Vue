<template>
  <div>
    <div class="skills-container">
      <h3 class="panel-title">战法/计策</h3>
      <div id="skills-list" class="scrollable-content">
        <div v-if="!skills || skills.length === 0">尚未习得任何战法或计策</div>
        <div v-for="(skill, index) in skills" :key="index">
          <div class="skill-name"><i :class="skill.icon || 'fa-solid fa-book'"></i> {{ skill.name }}</div>
          <div class="skill-description">{{ skill.description }}</div>
        </div>
      </div>
    </div>
    <div class="inventory-container">
      <h3 class="panel-title">行囊</h3>
      <div id="items-grid" class="scrollable-content">
        <div v-if="!items || items.length === 0" class="list-item">行囊空空...</div>
        <div v-for="(item, index) in items" class="list-item" :key="index">
          <div class="list-icon">
            <i class="fa-solid fa-box"></i>
          </div>
          <div class="list-content">
            <div class="list-name">
              {{ item.name }}
              <span class="list-count">x{{ item.count }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    skills: {
      type: Array,
      default: () => [],
    },
    items: {
      type: Array,
      default: () => [],
    },
  },
};
</script>

<style lang="less" scoped>
// 将原始 index.less 中 .skills-container 和 .inventory-container 的样式移到这里
</style>