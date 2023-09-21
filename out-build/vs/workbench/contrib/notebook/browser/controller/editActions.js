/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/mime", "vs/base/common/uri", "vs/editor/common/editorContextKeys", "vs/editor/common/services/getIconClasses", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/nls!vs/workbench/contrib/notebook/browser/controller/editActions", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/contextkey/common/contextkeys", "vs/platform/quickinput/common/quickInput", "vs/workbench/contrib/notebook/browser/controller/cellOperations", "vs/workbench/contrib/notebook/browser/controller/coreActions", "vs/workbench/contrib/notebook/common/notebookContextKeys", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/notebookIcons", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/services/languageDetection/common/languageDetectionWorkerService", "vs/workbench/contrib/notebook/common/notebookExecutionStateService", "vs/platform/notification/common/notification", "vs/workbench/contrib/notebook/common/notebookKernelService", "vs/platform/dialogs/common/dialogs", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/inlineChat/browser/inlineChatController"], function (require, exports, mime_1, uri_1, editorContextKeys_1, getIconClasses_1, model_1, language_1, nls_1, actions_1, contextkey_1, contextkeys_1, quickInput_1, cellOperations_1, coreActions_1, notebookContextKeys_1, notebookBrowser_1, icons, notebookCommon_1, languageDetectionWorkerService_1, notebookExecutionStateService_1, notification_1, notebookKernelService_1, dialogs_1, configuration_1, inlineChatController_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Rqb = void 0;
    const CLEAR_ALL_CELLS_OUTPUTS_COMMAND_ID = 'notebook.clearAllCellsOutputs';
    const EDIT_CELL_COMMAND_ID = 'notebook.cell.edit';
    const DELETE_CELL_COMMAND_ID = 'notebook.cell.delete';
    exports.$Rqb = 'notebook.cell.clearOutputs';
    (0, actions_1.$Xu)(class EditCellAction extends coreActions_1.$dpb {
        constructor() {
            super({
                id: EDIT_CELL_COMMAND_ID,
                title: (0, nls_1.localize)(0, null),
                keybinding: {
                    when: contextkey_1.$Ii.and(notebookContextKeys_1.$Znb, contextkey_1.$Ii.not(contextkeys_1.$83), notebookContextKeys_1.$3nb.isEqualTo(true), editorContextKeys_1.EditorContextKeys.hoverFocused.toNegated()),
                    primary: 3 /* KeyCode.Enter */,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                menu: {
                    id: actions_1.$Ru.NotebookCellTitle,
                    when: contextkey_1.$Ii.and(notebookContextKeys_1.$3nb.isEqualTo(true), notebookContextKeys_1.$_nb.isEqualTo('markup'), notebookContextKeys_1.$dob.toNegated(), notebookContextKeys_1.$aob),
                    order: 0 /* CellToolbarOrder.EditCell */,
                    group: coreActions_1.$8ob
                },
                icon: icons.$Apb,
            });
        }
        async runWithContext(accessor, context) {
            if (!context.notebookEditor.hasModel() || context.notebookEditor.isReadOnly) {
                return;
            }
            await context.notebookEditor.focusNotebookCell(context.cell, 'editor');
            const foundEditor = context.cell ? (0, coreActions_1.$apb)(context, context.cell) : undefined;
            if (foundEditor && foundEditor.hasTextFocus() && inlineChatController_1.$Qqb.get(foundEditor)?.getWidgetPosition()?.lineNumber === foundEditor.getPosition()?.lineNumber) {
                inlineChatController_1.$Qqb.get(foundEditor)?.focus();
            }
        }
    });
    const quitEditCondition = contextkey_1.$Ii.and(notebookContextKeys_1.$Ynb, contextkeys_1.$93);
    (0, actions_1.$Xu)(class QuitEditCellAction extends coreActions_1.$dpb {
        constructor() {
            super({
                id: notebookBrowser_1.$Tbb,
                title: (0, nls_1.localize)(1, null),
                menu: {
                    id: actions_1.$Ru.NotebookCellTitle,
                    when: contextkey_1.$Ii.and(notebookContextKeys_1.$_nb.isEqualTo('markup'), notebookContextKeys_1.$dob, notebookContextKeys_1.$aob),
                    order: 3 /* CellToolbarOrder.SaveCell */,
                    group: coreActions_1.$8ob
                },
                icon: icons.$Bpb,
                keybinding: [
                    {
                        when: contextkey_1.$Ii.and(quitEditCondition, editorContextKeys_1.EditorContextKeys.hoverVisible.toNegated(), editorContextKeys_1.EditorContextKeys.hasNonEmptySelection.toNegated(), editorContextKeys_1.EditorContextKeys.hasMultipleSelections.toNegated()),
                        primary: 9 /* KeyCode.Escape */,
                        weight: coreActions_1.$0ob - 5
                    },
                    {
                        when: contextkey_1.$Ii.and(notebookContextKeys_1.$Ynb, notebookContextKeys_1.$1nb),
                        primary: 9 /* KeyCode.Escape */,
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 5
                    },
                    {
                        when: contextkey_1.$Ii.and(quitEditCondition, notebookContextKeys_1.$_nb.isEqualTo('markup')),
                        primary: 256 /* KeyMod.WinCtrl */ | 3 /* KeyCode.Enter */,
                        win: {
                            primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 3 /* KeyCode.Enter */
                        },
                        weight: coreActions_1.$0ob - 5
                    },
                ]
            });
        }
        async runWithContext(accessor, context) {
            if (context.cell.cellKind === notebookCommon_1.CellKind.Markup) {
                context.cell.updateEditState(notebookBrowser_1.CellEditState.Preview, notebookBrowser_1.$Tbb);
            }
            await context.notebookEditor.focusNotebookCell(context.cell, 'container', { skipReveal: true });
        }
    });
    (0, actions_1.$Xu)(class DeleteCellAction extends coreActions_1.$dpb {
        constructor() {
            super({
                id: DELETE_CELL_COMMAND_ID,
                title: (0, nls_1.localize)(2, null),
                keybinding: {
                    primary: 20 /* KeyCode.Delete */,
                    mac: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 1 /* KeyCode.Backspace */
                    },
                    when: contextkey_1.$Ii.and(notebookContextKeys_1.$Ynb, contextkey_1.$Ii.not(contextkeys_1.$83)),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                menu: [
                    {
                        id: actions_1.$Ru.NotebookCellDelete,
                        when: notebookContextKeys_1.$3nb,
                        group: coreActions_1.$8ob
                    },
                    {
                        id: actions_1.$Ru.InteractiveCellDelete,
                        group: coreActions_1.$8ob
                    }
                ],
                icon: icons.$ypb
            });
        }
        async runWithContext(accessor, context) {
            if (!context.notebookEditor.hasModel()) {
                return;
            }
            let confirmation;
            const notebookExecutionStateService = accessor.get(notebookExecutionStateService_1.$_H);
            const runState = notebookExecutionStateService.getCellExecution(context.cell.uri)?.state;
            const configService = accessor.get(configuration_1.$8h);
            if (runState === notebookCommon_1.NotebookCellExecutionState.Executing && configService.getValue(notebookCommon_1.$7H.confirmDeleteRunningCell)) {
                const dialogService = accessor.get(dialogs_1.$oA);
                const primaryButton = (0, nls_1.localize)(3, null);
                confirmation = await dialogService.confirm({
                    type: 'question',
                    message: (0, nls_1.localize)(4, null),
                    primaryButton: primaryButton,
                    checkbox: {
                        label: (0, nls_1.localize)(5, null)
                    }
                });
            }
            else {
                confirmation = { confirmed: true };
            }
            if (!confirmation.confirmed) {
                return;
            }
            if (confirmation.checkboxChecked === true) {
                await configService.updateValue(notebookCommon_1.$7H.confirmDeleteRunningCell, false);
            }
            (0, cellOperations_1.$Xpb)(context.notebookEditor, context.cell);
        }
    });
    (0, actions_1.$Xu)(class ClearCellOutputsAction extends coreActions_1.$dpb {
        constructor() {
            super({
                id: exports.$Rqb,
                title: (0, nls_1.localize)(6, null),
                menu: [
                    {
                        id: actions_1.$Ru.NotebookCellTitle,
                        when: contextkey_1.$Ii.and(notebookContextKeys_1.$_nb.isEqualTo('code'), coreActions_1.$epb, notebookContextKeys_1.$hob, notebookContextKeys_1.$3nb, notebookContextKeys_1.$aob, notebookContextKeys_1.$6nb.toNegated()),
                        order: 5 /* CellToolbarOrder.ClearCellOutput */,
                        group: coreActions_1.$9ob
                    },
                    {
                        id: actions_1.$Ru.NotebookOutputToolbar,
                        when: contextkey_1.$Ii.and(notebookContextKeys_1.$hob, notebookContextKeys_1.$3nb, notebookContextKeys_1.$aob)
                    },
                ],
                keybinding: {
                    when: contextkey_1.$Ii.and(notebookContextKeys_1.$Ynb, contextkey_1.$Ii.not(contextkeys_1.$83), notebookContextKeys_1.$hob, notebookContextKeys_1.$3nb, notebookContextKeys_1.$aob),
                    primary: 512 /* KeyMod.Alt */ | 20 /* KeyCode.Delete */,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                icon: icons.$Epb
            });
        }
        async runWithContext(accessor, context) {
            const notebookExecutionStateService = accessor.get(notebookExecutionStateService_1.$_H);
            const editor = context.notebookEditor;
            if (!editor.hasModel() || !editor.textModel.length) {
                return;
            }
            const cell = context.cell;
            const index = editor.textModel.cells.indexOf(cell.model);
            if (index < 0) {
                return;
            }
            const computeUndoRedo = !editor.isReadOnly;
            editor.textModel.applyEdits([{ editType: 2 /* CellEditType.Output */, index, outputs: [] }], true, undefined, () => undefined, undefined, computeUndoRedo);
            const runState = notebookExecutionStateService.getCellExecution(context.cell.uri)?.state;
            if (runState !== notebookCommon_1.NotebookCellExecutionState.Executing) {
                context.notebookEditor.textModel.applyEdits([{
                        editType: 9 /* CellEditType.PartialInternalMetadata */, index, internalMetadata: {
                            runStartTime: null,
                            runStartTimeAdjustment: null,
                            runEndTime: null,
                            executionOrder: null,
                            lastRunSuccess: null
                        }
                    }], true, undefined, () => undefined, undefined, computeUndoRedo);
            }
        }
    });
    (0, actions_1.$Xu)(class ClearAllCellOutputsAction extends coreActions_1.$bpb {
        constructor() {
            super({
                id: CLEAR_ALL_CELLS_OUTPUTS_COMMAND_ID,
                title: (0, nls_1.localize)(7, null),
                precondition: notebookContextKeys_1.$rob,
                menu: [
                    {
                        id: actions_1.$Ru.EditorTitle,
                        when: contextkey_1.$Ii.and(notebookContextKeys_1.$Wnb, contextkey_1.$Ii.notEquals('config.notebook.globalToolbar', true)),
                        group: 'navigation',
                        order: 0
                    },
                    {
                        id: actions_1.$Ru.NotebookToolbar,
                        when: contextkey_1.$Ii.and(coreActions_1.$epb, contextkey_1.$Ii.equals('config.notebook.globalToolbar', true)),
                        group: 'navigation/execute',
                        order: 10
                    }
                ],
                icon: icons.$Epb
            });
        }
        async runWithContext(accessor, context) {
            const notebookExecutionStateService = accessor.get(notebookExecutionStateService_1.$_H);
            const editor = context.notebookEditor;
            if (!editor.hasModel() || !editor.textModel.length) {
                return;
            }
            const computeUndoRedo = !editor.isReadOnly;
            editor.textModel.applyEdits(editor.textModel.cells.map((cell, index) => ({
                editType: 2 /* CellEditType.Output */, index, outputs: []
            })), true, undefined, () => undefined, undefined, computeUndoRedo);
            const clearExecutionMetadataEdits = editor.textModel.cells.map((cell, index) => {
                const runState = notebookExecutionStateService.getCellExecution(cell.uri)?.state;
                if (runState !== notebookCommon_1.NotebookCellExecutionState.Executing) {
                    return {
                        editType: 9 /* CellEditType.PartialInternalMetadata */, index, internalMetadata: {
                            runStartTime: null,
                            runStartTimeAdjustment: null,
                            runEndTime: null,
                            executionOrder: null,
                            lastRunSuccess: null
                        }
                    };
                }
                else {
                    return undefined;
                }
            }).filter(edit => !!edit);
            if (clearExecutionMetadataEdits.length) {
                context.notebookEditor.textModel.applyEdits(clearExecutionMetadataEdits, true, undefined, () => undefined, undefined, computeUndoRedo);
            }
        }
    });
    (0, actions_1.$Xu)(class ChangeCellLanguageAction extends coreActions_1.$dpb {
        constructor() {
            super({
                id: notebookBrowser_1.$Sbb,
                title: (0, nls_1.localize)(8, null),
                description: {
                    description: (0, nls_1.localize)(9, null),
                    args: [
                        {
                            name: 'range',
                            description: 'The cell range',
                            schema: {
                                'type': 'object',
                                'required': ['start', 'end'],
                                'properties': {
                                    'start': {
                                        'type': 'number'
                                    },
                                    'end': {
                                        'type': 'number'
                                    }
                                }
                            }
                        },
                        {
                            name: 'language',
                            description: 'The target cell language',
                            schema: {
                                'type': 'string'
                            }
                        }
                    ]
                }
            });
        }
        e(accessor, context, ...additionalArgs) {
            if (!context || typeof context.start !== 'number' || typeof context.end !== 'number' || context.start >= context.end) {
                return;
            }
            const language = additionalArgs.length && typeof additionalArgs[0] === 'string' ? additionalArgs[0] : undefined;
            const activeEditorContext = this.getEditorContextFromArgsOrActive(accessor);
            if (!activeEditorContext || !activeEditorContext.notebookEditor.hasModel() || context.start >= activeEditorContext.notebookEditor.getLength()) {
                return;
            }
            // TODO@rebornix, support multiple cells
            return {
                notebookEditor: activeEditorContext.notebookEditor,
                cell: activeEditorContext.notebookEditor.cellAt(context.start),
                language
            };
        }
        async runWithContext(accessor, context) {
            if (context.language) {
                await this.h(context, context.language);
            }
            else {
                await this.g(accessor, context);
            }
        }
        async g(accessor, context) {
            const topItems = [];
            const mainItems = [];
            const languageService = accessor.get(language_1.$ct);
            const modelService = accessor.get(model_1.$yA);
            const quickInputService = accessor.get(quickInput_1.$Gq);
            const languageDetectionService = accessor.get(languageDetectionWorkerService_1.$zA);
            const kernelService = accessor.get(notebookKernelService_1.$Bbb);
            let languages = context.notebookEditor.activeKernel?.supportedLanguages;
            if (!languages) {
                const matchResult = kernelService.getMatchingKernel(context.notebookEditor.textModel);
                const allSupportedLanguages = matchResult.all.flatMap(kernel => kernel.supportedLanguages);
                languages = allSupportedLanguages.length > 0 ? allSupportedLanguages : languageService.getRegisteredLanguageIds();
            }
            const providerLanguages = new Set([
                ...languages,
                'markdown'
            ]);
            providerLanguages.forEach(languageId => {
                let description;
                if (context.cell.cellKind === notebookCommon_1.CellKind.Markup ? (languageId === 'markdown') : (languageId === context.cell.language)) {
                    description = (0, nls_1.localize)(10, null, languageId);
                }
                else {
                    description = (0, nls_1.localize)(11, null, languageId);
                }
                const languageName = languageService.getLanguageName(languageId);
                if (!languageName) {
                    // Notebook has unrecognized language
                    return;
                }
                const item = {
                    label: languageName,
                    iconClasses: (0, getIconClasses_1.$x6)(modelService, languageService, this.i(languageName, languageService)),
                    description,
                    languageId
                };
                if (languageId === 'markdown' || languageId === context.cell.language) {
                    topItems.push(item);
                }
                else {
                    mainItems.push(item);
                }
            });
            mainItems.sort((a, b) => {
                return a.description.localeCompare(b.description);
            });
            // Offer to "Auto Detect"
            const autoDetectMode = {
                label: (0, nls_1.localize)(12, null)
            };
            const picks = [
                autoDetectMode,
                { type: 'separator', label: (0, nls_1.localize)(13, null) },
                ...topItems,
                { type: 'separator' },
                ...mainItems
            ];
            const selection = await quickInputService.pick(picks, { placeHolder: (0, nls_1.localize)(14, null) });
            const languageId = selection === autoDetectMode
                ? await languageDetectionService.detectLanguage(context.cell.uri)
                : selection?.languageId;
            if (languageId) {
                await this.h(context, languageId);
            }
        }
        async h(context, languageId) {
            await setCellToLanguage(languageId, context);
        }
        /**
         * Copied from editorStatus.ts
         */
        i(lang, languageService) {
            let fakeResource;
            const languageId = languageService.getLanguageIdByLanguageName(lang);
            if (languageId) {
                const extensions = languageService.getExtensions(languageId);
                if (extensions.length) {
                    fakeResource = uri_1.URI.file(extensions[0]);
                }
                else {
                    const filenames = languageService.getFilenames(languageId);
                    if (filenames.length) {
                        fakeResource = uri_1.URI.file(filenames[0]);
                    }
                }
            }
            return fakeResource;
        }
    });
    (0, actions_1.$Xu)(class DetectCellLanguageAction extends coreActions_1.$dpb {
        constructor() {
            super({
                id: notebookBrowser_1.$Rbb,
                title: { value: (0, nls_1.localize)(15, null), original: 'Accept Detected Language for Cell' },
                f1: true,
                precondition: contextkey_1.$Ii.and(notebookContextKeys_1.$3nb, notebookContextKeys_1.$aob),
                keybinding: { primary: 34 /* KeyCode.KeyD */ | 512 /* KeyMod.Alt */ | 1024 /* KeyMod.Shift */, weight: 200 /* KeybindingWeight.WorkbenchContrib */ }
            });
        }
        async runWithContext(accessor, context) {
            const languageDetectionService = accessor.get(languageDetectionWorkerService_1.$zA);
            const notificationService = accessor.get(notification_1.$Yu);
            const kernelService = accessor.get(notebookKernelService_1.$Bbb);
            const kernel = kernelService.getSelectedOrSuggestedKernel(context.notebookEditor.textModel);
            const providerLanguages = [...kernel?.supportedLanguages ?? []];
            providerLanguages.push('markdown');
            const detection = await languageDetectionService.detectLanguage(context.cell.uri, providerLanguages);
            if (detection) {
                setCellToLanguage(detection, context);
            }
            else {
                notificationService.warn((0, nls_1.localize)(16, null));
            }
        }
    });
    async function setCellToLanguage(languageId, context) {
        if (languageId === 'markdown' && context.cell?.language !== 'markdown') {
            const idx = context.notebookEditor.getCellIndex(context.cell);
            await (0, cellOperations_1.$Wpb)(notebookCommon_1.CellKind.Markup, { cell: context.cell, notebookEditor: context.notebookEditor, ui: true }, 'markdown', mime_1.$Hr.markdown);
            const newCell = context.notebookEditor.cellAt(idx);
            if (newCell) {
                await context.notebookEditor.focusNotebookCell(newCell, 'editor');
            }
        }
        else if (languageId !== 'markdown' && context.cell?.cellKind === notebookCommon_1.CellKind.Markup) {
            await (0, cellOperations_1.$Wpb)(notebookCommon_1.CellKind.Code, { cell: context.cell, notebookEditor: context.notebookEditor, ui: true }, languageId);
        }
        else {
            const index = context.notebookEditor.textModel.cells.indexOf(context.cell.model);
            context.notebookEditor.textModel.applyEdits([{ editType: 4 /* CellEditType.CellLanguage */, index, language: languageId }], true, undefined, () => undefined, undefined, !context.notebookEditor.isReadOnly);
        }
    }
});
//# sourceMappingURL=editActions.js.map