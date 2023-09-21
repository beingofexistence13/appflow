define(["require", "exports", "vs/nls!vs/workbench/contrib/debug/browser/debugSessionPicker", "vs/base/common/filters", "vs/base/common/lifecycle", "vs/workbench/contrib/debug/common/debug", "vs/platform/quickinput/common/quickInput", "vs/workbench/common/views", "vs/platform/commands/common/commands"], function (require, exports, nls, filters_1, lifecycle_1, debug_1, quickInput_1, views_1, commands_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$cQb = void 0;
    async function $cQb(accessor, selectAndStartID) {
        const quickInputService = accessor.get(quickInput_1.$Gq);
        const debugService = accessor.get(debug_1.$nH);
        const viewsService = accessor.get(views_1.$$E);
        const commandService = accessor.get(commands_1.$Fr);
        const localDisposableStore = new lifecycle_1.$jc();
        const quickPick = quickInputService.createQuickPick();
        localDisposableStore.add(quickPick);
        quickPick.matchOnLabel = quickPick.matchOnDescription = quickPick.matchOnDetail = quickPick.sortByLabel = false;
        quickPick.placeholder = nls.localize(0, null);
        const pickItems = _getPicksAndActiveItem(quickPick.value, selectAndStartID, debugService, viewsService, commandService);
        quickPick.items = pickItems.picks;
        quickPick.activeItems = pickItems.activeItems;
        localDisposableStore.add(quickPick.onDidChangeValue(async () => {
            quickPick.items = _getPicksAndActiveItem(quickPick.value, selectAndStartID, debugService, viewsService, commandService).picks;
        }));
        localDisposableStore.add(quickPick.onDidAccept(() => {
            const selectedItem = quickPick.selectedItems[0];
            selectedItem.accept();
            quickPick.hide();
            localDisposableStore.dispose();
        }));
        quickPick.show();
    }
    exports.$cQb = $cQb;
    function _getPicksAndActiveItem(filter, selectAndStartID, debugService, viewsService, commandService) {
        const debugConsolePicks = [];
        const headerSessions = [];
        const currSession = debugService.getViewModel().focusedSession;
        const sessions = debugService.getModel().getSessions(false);
        const activeItems = [];
        sessions.forEach((session) => {
            if (session.compact && session.parentSession) {
                headerSessions.push(session.parentSession);
            }
        });
        sessions.forEach((session) => {
            const isHeader = headerSessions.includes(session);
            if (!session.parentSession) {
                debugConsolePicks.push({ type: 'separator', label: isHeader ? session.name : undefined });
            }
            if (!isHeader) {
                const pick = _createPick(session, filter, debugService, viewsService, commandService);
                if (pick) {
                    debugConsolePicks.push(pick);
                    if (session.getId() === currSession?.getId()) {
                        activeItems.push(pick);
                    }
                }
            }
        });
        if (debugConsolePicks.length) {
            debugConsolePicks.push({ type: 'separator' });
        }
        const createDebugSessionLabel = nls.localize(1, null);
        debugConsolePicks.push({
            label: `$(plus) ${createDebugSessionLabel}`,
            ariaLabel: createDebugSessionLabel,
            accept: () => commandService.executeCommand(selectAndStartID)
        });
        return { picks: debugConsolePicks, activeItems };
    }
    function _getSessionInfo(session) {
        const label = (!session.configuration.name.length) ? session.name : session.configuration.name;
        const parentName = session.compact ? undefined : session.parentSession?.configuration.name;
        let description = '';
        let ariaLabel = '';
        if (parentName) {
            ariaLabel = nls.localize(2, null, label, parentName);
            description = parentName;
        }
        return { label, description, ariaLabel };
    }
    function _createPick(session, filter, debugService, viewsService, commandService) {
        const pickInfo = _getSessionInfo(session);
        const highlights = (0, filters_1.$Ej)(filter, pickInfo.label, true);
        if (highlights) {
            return {
                label: pickInfo.label,
                description: pickInfo.description,
                ariaLabel: pickInfo.ariaLabel,
                highlights: { label: highlights },
                accept: () => {
                    debugService.focusStackFrame(undefined, undefined, session, { explicit: true });
                    if (!viewsService.isViewVisible(debug_1.$rG)) {
                        viewsService.openView(debug_1.$rG, true);
                    }
                }
            };
        }
        return undefined;
    }
});
//# sourceMappingURL=debugSessionPicker.js.map