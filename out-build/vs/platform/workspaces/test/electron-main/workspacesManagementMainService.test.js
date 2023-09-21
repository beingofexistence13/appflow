/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "fs", "os", "vs/base/common/extpath", "vs/base/common/labels", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/uri", "vs/base/node/pfs", "vs/base/test/common/utils", "vs/base/test/node/testUtils", "vs/platform/environment/electron-main/environmentMainService", "vs/platform/environment/node/argv", "vs/platform/files/common/fileService", "vs/platform/log/common/log", "vs/platform/product/common/product", "vs/platform/state/node/stateService", "vs/platform/uriIdentity/common/uriIdentityService", "vs/platform/userDataProfile/electron-main/userDataProfile", "vs/platform/workspace/common/workspace", "vs/platform/workspaces/common/workspaces", "vs/platform/workspaces/electron-main/workspacesManagementMainService"], function (require, exports, assert, fs, os, extpath_1, labels_1, path, platform_1, resources_1, uri_1, pfs, utils_1, testUtils_1, environmentMainService_1, argv_1, fileService_1, log_1, product_1, stateService_1, uriIdentityService_1, userDataProfile_1, workspace_1, workspaces_1, workspacesManagementMainService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, testUtils_1.flakySuite)('WorkspacesManagementMainService', () => {
        class TestDialogMainService {
            pickFileFolder(options, window) { throw new Error('Method not implemented.'); }
            pickFolder(options, window) { throw new Error('Method not implemented.'); }
            pickFile(options, window) { throw new Error('Method not implemented.'); }
            pickWorkspace(options, window) { throw new Error('Method not implemented.'); }
            showMessageBox(options, window) { throw new Error('Method not implemented.'); }
            showSaveDialog(options, window) { throw new Error('Method not implemented.'); }
            showOpenDialog(options, window) { throw new Error('Method not implemented.'); }
        }
        class TestBackupMainService {
            isHotExitEnabled() { throw new Error('Method not implemented.'); }
            getEmptyWindowBackups() { throw new Error('Method not implemented.'); }
            registerWorkspaceBackup(workspaceInfo, migrateFrom) { throw new Error('Method not implemented.'); }
            registerFolderBackup(folder) { throw new Error('Method not implemented.'); }
            registerEmptyWindowBackup(empty) { throw new Error('Method not implemented.'); }
            async getDirtyWorkspaces() { return []; }
        }
        function createUntitledWorkspace(folders, names) {
            return service.createUntitledWorkspace(folders.map((folder, index) => ({ uri: uri_1.URI.file(folder), name: names ? names[index] : undefined })));
        }
        function createWorkspace(workspaceConfigPath, folders, names) {
            const ws = {
                folders: []
            };
            for (let i = 0; i < folders.length; i++) {
                const f = folders[i];
                const s = f instanceof uri_1.URI ? { uri: f.toString() } : { path: f };
                if (names) {
                    s.name = names[i];
                }
                ws.folders.push(s);
            }
            fs.writeFileSync(workspaceConfigPath, JSON.stringify(ws));
        }
        let testDir;
        let untitledWorkspacesHomePath;
        let environmentMainService;
        let service;
        const cwd = process.cwd();
        const tmpDir = os.tmpdir();
        setup(async () => {
            testDir = (0, testUtils_1.$oT)(tmpDir, 'vsctests', 'workspacesmanagementmainservice');
            untitledWorkspacesHomePath = path.$9d(testDir, 'Workspaces');
            const productService = { _serviceBrand: undefined, ...product_1.default };
            environmentMainService = new class TestEnvironmentService extends environmentMainService_1.$o5b {
                constructor() {
                    super((0, argv_1.$zl)(process.argv, argv_1.$yl), productService);
                }
                get untitledWorkspacesHome() {
                    return uri_1.URI.file(untitledWorkspacesHomePath);
                }
            };
            const logService = new log_1.$fj();
            const fileService = new fileService_1.$Dp(logService);
            service = new workspacesManagementMainService_1.$T5b(environmentMainService, logService, new userDataProfile_1.$w5b(new stateService_1.$hN(1 /* SaveStrategy.DELAYED */, environmentMainService, logService, fileService), new uriIdentityService_1.$pr(fileService), environmentMainService, fileService, logService), new TestBackupMainService(), new TestDialogMainService());
            return pfs.Promises.mkdir(untitledWorkspacesHomePath, { recursive: true });
        });
        teardown(() => {
            service.dispose();
            return pfs.Promises.rm(testDir);
        });
        function assertPathEquals(pathInWorkspaceFile, pathOnDisk) {
            if (platform_1.$i) {
                pathInWorkspaceFile = (0, labels_1.$fA)(pathInWorkspaceFile);
                pathOnDisk = (0, labels_1.$fA)(pathOnDisk);
                if (!(0, extpath_1.$Ff)(pathOnDisk)) {
                    pathOnDisk = (0, extpath_1.$Cf)(pathOnDisk); // workspace file is using slashes for all paths except where mandatory
                }
            }
            assert.strictEqual(pathInWorkspaceFile, pathOnDisk);
        }
        function assertEqualURI(u1, u2) {
            assert.strictEqual(u1.toString(), u2.toString());
        }
        test('createWorkspace (folders)', async () => {
            const workspace = await createUntitledWorkspace([cwd, tmpDir]);
            assert.ok(workspace);
            assert.ok(fs.existsSync(workspace.configPath.fsPath));
            assert.ok(service.isUntitledWorkspace(workspace));
            const ws = JSON.parse(fs.readFileSync(workspace.configPath.fsPath).toString());
            assert.strictEqual(ws.folders.length, 2);
            assertPathEquals(ws.folders[0].path, cwd);
            assertPathEquals(ws.folders[1].path, tmpDir);
            assert.ok(!ws.folders[0].name);
            assert.ok(!ws.folders[1].name);
        });
        test('createWorkspace (folders with name)', async () => {
            const workspace = await createUntitledWorkspace([cwd, tmpDir], ['currentworkingdirectory', 'tempdir']);
            assert.ok(workspace);
            assert.ok(fs.existsSync(workspace.configPath.fsPath));
            assert.ok(service.isUntitledWorkspace(workspace));
            const ws = JSON.parse(fs.readFileSync(workspace.configPath.fsPath).toString());
            assert.strictEqual(ws.folders.length, 2);
            assertPathEquals(ws.folders[0].path, cwd);
            assertPathEquals(ws.folders[1].path, tmpDir);
            assert.strictEqual(ws.folders[0].name, 'currentworkingdirectory');
            assert.strictEqual(ws.folders[1].name, 'tempdir');
        });
        test('createUntitledWorkspace (folders as other resource URIs)', async () => {
            const folder1URI = uri_1.URI.parse('myscheme://server/work/p/f1');
            const folder2URI = uri_1.URI.parse('myscheme://server/work/o/f3');
            const workspace = await service.createUntitledWorkspace([{ uri: folder1URI }, { uri: folder2URI }], 'server');
            assert.ok(workspace);
            assert.ok(fs.existsSync(workspace.configPath.fsPath));
            assert.ok(service.isUntitledWorkspace(workspace));
            const ws = JSON.parse(fs.readFileSync(workspace.configPath.fsPath).toString());
            assert.strictEqual(ws.folders.length, 2);
            assert.strictEqual(ws.folders[0].uri, folder1URI.toString(true));
            assert.strictEqual(ws.folders[1].uri, folder2URI.toString(true));
            assert.ok(!ws.folders[0].name);
            assert.ok(!ws.folders[1].name);
            assert.strictEqual(ws.remoteAuthority, 'server');
        });
        test('resolveWorkspace', async () => {
            const workspace = await createUntitledWorkspace([cwd, tmpDir]);
            assert.ok(await service.resolveLocalWorkspace(workspace.configPath));
            // make it a valid workspace path
            const newPath = path.$9d(path.$_d(workspace.configPath.fsPath), `workspace.${workspace_1.$Xh}`);
            fs.renameSync(workspace.configPath.fsPath, newPath);
            workspace.configPath = uri_1.URI.file(newPath);
            const resolved = await service.resolveLocalWorkspace(workspace.configPath);
            assert.strictEqual(2, resolved.folders.length);
            assertEqualURI(resolved.configPath, workspace.configPath);
            assert.ok(resolved.id);
            fs.writeFileSync(workspace.configPath.fsPath, JSON.stringify({ something: 'something' })); // invalid workspace
            const resolvedInvalid = await service.resolveLocalWorkspace(workspace.configPath);
            assert.ok(!resolvedInvalid);
            fs.writeFileSync(workspace.configPath.fsPath, JSON.stringify({ transient: true, folders: [] })); // transient worksapce
            const resolvedTransient = await service.resolveLocalWorkspace(workspace.configPath);
            assert.ok(resolvedTransient?.transient);
        });
        test('resolveWorkspace (support relative paths)', async () => {
            const workspace = await createUntitledWorkspace([cwd, tmpDir]);
            fs.writeFileSync(workspace.configPath.fsPath, JSON.stringify({ folders: [{ path: './ticino-playground/lib' }] }));
            const resolved = await service.resolveLocalWorkspace(workspace.configPath);
            assertEqualURI(resolved.folders[0].uri, uri_1.URI.file(path.$9d(path.$_d(workspace.configPath.fsPath), 'ticino-playground', 'lib')));
        });
        test('resolveWorkspace (support relative paths #2)', async () => {
            const workspace = await createUntitledWorkspace([cwd, tmpDir]);
            fs.writeFileSync(workspace.configPath.fsPath, JSON.stringify({ folders: [{ path: './ticino-playground/lib/../other' }] }));
            const resolved = await service.resolveLocalWorkspace(workspace.configPath);
            assertEqualURI(resolved.folders[0].uri, uri_1.URI.file(path.$9d(path.$_d(workspace.configPath.fsPath), 'ticino-playground', 'other')));
        });
        test('resolveWorkspace (support relative paths #3)', async () => {
            const workspace = await createUntitledWorkspace([cwd, tmpDir]);
            fs.writeFileSync(workspace.configPath.fsPath, JSON.stringify({ folders: [{ path: 'ticino-playground/lib' }] }));
            const resolved = await service.resolveLocalWorkspace(workspace.configPath);
            assertEqualURI(resolved.folders[0].uri, uri_1.URI.file(path.$9d(path.$_d(workspace.configPath.fsPath), 'ticino-playground', 'lib')));
        });
        test('resolveWorkspace (support invalid JSON via fault tolerant parsing)', async () => {
            const workspace = await createUntitledWorkspace([cwd, tmpDir]);
            fs.writeFileSync(workspace.configPath.fsPath, '{ "folders": [ { "path": "./ticino-playground/lib" } , ] }'); // trailing comma
            const resolved = await service.resolveLocalWorkspace(workspace.configPath);
            assertEqualURI(resolved.folders[0].uri, uri_1.URI.file(path.$9d(path.$_d(workspace.configPath.fsPath), 'ticino-playground', 'lib')));
        });
        test('rewriteWorkspaceFileForNewLocation', async () => {
            const folder1 = cwd; // absolute path because outside of tmpDir
            const tmpInsideDir = path.$9d(tmpDir, 'inside');
            const firstConfigPath = path.$9d(tmpDir, 'myworkspace0.code-workspace');
            createWorkspace(firstConfigPath, [folder1, 'inside', path.$9d('inside', 'somefolder')]);
            const origContent = fs.readFileSync(firstConfigPath).toString();
            let origConfigPath = uri_1.URI.file(firstConfigPath);
            let workspaceConfigPath = uri_1.URI.file(path.$9d(tmpDir, 'inside', 'myworkspace1.code-workspace'));
            let newContent = (0, workspaces_1.$mU)(origContent, origConfigPath, false, workspaceConfigPath, resources_1.$_f);
            let ws = JSON.parse(newContent);
            assert.strictEqual(ws.folders.length, 3);
            assertPathEquals(ws.folders[0].path, folder1); // absolute path because outside of tmpdir
            assertPathEquals(ws.folders[1].path, '.');
            assertPathEquals(ws.folders[2].path, 'somefolder');
            origConfigPath = workspaceConfigPath;
            workspaceConfigPath = uri_1.URI.file(path.$9d(tmpDir, 'myworkspace2.code-workspace'));
            newContent = (0, workspaces_1.$mU)(newContent, origConfigPath, false, workspaceConfigPath, resources_1.$_f);
            ws = JSON.parse(newContent);
            assert.strictEqual(ws.folders.length, 3);
            assertPathEquals(ws.folders[0].path, folder1);
            assertPathEquals(ws.folders[1].path, 'inside');
            assertPathEquals(ws.folders[2].path, 'inside/somefolder');
            origConfigPath = workspaceConfigPath;
            workspaceConfigPath = uri_1.URI.file(path.$9d(tmpDir, 'other', 'myworkspace2.code-workspace'));
            newContent = (0, workspaces_1.$mU)(newContent, origConfigPath, false, workspaceConfigPath, resources_1.$_f);
            ws = JSON.parse(newContent);
            assert.strictEqual(ws.folders.length, 3);
            assertPathEquals(ws.folders[0].path, folder1);
            assertPathEquals(ws.folders[1].path, '../inside');
            assertPathEquals(ws.folders[2].path, '../inside/somefolder');
            origConfigPath = workspaceConfigPath;
            workspaceConfigPath = uri_1.URI.parse('foo://foo/bar/myworkspace2.code-workspace');
            newContent = (0, workspaces_1.$mU)(newContent, origConfigPath, false, workspaceConfigPath, resources_1.$_f);
            ws = JSON.parse(newContent);
            assert.strictEqual(ws.folders.length, 3);
            assert.strictEqual(ws.folders[0].uri, uri_1.URI.file(folder1).toString(true));
            assert.strictEqual(ws.folders[1].uri, uri_1.URI.file(tmpInsideDir).toString(true));
            assert.strictEqual(ws.folders[2].uri, uri_1.URI.file(path.$9d(tmpInsideDir, 'somefolder')).toString(true));
            fs.unlinkSync(firstConfigPath);
        });
        test('rewriteWorkspaceFileForNewLocation (preserves comments)', async () => {
            const workspace = await createUntitledWorkspace([cwd, tmpDir, path.$9d(tmpDir, 'somefolder')]);
            const workspaceConfigPath = uri_1.URI.file(path.$9d(tmpDir, `myworkspace.${Date.now()}.${workspace_1.$Xh}`));
            let origContent = fs.readFileSync(workspace.configPath.fsPath).toString();
            origContent = `// this is a comment\n${origContent}`;
            const newContent = (0, workspaces_1.$mU)(origContent, workspace.configPath, false, workspaceConfigPath, resources_1.$_f);
            assert.strictEqual(0, newContent.indexOf('// this is a comment'));
            await service.deleteUntitledWorkspace(workspace);
        });
        test('rewriteWorkspaceFileForNewLocation (preserves forward slashes)', async () => {
            const workspace = await createUntitledWorkspace([cwd, tmpDir, path.$9d(tmpDir, 'somefolder')]);
            const workspaceConfigPath = uri_1.URI.file(path.$9d(tmpDir, `myworkspace.${Date.now()}.${workspace_1.$Xh}`));
            let origContent = fs.readFileSync(workspace.configPath.fsPath).toString();
            origContent = origContent.replace(/[\\]/g, '/'); // convert backslash to slash
            const newContent = (0, workspaces_1.$mU)(origContent, workspace.configPath, false, workspaceConfigPath, resources_1.$_f);
            const ws = JSON.parse(newContent);
            assert.ok(ws.folders.every(f => f.path.indexOf('\\') < 0));
            await service.deleteUntitledWorkspace(workspace);
        });
        (!platform_1.$i ? test.skip : test)('rewriteWorkspaceFileForNewLocation (unc paths)', async () => {
            const workspaceLocation = path.$9d(tmpDir, 'wsloc');
            const folder1Location = 'x:\\foo';
            const folder2Location = '\\\\server\\share2\\some\\path';
            const folder3Location = path.$9d(workspaceLocation, 'inner', 'more');
            const workspace = await createUntitledWorkspace([folder1Location, folder2Location, folder3Location]);
            const workspaceConfigPath = uri_1.URI.file(path.$9d(workspaceLocation, `myworkspace.${Date.now()}.${workspace_1.$Xh}`));
            const origContent = fs.readFileSync(workspace.configPath.fsPath).toString();
            const newContent = (0, workspaces_1.$mU)(origContent, workspace.configPath, true, workspaceConfigPath, resources_1.$_f);
            const ws = JSON.parse(newContent);
            assertPathEquals(ws.folders[0].path, folder1Location);
            assertPathEquals(ws.folders[1].path, folder2Location);
            assertPathEquals(ws.folders[2].path, 'inner/more');
            await service.deleteUntitledWorkspace(workspace);
        });
        test('deleteUntitledWorkspace (untitled)', async () => {
            const workspace = await createUntitledWorkspace([cwd, tmpDir]);
            assert.ok(fs.existsSync(workspace.configPath.fsPath));
            await service.deleteUntitledWorkspace(workspace);
            assert.ok(!fs.existsSync(workspace.configPath.fsPath));
        });
        test('deleteUntitledWorkspace (saved)', async () => {
            const workspace = await createUntitledWorkspace([cwd, tmpDir]);
            await service.deleteUntitledWorkspace(workspace);
        });
        test('getUntitledWorkspace', async function () {
            await service.initialize();
            let untitled = service.getUntitledWorkspaces();
            assert.strictEqual(untitled.length, 0);
            const untitledOne = await createUntitledWorkspace([cwd, tmpDir]);
            assert.ok(fs.existsSync(untitledOne.configPath.fsPath));
            await service.initialize();
            untitled = service.getUntitledWorkspaces();
            assert.strictEqual(1, untitled.length);
            assert.strictEqual(untitledOne.id, untitled[0].workspace.id);
            await service.deleteUntitledWorkspace(untitledOne);
            await service.initialize();
            untitled = service.getUntitledWorkspaces();
            assert.strictEqual(0, untitled.length);
        });
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=workspacesManagementMainService.test.js.map