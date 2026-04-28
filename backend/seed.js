const mongoose = require('mongoose');

// 🛑 তোমার MongoDB URL টা এখানে দেবে
const MONGO_URI = "mongodb+srv://immanueltextile333_db_user:Rajdeep%4069@clusterraj.qmrfvd7.mongodb.net/"; 

// ১. তোমার Food স্কিমা (Schema)
const foodSchema = new mongoose.Schema({
  title: String,
  price: Number,
  type: String,
  mealType: String,
  preOrderTime: String,
  deliveryArea: String,
  sellerPhone: String,
  image: String,
  sellerName: String,
  foodSource: String,
});

const Food = mongoose.model('Food', foodSchema);

// ২. কলকাতার বিখ্যাত রেস্টুরেন্ট এবং তাদের আসল মেনু ক্যাটাগরি
const restaurants = [
  // Mughlai / Biryani
  { name: "Arsalan", area: "Park Circus", phone: "9831110001", type: "Mughlai" },
  { name: "Aminia", area: "New Market", phone: "9831110002", type: "Mughlai" },
  { name: "Shiraz Golden Restaurant", area: "Park Street", phone: "9831110003", type: "Mughlai" },
  { name: "Oudh 1590", area: "Salt Lake", phone: "9831110004", type: "Mughlai" },
  { name: "Dada Boudi Restaurant", area: "Barrackpore", phone: "9831110005", type: "Mughlai" },
  
  // Bengali Authentic
  { name: "6 Ballygunge Place", area: "Ballygunge", phone: "9831110006", type: "Bengali" },
  { name: "Bhojohori Manna", area: "Gariahat", phone: "9831110007", type: "Bengali" },
  { name: "Kasturi", area: "New Market", phone: "9831110008", type: "Bengali" },
  
  // Chinese & Fast Food
  { name: "Chowman", area: "Sector 1, Salt Lake", phone: "9831110009", type: "Chinese" },
  { name: "Momo I Am", area: "Golpark", phone: "9831110010", type: "Chinese" },
  { name: "Mainland China", area: "Gurüsaday Road", phone: "9831110011", type: "Chinese" },
  
  // Sweets & Snacks
  { name: "Balaram Mullick", area: "Bhowanipore", phone: "9831110012", type: "Sweets" },
  { name: "Haldiram's Prabhuji", area: "VIP Road", phone: "9831110013", type: "Sweets" }
];

// ৩. রিয়েল মেনু আইটেম (ক্যাটাগরি অনুযায়ী)
const menuItems = {
  Mughlai: [
    { title: "Special Mutton Biryani", price: 390, type: "Non-Veg", mealType: "Lunch", img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80" },
    { title: "Chicken Chaap", price: 210, type: "Non-Veg", mealType: "Dinner", img: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&q=80" },
    { title: "Mutton Galouti Kebab", price: 350, type: "Non-Veg", mealType: "Snacks", img: "https://images.unsplash.com/photo-1599487405645-c1714ae4a3cb?w=600&q=80" },
    { title: "Chicken Reshmi Kebab", price: 280, type: "Non-Veg", mealType: "Snacks", img: "https://images.unsplash.com/photo-1599487405645-c1714ae4a3cb?w=600&q=80" },
    { title: "Firni", price: 90, type: "Veg", mealType: "Snacks", img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80" }
  ],
  Bengali: [
    { title: "Kosha Mangsho", price: 450, type: "Non-Veg", mealType: "Lunch", img: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&q=80" },
    { title: "Bhetki Paturi", price: 320, type: "Non-Veg", mealType: "Lunch", img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80" },
    { title: "Basanti Pulao", price: 180, type: "Veg", mealType: "Dinner", img: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&q=80" },
    { title: "Special Bengali Thali", price: 350, type: "Non-Veg", mealType: "Lunch", img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80" }
  ],
  Chinese: [
    { title: "Mixed Fried Rice", price: 260, type: "Non-Veg", mealType: "Lunch", img: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&q=80" },
    { title: "Chilli Chicken (Dry)", price: 280, type: "Non-Veg", mealType: "Snacks", img: "https://images.unsplash.com/photo-1599487405645-c1714ae4a3cb?w=600&q=80" },
    { title: "Pan Fried Pork Momos", price: 210, type: "Non-Veg", mealType: "Snacks", img: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80" },
    { title: "Hakka Noodles", price: 190, type: "Veg", mealType: "Dinner", img: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&q=80" }
  ],
  Sweets: [
    { title: "Baked Rosogolla (4 Pcs)", price: 120, type: "Veg", mealType: "Snacks", img: "https://images.unsplash.com/photo-1605197136154-20a6e0fbcfce?w=600&q=80" },
    { title: "Nolen Gurer Sandesh", price: 150, type: "Veg", mealType: "Snacks", img: "https://images.unsplash.com/photo-1605197136154-20a6e0fbcfce?w=600&q=80" },
    { title: "Special Raj Kachori", price: 140, type: "Veg", mealType: "Breakfast", img: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80" },
    { title: "Veg Chole Bhature", price: 180, type: "Veg", mealType: "Breakfast", img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80" }
  ]
};

// 🚀 ৫০০ ডেটা জেনারেট করার লজিক
const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB!");

    // আগের টেস্ট ডেটা মুছে ফেলার জন্য (প্রয়োজন না হলে কমেন্ট করে দিতে পারো)
    // await Food.deleteMany({ foodSource: "Restaurant" });
    // console.log("🗑️ Old Restaurant Data Cleared!");

    const foodsToInsert = [];
    
    // আমরা ৫০০ ডেটা চাই, তাই লুপটা চালাবো যাতে কম্বিনেশন তৈরি হয়
    let count = 0;
    while (count < 500) {
      for (const rest of restaurants) {
        const items = menuItems[rest.type];
        // র্যান্ডমলি ওই রেস্টুরেন্টের একটা আইটেম সিলেক্ট করা
        const randomItem = items[Math.floor(Math.random() * items.length)];
        
        foodsToInsert.push({
          title: `${rest.name} Special ${randomItem.title}`,
          price: randomItem.price + Math.floor(Math.random() * 50), // দাম একটু ভ্যারিয়েশন করা হলো
          type: randomItem.type,
          mealType: randomItem.mealType,
          preOrderTime: "30-45 mins",
          deliveryArea: rest.area,
          sellerPhone: rest.phone,
          image: randomItem.img,
          sellerName: rest.name,
          foodSource: "Restaurant"
        });
        
        count++;
        if (count >= 500) break;
      }
    }

    // MongoDB তে একবারে সব ডেটা পুশ করা
    await Food.insertMany(foodsToInsert);
    console.log(`🎉 Successfully added ${foodsToInsert.length} Real Restaurant foods to the database!`);
    
    mongoose.connection.close();
    process.exit();

  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
};

seedDatabase();