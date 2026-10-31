export const useThrowByDefaultFetch = createUseFetch({ addons: [throwOnErrorUseFetchAddon({ throwOnError: true })] })
