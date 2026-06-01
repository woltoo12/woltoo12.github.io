
function onlyNumber(value){ return String(value).replace(/[^\d.]/g,""); }
function won(n){ return Math.round(Number(n)||0).toLocaleString("ko-KR") + "원"; }
function num(n){ return (Number(n)||0).toLocaleString("ko-KR"); }
function copyText(text){ navigator.clipboard.writeText(text).then(()=>alert("결과를 복사했습니다.")); }
document.addEventListener('input', function(e){
  const ids = [
    'principal','delayPrincipal','claimAmount','seizureClaimAmount','acqPrice','salePrice','purchasePrice','necessaryCost',
    'basicDeduction','acqExtra','extraCost','seizureExtraCost','dealAmount','monthlyRent','regPrice','revenueStamp',
    'bondDiscount','regExtra','svThreeMonthPay','svAnnualBonus','svAnnualLeavePay','alMonthlyPay','whHourlyWage',
    'nsGrossPay','nsIncomeTax','loanAmount','savingMonthly','depositAmount'
  ];
  if(ids.includes(e.target.id)){
    let v = e.target.value.replace(/,/g,'').replace(/[^\d]/g,'');
    if(v) e.target.value = Number(v).toLocaleString('ko-KR');
  }
});

function initDefaultDates(){
  const today = new Date();
  const before = new Date(); before.setFullYear(today.getFullYear()-1);
  ['startDate','endDate','delayStartDate','delayEndDate'].forEach(id=>{
    const el=document.getElementById(id);
    if(el) el.value=(id.includes('Start')||id==='startDate'?before:today).toISOString().slice(0,10);
  });
  const svs=document.getElementById('svStartDate'), sve=document.getElementById('svEndDate');
  if(svs && sve){ const b=new Date(); b.setFullYear(today.getFullYear()-3); svs.value=b.toISOString().slice(0,10); sve.value=today.toISOString().slice(0,10);}
}
document.addEventListener('DOMContentLoaded', initDefaultDates);

function calcSimpleInterest(principal, rate, days, basis){ return principal*(rate/100)*days/basis; }
function dateDiff(start,end){ return Math.floor((new Date(end+"T00:00:00")-new Date(start+"T00:00:00"))/(1000*60*60*24)); }

function calculateOverdue(){
  const principal=Number(onlyNumber(document.getElementById("principal").value));
  const rt=document.getElementById("rateType").value;
  const cr=document.getElementById("customRate");
  const rate=rt==="custom"?Number(onlyNumber(cr.value)):Number(rt);
  const basis=Number(document.getElementById("dayBasis").value);
  const start=document.getElementById("startDate").value, end=document.getElementById("endDate").value;
  if(!principal||principal<=0) return alert("원금을 올바르게 입력하세요.");
  if(!rate||rate<=0) return alert("이율을 올바르게 입력하세요.");
  const days=dateDiff(start,end); if(days<0) return alert("종료일은 시작일보다 빠를 수 없습니다.");
  const interest=calcSimpleInterest(principal,rate,days,basis), total=principal+interest;
  document.getElementById("outPrincipal").textContent=won(principal);
  document.getElementById("outInterest").textContent=won(interest);
  document.getElementById("outTotal").textContent=won(total);
  document.getElementById("formulaBox").textContent=`${num(principal)}원 × ${rate}% × ${days}일 ÷ ${basis}일 = ${won(interest)}`;
  document.getElementById("resultCard").classList.add("show");
  document.getElementById("resultCard").scrollIntoView({behavior:"smooth",block:"start"});
}
function copyOverdue(){ copyText(`[연체이자 계산 결과]\n원금: ${outPrincipal.textContent}\n연체이자: ${outInterest.textContent}\n총액: ${outTotal.textContent}`); }

