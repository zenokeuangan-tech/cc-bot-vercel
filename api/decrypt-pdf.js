const { PDFDocument } = require('pdf-lib');
const pdfParse = require('pdf-parse');

module.exports = async function (req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { pdfBase64, password, secretKey } = req.body;

  if (secretKey !== process.env.BOT_SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!pdfBase64) {
    return res.status(400).json({ error: 'No PDF provided' });
  }

  try {
    const data = Buffer.from(pdfBase64, 'base64');
    
    // 1. Dekripsi PDF menggunakan pdf-lib
    const pdfDoc = await PDFDocument.load(data, { password: password });
    
    // 2. Simpan kembali sebagai PDF tanpa password
    const unencryptedPdfBytes = await pdfDoc.save();
    
    // 3. Ekstrak teks menggunakan pdf-parse
    const pdfData = await pdfParse(Buffer.from(unencryptedPdfBytes));

    return res.status(200).json({ text: pdfData.text });
  } catch (err) {
    console.error("PDF Decrypt Error:", err);
    return res.status(500).json({ error: err.message });
  }
};
