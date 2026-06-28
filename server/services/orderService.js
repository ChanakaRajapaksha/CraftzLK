const { Orders } = require('../models/orders');

class OrderService {
  async getSales() {
    const ordersList = await Orders.find();

    let totalSales = 0;
    let monthlySales = [
      { month: 'JAN', sale: 0 },
      { month: 'FEB', sale: 0 },
      { month: 'MAR', sale: 0 },
      { month: 'APRIL', sale: 0 },
      { month: 'MAY', sale: 0 },
      { month: 'JUNE', sale: 0 },
      { month: 'JULY', sale: 0 },
      { month: 'AUG', sale: 0 },
      { month: 'SEP', sale: 0 },
      { month: 'OCT', sale: 0 },
      { month: 'NOV', sale: 0 },
      { month: 'DEC', sale: 0 },
    ];

    for (let i = 0; i < ordersList.length; i++) {
      totalSales = totalSales + parseInt(ordersList[i].amount);
      const str = JSON.stringify(ordersList[i]?.date);
      const monthStr = str.substr(6, 8);
      const month = parseInt(monthStr.substr(0, 2));

      if (month === 1) {
        monthlySales[0] = {
          month: 'JAN',
          sale: (monthlySales[0].sale = parseInt(monthlySales[0].sale) + parseInt(ordersList[i].amount)),
        };
      }

      if (month === 2) {
        monthlySales[1] = {
          month: 'FEB',
          sale: (monthlySales[1].sale = parseInt(monthlySales[1].sale) + parseInt(ordersList[i].amount)),
        };
      }

      if (month === 3) {
        monthlySales[2] = {
          month: 'MAR',
          sale: (monthlySales[2].sale = parseInt(monthlySales[2].sale) + parseInt(ordersList[i].amount)),
        };
      }

      if (month === 4) {
        monthlySales[3] = {
          month: 'APRIL',
          sale: (monthlySales[3].sale = parseInt(monthlySales[3].sale) + parseInt(ordersList[i].amount)),
        };
      }

      if (month === 5) {
        monthlySales[4] = {
          month: 'MAY',
          sale: (monthlySales[4].sale = parseInt(monthlySales[4].sale) + parseInt(ordersList[i].amount)),
        };
      }

      if (month === 6) {
        monthlySales[5] = {
          month: 'JUNE',
          sale: (monthlySales[5].sale = parseInt(monthlySales[5].sale) + parseInt(ordersList[i].amount)),
        };
      }

      if (month === 7) {
        monthlySales[6] = {
          month: 'JULY',
          sale: (monthlySales[6].sale = parseInt(monthlySales[6].sale) + parseInt(ordersList[i].amount)),
        };
      }

      if (month === 8) {
        monthlySales[7] = {
          month: 'AUG',
          sale: (monthlySales[7].sale = parseInt(monthlySales[7].sale) + parseInt(ordersList[i].amount)),
        };
      }

      if (month === 9) {
        monthlySales[8] = {
          month: 'SEP',
          sale: (monthlySales[8].sale = parseInt(monthlySales[8].sale) + parseInt(ordersList[i].amount)),
        };
      }

      if (month === 10) {
        monthlySales[9] = {
          month: 'OCT',
          sale: (monthlySales[9].sale = parseInt(monthlySales[9].sale) + parseInt(ordersList[i].amount)),
        };
      }

      if (month === 11) {
        monthlySales[10] = {
          month: 'NOV',
          sale: (monthlySales[10].sale = parseInt(monthlySales[10].sale) + parseInt(ordersList[i].amount)),
        };
      }

      if (month === 12) {
        monthlySales[11] = {
          month: 'DEC',
          sale: (monthlySales[11].sale = parseInt(monthlySales[11].sale) + parseInt(ordersList[i].amount)),
        };
      }
    }

    return { totalSales, monthlySales };
  }

  async list(query) {
    return Orders.find(query);
  }

  async getById(id) {
    return Orders.findById(id);
  }

  async getCount() {
    return Orders.countDocuments();
  }

  async create(body) {
    let order = new Orders({
      name: body.name,
      phoneNumber: body.phoneNumber,
      address: body.address,
      pincode: body.pincode,
      amount: body.amount,
      paymentId: body.paymentId,
      email: body.email,
      userid: body.userid,
      products: body.products,
      date: body.date,
      paymentMethod: body.paymentMethod,
      subtotal: body.subtotal,
      shipping: body.shipping,
    });

    const order1 = {
      name: body.name,
      phoneNumber: body.phoneNumber,
      address: body.address,
      pincode: body.pincode,
      amount: body.amount,
      paymentId: body.paymentId,
      email: body.email,
      userid: body.userid,
      products: body.products,
      date: body.date,
    };

    console.log(order1);

    order = await order.save();
    return order;
  }

  async remove(id) {
    return Orders.findByIdAndDelete(id);
  }

  async update(id, body) {
    const order = await Orders.findById(id);

    if (!order) {
      const error = new Error('Order not found!');
      error.statusCode = 404;
      error.payload = { message: error.message, success: false };
      throw error;
    }

    const nextStatus = body.status ?? body.orderStatus ?? order.status;
    if (nextStatus && nextStatus !== order.status) {
      order.statusHistory = order.statusHistory || [];
      order.statusHistory.push({ status: nextStatus, date: new Date() });
      order.status = nextStatus;
    }

    if (body.paymentStatus !== undefined) order.paymentStatus = body.paymentStatus;
    if (body.name !== undefined) order.name = body.name;
    if (body.phoneNumber !== undefined) order.phoneNumber = body.phoneNumber;
    if (body.address !== undefined) order.address = body.address;
    if (body.pincode !== undefined) order.pincode = body.pincode;
    if (body.amount !== undefined) order.amount = body.amount;
    if (body.paymentId !== undefined) order.paymentId = body.paymentId;
    if (body.email !== undefined) order.email = body.email;
    if (body.userid !== undefined) order.userid = body.userid;
    if (body.products !== undefined) order.products = body.products;

    await order.save();
    return order;
  }
}

module.exports = new OrderService();
