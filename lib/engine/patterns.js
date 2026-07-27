/**
 * 紫微斗数格局检测模块
 * 检测命盘中的各种格局
 */

import { PALACE_NAMES, MAJOR_14, DARK_PAIR } from './config.js';

const SHA_SET = new Set(["擎羊", "陀罗", "火星", "铃星", "地空", "地劫"]);
const KILL_OR_LOSS_SET = new Set(["天空", "地空", "旬空", "小耗", "大耗", "地劫"]);
const RESTRAINT_SET = new Set(["擎羊", "陀罗", "天刑", "阴煞"]);

// 格局定义
const PATTERN_COPY = {
  junchen_qinghui_A: { group: "富贵格", title: "君臣庆会A", blurb: "紫破同宫，左右辅弼分拱，主位与辅佐齐备，利权位与统筹。" },
  junchen_qinghui_B: { group: "富贵格", title: "君臣庆会B", blurb: "紫微天相坐命，命迁分见昌曲，科名与口碑相应，利名望与制度。" },
  junchen_qinghui_C: { group: "富贵格", title: "君臣庆会C", blurb: "天府坐命，左右会机梁与同阴，主从分明，资源稳健。" },
  zifu_tonggong: { group: "富贵格", title: "紫府同宫", blurb: "紫微天府同宫，统筹与守成并见，利大平台与稳态经营。" },
  jixiang_liming: { group: "富贵格", title: "极向离明", blurb: "紫微在午会清局，权名昭著，忌三方煞忌冲破。" },

  big5_shapolang: { group: "五大格局", title: "杀破狼格", blurb: "动中求变、攻坚突破，宜开拓与竞技，忌情绪化对撞。" },
  big5_fuxiang: { group: "五大格局", title: "府相格", blurb: "稳重守成、执行见长，宜大组织内管控配合，稳中求进。" },
  big5_jiyue_tongliang: { group: "五大格局", title: "机月同梁格", blurb: "温和细致、专业匠心，按部就班，宜稳定岗位或自由才艺线。" },
  big5_ziwulian_fuxiang: { group: "五大格局", title: "紫武廉府相", blurb: "统筹驾驭与稳重并存，能主导亦能配合，宜高阶管理/政务统筹。" },
  big5_ziwulian_shapolang: { group: "五大格局", title: "紫武廉杀破狼", blurb: "能文能武、敢战能守，宜阶段化目标与护城河建设稳态推进。" },

  huotan: { group: "爆发格", title: "火贪", blurb: "贪狼会火，果敢激进，宜冲锋开拓，忌躁进损耗。" },
  lingtan: { group: "爆发格", title: "铃贪", blurb: "贪狼会铃，灵敏多变，宜创意试错，注意节奏与稳定。" },
  huo_or_ling_tan_weak: { group: "爆发格", title: "火/铃贪（弱）", blurb: "贪狼与火/铃三方会，动能较弱，适合阶段性试点。" },

  shapolang: { group: "事业格", title: "杀破狼", blurb: "变动开拓加速，适合攻坚重构，需制度化控险。" },
  yangliang_changlu: { group: "事业格", title: "阳梁昌禄", blurb: "名位俱隆，有制度与文书背书，利晋升与公开场域。" },
  qisha_chaodou: { group: "事业格", title: "七杀朝斗", blurb: "七杀坐命（子午寅申），锋锐果断，宜攻坚突破与执法军警线。" },
  yingxing_rumiao: { group: "事业格", title: "英星入庙", blurb: "破军坐命（子/午），变革重来，宜重构升级，忌反复与冲毁。" },

  sanqi_jiahui: { group: "财禄格", title: "三奇加会", blurb: "禄权科齐聚，资源/权责/名望共振，利关键节点。" },
  luma_jiaochi: { group: "财禄格", title: "禄马交驰", blurb: "俸禄与机动并举，利财务流转与外勤奔走。" },
  luhe_yuanyang: { group: "财禄格", title: "禄合鸳鸯", blurb: "禄存同宫化禄，财源并合，利俸禄加成与回报兑现。" },
  shuanglu_chaoyuan: { group: "四化格局", title: "双禄朝垣", blurb: "三方四正会照禄存与化禄，财运亨通，尤利财官两宫。" },

  zuoyou_jiaming: { group: "辅助格", title: "左右夹命", blurb: "左右夹命，内外助力相随，宜发挥主位统筹。" },
  kuiyue_jiaming: { group: "辅助格", title: "魁钺夹命", blurb: "魁钺夹命，贵气与解题并见，利关键节点获提携。" },

  liangma_piaodang: { group: "负面格", title: "梁马飘荡", blurb: "奔波不定、聚少散多，适合短期流动项目，避免长期绑定。" },
  lu_feng_chongpo: { group: "四化格局", title: "禄逢冲破", blurb: "化禄遭空劫夹破或对宫化忌冲照，先得后失，虚发易破。" },

  ziwei_duzuo: { group: "基本盘", title: "紫微独坐", blurb: "帝星独座（子/午），自尊独立，午位更显庙势与统筹感。" },
  baiguan_chaogong: { group: "基本盘", title: "百官朝拱", blurb: "紫微坐命，三方成对吉星齐集（≥3对），贵气与援助俱足。" },
  zaiye_goujun: { group: "基本盘", title: "在野孤君", blurb: "紫微坐命，三方少吉亦无煞，清高独行，需自建体系。" },
  wudao_zhijun: { group: "基本盘", title: "无道之君", blurb: "紫微坐命，三方见煞/忌冲破，易骄矜误判，宜制衡控险。" },
  zipo_tonggong: { group: "基本盘", title: "紫破组合", blurb: "紫微+破军同宫（丑/未），先破后成，大器晚成，变革强。" },
  zitan_tonggong: { group: "基本盘", title: "紫贪组合", blurb: "紫微+贪狼同宫（卯/酉），欲望与权柄并行，需驾欲定边界。" },
  jiju_maoyou: { group: "基本盘", title: "极居卯酉", blurb: "紫贪同宫遇煞，贫贱之象加重，宜以三方吉化解。" },

  shizhong_yinyu: { group: "事业格", title: "石中隐玉", blurb: "巨门坐命（子/午），外拙内秀，守得住暗处方成大器。" },
  zhongshui_chaodong: { group: "事业格", title: "众水朝东", blurb: "破军+文曲同宫于寅/卯，文武兼备，利文创与策划。" },

  jinyu_fujia: { group: "富贵格", title: "金舆扶驾", blurb: "天府守命，左右见日月，内外辅佐兼备，名器加身。" },
  zifu_jiaming: { group: "富贵格", title: "紫府夹命", blurb: "命坐机月，左右夹紫府，谋定而后动，得贵佐助。" },

  luma_jiaochi_weak: { group: "财禄格", title: "禄马交驰（弱）", blurb: "禄存与天马对拱，财动在外，力度稍弱。" },
  luhe_yuanyang_weak: { group: "财禄格", title: "禄合鸳鸯（对拱）", blurb: "禄存与化禄对拱，财源互补，但力度弱于同宫。" },
  minglu_anlu: { group: "财禄格", title: "明禄暗禄", blurb: "命宫明禄，暗合宫亦见禄，明暗双禄互济。" },
  luma_peiyin: { group: "财禄格", title: "禄马佩印", blurb: "禄存+天马+天相同宫，财禄流动有印信护持。" },
  liangchong_huagai: { group: "财禄格", title: "两重华盖", blurb: "命宫禄存+化禄并遇空/劫，财来财去中见哲思。" },

  luma_jiaochi_hualu: { group: "四化格局", title: "禄马交驰（化禄）", blurb: "化禄遇天马，财动随行，异乡奔波中得财。" },
  luma_jiaochi_hualu_weak: { group: "四化格局", title: "禄马交驰（化禄，对拱）", blurb: "化禄与天马对拱，利外出求财，力度较弱。" },
  luma_jiaochi_hualu_tri: { group: "四化格局", title: "禄马交驰（化禄，三方）", blurb: "命三方会照化禄与天马，宜流动经营、远方拓财。" },
  shuanglu_chaoyuan_weak: { group: "四化格局", title: "双禄朝垣（宽）", blurb: "三方见双禄但有煞忌，财势受阻，宜保守运作。" },
  keming_anlu: { group: "四化格局", title: "科明暗禄", blurb: "命见化科；暗合宫见禄，名利暗通。" },
  lu_feng_chongpo_weak: { group: "四化格局", title: "禄逢冲破（宽）", blurb: "化禄同宫或单侧临空劫，财来财去，谨防破耗。" },

  fubi_gongzhu: { group: "辅助格", title: "辅弼拱主", blurb: "左右拱紫，贵人助力强，利平台位与对外形象。" },
  fubi_gongzhu_weak: { group: "辅助格", title: "辅弼拱主（弱）", blurb: "紫微坐命，三方会辅弼，贵人助力虽在但力度较弱。" },
  zuoyou_tonggong: { group: "辅助格", title: "左右同宫", blurb: "左辅右弼同宫，内外贵人齐聚，协调力强。" },
  fuxiang_chaoyuan: { group: "辅助格", title: "府相朝垣", blurb: "命空宫；官禄坐天府，财帛坐天相，守成有度。" },

  lushuai_makun: { group: "负面格", title: "禄衰马困", blurb: "运盘禄存遇耗/空/劫 + 天马遇煞/忌，财动受阻。" },
};

