import { env } from "../env";
import { startSelfImportService } from "../rpc/self-import";

startSelfImportService(env).then(() =>
    console.info("[Entrypoint:Self-Import] Import sucessuful ✅ Closing self import")
);
