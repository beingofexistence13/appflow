/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/actions", "vs/base/common/cancellation", "vs/base/common/uuid", "vs/editor/common/core/range", "vs/editor/common/services/resolverService", "vs/editor/contrib/gotoSymbol/browser/goToCommands", "vs/editor/contrib/peekView/browser/peekView", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/notification/common/notification"], function (require, exports, dom, actions_1, cancellation_1, uuid_1, range_1, resolverService_1, goToCommands_1, peekView_1, actions_2, commands_1, contextkey_1, contextView_1, instantiation_1, notification_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.goToDefinitionWithLocation = exports.showGoToContextMenu = void 0;
    async function showGoToContextMenu(accessor, editor, anchor, part) {
        const resolverService = accessor.get(resolverService_1.ITextModelService);
        const contextMenuService = accessor.get(contextView_1.IContextMenuService);
        const commandService = accessor.get(commands_1.ICommandService);
        const instaService = accessor.get(instantiation_1.IInstantiationService);
        const notificationService = accessor.get(notification_1.INotificationService);
        await part.item.resolve(cancellation_1.CancellationToken.None);
        if (!part.part.location) {
            return;
        }
        const location = part.part.location;
        const menuActions = [];
        // from all registered (not active) context menu actions select those
        // that are a symbol navigation actions
        const filter = new Set(actions_2.MenuRegistry.getMenuItems(actions_2.MenuId.EditorContext)
            .map(item => (0, actions_2.isIMenuItem)(item) ? item.command.id : (0, uuid_1.generateUuid)()));
        for (const delegate of goToCommands_1.SymbolNavigationAction.all()) {
            if (filter.has(delegate.desc.id)) {
                menuActions.push(new actions_1.Action(delegate.desc.id, actions_2.MenuItemAction.label(delegate.desc, { renderShortTitle: true }), undefined, true, async () => {
                    const ref = await resolverService.createModelReference(location.uri);
                    try {
                        const symbolAnchor = new goToCommands_1.SymbolNavigationAnchor(ref.object.textEditorModel, range_1.Range.getStartPosition(location.range));
                        const range = part.item.anchor.range;
                        await instaService.invokeFunction(delegate.runEditorCommand.bind(delegate), editor, symbolAnchor, range);
                    }
                    finally {
                        ref.dispose();
                    }
                }));
            }
        }
        if (part.part.command) {
            const { command } = part.part;
            menuActions.push(new actions_1.Separator());
            menuActions.push(new actions_1.Action(command.id, command.title, undefined, true, async () => {
                try {
                    await commandService.executeCommand(command.id, ...(command.arguments ?? []));
                }
                catch (err) {
                    notificationService.notify({
                        severity: notification_1.Severity.Error,
                        source: part.item.provider.displayName,
                        message: err
                    });
                }
            }));
        }
        // show context menu
        const useShadowDOM = editor.getOption(126 /* EditorOption.useShadowDOM */);
        contextMenuService.showContextMenu({
            domForShadowRoot: useShadowDOM ? editor.getDomNode() ?? undefined : undefined,
            getAnchor: () => {
                const box = dom.getDomNodePagePosition(anchor);
                return { x: box.left, y: box.top + box.height + 8 };
            },
            getActions: () => menuActions,
            onHide: () => {
                editor.focus();
            },
            autoSelectFirstItem: true,
        });
    }
    exports.showGoToContextMenu = showGoToContextMenu;
    async function goToDefinitionWithLocation(accessor, event, editor, location) {
        const resolverService = accessor.get(resolverService_1.ITextModelService);
        const ref = await resolverService.createModelReference(location.uri);
        await editor.invokeWithinContext(async (accessor) => {
            const openToSide = event.hasSideBySideModifier;
            const contextKeyService = accessor.get(contextkey_1.IContextKeyService);
            const isInPeek = peekView_1.PeekContext.inPeekEditor.getValue(contextKeyService);
            const canPeek = !openToSide && editor.getOption(87 /* EditorOption.definitionLinkOpensInPeek */) && !isInPeek;
            const action = new goToCommands_1.DefinitionAction({ openToSide, openInPeek: canPeek, muteMessage: true }, { title: { value: '', original: '' }, id: '', precondition: undefined });
            return action.run(accessor, new goToCommands_1.SymbolNavigationAnchor(ref.object.textEditorModel, range_1.Range.getStartPosition(location.range)), range_1.Range.lift(location.range));
        });
        ref.dispose();
    }
    exports.goToDefinitionWithLocation = goToDefinitionWithLocation;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5sYXlIaW50c0xvY2F0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2lubGF5SGludHMvYnJvd3Nlci9pbmxheUhpbnRzTG9jYXRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQXNCekYsS0FBSyxVQUFVLG1CQUFtQixDQUFDLFFBQTBCLEVBQUUsTUFBbUIsRUFBRSxNQUFtQixFQUFFLElBQWdDO1FBRS9JLE1BQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsbUNBQWlCLENBQUMsQ0FBQztRQUN4RCxNQUFNLGtCQUFrQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsaUNBQW1CLENBQUMsQ0FBQztRQUM3RCxNQUFNLGNBQWMsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDBCQUFlLENBQUMsQ0FBQztRQUNyRCxNQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHFDQUFxQixDQUFDLENBQUM7UUFDekQsTUFBTSxtQkFBbUIsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLG1DQUFvQixDQUFDLENBQUM7UUFFL0QsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQ0FBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVoRCxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDeEIsT0FBTztTQUNQO1FBRUQsTUFBTSxRQUFRLEdBQWEsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDOUMsTUFBTSxXQUFXLEdBQWMsRUFBRSxDQUFDO1FBRWxDLHFFQUFxRTtRQUNyRSx1Q0FBdUM7UUFDdkMsTUFBTSxNQUFNLEdBQUcsSUFBSSxHQUFHLENBQUMsc0JBQVksQ0FBQyxZQUFZLENBQUMsZ0JBQU0sQ0FBQyxhQUFhLENBQUM7YUFDcEUsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBQSxxQkFBVyxFQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBQSxtQkFBWSxHQUFFLENBQUMsQ0FBQyxDQUFDO1FBRXJFLEtBQUssTUFBTSxRQUFRLElBQUkscUNBQXNCLENBQUMsR0FBRyxFQUFFLEVBQUU7WUFDcEQsSUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUU7Z0JBQ2pDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxnQkFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLHdCQUFjLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsRUFBRSxnQkFBZ0IsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsS0FBSyxJQUFJLEVBQUU7b0JBQzFJLE1BQU0sR0FBRyxHQUFHLE1BQU0sZUFBZSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDckUsSUFBSTt3QkFDSCxNQUFNLFlBQVksR0FBRyxJQUFJLHFDQUFzQixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFLGFBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQzt3QkFDcEgsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO3dCQUNyQyxNQUFNLFlBQVksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDO3FCQUN6Rzs0QkFBUzt3QkFDVCxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUM7cUJBRWQ7Z0JBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNKO1NBQ0Q7UUFFRCxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ3RCLE1BQU0sRUFBRSxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQzlCLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxtQkFBUyxFQUFFLENBQUMsQ0FBQztZQUNsQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksZ0JBQU0sQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxLQUFLLElBQUksRUFBRTtnQkFDbEYsSUFBSTtvQkFDSCxNQUFNLGNBQWMsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLFNBQVMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO2lCQUM5RTtnQkFBQyxPQUFPLEdBQUcsRUFBRTtvQkFDYixtQkFBbUIsQ0FBQyxNQUFNLENBQUM7d0JBQzFCLFFBQVEsRUFBRSx1QkFBUSxDQUFDLEtBQUs7d0JBQ3hCLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXO3dCQUN0QyxPQUFPLEVBQUUsR0FBRztxQkFDWixDQUFDLENBQUM7aUJBQ0g7WUFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ0o7UUFFRCxvQkFBb0I7UUFDcEIsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLFNBQVMscUNBQTJCLENBQUM7UUFDakUsa0JBQWtCLENBQUMsZUFBZSxDQUFDO1lBQ2xDLGdCQUFnQixFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUztZQUM3RSxTQUFTLEVBQUUsR0FBRyxFQUFFO2dCQUNmLE1BQU0sR0FBRyxHQUFHLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDL0MsT0FBTyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDckQsQ0FBQztZQUNELFVBQVUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxXQUFXO1lBQzdCLE1BQU0sRUFBRSxHQUFHLEVBQUU7Z0JBQ1osTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2hCLENBQUM7WUFDRCxtQkFBbUIsRUFBRSxJQUFJO1NBQ3pCLENBQUMsQ0FBQztJQUVKLENBQUM7SUFyRUQsa0RBcUVDO0lBRU0sS0FBSyxVQUFVLDBCQUEwQixDQUFDLFFBQTBCLEVBQUUsS0FBMEIsRUFBRSxNQUF5QixFQUFFLFFBQWtCO1FBRXJKLE1BQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsbUNBQWlCLENBQUMsQ0FBQztRQUN4RCxNQUFNLEdBQUcsR0FBRyxNQUFNLGVBQWUsQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFckUsTUFBTSxNQUFNLENBQUMsbUJBQW1CLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxFQUFFO1lBRW5ELE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQztZQUMvQyxNQUFNLGlCQUFpQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsK0JBQWtCLENBQUMsQ0FBQztZQUUzRCxNQUFNLFFBQVEsR0FBRyxzQkFBVyxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUN0RSxNQUFNLE9BQU8sR0FBRyxDQUFDLFVBQVUsSUFBSSxNQUFNLENBQUMsU0FBUyxpREFBd0MsSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUVyRyxNQUFNLE1BQU0sR0FBRyxJQUFJLCtCQUFnQixDQUFDLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxZQUFZLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQztZQUNySyxPQUFPLE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLElBQUkscUNBQXNCLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUUsYUFBSyxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLGFBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDekosQ0FBQyxDQUFDLENBQUM7UUFFSCxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDZixDQUFDO0lBbEJELGdFQWtCQyJ9