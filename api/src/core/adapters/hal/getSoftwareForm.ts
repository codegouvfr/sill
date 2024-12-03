import { SoftwareFormData, SoftwareType } from "../../usecases/readWriteSillData";
import { halAPIGateway } from "./HalAPI";
import { HalRawSoftware } from "./HalAPI/type";


const stringOfArrayIncluded = (stringArray: Array<string>, text: string): boolean => {
    return stringArray.some((arg: string) => {
        return text.includes(arg);
    });
};

const textToSoftwareType = (text: string): SoftwareType => {
    if (text.includes("docker")) {
        return {
            type: "cloud"
        };
    }

    const linux = stringOfArrayIncluded(["linux", "ubuntu", "unix", "multiplatform", "all"], text);
    const windows = stringOfArrayIncluded(["windows", "multiplatform", "all"], text);
    const mac = stringOfArrayIncluded(["mac", "unix", "multiplatform", "all"], text);

    const android = text.includes("android");
    const ios = stringOfArrayIncluded(["ios", "os x", "unix", "Multiplatform", "all"], text);

    return {
        type: "desktop/mobile",
        os: { "linux": linux, "windows": windows, "android": android, "ios": ios, "mac": mac }
    };
};

export const halRawSoftwareToSoftwareForm = async (halSoftware: HalRawSoftware): Promise<SoftwareFormData> => {

    const codemetaSoftware = await halAPIGateway.software.getCodemetaByUrl(halSoftware.uri_s);

    const formData: SoftwareFormData = {
        softwareName: halSoftware.title_s[0],
        softwareDescription: halSoftware.abstract_s ? halSoftware.abstract_s[0] : "",
        softwareType: textToSoftwareType(
            halSoftware.softPlatform_s ? halSoftware.softPlatform_s.join("").toLocaleLowerCase() : ""
        ),
        externalId: halSoftware.docid,
        comptoirDuLibreId: undefined,
        softwareLicense: codemetaSoftware?.license?.[0] ?? "undefined", // TODO 1 case to copyright
        softwareMinimalVersion: undefined,
        similarSoftwareExternalDataIds: [],
        softwareLogoUrl: undefined,
        softwareKeywords: halSoftware.keyword_s || [],

        isPresentInSupportContract: false,
        isFromFrenchPublicService: false,
        doRespectRgaa: null
    };

    return formData;
};