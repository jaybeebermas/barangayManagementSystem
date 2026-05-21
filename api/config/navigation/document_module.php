<?php

return [
    'id' => 'document-module',
    'title' => 'Document Module',
    'type' => 'collapsible',
    'icon' => 'heroicons:document',
    'parent' => null,
    'permission' => null,
    'children' => [
        ['id' => 'brgy-clearance', 'title' => 'Barangay Clearance', 'type' => 'item', 'route' => '/admin/clearance', 'permission' => 'clearance.view'],
    ],
];
