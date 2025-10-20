import { Injectable } from "@nestjs/common";
import { EmailPurpose } from "../../interface/dto/auth-verification.dto";
import { createHash, randomBytes } from "crypto";
import { addHours, addMinutes } from "date-fns";

@Injectable()
export class TokenFactory {
  generate(purpose: EmailPurpose): { raw: string; tokenHash: Buffer; expiresAt: Date } {
    const raw = randomBytes(32).toString('base64url');
    const tokenHash = createHash('sha256').update(raw).digest();
    const expiresAt = purpose === EmailPurpose.REGISTER
      ? addHours(new Date(), 24)
      : addMinutes(new Date(), 15);
    return { raw, tokenHash, expiresAt };
  }

  buildVerifyUrl(base: string, raw: string, purpose: string): string {
    const url = new URL(base);
    url.searchParams.set('token', raw);
    url.searchParams.set('purpose', purpose);
    return url.toString();
  }

  hasher(raw: string): Buffer {
    return createHash('sha256').update(raw).digest(); 
  }
}
