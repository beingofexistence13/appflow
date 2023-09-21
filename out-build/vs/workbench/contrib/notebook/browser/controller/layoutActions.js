/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/base/common/uri", "vs/nls!vs/workbench/contrib/notebook/browser/controller/layoutActions", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/quickinput/common/quickInput", "vs/workbench/contrib/notebook/browser/controller/coreActions", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/services/notebookEditorService", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookContextKeys", "vs/workbench/contrib/notebook/common/notebookService", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/preferences/common/preferences"], function (require, exports, codicons_1, uri_1, nls_1, actions_1, commands_1, contextkey_1, quickInput_1, coreActions_1, notebookBrowser_1, notebookEditorService_1, notebookCommon_1, notebookContextKeys_1, notebookService_1, editorService_1, preferences_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, actions_1.$Xu)(class NotebookConfigureLayoutAction extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.notebook.layout.select',
                title: {
                    value: (0, nls_1.localize)(0, null),
                    original: 'Select between Notebook Layouts'
                },
                f1: true,
                precondition: contextkey_1.$Ii.equals(`config.${notebookCommon_1.$7H.openGettingStarted}`, true),
                category: coreActions_1.$7ob,
                menu: [
                    {
                        id: actions_1.$Ru.EditorTitle,
                        group: 'notebookLayout',
                        when: contextkey_1.$Ii.and(notebookContextKeys_1.$Wnb, contextkey_1.$Ii.notEquals('config.notebook.globalToolbar', true), contextkey_1.$Ii.equals(`config.${notebookCommon_1.$7H.openGettingStarted}`, true)),
                        order: 0
                    },
                    {
                        id: actions_1.$Ru.NotebookToolbar,
                        group: 'notebookLayout',
                        when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('config.notebook.globalToolbar', true), contextkey_1.$Ii.equals(`config.${notebookCommon_1.$7H.openGettingStarted}`, true)),
                        order: 0
                    }
                ]
            });
        }
        run(accessor) {
            accessor.get(commands_1.$Fr).executeCommand('workbench.action.openWalkthrough', { category: 'notebooks', step: 'notebookProfile' }, true);
        }
    });
    (0, actions_1.$Xu)(class NotebookConfigureLayoutAction extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.notebook.layout.configure',
                title: {
                    value: (0, nls_1.localize)(1, null),
                    original: 'Customize Notebook Layout'
                },
                f1: true,
                category: coreActions_1.$7ob,
                menu: [
                    {
                        id: actions_1.$Ru.NotebookToolbar,
                        group: 'notebookLayout',
                        when: contextkey_1.$Ii.equals('config.notebook.globalToolbar', true),
                        order: 1
                    }
                ]
            });
        }
        run(accessor) {
            accessor.get(preferences_1.$BE).openSettings({ jsonEditor: false, query: '@tag:notebookLayout' });
        }
    });
    (0, actions_1.$Xu)(class NotebookConfigureLayoutFromEditorTitle extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.notebook.layout.configure.editorTitle',
                title: {
                    value: (0, nls_1.localize)(2, null),
                    original: 'Customize Notebook Layout'
                },
                f1: false,
                category: coreActions_1.$7ob,
                menu: [
                    {
                        id: actions_1.$Ru.NotebookEditorLayoutConfigure,
                        group: 'notebookLayout',
                        when: notebookContextKeys_1.$Wnb,
                        order: 1
                    }
                ]
            });
        }
        run(accessor) {
            accessor.get(preferences_1.$BE).openSettings({ jsonEditor: false, query: '@tag:notebookLayout' });
        }
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.EditorTitle, {
        submenu: actions_1.$Ru.NotebookEditorLayoutConfigure,
        rememberDefaultAction: false,
        title: { value: (0, nls_1.localize)(3, null), original: 'Customize Notebook...', },
        icon: codicons_1.$Pj.gear,
        group: 'navigation',
        order: -1,
        when: notebookContextKeys_1.$Wnb
    });
    (0, actions_1.$Xu)(class ToggleLineNumberFromEditorTitle extends actions_1.$Wu {
        constructor() {
            super({
                id: 'notebook.toggleLineNumbersFromEditorTitle',
                title: { value: (0, nls_1.localize)(4, null), original: 'Toggle Notebook Line Numbers' },
                precondition: notebookContextKeys_1.$Ynb,
                menu: [
                    {
                        id: actions_1.$Ru.NotebookEditorLayoutConfigure,
                        group: 'notebookLayoutDetails',
                        order: 1,
                        when: notebookContextKeys_1.$Wnb
                    }
                ],
                category: coreActions_1.$7ob,
                f1: true,
                toggled: {
                    condition: contextkey_1.$Ii.notEquals('config.notebook.lineNumbers', 'off'),
                    title: (0, nls_1.localize)(5, null),
                }
            });
        }
        async run(accessor) {
            return accessor.get(commands_1.$Fr).executeCommand('notebook.toggleLineNumbers');
        }
    });
    (0, actions_1.$Xu)(class ToggleCellToolbarPositionFromEditorTitle extends actions_1.$Wu {
        constructor() {
            super({
                id: 'notebook.toggleCellToolbarPositionFromEditorTitle',
                title: { value: (0, nls_1.localize)(6, null), original: 'Toggle Cell Toolbar Position' },
                menu: [{
                        id: actions_1.$Ru.NotebookEditorLayoutConfigure,
                        group: 'notebookLayoutDetails',
                        order: 3
                    }],
                category: coreActions_1.$7ob,
                f1: false
            });
        }
        async run(accessor, ...args) {
            return accessor.get(commands_1.$Fr).executeCommand('notebook.toggleCellToolbarPosition', ...args);
        }
    });
    (0, actions_1.$Xu)(class ToggleBreadcrumbFromEditorTitle extends actions_1.$Wu {
        constructor() {
            super({
                id: 'breadcrumbs.toggleFromEditorTitle',
                title: { value: (0, nls_1.localize)(7, null), original: 'Toggle Breadcrumbs' },
                menu: [{
                        id: actions_1.$Ru.NotebookEditorLayoutConfigure,
                        group: 'notebookLayoutDetails',
                        order: 2
                    }],
                f1: false
            });
        }
        async run(accessor) {
            return accessor.get(commands_1.$Fr).executeCommand('breadcrumbs.toggle');
        }
    });
    (0, actions_1.$Xu)(class SaveMimeTypeDisplayOrder extends actions_1.$Wu {
        constructor() {
            super({
                id: 'notebook.saveMimeTypeOrder',
                title: {
                    value: (0, nls_1.localize)(8, null),
                    original: 'Save Mimetype Display Order'
                },
                f1: true,
                category: coreActions_1.$7ob,
                precondition: notebookContextKeys_1.$Wnb,
            });
        }
        run(accessor) {
            const service = accessor.get(notebookService_1.$ubb);
            const qp = accessor.get(quickInput_1.$Gq).createQuickPick();
            qp.placeholder = (0, nls_1.localize)(9, null);
            qp.items = [
                { target: 2 /* ConfigurationTarget.USER */, label: (0, nls_1.localize)(10, null) },
                { target: 5 /* ConfigurationTarget.WORKSPACE */, label: (0, nls_1.localize)(11, null) },
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
    (0, actions_1.$Xu)(class NotebookWebviewResetAction extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.notebook.layout.webview.reset',
                title: {
                    value: (0, nls_1.localize)(12, null),
                    original: 'Reset Notebook Webview'
                },
                f1: false,
                category: coreActions_1.$7ob
            });
        }
        run(accessor, args) {
            const editorService = accessor.get(editorService_1.$9C);
            if (args) {
                const uri = uri_1.URI.revive(args);
                const notebookEditorService = accessor.get(notebookEditorService_1.$1rb);
                const widgets = notebookEditorService.listNotebookEditors().filter(widget => widget.hasModel() && widget.textModel.uri.toString() === uri.toString());
                for (const widget of widgets) {
                    if (widget.hasModel()) {
                        widget.getInnerWebview()?.reload();
                    }
                }
            }
            else {
                const editor = (0, notebookBrowser_1.$Zbb)(editorService.activeEditorPane);
                if (!editor) {
                    return;
                }
                editor.getInnerWebview()?.reload();
            }
        }
    });
});
//# sourceMappingURL=layoutActions.js.map