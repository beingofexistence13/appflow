/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/userDataSync/common/userDataProfilesManifestMerge"], function (require, exports, assert, uri_1, userDataProfile_1, userDataProfilesManifestMerge_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('UserDataProfilesManifestMerge', () => {
        test('merge returns local profiles if remote does not exist', () => {
            const localProfiles = [
                (0, userDataProfile_1.$Gk)('1', '1', uri_1.URI.file('1'), uri_1.URI.file('cache')),
                (0, userDataProfile_1.$Gk)('2', '2', uri_1.URI.file('2'), uri_1.URI.file('cache')),
            ];
            const actual = (0, userDataProfilesManifestMerge_1.$G4b)(localProfiles, null, null, []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, []);
            assert.deepStrictEqual(actual.remote?.added, localProfiles);
            assert.deepStrictEqual(actual.remote?.updated, []);
            assert.deepStrictEqual(actual.remote?.removed, []);
        });
        test('merge returns local profiles if remote does not exist with ignored profiles', () => {
            const localProfiles = [
                (0, userDataProfile_1.$Gk)('1', '1', uri_1.URI.file('1'), uri_1.URI.file('cache')),
                (0, userDataProfile_1.$Gk)('2', '2', uri_1.URI.file('2'), uri_1.URI.file('cache')),
            ];
            const actual = (0, userDataProfilesManifestMerge_1.$G4b)(localProfiles, null, null, ['2']);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, []);
            assert.deepStrictEqual(actual.remote?.added, [localProfiles[0]]);
            assert.deepStrictEqual(actual.remote?.updated, []);
            assert.deepStrictEqual(actual.remote?.removed, []);
        });
        test('merge local and remote profiles when there is no base', () => {
            const localProfiles = [
                (0, userDataProfile_1.$Gk)('1', '1', uri_1.URI.file('1'), uri_1.URI.file('cache')),
                (0, userDataProfile_1.$Gk)('2', '2', uri_1.URI.file('2'), uri_1.URI.file('cache')),
            ];
            const remoteProfiles = [
                { id: '1', name: 'changed', collection: '1' },
                { id: '3', name: '3', collection: '3' },
            ];
            const actual = (0, userDataProfilesManifestMerge_1.$G4b)(localProfiles, remoteProfiles, null, []);
            assert.deepStrictEqual(actual.local.added, [remoteProfiles[1]]);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, [remoteProfiles[0]]);
            assert.deepStrictEqual(actual.remote?.added, [localProfiles[1]]);
            assert.deepStrictEqual(actual.remote?.updated, []);
            assert.deepStrictEqual(actual.remote?.removed, []);
        });
        test('merge local and remote profiles when there is base', () => {
            const localProfiles = [
                (0, userDataProfile_1.$Gk)('1', 'changed 1', uri_1.URI.file('1'), uri_1.URI.file('cache')),
                (0, userDataProfile_1.$Gk)('3', '3', uri_1.URI.file('3'), uri_1.URI.file('cache')),
                (0, userDataProfile_1.$Gk)('4', 'changed local', uri_1.URI.file('4'), uri_1.URI.file('cache')),
                (0, userDataProfile_1.$Gk)('5', '5', uri_1.URI.file('5'), uri_1.URI.file('cache')),
                (0, userDataProfile_1.$Gk)('6', '6', uri_1.URI.file('6'), uri_1.URI.file('cache')),
                (0, userDataProfile_1.$Gk)('8', '8', uri_1.URI.file('8'), uri_1.URI.file('cache')),
                (0, userDataProfile_1.$Gk)('10', '10', uri_1.URI.file('8'), uri_1.URI.file('cache'), { useDefaultFlags: { tasks: true } }),
                (0, userDataProfile_1.$Gk)('11', '11', uri_1.URI.file('1'), uri_1.URI.file('cache'), { useDefaultFlags: { keybindings: true } }),
            ];
            const base = [
                { id: '1', name: '1', collection: '1' },
                { id: '2', name: '2', collection: '2' },
                { id: '3', name: '3', collection: '3' },
                { id: '4', name: '4', collection: '4' },
                { id: '5', name: '5', collection: '5' },
                { id: '6', name: '6', collection: '6' },
                { id: '10', name: '10', collection: '10', useDefaultFlags: { tasks: true } },
                { id: '11', name: '11', collection: '11' },
            ];
            const remoteProfiles = [
                { id: '1', name: '1', collection: '1' },
                { id: '2', name: '2', collection: '2' },
                { id: '3', name: '3', collection: '3', shortName: 'short 3' },
                { id: '4', name: 'changed remote', collection: '4' },
                { id: '5', name: '5', collection: '5' },
                { id: '7', name: '7', collection: '7' },
                { id: '9', name: '9', collection: '9', useDefaultFlags: { snippets: true } },
                { id: '10', name: '10', collection: '10' },
                { id: '11', name: '11', collection: '11' },
            ];
            const actual = (0, userDataProfilesManifestMerge_1.$G4b)(localProfiles, remoteProfiles, base, []);
            assert.deepStrictEqual(actual.local.added, [remoteProfiles[5], remoteProfiles[6]]);
            assert.deepStrictEqual(actual.local.removed, [localProfiles[4]]);
            assert.deepStrictEqual(actual.local.updated, [remoteProfiles[2], remoteProfiles[3], remoteProfiles[7]]);
            assert.deepStrictEqual(actual.remote?.added, [localProfiles[5]]);
            assert.deepStrictEqual(actual.remote?.updated, [localProfiles[0], localProfiles[7]]);
            assert.deepStrictEqual(actual.remote?.removed, [remoteProfiles[1]]);
        });
        test('merge local and remote profiles when there is base with ignored profiles', () => {
            const localProfiles = [
                (0, userDataProfile_1.$Gk)('1', 'changed 1', uri_1.URI.file('1'), uri_1.URI.file('cache')),
                (0, userDataProfile_1.$Gk)('3', '3', uri_1.URI.file('3'), uri_1.URI.file('cache')),
                (0, userDataProfile_1.$Gk)('4', 'changed local', uri_1.URI.file('4'), uri_1.URI.file('cache')),
                (0, userDataProfile_1.$Gk)('5', '5', uri_1.URI.file('5'), uri_1.URI.file('cache')),
                (0, userDataProfile_1.$Gk)('6', '6', uri_1.URI.file('6'), uri_1.URI.file('cache')),
                (0, userDataProfile_1.$Gk)('8', '8', uri_1.URI.file('8'), uri_1.URI.file('cache')),
            ];
            const base = [
                { id: '1', name: '1', collection: '1' },
                { id: '2', name: '2', collection: '2' },
                { id: '3', name: '3', collection: '3' },
                { id: '4', name: '4', collection: '4' },
                { id: '5', name: '5', collection: '5' },
                { id: '6', name: '6', collection: '6' },
            ];
            const remoteProfiles = [
                { id: '1', name: '1', collection: '1' },
                { id: '2', name: '2', collection: '2' },
                { id: '3', name: 'changed 3', collection: '3' },
                { id: '4', name: 'changed remote', collection: '4' },
                { id: '5', name: '5', collection: '5' },
                { id: '7', name: '7', collection: '7' },
            ];
            const actual = (0, userDataProfilesManifestMerge_1.$G4b)(localProfiles, remoteProfiles, base, ['4', '8']);
            assert.deepStrictEqual(actual.local.added, [remoteProfiles[5]]);
            assert.deepStrictEqual(actual.local.removed, [localProfiles[4]]);
            assert.deepStrictEqual(actual.local.updated, [remoteProfiles[2]]);
            assert.deepStrictEqual(actual.remote?.added, []);
            assert.deepStrictEqual(actual.remote?.updated, [localProfiles[0]]);
            assert.deepStrictEqual(actual.remote?.removed, [remoteProfiles[1]]);
        });
        test('merge when there are no remote changes', () => {
            const localProfiles = [
                (0, userDataProfile_1.$Gk)('1', '1', uri_1.URI.file('1'), uri_1.URI.file('cache')),
            ];
            const base = [
                { id: '1', name: '1', collection: '1' },
            ];
            const remoteProfiles = [
                { id: '1', name: 'name changed', collection: '1' },
            ];
            const actual = (0, userDataProfilesManifestMerge_1.$G4b)(localProfiles, remoteProfiles, base, []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, [remoteProfiles[0]]);
            assert.strictEqual(actual.remote, null);
        });
        test('merge when there are no local and remote changes', () => {
            const localProfiles = [
                (0, userDataProfile_1.$Gk)('1', '1', uri_1.URI.file('1'), uri_1.URI.file('cache')),
            ];
            const base = [
                { id: '1', name: '1', collection: '1' },
            ];
            const remoteProfiles = [
                { id: '1', name: '1', collection: '1' },
            ];
            const actual = (0, userDataProfilesManifestMerge_1.$G4b)(localProfiles, remoteProfiles, base, []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, []);
            assert.strictEqual(actual.remote, null);
        });
        test('merge when profile is removed locally, but not exists in remote', () => {
            const localProfiles = [
                (0, userDataProfile_1.$Gk)('1', '1', uri_1.URI.file('1'), uri_1.URI.file('cache')),
            ];
            const base = [
                { id: '1', name: '1', collection: '1' },
                { id: '2', name: '2', collection: '2' },
            ];
            const remoteProfiles = [
                { id: '1', name: '3', collection: '1' },
            ];
            const actual = (0, userDataProfilesManifestMerge_1.$G4b)(localProfiles, remoteProfiles, base, []);
            assert.deepStrictEqual(actual.local.added, []);
            assert.deepStrictEqual(actual.local.removed, []);
            assert.deepStrictEqual(actual.local.updated, remoteProfiles);
            assert.strictEqual(actual.remote, null);
        });
    });
});
//# sourceMappingURL=userDataProfilesManifestMerge.test.js.map