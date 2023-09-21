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
    exports.TestProfileService = exports.capabilityContextKeys = exports.canUseProfileWithTest = exports.ITestProfileService = void 0;
    exports.ITestProfileService = (0, instantiation_1.createDecorator)('testProfileService');
    /**
     * Gets whether the given profile can be used to run the test.
     */
    const canUseProfileWithTest = (profile, test) => profile.controllerId === test.controllerId && (testId_1.TestId.isRoot(test.item.extId) || !profile.tag || test.item.tags.includes(profile.tag));
    exports.canUseProfileWithTest = canUseProfileWithTest;
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
    const capabilityContextKeys = (capabilities) => [
        [testingContextKeys_1.TestingContextKeys.hasRunnableTests.key, (capabilities & 2 /* TestRunProfileBitset.Run */) !== 0],
        [testingContextKeys_1.TestingContextKeys.hasDebuggableTests.key, (capabilities & 4 /* TestRunProfileBitset.Debug */) !== 0],
        [testingContextKeys_1.TestingContextKeys.hasCoverableTests.key, (capabilities & 8 /* TestRunProfileBitset.Coverage */) !== 0],
    ];
    exports.capabilityContextKeys = capabilityContextKeys;
    let TestProfileService = class TestProfileService extends lifecycle_1.Disposable {
        constructor(contextKeyService, storageService) {
            super();
            this.changeEmitter = this._register(new event_1.Emitter());
            this.controllerProfiles = new Map();
            /** @inheritdoc */
            this.onDidChange = this.changeEmitter.event;
            this.preferredDefaults = this._register(new storedValue_1.StoredValue({
                key: 'testingPreferredProfiles',
                scope: 1 /* StorageScope.WORKSPACE */,
                target: 1 /* StorageTarget.MACHINE */,
            }, storageService));
            this.capabilitiesContexts = {
                [2 /* TestRunProfileBitset.Run */]: testingContextKeys_1.TestingContextKeys.hasRunnableTests.bindTo(contextKeyService),
                [4 /* TestRunProfileBitset.Debug */]: testingContextKeys_1.TestingContextKeys.hasDebuggableTests.bindTo(contextKeyService),
                [8 /* TestRunProfileBitset.Coverage */]: testingContextKeys_1.TestingContextKeys.hasCoverableTests.bindTo(contextKeyService),
                [16 /* TestRunProfileBitset.HasNonDefaultProfile */]: testingContextKeys_1.TestingContextKeys.hasNonDefaultProfile.bindTo(contextKeyService),
                [32 /* TestRunProfileBitset.HasConfigurable */]: testingContextKeys_1.TestingContextKeys.hasConfigurableProfile.bindTo(contextKeyService),
                [64 /* TestRunProfileBitset.SupportsContinuousRun */]: testingContextKeys_1.TestingContextKeys.supportsContinuousRun.bindTo(contextKeyService),
            };
            this.refreshContextKeys();
        }
        /** @inheritdoc */
        addProfile(controller, profile) {
            let record = this.controllerProfiles.get(profile.controllerId);
            if (record) {
                record.profiles.push(profile);
                record.profiles.sort(sorter);
            }
            else {
                record = {
                    profiles: [profile],
                    controller,
                };
                this.controllerProfiles.set(profile.controllerId, record);
            }
            this.refreshContextKeys();
            this.changeEmitter.fire();
        }
        /** @inheritdoc */
        updateProfile(controllerId, profileId, update) {
            const ctrl = this.controllerProfiles.get(controllerId);
            if (!ctrl) {
                return;
            }
            const profile = ctrl.profiles.find(c => c.controllerId === controllerId && c.profileId === profileId);
            if (!profile) {
                return;
            }
            Object.assign(profile, update);
            ctrl.profiles.sort(sorter);
            this.changeEmitter.fire();
        }
        /** @inheritdoc */
        configure(controllerId, profileId) {
            this.controllerProfiles.get(controllerId)?.controller.configureRunProfile(profileId);
        }
        /** @inheritdoc */
        removeProfile(controllerId, profileId) {
            const ctrl = this.controllerProfiles.get(controllerId);
            if (!ctrl) {
                return;
            }
            if (!profileId) {
                this.controllerProfiles.delete(controllerId);
                this.changeEmitter.fire();
                return;
            }
            const index = ctrl.profiles.findIndex(c => c.profileId === profileId);
            if (index === -1) {
                return;
            }
            ctrl.profiles.splice(index, 1);
            this.refreshContextKeys();
            this.changeEmitter.fire();
        }
        /** @inheritdoc */
        capabilitiesForTest(test) {
            const ctrl = this.controllerProfiles.get(test.controllerId);
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
            return this.controllerProfiles.values();
        }
        /** @inheritdoc */
        getControllerProfiles(profileId) {
            return this.controllerProfiles.get(profileId)?.profiles ?? [];
        }
        /** @inheritdoc */
        getGroupDefaultProfiles(group) {
            const preferred = this.preferredDefaults.get();
            if (!preferred) {
                return this.getBaseDefaults(group);
            }
            const profiles = preferred[group]
                ?.map(p => this.controllerProfiles.get(p.controllerId)?.profiles.find(c => c.profileId === p.profileId && c.group === group))
                .filter(types_1.isDefined);
            return profiles?.length ? profiles : this.getBaseDefaults(group);
        }
        /** @inheritdoc */
        setGroupDefaultProfiles(group, profiles) {
            const next = {
                ...this.preferredDefaults.get(),
                [group]: profiles.map(c => ({ profileId: c.profileId, controllerId: c.controllerId })),
            };
            // When switching a run/debug profile, if the controller has a same-named
            // profile in the other group, use that instead of anything else that was selected.
            if (group === 2 /* TestRunProfileBitset.Run */ || group === 4 /* TestRunProfileBitset.Debug */) {
                const otherGroup = group === 2 /* TestRunProfileBitset.Run */ ? 4 /* TestRunProfileBitset.Debug */ : 2 /* TestRunProfileBitset.Run */;
                const previousDefaults = next[otherGroup] || [];
                let newDefaults = previousDefaults.slice();
                for (const [ctrlId, { profiles: ctrlProfiles }] of this.controllerProfiles) {
                    const labels = new Set(profiles.filter(p => p.controllerId === ctrlId).map(p => p.label));
                    const nextByLabels = ctrlProfiles.filter(p => labels.has(p.label) && p.group === otherGroup);
                    if (nextByLabels.length) {
                        newDefaults = newDefaults.filter(p => p.controllerId !== ctrlId);
                        newDefaults.push(...nextByLabels.map(p => ({ profileId: p.profileId, controllerId: p.controllerId })));
                    }
                }
                next[otherGroup] = newDefaults;
            }
            this.preferredDefaults.store(next);
            this.changeEmitter.fire();
        }
        getBaseDefaults(group) {
            const defaults = [];
            for (const { profiles } of this.controllerProfiles.values()) {
                const profile = profiles.find(c => c.group === group);
                if (profile) {
                    defaults.push(profile);
                }
            }
            return defaults;
        }
        refreshContextKeys() {
            let allCapabilities = 0;
            for (const { profiles } of this.controllerProfiles.values()) {
                for (const profile of profiles) {
                    allCapabilities |= allCapabilities & profile.group ? 16 /* TestRunProfileBitset.HasNonDefaultProfile */ : profile.group;
                    allCapabilities |= profile.supportsContinuousRun ? 64 /* TestRunProfileBitset.SupportsContinuousRun */ : 0;
                }
            }
            for (const group of testTypes_1.testRunProfileBitsetList) {
                this.capabilitiesContexts[group].set((allCapabilities & group) !== 0);
            }
        }
    };
    exports.TestProfileService = TestProfileService;
    exports.TestProfileService = TestProfileService = __decorate([
        __param(0, contextkey_1.IContextKeyService),
        __param(1, storage_1.IStorageService)
    ], TestProfileService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdFByb2ZpbGVTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVzdGluZy9jb21tb24vdGVzdFByb2ZpbGVTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWNuRixRQUFBLG1CQUFtQixHQUFHLElBQUEsK0JBQWUsRUFBc0Isb0JBQW9CLENBQUMsQ0FBQztJQThEOUY7O09BRUc7SUFDSSxNQUFNLHFCQUFxQixHQUFHLENBQUMsT0FBd0IsRUFBRSxJQUFzQixFQUFFLEVBQUUsQ0FDekYsT0FBTyxDQUFDLFlBQVksS0FBSyxJQUFJLENBQUMsWUFBWSxJQUFJLENBQUMsZUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFEM0gsUUFBQSxxQkFBcUIseUJBQ3NHO0lBRXhJLE1BQU0sTUFBTSxHQUFHLENBQUMsQ0FBa0IsRUFBRSxDQUFrQixFQUFFLEVBQUU7UUFDekQsSUFBSSxDQUFDLENBQUMsU0FBUyxLQUFLLENBQUMsQ0FBQyxTQUFTLEVBQUU7WUFDaEMsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQzVCO1FBRUQsT0FBTyxDQUFDLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDdkMsQ0FBQyxDQUFDO0lBRUY7OztPQUdHO0lBQ0ksTUFBTSxxQkFBcUIsR0FBRyxDQUFDLFlBQW9CLEVBQW1DLEVBQUUsQ0FBQztRQUMvRixDQUFD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