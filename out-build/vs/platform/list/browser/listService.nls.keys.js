/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	'workbenchConfigurationTitle',
	'multiSelectModifier.ctrlCmd',
	'multiSelectModifier.alt',
	{
				key: 'multiSelectModifier',
				comment: [
					'- `ctrlCmd` refers to a value the setting can take and should not be localized.',
					'- `Control` and `Command` refer to the modifier keys Ctrl or Cmd on the keyboard and can be localized.'
				]
			},
	{
				key: 'openModeModifier',
				comment: ['`singleClick` and `doubleClick` refers to a value the setting can take and should not be localized.']
			},
	'horizontalScrolling setting',
	'list.scrollByPage',
	'tree indent setting',
	'render tree indent guides',
	'list smoothScrolling setting',
	'Mouse Wheel Scroll Sensitivity',
	'Fast Scroll Sensitivity',
	'defaultFindModeSettingKey.highlight',
	'defaultFindModeSettingKey.filter',
	'defaultFindModeSettingKey',
	'keyboardNavigationSettingKey.simple',
	'keyboardNavigationSettingKey.highlight',
	'keyboardNavigationSettingKey.filter',
	'keyboardNavigationSettingKey',
	'keyboardNavigationSettingKeyDeprecated',
	'defaultFindMatchTypeSettingKey.fuzzy',
	'defaultFindMatchTypeSettingKey.contiguous',
	'defaultFindMatchTypeSettingKey',
	'expand mode',
	'typeNavigationMode2'
]);