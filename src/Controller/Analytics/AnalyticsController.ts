import { Request, Response } from "express";
import { asyncHandler, ApiResponse } from "../../Utils/ErrorHandling";
import {
  getOverview,
  getTopPages,
  getTrafficSources,
} from "../../Service/Analytics/AnalyticsService";

// GA4 accepts both ISO dates ("2026-01-31") and relative keywords
// ("7daysAgo", "today"). We default to the last 7 days when the caller omits
// the range, matching the dashboard's default view.
const resolveRange = (req: Request) => {
  const startDate = (req.query.startDate as string) || "7daysAgo";
  const endDate = (req.query.endDate as string) || "today";
  return { startDate, endDate };
};

// Each endpoint wraps the GA call in try/catch and returns 500 with the GA
// error message on failure (network/auth/quota), as required — rather than
// letting it fall through to the generic global handler.
export const getOverviewController = asyncHandler(
  async (req: Request, res: Response) => {
    const { startDate, endDate } = resolveRange(req);
    try {
      const data = await getOverview(startDate, endDate);
      return res.json(new ApiResponse(200, { startDate, endDate, rows: data }));
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch GA4 overview",
        error: error?.message || String(error),
      });
    }
  }
);

export const getTopPagesController = asyncHandler(
  async (req: Request, res: Response) => {
    const { startDate, endDate } = resolveRange(req);
    try {
      const data = await getTopPages(startDate, endDate);
      return res.json(new ApiResponse(200, { startDate, endDate, rows: data }));
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch GA4 top pages",
        error: error?.message || String(error),
      });
    }
  }
);

export const getTrafficSourcesController = asyncHandler(
  async (req: Request, res: Response) => {
    const { startDate, endDate } = resolveRange(req);
    try {
      const data = await getTrafficSources(startDate, endDate);
      return res.json(new ApiResponse(200, { startDate, endDate, rows: data }));
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch GA4 traffic sources",
        error: error?.message || String(error),
      });
    }
  }
);
