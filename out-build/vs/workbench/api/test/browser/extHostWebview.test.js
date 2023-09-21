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
            disposables = new lifecycle_1.$jc();
            const shape = createNoopMainThreadWebviews();
            rpcProtocol = (0, testRPCProtocol_1.$2dc)(shape);
        });
        teardown(() => {
            disposables.dispose();
        });
        (0, utils_1.$bT)();
        function createWebview(rpcProtocol, remoteAuthority) {
            const extHostWebviews = disposables.add(new extHostWebview_1.$_bc(rpcProtocol, {
                authority: remoteAuthority,
                isRemote: !!remoteAuthority,
            }, undefined, new log_1.$fj(), extHostApiDeprecationService_1.$bbc));
            const extHostWebviewPanels = disposables.add(new extHostWebviewPanels_1.$Lcc(rpcProtocol, extHostWebviews, undefined));
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
            const extHostWebviews = disposables.add(new extHostWebview_1.$_bc(rpcProtocol, { authority: undefined, isRemote: false }, undefined, new log_1.$fj(), extHostApiDeprecationService_1.$bbc));
            const extHostWebviewPanels = disposables.add(new extHostWebviewPanels_1.$Lcc(rpcProtocol, extHostWebviews, undefined));
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
            assert.strictEqual((webview.webview.asWebviewUri(uri_1.URI.parse('file:///Users/codey/file.html')).toString()), `https://file%2B.vscode-resource.${webview_1.$Vob}/Users/codey/file.html`, 'Unix basic');
            assert.strictEqual((webview.webview.asWebviewUri(uri_1.URI.parse('file:///Users/codey/file.html#frag')).toString()), `https://file%2B.vscode-resource.${webview_1.$Vob}/Users/codey/file.html#frag`, 'Unix should preserve fragment');
            assert.strictEqual((webview.webview.asWebviewUri(uri_1.URI.parse('file:///Users/codey/f%20ile.html')).toString()), `https://file%2B.vscode-resource.${webview_1.$Vob}/Users/codey/f%20ile.html`, 'Unix with encoding');
            assert.strictEqual((webview.webview.asWebviewUri(uri_1.URI.parse('file://localhost/Users/codey/file.html')).toString()), `https://file%2Blocalhost.vscode-resource.${webview_1.$Vob}/Users/codey/file.html`, 'Unix should preserve authority');
            assert.strictEqual((webview.webview.asWebviewUri(uri_1.URI.parse('file:///c:/codey/file.txt')).toString()), `https://file%2B.vscode-resource.${webview_1.$Vob}/c%3A/codey/file.txt`, 'Windows C drive');
        });
        test('asWebviewUri for remote file paths', () => {
            const webview = createWebview(rpcProtocol, /* remoteAuthority */ 'remote');
            assert.strictEqual((webview.webview.asWebviewUri(uri_1.URI.parse('file:///Users/codey/file.html')).toString()), `https://vscode-remote%2Bremote.vscode-resource.${webview_1.$Vob}/Users/codey/file.html`, 'Unix basic');
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
            assert.strictEqual((0, webview_1.$Zob)(webviewUri.authority), `vscode-remote+${authority}.vscode-resource.vscode-cdn.net`, 'Check decoded authority');
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
            assert.strictEqual((0, webview_1.$Zob)(webviewUri.authority), `vscode-remote+${authority}.vscode-resource.vscode-cdn.net`, 'Check decoded authority');
        });
    });
    function createNoopMainThreadWebviews() {
        return new class extends (0, mock_1.$rT)() {
            $disposeWebview() { }
            $createWebviewPanel() { }
            $registerSerializer() { }
            $unregisterSerializer() { }
        };
    }
});
//# sourceMappingURL=extHostWebview.test.js.map