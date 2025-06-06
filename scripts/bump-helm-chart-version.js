const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const rootDir = path.join(__dirname, "..");

const chartYamlPath = path.join(
  rootDir,
  "helm-charts",
  "catalogi",
  "Chart.yaml"
);

try {
  const chartYamlContent = fs.readFileSync(chartYamlPath, "utf8");
  const chartYaml = yaml.load(chartYamlContent);
  const currentVersion = chartYaml.version;

  // --- This is the new, dependency-free logic ---
  const parts = currentVersion.split(".");
  if (parts.length !== 3) {
    throw new Error(
      `Chart version "${currentVersion}" is not a valid x.y.z format.`
    );
  }

  const patch = parseInt(parts[2], 10);
  if (isNaN(patch)) {
    throw new Error(`Patch version "${parts[2]}" is not a valid number.`);
  }

  parts[2] = patch + 1;
  const newVersion = parts.join(".");
  // --- End of new logic ---

  console.log(
    `Bumping Helm chart version from ${currentVersion} to ${newVersion}...`
  );
  chartYaml.version = newVersion;
  const newChartYamlContent = yaml.dump(chartYaml);
  fs.writeFileSync(chartYamlPath, newChartYamlContent, "utf8");
  console.log("✅ Helm chart version bumped.");
} catch (error) {
  console.error("❌ Error bumping Helm chart version:", error.message);
  process.exit(1);
}
