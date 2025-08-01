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
      <el-button id="reset-game-btn" class="control-btn start-btn" @click="resetGame">🔄 重开局势</el-button>
    </div>

    <div class="game-ui">
        <div class="game-area" v-loading="aiLoading">
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
                {{currentStoryText}}
            </div>
            <div class="choices-container" id="choices-container">
              <div v-for="(item, index) in choices" class="choice-btn" :key="index" @click="confirmChoice(item)">{{item.text}}</div>
            </div>
            
            <div class="custom-choice-container">
                <div class="custom-choice-label">
                    <i class="fas fa-pen"></i> 或自行决定行动：
                </div>
                <div class="custom-input-box">
                  <el-input v-model="playerChoiceText" id="custom-choice-input" placeholder="输入你的行动（如：拜访贤士、招募兵卒、侦察敌情...）" @confirm="confirmChoiceText"></el-input>
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
                    <div id="health-bar" class="health-fill" :style="{ width: (gameState.health / gameState.maxHealth * 100) + '%' }"></div>
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
                  <template v-for="(achievement, index) in gameState.achievements">
                    <div v-if="achievement.unlocked" class="achievement-text" :key="index">• {{achievement.text}}</div>
                  </template>
                </div>
            </div>
            <div class="adventure-log-container">
                <h3 class="panel-title">大事记</h3>
                <div id="adventure-log" class="scrollable-content">
                  <div v-if="!gameState.adventureLog || gameState.adventureLog.length === 0">天下大事，由你书写...</div>
                  <div v-for="(log, index) in gameState.adventureLog" :key="index" class="adventure-log-text">• {{log.entry}}</div>
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
      <input type="text" id="api-url-input" placeholder="自定义API URL (可选)" v-model="customApiUrl">
      <select id="model-input" class="api-settings-select" v-model="selectedModel">
        <option disabled value="">请选择一个模型</option>
        <option v-for="model in models" :key="model.id" :value="model.id">
          {{ model.id }}
        </option>
      </select>
      <input type="password" id="api-key-input" placeholder="自定义API Key (可选)" v-model="customApiKey">
      <button id="save-api-btn" @click="saveApiSettings">保存</button>
      <button id="clear-api-btn" @click="clearApiSettings">清除</button>
    </div>
  </div>
    <footer>
        享受你的游戏
    </footer>
  </div>
</template>
<script>
import { defaultUserInfos } from '@/configs/default_user.js';
import prompt from '@/configs/prompt.js';
import { 
  END_PROMPT_TEMPLATE,
  MEMORY_FORMAT,
  ERROR_MESSAGES,
  DEFAULT_VALUES
} from '@/configs/end_prompt.js';


