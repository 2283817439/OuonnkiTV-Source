const fs = require('fs');
const path = require('path');
const candidateSources = require('./candidate_sources.js');

const inputFile = path.join(__dirname, '..', 'tv_source', 'LunaTV', 'LunaTV-config.json');
const outputFile = path.join(__dirname, '..', 'tv_source', 'LunaTV', 'LunaTV-processed.json');

function isAdultContent(name) {
  return name.includes('🔞');
}

function cleanName(name) {
  return name
    .replace(/🔞/g, '')
    .replace(/🎬/g, '')
    .trim()
    .replace(/^-+|-+$/g, '')
    .trim();
}

function cleanApiUrl(url) {
  const proxyPattern = /^https?:\/\/[^\/]+\/\?url=/;
  if (proxyPattern.test(url)) {
    return url.replace(proxyPattern, '');
  }
  return url;
}

// API URL 归一化用于跨清单去重：忽略协议、www. 和末尾斜杠。
function normalizeApiUrl(url) {
  return String(url || '')
    .trim()
    .replace(/\/+$/, '')
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .toLowerCase();
}

function uniqueKey(baseKey, apiSite) {
  let key = baseKey;
  let index = 2;
  while (apiSite[key]) {
    key = `${baseKey}-candidate-${index++}`;
  }
  return key;
}

function mergeCandidateSources(apiSite) {
  const merged = { ...apiSite };
  const existingApis = new Set(
    Object.values(merged)
      .map((site) => normalizeApiUrl(site?.api))
      .filter(Boolean),
  );

  let added = 0;
  let skipped = 0;

  for (const source of candidateSources) {
    const api = cleanApiUrl(source.api);
    const normalizedApi = normalizeApiUrl(api);

    if (!normalizedApi || existingApis.has(normalizedApi)) {
      skipped++;
      continue;
    }

    const key = uniqueKey(`__candidate__${source.key.replace(/[^a-zA-Z0-9_-]/g, '-')}`, merged);
    merged[key] = {
      name: source.name,
      api,
      detail: source.detail || api,
      isAdult: Boolean(source.isAdult),
      _sourceOrigin: 'ziyuanzu-73-candidates',
    };
    existingApis.add(normalizedApi);
    added++;
  }

  return { merged, added, skipped };
}

function processConfig(config) {
  const { merged, added, skipped } = mergeCandidateSources(config.api_site || {});
  const result = {
    cache_time: config.cache_time,
    api_site: {},
  };

  for (const [key, value] of Object.entries(merged)) {
    const originalName = value.name;
    const isAdult =
      typeof value.isAdult === 'boolean' ? value.isAdult : isAdultContent(originalName);
    const cleanedName = cleanName(originalName);
    const cleanedApi = cleanApiUrl(value.api);
    const domainId = key.replace(/\./g, '-');

    result.api_site[key] = {
      ...value,
      id: domainId,
      name: cleanedName,
      api: cleanedApi,
      isAdult,
    };
  }

  return { result, added, skipped };
}

(async () => {
  try {
    if (!fs.existsSync(inputFile)) {
      console.error(`错误: 找不到输入文件: ${inputFile}`);
      process.exit(1);
    }

    const config = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
    const { result: processed, added, skipped } = processConfig(config);

    fs.writeFileSync(outputFile, JSON.stringify(processed, null, 2), 'utf8');

    const sites = Object.values(processed.api_site);
    const adultCount = sites.filter((site) => site.isAdult).length;
    const normalCount = sites.filter((site) => !site.isAdult).length;

    console.log(`✓ 已生成: ${outputFile}`);
    console.log(`  - LunaTV 原始源数: ${Object.keys(config.api_site || {}).length}`);
    console.log(`  - 34 候选源新增: ${added}`);
    console.log(`  - 34 候选源重复跳过: ${skipped}`);
    console.log(`  - 合并后总视频源数: ${sites.length}`);
    console.log(`  - 正常资源: ${normalCount}`);
    console.log(`  - 成人资源: ${adultCount}`);
  } catch (error) {
    console.error(`\n错误: ${error.message}`);
    process.exit(1);
  }
})();
