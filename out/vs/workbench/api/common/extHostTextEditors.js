/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/errors", "vs/base/common/event", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostTextEditor", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/extHostTypes"], function (require, exports, arrays, errors_1, event_1, extHost_protocol_1, extHostTextEditor_1, TypeConverters, extHostTypes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostEditors = void 0;
    class ExtHostEditors {
        constructor(mainContext, _extHostDocumentsAndEditors) {
            this._extHostDocumentsAndEditors = _extHostDocumentsAndEditors;
            this._onDidChangeTextEditorSelection = new event_1.Emitter({ onListenerError: errors_1.onUnexpectedExternalError });
            this._onDidChangeTextEditorOptions = new event_1.Emitter({ onListenerError: errors_1.onUnexpectedExternalError });
            this._onDidChangeTextEditorVisibleRanges = new event_1.Emitter({ onListenerError: errors_1.onUnexpectedExternalError });
            this._onDidChangeTextEditorViewColumn = new event_1.Emitter({ onListenerError: errors_1.onUnexpectedExternalError });
            this._onDidChangeActiveTextEditor = new event_1.Emitter({ onListenerError: errors_1.onUnexpectedExternalError });
            this._onDidChangeVisibleTextEditors = new event_1.Emitter({ onListenerError: errors_1.onUnexpectedExternalError });
            this.onDidChangeTextEditorSelection = this._onDidChangeTextEditorSelection.event;
            this.onDidChangeTextEditorOptions = this._onDidChangeTextEditorOptions.event;
            this.onDidChangeTextEditorVisibleRanges = this._onDidChangeTextEditorVisibleRanges.event;
            this.onDidChangeTextEditorViewColumn = this._onDidChangeTextEditorViewColumn.event;
            this.onDidChangeActiveTextEditor = this._onDidChangeActiveTextEditor.event;
            this.onDidChangeVisibleTextEditors = this._onDidChangeVisibleTextEditors.event;
            this._proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadTextEditors);
            this._extHostDocumentsAndEditors.onDidChangeVisibleTextEditors(e => this._onDidChangeVisibleTextEditors.fire(e));
            this._extHostDocumentsAndEditors.onDidChangeActiveTextEditor(e => this._onDidChangeActiveTextEditor.fire(e));
        }
        getActiveTextEditor() {
            return this._extHostDocumentsAndEditors.activeEditor();
        }
        getVisibleTextEditors(internal) {
            const editors = this._extHostDocumentsAndEditors.allEditors();
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
            const editorId = await this._proxy.$tryShowTextDocument(document.uri, options);
            const editor = editorId && this._extHostDocumentsAndEditors.getEditor(editorId);
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
            return new extHostTextEditor_1.TextEditorDecorationType(this._proxy, extension, options).value;
        }
        // --- called from main thread
        $acceptEditorPropertiesChanged(id, data) {
            const textEditor = this._extHostDocumentsAndEditors.getEditor(id);
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
                const visibleRanges = arrays.coalesce(data.visibleRanges.map(TypeConverters.Range.to));
                textEditor._acceptVisibleRanges(visibleRanges);
            }
            // (2) fire change events
            if (data.options) {
                this._onDidChangeTextEditorOptions.fire({
                    textEditor: textEditor.value,
                    options: { ...data.options, lineNumbers: TypeConverters.TextEditorLineNumbersStyle.to(data.options.lineNumbers) }
                });
            }
            if (data.selections) {
                const kind = extHostTypes_1.TextEditorSelectionChangeKind.fromValue(data.selections.source);
                const selections = data.selections.selections.map(TypeConverters.Selection.to);
                this._onDidChangeTextEditorSelection.fire({
                    textEditor: textEditor.value,
                    selections,
                    kind
                });
            }
            if (data.visibleRanges) {
                const visibleRanges = arrays.coalesce(data.visibleRanges.map(TypeConverters.Range.to));
                this._onDidChangeTextEditorVisibleRanges.fire({
                    textEditor: textEditor.value,
                    visibleRanges
                });
            }
        }
        $acceptEditorPositionData(data) {
            for (const id in data) {
                const textEditor = this._extHostDocumentsAndEditors.getEditor(id);
                if (!textEditor) {
                    throw new Error('Unknown text editor');
                }
                const viewColumn = TypeConverters.ViewColumn.to(data[id]);
                if (textEditor.value.viewColumn !== viewColumn) {
                    textEditor._acceptViewColumn(viewColumn);
                    this._onDidChangeTextEditorViewColumn.fire({ textEditor: textEditor.value, viewColumn });
                }
            }
        }
        getDiffInformation(id) {
            return Promise.resolve(this._proxy.$getDiffInformation(id));
        }
    }
    exports.ExtHostEditors = ExtHostEditors;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFRleHRFZGl0b3JzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9jb21tb24vZXh0SG9zdFRleHRFZGl0b3JzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWFoRyxNQUFhLGNBQWM7UUFrQjFCLFlBQ0MsV0FBeUIsRUFDUiwyQkFBdUQ7WUFBdkQsZ0NBQTJCLEdBQTNCLDJCQUEyQixDQUE0QjtZQWxCeEQsb0NBQStCLEdBQUcsSUFBSSxlQUFPLENBQXdDLEVBQUUsZUFBZSxFQUFFLGtDQUF5QixFQUFFLENBQUMsQ0FBQztZQUNySSxrQ0FBNkIsR0FBRyxJQUFJLGVBQU8sQ0FBc0MsRUFBRSxlQUFlLEVBQUUsa0NBQXlCLEVBQUUsQ0FBQyxDQUFDO1lBQ2pJLHdDQUFtQyxHQUFHLElBQUksZUFBTyxDQUE0QyxFQUFFLGVBQWUsRUFBRSxrQ0FBeUIsRUFBRSxDQUFDLENBQUM7WUFDN0kscUNBQWdDLEdBQUcsSUFBSSxlQUFPLENBQXlDLEVBQUUsZUFBZSxFQUFFLGtDQUF5QixFQUFFLENBQUMsQ0FBQztZQUN2SSxpQ0FBNEIsR0FBRyxJQUFJLGVBQU8sQ0FBZ0MsRUFBRSxlQUFlLEVBQUUsa0NBQXlCLEVBQUUsQ0FBQyxDQUFDO1lBQzFILG1DQUE4QixHQUFHLElBQUksZUFBTyxDQUErQixFQUFFLGVBQWUsRUFBRSxrQ0FBeUIsRUFBRSxDQUFDLENBQUM7WUFFbkksbUNBQThCLEdBQWlELElBQUksQ0FBQywrQkFBK0IsQ0FBQyxLQUFLLENBQUM7WUFDMUgsaUNBQTRCLEdBQStDLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxLQUFLLENBQUM7WUFDcEgsdUNBQWtDLEdBQXFELElBQUksQ0FBQyxtQ0FBbUMsQ0FBQyxLQUFLLENBQUM7WUFDdEksb0NBQStCLEdBQWtELElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxLQUFLLENBQUM7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