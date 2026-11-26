# Apna Mart MCP & Storefront Setup Guide

Complete instructions for connecting any AI client to the live Apna Mart MCP server or running the full stack (Backend, MCP, and React Storefront) locally.

---

## 1. Connect to the Live Hosted MCP Server (No Local Setup Needed)

Anyone can connect directly to the deployed MCP server over SSE without cloning the repo or configuring a database or API key.

- **Live MCP Streamable HTTP Endpoint:** `https://mcp-apnamart.onrender.com/mcp`
- **Health Check:** `https://mcp-apnamart.onrender.com/health`

### Option A: Cursor, Windsurf, Antigravity, Gemini CLI (Streamable HTTP)

Use this configuration:

```json
{
  "mcpServers": {
    "apna-mart": {
      "url": "https://mcp-apnamart.onrender.com/mcp"
    }
  }
}
```

Where to paste it:
- **Cursor**: **Settings -> Cursor Settings -> MCP -> Add new global MCP server**
  - Windows: `C:\Users\<username>\.cursor\mcp.json`
  - macOS / Linux: `~/.cursor/mcp.json`
- **Windsurf**:
  - Windows: `C:\Users\<username>\.codeium\windsurf\mcp_config.json`
  - macOS / Linux: `~/.codeium/windsurf/mcp_config.json`
- **Antigravity**: **Agent panel -> `...` -> MCP Servers -> Manage MCP Servers -> View raw config** (`mcp_config.json`)
- **Gemini CLI**:
  - Windows: `C:\Users\<username>\.gemini\settings.json`
  - macOS / Linux: `~/.gemini/settings.json`

### Option B: Claude Desktop (via `mcp-remote`)

Use this configuration (requires Node.js installed on the client machine):

```json
{
  "mcpServers": {
    "apna-mart": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://mcp-apnamart.onrender.com/mcp"
      ]
    }
  }
}
```

Where to paste it:
- Open Claude Desktop -> **Settings -> Developer -> Edit config**
- Or edit the file directly:
  - Windows (Standard installer): `%APPDATA%\Claude\claude_desktop_config.json`
  - Windows (Microsoft Store app): `%LOCALAPPDATA%\Claude-Data\claude_pzs8sxrjxfjjc\claude_desktop_config.json`
  - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

After saving, fully quit Claude Desktop (right-click the system tray icon -> **Quit**) and reopen it. Start a **New Chat** so the fresh tool list loads.

### Option C: MCP Inspector (Browser Testing)

Run from any terminal with Node.js:

```bash
npx @modelcontextprotocol/inspector https://mcp-apnamart.onrender.com/mcp
```

---

## 2. How to Test the MCP Server

Once `apna-mart` is connected in a new chat, try these queries in order:

1. **Check Delivery Serviceability & Stores**:
   > Check if Apna Mart delivers to pincode 834001 and list all active stores.

2. **Search, Filter & Sort Products**:
   > List all grocery categories, then search for products under ₹150 sorted by highest discount.

3. **Add Items & Review Cart**:
   > Add 2 units of `prod_atta_001` and 1 unit of `prod_oil_004` to cart `my_demo_cart` and show the cart summary.
   *(Using a custom `cartId` isolates your cart when sharing the public server.)*

4. **Place Order (Two-Step Review & Confirmation)**:
   > Place a Cash on Delivery order from cart `my_demo_cart` for Aman Sharma, phone 9876543210, at Kanke Road, Ranchi, pincode 834001.
   - `place_order` first returns a review payload (`status: "REVIEW_REQUIRED"`).
   - Reply *"Yes, confirm and place the order"* to trigger `confirmed: true`.

5. **Track Order**:
   > Track the order you just placed, or track sample order `ord_apm_1001`.

6. **MCP Prompts** (available under `+ -> Add from apna-mart` in Claude Desktop):
   - `plan_weekly_groceries` (e.g. `budget: "1000"`, `householdSize: "4"`)
   - `check_pincode_and_order` (e.g. `pincode: "831001"`)
   - `reorder_essentials` (e.g. `orderId: "ord_apm_1001"`)

---

## 3. Run Locally from Source

### Prerequisites
- Node.js v20+ (tested on v22.14.0)
- A PostgreSQL connection string (e.g. Neon PostgreSQL)

### Backend + MCP Setup (`backend/`)

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
DATABASE_URL='postgresql://<user>:<password>@<host>/<db>?sslmode=require'
PORT=4000
NODE_ENV=development
LOG_LEVEL=info
MCP_SERVER_NAME=apna-mart-mcp
MCP_SERVER_VERSION=1.0.0
```

Push the Prisma schema and seed initial products, stores, and sample orders:

```bash
npm run db:push
npm run db:seed
```

Run tests:

```bash
npm test
```

Start the Backend REST API + MCP SSE server (`http://localhost:4000`):

```bash
npm run start:api
```

Or run the local MCP Stdio server directly (for local Claude Desktop / Cursor configs):

```bash
npm run start:mcp
```

Local Stdio config snippet:

```json
{
  "mcpServers": {
    "apna-mart": {
      "command": "node",
      "args": ["c:/Users/aryan/Desktop/apnamart/backend/src/mcpStdio.js"]
    }
  }
}
```

### Frontend Storefront Setup (`frontend/`)

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` and `/health` to `http://localhost:4000`.

---

## 4. Production Deployment Notes

- **Backend (Render)**:
  - **Root Directory**: `backend`
  - **Build Command**: `npm install && npm run build` (`prisma generate`)
  - **Start Command**: `npm start`
  - **Environment Variables**: `DATABASE_URL`
  - `backend/.npmrc` sets `legacy-peer-deps=true` for `@modelcontextprotocol/ext-apps` compatibility.
- **Frontend (Vercel)**:
  - **Root Directory**: `frontend`
  - `frontend/vercel.json` rewrites `/api/*` and `/health` directly to `https://mcp-apnamart.onrender.com`.
