
import { defaultUserInfos } from '@/configs/default_user.js';
import { SCRIPTS } from '@/configs/scripts.js';

const createDefaultGameState = () => {

    //随机生成性别
    const genders = ['男生', '女生'];
    const gengerIndex = Math.floor(Math.random() * genders.length);

    // 随机选择一个剧本
    const randomIndex = Math.floor(Math.random() * SCRIPTS.length);
    const selectedScript = SCRIPTS[randomIndex];

    return {
        gameState: {
            ...defaultUserInfos,
            script: selectedScript.name,
            gender: genders[gengerIndex],
        },
        currentStoryText: `梦中，你曾步入不属于此世的浮影幻境。金属凌空，光潮如织，千机百匠争鸣于天穹之上——那是未来的长梦，绚丽若星海倒悬，遥远得仿佛从未存在于人间。而今梦醒，眼前却是苍黄天色与暮霭沉沉，一盏残灯在茅屋一隅如豆颤抖，微光投在粗砺土墙，仿佛诉说着旧时残梦；寒风透过残窗，掀起你身上的布衣，也拂动角落那张泛黄的兵符，墨迹斑驳，却仍难掩其戾气。战火尚未逼近，耳畔却已鼓角隐约、杀意潜流；山河虽仍静卧，万象之下早藏风雷。你知晓，这并非幻象之残留，而是命运真切的回响。你已踏入这名为【汉末·往昔之影】的乱世尘世之中。天道崩离，苍生困苦。或为贩夫走卒，亦能谋局天下；或为无名之徒，亦敢搏命书史。此刻你所处的时间节点是：【${selectedScript.name}】，你是【${genders[gengerIndex]}】。一道来自幽深时空的低语在你识海回荡，像是千年风雪中传来的神谕，低沉、古老，却不可抗拒：“此乃天命所归，亦是汝之抉择。”此身既至，便无回头路。抬眼，是命数交错之途；执笔，是将军落子之前。现在——选择你的出身，绘你的山河，写你的传奇，走向命运深处的长风浩歌。`,
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

export { createDefaultGameState };