/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/base/common/stream", "vs/base/common/uri", "vs/base/test/common/utils", "vs/platform/files/common/files", "vs/platform/files/common/fileService", "vs/platform/files/test/common/nullFileSystemProvider", "vs/platform/log/common/log"], function (require, exports, assert, async_1, cancellation_1, lifecycle_1, stream_1, uri_1, utils_1, files_1, fileService_1, nullFileSystemProvider_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('File Service', () => {
        const disposables = new lifecycle_1.$jc();
        teardown(() => {
            disposables.clear();
        });
        test('provider registration', async () => {
            const service = disposables.add(new fileService_1.$Dp(new log_1.$fj()));
            const resource = uri_1.URI.parse('test://foo/bar');
            const provider = new nullFileSystemProvider_1.$y$b();
            assert.strictEqual(await service.canHandleResource(resource), false);
            assert.strictEqual(service.hasProvider(resource), false);
            assert.strictEqual(service.getProvider(resource.scheme), undefined);
            const registrations = [];
            disposables.add(service.onDidChangeFileSystemProviderRegistrations(e => {
                registrations.push(e);
            }));
            const capabilityChanges = [];
            disposables.add(service.onDidChangeFileSystemProviderCapabilities(e => {
                capabilityChanges.push(e);
            }));
            let registrationDisposable;
            let callCount = 0;
            disposables.add(service.onWillActivateFileSystemProvider(e => {
                callCount++;
                if (e.scheme === 'test' && callCount === 1) {
                    e.join(new Promise(resolve => {
                        registrationDisposable = service.registerProvider('test', provider);
                        resolve();
                    }));
                }
            }));
            assert.strictEqual(await service.canHandleResource(resource), true);
            assert.strictEqual(service.hasProvider(resource), true);
            assert.strictEqual(service.getProvider(resource.scheme), provider);
            assert.strictEqual(registrations.length, 1);
            assert.strictEqual(registrations[0].scheme, 'test');
            assert.strictEqual(registrations[0].added, true);
            assert.ok(registrationDisposable);
            assert.strictEqual(capabilityChanges.length, 0);
            provider.setCapabilities(8 /* FileSystemProviderCapabilities.FileFolderCopy */);
            assert.strictEqual(capabilityChanges.length, 1);
            provider.setCapabilities(2048 /* FileSystemProviderCapabilities.Readonly */);
            assert.strictEqual(capabilityChanges.length, 2);
            await service.activateProvider('test');
            assert.strictEqual(callCount, 2); // activation is called again
            assert.strictEqual(service.hasCapability(resource, 2048 /* FileSystemProviderCapabilities.Readonly */), true);
            assert.strictEqual(service.hasCapability(resource, 4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */), false);
            registrationDisposable.dispose();
            assert.strictEqual(await service.canHandleResource(resource), false);
            assert.strictEqual(service.hasProvider(resource), false);
            assert.strictEqual(registrations.length, 2);
            assert.strictEqual(registrations[1].scheme, 'test');
            assert.strictEqual(registrations[1].added, false);
        });
        test('watch', async () => {
            const service = disposables.add(new fileService_1.$Dp(new log_1.$fj()));
            let disposeCounter = 0;
            disposables.add(service.registerProvider('test', new nullFileSystemProvider_1.$y$b(() => {
                return (0, lifecycle_1.$ic)(() => {
                    disposeCounter++;
                });
            })));
            await service.activateProvider('test');
            const resource1 = uri_1.URI.parse('test://foo/bar1');
            const watcher1Disposable = service.watch(resource1);
            await (0, async_1.$Hg)(0); // service.watch() is async
            assert.strictEqual(disposeCounter, 0);
            watcher1Disposable.dispose();
            assert.strictEqual(disposeCounter, 1);
            disposeCounter = 0;
            const resource2 = uri_1.URI.parse('test://foo/bar2');
            const watcher2Disposable1 = service.watch(resource2);
            const watcher2Disposable2 = service.watch(resource2);
            const watcher2Disposable3 = service.watch(resource2);
            await (0, async_1.$Hg)(0); // service.watch() is async
            assert.strictEqual(disposeCounter, 0);
            watcher2Disposable1.dispose();
            assert.strictEqual(disposeCounter, 0);
            watcher2Disposable2.dispose();
            assert.strictEqual(disposeCounter, 0);
            watcher2Disposable3.dispose();
            assert.strictEqual(disposeCounter, 1);
            disposeCounter = 0;
            const resource3 = uri_1.URI.parse('test://foo/bar3');
            const watcher3Disposable1 = service.watch(resource3);
            const watcher3Disposable2 = service.watch(resource3, { recursive: true, excludes: [] });
            const watcher3Disposable3 = service.watch(resource3, { recursive: false, excludes: [], includes: [] });
            await (0, async_1.$Hg)(0); // service.watch() is async
            assert.strictEqual(disposeCounter, 0);
            watcher3Disposable1.dispose();
            assert.strictEqual(disposeCounter, 1);
            watcher3Disposable2.dispose();
            assert.strictEqual(disposeCounter, 2);
            watcher3Disposable3.dispose();
            assert.strictEqual(disposeCounter, 3);
            service.dispose();
        });
        test('error from readFile bubbles through (https://github.com/microsoft/vscode/issues/118060) - async', async () => {
            testReadErrorBubbles(true);
        });
        test('error from readFile bubbles through (https://github.com/microsoft/vscode/issues/118060)', async () => {
            testReadErrorBubbles(false);
        });
        async function testReadErrorBubbles(async) {
            const service = disposables.add(new fileService_1.$Dp(new log_1.$fj()));
            const provider = new class extends nullFileSystemProvider_1.$y$b {
                async stat(resource) {
                    return {
                        mtime: Date.now(),
                        ctime: Date.now(),
                        size: 100,
                        type: files_1.FileType.File
                    };
                }
                readFile(resource) {
                    if (async) {
                        return (0, async_1.$Hg)(5, cancellation_1.CancellationToken.None).then(() => { throw new Error('failed'); });
                    }
                    throw new Error('failed');
                }
                open(resource, opts) {
                    if (async) {
                        return (0, async_1.$Hg)(5, cancellation_1.CancellationToken.None).then(() => { throw new Error('failed'); });
                    }
                    throw new Error('failed');
                }
                readFileStream(resource, opts, token) {
                    if (async) {
                        const stream = (0, stream_1.$td)(chunk => chunk[0]);
                        (0, async_1.$Hg)(5, cancellation_1.CancellationToken.None).then(() => stream.error(new Error('failed')));
                        return stream;
                    }
                    throw new Error('failed');
                }
            };
            disposables.add(service.registerProvider('test', provider));
            for (const capabilities of [2 /* FileSystemProviderCapabilities.FileReadWrite */, 16 /* FileSystemProviderCapabilities.FileReadStream */, 4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */]) {
                provider.setCapabilities(capabilities);
                let e1;
                try {
                    await service.readFile(uri_1.URI.parse('test://foo/bar'));
                }
                catch (error) {
                    e1 = error;
                }
                assert.ok(e1);
                let e2;
                try {
                    const stream = await service.readFileStream(uri_1.URI.parse('test://foo/bar'));
                    await (0, stream_1.$wd)(stream.value, chunk => chunk[0]);
                }
                catch (error) {
                    e2 = error;
                }
                assert.ok(e2);
            }
        }
        test('readFile/readFileStream supports cancellation (https://github.com/microsoft/vscode/issues/138805)', async () => {
            const service = disposables.add(new fileService_1.$Dp(new log_1.$fj()));
            let readFileStreamReady = undefined;
            const provider = new class extends nullFileSystemProvider_1.$y$b {
                async stat(resource) {
                    return {
                        mtime: Date.now(),
                        ctime: Date.now(),
                        size: 100,
                        type: files_1.FileType.File
                    };
                }
                readFileStream(resource, opts, token) {
                    const stream = (0, stream_1.$td)(chunk => chunk[0]);
                    disposables.add(token.onCancellationRequested(() => {
                        stream.error(new Error('Expected cancellation'));
                        stream.end();
                    }));
                    readFileStreamReady.complete();
                    return stream;
                }
            };
            const disposable = service.registerProvider('test', provider);
            provider.setCapabilities(16 /* FileSystemProviderCapabilities.FileReadStream */);
            let e1;
            try {
                const cts = new cancellation_1.$pd();
                readFileStreamReady = new async_1.$2g();
                const promise = service.readFile(uri_1.URI.parse('test://foo/bar'), undefined, cts.token);
                await Promise.all([readFileStreamReady.p.then(() => cts.cancel()), promise]);
            }
            catch (error) {
                e1 = error;
            }
            assert.ok(e1);
            let e2;
            try {
                const cts = new cancellation_1.$pd();
                readFileStreamReady = new async_1.$2g();
                const stream = await service.readFileStream(uri_1.URI.parse('test://foo/bar'), undefined, cts.token);
                await Promise.all([readFileStreamReady.p.then(() => cts.cancel()), (0, stream_1.$wd)(stream.value, chunk => chunk[0])]);
            }
            catch (error) {
                e2 = error;
            }
            assert.ok(e2);
            disposable.dispose();
        });
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=fileService.test.js.map