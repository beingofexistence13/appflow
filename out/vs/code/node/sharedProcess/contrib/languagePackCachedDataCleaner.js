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
define(["require", "exports", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/path", "vs/base/node/pfs", "vs/platform/environment/common/environment", "vs/platform/log/common/log", "vs/platform/product/common/productService"], function (require, exports, async_1, errors_1, lifecycle_1, path_1, pfs_1, environment_1, log_1, productService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LanguagePackCachedDataCleaner = void 0;
    let LanguagePackCachedDataCleaner = class LanguagePackCachedDataCleaner extends lifecycle_1.Disposable {
        constructor(environmentService, logService, productService) {
            super();
            this.environmentService = environmentService;
            this.logService = logService;
            this.productService = productService;
            this._DataMaxAge = this.productService.quality !== 'stable'
                ? 1000 * 60 * 60 * 24 * 7 // roughly 1 week (insiders)
                : 1000 * 60 * 60 * 24 * 30 * 3; // roughly 3 months (stable)
            // We have no Language pack support for dev version (run from source)
            // So only cleanup when we have a build version.
            if (this.environmentService.isBuilt) {
                const scheduler = this._register(new async_1.RunOnceScheduler(() => {
                    this.cleanUpLanguagePackCache();
                }, 40 * 1000 /* after 40s */));
                scheduler.schedule();
            }
        }
        async cleanUpLanguagePackCache() {
            this.logService.trace('[language pack cache cleanup]: Starting to clean up unused language packs.');
            try {
                const installed = Object.create(null);
                const metaData = JSON.parse(await pfs_1.Promises.readFile((0, path_1.join)(this.environmentService.userDataPath, 'languagepacks.json'), 'utf8'));
                for (const locale of Object.keys(metaData)) {
                    const entry = metaData[locale];
                    installed[`${entry.hash}.${locale}`] = true;
                }
                // Cleanup entries for language packs that aren't installed anymore
                const cacheDir = (0, path_1.join)(this.environmentService.userDataPath, 'clp');
                const cacheDirExists = await pfs_1.Promises.exists(cacheDir);
                if (!cacheDirExists) {
                    return;
                }
                const entries = await pfs_1.Promises.readdir(cacheDir);
                for (const entry of entries) {
                    if (installed[entry]) {
                        this.logService.trace(`[language pack cache cleanup]: Skipping folder ${entry}. Language pack still in use.`);
                        continue;
                    }
                    this.logService.trace(`[language pack cache cleanup]: Removing unused language pack: ${entry}`);
                    await pfs_1.Promises.rm((0, path_1.join)(cacheDir, entry));
                }
                const now = Date.now();
                for (const packEntry of Object.keys(installed)) {
                    const folder = (0, path_1.join)(cacheDir, packEntry);
                    const entries = await pfs_1.Promises.readdir(folder);
                    for (const entry of entries) {
                        if (entry === 'tcf.json') {
                            continue;
                        }
                        const candidate = (0, path_1.join)(folder, entry);
                        const stat = await pfs_1.Promises.stat(candidate);
                        if (stat.isDirectory() && (now - stat.mtime.getTime()) > this._DataMaxAge) {
                            this.logService.trace(`[language pack cache cleanup]: Removing language pack cache folder: ${(0, path_1.join)(packEntry, entry)}`);
                            await pfs_1.Promises.rm(candidate);
                        }
                    }
                }
            }
            catch (error) {
                (0, errors_1.onUnexpectedError)(error);
            }
        }
    };
    exports.LanguagePackCachedDataCleaner = LanguagePackCachedDataCleaner;
    exports.LanguagePackCachedDataCleaner = LanguagePackCachedDataCleaner = __decorate([
        __param(0, environment_1.INativeEnvironmentService),
        __param(1, log_1.ILogService),
        __param(2, productService_1.IProductService)
    ], LanguagePackCachedDataCleaner);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZ3VhZ2VQYWNrQ2FjaGVkRGF0YUNsZWFuZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9jb2RlL25vZGUvc2hhcmVkUHJvY2Vzcy9jb250cmliL2xhbmd1YWdlUGFja0NhY2hlZERhdGFDbGVhbmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQTZCekYsSUFBTSw2QkFBNkIsR0FBbkMsTUFBTSw2QkFBOEIsU0FBUSxzQkFBVTtRQU01RCxZQUM0QixrQkFBOEQsRUFDNUUsVUFBd0MsRUFDcEMsY0FBZ0Q7WUFFakUsS0FBSyxFQUFFLENBQUM7WUFKb0MsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUEyQjtZQUMzRCxlQUFVLEdBQVYsVUFBVSxDQUFhO1lBQ25CLG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtZQVBqRCxnQkFBVyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxLQUFLLFFBQVE7Z0JBQ3RFLENBQUMsQ0FBQyxJQUFJLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFHLDRCQUE0QjtnQkFDeEQsQ0FBQyxDQUFDLElBQUksR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsNEJBQTRCO1lBUzVELHFFQUFxRTtZQUNyRSxnREFBZ0Q7WUFDaEQsSUFBSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxFQUFFO2dCQUNwQyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksd0JBQWdCLENBQUMsR0FBRyxFQUFFO29CQUMxRCxJQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztnQkFDakMsQ0FBQyxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztnQkFDL0IsU0FBUyxDQUFDLFFBQVEsRUFB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