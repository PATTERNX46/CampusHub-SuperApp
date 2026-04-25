const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.scanImageWithGemini = async (req, res) => {
  try {
    let { imageBase64 } = req.body;
    
    if (!imageBase64) {
      return res.status(400).json({ message: "No image provided" });
    }

    // 🛡️ Base64 এর শুরুতে যদি "data:image..." থাকে, তবে সেটাকে মুছে ফেলা
    imageBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // 🚀 [FIXED] 404 Error: গুগলের লেটেস্ট 2.5 মডেল ব্যবহার করা হলো
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // ইনস্ট্রাকশন
    const prompt = "Extract all the text from this image exactly as it is written. Do not add any extra markdown, explanations, or formatting. Just give me the raw text.";
    
    const imageParts = [
      {
        inlineData: {
          data: imageBase64,
          mimeType: "image/jpeg"
        }
      }
    ];

    // ম্যাজিক হচ্ছে...
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ extractedText: text });

  } catch (error) {
    console.error("Gemini OCR Error:", error);
    res.status(500).json({ message: "Failed to extract text. Please try again." });
  }
};