/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookEditorExtensionsRegistry = exports.registerNotebookContribution = void 0;
    class EditorContributionRegistry {
        static { this.INSTANCE = new EditorContributionRegistry(); }
        constructor() {
            this.editorContributions = [];
        }
        registerEditorContribution(id, ctor) {
            this.editorContributions.push({ id, ctor: ctor });
        }
        getEditorContributions() {
            return this.editorContributions.slice(0);
        }
    }
    function registerNotebookContribution(id, ctor) {
        EditorContributionRegistry.INSTANCE.registerEditorContribution(id, ctor);
    }
    exports.registerNotebookContribution = registerNotebookContribution;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tFZGl0b3JFeHRlbnNpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svYnJvd3Nlci9ub3RlYm9va0VkaXRvckV4dGVuc2lvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBTWhHLE1BQU0sMEJBQTBCO2lCQUNSLGFBQVEsR0FBRyxJQUFJLDBCQUEwQixFQUFFLENBQUM7UUFHbkU7WUFDQyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsRUFBRSxDQUFDO1FBQy9CLENBQUM7UUFFTSwwQkFBMEIsQ0FBb0MsRUFBVSxFQUFFLElBQTBGO1lBQzFLLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQXVDLEVBQUUsQ0FBQyxDQUFDO1FBQ3RGLENBQUM7UUFFTSxzQkFBc0I7WUFDNUIsT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzFDLENBQUM7O0lBR0YsU0FBZ0IsNEJBQTRCLENBQW9DLEVBQVUsRUFBRSxJQUEwRjtRQUNyTCwwQkFBMEIsQ0FBQyxRQUFRLENBQUMsMEJBQTBCLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzFFLENBQUM7SUFGRCxvRUFFQztJQUVELElBQWlCLGdDQUFnQyxDQVNoRDtJQVRELFdBQWlCLGdDQUFnQztRQUVoRCxTQUFnQixzQkFBc0I7WUFDckMsT0FBTywwQkFBMEIsQ0FBQyxRQUFRLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztRQUNyRSxDQUFDO1FBRmUsdURBQXNCLHlCQUVyQyxDQUFBO1FBRUQsU0FBZ0IsMEJBQTBCLENBQUMsR0FBYTtZQUN2RCxPQUFPLDBCQUEwQixDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3pHLENBQUM7UUFGZSwyREFBMEIsNkJBRXpDLENBQUE7SUFDRixDQUFDLEVBVGdCLGdDQUFnQyxnREFBaEMsZ0NBQWdDLFFBU2hEIn0=