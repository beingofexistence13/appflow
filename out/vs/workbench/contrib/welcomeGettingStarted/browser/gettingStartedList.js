/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/browser/dom", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/common/event", "vs/base/common/arrays"], function (require, exports, lifecycle_1, dom_1, scrollableElement_1, event_1, arrays_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GettingStartedIndexList = void 0;
    class GettingStartedIndexList extends lifecycle_1.Disposable {
        constructor(options) {
            super();
            this.options = options;
            this._onDidChangeEntries = new event_1.Emitter();
            this.onDidChangeEntries = this._onDidChangeEntries.event;
            this.isDisposed = false;
            this.contextKeysToWatch = new Set();
            this.contextService = options.contextService;
            this.entries = undefined;
            this.itemCount = 0;
            this.list = (0, dom_1.$)('ul');
            this.scrollbar = this._register(new scrollableElement_1.DomScrollableElement(this.list, {}));
            this._register(this.onDidChangeEntries(() => this.scrollbar.scanDomNode()));
            this.domElement = (0, dom_1.$)('.index-list.' + options.klass, {}, (0, dom_1.$)('h2', {}, options.title), this.scrollbar.getDomNode());
            this._register(this.contextService.onDidChangeContext(e => {
                if (e.affectsSome(this.contextKeysToWatch)) {
                    this.rerender();
                }
            }));
        }
        getDomElement() {
            return this.domElement;
        }
        layout(size) {
            this.scrollbar.scanDomNode();
        }
        onDidChange(listener) {
            this._register(this.onDidChangeEntries(listener));
        }
        register(d) { if (this.isDisposed) {
            d.dispose();
        }
        else {
            this._register(d);
        } }
        dispose() {
            this.isDisposed = true;
            super.dispose();
        }
        setLimit(limit) {
            this.options.limit = limit;
            this.setEntries(this.entries);
        }
        rerender() {
            this.setEntries(this.entries);
        }
        setEntries(entries) {
            let entryList = entries ?? [];
            this.itemCount = 0;
            const ranker = this.options.rankElement;
            if (ranker) {
                entryList = entryList.filter(e => ranker(e) !== null);
                entryList.sort((a, b) => ranker(b) - ranker(a));
            }
            const activeEntries = entryList.filter(e => !e.when || this.contextService.contextMatchesRules(e.when));
            const limitedEntries = activeEntries.slice(0, this.options.limit);
            const toRender = limitedEntries.map(e => e.id);
            if (this.entries === entries && (0, arrays_1.equals)(toRender, this.lastRendered)) {
                return;
            }
            this.entries = entries;
            this.contextKeysToWatch.clear();
            entryList.forEach(e => {
                const keys = e.when?.keys();
                keys?.forEach(key => this.contextKeysToWatch.add(key));
            });
            this.lastRendered = toRender;
            this.itemCount = limitedEntries.length;
            while (this.list.firstChild) {
                this.list.removeChild(this.list.firstChild);
            }
            this.itemCount = limitedEntries.length;
            for (const entry of limitedEntries) {
                const rendered = this.options.renderElement(entry);
                this.list.appendChild(rendered);
            }
            if (activeEntries.length > limitedEntries.length && this.options.more) {
                this.list.appendChild(this.options.more);
            }
            else if (entries !== undefined && this.itemCount === 0 && this.options.empty) {
                this.list.appendChild(this.options.empty);
            }
            else if (this.options.footer) {
                this.list.appendChild(this.options.footer);
            }
            this._onDidChangeEntries.fire();
        }
    }
    exports.GettingStartedIndexList = GettingStartedIndexList;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0dGluZ1N0YXJ0ZWRMaXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvd2VsY29tZUdldHRpbmdTdGFydGVkL2Jyb3dzZXIvZ2V0dGluZ1N0YXJ0ZWRMaXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQXFCaEcsTUFBYSx1QkFBK0UsU0FBUSxzQkFBVTtRQW1CN0csWUFDUyxPQUEwQztZQUVsRCxLQUFLLEVBQUUsQ0FBQztZQUZBLFlBQU8sR0FBUCxPQUFPLENBQW1DO1lBbkJsQyx3QkFBbUIsR0FBRyxJQUFJLGVBQU8sRUFBUSxDQUFDO1lBQzFDLHVCQUFrQixHQUFnQixJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDO1lBWTFFLGVBQVUsR0FBRyxLQUFLLENBQUM7WUFHbkIsdUJBQWtCLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztZQU85QyxJQUFJLENBQUMsY0FBYyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUM7WUFFN0MsSUFBSSxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUM7WUFFekIsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7WUFDbkIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFBLE9BQUMsRUFBQyxJQUFJLENBQUMsQ0FBQztZQUNwQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSx3Q0FBb0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDekUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDNUUsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFBLE9BQUMsRUFBQyxjQUFjLEdB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