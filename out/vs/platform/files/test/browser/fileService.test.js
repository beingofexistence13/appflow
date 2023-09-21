/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/base/common/stream", "vs/base/common/uri", "vs/base/test/common/utils", "vs/platform/files/common/files", "vs/platform/files/common/fileService", "vs/platform/files/test/common/nullFileSystemProvider", "vs/platform/log/common/log"], function (require, exports, assert, async_1, cancellation_1, lifecycle_1, stream_1, uri_1, utils_1, files_1, fileService_1, nullFileSystemProvider_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('File Service', () => {
        const disposables = new lifecycle_1.DisposableStore();
        teardown(() => {
            disposables.clear();
        });
        test('provider registration', async () => {
            const service = disposables.add(new fileService_1.FileService(new log_1.NullLogService()));
            const resource = uri_1.URI.parse('test://foo/bar');
            const provider = new nullFileSystemProvider_1.NullFileSystemProvider();
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
            const service = disposables.add(new fileService_1.FileService(new log_1.NullLogService()));
            let disposeCounter = 0;
            disposables.add(service.registerProvider('test', new nullFileSystemProvider_1.NullFileSystemProvider(() => {
                return (0, lifecycle_1.toDisposable)(() => {
                    disposeCounter++;
                });
            })));
            await service.activateProvider('test');
            const resource1 = uri_1.URI.parse('test://foo/bar1');
            const watcher1Disposable = service.watch(resource1);
            await (0, async_1.timeout)(0); // service.watch() is async
            assert.strictEqual(disposeCounter, 0);
            watcher1Disposable.dispose();
            assert.strictEqual(disposeCounter, 1);
            disposeCounter = 0;
            const resource2 = uri_1.URI.parse('test://foo/bar2');
            const watcher2Disposable1 = service.watch(resource2);
            const watcher2Disposable2 = service.watch(resource2);
            const watcher2Disposable3 = service.watch(resource2);
            await (0, async_1.timeout)(0); // service.watch() is async
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
            await (0, async_1.timeout)(0); // service.watch() is async
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
            const service = disposables.add(new fileService_1.FileService(new log_1.NullLogService()));
            const provider = new class extends nullFileSystemProvider_1.NullFileSystemProvider {
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
                        return (0, async_1.timeout)(5, cancellation_1.CancellationToken.None).then(() => { throw new Error('failed'); });
                    }
                    throw new Error('failed');
                }
                open(resource, opts) {
                    if (async) {
                        return (0, async_1.timeout)(5, cancellation_1.CancellationToken.None).then(() => { throw new Error('failed'); });
                    }
                    throw new Error('failed');
                }
                readFileStream(resource, opts, token) {
                    if (async) {
                        const stream = (0, stream_1.newWriteableStream)(chunk => chunk[0]);
                        (0, async_1.timeout)(5, cancellation_1.CancellationToken.None).then(() => stream.error(new Error('failed')));
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
                    await (0, stream_1.consumeStream)(stream.value, chunk => chunk[0]);
                }
                catch (error) {
                    e2 = error;
                }
                assert.ok(e2);
            }
        }
        test('readFile/readFileStream supports cancellation (https://github.com/microsoft/vscode/issues/138805)', async () => {
            const service = disposables.add(new fileService_1.FileService(new log_1.NullLogService()));
            let readFileStreamReady = undefined;
            const provider = new class extends nullFileSystemProvider_1.NullFileSystemProvider {
                async stat(resource) {
                    return {
                        mtime: Date.now(),
                        ctime: Date.now(),
                        size: 100,
                        type: files_1.FileType.File
                    };
                }
                readFileStream(resource, opts, token) {
                    const stream = (0, stream_1.newWriteableStream)(chunk => chunk[0]);
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
                const cts = new cancellation_1.CancellationTokenSource();
                readFileStreamReady = new async_1.DeferredPromise();
                const promise = service.readFile(uri_1.URI.parse('test://foo/bar'), undefined, cts.token);
                await Promise.all([readFileStreamReady.p.then(() => cts.cancel()), promise]);
            }
            catch (error) {
                e1 = error;
            }
            assert.ok(e1);
            let e2;
            try {
                const cts = new cancellation_1.CancellationTokenSource();
                readFileStreamReady = new async_1.DeferredPromise();
                const stream = await service.readFileStream(uri_1.URI.parse('test://foo/bar'), undefined, cts.token);
                await Promise.all([readFileStreamReady.p.then(() => cts.cancel()), (0, stream_1.consumeStream)(stream.value, chunk => chunk[0])]);
            }
            catch (error) {
                e2 = error;
            }
            assert.ok(e2);
            disposable.dispose();
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZVNlcnZpY2UudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2ZpbGVzL3Rlc3QvYnJvd3Nlci9maWxlU2VydmljZS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBY2hHLEtBQUssQ0FBQyxjQUFjLEVBQUUsR0FBRyxFQUFFO1FBRTFCLE1BQU0sV0FBVyxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1FBRTFDLFFBQVEsQ0FBQyxHQUFHLEVBQUU7WUFDYixXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDckIsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsdUJBQXVCLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDeEMsTUFBTSxPQUFPLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLHlCQUFXLENBQUMsSUFBSSxvQkFBYyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3ZFLE1BQU0sUUFBUSxHQUFHLFNBQUcsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUM3QyxNQUFNLFFBQVEsR0FBRyxJQUFJLCtDQUFzQixFQUFFLENBQUM7WUFFOUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNyRSxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDekQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUVwRSxNQUFNLGFBQWEsR0FBMkMsRUFBRSxDQUFDO1lBQ2pFLFdBQVcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLDBDQUEwQyxD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