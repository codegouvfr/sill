import { InstanceForm } from "ui-dsfr/pages/InstanceForm";
import { sectionName } from "./sectionName";
import { createMockRoute, getStoryFactory } from "stories/getStory";

const { meta, getStory } = getStoryFactory({
    sectionName,
    "wrappedComponent": { InstanceForm }
});

export default meta;

export const VueCreation = getStory({
    "route": createMockRoute("instanceCreationForm", {
        "softwareName": "NextCloud"
    })
});

export const VueUpdate = getStory({
    "route": createMockRoute("instanceUpdateForm", {
        "id": 0
    })
});