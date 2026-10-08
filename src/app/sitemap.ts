import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/seo';

// Explicit public allowlist: never derive URLs from request hosts, auth routes or map queries.
export default function sitemap(): MetadataRoute.Sitemap {
    return ['/', '/about', '/contact', '/terms', '/privacy', '/map', '/bikerack', '/service', '/water']
        .map(path => ({ url: `${siteUrl}${path}` }));
}
