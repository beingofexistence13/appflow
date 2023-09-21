/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/platform/userDataSync/common/extensionsMerge"], function (require, exports, assert, extensionsMerge_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ExtensionsMerge', () => {
        test('merge returns local extension if remote does not exist', () => {
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
                aLocalSyncExtension({ identifier: { id: 'b', uuid: 'b' } }),
                aLocalSyncExtension({ identifier: { id: 'c', uuid: 'c' } }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, null, null, [], [], []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, []);
            assert.deepStrictEqual(actual.remote?.all, localExtensions);
        });
        test('merge returns local extension if remote does not exist with ignored extensions', () => {
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
                aLocalSyncExtension({ identifier: { id: 'b', uuid: 'b' } }),
                aLocalSyncExtension({ identifier: { id: 'c', uuid: 'c' } }),
            ];
            const expected = [
                localExtensions[1],
                localExtensions[2],
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, null, null, [], ['a'], []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, []);
            assert.deepStrictEqual(actual.remote?.all, expected);
        });
        test('merge returns local extension if remote does not exist with ignored extensions (ignore case)', () => {
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
                aLocalSyncExtension({ identifier: { id: 'b', uuid: 'b' } }),
                aLocalSyncExtension({ identifier: { id: 'c', uuid: 'c' } }),
            ];
            const expected = [
                localExtensions[1],
                localExtensions[2],
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, null, null, [], ['A'], []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, []);
            assert.deepStrictEqual(actual.remote?.all, expected);
        });
        test('merge returns local extension if remote does not exist with skipped extensions', () => {
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
                aLocalSyncExtension({ identifier: { id: 'b', uuid: 'b' } }),
                aLocalSyncExtension({ identifier: { id: 'c', uuid: 'c' } }),
            ];
            const skippedExtension = [
                aSyncExtension({ identifier: { id: 'b', uuid: 'b' } }),
            ];
            const expected = [...localExtensions];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, null, null, skippedExtension, [], []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, []);
            assert.deepStrictEqual(actual.remote?.all, expected);
        });
        test('merge returns local extension if remote does not exist with skipped and ignored extensions', () => {
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
                aLocalSyncExtension({ identifier: { id: 'b', uuid: 'b' } }),
                aLocalSyncExtension({ identifier: { id: 'c', uuid: 'c' } }),
            ];
            const skippedExtension = [
                aSyncExtension({ identifier: { id: 'b', uuid: 'b' } }),
            ];
            const expected = [localExtensions[1], localExtensions[2]];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, null, null, skippedExtension, ['a'], []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, []);
            assert.deepStrictEqual(actual.remote?.all, expected);
        });
        test('merge local and remote extensions when there is no base', () => {
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
                aLocalSyncExtension({ identifier: { id: 'd', uuid: 'd' } }),
            ];
            const remoteExtensions = [
                aSyncExtension({ identifier: { id: 'b', uuid: 'b' } }),
                aSyncExtension({ identifier: { id: 'c', uuid: 'c' } }),
            ];
            const expected = [
                anExpectedSyncExtension({ identifier: { id: 'b', uuid: 'b' } }),
                anExpectedSyncExtension({ identifier: { id: 'c', uuid: 'c' } }),
                anExpectedSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
                anExpectedSyncExtension({ identifier: { id: 'd', uuid: 'd' } }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, null, [], [], []);
            assert.deepStrictEqual(actual.local.added, [
                anExpectedSyncExtension({ identifier: { id: 'b', uuid: 'b' } }),
                anExpectedSyncExtension({ identifier: { id: 'c', uuid: 'c' } }),
            ]);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, []);
            assert.deepStrictEqual(actual.remote?.all, expected);
        });
        test('merge local and remote extensions when there is no base and with ignored extensions', () => {
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
                aLocalSyncExtension({ identifier: { id: 'd', uuid: 'd' } }),
            ];
            const remoteExtensions = [
                aSyncExtension({ identifier: { id: 'b', uuid: 'b' } }),
                aSyncExtension({ identifier: { id: 'c', uuid: 'c' } }),
            ];
            const expected = [
                anExpectedSyncExtension({ identifier: { id: 'b', uuid: 'b' } }),
                anExpectedSyncExtension({ identifier: { id: 'c', uuid: 'c' } }),
                anExpectedSyncExtension({ identifier: { id: 'd', uuid: 'd' } }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, null, [], ['a'], []);
            assert.deepStrictEqual(actual.local.added, [
                anExpectedSyncExtension({ identifier: { id: 'b', uuid: 'b' } }),
                anExpectedSyncExtension({ identifier: { id: 'c', uuid: 'c' } }),
            ]);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, []);
            assert.deepStrictEqual(actual.remote?.all, expected);
        });
        test('merge local and remote extensions when remote is moved forwarded', () => {
            const baseExtensions = [
                aSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
                aSyncExtension({ identifier: { id: 'd', uuid: 'd' } }),
            ];
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
                aLocalSyncExtension({ identifier: { id: 'd', uuid: 'd' } }),
            ];
            const remoteExtensions = [
                aSyncExtension({ identifier: { id: 'b', uuid: 'b' } }),
                aSyncExtension({ identifier: { id: 'c', uuid: 'c' } }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, baseExtensions, [], [], []);
            assert.deepStrictEqual(actual.local.added, [
                anExpectedSyncExtension({ identifier: { id: 'b', uuid: 'b' } }),
                anExpectedSyncExtension({ identifier: { id: 'c', uuid: 'c' } }),
            ]);
            assert.deepStrictEqual(actual.local.removed, [{ id: 'a', uuid: 'a' }, { id: 'd', uuid: 'd' }]);
            assert.deepStrictEqual(actual.local.updated, []);
            assert.strictEqual(actual.remote, null);
        });
        test('merge local and remote extensions when remote is moved forwarded with disabled extension', () => {
            const baseExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
                aRemoteSyncExtension({ identifier: { id: 'd', uuid: 'd' } }),
            ];
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
                aLocalSyncExtension({ identifier: { id: 'd', uuid: 'd' } }),
            ];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'b', uuid: 'b' } }),
                aRemoteSyncExtension({ identifier: { id: 'c', uuid: 'c' } }),
                aRemoteSyncExtension({ identifier: { id: 'd', uuid: 'd' }, disabled: true }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, baseExtensions, [], [], []);
            assert.deepStrictEqual(actual.local.added, [
                anExpectedSyncExtension({ identifier: { id: 'b', uuid: 'b' } }),
                anExpectedSyncExtension({ identifier: { id: 'c', uuid: 'c' } }),
            ]);
            assert.deepStrictEqual(actual.local.removed, [{ id: 'a', uuid: 'a' }]);
            assert.deepStrictEqual(actual.local.updated, [anExpectedSyncExtension({ identifier: { id: 'd', uuid: 'd' }, disabled: true })]);
            assert.strictEqual(actual.remote, null);
        });
        test('merge local and remote extensions when remote moved forwarded with ignored extensions', () => {
            const baseExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
                aRemoteSyncExtension({ identifier: { id: 'd', uuid: 'd' } }),
            ];
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
                aLocalSyncExtension({ identifier: { id: 'd', uuid: 'd' } }),
            ];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'b', uuid: 'b' } }),
                aRemoteSyncExtension({ identifier: { id: 'c', uuid: 'c' } }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, baseExtensions, [], ['a'], []);
            assert.deepStrictEqual(actual.local.added, [
                anExpectedSyncExtension({ identifier: { id: 'b', uuid: 'b' } }),
                anExpectedSyncExtension({ identifier: { id: 'c', uuid: 'c' } }),
            ]);
            assert.deepStrictEqual(actual.local.removed, [{ id: 'd', uuid: 'd' }]);
            assert.deepStrictEqual(actual.local.updated, []);
            assert.strictEqual(actual.remote, null);
        });
        test('merge local and remote extensions when remote is moved forwarded with skipped extensions', () => {
            const baseExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
                aRemoteSyncExtension({ identifier: { id: 'd', uuid: 'd' } }),
            ];
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'd', uuid: 'd' } }),
            ];
            const skippedExtensions = [
                aSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
            ];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'b', uuid: 'b' } }),
                aRemoteSyncExtension({ identifier: { id: 'c', uuid: 'c' } }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, baseExtensions, skippedExtensions, [], []);
            assert.deepStrictEqual(actual.local.added, [
                anExpectedSyncExtension({ identifier: { id: 'b', uuid: 'b' } }),
                anExpectedSyncExtension({ identifier: { id: 'c', uuid: 'c' } }),
            ]);
            assert.deepStrictEqual(actual.local.removed, [{ id: 'd', uuid: 'd' }]);
            assert.deepStrictEqual(actual.local.updated, []);
            assert.strictEqual(actual.remote, null);
        });
        test('merge local and remote extensions when remote is moved forwarded with skipped and ignored extensions', () => {
            const baseExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
                aRemoteSyncExtension({ identifier: { id: 'd', uuid: 'd' } }),
            ];
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'd', uuid: 'd' } }),
            ];
            const skippedExtensions = [
                aSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
            ];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'b', uuid: 'b' } }),
                aRemoteSyncExtension({ identifier: { id: 'c', uuid: 'c' } }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, baseExtensions, skippedExtensions, ['b'], []);
            assert.deepStrictEqual(actual.local.added, [anExpectedSyncExtension({ identifier: { id: 'c', uuid: 'c' } })]);
            assert.deepStrictEqual(actual.local.removed, [{ id: 'd', uuid: 'd' }]);
            assert.deepStrictEqual(actual.local.updated, []);
            assert.strictEqual(actual.remote, null);
        });
        test('merge local and remote extensions when local is moved forwarded', () => {
            const baseExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
                aRemoteSyncExtension({ identifier: { id: 'd', uuid: 'd' } }),
            ];
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'b', uuid: 'b' } }),
                aLocalSyncExtension({ identifier: { id: 'c', uuid: 'c' } }),
            ];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
                aRemoteSyncExtension({ identifier: { id: 'd', uuid: 'd' } }),
            ];
            const expected = [
                anExpectedSyncExtension({ identifier: { id: 'b', uuid: 'b' } }),
                anExpectedSyncExtension({ identifier: { id: 'c', uuid: 'c' } }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, baseExtensions, [], [], []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, []);
            assert.deepStrictEqual(actual.remote?.all, expected);
        });
        test('merge local and remote extensions when local is moved forwarded with disabled extensions', () => {
            const baseExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
                aRemoteSyncExtension({ identifier: { id: 'd', uuid: 'd' } }),
            ];
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' }, disabled: true }),
                aLocalSyncExtension({ identifier: { id: 'b', uuid: 'b' } }),
                aLocalSyncExtension({ identifier: { id: 'c', uuid: 'c' } }),
            ];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
                aRemoteSyncExtension({ identifier: { id: 'd', uuid: 'd' } }),
            ];
            const expected = [
                anExpectedSyncExtension({ identifier: { id: 'a', uuid: 'a' }, disabled: true }),
                anExpectedSyncExtension({ identifier: { id: 'b', uuid: 'b' } }),
                anExpectedSyncExtension({ identifier: { id: 'c', uuid: 'c' } }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, baseExtensions, [], [], []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, []);
            assert.deepStrictEqual(actual.remote?.all, expected);
        });
        test('merge local and remote extensions when local is moved forwarded with ignored settings', () => {
            const baseExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
                aRemoteSyncExtension({ identifier: { id: 'd', uuid: 'd' } }),
            ];
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'b', uuid: 'b' } }),
                aLocalSyncExtension({ identifier: { id: 'c', uuid: 'c' } }),
            ];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
                aRemoteSyncExtension({ identifier: { id: 'd', uuid: 'd' } }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, baseExtensions, [], ['b'], []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, []);
            assert.deepStrictEqual(actual.remote?.all, [
                anExpectedSyncExtension({ identifier: { id: 'c', uuid: 'c' } }),
            ]);
        });
        test('merge local and remote extensions when local is moved forwarded with skipped extensions', () => {
            const baseExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
                aRemoteSyncExtension({ identifier: { id: 'd', uuid: 'd' } }),
            ];
            const skippedExtensions = [
                aSyncExtension({ identifier: { id: 'd', uuid: 'd' } }),
            ];
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'b', uuid: 'b' } }),
                aLocalSyncExtension({ identifier: { id: 'c', uuid: 'c' } }),
            ];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
                aRemoteSyncExtension({ identifier: { id: 'd', uuid: 'd' } }),
            ];
            const expected = [
                anExpectedSyncExtension({ identifier: { id: 'd', uuid: 'd' } }),
                anExpectedSyncExtension({ identifier: { id: 'b', uuid: 'b' } }),
                anExpectedSyncExtension({ identifier: { id: 'c', uuid: 'c' } }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, baseExtensions, skippedExtensions, [], []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, []);
            assert.deepStrictEqual(actual.remote?.all, expected);
        });
        test('merge local and remote extensions when local is moved forwarded with skipped and ignored extensions', () => {
            const baseExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
                aRemoteSyncExtension({ identifier: { id: 'd', uuid: 'd' } }),
            ];
            const skippedExtensions = [
                aSyncExtension({ identifier: { id: 'd', uuid: 'd' } }),
            ];
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'b', uuid: 'b' } }),
                aLocalSyncExtension({ identifier: { id: 'c', uuid: 'c' } }),
            ];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
                aRemoteSyncExtension({ identifier: { id: 'd', uuid: 'd' } }),
            ];
            const expected = [
                anExpectedSyncExtension({ identifier: { id: 'd', uuid: 'd' } }),
                anExpectedSyncExtension({ identifier: { id: 'b', uuid: 'b' } }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, baseExtensions, skippedExtensions, ['c'], []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, []);
            assert.deepStrictEqual(actual.remote?.all, expected);
        });
        test('merge local and remote extensions when both moved forwarded', () => {
            const baseExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
                aRemoteSyncExtension({ identifier: { id: 'd', uuid: 'd' } }),
            ];
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
                aLocalSyncExtension({ identifier: { id: 'b', uuid: 'b' } }),
                aLocalSyncExtension({ identifier: { id: 'c', uuid: 'c' } }),
            ];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'd', uuid: 'd' } }),
                aRemoteSyncExtension({ identifier: { id: 'b', uuid: 'b' } }),
                aRemoteSyncExtension({ identifier: { id: 'e', uuid: 'e' } }),
            ];
            const expected = [
                anExpectedSyncExtension({ identifier: { id: 'b', uuid: 'b' } }),
                anExpectedSyncExtension({ identifier: { id: 'e', uuid: 'e' } }),
                anExpectedSyncExtension({ identifier: { id: 'c', uuid: 'c' } }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, baseExtensions, [], [], []);
            assert.deepStrictEqual(actual.local.added, [anExpectedSyncExtension({ identifier: { id: 'e', uuid: 'e' } })]);
            assert.deepStrictEqual(actual.local.removed, [{ id: 'a', uuid: 'a' }]);
            assert.deepStrictEqual(actual.local.updated, []);
            assert.deepStrictEqual(actual.remote?.all, expected);
        });
        test('merge local and remote extensions when both moved forwarded with ignored extensions', () => {
            const baseExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
                aRemoteSyncExtension({ identifier: { id: 'd', uuid: 'd' } }),
            ];
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
                aLocalSyncExtension({ identifier: { id: 'b', uuid: 'b' } }),
                aLocalSyncExtension({ identifier: { id: 'c', uuid: 'c' } }),
            ];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'd', uuid: 'd' } }),
                aRemoteSyncExtension({ identifier: { id: 'b', uuid: 'b' } }),
                aRemoteSyncExtension({ identifier: { id: 'e', uuid: 'e' } }),
            ];
            const expected = [
                anExpectedSyncExtension({ identifier: { id: 'b', uuid: 'b' } }),
                anExpectedSyncExtension({ identifier: { id: 'e', uuid: 'e' } }),
                anExpectedSyncExtension({ identifier: { id: 'c', uuid: 'c' } }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, baseExtensions, [], ['a', 'e'], []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, []);
            assert.deepStrictEqual(actual.remote?.all, expected);
        });
        test('merge local and remote extensions when both moved forwarded with skipped extensions', () => {
            const baseExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
                aRemoteSyncExtension({ identifier: { id: 'd', uuid: 'd' } }),
            ];
            const skippedExtensions = [
                aSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
            ];
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'b', uuid: 'b' } }),
                aLocalSyncExtension({ identifier: { id: 'c', uuid: 'c' } }),
            ];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'd', uuid: 'd' } }),
                aRemoteSyncExtension({ identifier: { id: 'b', uuid: 'b' } }),
                aRemoteSyncExtension({ identifier: { id: 'e', uuid: 'e' } }),
            ];
            const expected = [
                anExpectedSyncExtension({ identifier: { id: 'b', uuid: 'b' } }),
                anExpectedSyncExtension({ identifier: { id: 'e', uuid: 'e' } }),
                anExpectedSyncExtension({ identifier: { id: 'c', uuid: 'c' } }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, baseExtensions, skippedExtensions, [], []);
            assert.deepStrictEqual(actual.local.added, [anExpectedSyncExtension({ identifier: { id: 'e', uuid: 'e' } })]);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, []);
            assert.deepStrictEqual(actual.remote?.all, expected);
        });
        test('merge local and remote extensions when both moved forwarded with skipped and ignoredextensions', () => {
            const baseExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
                aRemoteSyncExtension({ identifier: { id: 'd', uuid: 'd' } }),
            ];
            const skippedExtensions = [
                aSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
            ];
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'b', uuid: 'b' } }),
                aLocalSyncExtension({ identifier: { id: 'c', uuid: 'c' } }),
            ];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'd', uuid: 'd' } }),
                aRemoteSyncExtension({ identifier: { id: 'b', uuid: 'b' } }),
                aRemoteSyncExtension({ identifier: { id: 'e', uuid: 'e' } }),
            ];
            const expected = [
                anExpectedSyncExtension({ identifier: { id: 'b', uuid: 'b' } }),
                anExpectedSyncExtension({ identifier: { id: 'e', uuid: 'e' } }),
                anExpectedSyncExtension({ identifier: { id: 'c', uuid: 'c' } }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, baseExtensions, skippedExtensions, ['e'], []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, []);
            assert.deepStrictEqual(actual.remote?.all, expected);
        });
        test('merge when remote extension has no uuid and different extension id case', () => {
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
                aLocalSyncExtension({ identifier: { id: 'b', uuid: 'b' } }),
                aLocalSyncExtension({ identifier: { id: 'c', uuid: 'c' } }),
            ];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'A' } }),
                aRemoteSyncExtension({ identifier: { id: 'd', uuid: 'd' } }),
            ];
            const expected = [
                anExpectedSyncExtension({ identifier: { id: 'A', uuid: 'a' } }),
                anExpectedSyncExtension({ identifier: { id: 'd', uuid: 'd' } }),
                anExpectedSyncExtension({ identifier: { id: 'b', uuid: 'b' } }),
                anExpectedSyncExtension({ identifier: { id: 'c', uuid: 'c' } }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, null, [], [], []);
            assert.deepStrictEqual(actual.local.added, [anExpectedSyncExtension({ identifier: { id: 'd', uuid: 'd' } })]);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, []);
            assert.deepStrictEqual(actual.remote?.all, expected);
        });
        test('merge when remote extension is not an installed extension', () => {
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
            ];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
                aRemoteSyncExtension({ identifier: { id: 'b', uuid: 'b' }, installed: false }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, null, [], [], []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, []);
            assert.deepStrictEqual(actual.remote, null);
        });
        test('merge when remote extension is not an installed extension but is an installed extension locally', () => {
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
            ];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' }, installed: false }),
            ];
            const expected = [
                anExpectedSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, null, [], [], []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, []);
            assert.deepStrictEqual(actual.remote?.all, expected);
        });
        test('merge when an extension is not an installed extension remotely and does not exist locally', () => {
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' }, installed: false }),
            ];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' }, installed: false }),
                aRemoteSyncExtension({ identifier: { id: 'b', uuid: 'b' }, installed: false }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, remoteExtensions, [], [], []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, []);
            assert.deepStrictEqual(actual.remote, null);
        });
        test('merge when an extension is an installed extension remotely but not locally and updated locally', () => {
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' }, disabled: true }),
            ];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
            ];
            const expected = [
                anExpectedSyncExtension({ identifier: { id: 'a', uuid: 'a' }, disabled: true }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, remoteExtensions, [], [], []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, []);
            assert.deepStrictEqual(actual.remote?.all, expected);
        });
        test('merge when an extension is an installed extension remotely but not locally and updated remotely', () => {
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
            ];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' }, disabled: true }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, localExtensions, [], [], []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, [
                anExpectedSyncExtension({ identifier: { id: 'a', uuid: 'a' }, disabled: true }),
            ]);
            assert.deepStrictEqual(actual.remote, null);
        });
        test('merge not installed extensions', () => {
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' }, installed: false }),
            ];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'b', uuid: 'b' }, installed: false }),
            ];
            const expected = [
                anExpectedBuiltinSyncExtension({ identifier: { id: 'b', uuid: 'b' } }),
                anExpectedBuiltinSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, null, [], [], []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, []);
            assert.deepStrictEqual(actual.remote?.all, expected);
        });
        test('merge: remote extension with prerelease is added', () => {
            const localExtensions = [];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' }, preRelease: true }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, null, [], [], []);
            assert.deepStrictEqual(actual.local.added, [anExpectedSyncExtension({ identifier: { id: 'a', uuid: 'a' }, preRelease: true })]);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, []);
            assert.deepStrictEqual(actual.remote, null);
        });
        test('merge: local extension with prerelease is added', () => {
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' }, preRelease: true }),
            ];
            const remoteExtensions = [];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, null, [], [], []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, []);
            assert.deepStrictEqual(actual.remote?.all, [anExpectedSyncExtension({ identifier: { id: 'a', uuid: 'a' }, preRelease: true })]);
        });
        test('merge: remote extension with prerelease is added when local extension without prerelease is added', () => {
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
            ];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' }, preRelease: true }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, null, [], [], []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, [anExpectedSyncExtension({ identifier: { id: 'a', uuid: 'a' }, preRelease: true })]);
            assert.deepStrictEqual(actual.remote, null);
        });
        test('merge: remote extension without prerelease is added when local extension with prerelease is added', () => {
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' }, preRelease: true }),
            ];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, null, [], [], []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, [anExpectedSyncExtension({ identifier: { id: 'a', uuid: 'a' } })]);
            assert.deepStrictEqual(actual.remote, null);
        });
        test('merge: remote extension is changed to prerelease', () => {
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
            ];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' }, preRelease: true }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, localExtensions, [], [], []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, [anExpectedSyncExtension({ identifier: { id: 'a', uuid: 'a' }, preRelease: true })]);
            assert.deepStrictEqual(actual.remote, null);
        });
        test('merge: remote extension is changed to release', () => {
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' }, preRelease: true }),
            ];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, localExtensions, [], [], []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, [anExpectedSyncExtension({ identifier: { id: 'a', uuid: 'a' } })]);
            assert.deepStrictEqual(actual.remote, null);
        });
        test('merge: local extension is changed to prerelease', () => {
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' }, preRelease: true }),
            ];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, remoteExtensions, [], [], []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, []);
            assert.deepStrictEqual(actual.remote?.all, [anExpectedSyncExtension({ identifier: { id: 'a', uuid: 'a' }, preRelease: true })]);
        });
        test('merge: local extension is changed to release', () => {
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
            ];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' }, preRelease: true }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, remoteExtensions, [], [], []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, []);
            assert.deepStrictEqual(actual.remote?.all, [aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' } })]);
        });
        test('merge: local extension not an installed extension - remote preRelease property is taken precedence when there are no updates', () => {
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' }, installed: false }),
            ];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' }, preRelease: true }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, remoteExtensions, [], [], []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, []);
            assert.deepStrictEqual(actual.remote, null);
        });
        test('merge: local extension not an installed extension - remote preRelease property is taken precedence when there are updates locally', () => {
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' }, installed: false, disabled: true }),
            ];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' }, preRelease: true }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, remoteExtensions, [], [], []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, []);
            assert.deepStrictEqual(actual.remote?.all, [anExpectedSyncExtension({ identifier: { id: 'a', uuid: 'a' }, preRelease: true, disabled: true })]);
        });
        test('merge: local extension not an installed extension - remote preRelease property is taken precedence when there are updates remotely', () => {
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' }, installed: false }),
            ];
            const baseExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' }, preRelease: true }),
            ];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' }, preRelease: true, disabled: true }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, baseExtensions, [], [], []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, [anExpectedSyncExtension({ identifier: { id: 'a', uuid: 'a' }, preRelease: true, disabled: true })]);
            assert.deepStrictEqual(actual.remote, null);
        });
        test('merge: local extension not an installed extension - remote version is taken precedence when there are no updates', () => {
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' }, installed: false }),
            ];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' }, version: '1.1.0' }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, remoteExtensions, [], [], []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, []);
            assert.deepStrictEqual(actual.remote, null);
        });
        test('merge: local extension not an installed extension - remote version is taken precedence when there are updates locally', () => {
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' }, installed: false, disabled: true }),
            ];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' }, version: '1.1.0' }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, remoteExtensions, [], [], []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, []);
            assert.deepStrictEqual(actual.remote?.all, [anExpectedSyncExtension({ identifier: { id: 'a', uuid: 'a' }, version: '1.1.0', disabled: true })]);
        });
        test('merge: local extension not an installed extension - remote version property is taken precedence when there are updates remotely', () => {
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' }, installed: false }),
            ];
            const baseExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' }, version: '1.1.0' }),
            ];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' }, version: '1.1.0', disabled: true }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, baseExtensions, [], [], []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, [anExpectedSyncExtension({ identifier: { id: 'a', uuid: 'a' }, version: '1.1.0', disabled: true })]);
            assert.deepStrictEqual(actual.remote, null);
        });
        test('merge: base has builtin extension, local does not have extension, remote has extension installed', () => {
            const localExtensions = [];
            const baseExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' }, version: '1.1.0', installed: false }),
            ];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' }, version: '1.1.0' }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, baseExtensions, [], [], []);
            assert.deepStrictEqual(actual.local.added, [anExpectedSyncExtension({ identifier: { id: 'a', uuid: 'a' }, version: '1.1.0' })]);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, []);
            assert.deepStrictEqual(actual.remote, null);
        });
        test('merge: base has installed extension, local has installed extension, remote has extension builtin', () => {
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
            ];
            const baseExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
            ];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' }, installed: false }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, baseExtensions, [], [], []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, [{ id: 'a', uuid: 'a' }]);
            assert.deepStrictEqual(actual.local.updated, []);
            assert.deepStrictEqual(actual.remote, null);
        });
        test('merge: base has installed extension, local has builtin extension, remote does not has extension', () => {
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' }, installed: false }),
            ];
            const baseExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
            ];
            const remoteExtensions = [];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, baseExtensions, [], [], []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, []);
            assert.deepStrictEqual(actual.remote?.all, [anExpectedBuiltinSyncExtension({ identifier: { id: 'a', uuid: 'a' } })]);
        });
        test('merge: base has builtin extension, local has installed extension, remote has builtin extension with updated state', () => {
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
            ];
            const baseExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' }, installed: false }),
            ];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' }, installed: false, state: { 'a': 1 } }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, baseExtensions, [], [], [{ id: 'a', uuid: 'a' }]);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, [anExpectedSyncExtension({ identifier: { id: 'a', uuid: 'a' }, state: { 'a': 1 } })]);
            assert.deepStrictEqual(actual.remote?.all, [anExpectedSyncExtension({ identifier: { id: 'a', uuid: 'a' }, state: { 'a': 1 } })]);
        });
        test('merge: base has installed extension, last time synced as builtin extension, local has installed extension, remote has builtin extension with updated state', () => {
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
            ];
            const baseExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
            ];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' }, installed: false, state: { 'a': 1 } }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, baseExtensions, [], [], [{ id: 'a', uuid: 'a' }]);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, [anExpectedSyncExtension({ identifier: { id: 'a', uuid: 'a' }, state: { 'a': 1 } })]);
            assert.deepStrictEqual(actual.remote?.all, [anExpectedSyncExtension({ identifier: { id: 'a', uuid: 'a' }, state: { 'a': 1 } })]);
        });
        test('merge: base has builtin extension, local does not have extension, remote has builtin extension', () => {
            const localExtensions = [];
            const baseExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' }, version: '1.1.0', installed: false }),
            ];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' }, version: '1.1.0', installed: false }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, baseExtensions, [], [], []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, []);
            assert.deepStrictEqual(actual.remote, null);
        });
        test('merge: base has installed extension, last synced as builtin, local does not have extension, remote has installed extension', () => {
            const localExtensions = [];
            const baseExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' }, version: '1.1.0' }),
            ];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' }, version: '1.1.0' }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, baseExtensions, [], [], [{ id: 'a', uuid: 'a' }]);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, []);
            assert.deepStrictEqual(actual.remote, null);
        });
        test('merge: base has builtin extension, last synced as builtin, local does not have extension, remote has installed extension', () => {
            const localExtensions = [];
            const baseExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' }, version: '1.1.0', installed: false }),
            ];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' }, version: '1.1.0' }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, baseExtensions, [], [], [{ id: 'a', uuid: 'a' }]);
            assert.deepStrictEqual(actual.local.added, [anExpectedSyncExtension({ identifier: { id: 'a', uuid: 'a' }, version: '1.1.0' })]);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, []);
            assert.deepStrictEqual(actual.remote, null);
        });
        test('merge: remote extension with pinned is added', () => {
            const localExtensions = [];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' }, pinned: true }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, null, [], [], []);
            assert.deepStrictEqual(actual.local.added, [anExpectedSyncExtension({ identifier: { id: 'a', uuid: 'a' }, pinned: true })]);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, []);
            assert.deepStrictEqual(actual.remote, null);
        });
        test('merge: local extension with pinned is added', () => {
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' }, pinned: true }),
            ];
            const remoteExtensions = [];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, null, [], [], []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, []);
            assert.deepStrictEqual(actual.remote?.all, [anExpectedSyncExtension({ identifier: { id: 'a', uuid: 'a' }, pinned: true })]);
        });
        test('merge: remote extension with pinned is added when local extension without pinned is added', () => {
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
            ];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' }, pinned: true }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, null, [], [], []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, [anExpectedSyncExtension({ identifier: { id: 'a', uuid: 'a' }, pinned: true })]);
            assert.deepStrictEqual(actual.remote, null);
        });
        test('merge: remote extension without pinned is added when local extension with pinned is added', () => {
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' }, pinned: true }),
            ];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, null, [], [], []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, [anExpectedSyncExtension({ identifier: { id: 'a', uuid: 'a' } })]);
            assert.deepStrictEqual(actual.remote, null);
        });
        test('merge: remote extension is changed to pinned', () => {
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
            ];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' }, pinned: true }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, localExtensions, [], [], []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, [anExpectedSyncExtension({ identifier: { id: 'a', uuid: 'a' }, pinned: true })]);
            assert.deepStrictEqual(actual.remote, null);
        });
        test('merge: remote extension is changed to unpinned', () => {
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' }, pinned: true }),
            ];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, localExtensions, [], [], []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, [anExpectedSyncExtension({ identifier: { id: 'a', uuid: 'a' } })]);
            assert.deepStrictEqual(actual.remote, null);
        });
        test('merge: local extension is changed to pinned', () => {
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' }, pinned: true }),
            ];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, remoteExtensions, [], [], []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, []);
            assert.deepStrictEqual(actual.remote?.all, [anExpectedSyncExtension({ identifier: { id: 'a', uuid: 'a' }, pinned: true })]);
        });
        test('merge: local extension is changed to unpinned', () => {
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
            ];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' }, pinned: true }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, remoteExtensions, [], [], []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, []);
            assert.deepStrictEqual(actual.remote?.all, [aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' } })]);
        });
        test('merge: local extension not an installed extension - remote pinned property is taken precedence when there are no updates', () => {
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' }, installed: false }),
            ];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' }, pinned: true }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, remoteExtensions, [], [], []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, []);
            assert.deepStrictEqual(actual.remote, null);
        });
        test('merge: local extension not an installed extension - remote pinned property is taken precedence when there are updates locally', () => {
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' }, installed: false, disabled: true }),
            ];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' }, pinned: true }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, remoteExtensions, [], [], []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, []);
            assert.deepStrictEqual(actual.remote?.all, [anExpectedSyncExtension({ identifier: { id: 'a', uuid: 'a' }, pinned: true, disabled: true })]);
        });
        test('merge: local extension not an installed extension - remote pinned property is taken precedence when there are updates remotely', () => {
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' }, installed: false }),
            ];
            const baseExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' }, pinned: true }),
            ];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' }, pinned: true, disabled: true }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, baseExtensions, [], [], []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, [anExpectedSyncExtension({ identifier: { id: 'a', uuid: 'a' }, pinned: true, disabled: true })]);
            assert.deepStrictEqual(actual.remote, null);
        });
        test('merge: local extension is changed to pinned and version changed', () => {
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' }, version: '0.0.1', pinned: true }),
            ];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, remoteExtensions, [], [], []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, []);
            assert.deepStrictEqual(actual.remote?.all, [anExpectedSyncExtension({ identifier: { id: 'a', uuid: 'a' }, version: '0.0.1', pinned: true })]);
        });
        test('merge: local extension is changed to unpinned and version changed', () => {
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
            ];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' }, version: '0.0.1', pinned: true }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, remoteExtensions, [], [], []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, []);
            assert.deepStrictEqual(actual.remote?.all, [anExpectedSyncExtension({ identifier: { id: 'a', uuid: 'a' } })]);
        });
        test('merge: remote extension is changed to pinned and version changed', () => {
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
            ];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' }, version: '0.0.1', pinned: true }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, localExtensions, [], [], []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, [anExpectedSyncExtension({ identifier: { id: 'a', uuid: 'a' }, version: '0.0.1', pinned: true })]);
            assert.deepStrictEqual(actual.remote, null);
        });
        test('merge: local extension is changed to pinned and version changed and remote extension is channged to pinned with different version', () => {
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' }, version: '0.0.1', pinned: true }),
            ];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' }, version: '0.0.2', pinned: true }),
            ];
            const baseExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, baseExtensions, [], [], []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, [anExpectedSyncExtension({ identifier: { id: 'a', uuid: 'a' }, version: '0.0.2', pinned: true })]);
            assert.deepStrictEqual(actual.remote, null);
        });
        test('merge: remote extension is changed to unpinned and version changed', () => {
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' }, version: '0.0.1', pinned: true }),
            ];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, localExtensions, [], [], []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, [anExpectedSyncExtension({ identifier: { id: 'a', uuid: 'a' } })]);
            assert.deepStrictEqual(actual.remote, null);
        });
        test('merge: local extension is changed to unpinned and version changed and remote extension is channged to unpinned with different version', () => {
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' }, version: '0.0.1' }),
            ];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' }, version: '0.0.2' }),
            ];
            const baseExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' }, pinned: true }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, baseExtensions, [], [], []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, []);
            assert.deepStrictEqual(actual.remote, null);
        });
        test('sync adding local application scoped extension', () => {
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' }, isApplicationScoped: true }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, null, null, [], [], []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, []);
            assert.deepStrictEqual(actual.remote?.all, localExtensions);
        });
        test('sync merging local extension with isApplicationScoped property and remote does not has isApplicationScoped property', () => {
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' }, isApplicationScoped: false }),
            ];
            const baseExtensions = [
                aSyncExtension({ identifier: { id: 'a', uuid: 'a' } }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, baseExtensions, baseExtensions, [], [], []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, []);
            assert.deepStrictEqual(actual.remote?.all, [anExpectedSyncExtension({ identifier: { id: 'a', uuid: 'a' } })]);
        });
        test('sync merging when applicaiton scope is changed locally', () => {
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' }, isApplicationScoped: true }),
            ];
            const baseExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' }, isApplicationScoped: false }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, baseExtensions, baseExtensions, [], [], []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, []);
            assert.deepStrictEqual(actual.remote?.all, localExtensions);
        });
        test('sync merging when applicaiton scope is changed remotely', () => {
            const localExtensions = [
                aLocalSyncExtension({ identifier: { id: 'a', uuid: 'a' }, isApplicationScoped: false }),
            ];
            const baseExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' }, isApplicationScoped: false }),
            ];
            const remoteExtensions = [
                aRemoteSyncExtension({ identifier: { id: 'a', uuid: 'a' }, isApplicationScoped: true }),
            ];
            const actual = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, baseExtensions, [], [], []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, [anExpectedSyncExtension({ identifier: { id: 'a', uuid: 'a' }, isApplicationScoped: true })]);
            assert.deepStrictEqual(actual.remote, null);
        });
        function anExpectedSyncExtension(extension) {
            return {
                identifier: { id: 'a', uuid: 'a' },
                version: '1.0.0',
                pinned: false,
                preRelease: false,
                installed: true,
                ...extension
            };
        }
        function anExpectedBuiltinSyncExtension(extension) {
            return {
                identifier: { id: 'a', uuid: 'a' },
                version: '1.0.0',
                pinned: false,
                preRelease: false,
                ...extension
            };
        }
        function aLocalSyncExtension(extension) {
            return {
                identifier: { id: 'a', uuid: 'a' },
                version: '1.0.0',
                pinned: false,
                preRelease: false,
                installed: true,
                ...extension
            };
        }
        function aRemoteSyncExtension(extension) {
            return {
                identifier: { id: 'a', uuid: 'a' },
                version: '1.0.0',
                pinned: false,
                preRelease: false,
                installed: true,
                ...extension
            };
        }
        function aSyncExtension(extension) {
            return {
                identifier: { id: 'a', uuid: 'a' },
                version: '1.0.0',
                installed: true,
                ...extension
            };
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uc01lcmdlLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS91c2VyRGF0YVN5bmMvdGVzdC9jb21tb24vZXh0ZW5zaW9uc01lcmdlLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFNaEcsS0FBSyxDQUFDLGlCQUFpQixFQUFFLEdBQUcsRUFBRTtRQUU3QixJQUFJLENBQUMsd0RBQXdELEVBQUUsR0FBRyxFQUFFO1lBQ25FLE1BQU0sZUFBZSxHQUFHO2dCQUN2QixtQkFBbUIsQ0FBQyxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUM7Z0JBQzNELG1CQUFtQixDQUFDLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQztnQkFDM0QsbUJBQW1CLENBQUMsRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDO2FBQzNELENBQUM7WUFFRixNQUFNLE1BQU0sR0FBRyxJQUFBLHVCQUFLLEVBQUMsZUFBZSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUU5RCxNQUFNLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQy9DLE1BQU0sQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDakQsTUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNq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