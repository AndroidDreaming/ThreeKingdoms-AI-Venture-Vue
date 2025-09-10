<template>
  <div class="game-page">
    <GameHeader />
    <StatusBar :gameState="gameState" />
    
    <MusicPlayer />
    
    <div class="game-controls">
      <el-button id="reset-game-btn" class="control-btn start-btn" @click="resetGame">🔄 重开局势</el-button>
    </div>

    <div class="game-ui">
      <div class="game-area">
        <LoadingIndicator v-if="aiLoading" />
        
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

        <ImageAndText 
          :current-scene-img="currentSceneImg" 
          :current-story-text="currentStoryText" 
          :enable-image-rendering="enableImageRendering" 
        />
        <ChoicesAndInput 
          :choices="choices" 
          :player-choice-text.sync="playerChoiceText" 
          @choice-selected="confirmChoice" 
          @custom-choice-submitted="confirmChoiceText" 
        />
      </div>

      <div class="stats-panel">
        <CharacterPanel :gameState="gameState" />
        <NPCCharacterCard @npc-click="handleNPCInteraction" />
        <SkillsAndItems :skills="gameState.skills" :items="gameState.items" />
        <GameLog :achievements="gameState.achievements" :adventure-log="gameState.adventureLog" />
      </div>
    </div>

    <ApiSettings
      :models="models"
      :custom-api-url.sync="customApiUrl"
      :custom-api-key.sync="customApiKey"
      :selected-model.sync="selectedModel"
      @save="saveApiSettings"
      @clear="clearApiSettings"
    />
    
    <footer>享受你的游戏</footer>
  </div>
</template>

<script>
// 引入拆分后的模块和组件
import gameApi from '@/api/gameApi.js';
import gameStateManager from '@/game/gameStateManager.js';
import aiProcessor from '@/game/aiProcessor.js';
import { ERROR_MESSAGES } from '@/configs/end_prompt.js';

import GameHeader from '@/components/GameHeader.vue';
import StatusBar from '@/components/StatusBar.vue';
import CharacterPanel from '@/components/CharacterPanel.vue';
import SkillsAndItems from '@/components/SkillsAndItems.vue';
import GameLog from '@/components/GameLog.vue';
import ImageAndText from '@/components/ImageAndText.vue';
import ChoicesAndInput from '@/components/ChoicesAndInput.vue';
import ApiSettings from '@/components/ApiSettings.vue';
import LoadingIndicator from '@/components/LoadingIndicator.vue';
import MusicPlayer from '@/components/MusicPlayer.vue';
import NPCCharacterCard from '@/components/NPCCharacterCard.vue';

