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
define(["require", "exports", "vs/platform/extensionManagement/common/extensionManagement", "vs/base/common/arrays", "vs/workbench/contrib/extensions/browser/extensionRecommendations", "vs/platform/notification/common/notification", "vs/nls", "vs/base/common/event", "vs/workbench/services/extensionRecommendations/common/workspaceExtensionsConfig"], function (require, exports, extensionManagement_1, arrays_1, extensionRecommendations_1, notification_1, nls_1, event_1, workspaceExtensionsConfig_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkspaceRecommendations = void 0;
    let WorkspaceRecommendations = class WorkspaceRecommendations extends extensionRecommendations_1.ExtensionRecommendations {
        get recommendations() { return this._recommendations; }
        get ignoredRecommendations() { return this._ignoredRecommendations; }
        constructor(workspaceExtensionsConfigService, notificationService) {
            super();
            this.workspaceExtensionsConfigService = workspaceExtensionsConfigService;
            this.notificationService = notificationService;
            this._recommendations = [];
            this._onDidChangeRecommendations = this._register(new event_1.Emitter());
            this.onDidChangeRecommendations = this._onDidChangeRecommendations.event;
            this._ignoredRecommendations = [];
        }
        async doActivate() {
            await this.fetch();
            this._register(this.workspaceExtensionsConfigService.onDidChangeExtensionsConfigs(() => this.onDidChangeExtensionsConfigs()));
        }
        /**
         * Parse all extensions.json files, fetch workspace recommendations, filter out invalid and unwanted ones
         */
        async fetch() {
            const extensionsConfigs = await this.workspaceExtensionsConfigService.getExtensionsConfigs();
            const { invalidRecommendations, message } = await this.validateExtensions(extensionsConfigs);
            if (invalidRecommendations.length) {
                this.notificationService.warn(`The ${invalidRecommendations.length} extension(s) below, in workspace recommendations have issues:\n${message}`);
            }
            this._recommendations = [];
            this._ignoredRecommendations = [];
            for (const extensionsConfig of extensionsConfigs) {
                if (extensionsConfig.unwantedRecommendations) {
                    for (const unwantedRecommendation of extensionsConfig.unwantedRecommendations) {
                        if (invalidRecommendations.indexOf(unwantedRecommendation) === -1) {
                            this._ignoredRecommendations.push(unwantedRecommendation);
                        }
                    }
                }
                if (extensionsConfig.recommendations) {
                    for (const extensionId of extensionsConfig.recommendations) {
                        if (invalidRecommendations.indexOf(extensionId) === -1) {
                            this._recommendations.push({
                                extensionId,
                                reason: {
                                    reasonId: 0 /* ExtensionRecommendationReason.Workspace */,
                                    reasonText: (0, nls_1.localize)('workspaceRecommendation', "This extension is recommended by users of the current workspace.")
                                }
                            });
                        }
                    }
                }
            }
        }
        async validateExtensions(contents) {
            const validExtensions = [];
            const invalidExtensions = [];
            let message = '';
            const allRecommendations = (0, arrays_1.distinct)((0, arrays_1.flatten)(contents.map(({ recommendations }) => recommendations || [])));
            const regEx = new RegExp(extensionManagement_1.EXTENSION_IDENTIFIER_PATTERN);
            for (const extensionId of allRecommendations) {
                if (regEx.test(extensionId)) {
                    validExtensions.push(extensionId);
                }
                else {
                    invalidExtensions.push(extensionId);
                    message += `${extensionId} (bad format) Expected: <provider>.<name>\n`;
                }
            }
            return { validRecommendations: validExtensions, invalidRecommendations: invalidExtensions, message };
        }
        async onDidChangeExtensionsConfigs() {
            await this.fetch();
            this._onDidChangeRecommendations.fire();
        }
    };
    exports.WorkspaceRecommendations = WorkspaceRecommendations;
    exports.WorkspaceRecommendations = WorkspaceRecommendations = __decorate([
        __param(0, workspaceExtensionsConfig_1.IWorkspaceExtensionsConfigService),
        __param(1, notification_1.INotificationService)
    ], WorkspaceRecommendations);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3NwYWNlUmVjb21tZW5kYXRpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZXh0ZW5zaW9ucy9icm93c2VyL3dvcmtzcGFjZVJlY29tbWVuZGF0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFXekYsSUFBTSx3QkFBd0IsR0FBOUIsTUFBTSx3QkFBeUIsU0FBUSxtREFBd0I7UUFHckUsSUFBSSxlQUFlLEtBQTZDLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztRQU0vRixJQUFJLHNCQUFzQixLQUE0QixPQUFPLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUM7UUFFNUYsWUFDb0MsZ0NBQW9GLEVBQ2pHLG1CQUEwRDtZQUVoRixLQUFLLEVBQUUsQ0FBQztZQUg0QyxxQ0FBZ0MsR0FBaEMsZ0NBQWdDLENBQW1DO1lBQ2hGLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBc0I7WUFYekUscUJBQWdCLEdBQThCLEVBQUUsQ0FBQztZQUdqRCxnQ0FBMkIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFRLENBQUMsQ0FBQztZQUNqRSwrQkFBMEIsR0FBRyxJQUFJLENBQUMsMkJBQTJCLENBQUMsS0FBSyxDQUFDO1lBRXJFLDRCQUF1QixHQUFhLEVBQUUsQ0FBQztRQVEvQyxDQUFDO1FBRVMsS0FBSyxDQUFDLFVBQVU7WUFDekIsTUFBTSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDbkIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsZ0NBQWdDLENBQUMsNEJBQTRCLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLDRCQUE0QixFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQy9ILENBQUM7UUFFRDs7V0FFRztRQUNLLEtBQUssQ0FBQyxL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