// shared.js — common helpers used across index.html and every standalone calculator page.
// Keeping this in one file means region detection, currency formatting, and tracking
// behave identically everywhere instead of drifting between pages over time.

const COUNTRY_DATA={IN:{flag:"🇮🇳",symbol:"₹",name:"India",currency:"INR"},US:{flag:"🇺🇸",symbol:"$",name:"United States",currency:"USD"},GB:{flag:"🇬🇧",symbol:"£",name:"United Kingdom",currency:"GBP"},AE:{flag:"🇦🇪",symbol:"د.إ",name:"UAE",currency:"AED"},SG:{flag:"🇸🇬",symbol:"S$",name:"Singapore",currency:"SGD"},AU:{flag:"🇦🇺",symbol:"A$",name:"Australia",currency:"AUD"},JP:{flag:"🇯🇵",symbol:"¥",name:"Japan",currency:"JPY"},CN:{flag:"🇨🇳",symbol:"¥",name:"China",currency:"CNY"},DE:{flag:"🇩🇪",symbol:"€",name:"Germany",currency:"EUR"},FR:{flag:"🇫🇷",symbol:"€",name:"France",currency:"EUR"},CA:{flag:"🇨🇦",symbol:"CA$",name:"Canada",currency:"CAD"},BR:{flag:"🇧🇷",symbol:"R$",name:"Brazil",currency:"BRL"},SA:{flag:"🇸🇦",symbol:"﷼",name:"Saudi Arabia",currency:"SAR"},MY:{flag:"🇲🇾",symbol:"RM",name:"Malaysia",currency:"MYR"},ZA:{flag:"🇿🇦",symbol:"R",name:"South Africa",currency:"ZAR"},ID:{flag:"🇮🇩",symbol:"Rp",name:"Indonesia",currency:"IDR"},RU:{flag:"🇷🇺",symbol:"₽",name:"Russia",currency:"RUB"},MX:{flag:"🇲🇽",symbol:"$",name:"Mexico",currency:"MXN"},NG:{flag:"🇳🇬",symbol:"₦",name:"Nigeria",currency:"NGN"},KE:{flag:"🇰🇪",symbol:"KSh",name:"Kenya",currency:"KES"}};
const FX={USD:1,INR:95.6,EUR:0.868,GBP:0.75,JPY:160.3,CNY:7.22,AED:3.6725,SGD:1.345,AUD:1.42,CAD:1.39,BRL:5.65,SAR:3.75,MYR:4.72,ZAR:18.4,IDR:16250,RUB:96.5,MXN:20.3,NGN:1620,KES:129};
let liveFX={};let lastRatesUpdate=null;
const TZ_MAP={'Asia/Kolkata':'IN','Asia/Calcutta':'IN','America/New_York':'US','America/Chicago':'US','America/Los_Angeles':'US','Europe/London':'GB','Asia/Dubai':'AE','Asia/Singapore':'SG','Australia/Sydney':'AU','Asia/Tokyo':'JP','Asia/Shanghai':'CN','Europe/Berlin':'DE','Europe/Paris':'FR','America/Toronto':'CA','America/Sao_Paulo':'BR','Asia/Riyadh':'SA','Asia/Kuala_Lumpur':'MY','Africa/Johannesburg':'ZA','Asia/Jakarta':'ID','Europe/Moscow':'RU','America/Mexico_City':'MX','Africa/Lagos':'NG','Africa/Nairobi':'KE'};
let currentRegion='IN';

function detectCountry(){try{return TZ_MAP[Intl.DateTimeFormat().resolvedOptions().timeZone]||'IN';}catch(e){return'IN';}}
function populateCountries(selectId){const sel=document.getElementById(selectId||'country-select');if(!sel)return;const preferred=['IN','US'];const g1=document.createElement('optgroup');g1.label='⭐ Preferred';preferred.forEach(c=>{const o=document.createElement('option');o.value=c;o.textContent=`${COUNTRY_DATA[c].flag} ${COUNTRY_DATA[c].name} (${COUNTRY_DATA[c].symbol})`;g1.appendChild(o);});sel.appendChild(g1);const g2=document.createElement('optgroup');g2.label='🌍 All Countries';Object.keys(COUNTRY_DATA).filter(c=>!preferred.includes(c)).forEach(c=>{const o=document.createElement('option');o.value=c;o.textContent=`${COUNTRY_DATA[c].flag} ${COUNTRY_DATA[c].name} (${COUNTRY_DATA[c].currency})`;g2.appendChild(o);});sel.appendChild(g2);}
function applyRegion(code){currentRegion=code;const d=COUNTRY_DATA[code]||COUNTRY_DATA.IN;const fp=document.getElementById('flag-preview');if(fp)fp.textContent=d.flag;document.querySelectorAll('.cur-symbol').forEach(el=>el.textContent=d.symbol);}
function onCountryChange(){const badge=document.getElementById('auto-badge');if(badge)badge.style.display='none';const sel=document.getElementById('country-select');if(sel)applyRegion(sel.value);trackEvent('region_changed',{region:currentRegion});}
function initRegion(){populateCountries('country-select');const detected=detectCountry();const sel=document.getElementById('country-select');if(sel){for(let i=0;i<sel.options.length;i++)if(sel.options[i].value===detected){sel.selectedIndex=i;break;}}applyRegion(detected);}

