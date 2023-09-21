/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/editorExtensions", "vs/editor/common/config/editorConfigurationSchema", "vs/editor/common/editorFeatures", "vs/editor/contrib/dropOrPasteInto/browser/defaultProviders", "vs/nls!vs/editor/contrib/dropOrPasteInto/browser/dropIntoEditorContribution", "vs/platform/configuration/common/configurationRegistry", "vs/platform/registry/common/platform", "./dropIntoEditorController"], function (require, exports, editorExtensions_1, editorConfigurationSchema_1, editorFeatures_1, defaultProviders_1, nls, configurationRegistry_1, platform_1, dropIntoEditorController_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, editorExtensions_1.$AV)(dropIntoEditorController_1.$r7.ID, dropIntoEditorController_1.$r7, 2 /* EditorContributionInstantiation.BeforeFirstInteraction */);
    (0, editorExtensions_1.$wV)(new class extends editorExtensions_1.$rV {
        constructor() {
            super({
                id: dropIntoEditorController_1.$p7,
                precondition: dropIntoEditorController_1.$q7,
                kbOpts: {
                    weight: 100 /* KeybindingWeight.EditorContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 89 /* KeyCode.Period */,
                }
            });
        }
        runEditorCommand(_accessor, editor, _args) {
            dropIntoEditorController_1.$r7.get(editor)?.changeDropType();
        }
    });
    (0, editorFeatures_1.$$2)(defaultProviders_1.$j7);
    platform_1.$8m.as(configurationRegistry_1.$an.Configuration).registerConfiguration({
        ...editorConfigurationSchema_1.$k1,
        properties: {
            [dropIntoEditorController_1.$o7]: {
                type: 'object',
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                description: nls.localize(0, null),
                default: {},
                additionalProperties: {
                    type: 'string',
                },
            },
        }
    });
});
//# sourceMappingURL=dropIntoEditorContribution.js.map