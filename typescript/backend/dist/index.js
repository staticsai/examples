"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const statics_1 = require("@staticsai/statics");
const https_proxy_agent_1 = require("https-proxy-agent");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const port = 8193;
app.use((0, cors_1.default)());
const targetUrl = 'https://example.com/';
const STATICS_APIKEY = 'sk_bumj7chpn5bw6padp8xwovgxk38uh8f9';
const APP_ID = 'app_a68xpdxqxmg9ty6gj4ii8';
let runScrape = true;
let link;
const statics = new statics_1.Statics({
    apikey: (_a = process.env["STATICS_APIKEY"]) !== null && _a !== void 0 ? _a : STATICS_APIKEY,
});
function startup() {
    return __awaiter(this, void 0, void 0, function* () {
        // link should be sent to the Statics frontend component and presented to your user for login
        link = yield statics.link.createLink({
            appId: APP_ID,
        });
        console.log("Link Created. Please go to frontend to log in.");
    });
}
function scrape(linkid) {
    return __awaiter(this, void 0, void 0, function* () {
        let status = yield statics.link.getLink(linkid);
        if (status.status === 'READY') {
            // Let's get a proxy and start surfing
            console.log("spot1");
            if (status.accountId) {
                runScrape = false;
                const proxy = yield statics.proxy.createProxy({
                    accountId: status.accountId,
                });
                console.log("spot2");
                const agent = new https_proxy_agent_1.HttpsProxyAgent(proxy.connectionString, {
                    rejectUnauthorized: false
                });
                // Dynamic import for node-fetch
                const fetch = (yield Promise.resolve().then(() => __importStar(require('node-fetch')))).default;
                const response = yield fetch(targetUrl, {
                    agent: agent,
                });
                console.log(response);
                console.log("Scrape complete through the proxy!");
            }
            else {
                console.log("The link is ready but the account is not connected");
            }
        }
    });
}
startup();
app.get("/link", (req, res) => {
    if (link) {
        res.json({
            linkid: link.id,
            linktoken: link.linkToken
        });
    }
    else {
        res.status(404).json({ error: "Link not created yet" });
    }
});
app.post("/complete/:linkID", (req, res) => {
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
app.get("/", (req, res) => {
    res.send("Hello");
});
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
