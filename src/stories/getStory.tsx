import { useEffect } from "react";
import type { Meta, Story } from "@storybook/react";
import type { ArgType } from "@storybook/addons";
import { symToStr } from "tsafe/symToStr";
import { id } from "tsafe/id";
import { useIsDark } from "@codegouvfr/react-dsfr/useIsDark";
import { setUseLang } from "@codegouvfr/react-dsfr/spa";
import { useLang } from "ui/i18n";
import { MuiDsfrThemeProvider } from "@codegouvfr/react-dsfr/mui";
import { createMockRouteFactory } from "ui/routes";
import { Evt } from "evt";
import { useRerenderOnStateChange } from "evt/hooks";
import { createCoreProvider } from "core";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { assert } from "tsafe/assert";

const evtTriggerReRender = Evt.create(0);

setUseLang({
    "useLang": () => {
        const { lang } = useLang();
        return lang;
    }
});

const { CoreProvider } = createCoreProvider({
    "apiUrl": "",
    "appUrl": "",
    "isUserInitiallyLoggedIn": true,
    "transformUrlBeforeRedirectToLogin": () => {
        assert(false);
    },
    "getCurrentLang": () => "fr",
    "onMoved": () => {
        assert(false);
    }
});

export const { createMockRoute } = createMockRouteFactory({
    "triggerReRender": () => {
        evtTriggerReRender.state++;
    }
});

export function getStoryFactory<Props extends Record<string, any>>(params: {
    sectionName: string;
    wrappedComponent: Record<string, (props: Props) => JSX.Element | null>;
    /** https://storybook.js.org/docs/react/essentials/controls */
    argTypes?: Partial<Record<keyof Props, ArgType>>;
    defaultContainerWidth?: number;
    disabledProps?: ("containerWidth" | "lang" | "darkMode")[];
}) {
    const {
        sectionName,
        wrappedComponent,
        argTypes = {},
        defaultContainerWidth,
        disabledProps = []
    } = params;

    const Component: any = Object.entries(wrappedComponent).map(
        ([, component]) => component
    )[0];

    document.documentElement.style.overflowY = "scroll";

    const Template: Story<
        Props & {
            darkMode: boolean;
            containerWidth: number;
            isFirstStory: boolean;
            lang: "fr" | "en";
        }
    > = ({ darkMode, containerWidth, isFirstStory, lang, ...props }) => {
        const { setIsDark } = useIsDark();

        useRerenderOnStateChange(evtTriggerReRender);

        useEffect(() => {
            if (disabledProps.includes("darkMode")) {
                return;
            }
            if (!isFirstStory) {
                return;
            }

            setIsDark(darkMode);
        }, [darkMode]);

        const { setLang } = useLang();

        useEffect(() => {
            setLang(lang);
        }, [lang]);

        if (containerWidth !== 0) {
            return (
                <div className="container" style={{ "width": containerWidth }}>
                    <Component {...props} />
                </div>
            );
        }

        return <Component {...props} />;
    };

    let isFirstStory = true;

    function getStory(
        props: Props,
        params?: { defaultContainerWidth?: number; description?: string }
    ): typeof Template {
        const { defaultContainerWidth: defaultContainerWidthStoryLevel, description } =
            params ?? {};

        const out = Template.bind({});

        out.args = {
            "darkMode": window.matchMedia("(prefers-color-scheme: dark)").matches,
            "containerWidth":
                defaultContainerWidthStoryLevel ?? defaultContainerWidth ?? 0,
            "lang": "fr" as const,
            isFirstStory,
            ...props
        };

        isFirstStory = false;

        out.parameters = {
            "docs": {
                "description": {
                    "story": description
                }
            }
        };

        return out;
    }

    const componentName = symToStr(wrappedComponent);

    return {
        "meta": id<Meta>({
            "title": `${sectionName}/${componentName}`,
            "component": Component,
            "decorators": [
                Story => (
                    <CoreProvider>
                        <CacheProvider
                            value={createCache({
                                "key": "css",
                                "prepend": false
                            })}
                        >
                            <MuiDsfrThemeProvider>
                                <Story />
                            </MuiDsfrThemeProvider>
                        </CacheProvider>
                    </CoreProvider>
                )
            ],
            "argTypes": {
                "darkMode": {
                    "table": {
                        "disable": disabledProps.includes("darkMode")
                    },
                    "description": "Global color scheme enabled, light or dark"
                },
                "containerWidth": {
                    "control": {
                        "type": "range",
                        "min": 0,
                        "max": 1920,
                        "step": 10
                    },
                    "table": {
                        "disable": disabledProps.includes("containerWidth")
                    },
                    "description": `Play with the width of the parent component. Note that this isn't meant for testing the
                    responsiveness of the components. For that you have [the viewports](https://youtu.be/psLbgPfEzZY).`
                },
                "lang": {
                    "options": ["fr", "en"],
                    "control": {
                        "type": "select"
                    },
                    "table": {
                        "disable": disabledProps.includes("lang")
                    }
                },
                "isFirstStory": {
                    "table": {
                        "disable": true
                    }
                },
                ...argTypes
            }
        }),
        getStory
    };
}

export function logCallbacks<T extends string>(
    propertyNames: readonly T[]
): Record<T, () => void> {
    const out: Record<T, () => void> = id<Record<string, never>>({});

    propertyNames.forEach(
        propertyName => (out[propertyName] = console.log.bind(console, propertyName))
    );

    return out;
}
