import glob from "fast-glob";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { minify } from "terser";

const packagePath = process.cwd();

const distPath = path.join(packagePath, "./dist");

const minifyPackageFiles = async (files: string[]) => {
  for (const file of files) {
    const isESModule = path.relative(distPath, file).split("/")[0] === "esm";
    const isIndex = path.basename(file) === "index.js";

    if (isIndex) continue;

    const source = await fs.readFile(file, { encoding: "utf8" });

    const result = await minify(
      source,
      isESModule
        ? {
            module: isESModule,
            compress: { module: isESModule },
            mangle: { module: isESModule },
          }
        : undefined,
    );

    if (result.code) await fs.writeFile(file, result.code);
  }
};

void (async () => {
  const files = await glob(path.join(distPath, "**/*.js"));

  await minifyPackageFiles(files);
})();
