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
      <div class="game-area">
        <div class="loading" id="loading" :class="{ active: aiLoading }" v-show="aiLoading">
          <div class="loading-spinner"></div>
          <div class="loading-text">正在推演新的乱世...</div>
        </div>

        <div class="image-settings-container">
          <h3 class="panel-title">场景图片设置</h3>
          <div class="image-settings">
            <el-checkbox class="rule-checkbox" v-model="enableImageRendering">
              <span>渲染场景图片</span>
            </el-checkbox>
          </div>
          <p id="image-warning-message" class="image-warning" :style="{ display: enableImageRendering ? 'block' : 'none' }">
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
            <el-input v-model="playerChoiceText" id="custom-choice-input" placeholder="输入你的行动（如：拜访贤士、招募兵卒、侦察敌情...）" @keyup.enter.native="confirmChoiceText"></el-input>
            <el-button id="submit-custom-choice" @click="confirmChoiceText">提交</el-button>
          </div>
        </div>
      </div>

      <div class="stats-panel">
        <h2 class="panel-title">角色状态</h2>
        <div class="character-info">
          <div class="char-header">
            <div class="char-icon">👤</div>
            <div id="char-name" class="char-name">{{'当前回合数：'+gameState.turn}}</div>
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
// 引入拆分后的模块
import gameApi from '@/api/gameApi.js';
import gameStateManager from '@/game/gameStateManager.js';
import aiProcessor from '@/game/aiProcessor.js';
import { ERROR_MESSAGES } from '@/configs/end_prompt.js'; // 引入错误信息常量

