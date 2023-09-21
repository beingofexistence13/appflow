/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/path", "vs/base/node/pfs", "vs/platform/log/common/log", "vs/platform/product/common/productService"], function (require, exports, async_1, errors_1, lifecycle_1, path_1, pfs_1, log_1, productService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$L7b = void 0;
    let $L7b = class $L7b extends lifecycle_1.$kc {
        constructor(currentCodeCachePath, b, c) {
            super();
            this.b = b;
            this.c = c;
            this.a = this.b.quality !== 'stable'
                ? 1000 * 60 * 60 * 24 * 7 // roughly 1 week (insiders)
                : 1000 * 60 * 60 * 24 * 30 * 3; // roughly 3 months (stable)
            // Cached data is stored as user data and we run a cleanup task every time
            // the editor starts. The strategy is to delete all files that are older than
            // 3 months (1 week respectively)
            if (currentCodeCachePath) {
                const scheduler = this.B(new async_1.$Sg(() => {
                    this.f(currentCodeCachePath);
                }, 30 * 1000 /* after 30s */));
                scheduler.schedule();
            }
        }
        async f(currentCodeCachePath) {
            this.c.trace('[code cache cleanup]: Starting to clean up old code cache folders.');
            try {
                const now = Date.now();
                // The folder which contains folders of cached data.
                // Each of these folders is partioned per commit
                const codeCacheRootPath = (0, path_1.$_d)(currentCodeCachePath);
                const currentCodeCache = (0, path_1.$ae)(currentCodeCachePath);
                const codeCaches = await pfs_1.Promises.readdir(codeCacheRootPath);
                await Promise.all(codeCaches.map(async (codeCache) => {
                    if (codeCache === currentCodeCache) {
                        return; // not the current cache folder
                    }
                    // Delete cache folder if old enough
                    const codeCacheEntryPath = (0, path_1.$9d)(codeCacheRootPath, codeCache);
                    const codeCacheEntryStat = await pfs_1.Promises.stat(codeCacheEntryPath);
                    if (codeCacheEntryStat.isDirectory() && (now - codeCacheEntryStat.mtime.getTime()) > this.a) {
                        this.c.trace(`[code cache cleanup]: Removing code cache folder ${codeCache}.`);
                        return pfs_1.Promises.rm(codeCacheEntryPath);
                    }
                }));
            }
            catch (error) {
                (0, errors_1.$Y)(error);
            }
        }
    };
    exports.$L7b = $L7b;
    exports.$L7b = $L7b = __decorate([
        __param(1, productService_1.$kj),
        __param(2, log_1.$5i)
    ], $L7b);
});
//# sourceMappingURL=codeCacheCleaner.js.map