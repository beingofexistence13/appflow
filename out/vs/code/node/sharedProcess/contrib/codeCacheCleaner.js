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
    exports.CodeCacheCleaner = void 0;
    let CodeCacheCleaner = class CodeCacheCleaner extends lifecycle_1.Disposable {
        constructor(currentCodeCachePath, productService, logService) {
            super();
            this.productService = productService;
            this.logService = logService;
            this._DataMaxAge = this.productService.quality !== 'stable'
                ? 1000 * 60 * 60 * 24 * 7 // roughly 1 week (insiders)
                : 1000 * 60 * 60 * 24 * 30 * 3; // roughly 3 months (stable)
            // Cached data is stored as user data and we run a cleanup task every time
            // the editor starts. The strategy is to delete all files that are older than
            // 3 months (1 week respectively)
            if (currentCodeCachePath) {
                const scheduler = this._register(new async_1.RunOnceScheduler(() => {
                    this.cleanUpCodeCaches(currentCodeCachePath);
                }, 30 * 1000 /* after 30s */));
                scheduler.schedule();
            }
        }
        async cleanUpCodeCaches(currentCodeCachePath) {
            this.logService.trace('[code cache cleanup]: Starting to clean up old code cache folders.');
            try {
                const now = Date.now();
                // The folder which contains folders of cached data.
                // Each of these folders is partioned per commit
                const codeCacheRootPath = (0, path_1.dirname)(currentCodeCachePath);
                const currentCodeCache = (0, path_1.basename)(currentCodeCachePath);
                const codeCaches = await pfs_1.Promises.readdir(codeCacheRootPath);
                await Promise.all(codeCaches.map(async (codeCache) => {
                    if (codeCache === currentCodeCache) {
                        return; // not the current cache folder
                    }
                    // Delete cache folder if old enough
                    const codeCacheEntryPath = (0, path_1.join)(codeCacheRootPath, codeCache);
                    const codeCacheEntryStat = await pfs_1.Promises.stat(codeCacheEntryPath);
                    if (codeCacheEntryStat.isDirectory() && (now - codeCacheEntryStat.mtime.getTime()) > this._DataMaxAge) {
                        this.logService.trace(`[code cache cleanup]: Removing code cache folder ${codeCache}.`);
                        return pfs_1.Promises.rm(codeCacheEntryPath);
                    }
                }));
            }
            catch (error) {
                (0, errors_1.onUnexpectedError)(error);
            }
        }
    };
    exports.CodeCacheCleaner = CodeCacheCleaner;
    exports.CodeCacheCleaner = CodeCacheCleaner = __decorate([
        __param(1, productService_1.IProductService),
        __param(2, log_1.ILogService)
    ], CodeCacheCleaner);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZUNhY2hlQ2xlYW5lci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2NvZGUvbm9kZS9zaGFyZWRQcm9jZXNzL2NvbnRyaWIvY29kZUNhY2hlQ2xlYW5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFVekYsSUFBTSxnQkFBZ0IsR0FBdEIsTUFBTSxnQkFBaUIsU0FBUSxzQkFBVTtRQU0vQyxZQUNDLG9CQUF3QyxFQUN2QixjQUFnRCxFQUNwRCxVQUF3QztZQUVyRCxLQUFLLEVBQUUsQ0FBQztZQUgwQixtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFDbkMsZUFBVSxHQUFWLFVBQVUsQ0FBYTtZQVByQyxnQkFBVyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxLQUFLLFFBQVE7Z0JBQ3RFLENBQUMsQ0FBQyxJQUFJLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFHLDRCQUE0QjtnQkFDeEQsQ0FBQyxDQUFDLElBQUksR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsNEJBQTRCO1lBUzVELDBFQUEwRTtZQUMxRSw2RUFBNkU7WUFDN0UsaUNBQWlDO1lBQ2pDLElBQUksb0JBQW9CLEVBQUU7Z0JBQ3pCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSx3QkFBZ0IsQ0FBQyxHQUFHLEVBQUU7b0JBQzFELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO2dCQUM5QyxDQUFDLEVBQUUsRUFBRSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO2dCQUMvQixTQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7YUFDckI7UUFDRixDQUFDO1FBRU8sS0FBSyxDQUFDLGlCQUFpQixDQUFDLG9CQUE0QjtZQUMzRCxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxvRUFBb0UsQ0FBQyxDQUFDO1lBRTVGLElBQUk7Z0JBQ0gsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUV2QixvREFBb0Q7Z0JBQ3BELGdEQUFnRDtnQkFDaEQsTUFBTSxpQkFBaUIsR0FBRyxJQUFBLGNBQU8sRUFBQyxvQkFBb0IsQ0FBQyxDQUFDO2dCQUN4RCxNQUFNLGdCQUFnQixHQUFHLElBQUEsZUFBUSxFQUFDLG9CQUFvQixDQUFDLENBQUM7Z0JBRXhELE1BQU0sVUFBVSxHQUFHLE1BQU0sY0FBUSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2dCQUM3RCxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUMsU0FBUyxFQUFDLEVBQUU7b0JBQ2xELElBQUksU0FBUyxLQUFLLGdCQUFnQixFQUFFO3dCQUNuQyxPQUFPLENBQUMsK0JBQStCO3FCQUN2QztvQkFFRCxvQ0FBb0M7b0JBQ3BDLE1BQU0sa0JBQWtCLEdBQUcsSUFBQSxXQUFJLEVBQUMsaUJBQWlCLEVBQUUsU0FBUyxDQUFDLENBQUM7b0JBQzlELE1BQU0sa0JBQWtCLEdBQUcsTUFBTSxjQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7b0JBQ25FLElBQUksa0JBQWtCLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsa0JBQWtCLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRTt3QkFDdEcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsb0RBQW9ELFNBQVMsR0FBRyxDQUFDLENBQUM7d0JBRXhGLE9BQU8sY0FBUSxDQUFDLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO3FCQUN2QztnQkFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ0o7WUFBQyxPQUFPLEtBQUssRUFBRTtnQkFDZixJQUFBLDBCQUFpQixFQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ3pCO1FBQ0YsQ0FBQztLQUNELENBQUE7SUF0RFksNENBQWdCOytCQUFoQixnQkFBZ0I7UUFRMUIsV0FBQSxnQ0FBZSxDQUFBO1FBQ2YsV0FBQSxpQkFBVyxDQUFBO09BVEQsZ0JBQWdCLENBc0Q1QiJ9