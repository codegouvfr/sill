import { decodeJwt as decodeJwt_vanilla } from "oidc-spa/tools/decodeJwt";

export function encodeJwt(obj: Record<string, unknown>) {
    return `mock_${JSON.stringify(obj)}`;
}

export function decodeJwt<T extends Record<string, unknown>>(token: string): T {
    mock: {
        const match = token.match(/^mock_(.*)$/);

        if (match === null) {
            break mock;
        }

        return JSON.parse(match[1]);
    }

    return decodeJwt_vanilla(token);
}
