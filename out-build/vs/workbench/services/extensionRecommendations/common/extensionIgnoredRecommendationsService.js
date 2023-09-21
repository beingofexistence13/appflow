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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/instantiation/common/extensions", "vs/platform/storage/common/storage", "vs/workbench/services/extensionRecommendations/common/extensionRecommendations", "vs/workbench/services/extensionRecommendations/common/workspaceExtensionsConfig"], function (require, exports, arrays_1, event_1, lifecycle_1, extensions_1, storage_1, extensionRecommendations_1, workspaceExtensionsConfig_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Jzb = void 0;
    const ignoredRecommendationsStorageKey = 'extensionsAssistant/ignored_recommendations';
    let $Jzb = class $Jzb extends lifecycle_1.$kc {
        get globalIgnoredRecommendations() { return [...this.b]; }
        get ignoredRecommendations() { return (0, arrays_1.$Kb)([...this.globalIgnoredRecommendations, ...this.f]); }
        constructor(g, h) {
            super();
            this.g = g;
            this.h = h;
            this.a = this.B(new event_1.$fd());
            this.onDidChangeIgnoredRecommendations = this.a.event;
            // Global Ignored Recommendations
            this.b = [];
            this.c = this.B(new event_1.$fd());
            this.onDidChangeGlobalIgnoredRecommendation = this.c.event;
            // Ignored Workspace Recommendations
            this.f = [];
            this.b = this.m();
            this.B(this.h.onDidChangeValue(0 /* StorageScope.PROFILE */, ignoredRecommendationsStorageKey, this.B(new lifecycle_1.$jc()))(e => this.n()));
            this.j();
        }
        async j() {
            this.f = await this.g.getUnwantedRecommendations();
            this.a.fire();
            this.B(this.g.onDidChangeExtensionsConfigs(async () => {
                this.f = await this.g.getUnwantedRecommendations();
                this.a.fire();
            }));
        }
        toggleGlobalIgnoredRecommendation(extensionId, shouldIgnore) {
            extensionId = extensionId.toLowerCase();
            const ignored = this.b.indexOf(extensionId) !== -1;
            if (ignored === shouldIgnore) {
                return;
            }
            this.b = shouldIgnore ? [...this.b, extensionId] : this.b.filter(id => id !== extensionId);
            this.r(this.b);
            this.c.fire({ extensionId, isRecommended: !shouldIgnore });
            this.a.fire();
        }
        m() {
            const ignoredRecommendations = JSON.parse(this.t);
            return ignoredRecommendations.map(e => e.toLowerCase());
        }
        n() {
            if (this.t !== this.u() /* This checks if current window changed the value or not */) {
                this.s = undefined;
                this.b = this.m();
                this.a.fire();
            }
        }
        r(ignoredRecommendations) {
            this.t = JSON.stringify(ignoredRecommendations);
        }
        get t() {
            if (!this.s) {
                this.s = this.u();
            }
            return this.s;
        }
        set t(ignoredRecommendationsValue) {
            if (this.t !== ignoredRecommendationsValue) {
                this.s = ignoredRecommendationsValue;
                this.w(ignoredRecommendationsValue);
            }
        }
        u() {
            return this.h.get(ignoredRecommendationsStorageKey, 0 /* StorageScope.PROFILE */, '[]');
        }
        w(value) {
            this.h.store(ignoredRecommendationsStorageKey, value, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
        }
    };
    exports.$Jzb = $Jzb;
    exports.$Jzb = $Jzb = __decorate([
        __param(0, workspaceExtensionsConfig_1.$qgb),
        __param(1, storage_1.$Vo)
    ], $Jzb);
    (0, extensions_1.$mr)(extensionRecommendations_1.$0fb, $Jzb, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=extensionIgnoredRecommendationsService.js.map