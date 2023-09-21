/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/hash", "vs/base/common/jsonFormatter", "vs/base/common/lifecycle", "vs/editor/browser/widget/diffEditor/diffEditorWidget", "vs/workbench/contrib/notebook/browser/diff/diffCellEditorOptions", "vs/workbench/contrib/notebook/browser/diff/eventDispatcher", "vs/workbench/contrib/notebook/browser/diff/notebookDiffEditorBrowser", "vs/workbench/contrib/notebook/browser/notebookBrowser"], function (require, exports, event_1, hash_1, jsonFormatter_1, lifecycle_1, diffEditorWidget_1, diffCellEditorOptions_1, eventDispatcher_1, notebookDiffEditorBrowser_1, notebookBrowser_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$NEb = exports.$MEb = exports.$LEb = exports.$KEb = exports.OutputComparison = exports.$JEb = exports.$IEb = exports.$HEb = exports.$GEb = exports.PropertyFoldingState = void 0;
    var PropertyFoldingState;
    (function (PropertyFoldingState) {
        PropertyFoldingState[PropertyFoldingState["Expanded"] = 0] = "Expanded";
        PropertyFoldingState[PropertyFoldingState["Collapsed"] = 1] = "Collapsed";
    })(PropertyFoldingState || (exports.PropertyFoldingState = PropertyFoldingState = {}));
    exports.$GEb = 1440;
    class $HEb extends lifecycle_1.$kc {
        set rawOutputHeight(height) {
            this.t({ rawOutputHeight: Math.min(exports.$GEb, height) });
        }
        get rawOutputHeight() {
            throw new Error('Use Cell.layoutInfo.rawOutputHeight');
        }
        set outputStatusHeight(height) {
            this.t({ outputStatusHeight: height });
        }
        get outputStatusHeight() {
            throw new Error('Use Cell.layoutInfo.outputStatusHeight');
        }
        set outputMetadataHeight(height) {
            this.t({ outputMetadataHeight: height });
        }
        get outputMetadataHeight() {
            throw new Error('Use Cell.layoutInfo.outputStatusHeight');
        }
        set editorHeight(height) {
            this.t({ editorHeight: height });
        }
        get editorHeight() {
            throw new Error('Use Cell.layoutInfo.editorHeight');
        }
        set editorMargin(margin) {
            this.t({ editorMargin: margin });
        }
        get editorMargin() {
            throw new Error('Use Cell.layoutInfo.editorMargin');
        }
        set metadataStatusHeight(height) {
            this.t({ metadataStatusHeight: height });
        }
        get metadataStatusHeight() {
            throw new Error('Use Cell.layoutInfo.outputStatusHeight');
        }
        set metadataHeight(height) {
            this.t({ metadataHeight: height });
        }
        get metadataHeight() {
            throw new Error('Use Cell.layoutInfo.metadataHeight');
        }
        set renderOutput(value) {
            this.h = value;
            this.t({ recomputeOutput: true });
            this.f.fire({ renderOutput: this.h });
        }
        get renderOutput() {
            return this.h;
        }
        get layoutInfo() {
            return this.g;
        }
        constructor(mainDocumentTextModel, original, modified, type, editorEventDispatcher, initData) {
            super();
            this.mainDocumentTextModel = mainDocumentTextModel;
            this.original = original;
            this.modified = modified;
            this.type = type;
            this.editorEventDispatcher = editorEventDispatcher;
            this.initData = initData;
            this.c = this.B(new event_1.$fd());
            this.onDidLayoutChange = this.c.event;
            this.f = this.B(new event_1.$fd());
            this.onDidStateChange = this.f.event;
            this.h = true;
            this.m = null;
            this.n = null;
            this.r = null;
            const editorHeight = this.s(initData.fontInfo);
            this.g = {
                width: 0,
                editorHeight: editorHeight,
                editorMargin: 0,
                metadataHeight: 0,
                metadataStatusHeight: 25,
                rawOutputHeight: 0,
                outputTotalHeight: 0,
                outputStatusHeight: 25,
                outputMetadataHeight: 0,
                bodyMargin: 32,
                totalHeight: 82 + editorHeight,
                layoutState: notebookBrowser_1.CellLayoutState.Uninitialized
            };
            this.metadataFoldingState = PropertyFoldingState.Collapsed;
            this.outputFoldingState = PropertyFoldingState.Collapsed;
            this.B(this.editorEventDispatcher.onDidChangeLayout(e => {
                this.c.fire({ outerWidth: true });
            }));
        }
        layoutChange() {
            this.t({ recomputeOutput: true });
        }
        s(fontInfo) {
            const lineHeight = fontInfo?.lineHeight ?? 17;
            switch (this.type) {
                case 'unchanged':
                case 'insert':
                    {
                        const lineCount = this.modified.textModel.textBuffer.getLineCount();
                        const editorHeight = lineCount * lineHeight + diffCellEditorOptions_1.$vEb.top + diffCellEditorOptions_1.$vEb.bottom;
                        return editorHeight;
                    }
                case 'delete':
                case 'modified':
                    {
                        const lineCount = this.original.textModel.textBuffer.getLineCount();
                        const editorHeight = lineCount * lineHeight + diffCellEditorOptions_1.$vEb.top + diffCellEditorOptions_1.$vEb.bottom;
                        return editorHeight;
                    }
            }
        }
        t(delta) {
            const width = delta.width !== undefined ? delta.width : this.g.width;
            const editorHeight = delta.editorHeight !== undefined ? delta.editorHeight : this.g.editorHeight;
            const editorMargin = delta.editorMargin !== undefined ? delta.editorMargin : this.g.editorMargin;
            const metadataHeight = delta.metadataHeight !== undefined ? delta.metadataHeight : this.g.metadataHeight;
            const metadataStatusHeight = delta.metadataStatusHeight !== undefined ? delta.metadataStatusHeight : this.g.metadataStatusHeight;
            const rawOutputHeight = delta.rawOutputHeight !== undefined ? delta.rawOutputHeight : this.g.rawOutputHeight;
            const outputStatusHeight = delta.outputStatusHeight !== undefined ? delta.outputStatusHeight : this.g.outputStatusHeight;
            const bodyMargin = delta.bodyMargin !== undefined ? delta.bodyMargin : this.g.bodyMargin;
            const outputMetadataHeight = delta.outputMetadataHeight !== undefined ? delta.outputMetadataHeight : this.g.outputMetadataHeight;
            const outputHeight = (delta.recomputeOutput || delta.rawOutputHeight !== undefined || delta.outputMetadataHeight !== undefined) ? this.y(rawOutputHeight, outputMetadataHeight) : this.g.outputTotalHeight;
            const totalHeight = editorHeight
                + editorMargin
                + metadataHeight
                + metadataStatusHeight
                + outputHeight
                + outputStatusHeight
                + bodyMargin;
            const newLayout = {
                width: width,
                editorHeight: editorHeight,
                editorMargin: editorMargin,
                metadataHeight: metadataHeight,
                metadataStatusHeight: metadataStatusHeight,
                outputTotalHeight: outputHeight,
                outputStatusHeight: outputStatusHeight,
                bodyMargin: bodyMargin,
                rawOutputHeight: rawOutputHeight,
                outputMetadataHeight: outputMetadataHeight,
                totalHeight: totalHeight,
                layoutState: notebookBrowser_1.CellLayoutState.Measured
            };
            let somethingChanged = false;
            const changeEvent = {};
            if (newLayout.width !== this.g.width) {
                changeEvent.width = true;
                somethingChanged = true;
            }
            if (newLayout.editorHeight !== this.g.editorHeight) {
                changeEvent.editorHeight = true;
                somethingChanged = true;
            }
            if (newLayout.editorMargin !== this.g.editorMargin) {
                changeEvent.editorMargin = true;
                somethingChanged = true;
            }
            if (newLayout.metadataHeight !== this.g.metadataHeight) {
                changeEvent.metadataHeight = true;
                somethingChanged = true;
            }
            if (newLayout.metadataStatusHeight !== this.g.metadataStatusHeight) {
                changeEvent.metadataStatusHeight = true;
                somethingChanged = true;
            }
            if (newLayout.outputTotalHeight !== this.g.outputTotalHeight) {
                changeEvent.outputTotalHeight = true;
                somethingChanged = true;
            }
            if (newLayout.outputStatusHeight !== this.g.outputStatusHeight) {
                changeEvent.outputStatusHeight = true;
                somethingChanged = true;
            }
            if (newLayout.bodyMargin !== this.g.bodyMargin) {
                changeEvent.bodyMargin = true;
                somethingChanged = true;
            }
            if (newLayout.outputMetadataHeight !== this.g.outputMetadataHeight) {
                changeEvent.outputMetadataHeight = true;
                somethingChanged = true;
            }
            if (newLayout.totalHeight !== this.g.totalHeight) {
                changeEvent.totalHeight = true;
                somethingChanged = true;
            }
            if (somethingChanged) {
                this.g = newLayout;
                this.z(changeEvent);
            }
        }
        getHeight(lineHeight) {
            if (this.g.layoutState === notebookBrowser_1.CellLayoutState.Uninitialized) {
                const editorHeight = this.w(lineHeight);
                return this.u(editorHeight);
            }
            else {
                return this.g.totalHeight;
            }
        }
        u(editorHeight) {
            const totalHeight = editorHeight
                + this.g.editorMargin
                + this.g.metadataHeight
                + this.g.metadataStatusHeight
                + this.g.outputTotalHeight
                + this.g.outputStatusHeight
                + this.g.outputMetadataHeight
                + this.g.bodyMargin;
            return totalHeight;
        }
        w(lineHeight = 20) {
            const hasScrolling = false;
            const verticalScrollbarHeight = hasScrolling ? 12 : 0; // take zoom level into account
            // const editorPadding = this.viewContext.notebookOptions.computeEditorPadding(this.internalMetadata);
            const lineCount = Math.max(this.original?.textModel.textBuffer.getLineCount() ?? 1, this.modified?.textModel.textBuffer.getLineCount() ?? 1);
            return lineCount * lineHeight
                + 24 // Top padding
                + 12 // Bottom padding
                + verticalScrollbarHeight;
        }
        y(rawOutputHeight, metadataHeight) {
            if (this.outputFoldingState === PropertyFoldingState.Collapsed) {
                return 0;
            }
            if (this.renderOutput) {
                if (this.isOutputEmpty()) {
                    // single line;
                    return 24;
                }
                return this.getRichOutputTotalHeight() + metadataHeight;
            }
            else {
                return rawOutputHeight;
            }
        }
        z(state) {
            this.c.fire(state);
            this.editorEventDispatcher.emit([{ type: eventDispatcher_1.NotebookDiffViewEventType.CellLayoutChanged, source: this.g }]);
        }
        getComputedCellContainerWidth(layoutInfo, diffEditor, fullWidth) {
            if (fullWidth) {
                return layoutInfo.width - 2 * notebookDiffEditorBrowser_1.$yEb + (diffEditor ? diffEditorWidget_1.$6Z.ENTIRE_DIFF_OVERVIEW_WIDTH : 0) - 2;
            }
            return (layoutInfo.width - 2 * notebookDiffEditorBrowser_1.$yEb + (diffEditor ? diffEditorWidget_1.$6Z.ENTIRE_DIFF_OVERVIEW_WIDTH : 0)) / 2 - 18 - 2;
        }
        getOutputEditorViewState() {
            return this.n;
        }
        saveOutputEditorViewState(viewState) {
            this.n = viewState;
        }
        getMetadataEditorViewState() {
            return this.r;
        }
        saveMetadataEditorViewState(viewState) {
            this.r = viewState;
        }
        getSourceEditorViewState() {
            return this.m;
        }
        saveSpirceEditorViewState(viewState) {
            this.m = viewState;
        }
    }
    exports.$HEb = $HEb;
    class $IEb extends $HEb {
        get originalDocument() {
            return this.otherDocumentTextModel;
        }
        get modifiedDocument() {
            return this.mainDocumentTextModel;
        }
        constructor(mainDocumentTextModel, otherDocumentTextModel, original, modified, type, editorEventDispatcher, initData) {
            super(mainDocumentTextModel, original, modified, type, editorEventDispatcher, initData);
            this.otherDocumentTextModel = otherDocumentTextModel;
            this.original = original;
            this.modified = modified;
            this.type = type;
            this.metadataFoldingState = PropertyFoldingState.Collapsed;
            this.outputFoldingState = PropertyFoldingState.Collapsed;
            if (this.checkMetadataIfModified()) {
                this.metadataFoldingState = PropertyFoldingState.Expanded;
            }
            if (this.checkIfOutputsModified()) {
                this.outputFoldingState = PropertyFoldingState.Expanded;
            }
            this.B(this.original.onDidChangeOutputLayout(() => {
                this.t({ recomputeOutput: true });
            }));
            this.B(this.modified.onDidChangeOutputLayout(() => {
                this.t({ recomputeOutput: true });
            }));
            this.B(this.modified.textModel.onDidChangeContent(() => {
                if (mainDocumentTextModel.transientOptions.cellContentMetadata) {
                    const cellMetadataKeys = [...Object.keys(mainDocumentTextModel.transientOptions.cellContentMetadata)];
                    const modifiedMedataRaw = Object.assign({}, this.modified.metadata);
                    const originalCellMetadata = this.original.metadata;
                    for (const key of cellMetadataKeys) {
                        modifiedMedataRaw[key] = originalCellMetadata[key];
                    }
                    this.modified.textModel.metadata = modifiedMedataRaw;
                }
            }));
        }
        checkIfOutputsModified() {
            if (this.mainDocumentTextModel.transientOptions.transientOutputs) {
                return false;
            }
            const ret = outputsEqual(this.original?.outputs ?? [], this.modified?.outputs ?? []);
            if (ret === 0 /* OutputComparison.Unchanged */) {
                return false;
            }
            return {
                reason: ret === 1 /* OutputComparison.Metadata */ ? 'Output metadata is changed' : undefined,
                kind: ret
            };
        }
        checkMetadataIfModified() {
            const modified = (0, hash_1.$pi)($LEb(this.mainDocumentTextModel, this.original?.metadata || {}, this.original?.language)) !== (0, hash_1.$pi)($LEb(this.mainDocumentTextModel, this.modified?.metadata ?? {}, this.modified?.language));
            if (modified) {
                return { reason: undefined };
            }
            else {
                return false;
            }
        }
        updateOutputHeight(diffSide, index, height) {
            if (diffSide === notebookDiffEditorBrowser_1.DiffSide.Original) {
                this.original.updateOutputHeight(index, height);
            }
            else {
                this.modified.updateOutputHeight(index, height);
            }
        }
        getOutputOffsetInContainer(diffSide, index) {
            if (diffSide === notebookDiffEditorBrowser_1.DiffSide.Original) {
                return this.original.getOutputOffset(index);
            }
            else {
                return this.modified.getOutputOffset(index);
            }
        }
        getOutputOffsetInCell(diffSide, index) {
            const offsetInOutputsContainer = this.getOutputOffsetInContainer(diffSide, index);
            return this.g.editorHeight
                + this.g.editorMargin
                + this.g.metadataHeight
                + this.g.metadataStatusHeight
                + this.g.outputStatusHeight
                + this.g.bodyMargin / 2
                + offsetInOutputsContainer;
        }
        isOutputEmpty() {
            if (this.mainDocumentTextModel.transientOptions.transientOutputs) {
                return true;
            }
            if (this.checkIfOutputsModified()) {
                return false;
            }
            // outputs are not changed
            return (this.original?.outputs || []).length === 0;
        }
        getRichOutputTotalHeight() {
            return Math.max(this.original.getOutputTotalHeight(), this.modified.getOutputTotalHeight());
        }
        getNestedCellViewModel(diffSide) {
            return diffSide === notebookDiffEditorBrowser_1.DiffSide.Original ? this.original : this.modified;
        }
        getCellByUri(cellUri) {
            if (cellUri.toString() === this.original.uri.toString()) {
                return this.original;
            }
            else {
                return this.modified;
            }
        }
    }
    exports.$IEb = $IEb;
    class $JEb extends $HEb {
        get cellViewModel() {
            return this.type === 'insert' ? this.modified : this.original;
        }
        get originalDocument() {
            if (this.type === 'insert') {
                return this.otherDocumentTextModel;
            }
            else {
                return this.mainDocumentTextModel;
            }
        }
        get modifiedDocument() {
            if (this.type === 'insert') {
                return this.mainDocumentTextModel;
            }
            else {
                return this.otherDocumentTextModel;
            }
        }
        constructor(mainDocumentTextModel, otherDocumentTextModel, original, modified, type, editorEventDispatcher, initData) {
            super(mainDocumentTextModel, original, modified, type, editorEventDispatcher, initData);
            this.otherDocumentTextModel = otherDocumentTextModel;
            this.type = type;
            this.B(this.cellViewModel.onDidChangeOutputLayout(() => {
                this.t({ recomputeOutput: true });
            }));
        }
        getNestedCellViewModel(diffSide) {
            return this.type === 'insert' ? this.modified : this.original;
        }
        checkIfOutputsModified() {
            return false;
        }
        checkMetadataIfModified() {
            return false;
        }
        updateOutputHeight(diffSide, index, height) {
            this.cellViewModel?.updateOutputHeight(index, height);
        }
        getOutputOffsetInContainer(diffSide, index) {
            return this.cellViewModel.getOutputOffset(index);
        }
        getOutputOffsetInCell(diffSide, index) {
            const offsetInOutputsContainer = this.cellViewModel.getOutputOffset(index);
            return this.g.editorHeight
                + this.g.editorMargin
                + this.g.metadataHeight
                + this.g.metadataStatusHeight
                + this.g.outputStatusHeight
                + this.g.bodyMargin / 2
                + offsetInOutputsContainer;
        }
        isOutputEmpty() {
            if (this.mainDocumentTextModel.transientOptions.transientOutputs) {
                return true;
            }
            // outputs are not changed
            return (this.original?.outputs || this.modified?.outputs || []).length === 0;
        }
        getRichOutputTotalHeight() {
            return this.cellViewModel?.getOutputTotalHeight() ?? 0;
        }
        getCellByUri(cellUri) {
            return this.cellViewModel;
        }
    }
    exports.$JEb = $JEb;
    var OutputComparison;
    (function (OutputComparison) {
        OutputComparison[OutputComparison["Unchanged"] = 0] = "Unchanged";
        OutputComparison[OutputComparison["Metadata"] = 1] = "Metadata";
        OutputComparison[OutputComparison["Other"] = 2] = "Other";
    })(OutputComparison || (exports.OutputComparison = OutputComparison = {}));
    function $KEb(a, b) {
        if ((0, hash_1.$pi)(a.metadata) === (0, hash_1.$pi)(b.metadata)) {
            return 2 /* OutputComparison.Other */;
        }
        // metadata not equal
        for (let j = 0; j < a.outputs.length; j++) {
            const aOutputItem = a.outputs[j];
            const bOutputItem = b.outputs[j];
            if (aOutputItem.mime !== bOutputItem.mime) {
                return 2 /* OutputComparison.Other */;
            }
            if (aOutputItem.data.buffer.length !== bOutputItem.data.buffer.length) {
                return 2 /* OutputComparison.Other */;
            }
            for (let k = 0; k < aOutputItem.data.buffer.length; k++) {
                if (aOutputItem.data.buffer[k] !== bOutputItem.data.buffer[k]) {
                    return 2 /* OutputComparison.Other */;
                }
            }
        }
        return 1 /* OutputComparison.Metadata */;
    }
    exports.$KEb = $KEb;
    function outputsEqual(original, modified) {
        if (original.length !== modified.length) {
            return 2 /* OutputComparison.Other */;
        }
        const len = original.length;
        for (let i = 0; i < len; i++) {
            const a = original[i];
            const b = modified[i];
            if ((0, hash_1.$pi)(a.metadata) !== (0, hash_1.$pi)(b.metadata)) {
                return 1 /* OutputComparison.Metadata */;
            }
            if (a.outputs.length !== b.outputs.length) {
                return 2 /* OutputComparison.Other */;
            }
            for (let j = 0; j < a.outputs.length; j++) {
                const aOutputItem = a.outputs[j];
                const bOutputItem = b.outputs[j];
                if (aOutputItem.mime !== bOutputItem.mime) {
                    return 2 /* OutputComparison.Other */;
                }
                if (aOutputItem.data.buffer.length !== bOutputItem.data.buffer.length) {
                    return 2 /* OutputComparison.Other */;
                }
                for (let k = 0; k < aOutputItem.data.buffer.length; k++) {
                    if (aOutputItem.data.buffer[k] !== bOutputItem.data.buffer[k]) {
                        return 2 /* OutputComparison.Other */;
                    }
                }
            }
        }
        return 0 /* OutputComparison.Unchanged */;
    }
    function $LEb(documentTextModel, metadata, language) {
        let filteredMetadata = {};
        if (documentTextModel) {
            const transientCellMetadata = documentTextModel.transientOptions.transientCellMetadata;
            const keys = new Set([...Object.keys(metadata)]);
            for (const key of keys) {
                if (!(transientCellMetadata[key])) {
                    filteredMetadata[key] = metadata[key];
                }
            }
        }
        else {
            filteredMetadata = metadata;
        }
        const obj = {
            language,
            ...filteredMetadata
        };
        const metadataSource = (0, jsonFormatter_1.$yS)(obj, {});
        return metadataSource;
    }
    exports.$LEb = $LEb;
    function $MEb(outputs) {
        if (!outputs.length) {
            return null;
        }
        const first = outputs[0];
        const mime = first.mime;
        const sameStream = !outputs.find(op => op.mime !== mime);
        if (sameStream) {
            return outputs.map(opit => opit.data.toString()).join('');
        }
        else {
            return null;
        }
    }
    exports.$MEb = $MEb;
    function $NEb(outputs) {
        if (outputs.length === 1) {
            const streamOutputData = $MEb(outputs[0].outputs);
            if (streamOutputData) {
                return streamOutputData;
            }
        }
        return JSON.stringify(outputs.map(output => {
            return ({
                metadata: output.metadata,
                outputItems: output.outputs.map(opit => ({
                    mimeType: opit.mime,
                    data: opit.data.toString()
                }))
            });
        }), undefined, '\t');
    }
    exports.$NEb = $NEb;
});
//# sourceMappingURL=diffElementViewModel.js.map