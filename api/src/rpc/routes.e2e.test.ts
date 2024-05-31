import { expectToEqual } from "../tools/test.helpers";
import { describe, it } from "vitest";

describe("RPC e2e tests", () => {
    describe("route something", () => {
        it("works", () => {
            expectToEqual({ not: "bad" }, { not: "good" });
        });
    });
});
