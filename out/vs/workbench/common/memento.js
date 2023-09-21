/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/types", "vs/base/common/errors"], function (require, exports, types_1, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Memento = void 0;
    class Memento {
        static { this.applicationMementos = new Map(); }
        static { this.profileMementos = new Map(); }
        static { this.workspaceMementos = new Map(); }
        static { this.COMMON_PREFIX = 'memento/'; }
        constructor(id, storageService) {
            this.storageService = storageService;
            this.id = Memento.COMMON_PREFIX + id;
        }
        getMemento(scope, target) {
            switch (scope) {
                // Scope by Workspace
                case 1 /* StorageScope.WORKSPACE */: {
                    let workspaceMemento = Memento.workspaceMementos.get(this.id);
                    if (!workspaceMemento) {
                        workspaceMemento = new ScopedMemento(this.id, scope, target, this.storageService);
                        Memento.workspaceMementos.set(this.id, workspaceMemento);
                    }
                    return workspaceMemento.getMemento();
                }
                // Scope Profile
                case 0 /* StorageScope.PROFILE */: {
                    let profileMemento = Memento.profileMementos.get(this.id);
                    if (!profileMemento) {
                        profileMemento = new ScopedMemento(this.id, scope, target, this.storageService);
                        Memento.profileMementos.set(this.id, profileMemento);
                    }
                    return profileMemento.getMemento();
                }
                // Scope Application
                case -1 /* StorageScope.APPLICATION */: {
                    let applicationMemento = Memento.applicationMementos.get(this.id);
                    if (!applicationMemento) {
                        applicationMemento = new ScopedMemento(this.id, scope, target, this.storageService);
                        Memento.applicationMementos.set(this.id, applicationMemento);
                    }
                    return applicationMemento.getMemento();
                }
            }
        }
        saveMemento() {
            Memento.workspaceMementos.get(this.id)?.save();
            Memento.profileMementos.get(this.id)?.save();
            Memento.applicationMementos.get(this.id)?.save();
        }
        static clear(scope) {
            switch (scope) {
                case 1 /* StorageScope.WORKSPACE */:
                    Memento.workspaceMementos.clear();
                    break;
                case 0 /* StorageScope.PROFILE */:
                    Memento.profileMementos.clear();
                    break;
                case -1 /* StorageScope.APPLICATION */:
                    Memento.applicationMementos.clear();
                    break;
            }
        }
    }
    exports.Memento = Memento;
    class ScopedMemento {
        constructor(id, scope, target, storageService) {
            this.id = id;
            this.scope = scope;
            this.target = target;
            this.storageService = storageService;
            this.mementoObj = this.load();
        }
        getMemento() {
            return this.mementoObj;
        }
        load() {
            const memento = this.storageService.get(this.id, this.scope);
            if (memento) {
                try {
                    return JSON.parse(memento);
                }
                catch (error) {
                    // Seeing reports from users unable to open editors
                    // from memento parsing exceptions. Log the contents
                    // to diagnose further
                    // https://github.com/microsoft/vscode/issues/102251
                    (0, errors_1.onUnexpectedError)(`[memento]: failed to parse contents: ${error} (id: ${this.id}, scope: ${this.scope}, contents: ${memento})`);
                }
            }
            return {};
        }
        save() {
            if (!(0, types_1.isEmptyObject)(this.mementoObj)) {
                this.storageService.store(this.id, JSON.stringify(this.mementoObj), this.scope, this.target);
            }
            else {
                this.storageService.remove(this.id, this.scope);
            }
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVtZW50by5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb21tb24vbWVtZW50by50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFRaEcsTUFBYSxPQUFPO2lCQUVLLHdCQUFtQixHQUFHLElBQUksR0FBRyxFQUF5QixDQUFDO2lCQUN2RCxvQkFBZSxHQUFHLElBQUksR0FBRyxFQUF5QixDQUFDO2lCQUNuRCxzQkFBaUIsR0FBRyxJQUFJLEdBQUcsRUFBeUIsQ0FBQztpQkFFckQsa0JBQWEsR0FBRyxVQUFVLENBQUM7UUFJbkQsWUFBWSxFQUFVLEVBQVUsY0FBK0I7WUFBL0IsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBQzlELElBQUksQ0FBQyxFQUFFLEdBQUcsT0FBTyxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUM7UUFDdEMsQ0FBQztRQUVELFVBQVUsQ0FBQyxLQUFtQixFQUFFLE1BQXFCO1lBQ3BELFFBQVEsS0FBSyxFQUFFO2dCQUVkLHFCQUFxQjtnQkFDckIsbUNBQTJCLENBQUMsQ0FBQztvQkFDNUIsSUFBSSxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDOUQsSUFBSSxDQUFDLGdCQUFnQixFQUFFO3dCQUN0QixnQkFBZ0IsR0FBRyxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO3dCQUNsRixPQUFPLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztxQkFDekQ7b0JBRUQsT0FBTyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsQ0FBQztpQkFDckM7Z0JBRUQsZ0JBQWdCO2dCQUNoQixpQ0FB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