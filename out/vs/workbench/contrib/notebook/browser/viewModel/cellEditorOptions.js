/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/objects"], function (require, exports, event_1, lifecycle_1, objects_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BaseCellEditorOptions = void 0;
    class BaseCellEditorOptions extends lifecycle_1.Disposable {
        static { this.fixedEditorOptions = {
            scrollBeyondLastLine: false,
            scrollbar: {
                verticalScrollbarSize: 14,
                horizontal: 'auto',
                useShadows: true,
                verticalHasArrows: false,
                horizontalHasArrows: false,
                alwaysConsumeMouseWheel: false
            },
            renderLineHighlightOnlyWhenFocus: true,
            overviewRulerLanes: 0,
            lineDecorationsWidth: 0,
            folding: true,
            fixedOverflowWidgets: true,
            minimap: { enabled: false },
            renderValidationDecorations: 'on',
            lineNumbersMinChars: 3
        }; }
        get value() {
            return this._value;
        }
        constructor(notebookEditor, notebookOptions, configurationService, language) {
            super();
            this.notebookEditor = notebookEditor;
            this.notebookOptions = notebookOptions;
            this.configurationService = configurationService;
            this.language = language;
            this._localDisposableStore = this._register(new lifecycle_1.DisposableStore());
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this._register(configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('editor') || e.affectsConfiguration('notebook')) {
                    this._recomputeOptions();
                }
            }));
            this._register(notebookOptions.onDidChangeOptions(e => {
                if (e.cellStatusBarVisibility || e.editorTopPadding || e.editorOptionsCustomizations) {
                    this._recomputeOptions();
                }
            }));
            this._register(this.notebookEditor.onDidChangeModel(() => {
                this._localDisposableStore.clear();
                if (this.notebookEditor.hasModel()) {
                    this._localDisposableStore.add(this.notebookEditor.onDidChangeOptions(() => {
                        this._recomputeOptions();
                    }));
                    this._recomputeOptions();
                }
            }));
            if (this.notebookEditor.hasModel()) {
                this._localDisposableStore.add(this.notebookEditor.onDidChangeOptions(() => {
                    this._recomputeOptions();
                }));
            }
            this._value = this._computeEditorOptions();
        }
        _recomputeOptions() {
            this._value = this._computeEditorOptions();
            this._onDidChange.fire();
        }
        _computeEditorOptions() {
            const editorOptions = (0, objects_1.deepClone)(this.configurationService.getValue('editor', { overrideIdentifier: this.language }));
            const layoutConfig = this.notebookOptions.getLayoutConfiguration();
            const editorOptionsOverrideRaw = layoutConfig.editorOptionsCustomizations ?? {};
            const editorOptionsOverride = {};
            for (const key in editorOptionsOverrideRaw) {
                if (key.indexOf('editor.') === 0) {
                    editorOptionsOverride[key.substring(7)] = editorOptionsOverrideRaw[key];
                }
            }
            const computed = Object.freeze({
                ...editorOptions,
                ...BaseCellEditorOptions.fixedEditorOptions,
                ...editorOptionsOverride,
                ...{ padding: { top: 12, bottom: 12 } },
                readOnly: this.notebookEditor.isReadOnly
            });
            return computed;
        }
    }
    exports.BaseCellEditorOptions = BaseCellEditorOptions;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbEVkaXRvck9wdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9icm93c2VyL3ZpZXdNb2RlbC9jZWxsRWRpdG9yT3B0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFVaEcsTUFBYSxxQkFBc0IsU0FBUSxzQkFBVTtpQkFDckMsdUJBQWtCLEdBQW1CO1lBQ25ELG9CQUFvQixFQUFFLEtBQUs7WUFDM0IsU0FBUyxFQUFFO2dCQUNWLHFCQUFxQixFQUFFLEVBQUU7Z0JBQ3pCLFVBQVUsRUFBRSxNQUFNO2dCQUNsQixVQUFVLEVBQUUsSUFBSTtnQkFDaEIsaUJBQWlCLEVBQUUsS0FBSztnQkFDeEIsbUJBQW1CLEVBQUUsS0FBSztnQkFDMUIsdUJBQXVCLEVBQUUsS0FBSzthQUM5QjtZQUNELGdDQUFnQyxFQUFFLElBQUk7WUFDdEMsa0JBQWtCLEVBQUUsQ0FBQztZQUNyQixvQkFBb0IsRUFBRSxDQUFDO1lBQ3ZCLE9BQU8sRUFBRSxJQUFJO1lBQ2Isb0JBQW9CLEVBQUUsSUFBSTtZQUMxQixPQUFPLEVBQUUsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFO1lBQzNCLDJCQUEyQixFQUFFLElBQUk7WUFDakMsbUJBQW1CLEVBQUUsQ0FBQztTQUN0QixBQWxCZ0MsQ0FrQi9CO1FBT0YsSUFBSSxLQUFLO1lBQ1IsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ3BCLENBQUM7UUFFRCxZQUFxQixjQUF1QyxFQUFXLGVBQWdDLEVBQVcsb0JBQTJDLEVBQVcsUUFBZ0I7WUFDdkwsS0FBSyxFQUFFLENBQUM7WUFEWSxtQkFBYyxHQUFkLGNBQWMsQ0FBeUI7WUFBVyxvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7WUFBVyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQVcsYUFBUSxHQUFSLFFBQVEsQ0FB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