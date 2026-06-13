import { Router } from "express";
import {
  getOverviewController,
  getTopPagesController,
  getTrafficSourcesController,
} from "../../Controller/Analytics/AnalyticsController";

const AnalyticsRouter = Router();

// GA4 dashboard data (read-only). All accept ?startDate=&endDate= query params,
// defaulting to the last 7 days. Mounted under /analytics in app.ts.
AnalyticsRouter.get("/overview", getOverviewController);
AnalyticsRouter.get("/top-pages", getTopPagesController);
AnalyticsRouter.get("/traffic-sources", getTrafficSourcesController);

export default AnalyticsRouter;
