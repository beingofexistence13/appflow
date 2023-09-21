/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/workbench/contrib/webview/common/webview"], function (require, exports, event_1, lifecycle_1, webview_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostEditorInsets = void 0;
    class ExtHostEditorInsets {
        constructor(_proxy, _editors, _remoteInfo) {
            this._proxy = _proxy;
            this._editors = _editors;
            this._remoteInfo = _remoteInfo;
            this._handlePool = 0;
            this._disposables = new lifecycle_1.DisposableStore();
            this._insets = new Map();
            // dispose editor inset whenever the hosting editor goes away
            this._disposables.add(_editors.onDidChangeVisibleTextEditors(() => {
                const visibleEditor = _editors.getVisibleTextEditors();
                for (const value of this._insets.values()) {
                    if (visibleEditor.indexOf(value.editor) < 0) {
                        value.inset.dispose(); // will remove from `this._insets`
                    }
                }
            }));
        }
        dispose() {
            this._insets.forEach(value => value.inset.dispose());
            this._disposables.dispose();
        }
        createWebviewEditorInset(editor, line, height, options, extension) {
            let apiEditor;
            for (const candidate of this._editors.getVisibleTextEditors(true)) {
                if (candidate.value === editor) {
                    apiEditor = candidate;
                    break;
                }
            }
            if (!apiEditor) {
                throw new Error('not a visible editor');
            }
            const that = this;
            const handle = this._handlePool++;
            const onDidReceiveMessage = new event_1.Emitter();
            const onDidDispose = new event_1.Emitter();
            const webview = new class {
                constructor() {
                    this._html = '';
                    this._options = Object.create(null);
                }
                asWebviewUri(resource) {
                    return (0, webview_1.asWebviewUri)(resource, that._remoteInfo);
                }
                get cspSource() {
                    return webview_1.webviewGenericCspSource;
                }
                set options(value) {
                    this._options = value;
                    that._proxy.$setOptions(handle, value);
                }
                get options() {
                    return this._options;
                }
                set html(value) {
                    this._html = value;
                    that._proxy.$setHtml(handle, value);
                }
                get html() {
                    return this._html;
                }
                get onDidReceiveMessage() {
                    return onDidReceiveMessage.event;
                }
                postMessage(message) {
                    return that._proxy.$postMessage(handle, message);
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
                    if (that._insets.has(handle)) {
                        that._insets.delete(handle);
                        that._proxy.$disposeEditorInset(handle);
                        onDidDispose.fire();
                        // final cleanup
                        onDidDispose.dispose();
                        onDidReceiveMessage.dispose();
                    }
                }
            };
            this._proxy.$createEditorInset(handle, apiEditor.id, apiEditor.value.document.uri, line + 1, height, options || {}, extension.identifier, extension.extensionLocation);
            this._insets.set(handle, { editor, inset, onDidReceiveMessage });
            return inset;
        }
        $onDidDispose(handle) {
            const value = this._insets.get(handle);
            if (value) {
                value.inset.dispose();
            }
        }
        $onDidReceiveMessage(handle, message) {
            const value = this._insets.get(handle);
            value?.onDidReceiveMessage.fire(message);
        }
    }
    exports.ExtHostEditorInsets = ExtHostEditorInsets;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdENvZGVJbnNldHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2NvbW1vbi9leHRIb3N0Q29kZUluc2V0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFXaEcsTUFBYSxtQkFBbUI7UUFNL0IsWUFDa0IsTUFBbUMsRUFDbkMsUUFBd0IsRUFDeEIsV0FBOEI7WUFGOUIsV0FBTSxHQUFOLE1BQU0sQ0FBNkI7WUFDbkMsYUFBUSxHQUFSLFFBQVEsQ0FBZ0I7WUFDeEIsZ0JBQVcsR0FBWCxXQUFXLENBQW1CO1lBUHhDLGdCQUFXLEdBQUcsQ0FBQyxDQUFDO1lBQ1AsaUJBQVksR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQUM5QyxZQUFPLEdBQUcsSUFBSSxHQUFHLEVBQThHLENBQUM7WUFRdkksNkRBQTZEO1lBQzdELElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyw2QkFBNkIsQ0FBQyxHQUFHLEVBQUU7Z0JBQ2pFLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO2dCQUN2RCxLQUFLLE1BQU0sS0FBSyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEVBQUU7b0JBQzFDLElBQUksYUFBYSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFO3dCQUM1QyxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsa0NBQWtDO3FCQUN6RDtpQkFDRDtZQUNGLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBRUQsT0FBTztZQUNOLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQ3JELElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDN0IsQ0FBQztRQUVELHdCQUF3QixDQUFDLE1BQXlCLEVBQUUsSUFBWSxFQUFFLE1BQWMsRUFBRSxPQUEwQyxFQUFFLFNBQWdDO1lBRTdKLElBQUksU0FBd0MsQ0FBQztZQUM3QyxLQUFLLE1BQU0sU0FBUyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ2xFLElBQUksU0FBUyxDQUFDLEtBQUssS0FBSyxNQUFNLEVBQUU7b0JBQy9CLFNBQVMsR0FBc0IsU0FBUyxDQUFDO29CQUN6QyxNQUFNO2lCQUNOO2FBQ0Q7WUFDRCxJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUNmLE1BQU0sSUFBSSxLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQzthQUN4QztZQUVELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQztZQUNsQixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDbEMsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLGVBQU8sRUFBTyxDQUFDO1lBQy9DLE1BQU0sWUFBWSxHQUFHLElBQUksZUFBTyxFQUFRLENBQUM7WUFFekMsTUFBTSxPQUFPLEdBQUcsSUFBSTtnQkFBQTtvQkFFWCxVQUFLLEdBQVcsRUFBRSxDQUFDO29CQUNuQixhQUFRLEdBQTBCLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBbUMvRCxDQUFDO2dCQWpDQSxZQUFZLENBQUMsUUFBb0I7b0JBQ2hDLE9BQU8sSUFBQSxzQkFBWSxFQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ2pELENBQUM7Z0JBRUQsSUFBSSxTQUFTO29CQUNaLE9BQU8saUNBQXVCLENBQUM7Z0JBQ2hDLENBQUM7Z0JBRUQsSUFBSSxPQUFPLENBQUMsS0FBNEI7b0JBQ3ZDLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO29CQUN0QixJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ3hDLENBQUM7Z0JBRUQsSUFBSSxPQUFPO29CQUNWLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztnQkFDdEIsQ0FBQztnQkFFRCxJQUFJLElBQUksQ0FBQyxLQUFhO29CQUNyQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztvQkFDbkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUNyQyxDQUFDO2dCQUVELElBQUksSUFBSTtvQkFDUCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUM7Z0JBQ25CLENBQUM7Z0JBRUQsSUFBSSxtQkFBbUI7b0JBQ3RCLE9BQU8sbUJBQW1CLENBQUMsS0FBSyxDQUFDO2dCQUNsQyxDQUFDO2dCQUVELFdBQVcsQ0FBQyxPQUFZO29CQUN2QixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFDbEQsQ0FBQzthQUNELENBQUM7WUFFRixNQUFNLEtBQUssR0FBRyxJQUFJO2dCQUFBO29CQUVSLFdBQU0sR0FBc0IsTUFBTSxDQUFDO29CQUNuQyxTQUFJLEdBQVcsSUFBSSxDQUFDO29CQUNwQixXQUFNLEdBQVcsTUFBTSxDQUFDO29CQUN4QixZQUFPLEdBQW1CLE9BQU8sQ0FBQztvQkFDbEMsaUJBQVksR0FBdUIsWUFBWSxDQUFDLEtBQUssQ0FBQztnQkFhaEUsQ0FBQztnQkFYQSxPQUFPO29CQUNOLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQzdCLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO3dCQUM1QixJQUFJLENBQUMsTUFBTSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxDQUFDO3dCQUN4QyxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUM7d0JBRXBCLGdCQUFnQjt3QkFDaEIsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO3dCQUN2QixtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsQ0FBQztxQkFDOUI7Z0JBQ0YsQ0FBQzthQUNELENBQUM7WUFFRixJQUFJLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsRUFBRSxFQUFFLFNBQVMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxJQUFJLEdBQUcsQ0FBQyxFQUFFLE1BQU0sRUFBRSxPQUFPLElBQUksRUFBRSxFQUFFLFNBQVMsQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDdkssSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxtQkFBbUIsRUFBRSxDQUFDLENBQUM7WUFFakUsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBRUQsYUFBYSxDQUFDLE1BQWM7WUFDM0IsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDdkMsSUFBSSxLQUFLLEVBQUU7Z0JBQ1YsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQzthQUN0QjtRQUNGLENBQUM7UUFFRCxvQkFBb0IsQ0FBQyxNQUFjLEVBQUUsT0FBWTtZQUNoRCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN2QyxLQUFLLEVBQUUsbUJBQW1CLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzFDLENBQUM7S0FDRDtJQTVIRCxrREE0SEMifQ==