/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/async", "vs/base/common/lifecycle", "vs/base/common/types", "vs/css!./progressbar"], function (require, exports, dom_1, async_1, lifecycle_1, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$YR = exports.$XR = void 0;
    const CSS_DONE = 'done';
    const CSS_ACTIVE = 'active';
    const CSS_INFINITE = 'infinite';
    const CSS_INFINITE_LONG_RUNNING = 'infinite-long-running';
    const CSS_DISCRETE = 'discrete';
    exports.$XR = {
        progressBarBackground: undefined
    };
    /**
     * A progress bar with support for infinite or discrete progress.
     */
    class $YR extends lifecycle_1.$kc {
        /**
         * After a certain time of showing the progress bar, switch
         * to long-running mode and throttle animations to reduce
         * the pressure on the GPU process.
         *
         * https://github.com/microsoft/vscode/issues/97900
         * https://github.com/microsoft/vscode/issues/138396
         */
        static { this.a = 10000; }
        constructor(container, options) {
            super();
            this.b = 0;
            this.h = this.B(new async_1.$Sg(() => (0, dom_1.$dP)(this.c), 0));
            this.j = this.B(new async_1.$Sg(() => this.s(), $YR.a));
            this.m(container, options);
        }
        m(container, options) {
            this.c = document.createElement('div');
            this.c.classList.add('monaco-progress-container');
            this.c.setAttribute('role', 'progressbar');
            this.c.setAttribute('aria-valuemin', '0');
            container.appendChild(this.c);
            this.f = document.createElement('div');
            this.f.classList.add('progress-bit');
            this.f.style.backgroundColor = options?.progressBarBackground || '#0E70C0';
            this.c.appendChild(this.f);
        }
        n() {
            this.f.style.width = 'inherit';
            this.f.style.opacity = '1';
            this.c.classList.remove(CSS_ACTIVE, CSS_INFINITE, CSS_INFINITE_LONG_RUNNING, CSS_DISCRETE);
            this.b = 0;
            this.g = undefined;
            this.j.cancel();
        }
        /**
         * Indicates to the progress bar that all work is done.
         */
        done() {
            return this.r(true);
        }
        /**
         * Stops the progressbar from showing any progress instantly without fading out.
         */
        stop() {
            return this.r(false);
        }
        r(delayed) {
            this.c.classList.add(CSS_DONE);
            // discrete: let it grow to 100% width and hide afterwards
            if (!this.c.classList.contains(CSS_INFINITE)) {
                this.f.style.width = 'inherit';
                if (delayed) {
                    setTimeout(() => this.n(), 200);
                }
                else {
                    this.n();
                }
            }
            // infinite: let it fade out and hide afterwards
            else {
                this.f.style.opacity = '0';
                if (delayed) {
                    setTimeout(() => this.n(), 200);
                }
                else {
                    this.n();
                }
            }
            return this;
        }
        /**
         * Use this mode to indicate progress that has no total number of work units.
         */
        infinite() {
            this.f.style.width = '2%';
            this.f.style.opacity = '1';
            this.c.classList.remove(CSS_DISCRETE, CSS_DONE, CSS_INFINITE_LONG_RUNNING);
            this.c.classList.add(CSS_ACTIVE, CSS_INFINITE);
            this.j.schedule();
            return this;
        }
        s() {
            this.c.classList.add(CSS_INFINITE_LONG_RUNNING);
        }
        /**
         * Tells the progress bar the total number of work. Use in combination with workedVal() to let
         * the progress bar show the actual progress based on the work that is done.
         */
        total(value) {
            this.b = 0;
            this.g = value;
            this.c.setAttribute('aria-valuemax', value.toString());
            return this;
        }
        /**
         * Finds out if this progress bar is configured with total work
         */
        hasTotal() {
            return (0, types_1.$nf)(this.g);
        }
        /**
         * Tells the progress bar that an increment of work has been completed.
         */
        worked(value) {
            value = Math.max(1, Number(value));
            return this.t(this.b + value);
        }
        /**
         * Tells the progress bar the total amount of work that has been completed.
         */
        setWorked(value) {
            value = Math.max(1, Number(value));
            return this.t(value);
        }
        t(value) {
            const totalWork = this.g || 100;
            this.b = value;
            this.b = Math.min(totalWork, this.b);
            this.c.classList.remove(CSS_INFINITE, CSS_INFINITE_LONG_RUNNING, CSS_DONE);
            this.c.classList.add(CSS_ACTIVE, CSS_DISCRETE);
            this.c.setAttribute('aria-valuenow', value.toString());
            this.f.style.width = 100 * (this.b / (totalWork)) + '%';
            return this;
        }
        getContainer() {
            return this.c;
        }
        show(delay) {
            this.h.cancel();
            if (typeof delay === 'number') {
                this.h.schedule(delay);
            }
            else {
                (0, dom_1.$dP)(this.c);
            }
        }
        hide() {
            (0, dom_1.$eP)(this.c);
            this.h.cancel();
        }
    }
    exports.$YR = $YR;
});
//# sourceMappingURL=progressbar.js.map