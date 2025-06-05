import { env } from "../env";
import { startImportFromInnerIdentifersService } from "../rpc/import-from-inner-identifiers";

startImportFromInnerIdentifersService(env).then(() =>
    console.info(
        "[Entrypoint:Import-From-Inner-Identifiers] Import sucessuful ✅ Closing import from inner identifiers"
    )
);
