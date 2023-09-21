/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/editorExtensions", "vs/editor/common/editorFeatures", "vs/editor/contrib/dropOrPasteInto/browser/copyPasteController", "vs/editor/contrib/dropOrPasteInto/browser/defaultProviders", "vs/nls!vs/editor/contrib/dropOrPasteInto/browser/copyPasteContribution"], function (require, exports, editorExtensions_1, editorFeatures_1, copyPasteController_1, defaultProviders_1, nls) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, editorExtensions_1.$AV)(copyPasteController_1.$i7.ID, copyPasteController_1.$i7, 0 /* EditorContributionInstantiation.Eager */); // eager because it listens to events on the container dom node of the editor
    (0, editorFeatures_1.$$2)(defaultProviders_1.$k7);
    (0, editorExtensions_1.$wV)(new class extends editorExtensions_1.$rV {
        constructor() {
            super({
                id: copyPasteController_1.$g7,
                precondition: copyPasteController_1.$h7,
                kbOpts: {
                    weight: 100 /* KeybindingWeight.EditorContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 89 /* KeyCode.Period */,
                }
            });
        }
        runEditorCommand(_accessor, editor, _args) {
            return copyPasteController_1.$i7.get(editor)?.changePasteType();
        }
    });
    (0, editorExtensions_1.$xV)(class extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.pasteAs',
                label: nls.localize(0, null),
                alias: 'Paste As...',
                precondition: undefined,
                description: {
                    description: 'Paste as',
                    args: [{
                            name: 'args',
                            schema: {
                                type: 'object',
                                properties: {
                                    'id': {
                                        type: 'string',
                                        description: nls.localize(1, null),
                                    }
                                },
                            }
                        }]
                }
            });
        }
        run(_accessor, editor, args) {
            const id = typeof args?.id === 'string' ? args.id : undefined;
            return copyPasteController_1.$i7.get(editor)?.pasteAs(id);
        }
    });
});
//# sourceMappingURL=copyPasteContribution.js.map