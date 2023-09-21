/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/codicons", "vs/editor/browser/editorBrowser", "vs/editor/browser/services/bulkEditService", "vs/editor/browser/services/codeEditorService", "vs/editor/common/core/range", "vs/editor/common/languages/language", "vs/editor/common/services/languageFeatures", "vs/editor/contrib/clipboard/browser/clipboard", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/clipboard/common/clipboardService", "vs/platform/terminal/common/terminal", "vs/workbench/contrib/chat/browser/actions/chatActions", "vs/workbench/contrib/chat/browser/chat", "vs/workbench/contrib/chat/common/chatContextKeys", "vs/workbench/contrib/chat/common/chatService", "vs/workbench/contrib/chat/common/chatViewModel", "vs/workbench/contrib/notebook/browser/controller/cellOperations", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/textfile/common/textfiles"], function (require, exports, cancellation_1, codicons_1, editorBrowser_1, bulkEditService_1, codeEditorService_1, range_1, language_1, languageFeatures_1, clipboard_1, nls_1, actions_1, clipboardService_1, terminal_1, chatActions_1, chat_1, chatContextKeys_1, chatService_1, chatViewModel_1, cellOperations_1, notebookCommon_1, terminal_2, editorService_1, textfiles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.registerChatCodeBlockActions = exports.isCodeBlockActionContext = void 0;
    function isCodeBlockActionContext(thing) {
        return typeof thing === 'object' && thing !== null && 'code' in thing && 'element' in thing;
    }
    exports.isCodeBlockActionContext = isCodeBlockActionContext;
    class ChatCodeBlockAction extends actions_1.Action2 {
        run(accessor, ...args) {
            let context = args[0];
            if (!isCodeBlockActionContext(context)) {
                const codeEditorService = accessor.get(codeEditorService_1.ICodeEditorService);
                const editor = codeEditorService.getFocusedCodeEditor() || codeEditorService.getActiveCodeEditor();
                if (!editor) {
                    return;
                }
                context = getContextFromEditor(editor, accessor);
                if (!isCodeBlockActionContext(context)) {
                    return;
                }
            }
            return this.runWithContext(accessor, context);
        }
    }
    function registerChatCodeBlockActions() {
        (0, actions_1.registerAction2)(class CopyCodeBlockAction extends actions_1.Action2 {
            constructor() {
                super({
                    id: 'workbench.action.chat.copyCodeBlock',
                    title: {
                        value: (0, nls_1.localize)('interactive.copyCodeBlock.label', "Copy"),
                        original: 'Copy'
                    },
                    f1: false,
                    category: chatActions_1.CHAT_CATEGORY,
                    icon: codicons_1.Codicon.copy,
                    menu: {
                        id: actions_1.MenuId.ChatCodeBlock,
                        group: 'navigation',
                    }
                });
            }
            run(accessor, ...args) {
                const context = args[0];
                if (!isCodeBlockActionContext(context)) {
                    return;
                }
                if (context.element.errorDetails?.responseIsFiltered) {
                    // When run from command palette
                    return;
                }
                const clipboardService = accessor.get(clipboardService_1.IClipboardService);
                clipboardService.writeText(context.code);
                const chatService = accessor.get(chatService_1.IChatService);
                chatService.notifyUserAction({
                    providerId: context.element.providerId,
                    action: {
                        kind: 'copy',
                        responseId: context.element.providerResponseId,
                        codeBlockIndex: context.codeBlockIndex,
                        copyType: chatService_1.InteractiveSessionCopyKind.Toolbar,
                        copiedCharacters: context.code.length,
                        totalCharacters: context.code.length,
                        copiedText: context.code,
                    }
                });
            }
        });
        clipboard_1.CopyAction?.addImplementation(50000, 'chat-codeblock', (accessor) => {
            // get active code editor
            const editor = accessor.get(codeEditorService_1.ICodeEditorService).getFocusedCodeEditor();
            if (!editor) {
                return false;
            }
            const editorModel = editor.getModel();
            if (!editorModel) {
                return false;
            }
            const context = getContextFromEditor(editor, accessor);
            if (!context) {
                return false;
            }
            const noSelection = editor.getSelections()?.length === 1 && editor.getSelection()?.isEmpty();
            const copiedText = noSelection ?
                editorModel.getValue() :
                editor.getSelections()?.reduce((acc, selection) => acc + editorModel.getValueInRange(selection), '') ?? '';
            const totalCharacters = editorModel.getValueLength();
            // Report copy to extensions
            if (context.element.providerResponseId) {
                const chatService = accessor.get(chatService_1.IChatService);
                chatService.notifyUserAction({
                    providerId: context.element.providerId,
                    action: {
                        kind: 'copy',
                        codeBlockIndex: context.codeBlockIndex,
                        responseId: context.element.providerResponseId,
                        copyType: chatService_1.InteractiveSessionCopyKind.Action,
                        copiedText,
                        copiedCharacters: copiedText.length,
                        totalCharacters,
                    }
                });
            }
            // Copy full cell if no selection, otherwise fall back on normal editor implementation
            if (noSelection) {
                accessor.get(clipboardService_1.IClipboardService).writeText(context.code);
                return true;
            }
            return false;
        });
        (0, actions_1.registerAction2)(class InsertCodeBlockAction extends ChatCodeBlockAction {
            constructor() {
                super({
                    id: 'workbench.action.chat.insertCodeBlock',
                    title: {
                        value: (0, nls_1.localize)('interactive.insertCodeBlock.label', "Insert at Cursor"),
                        original: 'Insert at Cursor'
                    },
                    precondition: chatContextKeys_1.CONTEXT_PROVIDER_EXISTS,
                    f1: true,
                    category: chatActions_1.CHAT_CATEGORY,
                    icon: codicons_1.Codicon.insert,
                    menu: {
                        id: actions_1.MenuId.ChatCodeBlock,
                        group: 'navigation',
                    }
                });
            }
            async runWithContext(accessor, context) {
                const editorService = accessor.get(editorService_1.IEditorService);
                const textFileService = accessor.get(textfiles_1.ITextFileService);
                if (context.element.errorDetails?.responseIsFiltered) {
                    // When run from command palette
                    return;
                }
                if (editorService.activeEditorPane?.getId() === notebookCommon_1.NOTEBOOK_EDITOR_ID) {
                    return this.handleNotebookEditor(accessor, editorService.activeEditorPane.getControl(), context);
                }
                let activeEditorControl = editorService.activeTextEditorControl;
                if ((0, editorBrowser_1.isDiffEditor)(activeEditorControl)) {
                    activeEditorControl = activeEditorControl.getOriginalEditor().hasTextFocus() ? activeEditorControl.getOriginalEditor() : activeEditorControl.getModifiedEditor();
                }
                if (!(0, editorBrowser_1.isCodeEditor)(activeEditorControl)) {
                    return;
                }
                const activeModel = activeEditorControl.getModel();
                if (!activeModel) {
                    return;
                }
                // Check if model is editable, currently only support untitled and text file
                const activeTextModel = textFileService.files.get(activeModel.uri) ?? textFileService.untitled.get(activeModel.uri);
                if (!activeTextModel || activeTextModel.isReadonly()) {
                    return;
                }
                await this.handleTextEditor(accessor, activeEditorControl, activeModel, context);
            }
            async handleNotebookEditor(accessor, notebookEditor, context) {
                if (!notebookEditor.hasModel()) {
                    return;
                }
                if (notebookEditor.isReadOnly) {
                    return;
                }
                if (notebookEditor.activeCodeEditor?.hasTextFocus()) {
                    const codeEditor = notebookEditor.activeCodeEditor;
                    const textModel = codeEditor.getModel();
                    if (textModel) {
                        return this.handleTextEditor(accessor, codeEditor, textModel, context);
                    }
                }
                const languageService = accessor.get(language_1.ILanguageService);
                const focusRange = notebookEditor.getFocus();
                const next = Math.max(focusRange.end - 1, 0);
                (0, cellOperations_1.insertCell)(languageService, notebookEditor, next, notebookCommon_1.CellKind.Code, 'below', context.code, true);
                this.notifyUserAction(accessor, context);
            }
            async handleTextEditor(accessor, codeEditor, activeModel, chatCodeBlockActionContext) {
                this.notifyUserAction(accessor, chatCodeBlockActionContext);
                const bulkEditService = accessor.get(bulkEditService_1.IBulkEditService);
                const codeEditorService = accessor.get(codeEditorService_1.ICodeEditorService);
                const mappedEditsProviders = accessor.get(languageFeatures_1.ILanguageFeaturesService).mappedEditsProvider.ordered(activeModel);
                // try applying workspace edit that was returned by a MappedEditsProvider, else simply insert at selection
                let workspaceEdit = null;
                if (mappedEditsProviders.length > 0) {
                    const mostRelevantProvider = mappedEditsProviders[0];
                    const selections = codeEditor.getSelections() ?? [];
                    const mappedEditsContext = {
                        selections,
                        related: [], // TODO@ulugbekna: we do have not yet decided what to populate this with
                    };
                    const cancellationTokenSource = new cancellation_1.CancellationTokenSource();
                    workspaceEdit = await mostRelevantProvider.provideMappedEdits(activeModel, [chatCodeBlockActionContext.code], mappedEditsContext, cancellationTokenSource.token);
                }
                if (workspaceEdit) {
                    await bulkEditService.apply(workspaceEdit);
                }
                else {
                    const activeSelection = codeEditor.getSelection() ?? new range_1.Range(activeModel.getLineCount(), 1, activeModel.getLineCount(), 1);
                    await bulkEditService.apply([new bulkEditService_1.ResourceTextEdit(activeModel.uri, {
                            range: activeSelection,
                            text: chatCodeBlockActionContext.code,
                        })]);
                }
                codeEditorService.listCodeEditors().find(editor => editor.getModel()?.uri.toString() === activeModel.uri.toString())?.focus();
            }
            notifyUserAction(accessor, context) {
                const chatService = accessor.get(chatService_1.IChatService);
                chatService.notifyUserAction({
                    providerId: context.element.providerId,
                    action: {
                        kind: 'insert',
                        responseId: context.element.providerResponseId,
                        codeBlockIndex: context.codeBlockIndex,
                        totalCharacters: context.code.length,
                    }
                });
            }
        });
        (0, actions_1.registerAction2)(class InsertIntoNewFileAction extends ChatCodeBlockAction {
            constructor() {
                super({
                    id: 'workbench.action.chat.insertIntoNewFile',
                    title: {
                        value: (0, nls_1.localize)('interactive.insertIntoNewFile.label', "Insert Into New File"),
                        original: 'Insert Into New File'
                    },
                    precondition: chatContextKeys_1.CONTEXT_PROVIDER_EXISTS,
                    f1: true,
                    category: chatActions_1.CHAT_CATEGORY,
                    icon: codicons_1.Codicon.newFile,
                    menu: {
                        id: actions_1.MenuId.ChatCodeBlock,
                        group: 'navigation',
                        isHiddenByDefault: true,
                    }
                });
            }
            async runWithContext(accessor, context) {
                if (context.element.errorDetails?.responseIsFiltered) {
                    // When run from command palette
                    return;
                }
                const editorService = accessor.get(editorService_1.IEditorService);
                const chatService = accessor.get(chatService_1.IChatService);
                editorService.openEditor({ contents: context.code, languageId: context.languageId, resource: undefined });
                chatService.notifyUserAction({
                    providerId: context.element.providerId,
                    action: {
                        kind: 'insert',
                        responseId: context.element.providerResponseId,
                        codeBlockIndex: context.codeBlockIndex,
                        totalCharacters: context.code.length,
                        newFile: true
                    }
                });
            }
        });
        (0, actions_1.registerAction2)(class RunInTerminalAction extends ChatCodeBlockAction {
            constructor() {
                super({
                    id: 'workbench.action.chat.runInTerminal',
                    title: {
                        value: (0, nls_1.localize)('interactive.runInTerminal.label', "Run in Terminal"),
                        original: 'Run in Terminal'
                    },
                    precondition: chatContextKeys_1.CONTEXT_PROVIDER_EXISTS,
                    f1: true,
                    category: chatActions_1.CHAT_CATEGORY,
                    icon: codicons_1.Codicon.terminal,
                    menu: {
                        id: actions_1.MenuId.ChatCodeBlock,
                        group: 'navigation',
                        isHiddenByDefault: true,
                    },
                    keybinding: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 3 /* KeyCode.Enter */,
                        mac: {
                            primary: 256 /* KeyMod.WinCtrl */ | 3 /* KeyCode.Enter */,
                        },
                        weight: 100 /* KeybindingWeight.EditorContrib */,
                        when: chatContextKeys_1.CONTEXT_IN_CHAT_SESSION
                    }
                });
            }
            async runWithContext(accessor, context) {
                if (context.element.errorDetails?.responseIsFiltered) {
                    // When run from command palette
                    return;
                }
                const chatService = accessor.get(chatService_1.IChatService);
                const terminalService = accessor.get(terminal_2.ITerminalService);
                const editorService = accessor.get(editorService_1.IEditorService);
                const terminalEditorService = accessor.get(terminal_2.ITerminalEditorService);
                const terminalGroupService = accessor.get(terminal_2.ITerminalGroupService);
                let terminal = await terminalService.getActiveOrCreateInstance();
                // isFeatureTerminal = debug terminal or task terminal
                const unusableTerminal = terminal.xterm?.isStdinDisabled || terminal.shellLaunchConfig.isFeatureTerminal;
                terminal = unusableTerminal ? await terminalService.createTerminal() : terminal;
                terminalService.setActiveInstance(terminal);
                await terminal.focusWhenReady(true);
                if (terminal.target === terminal_1.TerminalLocation.Editor) {
                    const existingEditors = editorService.findEditors(terminal.resource);
                    terminalEditorService.openEditor(terminal, { viewColumn: existingEditors?.[0].groupId });
                }
                else {
                    terminalGroupService.showPanel(true);
                }
                terminal.sendText(context.code, false, true);
                chatService.notifyUserAction({
                    providerId: context.element.providerId,
                    action: {
                        kind: 'runInTerminal',
                        responseId: context.element.providerResponseId,
                        codeBlockIndex: context.codeBlockIndex,
                        languageId: context.languageId,
                    }
                });
            }
        });
        function navigateCodeBlocks(accessor, reverse) {
            const codeEditorService = accessor.get(codeEditorService_1.ICodeEditorService);
            const chatWidgetService = accessor.get(chat_1.IChatWidgetService);
            const widget = chatWidgetService.lastFocusedWidget;
            if (!widget) {
                return;
            }
            const editor = codeEditorService.getFocusedCodeEditor();
            const editorUri = editor?.getModel()?.uri;
            const curCodeBlockInfo = editorUri ? widget.getCodeBlockInfoForEditor(editorUri) : undefined;
            const focused = !widget.inputEditor.hasWidgetFocus() && widget.getFocus();
            const focusedResponse = (0, chatViewModel_1.isResponseVM)(focused) ? focused : undefined;
            const currentResponse = curCodeBlockInfo ?
                curCodeBlockInfo.element :
                (focusedResponse ?? widget.viewModel?.getItems().reverse().find((item) => (0, chatViewModel_1.isResponseVM)(item)));
            if (!currentResponse) {
                return;
            }
            widget.reveal(currentResponse);
            const responseCodeblocks = widget.getCodeBlockInfosForResponse(currentResponse);
            const focusIdx = curCodeBlockInfo ?
                (curCodeBlockInfo.codeBlockIndex + (reverse ? -1 : 1) + responseCodeblocks.length) % responseCodeblocks.length :
                reverse ? responseCodeblocks.length - 1 : 0;
            responseCodeblocks[focusIdx]?.focus();
        }
        (0, actions_1.registerAction2)(class NextCodeBlockAction extends actions_1.Action2 {
            constructor() {
                super({
                    id: 'workbench.action.chat.nextCodeBlock',
                    title: {
                        value: (0, nls_1.localize)('interactive.nextCodeBlock.label', "Next Code Block"),
                        original: 'Next Code Block'
                    },
                    keybinding: {
                        primary: 67 /* KeyCode.F9 */,
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                        when: chatContextKeys_1.CONTEXT_IN_CHAT_SESSION,
                    },
                    precondition: chatContextKeys_1.CONTEXT_PROVIDER_EXISTS,
                    f1: true,
                    category: chatActions_1.CHAT_CATEGORY,
                });
            }
            run(accessor, ...args) {
                navigateCodeBlocks(accessor);
            }
        });
        (0, actions_1.registerAction2)(class PreviousCodeBlockAction extends actions_1.Action2 {
            constructor() {
                super({
                    id: 'workbench.action.chat.previousCodeBlock',
                    title: {
                        value: (0, nls_1.localize)('interactive.previousCodeBlock.label', "Previous Code Block"),
                        original: 'Previous Code Block'
                    },
                    keybinding: {
                        primary: 1024 /* KeyMod.Shift */ | 67 /* KeyCode.F9 */,
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                        when: chatContextKeys_1.CONTEXT_IN_CHAT_SESSION,
                    },
                    precondition: chatContextKeys_1.CONTEXT_PROVIDER_EXISTS,
                    f1: true,
                    category: chatActions_1.CHAT_CATEGORY,
                });
            }
            run(accessor, ...args) {
                navigateCodeBlocks(accessor, true);
            }
        });
    }
    exports.registerChatCodeBlockActions = registerChatCodeBlockActions;
    function getContextFromEditor(editor, accessor) {
        const chatWidgetService = accessor.get(chat_1.IChatWidgetService);
        const model = editor.getModel();
        if (!model) {
            return;
        }
        const widget = chatWidgetService.lastFocusedWidget;
        if (!widget) {
            return;
        }
        const codeBlockInfo = widget.getCodeBlockInfoForEditor(model.uri);
        if (!codeBlockInfo) {
            return;
        }
        return {
            element: codeBlockInfo.element,
            codeBlockIndex: codeBlockInfo.codeBlockIndex,
            code: editor.getValue(),
            languageId: editor.getModel().getLanguageId(),
        };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdENvZGVibG9ja0FjdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9jaGF0L2Jyb3dzZXIvYWN0aW9ucy9jaGF0Q29kZWJsb2NrQWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUF3Q2hHLFNBQWdCLHdCQUF3QixDQUFDLEtBQWM7UUFDdEQsT0FBTyxPQUFPLEtBQUssS0FBSyxRQUFRLElBQUksS0FBSyxLQUFLLElBQUksSUFBSSxNQUFNLElBQUksS0FBSyxJQUFJLFNBQVMsSUFBSSxLQUFLLENBQUM7SUFDN0YsQ0FBQztJQUZELDREQUVDO0lBRUQsTUFBZSxtQkFBb0IsU0FBUSxpQkFBTztRQUNqRCxHQUFHLENBQUMsUUFBMEIsRUFBRSxHQUFHLElBQVc7WUFDN0MsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RCLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFDdkMsTUFBTSxpQkFBaUIsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHNDQUFrQixDQUFDLENBQUM7Z0JBQzNELE1BQU0sTUFBTSxHQUFHLGlCQUFpQixDQUFDLG9CQUFvQixFQUFFLElBQUksaUJBQWlCLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztnQkFDbkcsSUFBSSxDQUFDLE1BQU0sRUFBRTtvQkFDWixPQUFPO2lCQUNQO2dCQUVELE9BQU8sR0FBRyxvQkFBb0IsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBQ2pELElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLENBQUMsRUFBRTtvQkFDdkMsT0FBTztpQkFDUDthQUNEO1lBRUQsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUMvQyxDQUFDO0tBR0Q7SUFFRCxTQUFnQiw0QkFBNEI7UUFDM0MsSUFBQSx5QkFBZSxFQUFDLE1BQU0sbUJBQW9CLFNBQVEsaUJBQU87WUFDeEQ7Z0JBQ0MsS0FBSyxDQUFDO29CQUNMLEVBQUUsRUFBRSxxQ0FBcUM7b0JBQ3pDLEtBQUssRUFBRTt3QkFDTixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsaUNBQWlDLEVBQUUsTUFBTSxDQUFDO3dCQUMxRCxRQUFRLEVBQUUsTUFBTTtxQkFDaEI7b0JBQ0QsRUFBRSxFQUFFLEtBQUs7b0JBQ1QsUUFBUSxFQUFFLDJCQUFhO29CQUN2QixJQUFJLEVBQUUsa0JBQU8sQ0FBQyxJQUFJO29CQUNsQixJQUFJLEVBQUU7d0JBQ0wsRUFBRSxFQUFFLGdCQUFNLENBQUMsYUFBYTt3QkFDeEIsS0FBSyxFQUFFLFlBQVk7cUJBQ25CO2lCQUNELENBQUMsQ0FBQztZQUNKLENBQUM7WUFFRCxHQUFHLENBQUMsUUFBMEIsRUFBRSxHQUFHLElBQVc7Z0JBQzdDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDeEIsSUFBSSxDQUFDLHdCQUF3QixDQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUN2QyxPQUFPO2lCQUNQO2dCQUVELElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsa0JBQWtCLEVBQUU7b0JBQ3JELGdDQUFnQztvQkFDaEMsT0FBTztpQkFDUDtnQkFFRCxNQUFNLGdCQUFnQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsb0NBQWlCLENBQUMsQ0FBQztnQkFDekQsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFFekMsTUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQywwQkFBWSxDQUFDLENBQUM7Z0JBQy9DLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBdUI7b0JBQ2xELFVBQVUsRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQVU7b0JBQ3RDLE1BQU0sRUFBbUI7d0JBQ3hCLElBQUksRUFBRSxNQUFNO3dCQUNaLFVBQVUsRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLGtCQUFrQjt3QkFDOUMsY0FBYyxFQUFFLE9BQU8sQ0FBQyxjQUFjO3dCQUN0QyxRQUFRLEVBQUUsd0NBQTBCLENBQUMsT0FBTzt3QkFDNUMsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNO3dCQUNyQyxlQUFlLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNO3dCQUNwQyxVQUFVLEVBQUUsT0FBTyxDQUFDLElBQUk7cUJBQ3hCO2lCQUNELENBQUMsQ0FBQztZQUNKLENBQUM7U0FDRCxDQUFDLENBQUM7UUFFSCxzQkFBVSxFQUFFLGlCQUFpQixDQUFDLEtBQUssRUFBRSxnQkFBZ0IsRUFBRSxDQUFDLFFBQVEsRUFBRSxFQUFFO1lBQ25FLHlCQUF5QjtZQUN6QixNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHNDQUFrQixDQUFDLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztZQUN2RSxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNaLE9BQU8sS0FBSyxDQUFDO2FBQ2I7WUFFRCxNQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDdEMsSUFBSSxDQUFDLFdBQVcsRUFBRTtnQkFDakIsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUVELE1BQU0sT0FBTyxHQUFHLG9CQUFvQixDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztZQUN2RCxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNiLE9BQU8sS0FBSyxDQUFDO2FBQ2I7WUFFRCxNQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsYUFBYSxFQUFFLEVBQUUsTUFBTSxLQUFLLENBQUMsSUFBSSxNQUFNLENBQUMsWUFBWSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUM7WUFDN0YsTUFBTSxVQUFVLEdBQUcsV0FBVyxDQUFDLENBQUM7Z0JBQy9CLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO2dCQUN4QixNQUFNLENBQUMsYUFBYSxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxFQUFFLENBQUMsR0FBRyxHQUFHLFdBQVcsQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQzVHLE1BQU0sZUFBZSxHQUFHLFdBQVcsQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUVyRCw0QkFBNEI7WUFDNUIsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLGtCQUFrQixFQUFFO2dCQUN2QyxNQUFNLFdBQVcsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDBCQUFZLENBQUMsQ0FBQztnQkFDL0MsV0FBVyxDQUFDLGdCQUFnQixDQUFDO29CQUM1QixVQUFVLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFVO29CQUN0QyxNQUFNLEVBQUU7d0JBQ1AsSUFBSSxFQUFFLE1BQU07d0JBQ1osY0FBYyxFQUFFLE9BQU8sQ0FBQyxjQUFjO3dCQUN0QyxVQUFVLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0I7d0JBQzlDLFFBQVEsRUFBRSx3Q0FBMEIsQ0FBQyxNQUFNO3dCQUMzQyxVQUFVO3dCQUNWLGdCQUFnQixFQUFFLFVBQVUsQ0FBQyxNQUFNO3dCQUNuQyxlQUFlO3FCQUNmO2lCQUNELENBQUMsQ0FBQzthQUNIO1lBRUQsc0ZBQXNGO1lBQ3RGLElBQUksV0FBVyxFQUFFO2dCQUNoQixRQUFRLENBQUMsR0FBRyxDQUFDLG9DQUFpQixDQUFDLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDeEQsT0FBTyxJQUFJLENBQUM7YUFDWjtZQUVELE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFBLHlCQUFlLEVBQUMsTUFBTSxxQkFBc0IsU0FBUSxtQkFBbUI7WUFDdEU7Z0JBQ0MsS0FBSyxDQUFDO29CQUNMLEVBQUUsRUFBRSx1Q0FBdUM7b0JBQzNDLEtBQUssRUFBRTt3QkFDTixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsbUNBQW1DLEVBQUUsa0JBQWtCLENBQUM7d0JBQ3hFLFFBQVEsRUFBRSxrQkFBa0I7cUJBQzVCO29CQUNELFlBQVksRUFBRSx5Q0FBdUI7b0JBQ3JDLEVBQUUsRUFBRSxJQUFJO29CQUNSLFFBQVEsRUFBRSwyQkFBYTtvQkFDdkIsSUFBSSxFQUFFLGtCQUFPLENBQUMsTUFBTTtvQkFDcEIsSUFBSSxFQUFFO3dCQUNMLEVBQUUsRUFBRSxnQkFBTSxDQUFDLGFBQWE7d0JBQ3hCLEtBQUssRUFBRSxZQUFZO3FCQUNuQjtpQkFDRCxDQUFDLENBQUM7WUFDSixDQUFDO1lBRVEsS0FBSyxDQUFDLGNBQWMsQ0FBQyxRQUEwQixFQUFFLE9BQW9DO2dCQUM3RixNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDhCQUFjLENBQUMsQ0FBQztnQkFDbkQsTUFBTSxlQUFlLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyw0QkFBZ0IsQ0FBQyxDQUFDO2dCQUV2RCxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLGtCQUFrQixFQUFFO29CQUNyRCxnQ0FBZ0M7b0JBQ2hDLE9BQU87aUJBQ1A7Z0JBRUQsSUFBSSxhQUFhLENBQUMsZ0JBQWdCLEVBQUUsS0FBSyxFQUFFLEtBQUssbUNBQWtCLEVBQUU7b0JBQ25FLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsRUFBRSxhQUFhLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxFQUFxQixFQUFFLE9BQU8sQ0FBQyxDQUFDO2lCQUNwSDtnQkFFRCxJQUFJLG1CQUFtQixHQUFHLGFBQWEsQ0FBQyx1QkFBdUIsQ0FBQztnQkFDaEUsSUFBSSxJQUFBLDRCQUFZLEVBQUMsbUJBQW1CLENBQUMsRUFBRTtvQkFDdEMsbUJBQW1CLEdBQUcsbUJBQW1CLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUMsbUJBQW1CLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDLENBQUMsbUJBQW1CLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztpQkFDaks7Z0JBRUQsSUFBSSxDQUFDLElBQUEsNEJBQVksRUFBQyxtQkFBbUIsQ0FBQyxFQUFFO29CQUN2QyxPQUFPO2lCQUNQO2dCQUVELE1BQU0sV0FBVyxHQUFHLG1CQUFtQixDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUNuRCxJQUFJLENBQUMsV0FBVyxFQUFFO29CQUNqQixPQUFPO2lCQUNQO2dCQUVELDRFQUE0RTtnQkFDNUUsTUFBTSxlQUFlLEdBQUcsZUFBZSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLGVBQWUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDcEgsSUFBSSxDQUFDLGVBQWUsSUFBSSxlQUFlLENBQUMsVUFBVSxFQUFFLEVBQUU7b0JBQ3JELE9BQU87aUJBQ1A7Z0JBRUQsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLG1CQUFtQixFQUFFLFdBQVcsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUNsRixDQUFDO1lBRU8sS0FBSyxDQUFDLG9CQUFvQixDQUFDLFFBQTBCLEVBQUUsY0FBK0IsRUFBRSxPQUFvQztnQkFDbkksSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsRUFBRTtvQkFDL0IsT0FBTztpQkFDUDtnQkFFRCxJQUFJLGNBQWMsQ0FBQyxVQUFVLEVBQUU7b0JBQzlCLE9BQU87aUJBQ1A7Z0JBRUQsSUFBSSxjQUFjLENBQUMsZ0JBQWdCLEVBQUUsWUFBWSxFQUFFLEVBQUU7b0JBQ3BELE1BQU0sVUFBVSxHQUFHLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQztvQkFDbkQsTUFBTSxTQUFTLEdBQUcsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDO29CQUV4QyxJQUFJLFNBQVMsRUFBRTt3QkFDZCxPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztxQkFDdkU7aUJBQ0Q7Z0JBRUQsTUFBTSxlQUFlLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQywyQkFBZ0IsQ0FBQyxDQUFDO2dCQUN2RCxNQUFNLFVBQVUsR0FBRyxjQUFjLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQzdDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQzdDLElBQUEsMkJBQVUsRUFBQyxlQUFlLEVBQUUsY0FBYyxFQUFFLElBQUksRUFBRSx5QkFBUSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDOUYsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUMxQyxDQUFDO1lBRU8sS0FBSyxDQUFDLGdCQUFnQixDQUFDLFFBQTBCLEVBQUUsVUFBdUIsRUFBRSxXQUF1QixFQUFFLDBCQUF1RDtnQkFDbkssSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSwwQkFBMEIsQ0FBQyxDQUFDO2dCQUU1RCxNQUFNLGVBQWUsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLGtDQUFnQixDQUFDLENBQUM7Z0JBQ3ZELE1BQU0saUJBQWlCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxzQ0FBa0IsQ0FBQyxDQUFDO2dCQUUzRCxNQUFNLG9CQUFvQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsMkNBQXdCLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBRTdHLDBHQUEwRztnQkFFMUcsSUFBSSxhQUFhLEdBQXlCLElBQUksQ0FBQztnQkFFL0MsSUFBSSxvQkFBb0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO29CQUNwQyxNQUFNLG9CQUFvQixHQUFHLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUVyRCxNQUFNLFVBQVUsR0FBRyxVQUFVLENBQUMsYUFBYSxFQUFFLElBQUksRUFBRSxDQUFDO29CQUNwRCxNQUFNLGtCQUFrQixHQUFHO3dCQUMxQixVQUFVO3dCQUNWLE9BQU8sRUFBRSxFQUEwQixFQUFFLHdFQUF3RTtxQkFDN0csQ0FBQztvQkFDRixNQUFNLHVCQUF1QixHQUFHLElBQUksc0NBQXVCLEVBQUUsQ0FBQztvQkFFOUQsYUFBYSxHQUFHLE1BQU0sb0JBQW9CLENBQUMsa0JBQWtCLENBQzVELFdBQVcsRUFDWCxDQUFDLDBCQUEwQixDQUFDLElBQUksQ0FBQyxFQUNqQyxrQkFBa0IsRUFDbEIsdUJBQXVCLENBQUMsS0FBSyxDQUFDLENBQUM7aUJBQ2hDO2dCQUVELElBQUksYUFBYSxFQUFFO29CQUNsQixNQUFNLGVBQWUsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUM7aUJBQzNDO3FCQUFNO29CQUNOLE1BQU0sZUFBZSxHQUFHLFVBQVUsQ0FBQyxZQUFZLEVBQUUsSUFBSSxJQUFJLGFBQUssQ0FBQyxXQUFXLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDN0gsTUFBTSxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxrQ0FBZ0IsQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFOzRCQUNsRSxLQUFLLEVBQUUsZUFBZTs0QkFDdEIsSUFBSSxFQUFFLDBCQUEwQixDQUFDLElBQUk7eUJBQ3JDLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ0w7Z0JBQ0QsaUJBQWlCLENBQUMsZUFBZSxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxFQUFFLEdBQUcsQ0FBQyxRQUFRLEVBQUUsS0FBSyxXQUFXLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUM7WUFDL0gsQ0FBQztZQUVPLGdCQUFnQixDQUFDLFFBQTBCLEVBQUUsT0FBb0M7Z0JBQ3hGLE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsMEJBQVksQ0FBQyxDQUFDO2dCQUMvQyxXQUFXLENBQUMsZ0JBQWdCLENBQXVCO29CQUNsRCxVQUFVLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFVO29CQUN0QyxNQUFNLEVBQUU7d0JBQ1AsSUFBSSxFQUFFLFFBQVE7d0JBQ2QsVUFBVSxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsa0JBQWtCO3dCQUM5QyxjQUFjLEVBQUUsT0FBTyxDQUFDLGNBQWM7d0JBQ3RDLGVBQWUsRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU07cUJBQ3BDO2lCQUNELENBQUMsQ0FBQztZQUNKLENBQUM7U0FFRCxDQUFDLENBQUM7UUFFSCxJQUFBLHlCQUFlLEVBQUMsTUFBTSx1QkFBd0IsU0FBUSxtQkFBbUI7WUFDeEU7Z0JBQ0MsS0FBSyxDQUFDO29CQUNMLEVBQUUsRUFBRSx5Q0FBeUM7b0JBQzdDLEtBQUssRUFBRTt3QkFDTixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMscUNBQXFDLEVBQUUsc0JBQXNCLENBQUM7d0JBQzlFLFFBQVEsRUFBRSxzQkFBc0I7cUJBQ2hDO29CQUNELFlBQVksRUFBRSx5Q0FBdUI7b0JBQ3JDLEVBQUUsRUFBRSxJQUFJO29CQUNSLFFBQVEsRUFBRSwyQkFBYTtvQkFDdkIsSUFBSSxFQUFFLGtCQUFPLENBQUMsT0FBTztvQkFDckIsSUFBSSxFQUFFO3dCQUNMLEVBQUUsRUFBRSxnQkFBTSxDQUFDLGFBQWE7d0JBQ3hCLEtBQUssRUFBRSxZQUFZO3dCQUNuQixpQkFBaUIsRUFBRSxJQUFJO3FCQUN2QjtpQkFDRCxDQUFDLENBQUM7WUFDSixDQUFDO1lBRVEsS0FBSyxDQUFDLGNBQWMsQ0FBQyxRQUEwQixFQUFFLE9BQW9DO2dCQUM3RixJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLGtCQUFrQixFQUFFO29CQUNyRCxnQ0FBZ0M7b0JBQ2hDLE9BQU87aUJBQ1A7Z0JBRUQsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyw4QkFBYyxDQUFDLENBQUM7Z0JBQ25ELE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsMEJBQVksQ0FBQyxDQUFDO2dCQUMvQyxhQUFhLENBQUMsVUFBVSxDQUFtQyxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxPQUFPLENBQUMsVUFBVSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDO2dCQUU1SSxXQUFXLENBQUMsZ0JBQWdCLENBQXVCO29CQUNsRCxVQUFVLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFVO29CQUN0QyxNQUFNLEVBQUU7d0JBQ1AsSUFBSSxFQUFFLFFBQVE7d0JBQ2QsVUFBVSxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsa0JBQWtCO3dCQUM5QyxjQUFjLEVBQUUsT0FBTyxDQUFDLGNBQWM7d0JBQ3RDLGVBQWUsRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU07d0JBQ3BDLE9BQU8sRUFBRSxJQUFJO3FCQUNiO2lCQUNELENBQUMsQ0FBQztZQUNKLENBQUM7U0FDRCxDQUFDLENBQUM7UUFFSCxJQUFBLHlCQUFlLEVBQUMsTUFBTSxtQkFBb0IsU0FBUSxtQkFBbUI7WUFDcEU7Z0JBQ0MsS0FBSyxDQUFDO29CQUNMLEVBQUUsRUFBRSxxQ0FBcUM7b0JBQ3pDLEtBQUssRUFBRTt3QkFDTixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsaUNBQWlDLEVBQUUsaUJBQWlCLENBQUM7d0JBQ3JFLFFBQVEsRUFBRSxpQkFBaUI7cUJBQzNCO29CQUNELFlBQVksRUFBRSx5Q0FBdUI7b0JBQ3JDLEVBQUUsRUFBRSxJQUFJO29CQUNSLFFBQVEsRUFBRSwyQkFBYTtvQkFDdkIsSUFBSSxFQUFFLGtCQUFPLENBQUMsUUFBUTtvQkFDdEIsSUFBSSxFQUFFO3dCQUNMLEVBQUUsRUFBRSxnQkFBTSxDQUFDLGFBQWE7d0JBQ3hCLEtBQUssRUFBRSxZQUFZO3dCQUNuQixpQkFBaUIsRUFBRSxJQUFJO3FCQUN2QjtvQkFDRCxVQUFVLEVBQUU7d0JBQ1gsT0FBTyxFQUFFLGdEQUEyQix3QkFBZ0I7d0JBQ3BELEdBQUcsRUFBRTs0QkFDSixPQUFPLEVBQUUsZ0RBQThCO3lCQUN2Qzt3QkFDRCxNQUFNLDBDQUFnQzt3QkFDdEMsSUFBSSxFQUFFLHlDQUF1QjtxQkFDN0I7aUJBQ0QsQ0FBQyxDQUFDO1lBQ0osQ0FBQztZQUVRLEtBQUssQ0FBQyxjQUFjLENBQUMsUUFBMEIsRUFBRSxPQUFvQztnQkFDN0YsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxrQkFBa0IsRUFBRTtvQkFDckQsZ0NBQWdDO29CQUNoQyxPQUFPO2lCQUNQO2dCQUVELE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsMEJBQVksQ0FBQyxDQUFDO2dCQUMvQyxNQUFNLGVBQWUsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDJCQUFnQixDQUFDLENBQUM7Z0JBQ3ZELE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsOEJBQWMsQ0FBQyxDQUFDO2dCQUNuRCxNQUFNLHFCQUFxQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsaUNBQXNCLENBQUMsQ0FBQztnQkFDbkUsTUFBTSxvQkFBb0IsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLGdDQUFxQixDQUFDLENBQUM7Z0JBRWpFLElBQUksUUFBUSxHQUFHLE1BQU0sZUFBZSxDQUFDLHlCQUF5QixFQUFFLENBQUM7Z0JBRWpFLHNEQUFzRDtnQkFDdEQsTUFBTSxnQkFBZ0IsR0FBRyxRQUFRLENBQUMsS0FBSyxFQUFFLGVBQWUsSUFBSSxRQUFRLENBQUMsaUJBQWlCLENBQUMsaUJBQWlCLENBQUM7Z0JBQ3pHLFFBQVEsR0FBRyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsTUFBTSxlQUFlLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztnQkFFaEYsZUFBZSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUM1QyxNQUFNLFFBQVEsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3BDLElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSywyQkFBZ0IsQ0FBQyxNQUFNLEVBQUU7b0JBQ2hELE1BQU0sZUFBZSxHQUFHLGFBQWEsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUNyRSxxQkFBcUIsQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLEVBQUUsVUFBVSxFQUFFLGVBQWUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7aUJBQ3pGO3FCQUFNO29CQUNOLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDckM7Z0JBRUQsUUFBUSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFFN0MsV0FBVyxDQUFDLGdCQUFnQixDQUF1QjtvQkFDbEQsVUFBVSxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBVTtvQkFDdEMsTUFBTSxFQUFFO3dCQUNQLElBQUksRUFBRSxlQUFlO3dCQUNyQixVQUFVLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0I7d0JBQzlDLGNBQWMsRUFBRSxPQUFPLENBQUMsY0FBYzt3QkFDdEMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxVQUFVO3FCQUM5QjtpQkFDRCxDQUFDLENBQUM7WUFDSixDQUFDO1NBQ0QsQ0FBQyxDQUFDO1FBRUgsU0FBUyxrQkFBa0IsQ0FBQyxRQUEwQixFQUFFLE9BQWlCO1lBQ3hFLE1BQU0saUJBQWlCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxzQ0FBa0IsQ0FBQyxDQUFDO1lBQzNELE1BQU0saUJBQWlCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyx5QkFBa0IsQ0FBQyxDQUFDO1lBQzNELE1BQU0sTUFBTSxHQUFHLGlCQUFpQixDQUFDLGlCQUFpQixDQUFDO1lBQ25ELElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ1osT0FBTzthQUNQO1lBRUQsTUFBTSxNQUFNLEdBQUcsaUJBQWlCLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztZQUN4RCxNQUFNLFNBQVMsR0FBRyxNQUFNLEVBQUUsUUFBUSxFQUFFLEVBQUUsR0FBRyxDQUFDO1lBQzFDLE1BQU0sZ0JBQWdCLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMseUJBQXlCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUM3RixNQUFNLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsY0FBYyxFQUFFLElBQUksTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQzFFLE1BQU0sZUFBZSxHQUFHLElBQUEsNEJBQVksRUFBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7WUFFcEUsTUFBTSxlQUFlLEdBQUcsZ0JBQWdCLENBQUMsQ0FBQztnQkFDekMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQzFCLENBQUMsZUFBZSxJQUFJLE1BQU0sQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFrQyxFQUFFLENBQUMsSUFBQSw0QkFBWSxFQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNoSSxJQUFJLENBQUMsZUFBZSxFQUFFO2dCQUNyQixPQUFPO2FBQ1A7WUFFRCxNQUFNLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQy9CLE1BQU0sa0JBQWtCLEdBQUcsTUFBTSxDQUFDLDRCQUE0QixDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQ2hGLE1BQU0sUUFBUSxHQUFHLGdCQUFnQixDQUFDLENBQUM7Z0JBQ2xDLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsa0JBQWtCLENBQUMsTUFBTSxDQUFDLEdBQUcsa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ2hILE9BQU8sQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRTdDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDO1FBQ3ZDLENBQUM7UUFFRCxJQUFBLHlCQUFlLEVBQUMsTUFBTSxtQkFBb0IsU0FBUSxpQkFBTztZQUN4RDtnQkFDQyxLQUFLLENBQUM7b0JBQ0wsRUFBRSxFQUFFLHFDQUFxQztvQkFDekMsS0FBSyxFQUFFO3dCQUNOLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxpQ0FBaUMsRUFBRSxpQkFBaUIsQ0FBQzt3QkFDckUsUUFBUSxFQUFFLGlCQUFpQjtxQkFDM0I7b0JBQ0QsVUFBVSxFQUFFO3dCQUNYLE9BQU8scUJBQVk7d0JBQ25CLE1BQU0sNkNBQW1DO3dCQUN6QyxJQUFJLEVBQUUseUNBQXVCO3FCQUM3QjtvQkFDRCxZQUFZLEVBQUUseUNBQXVCO29CQUNyQyxFQUFFLEVBQUUsSUFBSTtvQkFDUixRQUFRLEVBQUUsMkJBQWE7aUJBQ3ZCLENBQUMsQ0FBQztZQUNKLENBQUM7WUFFRCxHQUFHLENBQUMsUUFBMEIsRUFBRSxHQUFHLElBQVc7Z0JBQzdDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzlCLENBQUM7U0FDRCxDQUFDLENBQUM7UUFFSCxJQUFBLHlCQUFlLEVBQUMsTUFBTSx1QkFBd0IsU0FBUSxpQkFBTztZQUM1RDtnQkFDQyxLQUFLLENBQUM7b0JBQ0wsRUFBRSxFQUFFLHlDQUF5QztvQkFDN0MsS0FBSyxFQUFFO3dCQUNOLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxxQ0FBcUMsRUFBRSxxQkFBcUIsQ0FBQzt3QkFDN0UsUUFBUSxFQUFFLHFCQUFxQjtxQkFDL0I7b0JBQ0QsVUFBVSxFQUFFO3dCQUNYLE9BQU8sRUFBRSw2Q0FBeUI7d0JBQ2xDLE1BQU0sNkNBQW1DO3dCQUN6QyxJQUFJLEVBQUUseUNBQXVCO3FCQUM3QjtvQkFDRCxZQUFZLEVBQUUseUNBQXVCO29CQUNyQyxFQUFFLEVBQUUsSUFBSTtvQkFDUixRQUFRLEVBQUUsMkJBQWE7aUJBQ3ZCLENBQUMsQ0FBQztZQUNKLENBQUM7WUFFRCxHQUFHLENBQUMsUUFBMEIsRUFBRSxHQUFHLElBQVc7Z0JBQzdDLGtCQUFrQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNwQyxDQUFDO1NBQ0QsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQXZhRCxvRUF1YUM7SUFFRCxTQUFTLG9CQUFvQixDQUFDLE1BQW1CLEVBQUUsUUFBMEI7UUFDNUUsTUFBTSxpQkFBaUIsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHlCQUFrQixDQUFDLENBQUM7UUFDM0QsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2hDLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDWCxPQUFPO1NBQ1A7UUFFRCxNQUFNLE1BQU0sR0FBRyxpQkFBaUIsQ0FBQyxpQkFBaUIsQ0FBQztRQUNuRCxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ1osT0FBTztTQUNQO1FBRUQsTUFBTSxhQUFhLEdBQUcsTUFBTSxDQUFDLHlCQUF5QixDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNsRSxJQUFJLENBQUMsYUFBYSxFQUFFO1lBQ25CLE9BQU87U0FDUDtRQUVELE9BQU87WUFDTixPQUFPLEVBQUUsYUFBYSxDQUFDLE9BQU87WUFDOUIsY0FBYyxFQUFFLGFBQWEsQ0FBQyxjQUFjO1lBQzVDLElBQUksRUFBRSxNQUFNLENBQUMsUUFBUSxFQUFFO1lBQ3ZCLFVBQVUsRUFBRSxNQUFNLENBQUMsUUFBUSxFQUFHLENBQUMsYUFBYSxFQUFFO1NBQzlDLENBQUM7SUFDSCxDQUFDIn0=