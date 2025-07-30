<template>
  <div class="game-page">
    <header>
        <h1>{{$gameTitle}}</h1>
        <p class="subtitle">{{$gameSubtitle}}</p>
        <p class="version">版本：{{$gameVision}}</p>
    </header>

    <div class="status-bar">
        <div class="status-item"><span>铜钱</span><span class="status-value">{{gameState.coins}}</span></div>
        <div class="status-item"><span>声望</span><span class="status-value">{{gameState.reputation}}</span></div>
        <div class="status-item"><span>身份</span><span class="status-value">{{gameState.identity}}</span></div>
    </div>

    <div class="game-controls">
      <el-button id="reset-game-btn" class="control-btn start-btn">🔄 重开局势</el-button>
    </div>

    <div class="game-ui">
        <div class="game-area">
            <div class="loading" id="loading">
                <div class="loading-spinner"></div>
                <div class="loading-text">正在推演新的乱世...</div>
            </div>
            
            <div class="image-settings-container">
                <h3 class="panel-title">场景图片设置</h3>
                <div class="image-settings">
                  <el-checkbox
                    class="rule-checkbox"
                    v-model="enableImageRendering"
                  >
                    <span>渲染场景图片</span>
                  </el-checkbox>
                </div>
                <p id="image-warning-message" class="image-warning" style="display: none;">
                    勾选此项可能会增加图片加载时间，影响游戏速度。
                </p>
            </div>

            <div v-if="enableImageRendering" class="scene-container">
                <img id="scene-img" :src="currentSceneImg" alt="场景图片">
            </div>
            <div class="story-text" id="story-text">
                {{previousSceneText}}
            </div>
            <div class="choices-container" id="choices-container">
              <div v-for="(item, index) in choices" class="choice-btn" :key="index" @click="confirmChoice(item.value)">{{item.text}}</div>
            </div>
            
            <div class="custom-choice-container">
                <div class="custom-choice-label">
                    <i class="fas fa-pen"></i> 或自行决定行动：
                </div>
                <div class="custom-input-box">
                  <el-input v-model="playerChoiceText" id="custom-choice-input" placeholder="输入你的行动（如：拜访贤士、招募兵卒、侦察敌情...）"></el-input>
                  <el-button id="submit-custom-choice" @click="confirmChoiceText">提交</el-button>
                </div>
            </div>
        </div>
        <div class="stats-panel">
            <h2 class="panel-title">角色状态</h2>
            <div class="character-info">
                <div class="char-header">
                    <div class="char-icon">👤</div>
                    <div id="char-name" class="char-name">{{gameState.name}}</div>
                </div>
                <div class="health-bar">
                    <div id="health-bar" class="health-fill"></div>
                    <div id="health-text" class="health-text">体力: {{gameState.health}}/{{gameState.maxHealth}}</div>
                </div>
                <div class="stats-grid">
                    <div class="stat-item"><span>武力</span><span id="attack-value" class="stat-value">{{gameState.attack}}</span></div>
                    <div class="stat-item"><span>智力</span><span id="defense-value" class="stat-value">{{gameState.defense}}</span></div>
                    <div class="stat-item"><span>统率</span><span id="agility-value" class="stat-value">{{gameState.agility}}</span></div>
                    <div class="stat-item"><span>魅力</span><span id="charm-value" class="stat-value">{{gameState.charm}}</span></div>
                </div>
            </div>
            <div class="skills-container">
                <h3 class="panel-title">战法/计策</h3>
                <div id="skills-list" class="scrollable-content">
                  <div v-if="!gameState.skills || gameState.skills.length === 0">尚未习得任何战法或计策</div>
                  <div v-for="(skill, index) in gameState.skills" :key="index">
                    <div class="skill-name"><i :class="skill.icon || 'fa-solid fa-book'"></i> {{skill.name}}</div>
                    <div class="skill-description">{{skill.description}}</div>
                  </div>
                </div>
            </div>
            <div class="inventory-container">
                <h3 class="panel-title">行囊</h3>
                <div id="items-grid" class="scrollable-content">
                  <div v-if="!gameState.items || gameState.items.length === 0" class="list-item">行囊空空...</div>
                  <div v-for="(item, index) in gameState.items" class="list-item" :key="index">
                    <div class="list-icon">
                        <i class="fa-solid fa-box"></i>
                    </div>
                    <div class="list-content">
                        <div class="list-name">
                            {{item.name}}
                            <span class="list-count">x{{item.count}}</span>
                        </div>
                    </div>
                  </div>
                </div>
            </div>
            <div class="achievement-container">
                <h3 class="panel-title">功绩</h3>
                <div id="achievement-list" class="scrollable-content">
                  <div v-if="!gameState.achievements || gameState.achievements.length === 0">尚无功绩可言</div>
                  <div v-for="(achievement, index) in gameState.achievements" :key="index" class="achievement-text">• {{achievement.text}}</div>
                </div>
            </div>
            <div class="adventure-log-container">
                <h3 class="panel-title">大事记</h3>
                <div id="adventure-log" class="scrollable-content">
                  <div v-if="!gameState.adventureLog || gameState.adventureLog.length === 0">天下大事，由你书写...</div>
                  <div v-for="(log, index) in gameState.adventureLog" :key="index" class="adventure-log-text">• {{log.text}}</div>
                </div>
            </div>
        </div>
    </div>

    <div class="api-settings-container">
        <h3 class="panel-title">AI模型设置</h3>
        <p id="api-settings-hint" style="font-size: 0.9rem; color: #888; margin-bottom: 15px;">
            🔒 默认使用安全的后端API，无需配置。<br>
            如需使用自定义API，请填写以下信息（配置仅存于前端浏览器，无需担心泄露）：
        </p>
        <div class="api-settings">
            <input type="text" id="api-url-input" placeholder="自定义API URL (可选)">
            <select id="model-input" class="api-settings-select"></select>
            <input type="password" id="api-key-input" placeholder="自定义API Key (可选)">
            <button id="save-api-btn">保存</button>
            <button id="clear-api-btn">清除</button>
        </div>
    </div>

    <footer>
        享受你的游戏
    </footer>
  </div>
