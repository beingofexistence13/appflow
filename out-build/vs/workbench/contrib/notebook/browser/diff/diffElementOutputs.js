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
define(["require", "exports", "vs/base/browser/dom", "vs/nls!vs/workbench/contrib/notebook/browser/diff/diffElementOutputs", "vs/base/common/lifecycle", "vs/workbench/contrib/notebook/browser/diff/diffElementViewModel", "vs/workbench/contrib/notebook/browser/diff/notebookDiffEditorBrowser", "vs/workbench/contrib/notebook/common/notebookService", "vs/base/common/themables", "vs/workbench/contrib/notebook/browser/notebookIcons", "vs/base/browser/keyboardEvent", "vs/platform/quickinput/common/quickInput"], function (require, exports, DOM, nls, lifecycle_1, diffElementViewModel_1, notebookDiffEditorBrowser_1, notebookService_1, themables_1, notebookIcons_1, keyboardEvent_1, quickInput_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$PEb = exports.$OEb = void 0;
    class $OEb extends lifecycle_1.$kc {
        constructor(b, c, f, g, h, j, m, n, output) {
            super();
            this.b = b;
            this.c = c;
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.output = output;
            this.resizeListener = this.B(new lifecycle_1.$jc());
        }
        render(index, beforeElement) {
            const outputItemDiv = document.createElement('div');
            let result = undefined;
            const [mimeTypes, pick] = this.output.resolveMimeTypes(this.c, undefined);
            const pickedMimeTypeRenderer = mimeTypes[pick];
            if (mimeTypes.length > 1) {
                outputItemDiv.style.position = 'relative';
                const mimeTypePicker = DOM.$('.multi-mimetype-output');
                mimeTypePicker.classList.add(...themables_1.ThemeIcon.asClassNameArray(notebookIcons_1.$Ppb));
                mimeTypePicker.tabIndex = 0;
                mimeTypePicker.title = nls.localize(0, null, mimeTypes.map(mimeType => mimeType.mimeType).join(', '));
                outputItemDiv.appendChild(mimeTypePicker);
                this.resizeListener.add(DOM.$oO(mimeTypePicker, 'mousedown', async (e) => {
                    if (e.leftButton) {
                        e.preventDefault();
                        e.stopPropagation();
                        await this.u(this.c, this.output);
                    }
                }));
                this.resizeListener.add((DOM.$nO(mimeTypePicker, DOM.$3O.KEY_DOWN, async (e) => {
                    const event = new keyboardEvent_1.$jO(e);
                    if ((event.equals(3 /* KeyCode.Enter */) || event.equals(10 /* KeyCode.Space */))) {
                        e.preventDefault();
                        e.stopPropagation();
                        await this.u(this.c, this.output);
                    }
                })));
            }
            const innerContainer = DOM.$('.output-inner-container');
            DOM.$0O(outputItemDiv, innerContainer);
            if (mimeTypes.length !== 0) {
                const renderer = this.f.getRendererInfo(pickedMimeTypeRenderer.rendererId);
                result = renderer
                    ? { type: 1 /* RenderOutputType.Extension */, renderer, source: this.output, mimeType: pickedMimeTypeRenderer.mimeType }
                    : this.r(this.output, pickedMimeTypeRenderer.mimeType);
                this.output.pickedMimeType = pickedMimeTypeRenderer;
            }
            this.domNode = outputItemDiv;
            this.renderResult = result;
            if (!result) {
                // this.viewCell.updateOutputHeight(index, 0);
                return;
            }
            if (beforeElement) {
                this.n.insertBefore(outputItemDiv, beforeElement);
            }
            else {
                this.n.appendChild(outputItemDiv);
            }
            this.b.createOutput(this.h, this.m, result, () => this.getOutputOffsetInCell(index), this.h instanceof diffElementViewModel_1.$IEb
                ? this.j
                : this.h.type === 'insert' ? notebookDiffEditorBrowser_1.DiffSide.Modified : notebookDiffEditorBrowser_1.DiffSide.Original);
        }
        r(viewModel, preferredMimeType) {
            if (!viewModel.model.outputs.length) {
                return this.t(viewModel, nls.localize(1, null));
            }
            if (!preferredMimeType) {
                const mimeTypes = viewModel.model.outputs.map(op => op.mime);
                const mimeTypesMessage = mimeTypes.join(', ');
                return this.t(viewModel, nls.localize(2, null, mimeTypesMessage));
            }
            return this.s(viewModel, preferredMimeType);
        }
        s(viewModel, mimeType) {
            const query = `@tag:notebookRenderer ${mimeType}`;
            const p = DOM.$('p', undefined, `No renderer could be found for mimetype "${mimeType}", but one might be available on the Marketplace.`);
            const a = DOM.$('a', { href: `command:workbench.extensions.search?%22${query}%22`, class: 'monaco-button monaco-text-button', tabindex: 0, role: 'button', style: 'padding: 8px; text-decoration: none; color: rgb(255, 255, 255); background-color: rgb(14, 99, 156); max-width: 200px;' }, `Search Marketplace`);
            return {
                type: 0 /* RenderOutputType.Html */,
                source: viewModel,
                htmlContent: p.outerHTML + a.outerHTML,
            };
        }
        t(viewModel, message) {
            const el = DOM.$('p', undefined, message);
            return { type: 0 /* RenderOutputType.Html */, source: viewModel, htmlContent: el.outerHTML };
        }
        async u(notebookTextModel, viewModel) {
            const [mimeTypes, currIndex] = viewModel.resolveMimeTypes(notebookTextModel, undefined);
            const items = mimeTypes.filter(mimeType => mimeType.isTrusted).map((mimeType, index) => ({
                label: mimeType.mimeType,
                id: mimeType.mimeType,
                index: index,
                picked: index === currIndex,
                detail: this.w(mimeType.rendererId),
                description: index === currIndex ? nls.localize(3, null) : undefined
            }));
            const picker = this.g.createQuickPick();
            picker.items = items;
            picker.activeItems = items.filter(item => !!item.picked);
            picker.placeholder = items.length !== mimeTypes.length
                ? nls.localize(4, null)
                : nls.localize(5, null);
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
                const index = this.m.outputsViewModels.indexOf(viewModel);
                const nextElement = this.domNode.nextElementSibling;
                this.resizeListener.clear();
                const element = this.domNode;
                if (element) {
                    element.parentElement?.removeChild(element);
                    this.b.removeInset(this.h, this.m, viewModel, this.j);
                }
                viewModel.pickedMimeType = mimeTypes[pick];
                this.render(index, nextElement);
            }
        }
        w(renderId) {
            const renderInfo = this.f.getRendererInfo(renderId);
            if (renderInfo) {
                const displayName = renderInfo.displayName !== '' ? renderInfo.displayName : renderInfo.id;
                return `${displayName} (${renderInfo.extensionId.value})`;
            }
            return nls.localize(6, null);
        }
        getCellOutputCurrentIndex() {
            return this.h.getNestedCellViewModel(this.j).outputs.indexOf(this.output.model);
        }
        updateHeight(index, height) {
            this.h.updateOutputHeight(this.j, index, height);
        }
        getOutputOffsetInContainer(index) {
            return this.h.getOutputOffsetInContainer(this.j, index);
        }
        getOutputOffsetInCell(index) {
            return this.h.getOutputOffsetInCell(this.j, index);
        }
    }
    exports.$OEb = $OEb;
    let $PEb = class $PEb extends lifecycle_1.$kc {
        constructor(c, f, g, h, j, m, n, r) {
            super();
            this.c = c;
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.b = new Map();
            this.B(this.g.onDidLayoutChange(() => {
                this.b.forEach((value, key) => {
                    const index = h.outputs.indexOf(key.model);
                    if (index >= 0) {
                        const top = this.g.getOutputOffsetInContainer(this.j, index);
                        value.domNode.style.top = `${top}px`;
                    }
                });
            }));
            this.B(this.h.textModel.onDidChangeOutputs(splice => {
                this.s(splice);
            }));
        }
        s(splice) {
            const removedKeys = [];
            this.b.forEach((value, key) => {
                if (this.h.outputsViewModels.indexOf(key) < 0) {
                    // already removed
                    removedKeys.push(key);
                    // remove element from DOM
                    this.m.removeChild(value.domNode);
                    this.c.removeInset(this.g, this.h, key, this.j);
                }
            });
            removedKeys.forEach(key => {
                this.b.get(key)?.dispose();
                this.b.delete(key);
            });
            let prevElement = undefined;
            const outputsToRender = this.h.outputsViewModels;
            outputsToRender.reverse().forEach(output => {
                if (this.b.has(output)) {
                    // already exist
                    prevElement = this.b.get(output).domNode;
                    return;
                }
                // newly added element
                const currIndex = this.h.outputsViewModels.indexOf(output);
                this.t(output, currIndex, prevElement);
                prevElement = this.b.get(output)?.domNode;
            });
        }
        render() {
            // TODO, outputs to render (should have a limit)
            for (let index = 0; index < this.h.outputsViewModels.length; index++) {
                const currOutput = this.h.outputsViewModels[index];
                // always add to the end
                this.t(currOutput, index, undefined);
            }
        }
        showOutputs() {
            for (let index = 0; index < this.h.outputsViewModels.length; index++) {
                const currOutput = this.h.outputsViewModels[index];
                // always add to the end
                this.c.showInset(this.g, currOutput.cellViewModel, currOutput, this.j);
            }
        }
        hideOutputs() {
            this.b.forEach((outputElement, cellOutputViewModel) => {
                this.c.hideInset(this.g, this.h, cellOutputViewModel);
            });
        }
        t(currOutput, index, beforeElement) {
            if (!this.b.has(currOutput)) {
                this.b.set(currOutput, new $OEb(this.c, this.f, this.n, this.r, this.g, this.j, this.h, this.m, currOutput));
            }
            const renderElement = this.b.get(currOutput);
            renderElement.render(index, beforeElement);
        }
    };
    exports.$PEb = $PEb;
    exports.$PEb = $PEb = __decorate([
        __param(6, notebookService_1.$ubb),
        __param(7, quickInput_1.$Gq)
    ], $PEb);
});
//# sourceMappingURL=diffElementOutputs.js.map