export default {
  components: {
    GameHeader,
    StatusBar,
    CharacterPanel,
    SkillsAndItems,
    GameLog,
    ImageAndText,
    ChoicesAndInput,
    ApiSettings,
    LoadingIndicator,
    MusicPlayer,
    NPCCharacterCard,
  },
  data() {
    return {
      gameState: {},
      aiLoading: false,
      currentStoryText: '',
      currentSceneImg: '',
      choices: [],
      enableImageRendering: false,
      playerChoiceText: '',

      // API设置相关数据
      customApiUrl: localStorage.getItem('customApiUrl') || '',
      customApiKey: localStorage.getItem('customApiKey') || '',
      selectedModel: localStorage.getItem('selectedModel') || '',
      models: [],
      defaultModelName: 'DeepSeek-R1-0528',

      // 游戏状态管理相关数据
      longTermMemory: [],
      turnsSinceLastSummary: 0,
      lsummaryInterval: 10,
      ltmMaxSize: 3,
      maxGameTurns: 180,
    };
  },
  mounted() {
    this.initGame();
  },
  methods: {
    async initGame() {
      const loadedState = gameStateManager.loadGameState();
      this.gameState = loadedState.gameState;
      this.currentStoryText = loadedState.currentStoryText;
      this.currentSceneImg = loadedState.currentSceneImg;
      this.choices = loadedState.currentChoices;
      this.saveTime = loadedState.saveTime;

      if (!loadedState.saveTime || this.gameState.health <= 0) {
        this.gameState = gameStateManager.updateIdentity(this.gameState);
      }
      await this.getConfigsAndModels();
    },

    async getConfigsAndModels() {
      try {
        const configData = await gameApi.getGameConfig();
        this.defaultModelName = configData.defaultModel || 'DeepSeek-R1-0528';

        const modelsRes = await gameApi.getModelsList();
        this.models = (modelsRes && Array.isArray(modelsRes.data)) ? modelsRes.data : [];

        const savedModel = localStorage.getItem('selectedModel');
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
        console.error('获取配置或模型失败:', error);
        this.models = [];
        this.selectedModel = '获取模型失败';
      }
    },

    saveApiSettings() {
      localStorage.setItem('customApiUrl', this.customApiUrl);
      localStorage.setItem('customApiKey', this.customApiKey);
      localStorage.setItem('selectedModel', this.selectedModel);
      alert('API 设置已保存！');
    },

    clearApiSettings() {
      localStorage.removeItem('customApiUrl');
      localStorage.removeItem('customApiKey');
      localStorage.removeItem('selectedModel');
      this.customApiUrl = '';
      this.customApiKey = '';
      this.selectedModel = '';
      alert('API 设置已清除！');
    },

    confirmChoice(item) {
      if (this.aiLoading) return;
      if (item.type === 'retry') {
        this.resetGame();
      } else if (item.type === 'refresh') {
        window.location.reload();
      } else {
        this.handleChoice(item.value, item.text);
      }
    },

    handleChoice(choiceTarget, choiceText) {
      const firstChoiceAch = this.gameState.achievements.find(a => a.id === 'first_choice');
      if (firstChoiceAch && !firstChoiceAch.unlocked) {
        firstChoiceAch.unlocked = true;
      }
      this.loadScene(choiceTarget, choiceText);
    },

    confirmChoiceText(text) {
      if (this.aiLoading) return;
      if (text.trim() === '') {
        this.$message.error('请输入有效的行动');
        return;
      }
      this.loadScene('custom', text);
      this.playerChoiceText = '';
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
      this.aiLoading = false;
      this.gameState = gameStateManager.updateIdentity(this.gameState);
      window.location.reload();
    },

    async loadScene(sceneKey, playerChoiceText = null) {
      this.aiLoading = true;
      try {
        if (this.gameState.health <= 0) {
          this.handleDeath();
          return;
        }
        if (this.gameState.turn >= this.maxGameTurns && this.maxGameTurns > 0) {
          await this.handleGameEndByTurnLimit();
          return;
        }

        // 检查是否需要生成长时记忆
        this.turnsSinceLastSummary++;
        if (this.turnsSinceLastSummary >= this.lsummaryInterval) {
          await this.generateLongTermMemory();
        }

        const scene = await aiProcessor.generateAdventure({
          gameState: this.gameState,
          previousStoryText: this.currentStoryText,
          playerChoiceText: playerChoiceText,
          longTermMemory: this.longTermMemory,
          model: this.selectedModel || this.defaultModelName,
        });

        if (!scene) throw new Error('AI未能生成有效场景');

        this.updateGameState(scene);
      } catch (error) {
        this.handleGenerationError(error);
      } finally {
        this.aiLoading = false;
        gameStateManager.saveGameState(this.gameState, this.currentStoryText, this.currentSceneImg, this.choices);
        this.gameState = gameStateManager.updateIdentity(this.gameState);
      }
    },

    async generateLongTermMemory() {
      const logsToSummarize = this.gameState.adventureLog.slice(-this.lsummaryInterval);
      try {
        const summary = await aiProcessor.generateLongTermMemory(logsToSummarize, this.selectedModel || this.defaultModelName);
        if (summary) {
          this.longTermMemory.unshift(summary);
          if (this.longTermMemory.length > this.ltmMaxSize) {
            this.longTermMemory.pop();
          }
        }
      } catch (sumError) {
        console.warn("生成长时记忆失败，但游戏继续:", sumError);
      } finally {
        this.turnsSinceLastSummary = 0;
      }
    },

    updateGameState(scene) {
      this.gameState = gameStateManager.applyGameStateUpdates(this.gameState, scene);
      this.currentStoryText = scene.text;
      this.choices = [...scene.choices];
      if (!scene.choices || scene.choices.length === 0) {
        this.choices = [{ text: '本次冒险暂告一段落，刷新页面重新开始。', value: 'refresh', type: 'refresh' }];
      }
      this.generateImage(scene.imagePrompt);
    },

    handleGenerationError(error) {
      console.error("冒险生成失败的详细错误:", error);
      let errorMessage = error.message || '未知错误';
      let fallbackContent = error.fallbackContent;

      if (fallbackContent) {
        this.updateGameState(fallbackContent);
      } else {
        alert(`❌ 冒险生成失败: ${errorMessage}\n\n请检查网络和API设置。`);
        this.currentStoryText = ERROR_MESSAGES.AI_FAILED;
        this.choices = [{ text: "🔄 重新尝试", value: "retry", type: "retry" }, { text: "破开迷雾继续前进", value: "continue", type: "continue" }];
      }
    },

    async handleGameEndByTurnLimit() {
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
      }
    },

  async handleNPCInteraction() {
    this.aiLoading = true;
    try {
      const randomChance = Math.random();

      if (randomChance < 0.7) {
        const easterEggs = [
          '曲离歌轻盈地一跃，看似玩笑地踢了你的屁股一下，然后悄然消失。',
          '曲离歌对你神秘一笑，递给你一朵小花，然后转身离去。',
          '曲离歌看了你一眼，没有说话，但你感到一阵暖意，仿佛被无形的力量加持。',
        ];
        const chosenEgg = easterEggs[Math.floor(Math.random() * easterEggs.length)];

        this.currentStoryText = chosenEgg;
        
      } else { 
        this.currentStoryText = "曲离歌的眼神变得严肃起来...";
        // 无条件调用 AI，获取具体的建议
        const response = await aiProcessor.generateNPCInteraction(
          this.gameState,
          '曲离歌',
          this.selectedModel || this.defaultModelName
        );
        
        this.gameState.adventureLog.unshift({ entry: response.log });
        this.currentStoryText = response.dialogue;
      }
    } catch (error) {
      console.error('NPC互动失败:', error);
      this.currentStoryText = '曲离歌叹了口气，似乎对你的无礼感到不满。';
    } finally {
      this.aiLoading = false;
      gameStateManager.saveGameState(this.gameState, this.currentStoryText, this.currentSceneImg, this.choices);
    }
  },

    handleDeath() {
      this.currentStoryText = "你倒在血泊之中，意识逐渐模糊... 你的冒险已在此终结。";
      this.choices = [{ text: '📜 🔄 重新开始', value: '重新开始', type: 'retry' }];
      gameStateManager.saveGameState(this.gameState, this.currentStoryText, this.currentSceneImg, this.choices);
    },

    async generateImage(prompt) {
      if (!this.enableImageRendering) {
        this.currentSceneImg = '';
        return;
      }
      try {
        const data = await gameApi.generateImage({ prompt: prompt, width: 800, height: 600, nologo: true, model: 'flux' });
        if (!data.success || !data.imageUrl) {
          throw new Error('图片生成失败');
        }
        this.currentSceneImg = data.imageUrl;
      } catch (error) {
        console.error('图片生成错误:', error);
        const fallbackUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWExYTJlIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzRlY2RjNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuS/ruS7meS4lueVjO+8muS6kea4uuS7meWcnzwvdGV4dD4KPC9zdmc+';
        this.currentSceneImg = fallbackUrl;
      }
    },
  },
};
</script>

<style lang="less">
@import './index.less';
</style>