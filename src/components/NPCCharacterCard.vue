<template>
  <div class="npc-card" @click="handleClick">
    <div class="npc-avatar-container">
      <img :src="npcImage" alt="NPC曲离歌" class="npc-avatar">
    </div>
    <div class="npc-info">
      <h3 class="npc-name">曲离歌</h3>
      <p class="npc-title">江湖隐士</p>
    </div>
  </div>
</template>

<script>
// 导入本地图片资产
import npcImage from '@/assets/npc_qulige.png'; // 请将此路径修改为你的图片文件路径

export default {
  data() {
    return {
      npcImage: npcImage,
    };
  },
  methods: {
    // 点击时触发一个自定义事件
    handleClick() {
      this.$emit('npc-click', { name: '曲离歌' });
    },
  },
};
</script>

<style lang="less" scoped>
.npc-card {
  cursor: pointer;
  display: flex;
  align-items: center;
  background-color: #2a2a3e;
  padding: 15px;
  border-radius: 12px;
  margin-top: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }
}

.npc-avatar-container {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #4ecdc4;
  flex-shrink: 0;
}

.npc-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.npc-info {
  margin-left: 15px;
  color: #fff;
}

.npc-name {
  font-size: 1.2rem;
  margin: 0;
}

.npc-title {
  font-size: 0.9rem;
  color: #ccc;
  margin: 5px 0 0;
}
</style>