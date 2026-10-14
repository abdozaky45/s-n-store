import { Request, Response } from "express";
import { asyncHandler } from "../../Utils/ErrorHandling";
import * as CatalogFeedService from "../../Service/Catalog/CatalogFeedService";

// GET /catalog/feed.xml  (public, no auth — fetched by Meta / Google crawlers)
export const getCatalogFeed = asyncHandler(
  async (_req: Request, res: Response) => {
    const { xml, itemCount, skipped } = await CatalogFeedService.getCatalogFeed();
    if (skipped > 0) {
      console.warn(`[catalog-feed] served ${itemCount} items, skipped ${skipped}`);
    }
    res.set("Cache-Control", "public, max-age=600");
    return res.status(200).type("application/xml").send(xml);
  }
);
