/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/nls", "vs/workbench/common/memento", "vs/workbench/contrib/customEditor/common/customEditor", "vs/workbench/contrib/customEditor/common/extensionPoint", "vs/workbench/services/editor/common/editorResolverService"], function (require, exports, event_1, lifecycle_1, nls, memento_1, customEditor_1, extensionPoint_1, editorResolverService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ContributedCustomEditors = void 0;
    class ContributedCustomEditors extends lifecycle_1.Disposable {
        static { this.CUSTOM_EDITORS_STORAGE_ID = 'customEditors'; }
        static { this.CUSTOM_EDITORS_ENTRY_ID = 'editors'; }
        constructor(storageService) {
            super();
            this._editors = new Map();
            this._onChange = this._register(new event_1.Emitter());
            this.onChange = this._onChange.event;
            this._memento = new memento_1.Memento(ContributedCustomEditors.CUSTOM_EDITORS_STORAGE_ID, storageService);
            const mementoObject = this._memento.getMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            for (const info of (mementoObject[ContributedCustomEditors.CUSTOM_EDITORS_ENTRY_ID] || [])) {
                this.add(new customEditor_1.CustomEditorInfo(info));
            }
            extensionPoint_1.customEditorsExtensionPoint.setHandler(extensions => {
                this.update(extensions);
            });
        }
        update(extensions) {
            this._editors.clear();
            for (const extension of extensions) {
                for (const webviewEditorContribution of extension.value) {
                    this.add(new customEditor_1.CustomEditorInfo({
                        id: webviewEditorContribution.viewType,
                        displayName: webviewEditorContribution.displayName,
                        providerDisplayName: extension.description.isBuiltin ? nls.localize('builtinProviderDisplayName', "Built-in") : extension.description.displayName || extension.description.identifier.value,
                        selector: webviewEditorContribution.selector || [],
                        priority: getPriorityFromContribution(webviewEditorContribution, extension.description),
                    }));
                }
            }
            const mementoObject = this._memento.getMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            mementoObject[ContributedCustomEditors.CUSTOM_EDITORS_ENTRY_ID] = Array.from(this._editors.values());
            this._memento.saveMemento();
            this._onChange.fire();
        }
        [Symbol.iterator]() {
            return this._editors.values();
        }
        get(viewType) {
            return this._editors.get(viewType);
        }
        getContributedEditors(resource) {
            return Array.from(this._editors.values())
                .filter(customEditor => customEditor.matches(resource));
        }
        add(info) {
            if (this._editors.has(info.id)) {
                console.error(`Custom editor with id '${info.id}' already registered`);
                return;
            }
            this._editors.set(info.id, info);
        }
    }
    exports.ContributedCustomEditors = ContributedCustomEditors;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJpYnV0ZWRDdXN0b21FZGl0b3JzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY3VzdG9tRWRpdG9yL2NvbW1vbi9jb250cmlidXRlZEN1c3RvbUVkaXRvcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBY2hHLE1BQWEsd0JBQXlCLFNBQVEsc0JBQVU7aUJBRS9CLDhCQUF5QixHQUFHLGVBQWUsQUFBbEIsQ0FBbUI7aUJBQzVDLDRCQUF1QixHQUFHLFNBQVMsQUFBWixDQUFhO1FBSzVELFlBQVksY0FBK0I7WUFDMUMsS0FBSyxFQUFFLENBQUM7WUFKUSxhQUFRLEdBQUcsSUFBSSxHQUFHLEVBQTRCLENBQUM7WUFrQi9DLGNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFRLENBQUMsQ0FBQztZQUNqRCxhQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUM7WUFiL0MsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLGlCQUFPLENBQUMsd0JBQXdCLENBQUMseUJBQXlCLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFFaEcsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLDZEQUE2QyxDQUFDO1lBQzVGLEtBQUssTUFBTSxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsd0JBQXdCLENBQUMsdUJBQXVCLENBQUMsSUFBSSxFQUFFLENBQTZCLEVBQUU7Z0JBQ3ZILElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSwrQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2FBQ3JDO1lBRUQsNENBQTJCLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxFQUFFO2dCQUNuRCxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3pCLENBQUMsQ0FBQyxDQUFD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