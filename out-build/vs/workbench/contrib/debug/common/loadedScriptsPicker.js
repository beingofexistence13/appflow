define(["require", "exports", "vs/nls!vs/workbench/contrib/debug/common/loadedScriptsPicker", "vs/base/common/filters", "vs/platform/quickinput/common/quickInput", "vs/workbench/contrib/debug/common/debug", "vs/workbench/services/editor/common/editorService", "vs/editor/common/services/getIconClasses", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/platform/label/common/label"], function (require, exports, nls, filters_1, quickInput_1, debug_1, editorService_1, getIconClasses_1, model_1, language_1, lifecycle_1, resources_1, label_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$bQb = void 0;
    /**
     * This function takes a regular quickpick and makes one for loaded scripts that has persistent headers
     * e.g. when some picks are filtered out, the ones that are visible still have its header.
     */
    async function $bQb(accessor) {
        const quickInputService = accessor.get(quickInput_1.$Gq);
        const debugService = accessor.get(debug_1.$nH);
        const editorService = accessor.get(editorService_1.$9C);
        const sessions = debugService.getModel().getSessions(false);
        const modelService = accessor.get(model_1.$yA);
        const languageService = accessor.get(language_1.$ct);
        const labelService = accessor.get(label_1.$Vz);
        const localDisposableStore = new lifecycle_1.$jc();
        const quickPick = quickInputService.createQuickPick();
        localDisposableStore.add(quickPick);
        quickPick.matchOnLabel = quickPick.matchOnDescription = quickPick.matchOnDetail = quickPick.sortByLabel = false;
        quickPick.placeholder = nls.localize(0, null);
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
    exports.$bQb = $bQb;
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
        const desc = labelService.getUriLabel((0, resources_1.$hg)(source.uri));
        // manually filter so that headers don't get filtered out
        const labelHighlights = (0, filters_1.$Ej)(filter, label, true);
        const descHighlights = (0, filters_1.$Ej)(filter, desc, true);
        if (labelHighlights || descHighlights) {
            return {
                label,
                description: desc === '.' ? undefined : desc,
                highlights: { label: labelHighlights ?? undefined, description: descHighlights ?? undefined },
                iconClasses: (0, getIconClasses_1.$x6)(modelService, languageService, source.uri),
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
//# sourceMappingURL=loadedScriptsPicker.js.map