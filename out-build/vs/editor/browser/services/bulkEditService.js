/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/base/common/uri", "vs/base/common/types"], function (require, exports, instantiation_1, uri_1, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$q1 = exports.$p1 = exports.$o1 = exports.$n1 = void 0;
    exports.$n1 = (0, instantiation_1.$Bh)('IWorkspaceEditService');
    class $o1 {
        constructor(metadata) {
            this.metadata = metadata;
        }
        static convert(edit) {
            return edit.edits.map(edit => {
                if ($p1.is(edit)) {
                    return $p1.lift(edit);
                }
                if ($q1.is(edit)) {
                    return $q1.lift(edit);
                }
                throw new Error('Unsupported edit');
            });
        }
    }
    exports.$o1 = $o1;
    class $p1 extends $o1 {
        static is(candidate) {
            if (candidate instanceof $p1) {
                return true;
            }
            return (0, types_1.$lf)(candidate)
                && uri_1.URI.isUri(candidate.resource)
                && (0, types_1.$lf)(candidate.textEdit);
        }
        static lift(edit) {
            if (edit instanceof $p1) {
                return edit;
            }
            else {
                return new $p1(edit.resource, edit.textEdit, edit.versionId, edit.metadata);
            }
        }
        constructor(resource, textEdit, versionId = undefined, metadata) {
            super(metadata);
            this.resource = resource;
            this.textEdit = textEdit;
            this.versionId = versionId;
        }
    }
    exports.$p1 = $p1;
    class $q1 extends $o1 {
        static is(candidate) {
            if (candidate instanceof $q1) {
                return true;
            }
            else {
                return (0, types_1.$lf)(candidate)
                    && (Boolean(candidate.newResource) || Boolean(candidate.oldResource));
            }
        }
        static lift(edit) {
            if (edit instanceof $q1) {
                return edit;
            }
            else {
                return new $q1(edit.oldResource, edit.newResource, edit.options, edit.metadata);
            }
        }
        constructor(oldResource, newResource, options = {}, metadata) {
            super(metadata);
            this.oldResource = oldResource;
            this.newResource = newResource;
            this.options = options;
        }
    }
    exports.$q1 = $q1;
});
//# sourceMappingURL=bulkEditService.js.map