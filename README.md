Bài kiểm tra: Ứng dụng API tích hợp Jotform và Bitrix24
1) Giới thiệu

Ứng dụng Node.js đồng bộ dữ liệu Jotform (Form: Họ tên, Số điện thoại, Email) vào Bitrix24 CRM (Module Contact) qua REST API. Mỗi submission mới trên Jotform sẽ tạo một Contact mới trong Bitrix24. Ứng dụng có cơ chế logging và tránh tạo trùng cơ bản.

2) Kiến trúc & Cách hoạt động

Polling Jotform API → lấy danh sách submissions của Form.

Với mỗi submission chưa xử lý:

Ánh xạ trường: Full Name → NAME, Phone → PHONE[0].VALUE, Email → EMAIL[0].VALUE.

POST đến crm.contact.add (Bitrix24) để tạo Contact.

Ghi log kết quả và đánh dấu submission đã xử lý (lưu vào processed.json).

Có thể cấu hình interval chạy định kỳ (mặc định chạy 1 lần; tùy chọn bật setInterval).

3) Cài đặt môi trường
Dùng git bash để clone dự án về với https://github.com/luunhatminh2611/Bai1_TichhopJotformBtrix.git hoặc download file zip

Node.js ≥ 18, npm ≥ 8

Tài khoản Jotform (có API Key + Form ID)

Tài khoản Bitrix24 (có Incoming Webhook với quyền CRM)

4) Thiết lập Jotform
4.1 Tạo Form

Đăng ký/đăng nhập https://www.jotform.com

Chọn tạo blank form -> classic form

Chọn "Add Element" và thêm 3 trường bắt buộc:

Full Name (Text/Full Name) (Được tách thành 2 ô First và Last Name)

Phone Number (Phone)

Email (Email)

Chọn PUPLISH sao chép Form URL để sử dụng/điền thử
4.2 Lấy API Key & Form ID

API Key (Jotform): Chọn profile → Settings → API → Create New Key → cấp quyền Full Access (hoặc ít nhất quyền đọc Read Access).

Form ID: trong URL form (vd: https://form.jotform.com/252317234476053 → Form ID = 252317234476053).

5) Thiết lập Webhook Bitrix24

Cách dùng (đơn giản): Webhook URL

Đăng nhập Bitrix24 (domain dạng https://<your-domain>.bitrix24.vn).

Mở rộng phận Ứng dụng (Applications) → Tài nguyên cho nhà phát triển → Khác(Others) → Webhook vào (Incoming).

Tạo Webhook mới:

Trình dựng yêu cầu với phương thức: crm.contact.add → Lưu

Sao chép Webhook URL hệ thống trả về, dạng:

https://<your-domain>.bitrix24.vn/rest/<user_id>/<token>/

Xem lại URL webhook: vào lại tài nguyên cho nhà phát triển → chọn tab tích hợp → chọn id web hook vừa tạo và nhấn chỉnh sửa

Endpoint tạo Contact dùng trong code:

https://<your-domain>.bitrix24.vn/rest/<user_id>/<token>/crm.contact.add.json

5.1 Kiểm tra nhanh Webhook

Dùng trình duyệt/cURL truy cập:

GET https://<your-domain>.bitrix24.vn/rest/<user_id>/<token>/profile.json

Nếu nhận JSON thông tin người dùng → webhook hợp lệ.

6) Cấu hình dự án
6.1 Tạo file môi trường

Tại thư mục project, tạo file .env (hoặc sao chép từ .env.example):

JOTFORM_API_KEY=your_jotform_api_key_here
FORM_ID=your_form_id_here
BITRIX_WEBHOOK_URL=https://<your-domain>.bitrix24.vn/rest/<user_id>/<token>/crm.contact.add.json

7) Cài đặt & chạy
7.1) Cài dependencies:
npm install


2) Chạy 1 lần (đồng bộ ngay lập tức):
node server.js


(tuỳ chọn) Bật chế độ polling mỗi N giây
 Mở server.js, bỏ comment dòng setInterval

8) Cách kiểm thử

Điền form Jotform (Full Name, Phone, Email) và bấm Submit.

Chạy app (node server.js) hoặc đợi vòng polling.

Mở Bitrix24 → CRM → Khách hàng → Liên hệ (Contacts) → kiểm tra contact mới xuất hiện.

8.3 Log console

Ứng dụng in log khi:

Bắt đầu sync, số submission lấy về.

Bỏ qua submission đã xử lý (tránh trùng).

Tạo contact thành công: in ID trả về từ Bitrix24.

Báo lỗi (Jotform/Bitrix) nếu có.

Reset test: Xoá processed.json để đồng bộ lại từ đầu (cẩn thận tạo trùng trong CRM).

9) Tránh trùng lặp (Duplicate)

Ứng dụng lưu submissionId vào processed.json. Lần sau gặp lại sẽ bỏ qua.
