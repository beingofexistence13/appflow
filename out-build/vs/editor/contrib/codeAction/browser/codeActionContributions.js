/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/editorExtensions", "vs/editor/common/config/editorConfigurationSchema", "vs/editor/contrib/codeAction/browser/codeActionCommands", "vs/editor/contrib/codeAction/browser/codeActionController", "vs/editor/contrib/codeAction/browser/lightBulbWidget", "vs/nls!vs/editor/contrib/codeAction/browser/codeActionContributions", "vs/platform/configuration/common/configurationRegistry", "vs/platform/registry/common/platform"], function (require, exports, editorExtensions_1, editorConfigurationSchema_1, codeActionCommands_1, codeActionController_1, lightBulbWidget_1, nls, configurationRegistry_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, editorExtensions_1.$AV)(codeActionController_1.$Q2.ID, codeActionController_1.$Q2, 3 /* EditorContributionInstantiation.Eventually */);
    (0, editorExtensions_1.$AV)(lightBulbWidget_1.$J2.ID, lightBulbWidget_1.$J2, 4 /* EditorContributionInstantiation.Lazy */);
    (0, editorExtensions_1.$xV)(codeActionCommands_1.$R2);
    (0, editorExtensions_1.$xV)(codeActionCommands_1.$T2);
    (0, editorExtensions_1.$xV)(codeActionCommands_1.$U2);
    (0, editorExtensions_1.$xV)(codeActionCommands_1.$V2);
    (0, editorExtensions_1.$xV)(codeActionCommands_1.$X2);
    (0, editorExtensions_1.$xV)(codeActionCommands_1.$W2);
    (0, editorExtensions_1.$wV)(new codeActionCommands_1.$S2());
    platform_1.$8m.as(configurationRegistry_1.$an.Configuration).registerConfiguration({
        ...editorConfigurationSchema_1.$k1,
        properties: {
            'editor.codeActionWidget.showHeaders': {
                type: 'boolean',
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                description: nls.localize(0, null),
                default: true,
            },
        }
    });
});
//# sourceMappingURL=codeActionContributions.js.map