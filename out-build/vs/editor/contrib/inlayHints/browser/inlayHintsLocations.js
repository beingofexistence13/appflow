/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/actions", "vs/base/common/cancellation", "vs/base/common/uuid", "vs/editor/common/core/range", "vs/editor/common/services/resolverService", "vs/editor/contrib/gotoSymbol/browser/goToCommands", "vs/editor/contrib/peekView/browser/peekView", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/notification/common/notification"], function (require, exports, dom, actions_1, cancellation_1, uuid_1, range_1, resolverService_1, goToCommands_1, peekView_1, actions_2, commands_1, contextkey_1, contextView_1, instantiation_1, notification_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$p9 = exports.$o9 = void 0;
    async function $o9(accessor, editor, anchor, part) {
        const resolverService = accessor.get(resolverService_1.$uA);
        const contextMenuService = accessor.get(contextView_1.$WZ);
        const commandService = accessor.get(commands_1.$Fr);
        const instaService = accessor.get(instantiation_1.$Ah);
        const notificationService = accessor.get(notification_1.$Yu);
        await part.item.resolve(cancellation_1.CancellationToken.None);
        if (!part.part.location) {
            return;
        }
        const location = part.part.location;
        const menuActions = [];
        // from all registered (not active) context menu actions select those
        // that are a symbol navigation actions
        const filter = new Set(actions_2.$Tu.getMenuItems(actions_2.$Ru.EditorContext)
            .map(item => (0, actions_2.$Pu)(item) ? item.command.id : (0, uuid_1.$4f)()));
        for (const delegate of goToCommands_1.$V4.all()) {
            if (filter.has(delegate.desc.id)) {
                menuActions.push(new actions_1.$gi(delegate.desc.id, actions_2.$Vu.label(delegate.desc, { renderShortTitle: true }), undefined, true, async () => {
                    const ref = await resolverService.createModelReference(location.uri);
                    try {
                        const symbolAnchor = new goToCommands_1.$U4(ref.object.textEditorModel, range_1.$ks.getStartPosition(location.range));
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
            menuActions.push(new actions_1.$ii());
            menuActions.push(new actions_1.$gi(command.id, command.title, undefined, true, async () => {
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
                const box = dom.$FO(anchor);
                return { x: box.left, y: box.top + box.height + 8 };
            },
            getActions: () => menuActions,
            onHide: () => {
                editor.focus();
            },
            autoSelectFirstItem: true,
        });
    }
    exports.$o9 = $o9;
    async function $p9(accessor, event, editor, location) {
        const resolverService = accessor.get(resolverService_1.$uA);
        const ref = await resolverService.createModelReference(location.uri);
        await editor.invokeWithinContext(async (accessor) => {
            const openToSide = event.hasSideBySideModifier;
            const contextKeyService = accessor.get(contextkey_1.$3i);
            const isInPeek = peekView_1.PeekContext.inPeekEditor.getValue(contextKeyService);
            const canPeek = !openToSide && editor.getOption(87 /* EditorOption.definitionLinkOpensInPeek */) && !isInPeek;
            const action = new goToCommands_1.$W4({ openToSide, openInPeek: canPeek, muteMessage: true }, { title: { value: '', original: '' }, id: '', precondition: undefined });
            return action.run(accessor, new goToCommands_1.$U4(ref.object.textEditorModel, range_1.$ks.getStartPosition(location.range)), range_1.$ks.lift(location.range));
        });
        ref.dispose();
    }
    exports.$p9 = $p9;
});
//# sourceMappingURL=inlayHintsLocations.js.map