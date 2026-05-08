/**
 * @name Contextual Renamer (Hierarchical Priority + Auto Flag)
 * @description 根据国旗、代码或中文名称重命名。实现严格优先级：国旗 > 位置 > 代码类型。可自动为纯中文节点补全缺失的国旗。解决中英双语导致的名字重复问题。
 * @version 17.2 (Smart Deduplication & Aliases)
 * @update 2026-05-08
 * @author Gemini
 * @usage 在 Sub-Store 中使用。脚本会自动应用重命名规则。
 */

// --- 数据源 ---
// prettier-ignore
const FG = ['🇭🇰','🇲🇴','🇹🇼','🇯🇵','🇰🇷','🇸🇬','🇺🇸','🇬🇧','🇫🇷','🇩🇪','🇦🇺','🇦🇪','🇦🇫','🇦🇱','🇩🇿','🇦🇴','🇦🇷','🇦🇲','🇦🇹','🇦🇿','🇧🇭','🇧🇩','🇧🇾','🇧🇪','🇧🇿','🇧🇯','🇧🇹','🇧🇴','🇧🇦','🇧🇼','🇧🇷','🇻🇬','🇧🇳','🇧🇬','🇧🇫','🇧🇮','🇰🇭','🇨🇲','🇨🇦','🇨🇻','🇰🇾','🇨🇫','🇹🇩','🇨🇱','🇨🇴','🇰🇲','🇨🇬','🇨🇩','🇨🇷','🇭🇷','🇨🇾','🇨🇿','🇩🇰','🇩🇯','🇩🇴','🇪🇨','🇪🇬','🇸🇻','🇬🇶','🇪🇷','🇪🇪','🇪🇹','🇫🇯','🇫🇮','🇬🇦','🇬🇲','🇬🇪','🇬🇭','🇬🇷','🇬🇱','🇬🇹','🇬🇳','🇬🇾','🇭🇹','🇭🇳','🇭🇺','🇮🇸','🇮🇳','🇮🇩','🇮🇷','🇮🇶','🇮🇪','🇮🇲','🇮🇱','🇮🇹','🇨🇮','🇯🇲','🇯🇴','🇰🇿','🇰🇪','🇰🇼','🇰🇬','🇱🇦','🇱🇻','🇱🇧','🇱🇸','🇱🇷','🇱🇾','🇱🇹','🇱🇺','🇲🇰','🇲🇬','🇲🇼','🇲🇾','🇲🇻','🇲🇱','🇲🇹','🇲🇷','🇲🇺','🇲🇽','🇲🇩','🇲🇨','🇲🇳','🇲🇪','🇲🇦','🇲🇿','🇲🇲','🇳🇦','🇳🇵','🇳🇱','🇳🇿','🇳🇮','🇳🇪','🇳🇬','🇰🇵','🇳🇴','🇴🇲','🇵🇰','🇵🇦','🇵🇾','🇵🇪','🇵🇭','🇵🇹','🇵🇷','🇶🇦','🇷🇴','🇷🇺','🇷🇼','🇸🇲','🇸🇦','🇸🇳','🇷🇸','🇸🇱','🇸🇰','🇸🇮','🇸🇴','🇿🇦','🇪🇸','🇱🇰','🇸🇩','🇸🇷','SZ','🇸🇪','🇨🇭','🇸🇾','🇹🇯','🇹🇿','🇹🇭','🇹🇬','🇹🇴','🇹🇹','🇹🇳','🇹🇷','🇹🇲','🇻🇮','🇺🇬','🇺🇦','🇺🇾','🇺🇿','🇻🇪','🇻🇳','🇾🇪','🇿🇲','🇿🇼','🇦🇩','🇷🇪','🇵🇱','🇬🇺','🇻🇦','🇱🇮','🇨🇼','🇸🇨','🇦🇶','🇬🇮','🇨🇺','🇫🇴','🇦🇽','🇧🇲','🇹🇱'];
// prettier-ignore
const EN = ['HK','MO','TW','JP','KR','SG','US','GB','FR','DE','AU','AE','AF','AL','DZ','AO','AR','AM','AT','AZ','BH','BD','BY','BE','BZ','BJ','BT','BO','BA','BW','BR','VG','BN','BG','BF','BI','KH','CM','CA','CV','KY','CF','TD','CL','CO','KM','CG','CD','CR','HR','CY','CZ','DK','DJ','DO','EC','EG','SV','GQ','ER','EE','ET','FJ','FI','GA','GM','GE','GH','GR','GL','GT','GN','GY','HT','HN','HU','IS','IN','ID','IR','IQ','IE','IM','IL','IT','CI','JM','JO','KZ','KE','KW','KG','LA','LV','LB','LS','LR','LY','LT','LU','MK','MG','MW','MY','MV','ML','MT','MR','MU','MX','MD','MC','MN','ME','MA','MZ','MM','NA','NP','NL','NZ','NI','NE','NG','KP','NO','OM','PK','PA','PY','PE','PH','PT','PR','QA','RO','RU','RW','SM','SA','SN','RS','SL','SK','SI','SO','ZA','ES','LK','SD','SR','SZ','SE','CH','SY','TJ','TZ','TH','TG','TO','TT','TN','TR','TM','VI','UG','UA','UY','UZ','VE','VN','YE','ZM','ZW','AD','RE','PL','GU','VA','LI','CW','SC','AQ','GI','CU','FO','AX','BM','TL'];
// prettier-ignore
const EN3 = ['HKG','MAC','TWN','JPN','KOR','SGP','USA','GBR','FRA','DEU','AUS','ARE','AFG','ALB','DZA','AGO','ARG','ARM','AUT','AZE','BHR','BGD','BLR','BEL','BLZ','BEN','BTN','BOL','BIH','BWA','BRA','VGB','BRN','BGR','BFA','BDI','KHM','CMR','CAN','CPV','CYM','CAF','TCD','CHL','COL','COM','COG','COD','CRI','HRV','CYP','CZE','DNK','DJI','DOM','ECU','EGY','SLV','GNQ','ERI','EST','ETH','FJI','FIN','GAB','GMB','GEO','GHA','GRC','GRL','GTM','GIN','GUY','HTI','HND','HUN','ISL','IND','IDN','IRN','IRQ','IRL','IMN','ISR','ITA','CIV','JAM','JOR','KAZ','KEN','KWT','KGZ','LAO','LVA','LBN','LSO','LBR','LBY','LTU','LUX','MKD','MDG','MWI','MYS','MDV','MLI','MLT','MRT','MUS','MEX','MDA','MCO','MNG','MNE','MAR','MOZ','MMR','NAM','NPL','NLD','NZL','NIC','NER','NGA','PRK','NOR','OMN','PAK','PAN','PRY','PER','PHL','PRT','PRI','QAT','ROU','RUS','RWA','SMR','SAU','SEN','SRB','SLE','SVK','SVN','SOM','ZAF','ESP','LKA','SDN','SUR','SWZ','SWE','CHE','SYR','TJK','TZA','THA','TGO','TON','TTO','TUN','TUR','TKM','VIR','UGA','UKR','URY','UZB','VEN','VNM','YEM','ZMB','ZWE','AND','REU','POL','GUM','VAT','LIE','CUW','SYC','ATA','GIB','CUB','FRO','ALA','BMU','TLS'];
// prettier-ignore
const QC = ['Hong Kong','Macao','Taiwan','Japan','South Korea','Singapore','United States','United Kingdom','France','Germany','Australia','United Arab Emirates','Afghanistan','Albania','Algeria','Angola','Argentina','Armenia','Austria','Azerbaijan','Bahrain','Bangladesh','Belarus','Belgium','Belize','Benin','Bhutan','Bolivia','Bosnia and Herzegovina','Botswana','Brazil','British Virgin Islands','Brunei','Bulgaria','Burkina Faso','Burundi','Cambodia','Cameroon','Canada','Cape Verde','Cayman Islands','Central African Republic','Chad','Chile','Colombia','Comoros','Congo-Brazzaville','Congo-Kinshasa','Costa Rica','Croatia','Cyprus','Czech Republic','Denmark','Djibouti','Dominican Republic','Ecuador','Egypt','El Salvador','Equatorial Guinea','Eritrea','Estonia','Ethiopia','Fiji','Finland','Gabon','Gambia','Georgia','Ghana','Greece','Greenland','Guatemala','Guinea','Guyana','Haiti','Honduras','Hungary','Iceland','India','Indonesia','Iran','Iraq','Ireland','Isle of Man','Israel','Italy','Ivory Coast','Jamaica','Jordan','Kazakhstan','Kenya','Kuwait','Kyrgyzstan','Laos','Latvia','Lebanon','Lesotho','Liberia','Libya','Lithuania','Luxembourg','Macedonia','Madagascar','Malawi','Malaysia','Maldives','Mali','Malta','Mauritania','Mauritius','Mexico','Moldova','Monaco','Mongolia','Montenegro','Morocco','Mozambique','Myanmar (Burma)','Namibia','Nepal','Netherlands','New Zealand','Nicaragua','Niger','Nigeria','North Korea','Norway','Oman','Pakistan','Panama','Paraguay','Peru','Philippines','Portugal','Puerto Rico','Qatar','Romania','Russia','Rwanda','San Marino','Saudi Arabia','Senegal','Serbia','Sierra Leone','Slovakia','Slovenia','Somalia','South Africa','Spain','Sri Lanka','Sudan','Suriname','Swaziland','Sweden','Switzerland','Syria','Tajikistan','Tanzania','Thailand','Togo','Tonga','Trinidad and Tobago','Tunisia','Turkey','Turkmenistan','U.S. Virgin Islands','Uganda','Ukraine','Uruguay','Uzbekistan','Venezuela','Vietnam','Yemen','Zambia','Zimbabwe','Andorra','Reunion','Poland','Guam','Vatican','Liechtenstein','Curacao','Seychelles','Antarctica','Gibraltar','Cuba','Faroe Islands','Aland Islands','Bermuda','Timor-Leste'];
// prettier-ignore
const ZH = ['香港','澳门','台湾','日本','韩国','新加坡','美国','英国','法国','德国','澳大利亚','阿联酋','阿富汗','阿尔巴尼亚','阿尔及利亚','安哥拉','阿根廷','亚美尼亚','奥地利','阿塞拜疆','巴林','孟加拉国','白俄罗斯','比利时','伯利兹','贝宁','不丹','玻利维亚','波斯尼亚和黑塞哥维那','博茨瓦纳','巴西','英属维尔京群岛','文莱','保加利亚','布基纳法索','布隆迪','柬埔寨','喀麦隆','加拿大','佛得角','开曼群岛','中非共和国','乍得','智利','哥伦比亚','科摩罗','刚果(布)','刚果(金)','哥斯达黎加','克罗地亚','塞浦路斯','捷克','丹麦','吉布提','多米尼加共和国','厄瓜多尔','埃及','萨尔瓦多','赤道几内亚','厄立特里亚','爱沙尼亚','埃塞俄比亚','斐济','芬兰','加蓬','冈比亚','格鲁지아','加纳','希腊','格陵兰','危地马拉','几内亚','圭亚那','海地','洪都拉斯','匈牙利','冰岛','印度','印尼','伊朗','伊拉克','爱尔兰','马恩岛','以色列','意大利','科特迪瓦','牙买加','约旦','哈萨克斯坦','肯尼亚','科威特','吉尔吉斯斯坦','老挝','拉脱维亚','黎巴嫩','莱索托','利比里亚','利比亚','立陶宛','卢森堡','马其顿','马达加斯加','马拉维','马来西亚','马尔代夫','马里','马耳他','毛利塔尼亚','毛里求斯','墨西哥','摩尔多瓦','摩纳哥','蒙古','黑山共和国','摩洛哥','莫桑比克','缅甸','纳米比亚','尼泊尔','荷兰','新西兰','尼加拉瓜','尼日尔','尼日利亚','朝鲜','挪威','阿曼','巴基斯坦','巴拿马','巴拉圭','秘鲁','菲律宾','葡萄牙','波多黎各','卡塔尔','罗马尼亚','俄罗斯','卢旺达','圣马力诺','沙特阿拉伯','塞内加尔','塞尔维亚','塞拉利昂','斯洛伐克','斯洛文尼亚','索马里','南非','西班牙','斯里兰卡','苏丹','苏里南','斯威士兰','瑞典','瑞士','叙利亚','塔吉克斯坦','坦桑尼亚','泰国','多哥','汤加','特立尼达和多巴哥','突尼斯','土耳其','土库曼斯坦','美属维尔京群岛','乌干达','乌克兰','乌拉圭','乌兹别克斯坦','委内瑞拉','越南','也门','赞比亚','津巴бве','安道尔','留尼汪','波兰','关岛','梵地冈','列支敦士登','库拉索','塞舌尔','南极','直布罗陀','古巴','法罗群岛','奥兰群岛','百慕达','东帝汶'];

