/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/mergeEditor/browser/mergeEditor.contribution", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configurationRegistry", "vs/platform/instantiation/common/descriptors", "vs/platform/registry/common/platform", "vs/workbench/browser/editor", "vs/workbench/common/contributions", "vs/workbench/common/editor", "vs/workbench/contrib/mergeEditor/browser/commands/commands", "vs/workbench/contrib/mergeEditor/browser/commands/devCommands", "vs/workbench/contrib/mergeEditor/browser/mergeEditorInput", "vs/workbench/contrib/mergeEditor/browser/view/mergeEditor", "./mergeEditorSerializer"], function (require, exports, nls_1, actions_1, configurationRegistry_1, descriptors_1, platform_1, editor_1, contributions_1, editor_2, commands_1, devCommands_1, mergeEditorInput_1, mergeEditor_1, mergeEditorSerializer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    platform_1.$8m.as(editor_2.$GE.EditorPane).registerEditorPane(editor_1.$_T.create(mergeEditor_1.$YSb, mergeEditor_1.$YSb.ID, (0, nls_1.localize)(0, null)), [
        new descriptors_1.$yh(mergeEditorInput_1.$hkb)
    ]);
    platform_1.$8m.as(editor_2.$GE.EditorFactory).registerEditorSerializer(mergeEditorInput_1.$hkb.ID, mergeEditorSerializer_1.$mTb);
    platform_1.$8m.as(configurationRegistry_1.$an.Configuration).registerConfiguration({
        properties: {
            'mergeEditor.diffAlgorithm': {
                type: 'string',
                enum: ['legacy', 'advanced'],
                default: 'advanced',
                markdownEnumDescriptions: [
                    (0, nls_1.localize)(1, null),
                    (0, nls_1.localize)(2, null),
                ]
            },
            'mergeEditor.showDeletionMarkers': {
                type: 'boolean',
                default: true,
                description: 'Controls if deletions in base or one of the inputs should be indicated by a vertical bar.',
            },
        }
    });
    (0, actions_1.$Xu)(commands_1.$9Sb);
    (0, actions_1.$Xu)(commands_1.$3Sb);
    (0, actions_1.$Xu)(commands_1.$4Sb);
    (0, actions_1.$Xu)(commands_1.$2Sb);
    (0, actions_1.$Xu)(commands_1.$dTb);
    (0, actions_1.$Xu)(commands_1.$5Sb);
    (0, actions_1.$Xu)(commands_1.$6Sb);
    (0, actions_1.$Xu)(commands_1.$7Sb);
    (0, actions_1.$Xu)(commands_1.$8Sb);
    (0, actions_1.$Xu)(commands_1.$0Sb);
    (0, actions_1.$Xu)(commands_1.$$Sb);
    (0, actions_1.$Xu)(commands_1.$_Sb);
    (0, actions_1.$Xu)(commands_1.$aTb);
    (0, actions_1.$Xu)(commands_1.$bTb);
    (0, actions_1.$Xu)(commands_1.$cTb);
    (0, actions_1.$Xu)(commands_1.$eTb);
    (0, actions_1.$Xu)(commands_1.$fTb);
    (0, actions_1.$Xu)(commands_1.$gTb);
    (0, actions_1.$Xu)(commands_1.$iTb);
    (0, actions_1.$Xu)(commands_1.$hTb);
    // Dev Commands
    (0, actions_1.$Xu)(devCommands_1.$jTb);
    (0, actions_1.$Xu)(devCommands_1.$kTb);
    (0, actions_1.$Xu)(devCommands_1.$lTb);
    platform_1.$8m
        .as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(mergeEditor_1.$ZSb, 3 /* LifecyclePhase.Restored */);
    platform_1.$8m
        .as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(mergeEditor_1.$1Sb, 1 /* LifecyclePhase.Starting */);
});
//# sourceMappingURL=mergeEditor.contribution.js.map