# OuonnkiTV-Source 使用说明

## 1. 架构

```
LunaTV-config
    ↓
GitHub Actions
    ↓
生成 tv_source/OuonnkiTV/*.json
    ↓
GitHub Raw
    ↓
aidou
```

本仓库不需要 Vercel，也不需要独立域名。

## 2. GitHub Actions

进入：

```
GitHub → Actions → Update TV Source
```

支持：

- 每日定时运行
- 手动运行
- main 更新触发

生成结果位于：

```
tv_source/OuonnkiTV/full.json
tv_source/OuonnkiTV/full-noadult.json
tv_source/OuonnkiTV/adult.json
tv_source/OuonnkiTV/lite.json
tv_source/OuonnkiTV/raw.json
```

## 3. aidou 使用地址

完整源：

```
https://raw.githubusercontent.com/2283817439/OuonnkiTV-Source/main/tv_source/OuonnkiTV/full.json
```

普通源：

```
https://raw.githubusercontent.com/2283817439/OuonnkiTV-Source/main/tv_source/OuonnkiTV/full-noadult.json
```

成人源：

```
https://raw.githubusercontent.com/2283817439/OuonnkiTV-Source/main/tv_source/OuonnkiTV/adult.json
```

精简源：

```
https://raw.githubusercontent.com/2283817439/OuonnkiTV-Source/main/tv_source/OuonnkiTV/lite.json
```

检测后的全量记录：

```
https://raw.githubusercontent.com/2283817439/OuonnkiTV-Source/main/tv_source/OuonnkiTV/raw.json
```

## 4. 可选 Actions Secrets

| Secret | 用途 | 必须 |
|---|---|---|
| `PROXY_URL` | 源检测代理 | 否 |
| `TG_BOT_TOKEN` | Telegram 通知 | 否 |
| `TG_CHAT_ID` | Telegram 通知目标 | 否 |

不要把这些值提交到仓库。

## 5. aidou 运行方式

aidou 浏览器直接请求 GitHub Raw JSON。

Source Manager 只负责：

- 采集源
- 检测源
- 分类
- 生成 JSON

aidou 负责：

- 加载 Source Registry
- 搜索
- 获取详情
- 获取播放地址
- 播放

两边独立迭代。

## 6. 排查

如果 aidou 没有源：

1. 检查 Actions 是否生成 JSON。
2. 检查 `tv_source/OuonnkiTV/full.json` 是否存在且为数组。
3. 浏览器打开 GitHub Raw 地址确认能返回 JSON。
4. 再检查 aidou 的订阅刷新状态。

如果 JSON 数量明显少于 `raw.json`，检查 `src/04_convert_ouonnkitv.js` 的过滤规则以及 `LunaTV-check-result.json`。