// 工具函数
function _left(i) { return (i - 1 + 12) % 12; }
function _right(i) { return (i + 1) % 12; }
function _opp(i) { return (i + 6) % 12; }

function buildMaps(chart, scope) {
  const palStars = {};
  const palMutagen = {};
  const nameToIdx = {};
  const idxToName = {};
  const idxToBranch = {};

  if (!scope) {
    for (let i = 0; i < 12; i++) {
      const palaceName = PALACE_NAMES[i];
      const palace = chart.palace(palaceName);

      nameToIdx[palace.name] = palace.index;
      idxToName[palace.index] = palace.name;
      idxToBranch[palace.index] = palace.earthlyBranch;

      const stars = new Set();
      const muts = new Set();

      for (const s of palace.majorStars || []) {
        stars.add(s.name);
        if (s.mutagen) muts.add(s.mutagen);
      }
      for (const s of palace.minorStars || []) {
        stars.add(s.name);
        if (s.mutagen) muts.add(s.mutagen);
      }
      for (const s of palace.adjectiveStars || []) {
        stars.add(s.name);
        if (s.mutagen) muts.add(s.mutagen);
      }

      palStars[palace.index] = stars;
      palMutagen[palace.index] = muts;
    }
  } else {
    for (let i = 0; i < 12; i++) {
      const palaceName = PALACE_NAMES[i];
      const palace = chart.palace(palaceName, scope);

      nameToIdx[palaceName] = palace.index;
      idxToName[palace.index] = palaceName;
      idxToBranch[palace.index] = palace.earthlyBranch;

      const stars = new Set();
      const muts = new Set();

      for (const s of palace.majorStars || []) {
        stars.add(s.name);
        if (s.mutagen) muts.add(s.mutagen);
      }
      for (const s of palace.minorStars || []) {
        stars.add(s.name);
        if (s.mutagen) muts.add(s.mutagen);
      }
      for (const s of palace.adjectiveStars || []) {
        stars.add(s.name);
        if (s.mutagen) muts.add(s.mutagen);
      }

      palStars[palace.index] = stars;
      palMutagen[palace.index] = muts;
    }
  }

  return { palStars, palMutagen, nameToIdx, idxToName, idxToBranch };
}

