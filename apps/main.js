import fs from 'fs';
import path from 'path';
import common from "../../../lib/common/common.js";
import plugin from "../../../lib/plugins/plugin.js";
//import segment from '../../../lib/plugins/segment.js';

export class randomArknights extends plugin {
    constructor() {
        super({
            name: '明日方舟随机干员',
            dsc: '随机生成明日方舟干员转生配置',
            event: 'message',
            priority: 1,
            rule: [
                {
                    reg: /^(#|\/)?随机干员$/,
                    fnc: 'randomOperator'
                }
            ]
        });
        
        // 获取插件根目录路径
        this.pluginRoot = path.join(process.cwd(), 'plugins/random-arknights/');
        
        // 初始化数据路径
        this.dataPath = path.join(this.pluginRoot, 'data/');
        this.rangesPath = path.join(this.dataPath, 'ranges/');
        
        // 确保目录存在
        this.ensureDirectoryExists(this.rangesPath);
    }

    async randomOperator(e) {
        try {
            // 读取JSON数据文件
            const talents = await this.readJSON('talents.json');
            const skills = await this.readJSON('skills.json');
            const negatives = await this.readJSON('negatives.json');
            
            const positions = ['近战位干员', '远程位干员', '全部位干员'];
            const branch = [
                '击杀敌人后获得1点部署费用，撤退时返还初始部署费用',
                '能够阻挡两个敌人',
                '可以在攻击范围内选择一次战术点来召唤援军，自身攻击援军阻挡的敌人时攻击力提升至150%',
                '技能发动期间阻挡数变为0',
                '再部署时间减少，可使用远程攻击，首次再部署时间-50%',
                '能够阻挡两个敌人，可以支援待部署区的我方单位',
                '同时攻击阻挡的所有敌人',
                '能够阻挡一个敌人',
                '攻击造成法术伤害',
                '可以攻击到较远敌人，攻击自身未阻挡的敌人时攻击力提升至120%',
                '可以进行远程攻击，但此时攻击力降低至80%',
                '普通攻击连续造成两次伤害',
                '不成为其他角色的治疗目标，每次攻击到敌人后回复自身70生命',
                '无法被友方角色治疗，攻击造成群体伤害，每攻击到一个敌人回复自身50生命，最大生效数等于阻挡数',
                '通常不攻击且阻挡数为0，技能未开启时40秒内攻击力逐渐提升至最高+200%且技能结束时重置攻击力',
                '攻击使目标周围的其他敌人受到相当于攻击力50%的群体物理伤害',
                '能够阻挡两个敌人，可以造成元素伤害',
                '能够阻挡三个敌人',
                '能够阻挡四个敌人',
                '技能可以治疗友方单位',
                '无法被友方角色治疗',
                '技能开启时普通攻击会造成法术伤害',
                '只有阻挡敌人时才能够回复技力',
                '不阻挡敌人时优先远程群体物理攻击',
                '能够阻挡三个敌人，可以进行远程攻击',
                '能够阻挡三个敌人，可以造成元素损伤',
                '优先攻击空中单位',
                '高精度的近距离射击',
                '攻击造成群体物理伤害',
                '优先攻击攻击范围内防御力最低的敌方单位',
                '优先攻击攻击范围内法术抗性最低的敌方单位',
                '攻击范围内的所有敌人，对自己前方一横排的敌人攻击力提升至150%',
                '优先攻击重量最重的敌人，攻击重量>3的敌人攻击力提升至115%',
                '攻击对小范围的地面敌人造成3次物理伤害（后2次为余震，伤害降低至攻击力的一半）',
                '攻击时需要消耗子弹且攻击力提升至120%，不攻击时会缓慢地装填子弹（最多8发）',
                '持有回旋投射物时才能够攻击（投射物需要时间回收）',
                '攻击造成群体法术伤害',
                '操作浮游单元造成法术伤害，单元攻击同一敌人伤害提升（最高造成干员115%攻击力的伤害）',
                '攻击造成法术伤害，在找不到攻击目标时可以将攻击能量储存起来之后一齐发射（最多4个）',
                '攻击造成法术伤害，且会在4个敌人间跳跃，每次跳跃伤害降低15%并造成短暂停顿',
                '攻击造成超远距离的群体法术伤害',
                '攻击造成法术伤害，可以造成元素伤害',
                '攻击造成法术伤害，可以通过击倒敌人生成召唤物，可攻击到自身召唤物阻挡的敌人',
                '恢复友方单位生命',
                '同时恢复4个友方单位的生命',
                '拥有较大治疗范围，但在治疗较远目标时治疗量变为80%',
                '恢复友方单位生命，并回复相当于攻击力50%的元素损伤（可以回复未受伤友方单位的元素损伤）',
                '攻击造成法术伤害，攻击敌人时为攻击范围内一名友方干员治疗相当于50%伤害的生命值',
                '恢复友方单位生命，且会在3个友方单位间跳跃，每次跳跃治疗量降低25%',
                '攻击造成法术伤害，并对敌人造成短暂的停顿',
                '不攻击，持续恢复范围内所有友军生命（每秒相当于自身攻击力10%的生命），自身不受鼓舞影响',
                '攻击对2个目标造成法术伤害，技能开启后改为治疗2个友方单位（治疗量相当于75%攻击力）',
                '可以使用召唤物协助作战',
                '能够阻挡两个敌人，使用<支援装置>协助作战',
                '攻击造成法术伤害，可以造成元素损伤',
                '再部署时间大幅度减少',
                '不进行攻击，且不受部署数量限制，但再部署时间极长',
                '对攻击范围内所有敌人造成伤害，拥有50%的物理和法术闪避且不容易成为敌人的攻击目标',
                '技能可以使敌人产生位移',
                '可以使用陷阱来协助作战，但陷阱无法放置于敌人已在的格子中',
                '受到致命伤时不撤退，切换成<替身>作战（替身阻挡数为0），持续20秒后自身再次替换<替身>',
                '可以投掷炼金单元协助作战',
                '技能期间起飞，起飞后能够阻挡2个飞行敌人'
            ];
            
            // 随机选择
            const randomTalent = talents[Math.floor(Math.random() * talents.length)];
            const randomSkill = skills[Math.floor(Math.random() * skills.length)];
            const randomNegative = negatives[Math.floor(Math.random() * negatives.length)];
            const randomPosition = positions[Math.floor(Math.random() * positions.length)];
            const randombranch = branch[Math.floor(Math.random() * branch.length)];
            // 获取攻击范围图片
            const rangeImage = await this.getRandomRangeImage();
            
            // 构建消息数组（转发消息格式）
            const msgArr = [];
            
            msgArr.push("🚀 明日方舟干员转生成果：");
            msgArr.push("=".repeat(20));
            
            // 添加部位部分
            msgArr.push("你是：");
            msgArr.push(randomPosition);
            
            // 添加分支部分
            msgArr.push("你的分支特性是：");
            msgArr.push(randombranch);

            // 添加攻击范围部分
            msgArr.push("🎯 你的攻击范围是：");
            msgArr.push(rangeImage);
            
            // 添加天赋部分
            msgArr.push("✨ 你的天赋是：");
            msgArr.push(randomTalent);
            
            // 添加技能部分
            msgArr.push("⚡ 你的技能是：");
            msgArr.push(randomSkill);
            
            // 添加负面效果部分
            msgArr.push("⚠️ 但是：");
            msgArr.push(randomNegative);
            
            // 生成转发消息
            const forwardMsg = await common.makeForwardMsg(e, msgArr, "明日方舟干员转生系统");
            
            // 发送消息
            await e.reply(forwardMsg);
            
        } catch (error) {
            logger.error('随机干员生成失败:', error);
            await e.reply("生成干员信息时出现错误，请检查数据文件是否存在。");
        }
    }

    // 读取JSON文件
    async readJSON(filename) {
        const filePath = path.join(this.dataPath, filename);
        
        if (!fs.existsSync(filePath)) {
            // 如果文件不存在，创建默认数据文件
            await this.createDefaultJSON(filePath, filename);
        }
        
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    }

    // 创建默认JSON数据文件
    async createDefaultJSON(filePath, filename) {
        const defaultData = {
            'talents.json': [
                "攻击造成法术伤害",
                "攻击回复自身生命",
                "每次攻击有10%概率眩晕敌人2秒",
                "攻击时无视敌人20%防御",
                "部署后使周围友军攻击力+15%",
                "受到攻击时反击造成200%攻击力的法术伤害",
                "击杀敌人后攻击速度+50，持续5秒"
            ],
            'skills.json': [
                "技能开启时，攻击力+100%，攻击范围扩大",
                "技能持续时间内，每秒治疗周围友军",
                "部署后立即对范围内所有敌人造成500%攻击力的伤害",
                "技能开启后获得物理和法术闪避",
                "召唤一个可部署的单位协助作战",
                "对目标区域进行持续轰炸，每秒造成200%攻击力的伤害"
            ],
            'negatives.json': [
                "部署费用+5",
                "攻击速度-30",
                "无法被治疗",
                "防御力-50%",
                "受到的法术伤害+30%",
                "再部署时间+50%",
                "攻击范围缩小"
            ]
        };
        
        const data = defaultData[filename] || [];
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        logger.mark(`已创建默认数据文件: ${filename}`);
        
        return data;
    }

    // 随机获取攻击范围图片
    async getRandomRangeImage() {
        try {
            // 确保目录存在
            if (!fs.existsSync(this.rangesPath)) {
                fs.mkdirSync(this.rangesPath, { recursive: true });
                logger.mark(`已创建攻击范围图片目录: ${this.rangesPath}`);
                return "[暂无攻击范围图片，请在data/ranges目录中添加图片]";
            }
            
            // 读取范围图片目录
            const files = fs.readdirSync(this.rangesPath)
                .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file));
            
            if (files.length === 0) {
                logger.warn('未找到攻击范围图片，请在data/ranges目录中添加图片');
                return "[暂无攻击范围图片，请在data/ranges目录中添加图片]";
            }
            
            // 随机选择一张图片
            const randomFile = files[Math.floor(Math.random() * files.length)];
            const imagePath = path.join(this.rangesPath, randomFile);
            
            // 返回图片segment
            return segment.image(`file://${imagePath}`);
            
        } catch (error) {
            logger.error('读取攻击范围图片失败:', error);
            return "[攻击范围图片加载失败]";
        }
    }

    // 确保目录存在
    ensureDirectoryExists(dirPath) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
            logger.mark(`已创建目录: ${dirPath}`);
        }
    }
}