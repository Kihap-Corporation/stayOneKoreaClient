'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import * as ChannelService from '@channel.io/channel-web-sdk-loader';

export function ChannelTalkProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const pluginKey = process.env.NEXT_PUBLIC_CHANNEL_TALK_PLUGIN_KEY;
  const isBootedRef = useRef(false);

  // 관리자 페이지 체크 (개선된 로직)
  const isAdminPage = pathname === '/admin' || pathname.startsWith('/admin/');

  // 첫 번째 useEffect: 앱 시작 시 한 번만 boot
  useEffect(() => {
    if (!pluginKey || isBootedRef.current) {
      return;
    }

    ChannelService.loadScript();
    ChannelService.boot({
      pluginKey: pluginKey,
      hideChannelButtonOnBoot: isAdminPage, // 초기 상태 반영
    });

    isBootedRef.current = true;

    // cleanup: 컴포넌트 언마운트 시에만 실행
    return () => {
      ChannelService.shutdown();
      isBootedRef.current = false;
    };
  }, [pluginKey]); // pluginKey만 의존성

  // 두 번째 useEffect: 페이지 이동 시 표시/숨김 제어
  useEffect(() => {
    if (!isBootedRef.current) {
      return;
    }

    if (isAdminPage) {
      ChannelService.hideChannelButton();
    } else {
      ChannelService.showChannelButton();
      ChannelService.setPage(pathname); // 페이지 추적
    }
  }, [pathname, isAdminPage]);

  return <>{children}</>;
}

