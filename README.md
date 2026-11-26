# Apna Mart - Demo MCP & Dual REST API Backend

A cleanly architected Model Context Protocol (MCP) server and Express REST API for Apna Mart (https://apnamart.in/), the omnichannel retail grocery network powering everyday wholesale essentials across Tier-2 and Tier-3 cities in India.

For step-by-step instructions on connecting Claude Desktop, Cursor, Antigravity, Gemini CLI, or running the full stack locally, see [SETUP.md](./SETUP.md).

---

## Architecture and Separation of Concerns

The codebase strictly decouples responsibilities into distinct layers where business logic, error handling, and logging are centralized and shared across both MCP Tools and Express REST Routes:

```
backend/
├── package.json
├── .env                  # Neon PostgreSQL DATABASE_URL and server config
├── prisma/
│   ├── schema.prisma     # Prisma models for Product, Store, Cart, and Order
│   └── seed.js           # Seed script populating initial catalog and stores
├── test/
│   ├── apnamart.test.js  # Unit tests for Errors, Logger, Repositories, Services, MCP
│   └── http.test.js      # Integration tests for Express REST endpoints
└── src/
    ├── config/
    │   └── env.js        # Environment configuration and defaults
    ├── db/
    │   └── prisma.js     # PrismaClient singleton instance
    ├── errors/           # Centralized operational Error class hierarchy
    │   ├── AppError.js        # Base operational error with HTTP status codes & metadata
    │   ├── BadRequestError.js # 400 Bad Request
    │   ├── NotFoundError.js   # 404 Resource Not Found
    │   ├── ValidationError.js # 422 Unprocessable Content
    │   ├── ConflictError.js   # 409 Conflict
    │   └── index.js
    ├── logger/
    │   └── Logger.js     # Structured Logger class with level filtering and context tags
    ├── repositories/     # Database Access Layer powered by Prisma ORM
    │   ├── ProductRepository.js # Product catalog and stock reservation via prisma.product
    │   ├── StoreRepository.js   # Store hubs and pincode index via prisma.store
    │   ├── CartRepository.js    # Persistent cart storage and totals via prisma.cart
    │   ├── OrderRepository.js   # Placed orders and phone lookup via prisma.order
    │   └── index.js             # Singleton instances & exports
    ├── services/         # Pure Business Logic Layer (classes with DI, logger & errors)
    │   ├── ProductService.js    # Catalog search, category listing, stock reservation
    │   ├── StoreService.js      # Pincode serviceability & store lookup
    │   ├── CartService.js       # Cart calculation, discounts, quantity checks
    │   ├── OrderService.js      # Order placement, pincode validation, stock deduction
    │   └── index.js             # Singleton instances with DI
    ├── controllers/      # HTTP Request/Response Handlers (Express)
    │   ├── ProductController.js
    │   ├── StoreController.js
    │   ├── CartController.js
    │   ├── OrderController.js
    │   └── index.js
    ├── routes/           # Express Router definitions
    │   ├── productRoutes.js
    │   ├── storeRoutes.js
    │   ├── cartRoutes.js
    │   ├── orderRoutes.js
    │   └── index.js
    ├── middlewares/      # Express Middlewares
    │   ├── errorHandler.js      # Centralized error handler capturing AppError
    │   └── requestLogger.js     # HTTP request audit log
    ├── mcp/              # Model Context Protocol (MCP) Layer
    │   ├── prompts/
    │   │   └── groceryPrompts.js # plan_weekly_groceries, check_pincode_and_order, reorder_essentials
    │   ├── tools/
    │   │   ├── productTools.js  # search_products, get_product_details, list_categories
    │   │   ├── storeTools.js    # check_delivery_serviceability, list_stores
    │   │   ├── cartTools.js     # manage_cart (view, add, remove, clear)
    │   │   └── orderTools.js    # place_order, track_order
    │   ├── mcpServer.js         # McpServer initialization, tools & resources registration
    │   └── index.js
    ├── app.js            # Express app factory with middleware pipeline
    ├── server.js         # Dual HTTP server (REST API + SSE MCP endpoint)
    ├── mcpStdio.js       # MCP Stdio transport runner (for AI desktop agents)
    └── index.js          # Default entry point
```

---

## Database (Neon PostgreSQL with Prisma ORM)

The database schema is defined in `prisma/schema.prisma` and connected to Neon Serverless PostgreSQL.

### Models
- `Product`: Catalogs, pricing, units, stock quantities, and availability.
- `Store`: Physical store locations, operating hours, and serviceable Indian pincodes.
- `Cart`: Persistent shopping carts by user/session identifier.
- `Order`: Confirmed orders, delivery addresses, line items, and fulfillment statuses.

### Database Commands
```bash
# Push schema updates to Neon PostgreSQL
npm run db:push

# Seed the initial catalog, stores, and sample orders
npm run db:seed
```

---

## MCP Tools and Capabilities

Every MCP tool validates inputs with Zod and delegates directly to the Service layer, guaranteeing identical business rules and validation across both AI tool calls and HTTP endpoints.

| MCP Tool | Description | Parameters |
| :--- | :--- | :--- |
| `search_products` | Search Apna Mart grocery and household items with filtering, sorting, pagination, and facets | `query`, `category`, `brand`, `minPrice`, `maxPrice`, `inStockOnly`, `sortBy`, `page`, `limit` |
| `get_product_details` | Retrieve pricing (MRP vs Apna Mart price), unit weight, savings, and stock | `productId` |
| `list_categories` | List all grocery, staples, FMCG categories | *(none)* |
| `check_delivery_serviceability` | Check if a 6-digit Indian PIN code has quick delivery coverage and find nearest supermart | `pincode` (e.g. `834001`) |
| `list_stores` | List physical Apna Mart neighborhood supermarts across Tier-2/3 cities | `city` *(optional)* |
| `manage_cart` | View cart, add products with stock validation, remove items, or clear cart | `action` (`view`, `add`, `remove`, `clear`), `cartId`, `productId`, `quantity` |
| `place_order` | Place quick-delivery grocery order from cart items (validates address, pincode coverage, and updates stock) | `customerName`, `customerPhone`, `deliveryAddress`, `pincode`, `paymentMethod`, `cartId` |
| `track_order` | Real-time tracking of order status (`CONFIRMED`, `PACKING`, `OUT_FOR_DELIVERY`, `DELIVERED`) | `orderId` |

### MCP Resources
- `apnamart://products/categories`: JSON list of all product categories.
- `apnamart://stores`: JSON list of all active physical supermarts and their serviceable postal codes.

### MCP Prompts
- `plan_weekly_groceries`: Guided weekly basket recommendation tailored to budget, household size, and preferences.
- `check_pincode_and_order`: Guided flow to verify pincode delivery coverage before taking a shopping list and placing an order.
- `reorder_essentials`: Looks up a previous order, verifies item availability, and assists with adding items back to the cart.

---

## Running the Project

### 1. Run Tests
Verify all architectural layers (errors, logger, repositories, services, controllers, HTTP routes, and MCP tools):
```bash
npm test
```

### 2. Start the Dual Server (REST API + SSE MCP)
```bash
npm run start:api
# Or
npm start
```
- REST Health Check: `http://localhost:4000/health`
- Product Search API: `http://localhost:4000/api/v1/products/search?q=atta`
- Store Serviceability API: `http://localhost:4000/api/v1/stores/serviceability/834001`
- MCP Streamable HTTP Endpoint: `http://localhost:4000/mcp`

### 3. Run MCP in Stdio Mode (for AI Assistants & IDEs)
```bash
npm run start:mcp
```

---

## Connecting to Claude Desktop / Cursor / Antigravity

Add the following to your MCP client configuration (e.g. `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "apna-mart": {
      "command": "node",
      "args": [
        "c:/Users/aryan/Desktop/apnamart/backend/src/mcpStdio.js"
      ]
    }
  }
}
```
