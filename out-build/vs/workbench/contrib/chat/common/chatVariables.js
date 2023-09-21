/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/base/common/iterator", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation"], function (require, exports, errors_1, iterator_1, lifecycle_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$EH = exports.$DH = void 0;
    exports.$DH = (0, instantiation_1.$Bh)('IChatVariablesService');
    class $EH {
        constructor() {
            this.a = new Map();
        }
        async resolveVariables(prompt, model, token) {
            const resolvedVariables = {};
            const jobs = [];
            // TODO have a separate parser that is also used for decorations
            const regex = /(^|\s)@(\w+)(:\w+)?(?=\s|$|\b)/ig;
            let lastMatch = 0;
            const parsedPrompt = [];
            let match;
            while (match = regex.exec(prompt)) {
                const [fullMatch, leading, varName, arg] = match;
                const data = this.a.get(varName.toLowerCase());
                if (data) {
                    if (!arg || data.data.canTakeArgument) {
                        parsedPrompt.push(prompt.substring(lastMatch, match.index));
                        parsedPrompt.push('');
                        lastMatch = match.index + fullMatch.length;
                        const varIndex = parsedPrompt.length - 1;
                        const argWithoutColon = arg?.slice(1);
                        const fullVarName = varName + (arg ?? '');
                        jobs.push(data.resolver(prompt, argWithoutColon, model, token).then(value => {
                            if (value) {
                                resolvedVariables[fullVarName] = value;
                                parsedPrompt[varIndex] = `${leading}[@${fullVarName}](values:${fullVarName})`;
                            }
                            else {
                                parsedPrompt[varIndex] = fullMatch;
                            }
                        }).catch(errors_1.$Z));
                    }
                }
            }
            parsedPrompt.push(prompt.substring(lastMatch));
            await Promise.allSettled(jobs);
            return {
                variables: resolvedVariables,
                prompt: parsedPrompt.join('')
            };
        }
        getVariables() {
            const all = iterator_1.Iterable.map(this.a.values(), data => data.data);
            return iterator_1.Iterable.filter(all, data => !data.hidden);
        }
        registerVariable(data, resolver) {
            const key = data.name.toLowerCase();
            if (this.a.has(key)) {
                throw new Error(`A chat variable with the name '${data.name}' already exists.`);
            }
            this.a.set(key, { data, resolver });
            return (0, lifecycle_1.$ic)(() => {
                this.a.delete(key);
            });
        }
    }
    exports.$EH = $EH;
});
//# sourceMappingURL=chatVariables.js.map