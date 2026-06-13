import { BetaAnalyticsDataClient } from "@google-analytics/data";
import dotenv from "dotenv";
dotenv.config();

const propertyId = process.env.GA_PROPERTY_ID;

// Resolve the service-account private key from env. Two accepted forms:
//   1. GA_PRIVATE_KEY_BASE64 — base64 of the raw PEM. PREFERRED in production
//      (Elastic Beanstalk): base64 has no backslashes/newlines/quotes, so it
//      survives the EB console injection untouched. The "\n"-escaped form gets
//      mangled by some EB platforms, which breaks PEM parsing
//      (error:1E08010C:DECODER routines::unsupported).
//   2. GA_PRIVATE_KEY — single line with literal "\n" escapes (what dotenv reads
//      from .env locally); we expand them back into real newlines here.
const resolvePrivateKey = (): string | undefined => {
  const b64 = process.env.GA_PRIVATE_KEY_BASE64;
  if (b64) return Buffer.from(b64, "base64").toString("utf8");
  return process.env.GA_PRIVATE_KEY?.replace(/\\n/g, "\n");
};

const analyticsClient = new BetaAnalyticsDataClient({
  credentials: {
    client_email: process.env.GA_CLIENT_EMAIL,
    private_key: resolvePrivateKey(),
  },
  projectId: process.env.GA_PROJECT_ID,
});

// GA4 reports are addressed as "properties/<id>". Centralized so a missing
// GA_PROPERTY_ID fails loudly with a clear message instead of a vague API error.
const property = (): string => {
  if (!propertyId) {
    throw new Error(
      "GA_PROPERTY_ID is not set. Add it to your .env (see .env.example)."
    );
  }
  return `properties/${propertyId}`;
};

export interface OverviewRow {
  date: string;
  activeUsers: number;
  sessions: number;
  screenPageViews: number;
  newUsers: number;
  averageSessionDuration: number;
}

export interface TopPageRow {
  pagePath: string;
  screenPageViews: number;
}

export interface TrafficSourceRow {
  source: string;
  sessions: number;
}

// Daily overview (grouped by date): the core KPIs the admin dashboard charts.
// Rows come back oldest-first (we sort by date ascending) so they plot cleanly.
export const getOverview = async (
  startDate: string,
  endDate: string
): Promise<OverviewRow[]> => {
  const [response] = await analyticsClient.runReport({
    property: property(),
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "date" }],
    metrics: [
      { name: "activeUsers" },
      { name: "sessions" },
      { name: "screenPageViews" },
      { name: "newUsers" },
      { name: "averageSessionDuration" },
    ],
    orderBys: [{ dimension: { dimensionName: "date" } }],
  });

  return (response.rows || []).map((row) => {
    const d = row.dimensionValues?.[0]?.value || "";
    const m = row.metricValues || [];
    return {
      // GA4 returns dates as "YYYYMMDD" — reshape to ISO "YYYY-MM-DD".
      date: d.length === 8 ? `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}` : d,
      activeUsers: Number(m[0]?.value || 0),
      sessions: Number(m[1]?.value || 0),
      screenPageViews: Number(m[2]?.value || 0),
      newUsers: Number(m[3]?.value || 0),
      averageSessionDuration: Number(m[4]?.value || 0),
    };
  });
};

// Most-visited pages over the range, busiest first.
export const getTopPages = async (
  startDate: string,
  endDate: string
): Promise<TopPageRow[]> => {
  const [response] = await analyticsClient.runReport({
    property: property(),
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "pagePath" }],
    metrics: [{ name: "screenPageViews" }],
    orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
    limit: 20,
  });

  return (response.rows || []).map((row) => ({
    pagePath: row.dimensionValues?.[0]?.value || "",
    screenPageViews: Number(row.metricValues?.[0]?.value || 0),
  }));
};

// Where sessions came from (sessionSource), largest first.
export const getTrafficSources = async (
  startDate: string,
  endDate: string
): Promise<TrafficSourceRow[]> => {
  const [response] = await analyticsClient.runReport({
    property: property(),
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "sessionSource" }],
    metrics: [{ name: "sessions" }],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    limit: 20,
  });

  return (response.rows || []).map((row) => ({
    source: row.dimensionValues?.[0]?.value || "",
    sessions: Number(row.metricValues?.[0]?.value || 0),
  }));
};
