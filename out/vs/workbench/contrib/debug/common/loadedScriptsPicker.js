define(["require", "exports", "vs/nls", "vs/base/common/filters", "vs/platform/quickinput/common/quickInput", "vs/workbench/contrib/debug/common/debug", "vs/workbench/services/editor/common/editorService", "vs/editor/common/services/getIconClasses", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/platform/label/common/label"], function (require, exports, nls, filters_1, quickInput_1, debug_1, editorService_1, getIconClasses_1, model_1, language_1, lifecycle_1, resources_1, label_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.showLoadedScriptMenu = void 0;
    /**
     * This function takes a regular quickpick and makes one for loaded scripts that has persistent headers
     * e.g. when some picks are filtered out, the ones that are visible still have its header.
     */
    async function showLoadedScriptMenu(accessor) {
        const quickInputService = accessor.get(quickInput_1.IQuickInputService);
        const debugService = accessor.get(debug_1.IDebugService);
        const editorService = accessor.get(editorService_1.IEditorService);
        const sessions = debugService.getModel().getSessions(false);
        const modelService = accessor.get(model_1.IModelService);
        const languageService = accessor.get(language_1.ILanguageService);
        const labelService = accessor.get(label_1.ILabelService);
        const localDisposableStore = new lifecycle_1.DisposableStore();
        const quickPick = quickInputService.createQuickPick();
        localDisposableStore.add(quickPick);
        quickPick.matchOnLabel = quickPick.matchOnDescription = quickPick.matchOnDetail = quickPick.sortByLabel = false;
        quickPick.placeholder = nls.localize('moveFocusedView.selectView', "Search loaded scripts by name");
        quickPick.items = await _getPicks(quickPick.value, sessions, editorService, modelService, languageService, labelService);
        localDisposableStore.add(quickPick.onDidChangeValue(async () => {
            quickPick.items = await _getPicks(quickPick.value, sessions, editorService, modelService, languageService, labelService);
        }));
        localDisposableStore.add(quickPick.onDidAccept(() => {
            const selectedItem = quickPick.selectedItems[0];
            selectedItem.accept();
            quickPick.hide();
            localDisposableStore.dispose();
        }));
        quickPick.show();
    }
    exports.showLoadedScriptMenu = showLoadedScriptMenu;
    async function _getPicksFromSession(session, filter, editorService, modelService, languageService, labelService) {
        const items = [];
        items.push({ type: 'separator', label: session.name });
        const sources = await session.getLoadedSources();
        sources.forEach((element) => {
            const pick = _createPick(element, filter, editorService, modelService, languageService, labelService);
            if (pick) {
                items.push(pick);
            }
        });
        return items;
    }
    async function _getPicks(filter, sessions, editorService, modelService, languageService, labelService) {
        const loadedScriptPicks = [];
        const picks = await Promise.all(sessions.map((session) => _getPicksFromSession(session, filter, editorService, modelService, languageService, labelService)));
        for (const row of picks) {
            for (const elem of row) {
                loadedScriptPicks.push(elem);
            }
        }
        return loadedScriptPicks;
    }
    function _createPick(source, filter, editorService, modelService, languageService, labelService) {
        const label = labelService.getUriBasenameLabel(source.uri);
        const desc = labelService.getUriLabel((0, resources_1.dirname)(source.uri));
        // manually filter so that headers don't get filtered out
        const labelHighlights = (0, filters_1.matchesFuzzy)(filter, label, true);
        const descHighlights = (0, filters_1.matchesFuzzy)(filter, desc, true);
        if (labelHighlights || descHighlights) {
            return {
                label,
                description: desc === '.' ? undefined : desc,
                highlights: { label: labelHighlights ?? undefined, description: descHighlights ?? undefined },
                iconClasses: (0, getIconClasses_1.getIconClasses)(modelService, languageService, source.uri),
                accept: () => {
                    if (source.available) {
                        source.openInEditor(editorService, { startLineNumber: 0, startColumn: 0, endLineNumber: 0, endColumn: 0 });
                    }
                }
            };
        }
        return undefined;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9hZGVkU2NyaXB0c1BpY2tlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2RlYnVnL2NvbW1vbi9sb2FkZWRTY3JpcHRzUGlja2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUF1QkE7OztPQUdHO0lBQ0ksS0FBSyxVQUFVLG9CQUFvQixDQUFDLFFBQTBCO1FBQ3BFLE1BQU0saUJBQWlCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQywrQkFBa0IsQ0FBQyxDQUFDO1FBQzNELE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMscUJBQWEsQ0FBQyxDQUFDO1FBQ2pELE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsOEJBQWMsQ0FBQyxDQUFDO1FBQ25ELE1BQU0sUUFBUSxHQUFHLFlBQVksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDNUQsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxxQkFBYSxDQUFDLENBQUM7UUFDakQsTUFBTSxlQUFlLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQywyQkFBZ0IsQ0FBQyxDQUFDO1FBQ3ZELE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMscUJBQWEsQ0FBQyxDQUFDO1FBRWpELE1BQU0sb0JBQW9CLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7UUFDbkQsTUFBTSxTQUFTLEdBQUcsaUJBQWlCLENBQUMsZUFBZSxFQUFvQixDQUFDO1FBQ3hFLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNwQyxTQUFTLENBQUMsWUFBWSxHQUFHLFNBQVMsQ0FBQyxrQkFBa0IsR0FBRyxTQUFTLENBQUMsYUFBYSxHQUFHLFNBQVMsQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO1FBQ2hILFNBQVMsQ0FB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