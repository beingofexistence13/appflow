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
    exports.$pM = exports.$oM = exports.$nM = exports.$mM = exports.$lM = exports.$kM = void 0;
    let $kM = class $kM {
        #proxy;
        #telemetry;
        #extHostTelemetry;
        constructor(extHostRpc, logService, extHostTelemetry) {
            this.b = new Map();
            this.c = new Map();
            this.#proxy = extHostRpc.getProxy(extHost_protocol_1.$1J.MainThreadCommands);
            this.d = logService;
            this.#extHostTelemetry = extHostTelemetry;
            this.#telemetry = extHostRpc.getProxy(extHost_protocol_1.$1J.MainThreadTelemetry);
            this.converter = new $mM(this, id => {
                // API commands that have no return type (void) can be
                // converted to their internal command and don't need
                // any indirection commands
                const candidate = this.c.get(id);
                return candidate?.result === $oM.Void
                    ? candidate : undefined;
            }, logService);
            this.f = [
                {
                    processArgument(a) {
                        // URI, Regex
                        return (0, marshalling_1.$$g)(a);
                    }
                },
                {
                    processArgument(arg) {
                        return (0, objects_1.$Xm)(arg, function (obj) {
                            // Reverse of https://github.com/microsoft/vscode/blob/1f28c5fc681f4c01226460b6d1c7e91b8acb4a5b/src/vs/workbench/api/node/extHostCommands.ts#L112-L127
                            if (range_1.$ks.isIRange(obj)) {
                                return extHostTypeConverter.Range.to(obj);
                            }
                            if (position_1.$js.isIPosition(obj)) {
                                return extHostTypeConverter.Position.to(obj);
                            }
                            if (range_1.$ks.isIRange(obj.range) && uri_1.URI.isUri(obj.uri)) {
                                return extHostTypeConverter.location.to(obj);
                            }
                            if (obj instanceof buffer_1.$Fd) {
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
            this.f.push(processor);
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
            this.c.set(apiCommand.id, apiCommand);
            return new extHostTypes.$3J(() => {
                registration.dispose();
                this.c.delete(apiCommand.id);
            });
        }
        registerCommand(global, id, callback, thisArg, description, extension) {
            this.d.trace('ExtHostCommands#registerCommand', id);
            if (!id.trim().length) {
                throw new Error('invalid id');
            }
            if (this.b.has(id)) {
                throw new Error(`command '${id}' already exists`);
            }
            this.b.set(id, { callback, thisArg, description, extension });
            if (global) {
                this.#proxy.$registerCommand(id);
            }
            return new extHostTypes.$3J(() => {
                if (this.b.delete(id)) {
                    if (global) {
                        this.#proxy.$unregisterCommand(id);
                    }
                }
            });
        }
        executeCommand(id, ...args) {
            this.d.trace('ExtHostCommands#executeCommand', id);
            return this.g(id, args, true);
        }
        async g(id, args, retry) {
            if (this.b.has(id)) {
                // - We stay inside the extension host and support
                // 	 to pass any kind of parameters around.
                // - We still emit the corresponding activation event
                //   BUT we don't await that event
                this.#proxy.$fireCommandActivationEvent(id);
                return this.h(id, args, false);
            }
            else {
                // automagically convert some argument types
                let hasBuffers = false;
                const toArgs = (0, objects_1.$Xm)(args, function (value) {
                    if (value instanceof extHostTypes.$4J) {
                        return extHostTypeConverter.Position.from(value);
                    }
                    else if (value instanceof extHostTypes.$5J) {
                        return extHostTypeConverter.Range.from(value);
                    }
                    else if (value instanceof extHostTypes.$cK) {
                        return extHostTypeConverter.location.from(value);
                    }
                    else if (extHostTypes.$nL.isNotebookRange(value)) {
                        return extHostTypeConverter.NotebookRange.from(value);
                    }
                    else if (value instanceof ArrayBuffer) {
                        hasBuffers = true;
                        return buffer_1.$Fd.wrap(new Uint8Array(value));
                    }
                    else if (value instanceof Uint8Array) {
                        hasBuffers = true;
                        return buffer_1.$Fd.wrap(value);
                    }
                    else if (value instanceof buffer_1.$Fd) {
                        hasBuffers = true;
                        return value;
                    }
                    if (!Array.isArray(value)) {
                        return value;
                    }
                });
                try {
                    const result = await this.#proxy.$executeCommand(id, hasBuffers ? new proxyIdentifier_1.$dA(toArgs) : toArgs, retry);
                    return (0, marshalling_1.$$g)(result);
                }
                catch (e) {
                    // Rerun the command when it wasn't known, had arguments, and when retry
                    // is enabled. We do this because the command might be registered inside
                    // the extension host now and can therefore accept the arguments as-is.
                    if (e instanceof Error && e.message === '$executeCommand:retry') {
                        return this.g(id, args, false);
                    }
                    else {
                        throw e;
                    }
                }
            }
        }
        async h(id, args, annotateError) {
            const command = this.b.get(id);
            if (!command) {
                throw new Error('Unknown command');
            }
            const { callback, thisArg, description } = command;
            if (description) {
                for (let i = 0; i < description.args.length; i++) {
                    try {
                        (0, types_1.$Af)(args[i], description.args[i].constraint);
                    }
                    catch (err) {
                        throw new Error(`Running the contributed command: '${id}' failed. Illegal argument '${description.args[i].name}' - ${description.args[i].description}`);
                    }
                }
            }
            const stopWatch = stopwatch_1.$bd.create();
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
                this.d.error(err, id, command.extension?.identifier);
                if (!annotateError) {
                    throw err;
                }
                if (command.extension?.identifier) {
                    const reported = this.#extHostTelemetry.onExtensionError(command.extension.identifier, err);
                    this.d.trace('forwarded error to extension?', reported, command.extension?.identifier);
                }
                throw new class CommandError extends Error {
                    constructor() {
                        super((0, errorMessage_1.$mi)(err));
                        this.id = id;
                        this.source = command.extension?.displayName ?? command.extension?.name;
                    }
                };
            }
            finally {
                this.j(command, id, stopWatch.elapsed());
            }
        }
        j(command, id, duration) {
            if (!command.extension) {
                return;
            }
            this.#telemetry.$publicLog2('Extension:ActionExecuted', {
                extensionId: command.extension.identifier.value,
                id: new telemetryUtils_1.$_n(id),
                duration: duration,
            });
        }
        $executeContributedCommand(id, ...args) {
            this.d.trace('ExtHostCommands#$executeContributedCommand', id);
            const cmdHandler = this.b.get(id);
            if (!cmdHandler) {
                return Promise.reject(new Error(`Contributed command '${id}' does not exist.`));
            }
            else {
                args = args.map(arg => this.f.reduce((r, p) => p.processArgument(r, cmdHandler.extension?.identifier), arg));
                return this.h(id, args, true);
            }
        }
        getCommands(filterUnderscoreCommands = false) {
            this.d.trace('ExtHostCommands#getCommands', filterUnderscoreCommands);
            return this.#proxy.$getCommands().then(result => {
                if (filterUnderscoreCommands) {
                    result = result.filter(command => command[0] !== '_');
                }
                return result;
            });
        }
        $getContributedCommandHandlerDescriptions() {
            const result = Object.create(null);
            for (const [id, command] of this.b) {
                const { description } = command;
                if (description) {
                    result[id] = description;
                }
            }
            return Promise.resolve(result);
        }
    };
    exports.$kM = $kM;
    exports.$kM = $kM = __decorate([
        __param(0, extHostRpcService_1.$2L),
        __param(1, log_1.$5i),
        __param(2, extHostTelemetry_1.$jM)
    ], $kM);
    exports.$lM = (0, instantiation_1.$Bh)('IExtHostCommands');
    class $mM {
        // --- conversion between internal and api commands
        constructor(d, f, g) {
            this.d = d;
            this.f = f;
            this.g = g;
            this.delegatingCommandId = `__vsc${Date.now().toString(36)}`;
            this.b = new Map();
            this.c = 0;
            this.d.registerCommand(true, this.delegatingCommandId, this.h, this);
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
            const apiCommand = this.f(command.command);
            if (apiCommand) {
                // API command with return-value can be converted inplace
                result.id = apiCommand.internalId;
                result.arguments = apiCommand.args.map((arg, i) => arg.convert(command.arguments && command.arguments[i]));
            }
            else if ((0, arrays_1.$Jb)(command.arguments)) {
                // we have a contributed command with arguments. that
                // means we don't want to send the arguments around
                const id = `${command.command}/${++this.c}`;
                this.b.set(id, command);
                disposables.add((0, lifecycle_1.$ic)(() => {
                    this.b.delete(id);
                    this.g.trace('CommandsConverter#DISPOSE', id);
                }));
                result.$ident = id;
                result.id = this.delegatingCommandId;
                result.arguments = [id];
                this.g.trace('CommandsConverter#CREATE', command.command, id);
            }
            return result;
        }
        fromInternal(command) {
            if (typeof command.$ident === 'string') {
                return this.b.get(command.$ident);
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
            return this.b.get(args[0]);
        }
        h(...args) {
            const actualCmd = this.getActualCommand(...args);
            this.g.trace('CommandsConverter#EXECUTE', args[0], actualCmd ? actualCmd.command : 'MISSING');
            if (!actualCmd) {
                return Promise.reject(`Actual command not found, wanted to execute ${args[0]}`);
            }
            return this.d.executeCommand(actualCmd.command, ...(actualCmd.arguments || []));
        }
    }
    exports.$mM = $mM;
    class $nM {
        static { this.Uri = new $nM('uri', 'Uri of a text document', v => uri_1.URI.isUri(v), v => v); }
        static { this.Position = new $nM('position', 'A position in a text document', v => extHostTypes.$4J.isPosition(v), extHostTypeConverter.Position.from); }
        static { this.Range = new $nM('range', 'A range in a text document', v => extHostTypes.$5J.isRange(v), extHostTypeConverter.Range.from); }
        static { this.Selection = new $nM('selection', 'A selection in a text document', v => extHostTypes.$6J.isSelection(v), extHostTypeConverter.Selection.from); }
        static { this.Number = new $nM('number', '', v => typeof v === 'number', v => v); }
        static { this.String = new $nM('string', '', v => typeof v === 'string', v => v); }
        static { this.StringArray = $nM.Arr($nM.String); }
        static Arr(element) {
            return new $nM(`${element.name}_array`, `Array of ${element.name}, ${element.description}`, (v) => Array.isArray(v) && v.every(e => element.validate(e)), (v) => v.map(e => element.convert(e)));
        }
        static { this.CallHierarchyItem = new $nM('item', 'A call hierarchy item', v => v instanceof extHostTypes.$mK, extHostTypeConverter.CallHierarchyItem.from); }
        static { this.TypeHierarchyItem = new $nM('item', 'A type hierarchy item', v => v instanceof extHostTypes.$GL, extHostTypeConverter.TypeHierarchyItem.from); }
        static { this.TestItem = new $nM('testItem', 'A VS Code TestItem', v => v instanceof extHostTestItem_1.$cM, extHostTypeConverter.TestItem.from); }
        constructor(name, description, validate, convert) {
            this.name = name;
            this.description = description;
            this.validate = validate;
            this.convert = convert;
        }
        optional() {
            return new $nM(this.name, `(optional) ${this.description}`, value => value === undefined || value === null || this.validate(value), value => value === undefined ? undefined : value === null ? null : this.convert(value));
        }
        with(name, description) {
            return new $nM(name ?? this.name, description ?? this.description, this.validate, this.convert);
        }
    }
    exports.$nM = $nM;
    class $oM {
        static { this.Void = new $oM('no result', v => v); }
        constructor(description, convert) {
            this.description = description;
            this.convert = convert;
        }
    }
    exports.$oM = $oM;
    class $pM {
        constructor(id, internalId, description, args, result) {
            this.id = id;
            this.internalId = internalId;
            this.description = description;
            this.args = args;
            this.result = result;
        }
    }
    exports.$pM = $pM;
});
//# sourceMappingURL=extHostCommands.js.map