function calculateDelay(){
  const principal=Number(onlyNumber(delayPrincipal.value));
  const rt=delayRateType.value, rate=rt==="custom"?Number(onlyNumber(delayCustomRate.value)):Number(rt);
  const basis=Number(delayDayBasis.value), days=dateDiff(delayStartDate.value, delayEndDate.value);
  if(!principal||principal<=0) return alert("청구 원금을 올바르게 입력하세요.");
  if(!rate||rate<=0) return alert("이율을 올바르게 입력하세요.");
  if(days<0) return alert("종료일은 시작일보다 빠를 수 없습니다.");
  const interest=calcSimpleInterest(principal,rate,days,basis), total=principal+interest;
  delayOutPrincipal.textContent=won(principal); delayOutInterest.textContent=won(interest); delayOutTotal.textContent=won(total);
  delayFormulaBox.textContent=`${num(principal)}원 × ${rate}% × ${days}일 ÷ ${basis}일 = ${won(interest)}`;
  delayResultCard.classList.add("show"); delayResultCard.scrollIntoView({behavior:"smooth",block:"start"});
}
function copyDelay(){ copyText(`[지연손해금 계산 결과]\n청구 원금: ${delayOutPrincipal.textContent}\n지연손해금: ${delayOutInterest.textContent}\n총액: ${delayOutTotal.textContent}`); }

function floorTo100Won(amount){ if(amount<1000) return 1000; return Math.floor(amount/100)*100; }
function calcCivilStampFee(claim){
  let fee=0;
  if(claim<10000000) fee=claim*50/10000;
  else if(claim<100000000) fee=claim*45/10000+5000;
  else if(claim<1000000000) fee=claim*40/10000+55000;
  else fee=claim*35/10000+555000;
  return floorTo100Won(fee);
}
function calculatePaymentOrder(){
  const claim=Number(onlyNumber(claimAmount.value)), applicants=Number(onlyNumber(applicants.value)), respondents=Number(onlyNumber(respondents.value));
  const delivery=Number(onlyNumber(deliveryFee.value)), extra=Number(onlyNumber(extraCost.value))||0, discount=eFilingDiscount.value==="yes";
  if(!claim||!applicants||!respondents||!delivery) return alert("입력값을 확인하세요.");
  const civil=calcCivilStampFee(claim); let stamp=floorTo100Won(civil/10); if(discount) stamp=floorTo100Won(stamp*0.9);
  const send=delivery*(applicants+respondents)*6, total=stamp+send+extra;
  outStampFee.textContent=won(stamp); outDeliveryTotal.textContent=won(send); outPaymentTotal.textContent=won(total);
  paymentFormulaBox.textContent=`인지액 ${won(stamp)} + 송달료 ${won(send)} + 기타 ${won(extra)} = ${won(total)}`;
  paymentResultCard.classList.add("show"); paymentResultCard.scrollIntoView({behavior:"smooth",block:"start"});
}
function copyPayment(){ copyText(`[지급명령 비용 계산 결과]\n인지액: ${outStampFee.textContent}\n송달료: ${outDeliveryTotal.textContent}\n예상 합계: ${outPaymentTotal.textContent}`); }

function calculateSeizure(){
  const type=seizureType.value, claim=Number(onlyNumber(seizureClaimAmount.value)), apps=Number(onlyNumber(seizureApplicants.value)), debts=Number(onlyNumber(seizureDebtors.value));
  const thirds=Number(onlyNumber(thirdDebtors.value))||0, delivery=Number(onlyNumber(seizureDeliveryFee.value)), stamp=Number(onlyNumber(seizureStampFee.value));
  const extra=Number(onlyNumber(seizureExtraCost.value))||0, cert=Number(onlyNumber(registrationCertFee.value))||0;
  if(!claim||!apps||!debts||!delivery||!stamp) return alert("입력값을 확인하세요.");
  let parties=apps+debts; if(type!=="provisional_realestate") parties+=thirds;
  const rounds=type==="execution_claim"?2:3, send=delivery*parties*rounds;
  let reg=0, edu=0, certFee=0; const inc=includeRegistrationTax.value==="yes" || (includeRegistrationTax.value==="auto" && type==="provisional_realestate");
  if(inc){ reg=Math.max(Math.floor(claim*0.002),6000); edu=Math.floor(reg*0.2); certFee=cert; }
  const total=stamp+send+reg+edu+extra+certFee;
  outSeizureStamp.textContent=won(stamp); outSeizureDelivery.textContent=won(send); outRegTax.textContent=won(reg); outEduTax.textContent=won(edu); outSeizureExtra.textContent=won(extra+certFee); outSeizureTotal.textContent=won(total);
  seizureFormulaBox.textContent=`인지액 ${won(stamp)} + 송달료 ${won(send)} + 등록면허세 ${won(reg)} + 지방교육세 ${won(edu)} + 기타 ${won(extra+certFee)} = ${won(total)}`;
  seizureResultCard.classList.add("show"); seizureResultCard.scrollIntoView({behavior:"smooth",block:"start"});
}
function copySeizure(){ copyText(`[압류·가압류 비용 계산 결과]\n인지액: ${outSeizureStamp.textContent}\n송달료: ${outSeizureDelivery.textContent}\n등록면허세: ${outRegTax.textContent}\n지방교육세: ${outEduTax.textContent}\n합계: ${outSeizureTotal.textContent}`); }

