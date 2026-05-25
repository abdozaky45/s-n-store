import jwt, { JwtPayload, TokenExpiredError, JsonWebTokenError, NotBeforeError } from 'jsonwebtoken';
import ErrorMessages from '../Error';

export enum TokenErrorCode {
  TOKEN_MISSING = 'AUTH_TOKEN_MISSING',
  TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED',
  TOKEN_INVALID = 'AUTH_TOKEN_INVALID',
  TOKEN_SIGNATURE_MISSING = 'AUTH_TOKEN_SIGNATURE_MISSING',
}

export class TokenError extends Error {
  code: TokenErrorCode;
  constructor(code: TokenErrorCode, message: string) {
    super(message);
    this.name = 'TokenError';
    this.code = code;
  }
}

interface TokenOptions {
  payload?: object;
  signature?: string;
}
interface VerifyTokenOptions {
  token: string;
  signature?: string;
}
export const generateAccessToken = ({
  payload = {},
  signature = process.env.TOKEN_SIGNATURE,
}: TokenOptions = {}): string => {
  const token = jwt.sign(payload, signature as string, {
     expiresIn: "7d"
  });
  return token;
};
export const generateRefreshToken = ({
  payload = {},
  signature = process.env.TOKEN_SIGNATURE,
}: TokenOptions = {}): string => {
  const token = jwt.sign(payload, signature as string, {
    expiresIn: '365d',
  });
  return token;
};
export const verifyToken = ({
  token,
  signature = process.env.TOKEN_SIGNATURE,
}: VerifyTokenOptions): JwtPayload | null => {
  if (!signature) {
    throw new TokenError(TokenErrorCode.TOKEN_SIGNATURE_MISSING, ErrorMessages.TOKEN_SIGNATURE_MISSING);
  }

  if (!token) {
    throw new TokenError(TokenErrorCode.TOKEN_MISSING, ErrorMessages.TOKEN_MISSING);
  }
  try {
    const decoded = jwt.verify(token, signature) as JwtPayload;
    return decoded;
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      throw new TokenError(TokenErrorCode.TOKEN_EXPIRED, ErrorMessages.TOKEN_EXPIRED);
    }
    if (error instanceof JsonWebTokenError || error instanceof NotBeforeError) {
      throw new TokenError(TokenErrorCode.TOKEN_INVALID, ErrorMessages.TOKEN_INVALID);
    }
    throw new TokenError(TokenErrorCode.TOKEN_INVALID, ErrorMessages.TOKEN_INVALID);
  }
};
