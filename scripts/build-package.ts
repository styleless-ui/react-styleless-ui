import glob from "fast-glob";
import * as fs from "node:fs/promises";
import * as path from "node:path";

type PackageJson = Record<string, unknown>;

const packagePath = process.cwd();

const distPath = path.join(packagePath, "dist");

const README_FILE_NAME = "README.md";
const LICENSE_FILE_NAME = "README.md";

const readme = path.join(packagePath, README_FILE_NAME);
const license = path.join(packagePath, LICENSE_FILE_NAME);

const moduleDirectories = glob
  .sync(path.join(distPath, "**/index.js"), { ignore: ["**/esm/**"] })
  .map(p => path.dirname(p));

const doesFileExist = async (filePath: string) => {
  try {
    await fs.stat(filePath);

    return true;
  } catch {
    return false;
  }
};

const createModulePackages = async () => {
  for (const moduleDirectory of moduleDirectories) {
    const typesPath = path.join(moduleDirectory, "index.d.ts");
    const relativePath = path.relative(distPath, moduleDirectory);

    const constructDirectoryNotation = () => {
      if (relativePath.length === 0) return ".";

      let path = "";
      const depth = relativePath.split("/").length;

      for (let i = 0; i < depth; i++) path += i < depth - 1 ? "../" : "..";

      return path;
    };

    const relativePathToESM = path.join(
      constructDirectoryNotation(),
      "esm",
      relativePath,
    );

    const typesExist = await doesFileExist(typesPath);

    const packageJsonPath = path.join(moduleDirectory, "package.json");

    await fs.writeFile(
      packageJsonPath,
      JSON.stringify(
        {
          sideEffects: false,
          types: typesExist ? "./index.d.ts" : undefined,
          main: "./index.js",
          module: path.join(relativePathToESM, "index.js"),
        },
        null,
        2,
      ),
    );
  }
};

const createMainPackage = async () => {
  const rootPackagePath = path.join(packagePath, "package.json");
  const distPackagePath = path.join(distPath, "package.json");

  const packageJSON = JSON.parse(
    await fs.readFile(rootPackagePath, "utf-8"),
  ) as PackageJson;

  await fs.writeFile(
    distPackagePath,
    JSON.stringify(
      {
        exports: {
          ".": {
            import: {
              types: "./esm/index.d.ts",
              default: "./esm/index.js",
            },
            require: {
              types: "./index.d.ts",
              default: "./index.js",
            },
          },
          "./utils": {
            import: {
              types: "./esm/utils/index.d.ts",
              default: "./esm/utils/index.js",
            },
            require: {
              types: "./utils/index.d.ts",
              default: "./utils/index.js",
            },
          },
        },
        sideEffects: false,
        types: "./index.d.ts",
        main: "./index.js",
        module: "./esm/index.js",
        engines: packageJSON.engines,
        publishConfig: packageJSON.publishConfig,
        name: packageJSON.name,
        type: packageJSON.type,
        version: packageJSON.version,
        license: packageJSON.license,
        homepage: packageJSON.homepage,
        description: packageJSON.description,
        keywords: packageJSON.keywords,
        repository: packageJSON.repository,
        dependencies: packageJSON.dependencies,
        peerDependencies: packageJSON.peerDependencies,
        peerDependenciesMeta: packageJSON.peerDependenciesMeta,
      },
      null,
      2,
    ),
  );
};

const createNPMRC = async () => {
  const npmrcPath = path.join(distPath, ".npmrc");
  const npmignorePath = path.join(distPath, ".npmignore");

  await fs.writeFile(
    npmrcPath,
    [
      "//registry.npmjs.org/:_authToken=${NODE_AUTH_TOKEN}",
      "registry=https://registry.npmjs.org/",
      "always-auth=true",
    ].join("\n"),
  );

  await fs.writeFile(npmignorePath, ".npmrc");
};

void (async () => {
  await createModulePackages();
  await createMainPackage();
  await createNPMRC();

  await fs.copyFile(readme, path.join(distPath, README_FILE_NAME));
  await fs.copyFile(license, path.join(distPath, LICENSE_FILE_NAME));
})();
