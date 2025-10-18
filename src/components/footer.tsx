"use client"

import Link from "next/link"
import { useLanguage } from "./language-provider"

const logoSvg = "http://localhost:3845/assets/b0888dc61066c76c51bb67c48b8b3eef2a86cfcb.svg"

export function Footer() {
  const { messages } = useLanguage()

  return (
    <footer className="border-t bg-[#f7f7f8] mt-auto">
      <div className="mx-auto max-w-7xl xl:max-w-[1200px] px-6 py-9">
        {/* Desktop Footer */}
        <div className="hidden lg:flex gap-6">
          {/* Logo */}
          <div className="w-[200px] shrink-0">
            <div className="h-12 w-[120px]">
              <div className="text-2xl font-bold leading-tight">
                <span className="text-black">STAY</span>
                <span className="text-black">ONE</span>
                <br />
                <span className="text-black">KOREA</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col gap-6">
            {/* Company Info */}
            <div className="text-xs leading-4 text-[rgba(13,17,38,0.4)]">
              <p className="mb-0">{`${messages?.footer?.company || "Loading..."} | 사업자등록번호: ${messages?.footer?.businessNumber || "Loading..."} | 대표: ${messages?.footer?.representative || "Loading..."}`}</p>
              <p className="mb-0">{`통신판매신고 ${messages?.footer?.mailOrderNumber || "Loading..."} | 호스팅서비스제공: ${messages?.footer?.hostingProvider || "Loading..."}`}</p>
              <p className="mb-0">{`고객센터: ${messages?.footer?.customerService || "Loading..."}`}</p>
              <p>{messages?.footer?.inquiryAddress || "Loading..."}</p>
            </div>

            {/* Links */}
            <div className="flex gap-0">
              <Link 
                href="#" 
                className="bg-[rgba(10,15,41,0.04)] px-[10px] py-[6px] rounded-[10px] text-sm leading-5 text-[#14151a] tracking-[-0.1px] hover:bg-[rgba(10,15,41,0.08)] transition-colors"
              >
                {messages?.footer?.privacyPolicy || "개인정보처리방침"}
              </Link>
              <Link 
                href="#" 
                className="bg-transparent px-[10px] py-[6px] rounded-[10px] text-sm leading-5 text-[rgba(15,19,36,0.6)] tracking-[-0.1px] hover:bg-[rgba(10,15,41,0.04)] transition-colors"
              >
                {messages?.footer?.termsOfService || "이용약관"}
              </Link>
              <Link 
                href="#" 
                className="bg-transparent px-[10px] py-[6px] rounded-[10px] text-sm leading-5 text-[rgba(15,19,36,0.6)] tracking-[-0.1px] hover:bg-[rgba(10,15,41,0.04)] transition-colors"
              >
                {messages?.footer?.aboutGosiwon || "고시원 소개"}
              </Link>
            </div>

            {/* Disclaimer */}
            <div className="text-xs leading-4 text-[rgba(13,17,38,0.4)]">
              <p className="mb-0">{messages?.footer?.disclaimer?.line1 || "본 사이트에서 판매되는 상품 중에는 등록된 개별 판매자가 판매하는 상품이 포함되어 있습니다."}</p>
              <p className="mb-0">
                {messages?.footer?.disclaimer?.line2 ? messages.footer.disclaimer.line2.replace('{companyName}', messages.footer.company || "Company") : "개별 판매자 판매 상품의 경우 회사명은 통신판매중개업자로서 통신판매의 당사자가 아니므로, 개별 판매자가 등록한 상품, 거래정보 및 거래 등에 대해 책임을 지지 않습니다."}
              </p>
              <p className="mb-0">&nbsp;</p>
              <p className="mb-0">{messages?.footer?.disclaimer?.copyright ? messages.footer.disclaimer.copyright.replace('{companyName}', messages.footer.company || "Company") : "Copyright © 2025 Company All right reserved."}</p>
              <p>{messages?.footer?.disclaimer?.contentProtection || "본 사이트의 컨텐츠는 저작권법의 보호를 받는 바 무단 전재, 복사, 배포 등을 금합니다."}</p>
            </div>
          </div>
        </div>

        {/* Mobile Footer */}
        <div className="lg:hidden flex flex-col gap-6 w-full">
          {/* Logo */}
          <div className="w-[200px]">
            <div className="h-12 w-[120px]">
              <div className="text-2xl font-bold leading-tight">
                <span className="text-black">STAY</span>
                <span className="text-black">ONE</span>
                <br />
                <span className="text-black">KOREA</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col gap-6 w-full">
            {/* Company Info */}
            <div className="text-xs leading-4 text-[rgba(13,17,38,0.4)] w-full">
              <p className="mb-0">{`${messages?.footer?.company || "Loading..."} | 사업자등록번호: ${messages?.footer?.businessNumber || "Loading..."} | 대표: ${messages?.footer?.representative || "Loading..."}`}</p>
              <p className="mb-0">{`통신판매신고 ${messages?.footer?.mailOrderNumber || "Loading..."} | 호스팅서비스제공: ${messages?.footer?.hostingProvider || "Loading..."}`}</p>
              <p className="mb-0">{`고객센터: ${messages?.footer?.customerService || "Loading..."}`}</p>
              <p>{messages?.footer?.inquiryAddress || "Loading..."}</p>
            </div>

            {/* Links */}
            <div className="flex gap-0 flex-wrap">
              <Link 
                href="#" 
                className="bg-[rgba(10,15,41,0.04)] px-[10px] py-[6px] rounded-[10px] text-sm leading-5 text-[#14151a] tracking-[-0.1px] hover:bg-[rgba(10,15,41,0.08)] transition-colors"
              >
                {messages?.footer?.privacyPolicy || "개인정보처리방침"}
              </Link>
              <Link 
                href="#" 
                className="bg-transparent px-[10px] py-[6px] rounded-[10px] text-sm leading-5 text-[rgba(15,19,36,0.6)] tracking-[-0.1px] hover:bg-[rgba(10,15,41,0.04)] transition-colors"
              >
                {messages?.footer?.termsOfService || "이용약관"}
              </Link>
              <Link 
                href="#" 
                className="bg-transparent px-[10px] py-[6px] rounded-[10px] text-sm leading-5 text-[rgba(15,19,36,0.6)] tracking-[-0.1px] hover:bg-[rgba(10,15,41,0.04)] transition-colors"
              >
                {messages?.footer?.aboutGosiwon || "고시원 소개"}
              </Link>
            </div>

            {/* Disclaimer */}
            <div className="text-xs leading-4 text-[rgba(13,17,38,0.4)] w-full">
              <p className="mb-0">{messages?.footer?.disclaimer?.line1 || "본 사이트에서 판매되는 상품 중에는 등록된 개별 판매자가 판매하는 상품이 포함되어 있습니다."}</p>
              <p className="mb-0">
                {messages?.footer?.disclaimer?.line2 ? messages.footer.disclaimer.line2.replace('{companyName}', messages.footer.company || "Company") : "개별 판매자 판매 상품의 경우 회사명은 통신판매중개업자로서 통신판매의 당사자가 아니므로, 개별 판매자가 등록한 상품, 거래정보 및 거래 등에 대해 책임을 지지 않습니다."}
              </p>
              <p className="mb-0">&nbsp;</p>
              <p className="mb-0">{messages?.footer?.disclaimer?.copyright ? messages.footer.disclaimer.copyright.replace('{companyName}', messages.footer.company || "Company") : "Copyright © 2025 Company All right reserved."}</p>
              <p>{messages?.footer?.disclaimer?.contentProtection || "본 사이트의 컨텐츠는 저작권법의 보호를 받는 바 무단 전재, 복사, 배포 등을 금합니다."}</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
