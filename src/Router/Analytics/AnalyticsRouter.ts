import { Router } from "express";
import {
  getOverviewController,
  getTopPagesController,
  getTrafficSourcesController,
} from "../../Controller/Analytics/AnalyticsController";
import { getClarityInsightsController } from "../../Controller/Analytics/ClarityController";

const AnalyticsRouter = Router();

// GA4 dashboard data (read-only). All accept ?startDate=&endDate= query params,
// defaulting to the last 7 days. Mounted under /analytics in app.ts.
AnalyticsRouter.get("/overview", getOverviewController);
AnalyticsRouter.get("/top-pages", getTopPagesController);
AnalyticsRouter.get("/traffic-sources", getTrafficSourcesController);

// Microsoft Clarity live-insights (heatmaps/session metrics). Cached in memory
// because Clarity's Data Export API is limited to 10 calls/project/day.
// ?dimension1=Browser|Device|Country|... optional breakdown; ?refresh=true
// forces a live refetch (still bounded by the daily budget).
AnalyticsRouter.get("/clarity", getClarityInsightsController);

export default AnalyticsRouter;
