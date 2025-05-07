const GenerateSchema = require("generate-schema");
const fs = require("fs");

const schema = GenerateSchema.json("Catalogi translations schema", require("../src/customization/translations/en.json"));

fs.writeFileSync("./src/customization/translations/schema.json", JSON.stringify(schema, null, 2));