export default {
  data() {
    return {
      gameState: {}, // 初始状态在 mounted 中从 gameStateManager 加载
      aiLoading: false,
      currentStoryText: '',
      currentSceneImg: '',
      choices: [],
      enableImageRendering: false,
      saveTime: '', // 会在加载时被设置
      maxGameTurns: 180, // 游戏回合数上限，需要根据游戏设计调整

      // 长期记忆 (Long-Term Memory)
      longTermMemory: [],  // 存储总结后的LTM条目
      turnsSinceLastSummary: 0, // 记录距离上次总结的回合数
      lsummaryInterval: 10, // 每隔10回合总结一次
      ltmMaxSize: 3,       // LTM 最大存储总结条目数 (当达到此上限时，会触发LTM自身的总结)

      customApiUrl: localStorage.getItem('customApiUrl') || '',
      customApiKey: localStorage.getItem('customApiKey') || '',
      selectedModel: localStorage.getItem('selectedModel') || '',
      models: [],
      defaultModelName: 'DeepSeek-R1-0528', // 默认模型名

      playerChoiceText: ''
    };
  },
  mounted() {
    this.initGame();
  },
  methods: {
    async initGame() {
      // 1. 加载游戏状态
      const loadedState = gameStateManager.loadGameState();
      this.gameState = loadedState.gameState;
      this.currentStoryText = loadedState.currentStoryText;
      this.currentSceneImg = loadedState.currentSceneImg;
      this.choices = loadedState.currentChoices;
      this.saveTime = loadedState.saveTime;

      // 如果是新游戏，或者游戏已经结束，则更新身份
      if (!loadedState.saveTime || this.gameState.health <= 0) {
        this.gameState = gameStateManager.updateIdentity(this.gameState);
      }

      // 2. 获取配置和模型
      await this.getConfigs();
      await this.getModels();
    },

    async getConfigs() {
      try {
        const data = await gameApi.getGameConfig();
        this.defaultModelName = data.defaultModel || 'DeepSeek-R1-0528';
        if (!this.selectedModel && this.defaultModelName && this.models.length === 0) {
          this.selectedModel = this.defaultModelName;
        }
      } catch (error) {
        console.error('获取配置失败:', error);
        this.defaultModelName = 'DeepSeek-R1-0528'; // 获取失败时，设置一个默认值
      }
    },

    async getModels() {
      try {
        const res = await gameApi.getModelsList();
        const rawData = (res && Array.isArray(res.data)) ? res.data : [];
        this.models = JSON.parse(JSON.stringify(rawData)); // 深拷贝

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
      } catch (error) {
        console.error('获取模型列表失败:', error);
        this.models = [];
        this.selectedModel = '获取模型失败';
      }
    },

    saveApiSettings() {
      localStorage.setItem('customApiUrl', this.customApiUrl);
      localStorage.setItem('customApiKey', this.customApiKey);
      localStorage.setItem('selectedModel', this.selectedModel);
      alert('API 设置已保存！');
      console.log('API Settings Saved:', {
        url: this.customApiUrl,
        key: this.customApiKey,
        model: this.selectedModel
      });
    },

    clearApiSettings() {
      localStorage.removeItem('customApiUrl');
      localStorage.removeItem('customApiKey');
      localStorage.removeItem('selectedModel');
      this.customApiUrl = '';
      this.customApiKey = '';
      this.selectedModel = ''; // 清除选择的模型
      alert('API 设置已清除！');
      console.log('API Settings Cleared.');
    },

    confirmChoice(item) {
      if (this.aiLoading) return; // 防止重复点击

      if (item.type === 'retry') {
        this.resetGame();
      } else if (item.type === 'refresh') {
        window.location.reload();
      } else {
        this.handleChoice(item.value, item.text);
      }
    },

    resetGame() {
      const initialStates = gameStateManager.resetGameState();
      this.gameState = initialStates.gameState;
      this.currentStoryText = initialStates.currentStoryText;
      this.currentSceneImg = initialStates.currentSceneImg;
      this.choices = initialStates.currentChoices;
      this.saveTime = new Date().toISOString();
      this.longTermMemory = [];
      this.turnsSinceLastSummary = 0;
      this.aiLoading = false; // 确保加载状态重置
      this.gameState = gameStateManager.updateIdentity(this.gameState); // 更新身份
      gameStateManager.saveGameState(this.gameState, this.currentStoryText, this.currentSceneImg, this.choices); // 保存初始状态
    },

    handleChoice(choiceTarget, choiceText) {
      const firstChoiceAch = this.gameState.achievements.find(a => a.id === 'first_choice');
      if (firstChoiceAch && !firstChoiceAch.unlocked) {
        firstChoiceAch.unlocked = true;
      }
      this.loadScene(choiceTarget, choiceText);
    },

    confirmChoiceText() {
      if (this.aiLoading) return; // 防止重复提交

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

      // 添加到大事记 (此处先添加，让AI生成结果后再统一更新)

      this.loadScene('custom', customText);
      this.playerChoiceText = ''; // 清空输入框
    },

    async loadScene(sceneKey, playerChoiceText = null) {
      this.aiLoading = true;

      try {
        // 在状态更新前检查游戏是否已结束
        if (this.gameState.health <= 0) {
          this.currentStoryText = "你倒在血泊之中，意识逐渐模糊... 你的冒险已在此终结。";
          this.choices = [{ text: '📜 🔄 重新开始', value: '重新开始', type: 'retry' }];
          this.aiLoading = false;
          gameStateManager.saveGameState(this.gameState, this.currentStoryText, this.currentSceneImg, this.choices);
          return;
        }

        if (this.gameState.turn >= this.maxGameTurns && this.maxGameTurns > 0) { // 检查回合数上限
          await this.handleGameEndByTurnLimit();
          this.choices = [{ text: '📜 🔄 重新开始', value: '重新开始', type: 'retry' }];
          this.aiLoading = false;
          gameStateManager.saveGameState(this.gameState, this.currentStoryText, this.currentSceneImg, this.choices);
          return;
        }

        // 检查是否需要生成长时记忆
        this.turnsSinceLastSummary++;
        if (this.turnsSinceLastSummary >= this.lsummaryInterval) {
            const logsToSummarize = this.gameState.adventureLog.slice(-this.lsummaryInterval);
            try {
                const summary = await aiProcessor.generateLongTermMemory(logsToSummarize, this.selectedModel || this.defaultModelName);
                if (summary) {
                    this.longTermMemory.unshift(summary);
                    if (this.longTermMemory.length > this.ltmMaxSize) {
                        this.longTermMemory.pop(); // 移除最旧的记忆
                    }
                }
            } catch (sumError) {
                console.warn("生成长时记忆失败，但游戏继续:", sumError);
                // 即使失败也重置计数器，避免无限重试
            } finally {
                this.turnsSinceLastSummary = 0; // 重置计数器
            }
        }


        const scene = await aiProcessor.generateAdventure({
          gameState: this.gameState,
          previousStoryText: this.currentStoryText,
          playerChoiceText: playerChoiceText,
          longTermMemory: this.longTermMemory,
          model: this.selectedModel || this.defaultModelName
        });
        console.log("生成的场景:", scene);

        if (!scene) {
          throw new Error('AI未能生成有效场景');
        }

        // 更新游戏状态
        this.gameState = gameStateManager.applyGameStateUpdates(this.gameState, scene);
        this.currentStoryText = scene.text;
        this.choices = [...scene.choices];

        if (!scene.choices || scene.choices.length === 0) {
          this.choices = [{
            text: '本次冒险暂告一段落，刷新页面重新开始。',
            value: 'refresh',
            type: 'refresh'
          }];
        }

        // 生成图片（异步操作，不阻塞主流程）
        this.generateImage(scene.imagePrompt);

      } catch (error) {
        console.error("冒险生成失败的详细错误:", error);
        let errorMessage = error.message || '未知错误';
        let fallbackContent = error.fallbackContent; // 尝试获取备用内容

        if (fallbackContent) {
          this.currentStoryText = fallbackContent.text;
          this.choices = fallbackContent.choices;
          this.gameState = gameStateManager.applyGameStateUpdates(this.gameState, fallbackContent);
          this.generateImage(fallbackContent.imagePrompt); // 尝试生成备用图片
          console.log("使用备用响应");
        } else {
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
          this.currentStoryText = ERROR_MESSAGES.AI_FAILED;
          this.choices = [
            { text: "🔄 重新尝试", value: "retry", type: "retry" },
            { text: "🏠 返回起点", value: "start", type: "start" },
            { text: "继续探索", value: "continue", type: "continue" }
          ];
        }
      } finally {
        this.aiLoading = false;
        // 无论成功失败，都尝试保存当前状态
        gameStateManager.saveGameState(this.gameState, this.currentStoryText, this.currentSceneImg, this.choices);
        this.gameState = gameStateManager.updateIdentity(this.gameState); // 确保身份是最新的
      }
    },

    async handleGameEndByTurnLimit() {
      this.aiLoading = true;
      try {
        const finalStoryText = await aiProcessor.endGameByTurnLimit(
          this.gameState,
          this.currentStoryText,
          this.longTermMemory,
          this.maxGameTurns,
          this.selectedModel || this.defaultModelName
        );
        this.currentStoryText = finalStoryText;
        this.choices = [{ text: '📜 🔄 重新开始', value: '重新开始', type: 'retry' }];
      } catch (error) {
        console.error("生成游戏结局时发生错误:", error);
        this.currentStoryText = ERROR_MESSAGES.AI_FAILED;
        this.choices = [{ text: '📜 🔄 重新开始', value: '重新开始', type: 'retry' }];
      } finally {
        this.aiLoading = false;
        gameStateManager.saveGameState(this.gameState, this.currentStoryText, this.currentSceneImg, this.choices);
        this.gameState = gameStateManager.updateIdentity(this.gameState);
      }
    },

    async generateImage(prompt) {
      if (!this.enableImageRendering) {
        console.log('图片渲染未开启，跳过图片生成。');
        this.currentSceneImg = '';
        return;
      }
      try {
        const isLocalFile = window.location.protocol === 'file:';
        let imageUrl;

        if (isLocalFile) {
          imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?nologo=true&width=800&height=600&model=flux`;
          this.currentSceneImg = imageUrl;
        } else {
          const data = await gameApi.generateImage({ prompt: prompt, width: 800, height: 600, nologo: true, model: 'flux' });
          if (!data.success || !data.imageUrl) {
            throw new Error('图片生成失败');
          }
          this.currentSceneImg = data.imageUrl;
          console.log('图片生成成功:', data);
        }
      } catch (error) {
        console.error('图片生成错误:', error);
        const fallbackUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWExYTJlIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzRlY2RjNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuS/ruS7meS4lueVjO+8muS6kea4uuS7meWcnzwvdGV4dD4KPC9zdmc+';
        this.currentSceneImg = fallbackUrl;
      }
    },
  }
};
</script>

<style lang="less">
@import './index.less';
</style>
