const { decryptPDF } = require('@pdfsmaller/pdf-decrypt');
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
    
    // Dekripsi PDF (menghapus password)
    const decryptedBytes = await decryptPDF(new Uint8Array(data), password);
    
    // Ekstrak teks dari PDF yang sudah tidak berpassword
    const pdfData = await pdfParse(Buffer.from(decryptedBytes));

    return res.status(200).json({ text: pdfData.text });
  } catch (err) {
    console.error("PDF Decrypt Error:", err);
    return res.status(500).json({ error: err.message });
  }
};
