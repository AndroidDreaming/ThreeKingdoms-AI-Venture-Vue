<template>
  <div class="status-bar">
    <div class="status-item">
      <span>铜钱</span>
      <span class="status-value">{{ gameState.coins }}</span>
    </div>
    <div class="status-item">
      <span>兵力</span>
      <span class="status-value">{{ gameState.troops }}</span>
    </div>
    <div class="status-item">
      <span>身份</span>
      <span class="status-value">{{ gameState.identity }}</span>
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
.status-bar {
  display: flex;
  justify-content: space-around;
  background-color: #333;
  padding: 10px;
  border-radius: 8px;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.5);
  .status-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    span {
      color: #fff;
      font-size: 0.9rem;
    }
    .status-value {
      font-size: 1.2rem;
      font-weight: bold;
      color: #ffd700;
    }
  }
}
</style>