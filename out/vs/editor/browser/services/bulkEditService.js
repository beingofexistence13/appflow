/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/base/common/uri", "vs/base/common/types"], function (require, exports, instantiation_1, uri_1, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ResourceFileEdit = exports.ResourceTextEdit = exports.ResourceEdit = exports.IBulkEditService = void 0;
    exports.IBulkEditService = (0, instantiation_1.createDecorator)('IWorkspaceEditService');
    class ResourceEdit {
        constructor(metadata) {
            this.metadata = metadata;
        }
        static convert(edit) {
            return edit.edits.map(edit => {
                if (ResourceTextEdit.is(edit)) {
                    return ResourceTextEdit.lift(edit);
                }
                if (ResourceFileEdit.is(edit)) {
                    return ResourceFileEdit.lift(edit);
                }
                throw new Error('Unsupported edit');
            });
        }
    }
    exports.ResourceEdit = ResourceEdit;
    class ResourceTextEdit extends ResourceEdit {
        static is(candidate) {
            if (candidate instanceof ResourceTextEdit) {
                return true;
            }
            return (0, types_1.isObject)(candidate)
                && uri_1.URI.isUri(candidate.resource)
                && (0, types_1.isObject)(candidate.textEdit);
        }
        static lift(edit) {
            if (edit instanceof ResourceTextEdit) {
                return edit;
            }
            else {
                return new ResourceTextEdit(edit.resource, edit.textEdit, edit.versionId, edit.metadata);
            }
        }
        constructor(resource, textEdit, versionId = undefined, metadata) {
            super(metadata);
            this.resource = resource;
            this.textEdit = textEdit;
            this.versionId = versionId;
        }
    }
    exports.ResourceTextEdit = ResourceTextEdit;
    class ResourceFileEdit extends ResourceEdit {
        static is(candidate) {
            if (candidate instanceof ResourceFileEdit) {
                return true;
            }
            else {
                return (0, types_1.isObject)(candidate)
                    && (Boolean(candidate.newResource) || Boolean(candidate.oldResource));
            }
        }
        static lift(edit) {
            if (edit instanceof ResourceFileEdit) {
                return edit;
            }
            else {
                return new ResourceFileEdit(edit.oldResource, edit.newResource, edit.options, edit.metadata);
            }
        }
        constructor(oldResource, newResource, options = {}, metadata) {
            super(metadata);
            this.oldResource = oldResource;
            this.newResource = newResource;
            this.options = options;
        }
    }
    exports.ResourceFileEdit = ResourceFileEdit;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVsa0VkaXRTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2Jyb3dzZXIvc2VydmljZXMvYnVsa0VkaXRTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVluRixRQUFBLGdCQUFnQixHQUFHLElBQUEsK0JBQWUsRUFBbUIsdUJBQXVCLENBQUMsQ0FBQztJQUUzRixNQUFhLFlBQVk7UUFFeEIsWUFBK0IsUUFBZ0M7WUFBaEMsYUFBUSxHQUFSLFFBQVEsQ0FBd0I7UUFBSSxDQUFDO1FBRXBFLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBbUI7WUFFakMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDNUIsSUFBSSxnQkFBZ0IsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQzlCLE9BQU8sZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUNuQztnQkFFRCxJQUFJLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDOUIsT0FBTyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ25DO2dCQUNELE1BQU0sSUFBSSxLQUFLLENBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUNyQyxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7S0FDRDtJQWpCRCxvQ0FpQkM7SUFFRCxNQUFhLGdCQUFpQixTQUFRLFlBQVk7UUFFakQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxTQUFjO1lBQ3ZCLElBQUksU0FBUyxZQUFZLGdCQUFnQixFQUFFO2dCQUMxQyxPQUFPLElBQUksQ0FBQzthQUNaO1lBQ0QsT0FBTyxJQUFBLGdCQUFRLEVBQUMsU0FBUyxDQUFDO21CQUN0QixTQUFHLENBQUMsS0FBSyxDQUFzQixTQUFVLENBQUMsUUFBUSxDQUFDO21CQUNuRCxJQUFBLGdCQUFRLEVBQXNCLFNBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN4RCxDQUFDO1FBRUQsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUF3QjtZQUNuQyxJQUFJLElBQUksWUFBWSxnQkFBZ0IsRUFBRTtnQkFDckMsT0FBTyxJQUFJLENBQUM7YUFDWjtpQkFBTTtnQkFDTixPQUFPLElBQUksZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQ3pGO1FBQ0YsQ0FBQztRQUVELFlBQ1UsUUFBYSxFQUNiLFFBQWtELEVBQ2xELFlBQWdDLFNBQVMsRUFDbEQsUUFBZ0M7WUFFaEMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBTFAsYUFBUSxHQUFSLFFBQVEsQ0FBSztZQUNiLGFBQVEsR0FBUixRQUFRLENBQTBDO1lBQ2xELGNBQVMsR0FBVCxTQUFTLENBQWdDO1FBSW5ELENBQUM7S0FDRDtJQTNCRCw0Q0EyQkM7SUFFRCxNQUFhLGdCQUFpQixTQUFRLFlBQVk7UUFFakQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxTQUFjO1lBQ3ZCLElBQUksU0FBUyxZQUFZLGdCQUFnQixFQUFFO2dCQUMxQyxPQUFPLElBQUksQ0FBQzthQUNaO2lCQUFNO2dCQUNOLE9BQU8sSUFBQSxnQkFBUSxFQUFDLFNBQVMsQ0FBQzt1QkFDdEIsQ0FBQyxPQUFPLENBQXNCLFNBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxPQUFPLENBQXNCLFNBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO2FBQ25IO1FBQ0YsQ0FBQztRQUVELE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBd0I7WUFDbkMsSUFBSSxJQUFJLFlBQVksZ0JBQWdCLEVBQUU7Z0JBQ3JDLE9BQU8sSUFBSSxDQUFDO2FBQ1o7aUJBQU07Z0JBQ04sT0FBTyxJQUFJLGdCQUFnQixDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUM3RjtRQUNGLENBQUM7UUFFRCxZQUNVLFdBQTRCLEVBQzVCLFdBQTRCLEVBQzVCLFVBQW9DLEVBQUUsRUFDL0MsUUFBZ0M7WUFFaEMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBTFAsZ0JBQVcsR0FBWCxXQUFXLENBQWlCO1lBQzVCLGdCQUFXLEdBQVgsV0FBVyxDQUFpQjtZQUM1QixZQUFPLEdBQVAsT0FBTyxDQUErQjtRQUloRCxDQUFDO0tBQ0Q7SUEzQkQsNENBMkJDIn0=