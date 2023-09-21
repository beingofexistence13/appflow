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
define(["require", "exports", "vs/base/common/lifecycle", "vs/nls!vs/workbench/api/browser/statusBarExtensionPoint", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/workbench/services/statusbar/browser/statusbar", "vs/platform/accessibility/common/accessibility", "vs/base/common/iconLabels", "vs/base/common/hash", "vs/base/common/event", "vs/platform/instantiation/common/extensions", "vs/base/common/iterator", "vs/platform/extensions/common/extensions", "vs/workbench/api/common/extHostTypes", "vs/workbench/common/theme"], function (require, exports, lifecycle_1, nls_1, instantiation_1, extensions_1, extensionsRegistry_1, statusbar_1, accessibility_1, iconLabels_1, hash_1, event_1, extensions_2, iterator_1, extensions_3, extHostTypes_1, theme_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ibb = exports.StatusBarUpdateKind = exports.$hbb = void 0;
    // --- service
    exports.$hbb = (0, instantiation_1.$Bh)('IExtensionStatusBarItemService');
    var StatusBarUpdateKind;
    (function (StatusBarUpdateKind) {
        StatusBarUpdateKind[StatusBarUpdateKind["DidDefine"] = 0] = "DidDefine";
        StatusBarUpdateKind[StatusBarUpdateKind["DidUpdate"] = 1] = "DidUpdate";
    })(StatusBarUpdateKind || (exports.StatusBarUpdateKind = StatusBarUpdateKind = {}));
    let ExtensionStatusBarItemService = class ExtensionStatusBarItemService {
        constructor(c) {
            this.c = c;
            this.a = new Map();
            this.b = new event_1.$fd();
            this.onDidChange = this.b.event;
        }
        dispose() {
            this.a.forEach(entry => entry.accessor.dispose());
            this.a.clear();
            this.b.dispose();
        }
        setOrUpdateEntry(entryId, id, extensionId, name, text, tooltip, command, color, backgroundColor, alignLeft, priority, accessibilityInformation) {
            // if there are icons in the text use the tooltip for the aria label
            let ariaLabel;
            let role = undefined;
            if (accessibilityInformation) {
                ariaLabel = accessibilityInformation.label;
                role = accessibilityInformation.role;
            }
            else {
                ariaLabel = (0, iconLabels_1.$Uj)(text);
                if (tooltip) {
                    const tooltipString = typeof tooltip === 'string' ? tooltip : tooltip.value;
                    ariaLabel += `, ${tooltipString}`;
                }
            }
            let kind = undefined;
            switch (backgroundColor?.id) {
                case theme_1.$eab:
                case theme_1.$iab:
                    // override well known colors that map to status entry kinds to support associated themable hover colors
                    kind = backgroundColor.id === theme_1.$eab ? 'error' : 'warning';
                    color = undefined;
                    backgroundColor = undefined;
            }
            const entry = { name, text, tooltip, command, color, backgroundColor, ariaLabel, role, kind };
            if (typeof priority === 'undefined') {
                priority = 0;
            }
            let alignment = alignLeft ? 0 /* StatusbarAlignment.LEFT */ : 1 /* StatusbarAlignment.RIGHT */;
            // alignment and priority can only be set once (at creation time)
            const existingEntry = this.a.get(entryId);
            if (existingEntry) {
                alignment = existingEntry.alignment;
                priority = existingEntry.priority;
            }
            // Create new entry if not existing
            if (!existingEntry) {
                let entryPriority;
                if (typeof extensionId === 'string') {
                    // We cannot enforce unique priorities across all extensions, so we
                    // use the extension identifier as a secondary sort key to reduce
                    // the likelyhood of collisions.
                    // See https://github.com/microsoft/vscode/issues/177835
                    // See https://github.com/microsoft/vscode/issues/123827
                    entryPriority = { primary: priority, secondary: (0, hash_1.$pi)(extensionId) };
                }
                else {
                    entryPriority = priority;
                }
                const accessor = this.c.addEntry(entry, id, alignment, entryPriority);
                this.a.set(entryId, {
                    accessor,
                    entry,
                    alignment,
                    priority,
                    disposable: (0, lifecycle_1.$ic)(() => {
                        accessor.dispose();
                        this.a.delete(entryId);
                        this.b.fire({ removed: entryId });
                    })
                });
                this.b.fire({ added: [entryId, { entry, alignment, priority }] });
                return 0 /* StatusBarUpdateKind.DidDefine */;
            }
            else {
                // Otherwise update
                existingEntry.accessor.update(entry);
                existingEntry.entry = entry;
                return 1 /* StatusBarUpdateKind.DidUpdate */;
            }
        }
        unsetEntry(entryId) {
            this.a.get(entryId)?.disposable.dispose();
            this.a.delete(entryId);
        }
        getEntries() {
            return this.a.entries();
        }
    };
    ExtensionStatusBarItemService = __decorate([
        __param(0, statusbar_1.$6$)
    ], ExtensionStatusBarItemService);
    (0, extensions_2.$mr)(exports.$hbb, ExtensionStatusBarItemService, 1 /* InstantiationType.Delayed */);
    function isUserFriendlyStatusItemEntry(candidate) {
        const obj = candidate;
        return (typeof obj.id === 'string' && obj.id.length > 0)
            && typeof obj.name === 'string'
            && typeof obj.text === 'string'
            && (obj.alignment === 'left' || obj.alignment === 'right')
            && (obj.command === undefined || typeof obj.command === 'string')
            && (obj.tooltip === undefined || typeof obj.tooltip === 'string')
            && (obj.priority === undefined || typeof obj.priority === 'number')
            && (obj.accessibilityInformation === undefined || (0, accessibility_1.$3r)(obj.accessibilityInformation));
    }
    const statusBarItemSchema = {
        type: 'object',
        required: ['id', 'text', 'alignment', 'name'],
        properties: {
            id: {
                type: 'string',
                markdownDescription: (0, nls_1.localize)(0, null)
            },
            name: {
                type: 'string',
                description: (0, nls_1.localize)(1, null)
            },
            text: {
                type: 'string',
                description: (0, nls_1.localize)(2, null)
            },
            tooltip: {
                type: 'string',
                description: (0, nls_1.localize)(3, null)
            },
            command: {
                type: 'string',
                description: (0, nls_1.localize)(4, null)
            },
            alignment: {
                type: 'string',
                enum: ['left', 'right'],
                description: (0, nls_1.localize)(5, null)
            },
            priority: {
                type: 'number',
                description: (0, nls_1.localize)(6, null)
            },
            accessibilityInformation: {
                type: 'object',
                description: (0, nls_1.localize)(7, null),
                properties: {
                    role: {
                        type: 'string',
                        description: (0, nls_1.localize)(8, null)
                    },
                    label: {
                        type: 'string',
                        description: (0, nls_1.localize)(9, null)
                    }
                }
            }
        }
    };
    const statusBarItemsSchema = {
        description: (0, nls_1.localize)(10, null),
        oneOf: [
            statusBarItemSchema,
            {
                type: 'array',
                items: statusBarItemSchema
            }
        ]
    };
    const statusBarItemsExtensionPoint = extensionsRegistry_1.$2F.registerExtensionPoint({
        extensionPoint: 'statusBarItems',
        jsonSchema: statusBarItemsSchema,
    });
    let $ibb = class $ibb {
        constructor(statusBarItemsService) {
            const contributions = new lifecycle_1.$jc();
            statusBarItemsExtensionPoint.setHandler((extensions) => {
                contributions.clear();
                for (const entry of extensions) {
                    if (!(0, extensions_1.$PF)(entry.description, 'contribStatusBarItems')) {
                        entry.collector.error(`The ${statusBarItemsExtensionPoint.name} is proposed API`);
                        continue;
                    }
                    const { value, collector } = entry;
                    for (const candidate of iterator_1.Iterable.wrap(value)) {
                        if (!isUserFriendlyStatusItemEntry(candidate)) {
                            collector.error((0, nls_1.localize)(11, null));
                            continue;
                        }
                        const fullItemId = (0, extHostTypes_1.$AK)(entry.description.identifier, candidate.id);
                        const kind = statusBarItemsService.setOrUpdateEntry(fullItemId, fullItemId, extensions_3.$Vl.toKey(entry.description.identifier), candidate.name ?? entry.description.displayName ?? entry.description.name, candidate.text, candidate.tooltip, candidate.command ? { id: candidate.command, title: candidate.name } : undefined, undefined, undefined, candidate.alignment === 'left', candidate.priority, candidate.accessibilityInformation);
                        if (kind === 0 /* StatusBarUpdateKind.DidDefine */) {
                            contributions.add((0, lifecycle_1.$ic)(() => statusBarItemsService.unsetEntry(fullItemId)));
                        }
                    }
                }
            });
        }
    };
    exports.$ibb = $ibb;
    exports.$ibb = $ibb = __decorate([
        __param(0, exports.$hbb)
    ], $ibb);
});
//# sourceMappingURL=statusBarExtensionPoint.js.map