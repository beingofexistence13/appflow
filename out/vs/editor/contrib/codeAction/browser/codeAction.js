/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/arrays", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/editor/browser/services/bulkEditService", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/services/languageFeatures", "vs/editor/common/services/model", "vs/editor/contrib/editorState/browser/editorState", "vs/platform/commands/common/commands", "vs/platform/notification/common/notification", "vs/platform/progress/common/progress", "vs/platform/telemetry/common/telemetry", "../common/types"], function (require, exports, nls, arrays_1, cancellation_1, errors_1, lifecycle_1, uri_1, bulkEditService_1, range_1, selection_1, languageFeatures_1, model_1, editorState_1, commands_1, notification_1, progress_1, telemetry_1, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.applyCodeAction = exports.ApplyCodeActionReason = exports.getCodeActions = exports.fixAllCommandId = exports.organizeImportsCommandId = exports.sourceActionCommandId = exports.refactorPreviewCommandId = exports.refactorCommandId = exports.autoFixCommandId = exports.quickFixCommandId = exports.codeActionCommandId = void 0;
    exports.codeActionCommandId = 'editor.action.codeAction';
    exports.quickFixCommandId = 'editor.action.quickFix';
    exports.autoFixCommandId = 'editor.action.autoFix';
    exports.refactorCommandId = 'editor.action.refactor';
    exports.refactorPreviewCommandId = 'editor.action.refactor.preview';
    exports.sourceActionCommandId = 'editor.action.sourceAction';
    exports.organizeImportsCommandId = 'editor.action.organizeImports';
    exports.fixAllCommandId = 'editor.action.fixAll';
    class ManagedCodeActionSet extends lifecycle_1.Disposable {
        static codeActionsPreferredComparator(a, b) {
            if (a.isPreferred && !b.isPreferred) {
                return -1;
            }
            else if (!a.isPreferred && b.isPreferred) {
                return 1;
            }
            else {
                return 0;
            }
        }
        static codeActionsComparator({ action: a }, { action: b }) {
            if ((0, arrays_1.isNonEmptyArray)(a.diagnostics)) {
                return (0, arrays_1.isNonEmptyArray)(b.diagnostics) ? ManagedCodeActionSet.codeActionsPreferredComparator(a, b) : -1;
            }
            else if ((0, arrays_1.isNonEmptyArray)(b.diagnostics)) {
                return 1;
            }
            else {
                return ManagedCodeActionSet.codeActionsPreferredComparator(a, b); // both have no diagnostics
            }
        }
        constructor(actions, documentation, disposables) {
            super();
            this.documentation = documentation;
            this._register(disposables);
            this.allActions = [...actions].sort(ManagedCodeActionSet.codeActionsComparator);
            this.validActions = this.allActions.filter(({ action }) => !action.disabled);
        }
        get hasAutoFix() {
            return this.validActions.some(({ action: fix }) => !!fix.kind && types_1.CodeActionKind.QuickFix.contains(new types_1.CodeActionKind(fix.kind)) && !!fix.isPreferred);
        }
    }
    const emptyCodeActionsResponse = { actions: [], documentation: undefined };
    async function getCodeActions(registry, model, rangeOrSelection, trigger, progress, token) {
        const filter = trigger.filter || {};
        const notebookFilter = {
            ...filter,
            excludes: [...(filter.excludes || []), types_1.CodeActionKind.Notebook],
        };
        const codeActionContext = {
            only: filter.include?.value,
            trigger: trigger.type,
        };
        const cts = new editorState_1.TextModelCancellationTokenSource(model, token);
        // if the trigger is auto (autosave, lightbulb, etc), we should exclude notebook codeActions
        const excludeNotebookCodeActions = (trigger.type === 2 /* languages.CodeActionTriggerType.Auto */);
        const providers = getCodeActionProviders(registry, model, (excludeNotebookCodeActions) ? notebookFilter : filter);
        const disposables = new lifecycle_1.DisposableStore();
        const promises = providers.map(async (provider) => {
            try {
                progress.report(provider);
                const providedCodeActions = await provider.provideCodeActions(model, rangeOrSelection, codeActionContext, cts.token);
                if (providedCodeActions) {
                    disposables.add(providedCodeActions);
                }
                if (cts.token.isCancellationRequested) {
                    return emptyCodeActionsResponse;
                }
                const filteredActions = (providedCodeActions?.actions || []).filter(action => action && (0, types_1.filtersAction)(filter, action));
                const documentation = getDocumentationFromProvider(provider, filteredActions, filter.include);
                return {
                    actions: filteredActions.map(action => new types_1.CodeActionItem(action, provider)),
                    documentation
                };
            }
            catch (err) {
                if ((0, errors_1.isCancellationError)(err)) {
                    throw err;
                }
                (0, errors_1.onUnexpectedExternalError)(err);
                return emptyCodeActionsResponse;
            }
        });
        const listener = registry.onDidChange(() => {
            const newProviders = registry.all(model);
            if (!(0, arrays_1.equals)(newProviders, providers)) {
                cts.cancel();
            }
        });
        try {
            const actions = await Promise.all(promises);
            const allActions = actions.map(x => x.actions).flat();
            const allDocumentation = [
                ...(0, arrays_1.coalesce)(actions.map(x => x.documentation)),
                ...getAdditionalDocumentationForShowingActions(registry, model, trigger, allActions)
            ];
            return new ManagedCodeActionSet(allActions, allDocumentation, disposables);
        }
        finally {
            listener.dispose();
            cts.dispose();
        }
    }
    exports.getCodeActions = getCodeActions;
    function getCodeActionProviders(registry, model, filter) {
        return registry.all(model)
            // Don't include providers that we know will not return code actions of interest
            .filter(provider => {
            if (!provider.providedCodeActionKinds) {
                // We don't know what type of actions this provider will return.
                return true;
            }
            return provider.providedCodeActionKinds.some(kind => (0, types_1.mayIncludeActionsOfKind)(filter, new types_1.CodeActionKind(kind)));
        });
    }
    function* getAdditionalDocumentationForShowingActions(registry, model, trigger, actionsToShow) {
        if (model && actionsToShow.length) {
            for (const provider of registry.all(model)) {
                if (provider._getAdditionalMenuItems) {
                    yield* provider._getAdditionalMenuItems?.({ trigger: trigger.type, only: trigger.filter?.include?.value }, actionsToShow.map(item => item.action));
                }
            }
        }
    }
    function getDocumentationFromProvider(provider, providedCodeActions, only) {
        if (!provider.documentation) {
            return undefined;
        }
        const documentation = provider.documentation.map(entry => ({ kind: new types_1.CodeActionKind(entry.kind), command: entry.command }));
        if (only) {
            let currentBest;
            for (const entry of documentation) {
                if (entry.kind.contains(only)) {
                    if (!currentBest) {
                        currentBest = entry;
                    }
                    else {
                        // Take best match
                        if (currentBest.kind.contains(entry.kind)) {
                            currentBest = entry;
                        }
                    }
                }
            }
            if (currentBest) {
                return currentBest?.command;
            }
        }
        // Otherwise, check to see if any of the provided actions match.
        for (const action of providedCodeActions) {
            if (!action.kind) {
                continue;
            }
            for (const entry of documentation) {
                if (entry.kind.contains(new types_1.CodeActionKind(action.kind))) {
                    return entry.command;
                }
            }
        }
        return undefined;
    }
    var ApplyCodeActionReason;
    (function (ApplyCodeActionReason) {
        ApplyCodeActionReason["OnSave"] = "onSave";
        ApplyCodeActionReason["FromProblemsView"] = "fromProblemsView";
        ApplyCodeActionReason["FromCodeActions"] = "fromCodeActions";
    })(ApplyCodeActionReason || (exports.ApplyCodeActionReason = ApplyCodeActionReason = {}));
    async function applyCodeAction(accessor, item, codeActionReason, options, token = cancellation_1.CancellationToken.None) {
        const bulkEditService = accessor.get(bulkEditService_1.IBulkEditService);
        const commandService = accessor.get(commands_1.ICommandService);
        const telemetryService = accessor.get(telemetry_1.ITelemetryService);
        const notificationService = accessor.get(notification_1.INotificationService);
        telemetryService.publicLog2('codeAction.applyCodeAction', {
            codeActionTitle: item.action.title,
            codeActionKind: item.action.kind,
            codeActionIsPreferred: !!item.action.isPreferred,
            reason: codeActionReason,
        });
        await item.resolve(token);
        if (token.isCancellationRequested) {
            return;
        }
        if (item.action.edit?.edits.length) {
            const result = await bulkEditService.apply(item.action.edit, {
                editor: options?.editor,
                label: item.action.title,
                quotableLabel: item.action.title,
                code: 'undoredo.codeAction',
                respectAutoSaveConfig: codeActionReason !== ApplyCodeActionReason.OnSave,
                showPreview: options?.preview,
            });
            if (!result.isApplied) {
                return;
            }
        }
        if (item.action.command) {
            try {
                await commandService.executeCommand(item.action.command.id, ...(item.action.command.arguments || []));
            }
            catch (err) {
                const message = asMessage(err);
                notificationService.error(typeof message === 'string'
                    ? message
                    : nls.localize('applyCodeActionFailed', "An unknown error occurred while applying the code action"));
            }
        }
    }
    exports.applyCodeAction = applyCodeAction;
    function asMessage(err) {
        if (typeof err === 'string') {
            return err;
        }
        else if (err instanceof Error && typeof err.message === 'string') {
            return err.message;
        }
        else {
            return undefined;
        }
    }
    commands_1.CommandsRegistry.registerCommand('_executeCodeActionProvider', async function (accessor, resource, rangeOrSelection, kind, itemResolveCount) {
        if (!(resource instanceof uri_1.URI)) {
            throw (0, errors_1.illegalArgument)();
        }
        const { codeActionProvider } = accessor.get(languageFeatures_1.ILanguageFeaturesService);
        const model = accessor.get(model_1.IModelService).getModel(resource);
        if (!model) {
            throw (0, errors_1.illegalArgument)();
        }
        const validatedRangeOrSelection = selection_1.Selection.isISelection(rangeOrSelection)
            ? selection_1.Selection.liftSelection(rangeOrSelection)
            : range_1.Range.isIRange(rangeOrSelection)
                ? model.validateRange(rangeOrSelection)
                : undefined;
        if (!validatedRangeOrSelection) {
            throw (0, errors_1.illegalArgument)();
        }
        const include = typeof kind === 'string' ? new types_1.CodeActionKind(kind) : undefined;
        const codeActionSet = await getCodeActions(codeActionProvider, model, validatedRangeOrSelection, { type: 1 /* languages.CodeActionTriggerType.Invoke */, triggerAction: types_1.CodeActionTriggerSource.Default, filter: { includeSourceActions: true, include } }, progress_1.Progress.None, cancellation_1.CancellationToken.None);
        const resolving = [];
        const resolveCount = Math.min(codeActionSet.validActions.length, typeof itemResolveCount === 'number' ? itemResolveCount : 0);
        for (let i = 0; i < resolveCount; i++) {
            resolving.push(codeActionSet.validActions[i].resolve(cancellation_1.CancellationToken.None));
        }
        try {
            await Promise.all(resolving);
            return codeActionSet.validActions.map(item => item.action);
        }
        finally {
            setTimeout(() => codeActionSet.dispose(), 100);
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZUFjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2NvZGVBY3Rpb24vYnJvd3Nlci9jb2RlQWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQXlCbkYsUUFBQSxtQkFBbUIsR0FBRywwQkFBMEIsQ0FBQztJQUNqRCxRQUFBLGlCQUFpQixHQUFHLHdCQUF3QixDQUFDO0lBQzdDLFFBQUEsZ0JBQWdCLEdBQUcsdUJBQXVCLENBQUM7SUFDM0MsUUFBQSxpQkFBaUIsR0FBRyx3QkFBd0IsQ0FBQztJQUM3QyxRQUFBLHdCQUF3QixHQUFHLGdDQUFnQyxDQUFDO0lBQzVELFFBQUEscUJBQXFCLEdBQUcsNEJBQTRCLENBQUM7SUFDckQsUUFBQSx3QkFBd0IsR0FBRywrQkFBK0IsQ0FBQztJQUMzRCxRQUFBLGVBQWUsR0FBRyxzQkFBc0IsQ0FBQztJQUV0RCxNQUFNLG9CQUFxQixTQUFRLHNCQUFVO1FBRXBDLE1BQU0sQ0FBQyw4QkFBOEIsQ0FBQyxDQUF1QixFQUFFLENBQXVCO1lBQzdGLElBQUksQ0FBQyxDQUFDLFdBQVcsSUFBSSxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUU7Z0JBQ3BDLE9BQU8sQ0FBQyxDQUFDLENBQUM7YUFDVjtpQkFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLFdBQVcsSUFBSSxDQUFDLENBQUMsV0FBVyxFQUFFO2dCQUMzQyxPQUFPLENBQUMsQ0FBQzthQUNUO2lCQUFNO2dCQUNOLE9BQU8sQ0FBQyxDQUFDO2FBQ1Q7UUFDRixDQUFDO1FBRU8sTUFBTSxDQUFDLHFCQUFxQixDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBa0IsRUFBRSxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQWtCO1lBQ2hHLElBQUksSUFBQSx3QkFBZSxFQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsRUFBRTtnQkFDbkMsT0FB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