function starsIn(palStars, idx, stars) {
  const palaceStars = palStars[idx] || new Set();
  for (const star of stars) {
    if (!palaceStars.has(star)) return false;
  }
  return true;
}

function anyStarIn(palStars, idx, stars) {
  const palaceStars = palStars[idx] || new Set();
  for (const star of stars) {
    if (palaceStars.has(star)) return true;
  }
  return false;
}

function noShaJi(palStars, palMutagen, idxs) {
  for (const i of idxs) {
    const stars = palStars[i] || new Set();
    const muts = palMutagen[i] || new Set();
    for (const sha of SHA_SET) {
      if (stars.has(sha)) return false;
    }
    if (muts.has("忌")) return false;
  }
  return true;
}

function darkPairIndex(idxToBranch, i) {
  const br = idxToBranch[i];
  const pairBr = DARK_PAIR[br];
  if (!pairBr) return null;
  for (const [idx, b] of Object.entries(idxToBranch)) {
    if (b === pairBr) return parseInt(idx);
  }
  return null;
}

function hit(pid, strict, reason, involved = []) {
  const copy = PATTERN_COPY[pid];
  return {
    id: pid,
    strict: strict,
    reason: reason,
    involved: involved,
    title: copy?.title || pid,
    blurb: copy?.blurb || ""
  };
}

