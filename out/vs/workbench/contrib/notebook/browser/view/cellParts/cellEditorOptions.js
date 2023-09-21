/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationRegistry", "vs/platform/contextkey/common/contextkey", "vs/platform/registry/common/platform", "vs/workbench/common/contextkeys", "vs/workbench/contrib/notebook/browser/controller/coreActions", "vs/workbench/contrib/notebook/common/notebookContextKeys", "vs/workbench/contrib/notebook/browser/view/cellPart", "vs/workbench/contrib/notebook/common/notebookCommon"], function (require, exports, event_1, nls_1, actions_1, configuration_1, configurationRegistry_1, contextkey_1, platform_1, contextkeys_1, coreActions_1, notebookContextKeys_1, cellPart_1, notebookCommon_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CellEditorOptions = void 0;
    class CellEditorOptions extends cellPart_1.CellContentPart {
        constructor(base, notebookOptions, configurationService) {
            super();
            this.base = base;
            this.notebookOptions = notebookOptions;
            this.configurationService = configurationService;
            this._lineNumbers = 'inherit';
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this._register(base.onDidChange(() => {
                this._recomputeOptions();
            }));
            this._value = this._computeEditorOptions();
        }
        updateState(element, e) {
            if (e.cellLineNumberChanged) {
                this.setLineNumbers(element.lineNumbers);
            }
        }
        _recomputeOptions() {
            this._value = this._computeEditorOptions();
            this._onDidChange.fire();
        }
        _computeEditorOptions() {
            const value = this.base.value;
            let cellRenderLineNumber = value.lineNumbers;
            switch (this._lineNumbers) {
                case 'inherit':
                    // inherit from the notebook setting
                    if (this.configurationService.getValue('notebook.lineNumbers') === 'on') {
                        if (value.lineNumbers === 'off') {
                            cellRenderLineNumber = 'on';
                        } // otherwise just use the editor setting
                    }
                    else {
                        cellRenderLineNumber = 'off';
                    }
                    break;
                case 'on':
                    // should turn on, ignore the editor line numbers off options
                    if (value.lineNumbers === 'off') {
                        cellRenderLineNumber = 'on';
                    } // otherwise just use the editor setting
                    break;
                case 'off':
                    cellRenderLineNumber = 'off';
                    break;
            }
            if (value.lineNumbers !== cellRenderLineNumber) {
                return {
                    ...value,
                    ...{ lineNumbers: cellRenderLineNumber }
                };
            }
            else {
                return Object.assign({}, value);
            }
        }
        getUpdatedValue(internalMetadata, cellUri) {
            const options = this.getValue(internalMetadata, cellUri);
            delete options.hover; // This is toggled by a debug editor contribution
            return options;
        }
        getValue(internalMetadata, cellUri) {
            return {
                ...this._value,
                ...{
                    padding: this.notebookOptions.computeEditorPadding(internalMetadata, cellUri)
                }
            };
        }
        getDefaultValue() {
            return {
                ...this._value,
                ...{
                    padding: { top: 12, bottom: 12 }
                }
            };
        }
        setLineNumbers(lineNumbers) {
            this._lineNumbers = lineNumbers;
            this._recomputeOptions();
        }
    }
    exports.CellEditorOptions = CellEditorOptions;
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration({
        id: 'notebook',
        order: 100,
        type: 'object',
        'properties': {
            'notebook.lineNumbers': {
                type: 'string',
                enum: ['off', 'on'],
                default: 'off',
                markdownDescription: (0, nls_1.localize)('notebook.lineNumbers', "Controls the display of line numbers in the cell editor.")
            }
        }
    });
    (0, actions_1.registerAction2)(class ToggleLineNumberAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'notebook.toggleLineNumbers',
                title: { value: (0, nls_1.localize)('notebook.toggleLineNumbers', "Toggle Notebook Line Numbers"), original: 'Toggle Notebook Line Numbers' },
                precondition: notebookContextKeys_1.NOTEBOOK_EDITOR_FOCUSED,
                menu: [
                    {
                        id: actions_1.MenuId.NotebookToolbar,
                        group: 'notebookLayout',
                        order: 2,
                        when: contextkey_1.ContextKeyExpr.equals('config.notebook.globalToolbar', true)
                    }
                ],
                category: coreActions_1.NOTEBOOK_ACTIONS_CATEGORY,
                f1: true,
                toggled: {
                    condition: contextkey_1.ContextKeyExpr.notEquals('config.notebook.lineNumbers', 'off'),
                    title: (0, nls_1.localize)('notebook.showLineNumbers', "Notebook Line Numbers"),
                }
            });
        }
        async run(accessor) {
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const renderLiNumbers = configurationService.getValue('notebook.lineNumbers') === 'on';
            if (renderLiNumbers) {
                configurationService.updateValue('notebook.lineNumbers', 'off');
            }
            else {
                configurationService.updateValue('notebook.lineNumbers', 'on');
            }
        }
    });
    (0, actions_1.registerAction2)(class ToggleActiveLineNumberAction extends coreActions_1.NotebookMultiCellAction {
        constructor() {
            super({
                id: 'notebook.cell.toggleLineNumbers',
                title: (0, nls_1.localize)('notebook.cell.toggleLineNumbers.title', "Show Cell Line Numbers"),
                precondition: contextkeys_1.ActiveEditorContext.isEqualTo(notebookCommon_1.NOTEBOOK_EDITOR_ID),
                menu: [{
                        id: actions_1.MenuId.NotebookCellTitle,
                        group: 'View',
                        order: 1
                    }],
                toggled: contextkey_1.ContextKeyExpr.or(notebookContextKeys_1.NOTEBOOK_CELL_LINE_NUMBERS.isEqualTo('on'), contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_CELL_LINE_NUMBERS.isEqualTo('inherit'), contextkey_1.ContextKeyExpr.equals('config.notebook.lineNumbers', 'on')))
            });
        }
        async runWithContext(accessor, context) {
            if (context.ui) {
                this.updateCell(accessor.get(configuration_1.IConfigurationService), context.cell);
            }
            else {
                const configurationService = accessor.get(configuration_1.IConfigurationService);
                context.selectedCells.forEach(cell => {
                    this.updateCell(configurationService, cell);
                });
            }
        }
        updateCell(configurationService, cell) {
            const renderLineNumbers = configurationService.getValue('notebook.lineNumbers') === 'on';
            const cellLineNumbers = cell.lineNumbers;
            // 'on', 'inherit' 	-> 'on'
            // 'on', 'off'		-> 'off'
            // 'on', 'on'		-> 'on'
            // 'off', 'inherit'	-> 'off'
            // 'off', 'off'		-> 'off'
            // 'off', 'on'		-> 'on'
            const currentLineNumberIsOn = cellLineNumbers === 'on' || (cellLineNumbers === 'inherit' && renderLineNumbers);
            if (currentLineNumberIsOn) {
                cell.lineNumbers = 'off';
            }
            else {
                cell.lineNumbers = 'on';
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbEVkaXRvck9wdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9icm93c2VyL3ZpZXcvY2VsbFBhcnRzL2NlbGxFZGl0b3JPcHRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQXFCaEcsTUFBYSxpQkFBa0IsU0FBUSwwQkFBZTtRQU1yRCxZQUE2QixJQUE0QixFQUFXLGVBQWdDLEVBQVcsb0JBQTJDO1lBQ3pKLEtBQUssRUFBRSxDQUFDO1lBRG9CLFNBQUksR0FBSixJQUFJLENBQXdCO1lBQVcsb0JBQWUsR0FBZixlQUFlLENBQWlCO1lBQVcseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUxsSixpQkFBWSxHQUE2QixTQUFTLENBQUM7WUFDMUMsaUJBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFRLENBQUMsQ0FBQztZQUMzRCxnQkFBVyxHQUFnQixJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQztZQU0zRCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFO2dCQUNwQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUMxQixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztRQUM1QyxDQUFDO1FBRVEsV0FBVyxDQUFDLE9BQXVCLEVBQUUsQ0FBZ0M7WUFDN0UsSUFBSSxDQUFDLENBQUMscUJBQXFCLEVBQUU7Z0JBQzVCLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO2FBQ3pDO1FBQ0YsQ0FBQztRQUVPLGlCQUFpQjtZQUN4QixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxxQkFBcUIs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