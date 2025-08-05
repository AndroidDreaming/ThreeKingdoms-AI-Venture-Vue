// src/game/gameStateManager.js

import { defaultUserInfos } from '@/configs/default_user.js'; // 引入默认用户信息

const SAVE_KEY = 'cultivationGameSave';

/**
 * 创建并返回一个全新的默认游戏状态对象。
 * @returns {object} 默认游戏状态对象
 */
const createDefaultGameState = () => {
  return {
    gameState: { ...defaultUserInfos },
    currentStoryText: '你从一个悠长的梦境中惊醒，梦里是未来世界的奇巧淫技，是闻所未闻的喧嚣与繁华。但眼前，却是简陋的茅屋、微弱的油灯。窗外，战火渐近，狼烟四起，远方山峦在暮色中影影绰绰。你意识到，你来到了一个名为"汉末三国"的乱世。在这里，无论是布衣百姓还是豪杰名士，皆可凭借智谋与武勇，逐鹿中原，问鼎天下，开创属于自己的盛世。一个神秘的声音在你脑海中回响："此乃天命所归，亦是汝之抉择。选择你的出身，书写你的传奇吧。',
    currentSceneImg: '',
    currentChoices: [
      { text: '📜 汉室宗亲，身世浮沉', value: '汉室宗亲' },
      { text: '🌾 地方豪强，力耕天下', value: '地方豪强' },
      { text: '📚 落魄士人，满腹经纶', value: '落魄士人' },
      { text: '💰 行商之子，财运亨通', value: '行商之子' },
      { text: '⚔️ 战乱流民，乱世求生', value: '战乱流民' },
    ],
    saveTime: new Date().toISOString(),
  };
};

/**
 * 根据等级更新身份/地位
 * @param {object} gameState - 当前游戏状态
 * @returns {void}
 */
const updateIdentityByLevel = (gameState) => {
  if (gameState.level > 30) gameState.identity = '帝王';
  else if (gameState.level > 25) gameState.identity = '丞相/大将军';
  else if (gameState.level > 20) gameState.identity = '州牧/太守';
  else if (gameState.level > 15) gameState.identity = '郡守/刺史';
  else if (gameState.level > 10) gameState.identity = '校尉/都尉';
  else if (gameState.level > 5) gameState.identity = '县令/亭长';
  else if (gameState.level > 1) gameState.identity = '乡绅/里正';
  else gameState.identity = '布衣';
};

