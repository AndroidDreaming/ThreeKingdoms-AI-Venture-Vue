<template>
  <div class="loading" id="loading" :class="{ active: true }">
    <div class="loading-spinner"></div>
    <div class="loading-text">{{ currentLoadingText }}</div>
  </div>
</template>

<script>
import loadingContent from '@/configs/loading_text.js';

export default {
  data() {
    return {
      loadingTexts: loadingContent,
      loadingTextIndex: 0,
      currentLoadingText: '',
      currentCharIndex: 0,
      typeInterval: null,
      nextSentenceTimeout: null,
    };
  },
  mounted() {
    this.startLoadingTextAnimation();
  },
  beforeUnmount() {
    this.stopLoadingTextAnimation();
  },
  methods: {
    startLoadingTextAnimation() {
      this.loadingTextIndex = Math.floor(Math.random() * this.loadingTexts.length);
      this._currentCharIndex = 0;
      this.currentLoadingText = '';
      this._typeNextCharacter();
    },
    _typeNextCharacter() {
      const fullText = this.loadingTexts[this.loadingTextIndex];
      if (!fullText) {
        this.stopLoadingTextAnimation();
        return;
      }
      if (this._currentCharIndex >= fullText.length) {
        clearTimeout(this._typeInterval);
        this._typeInterval = null;
        this._nextSentenceTimeout = setTimeout(() => {
          this.loadingTextIndex = (this.loadingTextIndex + 1) % this.loadingTexts.length;
          this._currentCharIndex = 0;
          this.currentLoadingText = '';
          this._typeNextCharacter();
        }, 3000);
        return;
      }
      this.currentLoadingText = fullText.substring(0, this._currentCharIndex + 1);
      this._currentCharIndex++;
      this._typeInterval = setTimeout(() => {
        this._typeNextCharacter();
      }, 70);
    },
    stopLoadingTextAnimation() {
      clearTimeout(this._typeInterval);
      clearTimeout(this._nextSentenceTimeout);
      this._typeInterval = null;
      this._nextSentenceTimeout = null;
    },
  },
};
</script>

<style lang="less" scoped>
// 将原始 index.less 中 .loading 的样式移到这里
</style>