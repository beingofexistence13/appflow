/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookEditorExtensionsRegistry = exports.$Fnb = void 0;
    class EditorContributionRegistry {
        static { this.INSTANCE = new EditorContributionRegistry(); }
        constructor() {
            this.a = [];
        }
        registerEditorContribution(id, ctor) {
            this.a.push({ id, ctor: ctor });
        }
        getEditorContributions() {
            return this.a.slice(0);
        }
    }
    function $Fnb(id, ctor) {
        EditorContributionRegistry.INSTANCE.registerEditorContribution(id, ctor);
    }
    exports.$Fnb = $Fnb;
    var NotebookEditorExtensionsRegistry;
    (function (NotebookEditorExtensionsRegistry) {
        function getEditorContributions() {
            return EditorContributionRegistry.INSTANCE.getEditorContributions();
        }
        NotebookEditorExtensionsRegistry.getEditorContributions = getEditorContributions;
        function getSomeEditorContributions(ids) {
            return EditorContributionRegistry.INSTANCE.getEditorContributions().filter(c => ids.indexOf(c.id) >= 0);
        }
        NotebookEditorExtensionsRegistry.getSomeEditorContributions = getSomeEditorContributions;
    })(NotebookEditorExtensionsRegistry || (exports.NotebookEditorExtensionsRegistry = NotebookEditorExtensionsRegistry = {}));
});
//# sourceMappingURL=notebookEditorExtensions.js.map