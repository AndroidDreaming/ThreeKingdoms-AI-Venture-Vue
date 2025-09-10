<template>
  <div class="stats-panel">
    <h2 class="panel-title">角色状态</h2>
    <div class="character-info">
      <div class="char-header">
        <div class="char-icon">👤</div>
        <div id="char-name" class="char-name">{{ '当前回合数：' + gameState.turn }}</div>
      </div>
      <div class="health-bar">
        <div id="health-bar" class="health-fill" :style="{ width: (gameState.health / gameState.maxHealth * 100) + '%' }"></div>
        <div id="health-text" class="health-text">体力: {{ gameState.health }}/{{ gameState.maxHealth }}</div>
      </div>
      <div class="stats-grid">
        <div class="stat-item"><span>武力</span><span id="attack-value" class="stat-value">{{ gameState.attack }}</span></div>
        <div class="stat-item"><span>智力</span><span id="defense-value" class="stat-value">{{ gameState.defense }}</span></div>
        <div class="stat-item"><span>统率</span><span id="agility-value" class="stat-value">{{ gameState.agility }}</span></div>
        <div class="stat-item"><span>魅力</span><span id="charm-value" class="stat-value">{{ gameState.charm }}</span></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    gameState: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style lang="less" scoped>
// 可以将 index.less 中与 character-info 相关的样式剪切到这里
</style>