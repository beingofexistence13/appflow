/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/workbench/contrib/webview/common/webview"], function (require, exports, event_1, lifecycle_1, webview_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ecc = void 0;
    class $ecc {
        constructor(d, e, f) {
            this.d = d;
            this.e = e;
            this.f = f;
            this.a = 0;
            this.b = new lifecycle_1.$jc();
            this.c = new Map();
            // dispose editor inset whenever the hosting editor goes away
            this.b.add(e.onDidChangeVisibleTextEditors(() => {
                const visibleEditor = e.getVisibleTextEditors();
                for (const value of this.c.values()) {
                    if (visibleEditor.indexOf(value.editor) < 0) {
                        value.inset.dispose(); // will remove from `this._insets`
                    }
                }
            }));
        }
        dispose() {
            this.c.forEach(value => value.inset.dispose());
            this.b.dispose();
        }
        createWebviewEditorInset(editor, line, height, options, extension) {
            let apiEditor;
            for (const candidate of this.e.getVisibleTextEditors(true)) {
                if (candidate.value === editor) {
                    apiEditor = candidate;
                    break;
                }
            }
            if (!apiEditor) {
                throw new Error('not a visible editor');
            }
            const that = this;
            const handle = this.a++;
            const onDidReceiveMessage = new event_1.$fd();
            const onDidDispose = new event_1.$fd();
            const webview = new class {
                constructor() {
                    this.a = '';
                    this.b = Object.create(null);
                }
                asWebviewUri(resource) {
                    return (0, webview_1.$Yob)(resource, that.f);
                }
                get cspSource() {
                    return webview_1.$Xob;
                }
                set options(value) {
                    this.b = value;
                    that.d.$setOptions(handle, value);
                }
                get options() {
                    return this.b;
                }
                set html(value) {
                    this.a = value;
                    that.d.$setHtml(handle, value);
                }
                get html() {
                    return this.a;
                }
                get onDidReceiveMessage() {
                    return onDidReceiveMessage.event;
                }
                postMessage(message) {
                    return that.d.$postMessage(handle, message);
                }
            };
            const inset = new class {
                constructor() {
                    this.editor = editor;
                    this.line = line;
                    this.height = height;
                    this.webview = webview;
                    this.onDidDispose = onDidDispose.event;
                }
                dispose() {
                    if (that.c.has(handle)) {
                        that.c.delete(handle);
                        that.d.$disposeEditorInset(handle);
                        onDidDispose.fire();
                        // final cleanup
                        onDidDispose.dispose();
                        onDidReceiveMessage.dispose();
                    }
                }
            };
            this.d.$createEditorInset(handle, apiEditor.id, apiEditor.value.document.uri, line + 1, height, options || {}, extension.identifier, extension.extensionLocation);
            this.c.set(handle, { editor, inset, onDidReceiveMessage });
            return inset;
        }
        $onDidDispose(handle) {
            const value = this.c.get(handle);
            if (value) {
                value.inset.dispose();
            }
        }
        $onDidReceiveMessage(handle, message) {
            const value = this.c.get(handle);
            value?.onDidReceiveMessage.fire(message);
        }
    }
    exports.$ecc = $ecc;
});
//# sourceMappingURL=extHostCodeInsets.js.map