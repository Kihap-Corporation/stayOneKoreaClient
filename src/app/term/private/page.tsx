export const metadata = {
  title: "개인정보처리방침 | Stay One Korea"
}

export default function PrivatePolicyPage() {
  return (
    <main className="px-4 py-10 max-w-3xl mx-auto text-gray-900">
      <section className="space-y-6">
        <header className="space-y-3">
          <h2 className="text-2xl font-semibold">개인정보처리방침</h2>
          <p>
            (주)일원컴퍼니(이하 &quot;회사&quot;라 함)는 「개인정보보호법」 제30조에 따라 정보주체의
            개인정보를 보호하고, 개인정보와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 다음과 같이
            개인정보처리방침을 수립·공개합니다.
          </p>
          <p>이 방침은 2025년 11월 15일부터 적용됩니다.</p>
        </header>

        <hr />

        <article className="space-y-5">
          <section className="space-y-3">
            <h3 className="text-xl font-semibold">제1조 (개인정보의 처리 목적)</h3>
            <p>
              회사는 단기 체류형 숙소 예약 및 이용 플랫폼 <strong>Stay On Korea(SOK)</strong> 서비스를
              운영합니다.
            </p>
            <p>
              본 서비스는 「부동산 중개업법」상 <strong>중개 행위에 해당하지 않으며</strong>, 이용자와 숙소
              제공자 간의 <strong>단기 숙소 예약·결제</strong>를 지원하는 플랫폼입니다.
            </p>
            <p>
              따라서 회사는 <strong>PG사의 금지업종(부동산 중개 등)</strong> 및 <strong>유의업종에 해당하지 않습니다.</strong>
            </p>
            <p>
              회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하는 개인정보는 다음 목적 이외의 용도로는 사용되지
              않으며, 이용 목적이 변경되는 경우에는 「개인정보보호법」 제18조에 따라 별도의 동의를 받습니다.
            </p>
            <ol className="list-decimal space-y-2 pl-6">
              <li>
                <strong>회원 가입 및 관리</strong>: 회원 가입 의사 확인, 본인 인증, 회원제 서비스 제공, 부정 이용
                방지, 공지·통지 및 고객 문의 대응을 위한 개인정보 처리.
              </li>
              <li>
                <strong>숙소 예약 및 결제 서비스 제공</strong>: 숙소 예약, 결제, 정산, 환불, 예약 내역 확인, 고객
                지원 등 서비스 운영을 위한 개인정보 처리.
              </li>
              <li>
                <strong>고충 처리 및 민원 응대</strong>: 고객 문의 확인, 사실조사, 처리 결과 안내 등 민원처리 목적으로
                개인정보 처리.
              </li>
            </ol>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-semibold">제2조 (개인정보의 처리 및 보유기간)</h3>
            <ol className="list-decimal space-y-2 pl-6">
              <li>
                회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체의 동의 기간 내에서 개인정보를 처리·보유합니다.
              </li>
              <li>
                각각의 처리 목적에 따른 보유기간은 다음과 같습니다.
                <div className="overflow-x-auto">
                  <table className="mt-3 min-w-full table-auto border border-gray-200 text-left text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-200 px-3 py-2">구분</th>
                        <th className="border border-gray-200 px-3 py-2">보유항목</th>
                        <th className="border border-gray-200 px-3 py-2">보유기간</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-200 px-3 py-2">회원 가입 및 관리</td>
                        <td className="border border-gray-200 px-3 py-2">이름, 휴대전화번호, 이메일, 비밀번호</td>
                        <td className="border border-gray-200 px-3 py-2">회원 탈퇴 시까지</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-200 px-3 py-2">숙소 예약 및 결제</td>
                        <td className="border border-gray-200 px-3 py-2">
                          이름, 휴대전화번호, 이메일, 결제수단 정보(카드사명, 카드번호, 계좌번호 등)
                        </td>
                        <td className="border border-gray-200 px-3 py-2">결제 및 정산 완료 후 5년 (전자상거래법 근거)</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-200 px-3 py-2">민원 및 분쟁 처리</td>
                        <td className="border border-gray-200 px-3 py-2">이름, 연락처, 이메일, 민원 내용</td>
                        <td className="border border-gray-200 px-3 py-2">3년 (전자상거래법 근거)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </li>
            </ol>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-semibold">제3조 (개인정보의 제3자 제공)</h3>
            <p>회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다.</p>
            <p>다만, 서비스 운영을 위해 다음과 같이 제3자에게 개인정보를 제공합니다.</p>
            <div className="overflow-x-auto">
              <table className="mt-3 min-w-full table-auto border border-gray-200 text-left text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-200 px-3 py-2">제공받는 자</th>
                    <th className="border border-gray-200 px-3 py-2">이용목적</th>
                    <th className="border border-gray-200 px-3 py-2">제공항목</th>
                    <th className="border border-gray-200 px-3 py-2">보유·이용기간</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 px-3 py-2">(주)케이지이니시스</td>
                    <td className="border border-gray-200 px-3 py-2">결제 서비스 제공</td>
                    <td className="border border-gray-200 px-3 py-2">이름, 휴대전화번호, 이메일, 결제 관련 정보</td>
                    <td className="border border-gray-200 px-3 py-2">관련 법령에 따른 보유기간</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              ※ 모든 결제는 <strong>숙소 예약 서비스 이용 대금 결제에 한하며</strong>, <strong>부동산 임대차 계약 체결 목적의 결제는 포함되지 않습니다.</strong>
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-semibold">제4조 (개인정보 처리의 위탁)</h3>
            <p>회사는 원활한 서비스 제공을 위해 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.</p>
            <div className="overflow-x-auto">
              <table className="mt-3 min-w-full table-auto border border-gray-200 text-left text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-200 px-3 py-2">수탁자</th>
                    <th className="border border-gray-200 px-3 py-2">위탁업무 내용</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 px-3 py-2">(주)케이지이니시스</td>
                    <td className="border border-gray-200 px-3 py-2">결제서비스 제공</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-3 py-2">Amazon Web Services, Inc.</td>
                    <td className="border border-gray-200 px-3 py-2">데이터 보관 및 서버 운영</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              회사는 위탁계약 시 「개인정보보호법」 제26조에 따라 재위탁 제한, 기술적·관리적 보호조치, 손해배상 책임 등을 문서화하고
              관리·감독합니다.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-semibold">제5조 (정보주체의 권리·의무 및 행사방법)</h3>
            <ol className="list-decimal space-y-2 pl-6">
              <li>이용자는 회사에 대해 언제든지 개인정보 열람·정정·삭제·처리정지 요구 등의 권리를 행사할 수 있습니다.</li>
              <li>서면, 이메일 등을 통해 요청할 수 있으며 회사는 지체 없이 조치합니다.</li>
              <li>법정대리인 또는 위임을 받은 자를 통해서도 행사 가능합니다.</li>
              <li>법령에 의해 열람 또는 삭제가 제한될 수 있습니다.</li>
            </ol>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-semibold">제6조 (처리하는 개인정보 항목)</h3>
            <ol className="list-decimal space-y-2 pl-6">
              <li>
                <strong>회원 가입 및 관리</strong>
                <ul className="list-disc space-y-1 pl-6">
                  <li>필수항목: 이름, 휴대전화번호, 이메일, 비밀번호</li>
                </ul>
              </li>
              <li>
                <strong>숙소 예약 및 결제</strong>
                <ul className="list-disc space-y-1 pl-6">
                  <li>필수항목: 이름, 휴대전화번호, 이메일, 결제정보(카드사명, 카드번호, 은행명, 계좌번호 등)</li>
                </ul>
              </li>
              <li>
                <strong>자동 수집 정보</strong>
                <ul className="list-disc space-y-1 pl-6">
                  <li>IP주소, 쿠키, 방문기록, 이용기록 등</li>
                </ul>
              </li>
            </ol>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-semibold">제7조 (개인정보의 파기)</h3>
            <ol className="list-decimal space-y-2 pl-6">
              <li>개인정보는 보유기간 경과 또는 처리 목적 달성 시 지체 없이 파기합니다.</li>
              <li>전자파일은 복구 불가능한 방법으로, 문서는 분쇄 또는 소각합니다.</li>
            </ol>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-semibold">제8조 (개인정보의 안전성 확보조치)</h3>
            <p>회사는 다음과 같은 조치를 시행합니다.</p>
            <ul className="list-disc space-y-1 pl-6">
              <li>관리적 조치: 내부관리계획 수립, 정기 교육</li>
              <li>기술적 조치: 접근권한 관리, 암호화, 보안프로그램 설치</li>
              <li>물리적 조치: 서버실 접근통제</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-semibold">제9조 (쿠키의 사용)</h3>
            <p>회사는 맞춤형 서비스 제공을 위해 쿠키를 사용할 수 있습니다.</p>
            <p>쿠키 저장 거부는 브라우저 설정을 통해 가능합니다.</p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-semibold">제10조 (개인정보 보호책임자)</h3>
            <div className="overflow-x-auto">
              <table className="mt-3 min-w-full table-auto border border-gray-200 text-left text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-200 px-3 py-2">구분</th>
                    <th className="border border-gray-200 px-3 py-2">내용</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 px-3 py-2">성명</td>
                    <td className="border border-gray-200 px-3 py-2">김오희</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-3 py-2">직책</td>
                    <td className="border border-gray-200 px-3 py-2">대표</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-3 py-2">연락처</td>
                    <td className="border border-gray-200 px-3 py-2">
                      <a href="mailto:stayonekoreaofficial@gmail.com" className="text-blue-600 underline">
                        stayonekoreaofficial@gmail.com
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>※ 개인정보 관련 문의·불만·피해구제 요청은 위 이메일로 접수 바랍니다.</p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-semibold">제11조 (권익침해 구제 방법)</h3>
            <p>개인정보 침해로 인한 상담·분쟁 해결은 아래 기관에 문의할 수 있습니다.</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                개인정보침해신고센터: (국번없이) 118 /{" "}
                <a href="https://privacy.kisa.or.kr" className="text-blue-600 underline">
                  privacy.kisa.or.kr
                </a>
              </li>
              <li>
                개인정보분쟁조정위원회: (국번없이) 1833-6972 /{" "}
                <a href="https://www.kopico.go.kr" className="text-blue-600 underline">
                  www.kopico.go.kr
                </a>
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-semibold">제12조 (개인정보처리방침의 변경)</h3>
            <p>이 방침은 2025년 11월 15일부터 시행됩니다.</p>
            <p>내용 변경 시 SOK 공식 웹사이트 공지사항을 통해 안내합니다.</p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-semibold">명시문 (PG사 관련 고지)</h3>
            <blockquote className="space-y-3 border-l-4 border-gray-300 pl-4 text-sm text-gray-700">
              <p>
                (주)일원컴퍼니가 운영하는 Stay On Korea(SOK)는 「부동산 중개업법」상 중개 행위가 아닌{" "}
                <strong>단기 숙소 예약 서비스</strong>이며, <strong>PG사 금지업종 및 유의업종에 해당하지 않습니다.</strong>
              </p>
              <p>모든 결제는 숙소 예약 이용료 결제에 한하여 처리됩니다.</p>
            </blockquote>
          </section>
        </article>
      </section>
    </main>
  )
}

