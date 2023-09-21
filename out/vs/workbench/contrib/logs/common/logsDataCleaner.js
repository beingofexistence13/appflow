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
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/files/common/files", "vs/base/common/resources", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/lifecycle/common/lifecycle", "vs/base/common/async"], function (require, exports, lifecycle_1, files_1, resources_1, environmentService_1, lifecycle_2, async_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LogsDataCleaner = void 0;
    let LogsDataCleaner = class LogsDataCleaner extends lifecycle_1.Disposable {
        constructor(environmentService, fileService, lifecycleService) {
            super();
            this.environmentService = environmentService;
            this.fileService = fileService;
            this.lifecycleService = lifecycleService;
            this.cleanUpOldLogsSoon();
        }
        cleanUpOldLogsSoon() {
            let handle = setTimeout(async () => {
                handle = undefined;
                const stat = await this.fileService.resolve((0, resources_1.dirname)(this.environmentService.logsHome));
                if (stat.children) {
                    const currentLog = (0, resources_1.basename)(this.environmentService.logsHome);
                    const allSessions = stat.children.filter(stat => stat.isDirectory && /^\d{8}T\d{6}$/.test(stat.name));
                    const oldSessions = allSessions.sort().filter((d, i) => d.name !== currentLog);
                    const toDelete = oldSessions.slice(0, Math.max(0, oldSessions.length - 49));
                    async_1.Promises.settled(toDelete.map(stat => this.fileService.del(stat.resource, { recursive: true })));
                }
            }, 10 * 1000);
            this.lifecycleService.onWillShutdown(() => {
                if (handle) {
                    clearTimeout(handle);
                    handle = undefined;
                }
            });
        }
    };
    exports.LogsDataCleaner = LogsDataCleaner;
    exports.LogsDataCleaner = LogsDataCleaner = __decorate([
        __param(0, environmentService_1.IWorkbenchEnvironmentService),
        __param(1, files_1.IFileService),
        __param(2, lifecycle_2.ILifecycleService)
    ], LogsDataCleaner);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nc0RhdGFDbGVhbmVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbG9ncy9jb21tb24vbG9nc0RhdGFDbGVhbmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQVN6RixJQUFNLGVBQWUsR0FBckIsTUFBTSxlQUFnQixTQUFRLHNCQUFVO1FBRTlDLFlBQ2dELGtCQUFnRCxFQUNoRSxXQUF5QixFQUNwQixnQkFBbUM7WUFFdkUsS0FBSyxFQUFFLENBQUM7WUFKdUMsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUE4QjtZQUNoRSxnQkFBVyxHQUFYLFdBQVcsQ0FBYztZQUNwQixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW1CO1lBR3ZFLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQzNCLENBQUM7UUFFTyxrQkFBa0I7WUFDekIsSUFBSSxNQUFNLEdBQVEsVUFBVSxDQUFDLEtBQUssSUFBSSxFQUFFO2dCQUN2QyxNQUFNLEdBQUcsU0FBUyxDQUFDO2dCQUNuQixNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLElBQUEsbUJBQU8sRUFBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDdkYsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO29CQUNsQixNQUFNLFVBQVUsR0FBRyxJQUFBLG9CQUFRLEVBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUM5RCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLElBQUksZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDdEcsTUFBTSxXQUFXLEdBQUcsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssVUFBVSxDQUFDLENBQUM7b0JBQy9FLE1BQU0sUUFBUSxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDNUUsZ0JBQVEsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ2pHO1lBQ0YsQ0FBQyxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztZQUNkLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsR0FBRyxFQUFFO2dCQUN6QyxJQUFJLE1BQU0sRUFBRTtvQkFDWCxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQ3JCLE1BQU0sR0FBRyxTQUFTLENBQUM7aUJBQ25CO1lBQ0YsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO0tBQ0QsQ0FBQTtJQTlCWSwwQ0FBZTs4QkFBZixlQUFlO1FBR3pCLFdBQUEsaURBQTRCLENBQUE7UUFDNUIsV0FBQSxvQkFBWSxDQUFBO1FBQ1osV0FBQSw2QkFBaUIsQ0FBQTtPQUxQLGVBQWUsQ0E4QjNCIn0=