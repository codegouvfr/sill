import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "fs";
import path from "path";
import svgr from "vite-plugin-svgr";

// Get the root package.json version for the DefinePlugin equivalent
const getRootPackageJsonVersion = () => {
    const packageJson = readFileSync("../package.json", "utf-8");
    return JSON.parse(packageJson).version;
};

// https://vitejs.dev/config/
export default defineConfig(async () => {
    // Dynamically import vite-tsconfig-paths
    const tsconfigPaths = (await import("vite-tsconfig-paths")).default;

    return {
        plugins: [
            react(),
            tsconfigPaths(),
            svgr({
                svgrOptions: {
                    exportType: "default",
                    ref: true,
                    svgo: false,
                    titleProp: true
                }
            })
        ],
        define: {
            "process.env.VERSION": JSON.stringify(getRootPackageJsonVersion()),
            "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
            // Define any other environment variables needed
            "process.env.PUBLIC_URL": JSON.stringify("")
        },
        resolve: {
            alias: {
                src: path.resolve(__dirname, "src")
            }
        },
        server: {
            port: 3000,
            open: true
        },
        build: {
            outDir: "build", // Same output directory as CRA
            sourcemap: true,
            commonjsOptions: {
                transformMixedEsModules: true
            }
        },
        assetsInclude: ["**/*.md"], // Treat markdown files as assets
        base: "/" // Set the base path for the application
    };
});
