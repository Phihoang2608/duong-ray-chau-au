# Phi Board Games

Trang board game chơi online cùng bạn bè, không cần đăng nhập.

- `index.html` — sảnh chính: danh sách game, phòng đang mở, vào phòng bằng mã
- `core/` — bộ khung dùng chung: `room.js` (phòng online), `audio.js` (âm thanh), `effects.js` (hiệu ứng)
- `games/<tên-game>/` — mỗi game một thư mục

Thêm game mới: tạo thư mục trong `games/`, nạp các file trong `core/`, rồi khai báo game trong danh sách `GAMES` ở `index.html`.
