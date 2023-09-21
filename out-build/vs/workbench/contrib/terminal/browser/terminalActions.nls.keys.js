/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	'showTerminalTabs',
	'workbench.action.terminal.newWorkspacePlaceholder',
	'terminalLaunchHelp',
	'workbench.action.terminal.newInActiveWorkspace',
	'workbench.action.terminal.createTerminalEditor',
	'workbench.action.terminal.createTerminalEditor',
	'workbench.action.terminal.createTerminalEditorSide',
	'workbench.action.terminal.focusPreviousPane',
	'workbench.action.terminal.focusNextPane',
	'workbench.action.terminal.runRecentCommand',
	'workbench.action.terminal.copyLastCommand',
	'workbench.action.terminal.goToRecentDirectory',
	'workbench.action.terminal.resizePaneLeft',
	'workbench.action.terminal.resizePaneRight',
	'workbench.action.terminal.resizePaneUp',
	'workbench.action.terminal.resizePaneDown',
	'workbench.action.terminal.focus.tabsView',
	'workbench.action.terminal.focusNext',
	'workbench.action.terminal.focusPrevious',
	'workbench.action.terminal.runSelectedText',
	'workbench.action.terminal.runActiveFile',
	'workbench.action.terminal.runActiveFile.noFile',
	'workbench.action.terminal.scrollDown',
	'workbench.action.terminal.scrollDownPage',
	'workbench.action.terminal.scrollToBottom',
	'workbench.action.terminal.scrollUp',
	'workbench.action.terminal.scrollUpPage',
	'workbench.action.terminal.scrollToTop',
	'workbench.action.terminal.clearSelection',
	'workbench.action.terminal.detachSession',
	'workbench.action.terminal.attachToSession',
	'noUnattachedTerminals',
	'quickAccessTerminal',
	'workbench.action.terminal.scrollToPreviousCommand',
	'workbench.action.terminal.scrollToNextCommand',
	'workbench.action.terminal.selectToPreviousCommand',
	'workbench.action.terminal.selectToNextCommand',
	'workbench.action.terminal.selectToPreviousLine',
	'workbench.action.terminal.selectToNextLine',
	'sendSequence',
	'workbench.action.terminal.newWithCwd.cwd',
	'workbench.action.terminal.renameWithArg.name',
	'workbench.action.terminal.renameWithArg.noName',
	'workbench.action.terminal.relaunch',
	'workbench.action.terminal.joinInstance',
	'workbench.action.terminal.join',
	'workbench.action.terminal.join.insufficientTerminals',
	'workbench.action.terminal.join.onlySplits',
	'workbench.action.terminal.splitInActiveWorkspace',
	'workbench.action.terminal.selectAll',
	'workbench.action.terminal.new',
	'workbench.action.terminal.kill',
	'workbench.action.terminal.killAll',
	'workbench.action.terminal.killEditor',
	'workbench.action.terminal.clear',
	'workbench.action.terminal.selectDefaultShell',
	'workbench.action.terminal.openSettings',
	'workbench.action.terminal.setFixedDimensions',
	'workbench.action.terminal.sizeToContentWidth',
	'workbench.action.terminal.clearPreviousSessionHistory',
	'workbench.action.terminal.selectPrevSuggestion',
	'workbench.action.terminal.selectPrevPageSuggestion',
	'workbench.action.terminal.selectNextSuggestion',
	'workbench.action.terminal.selectNextPageSuggestion',
	'workbench.action.terminal.acceptSelectedSuggestion',
	'workbench.action.terminal.hideSuggestWidget',
	'workbench.action.terminal.copySelection',
	'workbench.action.terminal.copyAndClearSelection',
	'workbench.action.terminal.copySelectionAsHtml',
	'workbench.action.terminal.paste',
	'workbench.action.terminal.pasteSelection',
	'workbench.action.terminal.switchTerminal',
	'emptyTerminalNameInfo',
	'workbench.action.terminal.newWithProfile',
	'workbench.action.terminal.newWithProfile.profileName',
	'workbench.action.terminal.newWorkspacePlaceholder',
	'workbench.action.terminal.overriddenCwdDescription',
	'workbench.action.terminal.newWorkspacePlaceholder',
	'workbench.action.terminal.rename.prompt'
]);