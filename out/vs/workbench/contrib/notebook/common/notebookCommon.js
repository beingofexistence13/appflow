/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/glob", "vs/base/common/iterator", "vs/base/common/mime", "vs/base/common/network", "vs/base/common/path", "vs/base/common/platform", "vs/platform/contextkey/common/contextkey"], function (require, exports, buffer_1, glob, iterator_1, mime_1, network_1, path_1, platform_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MOVE_CURSOR_1_LINE_COMMAND = exports.compressOutputItemStreams = exports.isTextStreamMime = exports.NotebookWorkingCopyTypeIdentifier = exports.CellStatusbarAlignment = exports.NotebookSetting = exports.notebookDocumentFilterMatch = exports.isDocumentExcludePattern = exports.NotebookEditorPriority = exports.NOTEBOOK_EDITOR_CURSOR_LINE_BOUNDARY = exports.NOTEBOOK_EDITOR_CURSOR_BOUNDARY = exports.diff = exports.MimeTypeDisplayOrder = exports.CellUri = exports.CellEditType = exports.SelectionStateType = exports.NotebookCellsChangeType = exports.RendererMessagingSpec = exports.NotebookRendererMatch = exports.NotebookExecutionState = exports.NotebookCellExecutionState = exports.NotebookRunState = exports.RENDERER_NOT_AVAILABLE = exports.RENDERER_EQUIVALENT_EXTENSIONS = exports.ACCESSIBLE_NOTEBOOK_DISPLAY_ORDER = exports.NOTEBOOK_DISPLAY_ORDER = exports.CellKind = exports.INTERACTIVE_WINDOW_EDITOR_ID = exports.NOTEBOOK_DIFF_EDITOR_ID = exports.NOTEBOOK_EDITOR_ID = void 0;
    exports.NOTEBOOK_EDITOR_ID = 'workbench.editor.notebook';
    exports.NOTEBOOK_DIFF_EDITOR_ID = 'workbench.editor.notebookTextDiffEditor';
    exports.INTERACTIVE_WINDOW_EDITOR_ID = 'workbench.editor.interactive';
    var CellKind;
    (function (CellKind) {
        CellKind[CellKind["Markup"] = 1] = "Markup";
        CellKind[CellKind["Code"] = 2] = "Code";
    })(CellKind || (exports.CellKind = CellKind = {}));
    exports.NOTEBOOK_DISPLAY_ORDER = [
        'application/json',
        'application/javascript',
        'text/html',
        'image/svg+xml',
        mime_1.Mimes.latex,
        mime_1.Mimes.markdown,
        'image/png',
        'image/jpeg',
        mime_1.Mimes.text
    ];
    exports.ACCESSIBLE_NOTEBOOK_DISPLAY_ORDER = [
        mime_1.Mimes.latex,
        mime_1.Mimes.markdown,
        'application/json',
        'text/html',
        'image/svg+xml',
        'image/png',
        'image/jpeg',
        mime_1.Mimes.text,
    ];
    /**
     * A mapping of extension IDs who contain renderers, to notebook ids who they
     * should be treated as the same in the renderer selection logic. This is used
     * to prefer the 1st party Jupyter renderers even though they're in a separate
     * extension, for instance. See #136247.
     */
    exports.RENDERER_EQUIVALENT_EXTENSIONS = new Map([
        ['ms-toolsai.jupyter', new Set(['jupyter-notebook', 'interactive'])],
        ['ms-toolsai.jupyter-renderers', new Set(['jupyter-notebook', 'interactive'])],
    ]);
    exports.RENDERER_NOT_AVAILABLE = '_notAvailable';
    var NotebookRunState;
    (function (NotebookRunState) {
        NotebookRunState[NotebookRunState["Running"] = 1] = "Running";
        NotebookRunState[NotebookRunState["Idle"] = 2] = "Idle";
    })(NotebookRunState || (exports.NotebookRunState = NotebookRunState = {}));
    var NotebookCellExecutionState;
    (function (NotebookCellExecutionState) {
        NotebookCellExecutionState[NotebookCellExecutionState["Unconfirmed"] = 1] = "Unconfirmed";
        NotebookCellExecutionState[NotebookCellExecutionState["Pending"] = 2] = "Pending";
        NotebookCellExecutionState[NotebookCellExecutionState["Executing"] = 3] = "Executing";
    })(NotebookCellExecutionState || (exports.NotebookCellExecutionState = NotebookCellExecutionState = {}));
    var NotebookExecutionState;
    (function (NotebookExecutionState) {
        NotebookExecutionState[NotebookExecutionState["Unconfirmed"] = 1] = "Unconfirmed";
        NotebookExecutionState[NotebookExecutionState["Pending"] = 2] = "Pending";
        NotebookExecutionState[NotebookExecutionState["Executing"] = 3] = "Executing";
    })(NotebookExecutionState || (exports.NotebookExecutionState = NotebookExecutionState = {}));
    /** Note: enum values are used for sorting */
    var NotebookRendererMatch;
    (function (NotebookRendererMatch) {
        /** Renderer has a hard dependency on an available kernel */
        NotebookRendererMatch[NotebookRendererMatch["WithHardKernelDependency"] = 0] = "WithHardKernelDependency";
        /** Renderer works better with an available kernel */
        NotebookRendererMatch[NotebookRendererMatch["WithOptionalKernelDependency"] = 1] = "WithOptionalKernelDependency";
        /** Renderer is kernel-agnostic */
        NotebookRendererMatch[NotebookRendererMatch["Pure"] = 2] = "Pure";
        /** Renderer is for a different mimeType or has a hard dependency which is unsatisfied */
        NotebookRendererMatch[NotebookRendererMatch["Never"] = 3] = "Never";
    })(NotebookRendererMatch || (exports.NotebookRendererMatch = NotebookRendererMatch = {}));
    /**
     * Renderer messaging requirement. While this allows for 'optional' messaging,
     * VS Code effectively treats it the same as true right now. "Partial
     * activation" of extensions is a very tricky problem, which could allow
     * solving this. But for now, optional is mostly only honored for aznb.
     */
    var RendererMessagingSpec;
    (function (RendererMessagingSpec) {
        RendererMessagingSpec["Always"] = "always";
        RendererMessagingSpec["Never"] = "never";
        RendererMessagingSpec["Optional"] = "optional";
    })(RendererMessagingSpec || (exports.RendererMessagingSpec = RendererMessagingSpec = {}));
    var NotebookCellsChangeType;
    (function (NotebookCellsChangeType) {
        NotebookCellsChangeType[NotebookCellsChangeType["ModelChange"] = 1] = "ModelChange";
        NotebookCellsChangeType[NotebookCellsChangeType["Move"] = 2] = "Move";
        NotebookCellsChangeType[NotebookCellsChangeType["ChangeCellLanguage"] = 5] = "ChangeCellLanguage";
        NotebookCellsChangeType[NotebookCellsChangeType["Initialize"] = 6] = "Initialize";
        NotebookCellsChangeType[NotebookCellsChangeType["ChangeCellMetadata"] = 7] = "ChangeCellMetadata";
        NotebookCellsChangeType[NotebookCellsChangeType["Output"] = 8] = "Output";
        NotebookCellsChangeType[NotebookCellsChangeType["OutputItem"] = 9] = "OutputItem";
        NotebookCellsChangeType[NotebookCellsChangeType["ChangeCellContent"] = 10] = "ChangeCellContent";
        NotebookCellsChangeType[NotebookCellsChangeType["ChangeDocumentMetadata"] = 11] = "ChangeDocumentMetadata";
        NotebookCellsChangeType[NotebookCellsChangeType["ChangeCellInternalMetadata"] = 12] = "ChangeCellInternalMetadata";
        NotebookCellsChangeType[NotebookCellsChangeType["ChangeCellMime"] = 13] = "ChangeCellMime";
        NotebookCellsChangeType[NotebookCellsChangeType["Unknown"] = 100] = "Unknown";
    })(NotebookCellsChangeType || (exports.NotebookCellsChangeType = NotebookCellsChangeType = {}));
    var SelectionStateType;
    (function (SelectionStateType) {
        SelectionStateType[SelectionStateType["Handle"] = 0] = "Handle";
        SelectionStateType[SelectionStateType["Index"] = 1] = "Index";
    })(SelectionStateType || (exports.SelectionStateType = SelectionStateType = {}));
    var CellEditType;
    (function (CellEditType) {
        CellEditType[CellEditType["Replace"] = 1] = "Replace";
        CellEditType[CellEditType["Output"] = 2] = "Output";
        CellEditType[CellEditType["Metadata"] = 3] = "Metadata";
        CellEditType[CellEditType["CellLanguage"] = 4] = "CellLanguage";
        CellEditType[CellEditType["DocumentMetadata"] = 5] = "DocumentMetadata";
        CellEditType[CellEditType["Move"] = 6] = "Move";
        CellEditType[CellEditType["OutputItems"] = 7] = "OutputItems";
        CellEditType[CellEditType["PartialMetadata"] = 8] = "PartialMetadata";
        CellEditType[CellEditType["PartialInternalMetadata"] = 9] = "PartialInternalMetadata";
    })(CellEditType || (exports.CellEditType = CellEditType = {}));
    var CellUri;
    (function (CellUri) {
        CellUri.scheme = network_1.Schemas.vscodeNotebookCell;
        const _lengths = ['W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f'];
        const _padRegexp = new RegExp(`^[${_lengths.join('')}]+`);
        const _radix = 7;
        function generate(notebook, handle) {
            const s = handle.toString(_radix);
            const p = s.length < _lengths.length ? _lengths[s.length - 1] : 'z';
            const fragment = `${p}${s}s${(0, buffer_1.encodeBase64)(buffer_1.VSBuffer.fromString(notebook.scheme), true, true)}`;
            return notebook.with({ scheme: CellUri.scheme, fragment });
        }
        CellUri.generate = generate;
        function parse(cell) {
            if (cell.scheme !== CellUri.scheme) {
                return undefined;
            }
            const idx = cell.fragment.indexOf('s');
            if (idx < 0) {
                return undefined;
            }
            const handle = parseInt(cell.fragment.substring(0, idx).replace(_padRegexp, ''), _radix);
            const _scheme = (0, buffer_1.decodeBase64)(cell.fragment.substring(idx + 1)).toString();
            if (isNaN(handle)) {
                return undefined;
            }
            return {
                handle,
                notebook: cell.with({ scheme: _scheme, fragment: null })
            };
        }
        CellUri.parse = parse;
        function generateCellOutputUri(notebook, outputId) {
            return notebook.with({
                scheme: network_1.Schemas.vscodeNotebookCellOutput,
                fragment: `op${outputId ?? ''},${notebook.scheme !== network_1.Schemas.file ? notebook.scheme : ''}`
            });
        }
        CellUri.generateCellOutputUri = generateCellOutputUri;
        function parseCellOutputUri(uri) {
            if (uri.scheme !== network_1.Schemas.vscodeNotebookCellOutput) {
                return;
            }
            const match = /^op([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})?\,(.*)$/i.exec(uri.fragment);
            if (!match) {
                return undefined;
            }
            const outputId = (match[1] && match[1] !== '') ? match[1] : undefined;
            const scheme = match[2];
            return {
                outputId,
                notebook: uri.with({
                    scheme: scheme || network_1.Schemas.file,
                    fragment: null
                })
            };
        }
        CellUri.parseCellOutputUri = parseCellOutputUri;
        function generateCellPropertyUri(notebook, handle, scheme) {
            return CellUri.generate(notebook, handle).with({ scheme: scheme });
        }
        CellUri.generateCellPropertyUri = generateCellPropertyUri;
        function parseCellPropertyUri(uri, propertyScheme) {
            if (uri.scheme !== propertyScheme) {
                return undefined;
            }
            return CellUri.parse(uri.with({ scheme: CellUri.scheme }));
        }
        CellUri.parseCellPropertyUri = parseCellPropertyUri;
    })(CellUri || (exports.CellUri = CellUri = {}));
    const normalizeSlashes = (str) => platform_1.isWindows ? str.replace(/\//g, '\\') : str;
    class MimeTypeDisplayOrder {
        constructor(initialValue = [], defaultOrder = exports.NOTEBOOK_DISPLAY_ORDER) {
            this.defaultOrder = defaultOrder;
            this.order = [...new Set(initialValue)].map(pattern => ({
                pattern,
                matches: glob.parse(normalizeSlashes(pattern))
            }));
        }
        /**
         * Returns a sorted array of the input mimetypes.
         */
        sort(mimetypes) {
            const remaining = new Map(iterator_1.Iterable.map(mimetypes, m => [m, normalizeSlashes(m)]));
            let sorted = [];
            for (const { matches } of this.order) {
                for (const [original, normalized] of remaining) {
                    if (matches(normalized)) {
                        sorted.push(original);
                        remaining.delete(original);
                        break;
                    }
                }
            }
            if (remaining.size) {
                sorted = sorted.concat([...remaining.keys()].sort((a, b) => this.defaultOrder.indexOf(a) - this.defaultOrder.indexOf(b)));
            }
            return sorted;
        }
        /**
         * Records that the user selected the given mimetype over the other
         * possible mimetypes, prioritizing it for future reference.
         */
        prioritize(chosenMimetype, otherMimetypes) {
            const chosenIndex = this.findIndex(chosenMimetype);
            if (chosenIndex === -1) {
                // always first, nothing more to do
                this.order.unshift({ pattern: chosenMimetype, matches: glob.parse(normalizeSlashes(chosenMimetype)) });
                return;
            }
            // Get the other mimetypes that are before the chosenMimetype. Then, move
            // them after it, retaining order.
            const uniqueIndicies = new Set(otherMimetypes.map(m => this.findIndex(m, chosenIndex)));
            uniqueIndicies.delete(-1);
            const otherIndices = Array.from(uniqueIndicies).sort();
            this.order.splice(chosenIndex + 1, 0, ...otherIndices.map(i => this.order[i]));
            for (let oi = otherIndices.length - 1; oi >= 0; oi--) {
                this.order.splice(otherIndices[oi], 1);
            }
        }
        /**
         * Gets an array of in-order mimetype preferences.
         */
        toArray() {
            return this.order.map(o => o.pattern);
        }
        findIndex(mimeType, maxIndex = this.order.length) {
            const normalized = normalizeSlashes(mimeType);
            for (let i = 0; i < maxIndex; i++) {
                if (this.order[i].matches(normalized)) {
                    return i;
                }
            }
            return -1;
        }
    }
    exports.MimeTypeDisplayOrder = MimeTypeDisplayOrder;
    function diff(before, after, contains, equal = (a, b) => a === b) {
        const result = [];
        function pushSplice(start, deleteCount, toInsert) {
            if (deleteCount === 0 && toInsert.length === 0) {
                return;
            }
            const latest = result[result.length - 1];
            if (latest && latest.start + latest.deleteCount === start) {
                latest.deleteCount += deleteCount;
                latest.toInsert.push(...toInsert);
            }
            else {
                result.push({ start, deleteCount, toInsert });
            }
        }
        let beforeIdx = 0;
        let afterIdx = 0;
        while (true) {
            if (beforeIdx === before.length) {
                pushSplice(beforeIdx, 0, after.slice(afterIdx));
                break;
            }
            if (afterIdx === after.length) {
                pushSplice(beforeIdx, before.length - beforeIdx, []);
                break;
            }
            const beforeElement = before[beforeIdx];
            const afterElement = after[afterIdx];
            if (equal(beforeElement, afterElement)) {
                // equal
                beforeIdx += 1;
                afterIdx += 1;
                continue;
            }
            if (contains(afterElement)) {
                // `afterElement` exists before, which means some elements before `afterElement` are deleted
                pushSplice(beforeIdx, 1, []);
                beforeIdx += 1;
            }
            else {
                // `afterElement` added
                pushSplice(beforeIdx, 0, [afterElement]);
                afterIdx += 1;
            }
        }
        return result;
    }
    exports.diff = diff;
    exports.NOTEBOOK_EDITOR_CURSOR_BOUNDARY = new contextkey_1.RawContextKey('notebookEditorCursorAtBoundary', 'none');
    exports.NOTEBOOK_EDITOR_CURSOR_LINE_BOUNDARY = new contextkey_1.RawContextKey('notebookEditorCursorAtLineBoundary', 'none');
    var NotebookEditorPriority;
    (function (NotebookEditorPriority) {
        NotebookEditorPriority["default"] = "default";
        NotebookEditorPriority["option"] = "option";
    })(NotebookEditorPriority || (exports.NotebookEditorPriority = NotebookEditorPriority = {}));
    //TODO@rebornix test
    function isDocumentExcludePattern(filenamePattern) {
        const arg = filenamePattern;
        if ((typeof arg.include === 'string' || glob.isRelativePattern(arg.include))
            && (typeof arg.exclude === 'string' || glob.isRelativePattern(arg.exclude))) {
            return true;
        }
        return false;
    }
    exports.isDocumentExcludePattern = isDocumentExcludePattern;
    function notebookDocumentFilterMatch(filter, viewType, resource) {
        if (Array.isArray(filter.viewType) && filter.viewType.indexOf(viewType) >= 0) {
            return true;
        }
        if (filter.viewType === viewType) {
            return true;
        }
        if (filter.filenamePattern) {
            const filenamePattern = isDocumentExcludePattern(filter.filenamePattern) ? filter.filenamePattern.include : filter.filenamePattern;
            const excludeFilenamePattern = isDocumentExcludePattern(filter.filenamePattern) ? filter.filenamePattern.exclude : undefined;
            if (glob.match(filenamePattern, (0, path_1.basename)(resource.fsPath).toLowerCase())) {
                if (excludeFilenamePattern) {
                    if (glob.match(excludeFilenamePattern, (0, path_1.basename)(resource.fsPath).toLowerCase())) {
                        // should exclude
                        return false;
                    }
                }
                return true;
            }
        }
        return false;
    }
    exports.notebookDocumentFilterMatch = notebookDocumentFilterMatch;
    exports.NotebookSetting = {
        displayOrder: 'notebook.displayOrder',
        cellToolbarLocation: 'notebook.cellToolbarLocation',
        cellToolbarVisibility: 'notebook.cellToolbarVisibility',
        showCellStatusBar: 'notebook.showCellStatusBar',
        textDiffEditorPreview: 'notebook.diff.enablePreview',
        diffOverviewRuler: 'notebook.diff.overviewRuler',
        experimentalInsertToolbarAlignment: 'notebook.experimental.insertToolbarAlignment',
        compactView: 'notebook.compactView',
        focusIndicator: 'notebook.cellFocusIndicator',
        insertToolbarLocation: 'notebook.insertToolbarLocation',
        globalToolbar: 'notebook.globalToolbar',
        stickyScroll: 'notebook.stickyScroll.enabled',
        undoRedoPerCell: 'notebook.undoRedoPerCell',
        consolidatedOutputButton: 'notebook.consolidatedOutputButton',
        showFoldingControls: 'notebook.showFoldingControls',
        dragAndDropEnabled: 'notebook.dragAndDropEnabled',
        cellEditorOptionsCustomizations: 'notebook.editorOptionsCustomizations',
        consolidatedRunButton: 'notebook.consolidatedRunButton',
        openGettingStarted: 'notebook.experimental.openGettingStarted',
        globalToolbarShowLabel: 'notebook.globalToolbarShowLabel',
        markupFontSize: 'notebook.markup.fontSize',
        interactiveWindowCollapseCodeCells: 'interactiveWindow.collapseCellInputCode',
        outputScrollingDeprecated: 'notebook.experimental.outputScrolling',
        outputScrolling: 'notebook.output.scrolling',
        textOutputLineLimit: 'notebook.output.textLineLimit',
        formatOnSave: 'notebook.formatOnSave.enabled',
        formatOnCellExecution: 'notebook.formatOnCellExecution',
        codeActionsOnSave: 'notebook.codeActionsOnSave',
        outputWordWrap: 'notebook.output.wordWrap',
        outputLineHeightDeprecated: 'notebook.outputLineHeight',
        outputLineHeight: 'notebook.output.lineHeight',
        outputFontSizeDeprecated: 'notebook.outputFontSize',
        outputFontSize: 'notebook.output.fontSize',
        outputFontFamilyDeprecated: 'notebook.outputFontFamily',
        outputFontFamily: 'notebook.output.fontFamily',
        findScope: 'notebook.find.scope',
        logging: 'notebook.logging',
        confirmDeleteRunningCell: 'notebook.confirmDeleteRunningCell',
        remoteSaving: 'notebook.experimental.remoteSave',
        gotoSymbolsAllSymbols: 'notebook.gotoSymbols.showAllSymbols',
        cellExecutionScroll: 'notebook.revealNextOnExecuteBehavior'
    };
    var CellStatusbarAlignment;
    (function (CellStatusbarAlignment) {
        CellStatusbarAlignment[CellStatusbarAlignment["Left"] = 1] = "Left";
        CellStatusbarAlignment[CellStatusbarAlignment["Right"] = 2] = "Right";
    })(CellStatusbarAlignment || (exports.CellStatusbarAlignment = CellStatusbarAlignment = {}));
    class NotebookWorkingCopyTypeIdentifier {
        static { this._prefix = 'notebook/'; }
        static create(viewType) {
            return `${NotebookWorkingCopyTypeIdentifier._prefix}${viewType}`;
        }
        static parse(candidate) {
            if (candidate.startsWith(NotebookWorkingCopyTypeIdentifier._prefix)) {
                return candidate.substring(NotebookWorkingCopyTypeIdentifier._prefix.length);
            }
            return undefined;
        }
    }
    exports.NotebookWorkingCopyTypeIdentifier = NotebookWorkingCopyTypeIdentifier;
    /**
     * Whether the provided mime type is a text stream like `stdout`, `stderr`.
     */
    function isTextStreamMime(mimeType) {
        return ['application/vnd.code.notebook.stdout', 'application/vnd.code.notebook.stderr'].includes(mimeType);
    }
    exports.isTextStreamMime = isTextStreamMime;
    const textDecoder = new TextDecoder();
    /**
     * Given a stream of individual stdout outputs, this function will return the compressed lines, escaping some of the common terminal escape codes.
     * E.g. some terminal escape codes would result in the previous line getting cleared, such if we had 3 lines and
     * last line contained such a code, then the result string would be just the first two lines.
     * @returns a single VSBuffer with the concatenated and compressed data, and whether any compression was done.
     */
    function compressOutputItemStreams(outputs) {
        const buffers = [];
        let startAppending = false;
        // Pick the first set of outputs with the same mime type.
        for (const output of outputs) {
            if ((buffers.length === 0 || startAppending)) {
                buffers.push(output);
                startAppending = true;
            }
        }
        let didCompression = compressStreamBuffer(buffers);
        const concatenated = buffer_1.VSBuffer.concat(buffers.map(buffer => buffer_1.VSBuffer.wrap(buffer)));
        const data = formatStreamText(concatenated);
        didCompression = didCompression || data.byteLength !== concatenated.byteLength;
        return { data, didCompression };
    }
    exports.compressOutputItemStreams = compressOutputItemStreams;
    exports.MOVE_CURSOR_1_LINE_COMMAND = `${String.fromCharCode(27)}[A`;
    const MOVE_CURSOR_1_LINE_COMMAND_BYTES = exports.MOVE_CURSOR_1_LINE_COMMAND.split('').map(c => c.charCodeAt(0));
    const LINE_FEED = 10;
    function compressStreamBuffer(streams) {
        let didCompress = false;
        streams.forEach((stream, index) => {
            if (index === 0 || stream.length < exports.MOVE_CURSOR_1_LINE_COMMAND.length) {
                return;
            }
            const previousStream = streams[index - 1];
            // Remove the previous line if required.
            const command = stream.subarray(0, exports.MOVE_CURSOR_1_LINE_COMMAND.length);
            if (command[0] === MOVE_CURSOR_1_LINE_COMMAND_BYTES[0] && command[1] === MOVE_CURSOR_1_LINE_COMMAND_BYTES[1] && command[2] === MOVE_CURSOR_1_LINE_COMMAND_BYTES[2]) {
                const lastIndexOfLineFeed = previousStream.lastIndexOf(LINE_FEED);
                if (lastIndexOfLineFeed === -1) {
                    return;
                }
                didCompress = true;
                streams[index - 1] = previousStream.subarray(0, lastIndexOfLineFeed);
                streams[index] = stream.subarray(exports.MOVE_CURSOR_1_LINE_COMMAND.length);
            }
        });
        return didCompress;
    }
    /**
     * Took this from jupyter/notebook
     * https://github.com/jupyter/notebook/blob/b8b66332e2023e83d2ee04f83d8814f567e01a4e/notebook/static/base/js/utils.js
     * Remove characters that are overridden by backspace characters
     */
    function fixBackspace(txt) {
        let tmp = txt;
        do {
            txt = tmp;
            // Cancel out anything-but-newline followed by backspace
            tmp = txt.replace(/[^\n]\x08/gm, '');
        } while (tmp.length < txt.length);
        return txt;
    }
    /**
     * Remove chunks that should be overridden by the effect of carriage return characters
     * From https://github.com/jupyter/notebook/blob/master/notebook/static/base/js/utils.js
     */
    function fixCarriageReturn(txt) {
        txt = txt.replace(/\r+\n/gm, '\n'); // \r followed by \n --> newline
        while (txt.search(/\r[^$]/g) > -1) {
            const base = txt.match(/^(.*)\r+/m)[1];
            let insert = txt.match(/\r+(.*)$/m)[1];
            insert = insert + base.slice(insert.length, base.length);
            txt = txt.replace(/\r+.*$/m, '\r').replace(/^.*\r/m, insert);
        }
        return txt;
    }
    const BACKSPACE_CHARACTER = '\b'.charCodeAt(0);
    const CARRIAGE_RETURN_CHARACTER = '\r'.charCodeAt(0);
    function formatStreamText(buffer) {
        // We have special handling for backspace and carriage return characters.
        // Don't unnecessary decode the bytes if we don't need to perform any processing.
        if (!buffer.buffer.includes(BACKSPACE_CHARACTER) && !buffer.buffer.includes(CARRIAGE_RETURN_CHARACTER)) {
            return buffer;
        }
        // Do the same thing jupyter is doing
        return buffer_1.VSBuffer.fromString(fixCarriageReturn(fixBackspace(textDecoder.decode(buffer.buffer))));
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tDb21tb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9jb21tb24vbm90ZWJvb2tDb21tb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBOEJuRixRQUFBLGtCQUFrQixHQUFHLDJCQUEyQixDQUFDO0lBQ2pELFFBQUEsdUJBQXVCLEdBQUcseUNBQXlDLENBQUM7SUFDcEUsUUFBQSw0QkFBNEIsR0FBRyw4QkFBOEIsQ0FBQztJQUczRSxJQUFZLFFBR1g7SUFIRCxXQUFZLFFBQVE7UUFDbkIsMkNBQVUsQ0FBQTtRQUNWLHVDQUFRLENBQUE7SUFDVCxDQUFDLEVBSFcsUUFBUSx3QkFBUixRQUFRLFFBR25CO0lBRVksUUFBQSxzQkFBc0IsR0FBc0I7UUFDeEQsa0JBQWtCO1FBQ2xCLHdCQUF3QjtRQUN4QixXQUFXO1FBQ1gsZUFBZTtRQUNmLFlBQUssQ0FBQyxLQUFLO1FBQ1gsWUFBSyxDQUFDLFFBQVE7UUFDZCxXQUFXO1FBQ1gsWUFBWTtRQUNaLFlBQUssQ0FBQyxJQUFJO0tBQ1YsQ0FBQztJQUVXLFFBQUEsaUNBQWlDLEdBQXNCO1FBQ25FLFlBQUssQ0FBQyxLQUFLO1FBQ1gsWUFBSyxDQUFDLFFBQVE7UUFDZCxrQkFBa0I7UUFDbEIsV0FBVztRQUNYLGVBQWU7UUFDZixXQUFXO1FBQ1gsWUFBWTtRQUNaLFlBQUssQ0FBQyxJQUFJO0tBQ1YsQ0FBQztJQUVGOzs7OztPQUtHO0lBQ1UsUUFBQSw4QkFBOEIsR0FBNkMsSUFBSSxHQUFHLENBQUM7UUFDL0YsQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLGtCQUFrQixFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUM7UUFDcEUsQ0FBQyw4QkFBOEIsRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLGtCQUFrQixFQUFFLGFBQWEsQ0FB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