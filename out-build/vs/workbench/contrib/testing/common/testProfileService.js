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
define(["require", "exports", "vs/base/common/event", "vs/base/common/types", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/storage/common/storage", "vs/workbench/contrib/testing/common/storedValue", "vs/workbench/contrib/testing/common/testTypes", "vs/workbench/contrib/testing/common/testId", "vs/workbench/contrib/testing/common/testingContextKeys", "vs/base/common/lifecycle"], function (require, exports, event_1, types_1, contextkey_1, instantiation_1, storage_1, storedValue_1, testTypes_1, testId_1, testingContextKeys_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$_sb = exports.$$sb = exports.$0sb = exports.$9sb = void 0;
    exports.$9sb = (0, instantiation_1.$Bh)('testProfileService');
    /**
     * Gets whether the given profile can be used to run the test.
     */
    const $0sb = (profile, test) => profile.controllerId === test.controllerId && (testId_1.$PI.isRoot(test.item.extId) || !profile.tag || test.item.tags.includes(profile.tag));
    exports.$0sb = $0sb;
    const sorter = (a, b) => {
        if (a.isDefault !== b.isDefault) {
            return a.isDefault ? -1 : 1;
        }
        return a.label.localeCompare(b.label);
    };
    /**
     * Given a capabilities bitset, returns a map of context keys representing
     * them.
     */
    const $$sb = (capabilities) => [
        [testingContextKeys_1.TestingContextKeys.hasRunnableTests.key, (capabilities & 2 /* TestRunProfileBitset.Run */) !== 0],
        [testingContextKeys_1.TestingContextKeys.hasDebuggableTests.key, (capabilities & 4 /* TestRunProfileBitset.Debug */) !== 0],
        [testingContextKeys_1.TestingContextKeys.hasCoverableTests.key, (capabilities & 8 /* TestRunProfileBitset.Coverage */) !== 0],
    ];
    exports.$$sb = $$sb;
    let $_sb = class $_sb extends lifecycle_1.$kc {
        constructor(contextKeyService, storageService) {
            super();
            this.h = this.B(new event_1.$fd());
            this.j = new Map();
            /** @inheritdoc */
            this.onDidChange = this.h.event;
            this.f = this.B(new storedValue_1.$Gsb({
                key: 'testingPreferredProfiles',
                scope: 1 /* StorageScope.WORKSPACE */,
                target: 1 /* StorageTarget.MACHINE */,
            }, storageService));
            this.g = {
                [2 /* TestRunProfileBitset.Run */]: testingContextKeys_1.TestingContextKeys.hasRunnableTests.bindTo(contextKeyService),
                [4 /* TestRunProfileBitset.Debug */]: testingContextKeys_1.TestingContextKeys.hasDebuggableTests.bindTo(contextKeyService),
                [8 /* TestRunProfileBitset.Coverage */]: testingContextKeys_1.TestingContextKeys.hasCoverableTests.bindTo(contextKeyService),
                [16 /* TestRunProfileBitset.HasNonDefaultProfile */]: testingContextKeys_1.TestingContextKeys.hasNonDefaultProfile.bindTo(contextKeyService),
                [32 /* TestRunProfileBitset.HasConfigurable */]: testingContextKeys_1.TestingContextKeys.hasConfigurableProfile.bindTo(contextKeyService),
                [64 /* TestRunProfileBitset.SupportsContinuousRun */]: testingContextKeys_1.TestingContextKeys.supportsContinuousRun.bindTo(contextKeyService),
            };
            this.n();
        }
        /** @inheritdoc */
        addProfile(controller, profile) {
            let record = this.j.get(profile.controllerId);
            if (record) {
                record.profiles.push(profile);
                record.profiles.sort(sorter);
            }
            else {
                record = {
                    profiles: [profile],
                    controller,
                };
                this.j.set(profile.controllerId, record);
            }
            this.n();
            this.h.fire();
        }
        /** @inheritdoc */
        updateProfile(controllerId, profileId, update) {
            const ctrl = this.j.get(controllerId);
            if (!ctrl) {
                return;
            }
            const profile = ctrl.profiles.find(c => c.controllerId === controllerId && c.profileId === profileId);
            if (!profile) {
                return;
            }
            Object.assign(profile, update);
            ctrl.profiles.sort(sorter);
            this.h.fire();
        }
        /** @inheritdoc */
        configure(controllerId, profileId) {
            this.j.get(controllerId)?.controller.configureRunProfile(profileId);
        }
        /** @inheritdoc */
        removeProfile(controllerId, profileId) {
            const ctrl = this.j.get(controllerId);
            if (!ctrl) {
                return;
            }
            if (!profileId) {
                this.j.delete(controllerId);
                this.h.fire();
                return;
            }
            const index = ctrl.profiles.findIndex(c => c.profileId === profileId);
            if (index === -1) {
                return;
            }
            ctrl.profiles.splice(index, 1);
            this.n();
            this.h.fire();
        }
        /** @inheritdoc */
        capabilitiesForTest(test) {
            const ctrl = this.j.get(test.controllerId);
            if (!ctrl) {
                return 0;
            }
            let capabilities = 0;
            for (const profile of ctrl.profiles) {
                if (!profile.tag || test.item.tags.includes(profile.tag)) {
                    capabilities |= capabilities & profile.group ? 16 /* TestRunProfileBitset.HasNonDefaultProfile */ : profile.group;
                }
            }
            return capabilities;
        }
        /** @inheritdoc */
        all() {
            return this.j.values();
        }
        /** @inheritdoc */
        getControllerProfiles(profileId) {
            return this.j.get(profileId)?.profiles ?? [];
        }
        /** @inheritdoc */
        getGroupDefaultProfiles(group) {
            const preferred = this.f.get();
            if (!preferred) {
                return this.m(group);
            }
            const profiles = preferred[group]
                ?.map(p => this.j.get(p.controllerId)?.profiles.find(c => c.profileId === p.profileId && c.group === group))
                .filter(types_1.$rf);
            return profiles?.length ? profiles : this.m(group);
        }
        /** @inheritdoc */
        setGroupDefaultProfiles(group, profiles) {
            const next = {
                ...this.f.get(),
                [group]: profiles.map(c => ({ profileId: c.profileId, controllerId: c.controllerId })),
            };
            // When switching a run/debug profile, if the controller has a same-named
            // profile in the other group, use that instead of anything else that was selected.
            if (group === 2 /* TestRunProfileBitset.Run */ || group === 4 /* TestRunProfileBitset.Debug */) {
                const otherGroup = group === 2 /* TestRunProfileBitset.Run */ ? 4 /* TestRunProfileBitset.Debug */ : 2 /* TestRunProfileBitset.Run */;
                const previousDefaults = next[otherGroup] || [];
                let newDefaults = previousDefaults.slice();
                for (const [ctrlId, { profiles: ctrlProfiles }] of this.j) {
                    const labels = new Set(profiles.filter(p => p.controllerId === ctrlId).map(p => p.label));
                    const nextByLabels = ctrlProfiles.filter(p => labels.has(p.label) && p.group === otherGroup);
                    if (nextByLabels.length) {
                        newDefaults = newDefaults.filter(p => p.controllerId !== ctrlId);
                        newDefaults.push(...nextByLabels.map(p => ({ profileId: p.profileId, controllerId: p.controllerId })));
                    }
                }
                next[otherGroup] = newDefaults;
            }
            this.f.store(next);
            this.h.fire();
        }
        m(group) {
            const defaults = [];
            for (const { profiles } of this.j.values()) {
                const profile = profiles.find(c => c.group === group);
                if (profile) {
                    defaults.push(profile);
                }
            }
            return defaults;
        }
        n() {
            let allCapabilities = 0;
            for (const { profiles } of this.j.values()) {
                for (const profile of profiles) {
                    allCapabilities |= allCapabilities & profile.group ? 16 /* TestRunProfileBitset.HasNonDefaultProfile */ : profile.group;
                    allCapabilities |= profile.supportsContinuousRun ? 64 /* TestRunProfileBitset.SupportsContinuousRun */ : 0;
                }
            }
            for (const group of testTypes_1.$QI) {
                this.g[group].set((allCapabilities & group) !== 0);
            }
        }
    };
    exports.$_sb = $_sb;
    exports.$_sb = $_sb = __decorate([
        __param(0, contextkey_1.$3i),
        __param(1, storage_1.$Vo)
    ], $_sb);
});
//# sourceMappingURL=testProfileService.js.map