<?php

return [
    'id' => 'residence',
    'title' => 'Residence',
    'type' => 'collapsible',
    'icon' => 'heroicons:home',
    'parent' => null,
    'permission' => null,
    'children' => [
        ['id' => 'resident-profile', 'title' => 'Resident Profile', 'type' => 'item', 'route' => '/admin/resident-profile', 'permission' => 'residence.view'],
        ['id' => 'zone', 'title' => 'Zone', 'type' => 'item', 'route' => '/admin/zone', 'permission' => 'zone.view'],
    ],
];
