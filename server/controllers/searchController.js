const searchService = require('../services/searchService');

class SearchController {
  async popular(req, res) {
    try {
      const limit = parseInt(req.query.limit, 10) || 8;
      const items = await searchService.getPopularSearches(limit);
      res.status(200).json({ items });
    } catch {
      res.status(500).json({ msg: 'Server error' });
    }
  }

  async search(req, res) {
    try {
      const query = req.query.q;

      const page = parseInt(req.query.page, 10) || 1;
      const perPage = parseInt(req.query.perPage, 10);

      if (!query) {
        return res.status(400).json({ msg: 'Query is required' });
      }

      if (req.query.limit !== undefined && req.query.limit !== '') {
        const limit = parseInt(req.query.limit, 10) || 5;
        const result = await searchService.searchPreview(query, limit);
        return res.status(200).json(result);
      }

      if (
        req.query.page !== '' &&
        req.query.page !== undefined &&
        req.query.perPage !== '' &&
        req.query.perPage !== undefined
      ) {
        const result = await searchService.searchWithPagination(query, page, perPage);

        return res.status(200).json({
          products: result.products,
          totalPages: result.totalPages,
          page: result.page,
          totalProducts: result.totalProducts,
        });
      }

      const items = await searchService.searchAll(query);
      res.json(items);
    } catch {
      res.status(500).json({ msg: 'Server error' });
    }
  }
}

module.exports = new SearchController();
