/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/controller/textAreaInput", "vs/base/common/lifecycle", "vs/base/browser/browser", "vs/base/common/platform"], function (require, exports, textAreaInput_1, lifecycle_1, browser, platform) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (() => {
        const startButton = document.getElementById('startRecording');
        const endButton = document.getElementById('endRecording');
        let inputarea;
        const disposables = new lifecycle_1.DisposableStore();
        let originTimeStamp = 0;
        let recorded = {
            env: null,
            initial: null,
            events: [],
            final: null
        };
        const readTextareaState = () => {
            return {
                selectionDirection: inputarea.selectionDirection,
                selectionEnd: inputarea.selectionEnd,
                selectionStart: inputarea.selectionStart,
                value: inputarea.value,
            };
        };
        startButton.onclick = () => {
            disposables.clear();
            startTest();
            originTimeStamp = 0;
            recorded = {
                env: {
                    OS: platform.OS,
                    browser: {
                        isAndroid: browser.isAndroid,
                        isFirefox: browser.isFirefox,
                        isChrome: browser.isChrome,
                        isSafari: browser.isSafari
                    }
                },
                initial: readTextareaState(),
                events: [],
                final: null
            };
        };
        endButton.onclick = () => {
            recorded.final = readTextareaState();
            console.log(printRecordedData());
        };
        function printRecordedData() {
            const lines = [];
            lines.push(`const recorded: IRecorded = {`);
            lines.push(`\tenv: ${JSON.stringify(recorded.env)}, `);
            lines.push(`\tinitial: ${printState(recorded.initial)}, `);
            lines.push(`\tevents: [\n\t\t${recorded.events.map(ev => printEvent(ev)).join(',\n\t\t')}\n\t],`);
            lines.push(`\tfinal: ${printState(recorded.final)},`);
            lines.push(`}`);
            return lines.join('\n');
            function printString(str) {
                return str.replace(/\\/g, '\\\\').replace(/'/g, '\\\'');
            }
            function printState(state) {
                return `{ value: '${printString(state.value)}', selectionStart: ${state.selectionStart}, selectionEnd: ${state.selectionEnd}, selectionDirection: '${state.selectionDirection}' }`;
            }
            function printEvent(ev) {
                if (ev.type === 'keydown' || ev.type === 'keypress' || ev.type === 'keyup') {
                    return `{ timeStamp: ${ev.timeStamp.toFixed(2)}, state: ${printState(ev.state)}, type: '${ev.type}', altKey: ${ev.altKey}, charCode: ${ev.charCode}, code: '${ev.code}', ctrlKey: ${ev.ctrlKey}, isComposing: ${ev.isComposing}, key: '${ev.key}', keyCode: ${ev.keyCode}, location: ${ev.location}, metaKey: ${ev.metaKey}, repeat: ${ev.repeat}, shiftKey: ${ev.shiftKey} }`;
                }
                if (ev.type === 'compositionstart' || ev.type === 'compositionupdate' || ev.type === 'compositionend') {
                    return `{ timeStamp: ${ev.timeStamp.toFixed(2)}, state: ${printState(ev.state)}, type: '${ev.type}', data: '${printString(ev.data)}' }`;
                }
                if (ev.type === 'beforeinput' || ev.type === 'input') {
                    return `{ timeStamp: ${ev.timeStamp.toFixed(2)}, state: ${printState(ev.state)}, type: '${ev.type}', data: ${ev.data === null ? 'null' : `'${printString(ev.data)}'`}, inputType: '${ev.inputType}', isComposing: ${ev.isComposing} }`;
                }
                return JSON.stringify(ev);
            }
        }
        function startTest() {
            inputarea = document.createElement('textarea');
            document.body.appendChild(inputarea);
            inputarea.focus();
            disposables.add((0, lifecycle_1.toDisposable)(() => {
                inputarea.remove();
            }));
            const wrapper = disposables.add(new textAreaInput_1.TextAreaWrapper(inputarea));
            wrapper.setValue('', `aaaa`);
            wrapper.setSelectionRange('', 2, 2);
            const recordEvent = (e) => {
                recorded.events.push(e);
            };
            const recordKeyboardEvent = (e) => {
                if (e.type !== 'keydown' && e.type !== 'keypress' && e.type !== 'keyup') {
                    throw new Error(`Not supported!`);
                }
                if (originTimeStamp === 0) {
                    originTimeStamp = e.timeStamp;
                }
                const ev = {
                    timeStamp: e.timeStamp - originTimeStamp,
                    state: readTextareaState(),
                    type: e.type,
                    altKey: e.altKey,
                    charCode: e.charCode,
                    code: e.code,
                    ctrlKey: e.ctrlKey,
                    isComposing: e.isComposing,
                    key: e.key,
                    keyCode: e.keyCode,
                    location: e.location,
                    metaKey: e.metaKey,
                    repeat: e.repeat,
                    shiftKey: e.shiftKey
                };
                recordEvent(ev);
            };
            const recordCompositionEvent = (e) => {
                if (e.type !== 'compositionstart' && e.type !== 'compositionupdate' && e.type !== 'compositionend') {
                    throw new Error(`Not supported!`);
                }
                if (originTimeStamp === 0) {
                    originTimeStamp = e.timeStamp;
                }
                const ev = {
                    timeStamp: e.timeStamp - originTimeStamp,
                    state: readTextareaState(),
                    type: e.type,
                    data: e.data,
                };
                recordEvent(ev);
            };
            const recordInputEvent = (e) => {
                if (e.type !== 'beforeinput' && e.type !== 'input') {
                    throw new Error(`Not supported!`);
                }
                if (originTimeStamp === 0) {
                    originTimeStamp = e.timeStamp;
                }
                const ev = {
                    timeStamp: e.timeStamp - originTimeStamp,
                    state: readTextareaState(),
                    type: e.type,
                    data: e.data,
                    inputType: e.inputType,
                    isComposing: e.isComposing,
                };
                recordEvent(ev);
            };
            wrapper.onKeyDown(recordKeyboardEvent);
            wrapper.onKeyPress(recordKeyboardEvent);
            wrapper.onKeyUp(recordKeyboardEvent);
            wrapper.onCompositionStart(recordCompositionEvent);
            wrapper.onCompositionUpdate(recordCompositionEvent);
            wrapper.onCompositionEnd(recordCompositionEvent);
            wrapper.onBeforeInput(recordInputEvent);
            wrapper.onInput(recordInputEvent);
        }
    })();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1lUmVjb3JkZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvdGVzdC9icm93c2VyL2NvbnRyb2xsZXIvaW1lUmVjb3JkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFRaEcsQ0FBQyxHQUFHLEVBQUU7UUFFTCxNQUFNLFdBQVcsR0FBc0IsUUFBUSxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBRSxDQUFDO1FBQ2xGLE1BQU0sU0FBUyxHQUFzQixRQUFRLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBRSxDQUFDO1FBRTlFLElBQUksU0FBOEIsQ0FBQztRQUNuQyxNQUFNLFdBQVcsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztRQUMxQyxJQUFJLGVBQWUsR0FBRyxDQUFDLENBQUM7UUFDeEIsSUFBSSxRQUFRLEdBQWM7WUFDekIsR0FBRyxFQUFFLElBQUs7WUFDVixPQUFPLEVBQUUsSUFBSztZQUNkLE1BQU0sRUFBRSxFQUFFO1lBQ1YsS0FBSyxFQUFFLElBQUs7U0FDWixDQUFDO1FBRUYsTUFBTSxpQkFBaUIsR0FBRyxHQUEyQixFQUFFO1lBQ3RELE9BQU87Z0JBQ04sa0JBQWtCLEVBQUUsU0FBUyxDQUFDLGtCQUFrQjtnQkFDaEQsWUFBWSxFQUFFLFNBQVMsQ0FBQyxZQUFZO2dCQUNwQyxjQUFjLEVBQUUsU0FBUyxDQUFDLGNBQWM7Z0JBQ3hDLEtBQUssRUFBRSxTQUFTLENBQUMsS0FBSzthQUN0QixDQUFDO1FBQ0gsQ0FBQyxDQUFDO1FBRUYsV0FBVyxDQUFDLE9BQU8sR0FBRyxHQUFHLEVBQUU7WUFDMUIsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3BCLFNBQVMsRUFBRSxDQUFDO1lBQ1osZUFBZSxHQUFHLENBQUMsQ0FBQztZQUNwQixRQUFRLEdBQUc7Z0JBQ1YsR0FBRyxFQUFFO29CQUNKLEVBQUUsRUFBRSxRQUFRLENBQUMs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