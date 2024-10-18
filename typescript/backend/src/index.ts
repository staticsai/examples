import express, { Express, Request, Response } from "express";
import { Statics } from "@staticsai/statics";
import { LinkDto } from "@staticsai/statics/models/components";
import { HttpsProxyAgent } from 'https-proxy-agent';
import cors from 'cors';

const app: Express = express();
const port = 8193;
app.use(cors());

const targetUrl = 'https://example.com/'
const STATICS_APIKEY = ''
const APP_ID = ''

let runScrape: boolean = true;
let link: LinkDto;

const statics = new Statics({
  apikey: STATICS_APIKEY,
});

async function startup() {
  // link should be sent to the Statics frontend component and presented to your user for login
  link = await statics.link.createLink({
    appId: APP_ID,
  });

  console.log("Link Created. Please go to frontend to log in.");
}

async function scrape(linkid: string) {
  let status = await statics.link.getLink(linkid);

  if (status.status === 'READY') {
    // Let's get a proxy and start surfing
    if (status.accountId) {
      runScrape = false;
      const proxy = await statics.proxy.createProxy({
        accountId: status.accountId!,
      });

      const agent = new HttpsProxyAgent(proxy.connectionString, {
        rejectUnauthorized: false
      });

      // Dynamic import for node-fetch
      const fetch = (await import('node-fetch')).default;
      
      const response = await fetch(targetUrl, { 
        agent: agent,
      });
      console.log(response);
      console.log("Scrape complete through the proxy!");
    } else {
      console.log("The link is ready but the account is not connected");
    }
  }
}

startup();

app.get("/link", (req: Request, res: Response) => {
  if (link) {
    res.json({
      linkid: link.id,
      linktoken: link.linkToken
    });
  } else {
    res.status(404).json({ error: "Link not created yet" });
  }
});

app.post("/complete/:linkID", (req: Request, res: Response) => {
  const linkID = req.params.linkID;
  res.status(200).json({ message: "Job completion recorded and next task triggered" });

  // Trigger scrape asynchronously
  setImmediate(() => {
    if (runScrape) {
      console.log(`[job-complete]: Frontend job completed for linkID: ${linkID}`);
      scrape(linkID);
    }
  });
});

app.get("/", (req: Request, res: Response) => {
  res.send("Hello");
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});



