define(["require", "exports", "vs/nls", "vs/workbench/contrib/search/common/constants", "vs/platform/actions/common/actions", "vs/workbench/contrib/search/browser/searchActionsBase", "vs/platform/quickinput/common/quickInput", "vs/workbench/contrib/search/browser/quickTextSearch/textSearchQuickAccess", "vs/workbench/services/editor/common/editorService", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/search/browser/searchView"], function (require, exports, nls, Constants, actions_1, searchActionsBase_1, quickInput_1, textSearchQuickAccess_1, editorService_1, configuration_1, searchView_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, actions_1.registerAction2)(class TextSearchQuickAccessAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.QuickTextSearchActionId,
                title: {
                    value: nls.localize('quickTextSearch', "Quick Text Search (Experimental)"),
                    original: 'Quick Text Search (Experimental)'
                },
                category: searchActionsBase_1.category,
                f1: true
            });
        }
        async run(accessor, match) {
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const searchText = getSearchText(accessor) ?? '';
            quickInputService.quickAccess.show(textSearchQuickAccess_1.TEXT_SEARCH_QUICK_ACCESS_PREFIX + searchText);
        }
    });
    function getSearchText(accessor) {
        const editorService = accessor.get(editorService_1.IEditorService);
        const configurationService = accessor.get(configuration_1.IConfigurationService);
        const activeEditor = editorService.activeTextEditorControl;
        if (!activeEditor) {
            return null;
        }
        if (!activeEditor.hasTextFocus()) {
            return null;
        }
        // only happen if it would also happen for the search view
        const seedSearchStringFromSelection = configurationService.getValue('editor.find.seedSearchStringFromSelection');
        if (!seedSearchStringFromSelection) {
            return null;
        }
        return (0, searchView_1.getSelectionTextFromEditor)(false, activeEditor);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoQWN0aW9uc1RleHRRdWlja0FjY2Vzcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3NlYXJjaC9icm93c2VyL3NlYXJjaEFjdGlvbnNUZXh0UXVpY2tBY2Nlc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBaUJBLElBQUEseUJBQWUsRUFBQyxNQUFNLDJCQUE0QixTQUFRLGlCQUFPO1FBRWhFO1lBRUMsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSxTQUFTLENBQUMsdUJBQXVCO2dCQUNyQyxLQUFLLEVBQUU7b0JBQ04sS0FBSyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsaUJBQWlCLEVBQUUsa0NBQWtDLENBQUM7b0JBQzFFLFFBQVEsRUFBRSxrQ0FBa0M7aUJBQzVDO2dCQUNELFFBQVEsRUFBUiw0QkFBUTtnQkFDUixFQUFFLEVBQUUsSUFBSTthQUNSLENBQUMsQ0FBQztRQUVKLENBQUM7UUFFUSxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQTBCLEVBQUUsS0FBa0M7WUFDaEYsTUFBTSxpQkFBaUIsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLCtCQUFrQixDQUFDLENBQUM7WUFDM0QsTUFBTSxVQUFVLEdBQUcsYUFBYSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNqRCxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLHVEQUErQixHQUFHLFVBQVUsQ0FBQyxDQUFDO1FBQ2xGLENBQUM7S0FDRCxDQUFDLENBQUM7SUFFSCxTQUFTLGFBQWEsQ0FBQyxRQUEwQjtRQUNoRCxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDhCQUFjLENBQUMsQ0FBQztRQUNuRCxNQUFNLG9CQUFvQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMscUNBQXFCLENBQUMsQ0FBQztRQUVqRSxNQUFNLFlBQVksR0FBWSxhQUFhLENBQUMsdUJBQWtDLENBQUM7UUFDL0UsSUFBSSxDQUFDLFlBQVksRUFBRTtZQUNsQixPQUFPLElBQUksQ0FBQztTQUNaO1FBQ0QsSUFBSSxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsRUFBRTtZQUNqQyxPQUFPLElBQUksQ0FBQztTQUNaO1FBRUQsMERBQTBEO1FBQzFELE1BQU0sNkJBQTZCLEdBQUcsb0JBQW9CLENBQUMsUUFBUSxDQUFVLDJDQUEyQyxDQUFDLENBQUM7UUFDMUgsSUFBSSxDQUFDLDZCQUE2QixFQUFFO1lBQ25DLE9BQU8sSUFBSSxDQUFDO1NBQ1o7UUFFRCxPQUFPLElBQUEsdUNBQTBCLEVBQUMsS0FBSyxFQUFFLFlBQVksQ0FBQyxDQUFDO0lBQ3hELENBQUMifQ==