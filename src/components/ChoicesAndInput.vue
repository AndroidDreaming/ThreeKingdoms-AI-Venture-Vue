<template>
  <div>
    <div class="choices-container" id="choices-container">
      <div v-for="(item, index) in choices" class="choice-btn" :key="index" @click="$emit('choice-selected', item)">{{ item.text }}</div>
    </div>
    <div class="custom-choice-container">
      <div class="custom-choice-label">
        <i class="fas fa-pen"></i> 或自行决定行动：
      </div>
      <div class="custom-input-box">
        <el-input 
          :value="playerChoiceText" 
          @input="$emit('update:playerChoiceText', $event.target.value)" 
          id="custom-choice-input" 
          placeholder="输入你的行动（如：拜访贤士、招募兵卒、侦察敌情...）" 
          @keyup.enter.native="$emit('custom-choice-submitted', playerChoiceText)"
        ></el-input>
        <el-button id="submit-custom-choice" @click="$emit('custom-choice-submitted', playerChoiceText)">提交</el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    choices: {
      type: Array,
      default: () => [],
    },
    playerChoiceText: {
      type: String,
      default: '',
    },
  },
};
</script>

<style lang="less" scoped>
// 将原始 index.less 中 .choices-container 和 .custom-choice-container 的样式移到这里
</style>