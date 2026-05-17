<?php

return [
    'id' => 'settings',
    'title' => 'Settings',
    'type' => 'collapsible',
    'icon' => 'heroicons:cog-6-tooth',
    'parent' => null,
    'permission' => null,
    'children' => [
        ['id' => 'general', 'title' => 'General', 'type' => 'item', 'route' => '/settings/general', 'permission' => 'settings.view'],
    ],
];
