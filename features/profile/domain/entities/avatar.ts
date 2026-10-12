export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

export const AVATAR_CONTENT_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'] as const;
export type AvatarContentType = (typeof AVATAR_CONTENT_TYPES)[number];

export type AvatarImage = {
    userId: string;
    contentType: AvatarContentType;
    data: Uint8Array;
    updatedAt: Date;
};

const startsWith = (bytes: Uint8Array, signature: number[], offset = 0) =>
    bytes.length >= offset + signature.length && signature.every((byte, index) => bytes[offset + index] === byte);

// Reads the file signature rather than trusting the declared MIME type, so a renamed file is still rejected
export function detectImageType(bytes: Uint8Array): AvatarContentType | null {
    if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'image/png';
    if (startsWith(bytes, [0xff, 0xd8, 0xff])) return 'image/jpeg';
    if (startsWith(bytes, [0x47, 0x49, 0x46, 0x38]) && (bytes[4] === 0x37 || bytes[4] === 0x39) && bytes[5] === 0x61) return 'image/gif';
    // RIFF....WEBP
    if (startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) && startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)) return 'image/webp';
    return null;
}

// Versioned by the upload time so browsers can cache the picture forever and still see a new upload
export const avatarUrl = (userId: string, updatedAt: Date) => `/api/avatars/${encodeURIComponent(userId)}?v=${updatedAt.getTime()}`;
