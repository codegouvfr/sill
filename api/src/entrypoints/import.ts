import { env } from "../env";
import { startImportService } from "../rpc/import";

startImportService(env).then(() => console.info("[Entrypoint:Import] Import sucessuful ✅ Closing import"));
