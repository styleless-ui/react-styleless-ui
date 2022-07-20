import glob from "fast-glob";
import * as fs from "fs";
import * as path from "path";

const packagePath = process.cwd();
const buildPath = path.join(packagePath, "./dist");

void (async () => {
  const moduleDirectories = (
    await glob(path.join(buildPath, "**/*/index.js"), { ignore: ["**/esm/**"] })
  ).map(_path => path.dirname(_path));

  for (const moduleDirectory of moduleDirectories) {
    const typingsPath = path.join(moduleDirectory, "index.d.ts");
    const typingsExist = fs.existsSync(typingsPath);

    const relativePath = path.relative(buildPath, moduleDirectory);

    const packageJson: Record<string, unknown> = {
      sideEffects: false,
      module: path.join(
        (depth => {
          let path = "";
          for (let i = 0; i < depth; i++) path += i < depth - 1 ? "../" : "..";
          return path;
        })(relativePath.split("/").length),
        "esm",
        relativePath,
        "index.js"
      ),
      main: "./index.js"
    };

    if (typingsExist) packageJson.types = "./index.d.ts";

    const packageJsonPath = path.join(moduleDirectory, "package.json");

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  }
})();
