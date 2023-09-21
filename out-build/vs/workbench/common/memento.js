/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/types", "vs/base/common/errors"], function (require, exports, types_1, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$YT = void 0;
    class $YT {
        static { this.a = new Map(); }
        static { this.b = new Map(); }
        static { this.c = new Map(); }
        static { this.d = 'memento/'; }
        constructor(id, f) {
            this.f = f;
            this.e = $YT.d + id;
        }
        getMemento(scope, target) {
            switch (scope) {
                // Scope by Workspace
                case 1 /* StorageScope.WORKSPACE */: {
                    let workspaceMemento = $YT.c.get(this.e);
                    if (!workspaceMemento) {
                        workspaceMemento = new ScopedMemento(this.e, scope, target, this.f);
                        $YT.c.set(this.e, workspaceMemento);
                    }
                    return workspaceMemento.getMemento();
                }
                // Scope Profile
                case 0 /* StorageScope.PROFILE */: {
                    let profileMemento = $YT.b.get(this.e);
                    if (!profileMemento) {
                        profileMemento = new ScopedMemento(this.e, scope, target, this.f);
                        $YT.b.set(this.e, profileMemento);
                    }
                    return profileMemento.getMemento();
                }
                // Scope Application
                case -1 /* StorageScope.APPLICATION */: {
                    let applicationMemento = $YT.a.get(this.e);
                    if (!applicationMemento) {
                        applicationMemento = new ScopedMemento(this.e, scope, target, this.f);
                        $YT.a.set(this.e, applicationMemento);
                    }
                    return applicationMemento.getMemento();
                }
            }
        }
        saveMemento() {
            $YT.c.get(this.e)?.save();
            $YT.b.get(this.e)?.save();
            $YT.a.get(this.e)?.save();
        }
        static clear(scope) {
            switch (scope) {
                case 1 /* StorageScope.WORKSPACE */:
                    $YT.c.clear();
                    break;
                case 0 /* StorageScope.PROFILE */:
                    $YT.b.clear();
                    break;
                case -1 /* StorageScope.APPLICATION */:
                    $YT.a.clear();
                    break;
            }
        }
    }
    exports.$YT = $YT;
    class ScopedMemento {
        constructor(b, c, d, e) {
            this.b = b;
            this.c = c;
            this.d = d;
            this.e = e;
            this.a = this.f();
        }
        getMemento() {
            return this.a;
        }
        f() {
            const memento = this.e.get(this.b, this.c);
            if (memento) {
                try {
                    return JSON.parse(memento);
                }
                catch (error) {
                    // Seeing reports from users unable to open editors
                    // from memento parsing exceptions. Log the contents
                    // to diagnose further
                    // https://github.com/microsoft/vscode/issues/102251
                    (0, errors_1.$Y)(`[memento]: failed to parse contents: ${error} (id: ${this.b}, scope: ${this.c}, contents: ${memento})`);
                }
            }
            return {};
        }
        save() {
            if (!(0, types_1.$wf)(this.a)) {
                this.e.store(this.b, JSON.stringify(this.a), this.c, this.d);
            }
            else {
                this.e.remove(this.b, this.c);
            }
        }
    }
});
//# sourceMappingURL=memento.js.map