const aliasMap = {
  '英国': ['UK'], '阿联酋': ['Dubai'], '土耳其': ['Türkiye'], '捷克': ['Czech'],
  '意大利': ['Italia'], '德国': ['Deutschland'], '西班牙': ['España'],
  '新加坡': ['狮城'] // 【新增】狮城别名映射
};

// --- 预处理，构建高效的数据库 ---

let countryData = [];
for (let i = 0; i < FG.length; i++) {
    countryData.push({ flag: FG[i], zh: ZH[i], en: EN[i], en3: EN3[i], qc: QC[i] });
}
const zhToData = new Map(countryData.map(c => [c.zh, c]));
for (const [zhName, aliases] of Object.entries(aliasMap)) {
    const data = zhToData.get(zhName);
    if (data) {
        if (!data.aliases) data.aliases = new Set();
        aliases.forEach(a => data.aliases.add(a));
    }
}
const twData = countryData.find(c => c.en === 'TW');
if (twData) {
    if (!twData.aliases) twData.aliases = new Set();
    ['CN', 'CHN', 'China'].forEach(a => twData.aliases.add(a));
}

const flagToDataMap = new Map(countryData.map(c => [c.flag, c]));
if (twData) flagToDataMap.set('🇨🇳', twData);

// 为无旗匹配准备分级代码列表
const p2_codes = [], p3_codes = [];
countryData.forEach(c => {
    const base = { flag: c.flag, zh: c.zh };
    if (c.en3) p2_codes.push({ ...base, code: c.en3 });
    if (c.qc) p2_codes.push({ ...base, code: c.qc });
    if (c.aliases) c.aliases.forEach(a => p2_codes.push({ ...base, code: a }));
    if (c.zh) p2_codes.push({ ...base, code: c.zh }); 
    if (c.en) p3_codes.push({ ...base, code: c.en });
});
[p2_codes, p3_codes].forEach(list => list.sort((a, b) => b.code.length - a.code.length));


