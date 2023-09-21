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
define(["require", "exports", "vs/nls!vs/workbench/contrib/notebook/browser/viewParts/notebookEditorStickyScroll", "vs/base/browser/dom", "vs/base/browser/mouseEvent", "vs/base/common/lifecycle", "vs/platform/action/common/actionCommonCategories", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/workbench/contrib/notebook/common/notebookCommon"], function (require, exports, nls_1, DOM, mouseEvent_1, lifecycle_1, actionCommonCategories_1, actions_1, configuration_1, contextkey_1, contextView_1, notebookCommon_1) {
    "use strict";
    var $zrb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Arb = exports.$zrb = exports.$yrb = exports.$xrb = void 0;
    class $xrb extends actions_1.$Wu {
        constructor() {
            super({
                id: 'notebook.action.toggleNotebookStickyScroll',
                title: {
                    value: (0, nls_1.localize)(0, null),
                    mnemonicTitle: (0, nls_1.localize)(1, null),
                    original: 'Toggle Notebook Sticky Scroll',
                },
                category: actionCommonCategories_1.$Nl.View,
                toggled: {
                    condition: contextkey_1.$Ii.equals('config.notebook.stickyScroll.enabled', true),
                    title: (0, nls_1.localize)(2, null),
                    mnemonicTitle: (0, nls_1.localize)(3, null),
                },
                menu: [
                    { id: actions_1.$Ru.CommandPalette },
                    { id: actions_1.$Ru.NotebookStickyScrollContext }
                ]
            });
        }
        async run(accessor) {
            const configurationService = accessor.get(configuration_1.$8h);
            const newValue = !configurationService.getValue('notebook.stickyScroll.enabled');
            return configurationService.updateValue('notebook.stickyScroll.enabled', newValue);
        }
    }
    exports.$xrb = $xrb;
    class $yrb extends lifecycle_1.$kc {
        constructor(element, entry, notebookEditor) {
            super();
            this.element = element;
            this.entry = entry;
            this.notebookEditor = notebookEditor;
            this.B(DOM.$nO(this.element, DOM.$3O.CLICK, () => {
                this.a();
            }));
        }
        a() {
            this.notebookEditor.focusNotebookCell(this.entry.cell, 'container');
            const cellScrollTop = this.notebookEditor.getAbsoluteTopOfElement(this.entry.cell);
            const parentCount = this.b();
            // 1.1 addresses visible cell padding, to make sure we don't focus md cell and also render its sticky line
            this.notebookEditor.setScrollTop(cellScrollTop - (parentCount + 1.1) * 22);
        }
        b() {
            let count = 0;
            let entry = this.entry;
            while (entry.parent) {
                count++;
                entry = entry.parent;
            }
            return count;
        }
    }
    exports.$yrb = $yrb;
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
    let $zrb = $zrb_1 = class $zrb extends lifecycle_1.$kc {
        getDomNode() {
            return this.f;
        }
        getCurrentStickyHeight() {
            return this.b.size * 22;
        }
        c(newStickyLines) {
            this.b = newStickyLines;
        }
        constructor(f, g, h, m, n) {
            super();
            this.f = f;
            this.g = g;
            this.h = h;
            this.m = m;
            this.n = n;
            this.a = new lifecycle_1.$jc();
            this.b = new Map();
            if (this.g.notebookOptions.getLayoutConfiguration().stickyScroll) {
                this.u();
            }
            this.B(this.g.notebookOptions.onDidChangeOptions((e) => {
                if (e.stickyScroll) {
                    this.s();
                }
                if (e.globalToolbar) {
                    this.t();
                }
            }));
            this.B(DOM.$nO(this.f, DOM.$3O.CONTEXT_MENU, async (event) => {
                this.r(event);
            }));
        }
        r(e) {
            const event = new mouseEvent_1.$eO(e);
            this.n.showContextMenu({
                menuId: actions_1.$Ru.NotebookStickyScrollContext,
                getAnchor: () => event,
            });
        }
        s() {
            if (this.g.notebookOptions.getLayoutConfiguration().stickyScroll) {
                this.u();
            }
            else {
                this.a.clear();
                this.C();
                DOM.$lO(this.f);
                this.z();
            }
        }
        t() {
            if (this.g.notebookOptions.getLayoutConfiguration().globalToolbar) {
                this.f.style.top = '26px';
            }
            else {
                this.f.style.top = '0px';
            }
        }
        u() {
            this.h.init();
            this.w();
            this.a.add(this.h.onDidChange(() => {
                DOM.$lO(this.f);
                this.C();
                this.y($Arb(this.f, this.g, this.m, this.h.entries));
            }));
            this.a.add(this.g.onDidAttachViewModel(() => {
                this.h.init();
                this.w();
            }));
            this.a.add(this.g.onDidScroll(() => {
                DOM.$lO(this.f);
                this.C();
                this.y($Arb(this.f, this.g, this.m, this.h.entries));
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
        w() {
            // find last code cell of section, store bottom scroll position in sectionBottom
            const visibleRange = this.g.visibleRanges[0];
            if (!visibleRange) {
                return;
            }
            DOM.$lO(this.f);
            const editorScrollTop = this.g.scrollTop;
            let trackedEntry = undefined;
            let sectionBottom = 0;
            for (let i = visibleRange.start; i < visibleRange.end; i++) {
                if (i === 0) { // don't show headers when you're viewing the top cell
                    this.z();
                    this.c(new Map());
                    return;
                }
                const cell = this.g.cellAt(i);
                if (!cell) {
                    return;
                }
                // if we are here, the cell is a code cell.
                // check next cell, if markdown, that means this is the end of the section
                // check if cell is within visible range
                const nextCell = this.g.cellAt(i + 1);
                if (nextCell && i + 1 < visibleRange.end) {
                    if (nextCell.cellKind === notebookCommon_1.CellKind.Markup) {
                        // this is the end of the section
                        // store the bottom scroll position of this cell
                        sectionBottom = this.m.getCellViewScrollBottom(cell);
                        // compute sticky scroll height
                        const entry = $zrb_1.getVisibleOutlineEntry(i, this.h.entries);
                        if (!entry) {
                            return;
                        }
                        // using 22 instead of stickyscrollheight, as we don't necessarily render each line. 22 starts rendering sticky when we have space for at least 1 of them
                        const newStickyHeight = $zrb_1.computeStickyHeight(entry);
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
                    sectionBottom = this.g.scrollTop + this.g.getLayoutInfo().scrollHeight;
                    trackedEntry = $zrb_1.getVisibleOutlineEntry(i, this.h.entries);
                    break;
                }
            } // cell loop close
            // -------------------------------------------------------------------------------------
            // we now know the cell which the sticky is determined by, and the sectionBottom value to determine how many sticky lines to render
            // compute the space available for sticky lines, and render sticky lines
            const linesToRender = Math.floor((sectionBottom - editorScrollTop) / 22);
            let newMap = new Map();
            newMap = $zrb_1.renderStickyLines(trackedEntry?.parent, this.f, linesToRender, newMap, this.g);
            this.c(newMap);
            this.z();
        }
        y(newMap) {
            this.c(newMap);
            this.z();
        }
        z() {
            const hasSticky = this.b.size > 0;
            if (!hasSticky) {
                this.f.style.display = 'none';
            }
            else {
                this.f.style.display = 'block';
            }
            this.t();
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
                const lineToRender = $zrb_1.createStickyElement(currentEntry, notebookEditor);
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
            return new $yrb(stickyElement, entry, notebookEditor);
        }
        C() {
            this.b.forEach((value) => {
                value.line.dispose();
            });
        }
        dispose() {
            this.a.dispose();
            this.C();
            super.dispose();
        }
    };
    exports.$zrb = $zrb;
    exports.$zrb = $zrb = $zrb_1 = __decorate([
        __param(4, contextView_1.$WZ)
    ], $zrb);
    function $Arb(domNode, notebookEditor, notebookCellList, notebookOutlineEntries) {
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
                const entry = $zrb.getVisibleOutlineEntry(i, notebookOutlineEntries);
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
                    const entry = $zrb.getVisibleOutlineEntry(i, notebookOutlineEntries);
                    if (!entry) {
                        return new Map();
                    }
                    // check if we can render this section of sticky
                    const currentSectionStickyHeight = $zrb.computeStickyHeight(entry);
                    if (editorScrollTop + currentSectionStickyHeight < sectionBottom) {
                        const linesToRender = Math.floor((sectionBottom - editorScrollTop) / 22);
                        let newMap = new Map();
                        newMap = $zrb.renderStickyLines(entry, domNode, linesToRender, newMap, notebookEditor);
                        return newMap;
                    }
                    let nextSectionEntry = undefined;
                    for (let j = 1; j < visibleRange.end - i; j++) {
                        // find next section after this one
                        const cellCheck = notebookEditor.cellAt(i + j);
                        if (cellCheck) {
                            nextSectionEntry = $zrb.getVisibleOutlineEntry(i + j, notebookOutlineEntries);
                            if (nextSectionEntry) {
                                break;
                            }
                        }
                    }
                    const nextSectionStickyHeight = $zrb.computeStickyHeight(nextSectionEntry);
                    // recompute section bottom based on the top of the next section
                    sectionBottom = notebookCellList.getCellViewScrollTop(nextSectionEntry.cell) - 10;
                    // this block of logic cleans transitions between two sections that share a parent.
                    // if the current section and the next section share a parent, then we can render the next section's sticky lines to avoid pop-in between
                    if (entry?.parent?.parent === nextSectionEntry?.parent) {
                        const linesToRender = Math.floor((sectionBottom - editorScrollTop) / 22) + 100;
                        let newMap = new Map();
                        newMap = $zrb.renderStickyLines(nextSectionEntry?.parent, domNode, linesToRender, newMap, notebookEditor);
                        return newMap;
                    }
                    else if (Math.abs(currentSectionStickyHeight - nextSectionStickyHeight) > 22) { // only shrink sticky
                        const linesToRender = (sectionBottom - editorScrollTop) / 22;
                        let newMap = new Map();
                        newMap = $zrb.renderStickyLines(entry?.parent, domNode, linesToRender, newMap, notebookEditor);
                        return newMap;
                    }
                }
            }
            else {
                // there is no next visible cell, so use the bottom of the editor as the sectionBottom, using scrolltop + height
                sectionBottom = notebookEditor.getLayoutInfo().scrollHeight;
                trackedEntry = $zrb.getVisibleOutlineEntry(i, notebookOutlineEntries);
                const linesToRender = Math.floor((sectionBottom - editorScrollTop) / 22);
                let newMap = new Map();
                newMap = $zrb.renderStickyLines(trackedEntry?.parent, domNode, linesToRender, newMap, notebookEditor);
                return newMap;
            }
        } // for cell loop close
        return new Map();
    }
    exports.$Arb = $Arb;
    (0, actions_1.$Xu)($xrb);
});
//# sourceMappingURL=notebookEditorStickyScroll.js.map