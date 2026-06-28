const compareListService = require('../services/compareListService');

class CompareListController {
  async list(req, res) {
    try {
      const compareList = await compareListService.list(req.query);
      if (!compareList) {
        return res.status(500).json({ success: false });
      }
      return res.status(200).json(compareList);
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async add(req, res) {
    try {
      const existingItem = await compareListService.findExisting(
        req.body.productId,
        req.body.userId
      );

      if (existingItem.length === 0) {
        const compareItem = await compareListService.add(req.body);
        return res.status(201).json(compareItem);
      }
      return res.status(401).json({ status: false, msg: 'Product already added in the Compare List' });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async remove(req, res) {
    try {
      const item = await compareListService.findById(req.params.id);
      if (!item) {
        return res.status(404).json({ msg: 'The item with the given ID is not found!' });
      }
      await compareListService.deleteById(req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Item Deleted!',
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const item = await compareListService.findById(req.params.id);
      if (!item) {
        return res.status(500).json({ message: 'The item with the given ID was not found.' });
      }
      return res.status(200).send(item);
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new CompareListController();
