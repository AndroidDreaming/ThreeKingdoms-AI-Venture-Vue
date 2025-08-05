// 默认角色信息
const defaultUserInfos = {
    name: '无名小卒',
    identity: '布衣',
    faction: null,
    health: 100,
    maxHealth: 100,
    attack: 5,
    defense: 5,
    agility: 5,
    charm: 5,
    coins: 50,
    troops: 0,
    level: 1,
    skills: [
        {
            name: "基础拳法",
            description: "基本武学招式，近身战斗时发挥作用",
            icon: "fa-solid fa-hand-fist"
        },
        {
            name: "凝神静气",
            description: "冷静心思",
            icon: "fa-solid fa-wind"
        }
    ],
    items: [],
    achievements: [
        // 基础功绩
        { id: 'first_choice', text: '初入乱世: 做出你的人生抉择', unlocked: false },
        { id: 'first_battle', text: '初试刀兵: 第一次亲临沙场', unlocked: false },
        { id: 'first_victory', text: '首战告捷: 赢得第一场小规模胜利', unlocked: false },
        { id: 'breakthrough_qi', text: '崭露头角: 在郡县乡里获得一定名声', unlocked: false },
        { id: 'breakthrough_foundation', text: '一方豪强: 成功占领一县之地或聚拢一批追随者', unlocked: false },

        // 探索与机遇
        { id: 'found_hidden_cave', text: '奇遇迭出: 发现一处隐秘的洞窟，内藏珍稀宝物', unlocked: false },
        { id: 'found_ancient_ruin', text: '寻访古迹: 深入人迹罕至之地，发现一处荒废的古战场或前朝遗址', unlocked: false },
        { id: 'met_mysterious_master', text: '三顾茅庐: 发现并成功招募到一位隐世不出的贤才', unlocked: false },
        { id: 'survive_miasma_swamp', text: '化险为夷: 成功穿越危机四伏的山岭或沼泽地带', unlocked: false },

        // 财富与资历
        { id: 'first_spirit_treasure', text: '得遇良驹: 获得一匹千里马或一件稀世兵器', unlocked: false },
        { id: 'rich_man', text: '富可敌国: 聚拢大量钱粮，足以支撑一支军队', unlocked: false },
        { id: 'master_alchemist', text: '军需官: 精通军备生产或伤药制作', unlocked: false },
        { id: 'spirit_stone_collector', text: '屯田能手: 成功开发三处不同类型的富饶土地', unlocked: false },

        // 战斗与策略
        { id: 'flawless_victory', text: '兵不血刃: 在不损一兵一卒的情况下赢得一场胜利', unlocked: false },
        { id: 'slay_demon_beast', text: '阵斩敌将: 在万军之中斩杀敌方主将', unlocked: false },
        { id: 'master_of_spells', text: '运筹帷幄: 成功策划并实施一项扭转战局的计谋', unlocked: false },
        { id: 'survived_ambush', text: '突出重围: 在敌军的重重包围中全身而退', unlocked: false },
        { id: 'first_skill', text: '学有所成: 掌握一项实用的武艺或治国方略', unlocked: false },
        { id: 'skill_master', text: '百艺精通: 掌握五种不同的军政或民生技能', unlocked: false },
        { id: 'sword_master', text: '万人敌: 个人武艺达到超凡入圣的境界', unlocked: false },
        { id: 'spell_caster', text: '兵法大家: 精通《孙子兵法》等兵书，能布下精妙阵型', unlocked: false },

        // 社交与声望
        { id: 'high_reputation', text: '威震一方: 在郡县乃至州域内建立崇高威望', unlocked: false },
        { id: 'sect_elder', text: '拜将入相: 受到一方诸侯重用，身居高位', unlocked: false },
        { id: 'dao_companion', text: '喜结良缘: 与一位世家女子或贤良淑女结为连理', unlocked: false },
        { id: 'peacemaker', text: '以德服人: 成功调解两大世家或地方势力间的纷争', unlocked: false },

        // 特殊与隐藏
        { id: 'defy_heavenly_tribulation', text: '力挽狂澜: 在大厦将倾之际，力保社稷不失', unlocked: false },
        { id: 'ancient_bloodline', text: '昭烈遗志: 继承或光复了衰落的汉室血脉', unlocked: false },
        { id: 'uncovered_conspiracy', text: '拨乱反正: 发现并瓦解了一个颠覆朝纲的巨大阴谋', unlocked: false }
    ],
    adventureLog: [],
    turn: 0,
    currentScene: "start"
};

export {
    defaultUserInfos
}