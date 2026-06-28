const searchService = require('../services/searchService');

class SearchController {
  async search(req, res) {
    try {
      const query = req.query.q;

      const page = parseInt(req.query.page) || 1;
      const perPage = parseInt(req.query.perPage);

      if (!query) {
        return res.status(400).json({ msg: 'Query is required' });
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
