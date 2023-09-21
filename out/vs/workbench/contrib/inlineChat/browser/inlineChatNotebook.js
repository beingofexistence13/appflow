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
define(["require", "exports", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/resources", "vs/workbench/contrib/inlineChat/browser/inlineChatController", "vs/workbench/contrib/inlineChat/browser/inlineChatSession", "vs/workbench/contrib/notebook/browser/services/notebookEditorService", "vs/workbench/contrib/notebook/common/notebookCommon"], function (require, exports, errors_1, lifecycle_1, network_1, resources_1, inlineChatController_1, inlineChatSession_1, notebookEditorService_1, notebookCommon_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InlineChatNotebookContribution = void 0;
    let InlineChatNotebookContribution = class InlineChatNotebookContribution {
        constructor(sessionService, notebookEditorService) {
            this._store = new lifecycle_1.DisposableStore();
            this._store.add(sessionService.registerSessionKeyComputer(network_1.Schemas.vscodeNotebookCell, {
                getComparisonKey: (_editor, uri) => {
                    const data = notebookCommon_1.CellUri.parse(uri);
                    if (!data) {
                        throw (0, errors_1.illegalState)('Expected notebook');
                    }
                    for (const editor of notebookEditorService.listNotebookEditors()) {
                        if ((0, resources_1.isEqual)(editor.textModel?.uri, data.notebook)) {
                            return `<notebook>${editor.getId()}#${uri}`;
                        }
                    }
                    throw (0, errors_1.illegalState)('Expected notebook');
                }
            }));
            this._store.add(sessionService.onWillStartSession(newSessionEditor => {
                const candidate = notebookCommon_1.CellUri.parse(newSessionEditor.getModel().uri);
                if (!candidate) {
                    return;
                }
                for (const notebookEditor of notebookEditorService.listNotebookEditors()) {
                    if ((0, resources_1.isEqual)(notebookEditor.textModel?.uri, candidate.notebook)) {
                        let found = false;
                        const editors = [];
                        for (const [, codeEditor] of notebookEditor.codeEditors) {
                            editors.push(codeEditor);
                            found = codeEditor === newSessionEditor || found;
                        }
                        if (found) {
                            // found the this editor in the outer notebook editor -> make sure to
                            // cancel all sibling sessions
                            for (const editor of editors) {
                                if (editor !== newSessionEditor) {
                                    inlineChatController_1.InlineChatController.get(editor)?.finishExistingSession();
                                }
                            }
                            break;
                        }
                    }
                }
            }));
        }
        dispose() {
            this._store.dispose();
        }
    };
    exports.InlineChatNotebookContribution = InlineChatNotebookContribution;
    exports.InlineChatNotebookContribution = InlineChatNotebookContribution = __decorate([
        __param(0, inlineChatSession_1.IInlineChatSessionService),
        __param(1, notebookEditorService_1.INotebookEditorService)
    ], InlineChatNotebookContribution);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5saW5lQ2hhdE5vdGVib29rLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvaW5saW5lQ2hhdC9icm93c2VyL2lubGluZUNoYXROb3RlYm9vay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFZekYsSUFBTSw4QkFBOEIsR0FBcEMsTUFBTSw4QkFBOEI7UUFJMUMsWUFDNEIsY0FBeUMsRUFDNUMscUJBQTZDO1lBSnJELFdBQU0sR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQU8vQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsMEJBQTBCLENBQUMsaUJBQU8sQ0FBQyxrQkFBa0IsRUFBRTtnQkFDckYsZ0JBQWdCLEVBQUUsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLEVBQUU7b0JBQ2xDLE1BQU0sSUFBSSxHQUFHLHdCQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUNoQyxJQUFJLENBQUMsSUFBSSxFQUFFO3dCQUNWLE1BQU0sSUFBQSxxQkFBWSxFQUFDLG1CQUFtQixDQUFDLENBQUM7cUJBQ3hDO29CQUNELEtBQUssTUFBTSxNQUFNLElBQUkscUJBQXFCLENBQUMsbUJBQW1CLEVBQUUsRUFBRTt3QkFDakUsSUFBSSxJQUFBLG1CQUFPLEVBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFOzRCQUNsRCxPQUFPLGFBQWEsTUFBTSxDQUFDLEtBQUssRUFBRSxJQUFJLEdBQUcsRUFBRSxDQUFDO3lCQUM1QztxQkFDRDtvQkFDRCxNQUFNLElBQUEscUJBQVksRUFBQyxtQkFBbUIsQ0FBQyxDQUFDO2dCQUN6QyxDQUFDO2FBQ0QsQ0FBQyxDQUFDLENBQUM7WUFFSixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsa0JBQWtCLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtnQkFDcEUsTUFBTSxTQUFTLEdBQUcsd0JBQU8sQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ2pFLElBQUksQ0FBQyxTQUFTLEVBQUU7b0JBQ2YsT0FBTztpQkFDUDtnQkFDRCxLQUFLLE1BQU0sY0FBYyxJQUFJLHFCQUFxQixDQUFDLG1CQUFtQixFQUFFLEVBQUU7b0JBQ3pFLElBQUksSUFBQSxtQkFBTyxFQUFDLGNBQWMsQ0FBQyxTQUFTLEVBQUUsR0FBRyxFQUFFLFNBQVMsQ0FBQyxRQUFRLENBQUMsRUFBRTt3QkFDL0QsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDO3dCQUNsQixNQUFNLE9BQU8sR0FBa0IsRUFBRSxDQUFDO3dCQUNsQyxLQUFLLE1BQU0sQ0FBQyxFQUFFLFVBQVUsQ0FBQyxJQUFJLGNBQWMsQ0FBQyxXQUFXLEVBQUU7NEJBQ3hELE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7NEJBQ3pCLEtBQUssR0FBRyxVQUFVLEtBQUssZ0JBQWdCLElBQUksS0FBSyxDQUFDO3lCQUNqRDt3QkFDRCxJQUFJLEtBQUssRUFBRTs0QkFDVixxRUFBcUU7NEJBQ3JFLDhCQUE4Qjs0QkFDOUIsS0FBSyxNQUFNLE1BQU0sSUFBSSxPQUFPLEVBQUU7Z0NBQzdCLElBQUksTUFBTSxLQUFLLGdCQUFnQixFQUFFO29DQUNoQywyQ0FBb0IsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUscUJBQXFCLEVBQUUsQ0FBQztpQ0FDMUQ7NkJBQ0Q7NEJBQ0QsTUFBTTt5QkFDTjtxQkFDRDtpQkFDRDtZQUNGLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBRUQsT0FBTztZQUNOLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDdkIsQ0FBQztLQUNELENBQUE7SUF2RFksd0VBQThCOzZDQUE5Qiw4QkFBOEI7UUFLeEMsV0FBQSw2Q0FBeUIsQ0FBQTtRQUN6QixXQUFBLDhDQUFzQixDQUFBO09BTlosOEJBQThCLENBdUQxQyJ9