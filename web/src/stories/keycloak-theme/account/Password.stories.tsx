import type { ComponentMeta } from "@storybook/react";
import { createPageStory } from "./createPageStory";

const pageId = "password.ftl";

const { PageStory } = createPageStory({ pageId });

const meta: ComponentMeta<typeof PageStory> = {
    title: `keycloak-theme/account/${pageId}`,
    component: PageStory
};

export default meta;

export const Default = () => <PageStory />;
