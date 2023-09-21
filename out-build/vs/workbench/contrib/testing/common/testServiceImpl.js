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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/iterator", "vs/base/common/lifecycle", "vs/nls!vs/workbench/contrib/testing/common/testServiceImpl", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/notification/common/notification", "vs/platform/storage/common/storage", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/contrib/testing/common/mainThreadTestCollection", "vs/workbench/contrib/testing/common/observableValue", "vs/workbench/contrib/testing/common/storedValue", "vs/workbench/contrib/testing/common/testExclusions", "vs/workbench/contrib/testing/common/testId", "vs/workbench/contrib/testing/common/testingContextKeys", "vs/workbench/contrib/testing/common/testProfileService", "vs/workbench/contrib/testing/common/testResultService", "vs/workbench/services/editor/common/editorService", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/testing/common/configuration", "vs/base/common/types"], function (require, exports, arrays_1, cancellation_1, event_1, iterator_1, lifecycle_1, nls_1, contextkey_1, instantiation_1, notification_1, storage_1, workspaceTrust_1, mainThreadTestCollection_1, observableValue_1, storedValue_1, testExclusions_1, testId_1, testingContextKeys_1, testProfileService_1, testResultService_1, editorService_1, configuration_1, configuration_2, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$PKb = void 0;
    let $PKb = class $PKb extends lifecycle_1.$kc {
        constructor(contextKeyService, instantiationService, z, C, D, F, G, H, I) {
            super();
            this.z = z;
            this.C = C;
            this.D = D;
            this.F = F;
            this.G = G;
            this.H = H;
            this.I = I;
            this.f = new Map();
            this.g = new event_1.$fd();
            this.h = new event_1.$fd();
            this.j = new event_1.$fd();
            this.m = new Set();
            /**
             * Cancellation for runs requested by the user being managed by the UI.
             * Test runs initiated by extensions are not included here.
             */
            this.y = new Map();
            /**
             * @inheritdoc
             */
            this.onWillProcessDiff = this.h.event;
            /**
             * @inheritdoc
             */
            this.onDidProcessDiff = this.j.event;
            /**
             * @inheritdoc
             */
            this.onDidCancelTestRun = this.g.event;
            /**
             * @inheritdoc
             */
            this.collection = new mainThreadTestCollection_1.$OKb(this.expandTest.bind(this));
            /**
             * @inheritdoc
             */
            this.showInlineOutput = observableValue_1.$Isb.stored(this.B(new storedValue_1.$Gsb({
                key: 'inlineTestOutputVisible',
                scope: 1 /* StorageScope.WORKSPACE */,
                target: 0 /* StorageTarget.USER */
            }, this.z)), true);
            this.excluded = instantiationService.createInstance(testExclusions_1.$Nsb);
            this.n = testingContextKeys_1.TestingContextKeys.providerCount.bindTo(contextKeyService);
            this.s = testingContextKeys_1.TestingContextKeys.canRefreshTests.bindTo(contextKeyService);
            this.u = testingContextKeys_1.TestingContextKeys.isRefreshingTests.bindTo(contextKeyService);
            this.w = testingContextKeys_1.TestingContextKeys.activeEditorHasTests.bindTo(contextKeyService);
            this.B(C.onDidActiveEditorChange(() => this.J()));
        }
        /**
         * @inheritdoc
         */
        async expandTest(id, levels) {
            await this.f.get(testId_1.$PI.fromString(id).controllerId)?.expandTest(id, levels);
        }
        /**
         * @inheritdoc
         */
        cancelTestRun(runId) {
            this.g.fire({ runId });
            if (runId === undefined) {
                for (const runCts of this.y.values()) {
                    runCts.cancel();
                }
            }
            else {
                this.y.get(runId)?.cancel();
            }
        }
        /**
         * @inheritdoc
         */
        async runTests(req, token = cancellation_1.CancellationToken.None) {
            const resolved = {
                targets: [],
                exclude: req.exclude?.map(t => t.item.extId),
                continuous: req.continuous,
            };
            // First, try to run the tests using the default run profiles...
            for (const profile of this.D.getGroupDefaultProfiles(req.group)) {
                const testIds = req.tests.filter(t => (0, testProfileService_1.$0sb)(profile, t)).map(t => t.item.extId);
                if (testIds.length) {
                    resolved.targets.push({
                        testIds: testIds,
                        profileGroup: profile.group,
                        profileId: profile.profileId,
                        controllerId: profile.controllerId,
                    });
                }
            }
            // If no tests are covered by the defaults, just use whatever the defaults
            // for their controller are. This can happen if the user chose specific
            // profiles for the run button, but then asked to run a single test from the
            // explorer or decoration. We shouldn't no-op.
            if (resolved.targets.length === 0) {
                for (const byController of (0, arrays_1.$xb)(req.tests, (a, b) => a.controllerId === b.controllerId ? 0 : 1)) {
                    const profiles = this.D.getControllerProfiles(byController[0].controllerId);
                    const withControllers = byController.map(test => ({
                        profile: profiles.find(p => p.group === req.group && (0, testProfileService_1.$0sb)(p, test)),
                        test,
                    }));
                    for (const byProfile of (0, arrays_1.$xb)(withControllers, (a, b) => a.profile === b.profile ? 0 : 1)) {
                        const profile = byProfile[0].profile;
                        if (profile) {
                            resolved.targets.push({
                                testIds: byProfile.map(t => t.test.item.extId),
                                profileGroup: req.group,
                                profileId: profile.profileId,
                                controllerId: profile.controllerId,
                            });
                        }
                    }
                }
            }
            return this.runResolvedTests(resolved, token);
        }
        /** @inheritdoc */
        async startContinuousRun(req, token) {
            if (!req.exclude) {
                req.exclude = [...this.excluded.all];
            }
            const trust = await this.I.requestWorkspaceTrust({
                message: (0, nls_1.localize)(0, null),
            });
            if (!trust) {
                return;
            }
            const byController = (0, arrays_1.$xb)(req.targets, (a, b) => a.controllerId.localeCompare(b.controllerId));
            const requests = byController.map(group => this.f.get(group[0].controllerId)?.startContinuousRun(group.map(controlReq => ({
                excludeExtIds: req.exclude.filter(t => !controlReq.testIds.includes(t)),
                profileId: controlReq.profileId,
                controllerId: controlReq.controllerId,
                testIds: controlReq.testIds,
            })), token).then(result => {
                const errs = result.map(r => r.error).filter(types_1.$rf);
                if (errs.length) {
                    this.F.error((0, nls_1.localize)(1, null, errs.join(' ')));
                }
            }));
            await Promise.all(requests);
        }
        /**
         * @inheritdoc
         */
        async runResolvedTests(req, token = cancellation_1.CancellationToken.None) {
            if (!req.exclude) {
                req.exclude = [...this.excluded.all];
            }
            const result = this.H.createLiveResult(req);
            const trust = await this.I.requestWorkspaceTrust({
                message: (0, nls_1.localize)(2, null),
            });
            if (!trust) {
                result.markComplete();
                return result;
            }
            try {
                const cancelSource = new cancellation_1.$pd(token);
                this.y.set(result.id, cancelSource);
                const byController = (0, arrays_1.$xb)(req.targets, (a, b) => a.controllerId.localeCompare(b.controllerId));
                const requests = byController.map(group => this.f.get(group[0].controllerId)?.runTests(group.map(controlReq => ({
                    runId: result.id,
                    excludeExtIds: req.exclude.filter(t => !controlReq.testIds.includes(t)),
                    profileId: controlReq.profileId,
                    controllerId: controlReq.controllerId,
                    testIds: controlReq.testIds,
                })), cancelSource.token).then(result => {
                    const errs = result.map(r => r.error).filter(types_1.$rf);
                    if (errs.length) {
                        this.F.error((0, nls_1.localize)(3, null, errs.join(' ')));
                    }
                }));
                await this.L(req);
                await Promise.all(requests);
                return result;
            }
            finally {
                this.y.delete(result.id);
                result.markComplete();
            }
        }
        /**
         * @inheritdoc
         */
        publishDiff(_controllerId, diff) {
            this.h.fire(diff);
            this.collection.apply(diff);
            this.J();
            this.j.fire(diff);
        }
        /**
         * @inheritdoc
         */
        getTestController(id) {
            return this.f.get(id);
        }
        /**
         * @inheritdoc
         */
        async syncTests() {
            const cts = new cancellation_1.$pd();
            try {
                await Promise.all([...this.f.values()].map(c => c.syncTests(cts.token)));
            }
            finally {
                cts.dispose(true);
            }
        }
        /**
         * @inheritdoc
         */
        async refreshTests(controllerId) {
            const cts = new cancellation_1.$pd();
            this.m.add(cts);
            this.u.set(true);
            try {
                if (controllerId) {
                    await this.f.get(controllerId)?.refreshTests(cts.token);
                }
                else {
                    await Promise.all([...this.f.values()].map(c => c.refreshTests(cts.token)));
                }
            }
            finally {
                this.m.delete(cts);
                this.u.set(this.m.size > 0);
                cts.dispose(true);
            }
        }
        /**
         * @inheritdoc
         */
        cancelRefreshTests() {
            for (const cts of this.m) {
                cts.cancel();
            }
            this.m.clear();
            this.u.set(false);
        }
        /**
         * @inheritdoc
         */
        registerTestController(id, controller) {
            this.f.set(id, controller);
            this.n.set(this.f.size);
            this.M();
            const disposable = new lifecycle_1.$jc();
            disposable.add((0, lifecycle_1.$ic)(() => {
                const diff = [];
                for (const root of this.collection.rootItems) {
                    if (root.controllerId === id) {
                        diff.push({ op: 3 /* TestDiffOpType.Remove */, itemId: root.item.extId });
                    }
                }
                this.publishDiff(id, diff);
                if (this.f.delete(id)) {
                    this.n.set(this.f.size);
                    this.M();
                }
            }));
            disposable.add(controller.canRefresh.onDidChange(this.M, this));
            return disposable;
        }
        J() {
            const uri = this.C.activeEditor?.resource;
            if (uri) {
                this.w.set(!iterator_1.Iterable.isEmpty(this.collection.getNodeByUrl(uri)));
            }
            else {
                this.w.set(false);
            }
        }
        async L(req, configurationService = this.G, editorService = this.C) {
            if (req.isUiTriggered === false) {
                return;
            }
            const saveBeforeTest = (0, configuration_2.$hKb)(this.G, "testing.saveBeforeTest" /* TestingConfigKeys.SaveBeforeTest */);
            if (saveBeforeTest) {
                await editorService.saveAll();
            }
            return;
        }
        M() {
            this.s.set(iterator_1.Iterable.some(this.f.values(), t => t.canRefresh.value));
        }
    };
    exports.$PKb = $PKb;
    exports.$PKb = $PKb = __decorate([
        __param(0, contextkey_1.$3i),
        __param(1, instantiation_1.$Ah),
        __param(2, storage_1.$Vo),
        __param(3, editorService_1.$9C),
        __param(4, testProfileService_1.$9sb),
        __param(5, notification_1.$Yu),
        __param(6, configuration_1.$8h),
        __param(7, testResultService_1.$ftb),
        __param(8, workspaceTrust_1.$_z)
    ], $PKb);
});
//# sourceMappingURL=testServiceImpl.js.map