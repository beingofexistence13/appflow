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
define(["require", "exports", "vs/base/common/types", "vs/workbench/api/common/extHostTypes", "vs/workbench/api/common/extHostTypeConverters", "vs/base/common/objects", "./extHost.protocol", "vs/base/common/arrays", "vs/platform/log/common/log", "vs/base/common/marshalling", "vs/editor/common/core/range", "vs/editor/common/core/position", "vs/base/common/uri", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation", "vs/workbench/api/common/extHostRpcService", "vs/workbench/api/common/extHostTestItem", "vs/base/common/buffer", "vs/workbench/services/extensions/common/proxyIdentifier", "vs/base/common/errorMessage", "vs/base/common/stopwatch", "vs/platform/telemetry/common/telemetryUtils", "vs/workbench/api/common/extHostTelemetry"], function (require, exports, types_1, extHostTypes, extHostTypeConverter, objects_1, extHost_protocol_1, arrays_1, log_1, marshalling_1, range_1, position_1, uri_1, lifecycle_1, instantiation_1, extHostRpcService_1, extHostTestItem_1, buffer_1, proxyIdentifier_1, errorMessage_1, stopwatch_1, telemetryUtils_1, extHostTelemetry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ApiCommand = exports.ApiCommandResult = exports.ApiCommandArgument = exports.CommandsConverter = exports.IExtHostCommands = exports.ExtHostCommands = void 0;
    let ExtHostCommands = class ExtHostCommands {
        #proxy;
        #telemetry;
        #extHostTelemetry;
        constructor(extHostRpc, logService, extHostTelemetry) {
            this._commands = new Map();
            this._apiCommands = new Map();
            this.#proxy = extHostRpc.getProxy(extHost_protocol_1.MainContext.MainThreadCommands);
            this._logService = logService;
            this.#extHostTelemetry = extHostTelemetry;
            this.#telemetry = extHostRpc.getProxy(extHost_protocol_1.MainContext.MainThreadTelemetry);
            this.converter = new CommandsConverter(this, id => {
                // API commands that have no return type (void) can be
                // converted to their internal command and don't need
                // any indirection commands
                const candidate = this._apiCommands.get(id);
                return candidate?.result === ApiCommandResult.Void
                    ? candidate : undefined;
            }, logService);
            this._argumentProcessors = [
                {
                    processArgument(a) {
                        // URI, Regex
                        return (0, marshalling_1.revive)(a);
                    }
                },
                {
                    processArgument(arg) {
                        return (0, objects_1.cloneAndChange)(arg, function (obj) {
                            // Reverse of https://github.com/microsoft/vscode/blob/1f28c5fc681f4c01226460b6d1c7e91b8acb4a5b/src/vs/workbench/api/node/extHostCommands.ts#L112-L127
                            if (range_1.Range.isIRange(obj)) {
                                return extHostTypeConverter.Range.to(obj);
                            }
                            if (position_1.Position.isIPosition(obj)) {
                                return extHostTypeConverter.Position.to(obj);
                            }
                            if (range_1.Range.isIRange(obj.range) && uri_1.URI.isUri(obj.uri)) {
                                return extHostTypeConverter.location.to(obj);
                            }
                            if (obj instanceof buffer_1.VSBuffer) {
                                return obj.buffer.buffer;
                            }
                            if (!Array.isArray(obj)) {
                                return obj;
                            }
                        });
                    }
                }
            ];
        }
        registerArgumentProcessor(processor) {
            this._argumentProcessors.push(processor);
        }
        registerApiCommand(apiCommand) {
            const registration = this.registerCommand(false, apiCommand.id, async (...apiArgs) => {
                const internalArgs = apiCommand.args.map((arg, i) => {
                    if (!arg.validate(apiArgs[i])) {
                        throw new Error(`Invalid argument '${arg.name}' when running '${apiCommand.id}', received: ${apiArgs[i]}`);
                    }
                    return arg.convert(apiArgs[i]);
                });
                const internalResult = await this.executeCommand(apiCommand.internalId, ...internalArgs);
                return apiCommand.result.convert(internalResult, apiArgs, this.converter);
            }, undefined, {
                description: apiCommand.description,
                args: apiCommand.args,
                returns: apiCommand.result.description
            });
            this._apiCommands.set(apiCommand.id, apiCommand);
            return new extHostTypes.Disposable(() => {
                registration.dispose();
                this._apiCommands.delete(apiCommand.id);
            });
        }
        registerCommand(global, id, callback, thisArg, description, extension) {
            this._logService.trace('ExtHostCommands#registerCommand', id);
            if (!id.trim().length) {
                throw new Error('invalid id');
            }
            if (this._commands.has(id)) {
                throw new Error(`command '${id}' already exists`);
            }
            this._commands.set(id, { callback, thisArg, description, extension });
            if (global) {
                this.#proxy.$registerCommand(id);
            }
            return new extHostTypes.Disposable(() => {
                if (this._commands.delete(id)) {
                    if (global) {
                        this.#proxy.$unregisterCommand(id);
                    }
                }
            });
        }
        executeCommand(id, ...args) {
            this._logService.trace('ExtHostCommands#executeCommand', id);
            return this._doExecuteCommand(id, args, true);
        }
        async _doExecuteCommand(id, args, retry) {
            if (this._commands.has(id)) {
                // - We stay inside the extension host and support
                // 	 to pass any kind of parameters around.
                // - We still emit the corresponding activation event
                //   BUT we don't await that event
                this.#proxy.$fireCommandActivationEvent(id);
                return this._executeContributedCommand(id, args, false);
            }
            else {
                // automagically convert some argument types
                let hasBuffers = false;
                const toArgs = (0, objects_1.cloneAndChange)(args, function (value) {
                    if (value instanceof extHostTypes.Position) {
                        return extHostTypeConverter.Position.from(value);
                    }
                    else if (value instanceof extHostTypes.Range) {
                        return extHostTypeConverter.Range.from(value);
                    }
                    else if (value instanceof extHostTypes.Location) {
                        return extHostTypeConverter.location.from(value);
                    }
                    else if (extHostTypes.NotebookRange.isNotebookRange(value)) {
                        return extHostTypeConverter.NotebookRange.from(value);
                    }
                    else if (value instanceof ArrayBuffer) {
                        hasBuffers = true;
                        return buffer_1.VSBuffer.wrap(new Uint8Array(value));
                    }
                    else if (value instanceof Uint8Array) {
                        hasBuffers = true;
                        return buffer_1.VSBuffer.wrap(value);
                    }
                    else if (value instanceof buffer_1.VSBuffer) {
                        hasBuffers = true;
                        return value;
                    }
                    if (!Array.isArray(value)) {
                        return value;
                    }
                });
                try {
                    const result = await this.#proxy.$executeCommand(id, hasBuffers ? new proxyIdentifier_1.SerializableObjectWithBuffers(toArgs) : toArgs, retry);
                    return (0, marshalling_1.revive)(result);
                }
                catch (e) {
                    // Rerun the command when it wasn't known, had arguments, and when retry
                    // is enabled. We do this because the command might be registered inside
                    // the extension host now and can therefore accept the arguments as-is.
                    if (e instanceof Error && e.message === '$executeCommand:retry') {
                        return this._doExecuteCommand(id, args, false);
                    }
                    else {
                        throw e;
                    }
                }
            }
        }
        async _executeContributedCommand(id, args, annotateError) {
            const command = this._commands.get(id);
            if (!command) {
                throw new Error('Unknown command');
            }
            const { callback, thisArg, description } = command;
            if (description) {
                for (let i = 0; i < description.args.length; i++) {
                    try {
                        (0, types_1.validateConstraint)(args[i], description.args[i].constraint);
                    }
                    catch (err) {
                        throw new Error(`Running the contributed command: '${id}' failed. Illegal argument '${description.args[i].name}' - ${description.args[i].description}`);
                    }
                }
            }
            const stopWatch = stopwatch_1.StopWatch.create();
            try {
                return await callback.apply(thisArg, args);
            }
            catch (err) {
                // The indirection-command from the converter can fail when invoking the actual
                // command and in that case it is better to blame the correct command
                if (id === this.converter.delegatingCommandId) {
                    const actual = this.converter.getActualCommand(...args);
                    if (actual) {
                        id = actual.command;
                    }
                }
                this._logService.error(err, id, command.extension?.identifier);
                if (!annotateError) {
                    throw err;
                }
                if (command.extension?.identifier) {
                    const reported = this.#extHostTelemetry.onExtensionError(command.extension.identifier, err);
                    this._logService.trace('forwarded error to extension?', reported, command.extension?.identifier);
                }
                throw new class CommandError extends Error {
                    constructor() {
                        super((0, errorMessage_1.toErrorMessage)(err));
                        this.id = id;
                        this.source = command.extension?.displayName ?? command.extension?.name;
                    }
                };
            }
            finally {
                this._reportTelemetry(command, id, stopWatch.elapsed());
            }
        }
        _reportTelemetry(command, id, duration) {
            if (!command.extension) {
                return;
            }
            this.#telemetry.$publicLog2('Extension:ActionExecuted', {
                extensionId: command.extension.identifier.value,
                id: new telemetryUtils_1.TelemetryTrustedValue(id),
                duration: duration,
            });
        }
        $executeContributedCommand(id, ...args) {
            this._logService.trace('ExtHostCommands#$executeContributedCommand', id);
            const cmdHandler = this._commands.get(id);
            if (!cmdHandler) {
                return Promise.reject(new Error(`Contributed command '${id}' does not exist.`));
            }
            else {
                args = args.map(arg => this._argumentProcessors.reduce((r, p) => p.processArgument(r, cmdHandler.extension?.identifier), arg));
                return this._executeContributedCommand(id, args, true);
            }
        }
        getCommands(filterUnderscoreCommands = false) {
            this._logService.trace('ExtHostCommands#getCommands', filterUnderscoreCommands);
            return this.#proxy.$getCommands().then(result => {
                if (filterUnderscoreCommands) {
                    result = result.filter(command => command[0] !== '_');
                }
                return result;
            });
        }
        $getContributedCommandHandlerDescriptions() {
            const result = Object.create(null);
            for (const [id, command] of this._commands) {
                const { description } = command;
                if (description) {
                    result[id] = description;
                }
            }
            return Promise.resolve(result);
        }
    };
    exports.ExtHostCommands = ExtHostCommands;
    exports.ExtHostCommands = ExtHostCommands = __decorate([
        __param(0, extHostRpcService_1.IExtHostRpcService),
        __param(1, log_1.ILogService),
        __param(2, extHostTelemetry_1.IExtHostTelemetry)
    ], ExtHostCommands);
    exports.IExtHostCommands = (0, instantiation_1.createDecorator)('IExtHostCommands');
    class CommandsConverter {
        // --- conversion between internal and api commands
        constructor(_commands, _lookupApiCommand, _logService) {
            this._commands = _commands;
            this._lookupApiCommand = _lookupApiCommand;
            this._logService = _logService;
            this.delegatingCommandId = `__vsc${Date.now().toString(36)}`;
            this._cache = new Map();
            this._cachIdPool = 0;
            this._commands.registerCommand(true, this.delegatingCommandId, this._executeConvertedCommand, this);
        }
        toInternal(command, disposables) {
            if (!command) {
                return undefined;
            }
            const result = {
                $ident: undefined,
                id: command.command,
                title: command.title,
                tooltip: command.tooltip
            };
            if (!command.command) {
                // falsy command id -> return converted command but don't attempt any
                // argument or API-command dance since this command won't run anyways
                return result;
            }
            const apiCommand = this._lookupApiCommand(command.command);
            if (apiCommand) {
                // API command with return-value can be converted inplace
                result.id = apiCommand.internalId;
                result.arguments = apiCommand.args.map((arg, i) => arg.convert(command.arguments && command.arguments[i]));
            }
            else if ((0, arrays_1.isNonEmptyArray)(command.arguments)) {
                // we have a contributed command with arguments. that
                // means we don't want to send the arguments around
                const id = `${command.command}/${++this._cachIdPool}`;
                this._cache.set(id, command);
                disposables.add((0, lifecycle_1.toDisposable)(() => {
                    this._cache.delete(id);
                    this._logService.trace('CommandsConverter#DISPOSE', id);
                }));
                result.$ident = id;
                result.id = this.delegatingCommandId;
                result.arguments = [id];
                this._logService.trace('CommandsConverter#CREATE', command.command, id);
            }
            return result;
        }
        fromInternal(command) {
            if (typeof command.$ident === 'string') {
                return this._cache.get(command.$ident);
            }
            else {
                return {
                    command: command.id,
                    title: command.title,
                    arguments: command.arguments
                };
            }
        }
        getActualCommand(...args) {
            return this._cache.get(args[0]);
        }
        _executeConvertedCommand(...args) {
            const actualCmd = this.getActualCommand(...args);
            this._logService.trace('CommandsConverter#EXECUTE', args[0], actualCmd ? actualCmd.command : 'MISSING');
            if (!actualCmd) {
                return Promise.reject(`Actual command not found, wanted to execute ${args[0]}`);
            }
            return this._commands.executeCommand(actualCmd.command, ...(actualCmd.arguments || []));
        }
    }
    exports.CommandsConverter = CommandsConverter;
    class ApiCommandArgument {
        static { this.Uri = new ApiCommandArgument('uri', 'Uri of a text document', v => uri_1.URI.isUri(v), v => v); }
        static { this.Position = new ApiCommandArgument('position', 'A position in a text document', v => extHostTypes.Position.isPosition(v), extHostTypeConverter.Position.from); }
        static { this.Range = new ApiCommandArgument('range', 'A range in a text document', v => extHostTypes.Range.isRange(v), extHostTypeConverter.Range.from); }
        static { this.Selection = new ApiCommandArgument('selection', 'A selection in a text document', v => extHostTypes.Selection.isSelection(v), extHostTypeConverter.Selection.from); }
        static { this.Number = new ApiCommandArgument('number', '', v => typeof v === 'number', v => v); }
        static { this.String = new ApiCommandArgument('string', '', v => typeof v === 'string', v => v); }
        static { this.StringArray = ApiCommandArgument.Arr(ApiCommandArgument.String); }
        static Arr(element) {
            return new ApiCommandArgument(`${element.name}_array`, `Array of ${element.name}, ${element.description}`, (v) => Array.isArray(v) && v.every(e => element.validate(e)), (v) => v.map(e => element.convert(e)));
        }
        static { this.CallHierarchyItem = new ApiCommandArgument('item', 'A call hierarchy item', v => v instanceof extHostTypes.CallHierarchyItem, extHostTypeConverter.CallHierarchyItem.from); }
        static { this.TypeHierarchyItem = new ApiCommandArgument('item', 'A type hierarchy item', v => v instanceof extHostTypes.TypeHierarchyItem, extHostTypeConverter.TypeHierarchyItem.from); }
        static { this.TestItem = new ApiCommandArgument('testItem', 'A VS Code TestItem', v => v instanceof extHostTestItem_1.TestItemImpl, extHostTypeConverter.TestItem.from); }
        constructor(name, description, validate, convert) {
            this.name = name;
            this.description = description;
            this.validate = validate;
            this.convert = convert;
        }
        optional() {
            return new ApiCommandArgument(this.name, `(optional) ${this.description}`, value => value === undefined || value === null || this.validate(value), value => value === undefined ? undefined : value === null ? null : this.convert(value));
        }
        with(name, description) {
            return new ApiCommandArgument(name ?? this.name, description ?? this.description, this.validate, this.convert);
        }
    }
    exports.ApiCommandArgument = ApiCommandArgument;
    class ApiCommandResult {
        static { this.Void = new ApiCommandResult('no result', v => v); }
        constructor(description, convert) {
            this.description = description;
            this.convert = convert;
        }
    }
    exports.ApiCommandResult = ApiCommandResult;
    class ApiCommand {
        constructor(id, internalId, description, args, result) {
            this.id = id;
            this.internalId = internalId;
            this.description = description;
            this.args = args;
            this.result = result;
        }
    }
    exports.ApiCommand = ApiCommand;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdENvbW1hbmRzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9jb21tb24vZXh0SG9zdENvbW1hbmRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQTBDekYsSUFBTSxlQUFlLEdBQXJCLE1BQU0sZUFBZTtRQUkzQixNQUFNLENBQTBCO1FBSWhDLFVBQVUsQ0FBMkI7UUFHNUIsaUJBQWlCLENBQW9CO1FBSzlDLFlBQ3FCLFVBQThCLEVBQ3JDLFVBQXVCLEVBQ2pCLGdCQUFtQztZQWJ0QyxjQUFTLEdBQUcsSUFBSSxHQUFHLEVBQTBCLENBQUM7WUFDOUMsaUJBQVksR0FBRyxJQUFJLEdBQUcsRUFBc0IsQ0FBQztZQWM3RCxJQUFJLENBQUMsTUFBTSxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsOEJBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQ2xFLElBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO1lBQzlCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxnQkFBZ0IsQ0FBQztZQUMxQyxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsOEJBQVcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1lBQ3ZFLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxpQkFBaUIsQ0FDckMsSUFBSSxFQUNKLEVBQUUsQ0FBQyxFQUFFO2dCQUNKLHNEQUFzRDtnQkFDdEQscURBQXFEO2dCQUNyRCwyQkFBMkI7Z0JBQzNCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUM1QyxPQUFPLFNBQVMsRUFBRSxNQUFNLEtBQUssZ0JBQWdCLENBQUMsSUFBSTtvQkFDakQsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1lBQzFC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