import * as fs from "fs";
import * as path from "path";

const packagePath = process.cwd();
const buildPath = path.join(packagePath, "./dist");

const rootPackageJson = path.join(packagePath, "package.json");
const readme = path.join(packagePath, "README.md");
const license = path.join(packagePath, "LICENSE");

const rootPackageJsonData = JSON.parse(
  fs.readFileSync(rootPackageJson, { encoding: "utf8" }),
) as {
  name: string;
  version: string;
  description: string;
  license: string;
  homepage?: string;
  repository: string;
  keywords: string[];
  peerDependencies: Record<string, string>;
  dependencies: Record<string, string>;
};

const npmPackageJson = {
  sideEffects: false,
  main: "index.js",
  types: "index.d.ts",
  module: "esm/index.js",
  name: rootPackageJsonData.name,
  version: rootPackageJsonData.version,
  description: rootPackageJsonData.description,
  license: rootPackageJsonData.license,
  homepage: rootPackageJsonData.homepage,
  repository: rootPackageJsonData.repository,
  keywords: rootPackageJsonData.keywords,
  peerDependencies: rootPackageJsonData.peerDependencies,
  dependencies: rootPackageJsonData.dependencies,
};

fs.copyFileSync(readme, path.join(buildPath, "README.md"));
fs.copyFileSync(license, path.join(buildPath, "LICENSE"));
fs.writeFileSync(
  path.join(buildPath, "package.json"),
  JSON.stringify(npmPackageJson, null, 2),
);
