var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "assert", "vs/base/common/buffer", "vs/base/common/resources", "vs/base/common/uri", "vs/base/test/common/utils", "vs/platform/environment/common/environment", "vs/platform/extensionManagement/common/extensionsProfileScannerService", "vs/platform/extensionManagement/common/extensionsScannerService", "vs/platform/extensionManagement/node/extensionsProfileScannerService", "vs/platform/files/common/files", "vs/platform/files/common/fileService", "vs/platform/files/common/inMemoryFilesystemProvider", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/uriIdentity/common/uriIdentityService", "vs/platform/userDataProfile/common/userDataProfile"], function (require, exports, assert, buffer_1, resources_1, uri_1, utils_1, environment_1, extensionsProfileScannerService_1, extensionsScannerService_1, extensionsProfileScannerService_2, files_1, fileService_1, inMemoryFilesystemProvider_1, instantiation_1, instantiationServiceMock_1, log_1, productService_1, telemetryUtils_1, uriIdentity_1, uriIdentityService_1, userDataProfile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let translations = Object.create(null);
    const ROOT = uri_1.URI.file('/ROOT');
    let ExtensionsScannerService = class ExtensionsScannerService extends extensionsScannerService_1.$pp {
        constructor(userDataProfilesService, extensionsProfileScannerService, fileService, logService, nativeEnvironmentService, productService, uriIdentityService, instantiationService) {
            super(uri_1.URI.file(nativeEnvironmentService.builtinExtensionsPath), uri_1.URI.file(nativeEnvironmentService.extensionsPath), (0, resources_1.$ig)(nativeEnvironmentService.userHome, '.vscode-oss-dev', 'extensions', 'control.json'), userDataProfilesService.defaultProfile, userDataProfilesService, extensionsProfileScannerService, fileService, logService, nativeEnvironmentService, productService, uriIdentityService, instantiationService);
        }
        async f(language) {
            return translations;
        }
    };
    ExtensionsScannerService = __decorate([
        __param(0, userDataProfile_1.$Ek),
        __param(1, extensionsProfileScannerService_1.$kp),
        __param(2, files_1.$6j),
        __param(3, log_1.$5i),
        __param(4, environment_1.$Jh),
        __param(5, productService_1.$kj),
        __param(6, uriIdentity_1.$Ck),
        __param(7, instantiation_1.$Ah)
    ], ExtensionsScannerService);
    suite('NativeExtensionsScanerService Test', () => {
        const disposables = (0, utils_1.$bT)();
        let instantiationService;
        setup(async () => {
            translations = {};
            instantiationService = disposables.add(new instantiationServiceMock_1.$L0b());
            const logService = new log_1.$fj();
            const fileService = disposables.add(new fileService_1.$Dp(logService));
            const fileSystemProvider = disposables.add(new inMemoryFilesystemProvider_1.$rAb());
            disposables.add(fileService.registerProvider(ROOT.scheme, fileSystemProvider));
            instantiationService.stub(log_1.$5i, logService);
            instantiationService.stub(files_1.$6j, fileService);
            const systemExtensionsLocation = (0, resources_1.$ig)(ROOT, 'system');
            const userExtensionsLocation = (0, resources_1.$ig)(ROOT, 'extensions');
            const environmentService = instantiationService.stub(environment_1.$Jh, {
                userHome: ROOT,
                userRoamingDataHome: ROOT,
                builtinExtensionsPath: systemExtensionsLocation.fsPath,
                extensionsPath: userExtensionsLocation.fsPath,
                cacheHome: (0, resources_1.$ig)(ROOT, 'cache'),
            });
            instantiationService.stub(productService_1.$kj, { version: '1.66.0' });
            const uriIdentityService = disposables.add(new uriIdentityService_1.$pr(fileService));
            instantiationService.stub(uriIdentity_1.$Ck, uriIdentityService);
            const userDataProfilesService = disposables.add(new userDataProfile_1.$Hk(environmentService, fileService, uriIdentityService, logService));
            instantiationService.stub(userDataProfile_1.$Ek, userDataProfilesService);
            instantiationService.stub(extensionsProfileScannerService_1.$kp, disposables.add(new extensionsProfileScannerService_2.$lN(environmentService, fileService, userDataProfilesService, uriIdentityService, telemetryUtils_1.$bo, logService)));
            await fileService.createFolder(systemExtensionsLocation);
            await fileService.createFolder(userExtensionsLocation);
        });
        test('scan system extension', async () => {
            const manifest = anExtensionManifest({ 'name': 'name', 'publisher': 'pub' });
            const extensionLocation = await aSystemExtension(manifest);
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsScannerService));
            const actual = await testObject.scanSystemExtensions({});
            assert.deepStrictEqual(actual.length, 1);
            assert.deepStrictEqual(actual[0].identifier, { id: 'pub.name' });
            assert.deepStrictEqual(actual[0].location.toString(), extensionLocation.toString());
            assert.deepStrictEqual(actual[0].isBuiltin, true);
            assert.deepStrictEqual(actual[0].type, 0 /* ExtensionType.System */);
            assert.deepStrictEqual(actual[0].isValid, true);
            assert.deepStrictEqual(actual[0].validations, []);
            assert.deepStrictEqual(actual[0].metadata, undefined);
            assert.deepStrictEqual(actual[0].targetPlatform, "undefined" /* TargetPlatform.UNDEFINED */);
            assert.deepStrictEqual(actual[0].manifest, manifest);
        });
        test('scan user extension', async () => {
            const manifest = anExtensionManifest({ 'name': 'name', 'publisher': 'pub', __metadata: { id: 'uuid' } });
            const extensionLocation = await aUserExtension(manifest);
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsScannerService));
            const actual = await testObject.scanUserExtensions({});
            assert.deepStrictEqual(actual.length, 1);
            assert.deepStrictEqual(actual[0].identifier, { id: 'pub.name', uuid: 'uuid' });
            assert.deepStrictEqual(actual[0].location.toString(), extensionLocation.toString());
            assert.deepStrictEqual(actual[0].isBuiltin, false);
            assert.deepStrictEqual(actual[0].type, 1 /* ExtensionType.User */);
            assert.deepStrictEqual(actual[0].isValid, true);
            assert.deepStrictEqual(actual[0].validations, []);
            assert.deepStrictEqual(actual[0].metadata, { id: 'uuid' });
            assert.deepStrictEqual(actual[0].targetPlatform, "undefined" /* TargetPlatform.UNDEFINED */);
            delete manifest.__metadata;
            assert.deepStrictEqual(actual[0].manifest, manifest);
        });
        test('scan existing extension', async () => {
            const manifest = anExtensionManifest({ 'name': 'name', 'publisher': 'pub' });
            const extensionLocation = await aUserExtension(manifest);
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsScannerService));
            const actual = await testObject.scanExistingExtension(extensionLocation, 1 /* ExtensionType.User */, {});
            assert.notEqual(actual, null);
            assert.deepStrictEqual(actual.identifier, { id: 'pub.name' });
            assert.deepStrictEqual(actual.location.toString(), extensionLocation.toString());
            assert.deepStrictEqual(actual.isBuiltin, false);
            assert.deepStrictEqual(actual.type, 1 /* ExtensionType.User */);
            assert.deepStrictEqual(actual.isValid, true);
            assert.deepStrictEqual(actual.validations, []);
            assert.deepStrictEqual(actual.metadata, undefined);
            assert.deepStrictEqual(actual.targetPlatform, "undefined" /* TargetPlatform.UNDEFINED */);
            assert.deepStrictEqual(actual.manifest, manifest);
        });
        test('scan single extension', async () => {
            const manifest = anExtensionManifest({ 'name': 'name', 'publisher': 'pub' });
            const extensionLocation = await aUserExtension(manifest);
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsScannerService));
            const actual = await testObject.scanOneOrMultipleExtensions(extensionLocation, 1 /* ExtensionType.User */, {});
            assert.deepStrictEqual(actual.length, 1);
            assert.deepStrictEqual(actual[0].identifier, { id: 'pub.name' });
            assert.deepStrictEqual(actual[0].location.toString(), extensionLocation.toString());
            assert.deepStrictEqual(actual[0].isBuiltin, false);
            assert.deepStrictEqual(actual[0].type, 1 /* ExtensionType.User */);
            assert.deepStrictEqual(actual[0].isValid, true);
            assert.deepStrictEqual(actual[0].validations, []);
            assert.deepStrictEqual(actual[0].metadata, undefined);
            assert.deepStrictEqual(actual[0].targetPlatform, "undefined" /* TargetPlatform.UNDEFINED */);
            assert.deepStrictEqual(actual[0].manifest, manifest);
        });
        test('scan multiple extensions', async () => {
            const extensionLocation = await aUserExtension(anExtensionManifest({ 'name': 'name', 'publisher': 'pub' }));
            await aUserExtension(anExtensionManifest({ 'name': 'name2', 'publisher': 'pub' }));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsScannerService));
            const actual = await testObject.scanOneOrMultipleExtensions((0, resources_1.$hg)(extensionLocation), 1 /* ExtensionType.User */, {});
            assert.deepStrictEqual(actual.length, 2);
            assert.deepStrictEqual(actual[0].identifier, { id: 'pub.name' });
            assert.deepStrictEqual(actual[1].identifier, { id: 'pub.name2' });
        });
        test('scan user extension with different versions', async () => {
            await aUserExtension(anExtensionManifest({ 'name': 'name', 'publisher': 'pub', version: '1.0.1' }));
            await aUserExtension(anExtensionManifest({ 'name': 'name', 'publisher': 'pub', version: '1.0.2' }));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsScannerService));
            const actual = await testObject.scanUserExtensions({});
            assert.deepStrictEqual(actual.length, 1);
            assert.deepStrictEqual(actual[0].identifier, { id: 'pub.name' });
            assert.deepStrictEqual(actual[0].manifest.version, '1.0.2');
        });
        test('scan user extension include all versions', async () => {
            await aUserExtension(anExtensionManifest({ 'name': 'name', 'publisher': 'pub', version: '1.0.1' }));
            await aUserExtension(anExtensionManifest({ 'name': 'name', 'publisher': 'pub', version: '1.0.2' }));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsScannerService));
            const actual = await testObject.scanUserExtensions({ includeAllVersions: true });
            assert.deepStrictEqual(actual.length, 2);
            assert.deepStrictEqual(actual[0].identifier, { id: 'pub.name' });
            assert.deepStrictEqual(actual[0].manifest.version, '1.0.1');
            assert.deepStrictEqual(actual[1].identifier, { id: 'pub.name' });
            assert.deepStrictEqual(actual[1].manifest.version, '1.0.2');
        });
        test('scan user extension with different versions and higher version is not compatible', async () => {
            await aUserExtension(anExtensionManifest({ 'name': 'name', 'publisher': 'pub', version: '1.0.1' }));
            await aUserExtension(anExtensionManifest({ 'name': 'name', 'publisher': 'pub', version: '1.0.2', engines: { vscode: '^1.67.0' } }));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsScannerService));
            const actual = await testObject.scanUserExtensions({});
            assert.deepStrictEqual(actual.length, 1);
            assert.deepStrictEqual(actual[0].identifier, { id: 'pub.name' });
            assert.deepStrictEqual(actual[0].manifest.version, '1.0.1');
        });
        test('scan exclude invalid extensions', async () => {
            await aUserExtension(anExtensionManifest({ 'name': 'name', 'publisher': 'pub' }));
            await aUserExtension(anExtensionManifest({ 'name': 'name2', 'publisher': 'pub', engines: { vscode: '^1.67.0' } }));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsScannerService));
            const actual = await testObject.scanUserExtensions({});
            assert.deepStrictEqual(actual.length, 1);
            assert.deepStrictEqual(actual[0].identifier, { id: 'pub.name' });
        });
        test('scan exclude uninstalled extensions', async () => {
            await aUserExtension(anExtensionManifest({ 'name': 'name', 'publisher': 'pub' }));
            await aUserExtension(anExtensionManifest({ 'name': 'name2', 'publisher': 'pub' }));
            await instantiationService.get(files_1.$6j).writeFile((0, resources_1.$ig)(uri_1.URI.file(instantiationService.get(environment_1.$Jh).extensionsPath), '.obsolete'), buffer_1.$Fd.fromString(JSON.stringify({ 'pub.name2-1.0.0': true })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsScannerService));
            const actual = await testObject.scanUserExtensions({});
            assert.deepStrictEqual(actual.length, 1);
            assert.deepStrictEqual(actual[0].identifier, { id: 'pub.name' });
        });
        test('scan include uninstalled extensions', async () => {
            await aUserExtension(anExtensionManifest({ 'name': 'name', 'publisher': 'pub' }));
            await aUserExtension(anExtensionManifest({ 'name': 'name2', 'publisher': 'pub' }));
            await instantiationService.get(files_1.$6j).writeFile((0, resources_1.$ig)(uri_1.URI.file(instantiationService.get(environment_1.$Jh).extensionsPath), '.obsolete'), buffer_1.$Fd.fromString(JSON.stringify({ 'pub.name2-1.0.0': true })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsScannerService));
            const actual = await testObject.scanUserExtensions({ includeUninstalled: true });
            assert.deepStrictEqual(actual.length, 2);
            assert.deepStrictEqual(actual[0].identifier, { id: 'pub.name' });
            assert.deepStrictEqual(actual[1].identifier, { id: 'pub.name2' });
        });
        test('scan include invalid extensions', async () => {
            await aUserExtension(anExtensionManifest({ 'name': 'name', 'publisher': 'pub' }));
            await aUserExtension(anExtensionManifest({ 'name': 'name2', 'publisher': 'pub', engines: { vscode: '^1.67.0' } }));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsScannerService));
            const actual = await testObject.scanUserExtensions({ includeInvalid: true });
            assert.deepStrictEqual(actual.length, 2);
            assert.deepStrictEqual(actual[0].identifier, { id: 'pub.name' });
            assert.deepStrictEqual(actual[1].identifier, { id: 'pub.name2' });
        });
        test('scan system extensions include additional builtin extensions', async () => {
            instantiationService.stub(productService_1.$kj, {
                version: '1.66.0',
                builtInExtensions: [
                    { name: 'pub.name2', version: '', repo: '', metadata: undefined },
                    { name: 'pub.name', version: '', repo: '', metadata: undefined }
                ]
            });
            await anExtension(anExtensionManifest({ 'name': 'name2', 'publisher': 'pub' }), (0, resources_1.$ig)(ROOT, 'additional'));
            const extensionLocation = await anExtension(anExtensionManifest({ 'name': 'name', 'publisher': 'pub' }), (0, resources_1.$ig)(ROOT, 'additional'));
            await aSystemExtension(anExtensionManifest({ 'name': 'name', 'publisher': 'pub', version: '1.0.1' }));
            await instantiationService.get(files_1.$6j).writeFile((0, resources_1.$ig)(instantiationService.get(environment_1.$Jh).userHome, '.vscode-oss-dev', 'extensions', 'control.json'), buffer_1.$Fd.fromString(JSON.stringify({ 'pub.name2': 'disabled', 'pub.name': extensionLocation.fsPath })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsScannerService));
            const actual = await testObject.scanSystemExtensions({ checkControlFile: true });
            assert.deepStrictEqual(actual.length, 1);
            assert.deepStrictEqual(actual[0].identifier, { id: 'pub.name' });
            assert.deepStrictEqual(actual[0].manifest.version, '1.0.0');
        });
        test('scan extension with default nls replacements', async () => {
            const extensionLocation = await aUserExtension(anExtensionManifest({ 'name': 'name', 'publisher': 'pub', displayName: '%displayName%' }));
            await instantiationService.get(files_1.$6j).writeFile((0, resources_1.$ig)(extensionLocation, 'package.nls.json'), buffer_1.$Fd.fromString(JSON.stringify({ displayName: 'Hello World' })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsScannerService));
            const actual = await testObject.scanUserExtensions({});
            assert.deepStrictEqual(actual.length, 1);
            assert.deepStrictEqual(actual[0].identifier, { id: 'pub.name' });
            assert.deepStrictEqual(actual[0].manifest.displayName, 'Hello World');
        });
        test('scan extension with en nls replacements', async () => {
            const extensionLocation = await aUserExtension(anExtensionManifest({ 'name': 'name', 'publisher': 'pub', displayName: '%displayName%' }));
            await instantiationService.get(files_1.$6j).writeFile((0, resources_1.$ig)(extensionLocation, 'package.nls.json'), buffer_1.$Fd.fromString(JSON.stringify({ displayName: 'Hello World' })));
            const nlsLocation = (0, resources_1.$ig)(extensionLocation, 'package.en.json');
            await instantiationService.get(files_1.$6j).writeFile(nlsLocation, buffer_1.$Fd.fromString(JSON.stringify({ contents: { package: { displayName: 'Hello World EN' } } })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsScannerService));
            translations = { 'pub.name': nlsLocation.fsPath };
            const actual = await testObject.scanUserExtensions({ language: 'en' });
            assert.deepStrictEqual(actual.length, 1);
            assert.deepStrictEqual(actual[0].identifier, { id: 'pub.name' });
            assert.deepStrictEqual(actual[0].manifest.displayName, 'Hello World EN');
        });
        test('scan extension falls back to default nls replacements', async () => {
            const extensionLocation = await aUserExtension(anExtensionManifest({ 'name': 'name', 'publisher': 'pub', displayName: '%displayName%' }));
            await instantiationService.get(files_1.$6j).writeFile((0, resources_1.$ig)(extensionLocation, 'package.nls.json'), buffer_1.$Fd.fromString(JSON.stringify({ displayName: 'Hello World' })));
            const nlsLocation = (0, resources_1.$ig)(extensionLocation, 'package.en.json');
            await instantiationService.get(files_1.$6j).writeFile(nlsLocation, buffer_1.$Fd.fromString(JSON.stringify({ contents: { package: { displayName: 'Hello World EN' } } })));
            const testObject = disposables.add(instantiationService.createInstance(ExtensionsScannerService));
            translations = { 'pub.name2': nlsLocation.fsPath };
            const actual = await testObject.scanUserExtensions({ language: 'en' });
            assert.deepStrictEqual(actual.length, 1);
            assert.deepStrictEqual(actual[0].identifier, { id: 'pub.name' });
            assert.deepStrictEqual(actual[0].manifest.displayName, 'Hello World');
        });
        async function aUserExtension(manifest) {
            const environmentService = instantiationService.get(environment_1.$Jh);
            return anExtension(manifest, uri_1.URI.file(environmentService.extensionsPath));
        }
        async function aSystemExtension(manifest) {
            const environmentService = instantiationService.get(environment_1.$Jh);
            return anExtension(manifest, uri_1.URI.file(environmentService.builtinExtensionsPath));
        }
        async function anExtension(manifest, root) {
            const fileService = instantiationService.get(files_1.$6j);
            const extensionLocation = (0, resources_1.$ig)(root, `${manifest.publisher}.${manifest.name}-${manifest.version}-${manifest.__metadata?.targetPlatform ?? "undefined" /* TargetPlatform.UNDEFINED */}`);
            await fileService.writeFile((0, resources_1.$ig)(extensionLocation, 'package.json'), buffer_1.$Fd.fromString(JSON.stringify(manifest)));
            return extensionLocation;
        }
        function anExtensionManifest(manifest) {
            return { engines: { vscode: '^1.66.0' }, version: '1.0.0', main: 'main.js', activationEvents: ['*'], ...manifest };
        }
    });
    suite('ExtensionScannerInput', () => {
        test('compare inputs - location', () => {
            const anInput = (location, mtime) => new extensionsScannerService_1.$qp(location, mtime, undefined, undefined, false, undefined, 1 /* ExtensionType.User */, true, true, '1.1.1', undefined, undefined, true, undefined, {});
            assert.strictEqual(extensionsScannerService_1.$qp.equals(anInput(ROOT, undefined), anInput(ROOT, undefined)), true);
            assert.strictEqual(extensionsScannerService_1.$qp.equals(anInput(ROOT, 100), anInput(ROOT, 100)), true);
            assert.strictEqual(extensionsScannerService_1.$qp.equals(anInput((0, resources_1.$ig)(ROOT, 'foo'), undefined), anInput(ROOT, undefined)), false);
            assert.strictEqual(extensionsScannerService_1.$qp.equals(anInput(ROOT, 100), anInput(ROOT, 200)), false);
            assert.strictEqual(extensionsScannerService_1.$qp.equals(anInput(ROOT, undefined), anInput(ROOT, 200)), false);
        });
        test('compare inputs - application location', () => {
            const anInput = (location, mtime) => new extensionsScannerService_1.$qp(ROOT, undefined, location, mtime, false, undefined, 1 /* ExtensionType.User */, true, true, '1.1.1', undefined, undefined, true, undefined, {});
            assert.strictEqual(extensionsScannerService_1.$qp.equals(anInput(ROOT, undefined), anInput(ROOT, undefined)), true);
            assert.strictEqual(extensionsScannerService_1.$qp.equals(anInput(ROOT, 100), anInput(ROOT, 100)), true);
            assert.strictEqual(extensionsScannerService_1.$qp.equals(anInput((0, resources_1.$ig)(ROOT, 'foo'), undefined), anInput(ROOT, undefined)), false);
            assert.strictEqual(extensionsScannerService_1.$qp.equals(anInput(ROOT, 100), anInput(ROOT, 200)), false);
            assert.strictEqual(extensionsScannerService_1.$qp.equals(anInput(ROOT, undefined), anInput(ROOT, 200)), false);
        });
        test('compare inputs - profile', () => {
            const anInput = (profile, profileScanOptions) => new extensionsScannerService_1.$qp(ROOT, undefined, undefined, undefined, profile, profileScanOptions, 1 /* ExtensionType.User */, true, true, '1.1.1', undefined, undefined, true, undefined, {});
            assert.strictEqual(extensionsScannerService_1.$qp.equals(anInput(true, { bailOutWhenFileNotFound: true }), anInput(true, { bailOutWhenFileNotFound: true })), true);
            assert.strictEqual(extensionsScannerService_1.$qp.equals(anInput(false, { bailOutWhenFileNotFound: true }), anInput(false, { bailOutWhenFileNotFound: true })), true);
            assert.strictEqual(extensionsScannerService_1.$qp.equals(anInput(true, { bailOutWhenFileNotFound: false }), anInput(true, { bailOutWhenFileNotFound: false })), true);
            assert.strictEqual(extensionsScannerService_1.$qp.equals(anInput(true, {}), anInput(true, {})), true);
            assert.strictEqual(extensionsScannerService_1.$qp.equals(anInput(true, { bailOutWhenFileNotFound: true }), anInput(true, { bailOutWhenFileNotFound: false })), false);
            assert.strictEqual(extensionsScannerService_1.$qp.equals(anInput(true, {}), anInput(true, { bailOutWhenFileNotFound: true })), false);
            assert.strictEqual(extensionsScannerService_1.$qp.equals(anInput(true, undefined), anInput(true, {})), false);
            assert.strictEqual(extensionsScannerService_1.$qp.equals(anInput(false, { bailOutWhenFileNotFound: true }), anInput(true, { bailOutWhenFileNotFound: true })), false);
        });
        test('compare inputs - extension type', () => {
            const anInput = (type) => new extensionsScannerService_1.$qp(ROOT, undefined, undefined, undefined, false, undefined, type, true, true, '1.1.1', undefined, undefined, true, undefined, {});
            assert.strictEqual(extensionsScannerService_1.$qp.equals(anInput(0 /* ExtensionType.System */), anInput(0 /* ExtensionType.System */)), true);
            assert.strictEqual(extensionsScannerService_1.$qp.equals(anInput(1 /* ExtensionType.User */), anInput(1 /* ExtensionType.User */)), true);
            assert.strictEqual(extensionsScannerService_1.$qp.equals(anInput(1 /* ExtensionType.User */), anInput(0 /* ExtensionType.System */)), false);
        });
    });
});
//# sourceMappingURL=extensionsScannerService.test.js.map