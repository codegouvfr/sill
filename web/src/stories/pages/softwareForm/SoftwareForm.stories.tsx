import SoftwareForm from "ui/pages/softwareForm/SoftwareForm";
import { sectionName } from "../sectionName";
import { createMockRoute, getStoryFactory } from "stories/getStory";

const { meta, getStory } = getStoryFactory({
    sectionName,
    wrappedComponent: { SoftwareForm }
});

export default meta;

export const VueCreation = getStory({
    route: createMockRoute("softwareCreationForm", {
        externalId: undefined
    })
});

export const VueUpdate = getStory({
    route: createMockRoute("softwareUpdateForm", {
        name: "NextCloud"
    })
});
