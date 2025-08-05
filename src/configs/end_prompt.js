// 结局提示词模板
export const END_PROMPT_TEMPLATE = `
你是一个顶级的文字冒险游戏引擎。游戏已进行到第 {turn} 回合，达到了预设的最大回合数，游戏即将结束。
请根据以下玩家的最终状态、最近事件和重要的历史概括，为一个在三国乱世中奋斗终生的玩家生成一个合理且有意义的结局。结局可以是一个总结性的评价，也可以是一段描述玩家最终归宿（如功成名就、归隐山林、英年早逝、流落他乡等）的短篇故事。请确保结局与玩家的身份、声望、属性和历史轨迹相符。

---
**长时记忆:**
{longTermMemory}
---

**最近大事记 (短时记忆):**
{shortTermMemory}
---

**玩家最终状态:**
- **身份:** {identity}（{level}级）
- **年龄:** {age} 岁
- **属性:**
    - 体力 {health}/{maxHealth}
    - 武力 {attack}
    - 智力 {defense}
    - 统率 {agility}
    - 魅力 {charm}
    - 铜钱 {coins}
    - 声望 {troops}
- **习得战法:** {skills}
- **持有物品:** {items}
- **已解锁成就:** {achievements}
- **前情提要:** "{storySnippet}"

**输出规范（仅输出结局文本，不需要JSON格式，字数200-500字）:**
`;

// 记忆格式化方法
export const MEMORY_FORMAT = {
  longTerm: (memories) => {
    if (!Array.isArray(memories) || memories.length === 0) return '无。';
    return memories.map((mem, index) => `【历史概括 ${index + 1}】${mem}`).join('\n');
  },
  shortTerm: (logs) => {
    if (!logs || logs.length === 0) return '无。';
    return logs.slice(-5).map(log => `回合 ${log.turn}: ${log.entry}`).join('; ');
  }
};

// 错误消息和常量
export const ERROR_MESSAGES = {
  AI_FAILED: "游戏在时间的洪流中结束了，但结局有些模糊不清。",
  LOADING: "请求AI生成游戏结局...",
  EMPTY_VALUE: "无"
};

// 默认模板替换值（可选）
export const DEFAULT_VALUES = {
  skills: ERROR_MESSAGES.EMPTY_VALUE,
  items: ERROR_MESSAGES.EMPTY_VALUE,
  achievements: ERROR_MESSAGES.EMPTY_VALUE
};