function calcAcqRate(price, houseCount, regulated){
  const E=100000000;
  if(houseCount==="corp") return 0.12;
  if(houseCount==="1"){ if(price<=6*E) return 0.01; if(price<=9*E) return ((price/E)*(2/3)-3)/100; return 0.03; }
  if(houseCount==="2"){ if(regulated==="yes") return 0.08; if(price<=6*E) return 0.01; if(price<=9*E) return ((price/E)*(2/3)-3)/100; return 0.03; }
  if(houseCount==="3") return regulated==="yes"?0.12:0.08;
  return 0.12;
}
function calculateAcquisitionTax(){
  const price=Number(onlyNumber(acqPrice.value)), hc=houseCount.value, regu=regulatedArea.value, over85=area85.value==="yes", extra=Number(onlyNumber(acqExtra.value))||0;
  if(!price) return alert("취득가액을 입력하세요.");
  const rate=calcAcqRate(price,hc,regu), tax=Math.floor(price*rate);
  let local= rate<0.04 ? Math.floor(tax*0.10) : Math.floor(price*0.004);
  let rural=0; if(rate<0.04) rural=over85?Math.floor(price*0.002):0; else if(rate>=0.08) rural=Math.floor(price*(rate===0.08?0.006:0.01)); else rural=over85?Math.floor(price*0.002):0;
  const total=tax+local+rural+extra;
  outAcqTax.textContent=won(tax); outLocalEduTax.textContent=won(local); outRuralTax.textContent=won(rural); outAcqRate.textContent=(rate*100).toFixed(3).replace(/\.?0+$/,"")+"%"; outAcqExtra.textContent=won(extra); outAcqTotal.textContent=won(total);
  acqFormulaBox.textContent=`취득세 ${won(tax)} + 지방교육세 ${won(local)} + 농어촌특별세 ${won(rural)} + 기타 ${won(extra)} = ${won(total)}`;
  acqResultCard.classList.add("show"); acqResultCard.scrollIntoView({behavior:"smooth",block:"start"});
}
function copyAcq(){ copyText(`[취등록세 계산 결과]\n취득세: ${outAcqTax.textContent}\n지방교육세: ${outLocalEduTax.textContent}\n농어촌특별세: ${outRuralTax.textContent}\n합계: ${outAcqTotal.textContent}`); }

