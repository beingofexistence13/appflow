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
define(["require", "exports", "vs/nls", "vs/base/common/async", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/editor/browser/editorExtensions", "vs/editor/common/core/range", "vs/platform/clipboard/common/clipboardService", "vs/workbench/contrib/codeEditor/browser/selectionClipboard", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/platform/configuration/common/configuration", "vs/editor/common/editorContextKeys"], function (require, exports, nls, async_1, lifecycle_1, platform, editorExtensions_1, range_1, clipboardService_1, selectionClipboard_1, platform_1, contributions_1, configuration_1, editorContextKeys_1) {
    "use strict";
    var SelectionClipboard_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SelectionClipboard = void 0;
    let SelectionClipboard = class SelectionClipboard extends lifecycle_1.Disposable {
        static { SelectionClipboard_1 = this; }
        static { this.SELECTION_LENGTH_LIMIT = 65536; }
        constructor(editor, clipboardService) {
            super();
            if (platform.isLinux) {
                let isEnabled = editor.getOption(106 /* EditorOption.selectionClipboard */);
                this._register(editor.onDidChangeConfiguration((e) => {
                    if (e.hasChanged(106 /* EditorOption.selectionClipboard */)) {
                        isEnabled = editor.getOption(106 /* EditorOption.selectionClipboard */);
                    }
                }));
                const setSelectionToClipboard = this._register(new async_1.RunOnceScheduler(() => {
                    if (!editor.hasModel()) {
                        return;
                    }
                    const model = editor.getModel();
                    let selections = editor.getSelections();
                    selections = selections.slice(0);
                    selections.sort(range_1.Range.compareRangesUsingStarts);
                    let resultLength = 0;
                    for (const sel of selections) {
                        if (sel.isEmpty()) {
                            // Only write if all cursors have selection
                            return;
                        }
                        resultLength += model.getValueLengthInRange(sel);
                    }
                    if (resultLength > SelectionClipboard_1.SELECTION_LENGTH_LIMIT) {
                        // This is a large selection!
                        // => do not write it to the selection clipboard
                        return;
                    }
                    const result = [];
                    for (const sel of selections) {
                        result.push(model.getValueInRange(sel, 0 /* EndOfLinePreference.TextDefined */));
                    }
                    const textToCopy = result.join(model.getEOL());
                    clipboardService.writeText(textToCopy, 'selection');
                }, 100));
                this._register(editor.onDidChangeCursorSelection((e) => {
                    if (!isEnabled) {
                        return;
                    }
                    if (e.source === 'restoreState') {
                        // do not set selection to clipboard if this selection change
                        // was caused by restoring editors...
                        return;
                    }
                    setSelectionToClipboard.schedule();
                }));
            }
        }
        dispose() {
            super.dispose();
        }
    };
    exports.SelectionClipboard = SelectionClipboard;
    exports.SelectionClipboard = SelectionClipboard = SelectionClipboard_1 = __decorate([
        __param(1, clipboardService_1.IClipboardService)
    ], SelectionClipboard);
    let SelectionClipboardPastePreventer = class SelectionClipboardPastePreventer {
        constructor(configurationService) {
            if (platform.isLinux) {
                document.addEventListener('mouseup', (e) => {
                    if (e.button === 1) {
                        // middle button
                        const config = configurationService.getValue('editor');
                        if (!config.selectionClipboard) {
                            // selection clipboard is disabled
                            // try to stop the upcoming paste
                            e.preventDefault();
                        }
                    }
                });
            }
        }
    };
    SelectionClipboardPastePreventer = __decorate([
        __param(0, configuration_1.IConfigurationService)
    ], SelectionClipboardPastePreventer);
    class PasteSelectionClipboardAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.selectionClipboardPaste',
                label: nls.localize('actions.pasteSelectionClipboard', "Paste Selection Clipboard"),
                alias: 'Paste Selection Clipboard',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            });
        }
        async run(accessor, editor, args) {
            const clipboardService = accessor.get(clipboardService_1.IClipboardService);
            // read selection clipboard
            const text = await clipboardService.readText('selection');
            editor.trigger('keyboard', "paste" /* Handler.Paste */, {
                text: text,
                pasteOnNewLine: false,
                multicursorText: null
            });
        }
    }
    (0, editorExtensions_1.registerEditorContribution)(selectionClipboard_1.SelectionClipboardContributionID, SelectionClipboard, 0 /* EditorContributionInstantiation.Eager */); // eager because it needs to listen to selection change events
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(SelectionClipboardPastePreventer, 2 /* LifecyclePhase.Ready */);
    if (platform.isLinux) {
        (0, editorExtensions_1.registerEditorAction)(PasteSelectionClipboardAction);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0aW9uQ2xpcGJvYXJkLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY29kZUVkaXRvci9lbGVjdHJvbi1zYW5kYm94L3NlbGVjdGlvbkNsaXBib2FyZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBcUJ6RixJQUFNLGtCQUFrQixHQUF4QixNQUFNLGtCQUFtQixTQUFRLHNCQUFVOztpQkFDekIsMkJBQXNCLEdBQUcsS0FBSyxBQUFSLENBQVM7UUFFdkQsWUFBWSxNQUFtQixFQUFxQixnQkFBbUM7WUFDdEYsS0FBSyxFQUFFLENBQUM7WUFFUixJQUFJLFFBQVEsQ0FBQyxPQUFPLEVBQUU7Z0JBQ3JCLElBQUksU0FBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLDJDQUFpQyxDQUFDO2dCQUVsRSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQTRCLEVBQUUsRUFBRTtvQkFDL0UsSUFBSSxDQUFDLENBQUMsVUFBVSwyQ0FBaUMsRUFBRTt3QkFDbEQsU0FBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLDJDQUFpQyxDQUFDO3FCQUM5RDtnQkFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUVKLE1BQU0sdUJBQXVCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLHdCQUFnQixDQUFDLEdBQUcsRUFBRTtvQkFDeEUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsRUFBRTt3QkFDdkIsT0FBTztxQkFDUDtvQkFDRCxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7b0JBQ2hDLElBQUksVUFBVSxHQUFHLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQztvQkFDeEMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7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