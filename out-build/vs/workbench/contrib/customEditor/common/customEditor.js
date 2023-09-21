/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/nls!vs/workbench/contrib/customEditor/common/customEditor", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/editor/common/editorResolverService"], function (require, exports, arrays_1, nls, contextkey_1, instantiation_1, editorResolverService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$_eb = exports.$$eb = exports.CustomEditorPriority = exports.$0eb = exports.$9eb = exports.$8eb = void 0;
    exports.$8eb = (0, instantiation_1.$Bh)('customEditorService');
    exports.$9eb = new contextkey_1.$2i('activeCustomEditorId', '', {
        type: 'string',
        description: nls.localize(0, null),
    });
    exports.$0eb = new contextkey_1.$2i('focusedCustomEditorIsEditable', false);
    var CustomEditorPriority;
    (function (CustomEditorPriority) {
        CustomEditorPriority["default"] = "default";
        CustomEditorPriority["builtin"] = "builtin";
        CustomEditorPriority["option"] = "option";
    })(CustomEditorPriority || (exports.CustomEditorPriority = CustomEditorPriority = {}));
    class $$eb {
        constructor(descriptor) {
            this.id = descriptor.id;
            this.displayName = descriptor.displayName;
            this.providerDisplayName = descriptor.providerDisplayName;
            this.priority = descriptor.priority;
            this.selector = descriptor.selector;
        }
        matches(resource) {
            return this.selector.some(selector => selector.filenamePattern && (0, editorResolverService_1.$sbb)(selector.filenamePattern, resource));
        }
    }
    exports.$$eb = $$eb;
    class $_eb {
        constructor(editors) {
            this.allEditors = (0, arrays_1.$Kb)(editors, editor => editor.id);
        }
        get length() { return this.allEditors.length; }
        /**
         * Find the single default editor to use (if any) by looking at the editor's priority and the
         * other contributed editors.
         */
        get defaultEditor() {
            return this.allEditors.find(editor => {
                switch (editor.priority) {
                    case editorResolverService_1.RegisteredEditorPriority.default:
                    case editorResolverService_1.RegisteredEditorPriority.builtin:
                        // A default editor must have higher priority than all other contributed editors.
                        return this.allEditors.every(otherEditor => otherEditor === editor || isLowerPriority(otherEditor, editor));
                    default:
                        return false;
                }
            });
        }
        /**
         * Find the best available editor to use.
         *
         * Unlike the `defaultEditor`, a bestAvailableEditor can exist even if there are other editors with
         * the same priority.
         */
        get bestAvailableEditor() {
            const editors = Array.from(this.allEditors).sort((a, b) => {
                return (0, editorResolverService_1.$rbb)(a.priority) - (0, editorResolverService_1.$rbb)(b.priority);
            });
            return editors[0];
        }
    }
    exports.$_eb = $_eb;
    function isLowerPriority(otherEditor, editor) {
        return (0, editorResolverService_1.$rbb)(otherEditor.priority) < (0, editorResolverService_1.$rbb)(editor.priority);
    }
});
//# sourceMappingURL=customEditor.js.map