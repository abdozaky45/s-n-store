import { Request, Response } from "express";
import { asyncHandler, ApiResponse } from "../../Utils/ErrorHandling";
import {
  getClarityInsights,
  getRemainingLiveCalls,
  CLARITY_DIMENSIONS,
  ClarityDimension,
} from "../../Service/Analytics/ClarityService";

// Validate the optional ?dimension1= param against the whitelist so we never
// forward an arbitrary value to the upstream Clarity request. Unknown values
// are ignored (treated as "no breakdown") rather than rejected.
const resolveDimension = (req: Request): ClarityDimension | undefined => {
  const raw = (req.query.dimension1 as string) || "";
  return (CLARITY_DIMENSIONS as readonly string[]).includes(raw)
    ? (raw as ClarityDimension)
    : undefined;
};

// GET /analytics/clarity  (admin-only; mounted behind checkRole([ADMIN]))
//   ?dimension1=Browser|Device|Country|OS|Source|...   optional breakdown
//   ?refresh=true                                       force a live refresh
//
// Returns cached Clarity insights by default. Force-refresh is honoured only
// while the daily rate-limit budget has room; otherwise cached data is returned
// with `stale: true` and an explanatory note.
export const getClarityInsightsController = asyncHandler(
  async (req: Request, res: Response) => {
    const dimension1 = resolveDimension(req);
    const forceRefresh =
      req.query.refresh === "true" || req.query.forceRefresh === "true";

    try {
      const result = await getClarityInsights({ dimension1, forceRefresh });
      return res.json(
        new ApiResponse(
          200,
          {
            dimension1: dimension1 ?? null,
            fetchedAt: result.fetchedAt,
            fromCache: result.fromCache,
            stale: result.stale,
            liveCallsToday: result.liveCallsToday,
            remainingLiveCalls: getRemainingLiveCalls(),
            note: result.note,
            metrics: result.data,
          },
          result.stale ? "Serving cached Clarity data (not fresh)" : "Success"
        )
      );
    } catch (error: any) {
      // The service throws ApiError with a meaningful statusCode (401 invalid
      // token, 429 rate limit + no cache, 502 upstream/network). Surface it
      // without crashing the app.
      const statusCode = error?.statusCode || 500;
      return res.status(statusCode).json({
        success: false,
        message: "Failed to fetch Clarity insights",
        error: error?.message || String(error),
      });
    }
  }
);
