const express = require ("express");
const app = express();
const axios = require('axios'); 
const CryptoJS = require('crypto-js'); 
const moment = require('moment'); 
const bodyParser = require('body-parser');

app.use(bodyParser.json());

// APP INFO, STK TEST(credit card) : 4111 1111 1111 1111, NGUYEN VAN A, 01/25, 123
const config = {
  app_id: '2554',
  key1: 'sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn',
  key2: 'trMrHtvjo6myautxDUiAcYsVtaeQ8nhf',
  endpoint: 'https://sb-openapi.zalopay.vn/v2/create',
  // key1: "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL",
  // key2: "kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz",
  // endpoint: "https://sb-openapi.zalopay.vn/v2/create"
};

/**
 * methed: POST
 * Sandbox	POST	https://sb-openapi.zalopay.vn/v2/create
 * Real	POST	https://openapi.zalopay.vn/v2/create
 * description: tạo đơn hàng, thanh toán
 */
app.post('/api/payment', async (req, res) => {
  const { order_id, amount, embed_data } = req.body;

  const transID = Math.floor(Math.random() * 1000000);

  const order = {
    app_id: config.app_id,
    app_trans_id: `${moment().format('YYMMDD')}_${transID}`, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
    app_user: 'user123',
    app_time: Date.now(), // miliseconds
    amount,
    //{ redirecturl: `http://127.0.0.1:5500/client/order/order.html?paymentStatus=success&id=${order_id}` }
    embed_data,
    item: "[]",
    callback_url: 'https://f356-113-190-91-135.ngrok-free.app/api/order/payment/callback',
    description: `Thanh toán cho đơn hàng #${order_id}`,
  };

  const data = `${config.app_id}|${order.app_trans_id}|${order.app_user}|${amount}|${order.app_time}|${order.embed_data}|${order.item}`;
  order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

  try {
    const result = await axios.post(config.endpoint, null, { params: order });
    console.log("Response from ZaloPay:", result.data);
    return res.json(result.data);
  } catch (error) {
    console.error("Error calling ZaloPay:", error.message);
    return res.status(500).json({ message: "Payment initiation failed" });
  }
});

/**
 * method: POST
 * description: callback để Zalopay Server call đến khi thanh toán thành công.
 * Khi và chỉ khi ZaloPay đã thu tiền khách hàng thành công thì mới gọi API này để thông báo kết quả.
 */
// app.post('/api/callback', async (req, res) => {
//   let result = {};
//   console.log(req.body);
//   try {
//     let dataStr = req.body.data;
//     let reqMac = req.body.mac;

//     let mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();
//     console.log('mac =', mac);

//     // kiểm tra callback hợp lệ (đến từ ZaloPay server)
//     if (reqMac !== mac) {
//       // callback không hợp lệ
//       result.return_code = -1;
//       result.return_message = 'mac not equal';
//     } else {
//       // thanh toán thành công
//       // merchant cập nhật trạng thái cho đơn hàng ở đây
//       let dataJson = JSON.parse(dataStr, config.key2);
//       console.log(
//         "update order's status = success where app_trans_id =",
//         dataJson['app_trans_id'],
//       );

//       result.return_code = 1;
//       result.return_message = 'success';
//     }
//   } catch (ex) {
//     console.log('lỗi:::' + ex.message);
//     result.return_code = 0; // ZaloPay server sẽ callback lại (tối đa 3 lần)
//     result.return_message = ex.message;
//   }
// });

app.listen(3006, () => {
  console.log('ZaloPay Service running on http://localhost:3006');
});
