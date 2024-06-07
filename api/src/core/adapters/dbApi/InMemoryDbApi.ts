import { CompiledData } from "../../ports/CompileData";
import type { Db, DbApi } from "../../ports/DbApi";

export class InMemoryDbApi implements DbApi {
    #softwareRows: Db.SoftwareRow[] = [];
    #agentRows: Db.AgentRow[] = [];
    #softwareReferentRows: Db.SoftwareReferentRow[] = [];
    #softwareUserRows: Db.SoftwareUserRow[] = [];
    #instanceRows: Db.InstanceRow[] = [];

    #compiledData: CompiledData<"private"> = [];

    async fetchDb() {
        return {
            softwareRows: this.#softwareRows,
            agentRows: this.#agentRows,
            softwareReferentRows: this.#softwareReferentRows,
            softwareUserRows: this.#softwareUserRows,
            instanceRows: this.#instanceRows
        };
    }

    async updateDb({ newDb }: { newDb: Db }) {
        this.#softwareRows = newDb.softwareRows;
        this.#agentRows = newDb.agentRows;
        this.#softwareReferentRows = newDb.softwareReferentRows;
        this.#softwareUserRows = newDb.softwareUserRows;
        this.#instanceRows = newDb.instanceRows;
    }

    async fetchCompiledData() {
        return this.#compiledData;
    }

    async updateCompiledData({ newCompiledData }: { newCompiledData: CompiledData<"private"> }) {
        this.#compiledData = newCompiledData;
    }

    // test helpers

    get softwareRows() {
        return this.#softwareRows;
    }

    get agentRows() {
        return this.#agentRows;
    }

    get softwareReferentRows() {
        return this.#softwareReferentRows;
    }

    get softwareUserRows() {
        return this.#softwareUserRows;
    }

    get instanceRows() {
        return this.#instanceRows;
    }
}