function calcBasicIncomeTax(base){
  if(base<=0) return 0;
  const b=[[14000000,.06,0],[50000000,.15,1260000],[88000000,.24,5760000],[150000000,.35,15440000],[300000000,.38,19940000],[500000000,.40,25940000],[1000000000,.42,35940000],[Infinity,.45,65940000]];
  for(const [lim,rate,ded] of b){ if(base<=lim) return Math.floor(base*rate-ded); }
}
function calculateCapitalGainTax(){
  const sale=Number(onlyNumber(salePrice.value)), pur=Number(onlyNumber(purchasePrice.value)), cost=Number(onlyNumber(necessaryCost.value))||0, years=Number(onlyNumber(holdingYears.value))||0;
  const lrate=Number(onlyNumber(longDeductionRate.value))||0, basic=Number(onlyNumber(basicDeduction.value))||0;
  if(!sale||!pur) return alert("양도가액과 취득가액을 입력하세요.");
  const gain=sale-pur-cost, long=Math.max(0,Math.floor(gain*lrate/100)), base=Math.max(0,gain-long-basic);
  let tax=0, label="기본세율";
  if(shortTermMode.value==="auto"&&assetType.value==="house"&&years<1){tax=Math.floor(base*.70);label="주택 1년 미만 70%";}
  else if(shortTermMode.value==="auto"&&assetType.value==="house"&&years<2){tax=Math.floor(base*.60);label="주택 2년 미만 60%";}
  else if(shortTermMode.value==="auto"&&assetType.value==="land"&&years<1){tax=Math.floor(base*.50);label="기타 부동산 1년 미만 50%";}
  else if(shortTermMode.value==="auto"&&assetType.value==="land"&&years<2){tax=Math.floor(base*.40);label="기타 부동산 2년 미만 40%";}
  else tax=calcBasicIncomeTax(base);
  const local=Math.floor(tax*.1), total=tax+local;
  outGain.textContent=won(gain); outTaxBase.textContent=won(base); outCgTax.textContent=won(tax); outCgLocalTax.textContent=won(local); outCgDeduction.textContent=won(long+basic); outCgTotal.textContent=won(total);
  cgFormulaBox.textContent=`양도차익 ${won(gain)} - 공제 ${won(long+basic)} = 과세표준 ${won(base)} / ${label} / 예상세액 ${won(total)}`;
  cgResultCard.classList.add("show"); cgResultCard.scrollIntoView({behavior:"smooth",block:"start"});
}
function copyCg(){ copyText(`[양도소득세 간이 계산 결과]\n양도차익: ${outGain.textContent}\n과세표준: ${outTaxBase.textContent}\n예상 세액: ${outCgTotal.textContent}`); }

function brokerageDealAmount(type, deposit, monthly){ if(type!=="monthly") return deposit; let amount=deposit+monthly*100; if(amount<50000000) amount=deposit+monthly*70; return amount; }
function getBrokerageRule(target, dealType, amount){
  if(target==="other") return {rate:.009,limit:null,label:"주택 외 0.9% 이내"};
  if(target==="officetel") return dealType==="sale"?{rate:.005,limit:null,label:"오피스텔 매매 0.5%"}:{rate:.004,limit:null,label:"오피스텔 임대 0.4%"};
  if(dealType==="sale"){
    if(amount<50000000) return {rate:.006,limit:250000,label:"주택 매매 5천만원 미만"};
    if(amount<200000000) return {rate:.005,limit:800000,label:"주택 매매 5천만원~2억원"};
    if(amount<900000000) return {rate:.004,limit:null,label:"주택 매매 2억원~9억원"};
    if(amount<1200000000) return {rate:.005,limit:null,label:"주택 매매 9억원~12억원"};
    if(amount<1500000000) return {rate:.006,limit:null,label:"주택 매매 12억원~15억원"};
    return {rate:.007,limit:null,label:"주택 매매 15억원 이상"};
  }
  if(amount<50000000) return {rate:.005,limit:200000,label:"주택 임대 5천만원 미만"};
  if(amount<100000000) return {rate:.004,limit:300000,label:"주택 임대 5천만원~1억원"};
  if(amount<600000000) return {rate:.003,limit:null,label:"주택 임대 1억원~6억원"};
  if(amount<1200000000) return {rate:.004,limit:null,label:"주택 임대 6억원~12억원"};
  if(amount<1500000000) return {rate:.005,limit:null,label:"주택 임대 12억원~15억원"};
  return {rate:.006,limit:null,label:"주택 임대 15억원 이상"};
}
function calculateBrokerage(){
  const target=brokerageType.value, type=dealType.value, dep=Number(onlyNumber(dealAmount.value)), monthly=Number(onlyNumber(monthlyRent.value))||0, include=vatIncluded.value==="yes";
  if(!dep) return alert("거래금액을 입력하세요.");
  const base=brokerageDealAmount(type,dep,monthly), rule=getBrokerageRule(target,type,base);
  let rate=rule.rate; if(customBrokerageRate.value.trim()){ const cr=Number(onlyNumber(customBrokerageRate.value))/100; if(cr<=0||cr>rule.rate) return alert("협의요율은 상한요율 이하로 입력하세요."); rate=cr; }
  let fee=Math.floor(base*rate); if(rule.limit!==null&&fee>rule.limit) fee=rule.limit; const vat=include?Math.floor(fee*.1):0, total=fee+vat;
  outBrokerageBase.textContent=won(base); outBrokerageRate.textContent=(rate*100).toFixed(3).replace(/\.?0+$/,"")+"%"; outBrokerageTotal.textContent=won(fee); outBrokerageVat.textContent=won(vat); outBrokerageLimit.textContent=rule.limit?won(rule.limit):"없음"; outBrokerageGrand.textContent=won(total);
  brokerageFormulaBox.textContent=`${rule.label} / ${won(base)} × ${(rate*100).toFixed(3).replace(/\.?0+$/,"")}% = ${won(fee)}`;
  brokerageResultCard.classList.add("show"); brokerageResultCard.scrollIntoView({behavior:"smooth",block:"start"});
}
function copyBrokerage(){ copyText(`[중개보수 계산 결과]\n거래금액 산정액: ${outBrokerageBase.textContent}\n중개보수: ${outBrokerageTotal.textContent}\n합계: ${outBrokerageGrand.textContent}`); }

