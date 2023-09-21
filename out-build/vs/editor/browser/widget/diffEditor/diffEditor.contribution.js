/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/codicons", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/editor/browser/widget/diffEditor/diffEditorWidget", "vs/editor/common/editorContextKeys", "vs/nls!vs/editor/browser/widget/diffEditor/diffEditor.contribution", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey"], function (require, exports, dom_1, codicons_1, editorExtensions_1, codeEditorService_1, diffEditorWidget_1, editorContextKeys_1, nls_1, actions_1, commands_1, configuration_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$d1 = exports.$c1 = exports.$b1 = exports.$a1 = exports.$_Z = exports.$$Z = exports.$0Z = exports.$9Z = exports.$8Z = exports.$7Z = void 0;
    class $7Z extends actions_1.$Wu {
        constructor() {
            super({
                id: 'diffEditor.toggleCollapseUnchangedRegions',
                title: { value: (0, nls_1.localize)(0, null), original: 'Toggle Collapse Unchanged Regions' },
                icon: codicons_1.$Pj.map,
                toggled: contextkey_1.$Ii.has('config.diffEditor.hideUnchangedRegions.enabled'),
                precondition: contextkey_1.$Ii.has('isInDiffEditor'),
                menu: {
                    when: contextkey_1.$Ii.has('isInDiffEditor'),
                    id: actions_1.$Ru.EditorTitle,
                    order: 22,
                    group: 'navigation',
                },
            });
        }
        run(accessor, ...args) {
            const configurationService = accessor.get(configuration_1.$8h);
            const newValue = !configurationService.getValue('diffEditor.hideUnchangedRegions.enabled');
            configurationService.updateValue('diffEditor.hideUnchangedRegions.enabled', newValue);
        }
    }
    exports.$7Z = $7Z;
    (0, actions_1.$Xu)($7Z);
    class $8Z extends actions_1.$Wu {
        constructor() {
            super({
                id: 'diffEditor.toggleShowMovedCodeBlocks',
                title: { value: (0, nls_1.localize)(1, null), original: 'Toggle Show Moved Code Blocks' },
                precondition: contextkey_1.$Ii.has('isInDiffEditor'),
            });
        }
        run(accessor, ...args) {
            const configurationService = accessor.get(configuration_1.$8h);
            const newValue = !configurationService.getValue('diffEditor.experimental.showMoves');
            configurationService.updateValue('diffEditor.experimental.showMoves', newValue);
        }
    }
    exports.$8Z = $8Z;
    (0, actions_1.$Xu)($8Z);
    class $9Z extends actions_1.$Wu {
        constructor() {
            super({
                id: 'diffEditor.toggleUseInlineViewWhenSpaceIsLimited',
                title: { value: (0, nls_1.localize)(2, null), original: 'Toggle Use Inline View When Space Is Limited' },
                precondition: contextkey_1.$Ii.has('isInDiffEditor'),
            });
        }
        run(accessor, ...args) {
            const configurationService = accessor.get(configuration_1.$8h);
            const newValue = !configurationService.getValue('diffEditor.useInlineViewWhenSpaceIsLimited');
            configurationService.updateValue('diffEditor.useInlineViewWhenSpaceIsLimited', newValue);
        }
    }
    exports.$9Z = $9Z;
    (0, actions_1.$Xu)($9Z);
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.EditorTitle, {
        command: {
            id: new $9Z().desc.id,
            title: (0, nls_1.localize)(3, null),
            toggled: contextkey_1.$Ii.has('config.diffEditor.useInlineViewWhenSpaceIsLimited'),
            precondition: contextkey_1.$Ii.has('isInDiffEditor'),
        },
        order: 11,
        group: '1_diff',
        when: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.diffEditorRenderSideBySideInlineBreakpointReached, contextkey_1.$Ii.has('isInDiffEditor')),
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.EditorTitle, {
        command: {
            id: new $8Z().desc.id,
            title: (0, nls_1.localize)(4, null),
            icon: codicons_1.$Pj.move,
            toggled: contextkey_1.$Oi.create('config.diffEditor.experimental.showMoves', true),
            precondition: contextkey_1.$Ii.has('isInDiffEditor'),
        },
        order: 10,
        group: '1_diff',
        when: contextkey_1.$Ii.has('isInDiffEditor'),
    });
    const diffEditorCategory = {
        value: (0, nls_1.localize)(5, null),
        original: 'Diff Editor',
    };
    class $0Z extends editorExtensions_1.$uV {
        constructor() {
            super({
                id: 'diffEditor.switchSide',
                title: { value: (0, nls_1.localize)(6, null), original: 'Switch Side' },
                icon: codicons_1.$Pj.arrowSwap,
                precondition: contextkey_1.$Ii.has('isInDiffEditor'),
                f1: true,
                category: diffEditorCategory,
            });
        }
        runEditorCommand(accessor, editor, arg) {
            const diffEditor = $d1(accessor);
            if (diffEditor instanceof diffEditorWidget_1.$6Z) {
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
    exports.$0Z = $0Z;
    (0, actions_1.$Xu)($0Z);
    class $$Z extends editorExtensions_1.$uV {
        constructor() {
            super({
                id: 'diffEditor.exitCompareMove',
                title: { value: (0, nls_1.localize)(7, null), original: 'Exit Compare Move' },
                icon: codicons_1.$Pj.close,
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
            const diffEditor = $d1(accessor);
            if (diffEditor instanceof diffEditorWidget_1.$6Z) {
                diffEditor.exitCompareMove();
            }
        }
    }
    exports.$$Z = $$Z;
    (0, actions_1.$Xu)($$Z);
    class $_Z extends editorExtensions_1.$uV {
        constructor() {
            super({
                id: 'diffEditor.collapseAllUnchangedRegions',
                title: { value: (0, nls_1.localize)(8, null), original: 'Collapse All Unchanged Regions' },
                icon: codicons_1.$Pj.fold,
                precondition: contextkey_1.$Ii.has('isInDiffEditor'),
                f1: true,
                category: diffEditorCategory,
            });
        }
        runEditorCommand(accessor, editor, ...args) {
            const diffEditor = $d1(accessor);
            if (diffEditor instanceof diffEditorWidget_1.$6Z) {
                diffEditor.collapseAllUnchangedRegions();
            }
        }
    }
    exports.$_Z = $_Z;
    (0, actions_1.$Xu)($_Z);
    class $a1 extends editorExtensions_1.$uV {
        constructor() {
            super({
                id: 'diffEditor.showAllUnchangedRegions',
                title: { value: (0, nls_1.localize)(9, null), original: 'Show All Unchanged Regions' },
                icon: codicons_1.$Pj.unfold,
                precondition: contextkey_1.$Ii.has('isInDiffEditor'),
                f1: true,
                category: diffEditorCategory,
            });
        }
        runEditorCommand(accessor, editor, ...args) {
            const diffEditor = $d1(accessor);
            if (diffEditor instanceof diffEditorWidget_1.$6Z) {
                diffEditor.showAllUnchangedRegions();
            }
        }
    }
    exports.$a1 = $a1;
    (0, actions_1.$Xu)($a1);
    const accessibleDiffViewerCategory = {
        value: (0, nls_1.localize)(10, null),
        original: 'Accessible Diff Viewer',
    };
    class $b1 extends actions_1.$Wu {
        static { this.id = 'editor.action.accessibleDiffViewer.next'; }
        constructor() {
            super({
                id: $b1.id,
                title: { value: (0, nls_1.localize)(11, null), original: 'Go to Next Difference' },
                category: accessibleDiffViewerCategory,
                precondition: contextkey_1.$Ii.has('isInDiffEditor'),
                keybinding: {
                    primary: 65 /* KeyCode.F7 */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                f1: true,
            });
        }
        run(accessor) {
            const diffEditor = $d1(accessor);
            diffEditor?.accessibleDiffViewerNext();
        }
    }
    exports.$b1 = $b1;
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.EditorTitle, {
        command: {
            id: $b1.id,
            title: (0, nls_1.localize)(12, null),
            precondition: contextkey_1.$Ii.has('isInDiffEditor'),
        },
        order: 10,
        group: '2_diff',
        when: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.accessibleDiffViewerVisible.negate(), contextkey_1.$Ii.has('isInDiffEditor')),
    });
    class $c1 extends actions_1.$Wu {
        static { this.id = 'editor.action.accessibleDiffViewer.prev'; }
        constructor() {
            super({
                id: $c1.id,
                title: { value: (0, nls_1.localize)(13, null), original: 'Go to Previous Difference' },
                category: accessibleDiffViewerCategory,
                precondition: contextkey_1.$Ii.has('isInDiffEditor'),
                keybinding: {
                    primary: 1024 /* KeyMod.Shift */ | 65 /* KeyCode.F7 */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                f1: true,
            });
        }
        run(accessor) {
            const diffEditor = $d1(accessor);
            diffEditor?.accessibleDiffViewerPrev();
        }
    }
    exports.$c1 = $c1;
    function $d1(accessor) {
        const codeEditorService = accessor.get(codeEditorService_1.$nV);
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
        const activeElement = (0, dom_1.$VO)();
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
    exports.$d1 = $d1;
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
    commands_1.$Gr.registerCommandAlias('editor.action.diffReview.next', $b1.id);
    (0, actions_1.$Xu)($b1);
    commands_1.$Gr.registerCommandAlias('editor.action.diffReview.prev', $c1.id);
    (0, actions_1.$Xu)($c1);
});
//# sourceMappingURL=diffEditor.contribution.js.map