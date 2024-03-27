/*
We use this file to in order to be able to use webpack plugin without
ejecting from CRA.
This file is picked up by react-app-rewired that we use in place or react-scripts
*/

// This is an webpack extension to detect circular import (example:  A imports B that imports A)
const CircularDependencyPlugin = require("circular-dependency-plugin");
const { DefinePlugin } = require("webpack");
const fs = require("fs");

const getRootPackageJsonVersion = () => {
    const packageJson = fs.readFileSync("../package.json");
    return JSON.parse(packageJson).version;
};

module.exports = function override(config) {
    if (!config.resolve.fallback) {
        config.resolve.fallback = {};
    }

    if (!config.plugins) {
        config.plugins = [];
    }

    config.plugins.push(
        ...[
            new CircularDependencyPlugin({
                // exclude detection of files based on a RegExp
                "exclude": /node_modules/,
                // add errors to webpack instead of warnings
                "failOnError": true,
                // allow import cycles that include an asynchronous import,
                // e.g. via import(/* webpackMode: "weak" */ './file.js')
                "allowAsyncCycles": false,
                // set the current working directory for displaying module paths
                "cwd": process.cwd()
            }),
            // This let us display the version number in the footer of the app.
            new DefinePlugin({
                "process.env.VERSION": JSON.stringify(getRootPackageJsonVersion())
            })
        ]
    );

    return config;
};
