/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/nls", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/editor/common/editorResolverService"], function (require, exports, arrays_1, nls, contextkey_1, instantiation_1, editorResolverService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CustomEditorInfoCollection = exports.CustomEditorInfo = exports.CustomEditorPriority = exports.CONTEXT_FOCUSED_CUSTOM_EDITOR_IS_EDITABLE = exports.CONTEXT_ACTIVE_CUSTOM_EDITOR_ID = exports.ICustomEditorService = void 0;
    exports.ICustomEditorService = (0, instantiation_1.createDecorator)('customEditorService');
    exports.CONTEXT_ACTIVE_CUSTOM_EDITOR_ID = new contextkey_1.RawContextKey('activeCustomEditorId', '', {
        type: 'string',
        description: nls.localize('context.customEditor', "The viewType of the currently active custom editor."),
    });
    exports.CONTEXT_FOCUSED_CUSTOM_EDITOR_IS_EDITABLE = new contextkey_1.RawContextKey('focusedCustomEditorIsEditable', false);
    var CustomEditorPriority;
    (function (CustomEditorPriority) {
        CustomEditorPriority["default"] = "default";
        CustomEditorPriority["builtin"] = "builtin";
        CustomEditorPriority["option"] = "option";
    })(CustomEditorPriority || (exports.CustomEditorPriority = CustomEditorPriority = {}));
    class CustomEditorInfo {
        constructor(descriptor) {
            this.id = descriptor.id;
            this.displayName = descriptor.displayName;
            this.providerDisplayName = descriptor.providerDisplayName;
            this.priority = descriptor.priority;
            this.selector = descriptor.selector;
        }
        matches(resource) {
            return this.selector.some(selector => selector.filenamePattern && (0, editorResolverService_1.globMatchesResource)(selector.filenamePattern, resource));
        }
    }
    exports.CustomEditorInfo = CustomEditorInfo;
    class CustomEditorInfoCollection {
        constructor(editors) {
            this.allEditors = (0, arrays_1.distinct)(editors, editor => editor.id);
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
                return (0, editorResolverService_1.priorityToRank)(a.priority) - (0, editorResolverService_1.priorityToRank)(b.priority);
            });
            return editors[0];
        }
    }
    exports.CustomEditorInfoCollection = CustomEditorInfoCollection;
    function isLowerPriority(otherEditor, editor) {
        return (0, editorResolverService_1.priorityToRank)(otherEditor.priority) < (0, editorResolverService_1.priorityToRank)(editor.priority);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VzdG9tRWRpdG9yLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY3VzdG9tRWRpdG9yL2NvbW1vbi9jdXN0b21FZGl0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBYW5GLFFBQUEsb0JBQW9CLEdBQUcsSUFBQSwrQkFBZSxFQUF1QixxQkFBcUIsQ0FBQyxDQUFDO0lBRXBGLFFBQUEsK0JBQStCLEdBQUcsSUFBSSwwQkFBYSxDQUFTLHNCQUFzQixFQUFFLEVBQUUsRUFBRTtRQUNwRyxJQUFJLEVBQUUsUUFBUTtRQUNkLFdBQVcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLHNCQUFzQixFQUFFLHFEQUFxRCxDQUFDO0tBQ3hHLENBQUMsQ0FBQztJQUVVLFFBQUEseUNBQXlDLEdBQUcsSUFBSSwwQkFBYSxDQUFVLCtCQUErQixFQUFFLEtBQUssQ0FBQyxDQUFDO0lBb0Q1SCxJQUFrQixvQkFJakI7SUFKRCxXQUFrQixvQkFBb0I7UUFDckMsMkNBQW1CLENBQUE7UUFDbkIsMkNBQW1CLENBQUE7UUFDbkIseUNBQWlCLENBQUE7SUFDbEIsQ0FBQyxFQUppQixvQkFBb0Isb0NBQXBCLG9CQUFvQixRQUlyQztJQWNELE1BQWEsZ0JBQWdCO1FBUTVCLFlBQVksVUFBa0M7WUFDN0MsSUFBSSxDQUFDLEVBQUUsR0FBRyxVQUFVLENBQUMsRUFBRSxDQUFDO1lBQ3hCLElBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDLFdBQVcsQ0FBQztZQUMxQyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsVUFBVSxDQUFDLG1CQUFtQixDQUFDO1lBQzFELElBQUksQ0FBQyxRQUFRLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQztZQUNwQyxJQUFJLENBQUMsUUFBUSxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUM7UUFDckMsQ0FBQztRQUVELE9BQU8sQ0FBQyxRQUFhO1lBQ3BCLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsZUFBZSxJQUFJLElBQUEsMkNBQW1CLEVBQUMsUUFBUSxDQUFDLGVBQWUsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQzVILENBQUM7S0FDRDtJQW5CRCw0Q0FtQkM7SUFFRCxNQUFhLDBCQUEwQjtRQUl0QyxZQUNDLE9BQW9DO1lBRXBDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBQSxpQkFBUSxFQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMxRCxDQUFDO1FBRUQsSUFBVyxNQUFNLEtBQWEsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFFOUQ7OztXQUdHO1FBQ0gsSUFBVyxhQUFhO1lBQ3ZCLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQ3BDLFFBQVEsTUFBTSxDQUFDLFFBQVEsRUFBRTtvQkFDeEIsS0FBSyxnREFBd0IsQ0FBQyxPQUFPLENBQUM7b0JBQ3RDLEtBQUssZ0RBQXdCLENBQUMsT0FBTzt3QkFDcEMsaUZBQWlGO3dCQUNqRixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQzFDLFdBQVcsS0FBSyxNQUFNLElBQUksZUFBZSxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO29CQUVsRTt3QkFDQyxPQUFPLEtBQUssQ0FBQztpQkFDZDtZQUNGLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVEOzs7OztXQUtHO1FBQ0gsSUFBVyxtQkFBbUI7WUFDN0IsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUN6RCxPQUFPLElBQUEsc0NBQWMsRUFBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsSUFBQSxzQ0FBYyxFQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNoRSxDQUFDLENBQUMsQ0FBQztZQUNILE9BQU8sT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ25CLENBQUM7S0FDRDtJQTNDRCxnRUEyQ0M7SUFFRCxTQUFTLGVBQWUsQ0FBQyxXQUE2QixFQUFFLE1BQXdCO1FBQy9FLE9BQU8sSUFBQSxzQ0FBYyxFQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsR0FBRyxJQUFBLHNDQUFjLEVBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQy9FLENBQUMifQ==