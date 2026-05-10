<?php

return [
    'id' => 'barangay',
    'title' => 'Barangay',
    'type' => 'collapsible',
    'icon' => 'heroicons:building-office-2',
    'parent' => 'main-group',
    'permission' => null,
    'children' => [
            ['id' => 'barangay-list', 'title' => 'List', 'parent' => 'barangay', 'type' => 'item',  'route' => '/barangay-list', 'permission' => "permission.view"],
            ['id' => 'barangay-actions', 'title' => 'Actions', 'parent' => 'barangay', 'type' => 'item',  'route' => '/barangay-actions', 'permission' => "permission.view" ],
    ],
];
