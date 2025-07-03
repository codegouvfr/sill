import { env } from "../env";
import { startUpdateService } from "../rpc/update";

startUpdateService(env).then(() => process.exit(0));
