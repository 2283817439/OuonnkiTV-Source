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
