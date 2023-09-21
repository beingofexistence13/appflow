/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Vs = void 0;
    class $Vs {
        constructor() {
            this.a = new Map();
            this.b = new Map();
            this.c = new event_1.$fd();
            this.onDidChange = this.c.event;
            this.d = null;
        }
        handleChange(languageIds) {
            this.c.fire({
                changedLanguages: languageIds,
                changedColorMap: false
            });
        }
        register(languageId, support) {
            this.a.set(languageId, support);
            this.handleChange([languageId]);
            return (0, lifecycle_1.$ic)(() => {
                if (this.a.get(languageId) !== support) {
                    return;
                }
                this.a.delete(languageId);
                this.handleChange([languageId]);
            });
        }
        get(languageId) {
            return this.a.get(languageId) || null;
        }
        registerFactory(languageId, factory) {
            this.b.get(languageId)?.dispose();
            const myData = new TokenizationSupportFactoryData(this, languageId, factory);
            this.b.set(languageId, myData);
            return (0, lifecycle_1.$ic)(() => {
                const v = this.b.get(languageId);
                if (!v || v !== myData) {
                    return;
                }
                this.b.delete(languageId);
                v.dispose();
            });
        }
        async getOrCreate(languageId) {
            // check first if the support is already set
            const tokenizationSupport = this.get(languageId);
            if (tokenizationSupport) {
                return tokenizationSupport;
            }
            const factory = this.b.get(languageId);
            if (!factory || factory.isResolved) {
                // no factory or factory.resolve already finished
                return null;
            }
            await factory.resolve();
            return this.get(languageId);
        }
        isResolved(languageId) {
            const tokenizationSupport = this.get(languageId);
            if (tokenizationSupport) {
                return true;
            }
            const factory = this.b.get(languageId);
            if (!factory || factory.isResolved) {
                return true;
            }
            return false;
        }
        setColorMap(colorMap) {
            this.d = colorMap;
            this.c.fire({
                changedLanguages: Array.from(this.a.keys()),
                changedColorMap: true
            });
        }
        getColorMap() {
            return this.d;
        }
        getDefaultBackground() {
            if (this.d && this.d.length > 2 /* ColorId.DefaultBackground */) {
                return this.d[2 /* ColorId.DefaultBackground */];
            }
            return null;
        }
    }
    exports.$Vs = $Vs;
    class TokenizationSupportFactoryData extends lifecycle_1.$kc {
        get isResolved() {
            return this.c;
        }
        constructor(f, g, h) {
            super();
            this.f = f;
            this.g = g;
            this.h = h;
            this.a = false;
            this.b = null;
            this.c = false;
        }
        dispose() {
            this.a = true;
            super.dispose();
        }
        async resolve() {
            if (!this.b) {
                this.b = this.j();
            }
            return this.b;
        }
        async j() {
            const value = await this.h.tokenizationSupport;
            this.c = true;
            if (value && !this.a) {
                this.B(this.f.register(this.g, value));
            }
        }
    }
});
//# sourceMappingURL=tokenizationRegistry.js.map