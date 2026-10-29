import { campaignLinkResponse } from '@/lib/campaign-link-handler.mjs';

export const dynamic = 'force-dynamic';
export function GET(request: Request) {
    return campaignLinkResponse(request, {
        androidFingerprints: (process.env.ANDROID_APP_SIGNING_SHA256 ?? '').split(',').map(value => value.trim()).filter(Boolean),
    });
}
