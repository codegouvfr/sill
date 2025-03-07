/**
 * Examples:
 * '/sill'
 * ''
 **/
export const appPath = (() => {
    // For Vite, use import.meta.env.BASE_URL instead of process.env["PUBLIC_URL"]
    if (import.meta.env.BASE_URL === "/") {
        return "";
    }

    // Remove trailing slash if present
    return import.meta.env.BASE_URL.endsWith("/")
        ? import.meta.env.BASE_URL.slice(0, -1)
        : import.meta.env.BASE_URL;
})();

console.log({ appPath });

/**
 * Without trailing slash.
 *
 *  Examples:
 * 'https://code.gouv.fr/sill'
 * 'https://code.gouv.fr'
 * 'http://localhost:3000'
 * 'http://localhost:3000/sill'
 **/
export const appUrl = `${window.location.origin}${appPath}`;

/**
 * Without trailing slash.
 *
 * Example 'https://code.gouv.fr/sill/api'
 **/
export const apiUrl =
    process.env.NODE_ENV === "development" ? "http://localhost:3084" : `${appUrl}/api`;
