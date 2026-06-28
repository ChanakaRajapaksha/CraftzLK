const myListService = require('../services/myListService');

class MyListController {
  async list(req, res) {
    try {
      const myList = await myListService.list(req.query);

      if (!myList) {
        res.status(500).json({ success: false });
      }

      return res.status(200).json(myList);
    } catch {
      res.status(500).json({ success: false });
    }
  }

  async add(req, res) {
    const item = await myListService.findExisting(req.body.productId, req.body.userId);

    if (item.length === 0) {
      const list = await myListService.add(req.body);
      res.status(201).json(list);
    } else {
      res.status(401).json({ status: false, msg: 'Product already added in the My List' });
    }
  }

  async remove(req, res) {
    const item = await myListService.findById(req.params.id);

    if (!item) {
      res.status(404).json({ msg: 'The item given id is not found!' });
    }

    const deletedItem = await myListService.deleteById(req.params.id);

    if (!deletedItem) {
      res.status(404).json({
        message: 'item not found!',
        success: false,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Item Deleted!',
    });
  }

  async getById(req, res) {
    const item = await myListService.findById(req.params.id);

    if (!item) {
      res.status(500).json({ message: 'The item with the given ID was not found.' });
    }
    return res.status(200).send(item);
  }
}

module.exports = new MyListController();
