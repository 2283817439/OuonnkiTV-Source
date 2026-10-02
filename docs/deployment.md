# OuonnkiTV-Source 部署指南

本文说明如何把私有 `OuonnkiTV-Source` 部署成独立的 Source Registry 服务，并让 `aidou` 通过公开 API 获取源列表。

## 1. 部署架构

推荐架构：

```text
GitHub 私有仓库
2283817439/OuonnkiTV-Source
        │
        ├── GitHub Actions
        │      └── 每日更新源、检测可用性、生成 JSON
        │
        ▼
tv_source/OuonnkiTV/
  ├── full.json
  ├── full-noadult.json
  ├── adult.json
  ├── lite.json
  └── raw.json
        │
        ▼
Vercel Serverless Functions
  ├── /api/sources
  ├── /api/categories
  └── /api/health
        │
        ▼
aidou
  └── Source Registry / 搜索 / 详情 / 播放
```

这里需要区分两个运行环境：

- **GitHub Actions**：负责生成和更新源数据。
- **Vercel**：负责把已经生成的 JSON 通过 HTTP API 提供给 aidou。
- **aidou**：消费 Source Registry，不需要访问这个私有 GitHub 仓库。

---

## 2. 前置条件

需要：

- 一个 GitHub 账号
- 私有仓库 `2283817439/OuonnkiTV-Source`
- 一个可以连接 GitHub 仓库的 Vercel 项目
- GitHub Actions 可正常运行

**不需要购买独立域名。**

Vercel 部署完成后，可以直接使用 Vercel 分配的：

```text
https://<project-name>.vercel.app
```

例如：

```text
https://ouonnkitv-source-xxxx.vercel.app
```

以后如果需要，再绑定自己的域名即可。

---

## 3. 一键部署到 Vercel

也可以直接点击：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/2283817439/OuonnkiTV-Source&project-name=ouonnkitv-source)

点击后：

1. 登录 Vercel。
2. 使用有权限访问 `2283817439/OuonnkiTV-Source` 的 GitHub 账号授权。
3. 确认项目名称。
4. 点击 Deploy。
5. 等待 Vercel 完成部署。
6. 获得 `https://<project-name>.vercel.app` 地址。

因为仓库是 Private，如果 Vercel 没有访问该仓库的权限，需要在 GitHub/Vercel 的仓库授权设置中允许 Vercel 访问该仓库。

## 4. Vercel 部署

### 3.1 导入 GitHub 仓库

在 Vercel 创建新项目，然后选择：

```text
Import Git Repository
    ↓
2283817439/OuonnkiTV-Source
```

仓库可以保持 Private。

### 3.2 项目设置

当前仓库已经包含：

- `vercel.json`
- `api/sources.js`
- `api/categories.js`
- `api/health.js`

因此一般不需要额外创建 Serverless Function。

推荐保持：

```text
Framework Preset: Other
Build Command: 留空
Output Directory: 留空
Install Command: npm install（默认即可）
```

当前 API 使用 Node.js Runtime，由仓库中的 `vercel.json` 指定。

### 3.3 部署

点击 Deploy。

部署成功后，Vercel 会生成一个：

```text
https://<project-name>.vercel.app
```

这就是 Source Registry API 的根地址。

---

## 5. 部署完成后的 API

假设 Vercel 地址为：

```text
https://ouonnkitv-source-xxxx.vercel.app
```

### 全部普通 + 成人源

```text
GET /api/sources?type=full
```

完整地址：

```text
https://ouonnkitv-source-xxxx.vercel.app/api/sources?type=full
```

### 普通源

```text
/api/sources?type=full-noadult
```

### 成人源

```text
/api/sources?type=adult
```

### 精简源

```text
/api/sources?type=lite
```

### 原始检测结果

```text
/api/sources?type=raw
```

### 分类统计

```text
/api/categories
```

### 健康状态

```text
/api/health
```

---

## 6. 部署后必须验证

部署完成后，先不要修改 aidou。

依次打开：

```text
https://<your-vercel-domain>/api/health
```

应该能够返回 JSON。

然后打开：

```text
https://<your-vercel-domain>/api/categories
```

最后测试：

```text
https://<your-vercel-domain>/api/sources?type=full
```

正常情况下，第三个接口应该返回源配置数组。

### 快速检查

```text
/api/health       → 服务是否正常
/api/categories   → 分类统计是否正常
/api/sources      → Source Registry 是否有数据
```

如果 `health` 正常但 `sources` 是空数组，优先检查 GitHub Actions 是否已经生成 `tv_source/OuonnkiTV/*.json`。

---

## 7. GitHub Actions 自动更新

源数据不是由 Vercel 生成的。

真正的数据生成流程在 GitHub Actions：

```text
LunaTV-config
    ↓
下载
    ↓
清洗
    ↓
普通/成人分类
    ↓
搜索检测
    ↓
M3U8 / 分片验证
    ↓
生成 tv_source/OuonnkiTV/*.json
    ↓
commit 到 main
    ↓
Vercel 自动重新部署
```

当前 workflow 支持：

1. 每日定时运行
2. GitHub Actions 手动运行
3. main 分支更新后运行

### 手动运行

进入：

```text
GitHub
  → Actions
  → Update TV Source
  → Run workflow
```

手动运行适合在第一次部署后立即生成/刷新数据。

---

## 8. 可选环境变量

GitHub Actions 支持以下 Secret：

| Secret | 用途 | 是否必须 |
|---|---|---|
| `PROXY_URL` | 源检测时使用代理 | 否 |
| `TG_BOT_TOKEN` | Telegram 通知 Bot Token | 否 |
| `TG_CHAT_ID` | Telegram 通知目标 | 否 |

