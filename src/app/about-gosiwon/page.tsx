"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/components/language-provider"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export default function AboutGosiwonPage() {
  const { messages } = useLanguage()

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f7f8]">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <div className="relative h-[300px] sm:h-[350px] lg:h-[424px] bg-cover bg-center" style={{ backgroundImage: "url('/about-gosiwon-hero.png')" }}>
          <div className="absolute inset-0" />
          <div className="relative h-full flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
            <p className="text-[18px] sm:text-[22px] font-bold leading-[18px] sm:leading-[20px] tracking-[-0.1px] text-white mb-2">
              {messages?.aboutGosiwon?.hero?.subtitle || "Just Bring Your Bag"}
            </p>
            <h1 className="text-[24px] sm:text-[32px] lg:text-[36px] font-extrabold leading-[32px] sm:leading-[40px] lg:leading-[44px] tracking-[-0.3px] text-white mb-2 max-w-[90%] sm:max-w-[600px]">
              {messages?.aboutGosiwon?.hero?.title || "GOSIWON, K-Compact Studio"}
            </h1>
            <p className="text-[16px] sm:text-[18px] font-normal leading-[18px] sm:leading-[20px] tracking-[-0.1px] text-white mb-6">
              {messages?.aboutGosiwon?.hero?.description || "Near-Zero Deposit · All-inclusive"}
            </p>
            <p className="text-[16px] sm:text-[18px] font-normal leading-[18px] sm:leading-[20px] tracking-[-0.1px] text-white max-w-[90%] sm:max-w-[600px] mb-6 lg:mb-8">
              {messages?.aboutGosiwon?.hero?.content || "Rooted in Korea's tradition of dedicated study culture, this space has evolved into the most intelligent and efficient living experience for modern life in Seoul."}
            </p>
            <Link
              href="/"
              className="bg-white hover:bg-gray-50 rounded-full px-4 sm:px-6 py-2 sm:py-3 flex items-center gap-2 transition-colors"
            >
              <span className="text-[14px] sm:text-[16px] font-medium leading-[20px] sm:leading-[24px] tracking-[-0.2px] text-[#14151a]">
                {messages?.aboutGosiwon?.hero?.ctaButton || "Find your stay"}
              </span>
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-[#14151a]" />
            </Link>
          </div>
        </div>

        {/* 3 Big Points Section */}
        <div className="bg-[#f7f7f8] py-12 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
            <h2 className="text-[28px] sm:text-[32px] lg:text-[36px] font-extrabold leading-[36px] sm:leading-[40px] lg:leading-[44px] tracking-[-0.3px] text-[#14151a] text-center mb-8 sm:mb-10 lg:mb-12">
              {messages?.aboutGosiwon?.bigPoints?.title || "3 Big Points"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {messages?.aboutGosiwon?.bigPoints?.points?.map((point: any, index: number) => {
                const icons = [
                  // Clock icon
                  <svg key="clock" width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.9951 1.52007e-06C23.045 -0.00145425 26.0033 1.04278 28.3765 2.95854C30.7497 4.87431 32.3943 7.54579 33.0362 10.5274C33.678 13.5091 33.2782 16.6207 31.9035 19.3432C30.5287 22.0658 28.2621 24.2347 25.4817 25.4883C24.593 27.4532 23.2409 29.1731 21.5415 30.5007C19.8421 31.8283 17.846 32.7238 15.7244 33.1106C13.6029 33.4973 11.4192 33.3637 9.36067 32.7211C7.30211 32.0786 5.43012 30.9464 3.90524 29.4215C2.38037 27.8966 1.24811 26.0246 0.605582 23.9661C-0.0369475 21.9075 -0.170576 19.7238 0.216157 17.6023C0.602889 15.4807 1.49844 13.4847 2.82601 11.7852C4.15358 10.0858 5.87354 8.73374 7.83839 7.845C8.8953 5.50648 10.6044 3.5225 12.7606 2.13101C14.9169 0.739524 17.4288 -0.000395108 19.9951 1.52007e-06V1.52007e-06ZM14.9951 11.6667H11.6617V13.3333C10.5786 13.3307 9.53698 13.75 8.7577 14.5022C7.97842 15.2545 7.52271 16.2807 7.48717 17.3633C7.45162 18.4458 7.83904 19.4997 8.56729 20.3015C9.29555 21.1032 10.3074 21.5899 11.3884 21.6583L11.6617 21.6667H14.9951L15.1451 21.68C15.3372 21.7148 15.511 21.8159 15.6362 21.9658C15.7614 22.1157 15.8299 22.3047 15.8299 22.5C15.8299 22.6953 15.7614 22.8843 15.6362 23.0342C15.511 23.1841 15.3372 23.2852 15.1451 23.32L14.9951 23.3333H8.32839V26.6667H11.6617V28.3333H14.9951V26.6667C16.0782 26.6693 17.1198 26.25 17.8991 25.4978C18.6784 24.7455 19.1341 23.7193 19.1696 22.6367C19.2052 21.5542 18.8177 20.5003 18.0895 19.6985C17.3612 18.8968 16.3494 18.4101 15.2684 18.3417L14.9951 18.3333H11.6617L11.5117 18.32C11.3196 18.2852 11.1458 18.1841 11.0206 18.0342C10.8954 17.8843 10.8269 17.6953 10.8269 17.5C10.8269 17.3047 10.8954 17.1157 11.0206 16.9658C11.1458 16.8159 11.3196 16.7148 11.5117 16.68L11.6617 16.6667H18.3284V13.3333H14.9951V11.6667ZM19.9951 3.33334C18.5829 3.33168 17.1864 3.6299 15.8981 4.20827C14.6098 4.78664 13.4589 5.63197 12.5217 6.68834C14.4055 6.57398 16.2921 6.86083 18.0567 7.52991C19.8214 8.199 21.4239 9.23508 22.7583 10.5696C24.0927 11.9042 25.1286 13.5068 25.7975 15.2716C26.4663 17.0363 26.753 18.9229 26.6384 20.8067C28.1537 19.4594 29.2237 17.6832 29.7064 15.7139C30.1891 13.7445 30.0617 11.6749 29.3411 9.77954C28.6205 7.88422 27.3408 6.25273 25.6716 5.10147C24.0024 3.95021 22.0227 3.33357 19.9951 3.33334V3.33334Z" fill="#14151A"/>
                  </svg>,
                  // Home icon
                  <svg key="home" width="37" height="33" viewBox="0 0 37 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M31.6667 31.0806C31.6667 31.5226 31.4911 31.9465 31.1785 32.2591C30.8659 32.5717 30.442 32.7473 30 32.7473H6.66667C6.22464 32.7473 5.80072 32.5717 5.48816 32.2591C5.17559 31.9465 5 31.5226 5 31.0806V16.0806H0L17.2117 0.433929C17.5185 0.154725 17.9185 0 18.3333 0C18.7482 0 19.1481 0.154725 19.455 0.433929L36.6667 16.0806H31.6667V31.0806ZM12.6533 20.7606L11.0017 21.7139L12.6683 24.6023L14.3233 23.6473C14.9873 24.275 15.7894 24.738 16.665 24.9989V26.9073H20.0017V24.9973C20.8771 24.7368 21.6792 24.2744 22.3433 23.6473L23.9967 24.6006L25.6667 21.7139L24.015 20.7606C24.2259 19.873 24.2259 18.9482 24.015 18.0606L25.6667 17.1056L24 14.2173L22.345 15.1723C21.6799 14.5447 20.8767 14.0822 20 13.8223V11.9139H16.6633V13.8206C15.7877 14.0815 14.9856 14.5445 14.3217 15.1723L12.6683 14.2173L11 17.1073L12.6517 18.0606C12.4408 18.9482 12.4408 19.873 12.6517 20.7606H12.6533ZM18.3333 21.9106C18.0049 21.9108 17.6797 21.8463 17.3762 21.7209C17.0727 21.5954 16.7969 21.4114 16.5645 21.1793C16.3321 20.9472 16.1477 20.6717 16.0218 20.3683C15.896 20.065 15.8311 19.7398 15.8308 19.4114C15.8306 19.083 15.8951 18.7578 16.0206 18.4543C16.146 18.1508 16.3301 17.875 16.5621 17.6426C16.7942 17.4102 17.0698 17.2258 17.3731 17.0999C17.6764 16.9741 18.0016 16.9091 18.33 16.9089C18.993 16.9085 19.6291 17.1715 20.0983 17.64C20.5674 18.1085 20.8312 18.7442 20.8317 19.4073C20.8321 20.0703 20.5691 20.7064 20.1006 21.1755C19.6321 21.6447 18.9964 21.9085 18.3333 21.9089V21.9106Z" fill="#14151A"/>
                  </svg>,
                  // Location icon
                  <svg key="location" width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.6667 33.3333C7.46167 33.3333 0 25.8717 0 16.6667C0 7.46167 7.46167 0 16.6667 0C25.8717 0 33.3333 7.46167 33.3333 16.6667C33.3333 25.8717 25.8717 33.3333 16.6667 33.3333ZM12.5 11.6667L8.33333 15.8333L16.6667 24.1667L25 15.8333L20.8333 11.6667H12.5Z" fill="#14151A"/>
                  </svg>
                ];

                return (
                  <div key={index} className="bg-white rounded-[16px] sm:rounded-[20px] lg:rounded-[24px] p-4 sm:p-5 lg:p-6 flex flex-col gap-3 sm:gap-4">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center flex-shrink-0">
                      {icons[index] || icons[0]}
                    </div>
                    <h3 className="text-[16px] sm:text-[18px] lg:text-[20px] font-bold leading-[24px] sm:leading-[26px] lg:leading-[28px] tracking-[-0.2px] text-[#14151a]">
                      {point.title}
                    </h3>
                    <p className="text-[13px] sm:text-[14px] font-normal leading-[19px] sm:leading-[20px] tracking-[-0.1px] text-[rgba(13,17,38,0.6)]">
                      {point.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Your Living Guide Section */}
        <div className="bg-white py-12 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-10 lg:mb-12">
              <h2 className="text-[28px] sm:text-[32px] lg:text-[36px] font-extrabold leading-[36px] sm:leading-[40px] lg:leading-[44px] tracking-[-0.3px] text-[#14151a] mb-2">
                {messages?.aboutGosiwon?.livingGuide?.title || "Your Living Guide"}
              </h2>
              <p className="text-[28px] sm:text-[32px] lg:text-[36px] font-extrabold leading-[24px] sm:leading-[40px] tracking-[-0.3px] text-[#14151a]">
                {messages?.aboutGosiwon?.livingGuide?.subtitle || "& Stay One Korea Guarantee"}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-[1100px] mx-auto">
              {messages?.aboutGosiwon?.livingGuide?.guides?.map((guide: any, index: number) => {
                const icons = [
                  // New home icon for Compact Living
                  <svg key="home" width="30" height="32" viewBox="0 0 30 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M30 29.9957C30 30.4377 29.8244 30.8616 29.5118 31.1742C29.1993 31.4867 28.7754 31.6623 28.3333 31.6623H1.66667C1.22464 31.6623 0.800716 31.4867 0.488155 31.1742C0.175595 30.8616 1.32109e-07 30.4377 1.32109e-07 29.9957V12.1857C-0.000100096 11.9339 0.0568319 11.6854 0.166522 11.4588C0.276212 11.2322 0.43581 11.0334 0.633334 10.8773L13.9667 0.358997C14.2609 0.126482 14.625 0 15 0C15.375 0 15.7391 0.126482 16.0333 0.358997L29.3667 10.8757C29.5644 11.0319 29.7241 11.231 29.8338 11.4579C29.9435 11.6848 30.0004 11.9336 30 12.1857V29.9957V29.9957ZM6.66667 16.6623C6.66667 18.8725 7.54464 20.9921 9.10744 22.5549C10.6702 24.1177 12.7899 24.9957 15 24.9957C17.2101 24.9957 19.3298 24.1177 20.8926 22.5549C22.4554 20.9921 23.3333 18.8725 23.3333 16.6623H20C20 17.9884 19.4732 19.2602 18.5355 20.1979C17.5979 21.1355 16.3261 21.6623 15 21.6623C13.6739 21.6623 12.4021 21.1355 11.4645 20.1979C10.5268 19.2602 10 17.9884 10 16.6623H6.66667Z" fill="#14151A"/>
                  </svg>,
                  // New check icon for Verification
                  <svg key="check" width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M4.36538 26.4808L5.86538 34.1346L13.5192 35.6346L20 40L26.4808 35.6346L34.1346 34.1346L35.6346 26.4808L40 20L35.6346 13.5192L34.1346 5.86538L26.4808 4.36538L20 0L13.5192 4.36538L5.86538 5.86538L4.36538 13.5192L0 20L4.36538 26.4808ZM17.7021 27.3044L29.2314 16.3055L26.9305 13.8936L17.7041 22.6956L13.0715 18.2686L10.7686 20.6785L17.7021 27.3044Z" fill="#14151A"/>
                  </svg>
                ];

                return (
                  <div key={index} className="bg-white border border-[#dee0e3] rounded-[16px] sm:rounded-[20px] lg:rounded-[24px] p-4 sm:p-5 lg:p-6 flex flex-col gap-3 sm:gap-4">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center flex-shrink-0">
                      {icons[index] || icons[0]}
                    </div>
                    <h3 className="text-[16px] sm:text-[18px] lg:text-[20px] font-bold leading-[24px] sm:leading-[26px] lg:leading-[28px] tracking-[-0.2px] text-[#14151a]">
                      {guide.title}
                    </h3>
                    <p className="text-[13px] sm:text-[14px] font-normal leading-[19px] sm:leading-[20px] tracking-[-0.1px] text-[rgba(13,17,38,0.6)]">
                      {guide.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Find Your Stay CTA Section */}
        <div className="bg-[#e0004d] py-6 sm:py-10 lg:py-14">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-4">
              <h2 className="text-[24px] sm:text-[28px] lg:text-[36px] font-extrabold leading-[32px] sm:leading-[36px] lg:leading-[44px] tracking-[-0.3px] text-white text-center sm:text-left">
                {messages?.aboutGosiwon?.ctaSection?.title || "Find Your Stay in Korea"}
              </h2>
              <Link
                href="/"
                className="bg-white hover:bg-gray-50 rounded-full px-4 sm:px-6 py-2 sm:py-3 flex items-center gap-2 transition-colors flex-shrink-0"
              >
                <span className="text-[14px] sm:text-[16px] font-medium leading-[20px] sm:leading-[24px] tracking-[-0.2px] text-[#14151a]">
                  {messages?.aboutGosiwon?.ctaSection?.buttonText || "Find your stay"}
                </span>
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-[#14151a]" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
