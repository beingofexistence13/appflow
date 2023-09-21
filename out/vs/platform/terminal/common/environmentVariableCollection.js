/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform", "vs/platform/terminal/common/environmentVariable"], function (require, exports, platform_1, environmentVariable_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MergedEnvironmentVariableCollection = void 0;
    const mutatorTypeToLabelMap = new Map([
        [environmentVariable_1.EnvironmentVariableMutatorType.Append, 'APPEND'],
        [environmentVariable_1.EnvironmentVariableMutatorType.Prepend, 'PREPEND'],
        [environmentVariable_1.EnvironmentVariableMutatorType.Replace, 'REPLACE']
    ]);
    class MergedEnvironmentVariableCollection {
        constructor(collections) {
            this.collections = collections;
            this.map = new Map();
            this.descriptionMap = new Map();
            collections.forEach((collection, extensionIdentifier) => {
                this.populateDescriptionMap(collection, extensionIdentifier);
                const it = collection.map.entries();
                let next = it.next();
                while (!next.done) {
                    const mutator = next.value[1];
                    const key = next.value[0];
                    let entry = this.map.get(key);
                    if (!entry) {
                        entry = [];
                        this.map.set(key, entry);
                    }
                    // If the first item in the entry is replace ignore any other entries as they would
                    // just get replaced by this one.
                    if (entry.length > 0 && entry[0].type === environmentVariable_1.EnvironmentVariableMutatorType.Replace) {
                        next = it.next();
                        continue;
                    }
                    const extensionMutator = {
                        extensionIdentifier,
                        value: mutator.value,
                        type: mutator.type,
                        scope: mutator.scope,
                        variable: mutator.variable,
                        options: mutator.options
                    };
                    if (!extensionMutator.scope) {
                        delete extensionMutator.scope; // Convenient for tests
                    }
                    // Mutators get applied in the reverse order than they are created
                    entry.unshift(extensionMutator);
                    next = it.next();
                }
            });
        }
        async applyToProcessEnvironment(env, scope, variableResolver) {
            let lowerToActualVariableNames;
            if (platform_1.isWindows) {
                lowerToActualVariableNames = {};
                Object.keys(env).forEach(e => lowerToActualVariableNames[e.toLowerCase()] = e);
            }
            for (const [variable, mutators] of this.getVariableMap(scope)) {
                const actualVariable = platform_1.isWindows ? lowerToActualVariableNames[variable.toLowerCase()] || variable : variable;
                for (const mutator of mutators) {
                    const value = variableResolver ? await variableResolver(mutator.value) : mutator.value;
                    // Default: true
                    if (mutator.options?.applyAtProcessCreation ?? true) {
                        switch (mutator.type) {
                            case environmentVariable_1.EnvironmentVariableMutatorType.Append:
                                env[actualVariable] = (env[actualVariable] || '') + value;
                                break;
                            case environmentVariable_1.EnvironmentVariableMutatorType.Prepend:
                                env[actualVariable] = value + (env[actualVariable] || '');
                                break;
                            case environmentVariable_1.EnvironmentVariableMutatorType.Replace:
                                env[actualVariable] = value;
                                break;
                        }
                    }
                    // Default: false
                    if (mutator.options?.applyAtShellIntegration ?? false) {
                        const key = `VSCODE_ENV_${mutatorTypeToLabelMap.get(mutator.type)}`;
                        env[key] = (env[key] ? env[key] + ':' : '') + variable + '=' + this._encodeColons(value);
                    }
                }
            }
        }
        _encodeColons(value) {
            return value.replaceAll(':', '\\x3a');
        }
        diff(other, scope) {
            const added = new Map();
            const changed = new Map();
            const removed = new Map();
            // Find added
            other.getVariableMap(scope).forEach((otherMutators, variable) => {
                const currentMutators = this.getVariableMap(scope).get(variable);
                const result = getMissingMutatorsFromArray(otherMutators, currentMutators);
                if (result) {
                    added.set(variable, result);
                }
            });
            // Find removed
            this.getVariableMap(scope).forEach((currentMutators, variable) => {
                const otherMutators = other.getVariableMap(scope).get(variable);
                const result = getMissingMutatorsFromArray(currentMutators, otherMutators);
                if (result) {
                    removed.set(variable, result);
                }
            });
            // Find changed
            this.getVariableMap(scope).forEach((currentMutators, variable) => {
                const otherMutators = other.getVariableMap(scope).get(variable);
                const result = getChangedMutatorsFromArray(currentMutators, otherMutators);
                if (result) {
                    changed.set(variable, result);
                }
            });
            if (added.size === 0 && changed.size === 0 && removed.size === 0) {
                return undefined;
            }
            return { added, changed, removed };
        }
        getVariableMap(scope) {
            const result = new Map();
            for (const mutators of this.map.values()) {
                const filteredMutators = mutators.filter(m => filterScope(m, scope));
                if (filteredMutators.length > 0) {
                    // All of these mutators are for the same variable because they are in the same scope, hence choose anyone to form a key.
                    result.set(filteredMutators[0].variable, filteredMutators);
                }
            }
            return result;
        }
        getDescriptionMap(scope) {
            const result = new Map();
            for (const mutators of this.descriptionMap.values()) {
                const filteredMutators = mutators.filter(m => filterScope(m, scope, true));
                for (const mutator of filteredMutators) {
                    result.set(mutator.extensionIdentifier, mutator.description);
                }
            }
            return result;
        }
        populateDescriptionMap(collection, extensionIdentifier) {
            if (!collection.descriptionMap) {
                return;
            }
            const it = collection.descriptionMap.entries();
            let next = it.next();
            while (!next.done) {
                const mutator = next.value[1];
                const key = next.value[0];
                let entry = this.descriptionMap.get(key);
                if (!entry) {
                    entry = [];
                    this.descriptionMap.set(key, entry);
                }
                const extensionMutator = {
                    extensionIdentifier,
                    scope: mutator.scope,
                    description: mutator.description
                };
                if (!extensionMutator.scope) {
                    delete extensionMutator.scope; // Convenient for tests
                }
                entry.push(extensionMutator);
                next = it.next();
            }
        }
    }
    exports.MergedEnvironmentVariableCollection = MergedEnvironmentVariableCollection;
    /**
     * Returns whether a mutator matches with the scope provided.
     * @param mutator Mutator to filter
     * @param scope Scope to be used for querying
     * @param strictFilter If true, mutators with global scope is not returned when querying for workspace scope.
     * i.e whether mutator scope should always exactly match with query scope.
     */
    function filterScope(mutator, scope, strictFilter = false) {
        if (!mutator.scope) {
            if (strictFilter) {
                return scope === mutator.scope;
            }
            return true;
        }
        // If a mutator is scoped to a workspace folder, only apply it if the workspace
        // folder matches.
        if (mutator.scope.workspaceFolder && scope?.workspaceFolder && mutator.scope.workspaceFolder.index === scope.workspaceFolder.index) {
            return true;
        }
        return false;
    }
    function getMissingMutatorsFromArray(current, other) {
        // If it doesn't exist, all are removed
        if (!other) {
            return current;
        }
        // Create a map to help
        const otherMutatorExtensions = new Set();
        other.forEach(m => otherMutatorExtensions.add(m.extensionIdentifier));
        // Find entries removed from other
        const result = [];
        current.forEach(mutator => {
            if (!otherMutatorExtensions.has(mutator.extensionIdentifier)) {
                result.push(mutator);
            }
        });
        return result.length === 0 ? undefined : result;
    }
    function getChangedMutatorsFromArray(current, other) {
        // If it doesn't exist, none are changed (they are removed)
        if (!other) {
            return undefined;
        }
        // Create a map to help
        const otherMutatorExtensions = new Map();
        other.forEach(m => otherMutatorExtensions.set(m.extensionIdentifier, m));
        // Find entries that exist in both but are not equal
        const result = [];
        current.forEach(mutator => {
            const otherMutator = otherMutatorExtensions.get(mutator.extensionIdentifier);
            if (otherMutator && (mutator.type !== otherMutator.type || mutator.value !== otherMutator.value || mutator.scope?.workspaceFolder?.index !== otherMutator.scope?.workspaceFolder?.index)) {
                // Return the new result, not the old one
                result.push(otherMutator);
            }
        });
        return result.length === 0 ? undefined : result;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW52aXJvbm1lbnRWYXJpYWJsZUNvbGxlY3Rpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS90ZXJtaW5hbC9jb21tb24vZW52aXJvbm1lbnRWYXJpYWJsZUNvbGxlY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBT2hHLE1BQU0scUJBQXFCLEdBQWdELElBQUksR0FBRyxDQUFDO1FBQ2xGLENBQUMsb0RBQThCLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQztRQUNqRCxDQUFDLG9EQUE4QixDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUM7UUFDbkQsQ0FBQyxvREFBOEIsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDO0tBQ25ELENBQUMsQ0FBQztJQUVILE1BQWEsbUNBQW1DO1FBSS9DLFlBQ1UsV0FBZ0U7WUFBaEUsZ0JBQVcsR0FBWCxXQUFXLENBQXFEO1lBSnpELFFBQUcsR0FBNkQsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUMxRSxtQkFBYyxHQUFnRSxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBS3hHLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxVQUFVLEVBQUUsbUJBQW1CLEVBQUUsRUFBRTtnQkFDdkQsSUFBSSxDQUFDLHNCQUFzQixDQUFDLFVBQVUsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO2dCQUM3RCxNQUFNLEVBQUUsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNwQyxJQUFJLElBQUksR0FBRyxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ3JCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFO29CQUNsQixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUM5QixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FB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