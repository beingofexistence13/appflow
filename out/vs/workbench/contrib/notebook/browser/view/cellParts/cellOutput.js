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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/markdownRenderer", "vs/base/common/actions", "vs/base/common/lifecycle", "vs/nls", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/browser/toolbar", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/opener/common/opener", "vs/platform/quickinput/common/quickInput", "vs/base/common/themables", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/notebookIcons", "vs/workbench/contrib/notebook/browser/view/cellPart", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookExecutionStateService", "vs/workbench/contrib/notebook/common/notebookService", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/workbench/contrib/notebook/browser/controller/cellOutputActions", "vs/workbench/contrib/notebook/browser/controller/editActions", "vs/workbench/contrib/notebook/browser/contrib/clipboard/cellOutputClipboard"], function (require, exports, DOM, markdownRenderer_1, actions_1, lifecycle_1, nls, menuEntryActionViewItem_1, toolbar_1, actions_2, contextkey_1, instantiation_1, opener_1, quickInput_1, themables_1, extensions_1, notebookBrowser_1, notebookIcons_1, cellPart_1, notebookCommon_1, notebookExecutionStateService_1, notebookService_1, panecomposite_1, cellOutputActions_1, editActions_1, cellOutputClipboard_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CellOutputContainer = void 0;
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
    let CellOutputElement = class CellOutputElement extends lifecycle_1.Disposable {
        constructor(notebookEditor, viewCell, cellOutputContainer, outputContainer, output, notebookService, quickInputService, parentContextKeyService, menuService, paneCompositeService, instantiationService) {
            super();
            this.notebookEditor = notebookEditor;
            this.viewCell = viewCell;
            this.cellOutputContainer = cellOutputContainer;
            this.outputContainer = outputContainer;
            this.output = output;
            this.notebookService = notebookService;
            this.quickInputService = quickInputService;
            this.menuService = menuService;
            this.paneCompositeService = paneCompositeService;
            this.instantiationService = instantiationService;
            this._renderDisposableStore = this._register(new lifecycle_1.DisposableStore());
            this._outputHeightTimer = null;
            this.contextKeyService = parentContextKeyService;
            this._register(this.output.model.onDidChangeData(() => {
                this.rerender();
            }));
            this._register(this.output.onDidResetRenderer(() => {
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
            this.notebookEditor.removeInset(this.output);
        }
        updateDOMTop(top) {
            if (this.innerContainer) {
                this.innerContainer.style.top = `${top}px`;
            }
        }
        rerender() {
            if (this.notebookEditor.hasModel() &&
                this.innerContainer &&
                this.renderResult &&
                this.renderResult.type === 1 /* RenderOutputType.Extension */) {
                // Output rendered by extension renderer got an update
                const [mimeTypes, pick] = this.output.resolveMimeTypes(this.notebookEditor.textModel, this.notebookEditor.activeKernel?.preloadProvides);
                const pickedMimeType = mimeTypes[pick];
                if (pickedMimeType.mimeType === this.renderResult.mimeType && pickedMimeType.rendererId === this.renderResult.renderer.id) {
                    // Same mimetype, same renderer, call the extension renderer to update
                    const index = this.viewCell.outputsViewModels.indexOf(this.output);
                    this.notebookEditor.updateOutput(this.viewCell, this.renderResult, this.viewCell.getOutputOffset(index));
                    return;
                }
            }
            if (!this.innerContainer) {
                // init rendering didn't happen
                const currOutputIndex = this.cellOutputContainer.renderedOutputEntries.findIndex(entry => entry.element === this);
                const previousSibling = currOutputIndex > 0 && !!(this.cellOutputContainer.renderedOutputEntries[currOutputIndex - 1].element.innerContainer?.parentElement)
                    ? this.cellOutputContainer.renderedOutputEntries[currOutputIndex - 1].element.innerContainer
                    : undefined;
                this.render(previousSibling);
            }
            else {
                // Another mimetype or renderer is picked, we need to clear the current output and re-render
                const nextElement = this.innerContainer.nextElementSibling;
                this._renderDisposableStore.clear();
                const element = this.innerContainer;
                if (element) {
                    element.parentElement?.removeChild(element);
                    this.notebookEditor.removeInset(this.output);
                }
                this.render(nextElement);
            }
            this._relayoutCell();
        }
        // insert after previousSibling
        _generateInnerOutputContainer(previousSibling, pickedMimeTypeRenderer) {
            this.innerContainer = DOM.$('.output-inner-container');
            if (previousSibling && previousSibling.nextElementSibling) {
                this.outputContainer.domNode.insertBefore(this.innerContainer, previousSibling.nextElementSibling);
            }
            else {
                this.outputContainer.domNode.appendChild(this.innerContainer);
            }
            this.innerContainer.setAttribute('output-mime-type', pickedMimeTypeRenderer.mimeType);
            return this.innerContainer;
        }
        render(previousSibling) {
            const index = this.viewCell.outputsViewModels.indexOf(this.output);
            if (this.viewCell.isOutputCollapsed || !this.notebookEditor.hasModel()) {
                return undefined;
            }
            const notebookUri = notebookCommon_1.CellUri.parse(this.viewCell.uri)?.notebook;
            if (!notebookUri) {
                return undefined;
            }
            const notebookTextModel = this.notebookEditor.textModel;
            const [mimeTypes, pick] = this.output.resolveMimeTypes(notebookTextModel, this.notebookEditor.activeKernel?.preloadProvides);
            if (!mimeTypes.find(mimeType => mimeType.isTrusted) || mimeTypes.length === 0) {
                this.viewCell.updateOutputHeight(index, 0, 'CellOutputElement#noMimeType');
                return undefined;
            }
            const pickedMimeTypeRenderer = mimeTypes[pick];
            const innerContainer = this._generateInnerOutputContainer(previousSibling, pickedMimeTypeRenderer);
            this._attachToolbar(innerContainer, notebookTextModel, this.notebookEditor.activeKernel, index, mimeTypes);
            this.renderedOutputContainer = DOM.append(innerContainer, DOM.$('.rendered-output'));
            const renderer = this.notebookService.getRendererInfo(pickedMimeTypeRenderer.rendererId);
            this.renderResult = renderer
                ? { type: 1 /* RenderOutputType.Extension */, renderer, source: this.output, mimeType: pickedMimeTypeRenderer.mimeType }
                : this._renderMissingRenderer(this.output, pickedMimeTypeRenderer.mimeType);
            this.output.pickedMimeType = pickedMimeTypeRenderer;
            if (!this.renderResult) {
                this.viewCell.updateOutputHeight(index, 0, 'CellOutputElement#renderResultUndefined');
                return undefined;
            }
            this.notebookEditor.createOutput(this.viewCell, this.renderResult, this.viewCell.getOutputOffset(index), false);
            innerContainer.classList.add('background');
            return { initRenderIsSynchronous: false };
        }
        _renderMissingRenderer(viewModel, preferredMimeType) {
            if (!viewModel.model.outputs.length) {
                return this._renderMessage(viewModel, nls.localize('empty', "Cell has no output"));
            }
            if (!preferredMimeType) {
                const mimeTypes = viewModel.model.outputs.map(op => op.mime);
                const mimeTypesMessage = mimeTypes.join(', ');
                return this._renderMessage(viewModel, nls.localize('noRenderer.2', "No renderer could be found for output. It has the following mimetypes: {0}", mimeTypesMessage));
            }
            return this._renderSearchForMimetype(viewModel, preferredMimeType);
        }
        _renderSearchForMimetype(viewModel, mimeType) {
            const query = `@tag:notebookRenderer ${mimeType}`;
            const p = DOM.$('p', undefined, `No renderer could be found for mimetype "${mimeType}", but one might be available on the Marketplace.`);
            const a = DOM.$('a', { href: `command:workbench.extensions.search?%22${query}%22`, class: 'monaco-button monaco-text-button', tabindex: 0, role: 'button', style: 'padding: 8px; text-decoration: none; color: rgb(255, 255, 255); background-color: rgb(14, 99, 156); max-width: 200px;' }, `Search Marketplace`);
            return {
                type: 0 /* RenderOutputType.Html */,
                source: viewModel,
                htmlContent: p.outerHTML + a.outerHTML
            };
        }
        _renderMessage(viewModel, message) {
            const el = DOM.$('p', undefined, message);
            return { type: 0 /* RenderOutputType.Html */, source: viewModel, htmlContent: el.outerHTML };
        }
        shouldEnableCopy(mimeTypes) {
            if (!mimeTypes.find(mimeType => cellOutputClipboard_1.TEXT_BASED_MIMETYPES.indexOf(mimeType.mimeType) || mimeType.mimeType.startsWith('image/'))) {
                return false;
            }
            if ((0, notebookCommon_1.isTextStreamMime)(mimeTypes[0].mimeType)) {
                const cellViewModel = this.output.cellViewModel;
                const index = cellViewModel.outputsViewModels.indexOf(this.output);
                if (index > 0) {
                    const previousOutput = cellViewModel.model.outputs[index - 1];
                    // if the previous output was also a stream, the copy command will be in that output instead
                    return !(0, notebookCommon_1.isTextStreamMime)(previousOutput.outputs[0].mime);
                }
            }
            return true;
        }
        async _attachToolbar(outputItemDiv, notebookTextModel, kernel, index, mimeTypes) {
            const hasMultipleMimeTypes = mimeTypes.filter(mimeType => mimeType.isTrusted).length > 1;
            const isCopyEnabled = this.shouldEnableCopy(mimeTypes);
            if (index > 0 && !hasMultipleMimeTypes && !isCopyEnabled) {
                // nothing to put in the toolbar
                return;
            }
            if (!this.notebookEditor.hasModel()) {
                return;
            }
            const useConsolidatedButton = this.notebookEditor.notebookOptions.getLayoutConfiguration().consolidatedOutputButton;
            outputItemDiv.style.position = 'relative';
            const mimeTypePicker = DOM.$('.cell-output-toolbar');
            outputItemDiv.appendChild(mimeTypePicker);
            const toolbar = this._renderDisposableStore.add(this.instantiationService.createInstance(toolbar_1.WorkbenchToolBar, mimeTypePicker, {
                renderDropdownAsChildElement: false
            }));
            toolbar.context = {
                ui: true,
                cell: this.output.cellViewModel,
                outputViewModel: this.output,
                notebookEditor: this.notebookEditor,
                $mid: 13 /* MarshalledId.NotebookCellActionContext */
            };
            // TODO: This could probably be a real registered action, but it has to talk to this output element
            const pickAction = new actions_1.Action('notebook.output.pickMimetype', nls.localize('pickMimeType', "Change Presentation"), themables_1.ThemeIcon.asClassName(notebookIcons_1.mimetypeIcon), undefined, async (_context) => this._pickActiveMimeTypeRenderer(outputItemDiv, notebookTextModel, kernel, this.output));
            const menu = this._renderDisposableStore.add(this.menuService.createMenu(actions_2.MenuId.NotebookOutputToolbar, this.contextKeyService));
            const updateMenuToolbar = () => {
                const primary = [];
                let secondary = [];
                const result = { primary, secondary };
                (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(menu, { shouldForwardArgs: true }, result, () => false);
                if (index > 0 || !useConsolidatedButton) {
                    // clear outputs should only appear in the first output item's menu
                    secondary = secondary.filter((action) => action.id !== editActions_1.CLEAR_CELL_OUTPUTS_COMMAND_ID);
                }
                if (!isCopyEnabled) {
                    secondary = secondary.filter((action) => action.id !== cellOutputActions_1.COPY_OUTPUT_COMMAND_ID);
                }
                if (hasMultipleMimeTypes) {
                    secondary = [pickAction, ...secondary];
                }
                toolbar.setActions([], secondary);
            };
            updateMenuToolbar();
            this._renderDisposableStore.add(menu.onDidChange(updateMenuToolbar));
        }
        async _pickActiveMimeTypeRenderer(outputItemDiv, notebookTextModel, kernel, viewModel) {
            const [mimeTypes, currIndex] = viewModel.resolveMimeTypes(notebookTextModel, kernel?.preloadProvides);
            const items = [];
            const unsupportedItems = [];
            mimeTypes.forEach((mimeType, index) => {
                if (mimeType.isTrusted) {
                    const arr = mimeType.rendererId === notebookCommon_1.RENDERER_NOT_AVAILABLE ?
                        unsupportedItems :
                        items;
                    arr.push({
                        label: mimeType.mimeType,
                        id: mimeType.mimeType,
                        index: index,
                        picked: index === currIndex,
                        detail: this._generateRendererInfo(mimeType.rendererId),
                        description: index === currIndex ? nls.localize('curruentActiveMimeType', "Currently Active") : undefined
                    });
                }
            });
            if (unsupportedItems.some(m => JUPYTER_RENDERER_MIMETYPES.includes(m.id))) {
                unsupportedItems.push({
                    label: nls.localize('installJupyterPrompt', "Install additional renderers from the marketplace"),
                    id: 'installRenderers',
                    index: mimeTypes.length
                });
            }
            const picker = this.quickInputService.createQuickPick();
            picker.items = [
                ...items,
                { type: 'separator' },
                ...unsupportedItems
            ];
            picker.activeItems = items.filter(item => !!item.picked);
            picker.placeholder = items.length !== mimeTypes.length
                ? nls.localize('promptChooseMimeTypeInSecure.placeHolder', "Select mimetype to render for current output")
                : nls.localize('promptChooseMimeType.placeHolder', "Select mimetype to render for current output");
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
                this._showJupyterExtension();
                return;
            }
            // user chooses another mimetype
            const nextElement = outputItemDiv.nextElementSibling;
            this._renderDisposableStore.clear();
            const element = this.innerContainer;
            if (element) {
                element.parentElement?.removeChild(element);
                this.notebookEditor.removeInset(viewModel);
            }
            viewModel.pickedMimeType = mimeTypes[pick.index];
            this.viewCell.updateOutputMinHeight(this.viewCell.layoutInfo.outputTotalHeight);
            const { mimeType, rendererId } = mimeTypes[pick.index];
            this.notebookService.updateMimePreferredRenderer(notebookTextModel.viewType, mimeType, rendererId, mimeTypes.map(m => m.mimeType));
            this.render(nextElement);
            this._validateFinalOutputHeight(false);
            this._relayoutCell();
        }
        async _showJupyterExtension() {
            const viewlet = await this.paneCompositeService.openPaneComposite(extensions_1.VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */, true);
            const view = viewlet?.getViewPaneContainer();
            view?.search(`@id:${notebookBrowser_1.JUPYTER_EXTENSION_ID}`);
        }
        _generateRendererInfo(renderId) {
            const renderInfo = this.notebookService.getRendererInfo(renderId);
            if (renderInfo) {
                const displayName = renderInfo.displayName !== '' ? renderInfo.displayName : renderInfo.id;
                return `${displayName} (${renderInfo.extensionId.value})`;
            }
            return nls.localize('unavailableRenderInfo', "renderer not available");
        }
        _validateFinalOutputHeight(synchronous) {
            if (this._outputHeightTimer !== null) {
                clearTimeout(this._outputHeightTimer);
            }
            if (synchronous) {
                this.viewCell.unlockOutputHeight();
            }
            else {
                this._outputHeightTimer = setTimeout(() => {
                    this.viewCell.unlockOutputHeight();
                }, 1000);
            }
        }
        _relayoutCell() {
            this.notebookEditor.layoutNotebookCell(this.viewCell, this.viewCell.layoutInfo.totalHeight);
        }
        dispose() {
            if (this._outputHeightTimer) {
                this.viewCell.unlockOutputHeight();
                clearTimeout(this._outputHeightTimer);
            }
            super.dispose();
        }
    };
    CellOutputElement = __decorate([
        __param(5, notebookService_1.INotebookService),
        __param(6, quickInput_1.IQuickInputService),
        __param(7, contextkey_1.IContextKeyService),
        __param(8, actions_2.IMenuService),
        __param(9, panecomposite_1.IPaneCompositePartService),
        __param(10, instantiation_1.IInstantiationService)
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
    let CellOutputContainer = class CellOutputContainer extends cellPart_1.CellContentPart {
        get renderedOutputEntries() {
            return this._outputEntries;
        }
        constructor(notebookEditor, viewCell, templateData, options, openerService, _notebookExecutionStateService, instantiationService) {
            super();
            this.notebookEditor = notebookEditor;
            this.viewCell = viewCell;
            this.templateData = templateData;
            this.options = options;
            this.openerService = openerService;
            this._notebookExecutionStateService = _notebookExecutionStateService;
            this.instantiationService = instantiationService;
            this._outputEntries = [];
            this._outputHeightTimer = null;
            this._register(viewCell.onDidStartExecution(() => {
                viewCell.updateOutputMinHeight(viewCell.layoutInfo.outputTotalHeight);
            }));
            this._register(viewCell.onDidStopExecution(() => {
                this._validateFinalOutputHeight(false);
            }));
            this._register(viewCell.onDidChangeOutputs(splice => {
                const executionState = this._notebookExecutionStateService.getCellExecution(viewCell.uri);
                const context = executionState ? 1 /* CellOutputUpdateContext.Execution */ : 2 /* CellOutputUpdateContext.Other */;
                this._updateOutputs(splice, context);
            }));
            this._register(viewCell.onDidChangeLayout(() => {
                this.updateInternalLayoutNow(viewCell);
            }));
        }
        updateInternalLayoutNow(viewCell) {
            this.templateData.outputContainer.setTop(viewCell.layoutInfo.outputContainerOffset);
            this.templateData.outputShowMoreContainer.setTop(viewCell.layoutInfo.outputShowMoreContainerOffset);
            this._outputEntries.forEach(entry => {
                const index = this.viewCell.outputsViewModels.indexOf(entry.model);
                if (index >= 0) {
                    const top = this.viewCell.getOutputOffsetInContainer(index);
                    entry.element.updateDOMTop(top);
                }
            });
        }
        render() {
            try {
                this._doRender();
            }
            finally {
                // TODO@rebornix, this is probably not necessary at all as cell layout change would send the update request.
                this._relayoutCell();
            }
        }
        _doRender() {
            if (this.viewCell.outputsViewModels.length > 0) {
                if (this.viewCell.layoutInfo.outputTotalHeight !== 0) {
                    this.viewCell.updateOutputMinHeight(this.viewCell.layoutInfo.outputTotalHeight);
                }
                DOM.show(this.templateData.outputContainer.domNode);
                for (let index = 0; index < Math.min(this.options.limit, this.viewCell.outputsViewModels.length); index++) {
                    const currOutput = this.viewCell.outputsViewModels[index];
                    const entry = this.instantiationService.createInstance(CellOutputElement, this.notebookEditor, this.viewCell, this, this.templateData.outputContainer, currOutput);
                    this._outputEntries.push(new OutputEntryViewHandler(currOutput, entry));
                    entry.render(undefined);
                }
                if (this.viewCell.outputsViewModels.length > this.options.limit) {
                    DOM.show(this.templateData.outputShowMoreContainer.domNode);
                    this.viewCell.updateOutputShowMoreContainerHeight(46);
                }
                this._validateFinalOutputHeight(false);
            }
            else {
                // noop
                DOM.hide(this.templateData.outputContainer.domNode);
            }
            this.templateData.outputShowMoreContainer.domNode.innerText = '';
            if (this.viewCell.outputsViewModels.length > this.options.limit) {
                this.templateData.outputShowMoreContainer.domNode.appendChild(this._generateShowMoreElement(this.templateData.templateDisposables));
            }
            else {
                DOM.hide(this.templateData.outputShowMoreContainer.domNode);
                this.viewCell.updateOutputShowMoreContainerHeight(0);
            }
        }
        viewUpdateShowOutputs(initRendering) {
            for (let index = 0; index < this._outputEntries.length; index++) {
                const viewHandler = this._outputEntries[index];
                const outputEntry = viewHandler.element;
                if (outputEntry.renderResult) {
                    this.notebookEditor.createOutput(this.viewCell, outputEntry.renderResult, this.viewCell.getOutputOffset(index), false);
                }
                else {
                    outputEntry.render(undefined);
                }
            }
            this._relayoutCell();
        }
        viewUpdateHideOuputs() {
            for (let index = 0; index < this._outputEntries.length; index++) {
                this.notebookEditor.hideInset(this._outputEntries[index].model);
            }
        }
        _validateFinalOutputHeight(synchronous) {
            if (this._outputHeightTimer !== null) {
                clearTimeout(this._outputHeightTimer);
            }
            if (synchronous) {
                this.viewCell.unlockOutputHeight();
            }
            else {
                this._outputHeightTimer = setTimeout(() => {
                    this.viewCell.unlockOutputHeight();
                }, 1000);
            }
        }
        _updateOutputs(splice, context = 2 /* CellOutputUpdateContext.Other */) {
            const previousOutputHeight = this.viewCell.layoutInfo.outputTotalHeight;
            // for cell output update, we make sure the cell does not shrink before the new outputs are rendered.
            this.viewCell.updateOutputMinHeight(previousOutputHeight);
            if (this.viewCell.outputsViewModels.length) {
                DOM.show(this.templateData.outputContainer.domNode);
            }
            else {
                DOM.hide(this.templateData.outputContainer.domNode);
            }
            this.viewCell.spliceOutputHeights(splice.start, splice.deleteCount, splice.newOutputs.map(_ => 0));
            this._renderNow(splice, context);
        }
        _renderNow(splice, context) {
            if (splice.start >= this.options.limit) {
                // splice items out of limit
                return;
            }
            const firstGroupEntries = this._outputEntries.slice(0, splice.start);
            const deletedEntries = this._outputEntries.slice(splice.start, splice.start + splice.deleteCount);
            const secondGroupEntries = this._outputEntries.slice(splice.start + splice.deleteCount);
            let newlyInserted = this.viewCell.outputsViewModels.slice(splice.start, splice.start + splice.newOutputs.length);
            // [...firstGroup, ...deletedEntries, ...secondGroupEntries]  [...restInModel]
            // [...firstGroup, ...newlyInserted, ...secondGroupEntries, restInModel]
            if (firstGroupEntries.length + newlyInserted.length + secondGroupEntries.length > this.options.limit) {
                // exceeds limit again
                if (firstGroupEntries.length + newlyInserted.length > this.options.limit) {
                    [...deletedEntries, ...secondGroupEntries].forEach(entry => {
                        entry.element.detach();
                        entry.element.dispose();
                    });
                    newlyInserted = newlyInserted.slice(0, this.options.limit - firstGroupEntries.length);
                    const newlyInsertedEntries = newlyInserted.map(insert => {
                        return new OutputEntryViewHandler(insert, this.instantiationService.createInstance(CellOutputElement, this.notebookEditor, this.viewCell, this, this.templateData.outputContainer, insert));
                    });
                    this._outputEntries = [...firstGroupEntries, ...newlyInsertedEntries];
                    // render newly inserted outputs
                    for (let i = firstGroupEntries.length; i < this._outputEntries.length; i++) {
                        this._outputEntries[i].element.render(undefined);
                    }
                }
                else {
                    // part of secondGroupEntries are pushed out of view
                    // now we have to be creative as secondGroupEntries might not use dedicated containers
                    const elementsPushedOutOfView = secondGroupEntries.slice(this.options.limit - firstGroupEntries.length - newlyInserted.length);
                    [...deletedEntries, ...elementsPushedOutOfView].forEach(entry => {
                        entry.element.detach();
                        entry.element.dispose();
                    });
                    // exclusive
                    const reRenderRightBoundary = firstGroupEntries.length + newlyInserted.length;
                    const newlyInsertedEntries = newlyInserted.map(insert => {
                        return new OutputEntryViewHandler(insert, this.instantiationService.createInstance(CellOutputElement, this.notebookEditor, this.viewCell, this, this.templateData.outputContainer, insert));
                    });
                    this._outputEntries = [...firstGroupEntries, ...newlyInsertedEntries, ...secondGroupEntries.slice(0, this.options.limit - firstGroupEntries.length - newlyInserted.length)];
                    for (let i = firstGroupEntries.length; i < reRenderRightBoundary; i++) {
                        const previousSibling = i - 1 >= 0 && this._outputEntries[i - 1] && !!(this._outputEntries[i - 1].element.innerContainer?.parentElement) ? this._outputEntries[i - 1].element.innerContainer : undefined;
                        this._outputEntries[i].element.render(previousSibling);
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
                    return new OutputEntryViewHandler(insert, this.instantiationService.createInstance(CellOutputElement, this.notebookEditor, this.viewCell, this, this.templateData.outputContainer, insert));
                });
                let outputsNewlyAvailable = [];
                if (firstGroupEntries.length + newlyInsertedEntries.length + secondGroupEntries.length < this.viewCell.outputsViewModels.length) {
                    const last = Math.min(this.options.limit, this.viewCell.outputsViewModels.length);
                    outputsNewlyAvailable = this.viewCell.outputsViewModels.slice(firstGroupEntries.length + newlyInsertedEntries.length + secondGroupEntries.length, last).map(output => {
                        return new OutputEntryViewHandler(output, this.instantiationService.createInstance(CellOutputElement, this.notebookEditor, this.viewCell, this, this.templateData.outputContainer, output));
                    });
                }
                this._outputEntries = [...firstGroupEntries, ...newlyInsertedEntries, ...secondGroupEntries, ...outputsNewlyAvailable];
                for (let i = firstGroupEntries.length; i < reRenderRightBoundary; i++) {
                    const previousSibling = i - 1 >= 0 && this._outputEntries[i - 1] && !!(this._outputEntries[i - 1].element.innerContainer?.parentElement) ? this._outputEntries[i - 1].element.innerContainer : undefined;
                    this._outputEntries[i].element.render(previousSibling);
                }
                for (let i = 0; i < outputsNewlyAvailable.length; i++) {
                    this._outputEntries[firstGroupEntries.length + newlyInserted.length + secondGroupEntries.length + i].element.render(undefined);
                }
            }
            if (this.viewCell.outputsViewModels.length > this.options.limit) {
                DOM.show(this.templateData.outputShowMoreContainer.domNode);
                if (!this.templateData.outputShowMoreContainer.domNode.hasChildNodes()) {
                    this.templateData.outputShowMoreContainer.domNode.appendChild(this._generateShowMoreElement(this.templateData.templateDisposables));
                }
                this.viewCell.updateOutputShowMoreContainerHeight(46);
            }
            else {
                DOM.hide(this.templateData.outputShowMoreContainer.domNode);
            }
            const editorHeight = this.templateData.editor.getContentHeight();
            this.viewCell.editorHeight = editorHeight;
            this._relayoutCell();
            // if it's clearing all outputs, or outputs are all rendered synchronously
            // shrink immediately as the final output height will be zero.
            // if it's rerun, then the output clearing might be temporary, so we don't shrink immediately
            this._validateFinalOutputHeight(context === 2 /* CellOutputUpdateContext.Other */ && this.viewCell.outputsViewModels.length === 0);
        }
        _generateShowMoreElement(disposables) {
            const md = {
                value: `There are more than ${this.options.limit} outputs, [show more (open the raw output data in a text editor) ...](command:workbench.action.openLargeOutput)`,
                isTrusted: true,
                supportThemeIcons: true
            };
            const rendered = (0, markdownRenderer_1.renderMarkdown)(md, {
                actionHandler: {
                    callback: (content) => {
                        if (content === 'command:workbench.action.openLargeOutput') {
                            this.openerService.open(notebookCommon_1.CellUri.generateCellOutputUri(this.notebookEditor.textModel.uri));
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
        _relayoutCell() {
            this.notebookEditor.layoutNotebookCell(this.viewCell, this.viewCell.layoutInfo.totalHeight);
        }
        dispose() {
            this.viewCell.updateOutputMinHeight(0);
            if (this._outputHeightTimer) {
                clearTimeout(this._outputHeightTimer);
            }
            this._outputEntries.forEach(entry => {
                entry.element.dispose();
            });
            super.dispose();
        }
    };
    exports.CellOutputContainer = CellOutputContainer;
    exports.CellOutputContainer = CellOutputContainer = __decorate([
        __param(4, opener_1.IOpenerService),
        __param(5, notebookExecutionStateService_1.INotebookExecutionStateService),
        __param(6, instantiation_1.IInstantiationService)
    ], CellOutputContainer);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbE91dHB1dC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL2Jyb3dzZXIvdmlldy9jZWxsUGFydHMvY2VsbE91dHB1dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUE0Q2hHLGdCQUFnQjtJQUNoQixFQUFFO0lBQ0YsV0FBVztJQUNYLEtBQUs7SUFDTCw4QkFBOEI7SUFDOUIsb0RBQW9EO0lBQ3BELCtDQUErQztJQUMvQywrQ0FBK0M7SUFDL0MsK0NBQStDO0lBQy9DLDhCQUE4QjtJQUM5QixvREFBb0Q7SUFDcEQsK0NBQStDO0lBQy9DLDhCQUE4QjtJQUM5QixvREFBb0Q7SUFDcEQsK0NBQStDO0lBQy9DLElBQU0saUJBQWlCLEdBQXZCLE1BQU0saUJBQWtCLFNBQVEsc0JBQVU7UUFTekMsWUFDUyxjQUF1QyxFQUN2QyxRQUEyQixFQUMzQixtQkFBd0MsRUFDeEMsZUFBeUMsRUFDeEMsTUFBNEIsRUFDbkIsZUFBa0QsRUFDaEQsaUJBQXNELEVBQ3RELHVCQUEyQyxFQUNqRCxXQUEwQyxFQUM3QixvQkFBZ0UsRUFDcEUsb0JBQTREO1lBRW5GLEtBQUssRUFBRSxDQUFDO1lBWkEsbUJBQWMsR0FBZCxjQUFjLENBQXlCO1lBQ3ZDLGFBQVEsR0FBUixRQUFRLENBQW1CO1lBQzNCLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBcUI7WUFDeEMsb0JBQWUsR0FBZixlQUFlLENBQTBCO1lBQ3hDLFdBQU0sR0FBTixNQUFNLENBQXNCO1lBQ0Ysb0JBQWUsR0FBZixlQUFlLENBQWtCO1lBQy9CLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7WUFFM0MsZ0JBQVcsR0FBWCxXQUFXLENBQWM7WUFDWix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQTJCO1lBQ25ELHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7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