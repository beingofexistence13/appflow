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
    exports.QuickAccessController = void 0;
    let QuickAccessController = class QuickAccessController extends lifecycle_1.Disposable {
        constructor(quickInputService, instantiationService) {
            super();
            this.quickInputService = quickInputService;
            this.instantiationService = instantiationService;
            this.registry = platform_1.Registry.as(quickAccess_1.Extensions.Quickaccess);
            this.mapProviderToDescriptor = new Map();
            this.lastAcceptedPickerValues = new Map();
            this.visibleQuickAccess = undefined;
        }
        pick(value = '', options) {
            return this.doShowOrPick(value, true, options);
        }
        show(value = '', options) {
            this.doShowOrPick(value, false, options);
        }
        doShowOrPick(value, pick, options) {
            // Find provider for the value to show
            const [provider, descriptor] = this.getOrInstantiateProvider(value);
            // Return early if quick access is already showing on that same prefix
            const visibleQuickAccess = this.visibleQuickAccess;
            const visibleDescriptor = visibleQuickAccess?.descriptor;
            if (visibleQuickAccess && descriptor && visibleDescriptor === descriptor) {
                // Apply value only if it is more specific than the prefix
                // from the provider and we are not instructed to preserve
                if (value !== descriptor.prefix && !options?.preserveValue) {
                    visibleQuickAccess.picker.value = value;
                }
                // Always adjust selection
                this.adjustValueSelection(visibleQuickAccess.picker, descriptor, options);
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
                        newValue = this.lastAcceptedPickerValues.get(descriptor);
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
            const disposables = new lifecycle_1.DisposableStore();
            const picker = disposables.add(this.quickInputService.createQuickPick());
            picker.value = value;
            this.adjustValueSelection(picker, descriptor, options);
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
                pickPromise = new async_1.DeferredPromise();
                disposables.add((0, functional_1.once)(picker.onWillAccept)(e => {
                    e.veto();
                    picker.hide();
                }));
            }
            // Register listeners
            disposables.add(this.registerPickerListeners(picker, provider, descriptor, value, options?.providerOptions));
            // Ask provider to fill the picker as needed if we have one
            // and pass over a cancellation token that will indicate when
            // the picker is hiding without a pick being made.
            const cts = disposables.add(new cancellation_1.CancellationTokenSource());
            if (provider) {
                disposables.add(provider.provide(picker, cts.token, options?.providerOptions));
            }
            // Finally, trigger disposal and cancellation when the picker
            // hides depending on items selected or not.
            (0, functional_1.once)(picker.onDidHide)(() => {
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
        adjustValueSelection(picker, descriptor, options) {
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
        registerPickerListeners(picker, provider, descriptor, value, providerOptions) {
            const disposables = new lifecycle_1.DisposableStore();
            // Remember as last visible picker and clean up once picker get's disposed
            const visibleQuickAccess = this.visibleQuickAccess = { picker, descriptor, value };
            disposables.add((0, lifecycle_1.toDisposable)(() => {
                if (visibleQuickAccess === this.visibleQuickAccess) {
                    this.visibleQuickAccess = undefined;
                }
            }));
            // Whenever the value changes, check if the provider has
            // changed and if so - re-create the picker from the beginning
            disposables.add(picker.onDidChangeValue(value => {
                const [providerForValue] = this.getOrInstantiateProvider(value);
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
                    this.lastAcceptedPickerValues.set(descriptor, picker.value);
                }));
            }
            return disposables;
        }
        getOrInstantiateProvider(value) {
            const providerDescriptor = this.registry.getQuickAccessProvider(value);
            if (!providerDescriptor) {
                return [undefined, undefined];
            }
            let provider = this.mapProviderToDescriptor.get(providerDescriptor);
            if (!provider) {
                provider = this.instantiationService.createInstance(providerDescriptor.ctor);
                this.mapProviderToDescriptor.set(providerDescriptor, provider);
            }
            return [provider, providerDescriptor];
        }
    };
    exports.QuickAccessController = QuickAccessController;
    exports.QuickAccessController = QuickAccessController = __decorate([
        __param(0, quickInput_1.IQuickInputService),
        __param(1, instantiation_1.IInstantiationService)
    ], QuickAccessController);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVpY2tBY2Nlc3MuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9xdWlja2lucHV0L2Jyb3dzZXIvcXVpY2tBY2Nlc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBV3pGLElBQU0scUJBQXFCLEdBQTNCLE1BQU0scUJBQXNCLFNBQVEsc0JBQVU7UUFhcEQsWUFDcUIsaUJBQXNELEVBQ25ELG9CQUE0RDtZQUVuRixLQUFLLEVBQUUsQ0FBQztZQUg2QixzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9CO1lBQ2xDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFibkUsYUFBUSxHQUFHLG1CQUFRLENBQUMsRUFBRSxDQUF1Qix3QkFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3JFLDRCQUF1QixHQUFHLElBQUksR0FBRyxFQUF3RCxDQUFDO1lBRTFGLDZCQUF3QixHQUFHLElBQUksR0FBRyxFQUEwQyxDQUFDO1lBRXRGLHVCQUFrQixHQUlWLFNBQVMsQ0FBQztRQU8xQixDQUFDO1FBRUQsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLEVBQUUsT0FBNkI7WUFDN0MsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDaEQsQ0FBQztRQUVELElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxFQUFFLE9BQTZCO1lBQzdDLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztRQUMxQyxDQUFDO1FBSU8sWUFBWSxDQUFDLEtBQWEsRUFBRSxJQUFhLEVBQUUsT0FBNkI7WUFFL0Usc0NBQXNDO1lBQ3RDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLEtBQUssQ0FBQyxDQUFD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