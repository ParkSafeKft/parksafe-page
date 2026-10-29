import { campaignLinkResponse } from '@/lib/campaign-link-handler.mjs';

export function GET(request: Request) {
    return campaignLinkResponse(request);
}
