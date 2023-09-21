/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event"], function (require, exports, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$EZb = void 0;
    class $EZb {
        constructor() {
            this.a = false;
            this.b = true;
            this.c = 0 /* OutlineSortOrder.ByPosition */;
            this.d = new event_1.$fd();
            this.onDidChange = this.d.event;
        }
        dispose() {
            this.d.dispose();
        }
        set followCursor(value) {
            if (value !== this.a) {
                this.a = value;
                this.d.fire({ followCursor: true });
            }
        }
        get followCursor() {
            return this.a;
        }
        get filterOnType() {
            return this.b;
        }
        set filterOnType(value) {
            if (value !== this.b) {
                this.b = value;
                this.d.fire({ filterOnType: true });
            }
        }
        set sortBy(value) {
            if (value !== this.c) {
                this.c = value;
                this.d.fire({ sortBy: true });
            }
        }
        get sortBy() {
            return this.c;
        }
        persist(storageService) {
            storageService.store('outline/state', JSON.stringify({
                followCursor: this.followCursor,
                sortBy: this.sortBy,
                filterOnType: this.filterOnType,
            }), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }
        restore(storageService) {
            const raw = storageService.get('outline/state', 1 /* StorageScope.WORKSPACE */);
            if (!raw) {
                return;
            }
            let data;
            try {
                data = JSON.parse(raw);
            }
            catch (e) {
                return;
            }
            this.followCursor = data.followCursor;
            this.sortBy = data.sortBy ?? 0 /* OutlineSortOrder.ByPosition */;
            if (typeof data.filterOnType === 'boolean') {
                this.filterOnType = data.filterOnType;
            }
        }
    }
    exports.$EZb = $EZb;
});
//# sourceMappingURL=outlineViewState.js.map