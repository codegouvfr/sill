import type { TrpcRouter } from "../rpc/router";
export type { TrpcRouter };

import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
export type TrpcRouterInput = inferRouterInputs<TrpcRouter>;
export type TrpcRouterOutput = inferRouterOutputs<TrpcRouter>;

export { type User } from "../rpc/user";
export { type Language, type LocalizedString, languages } from "../core/ports/GetSoftwareExternalData";
export type { ExternalDataOriginKind } from "../core/adapters/dbApi/kysely/kysely.database";

import type * as ApiTypes from "./ApiTypes";

export type { ApiTypes };
