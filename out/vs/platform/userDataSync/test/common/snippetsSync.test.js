/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/buffer", "vs/base/common/resources", "vs/base/test/common/utils", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/userDataSync/common/userDataSync", "vs/platform/userDataSync/test/common/userDataSyncClient"], function (require, exports, assert, buffer_1, resources_1, utils_1, environment_1, files_1, userDataProfile_1, userDataSync_1, userDataSyncClient_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tsSnippet1 = `{

	// Place your snippets for TypeScript here. Each snippet is defined under a snippet name and has a prefix, body and
	// description. The prefix is what is used to trigger the snippet and the body will be expanded and inserted. Possible variables are:
	// $1, $2 for tab stops, $0 for the final cursor position, Placeholders with the
	// same ids are connected.
	"Print to console": {
	// Example:
	"prefix": "log",
		"body": [
			"console.log('$1');",
			"$2"
		],
			"description": "Log output to console",
	}

}`;
    const tsSnippet2 = `{

	// Place your snippets for TypeScript here. Each snippet is defined under a snippet name and has a prefix, body and
	// description. The prefix is what is used to trigger the snippet and the body will be expanded and inserted. Possible variables are:
	// $1, $2 for tab stops, $0 for the final cursor position, Placeholders with the
	// same ids are connected.
	"Print to console": {
	// Example:
	"prefix": "log",
		"body": [
			"console.log('$1');",
			"$2"
		],
			"description": "Log output to console always",
	}

}`;
    const htmlSnippet1 = `{
/*
	// Place your snippets for HTML here. Each snippet is defined under a snippet name and has a prefix, body and
	// description. The prefix is what is used to trigger the snippet and the body will be expanded and inserted.
	// Example:
	"Print to console": {
	"prefix": "log",
		"body": [
			"console.log('$1');",
			"$2"
		],
			"description": "Log output to console"
	}
*/
"Div": {
	"prefix": "div",
		"body": [
			"<div>",
			"",
			"</div>"
		],
			"description": "New div"
	}
}`;
    const htmlSnippet2 = `{
/*
	// Place your snippets for HTML here. Each snippet is defined under a snippet name and has a prefix, body and
	// description. The prefix is what is used to trigger the snippet and the body will be expanded and inserted.
	// Example:
	"Print to console": {
	"prefix": "log",
		"body": [
			"console.log('$1');",
			"$2"
		],
			"description": "Log output to console"
	}
*/
"Div": {
	"prefix": "div",
		"body": [
			"<div>",
			"",
			"</div>"
		],
			"description": "New div changed"
	}
}`;
    const htmlSnippet3 = `{
/*
	// Place your snippets for HTML here. Each snippet is defined under a snippet name and has a prefix, body and
	// description. The prefix is what is used to trigger the snippet and the body will be expanded and inserted.
	// Example:
	"Print to console": {
	"prefix": "log",
		"body": [
			"console.log('$1');",
			"$2"
		],
			"description": "Log output to console"
	}
*/
"Div": {
	"prefix": "div",
		"body": [
			"<div>",
			"",
			"</div>"
		],
			"description": "New div changed again"
	}
}`;
    const globalSnippet = `{
	// Place your global snippets here. Each snippet is defined under a snippet name and has a scope, prefix, body and
	// description. Add comma separated ids of the languages where the snippet is applicable in the scope field. If scope
	// is left empty or omitted, the snippet gets applied to all languages. The prefix is what is
	// used to trigger the snippet and the body will be expanded and inserted. Possible variables are:
	// $1, $2 for tab stops, $0 for the final cursor position, and {1: label}, { 2: another } for placeholders.
	// Placeholders with the same ids are connected.
	// Example:
	// "Print to console": {
	// 	"scope": "javascript,typescript",
	// 	"prefix": "log",
	// 	"body": [
	// 		"console.log('$1');",
	// 		"$2"
	// 	],
	// 	"description": "Log output to console"
	// }
}`;
    suite('SnippetsSync', () => {
        const server = new userDataSyncClient_1.UserDataSyncTestServer();
        let testClient;
        let client2;
        let testObject;
        teardown(async () => {
            await testClient.instantiationService.get(userDataSync_1.IUserDataSyncStoreService).clear();
        });
        const disposableStore = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        setup(async () => {
            testClient = disposableStore.add(new userDataSyncClient_1.UserDataSyncClient(server));
            await testClient.setUp(true);
            testObject = testClient.getSynchronizer("snippets" /* SyncResource.Snippets */);
            client2 = disposableStore.add(new userDataSyncClient_1.UserDataSyncClient(server));
            await client2.setUp(true);
        });
        test('when snippets does not exist', async () => {
            const fileService = testClient.instantiationService.get(files_1.IFileService);
            const snippetsResource = testClient.instantiationService.get(userDataProfile_1.IUserDataProfilesService).defaultProfile.snippetsHome;
            assert.deepStrictEqual(await testObject.getLastSyncUserData(), null);
            let manifest = await testClient.getResourceManifest();
            server.reset();
            await testObject.sync(manifest);
            assert.deepStrictEqual(server.requests, [
                { type: 'GET', url: `${server.url}/v1/resource/${testObject.resource}/latest`, headers: {} },
            ]);
            assert.ok(!await fileService.exists(snippetsResource));
            const lastSyncUserData = await testObject.getLastSyncUserData();
            const remoteUserData = await testObject.getRemoteUserData(null);
            assert.deepStrictEqual(lastSyncUserData.ref, remoteUserData.ref);
            assert.deepStrictEqual(lastSyncUserData.syncData, remoteUserData.syncData);
            assert.strictEqual(lastSyncUserData.syncData, null);
            manifest = await testClient.getResourceManifest();
            server.reset();
            await testObject.sync(manifest);
            assert.deepStrictEqual(server.requests, []);
            manifest = await testClient.getResourceManifest();
            server.reset();
            await testObject.sync(manifest);
            assert.deepStrictEqual(server.requests, []);
        });
        test('when snippet is created after first sync', async () => {
            await testObject.sync(await testClient.getResourceManifest());
            await updateSnippet('html.json', htmlSnippet1, testClient);
            let lastSyncUserData = await testObject.getLastSyncUserData();
            const manifest = await testClient.getResourceManifest();
            server.reset();
            await testObject.sync(manifest);
            assert.deepStrictEqual(server.requests, [
                { type: 'POST', url: `${server.url}/v1/resource/${testObject.resource}`, headers: { 'If-Match': lastSyncUserData?.ref } },
            ]);
            lastSyncUserData = await testObject.getLastSyncUserData();
            const remoteUserData = await testObject.getRemoteUserData(null);
            assert.deepStrictEqual(lastSyncUserData.ref, remoteUserData.ref);
            assert.deepStrictEqual(lastSyncUserData.syncData, remoteUserData.syncData);
            assert.deepStrictEqual(lastSyncUserData.syncData.content, JSON.stringify({ 'html.json': htmlSnippet1 }));
        });
        test('first time sync - outgoing to server (no snippets)', async () => {
            await updateSnippet('html.json', htmlSnippet1, testClient);
            await updateSnippet('typescript.json', tsSnippet1, testClient);
            await testObject.sync(await testClient.getResourceManifest());
            assert.strictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            assert.deepStrictEqual(testObject.conflicts.conflicts, []);
            const { content } = await testClient.read(testObject.resource);
            assert.ok(content !== null);
            const actual = parseSnippets(content);
            assert.deepStrictEqual(actual, { 'html.json': htmlSnippet1, 'typescript.json': tsSnippet1 });
        });
        test('first time sync - incoming from server (no snippets)', async () => {
            await updateSnippet('html.json', htmlSnippet1, client2);
            await updateSnippet('typescript.json', tsSnippet1, client2);
            await client2.sync();
            await testObject.sync(await testClient.getResourceManifest());
            assert.strictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            assert.deepStrictEqual(testObject.conflicts.conflicts, []);
            const actual1 = await readSnippet('html.json', testClient);
            assert.strictEqual(actual1, htmlSnippet1);
            const actual2 = await readSnippet('typescript.json', testClient);
            assert.strictEqual(actual2, tsSnippet1);
        });
        test('first time sync when snippets exists', async () => {
            await updateSnippet('html.json', htmlSnippet1, client2);
            await client2.sync();
            await updateSnippet('typescript.json', tsSnippet1, testClient);
            await testObject.sync(await testClient.getResourceManifest());
            assert.strictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            assert.deepStrictEqual(testObject.conflicts.conflicts, []);
            const actual1 = await readSnippet('html.json', testClient);
            assert.strictEqual(actual1, htmlSnippet1);
            const actual2 = await readSnippet('typescript.json', testClient);
            assert.strictEqual(actual2, tsSnippet1);
            const { content } = await testClient.read(testObject.resource);
            assert.ok(content !== null);
            const actual = parseSnippets(content);
            assert.deepStrictEqual(actual, { 'html.json': htmlSnippet1, 'typescript.json': tsSnippet1 });
        });
        test('first time sync when snippets exists - has conflicts', async () => {
            await updateSnippet('html.json', htmlSnippet1, client2);
            await client2.sync();
            await updateSnippet('html.json', htmlSnippet2, testClient);
            await testObject.sync(await testClient.getResourceManifest());
            assert.strictEqual(testObject.status, "hasConflicts" /* SyncStatus.HasConflicts */);
            const environmentService = testClient.instantiationService.get(environment_1.IEnvironmentService);
            const local = (0, resources_1.joinPath)(environmentService.userDataSyncHome, testObject.resource, userDataSync_1.PREVIEW_DIR_NAME, 'html.json');
            assertPreviews(testObject.conflicts.conflicts, [local]);
        });
        test('first time sync when snippets exists - has conflicts and accept conflicts', async () => {
            await updateSnippet('html.json', htmlSnippet1, client2);
            await client2.sync();
            await updateSnippet('html.json', htmlSnippet2, testClient);
            await testObject.sync(await testClient.getResourceManifest());
            const conflicts = testObject.conflicts.conflicts;
            await testObject.accept(conflicts[0].previewResource, htmlSnippet1);
            await testObject.apply(false);
            assert.strictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            assert.deepStrictEqual(testObject.conflicts.conflicts, []);
            const actual1 = await readSnippet('html.json', testClient);
            assert.strictEqual(actual1, htmlSnippet1);
            const { content } = await testClient.read(testObject.resource);
            assert.ok(content !== null);
            const actual = parseSnippets(content);
            assert.deepStrictEqual(actual, { 'html.json': htmlSnippet1 });
        });
        test('first time sync when snippets exists - has multiple conflicts', async () => {
            await updateSnippet('html.json', htmlSnippet1, client2);
            await updateSnippet('typescript.json', tsSnippet1, client2);
            await client2.sync();
            await updateSnippet('html.json', htmlSnippet2, testClient);
            await updateSnippet('typescript.json', tsSnippet2, testClient);
            await testObject.sync(await testClient.getResourceManifest());
            assert.strictEqual(testObject.status, "hasConflicts" /* SyncStatus.HasConflicts */);
            const environmentService = testClient.instantiationService.get(environment_1.IEnvironmentService);
            const local1 = (0, resources_1.joinPath)(environmentService.userDataSyncHome, testObject.resource, userDataSync_1.PREVIEW_DIR_NAME, 'html.json');
            const local2 = (0, resources_1.joinPath)(environmentService.userDataSyncHome, testObject.resource, userDataSync_1.PREVIEW_DIR_NAME, 'typescript.json');
            assertPreviews(testObject.conflicts.conflicts, [local1, local2]);
        });
        test('first time sync when snippets exists - has multiple conflicts and accept one conflict', async () => {
            await updateSnippet('html.json', htmlSnippet1, client2);
            await updateSnippet('typescript.json', tsSnippet1, client2);
            await client2.sync();
            await updateSnippet('html.json', htmlSnippet2, testClient);
            await updateSnippet('typescript.json', tsSnippet2, testClient);
            await testObject.sync(await testClient.getResourceManifest());
            let conflicts = testObject.conflicts.conflicts;
            await testObject.accept(conflicts[0].previewResource, htmlSnippet2);
            conflicts = testObject.conflicts.conflicts;
            assert.strictEqual(testObject.status, "hasConflicts" /* SyncStatus.HasConflicts */);
            const environmentService = testClient.instantiationService.get(environment_1.IEnvironmentService);
            const local = (0, resources_1.joinPath)(environmentService.userDataSyncHome, testObject.resource, userDataSync_1.PREVIEW_DIR_NAME, 'typescript.json');
            assertPreviews(testObject.conflicts.conflicts, [local]);
        });
        test('first time sync when snippets exists - has multiple conflicts and accept all conflicts', async () => {
            await updateSnippet('html.json', htmlSnippet1, client2);
            await updateSnippet('typescript.json', tsSnippet1, client2);
            await client2.sync();
            await updateSnippet('html.json', htmlSnippet2, testClient);
            await updateSnippet('typescript.json', tsSnippet2, testClient);
            await testObject.sync(await testClient.getResourceManifest());
            const conflicts = testObject.conflicts.conflicts;
            await testObject.accept(conflicts[0].previewResource, htmlSnippet2);
            await testObject.accept(conflicts[1].previewResource, tsSnippet1);
            await testObject.apply(false);
            assert.strictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            assert.deepStrictEqual(testObject.conflicts.conflicts, []);
            const actual1 = await readSnippet('html.json', testClient);
            assert.strictEqual(actual1, htmlSnippet2);
            const actual2 = await readSnippet('typescript.json', testClient);
            assert.strictEqual(actual2, tsSnippet1);
            const { content } = await testClient.read(testObject.resource);
            assert.ok(content !== null);
            const actual = parseSnippets(content);
            assert.deepStrictEqual(actual, { 'html.json': htmlSnippet2, 'typescript.json': tsSnippet1 });
        });
        test('sync adding a snippet', async () => {
            await updateSnippet('html.json', htmlSnippet1, testClient);
            await testObject.sync(await testClient.getResourceManifest());
            await updateSnippet('typescript.json', tsSnippet1, testClient);
            await testObject.sync(await testClient.getResourceManifest());
            assert.strictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            assert.deepStrictEqual(testObject.conflicts.conflicts, []);
            const actual1 = await readSnippet('html.json', testClient);
            assert.strictEqual(actual1, htmlSnippet1);
            const actual2 = await readSnippet('typescript.json', testClient);
            assert.strictEqual(actual2, tsSnippet1);
            const { content } = await testClient.read(testObject.resource);
            assert.ok(content !== null);
            const actual = parseSnippets(content);
            assert.deepStrictEqual(actual, { 'html.json': htmlSnippet1, 'typescript.json': tsSnippet1 });
        });
        test('sync adding a snippet - accept', async () => {
            await updateSnippet('html.json', htmlSnippet1, client2);
            await client2.sync();
            await testObject.sync(await testClient.getResourceManifest());
            await updateSnippet('typescript.json', tsSnippet1, client2);
            await client2.sync();
            await testObject.sync(await testClient.getResourceManifest());
            assert.strictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            assert.deepStrictEqual(testObject.conflicts.conflicts, []);
            const actual1 = await readSnippet('html.json', testClient);
            assert.strictEqual(actual1, htmlSnippet1);
            const actual2 = await readSnippet('typescript.json', testClient);
            assert.strictEqual(actual2, tsSnippet1);
        });
        test('sync updating a snippet', async () => {
            await updateSnippet('html.json', htmlSnippet1, testClient);
            await testObject.sync(await testClient.getResourceManifest());
            await updateSnippet('html.json', htmlSnippet2, testClient);
            await testObject.sync(await testClient.getResourceManifest());
            assert.strictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            assert.deepStrictEqual(testObject.conflicts.conflicts, []);
            const actual1 = await readSnippet('html.json', testClient);
            assert.strictEqual(actual1, htmlSnippet2);
            const { content } = await testClient.read(testObject.resource);
            assert.ok(content !== null);
            const actual = parseSnippets(content);
            assert.deepStrictEqual(actual, { 'html.json': htmlSnippet2 });
        });
        test('sync updating a snippet - accept', async () => {
            await updateSnippet('html.json', htmlSnippet1, client2);
            await client2.sync();
            await testObject.sync(await testClient.getResourceManifest());
            await updateSnippet('html.json', htmlSnippet2, client2);
            await client2.sync();
            await testObject.sync(await testClient.getResourceManifest());
            assert.strictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            assert.deepStrictEqual(testObject.conflicts.conflicts, []);
            const actual1 = await readSnippet('html.json', testClient);
            assert.strictEqual(actual1, htmlSnippet2);
        });
        test('sync updating a snippet - conflict', async () => {
            await updateSnippet('html.json', htmlSnippet1, client2);
            await client2.sync();
            await testObject.sync(await testClient.getResourceManifest());
            await updateSnippet('html.json', htmlSnippet2, client2);
            await client2.sync();
            await updateSnippet('html.json', htmlSnippet3, testClient);
            await testObject.sync(await testClient.getResourceManifest());
            assert.strictEqual(testObject.status, "hasConflicts" /* SyncStatus.HasConflicts */);
            const environmentService = testClient.instantiationService.get(environment_1.IEnvironmentService);
            const local = (0, resources_1.joinPath)(environmentService.userDataSyncHome, testObject.resource, userDataSync_1.PREVIEW_DIR_NAME, 'html.json');
            assertPreviews(testObject.conflicts.conflicts, [local]);
        });
        test('sync updating a snippet - resolve conflict', async () => {
            await updateSnippet('html.json', htmlSnippet1, client2);
            await client2.sync();
            await testObject.sync(await testClient.getResourceManifest());
            await updateSnippet('html.json', htmlSnippet2, client2);
            await client2.sync();
            await updateSnippet('html.json', htmlSnippet3, testClient);
            await testObject.sync(await testClient.getResourceManifest());
            await testObject.accept(testObject.conflicts.conflicts[0].previewResource, htmlSnippet2);
            await testObject.apply(false);
            assert.strictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            assert.deepStrictEqual(testObject.conflicts.conflicts, []);
            const actual1 = await readSnippet('html.json', testClient);
            assert.strictEqual(actual1, htmlSnippet2);
            const { content } = await testClient.read(testObject.resource);
            assert.ok(content !== null);
            const actual = parseSnippets(content);
            assert.deepStrictEqual(actual, { 'html.json': htmlSnippet2 });
        });
        test('sync removing a snippet', async () => {
            await updateSnippet('html.json', htmlSnippet1, testClient);
            await updateSnippet('typescript.json', tsSnippet1, testClient);
            await testObject.sync(await testClient.getResourceManifest());
            await removeSnippet('html.json', testClient);
            await testObject.sync(await testClient.getResourceManifest());
            assert.strictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            assert.deepStrictEqual(testObject.conflicts.conflicts, []);
            const actual1 = await readSnippet('typescript.json', testClient);
            assert.strictEqual(actual1, tsSnippet1);
            const actual2 = await readSnippet('html.json', testClient);
            assert.strictEqual(actual2, null);
            const { content } = await testClient.read(testObject.resource);
            assert.ok(content !== null);
            const actual = parseSnippets(content);
            assert.deepStrictEqual(actual, { 'typescript.json': tsSnippet1 });
        });
        test('sync removing a snippet - accept', async () => {
            await updateSnippet('html.json', htmlSnippet1, client2);
            await updateSnippet('typescript.json', tsSnippet1, client2);
            await client2.sync();
            await testObject.sync(await testClient.getResourceManifest());
            await removeSnippet('html.json', client2);
            await client2.sync();
            await testObject.sync(await testClient.getResourceManifest());
            assert.strictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            assert.deepStrictEqual(testObject.conflicts.conflicts, []);
            const actual1 = await readSnippet('typescript.json', testClient);
            assert.strictEqual(actual1, tsSnippet1);
            const actual2 = await readSnippet('html.json', testClient);
            assert.strictEqual(actual2, null);
        });
        test('sync removing a snippet locally and updating it remotely', async () => {
            await updateSnippet('html.json', htmlSnippet1, client2);
            await updateSnippet('typescript.json', tsSnippet1, client2);
            await client2.sync();
            await testObject.sync(await testClient.getResourceManifest());
            await updateSnippet('html.json', htmlSnippet2, client2);
            await client2.sync();
            await removeSnippet('html.json', testClient);
            await testObject.sync(await testClient.getResourceManifest());
            assert.strictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            assert.deepStrictEqual(testObject.conflicts.conflicts, []);
            const actual1 = await readSnippet('typescript.json', testClient);
            assert.strictEqual(actual1, tsSnippet1);
            const actual2 = await readSnippet('html.json', testClient);
            assert.strictEqual(actual2, htmlSnippet2);
        });
        test('sync removing a snippet - conflict', async () => {
            await updateSnippet('html.json', htmlSnippet1, client2);
            await updateSnippet('typescript.json', tsSnippet1, client2);
            await client2.sync();
            await testObject.sync(await testClient.getResourceManifest());
            await removeSnippet('html.json', client2);
            await client2.sync();
            await updateSnippet('html.json', htmlSnippet2, testClient);
            await testObject.sync(await testClient.getResourceManifest());
            assert.strictEqual(testObject.status, "hasConflicts" /* SyncStatus.HasConflicts */);
            const environmentService = testClient.instantiationService.get(environment_1.IEnvironmentService);
            const local = (0, resources_1.joinPath)(environmentService.userDataSyncHome, testObject.resource, userDataSync_1.PREVIEW_DIR_NAME, 'html.json');
            assertPreviews(testObject.conflicts.conflicts, [local]);
        });
        test('sync removing a snippet - resolve conflict', async () => {
            await updateSnippet('html.json', htmlSnippet1, client2);
            await updateSnippet('typescript.json', tsSnippet1, client2);
            await client2.sync();
            await testObject.sync(await testClient.getResourceManifest());
            await removeSnippet('html.json', client2);
            await client2.sync();
            await updateSnippet('html.json', htmlSnippet2, testClient);
            await testObject.sync(await testClient.getResourceManifest());
            await testObject.accept(testObject.conflicts.conflicts[0].previewResource, htmlSnippet3);
            await testObject.apply(false);
            assert.strictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            assert.deepStrictEqual(testObject.conflicts.conflicts, []);
            const actual1 = await readSnippet('typescript.json', testClient);
            assert.strictEqual(actual1, tsSnippet1);
            const actual2 = await readSnippet('html.json', testClient);
            assert.strictEqual(actual2, htmlSnippet3);
            const { content } = await testClient.read(testObject.resource);
            assert.ok(content !== null);
            const actual = parseSnippets(content);
            assert.deepStrictEqual(actual, { 'typescript.json': tsSnippet1, 'html.json': htmlSnippet3 });
        });
        test('sync removing a snippet - resolve conflict by removing', async () => {
            await updateSnippet('html.json', htmlSnippet1, client2);
            await updateSnippet('typescript.json', tsSnippet1, client2);
            await client2.sync();
            await testObject.sync(await testClient.getResourceManifest());
            await removeSnippet('html.json', client2);
            await client2.sync();
            await updateSnippet('html.json', htmlSnippet2, testClient);
            await testObject.sync(await testClient.getResourceManifest());
            await testObject.accept(testObject.conflicts.conflicts[0].previewResource, null);
            await testObject.apply(false);
            assert.strictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            assert.deepStrictEqual(testObject.conflicts.conflicts, []);
            const actual1 = await readSnippet('typescript.json', testClient);
            assert.strictEqual(actual1, tsSnippet1);
            const actual2 = await readSnippet('html.json', testClient);
            assert.strictEqual(actual2, null);
            const { content } = await testClient.read(testObject.resource);
            assert.ok(content !== null);
            const actual = parseSnippets(content);
            assert.deepStrictEqual(actual, { 'typescript.json': tsSnippet1 });
        });
        test('sync global and language snippet', async () => {
            await updateSnippet('global.code-snippets', globalSnippet, client2);
            await updateSnippet('html.json', htmlSnippet1, client2);
            await client2.sync();
            await testObject.sync(await testClient.getResourceManifest());
            assert.strictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            assert.deepStrictEqual(testObject.conflicts.conflicts, []);
            const actual1 = await readSnippet('html.json', testClient);
            assert.strictEqual(actual1, htmlSnippet1);
            const actual2 = await readSnippet('global.code-snippets', testClient);
            assert.strictEqual(actual2, globalSnippet);
            const { content } = await testClient.read(testObject.resource);
            assert.ok(content !== null);
            const actual = parseSnippets(content);
            assert.deepStrictEqual(actual, { 'html.json': htmlSnippet1, 'global.code-snippets': globalSnippet });
        });
        test('sync should ignore non snippets', async () => {
            await updateSnippet('global.code-snippets', globalSnippet, client2);
            await updateSnippet('html.html', htmlSnippet1, client2);
            await updateSnippet('typescript.json', tsSnippet1, client2);
            await client2.sync();
            await testObject.sync(await testClient.getResourceManifest());
            assert.strictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            assert.deepStrictEqual(testObject.conflicts.conflicts, []);
            const actual1 = await readSnippet('typescript.json', testClient);
            assert.strictEqual(actual1, tsSnippet1);
            const actual2 = await readSnippet('global.code-snippets', testClient);
            assert.strictEqual(actual2, globalSnippet);
            const actual3 = await readSnippet('html.html', testClient);
            assert.strictEqual(actual3, null);
            const { content } = await testClient.read(testObject.resource);
            assert.ok(content !== null);
            const actual = parseSnippets(content);
            assert.deepStrictEqual(actual, { 'typescript.json': tsSnippet1, 'global.code-snippets': globalSnippet });
        });
        test('previews are reset after all conflicts resolved', async () => {
            await updateSnippet('html.json', htmlSnippet1, client2);
            await updateSnippet('typescript.json', tsSnippet1, client2);
            await client2.sync();
            await updateSnippet('html.json', htmlSnippet2, testClient);
            await testObject.sync(await testClient.getResourceManifest());
            const conflicts = testObject.conflicts.conflicts;
            await testObject.accept(conflicts[0].previewResource, htmlSnippet2);
            await testObject.apply(false);
            const fileService = testClient.instantiationService.get(files_1.IFileService);
            assert.ok(!await fileService.exists((0, resources_1.dirname)(conflicts[0].previewResource)));
        });
        test('merge when there are multiple snippets and only one snippet is merged', async () => {
            const environmentService = testClient.instantiationService.get(environment_1.IEnvironmentService);
            await updateSnippet('html.json', htmlSnippet2, testClient);
            await updateSnippet('typescript.json', tsSnippet2, testClient);
            let preview = await testObject.preview(await testClient.getResourceManifest(), {});
            assert.strictEqual(testObject.status, "syncing" /* SyncStatus.Syncing */);
            assertPreviews(preview.resourcePreviews, [
                (0, resources_1.joinPath)(environmentService.userDataSyncHome, testObject.resource, userDataSync_1.PREVIEW_DIR_NAME, 'html.json'),
                (0, resources_1.joinPath)(environmentService.userDataSyncHome, testObject.resource, userDataSync_1.PREVIEW_DIR_NAME, 'typescript.json'),
            ]);
            assert.deepStrictEqual(testObject.conflicts.conflicts, []);
            preview = await testObject.merge(preview.resourcePreviews[0].localResource);
            assert.strictEqual(testObject.status, "syncing" /* SyncStatus.Syncing */);
            assertPreviews(preview.resourcePreviews, [
                (0, resources_1.joinPath)(environmentService.userDataSyncHome, testObject.resource, userDataSync_1.PREVIEW_DIR_NAME, 'html.json'),
                (0, resources_1.joinPath)(environmentService.userDataSyncHome, testObject.resource, userDataSync_1.PREVIEW_DIR_NAME, 'typescript.json'),
            ]);
            assert.deepStrictEqual(testObject.conflicts.conflicts, []);
        });
        test('merge when there are multiple snippets and all snippets are merged', async () => {
            const environmentService = testClient.instantiationService.get(environment_1.IEnvironmentService);
            await updateSnippet('html.json', htmlSnippet2, testClient);
            await updateSnippet('typescript.json', tsSnippet2, testClient);
            let preview = await testObject.preview(await testClient.getResourceManifest(), {});
            assert.strictEqual(testObject.status, "syncing" /* SyncStatus.Syncing */);
            assertPreviews(preview.resourcePreviews, [
                (0, resources_1.joinPath)(environmentService.userDataSyncHome, testObject.resource, userDataSync_1.PREVIEW_DIR_NAME, 'html.json'),
                (0, resources_1.joinPath)(environmentService.userDataSyncHome, testObject.resource, userDataSync_1.PREVIEW_DIR_NAME, 'typescript.json'),
            ]);
            assert.deepStrictEqual(testObject.conflicts.conflicts, []);
            preview = await testObject.merge(preview.resourcePreviews[0].localResource);
            preview = await testObject.merge(preview.resourcePreviews[1].localResource);
            assert.strictEqual(testObject.status, "syncing" /* SyncStatus.Syncing */);
            assertPreviews(preview.resourcePreviews, [
                (0, resources_1.joinPath)(environmentService.userDataSyncHome, testObject.resource, userDataSync_1.PREVIEW_DIR_NAME, 'html.json'),
                (0, resources_1.joinPath)(environmentService.userDataSyncHome, testObject.resource, userDataSync_1.PREVIEW_DIR_NAME, 'typescript.json'),
            ]);
            assert.deepStrictEqual(testObject.conflicts.conflicts, []);
        });
        test('merge when there are multiple snippets and all snippets are merged and applied', async () => {
            const environmentService = testClient.instantiationService.get(environment_1.IEnvironmentService);
            await updateSnippet('html.json', htmlSnippet2, testClient);
            await updateSnippet('typescript.json', tsSnippet2, testClient);
            let preview = await testObject.preview(await testClient.getResourceManifest(), {});
            assert.strictEqual(testObject.status, "syncing" /* SyncStatus.Syncing */);
            assertPreviews(preview.resourcePreviews, [
                (0, resources_1.joinPath)(environmentService.userDataSyncHome, testObject.resource, userDataSync_1.PREVIEW_DIR_NAME, 'html.json'),
                (0, resources_1.joinPath)(environmentService.userDataSyncHome, testObject.resource, userDataSync_1.PREVIEW_DIR_NAME, 'typescript.json'),
            ]);
            assert.deepStrictEqual(testObject.conflicts.conflicts, []);
            preview = await testObject.merge(preview.resourcePreviews[0].localResource);
            preview = await testObject.merge(preview.resourcePreviews[1].localResource);
            preview = await testObject.apply(false);
            assert.strictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            assert.strictEqual(preview, null);
            assert.deepStrictEqual(testObject.conflicts.conflicts, []);
        });
        test('merge when there are multiple snippets and one snippet has no changes and one snippet is merged', async () => {
            const environmentService = testClient.instantiationService.get(environment_1.IEnvironmentService);
            await updateSnippet('html.json', htmlSnippet1, client2);
            await client2.sync();
            await updateSnippet('html.json', htmlSnippet1, testClient);
            await updateSnippet('typescript.json', tsSnippet2, testClient);
            let preview = await testObject.preview(await testClient.getResourceManifest(), {});
            assert.strictEqual(testObject.status, "syncing" /* SyncStatus.Syncing */);
            assertPreviews(preview.resourcePreviews, [
                (0, resources_1.joinPath)(environmentService.userDataSyncHome, testObject.resource, userDataSync_1.PREVIEW_DIR_NAME, 'typescript.json'),
                (0, resources_1.joinPath)(environmentService.userDataSyncHome, testObject.resource, userDataSync_1.PREVIEW_DIR_NAME, 'html.json'),
            ]);
            assert.deepStrictEqual(testObject.conflicts.conflicts, []);
            preview = await testObject.merge(preview.resourcePreviews[0].localResource);
            assert.strictEqual(testObject.status, "syncing" /* SyncStatus.Syncing */);
            assertPreviews(preview.resourcePreviews, [
                (0, resources_1.joinPath)(environmentService.userDataSyncHome, testObject.resource, userDataSync_1.PREVIEW_DIR_NAME, 'typescript.json'),
                (0, resources_1.joinPath)(environmentService.userDataSyncHome, testObject.resource, userDataSync_1.PREVIEW_DIR_NAME, 'html.json'),
            ]);
            assert.deepStrictEqual(testObject.conflicts.conflicts, []);
        });
        test('merge when there are multiple snippets and one snippet has no changes and one snippet is merged and applied', async () => {
            const environmentService = testClient.instantiationService.get(environment_1.IEnvironmentService);
            await updateSnippet('html.json', htmlSnippet1, client2);
            await client2.sync();
            await updateSnippet('html.json', htmlSnippet1, testClient);
            await updateSnippet('typescript.json', tsSnippet2, testClient);
            let preview = await testObject.preview(await testClient.getResourceManifest(), {});
            assert.strictEqual(testObject.status, "syncing" /* SyncStatus.Syncing */);
            assertPreviews(preview.resourcePreviews, [
                (0, resources_1.joinPath)(environmentService.userDataSyncHome, testObject.resource, userDataSync_1.PREVIEW_DIR_NAME, 'typescript.json'),
                (0, resources_1.joinPath)(environmentService.userDataSyncHome, testObject.resource, userDataSync_1.PREVIEW_DIR_NAME, 'html.json'),
            ]);
            assert.deepStrictEqual(testObject.conflicts.conflicts, []);
            preview = await testObject.merge(preview.resourcePreviews[0].localResource);
            preview = await testObject.apply(false);
            assert.strictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            assert.strictEqual(preview, null);
            assert.deepStrictEqual(testObject.conflicts.conflicts, []);
        });
        test('merge when there are multiple snippets with conflicts and only one snippet is merged', async () => {
            const environmentService = testClient.instantiationService.get(environment_1.IEnvironmentService);
            await updateSnippet('html.json', htmlSnippet1, client2);
            await updateSnippet('typescript.json', tsSnippet1, client2);
            await client2.sync();
            await updateSnippet('html.json', htmlSnippet2, testClient);
            await updateSnippet('typescript.json', tsSnippet2, testClient);
            let preview = await testObject.preview(await testClient.getResourceManifest(), {});
            assert.strictEqual(testObject.status, "syncing" /* SyncStatus.Syncing */);
            assertPreviews(preview.resourcePreviews, [
                (0, resources_1.joinPath)(environmentService.userDataSyncHome, testObject.resource, userDataSync_1.PREVIEW_DIR_NAME, 'html.json'),
                (0, resources_1.joinPath)(environmentService.userDataSyncHome, testObject.resource, userDataSync_1.PREVIEW_DIR_NAME, 'typescript.json'),
            ]);
            assert.deepStrictEqual(testObject.conflicts.conflicts, []);
            preview = await testObject.merge(preview.resourcePreviews[0].previewResource);
            assert.strictEqual(testObject.status, "hasConflicts" /* SyncStatus.HasConflicts */);
            assertPreviews(preview.resourcePreviews, [
                (0, resources_1.joinPath)(environmentService.userDataSyncHome, testObject.resource, userDataSync_1.PREVIEW_DIR_NAME, 'html.json'),
                (0, resources_1.joinPath)(environmentService.userDataSyncHome, testObject.resource, userDataSync_1.PREVIEW_DIR_NAME, 'typescript.json'),
            ]);
            assertPreviews(testObject.conflicts.conflicts, [
                (0, resources_1.joinPath)(environmentService.userDataSyncHome, testObject.resource, userDataSync_1.PREVIEW_DIR_NAME, 'html.json'),
            ]);
        });
        test('merge when there are multiple snippets with conflicts and all snippets are merged', async () => {
            const environmentService = testClient.instantiationService.get(environment_1.IEnvironmentService);
            await updateSnippet('html.json', htmlSnippet1, client2);
            await updateSnippet('typescript.json', tsSnippet1, client2);
            await client2.sync();
            await updateSnippet('html.json', htmlSnippet2, testClient);
            await updateSnippet('typescript.json', tsSnippet2, testClient);
            let preview = await testObject.preview(await testClient.getResourceManifest(), {});
            assert.strictEqual(testObject.status, "syncing" /* SyncStatus.Syncing */);
            assertPreviews(preview.resourcePreviews, [
                (0, resources_1.joinPath)(environmentService.userDataSyncHome, testObject.resource, userDataSync_1.PREVIEW_DIR_NAME, 'html.json'),
                (0, resources_1.joinPath)(environmentService.userDataSyncHome, testObject.resource, userDataSync_1.PREVIEW_DIR_NAME, 'typescript.json'),
            ]);
            assert.deepStrictEqual(testObject.conflicts.conflicts, []);
            preview = await testObject.merge(preview.resourcePreviews[0].previewResource);
            preview = await testObject.merge(preview.resourcePreviews[1].previewResource);
            assert.strictEqual(testObject.status, "hasConflicts" /* SyncStatus.HasConflicts */);
            assertPreviews(preview.resourcePreviews, [
                (0, resources_1.joinPath)(environmentService.userDataSyncHome, testObject.resource, userDataSync_1.PREVIEW_DIR_NAME, 'html.json'),
                (0, resources_1.joinPath)(environmentService.userDataSyncHome, testObject.resource, userDataSync_1.PREVIEW_DIR_NAME, 'typescript.json'),
            ]);
            assertPreviews(testObject.conflicts.conflicts, [
                (0, resources_1.joinPath)(environmentService.userDataSyncHome, testObject.resource, userDataSync_1.PREVIEW_DIR_NAME, 'html.json'),
                (0, resources_1.joinPath)(environmentService.userDataSyncHome, testObject.resource, userDataSync_1.PREVIEW_DIR_NAME, 'typescript.json'),
            ]);
        });
        test('accept when there are multiple snippets with conflicts and only one snippet is accepted', async () => {
            const environmentService = testClient.instantiationService.get(environment_1.IEnvironmentService);
            await updateSnippet('html.json', htmlSnippet1, client2);
            await updateSnippet('typescript.json', tsSnippet1, client2);
            await client2.sync();
            await updateSnippet('html.json', htmlSnippet2, testClient);
            await updateSnippet('typescript.json', tsSnippet2, testClient);
            let preview = await testObject.preview(await testClient.getResourceManifest(), {});
            assert.strictEqual(testObject.status, "syncing" /* SyncStatus.Syncing */);
            assertPreviews(preview.resourcePreviews, [
                (0, resources_1.joinPath)(environmentService.userDataSyncHome, testObject.resource, userDataSync_1.PREVIEW_DIR_NAME, 'html.json'),
                (0, resources_1.joinPath)(environmentService.userDataSyncHome, testObject.resource, userDataSync_1.PREVIEW_DIR_NAME, 'typescript.json'),
            ]);
            assert.deepStrictEqual(testObject.conflicts.conflicts, []);
            preview = await testObject.accept(preview.resourcePreviews[0].previewResource, htmlSnippet2);
            assert.strictEqual(testObject.status, "syncing" /* SyncStatus.Syncing */);
            assertPreviews(preview.resourcePreviews, [
                (0, resources_1.joinPath)(environmentService.userDataSyncHome, testObject.resource, userDataSync_1.PREVIEW_DIR_NAME, 'html.json'),
                (0, resources_1.joinPath)(environmentService.userDataSyncHome, testObject.resource, userDataSync_1.PREVIEW_DIR_NAME, 'typescript.json'),
            ]);
            assert.deepStrictEqual(testObject.conflicts.conflicts, []);
        });
        test('accept when there are multiple snippets with conflicts and all snippets are accepted', async () => {
            const environmentService = testClient.instantiationService.get(environment_1.IEnvironmentService);
            await updateSnippet('html.json', htmlSnippet1, client2);
            await updateSnippet('typescript.json', tsSnippet1, client2);
            await client2.sync();
            await updateSnippet('html.json', htmlSnippet2, testClient);
            await updateSnippet('typescript.json', tsSnippet2, testClient);
            let preview = await testObject.preview(await testClient.getResourceManifest(), {});
            assert.strictEqual(testObject.status, "syncing" /* SyncStatus.Syncing */);
            assertPreviews(preview.resourcePreviews, [
                (0, resources_1.joinPath)(environmentService.userDataSyncHome, testObject.resource, userDataSync_1.PREVIEW_DIR_NAME, 'html.json'),
                (0, resources_1.joinPath)(environmentService.userDataSyncHome, testObject.resource, userDataSync_1.PREVIEW_DIR_NAME, 'typescript.json'),
            ]);
            assert.deepStrictEqual(testObject.conflicts.conflicts, []);
            preview = await testObject.accept(preview.resourcePreviews[0].previewResource, htmlSnippet2);
            preview = await testObject.accept(preview.resourcePreviews[1].previewResource, tsSnippet2);
            assert.strictEqual(testObject.status, "syncing" /* SyncStatus.Syncing */);
            assertPreviews(preview.resourcePreviews, [
                (0, resources_1.joinPath)(environmentService.userDataSyncHome, testObject.resource, userDataSync_1.PREVIEW_DIR_NAME, 'html.json'),
                (0, resources_1.joinPath)(environmentService.userDataSyncHome, testObject.resource, userDataSync_1.PREVIEW_DIR_NAME, 'typescript.json'),
            ]);
            assert.deepStrictEqual(testObject.conflicts.conflicts, []);
        });
        test('accept when there are multiple snippets with conflicts and all snippets are accepted and applied', async () => {
            const environmentService = testClient.instantiationService.get(environment_1.IEnvironmentService);
            await updateSnippet('html.json', htmlSnippet1, client2);
            await updateSnippet('typescript.json', tsSnippet1, client2);
            await client2.sync();
            await updateSnippet('html.json', htmlSnippet2, testClient);
            await updateSnippet('typescript.json', tsSnippet2, testClient);
            let preview = await testObject.preview(await testClient.getResourceManifest(), {});
            assert.strictEqual(testObject.status, "syncing" /* SyncStatus.Syncing */);
            assertPreviews(preview.resourcePreviews, [
                (0, resources_1.joinPath)(environmentService.userDataSyncHome, testObject.resource, userDataSync_1.PREVIEW_DIR_NAME, 'html.json'),
                (0, resources_1.joinPath)(environmentService.userDataSyncHome, testObject.resource, userDataSync_1.PREVIEW_DIR_NAME, 'typescript.json'),
            ]);
            assert.deepStrictEqual(testObject.conflicts.conflicts, []);
            preview = await testObject.accept(preview.resourcePreviews[0].previewResource, htmlSnippet2);
            preview = await testObject.accept(preview.resourcePreviews[1].previewResource, tsSnippet2);
            preview = await testObject.apply(false);
            assert.strictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            assert.strictEqual(preview, null);
            assert.deepStrictEqual(testObject.conflicts.conflicts, []);
        });
        test('sync profile snippets', async () => {
            const client2 = disposableStore.add(new userDataSyncClient_1.UserDataSyncClient(server));
            await client2.setUp(true);
            const profile = await client2.instantiationService.get(userDataProfile_1.IUserDataProfilesService).createNamedProfile('profile1');
            await updateSnippet('html.json', htmlSnippet1, client2, profile);
            await client2.sync();
            await testClient.sync();
            const syncedProfile = testClient.instantiationService.get(userDataProfile_1.IUserDataProfilesService).profiles.find(p => p.id === profile.id);
            const content = await readSnippet('html.json', testClient, syncedProfile);
            assert.strictEqual(content, htmlSnippet1);
        });
        function parseSnippets(content) {
            const syncData = JSON.parse(content);
            return JSON.parse(syncData.content);
        }
        async function updateSnippet(name, content, client, profile) {
            const fileService = client.instantiationService.get(files_1.IFileService);
            const userDataProfilesService = client.instantiationService.get(userDataProfile_1.IUserDataProfilesService);
            const snippetsResource = (0, resources_1.joinPath)((profile ?? userDataProfilesService.defaultProfile).snippetsHome, name);
            await fileService.writeFile(snippetsResource, buffer_1.VSBuffer.fromString(content));
        }
        async function removeSnippet(name, client) {
            const fileService = client.instantiationService.get(files_1.IFileService);
            const userDataProfilesService = client.instantiationService.get(userDataProfile_1.IUserDataProfilesService);
            const snippetsResource = (0, resources_1.joinPath)(userDataProfilesService.defaultProfile.snippetsHome, name);
            await fileService.del(snippetsResource);
        }
        async function readSnippet(name, client, profile) {
            const fileService = client.instantiationService.get(files_1.IFileService);
            const userDataProfilesService = client.instantiationService.get(userDataProfile_1.IUserDataProfilesService);
            const snippetsResource = (0, resources_1.joinPath)((profile ?? userDataProfilesService.defaultProfile).snippetsHome, name);
            if (await fileService.exists(snippetsResource)) {
                const content = await fileService.readFile(snippetsResource);
                return content.value.toString();
            }
            return null;
        }
        function assertPreviews(actual, expected) {
            assert.deepStrictEqual(actual.map(({ previewResource }) => previewResource.toString()), expected.map(uri => uri.toString()));
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic25pcHBldHNTeW5jLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS91c2VyRGF0YVN5bmMvdGVzdC9jb21tb24vc25pcHBldHNTeW5jLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFlaEcsTUFBTSxVQUFVLEdBQUc7Ozs7Ozs7Ozs7Ozs7Ozs7RUFnQmpCLENBQUM7SUFFSCxNQUFNLFVBQVUsR0FBRzs7Ozs7Ozs7Ozs7Ozs7OztFQWdCakIsQ0FBQztJQUVILE1BQU0sWUFBWSxHQUFHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQXVCbkIsQ0FBQztJQUVILE1BQU0sWUFBWSxHQUFHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQXVCbkIsQ0FBQztJQUVILE1BQU0sWUFBWSxHQUFHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQXVCbkIsQ0FBQztJQUVILE1BQU0sYUFBYSxHQUFHOzs7Ozs7Ozs7Ozs7Ozs7OztFQWlCcEIsQ0FBQztJQUVILEtBQUssQ0FBQyxjQUFjLEVBQUUsR0FBRyxFQUFFO1FBRTFCLE1BQU0sTUFBTSxHQUFHLElBQUksMkNBQXNCLEVBQUUsQ0FBQztRQUM1QyxJQUFJLFVBQThCLENBQUM7UUFDbkMsSUFBSSxPQUEyQixDQUFDO1FBRWhDLElBQUksVUFBZ0MsQ0FBQztRQUVyQyxRQUFRLENBQUMsS0FBSyxJQUFJLEVBQUU7WUFDbkIsTUFBTSxVQUFVLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLHdDQUF5QixDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDOUUsQ0FBQyxDQUFDLENBQUM7UUFFSCxNQUFNLGVBQWUsR0FBRyxJQUFBLCtDQUF1QyxHQUFFLENBQUM7UUFFbEUsS0FBSyxDQUFDLEtBQUssSUFBSSxFQUFFO1lBQ2hCLFVBQVUsR0FBRyxlQUFlLENBQUMsR0FBRyxDQUFDLElBQUksdUNBQWtCLENB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