async function fetchLiveRates(){try{const res=await fetch('https://open.er-api.com/v6/latest/USD');const data=await res.json();liveFX=data.rates;lastRatesUpdate=new Date();}catch{liveFX={...FX};}}
function getLiveRate(c){return liveFX[c]||FX[c]||1;}
function getLastUpdateTime(){return lastRatesUpdate?lastRatesUpdate.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'}):'Not updated';}
window.refreshCurrencyRates=async function(){const btns=document.querySelectorAll('button[onclick*="refreshCurrencyRates"]');btns.forEach(b=>{b.disabled=true;b.textContent='⏳ Updating...';});await fetchLiveRates();const el=document.getElementById('cur-update-time');if(el)el.textContent=getLastUpdateTime();btns.forEach(b=>{b.disabled=false;b.textContent='🔄 Refresh';});};

function fmt(n,decimals=0){n=parseFloat(n);if(isNaN(n))return'—';const d=COUNTRY_DATA[currentRegion]||COUNTRY_DATA.IN;if(currentRegion==='IN'&&decimals===0){let s=Math.round(n).toString();if(s.length<=3)return d.symbol+s;let last3=s.slice(-3),rest=s.slice(0,-3);rest=rest.replace(/\B(?=(\d{2})+(?!\d))/g,',');return d.symbol+rest+','+last3;}return d.symbol+(decimals?parseFloat(n.toFixed(decimals)).toLocaleString('en-US'):Math.round(n).toLocaleString('en-US'));}
function fmtRaw(n,decimals=2){return parseFloat(n).toFixed(decimals);}
function getSym(){return(COUNTRY_DATA[currentRegion]||COUNTRY_DATA.IN).symbol;}
function showResults(id,boxes){const el=document.getElementById(id);if(!el)return;el.style.display='grid';el.innerHTML=boxes.map((b,i)=>`<div class="result-box${b.h?' highlight':''}" style="animation-delay:${i*0.05}s"><div class="result-label">${b.label}</div><div class="result-value${b.c?' '+b.c:''}">${b.value}</div></div>`).join('');trackEvent('calculation_performed',{result_container:id});}
function showError(msg,containerId){const d=document.createElement('div');d.style.cssText='background:rgba(209,67,67,0.10);color:#D14343;padding:12px 16px;border-radius:10px;margin:10px 0;border:1px solid rgba(209,67,67,0.30);font-size:13.5px;';d.innerHTML=`⚠️ ${msg}`;const mb=containerId?document.getElementById(containerId):document.querySelector('.calc-panel');if(mb){mb.prepend(d);setTimeout(()=>d.remove(),4500);}else alert(msg);}

function trackEvent(name,params={}){if(typeof gtag==='function')gtag('event',name,params);}

// COOKIE CONSENT — uses Google Consent Mode. The gtag/adsbygoogle scripts are already
// loaded in <head> with a default-denied consent state; accept/reject just updates that state.
function showCookieBanner(){const b=document.getElementById('cookie-banner');if(b&&!localStorage.getItem('cookieConsent'))b.style.display='flex';}
function updateConsent(state){if(typeof gtag==='function'){gtag('consent','update',{ad_storage:state,analytics_storage:state,ad_user_data:state,ad_personalization:state});}}
function acceptCookies(){localStorage.setItem('cookieConsent','accepted');const b=document.getElementById('cookie-banner');if(b)b.style.display='none';updateConsent('granted');}
function rejectCookies(){localStorage.setItem('cookieConsent','rejected');const b=document.getElementById('cookie-banner');if(b)b.style.display='none';updateConsent('denied');}
function checkCookieConsent(){const c=localStorage.getItem('cookieConsent');if(c==='accepted')updateConsent('granted');else if(c==='rejected')updateConsent('denied');else setTimeout(showCookieBanner,2000);}
function showEmail(){window.location.href='mailto:gameconnectflash@gmail.com';}
function checkAnnouncement(){const b=document.getElementById('announce-bar');if(b&&!localStorage.getItem('announceDismissed_resumebuilder'))b.style.display='flex';}
function closeAnnouncement(){localStorage.setItem('announceDismissed_resumebuilder','1');const b=document.getElementById('announce-bar');if(b)b.style.display='none';}
function showTerms(){const m=document.getElementById('terms-modal');if(m)m.classList.add('active');}
function showPrivacy(){const m=document.getElementById('privacy-modal');if(m)m.classList.add('active');}
function showAbout(){const m=document.getElementById('about-modal');if(m)m.classList.add('active');}
function showContact(){const m=document.getElementById('contact-modal');if(m)m.classList.add('active');}
