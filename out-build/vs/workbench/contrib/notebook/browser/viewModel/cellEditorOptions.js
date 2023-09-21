/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/objects"], function (require, exports, event_1, lifecycle_1, objects_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$mrb = void 0;
    class $mrb extends lifecycle_1.$kc {
        static { this.a = {
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
            return this.f;
        }
        constructor(notebookEditor, notebookOptions, configurationService, language) {
            super();
            this.notebookEditor = notebookEditor;
            this.notebookOptions = notebookOptions;
            this.configurationService = configurationService;
            this.language = language;
            this.b = this.B(new lifecycle_1.$jc());
            this.c = this.B(new event_1.$fd());
            this.onDidChange = this.c.event;
            this.B(configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('editor') || e.affectsConfiguration('notebook')) {
                    this.g();
                }
            }));
            this.B(notebookOptions.onDidChangeOptions(e => {
                if (e.cellStatusBarVisibility || e.editorTopPadding || e.editorOptionsCustomizations) {
                    this.g();
                }
            }));
            this.B(this.notebookEditor.onDidChangeModel(() => {
                this.b.clear();
                if (this.notebookEditor.hasModel()) {
                    this.b.add(this.notebookEditor.onDidChangeOptions(() => {
                        this.g();
                    }));
                    this.g();
                }
            }));
            if (this.notebookEditor.hasModel()) {
                this.b.add(this.notebookEditor.onDidChangeOptions(() => {
                    this.g();
                }));
            }
            this.f = this.h();
        }
        g() {
            this.f = this.h();
            this.c.fire();
        }
        h() {
            const editorOptions = (0, objects_1.$Vm)(this.configurationService.getValue('editor', { overrideIdentifier: this.language }));
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
                ...$mrb.a,
                ...editorOptionsOverride,
                ...{ padding: { top: 12, bottom: 12 } },
                readOnly: this.notebookEditor.isReadOnly
            });
            return computed;
        }
    }
    exports.$mrb = $mrb;
});
//# sourceMappingURL=cellEditorOptions.js.map