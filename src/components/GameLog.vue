<template>
  <div>
    <div class="achievement-container">
      <h3 class="panel-title">功绩</h3>
      <div id="achievement-list" class="scrollable-content">
        <div v-if="!achievements || achievements.length === 0">尚无功绩可言</div>
        <template v-for="(achievement, index) in achievements">
          <div v-if="achievement.unlocked" class="achievement-text" :key="index">• {{ achievement.text }}</div>
        </template>
      </div>
    </div>
    <div class="adventure-log-container">
      <h3 class="panel-title">大事记</h3>
      <div id="adventure-log" class="scrollable-content">
        <div v-if="!adventureLog || adventureLog.length === 0">天下大事，由你书写...</div>
        <div v-for="(log, index) in adventureLog" :key="index" class="adventure-log-text">• {{ log.entry }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    achievements: {
      type: Array,
      default: () => [],
    },
    adventureLog: {
      type: Array,
      default: () => [],
    },
  },
};
</script>

<style lang="less" scoped>
// 将原始 index.less 中 .achievement-container 和 .adventure-log-container 的样式移到这里
</style>