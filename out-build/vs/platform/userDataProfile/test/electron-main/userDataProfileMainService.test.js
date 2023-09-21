/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/platform/files/common/fileService", "vs/platform/log/common/log", "vs/base/common/network", "vs/base/common/uri", "vs/base/common/resources", "vs/platform/files/common/inMemoryFilesystemProvider", "vs/platform/environment/common/environmentService", "vs/platform/product/common/product", "vs/platform/userDataProfile/electron-main/userDataProfile", "vs/platform/state/node/stateService", "vs/platform/uriIdentity/common/uriIdentityService", "vs/base/test/common/utils"], function (require, exports, assert, fileService_1, log_1, network_1, uri_1, resources_1, inMemoryFilesystemProvider_1, environmentService_1, product_1, userDataProfile_1, stateService_1, uriIdentityService_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const ROOT = uri_1.URI.file('tests').with({ scheme: 'vscode-tests' });
    class TestEnvironmentService extends environmentService_1.$9l {
        constructor(d) {
            super(Object.create(null), Object.create(null), { _serviceBrand: undefined, ...product_1.default });
            this.d = d;
        }
        get userRoamingDataHome() { return this.d.with({ scheme: network_1.Schemas.vscodeUserData }); }
        get extensionsPath() { return (0, resources_1.$ig)(this.userRoamingDataHome, 'extensions.json').path; }
        get stateResource() { return (0, resources_1.$ig)(this.userRoamingDataHome, 'state.json'); }
        get cacheHome() { return (0, resources_1.$ig)(this.userRoamingDataHome, 'cache'); }
    }
    suite('UserDataProfileMainService', () => {
        const disposables = (0, utils_1.$bT)();
        let testObject;
        let environmentService, stateService;
        setup(async () => {
            const logService = new log_1.$fj();
            const fileService = disposables.add(new fileService_1.$Dp(logService));
            const fileSystemProvider = disposables.add(new inMemoryFilesystemProvider_1.$rAb());
            disposables.add(fileService.registerProvider(network_1.Schemas.vscodeUserData, fileSystemProvider));
            environmentService = new TestEnvironmentService((0, resources_1.$ig)(ROOT, 'User'));
            stateService = disposables.add(new stateService_1.$hN(1 /* SaveStrategy.DELAYED */, environmentService, logService, fileService));
            testObject = disposables.add(new userDataProfile_1.$w5b(stateService, disposables.add(new uriIdentityService_1.$pr(fileService)), environmentService, fileService, logService));
            await stateService.init();
        });
        test('default profile', () => {
            assert.strictEqual(testObject.defaultProfile.isDefault, true);
        });
        test('profiles always include default profile', () => {
            assert.deepStrictEqual(testObject.profiles.length, 1);
            assert.deepStrictEqual(testObject.profiles[0].isDefault, true);
        });
        test('default profile when there are profiles', async () => {
            await testObject.createNamedProfile('test');
            assert.strictEqual(testObject.defaultProfile.isDefault, true);
        });
        test('default profile when profiles are removed', async () => {
            const profile = await testObject.createNamedProfile('test');
            await testObject.removeProfile(profile);
            assert.strictEqual(testObject.defaultProfile.isDefault, true);
        });
        test('when no profile is set', async () => {
            await testObject.createNamedProfile('profile1');
            assert.equal(testObject.getProfileForWorkspace({ id: 'id' }), undefined);
            assert.equal(testObject.getProfileForWorkspace({ id: 'id', configPath: environmentService.userRoamingDataHome }), undefined);
            assert.equal(testObject.getProfileForWorkspace({ id: 'id', uri: environmentService.userRoamingDataHome }), undefined);
        });
        test('set profile to a workspace', async () => {
            const workspace = { id: 'id', configPath: environmentService.userRoamingDataHome };
            const profile = await testObject.createNamedProfile('profile1');
            testObject.setProfileForWorkspace(workspace, profile);
            assert.strictEqual(testObject.getProfileForWorkspace(workspace)?.id, profile.id);
        });
        test('set profile to a folder', async () => {
            const workspace = { id: 'id', uri: environmentService.userRoamingDataHome };
            const profile = await testObject.createNamedProfile('profile1');
            testObject.setProfileForWorkspace(workspace, profile);
            assert.strictEqual(testObject.getProfileForWorkspace(workspace)?.id, profile.id);
        });
        test('set profile to a window', async () => {
            const workspace = { id: 'id' };
            const profile = await testObject.createNamedProfile('profile1');
            testObject.setProfileForWorkspace(workspace, profile);
            assert.strictEqual(testObject.getProfileForWorkspace(workspace)?.id, profile.id);
        });
    });
});
//# sourceMappingURL=userDataProfileMainService.test.js.map