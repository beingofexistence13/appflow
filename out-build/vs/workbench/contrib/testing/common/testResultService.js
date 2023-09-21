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
define(["require", "exports", "vs/base/common/arraysFind", "vs/base/common/async", "vs/base/common/event", "vs/base/common/functional", "vs/base/common/lifecycle", "vs/base/common/uuid", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/testing/common/testingContextKeys", "vs/workbench/contrib/testing/common/testProfileService", "vs/workbench/contrib/testing/common/testResult", "vs/workbench/contrib/testing/common/testResultStorage"], function (require, exports, arraysFind_1, async_1, event_1, functional_1, lifecycle_1, uuid_1, contextkey_1, instantiation_1, testingContextKeys_1, testProfileService_1, testResult_1, testResultStorage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$gtb = exports.$ftb = void 0;
    const isRunningTests = (service) => service.results.length > 0 && service.results[0].completedAt === undefined;
    exports.$ftb = (0, instantiation_1.$Bh)('testResultService');
    let $gtb = class $gtb extends lifecycle_1.$kc {
        /**
         * @inheritdoc
         */
        get results() {
            this.s();
            return this.g;
        }
        constructor(contextKeyService, w, y) {
            super();
            this.w = w;
            this.y = y;
            this.f = this.B(new event_1.$fd());
            this.g = [];
            this.h = [];
            this.j = this.B(new event_1.$fd());
            /**
             * @inheritdoc
             */
            this.onResultsChanged = this.f.event;
            /**
             * @inheritdoc
             */
            this.onTestChanged = this.j.event;
            this.s = (0, functional_1.$bb)(() => this.w.read().then(loaded => {
                for (let i = loaded.length - 1; i >= 0; i--) {
                    this.push(loaded[i]);
                }
            }));
            this.u = new async_1.$Sg(() => this.F(), 500);
            this.B((0, lifecycle_1.$ic)(() => (0, lifecycle_1.$fc)(this.h)));
            this.m = testingContextKeys_1.TestingContextKeys.isRunning.bindTo(contextKeyService);
            this.n = testingContextKeys_1.TestingContextKeys.hasAnyResults.bindTo(contextKeyService);
        }
        /**
         * @inheritdoc
         */
        getStateById(extId) {
            for (const result of this.results) {
                const lookup = result.getStateById(extId);
                if (lookup && lookup.computedState !== 0 /* TestResultState.Unset */) {
                    return [result, lookup];
                }
            }
            return undefined;
        }
        /**
         * @inheritdoc
         */
        createLiveResult(req) {
            if ('targets' in req) {
                const id = (0, uuid_1.$4f)();
                return this.push(new testResult_1.$2sb(id, true, req));
            }
            let profile;
            if (req.profile) {
                const profiles = this.y.getControllerProfiles(req.controllerId);
                profile = profiles.find(c => c.profileId === req.profile.id);
            }
            const resolved = {
                isUiTriggered: false,
                targets: [],
                exclude: req.exclude,
                continuous: req.continuous,
            };
            if (profile) {
                resolved.targets.push({
                    profileGroup: profile.group,
                    profileId: profile.profileId,
                    controllerId: req.controllerId,
                    testIds: req.include,
                });
            }
            return this.push(new testResult_1.$2sb(req.id, req.persist, resolved));
        }
        /**
         * @inheritdoc
         */
        push(result) {
            if (result.completedAt === undefined) {
                this.results.unshift(result);
            }
            else {
                const index = (0, arraysFind_1.$ib)(this.results, r => r.completedAt !== undefined && r.completedAt <= result.completedAt);
                this.results.splice(index, 0, result);
                this.u.schedule();
            }
            this.n.set(true);
            if (this.results.length > testResultStorage_1.$atb) {
                this.results.pop();
                this.h.pop()?.dispose();
            }
            const ds = new lifecycle_1.$jc();
            this.h.push(ds);
            if (result instanceof testResult_1.$2sb) {
                ds.add(result);
                ds.add(result.onComplete(() => this.z(result)));
                ds.add(result.onChange(this.j.fire, this.j));
                this.m.set(true);
                this.f.fire({ started: result });
            }
            else {
                this.f.fire({ inserted: result });
                // If this is not a new result, go through each of its tests. For each
                // test for which the new result is the most recently inserted, fir
                // a change event so that UI updates.
                for (const item of result.tests) {
                    for (const otherResult of this.results) {
                        if (otherResult === result) {
                            this.j.fire({ item, result, reason: 0 /* TestResultItemChangeReason.ComputedStateChange */ });
                            break;
                        }
                        else if (otherResult.getStateById(item.item.extId) !== undefined) {
                            break;
                        }
                    }
                }
            }
            return result;
        }
        /**
         * @inheritdoc
         */
        getResult(id) {
            return this.results.find(r => r.id === id);
        }
        /**
         * @inheritdoc
         */
        clear() {
            const keep = [];
            const removed = [];
            for (const result of this.results) {
                if (result.completedAt !== undefined) {
                    removed.push(result);
                }
                else {
                    keep.push(result);
                }
            }
            this.g = keep;
            this.u.schedule();
            if (keep.length === 0) {
                this.n.set(false);
            }
            this.f.fire({ removed });
        }
        z(result) {
            this.C();
            this.D();
            this.u.schedule();
            this.f.fire({ completed: result });
        }
        C() {
            this.results.sort((a, b) => (b.completedAt ?? Number.MAX_SAFE_INTEGER) - (a.completedAt ?? Number.MAX_SAFE_INTEGER));
        }
        D() {
            this.m.set(isRunningTests(this));
        }
        async F() {
            // ensure results are loaded before persisting to avoid deleting once
            // that we don't have yet.
            await this.s();
            this.w.persist(this.results);
        }
    };
    exports.$gtb = $gtb;
    exports.$gtb = $gtb = __decorate([
        __param(0, contextkey_1.$3i),
        __param(1, testResultStorage_1.$btb),
        __param(2, testProfileService_1.$9sb)
    ], $gtb);
});
//# sourceMappingURL=testResultService.js.map