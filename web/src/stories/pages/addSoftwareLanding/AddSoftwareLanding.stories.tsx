import AddSoftwareLanding from "ui/pages/addSoftwareLanding/AddSoftwareLanding";
import { sectionName } from "./sectionName";
import { createMockRoute, getStoryFactory } from "stories/getStory";

const { meta, getStory } = getStoryFactory({
    sectionName,
    "wrappedComponent": { AddSoftwareLanding },
    "defaultContainerWidth": 0
});

export default meta;

export const VueDefault = getStory({
    "route": createMockRoute("addSoftwareLanding", undefined)
});
