import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            // Login and password pages stay crawlable so their noindex headers can be read.
            disallow: ['/admin', '/api/admin', '/api/private', '/profile', '/cart', '/checkout'],
        },
        sitemap: `${siteUrl}/sitemap.xml`,
    };
}
