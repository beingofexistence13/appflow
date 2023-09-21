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
define(["require", "exports", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/contrib/extensions/browser/extensionRecommendations", "vs/nls!vs/workbench/contrib/extensions/browser/configBasedRecommendations", "vs/platform/workspace/common/workspace", "vs/base/common/event"], function (require, exports, extensionManagement_1, extensionRecommendations_1, nls_1, workspace_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$XUb = void 0;
    let $XUb = class $XUb extends extensionRecommendations_1.$PUb {
        get otherRecommendations() { return this.h; }
        get importantRecommendations() { return this.j; }
        get recommendations() { return [...this.importantRecommendations, ...this.otherRecommendations]; }
        constructor(m, n) {
            super();
            this.m = m;
            this.n = n;
            this.a = [];
            this.b = [];
            this.g = this.B(new event_1.$fd());
            this.onDidChangeRecommendations = this.g.event;
            this.h = [];
            this.j = [];
        }
        async c() {
            await this.s();
            this.B(this.n.onDidChangeWorkspaceFolders(e => this.t(e)));
        }
        async s() {
            const workspace = this.n.getWorkspace();
            const importantTips = new Map();
            const otherTips = new Map();
            for (const folder of workspace.folders) {
                const configBasedTips = await this.m.getConfigBasedTips(folder.uri);
                for (const tip of configBasedTips) {
                    if (tip.important) {
                        importantTips.set(tip.extensionId, tip);
                    }
                    else {
                        otherTips.set(tip.extensionId, tip);
                    }
                }
            }
            this.a = [...importantTips.values()];
            this.b = [...otherTips.values()].filter(tip => !importantTips.has(tip.extensionId));
            this.h = this.b.map(tip => this.u(tip));
            this.j = this.a.map(tip => this.u(tip));
        }
        async t(event) {
            if (event.added.length) {
                const oldImportantRecommended = this.a;
                await this.s();
                // Suggest only if at least one of the newly added recommendations was not suggested before
                if (this.a.some(current => oldImportantRecommended.every(old => current.extensionId !== old.extensionId))) {
                    this.g.fire();
                }
            }
        }
        u(tip) {
            return {
                extensionId: tip.extensionId,
                reason: {
                    reasonId: 3 /* ExtensionRecommendationReason.WorkspaceConfig */,
                    reasonText: (0, nls_1.localize)(0, null)
                },
                whenNotInstalled: tip.whenNotInstalled
            };
        }
    };
    exports.$XUb = $XUb;
    exports.$XUb = $XUb = __decorate([
        __param(0, extensionManagement_1.$6n),
        __param(1, workspace_1.$Kh)
    ], $XUb);
});
//# sourceMappingURL=configBasedRecommendations.js.map