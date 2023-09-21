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
define(["require", "exports", "vs/platform/extensionManagement/common/extensionManagement", "vs/base/common/arrays", "vs/workbench/contrib/extensions/browser/extensionRecommendations", "vs/platform/notification/common/notification", "vs/nls!vs/workbench/contrib/extensions/browser/workspaceRecommendations", "vs/base/common/event", "vs/workbench/services/extensionRecommendations/common/workspaceExtensionsConfig"], function (require, exports, extensionManagement_1, arrays_1, extensionRecommendations_1, notification_1, nls_1, event_1, workspaceExtensionsConfig_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$RUb = void 0;
    let $RUb = class $RUb extends extensionRecommendations_1.$PUb {
        get recommendations() { return this.a; }
        get ignoredRecommendations() { return this.g; }
        constructor(h, j) {
            super();
            this.h = h;
            this.j = j;
            this.a = [];
            this.b = this.B(new event_1.$fd());
            this.onDidChangeRecommendations = this.b.event;
            this.g = [];
        }
        async c() {
            await this.n();
            this.B(this.h.onDidChangeExtensionsConfigs(() => this.s()));
        }
        /**
         * Parse all extensions.json files, fetch workspace recommendations, filter out invalid and unwanted ones
         */
        async n() {
            const extensionsConfigs = await this.h.getExtensionsConfigs();
            const { invalidRecommendations, message } = await this.r(extensionsConfigs);
            if (invalidRecommendations.length) {
                this.j.warn(`The ${invalidRecommendations.length} extension(s) below, in workspace recommendations have issues:\n${message}`);
            }
            this.a = [];
            this.g = [];
            for (const extensionsConfig of extensionsConfigs) {
                if (extensionsConfig.unwantedRecommendations) {
                    for (const unwantedRecommendation of extensionsConfig.unwantedRecommendations) {
                        if (invalidRecommendations.indexOf(unwantedRecommendation) === -1) {
                            this.g.push(unwantedRecommendation);
                        }
                    }
                }
                if (extensionsConfig.recommendations) {
                    for (const extensionId of extensionsConfig.recommendations) {
                        if (invalidRecommendations.indexOf(extensionId) === -1) {
                            this.a.push({
                                extensionId,
                                reason: {
                                    reasonId: 0 /* ExtensionRecommendationReason.Workspace */,
                                    reasonText: (0, nls_1.localize)(0, null)
                                }
                            });
                        }
                    }
                }
            }
        }
        async r(contents) {
            const validExtensions = [];
            const invalidExtensions = [];
            let message = '';
            const allRecommendations = (0, arrays_1.$Kb)((0, arrays_1.$Pb)(contents.map(({ recommendations }) => recommendations || [])));
            const regEx = new RegExp(extensionManagement_1.$Mn);
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
        async s() {
            await this.n();
            this.b.fire();
        }
    };
    exports.$RUb = $RUb;
    exports.$RUb = $RUb = __decorate([
        __param(0, workspaceExtensionsConfig_1.$qgb),
        __param(1, notification_1.$Yu)
    ], $RUb);
});
//# sourceMappingURL=workspaceRecommendations.js.map