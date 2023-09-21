define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/base/test/common/utils", "vs/editor/browser/services/openerService", "vs/editor/test/browser/editorTestServices", "vs/platform/commands/common/commands", "vs/platform/commands/test/common/nullCommandService", "vs/platform/opener/common/opener", "vs/platform/theme/test/common/testThemeService"], function (require, exports, assert, lifecycle_1, uri_1, utils_1, openerService_1, editorTestServices_1, commands_1, nullCommandService_1, opener_1, testThemeService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('OpenerService', function () {
        const themeService = new testThemeService_1.TestThemeService();
        const editorService = new editorTestServices_1.TestCodeEditorService(themeService);
        let lastCommand;
        const commandService = new (class {
            constructor() {
                this.onWillExecuteCommand = () => lifecycle_1.Disposable.None;
                this.onDidExecuteCommand = () => lifecycle_1.Disposable.None;
            }
            executeCommand(id, ...args) {
                lastCommand = { id, args };
                return Promise.resolve(undefined);
            }
        })();
        setup(function () {
            lastCommand = undefined;
        });
        const store = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('delegate to editorService, scheme:///fff', async function () {
            const openerService = new openerService_1.OpenerService(editorService, nullCommandService_1.NullCommandService);
            await openerService.open(uri_1.URI.parse('another:///somepath'));
            assert.strictEqual(editorService.lastInput.options.selection, undefined);
        });
        test('delegate to editorService, scheme:///fff#L123', async function () {
            const openerService = new openerService_1.OpenerService(editorService, nullCommandService_1.NullCommandService);
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
            const openerService = new openerService_1.OpenerService(editorService, nullCommandService_1.NullCommandService);
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
            const openerService = new openerService_1.OpenerService(editorService, commandService);
            const id = `aCommand${Math.random()}`;
            store.add(commands_1.CommandsRegistry.registerCommand(id, function () { }));
            assert.strictEqual(lastCommand, undefined);
            await openerService.open(uri_1.URI.parse('command:' + id));
            assert.strictEqual(lastCommand, undefined);
        });
        test('delegate to commandsService, command:someid, 2', async function () {
            const openerService = new openerService_1.OpenerService(editorService, commandService);
            const id = `aCommand${Math.random()}`;
            store.add(commands_1.CommandsRegistry.registerCommand(id, function () { }));
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
            const openerService = new openerService_1.OpenerService(editorService, commandService);
            store.add(openerService.registerValidator({ shouldOpen: () => Promise.resolve(false) }));
            const httpResult = await openerService.open(uri_1.URI.parse('https://www.microsoft.com'));
            const httpsResult = await openerService.open(uri_1.URI.parse('https://www.microsoft.com'));
            assert.strictEqual(httpResult, false);
            assert.strictEqual(httpsResult, false);
        });
        test('links validated by validators go to openers', async function () {
            const openerService = new openerService_1.OpenerService(editorService, commandService);
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
            const openerService = new openerService_1.OpenerService(editorService, commandService);
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
            const openerService = new openerService_1.OpenerService(editorService, commandService);
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
            const openerService = new openerService_1.OpenerService(editorService, commandService);
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
            assert.ok((0, opener_1.matchesScheme)('https://microsoft.com', 'https'));
            assert.ok((0, opener_1.matchesScheme)('http://microsoft.com', 'http'));
            assert.ok((0, opener_1.matchesScheme)('hTTPs://microsoft.com', 'https'));
            assert.ok((0, opener_1.matchesScheme)('httP://microsoft.com', 'http'));
            assert.ok((0, opener_1.matchesScheme)(uri_1.URI.parse('https://microsoft.com'), 'https'));
            assert.ok((0, opener_1.matchesScheme)(uri_1.URI.parse('http://microsoft.com'), 'http'));
            assert.ok((0, opener_1.matchesScheme)(uri_1.URI.parse('hTTPs://microsoft.com'), 'https'));
            assert.ok((0, opener_1.matchesScheme)(uri_1.URI.parse('httP://microsoft.com'), 'http'));
            assert.ok(!(0, opener_1.matchesScheme)(uri_1.URI.parse('https://microsoft.com'), 'http'));
            assert.ok(!(0, opener_1.matchesScheme)(uri_1.URI.parse('htt://microsoft.com'), 'http'));
            assert.ok(!(0, opener_1.matchesScheme)(uri_1.URI.parse('z://microsoft.com'), 'http'));
        });
        test('matchesSomeScheme', function () {
            assert.ok((0, opener_1.matchesSomeScheme)('https://microsoft.com', 'http', 'https'));
            assert.ok((0, opener_1.matchesSomeScheme)('http://microsoft.com', 'http', 'https'));
            assert.ok(!(0, opener_1.matchesSomeScheme)('x://microsoft.com', 'http', 'https'));
        });
        test('resolveExternalUri', async function () {
            const openerService = new openerService_1.OpenerService(editorService, nullCommandService_1.NullCommandService);
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
            const openerService = new openerService_1.OpenerService(editorService, nullCommandService_1.NullCommandService);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3BlbmVyU2VydmljZS50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL3Rlc3QvYnJvd3Nlci9zZXJ2aWNlcy9vcGVuZXJTZXJ2aWNlLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBZ0JBLEtBQUssQ0FBQyxlQUFlLEVBQUU7UUFDdEIsTUFBTSxZQUFZLEdBQUcsSUFBSSxtQ0FBZ0IsRUFBRSxDQUFDO1FBQzVDLE1BQU0sYUFBYSxHQUFHLElBQUksMENBQXFCLENBQUMsWUFBWSxDQUFDLENBQUM7UUFFOUQsSUFBSSxXQUFvRCxDQUFDO1FBRXpELE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQztZQUFBO2dCQUUzQix5QkFBb0IsR0FBRyxHQUFHLEVBQUUsQ0FBQyxzQkFBVSxDQUFDLElBQUksQ0FBQztnQkFDN0Msd0JBQW1CLEdBQUcsR0FBRyxFQUFFLENBQUMsc0JBQVUsQ0FBQyxJQUFJLENBQUM7WUFLN0MsQ0FBQztZQUpBLGNBQWMsQ0FBQyxFQUFVLEVBQUUsR0FBRyxJQUFXO2dCQUN4QyxXQUFXLEdBQUcsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUM7Z0JBQzNCLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNuQyxDQUFDO1NBQ0QsQ0FBQyxFQUFFLENBQUM7UUFFTCxLQUFLLENBQUM7WUFDTCxXQUFXLEdBQUcsU0FBUyxDQUFDO1FBQ3pCLENBQUMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxLQUFLLEdBQUcsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1FBRXhELElBQUksQ0FBQywwQ0FBMEMsRUFBRSxLQUFLO1lBQ3JELE1BQU0sYUFBYSxHQUFHLElBQUksNkJBQWEsQ0FBQyxhQUFhLEVBQUUsdUNBQWtCLENBQUMsQ0FBQztZQUMzRSxNQUFNLGFBQWEsQ0FBQyxJQUFJLENBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUM7WUFDM0QsTUFBTSxDQUFDLFdBQVcsQ0FBRSxhQUFhLENBQUMsU0FBVSxDQUFDLE9BQStCLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ3BHLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLCtDQUErQyxFQUFFLEtBQUs7WUFDMUQsTUFBTSxhQUFhLEdBQUcsSUFBSSw2QkFBYSxDQUFDLGFBQWEsRUFBRSx1Q0FBa0IsQ0FBQyxDQUFDO1lBRTNFLE1BQU0sYUFBYSxDQUFDLElBQUksQ0FBQyxTQUFHLENBQUMsS0FBSyxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQztZQUM1RCxNQUFNLENBQUMsV0FBVyxDQUFFLGFBQWEsQ0FBQyxTQUFVLENBQUMsT0FBK0IsQ0FBQyxTQUFVLENBQUMsZUFBZSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzdHLE1BQU0sQ0FBQyxXQUFXLENBQUUsYUFBYSxDQUFDLFNBQVUsQ0FBQyxPQUErQixDQUFDLFNBQVUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEcsTUFBTSxDQUFDLFdBQVcsQ0FBRSxhQUFhLENBQUMsU0FBVSxDQUFDLE9BQStCLENBQUMsU0FBVSxDQUFDLGFBQWEsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUNsSCxNQUFNLENBQUMsV0FBVyxDQUFFLGFBQWEsQ0FBQyxTQUFVLENBQUMsT0FBK0IsQ0FBQyxTQUFVLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQzlHLE1BQU0sQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLFNBQVUsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBRW5FLE1BQU0sYUFBYSxDQUFDLElBQUksQ0FBQyxTQUFHLENBQUMsS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUMsQ0FBQztZQUMvRCxNQUFNLENBQUMsV0FBVyxDQUFFLGFBQWEsQ0FBQyxTQUFVLENBQUMsT0FBK0IsQ0FBQyxTQUFVLENBQUMsZUFBZSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzdHLE1BQU0sQ0FBQyxXQUFXLENBQUUsYUFBYSxDQUFDLFNBQVUsQ0FBQyxPQUErQixDQUFDLFNBQVUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFeEcsTUFBTSxhQUFhLENBQUMsSUFBSSxDQUFDLFNBQUcsQ0FBQyxLQUFLLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxDQUFDO1lBQ2xFLE1BQU0sQ0FBQyxXQUFXLENBQUUsYUFBYSxDQUFDLFNBQVUsQ0FBQyxPQUErQixDQUFDLFNBQVUsQ0FBQyxlQUFlLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDN0csTUFBTSxDQUFDLFdBQVcsQ0FBRSxhQUFhLENBQUMsU0FBVSxDQUFDLE9BQStCLENBQUMsU0FBVSxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN6RyxNQUFNLENBQUMsV0FBVyxDQUFFLGFBQWEsQ0FBQyxTQUFVLENBQUMsT0FBK0IsQ0FBQyxTQUFVLENBQUMsYUFBYSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ2xILE1BQU0sQ0FBQyxXQUFXLENBQUUsYUFBYSxDQUFDLFNBQVUsQ0FBQyxPQUErQixDQUFDLFNBQVUsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDOUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsU0FBVSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDcEUsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsa0RBQWtELEVBQUUsS0FBSztZQUM3RCxNQUFNLGFBQWEsR0FBRyxJQUFJLDZCQUFhLENBQUMsYUFBYSxFQUFFLHVDQUFrQixDQUFDLENBQUM7WUFFM0UsTUFBTSxhQUFhLENBQUMsSUFBSSxDQUFDLFNBQUcsQ0FBQyxLQUFLLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDO1lBQzNELE1BQU0sQ0FBQyxXQUFXLENBQUUsYUFBYSxDQUFDLFNBQVUsQ0FBQyxPQUErQixDQUFDLFNBQVUsQ0FBQyxlQUFlLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDN0csTUFBTSxDQUFDLFdBQVcsQ0FBRSxhQUFhLENBQUMsU0FBVSxDQUFDLE9BQStCLENBQUMsU0FBVSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN4RyxNQUFNLENBQUMsV0FBVyxDQUFFLGFBQWEsQ0FBQyxTQUFVLENBQUMsT0FBK0IsQ0FBQyxTQUFVLENBQUMsYUFBYSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ2xILE1BQU0sQ0FBQyxXQUFXLENBQUUsYUFBYSxDQUFDLFNBQVUsQ0FBQyxPQUErQixDQUFDLFNBQVUsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDOUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsU0FBVSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFFbkUsTUFBTSxhQUFhLENBQUMsSUFBSSxDQUFDLFNBQUcsQ0FBQyxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDO1lBQzlELE1BQU0sQ0FBQyxXQUFXLENBQUUsYUFBYSxDQUFDLFNBQVUsQ0FBQyxPQUErQixDQUFDLFNBQVUsQ0FBQyxlQUFlLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDN0csTUFBTSxDQUFDLFdBQVcsQ0FBRSxhQUFhLENBQUMsU0FBVSxDQUFDLE9BQStCLENBQUMsU0FBVSxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN6RyxNQUFNLENBQUMsV0FBVyxDQUFFLGFBQWEsQ0FBQyxTQUFVLENBQUMsT0FBK0IsQ0FBQyxTQUFVLENBQUMsYUFBYSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ2xILE1BQU0sQ0FBQyxXQUFXLENBQUUsYUFBYSxDQUFDLFNBQVUsQ0FBQyxPQUErQixDQUFDLFNBQVUsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDOUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsU0FBVSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDcEUsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsNkNBQTZDLEVBQUUsS0FBSztZQUN4RCxNQUFNLGFBQWEsR0FBRyxJQUFJLDZCQUFhLENBQUMsYUFBYSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBRXZFLE1BQU0sRUFBRSxHQUFHLFdBQVcsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUM7WUFDdEMsS0FBSyxDQUFDLEdBQUcsQ0FBQywyQkFBZ0IsQ0FBQyxlQUFlLENBQUMsRUFBRSxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVqRSxNQUFNLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUMzQyxNQUFNLGFBQWEsQ0FBQyxJQUFJLENBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNyRCxNQUFNLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUM1QyxDQUFDLENBQUMsQ0FBQztRQUdILElBQUksQ0FBQyxnREFBZ0QsRUFBRSxLQUFLO1lBQzNELE1BQU0sYUFBYSxHQUFHLElBQUksNkJBQWEsQ0FBQyxhQUFhLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFFdkUsTUFBTSxFQUFFLEdBQUcsV0FBVyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQztZQUN0QyxLQUFLLENBQUMsR0FBRyxDQUFDLDJCQUFnQixDQUFDLGVBQWUsQ0FBQyxFQUFFLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRWpFLE1BQU0sYUFBYSxDQUFDLElBQUksQ0FBQyxTQUFHLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQ3pHLE1BQU0sQ0FBQyxXQUFXLENBQUMsV0FBWSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN4QyxNQUFNLENBQUMsV0FBVyxDQUFDLFdBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2hELE1BQU0sQ0FBQyxXQUFXLENBQUMsV0FBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUVoRCxNQUFNLGFBQWEsQ0FBQyxJQUFJLENBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUM5RSxNQUFNLENBQUMsV0FBVyxDQUFDLFdBQVksQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDeEMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxXQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUVoRCxNQUFNLGFBQWEsQ0FBQyxJQUFJLENBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUNyRyxNQUFNLENBQUMsV0FBVyxDQUFDLFdBQVksQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDeEMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxXQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNoRCxNQUFNLENBQUMsV0FBVyxDQUFDLFdBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFFOUMsTUFBTSxhQUFhLENBQUMsSUFBSSxDQUFDLFNBQUcsQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7WUFDMUgsTUFBTSxDQUFDLFdBQVcsQ0FBQyxXQUFZLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3hDLE1BQU0sQ0FBQyxXQUFXLENBQUMsV0FBWSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDaEQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxXQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzdDLE1BQU0sQ0FBQyxXQUFXLENBQUMsV0FBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNoRCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxtQ0FBbUMsRUFBRSxLQUFLO1lBQzlDLE1BQU0sYUFBYSxHQUFHLElBQUksNkJBQWEsQ0FBQyxhQUFhLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFFdkUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsaUJBQWlCLENBQUMsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUV6RixNQUFNLFVBQVUsR0FBRyxNQUFNLGFBQWEsQ0FBQyxJQUFJLENBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLENBQUM7WUFDcEYsTUFBTSxXQUFXLEdBQUcsTUFBTSxhQUFhLENBQUMsSUFBSSxDQUFDLFNBQUcsQ0FBQyxLQUFLLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxDQUFDO1lBQ3JGLE1BQU0sQ0FBQyxXQUFXLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3RDLE1BQU0sQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3hDLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLDZDQUE2QyxFQUFFLEtBQUs7WUFDeEQsTUFBTSxhQUFhLEdBQUcsSUFBSSw2QkFBYSxDQUFDLGFBQWEsRUFBRSxjQUFjLENBQUMsQ0FBQztZQUV2RSxLQUFLLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRXhGLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQztZQUNsQixLQUFLLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUM7Z0JBQ3RDLElBQUksRUFBRSxDQUFDLFFBQWEsRUFBRSxFQUFFO29CQUN2QixTQUFTLEVBQUUsQ0FBQztvQkFDWixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzlCLENBQUM7YUFDRCxDQUFDLENBQUMsQ0FBQztZQUVKLE1BQU0sYUFBYSxDQUFDLElBQUksQ0FBQyxTQUFHLENBQUMsS0FBSyxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQztZQUM1RCxNQUFNLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNqQyxNQUFNLGFBQWEsQ0FBQyxJQUFJLENBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDbEMsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsd0VBQXdFLEVBQUUsS0FBSztZQUNuRixNQUFNLGFBQWEsR0FBRyxJQUFJLDZCQUFhLENBQUMsYUFBYSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBRXZFLEtBQUssQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLGlCQUFpQixDQUFDO2dCQUN6QyxVQUFVLEVBQUUsQ0FBQyxRQUFRLEVBQUUsRUFBRTtvQkFDeEIsZ0RBQWdEO29CQUNoRCxNQUFNLENBQUMsV0FBVyxDQUFDLFFBQVEsWUFBWSxTQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7b0JBQ25ELE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDL0IsQ0FBQzthQUNELENBQUMsQ0FBQyxDQUFDO1lBQ0osTUFBTSxhQUFhLENBQUMsSUFBSSxDQUFDLDRCQUE0QixDQUFDLENBQUM7WUFDdkQsTUFBTSxhQUFhLENBQUMsSUFBSSxDQUFDLHNFQUFzRSxDQUFDLENBQUM7UUFDbEcsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsd0NBQXdDLEVBQUUsS0FBSztZQUNuRCxNQUFNLGFBQWEsR0FBRyxJQUFJLDZCQUFhLENBQUMsYUFBYSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBRXZFLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztZQUNYLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQztnQkFDL0IsVUFBVSxFQUFFLEdBQUcsRUFBRTtvQkFDaEIsRUFBRSxFQUFFLENBQUM7b0JBQ0wsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUM5QixDQUFDO2FBQ0QsQ0FBQyxDQUFDO1lBRUgsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ1gsYUFBYSxDQUFDLGlCQUFpQixDQUFDO2dCQUMvQixVQUFVLEVBQUUsR0FBRyxFQUFFO29CQUNoQixFQUFFLEVBQUUsQ0FBQztvQkFDTCxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzlCLENBQUM7YUFDRCxDQUFDLENBQUM7WUFFSCxJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7WUFDbEIsYUFBYSxDQUFDLGNBQWMsQ0FBQztnQkFDNUIsSUFBSSxFQUFFLENBQUMsUUFBYSxFQUFFLEVBQUU7b0JBQ3ZCLFNBQVMsRUFBRSxDQUFDO29CQUNaLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDOUIsQ0FBQzthQUNELENBQUMsQ0FBQztZQUVILE1BQU0sYUFBYSxDQUFDLElBQUksQ0FBQyxTQUFHLENBQUMsS0FBSyxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQztZQUM1RCxNQUFNLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNqQyxNQUFNLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMxQixNQUFNLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMxQixNQUFNLGFBQWEsQ0FBQyxJQUFJLENBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDakMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDMUIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDM0IsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsaUVBQWlFLEVBQUUsS0FBSztZQUM1RSxNQUFNLGFBQWEsR0FBRyxJQUFJLDZCQUFhLENBQUMsYUFBYSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBRXZFLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztZQUNYLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQztnQkFDL0IsVUFBVSxFQUFFLEdBQUcsRUFBRTtvQkFDaEIsRUFBRSxFQUFFLENBQUM7b0JBQ0wsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUMvQixDQUFDO2FBQ0QsQ0FBQyxDQUFDO1lBRUgsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ1gsYUFBYSxDQUFDLGlCQUFpQixDQUFDO2dCQUMvQixVQUFVLEVBQUUsR0FBRyxFQUFFO29CQUNoQixFQUFFLEVBQUUsQ0FBQztvQkFDTCxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzlCLENBQUM7YUFDRCxDQUFDLENBQUM7WUFFSCxJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7WUFDbEIsYUFBYSxDQUFDLGNBQWMsQ0FBQztnQkFDNUIsSUFBSSxFQUFFLENBQUMsUUFBYSxFQUFFLEVBQUU7b0JBQ3ZCLFNBQVMsRUFBRSxDQUFDO29CQUNaLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDOUIsQ0FBQzthQUNELENBQUMsQ0FBQztZQUVILE1BQU0sYUFBYSxDQUFDLElBQUksQ0FBQyxTQUFHLENBQUMsS0FBSyxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQztZQUM1RCxNQUFNLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNqQyxNQUFNLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMxQixNQUFNLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMxQixNQUFNLGFBQWEsQ0FBQyxJQUFJLENBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDakMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDMUIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDM0IsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsZUFBZSxFQUFFO1lBQ3JCLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBQSxzQkFBYSxFQUFDLHVCQUF1QixFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDM0QsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFBLHNCQUFhLEVBQUMsc0JBQXNCLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUN6RCxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUEsc0JBQWEsRUFBQyx1QkFBdUIsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQzNELE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBQSxzQkFBYSxFQUFDLHNCQUFzQixFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDekQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFBLHNCQUFhLEVBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDdEUsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFBLHNCQUFhLEVBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDcEUsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFBLHNCQUFhLEVBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDdEUsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFBLHNCQUFhLEVBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDcEUsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUEsc0JBQWEsRUFBQyxTQUFHLENBQUMsS0FBSyxDQUFDLHVCQUF1QixDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUN0RSxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBQSxzQkFBYSxFQUFDLFNBQUcsQ0FBQyxLQUFLLENBQUMscUJBQXFCLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ3BFLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFBLHNCQUFhLEVBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDbkUsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsbUJBQW1CLEVBQUU7WUFDekIsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFBLDBCQUFpQixFQUFDLHVCQUF1QixFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ3ZFLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBQSwwQkFBaUIsRUFBQyxzQkFBc0IsRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUN0RSxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBQSwwQkFBaUIsRUFBQyxtQkFBbUIsRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUNyRSxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxvQkFBb0IsRUFBRSxLQUFLO1lBQy9CLE1BQU0sYUFBYSxHQUFHLElBQUksNkJBQWEsQ0FBQyxhQUFhLEVBQUUsdUNBQWtCLENBQUMsQ0FBQztZQUUzRSxJQUFJO2dCQUNILE1BQU0sYUFBYSxDQUFDLGtCQUFrQixDQUFDLFNBQUcsQ0FBQyxLQUFLLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxDQUFDO2dCQUMvRSxNQUFNLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUM7YUFDckM7WUFBQyxNQUFNO2dCQUNQLEtBQUs7YUFDTDtZQUVELE1BQU0sVUFBVSxHQUFHLGFBQWEsQ0FBQywyQkFBMkIsQ0FBQztnQkFDNUQsS0FBSyxDQUFDLGtCQUFrQixDQUFDLEdBQUc7b0JBQzNCLE9BQU8sRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLE9BQU8sS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDekMsQ0FBQzthQUNELENBQUMsQ0FBQztZQUVILE1BQU0sTUFBTSxHQUFHLE1BQU0sYUFBYSxDQUFDLGtCQUFrQixDQUFDLFNBQUcsQ0FBQyxLQUFLLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxDQUFDO1lBQzlGLE1BQU0sQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsRUFBRSwyQkFBMkIsQ0FBQyxDQUFDO1lBQ2hGLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUN0QixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyw4RkFBOEYsRUFBRSxLQUFLO1lBQ3pHLE1BQU0sYUFBYSxHQUFHLElBQUksNkJBQWEsQ0FBQyxhQUFhLEVBQUUsdUNBQWtCLENBQUMsQ0FBQztZQUUzRSxNQUFNLE1BQU0sR0FBYSxFQUFFLENBQUM7WUFFNUIsYUFBYSxDQUFDLHdCQUF3QixDQUFDO2dCQUN0QyxLQUFLLENBQUMsWUFBWSxDQUFDLElBQUk7b0JBQ3RCLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ2xCLE9BQU8sSUFBSSxDQUFDO2dCQUNiLENBQUM7YUFDRCxDQUFDLENBQUM7WUFFSCxNQUFNLElBQUksR0FBRyw0R0FBNEcsQ0FBQztZQUMxSCxNQUFNLEdBQUcsR0FBRyxTQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRTVCLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxhQUFhLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDekMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUUxQyxNQUFNLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRTtnQkFDOUIsU0FBUyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzdCLElBQUksQ0FBQyxPQUFPO2FBQ1osQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQyJ9