/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/keybindings", "vs/base/common/platform", "vs/platform/commands/common/commands", "vs/platform/registry/common/platform", "vs/base/common/lifecycle", "vs/base/common/linkedList"], function (require, exports, keybindings_1, platform_1, commands_1, platform_2, lifecycle_1, linkedList_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Extensions = exports.KeybindingsRegistry = exports.KeybindingWeight = void 0;
    var KeybindingWeight;
    (function (KeybindingWeight) {
        KeybindingWeight[KeybindingWeight["EditorCore"] = 0] = "EditorCore";
        KeybindingWeight[KeybindingWeight["EditorContrib"] = 100] = "EditorContrib";
        KeybindingWeight[KeybindingWeight["WorkbenchContrib"] = 200] = "WorkbenchContrib";
        KeybindingWeight[KeybindingWeight["BuiltinExtension"] = 300] = "BuiltinExtension";
        KeybindingWeight[KeybindingWeight["ExternalExtension"] = 400] = "ExternalExtension";
    })(KeybindingWeight || (exports.KeybindingWeight = KeybindingWeight = {}));
    /**
     * Stores all built-in and extension-provided keybindings (but not ones that user defines themselves)
     */
    class KeybindingsRegistryImpl {
        constructor() {
            this._coreKeybindings = new linkedList_1.LinkedList();
            this._extensionKeybindings = [];
            this._cachedMergedKeybindings = null;
        }
        /**
         * Take current platform into account and reduce to primary & secondary.
         */
        static bindToCurrentPlatform(kb) {
            if (platform_1.OS === 1 /* OperatingSystem.Windows */) {
                if (kb && kb.win) {
                    return kb.win;
                }
            }
            else if (platform_1.OS === 2 /* OperatingSystem.Macintosh */) {
                if (kb && kb.mac) {
                    return kb.mac;
                }
            }
            else {
                if (kb && kb.linux) {
                    return kb.linux;
                }
            }
            return kb;
        }
        registerKeybindingRule(rule) {
            const actualKb = KeybindingsRegistryImpl.bindToCurrentPlatform(rule);
            const result = new lifecycle_1.DisposableStore();
            if (actualKb && actualKb.primary) {
                const kk = (0, keybindings_1.decodeKeybinding)(actualKb.primary, platform_1.OS);
                if (kk) {
                    result.add(this._registerDefaultKeybinding(kk, rule.id, rule.args, rule.weight, 0, rule.when));
                }
            }
            if (actualKb && Array.isArray(actualKb.secondary)) {
                for (let i = 0, len = actualKb.secondary.length; i < len; i++) {
                    const k = actualKb.secondary[i];
                    const kk = (0, keybindings_1.decodeKeybinding)(k, platform_1.OS);
                    if (kk) {
                        result.add(this._registerDefaultKeybinding(kk, rule.id, rule.args, rule.weight, -i - 1, rule.when));
                    }
                }
            }
            return result;
        }
        setExtensionKeybindings(rules) {
            const result = [];
            let keybindingsLen = 0;
            for (const rule of rules) {
                if (rule.keybinding) {
                    result[keybindingsLen++] = {
                        keybinding: rule.keybinding,
                        command: rule.id,
                        commandArgs: rule.args,
                        when: rule.when,
                        weight1: rule.weight,
                        weight2: 0,
                        extensionId: rule.extensionId || null,
                        isBuiltinExtension: rule.isBuiltinExtension || false
                    };
                }
            }
            this._extensionKeybindings = result;
            this._cachedMergedKeybindings = null;
        }
        registerCommandAndKeybindingRule(desc) {
            return (0, lifecycle_1.combinedDisposable)(this.registerKeybindingRule(desc), commands_1.CommandsRegistry.registerCommand(desc));
        }
        _registerDefaultKeybinding(keybinding, commandId, commandArgs, weight1, weight2, when) {
            const remove = this._coreKeybindings.push({
                keybinding: keybinding,
                command: commandId,
                commandArgs: commandArgs,
                when: when,
                weight1: weight1,
                weight2: weight2,
                extensionId: null,
                isBuiltinExtension: false
            });
            this._cachedMergedKeybindings = null;
            return (0, lifecycle_1.toDisposable)(() => {
                remove();
                this._cachedMergedKeybindings = null;
            });
        }
        getDefaultKeybindings() {
            if (!this._cachedMergedKeybindings) {
                this._cachedMergedKeybindings = Array.from(this._coreKeybindings).concat(this._extensionKeybindings);
                this._cachedMergedKeybindings.sort(sorter);
            }
            return this._cachedMergedKeybindings.slice(0);
        }
    }
    exports.KeybindingsRegistry = new KeybindingsRegistryImpl();
    // Define extension point ids
    exports.Extensions = {
        EditorModes: 'platform.keybindingsRegistry'
    };
    platform_2.Registry.add(exports.Extensions.EditorModes, exports.KeybindingsRegistry);
    function sorter(a, b) {
        if (a.weight1 !== b.weight1) {
            return a.weight1 - b.weight1;
        }
        if (a.command && b.command) {
            if (a.command < b.command) {
                return -1;
            }
            if (a.command > b.command) {
                return 1;
            }
        }
        return a.weight2 - b.weight2;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5YmluZGluZ3NSZWdpc3RyeS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2tleWJpbmRpbmcvY29tbW9uL2tleWJpbmRpbmdzUmVnaXN0cnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBdURoRyxJQUFrQixnQkFNakI7SUFORCxXQUFrQixnQkFBZ0I7UUFDakMsbUVBQWMsQ0FBQTtRQUNkLDJFQUFtQixDQUFBO1FBQ25CLGlGQUFzQixDQUFBO1FBQ3RCLGlGQUFzQixDQUFBO1FBQ3RCLG1GQUF1QixDQUFBO0lBQ3hCLENBQUMsRUFOaUIsZ0JBQWdCLGdDQUFoQixnQkFBZ0IsUUFNakM7SUFjRDs7T0FFRztJQUNILE1BQU0sdUJBQXVCO1FBTTVCO1lBQ0MsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksdUJBQVUsRUFBRSxDQUFDO1lBQ3pDLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxFQUFFLENBQUM7WUFDaEMsSUFBSSxDQUFDLHdCQUF3QixHQUFHLElBQUksQ0FBQztRQUN0QyxDQUFDO1FBRUQ7O1dBRUc7UUFDSyxNQUFNLENBQUMscUJBQXFCLENBQUMsRUFBZ0I7WUFDcEQsSUFBSSxhQUFFLG9DQUE0QixFQUFFO2dCQUNuQyxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFO29CQUNqQixPQUFPLEVBQUUsQ0FBQyxHQUFHLENBQUM7aUJBQ2Q7YUFDRDtpQkFBTSxJQUFJLGFBQUUsc0NBQThCLEVBQUU7Z0JBQzVDLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUU7b0JBQ2pCLE9BQU8sRUFBRSxDQUFDLEdBQUcsQ0FBQztpQkFDZDthQUNEO2lCQUFNO2dCQUNOLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxLQUFLLEVBQUU7b0JBQ25CLE9BQU8sRUFBRSxDQUFDLEtBQUssQ0FBQztpQkFDaEI7YUFDRDtZ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