/**
 * 检测命盘格局
 * @param {Object} chart - iztro 星盘对象
 * @param {string} scope - 运限范围（可选）
 * @returns {Array} 检测到的格局列表
 */
export function detectPatterns(chart, scope = null) {
  const { palStars, palMutagen, nameToIdx, idxToName, idxToBranch } = buildMaps(chart, scope);

  const ret = [];

  const iMing = nameToIdx["命宫"];
  const iCai = nameToIdx["财帛"];
  const iGuan = nameToIdx["官禄"];
  const iQian = nameToIdx["迁移"];
  const iLeft = _left(iMing);
  const iRight = _right(iMing);
  const tri = [iMing, iCai, iGuan, iQian];
  const tri3 = [iMing, iCai, iGuan];

  // 紫微独坐
  const mingMajor = new Set([...(palStars[iMing] || new Set())].filter(s => MAJOR_14.has(s)));
  if (mingMajor.size === 1 && mingMajor.has("紫微") && ["子", "午"].includes(idxToBranch[iMing])) {
    ret.push(hit("ziwei_duzuo", true, `紫微独坐于${idxToBranch[iMing]}支`, ["命宫"]));
  }

  // 百官朝拱
  if ((palStars[iMing] || new Set()).has("紫微")) {
    const triUnion = new Set();
    for (const j of tri) for (const s of (palStars[j] || new Set())) triUnion.add(s);
    const pairSets = [
      new Set(["天魁", "天钺"]), new Set(["文昌", "文曲"]), new Set(["左辅", "右弼"]),
      new Set(["三台", "八座"]), new Set(["恩光", "天贵"]), new Set(["台辅", "封诰"]), new Set(["天官", "天福"])
    ];
    let pairCount = 0;
    for (const ps of pairSets) {
      let ok = true;
      for (const st of ps) if (!triUnion.has(st)) { ok = false; break; }
      if (ok) pairCount += 1;
    }
    if (pairCount >= 3) {
      ret.push(hit("baiguan_chaogong", true, `紫微坐命，三方四正成对吉星≥3对（实际${pairCount}对）`, ["命宫", "命/财/官/迁"]));
    }

    const goodSet = new Set(["天魁", "天钺", "文昌", "文曲", "左辅", "右弼", "三台", "八座", "恩光", "天贵", "台辅", "封诰", "天官", "天福"]);
    let hasGood = false;
    for (const j of tri) if ([...(palStars[j] || new Set())].some(s => goodSet.has(s))) { hasGood = true; break; }
    const hasShaOrJi = !noShaJi(palStars, palMutagen, tri);

    if (!hasGood && !hasShaOrJi) {
      ret.push(hit("zaiye_goujun", true, "紫微坐命，三方四正少吉亦无煞忌", ["命宫"]));
    }
    if (hasShaOrJi) {
      ret.push(hit("wudao_zhijun", true, "紫微坐命，三方四正见煞/忌冲破", ["命宫", "命/财/官/迁"]));
    }
  }

  // 紫破组合
  for (let i = 0; i < 12; i++) {
    if (starsIn(palStars, i, new Set(["紫微", "破军"])) && ["丑", "未"].includes(idxToBranch[i])) {
      ret.push(hit("zipo_tonggong", true, `${idxToName[i]}同宫紫微+破军`, [idxToName[i]]));
      break;
    }
  }

  // 紫贪组合
  for (let i = 0; i < 12; i++) {
    if (starsIn(palStars, i, new Set(["紫微", "贪狼"])) && ["卯", "酉"].includes(idxToBranch[i])) {
      ret.push(hit("zitan_tonggong", true, `${idxToName[i]}同宫紫微+贪狼`, [idxToName[i]]));
      // 极居卯酉：紫贪同宫遇煞
      if (!noShaJi(palStars, palMutagen, [i])) {
        ret.push(hit("jiju_maoyou", true, `紫贪同宫（${idxToBranch[i]}）遇煞忌`, [idxToName[i]]));
      }
      break;
    }
  }

  // 紫府同宫
  for (let i = 0; i < 12; i++) {
    if (starsIn(palStars, i, new Set(["紫微", "天府"]))) {
      ret.push(hit("zifu_tonggong", true, `${idxToName[i]}同宫见紫微+天府`, [idxToName[i]]));
      break;
    }
  }

  // 极向离明
  if ((palStars[iMing] || new Set()).has("紫微") && idxToBranch[iMing] === "午") {
    if (noShaJi(palStars, palMutagen, tri)) {
      ret.push(hit("jixiang_liming", true, "命宫紫微在午，三方无煞忌", ["命宫"]));
    }
  }

  // 火贪/铃贪
  if ((palStars[iMing] || new Set()).has("贪狼")) {
    if ((palStars[iMing] || new Set()).has("火星")) {
      ret.push(hit("huotan", true, "命宫同宫：贪狼+火星", ["命宫"]));
    } else if ((palStars[iMing] || new Set()).has("铃星")) {
      ret.push(hit("lingtan", true, "命宫同宫：贪狼+铃星", ["命宫"]));
    }
  }

  const triUnion = new Set();
  for (const j of tri) {
    for (const star of palStars[j] || []) {
      triUnion.add(star);
    }
  }

  if (triUnion.has("贪狼") && (triUnion.has("火星") || triUnion.has("铃星"))) {
    ret.push(hit("huo_or_ling_tan_weak", false, "命三方四正会照：贪+火/铃", ["命/财/官/迁"]));
  }

  // 杀破狼
  if (triUnion.has("七杀") && triUnion.has("破军") && triUnion.has("贪狼")) {
    ret.push(hit("shapolang", true, "命三方四正集齐：七杀/破军/贪狼", ["命/财/官/迁"]));
  }

  // 五大格局
  const tri3Union = new Set();
  for (const j of tri3) for (const s of (palStars[j] || new Set())) tri3Union.add(s);
  const tri3Major = new Set([...tri3Union].filter(s => MAJOR_14.has(s)));

  if (["七杀", "破军", "贪狼"].every(s => tri3Major.has(s))) {
    ret.push(hit("big5_shapolang", true, "命/财/官三宫主星包含：七杀、破军、贪狼", ["命宫", "财帛", "官禄"]));
  }

  const fuxiangSet = new Set(["天府", "天相"]);
  if (tri3Major.size > 0 && [...tri3Major].every(s => fuxiangSet.has(s))) {
    ret.push(hit("big5_fuxiang", true, "命/财/官三宫主星仅由天府/天相构成", ["命宫", "财帛", "官禄"]));
  }

  const jiyueSet = new Set(["天机", "太阴", "天同", "天梁"]);
  if (tri3Major.size >= 3 && [...tri3Major].every(s => jiyueSet.has(s))) {
    ret.push(hit("big5_jiyue_tongliang", true, "命/财/官三宫主星由天机/太阴/天同/天梁构成", ["命宫", "财帛", "官禄"]));
  }

  // 阳梁昌禄
  const need = new Set(["太阳", "天梁", "文昌", "禄存"]);
  let hasAll = true;
  for (const star of need) {
    if (!triUnion.has(star)) { hasAll = false; break; }
  }
  if (hasAll) {
    ret.push(hit("yangliang_changlu", true, "命三方四正集齐：日/梁/昌/禄", ["命/财/官/迁"]));
  }

  // 七杀朝斗
  if ((palStars[iMing] || new Set()).has("七杀") && ["子", "午", "寅", "申"].includes(idxToBranch[iMing])) {
    ret.push(hit("qisha_chaodou", true, `七杀坐命，命支=${idxToBranch[iMing]}`, ["命宫"]));
  }

  // 英星入庙
  if ((palStars[iMing] || new Set()).has("破军") && ["子", "午"].includes(idxToBranch[iMing])) {
    ret.push(hit("yingxing_rumiao", true, `破军坐命，命支=${idxToBranch[iMing]}`, ["命宫"]));
  }

  // 三奇加会
  const hasLu = tri.some(j => palMutagen[j] && palMutagen[j].has("禄"));
  const hasQuan = tri.some(j => palMutagen[j] && palMutagen[j].has("权"));
  const hasKe = tri.some(j => palMutagen[j] && palMutagen[j].has("科"));
  if (hasLu && hasQuan && hasKe) {
    ret.push(hit("sanqi_jiahui", true, "命三方四正见化禄/化权/化科", ["命/财/官/迁"]));
  }

  // 禄马交驰
  for (let i = 0; i < 12; i++) {
    if (starsIn(palStars, i, new Set(["禄存", "天马"]))) {
      ret.push(hit("luma_jiaochi", true, `${idxToName[i]}同宫禄存+天马`, [idxToName[i]]));
      break;
    }
  }

  // 禄马交驰（弱版，对拱）
  {
    let lumaFound = ret.some(p => p.id === "luma_jiaochi");
    if (!lumaFound) {
      for (let i = 0; i < 12; i++) {
        if ((palStars[i] || new Set()).has("禄存")) {
          const j = _opp(i);
          if ((palStars[j] || new Set()).has("天马")) {
            ret.push(hit("luma_jiaochi_weak", false, `${idxToName[i]}与对宫${idxToName[j]}禄/马对拱`, [idxToName[i], idxToName[j]]));
            break;
          }
        }
      }
    }
  }

  // 禄合鸳鸯
  {
    let luheFound = false;
    for (let i = 0; i < 12; i++) {
      if ((palStars[i] || new Set()).has("禄存") && (palMutagen[i] || new Set()).has("禄")) {
        ret.push(hit("luhe_yuanyang", true, `${idxToName[i]}同宫禄存+化禄`, [idxToName[i]]));
        luheFound = true;
        break;
      }
    }
    if (!luheFound) {
      for (let i = 0; i < 12; i++) {
        if ((palStars[i] || new Set()).has("禄存")) {
          const j = _opp(i);
          if ((palMutagen[j] || new Set()).has("禄")) {
            ret.push(hit("luhe_yuanyang_weak", false, `${idxToName[i]}禄存 对拱 ${idxToName[j]}化禄`, [idxToName[i], idxToName[j]]));
            break;
          }
        }
      }
    }
  }

  // 双禄朝垣
  const triHasLucun = tri.some(j => (palStars[j] || new Set()).has("禄存"));
  const triHasHualu = tri.some(j => (palMutagen[j] || new Set()).has("禄"));
  if (triHasLucun && triHasHualu) {
    if (noShaJi(palStars, palMutagen, tri)) {
      ret.push(hit("shuanglu_chaoyuan", true, "命三方四正会照：禄存与化禄，三方无煞忌", ["命/财/官/迁"]));
    } else {
      ret.push(hit("shuanglu_chaoyuan_weak", false, "命三方四正会照：禄存与化禄；但三方有煞忌", ["命/财/官/迁"]));
    }
  }

  // 左右夹命
  if (((palStars[iLeft] || new Set()).has("左辅") && (palStars[iRight] || new Set()).has("右弼")) ||
      ((palStars[iRight] || new Set()).has("左辅") && (palStars[iLeft] || new Set()).has("右弼"))) {
    ret.push(hit("zuoyou_jiaming", true, "左右邻宫分见左辅与右弼", ["左右邻宫"]));
  }

  // 魁钺夹命
  if (((palStars[iLeft] || new Set()).has("天魁") && (palStars[iRight] || new Set()).has("天钺")) ||
      ((palStars[iRight] || new Set()).has("天魁") && (palStars[iLeft] || new Set()).has("天钺"))) {
    ret.push(hit("kuiyue_jiaming", true, "左右邻宫分见天魁与天钺", ["左右邻宫"]));
  }

  // 梁马飘荡
  for (let i = 0; i < 12; i++) {
    if (starsIn(palStars, i, new Set(["天梁", "天马"]))) {
      ret.push(hit("liangma_piaodang", true, `${idxToName[i]}同宫天梁+天马`, [idxToName[i]]));
      break;
    }
  }

  // 石中隐玉
  if ((palStars[iMing] || new Set()).has("巨门") && ["子", "午"].includes(idxToBranch[iMing])) {
    ret.push(hit("shizhong_yinyu", true, `巨门坐命，命支=${idxToBranch[iMing]}`, ["命宫"]));
  }

  // 众水朝东
  for (let i = 0; i < 12; i++) {
    if (starsIn(palStars, i, new Set(["破军", "文曲"])) && ["寅", "卯"].includes(idxToBranch[i])) {
      ret.push(hit("zhongshui_chaodong", true, `${idxToName[i]}同宫破军+文曲，支=${idxToBranch[i]}`, [idxToName[i]]));
      break;
    }
  }

  // 金舆扶驾
  if ((palStars[iMing] || new Set()).has("天府")) {
    const leftStars = palStars[iLeft] || new Set();
    const rightStars = palStars[iRight] || new Set();
    const hasSun = leftStars.has("太阳") || rightStars.has("太阳");
    const hasMoon = leftStars.has("太阴") || rightStars.has("太阴");
    if (hasSun && hasMoon) {
      const isStrict = ["丑", "未"].includes(idxToBranch[iMing]);
      ret.push(hit("jinyu_fujia", isStrict, `命宫天府，左右见日月；命支=${idxToBranch[iMing]}`, ["命宫", "左右邻宫"]));
    }
  }

  // 紫府夹命
  if (starsIn(palStars, iMing, new Set(["天机", "太阴"]))) {
    const leftS = palStars[iLeft] || new Set();
    const rightS = palStars[iRight] || new Set();
    if ((leftS.has("天府") && rightS.has("紫微")) || (leftS.has("紫微") && rightS.has("天府"))) {
      ret.push(hit("zifu_jiaming", true, "命宫天机+太阴，左右分见天府与紫微", ["命宫", "左右邻宫"]));
    }
  }

  // 禄马交驰（化禄版）
  {
    let huaLuStrict = false;
    for (let i = 0; i < 12; i++) {
      if ((palMutagen[i] || new Set()).has("禄") && (palStars[i] || new Set()).has("天马")) {
        ret.push(hit("luma_jiaochi_hualu", true, `${idxToName[i]}同宫化禄+天马`, [idxToName[i]]));
        huaLuStrict = true;
        break;
      }
    }
    if (!huaLuStrict) {
      let found = false;
      for (let i = 0; i < 12; i++) {
        if ((palMutagen[i] || new Set()).has("禄")) {
          const j = _opp(i);
          if ((palStars[j] || new Set()).has("天马")) {
            ret.push(hit("luma_jiaochi_hualu_weak", false, `${idxToName[i]}化禄 对拱 ${idxToName[j]}天马`, [idxToName[i], idxToName[j]]));
            found = true;
            break;
          }
        }
      }
      if (!found) {
        const triHuaLu = tri.some(j => (palMutagen[j] || new Set()).has("禄"));
        const triHasMa = tri.some(j => (palStars[j] || new Set()).has("天马"));
        if (triHuaLu && triHasMa) {
          ret.push(hit("luma_jiaochi_hualu_tri", false, "命三方四正会照：化禄 与 天马", ["命/财/官/迁"]));
        }
      }
    }
  }

  // 明禄暗禄
  {
    const iDark = darkPairIndex(idxToBranch, iMing);
    if (iDark !== null) {
      const mingHasLu = (palStars[iMing] || new Set()).has("禄存") || (palMutagen[iMing] || new Set()).has("禄");
      const darkHasLu = (palStars[iDark] || new Set()).has("禄存") || (palMutagen[iDark] || new Set()).has("禄");
      if (mingHasLu && darkHasLu) {
        ret.push(hit("minglu_anlu", true, `命宫明禄，暗合宫亦见禄（宫=${idxToName[iDark]}）`, ["命宫", idxToName[iDark]]));
      }
    }
  }

  // 禄马佩印
  for (let i = 0; i < 12; i++) {
    if (starsIn(palStars, i, new Set(["禄存", "天马", "天相"]))) {
      ret.push(hit("luma_peiyin", true, `${idxToName[i]}同宫禄存+天马+天相`, [idxToName[i]]));
      break;
    }
  }

  // 两重华盖
  if ((palStars[iMing] || new Set()).has("禄存") && (palMutagen[iMing] || new Set()).has("禄") &&
      anyStarIn(palStars, iMing, new Set(["地空", "地劫"]))) {
    ret.push(hit("liangchong_huagai", true, "命宫禄存+化禄并遇空/劫", ["命宫"]));
  }

  // 辅弼拱主
  if ((palStars[iMing] || new Set()).has("紫微")) {
    const lrStrict = (((palStars[iLeft] || new Set()).has("左辅") && (palStars[iRight] || new Set()).has("右弼")) ||
                      ((palStars[iRight] || new Set()).has("左辅") && (palStars[iLeft] || new Set()).has("右弼")) ||
                      starsIn(palStars, iMing, new Set(["左辅", "右弼"])));
    if (lrStrict) {
      ret.push(hit("fubi_gongzhu", true, "命宫紫微，左右夹辅弼或同宫", ["命宫", "左右邻宫"]));
    } else if (triUnion.has("左辅") && triUnion.has("右弼")) {
      ret.push(hit("fubi_gongzhu_weak", false, "命宫紫微，三方会辅弼", ["命/财/官/迁"]));
    }
  }

  // 左右同宫
  for (let i = 0; i < 12; i++) {
    if (starsIn(palStars, i, new Set(["左辅", "右弼"]))) {
      ret.push(hit("zuoyou_tonggong", true, `${idxToName[i]}同宫左辅+右弼`, [idxToName[i]]));
      break;
    }
  }

  // 府相朝垣
  {
    const mingMajors = new Set([...(palStars[iMing] || new Set())].filter(s => MAJOR_14.has(s)));
    if (mingMajors.size === 0 && (palStars[iGuan] || new Set()).has("天府") && (palStars[iCai] || new Set()).has("天相")) {
      ret.push(hit("fuxiang_chaoyuan", true, "命空宫；官禄=天府，财帛=天相", ["命宫", "官禄", "财帛"]));
    }
  }

  // 科明暗禄
  {
    const iDark2 = darkPairIndex(idxToBranch, iMing);
    if ((palMutagen[iMing] || new Set()).has("科") && iDark2 !== null &&
        ((palStars[iDark2] || new Set()).has("禄存") || (palMutagen[iDark2] || new Set()).has("禄"))) {
      ret.push(hit("keming_anlu", true, `命宫见化科；暗合宫见禄（${idxToName[iDark2]}）`, ["命宫", idxToName[iDark2]]));
    }
  }

  // 禄逢冲破（增强版）
  for (let i = 0; i < 12; i++) {
    if ((palMutagen[i] || new Set()).has("禄")) {
      const L = _left(i), R = _right(i), J = _opp(i);
      const leftLoss = anyStarIn(palStars, L, new Set(["地空", "地劫"]));
      const rightLoss = anyStarIn(palStars, R, new Set(["地空", "地劫"]));
      const selfLoss = anyStarIn(palStars, i, new Set(["地空", "地劫"]));
      const oppJi = (palMutagen[J] || new Set()).has("忌");
      if ((leftLoss && rightLoss) || oppJi) {
        ret.push(hit("lu_feng_chongpo", true,
          `${idxToName[i]}化禄，` + (oppJi ? "对宫见化忌冲照" : "左右邻宫空/劫夹破"),
          [idxToName[i]]));
        break;
      }
      if (selfLoss || leftLoss || rightLoss) {
        ret.push(hit("lu_feng_chongpo_weak", false,
          `${idxToName[i]}化禄，` + (selfLoss ? "同宫见空/劫" : "单侧邻宫空/劫"),
          [idxToName[i]]));
        break;
      }
    }
  }

  return ret;
}
