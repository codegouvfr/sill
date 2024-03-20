import { ServiceProvider } from "../usecases/readWriteSillData";

export type ServiceProvidersBySillId = Partial<Record<string, ServiceProvider[]>>;

export type GetServiceProviders = {
    (): Promise<ServiceProvidersBySillId>;
    clear: () => void;
};
