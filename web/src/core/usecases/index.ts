import * as softwareCatalog from "./softwareCatalog";
import * as softwareDetails from "./softwareDetails";
import * as softwareForm from "./softwareForm";
import * as declarationForm from "./declarationForm";
import * as instanceForm from "./instanceForm";
import * as userAccountManagement from "./userAccountManagement";
import * as sillApiVersion from "./sillApiVersion";
import * as softwareUserAndReferent from "./softwareUserAndReferent";
import * as generalStats from "./generalStats";
import * as userAuthentication from "./userAuthentication";
import * as termsOfServices from "./termsOfServices";
import * as redirect from "./redirect";
import * as declarationRemoval from "./declarationRemoval";
import * as userProfile from "./userProfile";
import * as externalDataOrigin from "./externalDataOrigin";
import * as source from "./source.slice";

export const usecases = {
    source,
    softwareCatalog,
    softwareDetails,
    softwareForm,
    declarationForm,
    instanceForm,
    userAccountManagement,
    sillApiVersion,
    externalDataOrigin,
    softwareUserAndReferent,
    generalStats,
    userAuthentication,
    termsOfServices,
    redirect,
    declarationRemoval,
    userProfile
};
