require("dotenv").config();
const axios = require("axios");
const fs = require("fs");

const JOTFORM_API_KEY = process.env.JOTFORM_API_KEY;
const FORM_ID = process.env.FORM_ID;
const BITRIX_WEBHOOK_URL = process.env.BITRIX_WEBHOOK_URL;

// File để lưu submission ID đã xử lý
const PROCESSED_FILE = "processed.json";

// Đọc danh sách ID đã xử lý
function loadProcessed() {
  if (fs.existsSync(PROCESSED_FILE)) {
    return JSON.parse(fs.readFileSync(PROCESSED_FILE, "utf-8"));
  }
  return [];
}

// Lưu lại danh sách ID đã xử lý
function saveProcessed(list) {
  fs.writeFileSync(PROCESSED_FILE, JSON.stringify(list, null, 2));
}

async function syncSubmissions() {
  console.log("Bắt đầu đồng bộ dữ liệu...");

  try {
    // 1. Lấy submissions từ Jotform
    const jotformRes = await axios.get(
      `https://api.jotform.com/form/${FORM_ID}/submissions?apiKey=${JOTFORM_API_KEY}`
    );
    const submissions = jotformRes.data.content;

    if (!submissions || submissions.length === 0) {
      console.log("Không có submission nào.");
      return;
    }

    let processed = loadProcessed();

    for (const sub of submissions) {
      if (processed.includes(sub.id)) {
        console.log(`Bỏ qua submission đã xử lý: ${sub.id}`);
        continue;
      }

      const name = sub.answers["3"]?.prettyFormat || "No Name";
      const phone = sub.answers["4"]?.prettyFormat || "";
      const email = sub.answers["5"]?.answer || "";

      console.log(`Nhận submission mới: ${name}, ${phone}, ${email}`);

      // 2. Gửi sang Bitrix24
      try {
        const bitrixRes = await axios.post(BITRIX_WEBHOOK_URL, {
          fields: {
            NAME: name,
            PHONE: [{ VALUE: phone, VALUE_TYPE: "WORK" }],
            EMAIL: [{ VALUE: email, VALUE_TYPE: "WORK" }],
          },
        });

        if (bitrixRes.data && bitrixRes.data.result) {
          console.log(`Tạo contact trong Bitrix24 với ID: ${bitrixRes.data.result})`);
          processed.push(sub.id);
          saveProcessed(processed);
        } else {
          console.error("Lỗi tạo contact:", bitrixRes.data);
        }
      } catch (err) {
        console.error("Gửi sang Bitrix24 thất bại:", err.message);
      }
    }
  } catch (err) {
    console.error("Lỗi khi gọi API Jotform:", err.message);
  }
}

// Chạy ngay 1 lần
syncSubmissions();

// Có thể time ví dụ 1 phút gọi lại
// setInterval(syncSubmissions, 60000);