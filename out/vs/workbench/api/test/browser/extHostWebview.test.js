/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/uri", "vs/base/test/common/mock", "vs/base/test/common/utils", "vs/platform/log/common/log", "vs/workbench/api/common/extHostApiDeprecationService", "vs/workbench/api/common/extHostWebview", "vs/workbench/api/common/extHostWebviewPanels", "vs/workbench/api/test/common/testRPCProtocol", "vs/workbench/contrib/webview/common/webview"], function (require, exports, assert, lifecycle_1, network_1, uri_1, mock_1, utils_1, log_1, extHostApiDeprecationService_1, extHostWebview_1, extHostWebviewPanels_1, testRPCProtocol_1, webview_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ExtHostWebview', () => {
        let disposables;
        let rpcProtocol;
        setup(() => {
            disposables = new lifecycle_1.DisposableStore();
            const shape = createNoopMainThreadWebviews();
            rpcProtocol = (0, testRPCProtocol_1.SingleProxyRPCProtocol)(shape);
        });
        teardown(() => {
            disposables.dispose();
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        function createWebview(rpcProtocol, remoteAuthority) {
            const extHostWebviews = disposables.add(new extHostWebview_1.ExtHostWebviews(rpcProtocol, {
                authority: remoteAuthority,
                isRemote: !!remoteAuthority,
            }, undefined, new log_1.NullLogService(), extHostApiDeprecationService_1.NullApiDeprecationService));
            const extHostWebviewPanels = disposables.add(new extHostWebviewPanels_1.ExtHostWebviewPanels(rpcProtocol, extHostWebviews, undefined));
            return disposables.add(extHostWebviewPanels.createWebviewPanel({
                extensionLocation: uri_1.URI.from({
                    scheme: remoteAuthority ? network_1.Schemas.vscodeRemote : network_1.Schemas.file,
                    authority: remoteAuthority,
                    path: '/ext/path',
                })
            }, 'type', 'title', 1, {}));
        }
        test('Cannot register multiple serializers for the same view type', async () => {
            const viewType = 'view.type';
            const extHostWebviews = disposables.add(new extHostWebview_1.ExtHostWebviews(rpcProtocol, { authority: undefined, isRemote: false }, undefined, new log_1.NullLogService(), extHostApiDeprecationService_1.NullApiDeprecationService));
            const extHostWebviewPanels = disposables.add(new extHostWebviewPanels_1.ExtHostWebviewPanels(rpcProtocol, extHostWebviews, undefined));
            let lastInvokedDeserializer = undefined;
            class NoopSerializer {
                async deserializeWebviewPanel(webview, _state) {
                    lastInvokedDeserializer = this;
                    disposables.add(webview);
                }
            }
            const extension = {};
            const serializerA = new NoopSerializer();
            const serializerB = new NoopSerializer();
            const serializerARegistration = extHostWebviewPanels.registerWebviewPanelSerializer(extension, viewType, serializerA);
            await extHostWebviewPanels.$deserializeWebviewPanel('x', viewType, {
                title: 'title',
                state: {},
                panelOptions: {},
                webviewOptions: {},
                active: true,
            }, 0);
            assert.strictEqual(lastInvokedDeserializer, serializerA);
            assert.throws(() => disposables.add(extHostWebviewPanels.registerWebviewPanelSerializer(extension, viewType, serializerB)), 'Should throw when registering two serializers for the same view');
            serializerARegistration.dispose();
            disposables.add(extHostWebviewPanels.registerWebviewPanelSerializer(extension, viewType, serializerB));
            await extHostWebviewPanels.$deserializeWebviewPanel('x', viewType, {
                title: 'title',
                state: {},
                panelOptions: {},
                webviewOptions: {},
                active: true,
            }, 0);
            assert.strictEqual(lastInvokedDeserializer, serializerB);
        });
        test('asWebviewUri for local file paths', () => {
            const webview = createWebview(rpcProtocol, /* remoteAuthority */ undefined);
            assert.strictEqual((webview.webview.asWebviewUri(uri_1.URI.parse('file:///Users/codey/file.html')).toString()), `https://file%2B.vscode-resource.${webview_1.webviewResourceBaseHost}/Users/codey/file.html`, 'Unix basic');
            assert.strictEqual((webview.webview.asWebviewUri(uri_1.URI.parse('file:///Users/codey/file.html#frag')).toString()), `https://file%2B.vscode-resource.${webview_1.webviewResourceBaseHost}/Users/codey/file.html#frag`, 'Unix should preserve fragment');
            assert.strictEqual((webview.webview.asWebviewUri(uri_1.URI.parse('file:///Users/codey/f%20ile.html')).toString()), `https://file%2B.vscode-resource.${webview_1.webviewResourceBaseHost}/Users/codey/f%20ile.html`, 'Unix with encoding');
            assert.strictEqual((webview.webview.asWebviewUri(uri_1.URI.parse('file://localhost/Users/codey/file.html')).toString()), `https://file%2Blocalhost.vscode-resource.${webview_1.webviewResourceBaseHost}/Users/codey/file.html`, 'Unix should preserve authority');
            assert.strictEqual((webview.webview.asWebviewUri(uri_1.URI.parse('file:///c:/codey/file.txt')).toString()), `https://file%2B.vscode-resource.${webview_1.webviewResourceBaseHost}/c%3A/codey/file.txt`, 'Windows C drive');
        });
        test('asWebviewUri for remote file paths', () => {
            const webview = createWebview(rpcProtocol, /* remoteAuthority */ 'remote');
            assert.strictEqual((webview.webview.asWebviewUri(uri_1.URI.parse('file:///Users/codey/file.html')).toString()), `https://vscode-remote%2Bremote.vscode-resource.${webview_1.webviewResourceBaseHost}/Users/codey/file.html`, 'Unix basic');
        });
        test('asWebviewUri for remote with / and + in name', () => {
            const webview = createWebview(rpcProtocol, /* remoteAuthority */ 'remote');
            const authority = 'ssh-remote+localhost=foo/bar';
            const sourceUri = uri_1.URI.from({
                scheme: 'vscode-remote',
                authority: authority,
                path: '/Users/cody/x.png'
            });
            const webviewUri = webview.webview.asWebviewUri(sourceUri);
            assert.strictEqual(webviewUri.toString(), `https://vscode-remote%2Bssh-002dremote-002blocalhost-003dfoo-002fbar.vscode-resource.vscode-cdn.net/Users/cody/x.png`, 'Check transform');
            assert.strictEqual((0, webview_1.decodeAuthority)(webviewUri.authority), `vscode-remote+${authority}.vscode-resource.vscode-cdn.net`, 'Check decoded authority');
        });
        test('asWebviewUri for remote with port in name', () => {
            const webview = createWebview(rpcProtocol, /* remoteAuthority */ 'remote');
            const authority = 'localhost:8080';
            const sourceUri = uri_1.URI.from({
                scheme: 'vscode-remote',
                authority: authority,
                path: '/Users/cody/x.png'
            });
            const webviewUri = webview.webview.asWebviewUri(sourceUri);
            assert.strictEqual(webviewUri.toString(), `https://vscode-remote%2Blocalhost-003a8080.vscode-resource.vscode-cdn.net/Users/cody/x.png`, 'Check transform');
            assert.strictEqual((0, webview_1.decodeAuthority)(webviewUri.authority), `vscode-remote+${authority}.vscode-resource.vscode-cdn.net`, 'Check decoded authority');
        });
    });
    function createNoopMainThreadWebviews() {
        return new class extends (0, mock_1.mock)() {
            $disposeWebview() { }
            $createWebviewPanel() { }
            $registerSerializer() { }
            $unregisterSerializer() { }
        };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFdlYnZpZXcudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvdGVzdC9icm93c2VyL2V4dEhvc3RXZWJ2aWV3LnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFxQmhHLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxHQUFHLEVBQUU7UUFDNUIsSUFBSSxXQUE0QixDQUFDO1FBQ2pDLElBQUksV0FBK0QsQ0FBQztRQUVwRSxLQUFLLENBQUMsR0FBRyxFQUFFO1lBQ1YsV0FBVyxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1lBRXBDLE1BQU0sS0FBSyxHQUFHLDRCQUE0QixFQUFFLENBQUM7WUFDN0MsV0FBVyxHQUFHLElBQUEsd0NBQXNCLEVBQUMsS0FBSyxDQUFDLENBQUM7UUFDN0MsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsR0FBRyxFQUFFO1lBQ2IsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3ZCLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1FBRTFDLFNBQVMsYUFBYSxDQUFDLFdBQStELEVBQUUsZUFBbUM7WUFDMUgsTUFBTSxlQUFlLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLGdDQUFlLENBQUMsV0FBWSxFQUFFO2dCQUN6RSxTQUFTLEVBQUUsZUFBZTtnQkFDMUIsUUFBUSxFQUFFLENBQUMsQ0FBQyxlQUFlO2FBQzNCLEVBQUUsU0FBUyxFQUFFLElBQUksb0JBQWMsRUFBRSxFQUFFLHdEQUF5QixDQUFDLENBQUMsQ0FBQztZQUVoRSxNQUFNLG9CQUFvQixHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSwyQ0FBb0IsQ0FBQyxXQUFZLEVBQUUsZUFBZSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFFakgsT0FBTyxXQUFXLENBQUMsR0FB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