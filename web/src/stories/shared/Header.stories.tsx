import { Header } from "ui/shared/Header";
import { sectionName } from "./sectionName";
import { getStoryFactory } from "stories/getStory";

const { meta, getStory } = getStoryFactory({
    sectionName,
    "wrappedComponent": { Header },
    "defaultContainerWidth": 0
});

export default meta;

export const VueDefault = getStory({
    userAuthenticationApi: {
        "isUserLoggedIn": false,
        "login": () => {
            console.log("Logging in");
            return new Promise<never>(() => {});
        }
    },
    "i18nApi": {
        "lang": "fr",
        "setLang": lang => {
            alert(`Changing language to ${lang}`);
        }
    },
    "routeName": "home"
});
