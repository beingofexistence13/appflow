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
define(["require", "exports", "vs/base/common/lifecycle", "vs/workbench/contrib/inlineChat/common/inlineChat", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/api/browser/mainThreadBulkEdits", "vs/workbench/api/common/extHost.protocol", "vs/workbench/services/extensions/common/extHostCustomers"], function (require, exports, lifecycle_1, inlineChat_1, uriIdentity_1, mainThreadBulkEdits_1, extHost_protocol_1, extHostCustomers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadInlineChat = void 0;
    let MainThreadInlineChat = class MainThreadInlineChat {
        constructor(extHostContext, _inlineChatService, _uriIdentService) {
            this._inlineChatService = _inlineChatService;
            this._uriIdentService = _uriIdentService;
            this._registrations = new lifecycle_1.DisposableMap();
            this._progresses = new Map();
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostInlineChat);
        }
        dispose() {
            this._registrations.dispose();
        }
        async $registerInteractiveEditorProvider(handle, label, debugName, supportsFeedback) {
            const unreg = this._inlineChatService.addProvider({
                debugName,
                label,
                prepareInlineChatSession: async (model, range, token) => {
                    const session = await this._proxy.$prepareSession(handle, model.uri, range, token);
                    if (!session) {
                        return undefined;
                    }
                    return {
                        ...session,
                        dispose: () => {
                            this._proxy.$releaseSession(handle, session.id);
                        }
                    };
                },
                provideResponse: async (item, request, progress, token) => {
                    this._progresses.set(request.requestId, progress);
                    try {
                        const result = await this._proxy.$provideResponse(handle, item, request, token);
                        if (result?.type === 'bulkEdit') {
                            result.edits = (0, mainThreadBulkEdits_1.reviveWorkspaceEditDto)(result.edits, this._uriIdentService);
                        }
                        return result;
                    }
                    finally {
                        this._progresses.delete(request.requestId);
                    }
                },
                handleInlineChatResponseFeedback: !supportsFeedback ? undefined : async (session, response, kind) => {
                    this._proxy.$handleFeedback(handle, session.id, response.id, kind);
                }
            });
            this._registrations.set(handle, unreg);
        }
        async $handleProgressChunk(requestId, chunk) {
            this._progresses.get(requestId)?.report(chunk);
        }
        async $unregisterInteractiveEditorProvider(handle) {
            this._registrations.deleteAndDispose(handle);
        }
    };
    exports.MainThreadInlineChat = MainThreadInlineChat;
    exports.MainThreadInlineChat = MainThreadInlineChat = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadInlineChat),
        __param(1, inlineChat_1.IInlineChatService),
        __param(2, uriIdentity_1.IUriIdentityService)
    ], MainThreadInlineChat);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZElubGluZUNoYXQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2Jyb3dzZXIvbWFpblRocmVhZElubGluZUNoYXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBWXpGLElBQU0sb0JBQW9CLEdBQTFCLE1BQU0sb0JBQW9CO1FBT2hDLFlBQ0MsY0FBK0IsRUFDWCxrQkFBdUQsRUFDdEQsZ0JBQXNEO1lBRHRDLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0I7WUFDckMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFxQjtZQVIzRCxtQkFBYyxHQUFHLElBQUkseUJBQWEsRUFBVSxDQUFDO1lBRzdDLGdCQUFXLEdBQUcsSUFBSSxHQUFHLEVBQTBCLENBQUM7WUFPaEUsSUFBSSxDQUFDLE1BQU0sR0FBRyxjQUFjLENBQUMsUUFBUSxDQUFDLGlDQUFjLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUN6RSxDQUFDO1FBRUQsT0FBTztZQUNOLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDL0IsQ0FBQztRQUVELEtBQUssQ0FBQyxrQ0FBa0MsQ0FBQyxNQUFjLEVBQUUsS0FBYSxFQUFFLFNBQWlCLEVBQUUsZ0JBQXlCO1lBQ25ILE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLENBQUM7Z0JBQ2pELFNBQVM7Z0JBQ1QsS0FBSztnQkFDTCx3QkFBd0IsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRTtvQkFDdkQsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7b0JBQ25GLElBQUksQ0FBQyxPQUFPLEVBQUU7d0JBQ2IsT0FBTyxTQUFTLENBQUM7cUJBQ2pCO29CQUNELE9BQU87d0JBQ04sR0FBRyxPQUFPO3dCQUNWLE9BQU8sRUFBRSxHQUFHLEVBQUU7NEJBQ2IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQzt3QkFDakQsQ0FBQztxQkFDRCxDQUFDO2dCQUNILENBQUM7Z0JBQ0QsZUFBZSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsRUFBRTtvQkFDekQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztvQkFDbEQsSUFBSTt3QkFDSCxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7d0JBQ2hGLElBQUksTUFBTSxFQUFFLElBQUksS0FBSyxVQUFVLEVBQUU7NEJBQ0YsTUFBTyxDQUFDLEtBQUssR0FBRyxJQUFBLDRDQUFzQixFQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7eUJBQzFHO3dCQUNELE9BQXdDLE1BQU0sQ0FBQztxQkFDL0M7NEJBQVM7d0JBQ1QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO3FCQUMzQztnQkFDRixDQUFDO2dCQUNELGdDQUFnQyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLEVBQUU7b0JBQ25HLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsRUFBRSxFQUFFLFFBQVEsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ3BFLENBQUM7YUFDRCxDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDeEMsQ0FBQztRQUVELEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxTQUFpQixFQUFFLEtBQXVFO1lBQ3BILElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNoRCxDQUFDO1FBRUQsS0FBSyxDQUFDLG9DQUFvQyxDQUFDLE1BQWM7WUFDeEQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM5QyxDQUFDO0tBQ0QsQ0FBQTtJQTlEWSxvREFBb0I7bUNBQXBCLG9CQUFvQjtRQURoQyxJQUFBLHVDQUFvQixFQUFDLDhCQUFXLENBQUMsb0JBQW9CLENBQUM7UUFVcEQsV0FBQSwrQkFBa0IsQ0FBQTtRQUNsQixXQUFBLGlDQUFtQixDQUFBO09BVlQsb0JBQW9CLENBOERoQyJ9