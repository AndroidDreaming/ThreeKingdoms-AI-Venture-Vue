<template>
  <div>
    <div v-if="enableImageRendering" class="scene-container">
      <img id="scene-img" :src="currentSceneImg" alt="场景图片">
    </div>
    <div class="story-text" id="story-text">
      {{ currentStoryText }}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    enableImageRendering: {
      type: Boolean,
      default: false,
    },
    currentSceneImg: {
      type: String,
      default: '',
    },
    currentStoryText: {
      type: String,
      default: '',
    },
  },
};
</script>

<style lang="less" scoped>
// 将原始 index.less 中 .scene-container 和 .story-text 的样式移到这里
</style>