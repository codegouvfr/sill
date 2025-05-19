import { Zenodo } from "./type";

export const makeZenodoApi = () => {
    return {
        records: {
            get: async (zenodoRecordId: number): Promise<Zenodo.Record> => {
                const url = `https://zenodo.org/api/records/${zenodoRecordId}`;

                const res = await fetch(url).catch(err => {
                    console.error(err);
                    throw new Error(err);
                });

                if (res.status === 404) {
                    throw new Error(`Could find ${zenodoRecordId}`);
                }

                return res.json();
            },
            getByNameAndType: async (name: string, type: string): Promise<Zenodo.Record[]> => {
                const url = `https://zenodo.org/api/records/q=title:${name} AND type:${type}`;

                const res = await fetch(url).catch(err => {
                    console.error(err);
                    throw new Error(err);
                });

                if (res.status === 404) {
                    throw new Error(`Could find endpoint`);
                }

                return res.json();
            }
        }
    };
};
