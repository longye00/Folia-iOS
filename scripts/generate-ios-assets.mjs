import { access, copyFile, mkdir, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// 当前文件：从 android/img/icon.png 重复生成 iOS 图标和浅色/深色启动资源。

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = join(projectRoot, 'android', 'img');
const stagingRoot = join(projectRoot, 'ios', '.asset-staging');
const iconStage = join(stagingRoot, 'icon');
const assetsCli = join(
  projectRoot,
  'node_modules',
  '@capacitor',
  'assets',
  'bin',
  'capacitor-assets',
);

const sourceFiles = {
  icon: join(sourceDir, 'icon.png'),
};

// Runs one deterministic Capacitor Assets pass and forwards its output to the caller.
const runAssets = (assetPath, extraArgs = []) => {
  const result = spawnSync(
    process.execPath,
    [assetsCli, 'generate', '--ios', '--assetPath', assetPath, ...extraArgs],
    {
      cwd: projectRoot,
      stdio: 'inherit',
    },
  );

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`Capacitor Assets exited with code ${result.status ?? 'unknown'}.`);
  }
};

const main = async () => {
  await Promise.all(Object.values(sourceFiles).map((file) => access(file)));
  await rm(stagingRoot, { recursive: true, force: true });
  await mkdir(iconStage, { recursive: true });

  try {
    await copyFile(sourceFiles.icon, join(iconStage, 'logo.png'));

    runAssets(relative(projectRoot, iconStage), [
      '--iconBackgroundColor', '#efedf8',
      '--iconBackgroundColorDark', '#11142b',
      '--splashBackgroundColor', '#efedf8',
      '--splashBackgroundColorDark', '#11142b',
    ]);
  } finally {
    await rm(stagingRoot, { recursive: true, force: true });
  }
};

await main();
