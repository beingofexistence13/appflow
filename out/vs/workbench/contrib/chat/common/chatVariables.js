/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/base/common/iterator", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation"], function (require, exports, errors_1, iterator_1, lifecycle_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ChatVariablesService = exports.IChatVariablesService = void 0;
    exports.IChatVariablesService = (0, instantiation_1.createDecorator)('IChatVariablesService');
    class ChatVariablesService {
        constructor() {
            this._resolver = new Map();
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
                const data = this._resolver.get(varName.toLowerCase());
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
                        }).catch(errors_1.onUnexpectedExternalError));
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
            const all = iterator_1.Iterable.map(this._resolver.values(), data => data.data);
            return iterator_1.Iterable.filter(all, data => !data.hidden);
        }
        registerVariable(data, resolver) {
            const key = data.name.toLowerCase();
            if (this._resolver.has(key)) {
                throw new Error(`A chat variable with the name '${data.name}' already exists.`);
            }
            this._resolver.set(key, { data, resolver });
            return (0, lifecycle_1.toDisposable)(() => {
                this._resolver.delete(key);
            });
        }
    }
    exports.ChatVariablesService = ChatVariablesService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdFZhcmlhYmxlcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2NoYXQvY29tbW9uL2NoYXRWYXJpYWJsZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBMkJuRixRQUFBLHFCQUFxQixHQUFHLElBQUEsK0JBQWUsRUFBd0IsdUJBQXVCLENBQUMsQ0FBQztJQXVCckcsTUFBYSxvQkFBb0I7UUFLaEM7WUFGUSxjQUFTLEdBQUcsSUFBSSxHQUFHLEVBQXFCLENBQUM7UUFHakQsQ0FBQztRQUVELEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFjLEVBQUUsS0FBaUIsRUFBRSxLQUF3QjtZQUNqRixNQUFNLGlCQUFpQixHQUFnRCxFQUFFLENBQUM7WUFDMUUsTUFBTSxJQUFJLEdBQW1CLEVBQUUsQ0FBQztZQUVoQyxnRUFBZ0U7WUFDaEUsTUFBTSxLQUFLLEdBQUcsa0NBQWtDLENBQUM7WUFFakQsSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDO1lBQ2xCLE1BQU0sWUFBWSxHQUFhLEVBQUUsQ0FBQztZQUNsQyxJQUFJLEtBQThCLENBQUM7WUFDbkMsT0FBTyxLQUFLLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDbEMsTUFBTSxDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQztnQkFDakQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7Z0JBQ3ZELElBQUksSUFBSSxFQUFFO29CQUNULElBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUU7d0JBQ3RDLFlBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMs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