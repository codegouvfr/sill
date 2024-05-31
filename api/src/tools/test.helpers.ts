import { expect } from "vitest";

export const expectToEqual = <T>(actual: T, expected: T) => {
    expect(actual).toEqual(expected);
};
