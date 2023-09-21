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
define(["require", "exports", "vs/base/common/lifecycle", "vs/editor/common/services/model", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/terminal/browser/terminal"], function (require, exports, lifecycle_1, model_1, configuration_1, contextkey_1, terminal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$wWb = void 0;
    let $wWb = class $wWb extends lifecycle_1.$jc {
        constructor(b, c, _modelService, _configurationService, _contextKeyService, _terminalService, configurationService) {
            super();
            this.b = b;
            this.c = c;
            this.options = { type: "view" /* AccessibleViewType.View */, language: 'terminal', positionBottom: true };
            this.verbositySettingKey = "accessibility.verbosity.terminal" /* AccessibilityVerbositySettingId.Terminal */;
        }
        onClose() {
            this.b.focus();
        }
        registerListeners() {
            if (!this.a) {
                return;
            }
        }
        provideContent() {
            this.c.update();
            return this.c.lines.join('\n');
        }
        getSymbols() {
            const commands = this.h() ?? [];
            const symbols = [];
            for (const command of commands) {
                const label = command.command.command;
                if (label) {
                    symbols.push({
                        label,
                        lineNumber: command.lineNumber
                    });
                }
            }
            return symbols;
        }
        h() {
            const capability = this.b.capabilities.get(2 /* TerminalCapability.CommandDetection */);
            const commands = capability?.commands;
            const currentCommand = capability?.currentCommand;
            if (!commands?.length) {
                return;
            }
            const result = [];
            for (const command of commands) {
                const lineNumber = this.j(command);
                if (lineNumber === undefined) {
                    continue;
                }
                result.push({ command, lineNumber });
            }
            if (currentCommand) {
                const lineNumber = this.j(currentCommand);
                if (lineNumber !== undefined) {
                    result.push({ command: currentCommand, lineNumber });
                }
            }
            return result;
        }
        j(command) {
            let line;
            if ('marker' in command) {
                line = command.marker?.line;
            }
            else if ('commandStartMarker' in command) {
                line = command.commandStartMarker?.line;
            }
            if (line === undefined || line < 0) {
                return;
            }
            line = this.c.bufferToEditorLineMapping.get(line);
            if (line === undefined) {
                return;
            }
            return line + 1;
        }
    };
    exports.$wWb = $wWb;
    exports.$wWb = $wWb = __decorate([
        __param(2, model_1.$yA),
        __param(3, configuration_1.$8h),
        __param(4, contextkey_1.$3i),
        __param(5, terminal_1.$Mib),
        __param(6, configuration_1.$8h)
    ], $wWb);
});
//# sourceMappingURL=terminalAccessibleBufferProvider.js.map