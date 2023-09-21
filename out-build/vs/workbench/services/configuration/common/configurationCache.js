/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/resources", "vs/base/common/buffer", "vs/base/common/async"], function (require, exports, resources_1, buffer_1, async_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$w2b = void 0;
    class $w2b {
        constructor(c, environmentService, d) {
            this.c = c;
            this.d = d;
            this.b = new Map();
            this.a = environmentService.cacheHome;
        }
        needsCaching(resource) {
            // Cache all non native resources
            return !this.c.includes(resource.scheme);
        }
        read(key) {
            return this.f(key).read();
        }
        write(key, content) {
            return this.f(key).save(content);
        }
        remove(key) {
            return this.f(key).remove();
        }
        f({ type, key }) {
            const k = `${type}:${key}`;
            let cachedConfiguration = this.b.get(k);
            if (!cachedConfiguration) {
                cachedConfiguration = new CachedConfiguration({ type, key }, this.a, this.d);
                this.b.set(k, cachedConfiguration);
            }
            return cachedConfiguration;
        }
    }
    exports.$w2b = $w2b;
    class CachedConfiguration {
        constructor({ type, key }, cacheHome, d) {
            this.d = d;
            this.b = (0, resources_1.$ig)(cacheHome, 'CachedConfigurations', type, key);
            this.c = (0, resources_1.$ig)(this.b, type === 'workspaces' ? 'workspace.json' : 'configuration.json');
            this.a = new async_1.$Ng();
        }
        async read() {
            try {
                const content = await this.d.readFile(this.c);
                return content.value.toString();
            }
            catch (e) {
                return '';
            }
        }
        async save(content) {
            const created = await this.f();
            if (created) {
                await this.a.queue(async () => {
                    await this.d.writeFile(this.c, buffer_1.$Fd.fromString(content));
                });
            }
        }
        async remove() {
            try {
                await this.a.queue(() => this.d.del(this.b, { recursive: true, useTrash: false }));
            }
            catch (error) {
                if (error.fileOperationResult !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                    throw error;
                }
            }
        }
        async f() {
            if (await this.d.exists(this.b)) {
                return true;
            }
            try {
                await this.d.createFolder(this.b);
                return true;
            }
            catch (error) {
                return false;
            }
        }
    }
});
//# sourceMappingURL=configurationCache.js.map