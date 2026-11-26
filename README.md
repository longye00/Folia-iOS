# Folia-Sonnet 

这是将 Folia 打包到移动平台的实验性项目，不是官方移动端客户端，也不代表 Folia 主项目的移动端计划。本仓库版本基于 Folia-major 0.6.7 正式版，请按照下面的说明自行构建。**项目不提供构建完成的安装包**。

> [!WARNING]
> 本仓库仅作为移动端打包示范，不会继续维护并同步 Folia-major 主仓库的更新。功能、兼容性、构建链均可能随时失效；请自行 fork、审计并维护你的副本。

## 范围与限制

此移动构建不包含内置的在线音乐后端，你需要按照 Web 版本部署的方案自行部署后端服务。

- Android / iOS 容器基于 Capacitor，主要用于验证 Folia 的界面与前台播放体验。
- 不承诺本地音乐扫描、可靠后台/锁屏连续播放、系统媒体控制或应用商店发布支持。
- iOS 当前与 Android 一样隐藏本地音乐导入入口；Navidrome 与在线音乐 API 应使用 HTTPS。
- 在线音乐、歌词、封面及其他第三方内容的版权归相应权利人所有。请遵守所在地法律及服务条款，并通过官方渠道支持正版内容。

## 准备后端服务

复制 `.env.example` 为 `.env.local`，按需部署对应的后端服务：

- `VITE_NETEASE_API_BASE`：网易云 API 实例。
- `VITE_KUGOU_API_BASE`：Web 版 KuGouMusicApi 实例。
- `VITE_FOLIA_API_BASE`：AI 主题或歌词代理所需的 HTTPS API 根地址。

前两者可以参考主仓库 Web 版本的部署方法。`VITE_FOLIA_API_BASE` 的部署方法见下文。移动端打包时应优先使用 HTTPS 地址；未配置的在线服务会在运行时提示不可用，但不影响打开 App。

## Android 构建

准备 Node.js 24+、JDK 17、Android Studio 以及 Android SDK 后：

```bash
npm ci
```

Windows 构建调试 APK：

```bash
npm run build:android:debug
```

macOS/Linux：

```bash
npm run cap:sync:android
cd android
./gradlew assembleDebug
```

输出文件：`android/app/build/outputs/apk/debug/app-debug.apk`。

发布 AAB、签名和完整工具链说明见 [技术与开发说明](docs/technical.md#android--capacitor)。

## iOS IPA 构建（Windows + GitHub Actions）

Windows 不能运行 Xcode，但可以本仓库提供的 GitHub Actions 工作流在云端的 `macos-26` runner 上构建**未签名 IPA**，然后在 Windows 上用签名工具安装到自己的 iPhone。

### 1. 准备 GitHub 仓库

将本仓库 fork 或上传到你自己的 GitHub 仓库。GitHub Actions 需要在云端访问完整源码；不要把 `.env.local`、AI Key、账号 Cookie 或签名证书提交进仓库。

### 2. 配置移动端 API 地址

在仓库 **Settings → Secrets and variables → Actions → Variables** 中按需创建：

| 变量 | 用途 |
| --- | --- |
| `IOS_NETEASE_API_BASE` | 网易云 API HTTPS 地址 |
| `IOS_KUGOU_API_BASE` | 酷狗 API HTTPS 地址 |
| `IOS_FOLIA_API_BASE` | Folia API HTTPS 地址，通常形如 `https://你的-vercel-项目.vercel.app/api` |

也可以在下一次手动运行工作流时直接填写输入值；输入值会优先于仓库变量。以上地址会被打包进 IPA，因此不要在这里填写 AI Key、Cookie 或其他秘密。AI Key 只能放在你自行部署的服务端环境变量中。

### 3. 运行云构建

进入 GitHub 仓库的 **Actions → Build iOS IPA (Unsigned) → Run workflow**，按需填写 API 地址并运行。成功后下载名为 `folia-ios-unsigned-ipa` 的 artifact，解压后得到 `Folia-unsigned.ipa`。

工作流使用 Xcode 26 / iOS 15+ / Capacitor 8 SPM 构建。产物是**未签名 IPA**，iPhone 不能直接安装，必须在下一步签名。

### 4. 在 Windows 上签名并安装到 iPhone

常见方式是使用 Sideloadly 或 AltStore：

1. 在 Windows 上安装并打开 Sideloadly。
2. 用数据线连接 iPhone，并在 iPhone 上信任电脑。
3. 将 `Folia-unsigned.ipa` 拖入 Sideloadly。
4. 输入你的 Apple ID，按工具提示开始签名与安装。
5. 首次打开前，在 iPhone 的 **设置 → 通用 → VPN 与设备管理** 中信任对应开发者证书。

免费 Apple ID 签名的应用通常 7 天后过期，需要重新签名安装；付费 Apple Developer 账号的签名有效期通常为 1 年，也更适合 TestFlight 分发。企业证书、来路不明的签名服务和共享证书有账号与隐私风险，不建议使用。

### 5. 如果你有一台 Mac

也可以本地构建同样的未签名 IPA：

```bash
npm ci
npm run cap:assets:ios
npm run cap:sync:ios
cd ios/App
xcodebuild \
  -project App.xcodeproj \
  -scheme App \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  -derivedDataPath build \
  CODE_SIGNING_ALLOWED=NO \
  CODE_SIGNING_REQUIRED=NO \
  CODE_SIGN_IDENTITY="" \
  DEVELOPMENT_TEAM="" \
  build
mkdir -p Payload
cp -R build/Build/Products/Release-iphoneos/App.app Payload/
zip -qry Folia-unsigned.ipa Payload
```

## 部署 Folia API 到 Vercel

`VITE_FOLIA_API_BASE` 指向本仓库的 Vercel Serverless API，用于 AI 主题生成和歌词代理。部署步骤：

1. 将此仓库 fork 到你的 GitHub 账号，在 Vercel 中选择 **Add New → Project** 并导入该 fork；保留仓库中的 `vercel.json` 默认构建配置。
2. 在 Vercel 项目的 **Settings → Environment Variables** 中配置一种 AI 提供商：
   - Gemini：`GEMINI_API_KEY`。
   - OpenAI 兼容服务：`OPENAI_API_KEY`、`OPENAI_API_URL` 和 `OPENAI_API_MODEL`；可选 `OPENAI_API_TEMPERATURE`。
3. 部署完成后，将移动端 `.env.local` 或仓库变量中的值设为：

   ```env
   VITE_FOLIA_API_BASE=https://你的-vercel-项目.vercel.app/api
   ```

4. 重新执行对应移动端构建。

密钥只应填写在 Vercel 环境变量中，绝不能写入 `.env.local`、`VITE_*`、APK 或 IPA。该 API 为跨域客户端设计，部署者应自行承担访问控制、配额与费用风险；不要为没有限额或滥用防护的高额度密钥公开部署。

## 许可证

本项目采用 [AGPL-3.0](LICENSE) 许可证。使用、修改或分发前请阅读许可证全文。
