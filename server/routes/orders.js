const { Orders } = require('../models/orders');
const express = require('express');
const router = express.Router();

router.get(`/sales`, async (req, res) => {
    try{
        const ordersList = await Orders.find();

        let totalSales = 0;
        let monthlySales = [
            {
                month:'JAN',
                sale:0
            },
            {
                month:'FEB',
                sale:0
            },
            {
                month:'MAR',
                sale:0
            },
            {
                month:'APRIL',
                sale:0
            },
            {
                month:'MAY',
                sale:0
            },
            {
                month:'JUNE',
                sale:0
            },
            {
                month:'JULY',
                sale:0
            },
            {
                month:'AUG',
                sale:0
            },
            {
                month:'SEP',
                sale:0
            },
            {
                month:'OCT',
                sale:0
            },
            {
                month:'NOV',
                sale:0
            },
            {
                month:'DEC',
                sale:0
            },
        ]

        const currentYear = new Date().getFullYear();

        for(let i=0; i<ordersList.length; i++){
            totalSales = totalSales+parseInt(ordersList[i].amount);
            const str = JSON.stringify(ordersList[i]?.date);
            const monthStr = str.substr(6,8);
            const month = parseInt(monthStr.substr(0,2));

            let amt = parseInt(ordersList[i].amount);

          

            if(month===1){
                monthlySales[0] = {
                    month:'JAN',
                    sale:monthlySales[0].sale = parseInt(monthlySales[0].sale) + parseInt(ordersList[i].amount)
                }
            }

            if(month===2){
         
                monthlySales[1] = {
                    month:'FEB',
                    sale:monthlySales[1].sale = parseInt(monthlySales[1].sale) + parseInt(ordersList[i].amount)
                }
            }

            if(month===3){
                monthlySales[2] = {
                    month:'MAR',
                    sale:monthlySales[2].sale = parseInt(monthlySales[2].sale) + parseInt(ordersList[i].amount)
                }
            }

            if(month===4){
                monthlySales[3] = {
                    month:'APRIL',
                    sale:monthlySales[3].sale = parseInt(monthlySales[3].sale) + parseInt(ordersList[i].amount)
                }
            }

            if(month===5){
                monthlySales[4] = {
                    month:'MAY',
                    sale:monthlySales[4].sale = parseInt(monthlySales[4].sale) + parseInt(ordersList[i].amount)
                }
            }

            if(month===6){
                monthlySales[5] = {
                    month:'JUNE',
                    sale:monthlySales[5].sale = parseInt(monthlySales[5].sale) + parseInt(ordersList[i].amount)
                }
            }

            if(month===7){
                monthlySales[6] = {
                    month:'JULY',
                    sale:monthlySales[6].sale = parseInt(monthlySales[6].sale) + parseInt(ordersList[i].amount)
                }
            }

            if(month===8){
                monthlySales[7] = {
                    month:'AUG',
                    sale:monthlySales[7].sale = parseInt(monthlySales[7].sale) + parseInt(ordersList[i].amount)
                }
            }

            if(month===9){
                monthlySales[8] = {
                    month:'SEP',
                    sale:monthlySales[8].sale = parseInt(monthlySales[8].sale) + parseInt(ordersList[i].amount)
                }
            }

            if(month===10){
                monthlySales[9] = {
                    month:'OCT',
                    sale:monthlySales[9].sale = parseInt(monthlySales[9].sale) + parseInt(ordersList[i].amount)
                }
            }

            if(month===11){
                monthlySales[10] = {
                    month:'NOV',
                    sale:monthlySales[10].sale = parseInt(monthlySales[10].sale) + parseInt(ordersList[i].amount)
                }
            }

            if(month===12){
                monthlySales[11] = {
                    month:'DEC',
                    sale:monthlySales[11].sale = parseInt(monthlySales[11].sale) + parseInt(ordersList[i].amount)
                }
            }

          
          //  console.log(monthDtr.substr(0,2));
           // console.log(currentYear)
         
        }

  

        return res.status(200).json({
            totalSales:totalSales,
            monthlySales:monthlySales
        })

    }catch(error){
        console.log(error);
    }
})

router.get(`/`, async (req, res) => {

    try {
    

        const ordersList = await Orders.find(req.query)


        if (!ordersList) {
            res.status(500).json({ success: false })
        }

        return res.status(200).json(ordersList);

    } catch (error) {
        res.status(500).json({ success: false })
    }


});


router.get('/:id', async (req, res) => {

    const order = await Orders.findById(req.params.id);

    if (!order) {
        res.status(500).json({ message: 'The order with the given ID was not found.' })
    }
    return res.status(200).send(order);
})

router.get(`/get/count`, async (req, res) =>{
    const orderCount = await Orders.countDocuments()

    if(!orderCount) {
        res.status(500).json({success: false})
    } else{
        res.send({
            orderCount: orderCount
        });
    }
   
})



router.post('/create', async (req, res) => {

    let order = new Orders({
        name: req.body.name,
        phoneNumber: req.body.phoneNumber,
        address: req.body.address,
        pincode: req.body.pincode,
        amount: req.body.amount,
        paymentId: req.body.paymentId,
        email: req.body.email,
        userid: req.body.userid,
        products: req.body.products,
        date:req.body.date
    });

    let order1 = {
        name: req.body.name,
        phoneNumber: req.body.phoneNumber,
        address: req.body.address,
        pincode: req.body.pincode,
        amount: req.body.amount,
        paymentId: req.body.paymentId,
        email: req.body.email,
        userid: req.body.userid,
        products: req.body.products,
        date:req.body.date
    };

    console.log(order1)



    if (!order) {
        res.status(500).json({
            error: err,
            success: false
        })
    }


    order = await order.save();


    res.status(201).json(order);

});


router.delete('/:id', async (req, res) => {

    const deletedOrder = await Orders.findByIdAndDelete(req.params.id);

    if (!deletedOrder) {
        res.status(404).json({
            message: 'Order not found!',
            success: false
        })
    }

    res.status(200).json({
        success: true,
        message: 'Order Deleted!'
    })
});


router.put('/:id', async (req, res) => {

    const order = await Orders.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            phoneNumber: req.body.phoneNumber,
            address: req.body.address,
            pincode: req.body.pincode,
            amount: req.body.amount,
            paymentId: req.body.paymentId,
            email: req.body.email,
            userid: req.body.userid,
            products: req.body.products,
            status:req.body.status
        },
        { new: true }
    )



    if (!order) {
        return res.status(500).json({
            message: 'Order cannot be updated!',
            success: false
        })
    }

    res.send(order);

})



module.exports = router;

