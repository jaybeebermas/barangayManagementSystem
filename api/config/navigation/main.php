<?php

return [
    [
        'id' => 'main-group',
        'title' => 'Main Navigation',
        'type' => 'group',
        'icon' => null,
        'route' => null,
        'permission' => null,
        'parent' => null,
        'children' => [
            [
                'id' => 'dashboard',
                'title' => 'Dashboard',
                'type' => 'item',
                'icon' => 'home',
                'route' => '/dashboard',
                'permission' => null,
                'parent' => 'main-group',
                'children' => [],
            ],
            [
                'id' => 'access-control',
                'title' => 'Access Control',
                'type' => 'collapsible',
                'icon' => 'shield',
                'route' => null,
                'permission' => null,
                'parent' => 'main-group',
                'children' => [
                    [
                        'id' => 'permissions',
                        'title' => 'Permissions',
                        'type' => 'item',
                        'icon' => 'key',
                        'route' => '/admin/permissions',
                        'permission' => 'permission.view',
                        'parent' => 'access-control',
                        'children' => [],
                    ],
                ],
            ],
        ],
    ],
];
