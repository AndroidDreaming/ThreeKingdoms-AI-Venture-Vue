<template>
  <div class="music-player-container">
    <div class="music-player">
      <button @click="togglePlay" class="music-btn play-pause-btn">
        {{ isPlay ? '‖' : '►' }}
      </button>

      <button @click="stop" class="music-btn stop-btn">
        ■
      </button>
    </div>
  </div>
</template>

<script>
// 引入音乐文件
import gameMusic from '@/assets/汉中地图BGM.mp3'; // 确保这里的路径是正确的

export default {
  data() {
    return {
      audio: null,
      isPlay: false,
    };
  },
  mounted() {
    this.audio = new Audio(gameMusic);
    this.audio.loop = true;
    this.audio.addEventListener('ended', () => {
      this.isPlay = false;
      this.audio.currentTime = 0;
    });
  },
  beforeDestroy() {
    if (this.audio) {
      this.audio.pause();
      this.audio.removeEventListener('ended', () => {});
      this.audio = null;
    }
  },
  methods: {
    play() {
      if (this.audio) {
        this.audio.play().then(() => {
          this.isPlay = true;
          console.log('音乐已播放');
        }).catch(error => {
          console.warn('音乐播放被阻止，可能需要用户交互:', error);
          this.isPlay = false;
        });
      }
    },
    pause() {
      if (this.audio) {
        this.audio.pause();
        this.isPlay = false;
        console.log('音乐已暂停');
      }
    },
    stop() {
      if (this.audio) {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.isPlay = false;
        console.log('音乐已停止');
      }
    },
    togglePlay() {
      if (this.isPlay) {
        this.pause();
      } else {
        this.play();
      }
    },
  },
};
</script>

<style lang="less" scoped>
.music-player-container {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.music-player {
  display: flex;
  gap: 10px;
}

.music-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #4ecdc4;
  background-color: transparent;
  color: #4ecdc4;
  font-size: 1.5rem; /* 调整字体大小，让符号看起来更清晰 */
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  justify-content: center;
  align-items: center;

  &:hover {
    background-color: #4ecdc4;
    color: #1a1a2e;
  }
}
</style>