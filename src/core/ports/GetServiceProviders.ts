import { ServiceProvider, ServiceProvidersBySillId } from "../usecases/serviceProviders";

export type GetServiceProviders = () => Promise<ServiceProvidersBySillId>;
