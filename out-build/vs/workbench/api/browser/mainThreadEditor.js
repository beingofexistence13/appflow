/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/common/config/editorOptions", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/contrib/snippet/browser/snippetController2", "vs/workbench/api/common/extHost.protocol", "vs/base/common/arrays", "vs/editor/contrib/editorState/browser/editorState", "vs/editor/contrib/snippet/browser/snippetParser"], function (require, exports, event_1, lifecycle_1, editorOptions_1, range_1, selection_1, snippetController2_1, extHost_protocol_1, arrays_1, editorState_1, snippetParser_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Ocb = exports.$Ncb = void 0;
    class $Ncb {
        static readFromEditor(previousProperties, model, codeEditor) {
            const selections = $Ncb.c(previousProperties, codeEditor);
            const options = $Ncb.d(previousProperties, model, codeEditor);
            const visibleRanges = $Ncb.f(previousProperties, codeEditor);
            return new $Ncb(selections, options, visibleRanges);
        }
        static c(previousProperties, codeEditor) {
            let result = null;
            if (codeEditor) {
                result = codeEditor.getSelections();
            }
            if (!result && previousProperties) {
                result = previousProperties.selections;
            }
            if (!result) {
                result = [new selection_1.$ms(1, 1, 1, 1)];
            }
            return result;
        }
        static d(previousProperties, model, codeEditor) {
            if (model.isDisposed()) {
                if (previousProperties) {
                    // shutdown time
                    return previousProperties.options;
                }
                else {
                    throw new Error('No valid properties');
                }
            }
            let cursorStyle;
            let lineNumbers;
            if (codeEditor) {
                const options = codeEditor.getOptions();
                const lineNumbersOpts = options.get(67 /* EditorOption.lineNumbers */);
                cursorStyle = options.get(28 /* EditorOption.cursorStyle */);
                lineNumbers = lineNumbersOpts.renderType;
            }
            else if (previousProperties) {
                cursorStyle = previousProperties.options.cursorStyle;
                lineNumbers = previousProperties.options.lineNumbers;
            }
            else {
                cursorStyle = editorOptions_1.TextEditorCursorStyle.Line;
                lineNumbers = 1 /* RenderLineNumbersType.On */;
            }
            const modelOptions = model.getOptions();
            return {
                insertSpaces: modelOptions.insertSpaces,
                tabSize: modelOptions.tabSize,
                indentSize: modelOptions.indentSize,
                cursorStyle: cursorStyle,
                lineNumbers: lineNumbers
            };
        }
        static f(previousProperties, codeEditor) {
            if (codeEditor) {
                return codeEditor.getVisibleRanges();
            }
            return [];
        }
        constructor(selections, options, visibleRanges) {
            this.selections = selections;
            this.options = options;
            this.visibleRanges = visibleRanges;
        }
        generateDelta(oldProps, selectionChangeSource) {
            const delta = {
                options: null,
                selections: null,
                visibleRanges: null
            };
            if (!oldProps || !$Ncb.g(oldProps.selections, this.selections)) {
                delta.selections = {
                    selections: this.selections,
                    source: selectionChangeSource ?? undefined,
                };
            }
            if (!oldProps || !$Ncb.j(oldProps.options, this.options)) {
                delta.options = this.options;
            }
            if (!oldProps || !$Ncb.h(oldProps.visibleRanges, this.visibleRanges)) {
                delta.visibleRanges = this.visibleRanges;
            }
            if (delta.selections || delta.options || delta.visibleRanges) {
                // something changed
                return delta;
            }
            // nothing changed
            return null;
        }
        static g(a, b) {
            return (0, arrays_1.$sb)(a, b, (aValue, bValue) => aValue.equalsSelection(bValue));
        }
        static h(a, b) {
            return (0, arrays_1.$sb)(a, b, (aValue, bValue) => aValue.equalsRange(bValue));
        }
        static j(a, b) {
            if (a && !b || !a && b) {
                return false;
            }
            if (!a && !b) {
                return true;
            }
            return (a.tabSize === b.tabSize
                && a.indentSize === b.indentSize
                && a.insertSpaces === b.insertSpaces
                && a.cursorStyle === b.cursorStyle
                && a.lineNumbers === b.lineNumbers);
        }
    }
    exports.$Ncb = $Ncb;
    /**
     * Text Editor that is permanently bound to the same model.
     * It can be bound or not to a CodeEditor.
     */
    class $Ocb {
        constructor(id, model, codeEditor, focusTracker, mainThreadDocuments, modelService, clipboardService) {
            this.j = new lifecycle_1.$jc();
            this.m = new lifecycle_1.$jc();
            this.c = id;
            this.d = model;
            this.k = null;
            this.n = null;
            this.l = focusTracker;
            this.f = mainThreadDocuments;
            this.g = modelService;
            this.h = clipboardService;
            this.o = new event_1.$fd();
            this.j.add(this.d.onDidChangeOptions((e) => {
                this.p(null);
            }));
            this.setCodeEditor(codeEditor);
            this.p(null);
        }
        dispose() {
            this.j.dispose();
            this.k = null;
            this.m.dispose();
        }
        p(selectionChangeSource) {
            this.q($Ncb.readFromEditor(this.n, this.d, this.k), selectionChangeSource);
        }
        q(newProperties, selectionChangeSource) {
            const delta = newProperties.generateDelta(this.n, selectionChangeSource);
            this.n = newProperties;
            if (delta) {
                this.o.fire(delta);
            }
        }
        getId() {
            return this.c;
        }
        getModel() {
            return this.d;
        }
        getCodeEditor() {
            return this.k;
        }
        hasCodeEditor(codeEditor) {
            return (this.k === codeEditor);
        }
        setCodeEditor(codeEditor) {
            if (this.hasCodeEditor(codeEditor)) {
                // Nothing to do...
                return;
            }
            this.m.clear();
            this.k = codeEditor;
            if (this.k) {
                // Catch early the case that this code editor gets a different model set and disassociate from this model
                this.m.add(this.k.onDidChangeModel(() => {
                    this.setCodeEditor(null);
                }));
                this.m.add(this.k.onDidFocusEditorWidget(() => {
                    this.l.onGainedFocus();
                }));
                this.m.add(this.k.onDidBlurEditorWidget(() => {
                    this.l.onLostFocus();
                }));
                let nextSelectionChangeSource = null;
                this.m.add(this.f.onIsCaughtUpWithContentChanges((uri) => {
                    if (uri.toString() === this.d.uri.toString()) {
                        const selectionChangeSource = nextSelectionChangeSource;
                        nextSelectionChangeSource = null;
                        this.p(selectionChangeSource);
                    }
                }));
                const isValidCodeEditor = () => {
                    // Due to event timings, it is possible that there is a model change event not yet delivered to us.
                    // > e.g. a model change event is emitted to a listener which then decides to update editor options
                    // > In this case the editor configuration change event reaches us first.
                    // So simply check that the model is still attached to this code editor
                    return (this.k && this.k.getModel() === this.d);
                };
                const updateProperties = (selectionChangeSource) => {
                    // Some editor events get delivered faster than model content changes. This is
                    // problematic, as this leads to editor properties reaching the extension host
                    // too soon, before the model content change that was the root cause.
                    //
                    // If this case is identified, then let's update editor properties on the next model
                    // content change instead.
                    if (this.f.isCaughtUpWithContentChanges(this.d.uri)) {
                        nextSelectionChangeSource = null;
                        this.p(selectionChangeSource);
                    }
                    else {
                        // update editor properties on the next model content change
                        nextSelectionChangeSource = selectionChangeSource;
                    }
                };
                this.m.add(this.k.onDidChangeCursorSelection((e) => {
                    // selection
                    if (!isValidCodeEditor()) {
                        return;
                    }
                    updateProperties(e.source);
                }));
                this.m.add(this.k.onDidChangeConfiguration((e) => {
                    // options
                    if (!isValidCodeEditor()) {
                        return;
                    }
                    updateProperties(null);
                }));
                this.m.add(this.k.onDidLayoutChange(() => {
                    // visibleRanges
                    if (!isValidCodeEditor()) {
                        return;
                    }
                    updateProperties(null);
                }));
                this.m.add(this.k.onDidScrollChange(() => {
                    // visibleRanges
                    if (!isValidCodeEditor()) {
                        return;
                    }
                    updateProperties(null);
                }));
                this.p(null);
            }
        }
        isVisible() {
            return !!this.k;
        }
        getProperties() {
            return this.n;
        }
        get onPropertiesChanged() {
            return this.o.event;
        }
        setSelections(selections) {
            if (this.k) {
                this.k.setSelections(selections);
                return;
            }
            const newSelections = selections.map(selection_1.$ms.liftSelection);
            this.q(new $Ncb(newSelections, this.n.options, this.n.visibleRanges), null);
        }
        s(newConfiguration) {
            const creationOpts = this.g.getCreationOptions(this.d.getLanguageId(), this.d.uri, this.d.isForSimpleWidget);
            if (newConfiguration.tabSize === 'auto' || newConfiguration.insertSpaces === 'auto') {
                // one of the options was set to 'auto' => detect indentation
                let insertSpaces = creationOpts.insertSpaces;
                let tabSize = creationOpts.tabSize;
                if (newConfiguration.insertSpaces !== 'auto' && typeof newConfiguration.insertSpaces !== 'undefined') {
                    insertSpaces = newConfiguration.insertSpaces;
                }
                if (newConfiguration.tabSize !== 'auto' && typeof newConfiguration.tabSize !== 'undefined') {
                    tabSize = newConfiguration.tabSize;
                }
                this.d.detectIndentation(insertSpaces, tabSize);
                return;
            }
            const newOpts = {};
            if (typeof newConfiguration.insertSpaces !== 'undefined') {
                newOpts.insertSpaces = newConfiguration.insertSpaces;
            }
            if (typeof newConfiguration.tabSize !== 'undefined') {
                newOpts.tabSize = newConfiguration.tabSize;
            }
            if (typeof newConfiguration.indentSize !== 'undefined') {
                newOpts.indentSize = newConfiguration.indentSize;
            }
            this.d.updateOptions(newOpts);
        }
        setConfiguration(newConfiguration) {
            this.s(newConfiguration);
            if (!this.k) {
                return;
            }
            if (newConfiguration.cursorStyle) {
                const newCursorStyle = (0, editorOptions_1.cursorStyleToString)(newConfiguration.cursorStyle);
                this.k.updateOptions({
                    cursorStyle: newCursorStyle
                });
            }
            if (typeof newConfiguration.lineNumbers !== 'undefined') {
                let lineNumbers;
                switch (newConfiguration.lineNumbers) {
                    case 1 /* RenderLineNumbersType.On */:
                        lineNumbers = 'on';
                        break;
                    case 2 /* RenderLineNumbersType.Relative */:
                        lineNumbers = 'relative';
                        break;
                    default:
                        lineNumbers = 'off';
                }
                this.k.updateOptions({
                    lineNumbers: lineNumbers
                });
            }
        }
        setDecorations(key, ranges) {
            if (!this.k) {
                return;
            }
            this.k.setDecorationsByType('exthost-api', key, ranges);
        }
        setDecorationsFast(key, _ranges) {
            if (!this.k) {
                return;
            }
            const ranges = [];
            for (let i = 0, len = Math.floor(_ranges.length / 4); i < len; i++) {
                ranges[i] = new range_1.$ks(_ranges[4 * i], _ranges[4 * i + 1], _ranges[4 * i + 2], _ranges[4 * i + 3]);
            }
            this.k.setDecorationsByTypeFast(key, ranges);
        }
        revealRange(range, revealType) {
            if (!this.k) {
                return;
            }
            switch (revealType) {
                case extHost_protocol_1.TextEditorRevealType.Default:
                    this.k.revealRange(range, 0 /* ScrollType.Smooth */);
                    break;
                case extHost_protocol_1.TextEditorRevealType.InCenter:
                    this.k.revealRangeInCenter(range, 0 /* ScrollType.Smooth */);
                    break;
                case extHost_protocol_1.TextEditorRevealType.InCenterIfOutsideViewport:
                    this.k.revealRangeInCenterIfOutsideViewport(range, 0 /* ScrollType.Smooth */);
                    break;
                case extHost_protocol_1.TextEditorRevealType.AtTop:
                    this.k.revealRangeAtTop(range, 0 /* ScrollType.Smooth */);
                    break;
                default:
                    console.warn(`Unknown revealType: ${revealType}`);
                    break;
            }
        }
        isFocused() {
            if (this.k) {
                return this.k.hasTextFocus();
            }
            return false;
        }
        matches(editor) {
            if (!editor) {
                return false;
            }
            return editor.getControl() === this.k;
        }
        applyEdits(versionIdCheck, edits, opts) {
            if (this.d.getVersionId() !== versionIdCheck) {
                // throw new Error('Model has changed in the meantime!');
                // model changed in the meantime
                return false;
            }
            if (!this.k) {
                // console.warn('applyEdits on invisible editor');
                return false;
            }
            if (typeof opts.setEndOfLine !== 'undefined') {
                this.d.pushEOL(opts.setEndOfLine);
            }
            const transformedEdits = edits.map((edit) => {
                return {
                    range: range_1.$ks.lift(edit.range),
                    text: edit.text,
                    forceMoveMarkers: edit.forceMoveMarkers
                };
            });
            if (opts.undoStopBefore) {
                this.k.pushUndoStop();
            }
            this.k.executeEdits('MainThreadTextEditor', transformedEdits);
            if (opts.undoStopAfter) {
                this.k.pushUndoStop();
            }
            return true;
        }
        async insertSnippet(modelVersionId, template, ranges, opts) {
            if (!this.k || !this.k.hasModel()) {
                return false;
            }
            // check if clipboard is required and only iff read it (async)
            let clipboardText;
            const needsTemplate = snippetParser_1.$G5.guessNeedsClipboard(template);
            if (needsTemplate) {
                const state = new editorState_1.$s1(this.k, 1 /* CodeEditorStateFlag.Value */ | 4 /* CodeEditorStateFlag.Position */);
                clipboardText = await this.h.readText();
                if (!state.validate(this.k)) {
                    return false;
                }
            }
            if (this.k.getModel().getVersionId() !== modelVersionId) {
                return false;
            }
            const snippetController = snippetController2_1.$05.get(this.k);
            if (!snippetController) {
                return false;
            }
            // cancel previous snippet mode
            // snippetController.leaveSnippet();
            // set selection, focus editor
            const selections = ranges.map(r => new selection_1.$ms(r.startLineNumber, r.startColumn, r.endLineNumber, r.endColumn));
            this.k.setSelections(selections);
            this.k.focus();
            // make modifications
            snippetController.insert(template, {
                overwriteBefore: 0, overwriteAfter: 0,
                undoStopBefore: opts.undoStopBefore, undoStopAfter: opts.undoStopAfter,
                clipboardText
            });
            return true;
        }
    }
    exports.$Ocb = $Ocb;
});
//# sourceMappingURL=mainThreadEditor.js.map