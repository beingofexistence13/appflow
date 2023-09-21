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
define(["require", "exports", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/functional", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation", "vs/platform/quickinput/common/quickAccess", "vs/platform/quickinput/common/quickInput", "vs/platform/registry/common/platform"], function (require, exports, async_1, cancellation_1, functional_1, lifecycle_1, instantiation_1, quickAccess_1, quickInput_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$HAb = void 0;
    let $HAb = class $HAb extends lifecycle_1.$kc {
        constructor(g, h) {
            super();
            this.g = g;
            this.h = h;
            this.a = platform_1.$8m.as(quickAccess_1.$8p.Quickaccess);
            this.b = new Map();
            this.c = new Map();
            this.f = undefined;
        }
        pick(value = '', options) {
            return this.j(value, true, options);
        }
        show(value = '', options) {
            this.j(value, false, options);
        }
        j(value, pick, options) {
            // Find provider for the value to show
            const [provider, descriptor] = this.r(value);
            // Return early if quick access is already showing on that same prefix
            const visibleQuickAccess = this.f;
            const visibleDescriptor = visibleQuickAccess?.descriptor;
            if (visibleQuickAccess && descriptor && visibleDescriptor === descriptor) {
                // Apply value only if it is more specific than the prefix
                // from the provider and we are not instructed to preserve
                if (value !== descriptor.prefix && !options?.preserveValue) {
                    visibleQuickAccess.picker.value = value;
                }
                // Always adjust selection
                this.m(visibleQuickAccess.picker, descriptor, options);
                return;
            }
            // Rewrite the filter value based on certain rules unless disabled
            if (descriptor && !options?.preserveValue) {
                let newValue = undefined;
                // If we have a visible provider with a value, take it's filter value but
                // rewrite to new provider prefix in case they differ
                if (visibleQuickAccess && visibleDescriptor && visibleDescriptor !== descriptor) {
                    const newValueCandidateWithoutPrefix = visibleQuickAccess.value.substr(visibleDescriptor.prefix.length);
                    if (newValueCandidateWithoutPrefix) {
                        newValue = `${descriptor.prefix}${newValueCandidateWithoutPrefix}`;
                    }
                }
                // Otherwise, take a default value as instructed
                if (!newValue) {
                    const defaultFilterValue = provider?.defaultFilterValue;
                    if (defaultFilterValue === quickAccess_1.DefaultQuickAccessFilterValue.LAST) {
                        newValue = this.c.get(descriptor);
                    }
                    else if (typeof defaultFilterValue === 'string') {
                        newValue = `${descriptor.prefix}${defaultFilterValue}`;
                    }
                }
                if (typeof newValue === 'string') {
                    value = newValue;
                }
            }
            // Create a picker for the provider to use with the initial value
            // and adjust the filtering to exclude the prefix from filtering
            const disposables = new lifecycle_1.$jc();
            const picker = disposables.add(this.g.createQuickPick());
            picker.value = value;
            this.m(picker, descriptor, options);
            picker.placeholder = descriptor?.placeholder;
            picker.quickNavigate = options?.quickNavigateConfiguration;
            picker.hideInput = !!picker.quickNavigate && !visibleQuickAccess; // only hide input if there was no picker opened already
            if (typeof options?.itemActivation === 'number' || options?.quickNavigateConfiguration) {
                picker.itemActivation = options?.itemActivation ?? quickInput_1.ItemActivation.SECOND /* quick nav is always second */;
            }
            picker.contextKey = descriptor?.contextKey;
            picker.filterValue = (value) => value.substring(descriptor ? descriptor.prefix.length : 0);
            // Pick mode: setup a promise that can be resolved
            // with the selected items and prevent execution
            let pickPromise = undefined;
            if (pick) {
                pickPromise = new async_1.$2g();
                disposables.add((0, functional_1.$bb)(picker.onWillAccept)(e => {
                    e.veto();
                    picker.hide();
                }));
            }
            // Register listeners
            disposables.add(this.n(picker, provider, descriptor, value, options?.providerOptions));
            // Ask provider to fill the picker as needed if we have one
            // and pass over a cancellation token that will indicate when
            // the picker is hiding without a pick being made.
            const cts = disposables.add(new cancellation_1.$pd());
            if (provider) {
                disposables.add(provider.provide(picker, cts.token, options?.providerOptions));
            }
            // Finally, trigger disposal and cancellation when the picker
            // hides depending on items selected or not.
            (0, functional_1.$bb)(picker.onDidHide)(() => {
                if (picker.selectedItems.length === 0) {
                    cts.cancel();
                }
                // Start to dispose once picker hides
                disposables.dispose();
                // Resolve pick promise with selected items
                pickPromise?.complete(picker.selectedItems.slice(0));
            });
            // Finally, show the picker. This is important because a provider
            // may not call this and then our disposables would leak that rely
            // on the onDidHide event.
            picker.show();
            // Pick mode: return with promise
            if (pick) {
                return pickPromise?.p;
            }
        }
        m(picker, descriptor, options) {
            let valueSelection;
            // Preserve: just always put the cursor at the end
            if (options?.preserveValue) {
                valueSelection = [picker.value.length, picker.value.length];
            }
            // Otherwise: select the value up until the prefix
            else {
                valueSelection = [descriptor?.prefix.length ?? 0, picker.value.length];
            }
            picker.valueSelection = valueSelection;
        }
        n(picker, provider, descriptor, value, providerOptions) {
            const disposables = new lifecycle_1.$jc();
            // Remember as last visible picker and clean up once picker get's disposed
            const visibleQuickAccess = this.f = { picker, descriptor, value };
            disposables.add((0, lifecycle_1.$ic)(() => {
                if (visibleQuickAccess === this.f) {
                    this.f = undefined;
                }
            }));
            // Whenever the value changes, check if the provider has
            // changed and if so - re-create the picker from the beginning
            disposables.add(picker.onDidChangeValue(value => {
                const [providerForValue] = this.r(value);
                if (providerForValue !== provider) {
                    this.show(value, {
                        // do not rewrite value from user typing!
                        preserveValue: true,
                        // persist the value of the providerOptions from the original showing
                        providerOptions
                    });
                }
                else {
                    visibleQuickAccess.value = value; // remember the value in our visible one
                }
            }));
            // Remember picker input for future use when accepting
            if (descriptor) {
                disposables.add(picker.onDidAccept(() => {
                    this.c.set(descriptor, picker.value);
                }));
            }
            return disposables;
        }
        r(value) {
            const providerDescriptor = this.a.getQuickAccessProvider(value);
            if (!providerDescriptor) {
                return [undefined, undefined];
            }
            let provider = this.b.get(providerDescriptor);
            if (!provider) {
                provider = this.h.createInstance(providerDescriptor.ctor);
                this.b.set(providerDescriptor, provider);
            }
            return [provider, providerDescriptor];
        }
    };
    exports.$HAb = $HAb;
    exports.$HAb = $HAb = __decorate([
        __param(0, quickInput_1.$Gq),
        __param(1, instantiation_1.$Ah)
    ], $HAb);
});
//# sourceMappingURL=quickAccess.js.map