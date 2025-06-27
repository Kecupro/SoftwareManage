import React from 'react';
import { Link } from 'react-router-dom';

export default function PartnerLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">Dev Management</h1>
                <p className="text-sm text-gray-600">Portal Đối Tác</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Portal Chính
              </Link>
              <Link
                to="/partner/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Đăng Nhập
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Portal Đối Tác
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Hệ thống quản lý dự án chuyên nghiệp dành cho đối tác. 
              Upload source code, tài liệu bàn giao và theo dõi tiến độ dự án một cách dễ dàng.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/partner/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
              >
                Bắt Đầu Ngay
              </Link>
              <Link
                to="#features"
                className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-lg text-lg font-medium transition-colors"
              >
                Tìm Hiểu Thêm
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tính Năng Nổi Bật
            </h2>
            <p className="text-lg text-gray-600">
              Tất cả những gì bạn cần để quản lý dự án hiệu quả
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Upload Source Code
              </h3>
              <p className="text-gray-600">
                Upload source code dễ dàng với hỗ trợ nhiều định dạng file. 
                Hệ thống tự động validate và kiểm tra bảo mật.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Quản Lý Tài Liệu
              </h3>
              <p className="text-gray-600">
                Upload và quản lý tài liệu bàn giao một cách có tổ chức. 
                Hỗ trợ nhiều định dạng và tìm kiếm nhanh chóng.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Theo Dõi Tiến Độ
              </h3>
              <p className="text-gray-600">
                Dashboard trực quan hiển thị tiến độ dự án, 
                thống kê bàn giao và hoạt động gần đây.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Bảo Mật Cao
              </h3>
              <p className="text-gray-600">
                Hệ thống phân quyền nghiêm ngặt, mã hóa dữ liệu 
                và logging đầy đủ để đảm bảo an toàn thông tin.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Tốc Độ Nhanh
              </h3>
              <p className="text-gray-600">
                Giao diện tối ưu, upload file nhanh chóng 
                và phản hồi tức thì cho mọi thao tác.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Dễ Sử Dụng
              </h3>
              <p className="text-gray-600">
                Giao diện thân thiện, hướng dẫn rõ ràng 
                và hỗ trợ đầy đủ cho mọi thao tác.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Sẵn Sàng Bắt Đầu?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Đăng nhập ngay để trải nghiệm Portal Đối Tác
          </p>
          <Link
            to="/partner/login"
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg text-lg font-medium transition-colors"
          >
            Đăng Nhập Ngay
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Dev Management</h3>
              <p className="text-gray-400">
                Hệ thống quản lý dự án chuyên nghiệp cho doanh nghiệp và đối tác.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Tính Năng</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Quản lý dự án</li>
                <li>Upload source code</li>
                <li>Quản lý tài liệu</li>
                <li>Theo dõi tiến độ</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Hỗ Trợ</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Hướng dẫn sử dụng</li>
                <li>FAQ</li>
                <li>Liên hệ hỗ trợ</li>
                <li>Báo cáo lỗi</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Liên Hệ</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Email: support@devmanagement.com</li>
                <li>Phone: 090-123-4567</li>
                <li>Address: Hà Nội, Việt Nam</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 Dev Management. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 