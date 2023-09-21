/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/keybindingParser", "vs/platform/contextkey/common/contextkey"], function (require, exports, keybindingParser_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OutputBuilder = exports.KeybindingIO = void 0;
    class KeybindingIO {
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
                ? keybindingParser_1.KeybindingParser.parseKeybinding(input.key)
                : null;
            const when = 'when' in input && typeof input.when === 'string'
                ? contextkey_1.ContextKeyExpr.deserialize(input.when)
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
    exports.KeybindingIO = KeybindingIO;
    function rightPaddedString(str, minChars) {
        if (str.length < minChars) {
            return str + (new Array(minChars - str.length).join(' '));
        }
        return str;
    }
    class OutputBuilder {
        constructor() {
            this._lines = [];
            this._currentLine = '';
        }
        write(str) {
            this._currentLine += str;
        }
        writeLine(str = '') {
            this._lines.push(this._currentLine + str);
            this._currentLine = '';
        }
        toString() {
            this.writeLine();
            return this._lines.join('\n');
        }
    }
    exports.OutputBuilder = OutputBuilder;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5YmluZGluZ0lPLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL2tleWJpbmRpbmcvY29tbW9uL2tleWJpbmRpbmdJTy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFlaEcsTUFBYSxZQUFZO1FBRWpCLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxHQUFrQixFQUFFLElBQTRCO1lBQ2pGLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUU7Z0JBQzdCLE9BQU87YUFDUDtZQUNELE1BQU0sMEJBQTBCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxDQUFDO1lBQ2xHLEdBQUcsQ0FBQyxLQUFLLENBQUMsWUFBWSxpQkFBaUIsQ0FBQywwQkFBMEIsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBRTdGLE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUNwRixNQUFNLHNCQUFzQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzVELElBQUksb0JBQW9CLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDcEMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLHNCQUFzQixHQUFHLENBQUMsQ0FBQztnQkFDeEMsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUNoQixHQUFHLENBQUMsS0FBSyxDQUFDLGdEQUFnRCxvQkFBb0IsRUFBRSxDQUFDLENBQUM7YUFDbEY7aUJBQU07Z0JBQ04sR0FBRyxDQUFD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