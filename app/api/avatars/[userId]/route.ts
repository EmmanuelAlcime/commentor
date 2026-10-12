import { avatarResponse } from "@/features/profile/presentation/avatar-response";

export async function GET(_request: Request, { params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params;
    return avatarResponse(userId);
}
