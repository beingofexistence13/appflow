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
define(["require", "exports", "assert", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/test/common/mock", "vs/base/test/common/utils", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/dialogs/test/common/testDialogService", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/platform/notification/test/common/testNotificationService", "vs/platform/product/common/product", "vs/platform/product/common/productService", "vs/platform/remote/browser/remoteAuthorityResolverService", "vs/platform/remote/common/remoteAuthorityResolver", "vs/platform/remote/common/remoteExtensionsScanner", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/uriIdentity/common/uriIdentityService", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/workspace/common/workspace", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/extensions/browser/extensionService", "vs/workbench/services/extensions/common/abstractExtensionService", "vs/workbench/services/extensions/common/extensionManifestPropertiesService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/extensions/common/extensionsProposedApi", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/services/remote/common/remoteAgentService", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/workbench/services/workspaces/common/workspaceTrust", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/test/common/workbenchTestServices"], function (require, exports, assert, event_1, lifecycle_1, mock_1, utils_1, configuration_1, testConfigurationService_1, testDialogService_1, environment_1, files_1, instantiation_1, instantiationServiceMock_1, log_1, notification_1, testNotificationService_1, product_1, productService_1, remoteAuthorityResolverService_1, remoteAuthorityResolver_1, remoteExtensionsScanner_1, telemetry_1, telemetryUtils_1, uriIdentity_1, uriIdentityService_1, userDataProfile_1, workspace_1, workspaceTrust_1, environmentService_1, extensionManagement_1, extensionService_1, abstractExtensionService_1, extensionManifestPropertiesService_1, extensions_1, extensionsProposedApi_1, lifecycle_2, remoteAgentService_1, userDataProfile_2, workspaceTrust_2, workbenchTestServices_1, workbenchTestServices_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('BrowserExtensionService', () => {
        (0, utils_1.$bT)();
        test('pickRunningLocation', () => {
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation([], false, false, 0 /* ExtensionRunningPreference.None */), null);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation([], false, true, 0 /* ExtensionRunningPreference.None */), null);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation([], true, false, 0 /* ExtensionRunningPreference.None */), null);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation([], true, true, 0 /* ExtensionRunningPreference.None */), null);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['ui'], false, false, 0 /* ExtensionRunningPreference.None */), null);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['ui'], false, true, 0 /* ExtensionRunningPreference.None */), 3 /* ExtensionHostKind.Remote */);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['ui'], true, false, 0 /* ExtensionRunningPreference.None */), null);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['ui'], true, true, 0 /* ExtensionRunningPreference.None */), 3 /* ExtensionHostKind.Remote */);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['workspace'], false, false, 0 /* ExtensionRunningPreference.None */), null);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['workspace'], false, true, 0 /* ExtensionRunningPreference.None */), 3 /* ExtensionHostKind.Remote */);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['workspace'], true, false, 0 /* ExtensionRunningPreference.None */), null);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['workspace'], true, true, 0 /* ExtensionRunningPreference.None */), 3 /* ExtensionHostKind.Remote */);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['web'], false, false, 0 /* ExtensionRunningPreference.None */), null);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['web'], false, true, 0 /* ExtensionRunningPreference.None */), 2 /* ExtensionHostKind.LocalWebWorker */);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['web'], true, false, 0 /* ExtensionRunningPreference.None */), 2 /* ExtensionHostKind.LocalWebWorker */);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['web'], true, true, 0 /* ExtensionRunningPreference.None */), 2 /* ExtensionHostKind.LocalWebWorker */);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['ui', 'workspace'], false, false, 0 /* ExtensionRunningPreference.None */), null);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['ui', 'workspace'], false, true, 0 /* ExtensionRunningPreference.None */), 3 /* ExtensionHostKind.Remote */);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['ui', 'workspace'], true, false, 0 /* ExtensionRunningPreference.None */), null);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['ui', 'workspace'], true, true, 0 /* ExtensionRunningPreference.None */), 3 /* ExtensionHostKind.Remote */);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['workspace', 'ui'], false, false, 0 /* ExtensionRunningPreference.None */), null);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['workspace', 'ui'], false, true, 0 /* ExtensionRunningPreference.None */), 3 /* ExtensionHostKind.Remote */);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['workspace', 'ui'], true, false, 0 /* ExtensionRunningPreference.None */), null);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['workspace', 'ui'], true, true, 0 /* ExtensionRunningPreference.None */), 3 /* ExtensionHostKind.Remote */);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['web', 'workspace'], false, false, 0 /* ExtensionRunningPreference.None */), null);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['web', 'workspace'], false, true, 0 /* ExtensionRunningPreference.None */), 2 /* ExtensionHostKind.LocalWebWorker */);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['web', 'workspace'], true, false, 0 /* ExtensionRunningPreference.None */), 2 /* ExtensionHostKind.LocalWebWorker */);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['web', 'workspace'], true, true, 0 /* ExtensionRunningPreference.None */), 2 /* ExtensionHostKind.LocalWebWorker */);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['workspace', 'web'], false, false, 0 /* ExtensionRunningPreference.None */), null);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['workspace', 'web'], false, true, 0 /* ExtensionRunningPreference.None */), 3 /* ExtensionHostKind.Remote */);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['workspace', 'web'], true, false, 0 /* ExtensionRunningPreference.None */), 2 /* ExtensionHostKind.LocalWebWorker */);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['workspace', 'web'], true, true, 0 /* ExtensionRunningPreference.None */), 3 /* ExtensionHostKind.Remote */);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['ui', 'web'], false, false, 0 /* ExtensionRunningPreference.None */), null);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['ui', 'web'], false, true, 0 /* ExtensionRunningPreference.None */), 2 /* ExtensionHostKind.LocalWebWorker */);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['ui', 'web'], true, false, 0 /* ExtensionRunningPreference.None */), 2 /* ExtensionHostKind.LocalWebWorker */);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['ui', 'web'], true, true, 0 /* ExtensionRunningPreference.None */), 2 /* ExtensionHostKind.LocalWebWorker */);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['web', 'ui'], false, false, 0 /* ExtensionRunningPreference.None */), null);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['web', 'ui'], false, true, 0 /* ExtensionRunningPreference.None */), 2 /* ExtensionHostKind.LocalWebWorker */);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['web', 'ui'], true, false, 0 /* ExtensionRunningPreference.None */), 2 /* ExtensionHostKind.LocalWebWorker */);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['web', 'ui'], true, true, 0 /* ExtensionRunningPreference.None */), 2 /* ExtensionHostKind.LocalWebWorker */);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['ui', 'web', 'workspace'], false, false, 0 /* ExtensionRunningPreference.None */), null);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['ui', 'web', 'workspace'], false, true, 0 /* ExtensionRunningPreference.None */), 2 /* ExtensionHostKind.LocalWebWorker */);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['ui', 'web', 'workspace'], true, false, 0 /* ExtensionRunningPreference.None */), 2 /* ExtensionHostKind.LocalWebWorker */);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['ui', 'web', 'workspace'], true, true, 0 /* ExtensionRunningPreference.None */), 2 /* ExtensionHostKind.LocalWebWorker */);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['ui', 'workspace', 'web'], false, false, 0 /* ExtensionRunningPreference.None */), null);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['ui', 'workspace', 'web'], false, true, 0 /* ExtensionRunningPreference.None */), 3 /* ExtensionHostKind.Remote */);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['ui', 'workspace', 'web'], true, false, 0 /* ExtensionRunningPreference.None */), 2 /* ExtensionHostKind.LocalWebWorker */);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['ui', 'workspace', 'web'], true, true, 0 /* ExtensionRunningPreference.None */), 3 /* ExtensionHostKind.Remote */);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['web', 'ui', 'workspace'], false, false, 0 /* ExtensionRunningPreference.None */), null);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['web', 'ui', 'workspace'], false, true, 0 /* ExtensionRunningPreference.None */), 2 /* ExtensionHostKind.LocalWebWorker */);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['web', 'ui', 'workspace'], true, false, 0 /* ExtensionRunningPreference.None */), 2 /* ExtensionHostKind.LocalWebWorker */);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['web', 'ui', 'workspace'], true, true, 0 /* ExtensionRunningPreference.None */), 2 /* ExtensionHostKind.LocalWebWorker */);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['web', 'workspace', 'ui'], false, false, 0 /* ExtensionRunningPreference.None */), null);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['web', 'workspace', 'ui'], false, true, 0 /* ExtensionRunningPreference.None */), 2 /* ExtensionHostKind.LocalWebWorker */);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['web', 'workspace', 'ui'], true, false, 0 /* ExtensionRunningPreference.None */), 2 /* ExtensionHostKind.LocalWebWorker */);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['web', 'workspace', 'ui'], true, true, 0 /* ExtensionRunningPreference.None */), 2 /* ExtensionHostKind.LocalWebWorker */);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['workspace', 'ui', 'web'], false, false, 0 /* ExtensionRunningPreference.None */), null);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['workspace', 'ui', 'web'], false, true, 0 /* ExtensionRunningPreference.None */), 3 /* ExtensionHostKind.Remote */);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['workspace', 'ui', 'web'], true, false, 0 /* ExtensionRunningPreference.None */), 2 /* ExtensionHostKind.LocalWebWorker */);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['workspace', 'ui', 'web'], true, true, 0 /* ExtensionRunningPreference.None */), 3 /* ExtensionHostKind.Remote */);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['workspace', 'web', 'ui'], false, false, 0 /* ExtensionRunningPreference.None */), null);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['workspace', 'web', 'ui'], false, true, 0 /* ExtensionRunningPreference.None */), 3 /* ExtensionHostKind.Remote */);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['workspace', 'web', 'ui'], true, false, 0 /* ExtensionRunningPreference.None */), 2 /* ExtensionHostKind.LocalWebWorker */);
            assert.deepStrictEqual(extensionService_1.$W3b.pickRunningLocation(['workspace', 'web', 'ui'], true, true, 0 /* ExtensionRunningPreference.None */), 3 /* ExtensionHostKind.Remote */);
        });
    });
    suite('ExtensionService', () => {
        let MyTestExtensionService = class MyTestExtensionService extends abstractExtensionService_1.$N3b {
            constructor(instantiationService, notificationService, environmentService, telemetryService, extensionEnablementService, fileService, productService, extensionManagementService, contextService, configurationService, extensionManifestPropertiesService, logService, remoteAgentService, remoteExtensionsScannerService, lifecycleService, remoteAuthorityResolverService) {
                const extensionsProposedApi = instantiationService.createInstance(extensionsProposedApi_1.$M3b);
                const extensionHostFactory = new class {
                    createExtensionHost(runningLocations, runningLocation, isInitialStart) {
                        return new class extends (0, mock_1.$rT)() {
                            constructor() {
                                super(...arguments);
                                this.runningLocation = runningLocation;
                            }
                        };
                    }
                };
                super(extensionsProposedApi, extensionHostFactory, null, instantiationService, notificationService, environmentService, telemetryService, extensionEnablementService, fileService, productService, extensionManagementService, contextService, configurationService, extensionManifestPropertiesService, logService, remoteAgentService, remoteExtensionsScannerService, lifecycleService, remoteAuthorityResolverService, new testDialogService_1.$H0b());
                this.Sb = 0;
                this.order = [];
            }
            Tb(extensionId, extensionKinds, isInstalledLocally, isInstalledRemotely, preference) {
                throw new Error('Method not implemented.');
            }
            wb(extensionHost, initialActivationEvents) {
                const order = this.order;
                const extensionHostId = ++this.Sb;
                order.push(`create ${extensionHostId}`);
                return new class extends (0, mock_1.$rT)() {
                    constructor() {
                        super(...arguments);
                        this.onDidExit = event_1.Event.None;
                        this.onDidChangeResponsiveState = event_1.Event.None;
                    }
                    dispose() {
                        order.push(`dispose ${extensionHostId}`);
                    }
                    representsRunningLocation(runningLocation) {
                        return extensionHost.runningLocation.equals(runningLocation);
                    }
                };
            }
            Ob() {
                throw new Error('Method not implemented.');
            }
            Pb(extension) {
                throw new Error('Method not implemented.');
            }
            Qb(code) {
                throw new Error('Method not implemented.');
            }
            Rb(remoteAuthority) {
                throw new Error('Method not implemented.');
            }
        };
        MyTestExtensionService = __decorate([
            __param(0, instantiation_1.$Ah),
            __param(1, notification_1.$Yu),
            __param(2, environmentService_1.$hJ),
            __param(3, telemetry_1.$9k),
            __param(4, extensionManagement_1.$icb),
            __param(5, files_1.$6j),
            __param(6, productService_1.$kj),
            __param(7, extensionManagement_1.$hcb),
            __param(8, workspace_1.$Kh),
            __param(9, configuration_1.$8h),
            __param(10, extensionManifestPropertiesService_1.$vcb),
            __param(11, log_1.$5i),
            __param(12, remoteAgentService_1.$jm),
            __param(13, remoteExtensionsScanner_1.$oN),
            __param(14, lifecycle_2.$7y),
            __param(15, remoteAuthorityResolver_1.$Jk)
        ], MyTestExtensionService);
        let disposables;
        let instantiationService;
        let extService;
        setup(() => {
            disposables = new lifecycle_1.$jc();
            const testProductService = { _serviceBrand: undefined, ...product_1.default };
            disposables.add(instantiationService = (0, instantiationServiceMock_1.$M0b)(disposables, [
                // custom
                [extensions_1.$MF, MyTestExtensionService],
                // default
                [lifecycle_2.$7y, workbenchTestServices_1.$Kec],
                [extensionManagement_1.$hcb, workbenchTestServices_1.$efc],
                [notification_1.$Yu, testNotificationService_1.$I0b],
                [remoteAgentService_1.$jm, workbenchTestServices_1.$bfc],
                [log_1.$5i, log_1.$fj],
                [extensionManagement_1.$jcb, workbenchTestServices_1.$gfc],
                [extensionManifestPropertiesService_1.$vcb, extensionManifestPropertiesService_1.$wcb],
                [configuration_1.$8h, testConfigurationService_1.$G0b],
                [workspace_1.$Kh, workbenchTestServices_2.$6dc],
                [productService_1.$kj, testProductService],
                [files_1.$6j, workbenchTestServices_1.$Fec],
                [extensionManagement_1.$icb, workbenchTestServices_1.$dfc],
                [telemetry_1.$9k, telemetryUtils_1.$bo],
                [environment_1.$Ih, workbenchTestServices_1.$qec],
                [workspaceTrust_1.$0z, workspaceTrust_2.$scb],
                [userDataProfile_1.$Ek, userDataProfile_1.$Hk],
                [userDataProfile_2.$CJ, workbenchTestServices_1.$ffc],
                [uriIdentity_1.$Ck, uriIdentityService_1.$pr],
                [remoteExtensionsScanner_1.$oN, workbenchTestServices_1.$cfc],
                [remoteAuthorityResolver_1.$Jk, new remoteAuthorityResolverService_1.$j2b(false, undefined, undefined, testProductService, new log_1.$fj())]
            ]));
            extService = instantiationService.get(extensions_1.$MF);
        });
        teardown(() => {
            disposables.dispose();
        });
        (0, utils_1.$bT)();
        test('issue #152204: Remote extension host not disposed after closing vscode client', async () => {
            await extService.startExtensionHosts();
            await extService.stopExtensionHosts('foo');
            assert.deepStrictEqual(extService.order, (['create 1', 'create 2', 'create 3', 'dispose 3', 'dispose 2', 'dispose 1']));
        });
        test('Extension host disposed when awaited', async () => {
            await extService.startExtensionHosts();
            await extService.stopExtensionHosts('foo');
            assert.deepStrictEqual(extService.order, (['create 1', 'create 2', 'create 3', 'dispose 3', 'dispose 2', 'dispose 1']));
        });
        test('Extension host not disposed when vetoed (sync)', async () => {
            await extService.startExtensionHosts();
            disposables.add(extService.onWillStop(e => e.veto(true, 'test 1')));
            disposables.add(extService.onWillStop(e => e.veto(false, 'test 2')));
            await extService.stopExtensionHosts('foo');
            assert.deepStrictEqual(extService.order, (['create 1', 'create 2', 'create 3']));
        });
        test('Extension host not disposed when vetoed (async)', async () => {
            await extService.startExtensionHosts();
            disposables.add(extService.onWillStop(e => e.veto(false, 'test 1')));
            disposables.add(extService.onWillStop(e => e.veto(Promise.resolve(true), 'test 2')));
            disposables.add(extService.onWillStop(e => e.veto(Promise.resolve(false), 'test 3')));
            await extService.stopExtensionHosts('foo');
            assert.deepStrictEqual(extService.order, (['create 1', 'create 2', 'create 3']));
        });
    });
});
//# sourceMappingURL=extensionService.test.js.map