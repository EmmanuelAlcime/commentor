// Only same-site paths are allowed, so a crafted link can't send users off-site after logging in
export function safeCallbackURL(value: unknown): string {
    if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) {
        return '/';
    }
    return value;
}
