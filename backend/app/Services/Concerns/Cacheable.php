<?php

namespace App\Services\Concerns;

use Illuminate\Cache\Repository;
use Illuminate\Cache\TaggableStore;
use Illuminate\Cache\TaggedCache;
use Illuminate\Support\Facades\Cache;

trait Cacheable
{
    /**
     * @param  list<string>  $tags
     */
    private function cache(array $tags): Repository|TaggedCache
    {
        $cache = Cache::store();

        if ($cache->getStore() instanceof TaggableStore) {
            return $cache->tags($tags);
        }

        return $cache;
    }
}
