/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/keybindings", "vs/base/common/platform", "vs/platform/commands/common/commands", "vs/platform/registry/common/platform", "vs/base/common/lifecycle", "vs/base/common/linkedList"], function (require, exports, keybindings_1, platform_1, commands_1, platform_2, lifecycle_1, linkedList_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Ou = exports.$Nu = exports.KeybindingWeight = void 0;
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
            this.c = new linkedList_1.$tc();
            this.d = [];
            this.e = null;
        }
        /**
         * Take current platform into account and reduce to primary & secondary.
         */
        static f(kb) {
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
            const actualKb = KeybindingsRegistryImpl.f(rule);
            const result = new lifecycle_1.$jc();
            if (actualKb && actualKb.primary) {
                const kk = (0, keybindings_1.$wq)(actualKb.primary, platform_1.OS);
                if (kk) {
                    result.add(this.g(kk, rule.id, rule.args, rule.weight, 0, rule.when));
                }
            }
            if (actualKb && Array.isArray(actualKb.secondary)) {
                for (let i = 0, len = actualKb.secondary.length; i < len; i++) {
                    const k = actualKb.secondary[i];
                    const kk = (0, keybindings_1.$wq)(k, platform_1.OS);
                    if (kk) {
                        result.add(this.g(kk, rule.id, rule.args, rule.weight, -i - 1, rule.when));
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
            this.d = result;
            this.e = null;
        }
        registerCommandAndKeybindingRule(desc) {
            return (0, lifecycle_1.$hc)(this.registerKeybindingRule(desc), commands_1.$Gr.registerCommand(desc));
        }
        g(keybinding, commandId, commandArgs, weight1, weight2, when) {
            const remove = this.c.push({
                keybinding: keybinding,
                command: commandId,
                commandArgs: commandArgs,
                when: when,
                weight1: weight1,
                weight2: weight2,
                extensionId: null,
                isBuiltinExtension: false
            });
            this.e = null;
            return (0, lifecycle_1.$ic)(() => {
                remove();
                this.e = null;
            });
        }
        getDefaultKeybindings() {
            if (!this.e) {
                this.e = Array.from(this.c).concat(this.d);
                this.e.sort(sorter);
            }
            return this.e.slice(0);
        }
    }
    exports.$Nu = new KeybindingsRegistryImpl();
    // Define extension point ids
    exports.$Ou = {
        EditorModes: 'platform.keybindingsRegistry'
    };
    platform_2.$8m.add(exports.$Ou.EditorModes, exports.$Nu);
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
//# sourceMappingURL=keybindingsRegistry.js.map