import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Breadcrumbs, type BreadcrumbItem } from '@/shared/presentation/components/ui/Breadcrumbs';

const render = (items: BreadcrumbItem[]) => renderToStaticMarkup(createElement(Breadcrumbs, { items }));

describe('Breadcrumbs', () => {
    it('renders nothing when there are no items', () => {
        expect(render([])).toBe('');
    });

    it('wraps the trail in a labelled nav with an ordered list', () => {
        const html = render([{ label: 'Home', href: '/' }, { label: 'My post' }]);

        expect(html).toMatch(/^<nav aria-label="Breadcrumb"/);
        expect(html.match(/<li/g)).toHaveLength(2);
    });

    it('links every item before the last', () => {
        const html = render([{ label: 'Home', href: '/' }, { label: 'Section', href: '/section' }, { label: 'My post' }]);

        expect(html).toMatch(/<a[^>]*href="\/"[^>]*>Home<\/a>/);
        expect(html).toMatch(/<a[^>]*href="\/section"[^>]*>Section<\/a>/);
    });

    it('marks the last item as the current page and never links it, even with an href', () => {
        const html = render([{ label: 'Home', href: '/' }, { label: 'My post', href: '/my-post' }]);

        expect(html).toMatch(/<span aria-current="page"[^>]*>My post<\/span>/);
        expect(html).not.toContain('href="/my-post"');
    });

    it('renders an earlier item without an href as plain text', () => {
        const html = render([{ label: 'Archive' }, { label: 'My post' }]);

        expect(html).toContain('<span>Archive</span>');
        expect(html).not.toContain('<a');
    });

    it('puts a separator between items but not before the first', () => {
        const html = render([{ label: 'Home', href: '/' }, { label: 'Section', href: '/section' }, { label: 'My post' }]);

        expect(html.match(/<svg/g)).toHaveLength(2);
        expect(html.indexOf('<svg')).toBeGreaterThan(html.indexOf('Home'));
    });
});
