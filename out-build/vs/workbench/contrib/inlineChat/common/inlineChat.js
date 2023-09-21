/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/inlineChat/common/inlineChat", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configurationRegistry", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/registry/common/platform", "vs/platform/theme/common/colorRegistry", "vs/workbench/common/configuration"], function (require, exports, nls_1, actions_1, configurationRegistry_1, contextkey_1, instantiation_1, platform_1, colorRegistry_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EditMode = exports.$Sz = exports.$Rz = exports.$Qz = exports.$Pz = exports.$Oz = exports.$Nz = exports.$Mz = exports.$Lz = exports.$Kz = exports.$Jz = exports.$Iz = exports.$Hz = exports.$Gz = exports.$Fz = exports.$Ez = exports.$Dz = exports.$Cz = exports.$Bz = exports.$Az = exports.$zz = exports.$yz = exports.$xz = exports.$wz = exports.$vz = exports.$uz = exports.$tz = exports.$sz = exports.$rz = exports.$qz = exports.$pz = exports.$oz = exports.$nz = exports.$mz = exports.$lz = exports.$kz = exports.$jz = exports.$iz = exports.$hz = exports.$gz = exports.$fz = exports.$ez = exports.$dz = exports.InlineChatResponseFeedbackKind = exports.InlineChateResponseTypes = exports.InlineChatResponseType = void 0;
    var InlineChatResponseType;
    (function (InlineChatResponseType) {
        InlineChatResponseType["EditorEdit"] = "editorEdit";
        InlineChatResponseType["BulkEdit"] = "bulkEdit";
        InlineChatResponseType["Message"] = "message";
    })(InlineChatResponseType || (exports.InlineChatResponseType = InlineChatResponseType = {}));
    var InlineChateResponseTypes;
    (function (InlineChateResponseTypes) {
        InlineChateResponseTypes["OnlyMessages"] = "onlyMessages";
        InlineChateResponseTypes["OnlyEdits"] = "onlyEdits";
        InlineChateResponseTypes["Mixed"] = "mixed";
    })(InlineChateResponseTypes || (exports.InlineChateResponseTypes = InlineChateResponseTypes = {}));
    var InlineChatResponseFeedbackKind;
    (function (InlineChatResponseFeedbackKind) {
        InlineChatResponseFeedbackKind[InlineChatResponseFeedbackKind["Unhelpful"] = 0] = "Unhelpful";
        InlineChatResponseFeedbackKind[InlineChatResponseFeedbackKind["Helpful"] = 1] = "Helpful";
        InlineChatResponseFeedbackKind[InlineChatResponseFeedbackKind["Undone"] = 2] = "Undone";
        InlineChatResponseFeedbackKind[InlineChatResponseFeedbackKind["Accepted"] = 3] = "Accepted";
    })(InlineChatResponseFeedbackKind || (exports.InlineChatResponseFeedbackKind = InlineChatResponseFeedbackKind = {}));
    exports.$dz = (0, instantiation_1.$Bh)('IInlineChatService');
    exports.$ez = 'interactiveEditor';
    exports.$fz = 'interactiveEditorAccessiblityHelp';
    exports.$gz = new contextkey_1.$2i('inlineChatHasProvider', false, (0, nls_1.localize)(0, null));
    exports.$hz = new contextkey_1.$2i('inlineChatVisible', false, (0, nls_1.localize)(1, null));
    exports.$iz = new contextkey_1.$2i('inlineChatFocused', false, (0, nls_1.localize)(2, null));
    exports.$jz = new contextkey_1.$2i('inlineChatResponseFocused', false, (0, nls_1.localize)(3, null));
    exports.$kz = new contextkey_1.$2i('inlineChatEmpty', false, (0, nls_1.localize)(4, null));
    exports.$lz = new contextkey_1.$2i('inlineChatInnerCursorFirst', false, (0, nls_1.localize)(5, null));
    exports.$mz = new contextkey_1.$2i('inlineChatInnerCursorLast', false, (0, nls_1.localize)(6, null));
    exports.$nz = new contextkey_1.$2i('inlineChatInnerCursorStart', false, (0, nls_1.localize)(7, null));
    exports.$oz = new contextkey_1.$2i('inlineChatInnerCursorEnd', false, (0, nls_1.localize)(8, null));
    exports.$pz = new contextkey_1.$2i('inlineChatMarkdownMessageCropState', 'not_cropped', (0, nls_1.localize)(9, null));
    exports.$qz = new contextkey_1.$2i('inlineChatOuterCursorPosition', '', (0, nls_1.localize)(10, null));
    exports.$rz = new contextkey_1.$2i('inlineChatHasActiveRequest', false, (0, nls_1.localize)(11, null));
    exports.$sz = new contextkey_1.$2i('inlineChatHasStashedSession', false, (0, nls_1.localize)(12, null));
    exports.$tz = new contextkey_1.$2i('inlineChatLastResponseType', undefined, (0, nls_1.localize)(13, null));
    exports.$uz = new contextkey_1.$2i('inlineChatResponseTypes', undefined, (0, nls_1.localize)(14, null));
    exports.$vz = new contextkey_1.$2i('inlineChatDidEdit', undefined, (0, nls_1.localize)(15, null));
    exports.$wz = new contextkey_1.$2i('inlineChatUserDidEdit', undefined, (0, nls_1.localize)(16, null));
    exports.$xz = new contextkey_1.$2i('inlineChatLastFeedbackKind', '', (0, nls_1.localize)(17, null));
    exports.$yz = new contextkey_1.$2i('inlineChatDocumentChanged', false, (0, nls_1.localize)(18, null));
    exports.$zz = new contextkey_1.$2i('config.inlineChat.editMode', "live" /* EditMode.Live */);
    // --- (select) action identifier
    exports.$Az = 'interactive.acceptChanges';
    exports.$Bz = 'inlineChat.regenerate';
    exports.$Cz = 'inlineChat.viewInChat';
    // --- menus
    exports.$Dz = actions_1.$Ru.for('inlineChatWidget');
    exports.$Ez = actions_1.$Ru.for('inlineChatWidget.markdownMessage');
    exports.$Fz = actions_1.$Ru.for('inlineChatWidget.status');
    exports.$Gz = actions_1.$Ru.for('inlineChatWidget.feedback');
    exports.$Hz = actions_1.$Ru.for('inlineChatWidget.undo');
    exports.$Iz = actions_1.$Ru.for('inlineChatWidget.toggle');
    // --- colors
    exports.$Jz = (0, colorRegistry_1.$sv)('inlineChat.background', { dark: colorRegistry_1.$Aw, light: colorRegistry_1.$Aw, hcDark: colorRegistry_1.$Aw, hcLight: colorRegistry_1.$Aw }, (0, nls_1.localize)(19, null));
    exports.$Kz = (0, colorRegistry_1.$sv)('inlineChat.border', { dark: colorRegistry_1.$Cw, light: colorRegistry_1.$Cw, hcDark: colorRegistry_1.$Cw, hcLight: colorRegistry_1.$Cw }, (0, nls_1.localize)(20, null));
    exports.$Lz = (0, colorRegistry_1.$sv)('inlineChat.shadow', { dark: colorRegistry_1.$Kv, light: colorRegistry_1.$Kv, hcDark: colorRegistry_1.$Kv, hcLight: colorRegistry_1.$Kv }, (0, nls_1.localize)(21, null));
    exports.$Mz = (0, colorRegistry_1.$sv)('inlineChat.regionHighlight', { dark: colorRegistry_1.$2w, light: colorRegistry_1.$2w, hcDark: colorRegistry_1.$2w, hcLight: colorRegistry_1.$2w }, (0, nls_1.localize)(22, null), true);
    exports.$Nz = (0, colorRegistry_1.$sv)('inlineChatInput.border', { dark: colorRegistry_1.$Cw, light: colorRegistry_1.$Cw, hcDark: colorRegistry_1.$Cw, hcLight: colorRegistry_1.$Cw }, (0, nls_1.localize)(23, null));
    exports.$Oz = (0, colorRegistry_1.$sv)('inlineChatInput.focusBorder', { dark: colorRegistry_1.$zv, light: colorRegistry_1.$zv, hcDark: colorRegistry_1.$zv, hcLight: colorRegistry_1.$zv }, (0, nls_1.localize)(24, null));
    exports.$Pz = (0, colorRegistry_1.$sv)('inlineChatInput.placeholderForeground', { dark: colorRegistry_1.$Tv, light: colorRegistry_1.$Tv, hcDark: colorRegistry_1.$Tv, hcLight: colorRegistry_1.$Tv }, (0, nls_1.localize)(25, null));
    exports.$Qz = (0, colorRegistry_1.$sv)('inlineChatInput.background', { dark: colorRegistry_1.$Mv, light: colorRegistry_1.$Mv, hcDark: colorRegistry_1.$Mv, hcLight: colorRegistry_1.$Mv }, (0, nls_1.localize)(26, null));
    exports.$Rz = (0, colorRegistry_1.$sv)('inlineChatDiff.inserted', { dark: (0, colorRegistry_1.$1y)(colorRegistry_1.$fx, .5), light: (0, colorRegistry_1.$1y)(colorRegistry_1.$fx, .5), hcDark: (0, colorRegistry_1.$1y)(colorRegistry_1.$fx, .5), hcLight: (0, colorRegistry_1.$1y)(colorRegistry_1.$fx, .5) }, (0, nls_1.localize)(27, null));
    exports.$Sz = (0, colorRegistry_1.$sv)('inlineChatDiff.removed', { dark: (0, colorRegistry_1.$1y)(colorRegistry_1.$gx, .5), light: (0, colorRegistry_1.$1y)(colorRegistry_1.$gx, .5), hcDark: (0, colorRegistry_1.$1y)(colorRegistry_1.$gx, .5), hcLight: (0, colorRegistry_1.$1y)(colorRegistry_1.$gx, .5) }, (0, nls_1.localize)(28, null));
    // settings
    var EditMode;
    (function (EditMode) {
        EditMode["Live"] = "live";
        EditMode["LivePreview"] = "livePreview";
        EditMode["Preview"] = "preview";
    })(EditMode || (exports.EditMode = EditMode = {}));
    platform_1.$8m.as(configuration_1.$az.ConfigurationMigration).registerConfigurationMigrations([{
            key: 'interactiveEditor.editMode', migrateFn: (value) => {
                return [['inlineChat.mode', { value: value }]];
            }
        }]);
    platform_1.$8m.as(configurationRegistry_1.$an.Configuration).registerConfiguration({
        id: 'editor',
        properties: {
            'inlineChat.mode': {
                description: (0, nls_1.localize)(29, null),
                default: "livePreview" /* EditMode.LivePreview */,
                type: 'string',
                enum: ["livePreview" /* EditMode.LivePreview */, "preview" /* EditMode.Preview */, "live" /* EditMode.Live */],
                markdownEnumDescriptions: [
                    (0, nls_1.localize)(30, null),
                    (0, nls_1.localize)(31, null),
                    (0, nls_1.localize)(32, null),
                ]
            },
            'inlineChat.showDiff': {
                description: (0, nls_1.localize)(33, null),
                default: true,
                type: 'boolean'
            }
        }
    });
});
//# sourceMappingURL=inlineChat.js.map