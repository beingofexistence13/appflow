/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/codicons", "vs/editor/browser/editorBrowser", "vs/editor/browser/services/bulkEditService", "vs/editor/browser/services/codeEditorService", "vs/editor/common/core/range", "vs/editor/common/languages/language", "vs/editor/common/services/languageFeatures", "vs/editor/contrib/clipboard/browser/clipboard", "vs/nls!vs/workbench/contrib/chat/browser/actions/chatCodeblockActions", "vs/platform/actions/common/actions", "vs/platform/clipboard/common/clipboardService", "vs/platform/terminal/common/terminal", "vs/workbench/contrib/chat/browser/actions/chatActions", "vs/workbench/contrib/chat/browser/chat", "vs/workbench/contrib/chat/common/chatContextKeys", "vs/workbench/contrib/chat/common/chatService", "vs/workbench/contrib/chat/common/chatViewModel", "vs/workbench/contrib/notebook/browser/controller/cellOperations", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/textfile/common/textfiles"], function (require, exports, cancellation_1, codicons_1, editorBrowser_1, bulkEditService_1, codeEditorService_1, range_1, language_1, languageFeatures_1, clipboard_1, nls_1, actions_1, clipboardService_1, terminal_1, chatActions_1, chat_1, chatContextKeys_1, chatService_1, chatViewModel_1, cellOperations_1, notebookCommon_1, terminal_2, editorService_1, textfiles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$UGb = exports.$TGb = void 0;
    function $TGb(thing) {
        return typeof thing === 'object' && thing !== null && 'code' in thing && 'element' in thing;
    }
    exports.$TGb = $TGb;
    class ChatCodeBlockAction extends actions_1.$Wu {
        run(accessor, ...args) {
            let context = args[0];
            if (!$TGb(context)) {
                const codeEditorService = accessor.get(codeEditorService_1.$nV);
                const editor = codeEditorService.getFocusedCodeEditor() || codeEditorService.getActiveCodeEditor();
                if (!editor) {
                    return;
                }
                context = getContextFromEditor(editor, accessor);
                if (!$TGb(context)) {
                    return;
                }
            }
            return this.runWithContext(accessor, context);
        }
    }
    function $UGb() {
        (0, actions_1.$Xu)(class CopyCodeBlockAction extends actions_1.$Wu {
            constructor() {
                super({
                    id: 'workbench.action.chat.copyCodeBlock',
                    title: {
                        value: (0, nls_1.localize)(0, null),
                        original: 'Copy'
                    },
                    f1: false,
                    category: chatActions_1.$DIb,
                    icon: codicons_1.$Pj.copy,
                    menu: {
                        id: actions_1.$Ru.ChatCodeBlock,
                        group: 'navigation',
                    }
                });
            }
            run(accessor, ...args) {
                const context = args[0];
                if (!$TGb(context)) {
                    return;
                }
                if (context.element.errorDetails?.responseIsFiltered) {
                    // When run from command palette
                    return;
                }
                const clipboardService = accessor.get(clipboardService_1.$UZ);
                clipboardService.writeText(context.code);
                const chatService = accessor.get(chatService_1.$FH);
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
        clipboard_1.$i1?.addImplementation(50000, 'chat-codeblock', (accessor) => {
            // get active code editor
            const editor = accessor.get(codeEditorService_1.$nV).getFocusedCodeEditor();
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
                const chatService = accessor.get(chatService_1.$FH);
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
                accessor.get(clipboardService_1.$UZ).writeText(context.code);
                return true;
            }
            return false;
        });
        (0, actions_1.$Xu)(class InsertCodeBlockAction extends ChatCodeBlockAction {
            constructor() {
                super({
                    id: 'workbench.action.chat.insertCodeBlock',
                    title: {
                        value: (0, nls_1.localize)(1, null),
                        original: 'Insert at Cursor'
                    },
                    precondition: chatContextKeys_1.$LGb,
                    f1: true,
                    category: chatActions_1.$DIb,
                    icon: codicons_1.$Pj.insert,
                    menu: {
                        id: actions_1.$Ru.ChatCodeBlock,
                        group: 'navigation',
                    }
                });
            }
            async runWithContext(accessor, context) {
                const editorService = accessor.get(editorService_1.$9C);
                const textFileService = accessor.get(textfiles_1.$JD);
                if (context.element.errorDetails?.responseIsFiltered) {
                    // When run from command palette
                    return;
                }
                if (editorService.activeEditorPane?.getId() === notebookCommon_1.$TH) {
                    return this.a(accessor, editorService.activeEditorPane.getControl(), context);
                }
                let activeEditorControl = editorService.activeTextEditorControl;
                if ((0, editorBrowser_1.$jV)(activeEditorControl)) {
                    activeEditorControl = activeEditorControl.getOriginalEditor().hasTextFocus() ? activeEditorControl.getOriginalEditor() : activeEditorControl.getModifiedEditor();
                }
                if (!(0, editorBrowser_1.$iV)(activeEditorControl)) {
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
                await this.b(accessor, activeEditorControl, activeModel, context);
            }
            async a(accessor, notebookEditor, context) {
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
                        return this.b(accessor, codeEditor, textModel, context);
                    }
                }
                const languageService = accessor.get(language_1.$ct);
                const focusRange = notebookEditor.getFocus();
                const next = Math.max(focusRange.end - 1, 0);
                (0, cellOperations_1.$5pb)(languageService, notebookEditor, next, notebookCommon_1.CellKind.Code, 'below', context.code, true);
                this.c(accessor, context);
            }
            async b(accessor, codeEditor, activeModel, chatCodeBlockActionContext) {
                this.c(accessor, chatCodeBlockActionContext);
                const bulkEditService = accessor.get(bulkEditService_1.$n1);
                const codeEditorService = accessor.get(codeEditorService_1.$nV);
                const mappedEditsProviders = accessor.get(languageFeatures_1.$hF).mappedEditsProvider.ordered(activeModel);
                // try applying workspace edit that was returned by a MappedEditsProvider, else simply insert at selection
                let workspaceEdit = null;
                if (mappedEditsProviders.length > 0) {
                    const mostRelevantProvider = mappedEditsProviders[0];
                    const selections = codeEditor.getSelections() ?? [];
                    const mappedEditsContext = {
                        selections,
                        related: [], // TODO@ulugbekna: we do have not yet decided what to populate this with
                    };
                    const cancellationTokenSource = new cancellation_1.$pd();
                    workspaceEdit = await mostRelevantProvider.provideMappedEdits(activeModel, [chatCodeBlockActionContext.code], mappedEditsContext, cancellationTokenSource.token);
                }
                if (workspaceEdit) {
                    await bulkEditService.apply(workspaceEdit);
                }
                else {
                    const activeSelection = codeEditor.getSelection() ?? new range_1.$ks(activeModel.getLineCount(), 1, activeModel.getLineCount(), 1);
                    await bulkEditService.apply([new bulkEditService_1.$p1(activeModel.uri, {
                            range: activeSelection,
                            text: chatCodeBlockActionContext.code,
                        })]);
                }
                codeEditorService.listCodeEditors().find(editor => editor.getModel()?.uri.toString() === activeModel.uri.toString())?.focus();
            }
            c(accessor, context) {
                const chatService = accessor.get(chatService_1.$FH);
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
        (0, actions_1.$Xu)(class InsertIntoNewFileAction extends ChatCodeBlockAction {
            constructor() {
                super({
                    id: 'workbench.action.chat.insertIntoNewFile',
                    title: {
                        value: (0, nls_1.localize)(2, null),
                        original: 'Insert Into New File'
                    },
                    precondition: chatContextKeys_1.$LGb,
                    f1: true,
                    category: chatActions_1.$DIb,
                    icon: codicons_1.$Pj.newFile,
                    menu: {
                        id: actions_1.$Ru.ChatCodeBlock,
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
                const editorService = accessor.get(editorService_1.$9C);
                const chatService = accessor.get(chatService_1.$FH);
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
        (0, actions_1.$Xu)(class RunInTerminalAction extends ChatCodeBlockAction {
            constructor() {
                super({
                    id: 'workbench.action.chat.runInTerminal',
                    title: {
                        value: (0, nls_1.localize)(3, null),
                        original: 'Run in Terminal'
                    },
                    precondition: chatContextKeys_1.$LGb,
                    f1: true,
                    category: chatActions_1.$DIb,
                    icon: codicons_1.$Pj.terminal,
                    menu: {
                        id: actions_1.$Ru.ChatCodeBlock,
                        group: 'navigation',
                        isHiddenByDefault: true,
                    },
                    keybinding: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 3 /* KeyCode.Enter */,
                        mac: {
                            primary: 256 /* KeyMod.WinCtrl */ | 3 /* KeyCode.Enter */,
                        },
                        weight: 100 /* KeybindingWeight.EditorContrib */,
                        when: chatContextKeys_1.$JGb
                    }
                });
            }
            async runWithContext(accessor, context) {
                if (context.element.errorDetails?.responseIsFiltered) {
                    // When run from command palette
                    return;
                }
                const chatService = accessor.get(chatService_1.$FH);
                const terminalService = accessor.get(terminal_2.$Mib);
                const editorService = accessor.get(editorService_1.$9C);
                const terminalEditorService = accessor.get(terminal_2.$Nib);
                const terminalGroupService = accessor.get(terminal_2.$Oib);
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
            const codeEditorService = accessor.get(codeEditorService_1.$nV);
            const chatWidgetService = accessor.get(chat_1.$Nqb);
            const widget = chatWidgetService.lastFocusedWidget;
            if (!widget) {
                return;
            }
            const editor = codeEditorService.getFocusedCodeEditor();
            const editorUri = editor?.getModel()?.uri;
            const curCodeBlockInfo = editorUri ? widget.getCodeBlockInfoForEditor(editorUri) : undefined;
            const focused = !widget.inputEditor.hasWidgetFocus() && widget.getFocus();
            const focusedResponse = (0, chatViewModel_1.$Iqb)(focused) ? focused : undefined;
            const currentResponse = curCodeBlockInfo ?
                curCodeBlockInfo.element :
                (focusedResponse ?? widget.viewModel?.getItems().reverse().find((item) => (0, chatViewModel_1.$Iqb)(item)));
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
        (0, actions_1.$Xu)(class NextCodeBlockAction extends actions_1.$Wu {
            constructor() {
                super({
                    id: 'workbench.action.chat.nextCodeBlock',
                    title: {
                        value: (0, nls_1.localize)(4, null),
                        original: 'Next Code Block'
                    },
                    keybinding: {
                        primary: 67 /* KeyCode.F9 */,
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                        when: chatContextKeys_1.$JGb,
                    },
                    precondition: chatContextKeys_1.$LGb,
                    f1: true,
                    category: chatActions_1.$DIb,
                });
            }
            run(accessor, ...args) {
                navigateCodeBlocks(accessor);
            }
        });
        (0, actions_1.$Xu)(class PreviousCodeBlockAction extends actions_1.$Wu {
            constructor() {
                super({
                    id: 'workbench.action.chat.previousCodeBlock',
                    title: {
                        value: (0, nls_1.localize)(5, null),
                        original: 'Previous Code Block'
                    },
                    keybinding: {
                        primary: 1024 /* KeyMod.Shift */ | 67 /* KeyCode.F9 */,
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                        when: chatContextKeys_1.$JGb,
                    },
                    precondition: chatContextKeys_1.$LGb,
                    f1: true,
                    category: chatActions_1.$DIb,
                });
            }
            run(accessor, ...args) {
                navigateCodeBlocks(accessor, true);
            }
        });
    }
    exports.$UGb = $UGb;
    function getContextFromEditor(editor, accessor) {
        const chatWidgetService = accessor.get(chat_1.$Nqb);
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
//# sourceMappingURL=chatCodeblockActions.js.map