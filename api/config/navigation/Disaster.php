<?php

return [
    'id' => 'disaster',
    'title' => 'Disaster',
    'type' => 'collapsible',
    'icon' => 'heroicons:shield-exclamation',
    'parent' => null,
    'permission' => null,
    'children' => [
            ['id' => 'disaster-list', 'title' => 'Disaster List', 'parent' => 'disaster', 'type' => 'item',  'route' => '/disaster-list', 'permission' => "disaster.view"],
            ['id' => 'disaster-actions', 'title' => 'Disaster Actions', 'parent' => 'disaster', 'type' => 'item',  'route' => '/disaster-actions', 'permission' => "disaster.view" ],
    ],
];
