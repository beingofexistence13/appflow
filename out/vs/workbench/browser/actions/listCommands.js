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
        if (!listService_1.WorkbenchListSelectionNavigation.getValue(widget.contextKeyService)) {
            return updateFocusFn(widget);
        }
        const focus = widget.getFocus();
        const selection = widget.getSelection();
        await updateFocusFn(widget);
        const newFocus = widget.getFocus();
        if (selection.length > 1 || !(0, arrays_1.equals)(focus, selection) || (0, arrays_1.equals)(focus, newFocus)) {
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
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'list.focusDown',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: listService_1.WorkbenchListFocusContextKey,
        primary: 18 /* KeyCode.DownArrow */,
        mac: {
            primary: 18 /* KeyCode.DownArrow */,
            secondary: [256 /* KeyMod.WinCtrl */ | 44 /* KeyCode.KeyN */]
        },
        handler: (accessor, arg2) => {
            navigate(accessor.get(listService_1.IListService).lastFocusedList, async (widget) => {
                const fakeKeyboardEvent = new KeyboardEvent('keydown');
                await widget.focusNext(typeof arg2 === 'number' ? arg2 : 1, false, fakeKeyboardEvent);
            });
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'list.focusUp',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: listService_1.WorkbenchListFocusContextKey,
        primary: 16 /* KeyCode.UpArrow */,
        mac: {
            primary: 16 /* KeyCode.UpArrow */,
            secondary: [256 /* KeyMod.WinCtrl */ | 46 /* KeyCode.KeyP */]
        },
        handler: (accessor, arg2) => {
            navigate(accessor.get(listService_1.IListService).lastFocusedList, async (widget) => {
                const fakeKeyboardEvent = new KeyboardEvent('keydown');
                await widget.focusPrevious(typeof arg2 === 'number' ? arg2 : 1, false, fakeKeyboardEvent);
            });
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'list.focusPageDown',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: listService_1.WorkbenchListFocusContextKey,
        primary: 12 /* KeyCode.PageDown */,
        handler: (accessor) => {
            navigate(accessor.get(listService_1.IListService).lastFocusedList, async (widget) => {
                const fakeKeyboardEvent = new KeyboardEvent('keydown');
                await widget.focusNextPage(fakeKeyboardEvent);
            });
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'list.focusPageUp',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: listService_1.WorkbenchListFocusContextKey,
        primary: 11 /* KeyCode.PageUp */,
        handler: (accessor) => {
            navigate(accessor.get(listService_1.IListService).lastFocusedList, async (widget) => {
                const fakeKeyboardEvent = new KeyboardEvent('keydown');
                await widget.focusPreviousPage(fakeKeyboardEvent);
            });
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'list.focusFirst',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: listService_1.WorkbenchListFocusContextKey,
        primary: 14 /* KeyCode.Home */,
        handler: (accessor) => {
            navigate(accessor.get(listService_1.IListService).lastFocusedList, async (widget) => {
                const fakeKeyboardEvent = new KeyboardEvent('keydown');
                await widget.focusFirst(fakeKeyboardEvent);
            });
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'list.focusLast',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: listService_1.WorkbenchListFocusContextKey,
        primary: 13 /* KeyCode.End */,
        handler: (accessor) => {
            navigate(accessor.get(listService_1.IListService).lastFocusedList, async (widget) => {
                const fakeKeyboardEvent = new KeyboardEvent('keydown');
                await widget.focusLast(fakeKeyboardEvent);
            });
        }
    });
    function expandMultiSelection(focused, previousFocus) {
        // List
        if (focused instanceof listWidget_1.List || focused instanceof listPaging_1.PagedList || focused instanceof tableWidget_1.Table) {
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
        else if (focused instanceof objectTree_1.ObjectTree || focused instanceof dataTree_1.DataTree || focused instanceof asyncDataTree_1.AsyncDataTree) {
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
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'list.expandSelectionDown',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: contextkey_1.ContextKeyExpr.and(listService_1.WorkbenchListFocusContextKey, listService_1.WorkbenchListSupportsMultiSelectContextKey),
        primary: 1024 /* KeyMod.Shift */ | 18 /* KeyCode.DownArrow */,
        handler: (accessor, arg2) => {
            const widget = accessor.get(listService_1.IListService).lastFocusedList;
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
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'list.expandSelectionUp',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: contextkey_1.ContextKeyExpr.and(listService_1.WorkbenchListFocusContextKey, listService_1.WorkbenchListSupportsMultiSelectContextKey),
        primary: 1024 /* KeyMod.Shift */ | 16 /* KeyCode.UpArrow */,
        handler: (accessor, arg2) => {
            const widget = accessor.get(listService_1.IListService).lastFocusedList;
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
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'list.collapse',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: contextkey_1.ContextKeyExpr.and(listService_1.WorkbenchListFocusContextKey, contextkey_1.ContextKeyExpr.or(listService_1.WorkbenchTreeElementCanCollapse, listService_1.WorkbenchTreeElementHasParent)),
        primary: 15 /* KeyCode.LeftArrow */,
        mac: {
            primary: 15 /* KeyCode.LeftArrow */,
            secondary: [2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */]
        },
        handler: (accessor) => {
            const widget = accessor.get(listService_1.IListService).lastFocusedList;
            if (!widget || !(widget instanceof objectTree_1.ObjectTree || widget instanceof dataTree_1.DataTree || widget instanceof asyncDataTree_1.AsyncDataTree)) {
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
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'list.collapseAll',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: listService_1.WorkbenchListFocusContextKey,
        primary: 2048 /* KeyMod.CtrlCmd */ | 15 /* KeyCode.LeftArrow */,
        mac: {
            primary: 2048 /* KeyMod.CtrlCmd */ | 15 /* KeyCode.LeftArrow */,
            secondary: [2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 16 /* KeyCode.UpArrow */]
        },
        handler: (accessor) => {
            const focused = accessor.get(listService_1.IListService).lastFocusedList;
            if (focused && !(focused instanceof listWidget_1.List || focused instanceof listPaging_1.PagedList || focused instanceof tableWidget_1.Table)) {
                focused.collapseAll();
            }
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'list.collapseAllToFocus',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: listService_1.WorkbenchListFocusContextKey,
        handler: accessor => {
            const focused = accessor.get(listService_1.IListService).lastFocusedList;
            const fakeKeyboardEvent = (0, listService_1.getSelectionKeyboardEvent)('keydown', true);
            // Trees
            if (focused instanceof objectTree_1.ObjectTree || focused instanceof dataTree_1.DataTree || focused instanceof asyncDataTree_1.AsyncDataTree) {
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
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'list.focusParent',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: listService_1.WorkbenchListFocusContextKey,
        handler: (accessor) => {
            const widget = accessor.get(listService_1.IListService).lastFocusedList;
            if (!widget || !(widget instanceof objectTree_1.ObjectTree || widget instanceof dataTree_1.DataTree || widget instanceof asyncDataTree_1.AsyncDataTree)) {
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
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'list.expand',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: contextkey_1.ContextKeyExpr.and(listService_1.WorkbenchListFocusContextKey, contextkey_1.ContextKeyExpr.or(listService_1.WorkbenchTreeElementCanExpand, listService_1.WorkbenchTreeElementHasChild)),
        primary: 17 /* KeyCode.RightArrow */,
        handler: (accessor) => {
            const widget = accessor.get(listService_1.IListService).lastFocusedList;
            if (!widget) {
                return;
            }
            if (widget instanceof objectTree_1.ObjectTree || widget instanceof dataTree_1.DataTree) {
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
            else if (widget instanceof asyncDataTree_1.AsyncDataTree) {
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
        const focused = accessor.get(listService_1.IListService).lastFocusedList;
        const fakeKeyboardEvent = (0, listService_1.getSelectionKeyboardEvent)('keydown', retainCurrentFocus);
        // List
        if (focused instanceof listWidget_1.List || focused instanceof listPaging_1.PagedList || focused instanceof tableWidget_1.Table) {
            const list = focused;
            list.setSelection(list.getFocus(), fakeKeyboardEvent);
            list.setAnchor(list.getFocus()[0]);
        }
        // Trees
        else if (focused instanceof objectTree_1.ObjectTree || focused instanceof dataTree_1.DataTree || focused instanceof asyncDataTree_1.AsyncDataTree) {
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
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'list.select',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: listService_1.WorkbenchListFocusContextKey,
        primary: 3 /* KeyCode.Enter */,
        mac: {
            primary: 3 /* KeyCode.Enter */,
            secondary: [2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */]
        },
        handler: (accessor) => {
            selectElement(accessor, false);
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'list.selectAndPreserveFocus',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: listService_1.WorkbenchListFocusContextKey,
        handler: accessor => {
            selectElement(accessor, true);
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'list.selectAll',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: contextkey_1.ContextKeyExpr.and(listService_1.WorkbenchListFocusContextKey, listService_1.WorkbenchListSupportsMultiSelectContextKey),
        primary: 2048 /* KeyMod.CtrlCmd */ | 31 /* KeyCode.KeyA */,
        handler: (accessor) => {
            const focused = accessor.get(listService_1.IListService).lastFocusedList;
            // List
            if (focused instanceof listWidget_1.List || focused instanceof listPaging_1.PagedList || focused instanceof tableWidget_1.Table) {
                const list = focused;
                const fakeKeyboardEvent = new KeyboardEvent('keydown');
                list.setSelection((0, arrays_1.range)(list.length), fakeKeyboardEvent);
            }
            // Trees
            else if (focused instanceof objectTree_1.ObjectTree || focused instanceof dataTree_1.DataTree || focused instanceof asyncDataTree_1.AsyncDataTree) {
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
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'list.toggleSelection',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: listService_1.WorkbenchListFocusContextKey,
        primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 3 /* KeyCode.Enter */,
        handler: (accessor) => {
            const widget = accessor.get(listService_1.IListService).lastFocusedList;
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
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'list.toggleExpand',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: listService_1.WorkbenchListFocusContextKey,
        primary: 10 /* KeyCode.Space */,
        handler: (accessor) => {
            const focused = accessor.get(listService_1.IListService).lastFocusedList;
            // Tree only
            if (focused instanceof objectTree_1.ObjectTree || focused instanceof dataTree_1.DataTree || focused instanceof asyncDataTree_1.AsyncDataTree) {
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
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'list.clear',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: contextkey_1.ContextKeyExpr.and(listService_1.WorkbenchListFocusContextKey, listService_1.WorkbenchListHasSelectionOrFocus),
        primary: 9 /* KeyCode.Escape */,
        handler: (accessor) => {
            const widget = accessor.get(listService_1.IListService).lastFocusedList;
            if (!widget) {
                return;
            }
            const selection = widget.getSelection();
            const fakeKeyboardEvent = new KeyboardEvent('keydown');
            if (selection.length > 1) {
                const useSelectionNavigation = listService_1.WorkbenchListSelectionNavigation.getValue(widget.contextKeyService);
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
    commands_1.CommandsRegistry.registerCommand({
        id: 'list.triggerTypeNavigation',
        handler: (accessor) => {
            const widget = accessor.get(listService_1.IListService).lastFocusedList;
            widget?.triggerTypeNavigation();
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: 'list.toggleFindMode',
        handler: (accessor) => {
            const widget = accessor.get(listService_1.IListService).lastFocusedList;
            if (widget instanceof abstractTree_1.AbstractTree || widget instanceof asyncDataTree_1.AsyncDataTree) {
                const tree = widget;
                tree.findMode = tree.findMode === abstractTree_1.TreeFindMode.Filter ? abstractTree_1.TreeFindMode.Highlight : abstractTree_1.TreeFindMode.Filter;
            }
        }
    });
    // Deprecated commands
    commands_1.CommandsRegistry.registerCommandAlias('list.toggleKeyboardNavigation', 'list.triggerTypeNavigation');
    commands_1.CommandsRegistry.registerCommandAlias('list.toggleFilterOnType', 'list.toggleFindMode');
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'list.find',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: contextkey_1.ContextKeyExpr.and(listService_1.RawWorkbenchListFocusContextKey, listService_1.WorkbenchListSupportsFind),
        primary: 2048 /* KeyMod.CtrlCmd */ | 36 /* KeyCode.KeyF */,
        secondary: [61 /* KeyCode.F3 */],
        handler: (accessor) => {
            const widget = accessor.get(listService_1.IListService).lastFocusedList;
            // List
            if (widget instanceof listWidget_1.List || widget instanceof listPaging_1.PagedList || widget instanceof tableWidget_1.Table) {
                // TODO@joao
            }
            // Tree
            else if (widget instanceof abstractTree_1.AbstractTree || widget instanceof asyncDataTree_1.AsyncDataTree) {
                const tree = widget;
                tree.openFind();
            }
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'list.closeFind',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: contextkey_1.ContextKeyExpr.and(listService_1.RawWorkbenchListFocusContextKey, listService_1.WorkbenchTreeFindOpen),
        primary: 9 /* KeyCode.Escape */,
        handler: (accessor) => {
            const widget = accessor.get(listService_1.IListService).lastFocusedList;
            if (widget instanceof abstractTree_1.AbstractTree || widget instanceof asyncDataTree_1.AsyncDataTree) {
                const tree = widget;
                tree.closeFind();
            }
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'list.scrollUp',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        // Since the default keybindings for list.scrollUp and widgetNavigation.focusPrevious
        // are both Ctrl+UpArrow, we disable this command when the scrollbar is at
        // top-most position. This will give chance for widgetNavigation.focusPrevious to execute
        when: contextkey_1.ContextKeyExpr.and(listService_1.WorkbenchListFocusContextKey, listService_1.WorkbenchListScrollAtTopContextKey?.negate()),
        primary: 2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */,
        handler: accessor => {
            const focused = accessor.get(listService_1.IListService).lastFocusedList;
            if (!focused) {
                return;
            }
            focused.scrollTop -= 10;
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'list.scrollDown',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        // same as above
        when: contextkey_1.ContextKeyExpr.and(listService_1.WorkbenchListFocusContextKey, listService_1.WorkbenchListScrollAtBottomContextKey?.negate()),
        primary: 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */,
        handler: accessor => {
            const focused = accessor.get(listService_1.IListService).lastFocusedList;
            if (!focused) {
                return;
            }
            focused.scrollTop += 10;
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'list.scrollLeft',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: listService_1.WorkbenchListFocusContextKey,
        handler: accessor => {
            const focused = accessor.get(listService_1.IListService).lastFocusedList;
            if (!focused) {
                return;
            }
            focused.scrollLeft -= 10;
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'list.scrollRight',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: listService_1.WorkbenchListFocusContextKey,
        handler: accessor => {
            const focused = accessor.get(listService_1.IListService).lastFocusedList;
            if (!focused) {
                return;
            }
            focused.scrollLeft += 10;
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdENvbW1hbmRzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2Jyb3dzZXIvYWN0aW9ucy9saXN0Q29tbWFuZHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFrQmhHLFNBQVMsY0FBYyxDQUFDLE1BQThCO1FBQ3JELDJEQUEyRDtRQUMzRCwyREFBMkQ7UUFDM0QscURBQXFEO1FBQ3JELHVEQUF1RDtRQUN2RCxJQUFJLE1BQU0sSUFBSSxNQUFNLENBQUMsY0FBYyxFQUFFLEtBQUssUUFBUSxDQUFDLGFBQWEsRUFBRTtZQUNqRSxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7U0FDbEI7SUFDRixDQUFDO0lBRUQsS0FBSyxVQUFVLFdBQVcsQ0FBQyxNQUEyQixFQUFFLGFBQW9FO1FBQzNILElBQUksQ0FBQyw4Q0FBZ0MsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLEVBQUU7WUFDekUsT0FBTyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDN0I7UUFFRCxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDaEMsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBRXhDLE1BQU0sYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRTVCLE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUVuQyxJQUFJLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBQSxlQUFNLEVBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxJQUFJLElBQUEsZUFBTSxFQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsRUFBRTtZQUNqRixPQUFPO1NBQ1A7UUFFRCxNQUFNLGlCQUFpQixHQUFHLElBQUksYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3ZELE1B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