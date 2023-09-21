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
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionRecommendations/common/extensionRecommendations", "vs/platform/instantiation/common/instantiation", "vs/platform/telemetry/common/telemetry", "vs/base/common/arrays", "vs/base/common/event", "vs/platform/environment/common/environment", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/contrib/extensions/browser/exeBasedRecommendations", "vs/workbench/contrib/extensions/browser/workspaceRecommendations", "vs/workbench/contrib/extensions/browser/fileBasedRecommendations", "vs/workbench/contrib/extensions/browser/keymapRecommendations", "vs/workbench/contrib/extensions/browser/languageRecommendations", "vs/workbench/contrib/extensions/browser/configBasedRecommendations", "vs/platform/extensionRecommendations/common/extensionRecommendations", "vs/base/common/async", "vs/base/common/uri", "vs/workbench/contrib/extensions/browser/webRecommendations", "vs/workbench/contrib/extensions/common/extensions", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/workbench/contrib/extensions/browser/remoteRecommendations", "vs/platform/remote/common/remoteExtensionsScanner", "vs/workbench/services/userData/browser/userDataInit"], function (require, exports, lifecycle_1, extensionManagement_1, extensionRecommendations_1, instantiation_1, telemetry_1, arrays_1, event_1, environment_1, lifecycle_2, exeBasedRecommendations_1, workspaceRecommendations_1, fileBasedRecommendations_1, keymapRecommendations_1, languageRecommendations_1, configBasedRecommendations_1, extensionRecommendations_2, async_1, uri_1, webRecommendations_1, extensions_1, extensionManagementUtil_1, remoteRecommendations_1, remoteExtensionsScanner_1, userDataInit_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$1Ub = void 0;
    let $1Ub = class $1Ub extends lifecycle_1.$kc {
        constructor(instantiationService, s, t, u, w, y, z, C, D, F, G) {
            super();
            this.s = s;
            this.t = t;
            this.u = u;
            this.w = w;
            this.y = y;
            this.z = z;
            this.C = C;
            this.D = D;
            this.F = F;
            this.G = G;
            this.r = this.B(new event_1.$fd());
            this.onDidChangeRecommendations = this.r.event;
            this.b = this.B(instantiationService.createInstance(workspaceRecommendations_1.$RUb));
            this.a = this.B(instantiationService.createInstance(fileBasedRecommendations_1.$UUb));
            this.c = this.B(instantiationService.createInstance(configBasedRecommendations_1.$XUb));
            this.f = this.B(instantiationService.createInstance(exeBasedRecommendations_1.$QUb));
            this.g = this.B(instantiationService.createInstance(keymapRecommendations_1.$VUb));
            this.h = this.B(instantiationService.createInstance(webRecommendations_1.$YUb));
            this.j = this.B(instantiationService.createInstance(languageRecommendations_1.$WUb));
            this.m = this.B(instantiationService.createInstance(remoteRecommendations_1.$ZUb));
            if (!this.I()) {
                this.n = 0;
                this.activationPromise = Promise.resolve();
                return;
            }
            this.n = +new Date();
            // Activation
            this.activationPromise = this.H();
            this.B(this.y.onDidInstallExtensions(e => this.L(e)));
        }
        async H() {
            try {
                await Promise.allSettled([
                    this.F.whenExtensionsReady(),
                    this.G.whenInitializationFinished(),
                    this.s.when(3 /* LifecyclePhase.Restored */)
                ]);
            }
            catch (error) { /* ignore */ }
            // activate all recommendations
            await Promise.all([
                this.b.activate(),
                this.c.activate(),
                this.a.activate(),
                this.g.activate(),
                this.j.activate(),
                this.h.activate(),
                this.m.activate()
            ]);
            this.B(event_1.Event.any(this.b.onDidChangeRecommendations, this.c.onDidChangeRecommendations, this.z.onDidChangeIgnoredRecommendations)(() => this.r.fire()));
            this.B(this.z.onDidChangeGlobalIgnoredRecommendation(({ extensionId, isRecommended }) => {
                if (!isRecommended) {
                    const reason = this.getAllRecommendationsWithReason()[extensionId];
                    if (reason && reason.reasonId) {
                        this.u.publicLog2('extensionsRecommendations:ignoreRecommendation', { extensionId, recommendationReason: reason.reasonId });
                    }
                }
            }));
            this.O();
        }
        I() {
            return this.t.isEnabled() && !this.w.isExtensionDevelopment;
        }
        async J() {
            await Promise.all([this.f.activate(), this.c.activate()]);
        }
        getAllRecommendationsWithReason() {
            /* Activate proactive recommendations */
            this.J();
            const output = Object.create(null);
            const allRecommendations = [
                ...this.c.recommendations,
                ...this.f.recommendations,
                ...this.a.recommendations,
                ...this.b.recommendations,
                ...this.g.recommendations,
                ...this.j.recommendations,
                ...this.h.recommendations,
            ];
            for (const { extensionId, reason } of allRecommendations) {
                if (this.N(extensionId)) {
                    output[extensionId.toLowerCase()] = reason;
                }
            }
            return output;
        }
        async getConfigBasedRecommendations() {
            await this.c.activate();
            return {
                important: this.M(this.c.importantRecommendations),
                others: this.M(this.c.otherRecommendations)
            };
        }
        async getOtherRecommendations() {
            await this.activationPromise;
            await this.J();
            const recommendations = [
                ...this.c.otherRecommendations,
                ...this.f.otherRecommendations,
                ...this.h.recommendations
            ];
            const extensionIds = (0, arrays_1.$Kb)(recommendations.map(e => e.extensionId))
                .filter(extensionId => this.N(extensionId));
            (0, arrays_1.$Vb)(extensionIds, this.n);
            return extensionIds;
        }
        async getImportantRecommendations() {
            await this.J();
            const recommendations = [
                ...this.a.importantRecommendations,
                ...this.c.importantRecommendations,
                ...this.f.importantRecommendations,
            ];
            const extensionIds = (0, arrays_1.$Kb)(recommendations.map(e => e.extensionId))
                .filter(extensionId => this.N(extensionId));
            (0, arrays_1.$Vb)(extensionIds, this.n);
            return extensionIds;
        }
        getKeymapRecommendations() {
            return this.M(this.g.recommendations);
        }
        getLanguageRecommendations() {
            return this.M(this.j.recommendations);
        }
        getRemoteRecommendations() {
            return this.M(this.m.recommendations);
        }
        async getWorkspaceRecommendations() {
            if (!this.I()) {
                return [];
            }
            await this.b.activate();
            return this.M(this.b.recommendations);
        }
        async getExeBasedRecommendations(exe) {
            await this.f.activate();
            const { important, others } = exe ? this.f.getRecommendations(exe)
                : { important: this.f.importantRecommendations, others: this.f.otherRecommendations };
            return { important: this.M(important), others: this.M(others) };
        }
        getFileBasedRecommendations() {
            return this.M(this.a.recommendations);
        }
        L(results) {
            for (const e of results) {
                if (e.source && !uri_1.URI.isUri(e.source) && e.operation === 2 /* InstallOperation.Install */) {
                    const extRecommendations = this.getAllRecommendationsWithReason() || {};
                    const recommendationReason = extRecommendations[e.source.identifier.id.toLowerCase()];
                    if (recommendationReason) {
                        /* __GDPR__
                            "extensionGallery:install:recommendations" : {
                                "owner": "sandy081",
                                "recommendationReason": { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                                "${include}": [
                                    "${GalleryExtensionTelemetryData}"
                                ]
                            }
                        */
                        this.u.publicLog('extensionGallery:install:recommendations', { ...e.source.telemetryData, recommendationReason: recommendationReason.reasonId });
                    }
                }
            }
        }
        M(recommendations) {
            const extensionIds = (0, arrays_1.$Kb)(recommendations.map(e => e.extensionId))
                .filter(extensionId => this.N(extensionId));
            return extensionIds;
        }
        N(extensionId) {
            return !this.z.ignoredRecommendations.includes(extensionId.toLowerCase());
        }
        async O() {
            const installed = await this.D.queryLocal();
            const allowedRecommendations = [
                ...this.b.recommendations,
                ...this.c.importantRecommendations.filter(recommendation => !recommendation.whenNotInstalled || recommendation.whenNotInstalled.every(id => installed.every(local => !(0, extensionManagementUtil_1.$po)(local.identifier, { id }))))
            ]
                .map(({ extensionId }) => extensionId)
                .filter(extensionId => this.N(extensionId));
            if (allowedRecommendations.length) {
                await this.P((0, async_1.$Hg)(5000));
                await this.C.promptWorkspaceRecommendations(allowedRecommendations);
            }
        }
        P(o) {
            this.B((0, lifecycle_1.$ic)(() => o.cancel()));
            return o;
        }
    };
    exports.$1Ub = $1Ub;
    exports.$1Ub = $1Ub = __decorate([
        __param(0, instantiation_1.$Ah),
        __param(1, lifecycle_2.$7y),
        __param(2, extensionManagement_1.$Zn),
        __param(3, telemetry_1.$9k),
        __param(4, environment_1.$Ih),
        __param(5, extensionManagement_1.$2n),
        __param(6, extensionRecommendations_1.$0fb),
        __param(7, extensionRecommendations_2.$TUb),
        __param(8, extensions_1.$Pfb),
        __param(9, remoteExtensionsScanner_1.$oN),
        __param(10, userDataInit_1.$wzb)
    ], $1Ub);
});
//# sourceMappingURL=extensionRecommendationsService.js.map