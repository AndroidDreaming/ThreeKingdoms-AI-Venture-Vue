<template>
  <header>
    <h1>{{ $gameTitle }}</h1>
    <p class="subtitle">{{ $gameSubtitle }}</p>
    <p class="version">版本：{{ $gameVision }}</p>
  </header>
</template>

<script>
export default {
  // 这个组件是静态的，不需要props或复杂逻辑
};
</script>

<style lang="less" scoped>
header {
  text-align: center;
  margin-bottom: 20px;
  h1 {
    font-size: 2.5rem;
    color: #fff;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  }
  .subtitle {
    font-size: 1.2rem;
    color: #ddd;
    margin-top: 5px;
  }
  .version {
    font-size: 0.8rem;
    color: #aaa;
    margin-top: 5px;
  }
}
</style>