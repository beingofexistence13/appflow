/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "sinon", "vs/base/common/buffer", "vs/base/common/resources", "vs/base/common/uri", "vs/base/test/common/utils", "vs/platform/environment/common/environment", "vs/platform/extensionManagement/common/extensionsProfileScannerService", "vs/platform/files/common/fileService", "vs/platform/files/common/files", "vs/platform/files/common/inMemoryFilesystemProvider", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/log/common/log", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/uriIdentity/common/uriIdentityService", "vs/platform/userDataProfile/common/userDataProfile"], function (require, exports, assert, sinon, buffer_1, resources_1, uri_1, utils_1, environment_1, extensionsProfileScannerService_1, fileService_1, files_1, inMemoryFilesystemProvider_1, instantiationServiceMock_1, log_1, telemetry_1, telemetryUtils_1, uriIdentity_1, uriIdentityService_1, userDataProfile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TestObject extends extensionsProfileScannerService_1.$lp {
    }
    suite('ExtensionsProfileScannerService', () => {
        const ROOT = uri_1.URI.file('/ROOT');
        const disposables = (0, utils_1.$bT)();
        const extensionsLocation = (0, resources_1.$ig)(ROOT, 'extensions');
        let instantiationService;
        setup(async () => {
            instantiationService = disposables.add(new instantiationServiceMock_1.$L0b());
            const logService = new log_1.$fj();
            const fileService = disposables.add(new fileService_1.$Dp(logService));
            const fileSystemProvider = disposables.add(new inMemoryFilesystemProvider_1.$rAb());
            disposables.add(fileService.registerProvider(ROOT.scheme, fileSystemProvider));
            instantiationService.stub(log_1.$5i, logService);
            instantiationService.stub(files_1.$6j, fileService);
            instantiationService.stub(telemetry_1.$9k, telemetryUtils_1.$bo);
            const uriIdentityService = instantiationService.stub(uriIdentity_1.$Ck, disposables.add(new uriIdentityService_1.$pr(fileService)));
            const environmentService = instantiationService.stub(environment_1.$Ih, { userRoamingDataHome: ROOT, cacheHome: (0, resources_1.$ig)(ROOT, 'cache'), });
            const userDataProfilesService = disposables.add(new userDataProfile_1.$Hk(environmentService, fileService, uriIdentityService, logService));
            instantiationService.stub(userDataProfile_1.$Ek, userDataProfilesService);
        });
        suiteTeardown(() => sinon.restore());
        test('write extensions located in the same extensions folder', async () => {
            const testObject = disposables.add(instantiationService.createInstance(TestObject, extensionsLocation));
            const extensionsManifest = (0, resources_1.$ig)(extensionsLocation, 'extensions.json');
            const extension = aExtension('pub.a', (0, resources_1.$ig)(extensionsLocation, 'pub.a-1.0.0'));
            await testObject.addExtensionsToProfile([[extension, undefined]], extensionsManifest);
            const actual = await testObject.scanProfileExtensions(extensionsManifest);
            assert.deepStrictEqual(actual.map(a => ({ ...a, location: a.location.toJSON() })), [{ identifier: extension.identifier, location: extension.location.toJSON(), version: extension.manifest.version, metadata: undefined }]);
        });
        test('write extensions located in the different folder', async () => {
            const testObject = disposables.add(instantiationService.createInstance(TestObject, extensionsLocation));
            const extensionsManifest = (0, resources_1.$ig)(extensionsLocation, 'extensions.json');
            const extension = aExtension('pub.a', (0, resources_1.$ig)(ROOT, 'pub.a-1.0.0'));
            await testObject.addExtensionsToProfile([[extension, undefined]], extensionsManifest);
            const actual = await testObject.scanProfileExtensions(extensionsManifest);
            assert.deepStrictEqual(actual.map(a => ({ ...a, location: a.location.toJSON() })), [{ identifier: extension.identifier, location: extension.location.toJSON(), version: extension.manifest.version, metadata: undefined }]);
        });
        test('write extensions located in the same extensions folder has relative location ', async () => {
            const testObject = disposables.add(instantiationService.createInstance(TestObject, extensionsLocation));
            const extensionsManifest = (0, resources_1.$ig)(extensionsLocation, 'extensions.json');
            const extension = aExtension('pub.a', (0, resources_1.$ig)(extensionsLocation, 'pub.a-1.0.0'));
            await testObject.addExtensionsToProfile([[extension, undefined]], extensionsManifest);
            const actual = JSON.parse((await instantiationService.get(files_1.$6j).readFile(extensionsManifest)).value.toString());
            assert.deepStrictEqual(actual, [{ identifier: extension.identifier, location: extension.location.toJSON(), relativeLocation: 'pub.a-1.0.0', version: extension.manifest.version }]);
        });
        test('write extensions located in different extensions folder does not has relative location ', async () => {
            const testObject = disposables.add(instantiationService.createInstance(TestObject, extensionsLocation));
            const extensionsManifest = (0, resources_1.$ig)(extensionsLocation, 'extensions.json');
            const extension = aExtension('pub.a', (0, resources_1.$ig)(ROOT, 'pub.a-1.0.0'));
            await testObject.addExtensionsToProfile([[extension, undefined]], extensionsManifest);
            const actual = JSON.parse((await instantiationService.get(files_1.$6j).readFile(extensionsManifest)).value.toString());
            assert.deepStrictEqual(actual, [{ identifier: extension.identifier, location: extension.location.toJSON(), version: extension.manifest.version }]);
        });
        test('extension in old format is read and migrated', async () => {
            const extensionsManifest = (0, resources_1.$ig)(extensionsLocation, 'extensions.json');
            const extension = aExtension('pub.a', (0, resources_1.$ig)(extensionsLocation, 'pub.a-1.0.0'));
            await instantiationService.get(files_1.$6j).writeFile(extensionsManifest, buffer_1.$Fd.fromString(JSON.stringify([{
                    identifier: extension.identifier,
                    location: extension.location.toJSON(),
                    version: extension.manifest.version,
                }])));
            const testObject = disposables.add(instantiationService.createInstance(TestObject, extensionsLocation));
            const actual = await testObject.scanProfileExtensions(extensionsManifest);
            assert.deepStrictEqual(actual.map(a => ({ ...a, location: a.location.toJSON() })), [{ identifier: extension.identifier, location: extension.location.toJSON(), version: extension.manifest.version, metadata: undefined }]);
            const manifestContent = JSON.parse((await instantiationService.get(files_1.$6j).readFile(extensionsManifest)).value.toString());
            assert.deepStrictEqual(manifestContent, [{ identifier: extension.identifier, location: extension.location.toJSON(), relativeLocation: 'pub.a-1.0.0', version: extension.manifest.version }]);
        });
        test('extension in old format is not migrated if not exists in same location', async () => {
            const extensionsManifest = (0, resources_1.$ig)(extensionsLocation, 'extensions.json');
            const extension = aExtension('pub.a', (0, resources_1.$ig)(ROOT, 'pub.a-1.0.0'));
            await instantiationService.get(files_1.$6j).writeFile(extensionsManifest, buffer_1.$Fd.fromString(JSON.stringify([{
                    identifier: extension.identifier,
                    location: extension.location.toJSON(),
                    version: extension.manifest.version,
                }])));
            const testObject = disposables.add(instantiationService.createInstance(TestObject, extensionsLocation));
            const actual = await testObject.scanProfileExtensions(extensionsManifest);
            assert.deepStrictEqual(actual.map(a => ({ ...a, location: a.location.toJSON() })), [{ identifier: extension.identifier, location: extension.location.toJSON(), version: extension.manifest.version, metadata: undefined }]);
            const manifestContent = JSON.parse((await instantiationService.get(files_1.$6j).readFile(extensionsManifest)).value.toString());
            assert.deepStrictEqual(manifestContent, [{ identifier: extension.identifier, location: extension.location.toJSON(), version: extension.manifest.version }]);
        });
        test('extension in old format is read and migrated during write', async () => {
            const extensionsManifest = (0, resources_1.$ig)(extensionsLocation, 'extensions.json');
            const extension = aExtension('pub.a', (0, resources_1.$ig)(extensionsLocation, 'pub.a-1.0.0'));
            await instantiationService.get(files_1.$6j).writeFile(extensionsManifest, buffer_1.$Fd.fromString(JSON.stringify([{
                    identifier: extension.identifier,
                    location: extension.location.toJSON(),
                    version: extension.manifest.version,
                }])));
            const testObject = disposables.add(instantiationService.createInstance(TestObject, extensionsLocation));
            const extension2 = aExtension('pub.b', (0, resources_1.$ig)(extensionsLocation, 'pub.b-1.0.0'));
            await testObject.addExtensionsToProfile([[extension2, undefined]], extensionsManifest);
            const actual = await testObject.scanProfileExtensions(extensionsManifest);
            assert.deepStrictEqual(actual.map(a => ({ ...a, location: a.location.toJSON() })), [
                { identifier: extension.identifier, location: extension.location.toJSON(), version: extension.manifest.version, metadata: undefined },
                { identifier: extension2.identifier, location: extension2.location.toJSON(), version: extension2.manifest.version, metadata: undefined }
            ]);
            const manifestContent = JSON.parse((await instantiationService.get(files_1.$6j).readFile(extensionsManifest)).value.toString());
            assert.deepStrictEqual(manifestContent, [
                { identifier: extension.identifier, location: extension.location.toJSON(), relativeLocation: 'pub.a-1.0.0', version: extension.manifest.version },
                { identifier: extension2.identifier, location: extension2.location.toJSON(), relativeLocation: 'pub.b-1.0.0', version: extension2.manifest.version }
            ]);
        });
        test('extensions in old format and new format is read and migrated', async () => {
            const extensionsManifest = (0, resources_1.$ig)(extensionsLocation, 'extensions.json');
            const extension = aExtension('pub.a', (0, resources_1.$ig)(extensionsLocation, 'pub.a-1.0.0'));
            const extension2 = aExtension('pub.b', (0, resources_1.$ig)(extensionsLocation, 'pub.b-1.0.0'));
            await instantiationService.get(files_1.$6j).writeFile(extensionsManifest, buffer_1.$Fd.fromString(JSON.stringify([{
                    identifier: extension.identifier,
                    location: extension.location.toJSON(),
                    version: extension.manifest.version,
                }, {
                    identifier: extension2.identifier,
                    location: extension2.location.toJSON(),
                    relativeLocation: 'pub.b-1.0.0',
                    version: extension2.manifest.version,
                }])));
            const testObject = disposables.add(instantiationService.createInstance(TestObject, extensionsLocation));
            const actual = await testObject.scanProfileExtensions(extensionsManifest);
            assert.deepStrictEqual(actual.map(a => ({ ...a, location: a.location.toJSON() })), [
                { identifier: extension.identifier, location: extension.location.toJSON(), version: extension.manifest.version, metadata: undefined },
                { identifier: extension2.identifier, location: extension2.location.toJSON(), version: extension2.manifest.version, metadata: undefined }
            ]);
            const manifestContent = JSON.parse((await instantiationService.get(files_1.$6j).readFile(extensionsManifest)).value.toString());
            assert.deepStrictEqual(manifestContent, [
                { identifier: extension.identifier, location: extension.location.toJSON(), relativeLocation: 'pub.a-1.0.0', version: extension.manifest.version },
                { identifier: extension2.identifier, location: extension2.location.toJSON(), relativeLocation: 'pub.b-1.0.0', version: extension2.manifest.version }
            ]);
        });
        test('extension in intermediate format is read and migrated', async () => {
            const extensionsManifest = (0, resources_1.$ig)(extensionsLocation, 'extensions.json');
            const extension = aExtension('pub.a', (0, resources_1.$ig)(extensionsLocation, 'pub.a-1.0.0'));
            await instantiationService.get(files_1.$6j).writeFile(extensionsManifest, buffer_1.$Fd.fromString(JSON.stringify([{
                    identifier: extension.identifier,
                    location: 'pub.a-1.0.0',
                    version: extension.manifest.version,
                }])));
            const testObject = disposables.add(instantiationService.createInstance(TestObject, extensionsLocation));
            const actual = await testObject.scanProfileExtensions(extensionsManifest);
            assert.deepStrictEqual(actual.map(a => ({ ...a, location: a.location.toJSON() })), [{ identifier: extension.identifier, location: extension.location.toJSON(), version: extension.manifest.version, metadata: undefined }]);
            const manifestContent = JSON.parse((await instantiationService.get(files_1.$6j).readFile(extensionsManifest)).value.toString());
            assert.deepStrictEqual(manifestContent, [{ identifier: extension.identifier, location: extension.location.toJSON(), relativeLocation: 'pub.a-1.0.0', version: extension.manifest.version }]);
        });
        test('extension in intermediate format is read and migrated during write', async () => {
            const extensionsManifest = (0, resources_1.$ig)(extensionsLocation, 'extensions.json');
            const extension = aExtension('pub.a', (0, resources_1.$ig)(extensionsLocation, 'pub.a-1.0.0'));
            await instantiationService.get(files_1.$6j).writeFile(extensionsManifest, buffer_1.$Fd.fromString(JSON.stringify([{
                    identifier: extension.identifier,
                    location: 'pub.a-1.0.0',
                    version: extension.manifest.version,
                }])));
            const testObject = disposables.add(instantiationService.createInstance(TestObject, extensionsLocation));
            const extension2 = aExtension('pub.b', (0, resources_1.$ig)(extensionsLocation, 'pub.b-1.0.0'));
            await testObject.addExtensionsToProfile([[extension2, undefined]], extensionsManifest);
            const actual = await testObject.scanProfileExtensions(extensionsManifest);
            assert.deepStrictEqual(actual.map(a => ({ ...a, location: a.location.toJSON() })), [
                { identifier: extension.identifier, location: extension.location.toJSON(), version: extension.manifest.version, metadata: undefined },
                { identifier: extension2.identifier, location: extension2.location.toJSON(), version: extension2.manifest.version, metadata: undefined }
            ]);
            const manifestContent = JSON.parse((await instantiationService.get(files_1.$6j).readFile(extensionsManifest)).value.toString());
            assert.deepStrictEqual(manifestContent, [
                { identifier: extension.identifier, location: extension.location.toJSON(), relativeLocation: 'pub.a-1.0.0', version: extension.manifest.version },
                { identifier: extension2.identifier, location: extension2.location.toJSON(), relativeLocation: 'pub.b-1.0.0', version: extension2.manifest.version }
            ]);
        });
        test('extensions in intermediate and new format is read and migrated', async () => {
            const extensionsManifest = (0, resources_1.$ig)(extensionsLocation, 'extensions.json');
            const extension = aExtension('pub.a', (0, resources_1.$ig)(extensionsLocation, 'pub.a-1.0.0'));
            const extension2 = aExtension('pub.b', (0, resources_1.$ig)(extensionsLocation, 'pub.b-1.0.0'));
            await instantiationService.get(files_1.$6j).writeFile(extensionsManifest, buffer_1.$Fd.fromString(JSON.stringify([{
                    identifier: extension.identifier,
                    location: 'pub.a-1.0.0',
                    version: extension.manifest.version,
                }, {
                    identifier: extension2.identifier,
                    location: extension2.location.toJSON(),
                    relativeLocation: 'pub.b-1.0.0',
                    version: extension2.manifest.version,
                }])));
            const testObject = disposables.add(instantiationService.createInstance(TestObject, extensionsLocation));
            const actual = await testObject.scanProfileExtensions(extensionsManifest);
            assert.deepStrictEqual(actual.map(a => ({ ...a, location: a.location.toJSON() })), [
                { identifier: extension.identifier, location: extension.location.toJSON(), version: extension.manifest.version, metadata: undefined },
                { identifier: extension2.identifier, location: extension2.location.toJSON(), version: extension2.manifest.version, metadata: undefined }
            ]);
            const manifestContent = JSON.parse((await instantiationService.get(files_1.$6j).readFile(extensionsManifest)).value.toString());
            assert.deepStrictEqual(manifestContent, [
                { identifier: extension.identifier, location: extension.location.toJSON(), relativeLocation: 'pub.a-1.0.0', version: extension.manifest.version },
                { identifier: extension2.identifier, location: extension2.location.toJSON(), relativeLocation: 'pub.b-1.0.0', version: extension2.manifest.version }
            ]);
        });
        test('extensions in mixed format is read and migrated', async () => {
            const extensionsManifest = (0, resources_1.$ig)(extensionsLocation, 'extensions.json');
            const extension1 = aExtension('pub.a', (0, resources_1.$ig)(extensionsLocation, 'pub.a-1.0.0'));
            const extension2 = aExtension('pub.b', (0, resources_1.$ig)(extensionsLocation, 'pub.b-1.0.0'));
            const extension3 = aExtension('pub.c', (0, resources_1.$ig)(extensionsLocation, 'pub.c-1.0.0'));
            const extension4 = aExtension('pub.d', (0, resources_1.$ig)(ROOT, 'pub.d-1.0.0'));
            await instantiationService.get(files_1.$6j).writeFile(extensionsManifest, buffer_1.$Fd.fromString(JSON.stringify([{
                    identifier: extension1.identifier,
                    location: 'pub.a-1.0.0',
                    version: extension1.manifest.version,
                }, {
                    identifier: extension2.identifier,
                    location: extension2.location.toJSON(),
                    version: extension2.manifest.version,
                }, {
                    identifier: extension3.identifier,
                    location: extension3.location.toJSON(),
                    relativeLocation: 'pub.c-1.0.0',
                    version: extension3.manifest.version,
                }, {
                    identifier: extension4.identifier,
                    location: extension4.location.toJSON(),
                    version: extension4.manifest.version,
                }])));
            const testObject = disposables.add(instantiationService.createInstance(TestObject, extensionsLocation));
            const actual = await testObject.scanProfileExtensions(extensionsManifest);
            assert.deepStrictEqual(actual.map(a => ({ ...a, location: a.location.toJSON() })), [
                { identifier: extension1.identifier, location: extension1.location.toJSON(), version: extension1.manifest.version, metadata: undefined },
                { identifier: extension2.identifier, location: extension2.location.toJSON(), version: extension2.manifest.version, metadata: undefined },
                { identifier: extension3.identifier, location: extension3.location.toJSON(), version: extension3.manifest.version, metadata: undefined },
                { identifier: extension4.identifier, location: extension4.location.toJSON(), version: extension4.manifest.version, metadata: undefined }
            ]);
            const manifestContent = JSON.parse((await instantiationService.get(files_1.$6j).readFile(extensionsManifest)).value.toString());
            assert.deepStrictEqual(manifestContent, [
                { identifier: extension1.identifier, location: extension1.location.toJSON(), relativeLocation: 'pub.a-1.0.0', version: extension1.manifest.version },
                { identifier: extension2.identifier, location: extension2.location.toJSON(), relativeLocation: 'pub.b-1.0.0', version: extension2.manifest.version },
                { identifier: extension3.identifier, location: extension3.location.toJSON(), relativeLocation: 'pub.c-1.0.0', version: extension3.manifest.version },
                { identifier: extension4.identifier, location: extension4.location.toJSON(), version: extension4.manifest.version }
            ]);
        });
        test('throws error if extension has invalid relativePath', async () => {
            const extensionsManifest = (0, resources_1.$ig)(extensionsLocation, 'extensions.json');
            const extension = aExtension('pub.a', (0, resources_1.$ig)(extensionsLocation, 'pub.a-1.0.0'));
            await instantiationService.get(files_1.$6j).writeFile(extensionsManifest, buffer_1.$Fd.fromString(JSON.stringify([{
                    identifier: extension.identifier,
                    location: extension.location.toJSON(),
                    version: extension.manifest.version,
                    relativePath: 2
                }])));
            const testObject = disposables.add(instantiationService.createInstance(TestObject, extensionsLocation));
            try {
                await testObject.scanProfileExtensions(extensionsManifest);
                assert.fail('Should throw error');
            }
            catch (error) { /*expected*/ }
        });
        test('throws error if extension has no location', async () => {
            const extensionsManifest = (0, resources_1.$ig)(extensionsLocation, 'extensions.json');
            const extension = aExtension('pub.a', (0, resources_1.$ig)(extensionsLocation, 'pub.a-1.0.0'));
            await instantiationService.get(files_1.$6j).writeFile(extensionsManifest, buffer_1.$Fd.fromString(JSON.stringify([{
                    identifier: extension.identifier,
                    version: extension.manifest.version,
                    relativePath: 'pub.a-1.0.0'
                }])));
            const testObject = disposables.add(instantiationService.createInstance(TestObject, extensionsLocation));
            try {
                await testObject.scanProfileExtensions(extensionsManifest);
                assert.fail('Should throw error');
            }
            catch (error) { /*expected*/ }
        });
        test('throws error if extension location is invalid', async () => {
            const extensionsManifest = (0, resources_1.$ig)(extensionsLocation, 'extensions.json');
            const extension = aExtension('pub.a', (0, resources_1.$ig)(extensionsLocation, 'pub.a-1.0.0'));
            await instantiationService.get(files_1.$6j).writeFile(extensionsManifest, buffer_1.$Fd.fromString(JSON.stringify([{
                    identifier: extension.identifier,
                    location: {},
                    version: extension.manifest.version,
                    relativePath: 'pub.a-1.0.0'
                }])));
            const testObject = disposables.add(instantiationService.createInstance(TestObject, extensionsLocation));
            try {
                await testObject.scanProfileExtensions(extensionsManifest);
                assert.fail('Should throw error');
            }
            catch (error) { /*expected*/ }
        });
        test('throws error if extension has no identifier', async () => {
            const extensionsManifest = (0, resources_1.$ig)(extensionsLocation, 'extensions.json');
            const extension = aExtension('pub.a', (0, resources_1.$ig)(extensionsLocation, 'pub.a-1.0.0'));
            await instantiationService.get(files_1.$6j).writeFile(extensionsManifest, buffer_1.$Fd.fromString(JSON.stringify([{
                    location: extension.location.toJSON(),
                    version: extension.manifest.version,
                }])));
            const testObject = disposables.add(instantiationService.createInstance(TestObject, extensionsLocation));
            try {
                await testObject.scanProfileExtensions(extensionsManifest);
                assert.fail('Should throw error');
            }
            catch (error) { /*expected*/ }
        });
        test('throws error if extension identifier is invalid', async () => {
            const extensionsManifest = (0, resources_1.$ig)(extensionsLocation, 'extensions.json');
            const extension = aExtension('pub.a', (0, resources_1.$ig)(extensionsLocation, 'pub.a-1.0.0'));
            await instantiationService.get(files_1.$6j).writeFile(extensionsManifest, buffer_1.$Fd.fromString(JSON.stringify([{
                    identifier: 'pub.a',
                    location: extension.location.toJSON(),
                    version: extension.manifest.version,
                }])));
            const testObject = disposables.add(instantiationService.createInstance(TestObject, extensionsLocation));
            try {
                await testObject.scanProfileExtensions(extensionsManifest);
                assert.fail('Should throw error');
            }
            catch (error) { /*expected*/ }
        });
        test('throws error if extension has no version', async () => {
            const extensionsManifest = (0, resources_1.$ig)(extensionsLocation, 'extensions.json');
            const extension = aExtension('pub.a', (0, resources_1.$ig)(extensionsLocation, 'pub.a-1.0.0'));
            await instantiationService.get(files_1.$6j).writeFile(extensionsManifest, buffer_1.$Fd.fromString(JSON.stringify([{
                    identifier: extension.identifier,
                    location: extension.location.toJSON(),
                }])));
            const testObject = disposables.add(instantiationService.createInstance(TestObject, extensionsLocation));
            try {
                await testObject.scanProfileExtensions(extensionsManifest);
                assert.fail('Should throw error');
            }
            catch (error) { /*expected*/ }
        });
        test('read extension when manifest is empty', async () => {
            const extensionsManifest = (0, resources_1.$ig)(extensionsLocation, 'extensions.json');
            await instantiationService.get(files_1.$6j).writeFile(extensionsManifest, buffer_1.$Fd.fromString(''));
            const testObject = disposables.add(instantiationService.createInstance(TestObject, extensionsLocation));
            const actual = await testObject.scanProfileExtensions(extensionsManifest);
            assert.deepStrictEqual(actual, []);
        });
        test('read extension when manifest has empty lines and spaces', async () => {
            const extensionsManifest = (0, resources_1.$ig)(extensionsLocation, 'extensions.json');
            await instantiationService.get(files_1.$6j).writeFile(extensionsManifest, buffer_1.$Fd.fromString(`


		`));
            const testObject = disposables.add(instantiationService.createInstance(TestObject, extensionsLocation));
            const actual = await testObject.scanProfileExtensions(extensionsManifest);
            assert.deepStrictEqual(actual, []);
        });
        test('read extension when the relative location is empty', async () => {
            const extensionsManifest = (0, resources_1.$ig)(extensionsLocation, 'extensions.json');
            const extension = aExtension('pub.a', (0, resources_1.$ig)(extensionsLocation, 'pub.a-1.0.0'));
            await instantiationService.get(files_1.$6j).writeFile(extensionsManifest, buffer_1.$Fd.fromString(JSON.stringify([{
                    identifier: extension.identifier,
                    location: extension.location.toJSON(),
                    relativeLocation: '',
                    version: extension.manifest.version,
                }])));
            const testObject = disposables.add(instantiationService.createInstance(TestObject, extensionsLocation));
            const actual = await testObject.scanProfileExtensions(extensionsManifest);
            assert.deepStrictEqual(actual.map(a => ({ ...a, location: a.location.toJSON() })), [{ identifier: extension.identifier, location: extension.location.toJSON(), version: extension.manifest.version, metadata: undefined }]);
            const manifestContent = JSON.parse((await instantiationService.get(files_1.$6j).readFile(extensionsManifest)).value.toString());
            assert.deepStrictEqual(manifestContent, [{ identifier: extension.identifier, location: extension.location.toJSON(), relativeLocation: 'pub.a-1.0.0', version: extension.manifest.version }]);
        });
        test('add extension trigger events', async () => {
            const testObject = disposables.add(instantiationService.createInstance(TestObject, extensionsLocation));
            const target1 = sinon.stub();
            const target2 = sinon.stub();
            disposables.add(testObject.onAddExtensions(target1));
            disposables.add(testObject.onDidAddExtensions(target2));
            const extensionsManifest = (0, resources_1.$ig)(extensionsLocation, 'extensions.json');
            const extension = aExtension('pub.a', (0, resources_1.$ig)(ROOT, 'foo', 'pub.a-1.0.0'));
            await testObject.addExtensionsToProfile([[extension, undefined]], extensionsManifest);
            const actual = await testObject.scanProfileExtensions(extensionsManifest);
            assert.deepStrictEqual(actual.map(a => ({ ...a, location: a.location.toJSON() })), [{ identifier: extension.identifier, location: extension.location.toJSON(), version: extension.manifest.version, metadata: undefined }]);
            assert.ok(target1.calledOnce);
            assert.deepStrictEqual((target1.args[0][0]).profileLocation.toString(), extensionsManifest.toString());
            assert.deepStrictEqual((target1.args[0][0]).extensions.length, 1);
            assert.deepStrictEqual((target1.args[0][0]).extensions[0].identifier, extension.identifier);
            assert.deepStrictEqual((target1.args[0][0]).extensions[0].version, extension.manifest.version);
            assert.deepStrictEqual((target1.args[0][0]).extensions[0].location.toString(), extension.location.toString());
            assert.ok(target2.calledOnce);
            assert.deepStrictEqual((target2.args[0][0]).profileLocation.toString(), extensionsManifest.toString());
            assert.deepStrictEqual((target2.args[0][0]).extensions.length, 1);
            assert.deepStrictEqual((target2.args[0][0]).extensions[0].identifier, extension.identifier);
            assert.deepStrictEqual((target2.args[0][0]).extensions[0].version, extension.manifest.version);
            assert.deepStrictEqual((target2.args[0][0]).extensions[0].location.toString(), extension.location.toString());
        });
        test('remove extension trigger events', async () => {
            const testObject = disposables.add(instantiationService.createInstance(TestObject, extensionsLocation));
            const target1 = sinon.stub();
            const target2 = sinon.stub();
            disposables.add(testObject.onRemoveExtensions(target1));
            disposables.add(testObject.onDidRemoveExtensions(target2));
            const extensionsManifest = (0, resources_1.$ig)(extensionsLocation, 'extensions.json');
            const extension = aExtension('pub.a', (0, resources_1.$ig)(ROOT, 'foo', 'pub.a-1.0.0'));
            await testObject.addExtensionsToProfile([[extension, undefined]], extensionsManifest);
            await testObject.removeExtensionFromProfile(extension, extensionsManifest);
            const actual = await testObject.scanProfileExtensions(extensionsManifest);
            assert.deepStrictEqual(actual.length, 0);
            assert.ok(target1.calledOnce);
            assert.deepStrictEqual((target1.args[0][0]).profileLocation.toString(), extensionsManifest.toString());
            assert.deepStrictEqual((target1.args[0][0]).extensions.length, 1);
            assert.deepStrictEqual((target1.args[0][0]).extensions[0].identifier, extension.identifier);
            assert.deepStrictEqual((target1.args[0][0]).extensions[0].version, extension.manifest.version);
            assert.deepStrictEqual((target1.args[0][0]).extensions[0].location.toString(), extension.location.toString());
            assert.ok(target2.calledOnce);
            assert.deepStrictEqual((target2.args[0][0]).profileLocation.toString(), extensionsManifest.toString());
            assert.deepStrictEqual((target2.args[0][0]).extensions.length, 1);
            assert.deepStrictEqual((target2.args[0][0]).extensions[0].identifier, extension.identifier);
            assert.deepStrictEqual((target2.args[0][0]).extensions[0].version, extension.manifest.version);
            assert.deepStrictEqual((target2.args[0][0]).extensions[0].location.toString(), extension.location.toString());
        });
        test('add extension with same id but different version', async () => {
            const testObject = disposables.add(instantiationService.createInstance(TestObject, extensionsLocation));
            const extensionsManifest = (0, resources_1.$ig)(extensionsLocation, 'extensions.json');
            const extension1 = aExtension('pub.a', (0, resources_1.$ig)(ROOT, 'pub.a-1.0.0'));
            await testObject.addExtensionsToProfile([[extension1, undefined]], extensionsManifest);
            const target1 = sinon.stub();
            const target2 = sinon.stub();
            const target3 = sinon.stub();
            const target4 = sinon.stub();
            disposables.add(testObject.onAddExtensions(target1));
            disposables.add(testObject.onRemoveExtensions(target2));
            disposables.add(testObject.onDidAddExtensions(target3));
            disposables.add(testObject.onDidRemoveExtensions(target4));
            const extension2 = aExtension('pub.a', (0, resources_1.$ig)(ROOT, 'pub.a-2.0.0'), undefined, { version: '2.0.0' });
            await testObject.addExtensionsToProfile([[extension2, undefined]], extensionsManifest);
            const actual = await testObject.scanProfileExtensions(extensionsManifest);
            assert.deepStrictEqual(actual.map(a => ({ ...a, location: a.location.toJSON() })), [{ identifier: extension2.identifier, location: extension2.location.toJSON(), version: extension2.manifest.version, metadata: undefined }]);
            assert.ok(target1.calledOnce);
            assert.deepStrictEqual((target1.args[0][0]).profileLocation.toString(), extensionsManifest.toString());
            assert.deepStrictEqual((target1.args[0][0]).extensions.length, 1);
            assert.deepStrictEqual((target1.args[0][0]).extensions[0].identifier, extension2.identifier);
            assert.deepStrictEqual((target1.args[0][0]).extensions[0].version, extension2.manifest.version);
            assert.deepStrictEqual((target1.args[0][0]).extensions[0].location.toString(), extension2.location.toString());
            assert.ok(target2.calledOnce);
            assert.deepStrictEqual((target2.args[0][0]).profileLocation.toString(), extensionsManifest.toString());
            assert.deepStrictEqual((target2.args[0][0]).extensions.length, 1);
            assert.deepStrictEqual((target2.args[0][0]).extensions[0].identifier, extension1.identifier);
            assert.deepStrictEqual((target2.args[0][0]).extensions[0].version, extension1.manifest.version);
            assert.deepStrictEqual((target2.args[0][0]).extensions[0].location.toString(), extension1.location.toString());
            assert.ok(target3.calledOnce);
            assert.deepStrictEqual((target1.args[0][0]).profileLocation.toString(), extensionsManifest.toString());
            assert.deepStrictEqual((target1.args[0][0]).extensions.length, 1);
            assert.deepStrictEqual((target1.args[0][0]).extensions[0].identifier, extension2.identifier);
            assert.deepStrictEqual((target1.args[0][0]).extensions[0].version, extension2.manifest.version);
            assert.deepStrictEqual((target1.args[0][0]).extensions[0].location.toString(), extension2.location.toString());
            assert.ok(target4.calledOnce);
            assert.deepStrictEqual((target2.args[0][0]).profileLocation.toString(), extensionsManifest.toString());
            assert.deepStrictEqual((target2.args[0][0]).extensions.length, 1);
            assert.deepStrictEqual((target2.args[0][0]).extensions[0].identifier, extension1.identifier);
            assert.deepStrictEqual((target2.args[0][0]).extensions[0].version, extension1.manifest.version);
            assert.deepStrictEqual((target2.args[0][0]).extensions[0].location.toString(), extension1.location.toString());
        });
        test('add same extension', async () => {
            const testObject = disposables.add(instantiationService.createInstance(TestObject, extensionsLocation));
            const extensionsManifest = (0, resources_1.$ig)(extensionsLocation, 'extensions.json');
            const extension = aExtension('pub.a', (0, resources_1.$ig)(ROOT, 'pub.a-1.0.0'));
            await testObject.addExtensionsToProfile([[extension, undefined]], extensionsManifest);
            const target1 = sinon.stub();
            const target2 = sinon.stub();
            const target3 = sinon.stub();
            const target4 = sinon.stub();
            disposables.add(testObject.onAddExtensions(target1));
            disposables.add(testObject.onRemoveExtensions(target2));
            disposables.add(testObject.onDidAddExtensions(target3));
            disposables.add(testObject.onDidRemoveExtensions(target4));
            await testObject.addExtensionsToProfile([[extension, undefined]], extensionsManifest);
            const actual = await testObject.scanProfileExtensions(extensionsManifest);
            assert.deepStrictEqual(actual.map(a => ({ ...a, location: a.location.toJSON() })), [{ identifier: extension.identifier, location: extension.location.toJSON(), version: extension.manifest.version, metadata: undefined }]);
            assert.ok(target1.notCalled);
            assert.ok(target2.notCalled);
            assert.ok(target3.notCalled);
            assert.ok(target4.notCalled);
        });
        test('add same extension with different metadata', async () => {
            const testObject = disposables.add(instantiationService.createInstance(TestObject, extensionsLocation));
            const extensionsManifest = (0, resources_1.$ig)(extensionsLocation, 'extensions.json');
            const extension = aExtension('pub.a', (0, resources_1.$ig)(ROOT, 'pub.a-1.0.0'));
            await testObject.addExtensionsToProfile([[extension, undefined]], extensionsManifest);
            const target1 = sinon.stub();
            const target2 = sinon.stub();
            const target3 = sinon.stub();
            const target4 = sinon.stub();
            disposables.add(testObject.onAddExtensions(target1));
            disposables.add(testObject.onRemoveExtensions(target2));
            disposables.add(testObject.onDidAddExtensions(target3));
            disposables.add(testObject.onDidRemoveExtensions(target4));
            await testObject.addExtensionsToProfile([[extension, { isApplicationScoped: true }]], extensionsManifest);
            const actual = await testObject.scanProfileExtensions(extensionsManifest);
            assert.deepStrictEqual(actual.map(a => ({ ...a, location: a.location.toJSON(), metadata: a.metadata })), [{ identifier: extension.identifier, location: extension.location.toJSON(), version: extension.manifest.version, metadata: { isApplicationScoped: true } }]);
            assert.ok(target1.notCalled);
            assert.ok(target2.notCalled);
            assert.ok(target3.notCalled);
            assert.ok(target4.notCalled);
        });
        test('add extension with different version and metadata', async () => {
            const testObject = disposables.add(instantiationService.createInstance(TestObject, extensionsLocation));
            const extensionsManifest = (0, resources_1.$ig)(extensionsLocation, 'extensions.json');
            const extension1 = aExtension('pub.a', (0, resources_1.$ig)(ROOT, 'pub.a-1.0.0'));
            await testObject.addExtensionsToProfile([[extension1, undefined]], extensionsManifest);
            const extension2 = aExtension('pub.a', (0, resources_1.$ig)(ROOT, 'pub.a-2.0.0'), undefined, { version: '2.0.0' });
            const target1 = sinon.stub();
            const target2 = sinon.stub();
            const target3 = sinon.stub();
            const target4 = sinon.stub();
            disposables.add(testObject.onAddExtensions(target1));
            disposables.add(testObject.onRemoveExtensions(target2));
            disposables.add(testObject.onDidAddExtensions(target3));
            disposables.add(testObject.onDidRemoveExtensions(target4));
            await testObject.addExtensionsToProfile([[extension2, { isApplicationScoped: true }]], extensionsManifest);
            const actual = await testObject.scanProfileExtensions(extensionsManifest);
            assert.deepStrictEqual(actual.map(a => ({ ...a, location: a.location.toJSON(), metadata: a.metadata })), [{ identifier: extension2.identifier, location: extension2.location.toJSON(), version: extension2.manifest.version, metadata: { isApplicationScoped: true } }]);
            assert.ok(target1.calledOnce);
            assert.deepStrictEqual((target1.args[0][0]).profileLocation.toString(), extensionsManifest.toString());
            assert.deepStrictEqual((target1.args[0][0]).extensions.length, 1);
            assert.deepStrictEqual((target1.args[0][0]).extensions[0].identifier, extension2.identifier);
            assert.deepStrictEqual((target1.args[0][0]).extensions[0].version, extension2.manifest.version);
            assert.deepStrictEqual((target1.args[0][0]).extensions[0].location.toString(), extension2.location.toString());
            assert.ok(target2.calledOnce);
            assert.deepStrictEqual((target2.args[0][0]).profileLocation.toString(), extensionsManifest.toString());
            assert.deepStrictEqual((target2.args[0][0]).extensions.length, 1);
            assert.deepStrictEqual((target2.args[0][0]).extensions[0].identifier, extension1.identifier);
            assert.deepStrictEqual((target2.args[0][0]).extensions[0].version, extension1.manifest.version);
            assert.deepStrictEqual((target2.args[0][0]).extensions[0].location.toString(), extension1.location.toString());
            assert.ok(target3.calledOnce);
            assert.deepStrictEqual((target1.args[0][0]).profileLocation.toString(), extensionsManifest.toString());
            assert.deepStrictEqual((target1.args[0][0]).extensions.length, 1);
            assert.deepStrictEqual((target1.args[0][0]).extensions[0].identifier, extension2.identifier);
            assert.deepStrictEqual((target1.args[0][0]).extensions[0].version, extension2.manifest.version);
            assert.deepStrictEqual((target1.args[0][0]).extensions[0].location.toString(), extension2.location.toString());
            assert.ok(target4.calledOnce);
            assert.deepStrictEqual((target2.args[0][0]).profileLocation.toString(), extensionsManifest.toString());
            assert.deepStrictEqual((target2.args[0][0]).extensions.length, 1);
            assert.deepStrictEqual((target2.args[0][0]).extensions[0].identifier, extension1.identifier);
            assert.deepStrictEqual((target2.args[0][0]).extensions[0].version, extension1.manifest.version);
            assert.deepStrictEqual((target2.args[0][0]).extensions[0].location.toString(), extension1.location.toString());
        });
        test('add extension with same id and version located in the different folder', async () => {
            const testObject = disposables.add(instantiationService.createInstance(TestObject, extensionsLocation));
            const extensionsManifest = (0, resources_1.$ig)(extensionsLocation, 'extensions.json');
            let extension = aExtension('pub.a', (0, resources_1.$ig)(ROOT, 'foo', 'pub.a-1.0.0'));
            await testObject.addExtensionsToProfile([[extension, undefined]], extensionsManifest);
            const target1 = sinon.stub();
            const target2 = sinon.stub();
            const target3 = sinon.stub();
            const target4 = sinon.stub();
            disposables.add(testObject.onAddExtensions(target1));
            disposables.add(testObject.onRemoveExtensions(target2));
            disposables.add(testObject.onDidAddExtensions(target3));
            disposables.add(testObject.onDidRemoveExtensions(target4));
            extension = aExtension('pub.a', (0, resources_1.$ig)(ROOT, 'pub.a-1.0.0'));
            await testObject.addExtensionsToProfile([[extension, undefined]], extensionsManifest);
            const actual = await testObject.scanProfileExtensions(extensionsManifest);
            assert.deepStrictEqual(actual.map(a => ({ ...a, location: a.location.toJSON() })), [{ identifier: extension.identifier, location: extension.location.toJSON(), version: extension.manifest.version, metadata: undefined }]);
            assert.ok(target1.notCalled);
            assert.ok(target2.notCalled);
            assert.ok(target3.notCalled);
            assert.ok(target4.notCalled);
        });
        function aExtension(id, location, e, manifest) {
            return {
                identifier: { id },
                location,
                type: 1 /* ExtensionType.User */,
                targetPlatform: "darwin-x64" /* TargetPlatform.DARWIN_X64 */,
                isBuiltin: false,
                manifest: {
                    name: 'name',
                    publisher: 'publisher',
                    version: '1.0.0',
                    engines: { vscode: '1.0.0' },
                    ...manifest,
                },
                isValid: true,
                validations: [],
                ...e
            };
        }
    });
});
//# sourceMappingURL=extensionsProfileScannerService.test.js.map