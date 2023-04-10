import glob from "fast-glob";
import * as fs from "fs";
import * as path from "path";
import { minify } from "terser";

const packagePath = process.cwd();
const buildPath = path.join(packagePath, "./dist");

const minifyFiles = async (files: string[]) => {
  for (const file of files) {
    const isESModule = path.relative(buildPath, file).split("/")[0] === "esm";
    const isIndex = path.basename(file) === "index.js";

    if (isIndex) continue;

    const source = fs.readFileSync(file, { encoding: "utf8" });
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

    if (result.code) fs.writeFileSync(file, result.code);
  }
};

void (async () => {
  await minifyFiles(await glob(path.join(buildPath, "**/*/*.js")));
})();
