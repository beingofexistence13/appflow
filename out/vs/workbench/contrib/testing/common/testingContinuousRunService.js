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
    exports.TestingContinuousRunService = exports.ITestingContinuousRunService = void 0;
    exports.ITestingContinuousRunService = (0, instantiation_1.createDecorator)('testingContinuousRunService');
    let TestingContinuousRunService = class TestingContinuousRunService extends lifecycle_1.Disposable {
        get lastRunProfileIds() {
            return this.lastRun.get(new Set());
        }
        constructor(testService, storageService, contextKeyService) {
            super();
            this.testService = testService;
            this.changeEmitter = new event_1.Emitter();
            this.running = new prefixTree_1.WellDefinedPrefixTree();
            this.onDidChange = this.changeEmitter.event;
            this.isGloballyOn = testingContextKeys_1.TestingContextKeys.isContinuousModeOn.bindTo(contextKeyService);
            this.lastRun = this._register(new storedValue_1.StoredValue({
                key: 'lastContinuousRunProfileIds',
                scope: 1 /* StorageScope.WORKSPACE */,
                target: 1 /* StorageTarget.MACHINE */,
                serialization: {
                    deserialize: v => new Set(JSON.parse(v)),
                    serialize: v => JSON.stringify([...v])
                },
            }, storageService));
            this._register((0, lifecycle_1.toDisposable)(() => {
                this.globallyRunning?.dispose();
                for (const cts of this.running.values()) {
                    cts.dispose();
                }
            }));
        }
        /** @inheritdoc */
        isSpecificallyEnabledFor(testId) {
            return this.running.size > 0 && this.running.hasKey(testId_1.TestId.fromString(testId).path);
        }
        /** @inheritdoc */
        isEnabledForAParentOf(testId) {
            if (this.globallyRunning) {
                return true;
            }
            return this.running.size > 0 && this.running.hasKeyOrParent(testId_1.TestId.fromString(testId).path);
        }
        /** @inheritdoc */
        isEnabledForAChildOf(testId) {
            return this.running.size > 0 && this.running.hasKeyOrChildren(testId_1.TestId.fromString(testId).path);
        }
        /** @inheritdoc */
        isEnabled() {
            return !!this.globallyRunning || this.running.size > 0;
        }
        /** @inheritdoc */
        start(profile, testId) {
            const cts = new cancellation_1.CancellationTokenSource();
            if (testId === undefined) {
                this.isGloballyOn.set(true);
            }
            if (!testId) {
                this.globallyRunning?.dispose(true);
                this.globallyRunning = cts;
            }
            else {
                this.running.mutate(testId_1.TestId.fromString(testId).path, c => {
                    c?.dispose(true);
                    return cts;
                });
            }
            this.lastRun.store(new Set(profile.map(p => p.profileId)));
            this.testService.startContinuousRun({
                continuous: true,
                targets: profile.map(p => ({
                    testIds: [testId ?? p.controllerId],
                    controllerId: p.controllerId,
                    profileGroup: p.group,
                    profileId: p.profileId
                })),
            }, cts.token);
            this.changeEmitter.fire(testId);
        }
        /** @inheritdoc */
        stop(testId) {
            if (!testId) {
                this.globallyRunning?.dispose(true);
                this.globallyRunning = undefined;
            }
            else {
                this.running.delete(testId_1.TestId.fromString(testId).path)?.dispose(true);
            }
            if (testId === undefined) {
                this.isGloballyOn.set(false);
            }
            this.changeEmitter.fire(testId);
        }
    };
    exports.TestingContinuousRunService = TestingContinuousRunService;
    exports.TestingContinuousRunService = TestingContinuousRunService = __decorate([
        __param(0, testService_1.ITestService),
        __param(1, storage_1.IStorageService),
        __param(2, contextkey_1.IContextKeyService)
    ], TestingContinuousRunService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdGluZ0NvbnRpbnVvdXNSdW5TZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVzdGluZy9jb21tb24vdGVzdGluZ0NvbnRpbnVvdXNSdW5TZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWdCbkYsUUFBQSw0QkFBNEIsR0FBRyxJQUFBLCtCQUFlLEVBQStCLDZCQUE2QixDQUFDLENBQUM7SUFtRGxILElBQU0sMkJBQTJCLEdBQWpDLE1BQU0sMkJBQTRCLFNBQVEsc0JBQVU7UUFXMUQsSUFBVyxpQkFBaUI7WUFDM0IsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDcEMsQ0FBQztRQUVELFlBQ2UsV0FBeUMsRUFDdEMsY0FBK0IsRUFDNUIsaUJBQXFDO1lBRXpELEtBQUssRUFBRSxDQUFDO1lBSnVCLGdCQUFXLEdBQVgsV0FBVyxDQUFhO1lBYnZDLGtCQUFhLEdBQUcsSUFBSSxlQUFPLEVBQXNCLENBQUM7WUFFbEQsWUFBTyxHQUFHLElBQUksa0NBQXFCLEVBQTJCLENBQUM7WUFJaEUsZ0JBQVcsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQztZQVl0RCxJQUFJLENBQUMsWUFBWSxHQUFHLHVDQUFrQixDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQ3BGLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLHlCQUFXLENBQWM7Z0JBQzFELEdBQUcsRUFBRSw2QkFBNkI7Z0JBQ2xDLEtBQUssZ0NBQXdCO2dCQUM3QixNQUFNLCtCQUF1QjtnQkFDN0IsYUFBYSxFQUFFO29CQUNkLFdBQVcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3hDLFNBQVMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2lCQUN0QzthQUNELEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQztZQUVwQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUEsd0JBQVksRUFBQyxHQUFHLEVBQUU7Z0JBQ2hDLElBQUksQ0FBQyxlQUFlLEVBQUUsT0FBTyxFQUFFLENBQUM7Z0JBQ2hDLEtBQUssTUFBTSxHQUFHLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsRUFBRTtvQkFDeEMsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDO2lCQUNkO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFRCxrQkFBa0I7UUFDWCx3QkFBd0IsQ0FBQyxNQUFjO1lBQzdDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLGVBQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckYsQ0FBQztRQUVELGtCQUFrQjtRQUNYLHFCQUFxQixDQUFDLE1BQWM7WUFDMUMsSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFO2dCQUN6QixPQUFPLElBQUksQ0FBQzthQUNaO1lBRUQsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsZUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM3RixDQUFDO1FBRUQsa0JBQWtCO1FBQ1gsb0JBQW9CLENBQUMsTUFBYztZQUN6QyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLGVBQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDL0YsQ0FBQztRQUVELGtCQUFrQjtRQUNYLFNBQVM7WUFDZixPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsZUFBZSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztRQUN4RCxDQUFDO1FBRUQsa0JBQWtCO1FBQ1gsS0FBSyxDQUFDLE9BQTBCLEVBQUUsTUFBZTtZQUN2RCxNQUFNLEdBQUcsR0FBRyxJQUFJLHNDQUF1QixFQUFFLENBQUM7WUFFMUMsSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFO2dCQUN6QixJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUM1QjtZQUVELElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ1osSUFBSSxDQUFDLGVBQWUsRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3BDLElBQUksQ0FBQyxlQUFlLEdBQUcsR0FBRyxDQUFDO2FBQzNCO2lCQUFNO2dCQUNOLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLGVBQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFO29CQUN2RCxDQUFDLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNqQixPQUFPLEdBQUcsQ0FBQztnQkFDWixDQUFDLENBQUMsQ0FBQzthQUNIO1lBRUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFM0QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQztnQkFDbkMsVUFBVSxFQUFFLElBQUk7Z0JBQ2hCLE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDMUIsT0FBTyxFQUFFLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxZQUFZLENBQUM7b0JBQ25DLFlBQVksRUFBRSxDQUFDLENBQUMsWUFBWTtvQkFDNUIsWUFBWSxFQUFFLENBQUMsQ0FBQyxLQUFLO29CQUNyQixTQUFTLEVBQUUsQ0FBQyxDQUFDLFNBQVM7aUJBQ3RCLENBQUMsQ0FBQzthQUNILEVBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRWQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDakMsQ0FBQztRQUVELGtCQUFrQjtRQUNYLElBQUksQ0FBQyxNQUFlO1lBQzFCLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ1osSUFBSSxDQUFDLGVBQWUsRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3BDLElBQUksQ0FBQyxlQUFlLEdBQUcsU0FBUyxDQUFDO2FBQ2pDO2lCQUFNO2dCQUNOLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLGVBQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ25FO1lBRUQsSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFO2dCQUN6QixJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUM3QjtZQUVELElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2pDLENBQUM7S0FDRCxDQUFBO0lBaEhZLGtFQUEyQjswQ0FBM0IsMkJBQTJCO1FBZ0JyQyxXQUFBLDBCQUFZLENBQUE7UUFDWixXQUFBLHlCQUFlLENBQUE7UUFDZixXQUFBLCtCQUFrQixDQUFBO09BbEJSLDJCQUEyQixDQWdIdkMifQ==