</template>
<script>
import { defaultUserInfos } from '@/configs/default_user.js';
export default {
  data() {
    return {
      gameState: localStorage.getItem('saveData') ? JSON.parse(localStorage.getItem('saveData')).gameState : {
        ...defaultUserInfos
      },
      currentStoryText: '',
      currentSceneImg: '',
      currentChoices: [],
      enableImageRendering: false,
      saveTime: new Date().toISOString(),

      previousSceneText: '你从一个悠长的梦境中惊醒，梦里是未来世界的奇巧淫技，是闻所未闻的喧嚣与繁华。但眼前，却是简陋的茅屋、微弱的油灯。窗外，战火渐近，狼烟四起，远方山峦在暮色中影影绰绰。你意识到，你来到了一个名为"汉末三国"的乱世。在这里，无论是布衣百姓还是豪杰名士，皆可凭借智谋与武勇，逐鹿中原，问鼎天下，开创属于自己的盛世。一个神秘的声音在你脑海中回响："此乃天命所归，亦是汝之抉择。选择你的出身，书写你的传奇吧。',
      choices: [
        { text: '📜 汉室宗亲，身世浮沉', value: '汉室宗亲' },
        { text: '🌾 地方豪强，力耕天下', value: '地方豪强' },
        { text: '📚 落魄士人，满腹经纶', value: '落魄士人' },
        { text: '💰 行商之子，财运亨通', value: '行商之子' },
        { text: '⚔️ 战乱流民，乱世求生', value: '战乱流民' }
      ],

      aiModels: [],

      playerChoiceText: ''
    }
  },
  mounted() {
    console.log(this.gameState)
    this.init();
  },
  methods: {
    init() {
      this.getConfigs();
      this.getModels();
    },
    getConfigs() {
      this.$get('/game/api/config', {}, res => {
        let data = res || {};
        console.log('data', data);
      })
    },
    getModels() {
      this.$get('/game/api/models', {}, res => {
        this.aiModels = res || [];
      })
    },
    confirmChoice(value) {
      console.log('选择了：', value);
    },
    confirmChoiceText() {
      if (this.playerChoiceText.trim() === '') {
        this.$message.error('请输入有效的行动');
        return;
      }
      console.log('自定义选择：', this.playerChoiceText);
      // 这里可以添加处理自定义选择的逻辑
      this.playerChoiceText = ''; // 清空输入框
    },
  }
}
</script>
<style lang="less">
@import './index.less';
</style>