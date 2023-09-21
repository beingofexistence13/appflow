/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/nls!vs/workbench/contrib/customEditor/common/contributedCustomEditors", "vs/workbench/common/memento", "vs/workbench/contrib/customEditor/common/customEditor", "vs/workbench/contrib/customEditor/common/extensionPoint", "vs/workbench/services/editor/common/editorResolverService"], function (require, exports, event_1, lifecycle_1, nls, memento_1, customEditor_1, extensionPoint_1, editorResolverService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$NTb = void 0;
    class $NTb extends lifecycle_1.$kc {
        static { this.a = 'customEditors'; }
        static { this.b = 'editors'; }
        constructor(storageService) {
            super();
            this.c = new Map();
            this.g = this.B(new event_1.$fd());
            this.onChange = this.g.event;
            this.f = new memento_1.$YT($NTb.a, storageService);
            const mementoObject = this.f.getMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            for (const info of (mementoObject[$NTb.b] || [])) {
                this.j(new customEditor_1.$$eb(info));
            }
            extensionPoint_1.$MTb.setHandler(extensions => {
                this.h(extensions);
            });
        }
        h(extensions) {
            this.c.clear();
            for (const extension of extensions) {
                for (const webviewEditorContribution of extension.value) {
                    this.j(new customEditor_1.$$eb({
                        id: webviewEditorContribution.viewType,
                        displayName: webviewEditorContribution.displayName,
                        providerDisplayName: extension.description.isBuiltin ? nls.localize(0, null) : extension.description.displayName || extension.description.identifier.value,
                        selector: webviewEditorContribution.selector || [],
                        priority: getPriorityFromContribution(webviewEditorContribution, extension.description),
                    }));
                }
            }
            const mementoObject = this.f.getMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            mementoObject[$NTb.b] = Array.from(this.c.values());
            this.f.saveMemento();
            this.g.fire();
        }
        [Symbol.iterator]() {
            return this.c.values();
        }
        get(viewType) {
            return this.c.get(viewType);
        }
        getContributedEditors(resource) {
            return Array.from(this.c.values())
                .filter(customEditor => customEditor.matches(resource));
        }
        j(info) {
            if (this.c.has(info.id)) {
                console.error(`Custom editor with id '${info.id}' already registered`);
                return;
            }
            this.c.set(info.id, info);
        }
    }
    exports.$NTb = $NTb;
    function getPriorityFromContribution(contribution, extension) {
        switch (contribution.priority) {
            case editorResolverService_1.RegisteredEditorPriority.default:
            case editorResolverService_1.RegisteredEditorPriority.option:
                return contribution.priority;
            case editorResolverService_1.RegisteredEditorPriority.builtin:
                // Builtin is only valid for builtin extensions
                return extension.isBuiltin ? editorResolverService_1.RegisteredEditorPriority.builtin : editorResolverService_1.RegisteredEditorPriority.default;
            default:
                return editorResolverService_1.RegisteredEditorPriority.default;
        }
    }
});
//# sourceMappingURL=contributedCustomEditors.js.map