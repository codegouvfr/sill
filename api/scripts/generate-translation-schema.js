// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

const GenerateSchema = require("generate-schema");
const fs = require("fs");
const path = require("path");

// Read the input translation file
const translationsPath = path.resolve(__dirname, "../src/rpc/translations/en_default.json");
const outputPath = path.resolve(__dirname, "../src/rpc/translations/schema.json");
const translations = require(translationsPath);

// Generate the base schema
console.log("Generating schema from translations...");
const schema = GenerateSchema.json("Catalogi translations schema", translations);

// Enhance the schema with translation-specific features
console.log("Enhancing schema with translation validation features...");

// Set schema version
schema.$schema = "http://json-schema.org/draft-07/schema#";
schema.description = "Schema for translation files with support for pluralization and validation";

// Add pattern properties for pluralization
schema.patternProperties = {
  "^.*_one$": {
    type: "string",
    description: "Singular form for translation"
  },
  "^.*_other$": {
    type: "string",
    description: "Plural form for translation"
  },
  "^.*_zero$": {
    type: "string",
    description: "Zero form for translation"
  }
};

// Recursively process all objects in the schema to:
// 1. Add additionalProperties: false to ensure no typos slip through
// 2. Add required properties so missing translations are flagged
// 3. Add descriptions where possible
// 4. Add examples from the translations
function enhanceSchemaObject(schemaObj, translationObj, path = "") {
  if (schemaObj.type === "object" && schemaObj.properties) {
    // Don't allow additional properties (catches typos)
    schemaObj.additionalProperties = false;

    // Make all properties required
    if (Object.keys(schemaObj.properties).length > 0) {
      schemaObj.required = Object.keys(schemaObj.properties);
    }

    // Process each property
    Object.entries(schemaObj.properties).forEach(([key, prop]) => {
      const currentPath = path ? `${path}.${key}` : key;

      // Add description based on key characteristics
      if (key.includes("hint")) {
        prop.description = "Helper text explaining the field";
      } else if (key.includes("title")) {
        prop.description = "Title text";
      } else if (key.includes("label")) {
        prop.description = "Label for a form field or button";
      } else if (key.includes("button")) {
        prop.description = "Text for a button";
      } else if (currentPath.startsWith("common")) {
        prop.description = "Common reusable translation";
      }

      // Add example from the original translation
      try {
        const pathParts = currentPath.split(".");
        let example = translationObj;
        let foundExample = true;

        for (const part of pathParts) {
          if (example && example[part] !== undefined) {
            example = example[part];
          } else {
            foundExample = false;
            break;
          }
        }

        if (foundExample && typeof example === "string") {
          prop.examples = [example];
        }
      } catch (e) {
        // Skip if can't extract example
      }

      // Recursively enhance nested objects
      if (prop.type === "object") {
        const nestedTranslationObj = getNestedObject(translationObj, currentPath.split("."));
        enhanceSchemaObject(prop, nestedTranslationObj || {}, currentPath);
      }
    });
  }
}

// Helper to safely navigate nested objects
function getNestedObject(obj, pathArray) {
  return pathArray.reduce((prev, curr) =>
    prev && prev[curr] ? prev[curr] : undefined, obj);
}

// Apply enhancements
enhanceSchemaObject(schema, translations);

// Write the enhanced schema
console.log(`Writing schema to ${outputPath}`);
fs.writeFileSync(outputPath, JSON.stringify(schema, null, 2));

console.log("✅ Schema generation complete!");
