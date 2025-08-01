// src/game/aiProcessor.js

import gameApi from '@/api/gameApi.js'; // 引入封装的 API
import { MEMORY_FORMAT, END_PROMPT_TEMPLATE, ERROR_MESSAGES, DEFAULT_VALUES } from '@/configs/end_prompt.js';
import promptGenerator from '@/configs/prompt.js'; // 注意这里改名为 promptGenerator 避免和局部变量 prompt 冲突

export default {
  // 尝试修复不完整的JSON
  tryFixIncompleteJson(jsonStr) {
    jsonStr = jsonStr.replace(/undefined/g, 'null')
      .replace(/'/g, '"');
    jsonStr = jsonStr.trim();
    // 尝试找到最后一个有效的JSON字符（'}' 或 ']' 或 '"'）
    const lastBrace = jsonStr.lastIndexOf('}');
    const lastBracket = jsonStr.lastIndexOf(']');
    const lastQuote = jsonStr.lastIndexOf('"');
    const lastNumber = jsonStr.search(/[0-9]\s*$/); // 查找数字结尾

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

  // 生成冒险场景
  async generateAdventure(params) {
    const { gameState, previousStoryText, playerChoiceText, longTermMemory, model } = params;

    const currentPrompt = promptGenerator.getPrompt({ // 使用重命名后的 promptGenerator
      gameState,
      previousSceneText: previousStoryText,
      playerChoiceText,
      longTermMemory // 携带长时记忆
    });
    console.log("LTM内容：" + longTermMemory);

    let chatParams = {
      prompt: currentPrompt,
      model: model
    };

    // 将 contentString 的声明移到 try...catch 块的外部
    let contentString = ''; 

    try {
      const data = await gameApi.chatWithAI(chatParams); // 使用封装的 API
      console.log("API返回的原始数据:", data);

      if (data.usage) {
        console.log("Token使用情况:", data.usage);
        if (data.usage.completion_tokens >= 3900) {
          console.warn("警告：响应接近token限制，可能被截断");
        }
      }

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('AI返回数据格式错误：缺少choices或message字段');
      }

      contentString = data.choices[0].message.content; // 在这里赋值
      console.log("AI返回的原始内容:", contentString);

      if (!contentString || contentString.trim() === '') {
        throw new Error('AI返回的内容为空');
      }

      // 尝试提取JSON代码块
      const match = contentString.match(/```json\s*([\s\S]*?)\s*```/); // 修复了这里的正则表达式，确保匹配的是```json```块
      if (match) {
        contentString = match[1];
        console.log("提取的JSON内容:", contentString);
      }

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

      // 验证必需字段并提供默认值
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

      return content;

    } catch (e) {
      console.error("JSON解析失败或API调用失败:", e);
      // contentString 现在在 try...catch 外部声明，所以在这里可以访问
      console.error("尝试解析的内容:", contentString);

      let extractedText = "抱歉，AI响应解析失败。你发现自己站在一个神秘的地方，周围云雾缭绕，似乎有无数的可能性等待着你去探索。";
      const textMatch = (contentString || '').match(/"text":\s*"([^"]*(?:\\.[^"]*)*)/);
      if (textMatch && textMatch[1]) {
        extractedText = textMatch[1].replace(/\\"/g, '"').replace(/\n/g, '\n');
        console.log("从截断的JSON中提取到文本:", extractedText);
      }

      // 抛出错误，让调用者捕获并处理
      throw {
        message: `冒险生成失败: ${e.message}`,
        details: e,
        fallbackContent: {
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
        }
      };
    }
  },

  // 生成长时记忆
  async generateLongTermMemory(logsToSummarize, model) {
    if (logsToSummarize.length === 0) {
      return null;
    }

    console.log("开始生成长时记忆------");
    const logText = logsToSummarize.map(log => `回合 ${log.turn}: ${log.entry}`).join('\n');

    const summaryPrompt = `请总结以下游戏事件日志，提炼出关键情节、玩家的重大决策和故事走向，内容需简洁明了，限制在100字以内。\n\n日志内容:\n${logText}`;

    const summaryParams = {
      prompt: summaryPrompt,
      model: model
    };

    try {
      const summaryRes = await gameApi.chatWithAI(summaryParams); // 使用封装的 API
      console.log("[总结AI-API响应]:", summaryRes);

      if (!summaryRes || !summaryRes.choices || !summaryRes.choices[0] || !summaryRes.choices[0].message || !summaryRes.choices[0].message.content) {
        console.error("API返回结构异常: 缺少必要字段", summaryRes);
        throw new Error("AI返回数据格式不正确或缺少必要字段");
      }

      const content = summaryRes.choices[0].message.content;
      if (typeof content !== 'string') {
        console.error("API返回的content不是字符串:", content);
        throw new Error("AI返回的content不是有效的JSON字符串");
      }

      let parsedContent;
      try {
        parsedContent = JSON.parse(content);
      } catch (jsonError) {
        console.warn("解析content中的JSON时出错，可能不是严格JSON，尝试直接使用内容:", jsonError, "原始content:", content);
        parsedContent = content; // 如果不是JSON，直接使用字符串内容
      }

      // 返回总结内容，可以是JSON对象或字符串
      return parsedContent.summary || parsedContent;

    } catch (error) {
      console.error("生成长时记忆时发生错误:", error);
      throw error; // 向上抛出错误
    }
  },

  // 游戏结局处理
  async endGameByTurnLimit(gameState, currentStoryText, longTermMemory, maxGameTurns, model) {
    // 格式化记忆
    const formattedLongTermMemory = MEMORY_FORMAT.longTerm(longTermMemory);
    const formattedShortTermMemory = MEMORY_FORMAT.shortTerm(gameState.adventureLog.slice(-maxGameTurns)); // 只总结最后几回合

    // 准备模板数据
    const templateData = {
      turn: gameState.turn,
      longTermMemory: formattedLongTermMemory,
      shortTermMemory: formattedShortTermMemory,
      identity: gameState.identity,
      level: gameState.level,
      age: gameState.age,
      health: gameState.health,
      maxHealth: gameState.maxHealth,
      attack: gameState.attack,
      defense: gameState.defense,
      agility: gameState.agility,
      charm: gameState.charm,
      coins: gameState.coins,
      reputation: gameState.reputation,
      skills: (gameState.skills && gameState.skills.length > 0)
        ? gameState.skills.map(s => s.name).join('; ')
        : DEFAULT_VALUES.skills,
      items: (gameState.items && gameState.items.length > 0)
        ? gameState.items.map(i => `${i.name} x${i.count}`).join('; ')
        : DEFAULT_VALUES.items,
      achievements: (gameState.achievements && gameState.achievements.length > 0)
        ? gameState.achievements.filter(a => a.unlocked).map(a => a.id).join('; ')
        : DEFAULT_VALUES.achievements,
      storySnippet: currentStoryText.slice(-250)
    };

    // 生成最终提示词
    const finalPrompt = Object.entries(templateData).reduce(
      (str, [key, value]) => str.replace(`{${key}}`, value), // 修复了这里的模板字符串语法
      END_PROMPT_TEMPLATE
    );

    console.log(ERROR_MESSAGES.LOADING);

    try {
      const params = { prompt: finalPrompt, model: model };
      const res = await gameApi.chatWithAI(params); // 使用封装的 API
      console.log("结局原始响应 (res):", res);

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

      // 移除可能存在的外部引号
      if (finalStoryText.startsWith('"') && finalStoryText.endsWith('"')) {
        finalStoryText = finalStoryText.slice(1, -1);
      }

      console.log("游戏结局:", finalStoryText);
      return finalStoryText;

    } catch (error) {
      console.error("生成游戏结局时发生错误:", error);
      throw {
        message: ERROR_MESSAGES.AI_FAILED,
        details: error
      };
    }
  }
};