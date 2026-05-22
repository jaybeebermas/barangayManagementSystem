<?php

return [
    'id' => 'settings',
    'title' => 'Settings',
    'type' => 'collapsible',
    'icon' => 'heroicons:cog-6-tooth',
    'parent' => null,
    'permission' => null,
    'children' => [
        ['id' => 'barangay', 'title' => 'Barangay information', 'type' => 'item', 'route' => '/settings/barangay', 'permission' => 'settings.view'],
    ],
];
