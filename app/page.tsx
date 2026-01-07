"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="container mx-auto px-6 py-6">
        <nav className="flex justify-between items-center">
          <div className="text-2xl font-bold text-indigo-600">Progressable</div>
          <div className="flex gap-4">
            {session ? (
              <Link
                href="/dashboard"
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                进入应用
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-6 py-2 text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  登录
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  免费注册
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          可视化任务进度管理
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          用流程图的方式管理任务，让每个任务的进度一目了然。从开始到完成，每个节点都清晰可见。
        </p>
        <div className="flex gap-4 justify-center">
          {session ? (
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-indigo-600 text-white text-lg rounded-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
            >
              进入应用 →
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                className="px-8 py-4 bg-indigo-600 text-white text-lg rounded-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
              >
                立即开始 →
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 bg-white text-indigo-600 text-lg rounded-lg border-2 border-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                登录
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          核心功能
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              流程可视化
            </h3>
            <p className="text-gray-600">
              用流程图的方式展示任务进度，每个节点都清晰可见，进度一目了然。
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              实时追踪
            </h3>
            <p className="text-gray-600">
              实时记录每个节点的完成时间，轻松回顾任务进展，把控项目节奏。
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              灵活编辑
            </h3>
            <p className="text-gray-600">
              随时添加、编辑、删除节点，为每个节点添加备注，让任务管理更加灵活。
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            准备好开始了吗？
          </h2>
          <p className="text-xl mb-8 opacity-90">
            立即注册，开始高效管理你的任务
          </p>
          {session ? (
            <Link
              href="/dashboard"
              className="inline-block px-8 py-4 bg-white text-indigo-600 text-lg font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              进入应用 →
            </Link>
          ) : (
            <Link
              href="/register"
              className="inline-block px-8 py-4 bg-white text-indigo-600 text-lg font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              免费注册 →
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 border-t border-gray-200">
        <div className="text-center text-gray-600">
          <p>&copy; 2026 Progressable. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
