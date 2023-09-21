/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/nls!vs/workbench/contrib/notebook/browser/view/cellParts/cellEditorOptions", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationRegistry", "vs/platform/contextkey/common/contextkey", "vs/platform/registry/common/platform", "vs/workbench/common/contextkeys", "vs/workbench/contrib/notebook/browser/controller/coreActions", "vs/workbench/contrib/notebook/common/notebookContextKeys", "vs/workbench/contrib/notebook/browser/view/cellPart", "vs/workbench/contrib/notebook/common/notebookCommon"], function (require, exports, event_1, nls_1, actions_1, configuration_1, configurationRegistry_1, contextkey_1, platform_1, contextkeys_1, coreActions_1, notebookContextKeys_1, cellPart_1, notebookCommon_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ipb = void 0;
    class $ipb extends cellPart_1.$Hnb {
        constructor(h, notebookOptions, configurationService) {
            super();
            this.h = h;
            this.notebookOptions = notebookOptions;
            this.configurationService = configurationService;
            this.a = 'inherit';
            this.b = this.B(new event_1.$fd());
            this.onDidChange = this.b.event;
            this.B(h.onDidChange(() => {
                this.j();
            }));
            this.g = this.m();
        }
        updateState(element, e) {
            if (e.cellLineNumberChanged) {
                this.setLineNumbers(element.lineNumbers);
            }
        }
        j() {
            this.g = this.m();
            this.b.fire();
        }
        m() {
            const value = this.h.value;
            let cellRenderLineNumber = value.lineNumbers;
            switch (this.a) {
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
                ...this.g,
                ...{
                    padding: this.notebookOptions.computeEditorPadding(internalMetadata, cellUri)
                }
            };
        }
        getDefaultValue() {
            return {
                ...this.g,
                ...{
                    padding: { top: 12, bottom: 12 }
                }
            };
        }
        setLineNumbers(lineNumbers) {
            this.a = lineNumbers;
            this.j();
        }
    }
    exports.$ipb = $ipb;
    platform_1.$8m.as(configurationRegistry_1.$an.Configuration).registerConfiguration({
        id: 'notebook',
        order: 100,
        type: 'object',
        'properties': {
            'notebook.lineNumbers': {
                type: 'string',
                enum: ['off', 'on'],
                default: 'off',
                markdownDescription: (0, nls_1.localize)(0, null)
            }
        }
    });
    (0, actions_1.$Xu)(class ToggleLineNumberAction extends actions_1.$Wu {
        constructor() {
            super({
                id: 'notebook.toggleLineNumbers',
                title: { value: (0, nls_1.localize)(1, null), original: 'Toggle Notebook Line Numbers' },
                precondition: notebookContextKeys_1.$Ynb,
                menu: [
                    {
                        id: actions_1.$Ru.NotebookToolbar,
                        group: 'notebookLayout',
                        order: 2,
                        when: contextkey_1.$Ii.equals('config.notebook.globalToolbar', true)
                    }
                ],
                category: coreActions_1.$7ob,
                f1: true,
                toggled: {
                    condition: contextkey_1.$Ii.notEquals('config.notebook.lineNumbers', 'off'),
                    title: (0, nls_1.localize)(2, null),
                }
            });
        }
        async run(accessor) {
            const configurationService = accessor.get(configuration_1.$8h);
            const renderLiNumbers = configurationService.getValue('notebook.lineNumbers') === 'on';
            if (renderLiNumbers) {
                configurationService.updateValue('notebook.lineNumbers', 'off');
            }
            else {
                configurationService.updateValue('notebook.lineNumbers', 'on');
            }
        }
    });
    (0, actions_1.$Xu)(class ToggleActiveLineNumberAction extends coreActions_1.$cpb {
        constructor() {
            super({
                id: 'notebook.cell.toggleLineNumbers',
                title: (0, nls_1.localize)(3, null),
                precondition: contextkeys_1.$$cb.isEqualTo(notebookCommon_1.$TH),
                menu: [{
                        id: actions_1.$Ru.NotebookCellTitle,
                        group: 'View',
                        order: 1
                    }],
                toggled: contextkey_1.$Ii.or(notebookContextKeys_1.$eob.isEqualTo('on'), contextkey_1.$Ii.and(notebookContextKeys_1.$eob.isEqualTo('inherit'), contextkey_1.$Ii.equals('config.notebook.lineNumbers', 'on')))
            });
        }
        async runWithContext(accessor, context) {
            if (context.ui) {
                this.c(accessor.get(configuration_1.$8h), context.cell);
            }
            else {
                const configurationService = accessor.get(configuration_1.$8h);
                context.selectedCells.forEach(cell => {
                    this.c(configurationService, cell);
                });
            }
        }
        c(configurationService, cell) {
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
//# sourceMappingURL=cellEditorOptions.js.map