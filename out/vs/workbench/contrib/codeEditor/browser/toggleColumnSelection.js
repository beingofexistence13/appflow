/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/editor/browser/services/codeEditorService", "vs/editor/browser/coreCommands", "vs/editor/common/core/position", "vs/editor/common/core/selection"], function (require, exports, nls_1, actions_1, configuration_1, contextkey_1, codeEditorService_1, coreCommands_1, position_1, selection_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ToggleColumnSelectionAction = void 0;
    class ToggleColumnSelectionAction extends actions_1.Action2 {
        static { this.ID = 'editor.action.toggleColumnSelection'; }
        constructor() {
            super({
                id: ToggleColumnSelectionAction.ID,
                title: {
                    value: (0, nls_1.localize)('toggleColumnSelection', "Toggle Column Selection Mode"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miColumnSelection', comment: ['&& denotes a mnemonic'] }, "Column &&Selection Mode"),
                    original: 'Toggle Column Selection Mode'
                },
                f1: true,
                toggled: contextkey_1.ContextKeyExpr.equals('config.editor.columnSelection', true),
                menu: {
                    id: actions_1.MenuId.MenubarSelectionMenu,
                    group: '4_config',
                    order: 2
                }
            });
        }
        async run(accessor) {
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const codeEditorService = accessor.get(codeEditorService_1.ICodeEditorService);
            const oldValue = configurationService.getValue('editor.columnSelection');
            const codeEditor = this._getCodeEditor(codeEditorService);
            await configurationService.updateValue('editor.columnSelection', !oldValue);
            const newValue = configurationService.getValue('editor.columnSelection');
            if (!codeEditor || codeEditor !== this._getCodeEditor(codeEditorService) || oldValue === newValue || !codeEditor.hasModel() || typeof oldValue !== 'boolean' || typeof newValue !== 'boolean') {
                return;
            }
            const viewModel = codeEditor._getViewModel();
            if (codeEditor.getOption(22 /* EditorOption.columnSelection */)) {
                const selection = codeEditor.getSelection();
                const modelSelectionStart = new position_1.Position(selection.selectionStartLineNumber, selection.selectionStartColumn);
                const viewSelectionStart = viewModel.coordinatesConverter.convertModelPositionToViewPosition(modelSelectionStart);
                const modelPosition = new position_1.Position(selection.positionLineNumber, selection.positionColumn);
                const viewPosition = viewModel.coordinatesConverter.convertModelPositionToViewPosition(modelPosition);
                coreCommands_1.CoreNavigationCommands.MoveTo.runCoreEditorCommand(viewModel, {
                    position: modelSelectionStart,
                    viewPosition: viewSelectionStart
                });
                const visibleColumn = viewModel.cursorConfig.visibleColumnFromColumn(viewModel, viewPosition);
                coreCommands_1.CoreNavigationCommands.ColumnSelect.runCoreEditorCommand(viewModel, {
                    position: modelPosition,
                    viewPosition: viewPosition,
                    doColumnSelect: true,
                    mouseColumn: visibleColumn + 1
                });
            }
            else {
                const columnSelectData = viewModel.getCursorColumnSelectData();
                const fromViewColumn = viewModel.cursorConfig.columnFromVisibleColumn(viewModel, columnSelectData.fromViewLineNumber, columnSelectData.fromViewVisualColumn);
                const fromPosition = viewModel.coordinatesConverter.convertViewPositionToModelPosition(new position_1.Position(columnSelectData.fromViewLineNumber, fromViewColumn));
                const toViewColumn = viewModel.cursorConfig.columnFromVisibleColumn(viewModel, columnSelectData.toViewLineNumber, columnSelectData.toViewVisualColumn);
                const toPosition = viewModel.coordinatesConverter.convertViewPositionToModelPosition(new position_1.Position(columnSelectData.toViewLineNumber, toViewColumn));
                codeEditor.setSelection(new selection_1.Selection(fromPosition.lineNumber, fromPosition.column, toPosition.lineNumber, toPosition.column));
            }
        }
        _getCodeEditor(codeEditorService) {
            const codeEditor = codeEditorService.getFocusedCodeEditor();
            if (codeEditor) {
                return codeEditor;
            }
            return codeEditorService.getActiveCodeEditor();
        }
    }
    exports.ToggleColumnSelectionAction = ToggleColumnSelectionAction;
    (0, actions_1.registerAction2)(ToggleColumnSelectionAction);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9nZ2xlQ29sdW1uU2VsZWN0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY29kZUVkaXRvci9icm93c2VyL3RvZ2dsZUNvbHVtblNlbGVjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFjaEcsTUFBYSwyQkFBNEIsU0FBUSxpQkFBTztpQkFFdkMsT0FBRSxHQUFHLHFDQUFxQyxDQUFDO1FBRTNEO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSwyQkFBMkIsQ0FBQyxFQUFFO2dCQUNsQyxLQUFLLEVBQUU7b0JBQ04sS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLHVCQUF1QixFQUFFLDhCQUE4QixDQUFDO29CQUN4RSxhQUFhLEVBQUUsSUFBQSxjQUFRLEVBQUMsRUFBRSxHQUFHLEVBQUUsbUJBQW1CLEVBQUUsT0FBTyxFQUFFLENBQUMsdUJBQXVCLENBQUMsRUFBRSxFQUFFLHlCQUF5QixDQUFDO29CQUNwSCxRQUFRLEVBQUUsOEJBQThCO2lCQUN4QztnQkFDRCxFQUFFLEVBQUUsSUFBSTtnQkFDUixPQUFPLEVBQUUsMkJBQWMsQ0FBQyxNQUFNLENBQUMsK0JBQStCLEVBQUUsSUFBSSxDQUFDO2dCQUNyRSxJQUFJLEVBQUU7b0JBQ0wsRUFBRSxFQUFFLGdCQUFNLENBQUMsb0JBQW9CO29CQUMvQixLQUFLLEVBQUUsVUFBVTtvQkFDakIsS0FBSyxFQUFFLENBQUM7aUJBQ1I7YUFDRCxDQUFDLENBQUM7UUFDSixDQUFDO1FBRVEsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUEwQjtZQUM1QyxNQUFNLG9CQUFvQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMscUNBQXFCLENBQUMsQ0FBQztZQUNqRSxNQUFNLGlCQUFpQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsc0NBQWtCLENBQUMsQ0FBQztZQUUzRCxN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