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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/editor/browser/editorExtensions", "vs/editor/common/editorContextKeys", "vs/editor/contrib/inlayHints/browser/inlayHints", "vs/editor/contrib/inlayHints/browser/inlayHintsController", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/audioCues/browser/audioCueService", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/opener/browser/link"], function (require, exports, dom, cancellation_1, lifecycle_1, editorExtensions_1, editorContextKeys_1, inlayHints_1, inlayHintsController_1, nls_1, actions_1, audioCueService_1, contextkey_1, instantiation_1, link_1) {
    "use strict";
    var InlayHintsAccessibility_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InlayHintsAccessibility = void 0;
    let InlayHintsAccessibility = class InlayHintsAccessibility {
        static { InlayHintsAccessibility_1 = this; }
        static { this.IsReading = new contextkey_1.RawContextKey('isReadingLineWithInlayHints', false, { type: 'boolean', description: (0, nls_1.localize)('isReadingLineWithInlayHints', "Whether the current line and its inlay hints are currently focused") }); }
        static { this.ID = 'editor.contrib.InlayHintsAccessibility'; }
        static get(editor) {
            return editor.getContribution(InlayHintsAccessibility_1.ID) ?? undefined;
        }
        constructor(_editor, contextKeyService, _audioCueService, _instaService) {
            this._editor = _editor;
            this._audioCueService = _audioCueService;
            this._instaService = _instaService;
            this._sessionDispoosables = new lifecycle_1.DisposableStore();
            this._ariaElement = document.createElement('span');
            this._ariaElement.style.position = 'fixed';
            this._ariaElement.className = 'inlayhint-accessibility-element';
            this._ariaElement.tabIndex = 0;
            this._ariaElement.setAttribute('aria-description', (0, nls_1.localize)('description', "Code with Inlay Hint Information"));
            this._ctxIsReading = InlayHintsAccessibility_1.IsReading.bindTo(contextKeyService);
        }
        dispose() {
            this._sessionDispoosables.dispose();
            this._ctxIsReading.reset();
            this._ariaElement.remove();
        }
        _reset() {
            dom.clearNode(this._ariaElement);
            this._sessionDispoosables.clear();
            this._ctxIsReading.reset();
        }
        async _read(line, hints) {
            this._sessionDispoosables.clear();
            if (!this._ariaElement.isConnected) {
                this._editor.getDomNode()?.appendChild(this._ariaElement);
            }
            if (!this._editor.hasModel() || !this._ariaElement.isConnected) {
                this._ctxIsReading.set(false);
                return;
            }
            const cts = new cancellation_1.CancellationTokenSource();
            this._sessionDispoosables.add(cts);
            for (const hint of hints) {
                await hint.resolve(cts.token);
            }
            if (cts.token.isCancellationRequested) {
                return;
            }
            const model = this._editor.getModel();
            // const text = this._editor.getModel().getLineContent(line);
            const newChildren = [];
            let start = 0;
            let tooLongToRead = false;
            for (const item of hints) {
                // text
                const part = model.getValueInRange({ startLineNumber: line, startColumn: start + 1, endLineNumber: line, endColumn: item.hint.position.column });
                if (part.length > 0) {
                    newChildren.push(part);
                    start = item.hint.position.column - 1;
                }
                // check length
                if (start > 750) {
                    newChildren.push('…');
                    tooLongToRead = true;
                    break;
                }
                // hint
                const em = document.createElement('em');
                const { label } = item.hint;
                if (typeof label === 'string') {
                    em.innerText = label;
                }
                else {
                    for (const part of label) {
                        if (part.command) {
                            const link = this._instaService.createInstance(link_1.Link, em, { href: (0, inlayHints_1.asCommandLink)(part.command), label: part.label, title: part.command.title }, undefined);
                            this._sessionDispoosables.add(link);
                        }
                        else {
                            em.innerText += part.label;
                        }
                    }
                }
                newChildren.push(em);
            }
            // trailing text
            if (!tooLongToRead) {
                newChildren.push(model.getValueInRange({ startLineNumber: line, startColumn: start + 1, endLineNumber: line, endColumn: Number.MAX_SAFE_INTEGER }));
            }
            dom.reset(this._ariaElement, ...newChildren);
            this._ariaElement.focus();
            this._ctxIsReading.set(true);
            // reset on blur
            this._sessionDispoosables.add(dom.addDisposableListener(this._ariaElement, 'focusout', () => {
                this._reset();
            }));
        }
        startInlayHintsReading() {
            if (!this._editor.hasModel()) {
                return;
            }
            const line = this._editor.getPosition().lineNumber;
            const hints = inlayHintsController_1.InlayHintsController.get(this._editor)?.getInlayHintsForLine(line);
            if (!hints || hints.length === 0) {
                this._audioCueService.playAudioCue(audioCueService_1.AudioCue.noInlayHints);
            }
            else {
                this._read(line, hints);
            }
        }
        stopInlayHintsReading() {
            this._reset();
            this._editor.focus();
        }
    };
    exports.InlayHintsAccessibility = InlayHintsAccessibility;
    exports.InlayHintsAccessibility = InlayHintsAccessibility = InlayHintsAccessibility_1 = __decorate([
        __param(1, contextkey_1.IContextKeyService),
        __param(2, audioCueService_1.IAudioCueService),
        __param(3, instantiation_1.IInstantiationService)
    ], InlayHintsAccessibility);
    (0, actions_1.registerAction2)(class StartReadHints extends editorExtensions_1.EditorAction2 {
        constructor() {
            super({
                id: 'inlayHints.startReadingLineWithHint',
                title: {
                    value: (0, nls_1.localize)('read.title', 'Read Line With Inline Hints'),
                    original: 'Read Line With Inline Hints'
                },
                precondition: editorContextKeys_1.EditorContextKeys.hasInlayHintsProvider,
                f1: true
            });
        }
        runEditorCommand(_accessor, editor) {
            const ctrl = InlayHintsAccessibility.get(editor);
            ctrl?.startInlayHintsReading();
        }
    });
    (0, actions_1.registerAction2)(class StopReadHints extends editorExtensions_1.EditorAction2 {
        constructor() {
            super({
                id: 'inlayHints.stopReadingLineWithHint',
                title: {
                    value: (0, nls_1.localize)('stop.title', 'Stop Inlay Hints Reading'),
                    original: 'Stop Inlay Hints Reading'
                },
                precondition: InlayHintsAccessibility.IsReading,
                f1: true,
                keybinding: {
                    weight: 100 /* KeybindingWeight.EditorContrib */,
                    primary: 9 /* KeyCode.Escape */
                }
            });
        }
        runEditorCommand(_accessor, editor) {
            const ctrl = InlayHintsAccessibility.get(editor);
            ctrl?.stopInlayHintsReading();
        }
    });
    (0, editorExtensions_1.registerEditorContribution)(InlayHintsAccessibility.ID, InlayHintsAccessibility, 4 /* EditorContributionInstantiation.Lazy */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5sYXlIaW50c0FjY2Vzc2liaWx0eS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2lubGF5SGludHMvYnJvd3Nlci9pbmxheUhpbnRzQWNjZXNzaWJpbHR5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFxQnpGLElBQU0sdUJBQXVCLEdBQTdCLE1BQU0sdUJBQXVCOztpQkFFbkIsY0FBUyxHQUFHLElBQUksMEJBQWEsQ0FBVSw2QkFBNkIsRUFBRSxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxJQUFBLGNBQVEsRUFBQyw2QkFBNkIsRUFBRSxvRUFBb0UsQ0FBQyxFQUFFLENBQUMsQUFBcE4sQ0FBcU47aUJBRTlOLE9BQUUsR0FBVyx3Q0FBd0MsQUFBbkQsQ0FBb0Q7UUFFdEUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFtQjtZQUM3QixPQUFPLE1BQU0sQ0FBQyxlQUFlLENBQTBCLHlCQUF1QixDQUFDLEVBQUUsQ0FBQyxJQUFJLFNBQVMsQ0FBQztRQUNqRyxDQUFDO1FBT0QsWUFDa0IsT0FBb0IsRUFDakIsaUJBQXFDLEVBQ3ZDLGdCQUFtRCxFQUM5QyxhQUFxRDtZQUgzRCxZQUFPLEdBQVAsT0FBTyxDQUFhO1lBRUYscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtZQUM3QixrQkFBYSxHQUFiLGFBQWEsQ0FBdUI7WUFONUQseUJBQW9CLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFRN0QsSUFBSSxDQUFDLFlBQVksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ25ELElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7WUFDM0MsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLEdBQUcsaUNBQWlDLENBQUM7WUFDaEUsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1lBQy9CLElBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLGtCQUFrQixFQUFFLElBQUEsY0FBUSxFQUFDLGFBQWEsRUFBRSxrQ0FBa0MsQ0FBQyxDQUFDLENBQUM7WUFFaEgsSUFBSSxDQUFDLGFBQWEsR0FBRyx5QkFBdUIsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDbEYsQ0FBQztRQUVELE9BQU87WUFDTixJQUFJLENBQUMsb0JBQW9CLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDcEMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUMzQixJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQzVCLENBQUM7UUFFTyxNQUFNO1lBQ2IsR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDakMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2xDLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDNUIsQ0FBQztRQUVPLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBWSxFQUFFLEtBQXNCO1lBRXZELElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUVsQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUU7Z0JBQ25DLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLEVBQUUsV0FBVyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQzthQUMxRDtZQUVELElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUU7Z0JBQy9ELElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUM5QixPQUFPO2FBQ1A7WUFFRCxNQUFNLEdBQUcsR0FBRyxJQUFJLHNDQUF1QixFQUFFLENBQUM7WUFDMUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUVuQyxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRTtnQkFDekIsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUM5QjtZQUVELElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsRUFBRTtnQkFDdEMsT0FBTzthQUNQO1lBQ0QsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUN0Qyw2REFBNkQ7WUFDN0QsTUFBTSxXQUFXLEdBQTZCLEVBQUUsQ0FBQztZQUVqRCxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7WUFDZCxJQUFJLGFBQWEsR0FBRyxLQUFLLENBQUM7WUFFMUIsS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLEVBQUU7Z0JBRXpCLE9BQU87Z0JBQ1AsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLGVBQWUsQ0FBQyxFQUFFLGVBQWUsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLEtBQUssR0FBRyxDQUFDLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztnQkFDakosSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtvQkFDcEIsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDdkIsS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7aUJBQ3RDO2dCQUVELGVBQWU7Z0JBQ2YsSUFBSSxLQUFLLEdBQUcsR0FBRyxFQUFFO29CQUNoQixXQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUN0QixhQUFhLEdBQUcsSUFBSSxDQUFDO29CQUNyQixNQUFNO2lCQUNOO2dCQUVELE9BQU87Z0JBQ1AsTUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDeEMsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7Z0JBQzVCLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFO29CQUM5QixFQUFFLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztpQkFDckI7cUJBQU07b0JBQ04sS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLEVBQUU7d0JBQ3pCLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTs0QkFDakIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsV0FBSSxFQUFFLEVBQUUsRUFDdEQsRUFBRSxJQUFJLEVBQUUsSUFBQSwwQkFBYSxFQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFDbkYsU0FBUyxDQUNULENBQUM7NEJBQ0YsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQzt5QkFFcEM7NkJBQU07NEJBQ04sRUFBRSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDO3lCQUMzQjtxQkFDRDtpQkFDRDtnQkFDRCxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2FBQ3JCO1lBRUQsZ0JBQWdCO1lBQ2hCLElBQUksQ0FBQyxhQUFhLEVBQUU7Z0JBQ25CLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxFQUFFLGVBQWUsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLEtBQUssR0FBRyxDQUFDLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsTUFBTSxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQ3BKO1lBRUQsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLEdBQUcsV0FBVyxDQUFDLENBQUM7WUFDN0MsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUMxQixJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUU3QixnQkFBZ0I7WUFDaEIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFO2dCQUMzRixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDZixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUlELHNCQUFzQjtZQUNyQixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFBRTtnQkFDN0IsT0FBTzthQUNQO1lBQ0QsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxVQUFVLENBQUM7WUFDbkQsTUFBTSxLQUFLLEdBQUcsMkNBQW9CLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNqRixJQUFJLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUNqQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxDQUFDLDBCQUFRLENBQUMsWUFBWSxDQUFDLENBQUM7YUFDMUQ7aUJBQU07Z0JBQ04sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDeEI7UUFDRixDQUFDO1FBRUQscUJBQXFCO1lBQ3BCLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNkLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDdEIsQ0FBQzs7SUEvSVcsMERBQXVCO3NDQUF2Qix1QkFBdUI7UUFpQmpDLFdBQUEsK0JBQWtCLENBQUE7UUFDbEIsV0FBQSxrQ0FBZ0IsQ0FBQTtRQUNoQixXQUFBLHFDQUFxQixDQUFBO09BbkJYLHVCQUF1QixDQWdKbkM7SUFHRCxJQUFBLHlCQUFlLEVBQUMsTUFBTSxjQUFlLFNBQVEsZ0NBQWE7UUFFekQ7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLHFDQUFxQztnQkFDekMsS0FBSyxFQUFFO29CQUNOLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxZQUFZLEVBQUUsNkJBQTZCLENBQUM7b0JBQzVELFFBQVEsRUFBRSw2QkFBNkI7aUJBQ3ZDO2dCQUNELFlBQVksRUFBRSxxQ0FBaUIsQ0FBQyxxQkFBcUI7Z0JBQ3JELEVBQUUsRUFBRSxJQUFJO2FBQ1IsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELGdCQUFnQixDQUFDLFNBQTJCLEVBQUUsTUFBbUI7WUFDaEUsTUFBTSxJQUFJLEdBQUcsdUJBQXVCLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2pELElBQUksRUFBRSxzQkFBc0IsRUFBRSxDQUFDO1FBQ2hDLENBQUM7S0FDRCxDQUFDLENBQUM7SUFFSCxJQUFBLHlCQUFlLEVBQUMsTUFBTSxhQUFjLFNBQVEsZ0NBQWE7UUFFeEQ7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLG9DQUFvQztnQkFDeEMsS0FBSyxFQUFFO29CQUNOLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxZQUFZLEVBQUUsMEJBQTBCLENBQUM7b0JBQ3pELFFBQVEsRUFBRSwwQkFBMEI7aUJBQ3BDO2dCQUNELFlBQVksRUFBRSx1QkFBdUIsQ0FBQyxTQUFTO2dCQUMvQyxFQUFFLEVBQUUsSUFBSTtnQkFDUixVQUFVLEVBQUU7b0JBQ1gsTUFBTSwwQ0FBZ0M7b0JBQ3RDLE9BQU8sd0JBQWdCO2lCQUN2QjthQUNELENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxnQkFBZ0IsQ0FBQyxTQUEyQixFQUFFLE1BQW1CO1lBQ2hFLE1BQU0sSUFBSSxHQUFHLHVCQUF1QixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNqRCxJQUFJLEVBQUUscUJBQXFCLEVBQUUsQ0FBQztRQUMvQixDQUFDO0tBQ0QsQ0FBQyxDQUFDO0lBRUgsSUFBQSw2Q0FBMEIsRUFBQyx1QkFBdUIsQ0FBQyxFQUFFLEVBQUUsdUJBQXVCLCtDQUF1QyxDQUFDIn0=