/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/codicons", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/editor/browser/widget/diffEditor/diffEditorWidget", "vs/editor/common/editorContextKeys", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey"], function (require, exports, dom_1, codicons_1, editorExtensions_1, codeEditorService_1, diffEditorWidget_1, editorContextKeys_1, nls_1, actions_1, commands_1, configuration_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.findFocusedDiffEditor = exports.AccessibleDiffViewerPrev = exports.AccessibleDiffViewerNext = exports.ShowAllUnchangedRegions = exports.CollapseAllUnchangedRegions = exports.ExitCompareMove = exports.SwitchSide = exports.ToggleUseInlineViewWhenSpaceIsLimited = exports.ToggleShowMovedCodeBlocks = exports.ToggleCollapseUnchangedRegions = void 0;
    class ToggleCollapseUnchangedRegions extends actions_1.Action2 {
        constructor() {
            super({
                id: 'diffEditor.toggleCollapseUnchangedRegions',
                title: { value: (0, nls_1.localize)('toggleCollapseUnchangedRegions', "Toggle Collapse Unchanged Regions"), original: 'Toggle Collapse Unchanged Regions' },
                icon: codicons_1.Codicon.map,
                toggled: contextkey_1.ContextKeyExpr.has('config.diffEditor.hideUnchangedRegions.enabled'),
                precondition: contextkey_1.ContextKeyExpr.has('isInDiffEditor'),
                menu: {
                    when: contextkey_1.ContextKeyExpr.has('isInDiffEditor'),
                    id: actions_1.MenuId.EditorTitle,
                    order: 22,
                    group: 'navigation',
                },
            });
        }
        run(accessor, ...args) {
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const newValue = !configurationService.getValue('diffEditor.hideUnchangedRegions.enabled');
            configurationService.updateValue('diffEditor.hideUnchangedRegions.enabled', newValue);
        }
    }
    exports.ToggleCollapseUnchangedRegions = ToggleCollapseUnchangedRegions;
    (0, actions_1.registerAction2)(ToggleCollapseUnchangedRegions);
    class ToggleShowMovedCodeBlocks extends actions_1.Action2 {
        constructor() {
            super({
                id: 'diffEditor.toggleShowMovedCodeBlocks',
                title: { value: (0, nls_1.localize)('toggleShowMovedCodeBlocks', "Toggle Show Moved Code Blocks"), original: 'Toggle Show Moved Code Blocks' },
                precondition: contextkey_1.ContextKeyExpr.has('isInDiffEditor'),
            });
        }
        run(accessor, ...args) {
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const newValue = !configurationService.getValue('diffEditor.experimental.showMoves');
            configurationService.updateValue('diffEditor.experimental.showMoves', newValue);
        }
    }
    exports.ToggleShowMovedCodeBlocks = ToggleShowMovedCodeBlocks;
    (0, actions_1.registerAction2)(ToggleShowMovedCodeBlocks);
    class ToggleUseInlineViewWhenSpaceIsLimited extends actions_1.Action2 {
        constructor() {
            super({
                id: 'diffEditor.toggleUseInlineViewWhenSpaceIsLimited',
                title: { value: (0, nls_1.localize)('toggleUseInlineViewWhenSpaceIsLimited', "Toggle Use Inline View When Space Is Limited"), original: 'Toggle Use Inline View When Space Is Limited' },
                precondition: contextkey_1.ContextKeyExpr.has('isInDiffEditor'),
            });
        }
        run(accessor, ...args) {
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const newValue = !configurationService.getValue('diffEditor.useInlineViewWhenSpaceIsLimited');
            configurationService.updateValue('diffEditor.useInlineViewWhenSpaceIsLimited', newValue);
        }
    }
    exports.ToggleUseInlineViewWhenSpaceIsLimited = ToggleUseInlineViewWhenSpaceIsLimited;
    (0, actions_1.registerAction2)(ToggleUseInlineViewWhenSpaceIsLimited);
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitle, {
        command: {
            id: new ToggleUseInlineViewWhenSpaceIsLimited().desc.id,
            title: (0, nls_1.localize)('useInlineViewWhenSpaceIsLimited', "Use Inline View When Space Is Limited"),
            toggled: contextkey_1.ContextKeyExpr.has('config.diffEditor.useInlineViewWhenSpaceIsLimited'),
            precondition: contextkey_1.ContextKeyExpr.has('isInDiffEditor'),
        },
        order: 11,
        group: '1_diff',
        when: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.diffEditorRenderSideBySideInlineBreakpointReached, contextkey_1.ContextKeyExpr.has('isInDiffEditor')),
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitle, {
        command: {
            id: new ToggleShowMovedCodeBlocks().desc.id,
            title: (0, nls_1.localize)('showMoves', "Show Moved Code Blocks"),
            icon: codicons_1.Codicon.move,
            toggled: contextkey_1.ContextKeyEqualsExpr.create('config.diffEditor.experimental.showMoves', true),
            precondition: contextkey_1.ContextKeyExpr.has('isInDiffEditor'),
        },
        order: 10,
        group: '1_diff',
        when: contextkey_1.ContextKeyExpr.has('isInDiffEditor'),
    });
    const diffEditorCategory = {
        value: (0, nls_1.localize)('diffEditor', 'Diff Editor'),
        original: 'Diff Editor',
    };
    class SwitchSide extends editorExtensions_1.EditorAction2 {
        constructor() {
            super({
                id: 'diffEditor.switchSide',
                title: { value: (0, nls_1.localize)('switchSide', "Switch Side"), original: 'Switch Side' },
                icon: codicons_1.Codicon.arrowSwap,
                precondition: contextkey_1.ContextKeyExpr.has('isInDiffEditor'),
                f1: true,
                category: diffEditorCategory,
            });
        }
        runEditorCommand(accessor, editor, arg) {
            const diffEditor = findFocusedDiffEditor(accessor);
            if (diffEditor instanceof diffEditorWidget_1.DiffEditorWidget) {
                if (arg && arg.dryRun) {
                    return { destinationSelection: diffEditor.mapToOtherSide().destinationSelection };
                }
                else {
                    diffEditor.switchSide();
                }
            }
            return undefined;
        }
    }
    exports.SwitchSide = SwitchSide;
    (0, actions_1.registerAction2)(SwitchSide);
    class ExitCompareMove extends editorExtensions_1.EditorAction2 {
        constructor() {
            super({
                id: 'diffEditor.exitCompareMove',
                title: { value: (0, nls_1.localize)('exitCompareMove', "Exit Compare Move"), original: 'Exit Compare Move' },
                icon: codicons_1.Codicon.close,
                precondition: editorContextKeys_1.EditorContextKeys.comparingMovedCode,
                f1: false,
                category: diffEditorCategory,
                keybinding: {
                    weight: 10000,
                    primary: 9 /* KeyCode.Escape */,
                }
            });
        }
        runEditorCommand(accessor, editor, ...args) {
            const diffEditor = findFocusedDiffEditor(accessor);
            if (diffEditor instanceof diffEditorWidget_1.DiffEditorWidget) {
                diffEditor.exitCompareMove();
            }
        }
    }
    exports.ExitCompareMove = ExitCompareMove;
    (0, actions_1.registerAction2)(ExitCompareMove);
    class CollapseAllUnchangedRegions extends editorExtensions_1.EditorAction2 {
        constructor() {
            super({
                id: 'diffEditor.collapseAllUnchangedRegions',
                title: { value: (0, nls_1.localize)('collapseAllUnchangedRegions', "Collapse All Unchanged Regions"), original: 'Collapse All Unchanged Regions' },
                icon: codicons_1.Codicon.fold,
                precondition: contextkey_1.ContextKeyExpr.has('isInDiffEditor'),
                f1: true,
                category: diffEditorCategory,
            });
        }
        runEditorCommand(accessor, editor, ...args) {
            const diffEditor = findFocusedDiffEditor(accessor);
            if (diffEditor instanceof diffEditorWidget_1.DiffEditorWidget) {
                diffEditor.collapseAllUnchangedRegions();
            }
        }
    }
    exports.CollapseAllUnchangedRegions = CollapseAllUnchangedRegions;
    (0, actions_1.registerAction2)(CollapseAllUnchangedRegions);
    class ShowAllUnchangedRegions extends editorExtensions_1.EditorAction2 {
        constructor() {
            super({
                id: 'diffEditor.showAllUnchangedRegions',
                title: { value: (0, nls_1.localize)('showAllUnchangedRegions', "Show All Unchanged Regions"), original: 'Show All Unchanged Regions' },
                icon: codicons_1.Codicon.unfold,
                precondition: contextkey_1.ContextKeyExpr.has('isInDiffEditor'),
                f1: true,
                category: diffEditorCategory,
            });
        }
        runEditorCommand(accessor, editor, ...args) {
            const diffEditor = findFocusedDiffEditor(accessor);
            if (diffEditor instanceof diffEditorWidget_1.DiffEditorWidget) {
                diffEditor.showAllUnchangedRegions();
            }
        }
    }
    exports.ShowAllUnchangedRegions = ShowAllUnchangedRegions;
    (0, actions_1.registerAction2)(ShowAllUnchangedRegions);
    const accessibleDiffViewerCategory = {
        value: (0, nls_1.localize)('accessibleDiffViewer', 'Accessible Diff Viewer'),
        original: 'Accessible Diff Viewer',
    };
    class AccessibleDiffViewerNext extends actions_1.Action2 {
        static { this.id = 'editor.action.accessibleDiffViewer.next'; }
        constructor() {
            super({
                id: AccessibleDiffViewerNext.id,
                title: { value: (0, nls_1.localize)('editor.action.accessibleDiffViewer.next', "Go to Next Difference"), original: 'Go to Next Difference' },
                category: accessibleDiffViewerCategory,
                precondition: contextkey_1.ContextKeyExpr.has('isInDiffEditor'),
                keybinding: {
                    primary: 65 /* KeyCode.F7 */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                f1: true,
            });
        }
        run(accessor) {
            const diffEditor = findFocusedDiffEditor(accessor);
            diffEditor?.accessibleDiffViewerNext();
        }
    }
    exports.AccessibleDiffViewerNext = AccessibleDiffViewerNext;
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitle, {
        command: {
            id: AccessibleDiffViewerNext.id,
            title: (0, nls_1.localize)('Open Accessible Diff Viewer', "Open Accessible Diff Viewer"),
            precondition: contextkey_1.ContextKeyExpr.has('isInDiffEditor'),
        },
        order: 10,
        group: '2_diff',
        when: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.accessibleDiffViewerVisible.negate(), contextkey_1.ContextKeyExpr.has('isInDiffEditor')),
    });
    class AccessibleDiffViewerPrev extends actions_1.Action2 {
        static { this.id = 'editor.action.accessibleDiffViewer.prev'; }
        constructor() {
            super({
                id: AccessibleDiffViewerPrev.id,
                title: { value: (0, nls_1.localize)('editor.action.accessibleDiffViewer.prev', "Go to Previous Difference"), original: 'Go to Previous Difference' },
                category: accessibleDiffViewerCategory,
                precondition: contextkey_1.ContextKeyExpr.has('isInDiffEditor'),
                keybinding: {
                    primary: 1024 /* KeyMod.Shift */ | 65 /* KeyCode.F7 */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                f1: true,
            });
        }
        run(accessor) {
            const diffEditor = findFocusedDiffEditor(accessor);
            diffEditor?.accessibleDiffViewerPrev();
        }
    }
    exports.AccessibleDiffViewerPrev = AccessibleDiffViewerPrev;
    function findFocusedDiffEditor(accessor) {
        const codeEditorService = accessor.get(codeEditorService_1.ICodeEditorService);
        const diffEditors = codeEditorService.listDiffEditors();
        const activeCodeEditor = codeEditorService.getFocusedCodeEditor() ?? codeEditorService.getActiveCodeEditor();
        if (!activeCodeEditor) {
            return null;
        }
        for (let i = 0, len = diffEditors.length; i < len; i++) {
            const diffEditor = diffEditors[i];
            if (diffEditor.getModifiedEditor().getId() === activeCodeEditor.getId() || diffEditor.getOriginalEditor().getId() === activeCodeEditor.getId()) {
                return diffEditor;
            }
        }
        const activeElement = (0, dom_1.getActiveElement)();
        if (activeElement) {
            for (const d of diffEditors) {
                const container = d.getContainerDomNode();
                if (isElementOrParentOf(container, activeElement)) {
                    return d;
                }
            }
        }
        return null;
    }
    exports.findFocusedDiffEditor = findFocusedDiffEditor;
    function isElementOrParentOf(elementOrParent, element) {
        let e = element;
        while (e) {
            if (e === elementOrParent) {
                return true;
            }
            e = e.parentElement;
        }
        return false;
    }
    commands_1.CommandsRegistry.registerCommandAlias('editor.action.diffReview.next', AccessibleDiffViewerNext.id);
    (0, actions_1.registerAction2)(AccessibleDiffViewerNext);
    commands_1.CommandsRegistry.registerCommandAlias('editor.action.diffReview.prev', AccessibleDiffViewerPrev.id);
    (0, actions_1.registerAction2)(AccessibleDiffViewerPrev);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlmZkVkaXRvci5jb250cmlidXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvYnJvd3Nlci93aWRnZXQvZGlmZkVkaXRvci9kaWZmRWRpdG9yLmNvbnRyaWJ1dGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFrQmhHLE1BQWEsOEJBQStCLFNBQVEsaUJBQU87UUFDMUQ7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLDJDQUEyQztnQkFDL0MsS0FBSyxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLGdDQUFnQyxFQUFFLG1DQUFtQyxDQUFDLEVBQUUsUUFBUSxFQUFFLG1DQUFtQyxFQUFFO2dCQUNoSixJQUFJLEVBQUUsa0JBQU8sQ0FBQyxHQUFHO2dCQUNqQixPQUFPLEVBQUUsMkJBQWMsQ0FBQyxHQUFHLENBQUMsZ0RBQWdELENBQUM7Z0JBQzdFLFlBQVksRUFBRSwyQkFBYyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQztnQkFDbEQsSUFBSSxFQUFFO29CQUNMLElBQUksRUFBRSwyQkFBYyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQztvQkFDMUMsRUFBRSxFQUFFLGdCQUFNLENBQUMsV0FBVztvQkFDdEIsS0FBSyxFQUFFLEVBQUU7b0JBQ1QsS0FBSyxFQUFFLFlBQVk7aUJBQ25CO2FBQ0QsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELEdBQUcsQ0FBQyxRQUEwQixFQUFFLEdBQUcsSUFBZTtZQUNqRCxNQUFNLG9CQUFvQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMscUNBQXFCLENBQUMsQ0FBQztZQUNqRSxNQUFNLFFBQVEsR0FBRyxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBVSx5Q0FBeUMsQ0FBQyxDQUFDO1lBQ3BHLG9CQUFvQixDQUFDLFdBQVcsQ0FBQyx5Q0FBeUMsRUFBRSxRQUFRLENB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