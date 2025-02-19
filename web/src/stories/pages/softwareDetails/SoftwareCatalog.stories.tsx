import SoftwareDetails from "ui/pages/softwareDetails/SoftwareDetails";
import { sectionName } from "./sectionName";
import { createMockRoute, getStoryFactory } from "stories/getStory";

const { meta, getStory } = getStoryFactory({
    sectionName,
    wrappedComponent: { SoftwareDetails },
    defaultContainerWidth: 0
});

export default meta;

export const VueDefault = getStory({
    route: createMockRoute("softwareDetails", {
        name: "NextCloud"
    })
});