export default {
  /**
   * 加载或初始化游戏状态
   * @returns {object} 游戏状态对象
   */
  loadGameState() {
    try {
      const cultivationGameSave = localStorage.getItem(SAVE_KEY);
      if (!cultivationGameSave) {
        console.log('未找到保存数据，返回初始状态。');
        return createDefaultGameState();
      }

      const saveData = JSON.parse(cultivationGameSave);
      // 合并默认值，确保新版本字段存在且不丢失，同时保留旧存档数据
      saveData.gameState = { ...defaultUserInfos, ...saveData.gameState };

      // 检查游戏是否结束
      if (saveData.gameState.health <= 0) {
        saveData.currentStoryText = '你倒在血泊之中，意识逐渐模糊... 你的冒险已在此终结。';
        saveData.currentChoices = [{ text: '📜 🔄 重新开始', value: '重新开始', type: 'retry' }];
      } else {
        // 如果游戏没有结束，则根据等级更新身份
        updateIdentityByLevel(saveData.gameState);
      }

      console.log('游戏状态已加载，保存时间:', saveData.saveTime);
      return saveData;
    } catch (error) {
      console.error('加载游戏状态失败:', error);
      // 加载失败时也返回一个默认的初始状态
      return createDefaultGameState();
    }
  },

  /**
   * 保存游戏状态
   * @param {object} gameState - 游戏数据
   * @param {string} currentStoryText - 当前故事文本
   * @param {string} currentSceneImg - 当前场景图片
   * @param {array} currentChoices - 当前选项
   * @returns {boolean} 保存是否成功
   */
  saveGameState(gameState, currentStoryText, currentSceneImg, currentChoices) {
    try {
      const saveData = {
        gameState,
        currentStoryText,
        currentSceneImg,
        currentChoices,
        saveTime: new Date().toISOString(),
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
      console.log('游戏状态已保存。');
      return true;
    } catch (error) {
      console.error('保存游戏状态失败:', error);
      return false;
    }
  },

  /**
   * 重置游戏状态
   * @returns {object} 初始游戏状态
   */
  resetGameState() {
    localStorage.removeItem(SAVE_KEY);
    console.log('游戏状态已重置。');
    return createDefaultGameState();
  },

  /**
   * 根据AI响应更新游戏状态
   * @param {object} currentGameState - 当前游戏状态
   * @param {object} content - AI响应数据
   * @returns {object} 更新后的游戏状态
   */
  applyGameStateUpdates(currentGameState, content) {
    const gameState = { ...currentGameState }; // 复制一份，避免直接修改props

    // 确保 adventureLog 是一个数组
    if (!Array.isArray(gameState.adventureLog)) {
      gameState.adventureLog = [];
    }
    
    // 处理 AI 响应中的 gameState 更新
    if (content.gameState) {
      const updates = content.gameState;
      // 直接更新基本属性
      ['health', 'gender', 'maxHealth', 'attack', 'defense', 'agility', 'charm', 'coins', 'reputation', 'level'].forEach(key => {
        if (updates[key] !== undefined) {
          gameState[key] = Number(updates[key]);
        }
      });
      // 更新其他非数值属性
      if (updates.identity) gameState.identity = updates.identity;
      if (updates.name) gameState.name = updates.name;
      
      // 更新技能列表（完全替换）
      if (updates.skills && Array.isArray(updates.skills)) {
        gameState.skills = updates.skills.map(skill => ({
          name: skill.name,
          description: skill.description || "新习得的技能",
          icon: skill.icon || "fa-solid fa-star",
        }));
      }

      // 更新物品列表（完全替换）
      if (updates.items && Array.isArray(updates.items)) {
        gameState.items = updates.items.map(item => ({
          id: item.name.toLowerCase().replace(/\s/g, '_'),
          name: item.name,
          count: item.count || 1,
        }));
      }
    }

    // 处理独立的物品增减更新
    if (content.itemUpdates) {
      // 添加物品
      if (content.itemUpdates.add && Array.isArray(content.itemUpdates.add)) {
        content.itemUpdates.add.forEach(itemData => {
          const newItemName = typeof itemData === 'string' ? itemData : itemData.name;
          const newItemCount = typeof itemData.count === 'number' ? itemData.count : 1;
          const existingItem = gameState.items.find(item => item.name === newItemName);
          if (existingItem) {
            existingItem.count += newItemCount;
          } else {
            gameState.items.push({ id: newItemName.toLowerCase().replace(/\s/g, '_'), name: newItemName, count: newItemCount });
          }
        });
      }
      // 移除物品
      if (content.itemUpdates.remove && Array.isArray(content.itemUpdates.remove)) {
        content.itemUpdates.remove.forEach(itemToRemove => {
          gameState.items = gameState.items.filter(item => item.id !== itemToRemove);
        });
      }
    }
    
    // 处理成就解锁
    if (content.unlockAchievements && Array.isArray(content.unlockAchievements)) {
      content.unlockAchievements.forEach(achIdToUnlock => {
        const achievement = gameState.achievements.find(a => a.id === achIdToUnlock);
        if (achievement && !achievement.unlocked) {
          achievement.unlocked = true;
          console.log(`解锁成就: ${achievement.name}`);
        }
      });
    }

    // 自动检查并解锁基于技能数量的成就
    const skillCount = gameState.skills.length;
    const achievementsToUnlock = [];
    if (skillCount >= 1 && !gameState.achievements.find(a => a.id === 'first_skill').unlocked) {
      achievementsToUnlock.push('first_skill');
    }
    if (skillCount >= 5 && !gameState.achievements.find(a => a.id === 'skill_master').unlocked) {
      achievementsToUnlock.push('skill_master');
    }
    const spellSkills = gameState.skills.filter(s => s.name.includes('术') || s.name.includes('策') || s.name.includes('计'));
    if (spellSkills.length >= 3 && !gameState.achievements.find(a => a.id === 'spell_caster').unlocked) {
      achievementsToUnlock.push('spell_caster');
    }
    
    // 应用自动解锁的成就
    achievementsToUnlock.forEach(achId => {
      const achievement = gameState.achievements.find(a => a.id === achId);
      if (achievement) {
        achievement.unlocked = true;
        console.log(`自动解锁成就: ${achievement.name}`);
      }
    });

    // 处理日志记录
    if (content.logEntry && typeof content.logEntry === 'string') {
      gameState.turn = (gameState.turn || 0) + 1; // 确保turn有初始值
      gameState.adventureLog.push({ turn: gameState.turn, entry: content.logEntry, time: new Date().toISOString() });
    }

    // 在更新所有状态后，重新计算身份（防止AI返回的身份被硬编码逻辑覆盖）
    updateIdentityByLevel(gameState);

    return gameState;
  },
};