// --- 核心辅助函数 ---

const isAscii = (str) => /^[\x00-\x7F]*$/.test(str);

const createBoundedRegex = (code) => {
    const escaped = code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return isAscii(code) 
        ? new RegExp('\\b' + escaped + '\\b', 'i')
        : new RegExp(escaped, 'i');
};

const createNonBoundedRegex = (code) => {
    const escaped = code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return isAscii(code) 
        ? new RegExp('\\b' + escaped + '(?![a-zA-Z])', 'i')
        : new RegExp(escaped, 'i');
};

function findBestMatch(nodeName, codeList, regexBuilder) {
    let bestMatch = null;
    for (const item of codeList) {
        const regex = regexBuilder(item.code);
        const match = regex.exec(nodeName);
        if (match) {
            if (!bestMatch || match.index < bestMatch.index) {
                bestMatch = { data: item, index: match.index };
            }
        }
    }
    return bestMatch;
}

// --- 主操作函数 ---
function operator(proxies) {
  return proxies.map(p => {
    let nodeName = p.name;
    let flagProcessed = false;

    // --- 1. 优先处理已有国旗的节点 ---
    for (const [flag, country] of flagToDataMap.entries()) {
      if (nodeName.includes(flag)) {
        flagProcessed = true;
        const allCountryCodes = [country.qc, country.en3, ...(country.aliases || []), country.en].filter(Boolean);
        allCountryCodes.sort((a,b) => b.length - a.length);
        for (const code of allCountryCodes) {
            const regex = createNonBoundedRegex(code);
            if (regex.test(nodeName)) {
                // 【核心修复】：如果节点里已经有最终的中文名字（比如已经有"美国"），并且当前匹配的不是该中文名本身
                // 则直接删除该英文/别名（比如"USA"），防止变成"美国 美国"
                if (nodeName.includes(country.zh) && code !== country.zh) {
                    nodeName = nodeName.replace(regex, '');
                } else {
                    nodeName = nodeName.replace(regex, country.zh);
                }
                break;
            }
        }
        break;
      }
    }

    // --- 2. 仅在无国旗时，执行分级匹配（含中文反查） ---
    if (!flagProcessed) {
        const candidates = [];
        const priorities = [
            { priority: 1, codes: p2_codes, builder: createBoundedRegex },
            { priority: 2, codes: p3_codes, builder: createBoundedRegex },
            { priority: 3, codes: p2_codes, builder: createNonBoundedRegex },
            { priority: 4, codes: p3_codes, builder: createNonBoundedRegex },
        ];

        priorities.forEach(({ priority, codes, builder }) => {
            const match = findBestMatch(nodeName, codes, builder);
            if (match) candidates.push({ ...match, priority });
        });

        if (candidates.length > 0) {
            candidates.sort((a, b) => {
                if (a.index !== b.index) return a.index - b.index;
                return a.priority - b.priority;
            });

            const winner = candidates[0];
            const regex = priorities.find(pr => pr.priority === winner.priority).builder(winner.data.code);
            
            // 【核心修复】：同上逻辑，防“USA 美国”去重
            if (nodeName.includes(winner.data.zh) && winner.data.code !== winner.data.zh) {
                nodeName = winner.data.flag + ' ' + nodeName.replace(regex, '');
            } else {
                nodeName = winner.data.flag + ' ' + nodeName.replace(regex, winner.data.zh);
            }
        }
    }
    
    // --- 3. 最后一步：格式化并统一旗帜 ---
    nodeName = nodeName.replace(/🇨🇳/g, '🇹🇼');
    // 把多个空格压缩成一个，能完美修补掉上面 replace('', ...) 留下的多余空白
    p.name = nodeName.replace(/\s+/g, ' ').trim();
    
    return p;
  });
}
