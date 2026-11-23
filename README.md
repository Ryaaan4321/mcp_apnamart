# Apna Mart - Demo MCP & Dual REST API Backend

A production-grade, cleanly architected Model Context Protocol (MCP) server and Express REST API for **Apna Mart** ([https://apnamart.in/](https://apnamart.in/)), the omnichannel retail grocery network powering everyday wholesale essentials across Tier-2 and Tier-3 cities in India.

---

## 🏗️ Clean Layered Architecture & Separation of Concerns

The codebase strictly decouples responsibilities into distinct layers where business logic, error handling, and logging are centralized and shared across both **MCP Tools** and **Express REST Routes**:

```
backend/
├── package.json
├── .env.example
├── README.md
├── test/
│   ├── apnamart.test.js      # Unit tests for Errors, Logger, Repositories, Services, MCP
│   └── http.test.js          # Integration tests for Express REST endpoints
└── src/
    ├── config/
    │   └── env.js            # Environment configuration & defaults
    ├── errors/               # Centralized operational Error class hierarchy
    │   ├── AppError.js        # Base operational error with HTTP status codes & metadata
    │   ├── BadRequestError.js # 400 Bad Request
    │   ├── NotFoundError.js   # 404 Resource Not Found
    │   ├── ValidationError.js # 422 Unprocessable Content
    │   ├── ConflictError.js   # 409 Conflict
    │   └── index.js
    ├── logger/
    │   └── Logger.js         # Structured Logger class with level filtering and context tags
    ├── repositories/         # Pure Data Access Layer (CRUD, indexing, in-memory DB)
    │   ├── BaseRepository.js    # Generic in-memory repository base class
    │   ├── ProductRepository.js # Product catalog & stock decrementing
    │   ├── StoreRepository.js   # Store hubs & pincode index
    │   ├── CartRepository.js    # Session-based cart storage & total computations
    │   ├── OrderRepository.js   # Placed orders & phone lookup
    │   └── index.js             # Singleton instances & exports
    ├── services/             # Pure Business Logic Layer (classes with DI, logger & errors)
    │   ├── ProductService.js    # Catalog search, category listing, stock reservation
    │   ├── StoreService.js      # Pincode serviceability & store lookup
    │   ├── CartService.js       # Cart calculation, discounts, quantity checks
    │   ├── OrderService.js      # Order placement, pincode validation, stock deduction
    │   └── index.js             # Singleton instances with DI
    ├── controllers/          # HTTP Request/Response Handlers (Express)
    │   ├── ProductController.js
    │   ├── StoreController.js
    │   ├── CartController.js
    │   ├── OrderController.js
    │   └── index.js
    ├── routes/               # Express Router definitions
    │   ├── productRoutes.js
    │   ├── storeRoutes.js
    │   ├── cartRoutes.js
    │   ├── orderRoutes.js
    │   └── index.js
    ├── middlewares/          # Express Middlewares
    │   ├── errorHandler.js      # Centralized error handler capturing AppError
    │   └── requestLogger.js     # HTTP request audit log
    ├── mcp/                  # Model Context Protocol (MCP) Layer
    │   ├── tools/
    │   │   ├── productTools.js  # search_products, get_product_details, list_categories
    │   │   ├── storeTools.js    # check_delivery_serviceability, list_stores
    │   │   ├── cartTools.js     # manage_cart (view, add, remove, clear)
    │   │   └── orderTools.js    # place_order, track_order
    │   ├── mcpServer.js         # McpServer initialization, tools & resources registration
    │   └── index.js
    ├── app.js                # Express app factory with middleware pipeline
    ├── server.js             # Dual HTTP server (REST API + SSE MCP endpoint)
    ├── mcpStdio.js           # MCP Stdio transport runner (for AI desktop agents)
    └── index.js              # Default entry point
```

---

## 🛠️ MCP Tools & Capabilities

Every MCP tool validates inputs with **Zod** and delegates directly to the **Service** layer, guaranteeing identical business rules and validation across both AI tool calls and HTTP endpoints.

| MCP Tool | Description | Parameters |
| :--- | :--- | :--- |
| `search_products` | Search Apna Mart grocery and household items by keyword, category, price range, stock status | `query`, `category`, `minPrice`, `maxPrice`, `inStockOnly` |
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

---

## 🚀 Running the Project

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
- **REST Health Check:** `http://localhost:4000/health`
- **Product Search API:** `http://localhost:4000/api/v1/products/search?q=atta`
- **Store Serviceability API:** `http://localhost:4000/api/v1/stores/serviceability/834001`
- **MCP SSE Endpoint:** `http://localhost:4000/sse`

### 3. Run MCP in Stdio Mode (for AI Assistants & IDEs)
```bash
npm run start:mcp
```

---

## 🔌 Connecting to Claude Desktop / Cursor / Antigravity

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
