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
define(["require", "exports", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/contrib/extensions/browser/extensionRecommendations", "vs/nls!vs/workbench/contrib/extensions/browser/exeBasedRecommendations"], function (require, exports, extensionManagement_1, extensionRecommendations_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$QUb = void 0;
    let $QUb = class $QUb extends extensionRecommendations_1.$PUb {
        get otherRecommendations() { return this.a.map(tip => this.r(tip)); }
        get importantRecommendations() { return this.b.map(tip => this.r(tip)); }
        get recommendations() { return [...this.importantRecommendations, ...this.otherRecommendations]; }
        constructor(g) {
            super();
            this.g = g;
            this.a = [];
            this.b = [];
        }
        getRecommendations(exe) {
            const important = this.b
                .filter(tip => tip.exeName.toLowerCase() === exe.toLowerCase())
                .map(tip => this.r(tip));
            const others = this.a
                .filter(tip => tip.exeName.toLowerCase() === exe.toLowerCase())
                .map(tip => this.r(tip));
            return { important, others };
        }
        async c() {
            this.a = await this.g.getOtherExecutableBasedTips();
            await this.m();
        }
        async m() {
            if (!this.j) {
                this.j = this.n();
            }
            return this.j;
        }
        async n() {
            const importantExeBasedRecommendations = new Map();
            this.b = await this.g.getImportantExecutableBasedTips();
            this.b.forEach(tip => importantExeBasedRecommendations.set(tip.extensionId.toLowerCase(), tip));
            return importantExeBasedRecommendations;
        }
        r(tip) {
            return {
                extensionId: tip.extensionId.toLowerCase(),
                reason: {
                    reasonId: 2 /* ExtensionRecommendationReason.Executable */,
                    reasonText: (0, nls_1.localize)(0, null, tip.exeFriendlyName)
                }
            };
        }
    };
    exports.$QUb = $QUb;
    exports.$QUb = $QUb = __decorate([
        __param(0, extensionManagement_1.$6n)
    ], $QUb);
});
//# sourceMappingURL=exeBasedRecommendations.js.map