function calcRevenueStamp(price){ if(price<=10000000) return 0; if(price<=30000000) return 20000; if(price<=50000000) return 40000; if(price<=100000000) return 70000; if(price<=1000000000) return 150000; return 350000; }
function calcRegistrationApplicationFee(cause, method, items){ let fee=0; if(cause==="other") fee=method==="paper"?4000:method==="eform"?3000:1000; else if(cause==="inheritance") fee=method==="paper"?20000:method==="eform"?17000:0; else fee=method==="paper"?18000:method==="eform"?15000:10000; return fee*Math.max(1,items); }
function calculateRegistrationCost(){
  const price=Number(onlyNumber(regPrice.value)), items=Number(onlyNumber(regItems.value))||1, stampInput=revenueStamp.value.trim(), bond=Number(onlyNumber(bondDiscount.value))||0, extra=Number(onlyNumber(regExtra.value))||0;
  if(!price) return alert("기준금액을 입력하세요.");
  const regFee=calcRegistrationApplicationFee(regCause.value,regMethod.value,items), stamp=stampInput?Number(onlyNumber(stampInput)):(regCause.value==="sale"?calcRevenueStamp(price):0);
  let acq=0; if(includeAcqTaxInReg.value==="yes"&&regCause.value==="sale"){ const rate=calcAcqRate(price,"1","no"), tax=Math.floor(price*rate), local=Math.floor(tax*.1); acq=tax+local; }
  const total=regFee+stamp+bond+extra+acq;
  outRegFee.textContent=won(regFee); outRevenueStamp.textContent=won(stamp); outBondDiscount.textContent=won(bond); outRegAcqTax.textContent=won(acq); outRegExtra.textContent=won(extra); outRegTotal.textContent=won(total);
  registrationFormulaBox.textContent=`등기신청수수료 ${won(regFee)} + 수입인지 ${won(stamp)} + 채권할인 ${won(bond)} + 취득세 ${won(acq)} + 기타 ${won(extra)} = ${won(total)}`;
  registrationResultCard.classList.add("show"); registrationResultCard.scrollIntoView({behavior:"smooth",block:"start"});
}
function copyRegistration(){ copyText(`[등기비용 간이 계산 결과]\n등기신청수수료: ${outRegFee.textContent}\n수입인지: ${outRevenueStamp.textContent}\n예상 합계: ${outRegTotal.textContent}`); }

function calculateSeverance(){
  const days=dateDiff(svStartDate.value,svEndDate.value), pay3=Number(onlyNumber(svThreeMonthPay.value)), d3=Number(onlyNumber(svThreeMonthDays.value)), bonus=Number(onlyNumber(svAnnualBonus.value))||0, leave=Number(onlyNumber(svAnnualLeavePay.value))||0;
  if(!pay3||!d3) return alert("임금총액과 총일수를 입력하세요.");
  const avg=(pay3+bonus*3/12+leave*3/12)/d3, sev=avg*30*days/365;
  outSvDays.textContent=num(days)+"일"; outAvgWage.textContent=won(avg); outSeverance.textContent=won(sev); svFormulaBox.textContent=`${won(avg)} × 30일 × ${num(days)}일 ÷ 365 = ${won(sev)}`;
  svResultCard.classList.add("show"); svResultCard.scrollIntoView({behavior:"smooth",block:"start"});
}
function copySeverance(){ copyText(`[퇴직금 계산 결과]\n재직일수: ${outSvDays.textContent}\n1일 평균임금: ${outAvgWage.textContent}\n예상 퇴직금: ${outSeverance.textContent}`); }

