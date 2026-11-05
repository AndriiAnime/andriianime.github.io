'use strict';
const kawaii=document.body.dataset.theme==='kawaii';
const KEY=kawaii?'andrii-training-alpha01-tanya-v1':'andrii-training-alpha01-v1';
const LEGACY_KEY=kawaii?'andrii-training-week1-tanya-kawaii-v1':'andrii-training-week1-v1';
const slots=[{label:'А',day:1,goal:'Вертикальна тяга, жим, квадрицепси та привідні м’язи.'},{label:'Б',day:3,goal:'Горизонтальна тяга, задня поверхня стегна, сідниці та плечі.'},{label:'В',day:5,goal:'Вертикальна тяга, ноги та пряме навантаження на руки.'}];
const modeNames={park:'майданчик',home:'вдома',mixed:'майданчик + дім'};
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function today(){const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');}
const defaults={day:0,mode:'park',date:today(),anchor:false,logs:{},review:''};
let storageOK=true,state;
try{const raw=JSON.parse(localStorage.getItem(KEY)||'null');state=raw&&typeof raw==='object'&&!Array.isArray(raw)?{...defaults,...raw}:structuredClone(defaults);}catch{state=structuredClone(defaults);storageOK=false;}
if(!state.logs||typeof state.logs!=='object'||Array.isArray(state.logs))state.logs={};
if(typeof state.review!=='string')state.review='';
if(![0,1,2].includes(state.day))state.day=0;
if(!Object.hasOwn(modeNames,state.mode))state.mode='park';
if(!/^\d{4}-\d{2}-\d{2}$/.test(state.date))state.date=today();
state.anchor=state.anchor===true;
function getIds(day=state.day,mode=state.mode,anchor=state.anchor){return layouts[day].map(id=>mode==='home'?({pull:anchor?'pulldown':'hiprow',dips:'bandpush',row2:'bandrow2',row3:'bandrow3'}[id]||id):id);}
function logKey(){return `${state.date}|${state.day}|${state.mode}`;}
function getLog(){const k=logKey();if(!state.logs[k]||typeof state.logs[k]!=='object')state.logs[k]={};const log=state.logs[k];if(!log.ex||typeof log.ex!=='object')log.ex={};log.date=state.date;log.day=state.day;log.mode=state.mode;log.anchor=state.anchor;return log;}
function hasContent(log){return !!(log.sleep||log.duration||log.skate||log.effort||log.pain||log.nextday||log.notes||Object.values(log.ex||{}).some(e=>e&&(e.actual||e.rir||e.setup||e.done)));}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));storageOK=true;}catch{storageOK=false;}$('storage-note').textContent=storageOK?'Збережено в цьому браузері. Дані не надсилаються в чат чи на GitHub. Для надійної копії завантаж .txt або резервну копію; очищення браузера може видалити записи.':'Браузер не дозволив збереження. Завантаж фідбек або резервну копію до закриття сторінки.';$('storage-note').classList.toggle('storage-warning',!storageOK);}
let toastHandle;
function toast(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastHandle);toastHandle=setTimeout(()=>$('toast').hidden=true,4200);}
function historyRender(){const entries=Object.entries(state.logs).filter(([,v])=>v&&hasContent(v)&&[0,1,2].includes(v.day)&&Object.hasOwn(modeNames,v.mode)).sort((a,b)=>b[1].date.localeCompare(a[1].date));$('history-select').innerHTML='<option value="">Обрати запис…</option>'+entries.map(([k,l])=>`<option value="${esc(k)}">${esc(l.date)} · ${slots[l.day].label} · ${modeNames[l.mode]}</option>`).join('');if(entries.some(([k])=>k===logKey()))$('history-select').value=logKey();}
function hashRead(){const p=new URLSearchParams(location.hash.slice(1)),d=Number(p.get('day'));if(p.has('day')&&Number.isInteger(d)&&d>=1&&d<=3)state.day=d-1;if(Object.hasOwn(modeNames,p.get('mode')))state.mode=p.get('mode');}
function hashWrite(){try{history.replaceState(null,'','#day='+(state.day+1)+'&mode='+state.mode);}catch{}}
function dose(x){return x.hold?'1 × 20–40 с + 1 × 30–60 с на бік':`${x.sets} × ${x.reps}${x.unit?' '+x.unit:''}`;}
function restoreContext(){const log=state.logs[logKey()];if(log&&typeof log.anchor==='boolean')state.anchor=log.anchor;}
function locationLabel(id){if(state.mode!=='mixed')return '';return ['pull','dips','row2','row3'].includes(id)?' · на майданчику':' · вдома';}
function render(){
 const slot=slots[state.day],home=state.mode==='home',mixed=state.mode==='mixed',log=getLog(),ids=getIds();
 document.querySelectorAll('[data-day]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.day)===state.day)));
 document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===state.mode)));
 $('equipment-label').textContent=home?'РЕЗИНКИ / КИЛИМОК / СТІЙКА ОПОРА':'ТУРНІК / БРУСИ / РЕЗИНКИ / КИЛИМОК';
 $('session-label').textContent='ALPHA 01 / '+modeNames[state.mode].toUpperCase();
 $('session-title').textContent='Заняття '+slot.label+' · 60 хв';
 $('session-description').textContent=slot.goal;
 $('session-notice').innerHTML=mixed?'<strong>Спочатку вправи на перекладинах надворі, решта — вдома.</strong> Збережи кількість підходів. Коли пара розділена переходом, виконуй її вправи окремо: 2–3 хв між основними підходами, 60–90 с між допоміжними. Після переходу розімнись 2–3 хв; час дороги в годину не входить.':home?'<strong>Кожна домашня вправа замінює один слот.</strong> Підходи й пари ті самі. За замовчуванням верхнього кріплення немає: замість підтягувань показана тяга до таза. Якщо маєш перевірене кріплення, увімкни його нижче.':'<strong>Працюй парами: 1а + 1б, потім наступний блок.</strong> Блоки 1–2: 45–60 с між вправами, 90 с після пари. Блоки 3–4: 20–30 с між вправами, 60–90 с після пари. На майданчик візьми резинки й килимок.';
 $('anchor-choice').hidden=!(home&&state.day!==1);$('anchor-toggle').checked=state.anchor;
 $('exercise-list').innerHTML=ids.map((id,i)=>{
  const x=exercises[id],saved=log.ex[id]||{},block=Math.floor(i/2)+1,label=block+(i%2?'б':'а');
  const first=i%2===0;
  const header=first?`<div class="block-heading"><h3>Блок ${block} · ${exercises[ids[i]].sets===exercises[ids[i+1]].sets?exercises[ids[i]].sets+' кола':'2 кола + 1 підхід '+block+'а'}</h3><p>${mixed?'Для розділеної пари виконуй вправи окремо з повними паузами.':block<3?'45–60 с між вправами · 90 с після пари':'20–30 с між вправами · 60–90 с після пари'}</p></div>`:'';
  const target=x.hold?'≈ 5 с чистої форми':x.rir==='контроль'?'якість руху':x.rir+' повторення';
  const rirLabel=x.hold?'Запас часу, с':x.rir==='контроль'?'Контроль / примітка':'RIR за підходами';
  const placeholder=x.hold?'Л 30 / 45; П 30 / 45':x.unit?'Л 12 / 12; П 12 / 12':x.sets===3?'12 / 11 / 10':'12 / 12';
  return header+`<article class="exercise ${saved.done?'done':''}" id="exercise-${id}"><div class="exercise-header"><span class="exercise-index">${label}</span><div><h3>${x.name}</h3><div class="exercise-group">${x.group}${locationLabel(id)}</div></div><label class="complete"><input type="checkbox" data-ex="${id}" data-prop="done" ${saved.done?'checked':''} aria-label="Позначити ${x.name}: виконано"><span>Готово</span></label></div><div class="prescription"><div><span class="metric-label">ПІДХОДИ × ПОВТОРЕННЯ</span><span class="metric-value">${x.hold?'1 × 20–40 с<br>1 × 30–60 с':x.sets+' × '+x.reps} <small>${x.unit}</small></span></div><div><span class="metric-label">БЛОК / ПАРА</span><span class="metric-value">${block}а + ${block}б</span></div><div><span class="metric-label">ЗАПАС / ОРІЄНТИР</span><span class="metric-value">${target}</span></div></div><p class="technique">${x.cue}</p><details><summary>Техніка й адаптація</summary><p>${x.detail}</p></details><div class="exercise-log ${x.band?'band-log':''}"><label class="field">Мій результат<input type="text" data-ex="${id}" data-prop="actual" value="${esc(saved.actual)}" placeholder="${placeholder}" aria-label="Результат: ${x.name}"></label><label class="field">${rirLabel}<input type="text" data-ex="${id}" data-prop="rir" value="${esc(saved.rir)}" placeholder="${x.hold?'5 / 5':x.rir==='контроль'?'Чисто':'2 / 2 / 1'}" aria-label="${rirLabel}: ${x.name}"></label>${x.band?`<label class="field setup-field">Резинка / хват / налаштування<input type="text" data-ex="${id}" data-prop="setup" value="${esc(saved.setup)}" placeholder="№, довжина / хват, варіант"></label>`:''}</div></article>`;
 }).join('');
 document.querySelectorAll('[data-field]').forEach(el=>el.value=log[el.dataset.field]||'');
 $('review-notes').value=state.review;$('feedback-output').hidden=true;updateProgress();historyRender();hashWrite();save();
}
function updateProgress(){const ids=getIds(),log=getLog(),n=ids.filter(id=>log.ex[id]?.done).length;$('completion-label').textContent=n+' / '+ids.length+' вправ';$('completion-fill').style.width=(n/ids.length*100)+'%';}
function report(){const log=getLog(),slot=slots[state.day],show=v=>v===undefined||v===null||v===''?'—':String(v);const lines=['ТРЕНУВАННЯ · ALPHA 01 · ГІПЕРТРОФІЯ','Заняття '+slot.label+' · '+modeNames[state.mode],'Дата: '+state.date,'Сон: '+show(log.sleep)+' год; тривалість із розминкою: '+show(log.duration)+' хв','Скейт і готовність: '+show(log.skate),'','ВПРАВИ'];for(const [i,id] of getIds().entries()){const x=exercises[id],e=log.ex[id]||{};lines.push((Math.floor(i/2)+1)+(i%2?'б':'а')+' · '+x.name+' ['+dose(x)+']: '+show(e.actual)+'; '+(x.hold?'запас, с':x.rir==='контроль'?'контроль':'технічний RIR')+' '+show(e.rir)+(e.setup?'; налаштування: '+e.setup:'')+(e.done?' · позначено виконаним':''));}lines.push('','Важкість заняття: '+show(log.effort)+'/10','Біль / дискомфорт: '+show(log.pain),'Наступного ранку: '+show(log.nextday),'Зміни / пропуски / питання: '+show(log.notes));if(state.review.trim())lines.push('','НОТАТКИ ТАНІ',state.review.trim());return lines.join('\n');}
async function copyText(text,fallback){try{if(!navigator.clipboard)throw new Error('unavailable');await navigator.clipboard.writeText(text);toast('Скопійовано. Можна вставити в чат.');}catch{fallback();toast('Виділи й скопіюй текст нижче або завантаж .txt.');}}
function showReport(){const el=$('feedback-text');el.value=report();$('feedback-output').hidden=false;return el;}
function download(content,name,type){const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
document.querySelectorAll('[data-day]').forEach(el=>el.addEventListener('click',()=>{state.day=Number(el.dataset.day);restoreContext();render();}));
document.querySelectorAll('[data-mode]').forEach(el=>el.addEventListener('click',()=>{state.mode=el.dataset.mode;restoreContext();render();}));
$('anchor-toggle').addEventListener('change',e=>{state.anchor=e.target.checked;render();});
$('exercise-list').addEventListener('input',e=>{const el=e.target;if(!el.dataset.ex)return;const log=getLog();log.ex[el.dataset.ex]||={};log.ex[el.dataset.ex][el.dataset.prop]=el.type==='checkbox'?el.checked:el.value;if(el.type==='checkbox'){el.closest('.exercise').classList.toggle('done',el.checked);updateProgress();}save();historyRender();if(!$('feedback-output').hidden)showReport();});
document.querySelectorAll('[data-field]').forEach(el=>{if(el.dataset.field==='date'){el.addEventListener('change',()=>{if(!el.value){el.value=state.date;return;}state.date=el.value;restoreContext();render();});return;}el.addEventListener('input',()=>{getLog()[el.dataset.field]=el.value;save();historyRender();if(!$('feedback-output').hidden)showReport();});});
$('history-select').addEventListener('change',e=>{const log=state.logs[e.target.value];if(!log)return;state.day=log.day;state.date=log.date;state.mode=log.mode;state.anchor=!!log.anchor;render();});
$('today-button').addEventListener('click',()=>{state.date=today();restoreContext();render();toast('Обрана сьогоднішня дата. Наявні записи збережені.');});
$('review-notes').addEventListener('input',e=>{state.review=e.target.value;save();if(!$('feedback-output').hidden)showReport();});
$('show-feedback').addEventListener('click',showReport);
$('copy-feedback').addEventListener('click',()=>copyText(report(),()=>{const el=showReport();el.focus();el.select();}));
$('download-feedback').addEventListener('click',()=>download(report(),`training-alpha01-${state.date}-${state.day+1}-${state.mode}.txt`,'text/plain;charset=utf-8'));
$('backup-button').addEventListener('click',()=>{let legacy=null;try{legacy=JSON.parse(localStorage.getItem(LEGACY_KEY)||'null');}catch{}download(JSON.stringify({program:'Alpha 01',exportedAt:new Date().toISOString(),current:state,week1:legacy},null,2),`training-backup-${state.date}-${kawaii?'tanya':'andrii'}.json`,'application/json');});
$('print-button').addEventListener('click',()=>window.print());
$('share-button').addEventListener('click',()=>{const link=location.href.split('#')[0]+'#day='+(state.day+1)+'&mode='+state.mode;copyText(link,()=>{const el=$('feedback-text');el.value=link;$('feedback-output').hidden=false;el.focus();el.select();});});
window.addEventListener('hashchange',()=>{if(!location.hash.startsWith('#day=')&&!location.hash.startsWith('#mode='))return;hashRead();render();});
let printDetails=[];window.addEventListener('beforeprint',()=>{printDetails=[...document.querySelectorAll('.main-column details')].map(el=>[el,el.open]);printDetails.forEach(([el])=>el.open=true);});window.addEventListener('afterprint',()=>{printDetails.forEach(([el,open])=>el.open=open);printDetails=[];});
let timerPreset=90,remaining=90,deadline=0,running=false,timerInterval;
function timerRender(){$('timer-clock').textContent=String(Math.floor(remaining/60)).padStart(2,'0')+':'+String(remaining%60).padStart(2,'0');$('timer-start').textContent=running?'Пауза':remaining===0?'Ще раз':'Старт';$('timer-duration').value=timerPreset;}
function tick(){if(!running)return;remaining=Math.max(0,Math.ceil((deadline-Date.now())/1000));if(!remaining){running=false;clearInterval(timerInterval);toast('Пауза завершена. Оціни готовність до наступного підходу.');}timerRender();}
function resetTimer(seconds=timerPreset){clearInterval(timerInterval);running=false;timerPreset=seconds;remaining=seconds;timerRender();}
$('timer-duration').addEventListener('change',e=>resetTimer(Number(e.target.value)));
$('timer-reset').addEventListener('click',()=>resetTimer());
$('timer-start').addEventListener('click',()=>{if(running){tick();running=false;clearInterval(timerInterval);}else{if(!remaining)remaining=timerPreset;deadline=Date.now()+remaining*1000;running=true;timerInterval=setInterval(tick,250);}timerRender();});document.addEventListener('visibilitychange',tick);
hashRead();render();timerRender();
