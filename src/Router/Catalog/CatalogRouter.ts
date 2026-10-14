import { Router } from "express";
import * as CatalogController from "../../Controller/Catalog/CatalogController";
const CatalogRouter = Router();
// Product catalog feed for Meta Commerce Manager / Google Merchant Center.
CatalogRouter.get("/feed.xml", CatalogController.getCatalogFeed);
export default CatalogRouter;
