const QRCode = require('qrcode');

async function generateQR(restaurantId, tableNumber) {
  const menuUrl = `${process.env.BASE_URL}/menu/${restaurantId}?table=${tableNumber}`;
  const qrDataUrl = await QRCode.toDataURL(menuUrl);
  return qrDataUrl;
}

module.exports = generateQR;

