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
define(["require", "exports", "vs/base/common/lifecycle", "vs/workbench/services/environment/browser/environmentService", "vs/workbench/services/remote/common/remoteExplorerService"], function (require, exports, lifecycle_1, environmentService_1, remoteExplorerService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ShowCandidateContribution = void 0;
    let ShowCandidateContribution = class ShowCandidateContribution extends lifecycle_1.Disposable {
        constructor(remoteExplorerService, environmentService) {
            super();
            const showPortCandidate = environmentService.options?.tunnelProvider?.showPortCandidate;
            if (showPortCandidate) {
                this._register(remoteExplorerService.setCandidateFilter(async (candidates) => {
                    const filters = await Promise.all(candidates.map(candidate => showPortCandidate(candidate.host, candidate.port, candidate.detail ?? '')));
                    const filteredCandidates = [];
                    if (filters.length !== candidates.length) {
                        return candidates;
                    }
                    for (let i = 0; i < candidates.length; i++) {
                        if (filters[i]) {
                            filteredCandidates.push(candidates[i]);
                        }
                    }
                    return filteredCandidates;
                }));
            }
        }
    };
    exports.ShowCandidateContribution = ShowCandidateContribution;
    exports.ShowCandidateContribution = ShowCandidateContribution = __decorate([
        __param(0, remoteExplorerService_1.IRemoteExplorerService),
        __param(1, environmentService_1.IBrowserWorkbenchEnvironmentService)
    ], ShowCandidateContribution);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hvd0NhbmRpZGF0ZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3JlbW90ZS9icm93c2VyL3Nob3dDYW5kaWRhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBUXpGLElBQU0seUJBQXlCLEdBQS9CLE1BQU0seUJBQTBCLFNBQVEsc0JBQVU7UUFDeEQsWUFDeUIscUJBQTZDLEVBQ2hDLGtCQUF1RDtZQUU1RixLQUFLLEVBQUUsQ0FBQztZQUNSLE1BQU0saUJBQWlCLEdBQUcsa0JBQWtCLENBQUMsT0FBTyxFQUFFLGNBQWMsRUFBRSxpQkFBaUIsQ0FBQztZQUN4RixJQUFJLGlCQUFpQixFQUFFO2dCQUN0QixJQUFJLENBQUMsU0FBUyxDQUFDLHFCQUFxQixDQUFDLGtCQUFrQixDQUFDLEtBQUssRUFBRSxVQUEyQixFQUE0QixFQUFFO29CQUN2SCxNQUFNLE9BQU8sR0FBYyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDckosTUFBTSxrQkFBa0IsR0FBb0IsRUFBRSxDQUFDO29CQUMvQyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssVUFBVSxDQUFDLE1BQU0sRUFBRTt3QkFDekMsT0FBTyxVQUFVLENBQUM7cUJBQ2xCO29CQUNELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO3dCQUMzQyxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRTs0QkFDZixrQkFBa0IsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7eUJBQ3ZDO3FCQUNEO29CQUNELE9BQU8sa0JBQWtCLENBQUM7Z0JBQzNCLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDSjtRQUNGLENBQUM7S0FDRCxDQUFBO0lBdkJZLDhEQUF5Qjt3Q0FBekIseUJBQXlCO1FBRW5DLFdBQUEsOENBQXNCLENBQUE7UUFDdEIsV0FBQSx3REFBbUMsQ0FBQTtPQUh6Qix5QkFBeUIsQ0F1QnJDIn0=