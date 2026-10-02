# OuonnkiTV-Source

独立的视频源管理仓库，为 aidou 提供自动更新的 Source Registry 数据。

## 架构

```
LunaTV-config
      ↓
GitHub Actions
      ↓
下载 → 清洗 → 分类 → 可用性检测 → M3U8/分片验证
      ↓
tv_source/OuonnkiTV/
  ├─ full.json
  ├─ full-noadult.json
  ├─ adult.json
  ├─ lite.json
  └─ raw.json
      ↓
GitHub Raw
      ↓
aidou
  └─ Source Registry → 搜索 → 详情 → 播放
```

## aidou 接入

仓库公开后，aidou 直接读取 GitHub Raw，无需 Vercel、独立 API 服务或自定义域名。

完整源列表：

```text
https://raw.githubusercontent.com/2283817439/OuonnkiTV-Source/main/tv_source/OuonnkiTV/full.json
```

普通源：

```text
https://raw.githubusercontent.com/2283817439/OuonnkiTV-Source/main/tv_source/OuonnkiTV/full-noadult.json
```

成人源：

```text
https://raw.githubusercontent.com/2283817439/OuonnkiTV-Source/main/tv_source/OuonnkiTV/adult.json
```

精简源：

```text
https://raw.githubusercontent.com/2283817439/OuonnkiTV-Source/main/tv_source/OuonnkiTV/lite.json
```

检测后的全量记录：

```text
https://raw.githubusercontent.com/2283817439/OuonnkiTV-Source/main/tv_source/OuonnkiTV/raw.json
```

## 自动更新

GitHub Actions 定时执行：

1. 下载 LunaTV 源配置
2. 清洗源数据
3. 分类普通/成人源
4. 搜索检测
5. M3U8 与视频分片验证
6. 生成五种 JSON
7. 自动提交 `tv_source/`

也支持在 GitHub Actions 中手动运行。

## 本地运行

```bash
npm install
npm start
```

需要代理或 Telegram 通知时，在本地环境中配置：

```text
PROXY_URL=
TG_BOT_TOKEN=
TG_CHAT_ID=
```

不要提交真实密钥。

## 数据文件

| 文件 | 用途 |
|---|---|
| `full.json` | 全部通过生成规则的源 |
| `full-noadult.json` | 普通源 |
| `adult.json` | 成人源 |
| `lite.json` | 精简源 |
| `raw.json` | 检测后的完整源记录 |

## 设计原则

Source Manager 与 aidou 解耦：

- Source Manager 负责源采集、检测、分类和生成
- GitHub Actions 负责定时更新
- GitHub Raw 负责静态 JSON 分发
- aidou 只负责消费 Source Registry
- 修改源规则时，不需要修改 aidou 的 CMS 核心

这样可以独立维护和迭代 `OuonnkiTV-Source`。

## 源纳管与统一 Registry（当前架构）

当前源管理已经从单一 LunaTV 输入升级为统一 Source Intake：

- 73 源候选清单经过 API URL 归一化后，识别出 34 个未重复候选源。
- 34 个候选源维护在 `src/candidate_sources.js`，这里只负责 Source Intake，不是最终 Registry。
- 02 阶段将候选源与原有 LunaTV 源统一合并并按 API URL 去重。
- 合并后的源统一进入现有 03 检测流程：搜索 → 详情 → 播放链接 → M3U8 → 视频分片 → 测速。
- 04 阶段再次进行最终去重、筛选和分类，并生成统一 Registry。
- 候选源只有通过现有检测和生成规则，才会进入最终 Registry；进入候选清单不等于一定收录。

当前数据链路：

    73 源候选清单
          ↓
    API URL 归一化去重
          ↓
    34 个未重复候选源
          ↓
    candidate_sources.js
          ↓
    01 下载 LunaTV 配置
          ↓
    02 统一纳管 / 合并 / 去重
          ↓
    Unified Source Pool
          ↓
    03 搜索 / 详情 / 播放链接 / M3U8 / 分片 / 测速
          ↓
    04 最终筛选 / 去重 / 分类
          ↓
    tv_source/OuonnkiTV/full.json
          ↓
    aidou Source Registry

### aidou 的唯一数据入口

推荐并要求 aidou 以 `full.json` 作为统一 Source Registry 主入口：

    https://raw.githubusercontent.com/2283817439/OuonnkiTV-Source/main/tv_source/OuonnkiTV/full.json

候选源、LunaTV 原始配置和检测中间结果都不作为 aidou 的独立源入口。

其他生成文件仍用于不同场景：

| 文件 | 用途 |
|---|---|
| `full.json` | 统一完整 Source Registry，aidou 主入口 |
| `full-noadult.json` | 排除成人源的 Registry |
| `adult.json` | 成人源 Registry |
| `lite.json` | 精简 Registry |
| `raw.json` | 检测后的完整记录，主要用于诊断和后续处理 |

### 新增候选源的维护方式

新增源时应修改 `src/candidate_sources.js`，不要直接手工修改最终 `full.json` 来伪造可用源。

候选源会自动经过：

1. 02 纳管与 API 去重
2. 03 可用性检测
3. 04 最终筛选与分类
4. Registry 生成

API URL 会忽略协议、`www.` 和末尾斜杠进行归一化，避免同一个 API 因 URL 写法不同而重复收录。

### 架构原则

Source Manager 与 aidou 解耦，最终采用单一事实来源：

    Source Intake
         ↓
    Unified Source Pool
         ↓
    Detection
         ↓
    Final Registry
         ↓
    aidou

不再允许候选源清单、LunaTV 配置或检测中间结果分别成为 aidou 的独立源入口。

