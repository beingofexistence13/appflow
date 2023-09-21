/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostNotebookEditor"], function (require, exports, event_1, extHost_protocol_1, extHostNotebookEditor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostNotebookRenderers = void 0;
    class ExtHostNotebookRenderers {
        constructor(mainContext, _extHostNotebook) {
            this._extHostNotebook = _extHostNotebook;
            this._rendererMessageEmitters = new Map();
            this.proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadNotebookRenderers);
        }
        $postRendererMessage(editorId, rendererId, message) {
            const editor = this._extHostNotebook.getEditorById(editorId);
            this._rendererMessageEmitters.get(rendererId)?.fire({ editor: editor.apiEditor, message });
        }
        createRendererMessaging(manifest, rendererId) {
            if (!manifest.contributes?.notebookRenderer?.some(r => r.id === rendererId)) {
                throw new Error(`Extensions may only call createRendererMessaging() for renderers they contribute (got ${rendererId})`);
            }
            const messaging = {
                onDidReceiveMessage: (listener, thisArg, disposables) => {
                    return this.getOrCreateEmitterFor(rendererId).event(listener, thisArg, disposables);
                },
                postMessage: (message, editorOrAlias) => {
                    if (extHostNotebookEditor_1.ExtHostNotebookEditor.apiEditorsToExtHost.has(message)) { // back compat for swapped args
                        [message, editorOrAlias] = [editorOrAlias, message];
                    }
                    const extHostEditor = editorOrAlias && extHostNotebookEditor_1.ExtHostNotebookEditor.apiEditorsToExtHost.get(editorOrAlias);
                    return this.proxy.$postMessage(extHostEditor?.id, rendererId, message);
                },
            };
            return messaging;
        }
        getOrCreateEmitterFor(rendererId) {
            let emitter = this._rendererMessageEmitters.get(rendererId);
            if (emitter) {
                return emitter;
            }
            emitter = new event_1.Emitter({
                onDidRemoveLastListener: () => {
                    emitter?.dispose();
                    this._rendererMessageEmitters.delete(rendererId);
                }
            });
            this._rendererMessageEmitters.set(rendererId, emitter);
            return emitter;
        }
    }
    exports.ExtHostNotebookRenderers = ExtHostNotebookRenderers;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdE5vdGVib29rUmVuZGVyZXJzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9jb21tb24vZXh0SG9zdE5vdGVib29rUmVuZGVyZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVVoRyxNQUFhLHdCQUF3QjtRQUlwQyxZQUFZLFdBQXlCLEVBQW1CLGdCQUEyQztZQUEzQyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQTJCO1lBSGxGLDZCQUF3QixHQUFHLElBQUksR0FBRyxFQUFxRixDQUFDO1lBSXhJLElBQUksQ0FBQyxLQUFLLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQyw4QkFBVyxDQUFDLDJCQUEyQixDQUFDLENBQUM7UUFDNUUsQ0FBQztRQUVNLG9CQUFvQixDQUFDLFFBQWdCLEVBQUUsVUFBa0IsRUFBRSxPQUFnQjtZQUNqRixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzdELElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUM1RixDQUFDO1FBRU0sdUJBQXVCLENBQUMsUUFBK0IsRUFBRSxVQUFrQjtZQUNqRixJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLFVBQVUsQ0FBQyxFQUFFO2dCQUM1RSxNQUFNLElBQUksS0FBSyxDQUFDLHlGQUF5RixVQUFVLEdBQUcsQ0FBQyxDQUFDO2FBQ3hIO1lBRUQsTUFBTSxTQUFTLEdBQXFDO2dCQUNuRCxtQkFBbUIsRUFBRSxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLEVBQUU7b0JBQ3ZELE9BQU8sSUFBSSxDQUFDLHFCQUFxQixDQUFDLFVBQVUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLFdBQVcsQ0FBQyxDQUFDO2dCQUNyRixDQUFDO2dCQUNELFdBQVcsRUFBRSxDQUFDLE9BQU8sRUFBRSxhQUFhLEVBQUUsRUFBRTtvQkFDdkMsSUFBSSw2Q0FBcUIsQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSwrQkFBK0I7d0JBQzVGLENBQUMsT0FBTyxFQUFFLGFBQWEsQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxDQUFDO3FCQUNwRDtvQkFFRCxNQUFNLGFBQWEsR0FBRyxhQUFhLElBQUksNkNBQXFCLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO29CQUNwRyxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLGFBQWEsRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUN4RSxDQUFDO2FBQ0QsQ0FBQztZQUVGLE9BQU8sU0FBUyxDQUFDO1FBQ2xCLENBQUM7UUFFTyxxQkFBcUIsQ0FBQyxVQUFrQjtZQUMvQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzVELElBQUksT0FBTyxFQUFFO2dCQUNaLE9BQU8sT0FBTyxDQUFDO2FBQ2Y7WUFFRCxPQUFPLEdBQUcsSUFBSSxlQUFPLENBQUM7Z0JBQ3JCLHVCQUF1QixFQUFFLEdBQUcsRUFBRTtvQkFDN0IsT0FBTyxFQUFFLE9BQU8sRUFBRSxDQUFDO29CQUNuQixJQUFJLENBQUMsd0JBQXdCLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUNsRCxDQUFDO2FBQ0QsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLHdCQUF3QixDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFFdkQsT0FBTyxPQUFPLENBQUM7UUFDaEIsQ0FBQztLQUNEO0lBcERELDREQW9EQyJ9