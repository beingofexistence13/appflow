/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	'accessibilitySupport.auto',
	'accessibilitySupport.on',
	'accessibilitySupport.off',
	'accessibilitySupport',
	'comments.insertSpace',
	'comments.ignoreEmptyLines',
	'emptySelectionClipboard',
	'find.cursorMoveOnType',
	'editor.find.seedSearchStringFromSelection.never',
	'editor.find.seedSearchStringFromSelection.always',
	'editor.find.seedSearchStringFromSelection.selection',
	'find.seedSearchStringFromSelection',
	'editor.find.autoFindInSelection.never',
	'editor.find.autoFindInSelection.always',
	'editor.find.autoFindInSelection.multiline',
	'find.autoFindInSelection',
	'find.globalFindClipboard',
	'find.addExtraSpaceOnTop',
	'find.loop',
	'fontLigatures',
	'fontFeatureSettings',
	'fontLigaturesGeneral',
	'fontVariations',
	'fontVariationSettings',
	'fontVariationsGeneral',
	'fontSize',
	'fontWeightErrorMessage',
	'fontWeight',
	'editor.gotoLocation.multiple.peek',
	'editor.gotoLocation.multiple.gotoAndPeek',
	'editor.gotoLocation.multiple.goto',
	'editor.gotoLocation.multiple.deprecated',
	'editor.editor.gotoLocation.multipleDefinitions',
	'editor.editor.gotoLocation.multipleTypeDefinitions',
	'editor.editor.gotoLocation.multipleDeclarations',
	'editor.editor.gotoLocation.multipleImplemenattions',
	'editor.editor.gotoLocation.multipleReferences',
	'alternativeDefinitionCommand',
	'alternativeTypeDefinitionCommand',
	'alternativeDeclarationCommand',
	'alternativeImplementationCommand',
	'alternativeReferenceCommand',
	'hover.enabled',
	'hover.delay',
	'hover.sticky',
	'hover.hidingDelay',
	'hover.above',
	'wrappingStrategy.simple',
	'wrappingStrategy.advanced',
	'wrappingStrategy',
	'codeActions',
	'editor.stickyScroll.enabled',
	'editor.stickyScroll.maxLineCount',
	'editor.stickyScroll.defaultModel',
	'editor.stickyScroll.scrollWithEditor',
	'inlayHints.enable',
	'editor.inlayHints.on',
	'editor.inlayHints.onUnlessPressed',
	'editor.inlayHints.offUnlessPressed',
	'editor.inlayHints.off',
	'inlayHints.fontSize',
	'inlayHints.fontFamily',
	'inlayHints.padding',
	'lineHeight',
	'minimap.enabled',
	'minimap.autohide',
	'minimap.size.proportional',
	'minimap.size.fill',
	'minimap.size.fit',
	'minimap.size',
	'minimap.side',
	'minimap.showSlider',
	'minimap.scale',
	'minimap.renderCharacters',
	'minimap.maxColumn',
	'padding.top',
	'padding.bottom',
	'parameterHints.enabled',
	'parameterHints.cycle',
	'on',
	'inline',
	'off',
	'quickSuggestions.strings',
	'quickSuggestions.comments',
	'quickSuggestions.other',
	'quickSuggestions',
	'lineNumbers.off',
	'lineNumbers.on',
	'lineNumbers.relative',
	'lineNumbers.interval',
	'lineNumbers',
	'rulers.size',
	'rulers.color',
	'rulers',
	'scrollbar.vertical.auto',
	'scrollbar.vertical.visible',
	'scrollbar.vertical.fit',
	'scrollbar.vertical',
	'scrollbar.horizontal.auto',
	'scrollbar.horizontal.visible',
	'scrollbar.horizontal.fit',
	'scrollbar.horizontal',
	'scrollbar.verticalScrollbarSize',
	'scrollbar.horizontalScrollbarSize',
	'scrollbar.scrollByPage',
	'unicodeHighlight.nonBasicASCII',
	'unicodeHighlight.invisibleCharacters',
	'unicodeHighlight.ambiguousCharacters',
	'unicodeHighlight.includeComments',
	'unicodeHighlight.includeStrings',
	'unicodeHighlight.allowedCharacters',
	'unicodeHighlight.allowedLocales',
	'inlineSuggest.enabled',
	'inlineSuggest.showToolbar.always',
	'inlineSuggest.showToolbar.onHover',
	'inlineSuggest.showToolbar',
	'inlineSuggest.suppressSuggestions',
	'bracketPairColorization.enabled',
	'bracketPairColorization.independentColorPoolPerBracketType',
	'editor.guides.bracketPairs.true',
	'editor.guides.bracketPairs.active',
	'editor.guides.bracketPairs.false',
	'editor.guides.bracketPairs',
	'editor.guides.bracketPairsHorizontal.true',
	'editor.guides.bracketPairsHorizontal.active',
	'editor.guides.bracketPairsHorizontal.false',
	'editor.guides.bracketPairsHorizontal',
	'editor.guides.highlightActiveBracketPair',
	'editor.guides.indentation',
	'editor.guides.highlightActiveIndentation.true',
	'editor.guides.highlightActiveIndentation.always',
	'editor.guides.highlightActiveIndentation.false',
	'editor.guides.highlightActiveIndentation',
	'suggest.insertMode.insert',
	'suggest.insertMode.replace',
	'suggest.insertMode',
	'suggest.filterGraceful',
	'suggest.localityBonus',
	'suggest.shareSuggestSelections',
	'suggest.insertMode.always',
	'suggest.insertMode.never',
	'suggest.insertMode.whenTriggerCharacter',
	'suggest.insertMode.whenQuickSuggestion',
	'suggest.selectionMode',
	'suggest.snippetsPreventQuickSuggestions',
	'suggest.showIcons',
	'suggest.showStatusBar',
	'suggest.preview',
	'suggest.showInlineDetails',
	'suggest.maxVisibleSuggestions.dep',
	'deprecated',
	'editor.suggest.showMethods',
	'editor.suggest.showFunctions',
	'editor.suggest.showConstructors',
	'editor.suggest.showDeprecated',
	'editor.suggest.matchOnWordStartOnly',
	'editor.suggest.showFields',
	'editor.suggest.showVariables',
	'editor.suggest.showClasss',
	'editor.suggest.showStructs',
	'editor.suggest.showInterfaces',
	'editor.suggest.showModules',
	'editor.suggest.showPropertys',
	'editor.suggest.showEvents',
	'editor.suggest.showOperators',
	'editor.suggest.showUnits',
	'editor.suggest.showValues',
	'editor.suggest.showConstants',
	'editor.suggest.showEnums',
	'editor.suggest.showEnumMembers',
	'editor.suggest.showKeywords',
	'editor.suggest.showTexts',
	'editor.suggest.showColors',
	'editor.suggest.showFiles',
	'editor.suggest.showReferences',
	'editor.suggest.showCustomcolors',
	'editor.suggest.showFolders',
	'editor.suggest.showTypeParameters',
	'editor.suggest.showSnippets',
	'editor.suggest.showUsers',
	'editor.suggest.showIssues',
	'selectLeadingAndTrailingWhitespace',
	'selectSubwords',
	'wrappingIndent.none',
	'wrappingIndent.same',
	'wrappingIndent.indent',
	'wrappingIndent.deepIndent',
	'wrappingIndent',
	'dropIntoEditor.enabled',
	'dropIntoEditor.showDropSelector',
	'dropIntoEditor.showDropSelector.afterDrop',
	'dropIntoEditor.showDropSelector.never',
	'pasteAs.enabled',
	'pasteAs.showPasteSelector',
	'pasteAs.showPasteSelector.afterPaste',
	'pasteAs.showPasteSelector.never',
	'acceptSuggestionOnCommitCharacter',
	'acceptSuggestionOnEnterSmart',
	'acceptSuggestionOnEnter',
	'accessibilityPageSize',
	'editorViewAccessibleLabel',
	'screenReaderAnnounceInlineSuggestion',
	'editor.autoClosingBrackets.languageDefined',
	'editor.autoClosingBrackets.beforeWhitespace',
	'autoClosingBrackets',
	'editor.autoClosingComments.languageDefined',
	'editor.autoClosingComments.beforeWhitespace',
	'autoClosingComments',
	'editor.autoClosingDelete.auto',
	'autoClosingDelete',
	'editor.autoClosingOvertype.auto',
	'autoClosingOvertype',
	'editor.autoClosingQuotes.languageDefined',
	'editor.autoClosingQuotes.beforeWhitespace',
	'autoClosingQuotes',
	'editor.autoIndent.none',
	'editor.autoIndent.keep',
	'editor.autoIndent.brackets',
	'editor.autoIndent.advanced',
	'editor.autoIndent.full',
	'autoIndent',
	'editor.autoSurround.languageDefined',
	'editor.autoSurround.quotes',
	'editor.autoSurround.brackets',
	'autoSurround',
	'stickyTabStops',
	'codeLens',
	'codeLensFontFamily',
	'codeLensFontSize',
	'colorDecorators',
	'editor.colorDecoratorActivatedOn.clickAndHover',
	'editor.colorDecoratorActivatedOn.hover',
	'editor.colorDecoratorActivatedOn.click',
	'colorDecoratorActivatedOn',
	'colorDecoratorsLimit',
	'columnSelection',
	'copyWithSyntaxHighlighting',
	'cursorBlinking',
	'cursorSmoothCaretAnimation.off',
	'cursorSmoothCaretAnimation.explicit',
	'cursorSmoothCaretAnimation.on',
	'cursorSmoothCaretAnimation',
	'cursorStyle',
	'cursorSurroundingLines',
	'cursorSurroundingLinesStyle.default',
	'cursorSurroundingLinesStyle.all',
	'cursorSurroundingLinesStyle',
	'cursorWidth',
	'dragAndDrop',
	'experimentalWhitespaceRendering.svg',
	'experimentalWhitespaceRendering.font',
	'experimentalWhitespaceRendering.off',
	'experimentalWhitespaceRendering',
	'fastScrollSensitivity',
	'folding',
	'foldingStrategy.auto',
	'foldingStrategy.indentation',
	'foldingStrategy',
	'foldingHighlight',
	'foldingImportsByDefault',
	'foldingMaximumRegions',
	'unfoldOnClickAfterEndOfLine',
	'fontFamily',
	'formatOnPaste',
	'formatOnType',
	'glyphMargin',
	'hideCursorInOverviewRuler',
	'letterSpacing',
	'linkedEditing',
	'links',
	'matchBrackets',
	'mouseWheelScrollSensitivity',
	'mouseWheelZoom',
	'multiCursorMergeOverlapping',
	'multiCursorModifier.ctrlCmd',
	'multiCursorModifier.alt',
	{
				key: 'multiCursorModifier',
				comment: [
					'- `ctrlCmd` refers to a value the setting can take and should not be localized.',
					'- `Control` and `Command` refer to the modifier keys Ctrl or Cmd on the keyboard and can be localized.'
				]
			},
	'multiCursorPaste.spread',
	'multiCursorPaste.full',
	'multiCursorPaste',
	'multiCursorLimit',
	'occurrencesHighlight',
	'overviewRulerBorder',
	'peekWidgetDefaultFocus.tree',
	'peekWidgetDefaultFocus.editor',
	'peekWidgetDefaultFocus',
	'definitionLinkOpensInPeek',
	'quickSuggestionsDelay',
	'renameOnType',
	'renameOnTypeDeprecate',
	'renderControlCharacters',
	'renderFinalNewline',
	'renderLineHighlight.all',
	'renderLineHighlight',
	'renderLineHighlightOnlyWhenFocus',
	'renderWhitespace.boundary',
	'renderWhitespace.selection',
	'renderWhitespace.trailing',
	'renderWhitespace',
	'roundedSelection',
	'scrollBeyondLastColumn',
	'scrollBeyondLastLine',
	'scrollPredominantAxis',
	'selectionClipboard',
	'selectionHighlight',
	'showFoldingControls.always',
	'showFoldingControls.never',
	'showFoldingControls.mouseover',
	'showFoldingControls',
	'showUnused',
	'showDeprecated',
	'snippetSuggestions.top',
	'snippetSuggestions.bottom',
	'snippetSuggestions.inline',
	'snippetSuggestions.none',
	'snippetSuggestions',
	'smoothScrolling',
	'inlineCompletionsAccessibilityVerbose',
	'suggestFontSize',
	'suggestLineHeight',
	'suggestOnTriggerCharacters',
	'suggestSelection.first',
	'suggestSelection.recentlyUsed',
	'suggestSelection.recentlyUsedByPrefix',
	'suggestSelection',
	'tabCompletion.on',
	'tabCompletion.off',
	'tabCompletion.onlySnippets',
	'tabCompletion',
	'unusualLineTerminators.auto',
	'unusualLineTerminators.off',
	'unusualLineTerminators.prompt',
	'unusualLineTerminators',
	'useTabStops',
	'wordBreak.normal',
	'wordBreak.keepAll',
	'wordBreak',
	'wordSeparators',
	'wordWrap.off',
	'wordWrap.on',
	{
					key: 'wordWrap.wordWrapColumn',
					comment: [
						'- `editor.wordWrapColumn` refers to a different setting and should not be localized.'
					]
				},
	{
					key: 'wordWrap.bounded',
					comment: [
						'- viewport means the edge of the visible window size.',
						'- `editor.wordWrapColumn` refers to a different setting and should not be localized.'
					]
				},
	{
				key: 'wordWrap',
				comment: [
					'- \'off\', \'on\', \'wordWrapColumn\' and \'bounded\' refer to values the setting can take and should not be localized.',
					'- `editor.wordWrapColumn` refers to a different setting and should not be localized.'
				]
			},
	{
				key: 'wordWrapColumn',
				comment: [
					'- `editor.wordWrap` refers to a different setting and should not be localized.',
					'- \'wordWrapColumn\' and \'bounded\' refer to values the different setting can take and should not be localized.'
				]
			},
	'defaultColorDecorators',
	'tabFocusMode'
]);