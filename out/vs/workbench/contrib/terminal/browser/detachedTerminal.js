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
define(["require", "exports", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/symbols", "vs/platform/instantiation/common/instantiation", "vs/platform/terminal/common/capabilities/terminalCapabilityStore", "vs/workbench/contrib/terminal/browser/terminalExtensions", "vs/workbench/contrib/terminal/browser/widgets/widgetManager"], function (require, exports, async_1, errors_1, lifecycle_1, symbols_1, instantiation_1, terminalCapabilityStore_1, terminalExtensions_1, widgetManager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DetachedProcessInfo = exports.DeatachedTerminal = void 0;
    let DeatachedTerminal = class DeatachedTerminal extends lifecycle_1.Disposable {
        get xterm() {
            return this._xterm;
        }
        constructor(_xterm, options, instantiationService) {
            super();
            this._xterm = _xterm;
            this._widgets = this._register(new widgetManager_1.TerminalWidgetManager());
            this.capabilities = new terminalCapabilityStore_1.TerminalCapabilityStore();
            this._contributions = new Map();
            this._register(_xterm);
            // Initialize contributions
            const contributionDescs = terminalExtensions_1.TerminalExtensionsRegistry.getTerminalContributions();
            for (const desc of contributionDescs) {
                if (this._contributions.has(desc.id)) {
                    (0, errors_1.onUnexpectedError)(new Error(`Cannot have two terminal contributions with the same id ${desc.id}`));
                    continue;
                }
                if (desc.canRunInDetachedTerminals === false) {
                    continue;
                }
                let contribution;
                try {
                    contribution = instantiationService.createInstance(desc.ctor, this, options.processInfo, this._widgets);
                    this._contributions.set(desc.id, contribution);
                    this._register(contribution);
                }
                catch (err) {
                    (0, errors_1.onUnexpectedError)(err);
                }
            }
            // xterm is already by the time DetachedTerminal is created, so trigger everything
            // on the next microtask, allowing the caller to do any extra initialization
            this._register(new async_1.Delayer(symbols_1.MicrotaskDelay)).trigger(() => {
                for (const contr of this._contributions.values()) {
                    contr.xtermReady?.(this._xterm);
                }
            });
        }
        attachToElement(container, options) {
            const screenElement = this._xterm.attachToElement(container, options);
            this._widgets.attachToElement(screenElement);
        }
    };
    exports.DeatachedTerminal = DeatachedTerminal;
    exports.DeatachedTerminal = DeatachedTerminal = __decorate([
        __param(2, instantiation_1.IInstantiationService)
    ], DeatachedTerminal);
    /**
     * Implements {@link ITerminalProcessInfo} for a detached terminal where most
     * properties are stubbed. Properties are mutable and can be updated by
     * the instantiator.
     */
    class DetachedProcessInfo {
        constructor(initialValues) {
            this.processState = 3 /* ProcessState.Running */;
            this.ptyProcessReady = Promise.resolve();
            this.initialCwd = '';
            this.shouldPersist = false;
            this.hasWrittenData = false;
            this.hasChildProcesses = false;
            this.capabilities = new terminalCapabilityStore_1.TerminalCapabilityStore();
            this.shellIntegrationNonce = '';
            Object.assign(this, initialValues);
        }
    }
    exports.DetachedProcessInfo = DetachedProcessInfo;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGV0YWNoZWRUZXJtaW5hbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlcm1pbmFsL2Jyb3dzZXIvZGV0YWNoZWRUZXJtaW5hbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFrQnpGLElBQU0saUJBQWlCLEdBQXZCLE1BQU0saUJBQWtCLFNBQVEsc0JBQVU7UUFLaEQsSUFBVyxLQUFLO1lBQ2YsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ3BCLENBQUM7UUFFRCxZQUNrQixNQUFxQixFQUN0QyxPQUE4QixFQUNQLG9CQUEyQztZQUVsRSxLQUFLLEVBQUUsQ0FBQztZQUpTLFdBQU0sR0FBTixNQUFNLENBQWU7WUFUdEIsYUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxxQ0FBcUIsRUFBRSxDQUFDLENBQUM7WUFDeEQsaUJBQVksR0FBRyxJQUFJLGlEQUF1QixFQUFFLENBQUM7WUFDNUMsbUJBQWMsR0FBdUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQVkvRSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRXZCLDJCQUEyQjtZQUMzQixNQUFNLGlCQUFpQixHQUFHLCtDQUEwQixDQUFDLHdCQUF3QixFQUFFLENBQUM7WUFDaEYsS0FBSyxNQUFNLElBQUksSUFBSSxpQkFBaUIsRUFBRTtnQkFDckMsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUU7b0JBQ3JDLElBQUEsMEJBQWlCLEVBQUMsSUFBSSxLQUFLLENBQUMsMkRBQTJELElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQ25HLFNBQVM7aUJBQ1Q7Z0JBQ0QsSUFBSSxJQUFJLENBQUMseUJBQXlCLEtBQUssS0FBSyxFQUFFO29CQUM3QyxTQUFTO2lCQUNUO2dCQUVELElBQUksWUFBbUMsQ0FBQztnQkFDeEMsSUFBSTtvQkFDSCxZQUFZLEdBQUcsb0JBQW9CLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUN4RyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLFlBQVksQ0FBQyxDQUFDO29CQUMvQyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO2lCQUM3QjtnQkFBQyxPQUFPLEdBQUcsRUFBRTtvQkFDYixJQUFBLDBCQUFpQixFQUFDLEdBQUcsQ0FBQyxDQUFDO2lCQUN2QjthQUNEO1lBRUQsa0ZBQWtGO1lBQ2xGLDRFQUE0RTtZQUM1RSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxDQUFDLHdCQUFjLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUU7Z0JBQ3hELEtBQUssTUFBTSxLQUFLLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsRUFBRTtvQkFDakQsS0FBSyxDQUFDLFVBQVUsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztpQkFDaEM7WUFDRixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxlQUFlLENBQUMsU0FBc0IsRUFBRSxPQUEyRDtZQUNsRyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDdEUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDOUMsQ0FBQztLQUNELENBQUE7SUFuRFksOENBQWlCO2dDQUFqQixpQkFBaUI7UUFZM0IsV0FBQSxxQ0FBcUIsQ0FBQTtPQVpYLGlCQUFpQixDQW1EN0I7SUFFRDs7OztPQUlHO0lBQ0gsTUFBYSxtQkFBbUI7UUFrQi9CLFlBQVksYUFBNEM7WUFqQnhELGlCQUFZLGdDQUF3QjtZQUNwQyxvQkFBZSxHQUFHLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUtwQyxlQUFVLEdBQUcsRUFBRSxDQUFDO1lBR2hCLGtCQUFhLEdBQUcsS0FBSyxDQUFDO1lBQ3RCLG1CQUFjLEdBQUcsS0FBSyxDQUFDO1lBQ3ZCLHNCQUFpQixHQUFHLEtBQUssQ0FBQztZQUUxQixpQkFBWSxHQUFHLElBQUksaURBQXVCLEVBQUUsQ0FBQztZQUM3QywwQkFBcUIsR0FBRyxFQUFFLENBQUM7WUFJMUIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFDcEMsQ0FBQztLQUNEO0lBckJELGtEQXFCQyJ9