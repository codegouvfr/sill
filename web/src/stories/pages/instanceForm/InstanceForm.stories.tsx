import InstanceForm from "ui/pages/instanceForm/InstanceForm";
import { sectionName } from "./sectionName";
import { createMockRoute, getStoryFactory } from "stories/getStory";

const { meta, getStory } = getStoryFactory({
    sectionName,
    "wrappedComponent": { InstanceForm }
});

export default meta;

export const VueCreation = getStory({
    "route": createMockRoute("instanceCreationForm", {})
});

export const VueCreationPreselectedSoftware = getStory({
    "route": createMockRoute("instanceCreationForm", {
        "softwareName": "NextCloud"
    })
});

export const VueUpdate = getStory({
    "route": createMockRoute("instanceUpdateForm", {
        "id": 0
    })
});
