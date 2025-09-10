<template>
  <div class="api-settings-container">
    <h3 class="panel-title">AI模型设置</h3>
    <p id="api-settings-hint" style="font-size: 0.9rem; color: #888; margin-bottom: 15px;">
      🔒 默认使用安全的后端API，无需配置。<br>
      如需使用自定义API，请填写以下信息（配置仅存于前端浏览器，无需担心泄露）：
    </p>
    <div class="api-settings">
      <input type="text" id="api-url-input" placeholder="自定义API URL (可选)" :value="customApiUrl" @input="$emit('update:customApiUrl', $event.target.value)">
      <select id="model-input" class="api-settings-select" :value="selectedModel" @change="$emit('update:selectedModel', $event.target.value)">
        <option disabled value="">请选择一个模型</option>
        <option v-for="model in models" :key="model.id" :value="model.id">
          {{ model.id }}
        </option>
      </select>
      <input type="password" id="api-key-input" placeholder="自定义API Key (可选)" :value="customApiKey" @input="$emit('update:customApiKey', $event.target.value)">
      <button id="save-api-btn" @click="$emit('save')">保存</button>
      <button id="clear-api-btn" @click="$emit('clear')">清除</button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    models: {
      type: Array,
      default: () => [],
    },
    customApiUrl: {
      type: String,
      default: '',
    },
    customApiKey: {
      type: String,
      default: '',
    },
    selectedModel: {
      type: String,
      default: '',
    },
  },
};
</script>

<style lang="less" scoped>
// 将原始 index.less 中 .api-settings-container 的样式移到这里
</style>