function calculateAnnualLeave(){
  const m=Number(onlyNumber(alMonthlyPay.value)), mh=Number(onlyNumber(alMonthlyHours.value)), dh=Number(onlyNumber(alDailyHours.value)), days=Number(onlyNumber(alUnusedDays.value));
  if(!m||!mh||!dh) return alert("입력값을 확인하세요.");
  const hourly=m/mh, daily=hourly*dh, total=daily*days;
  outHourlyWage.textContent=won(hourly); outDailyWage.textContent=won(daily); outAnnualLeavePay.textContent=won(total); alFormulaBox.textContent=`${won(m)} ÷ ${mh}시간 × ${dh}시간 × ${days}일 = ${won(total)}`;
  alResultCard.classList.add("show"); alResultCard.scrollIntoView({behavior:"smooth",block:"start"});
}
function copyAnnualLeave(){ copyText(`[연차수당 계산 결과]\n시간급: ${outHourlyWage.textContent}\n1일 통상임금: ${outDailyWage.textContent}\n예상 연차수당: ${outAnnualLeavePay.textContent}`); }

function calculateWeeklyHoliday(){
  const hourly=Number(onlyNumber(whHourlyWage.value)), hours=Number(onlyNumber(whWeeklyHours.value));
  if(!hourly||!hours) return alert("시급과 근로시간을 입력하세요.");
  let hh=hours<15?0:(whMode.value==="fixed8"?8:Math.min(8,hours/40*8)), weekly=hh*hourly, monthly=weekly*4.345;
  outWeeklyHolidayHours.textContent=hh.toFixed(2).replace(/\.?0+$/,"")+"시간"; outWeeklyHolidayPay.textContent=won(weekly); outWeeklyHolidayMonthly.textContent=won(monthly); whFormulaBox.textContent=hours<15?"주 15시간 미만으로 0원 처리":`${hh.toFixed(2)}시간 × ${won(hourly)} = ${won(weekly)}`;
  whResultCard.classList.add("show"); whResultCard.scrollIntoView({behavior:"smooth",block:"start"});
}
function copyWeeklyHoliday(){ copyText(`[주휴수당 계산 결과]\n주휴시간: ${outWeeklyHolidayHours.textContent}\n주휴수당: ${outWeeklyHolidayPay.textContent}\n월 환산: ${outWeeklyHolidayMonthly.textContent}`); }

function calculateNetSalary(){
  const gross=Number(onlyNumber(nsGrossPay.value)), tax=Number(onlyNumber(nsIncomeTax.value))||0;
  if(!gross) return alert("월 세전급여를 입력하세요.");
  const p=Math.floor(gross*Number(onlyNumber(nsPensionRate.value))/100), h=Math.floor(gross*Number(onlyNumber(nsHealthRate.value))/100), c=Math.floor(gross*Number(onlyNumber(nsCareRate.value))/100), e=Math.floor(gross*Number(onlyNumber(nsEmploymentRate.value))/100);
  const ins=p+h+c+e, net=gross-ins-tax;
  outPension.textContent=won(p); outHealthCare.textContent=won(h+c); outEmployment.textContent=won(e); outInsuranceTotal.textContent=won(ins); outTaxInput.textContent=won(tax); outNetSalary.textContent=won(net); nsFormulaBox.textContent=`세전 ${won(gross)} - 보험 ${won(ins)} - 세금 ${won(tax)} = ${won(net)}`;
  nsResultCard.classList.add("show"); nsResultCard.scrollIntoView({behavior:"smooth",block:"start"});
}
function copyNetSalary(){ copyText(`[실수령액 계산 결과]\n4대보험 합계: ${outInsuranceTotal.textContent}\n세금: ${outTaxInput.textContent}\n실수령액: ${outNetSalary.textContent}`); }
