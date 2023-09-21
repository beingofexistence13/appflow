define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/base/test/common/utils", "vs/editor/browser/services/openerService", "vs/editor/test/browser/editorTestServices", "vs/platform/commands/common/commands", "vs/platform/commands/test/common/nullCommandService", "vs/platform/opener/common/opener", "vs/platform/theme/test/common/testThemeService"], function (require, exports, assert, lifecycle_1, uri_1, utils_1, openerService_1, editorTestServices_1, commands_1, nullCommandService_1, opener_1, testThemeService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('OpenerService', function () {
        const themeService = new testThemeService_1.$K0b();
        const editorService = new editorTestServices_1.$A0b(themeService);
        let lastCommand;
        const commandService = new (class {
            constructor() {
                this.onWillExecuteCommand = () => lifecycle_1.$kc.None;
                this.onDidExecuteCommand = () => lifecycle_1.$kc.None;
            }
            executeCommand(id, ...args) {
                lastCommand = { id, args };
                return Promise.resolve(undefined);
            }
        })();
        setup(function () {
            lastCommand = undefined;
        });
        const store = (0, utils_1.$bT)();
        test('delegate to editorService, scheme:///fff', async function () {
            const openerService = new openerService_1.$OBb(editorService, nullCommandService_1.$f$b);
            await openerService.open(uri_1.URI.parse('another:///somepath'));
            assert.strictEqual(editorService.lastInput.options.selection, undefined);
        });
        test('delegate to editorService, scheme:///fff#L123', async function () {
            const openerService = new openerService_1.$OBb(editorService, nullCommandService_1.$f$b);
            await openerService.open(uri_1.URI.parse('file:///somepath#L23'));
            assert.strictEqual(editorService.lastInput.options.selection.startLineNumber, 23);
            assert.strictEqual(editorService.lastInput.options.selection.startColumn, 1);
            assert.strictEqual(editorService.lastInput.options.selection.endLineNumber, undefined);
            assert.strictEqual(editorService.lastInput.options.selection.endColumn, undefined);
            assert.strictEqual(editorService.lastInput.resource.fragment, '');
            await openerService.open(uri_1.URI.parse('another:///somepath#L23'));
            assert.strictEqual(editorService.lastInput.options.selection.startLineNumber, 23);
            assert.strictEqual(editorService.lastInput.options.selection.startColumn, 1);
            await openerService.open(uri_1.URI.parse('another:///somepath#L23,45'));
            assert.strictEqual(editorService.lastInput.options.selection.startLineNumber, 23);
            assert.strictEqual(editorService.lastInput.options.selection.startColumn, 45);
            assert.strictEqual(editorService.lastInput.options.selection.endLineNumber, undefined);
            assert.strictEqual(editorService.lastInput.options.selection.endColumn, undefined);
            assert.strictEqual(editorService.lastInput.resource.fragment, '');
        });
        test('delegate to editorService, scheme:///fff#123,123', async function () {
            const openerService = new openerService_1.$OBb(editorService, nullCommandService_1.$f$b);
            await openerService.open(uri_1.URI.parse('file:///somepath#23'));
            assert.strictEqual(editorService.lastInput.options.selection.startLineNumber, 23);
            assert.strictEqual(editorService.lastInput.options.selection.startColumn, 1);
            assert.strictEqual(editorService.lastInput.options.selection.endLineNumber, undefined);
            assert.strictEqual(editorService.lastInput.options.selection.endColumn, undefined);
            assert.strictEqual(editorService.lastInput.resource.fragment, '');
            await openerService.open(uri_1.URI.parse('file:///somepath#23,45'));
            assert.strictEqual(editorService.lastInput.options.selection.startLineNumber, 23);
            assert.strictEqual(editorService.lastInput.options.selection.startColumn, 45);
            assert.strictEqual(editorService.lastInput.options.selection.endLineNumber, undefined);
            assert.strictEqual(editorService.lastInput.options.selection.endColumn, undefined);
            assert.strictEqual(editorService.lastInput.resource.fragment, '');
        });
        test('delegate to commandsService, command:someid', async function () {
            const openerService = new openerService_1.$OBb(editorService, commandService);
            const id = `aCommand${Math.random()}`;
            store.add(commands_1.$Gr.registerCommand(id, function () { }));
            assert.strictEqual(lastCommand, undefined);
            await openerService.open(uri_1.URI.parse('command:' + id));
            assert.strictEqual(lastCommand, undefined);
        });
        test('delegate to commandsService, command:someid, 2', async function () {
            const openerService = new openerService_1.$OBb(editorService, commandService);
            const id = `aCommand${Math.random()}`;
            store.add(commands_1.$Gr.registerCommand(id, function () { }));
            await openerService.open(uri_1.URI.parse('command:' + id).with({ query: '\"123\"' }), { allowCommands: true });
            assert.strictEqual(lastCommand.id, id);
            assert.strictEqual(lastCommand.args.length, 1);
            assert.strictEqual(lastCommand.args[0], '123');
            await openerService.open(uri_1.URI.parse('command:' + id), { allowCommands: true });
            assert.strictEqual(lastCommand.id, id);
            assert.strictEqual(lastCommand.args.length, 0);
            await openerService.open(uri_1.URI.parse('command:' + id).with({ query: '123' }), { allowCommands: true });
            assert.strictEqual(lastCommand.id, id);
            assert.strictEqual(lastCommand.args.length, 1);
            assert.strictEqual(lastCommand.args[0], 123);
            await openerService.open(uri_1.URI.parse('command:' + id).with({ query: JSON.stringify([12, true]) }), { allowCommands: true });
            assert.strictEqual(lastCommand.id, id);
            assert.strictEqual(lastCommand.args.length, 2);
            assert.strictEqual(lastCommand.args[0], 12);
            assert.strictEqual(lastCommand.args[1], true);
        });
        test('links are protected by validators', async function () {
            const openerService = new openerService_1.$OBb(editorService, commandService);
            store.add(openerService.registerValidator({ shouldOpen: () => Promise.resolve(false) }));
            const httpResult = await openerService.open(uri_1.URI.parse('https://www.microsoft.com'));
            const httpsResult = await openerService.open(uri_1.URI.parse('https://www.microsoft.com'));
            assert.strictEqual(httpResult, false);
            assert.strictEqual(httpsResult, false);
        });
        test('links validated by validators go to openers', async function () {
            const openerService = new openerService_1.$OBb(editorService, commandService);
            store.add(openerService.registerValidator({ shouldOpen: () => Promise.resolve(true) }));
            let openCount = 0;
            store.add(openerService.registerOpener({
                open: (resource) => {
                    openCount++;
                    return Promise.resolve(true);
                }
            }));
            await openerService.open(uri_1.URI.parse('http://microsoft.com'));
            assert.strictEqual(openCount, 1);
            await openerService.open(uri_1.URI.parse('https://microsoft.com'));
            assert.strictEqual(openCount, 2);
        });
        test('links aren\'t manipulated before being passed to validator: PR #118226', async function () {
            const openerService = new openerService_1.$OBb(editorService, commandService);
            store.add(openerService.registerValidator({
                shouldOpen: (resource) => {
                    // We don't want it to convert strings into URIs
                    assert.strictEqual(resource instanceof uri_1.URI, false);
                    return Promise.resolve(false);
                }
            }));
            await openerService.open('https://wwww.microsoft.com');
            await openerService.open('https://www.microsoft.com??params=CountryCode%3DUSA%26Name%3Dvscode"');
        });
        test('links validated by multiple validators', async function () {
            const openerService = new openerService_1.$OBb(editorService, commandService);
            let v1 = 0;
            openerService.registerValidator({
                shouldOpen: () => {
                    v1++;
                    return Promise.resolve(true);
                }
            });
            let v2 = 0;
            openerService.registerValidator({
                shouldOpen: () => {
                    v2++;
                    return Promise.resolve(true);
                }
            });
            let openCount = 0;
            openerService.registerOpener({
                open: (resource) => {
                    openCount++;
                    return Promise.resolve(true);
                }
            });
            await openerService.open(uri_1.URI.parse('http://microsoft.com'));
            assert.strictEqual(openCount, 1);
            assert.strictEqual(v1, 1);
            assert.strictEqual(v2, 1);
            await openerService.open(uri_1.URI.parse('https://microsoft.com'));
            assert.strictEqual(openCount, 2);
            assert.strictEqual(v1, 2);
            assert.strictEqual(v2, 2);
        });
        test('links invalidated by first validator do not continue validating', async function () {
            const openerService = new openerService_1.$OBb(editorService, commandService);
            let v1 = 0;
            openerService.registerValidator({
                shouldOpen: () => {
                    v1++;
                    return Promise.resolve(false);
                }
            });
            let v2 = 0;
            openerService.registerValidator({
                shouldOpen: () => {
                    v2++;
                    return Promise.resolve(true);
                }
            });
            let openCount = 0;
            openerService.registerOpener({
                open: (resource) => {
                    openCount++;
                    return Promise.resolve(true);
                }
            });
            await openerService.open(uri_1.URI.parse('http://microsoft.com'));
            assert.strictEqual(openCount, 0);
            assert.strictEqual(v1, 1);
            assert.strictEqual(v2, 0);
            await openerService.open(uri_1.URI.parse('https://microsoft.com'));
            assert.strictEqual(openCount, 0);
            assert.strictEqual(v1, 2);
            assert.strictEqual(v2, 0);
        });
        test('matchesScheme', function () {
            assert.ok((0, opener_1.$OT)('https://microsoft.com', 'https'));
            assert.ok((0, opener_1.$OT)('http://microsoft.com', 'http'));
            assert.ok((0, opener_1.$OT)('hTTPs://microsoft.com', 'https'));
            assert.ok((0, opener_1.$OT)('httP://microsoft.com', 'http'));
            assert.ok((0, opener_1.$OT)(uri_1.URI.parse('https://microsoft.com'), 'https'));
            assert.ok((0, opener_1.$OT)(uri_1.URI.parse('http://microsoft.com'), 'http'));
            assert.ok((0, opener_1.$OT)(uri_1.URI.parse('hTTPs://microsoft.com'), 'https'));
            assert.ok((0, opener_1.$OT)(uri_1.URI.parse('httP://microsoft.com'), 'http'));
            assert.ok(!(0, opener_1.$OT)(uri_1.URI.parse('https://microsoft.com'), 'http'));
            assert.ok(!(0, opener_1.$OT)(uri_1.URI.parse('htt://microsoft.com'), 'http'));
            assert.ok(!(0, opener_1.$OT)(uri_1.URI.parse('z://microsoft.com'), 'http'));
        });
        test('matchesSomeScheme', function () {
            assert.ok((0, opener_1.$PT)('https://microsoft.com', 'http', 'https'));
            assert.ok((0, opener_1.$PT)('http://microsoft.com', 'http', 'https'));
            assert.ok(!(0, opener_1.$PT)('x://microsoft.com', 'http', 'https'));
        });
        test('resolveExternalUri', async function () {
            const openerService = new openerService_1.$OBb(editorService, nullCommandService_1.$f$b);
            try {
                await openerService.resolveExternalUri(uri_1.URI.parse('file:///Users/user/folder'));
                assert.fail('Should not reach here');
            }
            catch {
                // OK
            }
            const disposable = openerService.registerExternalUriResolver({
                async resolveExternalUri(uri) {
                    return { resolved: uri, dispose() { } };
                }
            });
            const result = await openerService.resolveExternalUri(uri_1.URI.parse('file:///Users/user/folder'));
            assert.deepStrictEqual(result.resolved.toString(), 'file:///Users/user/folder');
            disposable.dispose();
        });
        test('vscode.open command can\'t open HTTP URL with hash (#) in it [extension development] #140907', async function () {
            const openerService = new openerService_1.$OBb(editorService, nullCommandService_1.$f$b);
            const actual = [];
            openerService.setDefaultExternalOpener({
                async openExternal(href) {
                    actual.push(href);
                    return true;
                }
            });
            const href = 'https://gitlab.com/viktomas/test-project/merge_requests/new?merge_request%5Bsource_branch%5D=test-%23-hash';
            const uri = uri_1.URI.parse(href);
            assert.ok(await openerService.open(uri));
            assert.ok(await openerService.open(href));
            assert.deepStrictEqual(actual, [
                encodeURI(uri.toString(true)),
                href // good
            ]);
        });
    });
});
//# sourceMappingURL=openerService.test.js.map