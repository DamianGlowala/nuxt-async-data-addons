export const useThrowByDefaultAsyncData = createUseAsyncData({ addons: [throwOnErrorUseAsyncDataAddon({ throwOnError: true })] })
