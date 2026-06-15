# Kế Hoạch Chuyển Đổi Dữ Liệu Chi Tiết (Data Migration Plan)

Bản kế hoạch này mô tả chi tiết phương pháp kỹ thuật để "Bơm" dữ liệu từ MySQL (XAMPP - `academy_old`) sang PostgreSQL (Railway) qua Prisma.

## 🛠 Công cụ sử dụng
- **Ngôn ngữ:** Node.js (viết thành 1 file script `migrate.js` chạy độc lập).
- **Thư viện:** `mysql2/promise` (kết nối XAMPP), `@prisma/client` (đẩy lên Railway), `cheerio` (để lọc sạch thẻ HTML/Elementor rác trong bài học).

## 📊 Bản đồ Chuyển đổi (Data Mapping Strategy)

Dưới đây là cách chúng ta sẽ "phiên dịch" dữ liệu từ hệ thống cũ sang hệ thống mới:

### 1. Di chuyển Học viên (Users)
- **Truy vấn cũ:** `SELECT * FROM wpuw_users`
- **Ánh xạ (Mapping):**
  - `user_email` ➡️ `User.email`
  - `display_name` ➡️ `User.name`
  - `user_registered` ➡️ `User.createdAt`
- **🔥 Cách xử lý mong muốn:**
  - *Vấn đề:* Mật khẩu WP cũ bị mã hóa chuẩn cũ (`$P$B...`), không dùng được cho web mới.
  - *Giải pháp:* Không copy mật khẩu cũ. Khi hệ thống Next.js hoạt động, tất cả học viên cũ sẽ dùng chức năng **Quên mật khẩu** để tạo lại mật khẩu mới. Điều này giúp hệ thống mới bảo mật tuyệt đối theo chuẩn Bcrypt.

### 2. Di chuyển Khóa học (Courses)
- **Truy vấn cũ:** `SELECT * FROM wpuw_posts WHERE post_type = 'lp_course' AND post_status = 'publish'`
- **Ánh xạ:**
  - `post_title` ➡️ `Course.title`
  - `post_content` ➡️ `Course.description`
  - *Lấy giá tiền:* Truy vấn thêm bảng `wpuw_postmeta` (có `meta_key = '_lp_price'`) ➡️ `Course.price`
- **🔥 Cách xử lý mong muốn:**
  - Nội dung khóa học (Description) thường dính rất nhiều mã rác của Elementor (ví dụ: `[elementor-template id="123"]`). Tool sẽ dùng Regex (biểu thức chính quy) để xóa sạch các shortcode này, trả lại văn bản sạch.

### 3. Di chuyển Bài giảng (Lessons)
- **Truy vấn cũ:** Phải kết hợp 3 bảng để biết Bài giảng nào thuộc Khóa học nào:
  - Lấy thông tin bài từ `wpuw_posts` (`post_type = 'lp_lesson'`).
  - Lấy ID Khóa học từ `wpuw_learnpress_sections` và `wpuw_learnpress_section_items`.
- **Ánh xạ:**
  - `post_title` ➡️ `Lesson.title`
  - `post_content` ➡️ `Lesson.content`
- **🔥 Cách xử lý mong muốn:**
  - Tool sẽ dùng thư viện `cheerio` quét nội dung `post_content` cũ để trích xuất ra đường dẫn Video (Youtube/Vimeo) và gán thẳng vào trường `Lesson.videoUrl` để App Next.js dễ dàng dựng Video Player.

### 4. Di chuyển Bộ câu hỏi Trắc nghiệm (Quizzes)
- **Truy vấn cũ:** Lấy từ `wpuw_learnpress_quiz_questions` và `wpuw_learnpress_question_answers`.
- **Ánh xạ:** Đẩy vào bảng `Quiz` và `Question`.
- **🔥 Cách xử lý mong muốn:**
  - Bảng cũ lưu 4 đáp án thành 4 dòng riêng biệt. Tool sẽ gom 4 dòng đó lại thành 1 chuỗi mảng JSON (ví dụ: `["A. Dog", "B. Cat", "C. Bird"]`) để nhét vào cột `options` trong bảng `Question` mới. Giúp DB gọn nhẹ gấp 4 lần.

### 5. Di chuyển Lịch sử Ghi danh (Enrollments)
- **Truy vấn cũ:** `SELECT * FROM wpuw_learnpress_user_items WHERE item_type = 'lp_course'`
- **Ánh xạ:**
  - `user_id` ➡️ `CourseEnrollment.userId`
  - `item_id` ➡️ `CourseEnrollment.courseId`
- **🔥 Cách xử lý mong muốn:**
  - Chỉ lấy các học viên có `status = 'enrolled'` hoặc `completed`. Bỏ qua các giao dịch rác bị hủy. Điều này đảm bảo học viên đăng nhập web mới là thấy ngay khóa học cũ.

---
> [!IMPORTANT]
> **Duyệt phương án:** 
> Việc bóc tách và lọc HTML sẽ làm mất đi các hiệu ứng rườm rà (màu sắc, khung viền...) được thiết kế riêng bằng Elementor trong phần nội dung văn bản khóa học. Nó chỉ giữ lại văn bản cốt lõi và hình ảnh/video. Bạn có đồng ý với sự hy sinh nhỏ này để đổi lấy tốc độ tải trang cực nhanh của Next.js không?
