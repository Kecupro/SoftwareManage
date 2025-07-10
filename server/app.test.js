// Thêm đoạn code này vào file app.test.js của bạn

test('bài test mẫu để đảm bảo Jest hoạt động', () => {
  // expect(giá trị thực tế).toBe(giá trị kỳ vọng);
  expect(1 + 1).toBe(2);
});

// Bạn cũng có thể viết một bài test khác
test('kiểm tra giá trị boolean', () => {
  expect(true).toBe(true);
});