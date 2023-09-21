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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/markdownRenderer", "vs/base/common/actions", "vs/base/common/lifecycle", "vs/nls!vs/workbench/contrib/notebook/browser/view/cellParts/cellOutput", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/browser/toolbar", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/opener/common/opener", "vs/platform/quickinput/common/quickInput", "vs/base/common/themables", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/notebookIcons", "vs/workbench/contrib/notebook/browser/view/cellPart", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookExecutionStateService", "vs/workbench/contrib/notebook/common/notebookService", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/workbench/contrib/notebook/browser/controller/cellOutputActions", "vs/workbench/contrib/notebook/browser/controller/editActions", "vs/workbench/contrib/notebook/browser/contrib/clipboard/cellOutputClipboard"], function (require, exports, DOM, markdownRenderer_1, actions_1, lifecycle_1, nls, menuEntryActionViewItem_1, toolbar_1, actions_2, contextkey_1, instantiation_1, opener_1, quickInput_1, themables_1, extensions_1, notebookBrowser_1, notebookIcons_1, cellPart_1, notebookCommon_1, notebookExecutionStateService_1, notebookService_1, panecomposite_1, cellOutputActions_1, editActions_1, cellOutputClipboard_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Sqb = void 0;
    // DOM structure
    //
    //  #output
    //  |
    //  |  #output-inner-container
    //  |                        |  #cell-output-toolbar
    //  |                        |  #output-element
    //  |                        |  #output-element
    //  |                        |  #output-element
    //  |  #output-inner-container
    //  |                        |  #cell-output-toolbar
    //  |                        |  #output-element
    //  |  #output-inner-container
    //  |                        |  #cell-output-toolbar
    //  |                        |  #output-element
    let CellOutputElement = class CellOutputElement extends lifecycle_1.$kc {
        constructor(f, g, h, j, output, n, r, parentContextKeyService, s, t, u) {
            super();
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.output = output;
            this.n = n;
            this.r = r;
            this.s = s;
            this.t = t;
            this.u = u;
            this.b = this.B(new lifecycle_1.$jc());
            this.J = null;
            this.c = parentContextKeyService;
            this.B(this.output.model.onDidChangeData(() => {
                this.rerender();
            }));
            this.B(this.output.onDidResetRenderer(() => {
                this.rerender();
            }));
        }
        detach() {
            this.renderedOutputContainer?.parentElement?.removeChild(this.renderedOutputContainer);
            let count = 0;
            if (this.innerContainer) {
                for (let i = 0; i < this.innerContainer.childNodes.length; i++) {
                    if (this.innerContainer.childNodes[i].className === 'rendered-output') {
                        count++;
                    }
                    if (count > 1) {
                        break;
                    }
                }
                if (count === 0) {
                    this.innerContainer.parentElement?.removeChild(this.innerContainer);
                }
            }
            this.f.removeInset(this.output);
        }
        updateDOMTop(top) {
            if (this.innerContainer) {
                this.innerContainer.style.top = `${top}px`;
            }
        }
        rerender() {
            if (this.f.hasModel() &&
                this.innerContainer &&
                this.renderResult &&
                this.renderResult.type === 1 /* RenderOutputType.Extension */) {
                // Output rendered by extension renderer got an update
                const [mimeTypes, pick] = this.output.resolveMimeTypes(this.f.textModel, this.f.activeKernel?.preloadProvides);
                const pickedMimeType = mimeTypes[pick];
                if (pickedMimeType.mimeType === this.renderResult.mimeType && pickedMimeType.rendererId === this.renderResult.renderer.id) {
                    // Same mimetype, same renderer, call the extension renderer to update
                    const index = this.g.outputsViewModels.indexOf(this.output);
                    this.f.updateOutput(this.g, this.renderResult, this.g.getOutputOffset(index));
                    return;
                }
            }
            if (!this.innerContainer) {
                // init rendering didn't happen
                const currOutputIndex = this.h.renderedOutputEntries.findIndex(entry => entry.element === this);
                const previousSibling = currOutputIndex > 0 && !!(this.h.renderedOutputEntries[currOutputIndex - 1].element.innerContainer?.parentElement)
                    ? this.h.renderedOutputEntries[currOutputIndex - 1].element.innerContainer
                    : undefined;
                this.render(previousSibling);
            }
            else {
                // Another mimetype or renderer is picked, we need to clear the current output and re-render
                const nextElement = this.innerContainer.nextElementSibling;
                this.b.clear();
                const element = this.innerContainer;
                if (element) {
                    element.parentElement?.removeChild(element);
                    this.f.removeInset(this.output);
                }
                this.render(nextElement);
            }
            this.M();
        }
        // insert after previousSibling
        w(previousSibling, pickedMimeTypeRenderer) {
            this.innerContainer = DOM.$('.output-inner-container');
            if (previousSibling && previousSibling.nextElementSibling) {
                this.j.domNode.insertBefore(this.innerContainer, previousSibling.nextElementSibling);
            }
            else {
                this.j.domNode.appendChild(this.innerContainer);
            }
            this.innerContainer.setAttribute('output-mime-type', pickedMimeTypeRenderer.mimeType);
            return this.innerContainer;
        }
        render(previousSibling) {
            const index = this.g.outputsViewModels.indexOf(this.output);
            if (this.g.isOutputCollapsed || !this.f.hasModel()) {
                return undefined;
            }
            const notebookUri = notebookCommon_1.CellUri.parse(this.g.uri)?.notebook;
            if (!notebookUri) {
                return undefined;
            }
            const notebookTextModel = this.f.textModel;
            const [mimeTypes, pick] = this.output.resolveMimeTypes(notebookTextModel, this.f.activeKernel?.preloadProvides);
            if (!mimeTypes.find(mimeType => mimeType.isTrusted) || mimeTypes.length === 0) {
                this.g.updateOutputHeight(index, 0, 'CellOutputElement#noMimeType');
                return undefined;
            }
            const pickedMimeTypeRenderer = mimeTypes[pick];
            const innerContainer = this.w(previousSibling, pickedMimeTypeRenderer);
            this.F(innerContainer, notebookTextModel, this.f.activeKernel, index, mimeTypes);
            this.renderedOutputContainer = DOM.$0O(innerContainer, DOM.$('.rendered-output'));
            const renderer = this.n.getRendererInfo(pickedMimeTypeRenderer.rendererId);
            this.renderResult = renderer
                ? { type: 1 /* RenderOutputType.Extension */, renderer, source: this.output, mimeType: pickedMimeTypeRenderer.mimeType }
                : this.y(this.output, pickedMimeTypeRenderer.mimeType);
            this.output.pickedMimeType = pickedMimeTypeRenderer;
            if (!this.renderResult) {
                this.g.updateOutputHeight(index, 0, 'CellOutputElement#renderResultUndefined');
                return undefined;
            }
            this.f.createOutput(this.g, this.renderResult, this.g.getOutputOffset(index), false);
            innerContainer.classList.add('background');
            return { initRenderIsSynchronous: false };
        }
        y(viewModel, preferredMimeType) {
            if (!viewModel.model.outputs.length) {
                return this.C(viewModel, nls.localize(0, null));
            }
            if (!preferredMimeType) {
                const mimeTypes = viewModel.model.outputs.map(op => op.mime);
                const mimeTypesMessage = mimeTypes.join(', ');
                return this.C(viewModel, nls.localize(1, null, mimeTypesMessage));
            }
            return this.z(viewModel, preferredMimeType);
        }
        z(viewModel, mimeType) {
            const query = `@tag:notebookRenderer ${mimeType}`;
            const p = DOM.$('p', undefined, `No renderer could be found for mimetype "${mimeType}", but one might be available on the Marketplace.`);
            const a = DOM.$('a', { href: `command:workbench.extensions.search?%22${query}%22`, class: 'monaco-button monaco-text-button', tabindex: 0, role: 'button', style: 'padding: 8px; text-decoration: none; color: rgb(255, 255, 255); background-color: rgb(14, 99, 156); max-width: 200px;' }, `Search Marketplace`);
            return {
                type: 0 /* RenderOutputType.Html */,
                source: viewModel,
                htmlContent: p.outerHTML + a.outerHTML
            };
        }
        C(viewModel, message) {
            const el = DOM.$('p', undefined, message);
            return { type: 0 /* RenderOutputType.Html */, source: viewModel, htmlContent: el.outerHTML };
        }
        D(mimeTypes) {
            if (!mimeTypes.find(mimeType => cellOutputClipboard_1.$Upb.indexOf(mimeType.mimeType) || mimeType.mimeType.startsWith('image/'))) {
                return false;
            }
            if ((0, notebookCommon_1.$9H)(mimeTypes[0].mimeType)) {
                const cellViewModel = this.output.cellViewModel;
                const index = cellViewModel.outputsViewModels.indexOf(this.output);
                if (index > 0) {
                    const previousOutput = cellViewModel.model.outputs[index - 1];
                    // if the previous output was also a stream, the copy command will be in that output instead
                    return !(0, notebookCommon_1.$9H)(previousOutput.outputs[0].mime);
                }
            }
            return true;
        }
        async F(outputItemDiv, notebookTextModel, kernel, index, mimeTypes) {
            const hasMultipleMimeTypes = mimeTypes.filter(mimeType => mimeType.isTrusted).length > 1;
            const isCopyEnabled = this.D(mimeTypes);
            if (index > 0 && !hasMultipleMimeTypes && !isCopyEnabled) {
                // nothing to put in the toolbar
                return;
            }
            if (!this.f.hasModel()) {
                return;
            }
            const useConsolidatedButton = this.f.notebookOptions.getLayoutConfiguration().consolidatedOutputButton;
            outputItemDiv.style.position = 'relative';
            const mimeTypePicker = DOM.$('.cell-output-toolbar');
            outputItemDiv.appendChild(mimeTypePicker);
            const toolbar = this.b.add(this.u.createInstance(toolbar_1.$L6, mimeTypePicker, {
                renderDropdownAsChildElement: false
            }));
            toolbar.context = {
                ui: true,
                cell: this.output.cellViewModel,
                outputViewModel: this.output,
                notebookEditor: this.f,
                $mid: 13 /* MarshalledId.NotebookCellActionContext */
            };
            // TODO: This could probably be a real registered action, but it has to talk to this output element
            const pickAction = new actions_1.$gi('notebook.output.pickMimetype', nls.localize(2, null), themables_1.ThemeIcon.asClassName(notebookIcons_1.$Ppb), undefined, async (_context) => this.G(outputItemDiv, notebookTextModel, kernel, this.output));
            const menu = this.b.add(this.s.createMenu(actions_2.$Ru.NotebookOutputToolbar, this.c));
            const updateMenuToolbar = () => {
                const primary = [];
                let secondary = [];
                const result = { primary, secondary };
                (0, menuEntryActionViewItem_1.$B3)(menu, { shouldForwardArgs: true }, result, () => false);
                if (index > 0 || !useConsolidatedButton) {
                    // clear outputs should only appear in the first output item's menu
                    secondary = secondary.filter((action) => action.id !== editActions_1.$Rqb);
                }
                if (!isCopyEnabled) {
                    secondary = secondary.filter((action) => action.id !== cellOutputActions_1.$Vpb);
                }
                if (hasMultipleMimeTypes) {
                    secondary = [pickAction, ...secondary];
                }
                toolbar.setActions([], secondary);
            };
            updateMenuToolbar();
            this.b.add(menu.onDidChange(updateMenuToolbar));
        }
        async G(outputItemDiv, notebookTextModel, kernel, viewModel) {
            const [mimeTypes, currIndex] = viewModel.resolveMimeTypes(notebookTextModel, kernel?.preloadProvides);
            const items = [];
            const unsupportedItems = [];
            mimeTypes.forEach((mimeType, index) => {
                if (mimeType.isTrusted) {
                    const arr = mimeType.rendererId === notebookCommon_1.$ZH ?
                        unsupportedItems :
                        items;
                    arr.push({
                        label: mimeType.mimeType,
                        id: mimeType.mimeType,
                        index: index,
                        picked: index === currIndex,
                        detail: this.I(mimeType.rendererId),
                        description: index === currIndex ? nls.localize(3, null) : undefined
                    });
                }
            });
            if (unsupportedItems.some(m => JUPYTER_RENDERER_MIMETYPES.includes(m.id))) {
                unsupportedItems.push({
                    label: nls.localize(4, null),
                    id: 'installRenderers',
                    index: mimeTypes.length
                });
            }
            const picker = this.r.createQuickPick();
            picker.items = [
                ...items,
                { type: 'separator' },
                ...unsupportedItems
            ];
            picker.activeItems = items.filter(item => !!item.picked);
            picker.placeholder = items.length !== mimeTypes.length
                ? nls.localize(5, null)
                : nls.localize(6, null);
            const pick = await new Promise(resolve => {
                picker.onDidAccept(() => {
                    resolve(picker.selectedItems.length === 1 ? picker.selectedItems[0] : undefined);
                    picker.dispose();
                });
                picker.show();
            });
            if (pick === undefined || pick.index === currIndex) {
                return;
            }
            if (pick.id === 'installRenderers') {
                this.H();
                return;
            }
            // user chooses another mimetype
            const nextElement = outputItemDiv.nextElementSibling;
            this.b.clear();
            const element = this.innerContainer;
            if (element) {
                element.parentElement?.removeChild(element);
                this.f.removeInset(viewModel);
            }
            viewModel.pickedMimeType = mimeTypes[pick.index];
            this.g.updateOutputMinHeight(this.g.layoutInfo.outputTotalHeight);
            const { mimeType, rendererId } = mimeTypes[pick.index];
            this.n.updateMimePreferredRenderer(notebookTextModel.viewType, mimeType, rendererId, mimeTypes.map(m => m.mimeType));
            this.render(nextElement);
            this.L(false);
            this.M();
        }
        async H() {
            const viewlet = await this.t.openPaneComposite(extensions_1.$Ofb, 0 /* ViewContainerLocation.Sidebar */, true);
            const view = viewlet?.getViewPaneContainer();
            view?.search(`@id:${notebookBrowser_1.$Wbb}`);
        }
        I(renderId) {
            const renderInfo = this.n.getRendererInfo(renderId);
            if (renderInfo) {
                const displayName = renderInfo.displayName !== '' ? renderInfo.displayName : renderInfo.id;
                return `${displayName} (${renderInfo.extensionId.value})`;
            }
            return nls.localize(7, null);
        }
        L(synchronous) {
            if (this.J !== null) {
                clearTimeout(this.J);
            }
            if (synchronous) {
                this.g.unlockOutputHeight();
            }
            else {
                this.J = setTimeout(() => {
                    this.g.unlockOutputHeight();
                }, 1000);
            }
        }
        M() {
            this.f.layoutNotebookCell(this.g, this.g.layoutInfo.totalHeight);
        }
        dispose() {
            if (this.J) {
                this.g.unlockOutputHeight();
                clearTimeout(this.J);
            }
            super.dispose();
        }
    };
    CellOutputElement = __decorate([
        __param(5, notebookService_1.$ubb),
        __param(6, quickInput_1.$Gq),
        __param(7, contextkey_1.$3i),
        __param(8, actions_2.$Su),
        __param(9, panecomposite_1.$Yeb),
        __param(10, instantiation_1.$Ah)
    ], CellOutputElement);
    class OutputEntryViewHandler {
        constructor(model, element) {
            this.model = model;
            this.element = element;
        }
    }
    var CellOutputUpdateContext;
    (function (CellOutputUpdateContext) {
        CellOutputUpdateContext[CellOutputUpdateContext["Execution"] = 1] = "Execution";
        CellOutputUpdateContext[CellOutputUpdateContext["Other"] = 2] = "Other";
    })(CellOutputUpdateContext || (CellOutputUpdateContext = {}));
    let $Sqb = class $Sqb extends cellPart_1.$Hnb {
        get renderedOutputEntries() {
            return this.b;
        }
        constructor(g, h, j, n, r, s, t) {
            super();
            this.g = g;
            this.h = h;
            this.j = j;
            this.n = n;
            this.r = r;
            this.s = s;
            this.t = t;
            this.b = [];
            this.w = null;
            this.B(h.onDidStartExecution(() => {
                h.updateOutputMinHeight(h.layoutInfo.outputTotalHeight);
            }));
            this.B(h.onDidStopExecution(() => {
                this.y(false);
            }));
            this.B(h.onDidChangeOutputs(splice => {
                const executionState = this.s.getCellExecution(h.uri);
                const context = executionState ? 1 /* CellOutputUpdateContext.Execution */ : 2 /* CellOutputUpdateContext.Other */;
                this.z(splice, context);
            }));
            this.B(h.onDidChangeLayout(() => {
                this.updateInternalLayoutNow(h);
            }));
        }
        updateInternalLayoutNow(viewCell) {
            this.j.outputContainer.setTop(viewCell.layoutInfo.outputContainerOffset);
            this.j.outputShowMoreContainer.setTop(viewCell.layoutInfo.outputShowMoreContainerOffset);
            this.b.forEach(entry => {
                const index = this.h.outputsViewModels.indexOf(entry.model);
                if (index >= 0) {
                    const top = this.h.getOutputOffsetInContainer(index);
                    entry.element.updateDOMTop(top);
                }
            });
        }
        render() {
            try {
                this.u();
            }
            finally {
                // TODO@rebornix, this is probably not necessary at all as cell layout change would send the update request.
                this.F();
            }
        }
        u() {
            if (this.h.outputsViewModels.length > 0) {
                if (this.h.layoutInfo.outputTotalHeight !== 0) {
                    this.h.updateOutputMinHeight(this.h.layoutInfo.outputTotalHeight);
                }
                DOM.$dP(this.j.outputContainer.domNode);
                for (let index = 0; index < Math.min(this.n.limit, this.h.outputsViewModels.length); index++) {
                    const currOutput = this.h.outputsViewModels[index];
                    const entry = this.t.createInstance(CellOutputElement, this.g, this.h, this, this.j.outputContainer, currOutput);
                    this.b.push(new OutputEntryViewHandler(currOutput, entry));
                    entry.render(undefined);
                }
                if (this.h.outputsViewModels.length > this.n.limit) {
                    DOM.$dP(this.j.outputShowMoreContainer.domNode);
                    this.h.updateOutputShowMoreContainerHeight(46);
                }
                this.y(false);
            }
            else {
                // noop
                DOM.$eP(this.j.outputContainer.domNode);
            }
            this.j.outputShowMoreContainer.domNode.innerText = '';
            if (this.h.outputsViewModels.length > this.n.limit) {
                this.j.outputShowMoreContainer.domNode.appendChild(this.D(this.j.templateDisposables));
            }
            else {
                DOM.$eP(this.j.outputShowMoreContainer.domNode);
                this.h.updateOutputShowMoreContainerHeight(0);
            }
        }
        viewUpdateShowOutputs(initRendering) {
            for (let index = 0; index < this.b.length; index++) {
                const viewHandler = this.b[index];
                const outputEntry = viewHandler.element;
                if (outputEntry.renderResult) {
                    this.g.createOutput(this.h, outputEntry.renderResult, this.h.getOutputOffset(index), false);
                }
                else {
                    outputEntry.render(undefined);
                }
            }
            this.F();
        }
        viewUpdateHideOuputs() {
            for (let index = 0; index < this.b.length; index++) {
                this.g.hideInset(this.b[index].model);
            }
        }
        y(synchronous) {
            if (this.w !== null) {
                clearTimeout(this.w);
            }
            if (synchronous) {
                this.h.unlockOutputHeight();
            }
            else {
                this.w = setTimeout(() => {
                    this.h.unlockOutputHeight();
                }, 1000);
            }
        }
        z(splice, context = 2 /* CellOutputUpdateContext.Other */) {
            const previousOutputHeight = this.h.layoutInfo.outputTotalHeight;
            // for cell output update, we make sure the cell does not shrink before the new outputs are rendered.
            this.h.updateOutputMinHeight(previousOutputHeight);
            if (this.h.outputsViewModels.length) {
                DOM.$dP(this.j.outputContainer.domNode);
            }
            else {
                DOM.$eP(this.j.outputContainer.domNode);
            }
            this.h.spliceOutputHeights(splice.start, splice.deleteCount, splice.newOutputs.map(_ => 0));
            this.C(splice, context);
        }
        C(splice, context) {
            if (splice.start >= this.n.limit) {
                // splice items out of limit
                return;
            }
            const firstGroupEntries = this.b.slice(0, splice.start);
            const deletedEntries = this.b.slice(splice.start, splice.start + splice.deleteCount);
            const secondGroupEntries = this.b.slice(splice.start + splice.deleteCount);
            let newlyInserted = this.h.outputsViewModels.slice(splice.start, splice.start + splice.newOutputs.length);
            // [...firstGroup, ...deletedEntries, ...secondGroupEntries]  [...restInModel]
            // [...firstGroup, ...newlyInserted, ...secondGroupEntries, restInModel]
            if (firstGroupEntries.length + newlyInserted.length + secondGroupEntries.length > this.n.limit) {
                // exceeds limit again
                if (firstGroupEntries.length + newlyInserted.length > this.n.limit) {
                    [...deletedEntries, ...secondGroupEntries].forEach(entry => {
                        entry.element.detach();
                        entry.element.dispose();
                    });
                    newlyInserted = newlyInserted.slice(0, this.n.limit - firstGroupEntries.length);
                    const newlyInsertedEntries = newlyInserted.map(insert => {
                        return new OutputEntryViewHandler(insert, this.t.createInstance(CellOutputElement, this.g, this.h, this, this.j.outputContainer, insert));
                    });
                    this.b = [...firstGroupEntries, ...newlyInsertedEntries];
                    // render newly inserted outputs
                    for (let i = firstGroupEntries.length; i < this.b.length; i++) {
                        this.b[i].element.render(undefined);
                    }
                }
                else {
                    // part of secondGroupEntries are pushed out of view
                    // now we have to be creative as secondGroupEntries might not use dedicated containers
                    const elementsPushedOutOfView = secondGroupEntries.slice(this.n.limit - firstGroupEntries.length - newlyInserted.length);
                    [...deletedEntries, ...elementsPushedOutOfView].forEach(entry => {
                        entry.element.detach();
                        entry.element.dispose();
                    });
                    // exclusive
                    const reRenderRightBoundary = firstGroupEntries.length + newlyInserted.length;
                    const newlyInsertedEntries = newlyInserted.map(insert => {
                        return new OutputEntryViewHandler(insert, this.t.createInstance(CellOutputElement, this.g, this.h, this, this.j.outputContainer, insert));
                    });
                    this.b = [...firstGroupEntries, ...newlyInsertedEntries, ...secondGroupEntries.slice(0, this.n.limit - firstGroupEntries.length - newlyInserted.length)];
                    for (let i = firstGroupEntries.length; i < reRenderRightBoundary; i++) {
                        const previousSibling = i - 1 >= 0 && this.b[i - 1] && !!(this.b[i - 1].element.innerContainer?.parentElement) ? this.b[i - 1].element.innerContainer : undefined;
                        this.b[i].element.render(previousSibling);
                    }
                }
            }
            else {
                // after splice, it doesn't exceed
                deletedEntries.forEach(entry => {
                    entry.element.detach();
                    entry.element.dispose();
                });
                const reRenderRightBoundary = firstGroupEntries.length + newlyInserted.length;
                const newlyInsertedEntries = newlyInserted.map(insert => {
                    return new OutputEntryViewHandler(insert, this.t.createInstance(CellOutputElement, this.g, this.h, this, this.j.outputContainer, insert));
                });
                let outputsNewlyAvailable = [];
                if (firstGroupEntries.length + newlyInsertedEntries.length + secondGroupEntries.length < this.h.outputsViewModels.length) {
                    const last = Math.min(this.n.limit, this.h.outputsViewModels.length);
                    outputsNewlyAvailable = this.h.outputsViewModels.slice(firstGroupEntries.length + newlyInsertedEntries.length + secondGroupEntries.length, last).map(output => {
                        return new OutputEntryViewHandler(output, this.t.createInstance(CellOutputElement, this.g, this.h, this, this.j.outputContainer, output));
                    });
                }
                this.b = [...firstGroupEntries, ...newlyInsertedEntries, ...secondGroupEntries, ...outputsNewlyAvailable];
                for (let i = firstGroupEntries.length; i < reRenderRightBoundary; i++) {
                    const previousSibling = i - 1 >= 0 && this.b[i - 1] && !!(this.b[i - 1].element.innerContainer?.parentElement) ? this.b[i - 1].element.innerContainer : undefined;
                    this.b[i].element.render(previousSibling);
                }
                for (let i = 0; i < outputsNewlyAvailable.length; i++) {
                    this.b[firstGroupEntries.length + newlyInserted.length + secondGroupEntries.length + i].element.render(undefined);
                }
            }
            if (this.h.outputsViewModels.length > this.n.limit) {
                DOM.$dP(this.j.outputShowMoreContainer.domNode);
                if (!this.j.outputShowMoreContainer.domNode.hasChildNodes()) {
                    this.j.outputShowMoreContainer.domNode.appendChild(this.D(this.j.templateDisposables));
                }
                this.h.updateOutputShowMoreContainerHeight(46);
            }
            else {
                DOM.$eP(this.j.outputShowMoreContainer.domNode);
            }
            const editorHeight = this.j.editor.getContentHeight();
            this.h.editorHeight = editorHeight;
            this.F();
            // if it's clearing all outputs, or outputs are all rendered synchronously
            // shrink immediately as the final output height will be zero.
            // if it's rerun, then the output clearing might be temporary, so we don't shrink immediately
            this.y(context === 2 /* CellOutputUpdateContext.Other */ && this.h.outputsViewModels.length === 0);
        }
        D(disposables) {
            const md = {
                value: `There are more than ${this.n.limit} outputs, [show more (open the raw output data in a text editor) ...](command:workbench.action.openLargeOutput)`,
                isTrusted: true,
                supportThemeIcons: true
            };
            const rendered = (0, markdownRenderer_1.$zQ)(md, {
                actionHandler: {
                    callback: (content) => {
                        if (content === 'command:workbench.action.openLargeOutput') {
                            this.r.open(notebookCommon_1.CellUri.generateCellOutputUri(this.g.textModel.uri));
                        }
                        return;
                    },
                    disposables
                }
            });
            disposables.add(rendered);
            rendered.element.classList.add('output-show-more');
            return rendered.element;
        }
        F() {
            this.g.layoutNotebookCell(this.h, this.h.layoutInfo.totalHeight);
        }
        dispose() {
            this.h.updateOutputMinHeight(0);
            if (this.w) {
                clearTimeout(this.w);
            }
            this.b.forEach(entry => {
                entry.element.dispose();
            });
            super.dispose();
        }
    };
    exports.$Sqb = $Sqb;
    exports.$Sqb = $Sqb = __decorate([
        __param(4, opener_1.$NT),
        __param(5, notebookExecutionStateService_1.$_H),
        __param(6, instantiation_1.$Ah)
    ], $Sqb);
    const JUPYTER_RENDERER_MIMETYPES = [
        'application/geo+json',
        'application/vdom.v1+json',
        'application/vnd.dataresource+json',
        'application/vnd.plotly.v1+json',
        'application/vnd.vega.v2+json',
        'application/vnd.vega.v3+json',
        'application/vnd.vega.v4+json',
        'application/vnd.vega.v5+json',
        'application/vnd.vegalite.v1+json',
        'application/vnd.vegalite.v2+json',
        'application/vnd.vegalite.v3+json',
        'application/vnd.vegalite.v4+json',
        'application/x-nteract-model-debug+json',
        'image/svg+xml',
        'text/latex',
        'text/vnd.plotly.v1+html',
        'application/vnd.jupyter.widget-view+json',
        'application/vnd.code.notebook.error'
    ];
});
//# sourceMappingURL=cellOutput.js.map