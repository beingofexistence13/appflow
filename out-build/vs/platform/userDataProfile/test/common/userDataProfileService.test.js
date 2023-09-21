/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/platform/files/common/fileService", "vs/platform/log/common/log", "vs/base/common/network", "vs/base/common/uri", "vs/base/common/resources", "vs/platform/files/common/inMemoryFilesystemProvider", "vs/platform/environment/common/environmentService", "vs/platform/product/common/product", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/uriIdentity/common/uriIdentityService", "vs/base/test/common/utils"], function (require, exports, assert, fileService_1, log_1, network_1, uri_1, resources_1, inMemoryFilesystemProvider_1, environmentService_1, product_1, userDataProfile_1, uriIdentityService_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const ROOT = uri_1.URI.file('tests').with({ scheme: 'vscode-tests' });
    class TestEnvironmentService extends environmentService_1.$9l {
        constructor(d) {
            super(Object.create(null), Object.create(null), { _serviceBrand: undefined, ...product_1.default });
            this.d = d;
        }
        get userRoamingDataHome() { return this.d.with({ scheme: network_1.Schemas.vscodeUserData }); }
        get cacheHome() { return this.userRoamingDataHome; }
    }
    suite('UserDataProfileService (Common)', () => {
        const disposables = (0, utils_1.$bT)();
        let testObject;
        let environmentService;
        setup(async () => {
            const logService = new log_1.$fj();
            const fileService = disposables.add(new fileService_1.$Dp(logService));
            const fileSystemProvider = disposables.add(new inMemoryFilesystemProvider_1.$rAb());
            disposables.add(fileService.registerProvider(ROOT.scheme, fileSystemProvider));
            disposables.add(fileService.registerProvider(network_1.Schemas.vscodeUserData, fileSystemProvider));
            environmentService = new TestEnvironmentService((0, resources_1.$ig)(ROOT, 'User'));
            testObject = disposables.add(new userDataProfile_1.$Ik(environmentService, fileService, disposables.add(new uriIdentityService_1.$pr(fileService)), logService));
        });
        test('default profile', () => {
            assert.strictEqual(testObject.defaultProfile.isDefault, true);
            assert.strictEqual(testObject.defaultProfile.useDefaultFlags, undefined);
            assert.strictEqual(testObject.defaultProfile.location.toString(), environmentService.userRoamingDataHome.toString());
            assert.strictEqual(testObject.defaultProfile.globalStorageHome.toString(), (0, resources_1.$ig)(environmentService.userRoamingDataHome, 'globalStorage').toString());
            assert.strictEqual(testObject.defaultProfile.keybindingsResource.toString(), (0, resources_1.$ig)(environmentService.userRoamingDataHome, 'keybindings.json').toString());
            assert.strictEqual(testObject.defaultProfile.settingsResource.toString(), (0, resources_1.$ig)(environmentService.userRoamingDataHome, 'settings.json').toString());
            assert.strictEqual(testObject.defaultProfile.snippetsHome.toString(), (0, resources_1.$ig)(environmentService.userRoamingDataHome, 'snippets').toString());
            assert.strictEqual(testObject.defaultProfile.tasksResource.toString(), (0, resources_1.$ig)(environmentService.userRoamingDataHome, 'tasks.json').toString());
            assert.strictEqual(testObject.defaultProfile.extensionsResource.toString(), (0, resources_1.$ig)(environmentService.userRoamingDataHome, 'extensions.json').toString());
        });
        test('profiles always include default profile', () => {
            assert.deepStrictEqual(testObject.profiles.length, 1);
            assert.deepStrictEqual(testObject.profiles[0].isDefault, true);
        });
        test('create profile with id', async () => {
            const profile = await testObject.createProfile('id', 'name');
            assert.deepStrictEqual(testObject.profiles.length, 2);
            assert.deepStrictEqual(profile.id, 'id');
            assert.deepStrictEqual(profile.name, 'name');
            assert.deepStrictEqual(!!profile.isTransient, false);
            assert.deepStrictEqual(testObject.profiles[1].id, profile.id);
            assert.deepStrictEqual(testObject.profiles[1].name, profile.name);
        });
        test('create profile with id, name and transient', async () => {
            const profile = await testObject.createProfile('id', 'name', { transient: true });
            assert.deepStrictEqual(testObject.profiles.length, 2);
            assert.deepStrictEqual(profile.id, 'id');
            assert.deepStrictEqual(profile.name, 'name');
            assert.deepStrictEqual(!!profile.isTransient, true);
            assert.deepStrictEqual(testObject.profiles[1].id, profile.id);
        });
        test('create transient profiles', async () => {
            const profile1 = await testObject.createTransientProfile();
            const profile2 = await testObject.createTransientProfile();
            const profile3 = await testObject.createTransientProfile();
            const profile4 = await testObject.createProfile('id', 'name', { transient: true });
            assert.deepStrictEqual(testObject.profiles.length, 5);
            assert.deepStrictEqual(profile1.name, 'Temp 1');
            assert.deepStrictEqual(profile1.isTransient, true);
            assert.deepStrictEqual(testObject.profiles[1].id, profile1.id);
            assert.deepStrictEqual(profile2.name, 'Temp 2');
            assert.deepStrictEqual(profile2.isTransient, true);
            assert.deepStrictEqual(testObject.profiles[2].id, profile2.id);
            assert.deepStrictEqual(profile3.name, 'Temp 3');
            assert.deepStrictEqual(profile3.isTransient, true);
            assert.deepStrictEqual(testObject.profiles[3].id, profile3.id);
            assert.deepStrictEqual(profile4.name, 'name');
            assert.deepStrictEqual(profile4.isTransient, true);
            assert.deepStrictEqual(testObject.profiles[4].id, profile4.id);
        });
        test('create transient profile when a normal profile with Temp is already created', async () => {
            await testObject.createNamedProfile('Temp 1');
            const profile1 = await testObject.createTransientProfile();
            assert.deepStrictEqual(profile1.name, 'Temp 2');
            assert.deepStrictEqual(profile1.isTransient, true);
        });
        test('profiles include default profile with extension resource defined when transiet prrofile is created', async () => {
            await testObject.createTransientProfile();
            assert.deepStrictEqual(testObject.profiles.length, 2);
            assert.deepStrictEqual(testObject.profiles[0].isDefault, true);
        });
        test('profiles include default profile with extension resource undefined when transiet prrofile is removed', async () => {
            const profile = await testObject.createTransientProfile();
            await testObject.removeProfile(profile);
            assert.deepStrictEqual(testObject.profiles.length, 1);
            assert.deepStrictEqual(testObject.profiles[0].isDefault, true);
        });
        test('update named profile', async () => {
            const profile = await testObject.createNamedProfile('name');
            await testObject.updateProfile(profile, { name: 'name changed' });
            assert.deepStrictEqual(testObject.profiles.length, 2);
            assert.deepStrictEqual(testObject.profiles[1].name, 'name changed');
            assert.deepStrictEqual(!!testObject.profiles[1].isTransient, false);
            assert.deepStrictEqual(testObject.profiles[1].id, profile.id);
        });
        test('persist transient profile', async () => {
            const profile = await testObject.createTransientProfile();
            await testObject.updateProfile(profile, { name: 'saved', transient: false });
            assert.deepStrictEqual(testObject.profiles.length, 2);
            assert.deepStrictEqual(testObject.profiles[1].name, 'saved');
            assert.deepStrictEqual(!!testObject.profiles[1].isTransient, false);
            assert.deepStrictEqual(testObject.profiles[1].id, profile.id);
        });
        test('persist transient profile (2)', async () => {
            const profile = await testObject.createProfile('id', 'name', { transient: true });
            await testObject.updateProfile(profile, { name: 'saved', transient: false });
            assert.deepStrictEqual(testObject.profiles.length, 2);
            assert.deepStrictEqual(testObject.profiles[1].name, 'saved');
            assert.deepStrictEqual(!!testObject.profiles[1].isTransient, false);
            assert.deepStrictEqual(testObject.profiles[1].id, profile.id);
        });
        test('save transient profile', async () => {
            const profile = await testObject.createTransientProfile();
            await testObject.updateProfile(profile, { name: 'saved' });
            assert.deepStrictEqual(testObject.profiles.length, 2);
            assert.deepStrictEqual(testObject.profiles[1].name, 'saved');
            assert.deepStrictEqual(!!testObject.profiles[1].isTransient, true);
            assert.deepStrictEqual(testObject.profiles[1].id, profile.id);
        });
        test('short name', async () => {
            const profile = await testObject.createNamedProfile('name', { shortName: 'short' });
            assert.strictEqual(profile.shortName, 'short');
            await testObject.updateProfile(profile, { shortName: 'short changed' });
            assert.deepStrictEqual(testObject.profiles.length, 2);
            assert.deepStrictEqual(testObject.profiles[1].name, 'name');
            assert.deepStrictEqual(testObject.profiles[1].shortName, 'short changed');
            assert.deepStrictEqual(!!testObject.profiles[1].isTransient, false);
            assert.deepStrictEqual(testObject.profiles[1].id, profile.id);
        });
        test('profile using default profile for settings', async () => {
            const profile = await testObject.createNamedProfile('name', { useDefaultFlags: { settings: true } });
            assert.strictEqual(profile.isDefault, false);
            assert.deepStrictEqual(profile.useDefaultFlags, { settings: true });
            assert.strictEqual(profile.settingsResource.toString(), testObject.defaultProfile.settingsResource.toString());
        });
        test('profile using default profile for keybindings', async () => {
            const profile = await testObject.createNamedProfile('name', { useDefaultFlags: { keybindings: true } });
            assert.strictEqual(profile.isDefault, false);
            assert.deepStrictEqual(profile.useDefaultFlags, { keybindings: true });
            assert.strictEqual(profile.keybindingsResource.toString(), testObject.defaultProfile.keybindingsResource.toString());
        });
        test('profile using default profile for snippets', async () => {
            const profile = await testObject.createNamedProfile('name', { useDefaultFlags: { snippets: true } });
            assert.strictEqual(profile.isDefault, false);
            assert.deepStrictEqual(profile.useDefaultFlags, { snippets: true });
            assert.strictEqual(profile.snippetsHome.toString(), testObject.defaultProfile.snippetsHome.toString());
        });
        test('profile using default profile for tasks', async () => {
            const profile = await testObject.createNamedProfile('name', { useDefaultFlags: { tasks: true } });
            assert.strictEqual(profile.isDefault, false);
            assert.deepStrictEqual(profile.useDefaultFlags, { tasks: true });
            assert.strictEqual(profile.tasksResource.toString(), testObject.defaultProfile.tasksResource.toString());
        });
        test('profile using default profile for global state', async () => {
            const profile = await testObject.createNamedProfile('name', { useDefaultFlags: { globalState: true } });
            assert.strictEqual(profile.isDefault, false);
            assert.deepStrictEqual(profile.useDefaultFlags, { globalState: true });
            assert.strictEqual(profile.globalStorageHome.toString(), testObject.defaultProfile.globalStorageHome.toString());
        });
        test('profile using default profile for extensions', async () => {
            const profile = await testObject.createNamedProfile('name', { useDefaultFlags: { extensions: true } });
            assert.strictEqual(profile.isDefault, false);
            assert.deepStrictEqual(profile.useDefaultFlags, { extensions: true });
            assert.strictEqual(profile.extensionsResource.toString(), testObject.defaultProfile.extensionsResource.toString());
        });
        test('update profile using default profile for keybindings', async () => {
            let profile = await testObject.createNamedProfile('name');
            profile = await testObject.updateProfile(profile, { useDefaultFlags: { keybindings: true } });
            assert.strictEqual(profile.isDefault, false);
            assert.deepStrictEqual(profile.useDefaultFlags, { keybindings: true });
            assert.strictEqual(profile.keybindingsResource.toString(), testObject.defaultProfile.keybindingsResource.toString());
        });
    });
});
//# sourceMappingURL=userDataProfileService.test.js.map