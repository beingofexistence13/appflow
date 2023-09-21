/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/nls", "vs/base/browser/dom", "vs/base/browser/mouseEvent", "vs/base/common/lifecycle", "vs/platform/action/common/actionCommonCategories", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/workbench/contrib/notebook/common/notebookCommon"], function (require, exports, nls_1, DOM, mouseEvent_1, lifecycle_1, actionCommonCategories_1, actions_1, configuration_1, contextkey_1, contextView_1, notebookCommon_1) {
    "use strict";
    var NotebookStickyScroll_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.computeContent = exports.NotebookStickyScroll = exports.NotebookStickyLine = exports.ToggleNotebookStickyScroll = void 0;
    class ToggleNotebookStickyScroll extends actions_1.Action2 {
        constructor() {
            super({
                id: 'notebook.action.toggleNotebookStickyScroll',
                title: {
                    value: (0, nls_1.localize)('toggleStickyScroll', "Toggle Notebook Sticky Scroll"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'mitoggleStickyScroll', comment: ['&& denotes a mnemonic'] }, "&&Toggle Notebook Sticky Scroll"),
                    original: 'Toggle Notebook Sticky Scroll',
                },
                category: actionCommonCategories_1.Categories.View,
                toggled: {
                    condition: contextkey_1.ContextKeyExpr.equals('config.notebook.stickyScroll.enabled', true),
                    title: (0, nls_1.localize)('notebookStickyScroll', "Notebook Sticky Scroll"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miNotebookStickyScroll', comment: ['&& denotes a mnemonic'] }, "&&Notebook Sticky Scroll"),
                },
                menu: [
                    { id: actions_1.MenuId.CommandPalette },
                    { id: actions_1.MenuId.NotebookStickyScrollContext }
                ]
            });
        }
        async run(accessor) {
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const newValue = !configurationService.getValue('notebook.stickyScroll.enabled');
            return configurationService.updateValue('notebook.stickyScroll.enabled', newValue);
        }
    }
    exports.ToggleNotebookStickyScroll = ToggleNotebookStickyScroll;
    class NotebookStickyLine extends lifecycle_1.Disposable {
        constructor(element, entry, notebookEditor) {
            super();
            this.element = element;
            this.entry = entry;
            this.notebookEditor = notebookEditor;
            this._register(DOM.addDisposableListener(this.element, DOM.EventType.CLICK, () => {
                this.focusCell();
            }));
        }
        focusCell() {
            this.notebookEditor.focusNotebookCell(this.entry.cell, 'container');
            const cellScrollTop = this.notebookEditor.getAbsoluteTopOfElement(this.entry.cell);
            const parentCount = this.getParentCount();
            // 1.1 addresses visible cell padding, to make sure we don't focus md cell and also render its sticky line
            this.notebookEditor.setScrollTop(cellScrollTop - (parentCount + 1.1) * 22);
        }
        getParentCount() {
            let count = 0;
            let entry = this.entry;
            while (entry.parent) {
                count++;
                entry = entry.parent;
            }
            return count;
        }
    }
    exports.NotebookStickyLine = NotebookStickyLine;
    // TODO @Yoyokrazy:
    // BEHAVIOR
    // - [ ] bug with some popping around the cell transition
    // - [ ] bug with only bottom most sticky being partially transitioned
    // 		- partial rendering/transition only occuring when the headers shrink against a new section
    //		- **and only for BOTTOM of that initial sticky tree**
    //		- issues with HC themes
    // UX
    // - [ ] render symbols instead of #'s?
    // 		- maybe 'Hx >' where x is the level
    let NotebookStickyScroll = NotebookStickyScroll_1 = class NotebookStickyScroll extends lifecycle_1.Disposable {
        getDomNode() {
            return this.domNode;
        }
        getCurrentStickyHeight() {
            return this.currentStickyLines.size * 22;
        }
        setCurrentStickyLines(newStickyLines) {
            this.currentStickyLines = newStickyLines;
        }
        constructor(domNode, notebookEditor, notebookOutline, notebookCellList, _contextMenuService) {
            super();
            this.domNode = domNode;
            this.notebookEditor = notebookEditor;
            this.notebookOutline = notebookOutline;
            this.notebookCellList = notebookCellList;
            this._contextMenuService = _contextMenuService;
            this._disposables = new lifecycle_1.DisposableStore();
            this.currentStickyLines = new Map();
            if (this.notebookEditor.notebookOptions.getLayoutConfiguration().stickyScroll) {
                this.init();
            }
            this._register(this.notebookEditor.notebookOptions.onDidChangeOptions((e) => {
                if (e.stickyScroll) {
                    this.updateConfig();
                }
                if (e.globalToolbar) {
                    this.setTop();
                }
            }));
            this._register(DOM.addDisposableListener(this.domNode, DOM.EventType.CONTEXT_MENU, async (event) => {
                this.onContextMenu(event);
            }));
        }
        onContextMenu(e) {
            const event = new mouseEvent_1.StandardMouseEvent(e);
            this._contextMenuService.showContextMenu({
                menuId: actions_1.MenuId.NotebookStickyScrollContext,
                getAnchor: () => event,
            });
        }
        updateConfig() {
            if (this.notebookEditor.notebookOptions.getLayoutConfiguration().stickyScroll) {
                this.init();
            }
            else {
                this._disposables.clear();
                this.disposeCurrentStickyLines();
                DOM.clearNode(this.domNode);
                this.updateDisplay();
            }
        }
        setTop() {
            if (this.notebookEditor.notebookOptions.getLayoutConfiguration().globalToolbar) {
                this.domNode.style.top = '26px';
            }
            else {
                this.domNode.style.top = '0px';
            }
        }
        init() {
            this.notebookOutline.init();
            this.initializeContent();
            this._disposables.add(this.notebookOutline.onDidChange(() => {
                DOM.clearNode(this.domNode);
                this.disposeCurrentStickyLines();
                this.updateContent(computeContent(this.domNode, this.notebookEditor, this.notebookCellList, this.notebookOutline.entries));
            }));
            this._disposables.add(this.notebookEditor.onDidAttachViewModel(() => {
                this.notebookOutline.init();
                this.initializeContent();
            }));
            this._disposables.add(this.notebookEditor.onDidScroll(() => {
                DOM.clearNode(this.domNode);
                this.disposeCurrentStickyLines();
                this.updateContent(computeContent(this.domNode, this.notebookEditor, this.notebookCellList, this.notebookOutline.entries));
            }));
        }
        static getVisibleOutlineEntry(visibleIndex, notebookOutlineEntries) {
            let left = 0;
            let right = notebookOutlineEntries.length - 1;
            let bucket = -1;
            while (left <= right) {
                const mid = Math.floor((left + right) / 2);
                if (notebookOutlineEntries[mid].index === visibleIndex) {
                    bucket = mid;
                    break;
                }
                else if (notebookOutlineEntries[mid].index < visibleIndex) {
                    bucket = mid;
                    left = mid + 1;
                }
                else {
                    right = mid - 1;
                }
            }
            if (bucket !== -1) {
                const rootEntry = notebookOutlineEntries[bucket];
                const flatList = [];
                rootEntry.asFlatList(flatList);
                return flatList.find(entry => entry.index === visibleIndex);
            }
            return undefined;
        }
        initializeContent() {
            // find last code cell of section, store bottom scroll position in sectionBottom
            const visibleRange = this.notebookEditor.visibleRanges[0];
            if (!visibleRange) {
                return;
            }
            DOM.clearNode(this.domNode);
            const editorScrollTop = this.notebookEditor.scrollTop;
            let trackedEntry = undefined;
            let sectionBottom = 0;
            for (let i = visibleRange.start; i < visibleRange.end; i++) {
                if (i === 0) { // don't show headers when you're viewing the top cell
                    this.updateDisplay();
                    this.setCurrentStickyLines(new Map());
                    return;
                }
                const cell = this.notebookEditor.cellAt(i);
                if (!cell) {
                    return;
                }
                // if we are here, the cell is a code cell.
                // check next cell, if markdown, that means this is the end of the section
                // check if cell is within visible range
                const nextCell = this.notebookEditor.cellAt(i + 1);
                if (nextCell && i + 1 < visibleRange.end) {
                    if (nextCell.cellKind === notebookCommon_1.CellKind.Markup) {
                        // this is the end of the section
                        // store the bottom scroll position of this cell
                        sectionBottom = this.notebookCellList.getCellViewScrollBottom(cell);
                        // compute sticky scroll height
                        const entry = NotebookStickyScroll_1.getVisibleOutlineEntry(i, this.notebookOutline.entries);
                        if (!entry) {
                            return;
                        }
                        // using 22 instead of stickyscrollheight, as we don't necessarily render each line. 22 starts rendering sticky when we have space for at least 1 of them
                        const newStickyHeight = NotebookStickyScroll_1.computeStickyHeight(entry);
                        if (editorScrollTop + newStickyHeight < sectionBottom) {
                            trackedEntry = entry;
                            break;
                        }
                        else {
                            // if (editorScrollTop + stickyScrollHeight > sectionBottom), then continue to next section
                            continue;
                        }
                    }
                }
                else {
                    // there is no next cell, so use the bottom of the editor as the sectionBottom, using scrolltop + height
                    sectionBottom = this.notebookEditor.scrollTop + this.notebookEditor.getLayoutInfo().scrollHeight;
                    trackedEntry = NotebookStickyScroll_1.getVisibleOutlineEntry(i, this.notebookOutline.entries);
                    break;
                }
            } // cell loop close
            // -------------------------------------------------------------------------------------
            // we now know the cell which the sticky is determined by, and the sectionBottom value to determine how many sticky lines to render
            // compute the space available for sticky lines, and render sticky lines
            const linesToRender = Math.floor((sectionBottom - editorScrollTop) / 22);
            let newMap = new Map();
            newMap = NotebookStickyScroll_1.renderStickyLines(trackedEntry?.parent, this.domNode, linesToRender, newMap, this.notebookEditor);
            this.setCurrentStickyLines(newMap);
            this.updateDisplay();
        }
        updateContent(newMap) {
            this.setCurrentStickyLines(newMap);
            this.updateDisplay();
        }
        updateDisplay() {
            const hasSticky = this.currentStickyLines.size > 0;
            if (!hasSticky) {
                this.domNode.style.display = 'none';
            }
            else {
                this.domNode.style.display = 'block';
            }
            this.setTop();
        }
        static computeStickyHeight(entry) {
            let height = 0;
            if (entry.cell.cellKind === notebookCommon_1.CellKind.Markup) {
                height += 22;
            }
            while (entry.parent) {
                height += 22;
                entry = entry.parent;
            }
            return height;
        }
        static renderStickyLines(entry, containerElement, numLinesToRender, newMap, notebookEditor) {
            let currentEntry = entry;
            const elementsToRender = [];
            while (currentEntry) {
                if (currentEntry.level === 7) {
                    // level 7 represents a non-header entry, which we don't want to render
                    currentEntry = currentEntry.parent;
                    continue;
                }
                const lineToRender = NotebookStickyScroll_1.createStickyElement(currentEntry, notebookEditor);
                newMap.set(currentEntry, { line: lineToRender, rendered: false });
                elementsToRender.unshift(lineToRender);
                currentEntry = currentEntry.parent;
            }
            // TODO: clean up partial cell animation
            // [ ] slight pop as lines finish disappearing
            // [ ] only actually works when shrunk against new section. **and only for BOTTOM of that initial sticky tree**
            // [ ] issues with HC themes
            // use negative margins to render the bottom sticky line as a partial element
            // todo: partial render logic here
            // if (numLinesToRender % 1 !== 0) {
            // 	const partialHeight = 22 - Math.floor((numLinesToRender % 1) * 22);
            // 	elementsToRender[elementsToRender.length - 1].element.style.zIndex = '-1';
            // 	elementsToRender[elementsToRender.length - 1].element.style.marginTop = `-${partialHeight}px`;
            // }
            // iterate over elements to render, and append to container
            // break when we reach numLinesToRender
            for (let i = 0; i < elementsToRender.length; i++) {
                if (i >= numLinesToRender) {
                    break;
                }
                containerElement.append(elementsToRender[i].element);
                newMap.set(elementsToRender[i].entry, { line: elementsToRender[i], rendered: true });
            }
            containerElement.append(DOM.$('div', { class: 'notebook-shadow' })); // ensure we have dropShadow at base of sticky scroll
            return newMap;
        }
        static createStickyElement(entry, notebookEditor) {
            const stickyElement = document.createElement('div');
            stickyElement.classList.add('notebook-sticky-scroll-line');
            stickyElement.innerText = '#'.repeat(entry.level) + ' ' + entry.label;
            return new NotebookStickyLine(stickyElement, entry, notebookEditor);
        }
        disposeCurrentStickyLines() {
            this.currentStickyLines.forEach((value) => {
                value.line.dispose();
            });
        }
        dispose() {
            this._disposables.dispose();
            this.disposeCurrentStickyLines();
            super.dispose();
        }
    };
    exports.NotebookStickyScroll = NotebookStickyScroll;
    exports.NotebookStickyScroll = NotebookStickyScroll = NotebookStickyScroll_1 = __decorate([
        __param(4, contextView_1.IContextMenuService)
    ], NotebookStickyScroll);
    function computeContent(domNode, notebookEditor, notebookCellList, notebookOutlineEntries) {
        // find first code cell in visible range. this marks the start of the first section
        // find the last code cell in the first section of the visible range, store the bottom scroll position in a const sectionBottom
        // compute sticky scroll height, and check if editorScrolltop + stickyScrollHeight < sectionBottom
        // if that condition is true, break out of the loop with that cell as the tracked cell
        // if that condition is false, continue to next cell
        const editorScrollTop = notebookEditor.scrollTop;
        // find last code cell of section, store bottom scroll position in sectionBottom
        const visibleRange = notebookEditor.visibleRanges[0];
        if (!visibleRange) {
            return new Map();
        }
        let trackedEntry = undefined;
        let sectionBottom = 0;
        for (let i = visibleRange.start; i < visibleRange.end; i++) {
            const cell = notebookEditor.cellAt(i);
            if (!cell) {
                return new Map();
            }
            const nextCell = notebookEditor.cellAt(i + 1);
            // account for transitions between top level headers
            if (cell.cellKind === notebookCommon_1.CellKind.Markup) {
                sectionBottom = notebookCellList.getCellViewScrollBottom(cell);
                const entry = NotebookStickyScroll.getVisibleOutlineEntry(i, notebookOutlineEntries);
                if (!entry) {
                    return new Map();
                }
                if (!entry.parent) {
                    // if the cell is a top level header, only render once we have scrolled past the bottom of the cell
                    // todo: (polish) figure out what padding value to use here. need to account properly for bottom insert cell toolbar, cell toolbar, and md cell bottom padding
                    if (sectionBottom > editorScrollTop) {
                        return new Map();
                    }
                }
            }
            // if we are here, the cell is a code cell.
            // check next cell, if markdown, that means this is the end of the section
            if (nextCell && i + 1 < visibleRange.end) {
                if (nextCell.cellKind === notebookCommon_1.CellKind.Markup) {
                    // this is the end of the section
                    // store the bottom scroll position of this cell
                    sectionBottom = notebookCellList.getCellViewScrollBottom(cell);
                    // compute sticky scroll height
                    const entry = NotebookStickyScroll.getVisibleOutlineEntry(i, notebookOutlineEntries);
                    if (!entry) {
                        return new Map();
                    }
                    // check if we can render this section of sticky
                    const currentSectionStickyHeight = NotebookStickyScroll.computeStickyHeight(entry);
                    if (editorScrollTop + currentSectionStickyHeight < sectionBottom) {
                        const linesToRender = Math.floor((sectionBottom - editorScrollTop) / 22);
                        let newMap = new Map();
                        newMap = NotebookStickyScroll.renderStickyLines(entry, domNode, linesToRender, newMap, notebookEditor);
                        return newMap;
                    }
                    let nextSectionEntry = undefined;
                    for (let j = 1; j < visibleRange.end - i; j++) {
                        // find next section after this one
                        const cellCheck = notebookEditor.cellAt(i + j);
                        if (cellCheck) {
                            nextSectionEntry = NotebookStickyScroll.getVisibleOutlineEntry(i + j, notebookOutlineEntries);
                            if (nextSectionEntry) {
                                break;
                            }
                        }
                    }
                    const nextSectionStickyHeight = NotebookStickyScroll.computeStickyHeight(nextSectionEntry);
                    // recompute section bottom based on the top of the next section
                    sectionBottom = notebookCellList.getCellViewScrollTop(nextSectionEntry.cell) - 10;
                    // this block of logic cleans transitions between two sections that share a parent.
                    // if the current section and the next section share a parent, then we can render the next section's sticky lines to avoid pop-in between
                    if (entry?.parent?.parent === nextSectionEntry?.parent) {
                        const linesToRender = Math.floor((sectionBottom - editorScrollTop) / 22) + 100;
                        let newMap = new Map();
                        newMap = NotebookStickyScroll.renderStickyLines(nextSectionEntry?.parent, domNode, linesToRender, newMap, notebookEditor);
                        return newMap;
                    }
                    else if (Math.abs(currentSectionStickyHeight - nextSectionStickyHeight) > 22) { // only shrink sticky
                        const linesToRender = (sectionBottom - editorScrollTop) / 22;
                        let newMap = new Map();
                        newMap = NotebookStickyScroll.renderStickyLines(entry?.parent, domNode, linesToRender, newMap, notebookEditor);
                        return newMap;
                    }
                }
            }
            else {
                // there is no next visible cell, so use the bottom of the editor as the sectionBottom, using scrolltop + height
                sectionBottom = notebookEditor.getLayoutInfo().scrollHeight;
                trackedEntry = NotebookStickyScroll.getVisibleOutlineEntry(i, notebookOutlineEntries);
                const linesToRender = Math.floor((sectionBottom - editorScrollTop) / 22);
                let newMap = new Map();
                newMap = NotebookStickyScroll.renderStickyLines(trackedEntry?.parent, domNode, linesToRender, newMap, notebookEditor);
                return newMap;
            }
        } // for cell loop close
        return new Map();
    }
    exports.computeContent = computeContent;
    (0, actions_1.registerAction2)(ToggleNotebookStickyScroll);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tFZGl0b3JTdGlja3lTY3JvbGwuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9icm93c2VyL3ZpZXdQYXJ0cy9ub3RlYm9va0VkaXRvclN0aWNreVNjcm9sbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBbUJoRyxNQUFhLDBCQUEyQixTQUFRLGlCQUFPO1FBRXREO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSw0Q0FBNEM7Z0JBQ2hELEtBQUssRUFBRTtvQkFDTixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsb0JBQW9CLEVBQUUsK0JBQStCLENBQUM7b0JBQ3RFLGFBQWEsRUFBRSxJQUFBLGNBQVEsRUFBQyxFQUFFLEdBQUcsRUFBRSxzQkFBc0IsRUFBRSxPQUFPLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLEVBQUUsaUNBQWlDLENBQUM7b0JBQy9ILFFBQVEsRUFBRSwrQkFBK0I7aUJBQ3pDO2dCQUNELFFBQVEsRUFBRSxtQ0FBVSxDQUFDLElBQUk7Z0JBQ3pCLE9BQU8sRUFBRTtvQkFDUixTQUFTLEVBQUUsMkJBQWMsQ0FBQyxNQUFNLENBQUMsc0NBQXNDLEVBQUUsSUFBSSxDQUFDO29CQUM5RSxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsc0JBQXNCLEVBQUUsd0JBQXdCLENBQUM7b0JBQ2pFLGFBQWEsRUFBRSxJQUFBLGNBQVEsRUFBQyxFQUFFLEdBQUcsRUFBRSx3QkFBd0IsRUFBRSxPQUFPLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLEVBQUUsMEJBQTBCLENBQUM7aUJBQzFIO2dCQUNELElBQUksRUFBRTtvQkFDTCxFQUFFLEVBQUUsRUFBRSxnQkFBTSxDQUFDLGNBQWMsRUFBRTtvQkFDN0IsRUFBRSxFQUFFLEVBQUUsZ0JBQU0sQ0FBQywyQkFB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