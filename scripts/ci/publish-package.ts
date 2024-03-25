/* eslint-disable no-console */
import { exec } from "node:child_process";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { promisify } from "node:util";

const execCmd = promisify(exec);

const packagePath = process.cwd();

const distPath = path.join(packagePath, "./dist");

void (async () => {
  const distPackagePath = path.join(distPath, "package.json");

  const packageJSON = JSON.parse(
    await fs.readFile(distPackagePath, "utf-8"),
  ) as Record<string, unknown>;

  const { tag = "latest" } =
    (packageJSON.publishConfig as { tag: string } | undefined) ?? {};

  const { stderr, stdout } = await execCmd(`npm publish --tag ${tag}`);

  console.log({ stdout });
  console.error({ stderr });
})();
