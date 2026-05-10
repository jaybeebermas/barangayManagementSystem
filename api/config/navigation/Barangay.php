<?php

return [
    'id' => 'disaster',
    'title' => 'Disaster',
    'type' => 'collapsible',
    'icon' => 'heroicons:shield-exclamation',
    'parent' => 'main-group',
    'permission' => null,
    'children' => [
            ['id' => 'disaster-list', 'title' => 'Disaster List', 'parent' => 'disaster', 'type' => 'item',  'route' => '/disaster-list', 'permission' => "permission.view"],
            ['id' => 'disaster-actions', 'title' => 'Disaster Actions', 'parent' => 'disaster', 'type' => 'item',  'route' => '/disaster-actions', 'permission' => "permission.view" ],
    ],
];
