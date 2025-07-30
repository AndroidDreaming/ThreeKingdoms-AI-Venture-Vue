# sanguo_ai

> sanguo ai game

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).


# ThreeKingdoms-AI-Venture-Vue

🎮 一款基于 Vue 重构的事件驱动型三国人生模拟游戏。你将从布衣起步，穿梭于乱世之中，结交名士，投身战场，亦或隐于田园。每一个选择，塑造独属于你的三国人生。

---

## 🧭 核心玩法原则

### 🌪️ 事件驱动叙事
- 聚焦真实、具体的战役、谋略、人物冲突、关系演变。
- 每段文本都推动剧情发展，严禁空洞引导或废话叙述。

### 🔁 循环打破机制（Loop Breaker）
- 自动识别剧情死循环（如反复围城）并强制推进大事件（援军到达、敌军内讧等）。
- 鼓励玩家跳出困局，推进人生与局势新阶段。

### 🧱 结构化游戏状态
- 所有状态与文本严格以 JSON 输出，方便前后端协作、AI 驱动剧情。

---

## 🧬 游戏系统概览

### 🎭 玩家属性体系
| 属性     | 说明 |
|----------|------|
| 体力 (Health) | 战斗与特殊事件消耗，上限100 |
| 武力 (Attack) | 决定战斗胜负 |
| 智力 (Defense) | 影响谋略成功率 |
| 统率 (Agility) | 军队调度、速度、追击逃脱 |
| 魅力 (Charm) | 招募人才、外交谈判 |
| 铜钱 (Coins) | 基础资源，用于建设与交易 |
| 声望 (Reputation) | 解锁高阶剧情与人脉资源 |
| 身份 (Identity) | 玩家社会地位，如布衣、县尉、州牧、丞相等 |

### 📆 人生阶段与回合系统
- 每回合代表一年，随年龄进入不同阶段（童年、少年、壮年、盛年、老年）。
- 年龄影响事件类型与可触发系统。

### 📚 六大系统路线
- **争雄**（军事线）
- **谋国**（内政线）
- **纵横**（外交线）
- **世家**（宗族线）
- **庶民**（民生线）
- **情感羁绊**（友情/爱情线）

---

## 🧠 技术与架构

- 🎨 前端：`Vue 3` + `Pinia` 状态管理
- 📜 输出格式：严格结构化 JSON，便于 AI 整合（ChatGPT、LLM等）
- 🎮 数据驱动：所有剧情、属性、事件处理由数据层驱动
- 💬 多模态支持：每段文本伴随 image prompt 可用于 AI 绘图（如 DALL·E / MJ）

---

## 🗃️ 示例输出格式

```json
{
  "text": "曹操军马突至濮阳，你潜伏城内，接到命令发动内应。城门若开，将是一场腥风血雨。",
  "imagePrompt": "Traditional Chinese painting, Three Kingdoms period, night raid, soldiers opening gate, fire and chaos",
  "choices": [
    {"text": "火烧军营，混乱中突围", "target": "action_fire_attack"},
    {"text": "假装响应，反手劫杀敌将", "target": "action_betrayal"},
    {"text": "暂避锋芒，等待援军", "target": "action_hide"}
  ],
  "gameState": {
    "health": 80,
    "attack": 7,
    "defense": 6,
    "agility": 5,
    "charm": 4,
    "coins": 150,
    "reputation": 20,
    "identity": "县尉",
    "skills": [{"name": "火攻", "description": "引燃敌营造成混乱", "icon": "fa-solid fa-fire"}],
    "items": ["引火油", "夜行衣"],
    "achievements": [{"id": "first_battle", "unlocked": true}]
  },
  "itemUpdates": {"add": ["火攻秘策"], "remove": []},
  "unlockAchievements": ["city_gate_heist"],
  "logEntry": "夜袭濮阳"
}

