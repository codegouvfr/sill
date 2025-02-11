import { env } from "./env";
import { startImportService } from "./rpc/import";

startImportService(env).then(() => console.log("Closing import"));
