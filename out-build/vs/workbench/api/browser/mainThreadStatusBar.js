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
define(["require", "exports", "../common/extHost.protocol", "vs/workbench/services/extensions/common/extHostCustomers", "vs/base/common/lifecycle", "vs/workbench/api/browser/statusBarExtensionPoint"], function (require, exports, extHost_protocol_1, extHostCustomers_1, lifecycle_1, statusBarExtensionPoint_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Okb = void 0;
    let $Okb = class $Okb {
        constructor(extHostContext, b) {
            this.b = b;
            this.a = new lifecycle_1.$jc();
            const proxy = extHostContext.getProxy(extHost_protocol_1.$2J.ExtHostStatusBar);
            // once, at startup read existing items and send them over
            const entries = [];
            for (const [entryId, item] of b.getEntries()) {
                entries.push(asDto(entryId, item));
            }
            proxy.$acceptStaticEntries(entries);
            this.a.add(b.onDidChange(e => {
                if (e.added) {
                    proxy.$acceptStaticEntries([asDto(e.added[0], e.added[1])]);
                }
            }));
            function asDto(entryId, item) {
                return {
                    entryId,
                    name: item.entry.name,
                    text: item.entry.text,
                    tooltip: item.entry.tooltip,
                    command: typeof item.entry.command === 'string' ? item.entry.command : typeof item.entry.command === 'object' ? item.entry.command.id : undefined,
                    priority: item.priority,
                    alignLeft: item.alignment === 0 /* StatusbarAlignment.LEFT */,
                    accessibilityInformation: item.entry.ariaLabel ? { label: item.entry.ariaLabel, role: item.entry.role } : undefined
                };
            }
        }
        dispose() {
            this.a.dispose();
        }
        $setEntry(entryId, id, extensionId, name, text, tooltip, command, color, backgroundColor, alignLeft, priority, accessibilityInformation) {
            const kind = this.b.setOrUpdateEntry(entryId, id, extensionId, name, text, tooltip, command, color, backgroundColor, alignLeft, priority, accessibilityInformation);
            if (kind === 0 /* StatusBarUpdateKind.DidDefine */) {
                this.a.add((0, lifecycle_1.$ic)(() => this.b.unsetEntry(entryId)));
            }
        }
        $disposeEntry(entryId) {
            this.b.unsetEntry(entryId);
        }
    };
    exports.$Okb = $Okb;
    exports.$Okb = $Okb = __decorate([
        (0, extHostCustomers_1.$jbb)(extHost_protocol_1.$1J.MainThreadStatusBar),
        __param(1, statusBarExtensionPoint_1.$hbb)
    ], $Okb);
});
//# sourceMappingURL=mainThreadStatusBar.js.map