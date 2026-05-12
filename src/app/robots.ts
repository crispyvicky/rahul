import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/dashboard', '/settings', '/onboarding', '/admin'],
        },
        sitemap: 'https://rahulfitzz.com/sitemap.xml',
    };
}
