import DeclarationForm from "ui/pages/declarationForm/DeclarationForm";
import { sectionName } from "./sectionName";
import { createMockRoute, getStoryFactory } from "stories/getStory";

const { meta, getStory } = getStoryFactory({
    sectionName,
    wrappedComponent: { DeclarationForm }
});

export default meta;

export const WithCloudSoftware = getStory({
    route: createMockRoute("declarationForm", { name: "NextCloud" })
});

export const WithDesktopSoftware = getStory({
    route: createMockRoute("declarationForm", { name: "LibreOffice" })
});

export const WithOtherSoftware = getStory({
    route: createMockRoute("declarationForm", { name: "Debian" })
});