export default {
  data() {
    return {
      gameState: localStorage.getItem('saveData') ? JSON.parse(localStorage.getItem('saveData')).gameState : {
        ...defaultUserInfos
      },

      aiLoading: false,
      currentStoryText: '你从一个悠长的梦境中惊醒，梦里是未来世界的奇巧淫技，是闻所未闻的喧嚣与繁华。但眼前，却是简陋的茅屋、微弱的油灯。窗外，战火渐近，狼烟四起，远方山峦在暮色中影影绰绰。你意识到，你来到了一个名为"汉末三国"的乱世。在这里，无论是布衣百姓还是豪杰名士，皆可凭借智谋与武勇，逐鹿中原，问鼎天下，开创属于自己的盛世。一个神秘的声音在你脑海中回响："此乃天命所归，亦是汝之抉择。选择你的出身，书写你的传奇吧。',
      currentSceneImg: '',
      currentChoices: [],
      enableImageRendering: false,
      saveTime: new Date().toISOString(),
      maxGameTurns: 1,
      // 长期记忆 (Long-Term Memory)
      longTermMemory: [],  // 存储总结后的LTM条目
      turnsSinceLastSummary :0, // 记录距离上次总结的回合数
      lsummaryInterval :10, // 每隔10回合总结一次
      ltmMaxSize: 3,       // LTM 最大存储总结条目数 (当达到此上限时，会触发LTM自身的总结)
      
      choices: [
        { text: '📜 汉室宗亲，身世浮沉', value: '汉室宗亲' },
        { text: '🌾 地方豪强，力耕天下', value: '地方豪强' },
        { text: '📚 落魄士人，满腹经纶', value: '落魄士人' },
        { text: '💰 行商之子，财运亨通', value: '行商之子' },
        { text: '⚔️ 战乱流民，乱世求生', value: '战乱流民' }
      ],

      customApiUrl: '', 
      customApiKey: '', 
      selectedModel: '',
      models: [],
      model: '',
      defaultModelName: 'DeepSeek-R1-0528',

      playerChoiceText: ''
    }
  },
  mounted() {
    console.log(this.gameState)
    this.init();
  },
  methods: {
    init() {
      this.loadGameState();
      this.getConfigs();
      this.getModels();
    },
  getConfigs() {
      this.$get('/game/api/config', {},
        res => { // 成功回调 (handler)
          let data = res || {};
          this.defaultModelName = data.defaultModel || 'DeepSeek-R1-0528';
          if (!this.selectedModel && this.defaultModelName && this.models.length === 0) {
              this.selectedModel = this.defaultModelName;
          }
        },
        error => { // 错误回调 (errorHandler)
          console.error('获取配置失败:', error);
          this.defaultModelName = 'DeepSeek-R1-0528'; // 获取失败时，设置一个默认值
        }
      );
    },
    getModels() {
      this.$get('/game/api/models', {},
        res => { // 成功回调 (handler)
          let rawData = (res && Array.isArray(res.data)) ? res.data : [];
          // 对数据进行深拷贝
          this.models = JSON.parse(JSON.stringify(rawData));

          console.log('加载到的模型数据 (深拷贝后):', this.models); 

          const savedModel = localStorage.getItem('selectedModel');

          // 模型选择的优先级逻辑
          if (savedModel && this.models.some(model => model.id === savedModel)) {
            this.selectedModel = savedModel;
          } else if (this.defaultModelName && this.models.some(model => model.id === this.defaultModelName)) {
            this.selectedModel = this.defaultModelName;
          } else if (this.models.length > 0) {
            this.selectedModel = this.models[0].id;
          } else {
            this.selectedModel = '无法加载模型或无可用模型';
          }
        },
        error => { // 错误回调 (errorHandler)
          console.error('获取模型列表失败:', error);
          this.models = [];
          this.selectedModel = '获取模型失败';
        }
      );
    },
    saveApiSettings() {
      // 这里是保存 API 设置的逻辑
      localStorage.setItem('customApiUrl', this.customApiUrl);
      localStorage.setItem('customApiKey', this.customApiKey);
      localStorage.setItem('selectedModel', this.selectedModel);
      alert('API 设置已保存！'); // 简单的提示
      console.log('API Settings Saved:', {
        url: this.customApiUrl,
        key: this.customApiKey,
        model: this.selectedModel
      });
    },
    clearApiSettings() {
      // 这里是清除 API 设置的逻辑
      localStorage.removeItem('customApiUrl');
      localStorage.removeItem('customApiKey');
      localStorage.removeItem('selectedModel');
      this.customApiUrl = '';
      this.customApiKey = '';
      this.selectedModel = ''; // 清除选择的模型
      alert('API 设置已清除！'); // 简单的提示
      console.log('API Settings Cleared.');
    },
    loadGameState() {

      try {
          const cultivationGameSave = localStorage.getItem('cultivationGameSave');
          if (!cultivationGameSave) return false;
          
          const saveData = JSON.parse(cultivationGameSave);
          if (!saveData.gameState) return false;
          
          // 恢复游戏状态
          this.gameState = saveData.gameState || {};

          // 在加载时检查游戏是否结束
          if (this.gameState.health <= 0) {
              this.updateIdentity();
              this.currentStoryText = '你倒在血泊之中，意识逐渐模糊... 你的冒险已在此终结。';
              this.choices = [
                { text: '📜 🔄 重新开始', value: '重新开始', type: 'retry' },
              ];
              return true;
          }
          
          // 恢复界面
          if (saveData.currentStoryText) {
            this.currentStoryText = saveData.currentStoryText;
          }
          if (saveData.currentSceneImg && saveData.currentSceneImg !== window.location.href && !saveData.currentSceneImg.includes('undefined')) {
              this.currentSceneImg = saveData.currentSceneImg;
          }
          
          // 恢复选择按钮
          if (saveData.currentChoices && Array.isArray(saveData.currentChoices)) {
            this.choices = [...saveData.currentChoices]
          }
          
          this.updateIdentity();
          console.log('游戏状态已加载，保存时间:', saveData.saveTime);
          return true;
      } catch (error) {
          console.error('加载游戏状态失败:', error);
          return false;
      }
    },
    updateIdentity() {
        if (!Array.isArray(this.gameState.adventureLog)) {
            this.gameState.adventureLog = [];
        }

        // 更新身份/地位显示
        if (this.gameState.level > 30) {
            this.gameState.identity = '帝王';
        } else if (this.gameState.level > 25) {
            this.gameState.identity = '丞相/大将军';
        } else if (this.gameState.level > 20) {
            this.gameState.identity = '州牧/太守';
        } else if (this.gameState.level > 15) {
            this.gameState.identity = '郡守/刺史';
        } else if (this.gameState.level > 10) {
            this.gameState.identity = '校尉/都尉';
        } else if (this.gameState.level > 5) {
            this.gameState.identity = '县令/亭长';
        } else if (this.gameState.level > 1) {
            this.gameState.identity = '乡绅/里正';
        } else {
            this.gameState.identity = '布衣';
        }

    },

    confirmChoice(item = 'choice') {
      if(item.type == 'retry') {
        this.resetGame();
      } else if(item.type == 'refresh') {
        window.location.reload();
      } else {
        this.handleChoice(item.value, item.text);
      }
    },
    resetGame() {
      this.gameState = {
        ...defaultUserInfos
      },

      this.aiLoading = false,
      this.currentStoryText = '你从一个悠长的梦境中惊醒，梦里是未来世界的奇巧淫技，是闻所未闻的喧嚣与繁华。但眼前，却是简陋的茅屋、微弱的油灯。窗外，战火渐近，狼烟四起，远方山峦在暮色中影影绰绰。你意识到，你来到了一个名为"汉末三国"的乱世。在这里，无论是布衣百姓还是豪杰名士，皆可凭借智谋与武勇，逐鹿中原，问鼎天下，开创属于自己的盛世。一个神秘的声音在你脑海中回响："此乃天命所归，亦是汝之抉择。选择你的出身，书写你的传奇吧。',
      this.currentSceneImg = '',
      this.currentChoices = [],
      this.saveTime = new Date().toISOString(),
      
      this.choices = [
        { text: '📜 汉室宗亲，身世浮沉', value: '汉室宗亲' },
        { text: '🌾 地方豪强，力耕天下', value: '地方豪强' },
        { text: '📚 落魄士人，满腹经纶', value: '落魄士人' },
        { text: '💰 行商之子，财运亨通', value: '行商之子' },
        { text: '⚔️ 战乱流民，乱世求生', value: '战乱流民' }
      ]
    },
    handleChoice(choiceTarget, choiceText) {
        const firstChoiceAch = this.gameState.achievements.find(a => a.id === 'first_choice');
        if (firstChoiceAch && !firstChoiceAch.unlocked) {
            firstChoiceAch.unlocked = true;
        }
        this.loadScene(choiceTarget, choiceText);
    },
        confirmChoiceText() {
      if (this.playerChoiceText.trim() === '') {
        this.$message.error('请输入有效的行动');
        return;
      }
      console.log('自定义选择：', this.playerChoiceText);

      const customText = this.playerChoiceText.trim();
      if (!customText) {
          alert('请输入你的行动指令');
          return;
      }
      
      // 添加到大事记
      this.gameState.adventureLog.push({ turn: this.gameState.turn, entry: `你决定: ${customText}` });
      this.updateIdentity();
      
      // 加载场景
      this.loadScene('custom', customText);

      this.playerChoiceText = ''; // 清空输入框
    },  

    async loadScene(sceneKey, playerChoiceText = null) {
      this.aiLoading = true;

      try {

          // 在状态更新后检查游戏是否结束
          if (this.gameState.health <= 0) {
              this.updateIdentity(); // 最后一次更新UI以显示0 HP
              this.currentStoryText = scene.text + "\n\n你的气息逐渐微弱，眼前一黑，意识沉入了无尽的黑暗... 你的冒险结束了。";
              this.choices = [
                { text: '📜 🔄 重新开始', value: '重新开始', type: 'retry' },
              ];
              this.aiLoading = false;
              this.saveGameState(); // 保存游戏结束的状态
              return;
          }

          if(this.gameState.turn >= this.maxGameTurns){
            await this.endGameByTurnLimit();
            this.choices = [
              { text: '📜 🔄 重新开始', value: '重新开始', type: 'retry' },
            ];
            this.aiLoading = false;
            this.saveGameState(); 
            return;
          }

          const scene = await this.generateAdventure(sceneKey, playerChoiceText);
          console.log("生成的场景:", scene);
          if (!scene) {
              throw new Error('AI未能生成有效场景');
          }

          this.gameState.currentScene = sceneKey;
          this.currentStoryText = scene.text;
          if (!scene.choices || scene.choices.length == 0) {
              this.choices = [{
                text: '本次冒险暂告一段落，刷新页面重新开始。',
                value: 'refresh',
                type: 'refresh'
              }];
          }

          this.choices = [...scene.choices];

          // 等待图片加载完成后再保存游戏进度
          try {
              this.generateImage(scene.imagePrompt);
              // 在所有DOM更新（包括图片）完成后保存游戏进度
              this.saveGameState();
          } catch (error) {
              console.error("图片生成失败，但仍保存游戏进度:", error);
              // 即使图片加载失败，也要保存游戏进度
              this.saveGameState();
          }
  
          this.updateIdentity();
      } catch (error) {
          console.error("冒险生成失败的详细错误:", error);
          this.aiLoading = false;

          let errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
          
          // 根据错误类型提供不同的提示
          if (errorMessage.includes('timeout') || errorMessage.includes('TIMEOUT')) {
              alert(`⏰ 请求超时：AI服务响应较慢，请稍后重试。\n\n建议：\n1. 检查网络连接\n2. 稍等片刻后重新选择\n3. 如持续出现，可尝试刷新页面`);
          } else if (errorMessage.includes('API key')) {
              alert(`🔑 API配置错误：请检查API密钥设置。\n\n如果使用默认后端API，请联系管理员。\n如果使用自定义API，请检查API设置。`);
          } else if (errorMessage.includes('500') || errorMessage.includes('502') || errorMessage.includes('503')) {
              alert(`🔧 服务器错误：AI服务暂时不可用。\n\n建议：\n1. 稍后重试\n2. 检查API服务状态\n3. 如持续出现，请联系技术支持`);
          } else {
              alert(`❌ 冒险生成失败: ${errorMessage}\n\n请检查：\n1. 网络连接是否正常\n2. API设置是否正确\n3. 查看浏览器控制台获取详细信息`);
          }
      }
    },
    generateAdventure(currentSceneKey, playerChoiceText) {
      
      return new Promise(async (resolve, reject) => {

        this.turnsSinceLastSummary++;

        // 检查是否需要生成长时记忆
        console.log("this.turnsSinceLastSummary :" + this.turnsSinceLastSummary )
        console.log("this.summaryInterval :" +  this.lsummaryInterval )
        if (this.turnsSinceLastSummary >= this.lsummaryInterval) {
            await this.generateLongTermMemory();
            this.turnsSinceLastSummary = 0; // 重置计数器
        }

        const currentPrompt = prompt.getPrompt({
          gameState: this.gameState, 
          previousSceneText: this.currentStoryText, 
          playerChoiceText: playerChoiceText,
          longTermMemory: this.longTermMemory // 携带长时记忆
        });
        console.log("LTM内容："+this.longTermMemory)
        let params = {
          prompt: currentPrompt,
          model: this.model
        }
        console.log('请求ai')
        this.$post('/game/api/chat', params, res => {
          let data = res;
          console.log("API返回的原始数据:", data);
            
          // 添加详细的调试信息
          if (data.usage) {
              console.log("Token使用情况:", data.usage);
              if (data.usage.completion_tokens >= 3900) {
                  console.warn("警告：响应接近token限制，可能被截断");
              }
          }
          
          if (!data.choices || !data.choices[0] || !data.choices[0].message) {
              throw new Error('API返回数据格式错误：缺少choices或message字段');
          }
          
          let contentString = data.choices[0].message.content;
          console.log("AI返回的原始内容:", contentString);
          
          if (!contentString || contentString.trim() === '') {
              throw new Error('AI返回的内容为空');
          }
          
          // 尝试提取JSON代码块
          const match = contentString.match(/```json\s*([\s\S]*?)\s*```/);
          if (match) {
              contentString = match[1];
              console.log("提取的JSON内容:", contentString);
          }

          try {
              let content;
              try {
                  content = JSON.parse(contentString);
              } catch (firstError) {
                  console.log("首次JSON解析失败，尝试修复:", firstError.message);
                  const fixedJsonString = this.tryFixIncompleteJson(contentString);
                  console.log("修复后的JSON:", fixedJsonString);
                  content = JSON.parse(fixedJsonString);
                  console.log("修复成功！");
              }
              console.log("解析成功的content:", JSON.stringify(content, null, 2));
              
              // 验证必需字段
              if (!content.text) {
                  console.warn("警告：缺少text字段，使用默认值");
                  content.text = "你继续在这个神秘的世界中探索...";
              }
              if (!content.imagePrompt) {
                  console.warn("警告：缺少imagePrompt字段，使用默认值");
                  content.imagePrompt = "A mystical Chinese cultivation world scene";
              }
              if (!content.choices || !Array.isArray(content.choices)) {
                  console.warn("警告：缺少choices字段，使用默认值");
                  content.choices = [
                      { text: "继续探索", value: "continue", type: "continue" },
                      { text: "休息片刻", value: "rest", type: "rest" }
                  ];
              }
              if (!content.gameStateUpdates) {
                  content.gameStateUpdates = {};
              }
              if (!content.itemUpdates) {
                  content.itemUpdates = { add: [], remove: [] };
              }
              if (!content.unlockAchievements) {
                  content.unlockAchievements = [];
              }
              if (!content.logEntry) {
                  content.logEntry = "继续冒险...";
              }

              if (content.gameState) {
                const updates = content.gameState;

                // 直接设置数值属性
                ['health', 'gender','maxHealth', 'attack', 'defense', 'agility', 'charm', 'coins', 'reputation', 'level'].forEach(key => {
                  if (updates[key] !== undefined) {
                    this.gameState[key] = Number(updates[key]);
                  }
                });

                // 更新身份
                if (updates.identity) {
                  this.gameState.identity = updates.identity;
                }

                // 更新技能列表（完全替换）
                if (updates.skills && Array.isArray(updates.skills)) {
                  this.gameState.skills = updates.skills.map(skill => ({
                    name: skill.name,
                    description: skill.description || "新习得的技能",
                    icon: skill.icon || "fa-solid fa-star"
                  }));
                }

                // 修复物品更新逻辑 - 处理字符串数组
                if (updates.items && Array.isArray(updates.items)) {
                  let existItemsNames = [], existItemsNamesCounts = [];
                  updates.items.forEach(item => {
                    let name = '';
                    if (typeof item === 'string') {
                      name = item;
                    } else {
                      name = item.name;
                    }
                    if(!existItemsNames.indexOf(name) > -1) {
                      existItemsNamesCounts[existItemsNames.indexOf(name)] += 1;
                    } else {
                      existItemsNames.push(name);
                      existItemsNamesCounts = 1;
                    }
                  })
                  const itemMaps = existItemsNames.map((name, index) => {
                    // 处理对象形式的物品
                    return {
                      id: name.toLowerCase().replace(/\s/g, '_'),
                      name: name,
                      count: existItemsNamesCounts[index],
                    };
                  });
                  console.log(itemMaps)
                  this.gameState.items = itemMaps;
                }

                // 更新成就状态
                if (updates.achievements && Array.isArray(updates.achievements)) {
                  updates.achievements.forEach(achUpdate => {
                    const achievement = this.gameState.achievements.find(a => a.id === achUpdate.id);
                    if (achievement) {
                      achievement.unlocked = achUpdate.unlocked;
                    }
                  });
                }
              }
              if (content.itemUpdates) {
                  if (content.itemUpdates.add && Array.isArray(content.itemUpdates.add)) {
                      content.itemUpdates.add.forEach(newItemName => {
                          if (typeof newItemName === 'string') {
                              this.gameState.items.push({ id: newItemName.toLowerCase().replace(/\s/g, '_'), name: newItemName });
                          }
                      });
                  }
                  if (content.itemUpdates.remove) {
                      content.itemUpdates.remove.forEach(itemIdToRemove => {
                          this.gameState.items = this.gameState.items.filter(item => item.id !== itemIdToRemove);
                      });
                  }
              }

              if (content.unlockAchievements && Array.isArray(content.unlockAchievements)) {
                  content.unlockAchievements.forEach(achIdToUnlock => {
                      const achievement = this.gameState.achievements.find(a => a.id === achIdToUnlock);
                      if (achievement && !achievement.unlocked) {
                          achievement.unlocked = true;
                      }
                  });
              }
              
              // 自动检查技能相关成就
              const skillCount = this.gameState.skills.length;
              if (skillCount >= 1) {
                  const firstSkillAch = this.gameState.achievements.find(a => a.id === 'first_skill');
                  if (firstSkillAch && !firstSkillAch.unlocked) {
                      firstSkillAch.unlocked = true;
                      console.log("解锁成就: 初窥门径");
                  }
              }
              if (skillCount >= 5) {
                  const skillMasterAch = this.gameState.achievements.find(a => a.id === 'skill_master');
                  if (skillMasterAch && !skillMasterAch.unlocked) {
                      skillMasterAch.unlocked = true;
                      console.log("解锁成就: 技艺精湛");
                  }
              }
              
              // 检查战技技能数量
              const spellSkills = this.gameState.skills.filter(skill =>
                  skill.name.includes('术') || skill.name.includes('策') || skill.name.includes('计')
              );
              if (spellSkills.length >= 3) {
                  const spellCasterAch = this.gameState.achievements.find(a => a.id === 'spell_caster');
                  if (spellCasterAch && !spellCasterAch.unlocked) {
                      spellCasterAch.unlocked = true;
                      console.log("解锁成就: 战术大师");
                  }
              }
              
              if(content.logEntry && typeof content.logEntry === 'string') {
                  this.gameState.turn++;
                  this.gameState.adventureLog.push({ turn: this.gameState.turn, entry: content.logEntry });
              }

              this.updateIdentity();
              resolve(content);
              // return content;
          } catch (e) {
              console.error("JSON解析失败:", e);
              console.error("尝试解析的内容:", contentString);
              
              // 尝试从原始内容中提取文本信息
              let extractedText = "抱歉，AI响应解析失败。你发现自己站在一个神秘的地方，周围云雾缭绕，似乎有无数的可能性等待着你去探索。";
              
              // 尝试从截断的JSON中提取text字段
              const textMatch = contentString.match(/"text":\s*"([^"]*(?:\\.[^"]*)*)/);
              if (textMatch && textMatch[1]) {
                  extractedText = textMatch[1].replace(/\\"/g, '"').replace(/\n/g, '\n');
                  console.log("从截断的JSON中提取到文本:", extractedText);
              }
              
              // 如果JSON解析失败，生成一个智能的fallback响应
              const fallbackContent = {
                  text: extractedText,
                  imagePrompt: "A mystical Chinese cultivation world with swirling mists and ancient mountains, ink wash painting style",
                  choices: [
                      { text: "🔄 重新尝试", value: "retry", type: "retry" },
                      { text: "🏠 返回起点", value: "start", type: "start" },
                      { text: "继续探索", value: "continue", type: "continue" }
                  ],
                  gameStateUpdates: {},
                  itemUpdates: { add: [], remove: [] },
                  unlockAchievements: [],
                  logEntry: "遇到了一些技术问题，但冒险仍在继续..."
              };
              
              console.log("使用备用响应:", fallbackContent);
              resolve(fallbackContent);
              // return fallbackContent;
          }

        })
      })
      
    },
  
    
// 异步生成长时记忆的方法
async generateLongTermMemory() {
    const logsToSummarize = this.gameState.adventureLog.slice(-this.lsummaryInterval); // 获取最近的回合日志
    if (logsToSummarize.length === 0) {
        return;
    }

    console.log("开始生成长时记忆------");
    const logText = logsToSummarize.map(log => `回合 ${log.turn}: ${log.entry}`).join('\n');

    // 构建总结请求的 prompt
    const summaryPrompt = `请总结以下游戏事件日志，提炼出关键情节、玩家的重大决策和故事走向，内容需简洁明了，限制在100字以内。\n\n日志内容:\n${logText}`;

    // 调用AI进行总结
    try {
        const summaryParams = {
            prompt: summaryPrompt,
            model: this.model
        };

        const summaryRes = await new Promise((resolve, reject) => {
            this.$post('/game/api/chat', summaryParams, res => {
                console.log("[总结AI-API响应]:", res); // 调试用

                try {
                    // **修正后的检查响应结构逻辑**
                    if (!res || !res.choices || !res.choices[0] || !res.choices[0].message || !res.choices[0].message.content) {
                        console.error("API返回结构异常: 缺少必要字段", res);
                        throw new Error("AI返回数据格式不正确或缺少必要字段");
                    }

                    // 解析content中的JSON
                    const content = res.choices[0].message.content;
                    if (typeof content !== 'string') {
                        console.error("API返回的content不是字符串:", content);
                        throw new Error("AI返回的content不是有效的JSON字符串");
                    }

                    let parsedContent;
                    try {
                        parsedContent = JSON.parse(content);
                    } catch (jsonError) {
                        console.error("解析content中的JSON时出错:", jsonError, "原始content:", content);
                        throw new Error("解析AI返回的JSON内容失败");
                    }

                    resolve(parsedContent); 
                } catch (error) {
                    console.error("处理API响应时出错:", error);
                    reject(error);
                }
            });
        });


        this.longTermMemory.unshift(summaryRes.summary || summaryRes); 
        if (this.longTermMemory.length > this.maxLongTermMemories) {
           // 移除最旧的记忆
            this.longTermMemory.pop();
        }

        console.log("新增长时记忆内容:", summaryRes);
        console.log("更新后的长时记忆数组:", this.longTermMemory);

    } catch (error) {
        console.error("生成长时记忆时发生错误:", error);

    }
},
    // 尝试修复不完整的JSON
    tryFixIncompleteJson(jsonStr) {
      jsonStr = jsonStr.replace(/undefined/g, 'null')
              .replace(/<!--[\s\S]*?-->/g, '');
      jsonStr = jsonStr.trim();
      
      // 尝试找到最后一个有效的JSON字符（'}' 或 ']' 或 '"'）
      const lastBrace = jsonStr.lastIndexOf('}');
      const lastBracket = jsonStr.lastIndexOf(']');
      const lastQuote = jsonStr.lastIndexOf('"');
      const lastNumber = jsonStr.search(/[0-9]\s*$/);

      const lastValidCharIndex = Math.max(lastBrace, lastBracket, lastQuote, lastNumber);

      // 如果字符串在最后一个有效字符后还有内容，说明可能被截断了
      if (lastValidCharIndex !== -1 && lastValidCharIndex < jsonStr.length - 1) {
          // 截断到最后一个有效字符
          jsonStr = jsonStr.substring(0, lastValidCharIndex + 1);
      }
      
      // 重新计算括号和花括号的配平
      let openBraces = (jsonStr.match(/{/g) || []).length;
      let closeBraces = (jsonStr.match(/}/g) || []).length;
      let openBrackets = (jsonStr.match(/\[/g) || []).length;
      let closeBrackets = (jsonStr.match(/\]/g) || []).length;

      // 闭合未闭合的括号
      while (openBrackets > closeBrackets) {
          jsonStr += ']';
          closeBrackets++;
      }
      
      // 闭合未闭合的花括号
      while (openBraces > closeBraces) {
          jsonStr += '}';
          closeBraces++;
      }

      return jsonStr;
  },

  generateImage(prompt) {

      if (!this.enableImageRendering) {
        console.log('图片渲染未开启，跳过图片生成。');
        this.currentSceneImg = '';  // 可选清空图像
        this.aiLoading = false;
        return;
      }
      try {
          
          // 检查是否是本地文件访问
          const isLocalFile = window.location.protocol === 'file:';
          let imageUrl;
          
          if (isLocalFile) {
              // 本地文件访问时直接使用pollinations API
              imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?nologo=true&width=800&height=600&model=flux`;
          } else {
              // 通过后端API生成图片
              this.$sPost('/game/api/image', { prompt: prompt, width: 800, height: 600, nologo: true, model: 'flux' }, res => {
                const data = res || {};
                if (!data.success || !data.imageUrl) {
                    throw new Error('图片生成失败');
                }
                
                this.currentSceneImg = data.imageUrl;
                console.log('图片生成成功:', data);
              });
              
          }
          
      } catch (error) {
          console.error('图片生成错误:', error);
          // 使用备用图片
          const fallbackUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWExYTJlIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzRlY2RjNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuS/ruS7meS4lueVjO+8muS6kea4uuS7meWcnzwvdGV4dD4KPC9zdmc+';
          this.currentSceneImg = fallbackUrl;
          this.aiLoading = false;
      }
    },
    saveGameState() {
        try {
        // 保存当前的选择按钮
        const currentChoices = [];
        this.choices.forEach(btn => {
          currentChoices.push({
            text: btn.text,
            target: btn.value,
            type: btn.type || 'choice'
          });
        });

        const saveData = {
            gameState: this.gameState,
            currentStoryText: this.currentStoryText,
            currentSceneImg: this.currentSceneImg,
            currentChoices: currentChoices,
            saveTime: new Date().toISOString()
        };
        localStorage.setItem('cultivationGameSave', JSON.stringify(saveData));
        console.log('游戏状态已保存');
        return true;
      } catch (error) {
        console.error('保存游戏状态失败:', error);
        return false;
      }
    },
  async endGameByTurnLimit() {
      this.aiLoading = true;

      // 格式化记忆
      const formattedLongTermMemory = MEMORY_FORMAT.longTerm(this.longTermMemory);
      const formattedShortTermMemory = MEMORY_FORMAT.shortTerm(this.gameState.adventureLog);

      // 准备模板数据
      const templateData = {
          turn: this.gameState.turn,
          longTermMemory: formattedLongTermMemory,
          shortTermMemory: formattedShortTermMemory,
          identity: this.gameState.identity,
          level: this.gameState.level,
          age: this.gameState.age,
          health: this.gameState.health,
          maxHealth: this.gameState.maxHealth,
          attack: this.gameState.attack,
          defense: this.gameState.defense,
          agility: this.gameState.agility,
          charm: this.gameState.charm,
          coins: this.gameState.coins,
          reputation: this.gameState.reputation,
          skills: (this.gameState.skills && this.gameState.skills.length > 0)
              ? this.gameState.skills.map(s => s.name).join('; ')
              : DEFAULT_VALUES.skills,
          items: (this.gameState.items && this.gameState.items.length > 0)
              ? this.gameState.items.join('; ')
              : DEFAULT_VALUES.items,
          achievements: (this.gameState.achievements && this.gameState.achievements.length > 0)
              ? this.gameState.achievements.filter(a => a.unlocked).map(a => a.id).join('; ')
              : DEFAULT_VALUES.achievements,
          storySnippet: this.currentStoryText.slice(-250)
      };

      // 生成最终提示词
      const finalPrompt = Object.entries(templateData).reduce(
          (str, [key, value]) => str.replace(`{${key}}`, value),
          END_PROMPT_TEMPLATE 
      );

      console.log(ERROR_MESSAGES.LOADING);

    try {
      const params = { prompt: finalPrompt, model: this.model };

      const res = await new Promise((resolve, reject) => {
          this.$post('/game/api/chat', params, (res) => {
              console.log("结局原始响应 (res):", res);
              resolve(res);
          });
      });

      const contentString = res.choices[0].message.content;
      let finalStoryText = "";

      if (contentString.trim().startsWith('{') && contentString.trim().endsWith('}')) {
          try {
              const parsedContent = JSON.parse(contentString);
              if (parsedContent.summary) {
                  finalStoryText = parsedContent.summary;
              } else if (parsedContent.reasoning_content) {
                  finalStoryText = parsedContent.reasoning_content;
                  console.warn("AI返回的JSON中缺少'summary'字段，使用'reasoning_content'作为结局。");
              } else {
                  console.error("AI返回的JSON内容中未找到'summary'或'reasoning_content'字段:", parsedContent);
                  throw new Error("AI返回的结局JSON内容格式不符合预期");
              }
          } catch (jsonError) {
              console.error("解析AI返回的content JSON失败 (可能是格式错误):", jsonError, "原始content:", contentString);
              finalStoryText = contentString;
          }
      } else {
          finalStoryText = contentString;
      }

      if (finalStoryText.startsWith('"') && finalStoryText.endsWith('"')) {
          finalStoryText = finalStoryText.slice(1, -1);
      }

      this.currentStoryText = finalStoryText;
      this.currentChoices = [];
      console.log("游戏结局:", this.currentStoryText);

  } catch (error) {
      console.error("生成游戏结局时发生错误:", error);
      this.currentStoryText = ERROR_MESSAGES.AI_FAILED;
      this.currentChoices = [];
  } finally {
      this.aiLoading = false;
  }
  },
  }
}
</script>
<style lang="less">
@import './index.less';
</style>