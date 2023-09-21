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
define(["require", "exports", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/contrib/extensions/browser/extensionRecommendations", "vs/nls", "vs/platform/workspace/common/workspace", "vs/base/common/event"], function (require, exports, extensionManagement_1, extensionRecommendations_1, nls_1, workspace_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ConfigBasedRecommendations = void 0;
    let ConfigBasedRecommendations = class ConfigBasedRecommendations extends extensionRecommendations_1.ExtensionRecommendations {
        get otherRecommendations() { return this._otherRecommendations; }
        get importantRecommendations() { return this._importantRecommendations; }
        get recommendations() { return [...this.importantRecommendations, ...this.otherRecommendations]; }
        constructor(extensionTipsService, workspaceContextService) {
            super();
            this.extensionTipsService = extensionTipsService;
            this.workspaceContextService = workspaceContextService;
            this.importantTips = [];
            this.otherTips = [];
            this._onDidChangeRecommendations = this._register(new event_1.Emitter());
            this.onDidChangeRecommendations = this._onDidChangeRecommendations.event;
            this._otherRecommendations = [];
            this._importantRecommendations = [];
        }
        async doActivate() {
            await this.fetch();
            this._register(this.workspaceContextService.onDidChangeWorkspaceFolders(e => this.onWorkspaceFoldersChanged(e)));
        }
        async fetch() {
            const workspace = this.workspaceContextService.getWorkspace();
            const importantTips = new Map();
            const otherTips = new Map();
            for (const folder of workspace.folders) {
                const configBasedTips = await this.extensionTipsService.getConfigBasedTips(folder.uri);
                for (const tip of configBasedTips) {
                    if (tip.important) {
                        importantTips.set(tip.extensionId, tip);
                    }
                    else {
                        otherTips.set(tip.extensionId, tip);
                    }
                }
            }
            this.importantTips = [...importantTips.values()];
            this.otherTips = [...otherTips.values()].filter(tip => !importantTips.has(tip.extensionId));
            this._otherRecommendations = this.otherTips.map(tip => this.toExtensionRecommendation(tip));
            this._importantRecommendations = this.importantTips.map(tip => this.toExtensionRecommendation(tip));
        }
        async onWorkspaceFoldersChanged(event) {
            if (event.added.length) {
                const oldImportantRecommended = this.importantTips;
                await this.fetch();
                // Suggest only if at least one of the newly added recommendations was not suggested before
                if (this.importantTips.some(current => oldImportantRecommended.every(old => current.extensionId !== old.extensionId))) {
                    this._onDidChangeRecommendations.fire();
                }
            }
        }
        toExtensionRecommendation(tip) {
            return {
                extensionId: tip.extensionId,
                reason: {
                    reasonId: 3 /* ExtensionRecommendationReason.WorkspaceConfig */,
                    reasonText: (0, nls_1.localize)('exeBasedRecommendation', "This extension is recommended because of the current workspace configuration")
                },
                whenNotInstalled: tip.whenNotInstalled
            };
        }
    };
    exports.ConfigBasedRecommendations = ConfigBasedRecommendations;
    exports.ConfigBasedRecommendations = ConfigBasedRecommendations = __decorate([
        __param(0, extensionManagement_1.IExtensionTipsService),
        __param(1, workspace_1.IWorkspaceContextService)
    ], ConfigBasedRecommendations);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnQmFzZWRSZWNvbW1lbmRhdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9leHRlbnNpb25zL2Jyb3dzZXIvY29uZmlnQmFzZWRSZWNvbW1lbmRhdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBV3pGLElBQU0sMEJBQTBCLEdBQWhDLE1BQU0sMEJBQTJCLFNBQVEsbURBQXdCO1FBU3ZFLElBQUksb0JBQW9CLEtBQXdELE9BQU8sSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQztRQUdwSCxJQUFJLHdCQUF3QixLQUF3RCxPQUFPLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLENBQUM7UUFFNUgsSUFBSSxlQUFlLEtBQXdELE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVySixZQUN3QixvQkFBNEQsRUFDekQsdUJBQWtFO1lBRTVGLEtBQUssRUFBRSxDQUFDO1lBSGdDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDeEMsNEJBQXVCLEdBQXZCLHVCQUF1QixDQUEwQjtZQWhCckYsa0JBQWEsR0FBK0IsRUFBRSxDQUFDO1lBQy9DLGNBQVMsR0FBK0IsRUFBRSxDQUFDO1lBRTNDLGdDQUEyQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVEsQ0FBQyxDQUFDO1lBQ2pFLCtCQUEwQixHQUFHLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxLQUFLLENBQUM7WUFFckUsMEJBQXFCLEdBQXlDLEVBQUUsQ0FBQztZQUdqRSw4QkFBeUIsR0FBeUMsRUFBRSxDQUFDO1FBVTdFLENBQUM7UUFFUyxLQUFLLENBQUMsVUFBVTtZQUN6QixNQUFNLElBQUksQ0FBQyxL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