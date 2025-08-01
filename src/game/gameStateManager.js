// src/game/gameStateManager.js

import { defaultUserInfos } from '@/configs/default_user.js'; // 引入默认用户信息

const SAVE_KEY = 'cultivationGameSave';

export default {
  // 初始化或加载游戏状态
  loadGameState() {
    try {
      const cultivationGameSave = localStorage.getItem(SAVE_KEY);
      if (!cultivationGameSave) {
        // 如果没有保存数据，返回默认初始状态
        return {
          gameState: { ...defaultUserInfos },
          currentStoryText: '你从一个悠长的梦境中惊醒，梦里是未来世界的奇巧淫技，是闻所未闻的喧嚣与繁华。但眼前，却是简陋的茅屋、微弱的油灯。窗外，战火渐近，狼烟四起，远方山峦在暮色中影影绰绰。你意识到，你来到了一个名为"汉末三国"的乱世。在这里，无论是布衣百姓还是豪杰名士，皆可凭借智谋与武勇，逐鹿中原，问鼎天下，开创属于自己的盛世。一个神秘的声音在你脑海中回响："此乃天命所归，亦是汝之抉择。选择你的出身，书写你的传奇吧。',
          currentSceneImg: '',
          currentChoices: [
            { text: '📜 汉室宗亲，身世浮沉', value: '汉室宗亲' },
            { text: '🌾 地方豪强，力耕天下', value: '地方豪强' },
            { text: '📚 落魄士人，满腹经纶', value: '落魄士人' },
            { text: '💰 行商之子，财运亨通', value: '行商之子' },
            { text: '⚔️ 战乱流民，乱世求生', value: '战乱流民' }
          ],
          saveTime: new Date().toISOString(),
        };
      }

      const saveData = JSON.parse(cultivationGameSave);
      // 合并默认值，确保所有字段都存在
      saveData.gameState = { ...defaultUserInfos, ...saveData.gameState };

      // 检查游戏是否结束
      if (saveData.gameState.health <= 0) {
        saveData.currentStoryText = '你倒在血泊之中，意识逐渐模糊... 你的冒险已在此终结。';
        saveData.currentChoices = [{ text: '📜 🔄 重新开始', value: '重新开始', type: 'retry' }];
      }

      console.log('游戏状态已加载，保存时间:', saveData.saveTime);
      return saveData;

    } catch (error) {
      console.error('加载游戏状态失败:', error);
      // 加载失败时也返回一个默认的初始状态
      return {
        gameState: { ...defaultUserInfos },
        currentStoryText: '你从一个悠长的梦境中惊醒，梦里是未来世界的奇巧淫技，是闻所未闻的喧嚣与繁华。但眼前，却是简陋的茅屋、微弱的油灯。窗外，战火渐近，狼烟四起，远方山峦在暮色中影影绰绰。你意识到，你来到了一个名为"汉末三国"的乱世。在这里，无论是布衣百姓还是豪杰名士，皆可凭借智谋与武勇，逐鹿中原，问鼎天下，开创属于自己的盛世。一个神秘的声音在你脑海中回响："此乃天命所归，亦是汝之抉择。选择你的出身，书写你的传奇吧。',
        currentSceneImg: '',
        currentChoices: [
          { text: '📜 汉室宗亲，身世浮沉', value: '汉室宗亲' },
          { text: '🌾 地方豪强，力耕天下', value: '地方豪强' },
          { text: '📚 落魄士人，满腹经纶', value: '落魄士人' },
          { text: '💰 行商之子，财运亨通', value: '行商之子' },
          { text: '⚔️ 战乱流民，乱世求生', value: '战乱流民' }
        ],
        saveTime: new Date().toISOString(),
      };
    }
  },

  // 保存游戏状态
  saveGameState(gameState, currentStoryText, currentSceneImg, currentChoices) {
    try {
      const saveData = {
        gameState,
        currentStoryText,
        currentSceneImg,
        currentChoices,
        saveTime: new Date().toISOString()
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
      console.log('游戏状态已保存');
      return true;
    } catch (error) {
      console.error('保存游戏状态失败:', error);
      return false;
    }
  },

  // 重置游戏状态
  resetGameState() {
    localStorage.removeItem(SAVE_KEY);
    return {
      gameState: { ...defaultUserInfos },
      currentStoryText: '你从一个悠长的梦境中惊醒，梦里是未来世界的奇巧淫技，是闻所未闻的喧嚣与繁华。但眼前，却是简陋的茅屋、微弱的油灯。窗外，战火渐近，狼烟四起，远方山峦在暮色中影影绰绰。你意识到，你来到了一个名为"汉末三国"的乱世。在这里，无论是布衣百姓还是豪杰名士，皆可凭借智谋与武勇，逐鹿中原，问鼎天下，开创属于自己的盛世。一个神秘的声音在你脑海中回响："此乃天命所归，亦是汝之抉择。选择你的出身，书写你的传奇吧。',
      currentSceneImg: '',
      currentChoices: [
        { text: '📜 汉室宗亲，身世浮沉', value: '汉室宗亲' },
        { text: '🌾 地方豪强，力耕天下', value: '地方豪强' },
        { text: '📚 落魄士人，满腹经纶', value: '落魄士人' },
        { text: '💰 行商之子，财运亨通', value: '行商之子' },
        { text: '⚔️ 战乱流民，乱世求生', value: '战乱流民' }
      ]
    };
  },

  // 更新身份
  updateIdentity(gameState) {
    if (!Array.isArray(gameState.adventureLog)) {
      gameState.adventureLog = [];
    }

    // 更新身份/地位显示
    if (gameState.level > 30) {
      gameState.identity = '帝王';
    } else if (gameState.level > 25) {
      gameState.identity = '丞相/大将军';
    } else if (gameState.level > 20) {
      gameState.identity = '州牧/太守';
    } else if (gameState.level > 15) {
      gameState.identity = '郡守/刺史';
    } else if (gameState.level > 10) {
      gameState.identity = '校尉/都尉';
    } else if (gameState.level > 5) {
      gameState.identity = '县令/亭长';
    } else if (gameState.level > 1) {
      gameState.identity = '乡绅/里正';
    } else {
      gameState.identity = '布衣';
    }
    return gameState; // 返回更新后的状态
  },

  // 根据AI响应更新游戏状态
  applyGameStateUpdates(currentGameState, content) {
    const gameState = { ...currentGameState }; // 复制一份，避免直接修改props

    if (content.gameState) {
      const updates = content.gameState;

      // 直接设置数值属性
      ['health', 'gender', 'maxHealth', 'attack', 'defense', 'agility', 'charm', 'coins', 'reputation', 'level'].forEach(key => {
        if (updates[key] !== undefined) {
          gameState[key] = Number(updates[key]);
        }
      });

      // 更新身份
      if (updates.identity) {
        gameState.identity = updates.identity;
      }

      // 更新技能列表（完全替换）
      if (updates.skills && Array.isArray(updates.skills)) {
        gameState.skills = updates.skills.map(skill => ({
          name: skill.name,
          description: skill.description || "新习得的技能",
          icon: skill.icon || "fa-solid fa-star"
        }));
      }

      // 修复物品更新逻辑 - 处理字符串数组
      if (updates.items && Array.isArray(updates.items)) {
        let existItemsNames = [];
        let existItemsCounts = {};

        updates.items.forEach(item => {
          let name = typeof item === 'string' ? item : item.name;
          if (name) {
            if (!existItemsNames.includes(name)) {
              existItemsNames.push(name);
              existItemsCounts[name] = 1;
            } else {
              existItemsCounts[name] += 1;
            }
          }
        });

        const itemMaps = existItemsNames.map(name => {
          return {
            id: name.toLowerCase().replace(/\s/g, '_'),
            name: name,
            count: existItemsCounts[name],
          };
        });
        gameState.items = itemMaps;
      }

      // 更新成就状态
      if (updates.achievements && Array.isArray(updates.achievements)) {
        updates.achievements.forEach(achUpdate => {
          const achievement = gameState.achievements.find(a => a.id === achUpdate.id);
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
            const existingItem = gameState.items.find(item => item.name === newItemName);
            if (existingItem) {
              existingItem.count = (existingItem.count || 1) + 1; // 如果有，数量+1
            } else {
              gameState.items.push({ id: newItemName.toLowerCase().replace(/\s/g, '_'), name: newItemName, count: 1 });
            }
          }
        });
      }
      if (content.itemUpdates.remove) {
        content.itemUpdates.remove.forEach(itemIdToRemove => {
          gameState.items = gameState.items.filter(item => item.id !== itemIdToRemove);
        });
      }
    }

    if (content.unlockAchievements && Array.isArray(content.unlockAchievements)) {
      content.unlockAchievements.forEach(achIdToUnlock => {
        const achievement = gameState.achievements.find(a => a.id === achIdToUnlock);
        if (achievement && !achievement.unlocked) {
          achievement.unlocked = true;
        }
      });
    }

    // 自动检查技能相关成就
    const skillCount = gameState.skills.length;
    if (skillCount >= 1) {
      const firstSkillAch = gameState.achievements.find(a => a.id === 'first_skill');
      if (firstSkillAch && !firstSkillAch.unlocked) {
        firstSkillAch.unlocked = true;
        console.log("解锁成就: 初窥门径");
      }
    }
    if (skillCount >= 5) {
      const skillMasterAch = gameState.achievements.find(a => a.id === 'skill_master');
      if (skillMasterAch && !skillMasterAch.unlocked) {
        skillMasterAch.unlocked = true;
        console.log("解锁成就: 技艺精湛");
      }
    }

    // 检查战技技能数量
    const spellSkills = gameState.skills.filter(skill =>
      skill.name.includes('术') || skill.name.includes('策') || skill.name.includes('计')
    );
    if (spellSkills.length >= 3) {
      const spellCasterAch = gameState.achievements.find(a => a.id === 'spell_caster');
      if (spellCasterAch && !spellCasterAch.unlocked) {
        spellCasterAch.unlocked = true;
        console.log("解锁成就: 战术大师");
      }
    }

    if (content.logEntry && typeof content.logEntry === 'string') {
      gameState.turn++;
      gameState.adventureLog.push({ turn: gameState.turn, entry: content.logEntry });
    }

    return gameState; // 返回更新后的状态
  }
};