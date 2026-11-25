export class ProductController {
  constructor(productService) {
    this.productService = productService;
  }

  searchProducts = async (req, res, next) => {
    try {
      const { q, category, brand, minPrice, maxPrice, inStockOnly, sortBy, page, limit } = req.query;
      const filters = {
        query: q,
        category,
        brand,
        minPrice: minPrice !== undefined ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice !== undefined ? parseFloat(maxPrice) : undefined,
        inStockOnly: inStockOnly === 'true',
        sortBy: sortBy || 'name_asc',
        page: page !== undefined ? parseInt(page, 10) : 1,
        limit: limit !== undefined ? parseInt(limit, 10) : 20
      };
      const result = await this.productService.searchProducts(filters);
      res.json({
        success: true,
        count: result.items.length,
        pagination: result.pagination,
        facets: result.facets,
        data: result.items
      });
    } catch (err) {
      next(err);
    }
  };

  getProductById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const product = await this.productService.getProductById(id);
      res.json({
        success: true,
        data: product
      });
    } catch (err) {
      next(err);
    }
  };

  getCategories = async (req, res, next) => {
    try {
      const categories = await this.productService.listCategories();
      res.json({
        success: true,
        count: categories.length,
        data: categories
      });
    } catch (err) {
      next(err);
    }
  };
}
