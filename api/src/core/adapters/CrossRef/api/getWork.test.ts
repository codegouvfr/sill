import { describe, it, expect, vi, beforeAll } from "vitest";
import { getWork } from "./getWork";

describe("CrossRef > API > getWork", () => {
    const mockResponse = {
        message: {
            DOI: "10.1234/example",
            title: ["Article title"]
        }
    };

    let originalFetch: typeof global.fetch;

    beforeAll(() => {
        // Store the original fetch function
        originalFetch = global.fetch;
    });

    it("should fetch and return the work data", async () => {
        global.fetch = vi.fn().mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => mockResponse
        });

        const result = await getWork("10.1234/example");
        expect(result).toEqual(mockResponse);
        expect(fetch).toHaveBeenCalledWith("https://api.crossref.org/works/10.1234/example");
    });

    it("should retry on 429 status code", async () => {
        global.fetch = vi
            .fn()
            .mockResolvedValueOnce({
                status: 429
            })
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => mockResponse
            });

        const result = await getWork("10.1234/example");
        expect(result).toEqual(mockResponse);
        expect(fetch).toHaveBeenCalledTimes(2);
    });

    it("should return undefined on 404 status code", async () => {
        global.fetch = vi.fn().mockResolvedValueOnce({
            status: 404
        });

        const result = await getWork("10.1234/example");
        expect(result).toEqual(undefined);
    });

    it("should throw an error if fetch fails", async () => {
        global.fetch = vi.fn().mockRejectedValueOnce(new Error("Network error"));

        await expect(getWork("10.1234/example")).rejects.toThrow(undefined);
    });

    it("should fetch and return real work data", async () => {
        global.fetch = originalFetch;

        const doi = "10.1051/proc/202068006";
        const result = await getWork(doi);

        expect(result).toBeDefined();
        expect(result?.message.DOI).toEqual("10.1051/proc/202068006");
        expect(result?.message.title).toEqual(["Change-point detection, segmentation, and related topics"]);
    });

    it("live test : should return undefined a wrong DOI", async () => {
        global.fetch = originalFetch;

        const result = await getWork("10.1051/proc/202068006.");
        expect(result).toEqual(undefined);
    });

    it("live test : should return undefined on unexisting DOI", async () => {
        global.fetch = originalFetch;

        const result = await getWork("10.12345/example");
        expect(result).toEqual(undefined);
    });
});
