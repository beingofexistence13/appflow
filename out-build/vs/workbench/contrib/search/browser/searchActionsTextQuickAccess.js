define(["require", "exports", "vs/nls!vs/workbench/contrib/search/browser/searchActionsTextQuickAccess", "vs/workbench/contrib/search/common/constants", "vs/platform/actions/common/actions", "vs/workbench/contrib/search/browser/searchActionsBase", "vs/platform/quickinput/common/quickInput", "vs/workbench/contrib/search/browser/quickTextSearch/textSearchQuickAccess", "vs/workbench/services/editor/common/editorService", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/search/browser/searchView"], function (require, exports, nls, Constants, actions_1, searchActionsBase_1, quickInput_1, textSearchQuickAccess_1, editorService_1, configuration_1, searchView_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, actions_1.$Xu)(class TextSearchQuickAccessAction extends actions_1.$Wu {
        constructor() {
            super({
                id: Constants.$1Nb,
                title: {
                    value: nls.localize(0, null),
                    original: 'Quick Text Search (Experimental)'
                },
                category: searchActionsBase_1.$vNb,
                f1: true
            });
        }
        async run(accessor, match) {
            const quickInputService = accessor.get(quickInput_1.$Gq);
            const searchText = getSearchText(accessor) ?? '';
            quickInputService.quickAccess.show(textSearchQuickAccess_1.$pPb + searchText);
        }
    });
    function getSearchText(accessor) {
        const editorService = accessor.get(editorService_1.$9C);
        const configurationService = accessor.get(configuration_1.$8h);
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
        return (0, searchView_1.$nPb)(false, activeEditor);
    }
});
//# sourceMappingURL=searchActionsTextQuickAccess.js.map