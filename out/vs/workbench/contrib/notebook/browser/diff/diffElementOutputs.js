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
define(["require", "exports", "vs/base/browser/dom", "vs/nls", "vs/base/common/lifecycle", "vs/workbench/contrib/notebook/browser/diff/diffElementViewModel", "vs/workbench/contrib/notebook/browser/diff/notebookDiffEditorBrowser", "vs/workbench/contrib/notebook/common/notebookService", "vs/base/common/themables", "vs/workbench/contrib/notebook/browser/notebookIcons", "vs/base/browser/keyboardEvent", "vs/platform/quickinput/common/quickInput"], function (require, exports, DOM, nls, lifecycle_1, diffElementViewModel_1, notebookDiffEditorBrowser_1, notebookService_1, themables_1, notebookIcons_1, keyboardEvent_1, quickInput_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OutputContainer = exports.OutputElement = void 0;
    class OutputElement extends lifecycle_1.Disposable {
        constructor(_notebookEditor, _notebookTextModel, _notebookService, _quickInputService, _diffElementViewModel, _diffSide, _nestedCell, _outputContainer, output) {
            super();
            this._notebookEditor = _notebookEditor;
            this._notebookTextModel = _notebookTextModel;
            this._notebookService = _notebookService;
            this._quickInputService = _quickInputService;
            this._diffElementViewModel = _diffElementViewModel;
            this._diffSide = _diffSide;
            this._nestedCell = _nestedCell;
            this._outputContainer = _outputContainer;
            this.output = output;
            this.resizeListener = this._register(new lifecycle_1.DisposableStore());
        }
        render(index, beforeElement) {
            const outputItemDiv = document.createElement('div');
            let result = undefined;
            const [mimeTypes, pick] = this.output.resolveMimeTypes(this._notebookTextModel, undefined);
            const pickedMimeTypeRenderer = mimeTypes[pick];
            if (mimeTypes.length > 1) {
                outputItemDiv.style.position = 'relative';
                const mimeTypePicker = DOM.$('.multi-mimetype-output');
                mimeTypePicker.classList.add(...themables_1.ThemeIcon.asClassNameArray(notebookIcons_1.mimetypeIcon));
                mimeTypePicker.tabIndex = 0;
                mimeTypePicker.title = nls.localize('mimeTypePicker', "Choose a different output mimetype, available mimetypes: {0}", mimeTypes.map(mimeType => mimeType.mimeType).join(', '));
                outputItemDiv.appendChild(mimeTypePicker);
                this.resizeListener.add(DOM.addStandardDisposableListener(mimeTypePicker, 'mousedown', async (e) => {
                    if (e.leftButton) {
                        e.preventDefault();
                        e.stopPropagation();
                        await this.pickActiveMimeTypeRenderer(this._notebookTextModel, this.output);
                    }
                }));
                this.resizeListener.add((DOM.addDisposableListener(mimeTypePicker, DOM.EventType.KEY_DOWN, async (e) => {
                    const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                    if ((event.equals(3 /* KeyCode.Enter */) || event.equals(10 /* KeyCode.Space */))) {
                        e.preventDefault();
                        e.stopPropagation();
                        await this.pickActiveMimeTypeRenderer(this._notebookTextModel, this.output);
                    }
                })));
            }
            const innerContainer = DOM.$('.output-inner-container');
            DOM.append(outputItemDiv, innerContainer);
            if (mimeTypes.length !== 0) {
                const renderer = this._notebookService.getRendererInfo(pickedMimeTypeRenderer.rendererId);
                result = renderer
                    ? { type: 1 /* RenderOutputType.Extension */, renderer, source: this.output, mimeType: pickedMimeTypeRenderer.mimeType }
                    : this._renderMissingRenderer(this.output, pickedMimeTypeRenderer.mimeType);
                this.output.pickedMimeType = pickedMimeTypeRenderer;
            }
            this.domNode = outputItemDiv;
            this.renderResult = result;
            if (!result) {
                // this.viewCell.updateOutputHeight(index, 0);
                return;
            }
            if (beforeElement) {
                this._outputContainer.insertBefore(outputItemDiv, beforeElement);
            }
            else {
                this._outputContainer.appendChild(outputItemDiv);
            }
            this._notebookEditor.createOutput(this._diffElementViewModel, this._nestedCell, result, () => this.getOutputOffsetInCell(index), this._diffElementViewModel instanceof diffElementViewModel_1.SideBySideDiffElementViewModel
                ? this._diffSide
                : this._diffElementViewModel.type === 'insert' ? notebookDiffEditorBrowser_1.DiffSide.Modified : notebookDiffEditorBrowser_1.DiffSide.Original);
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
                htmlContent: p.outerHTML + a.outerHTML,
            };
        }
        _renderMessage(viewModel, message) {
            const el = DOM.$('p', undefined, message);
            return { type: 0 /* RenderOutputType.Html */, source: viewModel, htmlContent: el.outerHTML };
        }
        async pickActiveMimeTypeRenderer(notebookTextModel, viewModel) {
            const [mimeTypes, currIndex] = viewModel.resolveMimeTypes(notebookTextModel, undefined);
            const items = mimeTypes.filter(mimeType => mimeType.isTrusted).map((mimeType, index) => ({
                label: mimeType.mimeType,
                id: mimeType.mimeType,
                index: index,
                picked: index === currIndex,
                detail: this.generateRendererInfo(mimeType.rendererId),
                description: index === currIndex ? nls.localize('curruentActiveMimeType', "Currently Active") : undefined
            }));
            const picker = this._quickInputService.createQuickPick();
            picker.items = items;
            picker.activeItems = items.filter(item => !!item.picked);
            picker.placeholder = items.length !== mimeTypes.length
                ? nls.localize('promptChooseMimeTypeInSecure.placeHolder', "Select mimetype to render for current output. Rich mimetypes are available only when the notebook is trusted")
                : nls.localize('promptChooseMimeType.placeHolder', "Select mimetype to render for current output");
            const pick = await new Promise(resolve => {
                picker.onDidAccept(() => {
                    resolve(picker.selectedItems.length === 1 ? picker.selectedItems[0].index : undefined);
                    picker.dispose();
                });
                picker.show();
            });
            if (pick === undefined) {
                return;
            }
            if (pick !== currIndex) {
                // user chooses another mimetype
                const index = this._nestedCell.outputsViewModels.indexOf(viewModel);
                const nextElement = this.domNode.nextElementSibling;
                this.resizeListener.clear();
                const element = this.domNode;
                if (element) {
                    element.parentElement?.removeChild(element);
                    this._notebookEditor.removeInset(this._diffElementViewModel, this._nestedCell, viewModel, this._diffSide);
                }
                viewModel.pickedMimeType = mimeTypes[pick];
                this.render(index, nextElement);
            }
        }
        generateRendererInfo(renderId) {
            const renderInfo = this._notebookService.getRendererInfo(renderId);
            if (renderInfo) {
                const displayName = renderInfo.displayName !== '' ? renderInfo.displayName : renderInfo.id;
                return `${displayName} (${renderInfo.extensionId.value})`;
            }
            return nls.localize('builtinRenderInfo', "built-in");
        }
        getCellOutputCurrentIndex() {
            return this._diffElementViewModel.getNestedCellViewModel(this._diffSide).outputs.indexOf(this.output.model);
        }
        updateHeight(index, height) {
            this._diffElementViewModel.updateOutputHeight(this._diffSide, index, height);
        }
        getOutputOffsetInContainer(index) {
            return this._diffElementViewModel.getOutputOffsetInContainer(this._diffSide, index);
        }
        getOutputOffsetInCell(index) {
            return this._diffElementViewModel.getOutputOffsetInCell(this._diffSide, index);
        }
    }
    exports.OutputElement = OutputElement;
    let OutputContainer = class OutputContainer extends lifecycle_1.Disposable {
        constructor(_editor, _notebookTextModel, _diffElementViewModel, _nestedCellViewModel, _diffSide, _outputContainer, _notebookService, _quickInputService) {
            super();
            this._editor = _editor;
            this._notebookTextModel = _notebookTextModel;
            this._diffElementViewModel = _diffElementViewModel;
            this._nestedCellViewModel = _nestedCellViewModel;
            this._diffSide = _diffSide;
            this._outputContainer = _outputContainer;
            this._notebookService = _notebookService;
            this._quickInputService = _quickInputService;
            this._outputEntries = new Map();
            this._register(this._diffElementViewModel.onDidLayoutChange(() => {
                this._outputEntries.forEach((value, key) => {
                    const index = _nestedCellViewModel.outputs.indexOf(key.model);
                    if (index >= 0) {
                        const top = this._diffElementViewModel.getOutputOffsetInContainer(this._diffSide, index);
                        value.domNode.style.top = `${top}px`;
                    }
                });
            }));
            this._register(this._nestedCellViewModel.textModel.onDidChangeOutputs(splice => {
                this._updateOutputs(splice);
            }));
        }
        _updateOutputs(splice) {
            const removedKeys = [];
            this._outputEntries.forEach((value, key) => {
                if (this._nestedCellViewModel.outputsViewModels.indexOf(key) < 0) {
                    // already removed
                    removedKeys.push(key);
                    // remove element from DOM
                    this._outputContainer.removeChild(value.domNode);
                    this._editor.removeInset(this._diffElementViewModel, this._nestedCellViewModel, key, this._diffSide);
                }
            });
            removedKeys.forEach(key => {
                this._outputEntries.get(key)?.dispose();
                this._outputEntries.delete(key);
            });
            let prevElement = undefined;
            const outputsToRender = this._nestedCellViewModel.outputsViewModels;
            outputsToRender.reverse().forEach(output => {
                if (this._outputEntries.has(output)) {
                    // already exist
                    prevElement = this._outputEntries.get(output).domNode;
                    return;
                }
                // newly added element
                const currIndex = this._nestedCellViewModel.outputsViewModels.indexOf(output);
                this._renderOutput(output, currIndex, prevElement);
                prevElement = this._outputEntries.get(output)?.domNode;
            });
        }
        render() {
            // TODO, outputs to render (should have a limit)
            for (let index = 0; index < this._nestedCellViewModel.outputsViewModels.length; index++) {
                const currOutput = this._nestedCellViewModel.outputsViewModels[index];
                // always add to the end
                this._renderOutput(currOutput, index, undefined);
            }
        }
        showOutputs() {
            for (let index = 0; index < this._nestedCellViewModel.outputsViewModels.length; index++) {
                const currOutput = this._nestedCellViewModel.outputsViewModels[index];
                // always add to the end
                this._editor.showInset(this._diffElementViewModel, currOutput.cellViewModel, currOutput, this._diffSide);
            }
        }
        hideOutputs() {
            this._outputEntries.forEach((outputElement, cellOutputViewModel) => {
                this._editor.hideInset(this._diffElementViewModel, this._nestedCellViewModel, cellOutputViewModel);
            });
        }
        _renderOutput(currOutput, index, beforeElement) {
            if (!this._outputEntries.has(currOutput)) {
                this._outputEntries.set(currOutput, new OutputElement(this._editor, this._notebookTextModel, this._notebookService, this._quickInputService, this._diffElementViewModel, this._diffSide, this._nestedCellViewModel, this._outputContainer, currOutput));
            }
            const renderElement = this._outputEntries.get(currOutput);
            renderElement.render(index, beforeElement);
        }
    };
    exports.OutputContainer = OutputContainer;
    exports.OutputContainer = OutputContainer = __decorate([
        __param(6, notebookService_1.INotebookService),
        __param(7, quickInput_1.IQuickInputService)
    ], OutputContainer);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlmZkVsZW1lbnRPdXRwdXRzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svYnJvd3Nlci9kaWZmL2RpZmZFbGVtZW50T3V0cHV0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFzQmhHLE1BQWEsYUFBYyxTQUFRLHNCQUFVO1FBSzVDLFlBQ1MsZUFBd0MsRUFDeEMsa0JBQXFDLEVBQ3JDLGdCQUFrQyxFQUNsQyxrQkFBc0MsRUFDdEMscUJBQStDLEVBQy9DLFNBQW1CLEVBQ25CLFdBQW9DLEVBQ3BDLGdCQUE2QixFQUM1QixNQUE0QjtZQUVyQyxLQUFLLEVBQUUsQ0FBQztZQVZBLG9CQUFlLEdBQWYsZUFBZSxDQUF5QjtZQUN4Qyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW1CO1lBQ3JDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7WUFDbEMsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtZQUN0QywwQkFBcUIsR0FBckIscUJBQXFCLENBQTBCO1lBQy9DLGNBQVMsR0FBVCxTQUFTLENBQVU7WUFDbkIsZ0JBQVcsR0FBWCxXQUFXLENBQXlCO1lBQ3BDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBYTtZQUM1QixXQUFNLEdBQU4sTUFBTSxDQUFzQjtZQWI3QixtQkFBYyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSwyQkFBZSxFQUFFLENBQUMsQ0FBQztRQWdCaEUsQ0FBQztRQUVELE1BQU0sQ0FBQyxLQUFhLEVBQUUsYUFBMkI7WUFDaEQsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNwRCxJQUFJLE1BQU0sR0FBbUMsU0FBUyxDQUFDO1lBRXZELE1BQU0sQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1B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