const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const { exec, execSync } = require("child_process");

const rootDir = path.join(__dirname, "..");
const rootPackageJsonPath = path.join(rootDir, "package.json");
const chartYamlPath = path.join(
	rootDir,
	"helm-charts",
	"catalogi",
	"Chart.yaml",
);

try {
	const packageJsonContent = fs.readFileSync(rootPackageJsonPath, "utf8");
	const { version: appVersion } = JSON.parse(packageJsonContent);

	if (!appVersion) {
		throw new Error("Version not found in root package.json");
	}

	const chartYamlContent = fs.readFileSync(chartYamlPath, "utf8");
	const chartYaml = yaml.load(chartYamlContent);

	if (chartYaml.appVersion !== appVersion) {
		console.log(
			`Updating Helm chart appVersion from ${chartYaml.appVersion} to ${appVersion}...`,
		);
		chartYaml.appVersion = appVersion;
		const newChartYamlContent = yaml.dump(chartYaml);
		fs.writeFileSync(chartYamlPath, newChartYamlContent, "utf8");
		console.log("✅ Helm chart appVersion updated");

		console.log("Calling bump script...");
		execSync(
			`node ${path.join(__dirname, "bump-chart-version.js")}`,
			{ stdio: "inherit" }, // This ensures the output of the bump script is shown
		);

	} else {
		console.log("✅ Helm chart appVersion is already in sync.");
	}
} catch (error) {
	console.error("❌ Error syncing Helm chart version:", error.message);
	process.exit(1);
}