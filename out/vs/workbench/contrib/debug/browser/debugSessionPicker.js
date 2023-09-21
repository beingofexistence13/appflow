define(["require", "exports", "vs/nls", "vs/base/common/filters", "vs/base/common/lifecycle", "vs/workbench/contrib/debug/common/debug", "vs/platform/quickinput/common/quickInput", "vs/workbench/common/views", "vs/platform/commands/common/commands"], function (require, exports, nls, filters_1, lifecycle_1, debug_1, quickInput_1, views_1, commands_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.showDebugSessionMenu = void 0;
    async function showDebugSessionMenu(accessor, selectAndStartID) {
        const quickInputService = accessor.get(quickInput_1.IQuickInputService);
        const debugService = accessor.get(debug_1.IDebugService);
        const viewsService = accessor.get(views_1.IViewsService);
        const commandService = accessor.get(commands_1.ICommandService);
        const localDisposableStore = new lifecycle_1.DisposableStore();
        const quickPick = quickInputService.createQuickPick();
        localDisposableStore.add(quickPick);
        quickPick.matchOnLabel = quickPick.matchOnDescription = quickPick.matchOnDetail = quickPick.sortByLabel = false;
        quickPick.placeholder = nls.localize('moveFocusedView.selectView', 'Search debug sessions by name');
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
    exports.showDebugSessionMenu = showDebugSessionMenu;
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
        const createDebugSessionLabel = nls.localize('workbench.action.debug.startDebug', 'Start a New Debug Session');
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
            ariaLabel = nls.localize('workbench.action.debug.spawnFrom', 'Session {0} spawned from {1}', label, parentName);
            description = parentName;
        }
        return { label, description, ariaLabel };
    }
    function _createPick(session, filter, debugService, viewsService, commandService) {
        const pickInfo = _getSessionInfo(session);
        const highlights = (0, filters_1.matchesFuzzy)(filter, pickInfo.label, true);
        if (highlights) {
            return {
                label: pickInfo.label,
                description: pickInfo.description,
                ariaLabel: pickInfo.ariaLabel,
                highlights: { label: highlights },
                accept: () => {
                    debugService.focusStackFrame(undefined, undefined, session, { explicit: true });
                    if (!viewsService.isViewVisible(debug_1.REPL_VIEW_ID)) {
                        viewsService.openView(debug_1.REPL_VIEW_ID, true);
                    }
                }
            };
        }
        return undefined;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdTZXNzaW9uUGlja2VyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZGVidWcvYnJvd3Nlci9kZWJ1Z1Nlc3Npb25QaWNrZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQWdCTyxLQUFLLFVBQVUsb0JBQW9CLENBQUMsUUFBMEIsRUFBRSxnQkFBd0I7UUFDOUYsTUFBTSxpQkFBaUIsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLCtCQUFrQixDQUFDLENBQUM7UUFDM0QsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxxQkFBYSxDQUFDLENBQUM7UUFDakQsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxxQkFBYSxDQUFDLENBQUM7UUFDakQsTUFBTSxjQUFjLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQywwQkFBZSxDQUFDLENBQUM7UUFFckQsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztRQUNuRCxNQUFNLFNBQVMsR0FBRyxpQkFBaUIsQ0FBQyxlQUFlLEVBQW9CLENBQUM7UUFDeEUsb0JBQW9CLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3BDLFNBQVMsQ0FBQyxZQUFZLEdBQUcsU0FBUyxDQUFDLGtCQUFrQixHQUFHLFNBQVMsQ0FBQyxhQUFhLEdBQUcsU0FBUyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7UUFDaEgsU0FBUyxDQUFDLFdBQVcsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLDRCQUE0QixFQUFFLCtCQUErQixDQUFDLENBQUM7UUFFcEcsTUFBTSxTQUFTLEdBQUcsc0JBQXNCLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxnQkFBZ0IsRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBQ3hILFNBQVMsQ0FBQyxLQUFLLEdBQUcs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