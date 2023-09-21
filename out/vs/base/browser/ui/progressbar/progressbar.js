/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/async", "vs/base/common/lifecycle", "vs/base/common/types", "vs/css!./progressbar"], function (require, exports, dom_1, async_1, lifecycle_1, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ProgressBar = exports.unthemedProgressBarOptions = void 0;
    const CSS_DONE = 'done';
    const CSS_ACTIVE = 'active';
    const CSS_INFINITE = 'infinite';
    const CSS_INFINITE_LONG_RUNNING = 'infinite-long-running';
    const CSS_DISCRETE = 'discrete';
    exports.unthemedProgressBarOptions = {
        progressBarBackground: undefined
    };
    /**
     * A progress bar with support for infinite or discrete progress.
     */
    class ProgressBar extends lifecycle_1.Disposable {
        /**
         * After a certain time of showing the progress bar, switch
         * to long-running mode and throttle animations to reduce
         * the pressure on the GPU process.
         *
         * https://github.com/microsoft/vscode/issues/97900
         * https://github.com/microsoft/vscode/issues/138396
         */
        static { this.LONG_RUNNING_INFINITE_THRESHOLD = 10000; }
        constructor(container, options) {
            super();
            this.workedVal = 0;
            this.showDelayedScheduler = this._register(new async_1.RunOnceScheduler(() => (0, dom_1.show)(this.element), 0));
            this.longRunningScheduler = this._register(new async_1.RunOnceScheduler(() => this.infiniteLongRunning(), ProgressBar.LONG_RUNNING_INFINITE_THRESHOLD));
            this.create(container, options);
        }
        create(container, options) {
            this.element = document.createElement('div');
            this.element.classList.add('monaco-progress-container');
            this.element.setAttribute('role', 'progressbar');
            this.element.setAttribute('aria-valuemin', '0');
            container.appendChild(this.element);
            this.bit = document.createElement('div');
            this.bit.classList.add('progress-bit');
            this.bit.style.backgroundColor = options?.progressBarBackground || '#0E70C0';
            this.element.appendChild(this.bit);
        }
        off() {
            this.bit.style.width = 'inherit';
            this.bit.style.opacity = '1';
            this.element.classList.remove(CSS_ACTIVE, CSS_INFINITE, CSS_INFINITE_LONG_RUNNING, CSS_DISCRETE);
            this.workedVal = 0;
            this.totalWork = undefined;
            this.longRunningScheduler.cancel();
        }
        /**
         * Indicates to the progress bar that all work is done.
         */
        done() {
            return this.doDone(true);
        }
        /**
         * Stops the progressbar from showing any progress instantly without fading out.
         */
        stop() {
            return this.doDone(false);
        }
        doDone(delayed) {
            this.element.classList.add(CSS_DONE);
            // discrete: let it grow to 100% width and hide afterwards
            if (!this.element.classList.contains(CSS_INFINITE)) {
                this.bit.style.width = 'inherit';
                if (delayed) {
                    setTimeout(() => this.off(), 200);
                }
                else {
                    this.off();
                }
            }
            // infinite: let it fade out and hide afterwards
            else {
                this.bit.style.opacity = '0';
                if (delayed) {
                    setTimeout(() => this.off(), 200);
                }
                else {
                    this.off();
                }
            }
            return this;
        }
        /**
         * Use this mode to indicate progress that has no total number of work units.
         */
        infinite() {
            this.bit.style.width = '2%';
            this.bit.style.opacity = '1';
            this.element.classList.remove(CSS_DISCRETE, CSS_DONE, CSS_INFINITE_LONG_RUNNING);
            this.element.classList.add(CSS_ACTIVE, CSS_INFINITE);
            this.longRunningScheduler.schedule();
            return this;
        }
        infiniteLongRunning() {
            this.element.classList.add(CSS_INFINITE_LONG_RUNNING);
        }
        /**
         * Tells the progress bar the total number of work. Use in combination with workedVal() to let
         * the progress bar show the actual progress based on the work that is done.
         */
        total(value) {
            this.workedVal = 0;
            this.totalWork = value;
            this.element.setAttribute('aria-valuemax', value.toString());
            return this;
        }
        /**
         * Finds out if this progress bar is configured with total work
         */
        hasTotal() {
            return (0, types_1.isNumber)(this.totalWork);
        }
        /**
         * Tells the progress bar that an increment of work has been completed.
         */
        worked(value) {
            value = Math.max(1, Number(value));
            return this.doSetWorked(this.workedVal + value);
        }
        /**
         * Tells the progress bar the total amount of work that has been completed.
         */
        setWorked(value) {
            value = Math.max(1, Number(value));
            return this.doSetWorked(value);
        }
        doSetWorked(value) {
            const totalWork = this.totalWork || 100;
            this.workedVal = value;
            this.workedVal = Math.min(totalWork, this.workedVal);
            this.element.classList.remove(CSS_INFINITE, CSS_INFINITE_LONG_RUNNING, CSS_DONE);
            this.element.classList.add(CSS_ACTIVE, CSS_DISCRETE);
            this.element.setAttribute('aria-valuenow', value.toString());
            this.bit.style.width = 100 * (this.workedVal / (totalWork)) + '%';
            return this;
        }
        getContainer() {
            return this.element;
        }
        show(delay) {
            this.showDelayedScheduler.cancel();
            if (typeof delay === 'number') {
                this.showDelayedScheduler.schedule(delay);
            }
            else {
                (0, dom_1.show)(this.element);
            }
        }
        hide() {
            (0, dom_1.hide)(this.element);
            this.showDelayedScheduler.cancel();
        }
    }
    exports.ProgressBar = ProgressBar;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZ3Jlc3NiYXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2Jyb3dzZXIvdWkvcHJvZ3Jlc3NiYXIvcHJvZ3Jlc3NiYXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBUWhHLE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQztJQUN4QixNQUFNLFVBQVUsR0FBRyxRQUFRLENBQUM7SUFDNUIsTUFBTSxZQUFZLEdBQUcsVUFBVSxDQUFDO0lBQ2hDLE1BQU0seUJBQXlCLEdBQUcsdUJBQXVCLENBQUM7SUFDMUQsTUFBTSxZQUFZLEdBQUcsVUFBVSxDQUFDO0lBU25CLFFBQUEsMEJBQTBCLEdBQXdCO1FBQzlELHFCQUFxQixFQUFFLFNBQVM7S0FDaEMsQ0FBQztJQUVGOztPQUVHO0lBQ0gsTUFBYSxXQUFZLFNBQVEsc0JBQVU7UUFFMUM7Ozs7Ozs7V0FPRztpQkFDcUIsb0NBQStCLEdBQUcsS0FBSyxDQUFDO1FBU2hFLFlBQVksU0FBc0IsRUFBRSxPQUE2QjtZQUNoRSxLQUFLLEVBQUUsQ0FBQztZQUVSLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO1lBRW5CLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksd0JBQWdCLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBQSxVQUFJLEVBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOUYsSUFBSSxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSx3QkFBZ0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsRUFBRSxXQUFXLENBQUMsK0JBQStCLENBQUMsQ0FBQyxDQUFDO1lBRWhKLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FB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