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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/aria/aria", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/accessibility/common/accessibility", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/layout/browser/layoutService"], function (require, exports, dom_1, aria_1, event_1, lifecycle_1, accessibility_1, configuration_1, contextkey_1, layoutService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$M4b = void 0;
    let $M4b = class $M4b extends lifecycle_1.$kc {
        constructor(j, m, n) {
            super();
            this.j = j;
            this.m = m;
            this.n = n;
            this.b = 0 /* AccessibilitySupport.Unknown */;
            this.c = new event_1.$fd();
            this.h = new event_1.$fd();
            this.a = accessibility_1.$2r.bindTo(this.j);
            const updateContextKey = () => this.a.set(this.isScreenReaderOptimized());
            this.B(this.n.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('editor.accessibilitySupport')) {
                    updateContextKey();
                    this.c.fire();
                }
                if (e.affectsConfiguration('workbench.reduceMotion')) {
                    this.f = this.n.getValue('workbench.reduceMotion');
                    this.h.fire();
                }
            }));
            updateContextKey();
            this.B(this.onDidChangeScreenReaderOptimized(() => updateContextKey()));
            const reduceMotionMatcher = window.matchMedia(`(prefers-reduced-motion: reduce)`);
            this.g = reduceMotionMatcher.matches;
            this.f = this.n.getValue('workbench.reduceMotion');
            this.r(reduceMotionMatcher);
        }
        r(reduceMotionMatcher) {
            if (!this.m.hasContainer) {
                // we can't use `ILayoutService.container` because the application
                // doesn't have a single container
                return;
            }
            this.B((0, dom_1.$nO)(reduceMotionMatcher, 'change', () => {
                this.g = reduceMotionMatcher.matches;
                if (this.f === 'auto') {
                    this.h.fire();
                }
            }));
            const updateRootClasses = () => {
                const reduce = this.isMotionReduced();
                this.m.container.classList.toggle('reduce-motion', reduce);
                this.m.container.classList.toggle('enable-motion', !reduce);
            };
            updateRootClasses();
            this.B(this.onDidChangeReducedMotion(() => updateRootClasses()));
        }
        get onDidChangeScreenReaderOptimized() {
            return this.c.event;
        }
        isScreenReaderOptimized() {
            const config = this.n.getValue('editor.accessibilitySupport');
            return config === 'on' || (config === 'auto' && this.b === 2 /* AccessibilitySupport.Enabled */);
        }
        get onDidChangeReducedMotion() {
            return this.h.event;
        }
        isMotionReduced() {
            const config = this.f;
            return config === 'on' || (config === 'auto' && this.g);
        }
        alwaysUnderlineAccessKeys() {
            return Promise.resolve(false);
        }
        getAccessibilitySupport() {
            return this.b;
        }
        setAccessibilitySupport(accessibilitySupport) {
            if (this.b === accessibilitySupport) {
                return;
            }
            this.b = accessibilitySupport;
            this.c.fire();
        }
        alert(message) {
            (0, aria_1.$$P)(message);
        }
    };
    exports.$M4b = $M4b;
    exports.$M4b = $M4b = __decorate([
        __param(0, contextkey_1.$3i),
        __param(1, layoutService_1.$XT),
        __param(2, configuration_1.$8h)
    ], $M4b);
});
//# sourceMappingURL=accessibilityService.js.map