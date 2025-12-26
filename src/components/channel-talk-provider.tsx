'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import * as ChannelService from '@channel.io/channel-web-sdk-loader';

export function ChannelTalkProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const pluginKey = process.env.NEXT_PUBLIC_CHANNEL_TALK_PLUGIN_KEY;

  // 관리자 페이지 체크
  const isAdminPage = pathname.startsWith('/admin');

  useEffect(() => {
    // 관리자 페이지이거나 플러그인 키가 없으면 채널톡 비활성화
    if (isAdminPage || !pluginKey) {
      return;
    }

    // 채널톡 SDK 초기화
    ChannelService.loadScript();

    // 채널톡 boot
    ChannelService.boot({
      pluginKey: pluginKey,
      customLauncherSelector: '.channel-talk-launcher', // 선택적: 커스텀 버튼
      hideChannelButtonOnBoot: false, // 채널 버튼 표시
    });

    // Cleanup 함수
    return () => {
      // 관리자 페이지로 이동 시 채널톡 숨김
      if (isAdminPage) {
        ChannelService.shutdown();
      }
    };
  }, [pluginKey, isAdminPage]);

  // SPA 환경: 페이지 변경 시 채널톡에 알림
  useEffect(() => {
    if (!isAdminPage && pluginKey) {
      ChannelService.setPage(pathname);
    }
  }, [pathname, isAdminPage, pluginKey]);

  return <>{children}</>;
}

