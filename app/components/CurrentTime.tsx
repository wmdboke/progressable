'use client';

import { useState, useEffect, ReactNode } from 'react';

interface CurrentTimeProps {
  actions?: ReactNode;
}

export default function CurrentTime({ actions }: CurrentTimeProps) {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    // 客户端挂载后立即设置时间
    setCurrentTime(new Date());

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    return days[date.getDay()];
  };

  // 在客户端挂载前显示占位符
  if (!currentTime) {
    return (
      <div className="py-8 px-8">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <div className="flex-1" />
          <div className="text-center">
            <div className="text-6xl font-bold text-gray-800 mb-2">
              --:--:--
            </div>
            <div className="text-2xl text-gray-600">
              ----/--/-- ---
            </div>
          </div>
          <div className="flex-1 flex justify-end">{actions}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-8">
      <div className="max-w-[1800px] mx-auto flex items-center justify-between">
        <div className="flex-1" />
        <div className="text-center">
          <div className="text-6xl font-bold text-gray-800 mb-2">
            {currentTime.toLocaleTimeString('zh-CN', { hour12: false })}
          </div>
          <div className="text-2xl text-gray-600">
            {currentTime.toLocaleDateString('zh-CN')} {formatDate(currentTime)}
          </div>
        </div>
        <div className="flex-1 flex justify-end">{actions}</div>
      </div>
    </div>
  );
}
