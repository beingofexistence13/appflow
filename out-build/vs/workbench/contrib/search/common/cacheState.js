/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/idGenerator", "vs/base/common/objects"], function (require, exports, idGenerator_1, objects_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$CMb = void 0;
    var LoadingPhase;
    (function (LoadingPhase) {
        LoadingPhase[LoadingPhase["Created"] = 1] = "Created";
        LoadingPhase[LoadingPhase["Loading"] = 2] = "Loading";
        LoadingPhase[LoadingPhase["Loaded"] = 3] = "Loaded";
        LoadingPhase[LoadingPhase["Errored"] = 4] = "Errored";
        LoadingPhase[LoadingPhase["Disposed"] = 5] = "Disposed";
    })(LoadingPhase || (LoadingPhase = {}));
    class $CMb {
        get cacheKey() {
            if (this.c === LoadingPhase.Loaded || !this.h) {
                return this.a;
            }
            return this.h.cacheKey;
        }
        get isLoaded() {
            const isLoaded = this.c === LoadingPhase.Loaded;
            return isLoaded || !this.h ? isLoaded : this.h.isLoaded;
        }
        get isUpdating() {
            const isUpdating = this.c === LoadingPhase.Loading;
            return isUpdating || !this.h ? isUpdating : this.h.isUpdating;
        }
        constructor(e, f, g, h) {
            this.e = e;
            this.f = f;
            this.g = g;
            this.h = h;
            this.a = idGenerator_1.$8L.nextId();
            this.b = this.e(this.a);
            this.c = LoadingPhase.Created;
            if (this.h) {
                const current = Object.assign({}, this.b, { cacheKey: null });
                const previous = Object.assign({}, this.h.b, { cacheKey: null });
                if (!(0, objects_1.$Zm)(current, previous)) {
                    this.h.dispose();
                    this.h = undefined;
                }
            }
        }
        load() {
            if (this.isUpdating) {
                return this;
            }
            this.c = LoadingPhase.Loading;
            this.d = (async () => {
                try {
                    await this.f(this.b);
                    this.c = LoadingPhase.Loaded;
                    if (this.h) {
                        this.h.dispose();
                        this.h = undefined;
                    }
                }
                catch (error) {
                    this.c = LoadingPhase.Errored;
                    throw error;
                }
            })();
            return this;
        }
        dispose() {
            if (this.d) {
                (async () => {
                    try {
                        await this.d;
                    }
                    catch (error) {
                        // ignore
                    }
                    this.c = LoadingPhase.Disposed;
                    this.g(this.a);
                })();
            }
            else {
                this.c = LoadingPhase.Disposed;
            }
            if (this.h) {
                this.h.dispose();
                this.h = undefined;
            }
        }
    }
    exports.$CMb = $CMb;
});
//# sourceMappingURL=cacheState.js.map