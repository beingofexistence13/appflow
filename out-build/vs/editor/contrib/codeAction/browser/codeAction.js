/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/editor/contrib/codeAction/browser/codeAction", "vs/base/common/arrays", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/editor/browser/services/bulkEditService", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/services/languageFeatures", "vs/editor/common/services/model", "vs/editor/contrib/editorState/browser/editorState", "vs/platform/commands/common/commands", "vs/platform/notification/common/notification", "vs/platform/progress/common/progress", "vs/platform/telemetry/common/telemetry", "../common/types"], function (require, exports, nls, arrays_1, cancellation_1, errors_1, lifecycle_1, uri_1, bulkEditService_1, range_1, selection_1, languageFeatures_1, model_1, editorState_1, commands_1, notification_1, progress_1, telemetry_1, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$J1 = exports.ApplyCodeActionReason = exports.$I1 = exports.$H1 = exports.$G1 = exports.$F1 = exports.$E1 = exports.$D1 = exports.$C1 = exports.$B1 = exports.$A1 = void 0;
    exports.$A1 = 'editor.action.codeAction';
    exports.$B1 = 'editor.action.quickFix';
    exports.$C1 = 'editor.action.autoFix';
    exports.$D1 = 'editor.action.refactor';
    exports.$E1 = 'editor.action.refactor.preview';
    exports.$F1 = 'editor.action.sourceAction';
    exports.$G1 = 'editor.action.organizeImports';
    exports.$H1 = 'editor.action.fixAll';
    class ManagedCodeActionSet extends lifecycle_1.$kc {
        static c(a, b) {
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
        static f({ action: a }, { action: b }) {
            if ((0, arrays_1.$Jb)(a.diagnostics)) {
                return (0, arrays_1.$Jb)(b.diagnostics) ? ManagedCodeActionSet.c(a, b) : -1;
            }
            else if ((0, arrays_1.$Jb)(b.diagnostics)) {
                return 1;
            }
            else {
                return ManagedCodeActionSet.c(a, b); // both have no diagnostics
            }
        }
        constructor(actions, documentation, disposables) {
            super();
            this.documentation = documentation;
            this.B(disposables);
            this.allActions = [...actions].sort(ManagedCodeActionSet.f);
            this.validActions = this.allActions.filter(({ action }) => !action.disabled);
        }
        get hasAutoFix() {
            return this.validActions.some(({ action: fix }) => !!fix.kind && types_1.$v1.QuickFix.contains(new types_1.$v1(fix.kind)) && !!fix.isPreferred);
        }
    }
    const emptyCodeActionsResponse = { actions: [], documentation: undefined };
    async function $I1(registry, model, rangeOrSelection, trigger, progress, token) {
        const filter = trigger.filter || {};
        const notebookFilter = {
            ...filter,
            excludes: [...(filter.excludes || []), types_1.$v1.Notebook],
        };
        const codeActionContext = {
            only: filter.include?.value,
            trigger: trigger.type,
        };
        const cts = new editorState_1.$u1(model, token);
        // if the trigger is auto (autosave, lightbulb, etc), we should exclude notebook codeActions
        const excludeNotebookCodeActions = (trigger.type === 2 /* languages.CodeActionTriggerType.Auto */);
        const providers = getCodeActionProviders(registry, model, (excludeNotebookCodeActions) ? notebookFilter : filter);
        const disposables = new lifecycle_1.$jc();
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
                const filteredActions = (providedCodeActions?.actions || []).filter(action => action && (0, types_1.$x1)(filter, action));
                const documentation = getDocumentationFromProvider(provider, filteredActions, filter.include);
                return {
                    actions: filteredActions.map(action => new types_1.$z1(action, provider)),
                    documentation
                };
            }
            catch (err) {
                if ((0, errors_1.$2)(err)) {
                    throw err;
                }
                (0, errors_1.$Z)(err);
                return emptyCodeActionsResponse;
            }
        });
        const listener = registry.onDidChange(() => {
            const newProviders = registry.all(model);
            if (!(0, arrays_1.$sb)(newProviders, providers)) {
                cts.cancel();
            }
        });
        try {
            const actions = await Promise.all(promises);
            const allActions = actions.map(x => x.actions).flat();
            const allDocumentation = [
                ...(0, arrays_1.$Fb)(actions.map(x => x.documentation)),
                ...getAdditionalDocumentationForShowingActions(registry, model, trigger, allActions)
            ];
            return new ManagedCodeActionSet(allActions, allDocumentation, disposables);
        }
        finally {
            listener.dispose();
            cts.dispose();
        }
    }
    exports.$I1 = $I1;
    function getCodeActionProviders(registry, model, filter) {
        return registry.all(model)
            // Don't include providers that we know will not return code actions of interest
            .filter(provider => {
            if (!provider.providedCodeActionKinds) {
                // We don't know what type of actions this provider will return.
                return true;
            }
            return provider.providedCodeActionKinds.some(kind => (0, types_1.$w1)(filter, new types_1.$v1(kind)));
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
        const documentation = provider.documentation.map(entry => ({ kind: new types_1.$v1(entry.kind), command: entry.command }));
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
                if (entry.kind.contains(new types_1.$v1(action.kind))) {
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
    async function $J1(accessor, item, codeActionReason, options, token = cancellation_1.CancellationToken.None) {
        const bulkEditService = accessor.get(bulkEditService_1.$n1);
        const commandService = accessor.get(commands_1.$Fr);
        const telemetryService = accessor.get(telemetry_1.$9k);
        const notificationService = accessor.get(notification_1.$Yu);
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
                    : nls.localize(0, null));
            }
        }
    }
    exports.$J1 = $J1;
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
    commands_1.$Gr.registerCommand('_executeCodeActionProvider', async function (accessor, resource, rangeOrSelection, kind, itemResolveCount) {
        if (!(resource instanceof uri_1.URI)) {
            throw (0, errors_1.$5)();
        }
        const { codeActionProvider } = accessor.get(languageFeatures_1.$hF);
        const model = accessor.get(model_1.$yA).getModel(resource);
        if (!model) {
            throw (0, errors_1.$5)();
        }
        const validatedRangeOrSelection = selection_1.$ms.isISelection(rangeOrSelection)
            ? selection_1.$ms.liftSelection(rangeOrSelection)
            : range_1.$ks.isIRange(rangeOrSelection)
                ? model.validateRange(rangeOrSelection)
                : undefined;
        if (!validatedRangeOrSelection) {
            throw (0, errors_1.$5)();
        }
        const include = typeof kind === 'string' ? new types_1.$v1(kind) : undefined;
        const codeActionSet = await $I1(codeActionProvider, model, validatedRangeOrSelection, { type: 1 /* languages.CodeActionTriggerType.Invoke */, triggerAction: types_1.CodeActionTriggerSource.Default, filter: { includeSourceActions: true, include } }, progress_1.$4u.None, cancellation_1.CancellationToken.None);
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
//# sourceMappingURL=codeAction.js.map