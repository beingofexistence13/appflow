/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/keybinding/common/keybindingsRegistry", "vs/base/browser/ui/list/listWidget", "vs/platform/list/browser/listService", "vs/base/browser/ui/list/listPaging", "vs/base/common/arrays", "vs/platform/contextkey/common/contextkey", "vs/base/browser/ui/tree/objectTree", "vs/base/browser/ui/tree/asyncDataTree", "vs/base/browser/ui/tree/dataTree", "vs/platform/commands/common/commands", "vs/base/browser/ui/table/tableWidget", "vs/base/browser/ui/tree/abstractTree"], function (require, exports, keybindingsRegistry_1, listWidget_1, listService_1, listPaging_1, arrays_1, contextkey_1, objectTree_1, asyncDataTree_1, dataTree_1, commands_1, tableWidget_1, abstractTree_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function ensureDOMFocus(widget) {
        // it can happen that one of the commands is executed while
        // DOM focus is within another focusable control within the
        // list/tree item. therefor we should ensure that the
        // list/tree has DOM focus again after the command ran.
        if (widget && widget.getHTMLElement() !== document.activeElement) {
            widget.domFocus();
        }
    }
    async function updateFocus(widget, updateFocusFn) {
        if (!listService_1.$i4.getValue(widget.contextKeyService)) {
            return updateFocusFn(widget);
        }
        const focus = widget.getFocus();
        const selection = widget.getSelection();
        await updateFocusFn(widget);
        const newFocus = widget.getFocus();
        if (selection.length > 1 || !(0, arrays_1.$sb)(focus, selection) || (0, arrays_1.$sb)(focus, newFocus)) {
            return;
        }
        const fakeKeyboardEvent = new KeyboardEvent('keydown');
        widget.setSelection(newFocus, fakeKeyboardEvent);
    }
    async function navigate(widget, updateFocusFn) {
        if (!widget) {
            return;
        }
        await updateFocus(widget, updateFocusFn);
        const listFocus = widget.getFocus();
        if (listFocus.length) {
            widget.reveal(listFocus[0]);
        }
        widget.setAnchor(listFocus[0]);
        ensureDOMFocus(widget);
    }
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'list.focusDown',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: listService_1.$e4,
        primary: 18 /* KeyCode.DownArrow */,
        mac: {
            primary: 18 /* KeyCode.DownArrow */,
            secondary: [256 /* KeyMod.WinCtrl */ | 44 /* KeyCode.KeyN */]
        },
        handler: (accessor, arg2) => {
            navigate(accessor.get(listService_1.$03).lastFocusedList, async (widget) => {
                const fakeKeyboardEvent = new KeyboardEvent('keydown');
                await widget.focusNext(typeof arg2 === 'number' ? arg2 : 1, false, fakeKeyboardEvent);
            });
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'list.focusUp',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: listService_1.$e4,
        primary: 16 /* KeyCode.UpArrow */,
        mac: {
            primary: 16 /* KeyCode.UpArrow */,
            secondary: [256 /* KeyMod.WinCtrl */ | 46 /* KeyCode.KeyP */]
        },
        handler: (accessor, arg2) => {
            navigate(accessor.get(listService_1.$03).lastFocusedList, async (widget) => {
                const fakeKeyboardEvent = new KeyboardEvent('keydown');
                await widget.focusPrevious(typeof arg2 === 'number' ? arg2 : 1, false, fakeKeyboardEvent);
            });
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'list.focusPageDown',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: listService_1.$e4,
        primary: 12 /* KeyCode.PageDown */,
        handler: (accessor) => {
            navigate(accessor.get(listService_1.$03).lastFocusedList, async (widget) => {
                const fakeKeyboardEvent = new KeyboardEvent('keydown');
                await widget.focusNextPage(fakeKeyboardEvent);
            });
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'list.focusPageUp',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: listService_1.$e4,
        primary: 11 /* KeyCode.PageUp */,
        handler: (accessor) => {
            navigate(accessor.get(listService_1.$03).lastFocusedList, async (widget) => {
                const fakeKeyboardEvent = new KeyboardEvent('keydown');
                await widget.focusPreviousPage(fakeKeyboardEvent);
            });
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'list.focusFirst',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: listService_1.$e4,
        primary: 14 /* KeyCode.Home */,
        handler: (accessor) => {
            navigate(accessor.get(listService_1.$03).lastFocusedList, async (widget) => {
                const fakeKeyboardEvent = new KeyboardEvent('keydown');
                await widget.focusFirst(fakeKeyboardEvent);
            });
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'list.focusLast',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: listService_1.$e4,
        primary: 13 /* KeyCode.End */,
        handler: (accessor) => {
            navigate(accessor.get(listService_1.$03).lastFocusedList, async (widget) => {
                const fakeKeyboardEvent = new KeyboardEvent('keydown');
                await widget.focusLast(fakeKeyboardEvent);
            });
        }
    });
    function expandMultiSelection(focused, previousFocus) {
        // List
        if (focused instanceof listWidget_1.$wQ || focused instanceof listPaging_1.$UR || focused instanceof tableWidget_1.$5R) {
            const list = focused;
            const focus = list.getFocus() ? list.getFocus()[0] : undefined;
            const selection = list.getSelection();
            if (selection && typeof focus === 'number' && selection.indexOf(focus) >= 0) {
                list.setSelection(selection.filter(s => s !== previousFocus));
            }
            else {
                if (typeof focus === 'number') {
                    list.setSelection(selection.concat(focus));
                }
            }
        }
        // Tree
        else if (focused instanceof objectTree_1.$mS || focused instanceof dataTree_1.$qS || focused instanceof asyncDataTree_1.$oS) {
            const list = focused;
            const focus = list.getFocus() ? list.getFocus()[0] : undefined;
            if (previousFocus === focus) {
                return;
            }
            const selection = list.getSelection();
            const fakeKeyboardEvent = new KeyboardEvent('keydown', { shiftKey: true });
            if (selection && selection.indexOf(focus) >= 0) {
                list.setSelection(selection.filter(s => s !== previousFocus), fakeKeyboardEvent);
            }
            else {
                list.setSelection(selection.concat(focus), fakeKeyboardEvent);
            }
        }
    }
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'list.expandSelectionDown',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: contextkey_1.$Ii.and(listService_1.$e4, listService_1.$d4),
        primary: 1024 /* KeyMod.Shift */ | 18 /* KeyCode.DownArrow */,
        handler: (accessor, arg2) => {
            const widget = accessor.get(listService_1.$03).lastFocusedList;
            if (!widget) {
                return;
            }
            // Focus down first
            const previousFocus = widget.getFocus() ? widget.getFocus()[0] : undefined;
            const fakeKeyboardEvent = new KeyboardEvent('keydown');
            widget.focusNext(typeof arg2 === 'number' ? arg2 : 1, false, fakeKeyboardEvent);
            // Then adjust selection
            expandMultiSelection(widget, previousFocus);
            const focus = widget.getFocus();
            if (focus.length) {
                widget.reveal(focus[0]);
            }
            ensureDOMFocus(widget);
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'list.expandSelectionUp',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: contextkey_1.$Ii.and(listService_1.$e4, listService_1.$d4),
        primary: 1024 /* KeyMod.Shift */ | 16 /* KeyCode.UpArrow */,
        handler: (accessor, arg2) => {
            const widget = accessor.get(listService_1.$03).lastFocusedList;
            if (!widget) {
                return;
            }
            // Focus up first
            const previousFocus = widget.getFocus() ? widget.getFocus()[0] : undefined;
            const fakeKeyboardEvent = new KeyboardEvent('keydown');
            widget.focusPrevious(typeof arg2 === 'number' ? arg2 : 1, false, fakeKeyboardEvent);
            // Then adjust selection
            expandMultiSelection(widget, previousFocus);
            const focus = widget.getFocus();
            if (focus.length) {
                widget.reveal(focus[0]);
            }
            ensureDOMFocus(widget);
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'list.collapse',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: contextkey_1.$Ii.and(listService_1.$e4, contextkey_1.$Ii.or(listService_1.$k4, listService_1.$l4)),
        primary: 15 /* KeyCode.LeftArrow */,
        mac: {
            primary: 15 /* KeyCode.LeftArrow */,
            secondary: [2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */]
        },
        handler: (accessor) => {
            const widget = accessor.get(listService_1.$03).lastFocusedList;
            if (!widget || !(widget instanceof objectTree_1.$mS || widget instanceof dataTree_1.$qS || widget instanceof asyncDataTree_1.$oS)) {
                return;
            }
            const tree = widget;
            const focusedElements = tree.getFocus();
            if (focusedElements.length === 0) {
                return;
            }
            const focus = focusedElements[0];
            if (!tree.collapse(focus)) {
                const parent = tree.getParentElement(focus);
                if (parent) {
                    navigate(widget, widget => {
                        const fakeKeyboardEvent = new KeyboardEvent('keydown');
                        widget.setFocus([parent], fakeKeyboardEvent);
                    });
                }
            }
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'list.collapseAll',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: listService_1.$e4,
        primary: 2048 /* KeyMod.CtrlCmd */ | 15 /* KeyCode.LeftArrow */,
        mac: {
            primary: 2048 /* KeyMod.CtrlCmd */ | 15 /* KeyCode.LeftArrow */,
            secondary: [2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 16 /* KeyCode.UpArrow */]
        },
        handler: (accessor) => {
            const focused = accessor.get(listService_1.$03).lastFocusedList;
            if (focused && !(focused instanceof listWidget_1.$wQ || focused instanceof listPaging_1.$UR || focused instanceof tableWidget_1.$5R)) {
                focused.collapseAll();
            }
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'list.collapseAllToFocus',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: listService_1.$e4,
        handler: accessor => {
            const focused = accessor.get(listService_1.$03).lastFocusedList;
            const fakeKeyboardEvent = (0, listService_1.$s4)('keydown', true);
            // Trees
            if (focused instanceof objectTree_1.$mS || focused instanceof dataTree_1.$qS || focused instanceof asyncDataTree_1.$oS) {
                const tree = focused;
                const focus = tree.getFocus();
                if (focus.length > 0) {
                    tree.collapse(focus[0], true);
                }
                tree.setSelection(focus, fakeKeyboardEvent);
                tree.setAnchor(focus[0]);
            }
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'list.focusParent',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: listService_1.$e4,
        handler: (accessor) => {
            const widget = accessor.get(listService_1.$03).lastFocusedList;
            if (!widget || !(widget instanceof objectTree_1.$mS || widget instanceof dataTree_1.$qS || widget instanceof asyncDataTree_1.$oS)) {
                return;
            }
            const tree = widget;
            const focusedElements = tree.getFocus();
            if (focusedElements.length === 0) {
                return;
            }
            const focus = focusedElements[0];
            const parent = tree.getParentElement(focus);
            if (parent) {
                navigate(widget, widget => {
                    const fakeKeyboardEvent = new KeyboardEvent('keydown');
                    widget.setFocus([parent], fakeKeyboardEvent);
                });
            }
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'list.expand',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: contextkey_1.$Ii.and(listService_1.$e4, contextkey_1.$Ii.or(listService_1.$m4, listService_1.$n4)),
        primary: 17 /* KeyCode.RightArrow */,
        handler: (accessor) => {
            const widget = accessor.get(listService_1.$03).lastFocusedList;
            if (!widget) {
                return;
            }
            if (widget instanceof objectTree_1.$mS || widget instanceof dataTree_1.$qS) {
                // TODO@Joao: instead of doing this here, just delegate to a tree method
                const focusedElements = widget.getFocus();
                if (focusedElements.length === 0) {
                    return;
                }
                const focus = focusedElements[0];
                if (!widget.expand(focus)) {
                    const child = widget.getFirstElementChild(focus);
                    if (child) {
                        const node = widget.getNode(child);
                        if (node.visible) {
                            navigate(widget, widget => {
                                const fakeKeyboardEvent = new KeyboardEvent('keydown');
                                widget.setFocus([child], fakeKeyboardEvent);
                            });
                        }
                    }
                }
            }
            else if (widget instanceof asyncDataTree_1.$oS) {
                // TODO@Joao: instead of doing this here, just delegate to a tree method
                const focusedElements = widget.getFocus();
                if (focusedElements.length === 0) {
                    return;
                }
                const focus = focusedElements[0];
                widget.expand(focus).then(didExpand => {
                    if (focus && !didExpand) {
                        const child = widget.getFirstElementChild(focus);
                        if (child) {
                            const node = widget.getNode(child);
                            if (node.visible) {
                                navigate(widget, widget => {
                                    const fakeKeyboardEvent = new KeyboardEvent('keydown');
                                    widget.setFocus([child], fakeKeyboardEvent);
                                });
                            }
                        }
                    }
                });
            }
        }
    });
    function selectElement(accessor, retainCurrentFocus) {
        const focused = accessor.get(listService_1.$03).lastFocusedList;
        const fakeKeyboardEvent = (0, listService_1.$s4)('keydown', retainCurrentFocus);
        // List
        if (focused instanceof listWidget_1.$wQ || focused instanceof listPaging_1.$UR || focused instanceof tableWidget_1.$5R) {
            const list = focused;
            list.setSelection(list.getFocus(), fakeKeyboardEvent);
            list.setAnchor(list.getFocus()[0]);
        }
        // Trees
        else if (focused instanceof objectTree_1.$mS || focused instanceof dataTree_1.$qS || focused instanceof asyncDataTree_1.$oS) {
            const tree = focused;
            const focus = tree.getFocus();
            if (focus.length > 0) {
                let toggleCollapsed = true;
                if (tree.expandOnlyOnTwistieClick === true) {
                    toggleCollapsed = false;
                }
                else if (typeof tree.expandOnlyOnTwistieClick !== 'boolean' && tree.expandOnlyOnTwistieClick(focus[0])) {
                    toggleCollapsed = false;
                }
                if (toggleCollapsed) {
                    tree.toggleCollapsed(focus[0]);
                }
            }
            tree.setSelection(focus, fakeKeyboardEvent);
            tree.setAnchor(focus[0]);
        }
    }
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'list.select',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: listService_1.$e4,
        primary: 3 /* KeyCode.Enter */,
        mac: {
            primary: 3 /* KeyCode.Enter */,
            secondary: [2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */]
        },
        handler: (accessor) => {
            selectElement(accessor, false);
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'list.selectAndPreserveFocus',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: listService_1.$e4,
        handler: accessor => {
            selectElement(accessor, true);
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'list.selectAll',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: contextkey_1.$Ii.and(listService_1.$e4, listService_1.$d4),
        primary: 2048 /* KeyMod.CtrlCmd */ | 31 /* KeyCode.KeyA */,
        handler: (accessor) => {
            const focused = accessor.get(listService_1.$03).lastFocusedList;
            // List
            if (focused instanceof listWidget_1.$wQ || focused instanceof listPaging_1.$UR || focused instanceof tableWidget_1.$5R) {
                const list = focused;
                const fakeKeyboardEvent = new KeyboardEvent('keydown');
                list.setSelection((0, arrays_1.$Qb)(list.length), fakeKeyboardEvent);
            }
            // Trees
            else if (focused instanceof objectTree_1.$mS || focused instanceof dataTree_1.$qS || focused instanceof asyncDataTree_1.$oS) {
                const tree = focused;
                const focus = tree.getFocus();
                const selection = tree.getSelection();
                // Which element should be considered to start selecting all?
                let start = undefined;
                if (focus.length > 0 && (selection.length === 0 || !selection.includes(focus[0]))) {
                    start = focus[0];
                }
                if (!start && selection.length > 0) {
                    start = selection[0];
                }
                // What is the scope of select all?
                let scope = undefined;
                if (!start) {
                    scope = undefined;
                }
                else {
                    scope = tree.getParentElement(start);
                }
                const newSelection = [];
                const visit = (node) => {
                    for (const child of node.children) {
                        if (child.visible) {
                            newSelection.push(child.element);
                            if (!child.collapsed) {
                                visit(child);
                            }
                        }
                    }
                };
                // Add the whole scope subtree to the new selection
                visit(tree.getNode(scope));
                // If the scope isn't the tree root, it should be part of the new selection
                if (scope && selection.length === newSelection.length) {
                    newSelection.unshift(scope);
                }
                const fakeKeyboardEvent = new KeyboardEvent('keydown');
                tree.setSelection(newSelection, fakeKeyboardEvent);
            }
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'list.toggleSelection',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: listService_1.$e4,
        primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 3 /* KeyCode.Enter */,
        handler: (accessor) => {
            const widget = accessor.get(listService_1.$03).lastFocusedList;
            if (!widget) {
                return;
            }
            const focus = widget.getFocus();
            if (focus.length === 0) {
                return;
            }
            const selection = widget.getSelection();
            const index = selection.indexOf(focus[0]);
            if (index > -1) {
                widget.setSelection([...selection.slice(0, index), ...selection.slice(index + 1)]);
            }
            else {
                widget.setSelection([...selection, focus[0]]);
            }
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'list.toggleExpand',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: listService_1.$e4,
        primary: 10 /* KeyCode.Space */,
        handler: (accessor) => {
            const focused = accessor.get(listService_1.$03).lastFocusedList;
            // Tree only
            if (focused instanceof objectTree_1.$mS || focused instanceof dataTree_1.$qS || focused instanceof asyncDataTree_1.$oS) {
                const tree = focused;
                const focus = tree.getFocus();
                if (focus.length > 0 && tree.isCollapsible(focus[0])) {
                    tree.toggleCollapsed(focus[0]);
                    return;
                }
            }
            selectElement(accessor, true);
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'list.clear',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: contextkey_1.$Ii.and(listService_1.$e4, listService_1.$f4),
        primary: 9 /* KeyCode.Escape */,
        handler: (accessor) => {
            const widget = accessor.get(listService_1.$03).lastFocusedList;
            if (!widget) {
                return;
            }
            const selection = widget.getSelection();
            const fakeKeyboardEvent = new KeyboardEvent('keydown');
            if (selection.length > 1) {
                const useSelectionNavigation = listService_1.$i4.getValue(widget.contextKeyService);
                if (useSelectionNavigation) {
                    const focus = widget.getFocus();
                    widget.setSelection([focus[0]], fakeKeyboardEvent);
                }
                else {
                    widget.setSelection([], fakeKeyboardEvent);
                }
            }
            else {
                widget.setSelection([], fakeKeyboardEvent);
                widget.setFocus([], fakeKeyboardEvent);
            }
            widget.setAnchor(undefined);
        }
    });
    commands_1.$Gr.registerCommand({
        id: 'list.triggerTypeNavigation',
        handler: (accessor) => {
            const widget = accessor.get(listService_1.$03).lastFocusedList;
            widget?.triggerTypeNavigation();
        }
    });
    commands_1.$Gr.registerCommand({
        id: 'list.toggleFindMode',
        handler: (accessor) => {
            const widget = accessor.get(listService_1.$03).lastFocusedList;
            if (widget instanceof abstractTree_1.$fS || widget instanceof asyncDataTree_1.$oS) {
                const tree = widget;
                tree.findMode = tree.findMode === abstractTree_1.TreeFindMode.Filter ? abstractTree_1.TreeFindMode.Highlight : abstractTree_1.TreeFindMode.Filter;
            }
        }
    });
    // Deprecated commands
    commands_1.$Gr.registerCommandAlias('list.toggleKeyboardNavigation', 'list.triggerTypeNavigation');
    commands_1.$Gr.registerCommandAlias('list.toggleFilterOnType', 'list.toggleFindMode');
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'list.find',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: contextkey_1.$Ii.and(listService_1.$c4, listService_1.$j4),
        primary: 2048 /* KeyMod.CtrlCmd */ | 36 /* KeyCode.KeyF */,
        secondary: [61 /* KeyCode.F3 */],
        handler: (accessor) => {
            const widget = accessor.get(listService_1.$03).lastFocusedList;
            // List
            if (widget instanceof listWidget_1.$wQ || widget instanceof listPaging_1.$UR || widget instanceof tableWidget_1.$5R) {
                // TODO@joao
            }
            // Tree
            else if (widget instanceof abstractTree_1.$fS || widget instanceof asyncDataTree_1.$oS) {
                const tree = widget;
                tree.openFind();
            }
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'list.closeFind',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: contextkey_1.$Ii.and(listService_1.$c4, listService_1.$o4),
        primary: 9 /* KeyCode.Escape */,
        handler: (accessor) => {
            const widget = accessor.get(listService_1.$03).lastFocusedList;
            if (widget instanceof abstractTree_1.$fS || widget instanceof asyncDataTree_1.$oS) {
                const tree = widget;
                tree.closeFind();
            }
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'list.scrollUp',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        // Since the default keybindings for list.scrollUp and widgetNavigation.focusPrevious
        // are both Ctrl+UpArrow, we disable this command when the scrollbar is at
        // top-most position. This will give chance for widgetNavigation.focusPrevious to execute
        when: contextkey_1.$Ii.and(listService_1.$e4, listService_1.$a4?.negate()),
        primary: 2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */,
        handler: accessor => {
            const focused = accessor.get(listService_1.$03).lastFocusedList;
            if (!focused) {
                return;
            }
            focused.scrollTop -= 10;
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'list.scrollDown',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        // same as above
        when: contextkey_1.$Ii.and(listService_1.$e4, listService_1.$b4?.negate()),
        primary: 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */,
        handler: accessor => {
            const focused = accessor.get(listService_1.$03).lastFocusedList;
            if (!focused) {
                return;
            }
            focused.scrollTop += 10;
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'list.scrollLeft',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: listService_1.$e4,
        handler: accessor => {
            const focused = accessor.get(listService_1.$03).lastFocusedList;
            if (!focused) {
                return;
            }
            focused.scrollLeft -= 10;
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'list.scrollRight',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: listService_1.$e4,
        handler: accessor => {
            const focused = accessor.get(listService_1.$03).lastFocusedList;
            if (!focused) {
                return;
            }
            focused.scrollLeft += 10;
        }
    });
});
//# sourceMappingURL=listCommands.js.map