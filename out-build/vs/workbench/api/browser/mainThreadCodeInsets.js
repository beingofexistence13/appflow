/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/base/common/uri", "vs/editor/browser/services/codeEditorService", "vs/workbench/api/browser/mainThreadWebviews", "vs/workbench/api/common/extHost.protocol", "vs/workbench/contrib/webview/browser/webview", "vs/workbench/services/extensions/common/extHostCustomers"], function (require, exports, lifecycle_1, resources_1, uri_1, codeEditorService_1, mainThreadWebviews_1, extHost_protocol_1, webview_1, extHostCustomers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$dcb = void 0;
    // todo@jrieken move these things back into something like contrib/insets
    class EditorWebviewZone {
        // suppressMouseDown?: boolean | undefined;
        // heightInPx?: number | undefined;
        // minWidthInPx?: number | undefined;
        // marginDomNode?: HTMLElement | null | undefined;
        // onDomNodeTop?: ((top: number) => void) | undefined;
        // onComputedHeight?: ((height: number) => void) | undefined;
        constructor(editor, line, height, webview) {
            this.editor = editor;
            this.line = line;
            this.height = height;
            this.webview = webview;
            this.domNode = document.createElement('div');
            this.domNode.style.zIndex = '10'; // without this, the webview is not interactive
            this.afterLineNumber = line;
            this.afterColumn = 1;
            this.heightInLines = height;
            editor.changeViewZones(accessor => this.a = accessor.addZone(this));
            webview.mountTo(this.domNode);
        }
        dispose() {
            this.editor.changeViewZones(accessor => this.a && accessor.removeZone(this.a));
        }
    }
    let $dcb = class $dcb {
        constructor(context, d, e) {
            this.d = d;
            this.e = e;
            this.b = new lifecycle_1.$jc();
            this.c = new Map();
            this.a = context.getProxy(extHost_protocol_1.$2J.ExtHostEditorInsets);
        }
        dispose() {
            this.b.dispose();
        }
        async $createEditorInset(handle, id, uri, line, height, options, extensionId, extensionLocation) {
            let editor;
            id = id.substr(0, id.indexOf(',')); //todo@jrieken HACK
            for (const candidate of this.d.listCodeEditors()) {
                if (candidate.getId() === id && candidate.hasModel() && (0, resources_1.$bg)(candidate.getModel().uri, uri_1.URI.revive(uri))) {
                    editor = candidate;
                    break;
                }
            }
            if (!editor) {
                setTimeout(() => this.a.$onDidDispose(handle));
                return;
            }
            const disposables = new lifecycle_1.$jc();
            const webview = this.e.createWebviewElement({
                title: undefined,
                options: {
                    enableFindWidget: false,
                },
                contentOptions: (0, mainThreadWebviews_1.$ccb)(options),
                extension: { id: extensionId, location: uri_1.URI.revive(extensionLocation) }
            });
            const webviewZone = new EditorWebviewZone(editor, line, height, webview);
            const remove = () => {
                disposables.dispose();
                this.a.$onDidDispose(handle);
                this.c.delete(handle);
            };
            disposables.add(editor.onDidChangeModel(remove));
            disposables.add(editor.onDidDispose(remove));
            disposables.add(webviewZone);
            disposables.add(webview);
            disposables.add(webview.onMessage(msg => this.a.$onDidReceiveMessage(handle, msg.message)));
            this.c.set(handle, webviewZone);
        }
        $disposeEditorInset(handle) {
            const inset = this.f(handle);
            this.c.delete(handle);
            inset.dispose();
        }
        $setHtml(handle, value) {
            const inset = this.f(handle);
            inset.webview.setHtml(value);
        }
        $setOptions(handle, options) {
            const inset = this.f(handle);
            inset.webview.contentOptions = (0, mainThreadWebviews_1.$ccb)(options);
        }
        async $postMessage(handle, value) {
            const inset = this.f(handle);
            inset.webview.postMessage(value);
            return true;
        }
        f(handle) {
            const inset = this.c.get(handle);
            if (!inset) {
                throw new Error('Unknown inset');
            }
            return inset;
        }
    };
    exports.$dcb = $dcb;
    exports.$dcb = $dcb = __decorate([
        (0, extHostCustomers_1.$jbb)(extHost_protocol_1.$1J.MainThreadEditorInsets),
        __param(1, codeEditorService_1.$nV),
        __param(2, webview_1.$Lbb)
    ], $dcb);
});
//# sourceMappingURL=mainThreadCodeInsets.js.map