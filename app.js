const express = require('express');
const ejx = require('ejs');
const paypal = require('paypal-rest-sdk');
paypal.configure({
   'mode' : 'sandbox' , //sanbox or live
    'client_id':   
    'AYxjYRXLBXV1i838UalgjaSLpZjzHEul6-CbP5abX0YFnxJCb7tZe0qjLv2xmiq_O9q1L1bwf9WvfG-D',
   'client_secret':
   'EF5wpsoKXzeXEwAZMXs6r0GwrfgFO4FiUGMEFeyMwYKkEEawltUMnos45Fpl-XntfPEbzjTKXrtDRI2T'
});

const app = express();

app.set('view engine', 'ejs');

app.get('/', (req, res) => res.render('index'));
app.post('/pay', (req,res) => {
    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/success",
            "cancel_url": "http://localhost:3000/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "Dallas Cowboys Jersey",
                    "sku": "001",
                    "price": "25.00",
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": "25.00"
            },
            "description": "Jersey for the Best Team Ever."
        }]
    };
    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            for(let i =0; i < payment.links.length;i++){
                 if (payment.links[i].rel === 'approval_url') {
                     res.redirect(payment.links[i].href);
                     
                 }

            }
                   
        }
    });

});

app.get('/success', (req , res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const execute_payment_json = {
        "payer_id": payerId,
        "transaction": [{
            "amount" : {
                "currency" : "USD",
                "total" : "25.00"
            }
        }]
    };
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log(JSON.stringify(payment));
            res.send('Success');
        }
    });
});

app.get('/cancel', (req, res) => res.send('Cancelled'));

app.listen(3000, () => console.log('server Started on Port 3000 ...'));


