/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/keybindingParser", "vs/platform/contextkey/common/contextkey"], function (require, exports, keybindingParser_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$1yb = exports.$Zyb = void 0;
    class $Zyb {
        static writeKeybindingItem(out, item) {
            if (!item.resolvedKeybinding) {
                return;
            }
            const quotedSerializedKeybinding = JSON.stringify(item.resolvedKeybinding.getUserSettingsLabel());
            out.write(`{ "key": ${rightPaddedString(quotedSerializedKeybinding + ',', 25)} "command": `);
            const quotedSerializedWhen = item.when ? JSON.stringify(item.when.serialize()) : '';
            const quotedSerializeCommand = JSON.stringify(item.command);
            if (quotedSerializedWhen.length > 0) {
                out.write(`${quotedSerializeCommand},`);
                out.writeLine();
                out.write(`                                     "when": ${quotedSerializedWhen}`);
            }
            else {
                out.write(`${quotedSerializeCommand}`);
            }
            if (item.commandArgs) {
                out.write(',');
                out.writeLine();
                out.write(`                                     "args": ${JSON.stringify(item.commandArgs)}`);
            }
            out.write(' }');
        }
        static readUserKeybindingItem(input) {
            const keybinding = 'key' in input && typeof input.key === 'string'
                ? keybindingParser_1.$GS.parseKeybinding(input.key)
                : null;
            const when = 'when' in input && typeof input.when === 'string'
                ? contextkey_1.$Ii.deserialize(input.when)
                : undefined;
            const command = 'command' in input && typeof input.command === 'string'
                ? input.command
                : null;
            const commandArgs = 'args' in input && typeof input.args !== 'undefined'
                ? input.args
                : undefined;
            return {
                keybinding,
                command,
                commandArgs,
                when,
                _sourceKey: 'key' in input && typeof input.key === 'string' ? input.key : undefined,
            };
        }
    }
    exports.$Zyb = $Zyb;
    function rightPaddedString(str, minChars) {
        if (str.length < minChars) {
            return str + (new Array(minChars - str.length).join(' '));
        }
        return str;
    }
    class $1yb {
        constructor() {
            this.a = [];
            this.b = '';
        }
        write(str) {
            this.b += str;
        }
        writeLine(str = '') {
            this.a.push(this.b + str);
            this.b = '';
        }
        toString() {
            this.writeLine();
            return this.a.join('\n');
        }
    }
    exports.$1yb = $1yb;
});
//# sourceMappingURL=keybindingIO.js.map