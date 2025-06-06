/**
 * Increments the patch number of a semantic version string.
 * @param {string} versionString - The version to increment (e.g., "1.2.3").
 * @returns {string} The incremented version string (e.g., "1.2.4").
 */

const getBumpedVersion = versionString => {
	const parts = versionString.split(".");
	if (parts.length !== 3) {
		throw new Error(
			`Version "${versionString}" is not a valid x.y.z format.`,
		);
	}

	const patch = parseInt(parts[2], 10);
	if (isNaN(patch)) {
		throw new Error(`Patch version "${parts[2]}" is not a valid number.`);
	}

	parts[2] = patch + 1;
	return parts.join(".");
};

module.exports = { getBumpedVersion };