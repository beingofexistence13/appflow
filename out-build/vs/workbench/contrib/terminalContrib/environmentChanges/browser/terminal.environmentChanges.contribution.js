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
define(["require", "exports", "vs/base/common/uri", "vs/base/common/event", "vs/editor/common/services/model", "vs/editor/common/services/resolverService", "vs/nls!vs/workbench/contrib/terminalContrib/environmentChanges/browser/terminal.environmentChanges.contribution", "vs/platform/instantiation/common/instantiation", "vs/platform/terminal/common/environmentVariable", "vs/workbench/contrib/terminal/browser/terminalActions", "vs/workbench/services/editor/common/editorService"], function (require, exports, uri_1, event_1, model_1, resolverService_1, nls_1, instantiation_1, environmentVariable_1, terminalActions_1, editorService_1) {
    "use strict";
    var EnvironmentCollectionProvider_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    // TODO: The rest of the terminal environment changes feature should move here https://github.com/microsoft/vscode/issues/177241
    (0, terminalActions_1.$IVb)({
        id: "workbench.action.terminal.showEnvironmentContributions" /* TerminalCommandId.ShowEnvironmentContributions */,
        title: { value: (0, nls_1.localize)(0, null), original: 'Show Environment Contributions' },
        run: async (activeInstance, c, accessor, arg) => {
            const collection = activeInstance.extEnvironmentVariableCollection;
            if (collection) {
                const scope = arg;
                const instantiationService = accessor.get(instantiation_1.$Ah);
                const outputProvider = instantiationService.createInstance(EnvironmentCollectionProvider);
                const editorService = accessor.get(editorService_1.$9C);
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
        let content = `# ${(0, nls_1.localize)(1, null)}`;
        const globalDescriptions = collection.getDescriptionMap(undefined);
        const workspaceDescriptions = collection.getDescriptionMap(scope);
        for (const [ext, coll] of collection.collections) {
            content += `\n\n## ${(0, nls_1.localize)(2, null, ext)}`;
            content += '\n';
            const globalDescription = globalDescriptions.get(ext);
            if (globalDescription) {
                content += `\n${globalDescription}\n`;
            }
            const workspaceDescription = workspaceDescriptions.get(ext);
            if (workspaceDescription) {
                // Only show '(workspace)' suffix if there is already a description for the extension.
                const workspaceSuffix = globalDescription ? ` (${(0, nls_1.localize)(3, null)})` : '';
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
        constructor(textModelResolverService, a) {
            this.a = a;
            textModelResolverService.registerTextModelContentProvider(EnvironmentCollectionProvider_1.scheme, this);
        }
        async provideTextContent(resource) {
            const existing = this.a.getModel(resource);
            if (existing && !existing.isDisposed()) {
                return existing;
            }
            return this.a.createModel(resource.fragment, { languageId: 'markdown', onDidChange: event_1.Event.None }, resource, false);
        }
    };
    EnvironmentCollectionProvider = EnvironmentCollectionProvider_1 = __decorate([
        __param(0, resolverService_1.$uA),
        __param(1, model_1.$yA)
    ], EnvironmentCollectionProvider);
});
//# sourceMappingURL=terminal.environmentChanges.contribution.js.map