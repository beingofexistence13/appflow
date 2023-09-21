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
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/opener/common/opener", "vs/workbench/services/environment/browser/environmentService"], function (require, exports, lifecycle_1, opener_1, environmentService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExternalUriResolverContribution = void 0;
    let ExternalUriResolverContribution = class ExternalUriResolverContribution extends lifecycle_1.Disposable {
        constructor(_openerService, _workbenchEnvironmentService) {
            super();
            if (_workbenchEnvironmentService.options && _workbenchEnvironmentService.options.resolveExternalUri) {
                this._register(_openerService.registerExternalUriResolver({
                    resolveExternalUri: async (resource) => {
                        return {
                            resolved: await _workbenchEnvironmentService.options.resolveExternalUri(resource),
                            dispose: () => {
                                // TODO
                            }
                        };
                    }
                }));
            }
        }
    };
    exports.ExternalUriResolverContribution = ExternalUriResolverContribution;
    exports.ExternalUriResolverContribution = ExternalUriResolverContribution = __decorate([
        __param(0, opener_1.IOpenerService),
        __param(1, environmentService_1.IBrowserWorkbenchEnvironmentService)
    ], ExternalUriResolverContribution);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZXJuYWxVcmlSZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3VybC9icm93c2VyL2V4dGVybmFsVXJpUmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBT3pGLElBQU0sK0JBQStCLEdBQXJDLE1BQU0sK0JBQWdDLFNBQVEsc0JBQVU7UUFDOUQsWUFDaUIsY0FBOEIsRUFDVCw0QkFBaUU7WUFFdEcsS0FBSyxFQUFFLENBQUM7WUFFUixJQUFJLDRCQUE0QixDQUFDLE9BQU8sSUFBSSw0QkFBNEIsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLEVBQUU7Z0JBQ3BHLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLDJCQUEyQixDQUFDO29CQUN6RCxrQkFBa0IsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLEVBQUU7d0JBQ3RDLE9BQU87NEJBQ04sUUFBUSxFQUFFLE1BQU0sNEJBQTRCLENBQUMsT0FBUSxDQUFDLGtCQUFtQixDQUFDLFFBQVEsQ0FBQzs0QkFDbkYsT0FBTyxFQUFFLEdBQUcsRUFBRTtnQ0FDYixPQUFPOzRCQUNSLENBQUM7eUJBQ0QsQ0FBQztvQkFDSCxDQUFDO2lCQUNELENBQUMsQ0FBQyxDQUFDO2FBQ0o7UUFDRixDQUFDO0tBQ0QsQ0FBQTtJQXBCWSwwRUFBK0I7OENBQS9CLCtCQUErQjtRQUV6QyxXQUFBLHVCQUFjLENBQUE7UUFDZCxXQUFBLHdEQUFtQyxDQUFBO09BSHpCLCtCQUErQixDQW9CM0MifQ==