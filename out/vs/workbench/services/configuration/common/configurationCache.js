/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/resources", "vs/base/common/buffer", "vs/base/common/async"], function (require, exports, resources_1, buffer_1, async_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ConfigurationCache = void 0;
    class ConfigurationCache {
        constructor(donotCacheResourcesWithSchemes, environmentService, fileService) {
            this.donotCacheResourcesWithSchemes = donotCacheResourcesWithSchemes;
            this.fileService = fileService;
            this.cachedConfigurations = new Map();
            this.cacheHome = environmentService.cacheHome;
        }
        needsCaching(resource) {
            // Cache all non native resources
            return !this.donotCacheResourcesWithSchemes.includes(resource.scheme);
        }
        read(key) {
            return this.getCachedConfiguration(key).read();
        }
        write(key, content) {
            return this.getCachedConfiguration(key).save(content);
        }
        remove(key) {
            return this.getCachedConfiguration(key).remove();
        }
        getCachedConfiguration({ type, key }) {
            const k = `${type}:${key}`;
            let cachedConfiguration = this.cachedConfigurations.get(k);
            if (!cachedConfiguration) {
                cachedConfiguration = new CachedConfiguration({ type, key }, this.cacheHome, this.fileService);
                this.cachedConfigurations.set(k, cachedConfiguration);
            }
            return cachedConfiguration;
        }
    }
    exports.ConfigurationCache = ConfigurationCache;
    class CachedConfiguration {
        constructor({ type, key }, cacheHome, fileService) {
            this.fileService = fileService;
            this.cachedConfigurationFolderResource = (0, resources_1.joinPath)(cacheHome, 'CachedConfigurations', type, key);
            this.cachedConfigurationFileResource = (0, resources_1.joinPath)(this.cachedConfigurationFolderResource, type === 'workspaces' ? 'workspace.json' : 'configuration.json');
            this.queue = new async_1.Queue();
        }
        async read() {
            try {
                const content = await this.fileService.readFile(this.cachedConfigurationFileResource);
                return content.value.toString();
            }
            catch (e) {
                return '';
            }
        }
        async save(content) {
            const created = await this.createCachedFolder();
            if (created) {
                await this.queue.queue(async () => {
                    await this.fileService.writeFile(this.cachedConfigurationFileResource, buffer_1.VSBuffer.fromString(content));
                });
            }
        }
        async remove() {
            try {
                await this.queue.queue(() => this.fileService.del(this.cachedConfigurationFolderResource, { recursive: true, useTrash: false }));
            }
            catch (error) {
                if (error.fileOperationResult !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                    throw error;
                }
            }
        }
        async createCachedFolder() {
            if (await this.fileService.exists(this.cachedConfigurationFolderResource)) {
                return true;
            }
            try {
                await this.fileService.createFolder(this.cachedConfigurationFolderResource);
                return true;
            }
            catch (error) {
                return false;
            }
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvbkNhY2hlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL2NvbmZpZ3VyYXRpb24vY29tbW9uL2NvbmZpZ3VyYXRpb25DYWNoZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFVaEcsTUFBYSxrQkFBa0I7UUFLOUIsWUFDa0IsOEJBQXdDLEVBQ3pELGtCQUF1QyxFQUN0QixXQUF5QjtZQUZ6QixtQ0FBOEIsR0FBOUIsOEJBQThCLENBQVU7WUFFeEMsZ0JBQVcsR0FBWCxXQUFXLENBQWM7WUFMMUIseUJBQW9CLEdBQXFDLElBQUksR0FBRyxFQUErQixDQUFDO1lBT2hILElBQUksQ0FBQyxTQUFTLEdBQUcsa0JBQWtCLENBQUMsU0FBUyxDQUFDO1FBQy9DLENBQUM7UUFFRCxZQUFZLENBQUMsUUFBYTtZQUN6QixpQ0FBaUM7WUFDakMsT0FBTyxDQUFDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3ZFLENBQUM7UUFFRCxJQUFJLENBQUMsR0FBcUI7WUFDekIsT0FBTyxJQUFJLENBQUMsc0JBQXNCLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDaEQsQ0FBQztRQUVELEtBQUssQ0FBQyxHQUFxQixFQUFFLE9BQWU7WUFDM0MsT0FBTyxJQUFJLENBQUMsc0JBQXNCLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3ZELENBQUM7UUFFRCxNQUFNLENBQUMsR0FBcUI7WUFDM0IsT0FBTyxJQUFJLENBQUMsc0JBQXNCLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDbEQsQ0FBQztRQUVPLHNCQUFzQixDQUFDLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBb0I7WUFDN0Qs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