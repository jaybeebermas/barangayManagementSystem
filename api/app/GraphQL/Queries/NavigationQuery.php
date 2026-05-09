<?php

namespace App\GraphQL\Queries;

use App\Models\Navigation;

class NavigationQuery
{
    public function navigation(): array
    {
        $items = Navigation::query()
            ->orderBy('parent_key')
            ->orderBy('sort_order')
            ->get()
            ->map(fn (Navigation $item) => [
                'id' => $item->key,
                'title' => $item->title,
                'type' => $item->type,
                'icon' => $item->icon,
                'route' => $item->route,
                'permission' => $item->permission,
                'parent' => $item->parent_key,
            ])
            ->all();

        return $this->buildTree($items, null, []);
    }

    /**
     * @param  array<int, array<string, mixed>>  $items
     * @return array<int, array<string, mixed>>
     */
    private function buildTree(array $items, ?string $parentId, array $path): array
    {
        $nodes = [];

        foreach ($items as $item) {
            $currentParent = $item['parent'] ?? null;
            if ($currentParent !== $parentId) {
                continue;
            }

            $id = (string) $item['id'];

            // Prevent infinite recursion if bad data introduces a parent cycle.
            if (in_array($id, $path, true)) {
                $item['children'] = [];
                $nodes[] = $item;
                continue;
            }

            $item['children'] = $this->buildTree($items, $id, [...$path, $id]);
            $nodes[] = $item;
        }

        return $nodes;
    }
}
