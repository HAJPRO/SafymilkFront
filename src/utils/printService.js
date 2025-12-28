/**
 * Mahsulot uchun professional pechat layoutini yaratadi va chop etadi
 * @param {Object} product - Mahsulot ob'ekti (name, code, qr, salePrice, category)
 */
export const printProductQR = (product) => {
  if (!product || !product.qr) {
    console.error("Pechat uchun mahsulot ma'lumotlari yoki QR kod yetarli emas!");
    return;
  }

  const printWindow = window.open('', '_blank', 'width=500,height=650');
  
  // Narxni so'm formatiga o'tkazish
  const formattedPrice = new Intl.NumberFormat('uz-UZ').format(product.salePrice || 0);

  const html = `
    <!DOCTYPE html>
    <html lang="uz">
      <head>
        <meta charset="UTF-8">
        <title>Label - ${product.name}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
          @page { size: auto; margin: 0mm; }
          
          body { 
            margin: 0; padding: 0;
            font-family: 'Inter', sans-serif;
            display: flex; justify-content: center; align-items: center;
            min-height: 100vh; background-color: #f1f5f9;
          }

          .label-wrapper {
            background: white; width: 350px; padding: 25px;
            border-radius: 20px; text-align: center;
            border: 1px solid #e2e8f0; position: relative;
          }

          .label-wrapper::before {
            content: ''; position: absolute; top: 0; left: 0; right: 0;
            height: 6px; background: #4f46e5; border-radius: 20px 20px 0 0;
          }

          .qr-container {
            padding: 10px; border: 1px solid #f1f5f9;
            border-radius: 12px; display: inline-block; margin-bottom: 15px;
          }

          img { width: 220px; height: 220px; display: block; }

          .product-name { 
            font-size: 20px; font-weight: 900; color: #0f172a;
            margin: 10px 0; text-transform: uppercase; line-height: 1.2;
          }

          .category-badge {
            display: inline-block; background: #f1f5f9; color: #64748b;
            font-size: 10px; font-weight: 700; padding: 3px 10px;
            border-radius: 99px; text-transform: uppercase;
          }

          .price-section {
            background: #4f46e5; color: white; padding: 12px;
            border-radius: 14px; margin-top: 15px;
          }

          .price-label { font-size: 9px; text-transform: uppercase; opacity: 0.8; font-weight: 700; }
          .price-value { font-size: 26px; font-weight: 900; }
          .price-currency { font-size: 12px; margin-left: 3px; }

          .footer-code {
            margin-top: 15px; padding-top: 12px;
            border-top: 1px dashed #e2e8f0;
            font-family: monospace; font-size: 16px;
            color: #1e293b; font-weight: 700; letter-spacing: 4px;
          }

          @media print {
            body { background: white; }
            .label-wrapper { box-shadow: none; border: none; width: 100%; }
            .label-wrapper::before { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="label-wrapper">
          <div class="qr-container">
            <img src="${product.qr}" alt="QR" />
          </div>
          <div class="category-badge">${product.category || 'Mahsulot'}</div>
          <div class="product-name">${product.name}</div>
          <div class="price-section">
            <div class="price-label">Sotuv Narxi</div>
            <div class="price-value">${formattedPrice}<span class="price-currency">UZS</span></div>
          </div>
          <div class="footer-code">${product.code}</div>
        </div>
        <script>
          window.onload = () => {
            setTimeout(() => {
              window.print();
              window.onafterprint = () => window.close();
            }, 500);
          };
        <\/script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};