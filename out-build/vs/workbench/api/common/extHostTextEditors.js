/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/errors", "vs/base/common/event", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostTextEditor", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/extHostTypes"], function (require, exports, arrays, errors_1, event_1, extHost_protocol_1, extHostTextEditor_1, TypeConverters, extHostTypes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$7bc = void 0;
    class $7bc {
        constructor(mainContext, i) {
            this.i = i;
            this.a = new event_1.$fd({ onListenerError: errors_1.$Z });
            this.b = new event_1.$fd({ onListenerError: errors_1.$Z });
            this.c = new event_1.$fd({ onListenerError: errors_1.$Z });
            this.d = new event_1.$fd({ onListenerError: errors_1.$Z });
            this.f = new event_1.$fd({ onListenerError: errors_1.$Z });
            this.g = new event_1.$fd({ onListenerError: errors_1.$Z });
            this.onDidChangeTextEditorSelection = this.a.event;
            this.onDidChangeTextEditorOptions = this.b.event;
            this.onDidChangeTextEditorVisibleRanges = this.c.event;
            this.onDidChangeTextEditorViewColumn = this.d.event;
            this.onDidChangeActiveTextEditor = this.f.event;
            this.onDidChangeVisibleTextEditors = this.g.event;
            this.h = mainContext.getProxy(extHost_protocol_1.$1J.MainThreadTextEditors);
            this.i.onDidChangeVisibleTextEditors(e => this.g.fire(e));
            this.i.onDidChangeActiveTextEditor(e => this.f.fire(e));
        }
        getActiveTextEditor() {
            return this.i.activeEditor();
        }
        getVisibleTextEditors(internal) {
            const editors = this.i.allEditors();
            return internal
                ? editors
                : editors.map(editor => editor.value);
        }
        async showTextDocument(document, columnOrOptions, preserveFocus) {
            let options;
            if (typeof columnOrOptions === 'number') {
                options = {
                    position: TypeConverters.ViewColumn.from(columnOrOptions),
                    preserveFocus
                };
            }
            else if (typeof columnOrOptions === 'object') {
                options = {
                    position: TypeConverters.ViewColumn.from(columnOrOptions.viewColumn),
                    preserveFocus: columnOrOptions.preserveFocus,
                    selection: typeof columnOrOptions.selection === 'object' ? TypeConverters.Range.from(columnOrOptions.selection) : undefined,
                    pinned: typeof columnOrOptions.preview === 'boolean' ? !columnOrOptions.preview : undefined
                };
            }
            else {
                options = {
                    preserveFocus: false
                };
            }
            const editorId = await this.h.$tryShowTextDocument(document.uri, options);
            const editor = editorId && this.i.getEditor(editorId);
            if (editor) {
                return editor.value;
            }
            // we have no editor... having an id means that we had an editor
            // on the main side and that it isn't the current editor anymore...
            if (editorId) {
                throw new Error(`Could NOT open editor for "${document.uri.toString()}" because another editor opened in the meantime.`);
            }
            else {
                throw new Error(`Could NOT open editor for "${document.uri.toString()}".`);
            }
        }
        createTextEditorDecorationType(extension, options) {
            return new extHostTextEditor_1.$9L(this.h, extension, options).value;
        }
        // --- called from main thread
        $acceptEditorPropertiesChanged(id, data) {
            const textEditor = this.i.getEditor(id);
            if (!textEditor) {
                throw new Error('unknown text editor');
            }
            // (1) set all properties
            if (data.options) {
                textEditor._acceptOptions(data.options);
            }
            if (data.selections) {
                const selections = data.selections.selections.map(TypeConverters.Selection.to);
                textEditor._acceptSelections(selections);
            }
            if (data.visibleRanges) {
                const visibleRanges = arrays.$Fb(data.visibleRanges.map(TypeConverters.Range.to));
                textEditor._acceptVisibleRanges(visibleRanges);
            }
            // (2) fire change events
            if (data.options) {
                this.b.fire({
                    textEditor: textEditor.value,
                    options: { ...data.options, lineNumbers: TypeConverters.TextEditorLineNumbersStyle.to(data.options.lineNumbers) }
                });
            }
            if (data.selections) {
                const kind = extHostTypes_1.TextEditorSelectionChangeKind.fromValue(data.selections.source);
                const selections = data.selections.selections.map(TypeConverters.Selection.to);
                this.a.fire({
                    textEditor: textEditor.value,
                    selections,
                    kind
                });
            }
            if (data.visibleRanges) {
                const visibleRanges = arrays.$Fb(data.visibleRanges.map(TypeConverters.Range.to));
                this.c.fire({
                    textEditor: textEditor.value,
                    visibleRanges
                });
            }
        }
        $acceptEditorPositionData(data) {
            for (const id in data) {
                const textEditor = this.i.getEditor(id);
                if (!textEditor) {
                    throw new Error('Unknown text editor');
                }
                const viewColumn = TypeConverters.ViewColumn.to(data[id]);
                if (textEditor.value.viewColumn !== viewColumn) {
                    textEditor._acceptViewColumn(viewColumn);
                    this.d.fire({ textEditor: textEditor.value, viewColumn });
                }
            }
        }
        getDiffInformation(id) {
            return Promise.resolve(this.h.$getDiffInformation(id));
        }
    }
    exports.$7bc = $7bc;
});
//# sourceMappingURL=extHostTextEditors.js.map