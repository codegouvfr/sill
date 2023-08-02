import * as account from "./account";
import * as addSoftwareLanding from "./addSoftwareLanding";
import * as declarationForm from "./declarationForm";
import * as home from "./home";
import * as instanceForm from "./instanceForm";
import * as page404 from "./page404";
import * as readme from "./readme";
import * as softwareCatalog from "./softwareCatalog";
import * as softwareDetails from "./softwareDetails";
import * as softwareForm from "./softwareForm";
import * as softwareUserAndReferent from "./softwareUserAndReferent";
import * as terms from "./terms";
import * as redirect from "./redirect";
import * as userProfile from "./userProfile";

import { objectKeys } from "tsafe/objectKeys";
import type { UnionToIntersection } from "tsafe";

export const pages = {
    account,
    addSoftwareLanding,
    declarationForm,
    home,
    instanceForm,
    readme,
    softwareCatalog,
    softwareDetails,
    softwareForm,
    softwareUserAndReferent,
    terms,
    redirect,
    userProfile,
    page404
};

export const routeDefs = {} as UnionToIntersection<
    (typeof pages)[keyof typeof pages]["routeDefs"]
>;

objectKeys(pages).forEach(pageName =>
    Object.assign(routeDefs, pages[pageName].routeDefs)
);
