# OuonnkiTV-Source

私有视频源管理仓库，为 aidou 提供独立的 Source Registry 与 API 服务。


## 📚 文档

本仓库现在提供独立的完整部署指南：

- [部署指南](./docs/deployment.md)：Vercel 部署、GitHub Actions、API 验证、aidou 接入、环境变量、缓存与故障排查

### 推荐部署顺序

```text
GitHub Actions 生成源数据
        ↓
确认 tv_source/OuonnkiTV/*.json
        ↓
部署到 Vercel
        ↓
验证 /api/health
        ↓
验证 /api/categories
        ↓
验证 /api/sources?type=full
        ↓
把 *.vercel.app API 地址配置到 aidou
```

**不需要购买独立域名。** Vercel 分配的 `*.vercel.app` 地址即可作为 Source Registry API 地址。

## 架构

```
LunaTV-config
      ↓
下载 → 清洗 → 可用性检测 → M3U8/分片验证 → 输出
      ↓
tv_source/OuonnkiTV/
  ├─ full.json
  ├─ full-noadult.json
  ├─ adult.json
  ├─ lite.json
  └─ raw.json
      ↓
Vercel API
  ├─ /api/sources?type=full
  ├─ /api/sources?type=full-noadult
  ├─ /api/sources?type=adult
  ├─ /api/sources?type=lite
  ├─ /api/categories
  └─ /api/health
      ↓
aidou
```

## API

- `GET /api/sources?type=full`：全部可用源
- `GET /api/sources?type=full-noadult`：普通源
- `GET /api/sources?type=adult`：成人源
- `GET /api/sources?type=lite`：精简高速源
- `GET /api/sources?type=raw`：检测后的全量记录
- `GET /api/categories`：分类及数量
- `GET /api/health`：最近一次检测状态

API 只公开生成后的源注册数据，不需要把 GitHub 私有仓库 Token 放进 aidou 前端。

## 自动更新

GitHub Actions 每天自动执行：

1. 下载 LunaTV 源配置
2. 清洗并分类普通/成人源
3. 搜索检测
4. M3U8、视频分片验证
5. 可选播放测速
6. 生成五种源列表
7. 自动提交 `tv_source/`

也支持 Actions 手动触发。

## 本地运行

```bash
npm install
npm start
```

需要代理或 Telegram 通知时，在 `src/.env` 中配置，密钥不要提交。

## 部署 API

该仓库已经提供 Vercel Functions 配置，可直接把此私有仓库导入 Vercel。部署完成后，将 API 根地址配置到 aidou 的公开环境变量中，例如：

```
VITE_OUONNKI_SOURCE_API_URL=https://<your-domain>/api/sources?type=full
```

不要把 GitHub Token 放入前端环境变量。
