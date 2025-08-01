import { defaultUserInfos } from '@/configs/default_user.js';
export default {
  methods: {
    loadGameState() {
      try {
        const saveData = JSON.parse(localStorage.getItem('cultivationGameSave'));
        if (!saveData?.gameState) return false;
        
        this.gameState = saveData.gameState || { ...defaultUserInfos };
        // 其他恢复逻辑...
        return true;
      } catch (error) {
        console.error('加载游戏状态失败:', error);
        return false;
      }
    },

    saveGameState() {
      try {
        const saveData = {
          gameState: this.gameState,
          currentStoryText: this.currentStoryText,
          currentSceneImg: this.currentSceneImg,
          currentChoices: this.choices.map(btn => ({
            text: btn.text,
            target: btn.value,
            type: btn.type || 'choice'
          })),
          saveTime: new Date().toISOString()
        };
        
        localStorage.setItem('cultivationGameSave', JSON.stringify(saveData));
        return true;
      } catch (error) {
        console.error('保存游戏状态失败:', error);
        return false;
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

  }
}