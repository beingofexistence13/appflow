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
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/storage/common/storage", "vs/workbench/contrib/testing/common/storedValue", "vs/workbench/contrib/testing/common/testingContextKeys", "vs/workbench/contrib/testing/common/testService", "vs/base/common/event", "vs/workbench/contrib/testing/common/testId", "vs/base/common/prefixTree"], function (require, exports, cancellation_1, lifecycle_1, contextkey_1, instantiation_1, storage_1, storedValue_1, testingContextKeys_1, testService_1, event_1, testId_1, prefixTree_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$RKb = exports.$QKb = void 0;
    exports.$QKb = (0, instantiation_1.$Bh)('testingContinuousRunService');
    let $RKb = class $RKb extends lifecycle_1.$kc {
        get lastRunProfileIds() {
            return this.g.get(new Set());
        }
        constructor(j, storageService, contextKeyService) {
            super();
            this.j = j;
            this.a = new event_1.$fd();
            this.f = new prefixTree_1.$KS();
            this.onDidChange = this.a.event;
            this.h = testingContextKeys_1.TestingContextKeys.isContinuousModeOn.bindTo(contextKeyService);
            this.g = this.B(new storedValue_1.$Gsb({
                key: 'lastContinuousRunProfileIds',
                scope: 1 /* StorageScope.WORKSPACE */,
                target: 1 /* StorageTarget.MACHINE */,
                serialization: {
                    deserialize: v => new Set(JSON.parse(v)),
                    serialize: v => JSON.stringify([...v])
                },
            }, storageService));
            this.B((0, lifecycle_1.$ic)(() => {
                this.b?.dispose();
                for (const cts of this.f.values()) {
                    cts.dispose();
                }
            }));
        }
        /** @inheritdoc */
        isSpecificallyEnabledFor(testId) {
            return this.f.size > 0 && this.f.hasKey(testId_1.$PI.fromString(testId).path);
        }
        /** @inheritdoc */
        isEnabledForAParentOf(testId) {
            if (this.b) {
                return true;
            }
            return this.f.size > 0 && this.f.hasKeyOrParent(testId_1.$PI.fromString(testId).path);
        }
        /** @inheritdoc */
        isEnabledForAChildOf(testId) {
            return this.f.size > 0 && this.f.hasKeyOrChildren(testId_1.$PI.fromString(testId).path);
        }
        /** @inheritdoc */
        isEnabled() {
            return !!this.b || this.f.size > 0;
        }
        /** @inheritdoc */
        start(profile, testId) {
            const cts = new cancellation_1.$pd();
            if (testId === undefined) {
                this.h.set(true);
            }
            if (!testId) {
                this.b?.dispose(true);
                this.b = cts;
            }
            else {
                this.f.mutate(testId_1.$PI.fromString(testId).path, c => {
                    c?.dispose(true);
                    return cts;
                });
            }
            this.g.store(new Set(profile.map(p => p.profileId)));
            this.j.startContinuousRun({
                continuous: true,
                targets: profile.map(p => ({
                    testIds: [testId ?? p.controllerId],
                    controllerId: p.controllerId,
                    profileGroup: p.group,
                    profileId: p.profileId
                })),
            }, cts.token);
            this.a.fire(testId);
        }
        /** @inheritdoc */
        stop(testId) {
            if (!testId) {
                this.b?.dispose(true);
                this.b = undefined;
            }
            else {
                this.f.delete(testId_1.$PI.fromString(testId).path)?.dispose(true);
            }
            if (testId === undefined) {
                this.h.set(false);
            }
            this.a.fire(testId);
        }
    };
    exports.$RKb = $RKb;
    exports.$RKb = $RKb = __decorate([
        __param(0, testService_1.$4sb),
        __param(1, storage_1.$Vo),
        __param(2, contextkey_1.$3i)
    ], $RKb);
});
//# sourceMappingURL=testingContinuousRunService.js.map