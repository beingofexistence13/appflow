/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/mime", "vs/base/common/uri", "vs/editor/common/editorContextKeys", "vs/editor/common/services/getIconClasses", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/contextkey/common/contextkeys", "vs/platform/quickinput/common/quickInput", "vs/workbench/contrib/notebook/browser/controller/cellOperations", "vs/workbench/contrib/notebook/browser/controller/coreActions", "vs/workbench/contrib/notebook/common/notebookContextKeys", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/notebookIcons", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/services/languageDetection/common/languageDetectionWorkerService", "vs/workbench/contrib/notebook/common/notebookExecutionStateService", "vs/platform/notification/common/notification", "vs/workbench/contrib/notebook/common/notebookKernelService", "vs/platform/dialogs/common/dialogs", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/inlineChat/browser/inlineChatController"], function (require, exports, mime_1, uri_1, editorContextKeys_1, getIconClasses_1, model_1, language_1, nls_1, actions_1, contextkey_1, contextkeys_1, quickInput_1, cellOperations_1, coreActions_1, notebookContextKeys_1, notebookBrowser_1, icons, notebookCommon_1, languageDetectionWorkerService_1, notebookExecutionStateService_1, notification_1, notebookKernelService_1, dialogs_1, configuration_1, inlineChatController_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CLEAR_CELL_OUTPUTS_COMMAND_ID = void 0;
    const CLEAR_ALL_CELLS_OUTPUTS_COMMAND_ID = 'notebook.clearAllCellsOutputs';
    const EDIT_CELL_COMMAND_ID = 'notebook.cell.edit';
    const DELETE_CELL_COMMAND_ID = 'notebook.cell.delete';
    exports.CLEAR_CELL_OUTPUTS_COMMAND_ID = 'notebook.cell.clearOutputs';
    (0, actions_1.registerAction2)(class EditCellAction extends coreActions_1.NotebookCellAction {
        constructor() {
            super({
                id: EDIT_CELL_COMMAND_ID,
                title: (0, nls_1.localize)('notebookActions.editCell', "Edit Cell"),
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_CELL_LIST_FOCUSED, contextkey_1.ContextKeyExpr.not(contextkeys_1.InputFocusedContextKey), notebookContextKeys_1.NOTEBOOK_EDITOR_EDITABLE.isEqualTo(true), editorContextKeys_1.EditorContextKeys.hoverFocused.toNegated()),
                    primary: 3 /* KeyCode.Enter */,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                menu: {
                    id: actions_1.MenuId.NotebookCellTitle,
                    when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_EDITABLE.isEqualTo(true), notebookContextKeys_1.NOTEBOOK_CELL_TYPE.isEqualTo('markup'), notebookContextKeys_1.NOTEBOOK_CELL_MARKDOWN_EDIT_MODE.toNegated(), notebookContextKeys_1.NOTEBOOK_CELL_EDITABLE),
                    order: 0 /* CellToolbarOrder.EditCell */,
                    group: coreActions_1.CELL_TITLE_CELL_GROUP_ID
                },
                icon: icons.editIcon,
            });
        }
        async runWithContext(accessor, context) {
            if (!context.notebookEditor.hasModel() || context.notebookEditor.isReadOnly) {
                return;
            }
            await context.notebookEditor.focusNotebookCell(context.cell, 'editor');
            const foundEditor = context.cell ? (0, coreActions_1.findTargetCellEditor)(context, context.cell) : undefined;
            if (foundEditor && foundEditor.hasTextFocus() && inlineChatController_1.InlineChatController.get(foundEditor)?.getWidgetPosition()?.lineNumber === foundEditor.getPosition()?.lineNumber) {
                inlineChatController_1.InlineChatController.get(foundEditor)?.focus();
            }
        }
    });
    const quitEditCondition = contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_FOCUSED, contextkeys_1.InputFocusedContext);
    (0, actions_1.registerAction2)(class QuitEditCellAction extends coreActions_1.NotebookCellAction {
        constructor() {
            super({
                id: notebookBrowser_1.QUIT_EDIT_CELL_COMMAND_ID,
                title: (0, nls_1.localize)('notebookActions.quitEdit', "Stop Editing Cell"),
                menu: {
                    id: actions_1.MenuId.NotebookCellTitle,
                    when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_CELL_TYPE.isEqualTo('markup'), notebookContextKeys_1.NOTEBOOK_CELL_MARKDOWN_EDIT_MODE, notebookContextKeys_1.NOTEBOOK_CELL_EDITABLE),
                    order: 3 /* CellToolbarOrder.SaveCell */,
                    group: coreActions_1.CELL_TITLE_CELL_GROUP_ID
                },
                icon: icons.stopEditIcon,
                keybinding: [
                    {
                        when: contextkey_1.ContextKeyExpr.and(quitEditCondition, editorContextKeys_1.EditorContextKeys.hoverVisible.toNegated(), editorContextKeys_1.EditorContextKeys.hasNonEmptySelection.toNegated(), editorContextKeys_1.EditorContextKeys.hasMultipleSelections.toNegated()),
                        primary: 9 /* KeyCode.Escape */,
                        weight: coreActions_1.NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT - 5
                    },
                    {
                        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_FOCUSED, notebookContextKeys_1.NOTEBOOK_OUTPUT_FOCUSED),
                        primary: 9 /* KeyCode.Escape */,
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 5
                    },
                    {
                        when: contextkey_1.ContextKeyExpr.and(quitEditCondition, notebookContextKeys_1.NOTEBOOK_CELL_TYPE.isEqualTo('markup')),
                        primary: 256 /* KeyMod.WinCtrl */ | 3 /* KeyCode.Enter */,
                        win: {
                            primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 3 /* KeyCode.Enter */
                        },
                        weight: coreActions_1.NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT - 5
                    },
                ]
            });
        }
        async runWithContext(accessor, context) {
            if (context.cell.cellKind === notebookCommon_1.CellKind.Markup) {
                context.cell.updateEditState(notebookBrowser_1.CellEditState.Preview, notebookBrowser_1.QUIT_EDIT_CELL_COMMAND_ID);
            }
            await context.notebookEditor.focusNotebookCell(context.cell, 'container', { skipReveal: true });
        }
    });
    (0, actions_1.registerAction2)(class DeleteCellAction extends coreActions_1.NotebookCellAction {
        constructor() {
            super({
                id: DELETE_CELL_COMMAND_ID,
                title: (0, nls_1.localize)('notebookActions.deleteCell', "Delete Cell"),
                keybinding: {
                    primary: 20 /* KeyCode.Delete */,
                    mac: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 1 /* KeyCode.Backspace */
                    },
                    when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_FOCUSED, contextkey_1.ContextKeyExpr.not(contextkeys_1.InputFocusedContextKey)),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                menu: [
                    {
                        id: actions_1.MenuId.NotebookCellDelete,
                        when: notebookContextKeys_1.NOTEBOOK_EDITOR_EDITABLE,
                        group: coreActions_1.CELL_TITLE_CELL_GROUP_ID
                    },
                    {
                        id: actions_1.MenuId.InteractiveCellDelete,
                        group: coreActions_1.CELL_TITLE_CELL_GROUP_ID
                    }
                ],
                icon: icons.deleteCellIcon
            });
        }
        async runWithContext(accessor, context) {
            if (!context.notebookEditor.hasModel()) {
                return;
            }
            let confirmation;
            const notebookExecutionStateService = accessor.get(notebookExecutionStateService_1.INotebookExecutionStateService);
            const runState = notebookExecutionStateService.getCellExecution(context.cell.uri)?.state;
            const configService = accessor.get(configuration_1.IConfigurationService);
            if (runState === notebookCommon_1.NotebookCellExecutionState.Executing && configService.getValue(notebookCommon_1.NotebookSetting.confirmDeleteRunningCell)) {
                const dialogService = accessor.get(dialogs_1.IDialogService);
                const primaryButton = (0, nls_1.localize)('confirmDeleteButton', "Delete");
                confirmation = await dialogService.confirm({
                    type: 'question',
                    message: (0, nls_1.localize)('confirmDeleteButtonMessage', "This cell is running, are you sure you want to delete it?"),
                    primaryButton: primaryButton,
                    checkbox: {
                        label: (0, nls_1.localize)('doNotAskAgain', "Do not ask me again")
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
                await configService.updateValue(notebookCommon_1.NotebookSetting.confirmDeleteRunningCell, false);
            }
            (0, cellOperations_1.runDeleteAction)(context.notebookEditor, context.cell);
        }
    });
    (0, actions_1.registerAction2)(class ClearCellOutputsAction extends coreActions_1.NotebookCellAction {
        constructor() {
            super({
                id: exports.CLEAR_CELL_OUTPUTS_COMMAND_ID,
                title: (0, nls_1.localize)('clearCellOutputs', 'Clear Cell Outputs'),
                menu: [
                    {
                        id: actions_1.MenuId.NotebookCellTitle,
                        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_CELL_TYPE.isEqualTo('code'), coreActions_1.executeNotebookCondition, notebookContextKeys_1.NOTEBOOK_CELL_HAS_OUTPUTS, notebookContextKeys_1.NOTEBOOK_EDITOR_EDITABLE, notebookContextKeys_1.NOTEBOOK_CELL_EDITABLE, notebookContextKeys_1.NOTEBOOK_USE_CONSOLIDATED_OUTPUT_BUTTON.toNegated()),
                        order: 5 /* CellToolbarOrder.ClearCellOutput */,
                        group: coreActions_1.CELL_TITLE_OUTPUT_GROUP_ID
                    },
                    {
                        id: actions_1.MenuId.NotebookOutputToolbar,
                        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_CELL_HAS_OUTPUTS, notebookContextKeys_1.NOTEBOOK_EDITOR_EDITABLE, notebookContextKeys_1.NOTEBOOK_CELL_EDITABLE)
                    },
                ],
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_FOCUSED, contextkey_1.ContextKeyExpr.not(contextkeys_1.InputFocusedContextKey), notebookContextKeys_1.NOTEBOOK_CELL_HAS_OUTPUTS, notebookContextKeys_1.NOTEBOOK_EDITOR_EDITABLE, notebookContextKeys_1.NOTEBOOK_CELL_EDITABLE),
                    primary: 512 /* KeyMod.Alt */ | 20 /* KeyCode.Delete */,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                icon: icons.clearIcon
            });
        }
        async runWithContext(accessor, context) {
            const notebookExecutionStateService = accessor.get(notebookExecutionStateService_1.INotebookExecutionStateService);
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
    (0, actions_1.registerAction2)(class ClearAllCellOutputsAction extends coreActions_1.NotebookAction {
        constructor() {
            super({
                id: CLEAR_ALL_CELLS_OUTPUTS_COMMAND_ID,
                title: (0, nls_1.localize)('clearAllCellsOutputs', 'Clear All Outputs'),
                precondition: notebookContextKeys_1.NOTEBOOK_HAS_OUTPUTS,
                menu: [
                    {
                        id: actions_1.MenuId.EditorTitle,
                        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_IS_ACTIVE_EDITOR, contextkey_1.ContextKeyExpr.notEquals('config.notebook.globalToolbar', true)),
                        group: 'navigation',
                        order: 0
                    },
                    {
                        id: actions_1.MenuId.NotebookToolbar,
                        when: contextkey_1.ContextKeyExpr.and(coreActions_1.executeNotebookCondition, contextkey_1.ContextKeyExpr.equals('config.notebook.globalToolbar', true)),
                        group: 'navigation/execute',
                        order: 10
                    }
                ],
                icon: icons.clearIcon
            });
        }
        async runWithContext(accessor, context) {
            const notebookExecutionStateService = accessor.get(notebookExecutionStateService_1.INotebookExecutionStateService);
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
    (0, actions_1.registerAction2)(class ChangeCellLanguageAction extends coreActions_1.NotebookCellAction {
        constructor() {
            super({
                id: notebookBrowser_1.CHANGE_CELL_LANGUAGE,
                title: (0, nls_1.localize)('changeLanguage', 'Change Cell Language'),
                description: {
                    description: (0, nls_1.localize)('changeLanguage', 'Change Cell Language'),
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
        getCellContextFromArgs(accessor, context, ...additionalArgs) {
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
                await this.setLanguage(context, context.language);
            }
            else {
                await this.showLanguagePicker(accessor, context);
            }
        }
        async showLanguagePicker(accessor, context) {
            const topItems = [];
            const mainItems = [];
            const languageService = accessor.get(language_1.ILanguageService);
            const modelService = accessor.get(model_1.IModelService);
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const languageDetectionService = accessor.get(languageDetectionWorkerService_1.ILanguageDetectionService);
            const kernelService = accessor.get(notebookKernelService_1.INotebookKernelService);
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
                    description = (0, nls_1.localize)('languageDescription', "({0}) - Current Language", languageId);
                }
                else {
                    description = (0, nls_1.localize)('languageDescriptionConfigured', "({0})", languageId);
                }
                const languageName = languageService.getLanguageName(languageId);
                if (!languageName) {
                    // Notebook has unrecognized language
                    return;
                }
                const item = {
                    label: languageName,
                    iconClasses: (0, getIconClasses_1.getIconClasses)(modelService, languageService, this.getFakeResource(languageName, languageService)),
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
                label: (0, nls_1.localize)('autoDetect', "Auto Detect")
            };
            const picks = [
                autoDetectMode,
                { type: 'separator', label: (0, nls_1.localize)('languagesPicks', "languages (identifier)") },
                ...topItems,
                { type: 'separator' },
                ...mainItems
            ];
            const selection = await quickInputService.pick(picks, { placeHolder: (0, nls_1.localize)('pickLanguageToConfigure', "Select Language Mode") });
            const languageId = selection === autoDetectMode
                ? await languageDetectionService.detectLanguage(context.cell.uri)
                : selection?.languageId;
            if (languageId) {
                await this.setLanguage(context, languageId);
            }
        }
        async setLanguage(context, languageId) {
            await setCellToLanguage(languageId, context);
        }
        /**
         * Copied from editorStatus.ts
         */
        getFakeResource(lang, languageService) {
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
    (0, actions_1.registerAction2)(class DetectCellLanguageAction extends coreActions_1.NotebookCellAction {
        constructor() {
            super({
                id: notebookBrowser_1.DETECT_CELL_LANGUAGE,
                title: { value: (0, nls_1.localize)('detectLanguage', 'Accept Detected Language for Cell'), original: 'Accept Detected Language for Cell' },
                f1: true,
                precondition: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_EDITABLE, notebookContextKeys_1.NOTEBOOK_CELL_EDITABLE),
                keybinding: { primary: 34 /* KeyCode.KeyD */ | 512 /* KeyMod.Alt */ | 1024 /* KeyMod.Shift */, weight: 200 /* KeybindingWeight.WorkbenchContrib */ }
            });
        }
        async runWithContext(accessor, context) {
            const languageDetectionService = accessor.get(languageDetectionWorkerService_1.ILanguageDetectionService);
            const notificationService = accessor.get(notification_1.INotificationService);
            const kernelService = accessor.get(notebookKernelService_1.INotebookKernelService);
            const kernel = kernelService.getSelectedOrSuggestedKernel(context.notebookEditor.textModel);
            const providerLanguages = [...kernel?.supportedLanguages ?? []];
            providerLanguages.push('markdown');
            const detection = await languageDetectionService.detectLanguage(context.cell.uri, providerLanguages);
            if (detection) {
                setCellToLanguage(detection, context);
            }
            else {
                notificationService.warn((0, nls_1.localize)('noDetection', "Unable to detect cell language"));
            }
        }
    });
    async function setCellToLanguage(languageId, context) {
        if (languageId === 'markdown' && context.cell?.language !== 'markdown') {
            const idx = context.notebookEditor.getCellIndex(context.cell);
            await (0, cellOperations_1.changeCellToKind)(notebookCommon_1.CellKind.Markup, { cell: context.cell, notebookEditor: context.notebookEditor, ui: true }, 'markdown', mime_1.Mimes.markdown);
            const newCell = context.notebookEditor.cellAt(idx);
            if (newCell) {
                await context.notebookEditor.focusNotebookCell(newCell, 'editor');
            }
        }
        else if (languageId !== 'markdown' && context.cell?.cellKind === notebookCommon_1.CellKind.Markup) {
            await (0, cellOperations_1.changeCellToKind)(notebookCommon_1.CellKind.Code, { cell: context.cell, notebookEditor: context.notebookEditor, ui: true }, languageId);
        }
        else {
            const index = context.notebookEditor.textModel.cells.indexOf(context.cell.model);
            context.notebookEditor.textModel.applyEdits([{ editType: 4 /* CellEditType.CellLanguage */, index, language: languageId }], true, undefined, () => undefined, undefined, !context.notebookEditor.isReadOnly);
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdEFjdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9icm93c2VyL2NvbnRyb2xsZXIvZWRpdEFjdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBaUNoRyxNQUFNLGtDQUFrQyxHQUFHLCtCQUErQixDQUFDO0lBQzNFLE1BQU0sb0JBQW9CLEdBQUcsb0JBQW9CLENBQUM7SUFDbEQsTUFBTSxzQkFBc0IsR0FBRyxzQkFBc0IsQ0FBQztJQUN6QyxRQUFBLDZCQUE2QixHQUFHLDRCQUE0QixDQUFDO0lBRTFFLElBQUEseUJBQWUsRUFBQyxNQUFNLGNBQWUsU0FBUSxnQ0FBa0I7UUFDOUQ7WUFDQyxLQUFLLENBQ0o7Z0JBQ0MsRUFBRSxFQUFFLG9CQUFvQjtnQkFDeEIsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLDBCQUEwQixFQUFFLFdBQVcsQ0FBQztnQkFDeEQsVUFBVSxFQUFFO29CQUNYLElBQUksRUFBRSwyQkFBYyxDQUFDLEdBQUcsQ0FDdkIsZ0RBQTBCLEVBQzFCLDJCQUFjLENBQUMsR0FBRyxDQUFDLG9DQUFzQixDQUFDLEVBQzFDLDhDQUF3QixDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFDeEMscUNBQWlCLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxDQUMxQztvQkFDRCxPQUFPLHVCQUFlO29CQUN0QixNQUFNLDZDQUFtQztpQkFDekM7Z0JBQ0QsSUFBSSxFQUFFO29CQUNMLEVBQUUsRUFBRSxnQkFBTSxDQUFDLGlCQUFpQjtvQkFDNUIsSUFBSSxFQUFFLDJCQUFjLENBQUMsR0FBRyxDQUN2Qiw4Q0FBd0IsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQ3hDLHdDQUFrQixDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsRUFDdEMsc0RBQWdDLENBQUMsU0FBUyxFQUFFLEVB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