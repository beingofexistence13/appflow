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
define(["require", "exports", "vs/nls!vs/workbench/contrib/codeEditor/electron-sandbox/selectionClipboard", "vs/base/common/async", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/editor/browser/editorExtensions", "vs/editor/common/core/range", "vs/platform/clipboard/common/clipboardService", "vs/workbench/contrib/codeEditor/browser/selectionClipboard", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/platform/configuration/common/configuration", "vs/editor/common/editorContextKeys"], function (require, exports, nls, async_1, lifecycle_1, platform, editorExtensions_1, range_1, clipboardService_1, selectionClipboard_1, platform_1, contributions_1, configuration_1, editorContextKeys_1) {
    "use strict";
    var $hac_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$hac = void 0;
    let $hac = class $hac extends lifecycle_1.$kc {
        static { $hac_1 = this; }
        static { this.a = 65536; }
        constructor(editor, clipboardService) {
            super();
            if (platform.$k) {
                let isEnabled = editor.getOption(106 /* EditorOption.selectionClipboard */);
                this.B(editor.onDidChangeConfiguration((e) => {
                    if (e.hasChanged(106 /* EditorOption.selectionClipboard */)) {
                        isEnabled = editor.getOption(106 /* EditorOption.selectionClipboard */);
                    }
                }));
                const setSelectionToClipboard = this.B(new async_1.$Sg(() => {
                    if (!editor.hasModel()) {
                        return;
                    }
                    const model = editor.getModel();
                    let selections = editor.getSelections();
                    selections = selections.slice(0);
                    selections.sort(range_1.$ks.compareRangesUsingStarts);
                    let resultLength = 0;
                    for (const sel of selections) {
                        if (sel.isEmpty()) {
                            // Only write if all cursors have selection
                            return;
                        }
                        resultLength += model.getValueLengthInRange(sel);
                    }
                    if (resultLength > $hac_1.a) {
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
                this.B(editor.onDidChangeCursorSelection((e) => {
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
    exports.$hac = $hac;
    exports.$hac = $hac = $hac_1 = __decorate([
        __param(1, clipboardService_1.$UZ)
    ], $hac);
    let SelectionClipboardPastePreventer = class SelectionClipboardPastePreventer {
        constructor(configurationService) {
            if (platform.$k) {
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
        __param(0, configuration_1.$8h)
    ], SelectionClipboardPastePreventer);
    class PasteSelectionClipboardAction extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.selectionClipboardPaste',
                label: nls.localize(0, null),
                alias: 'Paste Selection Clipboard',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            });
        }
        async run(accessor, editor, args) {
            const clipboardService = accessor.get(clipboardService_1.$UZ);
            // read selection clipboard
            const text = await clipboardService.readText('selection');
            editor.trigger('keyboard', "paste" /* Handler.Paste */, {
                text: text,
                pasteOnNewLine: false,
                multicursorText: null
            });
        }
    }
    (0, editorExtensions_1.$AV)(selectionClipboard_1.$tqb, $hac, 0 /* EditorContributionInstantiation.Eager */); // eager because it needs to listen to selection change events
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(SelectionClipboardPastePreventer, 2 /* LifecyclePhase.Ready */);
    if (platform.$k) {
        (0, editorExtensions_1.$xV)(PasteSelectionClipboardAction);
    }
});
//# sourceMappingURL=selectionClipboard.js.map