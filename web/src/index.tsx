import { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { MuiDsfrThemeProvider } from "@codegouvfr/react-dsfr/mui";
import { startReactDsfr } from "@codegouvfr/react-dsfr/spa";
import { assert } from "tsafe/assert";
import "./ui/i18n/i18next";

startReactDsfr({ defaultColorScheme: "system" });

const App = lazy(() => import("ui/App"));

createRoot(
    (() => {
        const rootElement = document.getElementById("root");

        assert(rootElement !== null);

        return rootElement;
    })()
).render(
    <Suspense>
        <MuiDsfrThemeProvider>
            <App />
        </MuiDsfrThemeProvider>
    </Suspense>
);
