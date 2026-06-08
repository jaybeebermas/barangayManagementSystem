<?php

return [
    'id' => 'document-module',
    'title' => 'Document Module',
    'type' => 'collapsible',
    'icon' => 'heroicons:document',
    'parent' => null,
    'permission' => null,
    'children' => [
        ['id' => 'brgy-clearance', 'title' => 'Barangay Clearance', 'type' => 'item', 'route' => '/admin/barangay-clearance', 'permission' => 'clearance.view'],
        ['id' => 'blotter', 'title' => 'Blotter', 'type' => 'item', 'route' => '/admin/blotter', 'permission' => null],
    ],
];
