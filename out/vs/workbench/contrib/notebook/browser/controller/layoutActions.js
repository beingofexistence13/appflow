/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/base/common/uri", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/quickinput/common/quickInput", "vs/workbench/contrib/notebook/browser/controller/coreActions", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/services/notebookEditorService", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookContextKeys", "vs/workbench/contrib/notebook/common/notebookService", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/preferences/common/preferences"], function (require, exports, codicons_1, uri_1, nls_1, actions_1, commands_1, contextkey_1, quickInput_1, coreActions_1, notebookBrowser_1, notebookEditorService_1, notebookCommon_1, notebookContextKeys_1, notebookService_1, editorService_1, preferences_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, actions_1.registerAction2)(class NotebookConfigureLayoutAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.notebook.layout.select',
                title: {
                    value: (0, nls_1.localize)('workbench.notebook.layout.select.label', "Select between Notebook Layouts"),
                    original: 'Select between Notebook Layouts'
                },
                f1: true,
                precondition: contextkey_1.ContextKeyExpr.equals(`config.${notebookCommon_1.NotebookSetting.openGettingStarted}`, true),
                category: coreActions_1.NOTEBOOK_ACTIONS_CATEGORY,
                menu: [
                    {
                        id: actions_1.MenuId.EditorTitle,
                        group: 'notebookLayout',
                        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_IS_ACTIVE_EDITOR, contextkey_1.ContextKeyExpr.notEquals('config.notebook.globalToolbar', true), contextkey_1.ContextKeyExpr.equals(`config.${notebookCommon_1.NotebookSetting.openGettingStarted}`, true)),
                        order: 0
                    },
                    {
                        id: actions_1.MenuId.NotebookToolbar,
                        group: 'notebookLayout',
                        when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('config.notebook.globalToolbar', true), contextkey_1.ContextKeyExpr.equals(`config.${notebookCommon_1.NotebookSetting.openGettingStarted}`, true)),
                        order: 0
                    }
                ]
            });
        }
        run(accessor) {
            accessor.get(commands_1.ICommandService).executeCommand('workbench.action.openWalkthrough', { category: 'notebooks', step: 'notebookProfile' }, true);
        }
    });
    (0, actions_1.registerAction2)(class NotebookConfigureLayoutAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.notebook.layout.configure',
                title: {
                    value: (0, nls_1.localize)('workbench.notebook.layout.configure.label', "Customize Notebook Layout"),
                    original: 'Customize Notebook Layout'
                },
                f1: true,
                category: coreActions_1.NOTEBOOK_ACTIONS_CATEGORY,
                menu: [
                    {
                        id: actions_1.MenuId.NotebookToolbar,
                        group: 'notebookLayout',
                        when: contextkey_1.ContextKeyExpr.equals('config.notebook.globalToolbar', true),
                        order: 1
                    }
                ]
            });
        }
        run(accessor) {
            accessor.get(preferences_1.IPreferencesService).openSettings({ jsonEditor: false, query: '@tag:notebookLayout' });
        }
    });
    (0, actions_1.registerAction2)(class NotebookConfigureLayoutFromEditorTitle extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.notebook.layout.configure.editorTitle',
                title: {
                    value: (0, nls_1.localize)('workbench.notebook.layout.configure.label', "Customize Notebook Layout"),
                    original: 'Customize Notebook Layout'
                },
                f1: false,
                category: coreActions_1.NOTEBOOK_ACTIONS_CATEGORY,
                menu: [
                    {
                        id: actions_1.MenuId.NotebookEditorLayoutConfigure,
                        group: 'notebookLayout',
                        when: notebookContextKeys_1.NOTEBOOK_IS_ACTIVE_EDITOR,
                        order: 1
                    }
                ]
            });
        }
        run(accessor) {
            accessor.get(preferences_1.IPreferencesService).openSettings({ jsonEditor: false, query: '@tag:notebookLayout' });
        }
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitle, {
        submenu: actions_1.MenuId.NotebookEditorLayoutConfigure,
        rememberDefaultAction: false,
        title: { value: (0, nls_1.localize)('customizeNotebook', "Customize Notebook..."), original: 'Customize Notebook...', },
        icon: codicons_1.Codicon.gear,
        group: 'navigation',
        order: -1,
        when: notebookContextKeys_1.NOTEBOOK_IS_ACTIVE_EDITOR
    });
    (0, actions_1.registerAction2)(class ToggleLineNumberFromEditorTitle extends actions_1.Action2 {
        constructor() {
            super({
                id: 'notebook.toggleLineNumbersFromEditorTitle',
                title: { value: (0, nls_1.localize)('notebook.toggleLineNumbers', "Toggle Notebook Line Numbers"), original: 'Toggle Notebook Line Numbers' },
                precondition: notebookContextKeys_1.NOTEBOOK_EDITOR_FOCUSED,
                menu: [
                    {
                        id: actions_1.MenuId.NotebookEditorLayoutConfigure,
                        group: 'notebookLayoutDetails',
                        order: 1,
                        when: notebookContextKeys_1.NOTEBOOK_IS_ACTIVE_EDITOR
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
            return accessor.get(commands_1.ICommandService).executeCommand('notebook.toggleLineNumbers');
        }
    });
    (0, actions_1.registerAction2)(class ToggleCellToolbarPositionFromEditorTitle extends actions_1.Action2 {
        constructor() {
            super({
                id: 'notebook.toggleCellToolbarPositionFromEditorTitle',
                title: { value: (0, nls_1.localize)('notebook.toggleCellToolbarPosition', "Toggle Cell Toolbar Position"), original: 'Toggle Cell Toolbar Position' },
                menu: [{
                        id: actions_1.MenuId.NotebookEditorLayoutConfigure,
                        group: 'notebookLayoutDetails',
                        order: 3
                    }],
                category: coreActions_1.NOTEBOOK_ACTIONS_CATEGORY,
                f1: false
            });
        }
        async run(accessor, ...args) {
            return accessor.get(commands_1.ICommandService).executeCommand('notebook.toggleCellToolbarPosition', ...args);
        }
    });
    (0, actions_1.registerAction2)(class ToggleBreadcrumbFromEditorTitle extends actions_1.Action2 {
        constructor() {
            super({
                id: 'breadcrumbs.toggleFromEditorTitle',
                title: { value: (0, nls_1.localize)('notebook.toggleBreadcrumb', "Toggle Breadcrumbs"), original: 'Toggle Breadcrumbs' },
                menu: [{
                        id: actions_1.MenuId.NotebookEditorLayoutConfigure,
                        group: 'notebookLayoutDetails',
                        order: 2
                    }],
                f1: false
            });
        }
        async run(accessor) {
            return accessor.get(commands_1.ICommandService).executeCommand('breadcrumbs.toggle');
        }
    });
    (0, actions_1.registerAction2)(class SaveMimeTypeDisplayOrder extends actions_1.Action2 {
        constructor() {
            super({
                id: 'notebook.saveMimeTypeOrder',
                title: {
                    value: (0, nls_1.localize)('notebook.saveMimeTypeOrder', 'Save Mimetype Display Order'),
                    original: 'Save Mimetype Display Order'
                },
                f1: true,
                category: coreActions_1.NOTEBOOK_ACTIONS_CATEGORY,
                precondition: notebookContextKeys_1.NOTEBOOK_IS_ACTIVE_EDITOR,
            });
        }
        run(accessor) {
            const service = accessor.get(notebookService_1.INotebookService);
            const qp = accessor.get(quickInput_1.IQuickInputService).createQuickPick();
            qp.placeholder = (0, nls_1.localize)('notebook.placeholder', 'Settings file to save in');
            qp.items = [
                { target: 2 /* ConfigurationTarget.USER */, label: (0, nls_1.localize)('saveTarget.machine', 'User Settings') },
                { target: 5 /* ConfigurationTarget.WORKSPACE */, label: (0, nls_1.localize)('saveTarget.workspace', 'Workspace Settings') },
            ];
            qp.onDidAccept(() => {
                const target = qp.selectedItems[0]?.target;
                if (target !== undefined) {
                    service.saveMimeDisplayOrder(target);
                }
                qp.dispose();
            });
            qp.onDidHide(() => qp.dispose());
            qp.show();
        }
    });
    (0, actions_1.registerAction2)(class NotebookWebviewResetAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.notebook.layout.webview.reset',
                title: {
                    value: (0, nls_1.localize)('workbench.notebook.layout.webview.reset.label', "Reset Notebook Webview"),
                    original: 'Reset Notebook Webview'
                },
                f1: false,
                category: coreActions_1.NOTEBOOK_ACTIONS_CATEGORY
            });
        }
        run(accessor, args) {
            const editorService = accessor.get(editorService_1.IEditorService);
            if (args) {
                const uri = uri_1.URI.revive(args);
                const notebookEditorService = accessor.get(notebookEditorService_1.INotebookEditorService);
                const widgets = notebookEditorService.listNotebookEditors().filter(widget => widget.hasModel() && widget.textModel.uri.toString() === uri.toString());
                for (const widget of widgets) {
                    if (widget.hasModel()) {
                        widget.getInnerWebview()?.reload();
                    }
                }
            }
            else {
                const editor = (0, notebookBrowser_1.getNotebookEditorFromEditorPane)(editorService.activeEditorPane);
                if (!editor) {
                    return;
                }
                editor.getInnerWebview()?.reload();
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF5b3V0QWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL2Jyb3dzZXIvY29udHJvbGxlci9sYXlvdXRBY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBb0JoRyxJQUFBLHlCQUFlLEVBQUMsTUFBTSw2QkFBOEIsU0FBUSxpQkFBTztRQUNsRTtZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsa0NBQWtDO2dCQUN0QyxLQUFLLEVBQUU7b0JBQ04sS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLHdDQUF3QyxFQUFFLGlDQUFpQyxDQUFDO29CQUM1RixRQUFRLEVBQUUsaUNBQWlDO2lCQUMzQztnQkFDRCxFQUFFLEVBQUUsSUFBSTtnQkFDUixZQUFZLEVBQUUsMkJBQWMsQ0FBQyxNQUFNLENBQUMsVUFBVSxnQ0FBZSxDQUFDLGtCQUFrQixFQUFFLEVBQUUsSUFBSSxDQUFDO2dCQUN6RixRQUFRLEVBQUUsdUNBQXlCO2dCQUNuQyxJQUFJLEVBQUU7b0JBQ0w7d0JBQ0MsRUFBRSxFQUFFLGdCQUFNLENBQUMsV0FBVzt3QkFDdEIsS0FBSyxFQUFFLGdCQUFnQjt3QkFDdkIsSUFBSSxFQUFFLDJCQUFjLENBQUMsR0FBRyxDQUN2QiwrQ0FBeUIsRUFDekIsMkJBQWMsQ0FBQyxTQUFTLENBQUMsK0JBQStCLEVBQUUsSUFBSSxDQUFDLEVBQy9ELDJCQUFjLENBQUMsTUFBTSxDQUFDLFVBQVUsZ0NBQWUsQ0FBQyxrQkFBa0IsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUMzRTt3QkFDRCxLQUFLLEVBQUUsQ0FBQztxQkFDUjtvQkFDRDt3QkFDQyxFQUFFLEVBQUUsZ0JBQU0sQ0FBQyxlQUFlO3dCQUMxQixLQUFLLEVBQUUsZ0JBQWdCO3dCQUN2QixJQUFJLEVBQUUsMkJBQWMsQ0FBQyxHQUFHLENBQ3ZC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