### 设置位置

进入：

```text
GitHub Repository
  → Settings
  → Secrets and variables
  → Actions
  → New repository secret
```

例如：

```text
PROXY_URL
TG_BOT_TOKEN
TG_CHAT_ID
```

**不要把这些值写进源码，也不要提交 `.env`。**

---

## 9. aidou 接入

部署完成后，aidou 只需要知道公开的 API 地址。

推荐配置：

```text
VITE_OUONNKI_SOURCE_API_URL=https://<your-vercel-domain>/api/sources?type=full
```

例如：

```text
VITE_OUONNKI_SOURCE_API_URL=https://ouonnkitv-source-xxxx.vercel.app/api/sources?type=full
```

注意：

- 这是公开 API 地址，可以被浏览器访问。
- **不要把 GitHub Token 放进这个变量。**
- aidou 不需要知道私有仓库地址。
- aidou 不需要读取 GitHub 文件。
- 源仓库可以继续保持 Private。

---

## 10. 成人源

如果 aidou 需要单独加载成人专区，可以使用：

```text
/api/sources?type=adult
```

普通专区使用：

```text
/api/sources?type=full-noadult
```

全部源使用：

```text
/api/sources?type=full
```

源的成人分类是在 Source Generator 阶段完成的，aidou 不需要自己重新判断。

---

## 11. 缓存说明

当前 API 使用 HTTP/CDN 缓存。

因此：

```text
GitHub Actions 更新 JSON
        ↓
Vercel 部署/重新验证
        ↓
API CDN 缓存
        ↓
aidou
```

数据更新后可能不会在所有请求节点上瞬间刷新。

这属于正常情况。

如果刚刚手动更新了源数据，建议：

1. 确认 GitHub Actions 成功。
2. 确认 `tv_source/OuonnkiTV/*.json` 已经发生更新。
3. 打开 `/api/health`。
4. 再检查 `/api/sources?type=full`。

---

## 12. 常见问题

### Q1：一定需要域名吗？

不需要。

直接使用：

```text
https://<project-name>.vercel.app
```

即可。

自定义域名只是后续可选项。

### Q2：Vercel 能访问私有仓库吗？

可以通过 Vercel 项目授权 GitHub 仓库后部署。

部署后的 API 本身不需要公开 GitHub 仓库。

### Q3：aidou 能不能直接读取私有仓库？

不建议。

当前设计就是：

```text
私有 GitHub
    ↓
Vercel API
    ↓
aidou
```

这样可以把 Source Manager 和 aidou 解耦。

### Q4：Vercel 部署成功，但是 sources 是空的？

检查：

```text
GitHub
  → Actions
  → Update TV Source
```

确认生成任务是否成功。

然后检查：

```text
tv_source/OuonnkiTV/full.json
tv_source/OuonnkiTV/full-noadult.json
tv_source/OuonnkiTV/adult.json
tv_source/OuonnkiTV/lite.json
tv_source/OuonnkiTV/raw.json
```

### Q5：GitHub Actions 失败？

先检查：

- Node.js 环境
- 源配置下载是否成功
- 是否需要 `PROXY_URL`
- GitHub Actions 是否有 `contents: write` 权限
- 仓库是否允许 Actions 写入 main

### Q6：为什么 Vercel 不负责检测视频源？

因为这两个任务职责不同：

```text
GitHub Actions
= 重任务 / 定时任务 / 源检测 / 数据生成

Vercel
= 轻量 API / Source Registry / HTTP 分发
```

这样可以避免每个 aidou 用户访问 API 时重复执行源检测。

---

## 13. 本地运行

如果需要手动生成源：

```bash
npm install
npm start
```

格式检查：

```bash
npm run format:check
```

需要代理或通知时，在本地环境中配置：

```text
PROXY_URL=
TG_BOT_TOKEN=
TG_CHAT_ID=
```

不要提交包含真实密钥的环境文件。

---

## 14. 推荐部署顺序

第一次部署建议严格按照下面顺序：

```text
① 确认 GitHub Actions 可以生成 tv_source
        ↓
② 确认 full.json / adult.json 等文件存在
        ↓
③ 将 OuonnkiTV-Source 导入 Vercel
        ↓
④ 打开 /api/health
        ↓
⑤ 打开 /api/categories
        ↓
⑥ 打开 /api/sources?type=full
        ↓
⑦ 得到稳定的 *.vercel.app 地址
        ↓
⑧ 配置 aidou 的 VITE_OUONNKI_SOURCE_API_URL
        ↓
⑨ 在 aidou 中刷新 Source Registry
        ↓
⑩ 再验证搜索 → 详情 → 播放
```

不要在 API 还没有验证成功时就开始排查 aidou 的搜索或播放问题。

---

## 15. 更新架构

以后修改源管理逻辑时，只需要维护：

```text
OuonnkiTV-Source
```

例如：

- 增加新源
- 修改源检测规则
- 修改成人源分类
- 修改 M3U8 验证
- 修改代理策略
- 修改生成格式

这些变化通过 GitHub Actions → JSON → Vercel API 自动传递给 aidou。

aidou 本身不需要跟着每一个源规则变化重新发布。

---

## 16. 安全建议

### 可以公开

- Vercel API 地址
- `/api/sources`
- `/api/categories`
- `/api/health`

### 不应该公开

- GitHub Token
- Telegram Bot Token
- Proxy 密钥
- 其他第三方服务密钥
- 私有仓库的认证信息

前端环境变量 `VITE_*` 会进入浏览器，因此**任何放进 `VITE_*` 的 Secret 都不能视为秘密**。
