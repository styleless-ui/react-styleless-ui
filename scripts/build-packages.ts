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
    const relativePathToESM = path.join(
      (depth => {
        let path = "";

        for (let i = 0; i < depth; i++) path += i < depth - 1 ? "../" : "..";
        return path;
      })(relativePath.split("/").length),
      "esm",
      relativePath,
    );

    const packageJson: Record<string, unknown> = {
      sideEffects: false,
      exports: {
        ".": {
          import: {
            types: path.join(relativePathToESM, "index.d.ts"),
            default: path.join(relativePathToESM, "index.js"),
          },
          require: {
            types: typingsExist ? "./index.d.ts" : undefined,
            default: "./index.js",
          },
        },
      },
      types: typingsExist ? "./index.d.ts" : undefined,
      main: "./index.js",
      module: path.join(relativePathToESM, "index.js"),
    };

    const packageJsonPath = path.join(moduleDirectory, "package.json");

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  }
})();
