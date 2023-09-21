/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/uri", "vs/base/common/event", "vs/editor/common/services/model", "vs/editor/common/services/resolverService", "vs/nls", "vs/platform/instantiation/common/instantiation", "vs/platform/terminal/common/environmentVariable", "vs/workbench/contrib/terminal/browser/terminalActions", "vs/workbench/services/editor/common/editorService"], function (require, exports, uri_1, event_1, model_1, resolverService_1, nls_1, instantiation_1, environmentVariable_1, terminalActions_1, editorService_1) {
    "use strict";
    var EnvironmentCollectionProvider_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    // TODO: The rest of the terminal environment changes feature should move here https://github.com/microsoft/vscode/issues/177241
    (0, terminalActions_1.registerActiveInstanceAction)({
        id: "workbench.action.terminal.showEnvironmentContributions" /* TerminalCommandId.ShowEnvironmentContributions */,
        title: { value: (0, nls_1.localize)('workbench.action.terminal.showEnvironmentContributions', "Show Environment Contributions"), original: 'Show Environment Contributions' },
        run: async (activeInstance, c, accessor, arg) => {
            const collection = activeInstance.extEnvironmentVariableCollection;
            if (collection) {
                const scope = arg;
                const instantiationService = accessor.get(instantiation_1.IInstantiationService);
                const outputProvider = instantiationService.createInstance(EnvironmentCollectionProvider);
                const editorService = accessor.get(editorService_1.IEditorService);
                const timestamp = new Date().getTime();
                const scopeDesc = scope?.workspaceFolder ? ` - ${scope.workspaceFolder.name}` : '';
                const textContent = await outputProvider.provideTextContent(uri_1.URI.from({
                    scheme: EnvironmentCollectionProvider.scheme,
                    path: `Environment changes${scopeDesc}`,
                    fragment: describeEnvironmentChanges(collection, scope),
                    query: `environment-collection-${timestamp}`
                }));
                if (textContent) {
                    await editorService.openEditor({
                        resource: textContent.uri
                    });
                }
            }
        }
    });
    function describeEnvironmentChanges(collection, scope) {
        let content = `# ${(0, nls_1.localize)('envChanges', 'Terminal Environment Changes')}`;
        const globalDescriptions = collection.getDescriptionMap(undefined);
        const workspaceDescriptions = collection.getDescriptionMap(scope);
        for (const [ext, coll] of collection.collections) {
            content += `\n\n## ${(0, nls_1.localize)('extension', 'Extension: {0}', ext)}`;
            content += '\n';
            const globalDescription = globalDescriptions.get(ext);
            if (globalDescription) {
                content += `\n${globalDescription}\n`;
            }
            const workspaceDescription = workspaceDescriptions.get(ext);
            if (workspaceDescription) {
                // Only show '(workspace)' suffix if there is already a description for the extension.
                const workspaceSuffix = globalDescription ? ` (${(0, nls_1.localize)('ScopedEnvironmentContributionInfo', 'workspace')})` : '';
                content += `\n${workspaceDescription}${workspaceSuffix}\n`;
            }
            for (const mutator of coll.map.values()) {
                if (filterScope(mutator, scope) === false) {
                    continue;
                }
                content += `\n- \`${mutatorTypeLabel(mutator.type, mutator.value, mutator.variable)}\``;
            }
        }
        return content;
    }
    function filterScope(mutator, scope) {
        if (!mutator.scope) {
            return true;
        }
        // Only mutators which are applicable on the relevant workspace should be shown.
        if (mutator.scope.workspaceFolder && scope?.workspaceFolder && mutator.scope.workspaceFolder.index === scope.workspaceFolder.index) {
            return true;
        }
        return false;
    }
    function mutatorTypeLabel(type, value, variable) {
        switch (type) {
            case environmentVariable_1.EnvironmentVariableMutatorType.Prepend: return `${variable}=${value}\${env:${variable}}`;
            case environmentVariable_1.EnvironmentVariableMutatorType.Append: return `${variable}=\${env:${variable}}${value}`;
            default: return `${variable}=${value}`;
        }
    }
    let EnvironmentCollectionProvider = class EnvironmentCollectionProvider {
        static { EnvironmentCollectionProvider_1 = this; }
        static { this.scheme = 'ENVIRONMENT_CHANGES_COLLECTION'; }
        constructor(textModelResolverService, _modelService) {
            this._modelService = _modelService;
            textModelResolverService.registerTextModelContentProvider(EnvironmentCollectionProvider_1.scheme, this);
        }
        async provideTextContent(resource) {
            const existing = this._modelService.getModel(resource);
            if (existing && !existing.isDisposed()) {
                return existing;
            }
            return this._modelService.createModel(resource.fragment, { languageId: 'markdown', onDidChange: event_1.Event.None }, resource, false);
        }
    };
    EnvironmentCollectionProvider = EnvironmentCollectionProvider_1 = __decorate([
        __param(0, resolverService_1.ITextModelService),
        __param(1, model_1.IModelService)
    ], EnvironmentCollectionProvider);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWwuZW52aXJvbm1lbnRDaGFuZ2VzLmNvbnRyaWJ1dGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlcm1pbmFsQ29udHJpYi9lbnZpcm9ubWVudENoYW5nZXMvYnJvd3Nlci90ZXJtaW5hbC5lbnZpcm9ubWVudENoYW5nZXMuY29udHJpYnV0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWNoRyxnSUFBZ0k7SUFFaEksSUFBQSw4Q0FBNEIsRUFBQztRQUM1QixFQUFFLCtHQUFnRDtRQUNsRCxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsd0RBQXdELEVBQUUsZ0NBQWdDLENBQUMsRUFBRSxRQUFRLEVBQUUsZ0NBQWdDLEVBQUU7UUFDbEssR0FBRyxFQUFFLEtBQUssRUFBRSxjQUFjLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsRUFBRTtZQUMvQyxNQUFNLFVBQVUsR0FBRyxjQUFjLENBQUMsZ0NBQWdDLENBQUM7WUFDbkUsSUFBSSxVQUFVLEVBQUU7Z0JBQ2YsTUFBTSxLQUFLLEdBQUcsR0FBMkMsQ0FBQztnQkFDMUQsTUFBTSxvQkFBb0IsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHFDQUFxQixDQUFDLENBQUM7Z0JBQ2pFLE1BQU0sY0FBYyxHQUFHLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO2dCQUMxRixNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDhCQUFjLENBQUMsQ0FBQztnQkFDbkQsTUFBTSxTQUFTLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDdkMsTUFBTSxTQUFTLEdBQUcsS0FBSyxFQUFFLGVBQWUsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFL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