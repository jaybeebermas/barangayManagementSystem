<?php

$navigationFiles = glob(__DIR__ . '/navigation/*.php') ?: [];
sort($navigationFiles);

$navigation = [];

foreach ($navigationFiles as $navigationFile) {
    $section = require $navigationFile;

    if (is_array($section)) {
        $navigation = array_merge($navigation, $section);
    }
}

return $navigation;
