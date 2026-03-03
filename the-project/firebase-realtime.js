/**
 * FIREBASE REALTIME — LuxHaven360 Community Hub
 * Sostituisce GAS per: messaggi, conversazioni, typing, presenza online
 *
 * SETUP:
 * 1. https://console.firebase.google.com → Crea progetto "luxhaven360"
 * 2. Menu → Realtime Database → Crea database → eur3 → Modalità test
 * 3. Panoramica progetto → icona </> → Registra app web → copia config
 * 4. Incolla la config in FIREBASE_CONFIG qui sotto
 * 5. In community-hub.html, prima di </body>, aggiungi:
 *    <script src="firebase-realtime.js"></script>
 */
(function() {
'use strict';

/* ① CONFIGURAZIONE — sostituisci con i tuoi dati */
var FIREBASE_CONFIG = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL:       "https://YOUR_PROJECT_ID-default-rtdb.europe-west1.firebasedatabase.app",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};

function loadScript(src) {
  return new Promise(function(res, rej) {
    if (document.querySelector('script[src="'+src+'"]')) { res(); return; }
    var s = document.createElement('script');
    s.src = src; s.onload = res; s.onerror = function() { rej(new Error('Load failed: '+src)); };
    document.head.appendChild(s);
  });
}

function encodeEmail(e) { return (e||'').toLowerCase().replace(/\./g,',').replace(/@/g,'_at_'); }
function decodeEmail(k) { return k.replace(/,/g,'.').replace(/_at_/g,'@'); }
function chatId(e1,e2)  { return [e1,e2].map(encodeEmail).sort().join('___'); }

var _db=null, _presRef=null, _msgOff=null, _typOff=null, _typTimer=null;

/* ② PRESENZA */
function setupPresence(user) {
  var ref = _db.ref('/presence/'+encodeEmail(user.email));
  _presRef = ref;
  ref.set({ name:user.name||'', initial:user.initial||'?', role:user.role||'', online:true, lastSeen:firebase.database.ServerValue.TIMESTAMP });
  ref.onDisconnect().update({ online:false, lastSeen:firebase.database.ServerValue.TIMESTAMP });
  document.addEventListener('visibilitychange', function() {
    if (!_presRef) return;
    _presRef.update({ online: document.visibilityState==='visible', lastSeen:firebase.database.ServerValue.TIMESTAMP });
  });
  window.addEventListener('beforeunload', function() {
    if (_presRef) _presRef.update({ online:false, lastSeen:firebase.database.ServerValue.TIMESTAMP });
  });
}

function listenPresence() {
  _db.ref('/presence').on('value', function(snap) {
    var val=snap.val()||{}, list=[];
    Object.keys(val).forEach(function(k) {
      var d=val[k];
      if (d&&d.online) list.push({ email:decodeEmail(k), name:d.name||'', initial:d.initial||'?', role:d.role||'', online:true });
    });
    if (typeof ONLINE_MEMBERS!=='undefined') { ONLINE_MEMBERS.length=0; list.forEach(function(m){ ONLINE_MEMBERS.push(m); }); }
    if (typeof applyPresenceData==='function') applyPresenceData(list);
    if (typeof currentConvPartnerEmail!=='undefined' && currentConvPartnerEmail) {
      var el=document.getElementById('chatHeaderStatus');
      if (el) {
        var on=list.some(function(m){ return m.email.toLowerCase()===currentConvPartnerEmail.toLowerCase(); });
        el.textContent=on?'● Online':'○ Offline'; el.className='chat-header-status'+(on?'':' offline');
      }
    }
  });
}

/* ③ CONVERSAZIONI */
function listenConversations(user) {
  _db.ref('/conversations/'+encodeEmail(user.email)).on('value', function(snap) {
    var val=snap.val()||{};
    var convs=Object.keys(val).map(function(k){ return val[k]; })
      .filter(function(c){ return c&&c.partnerEmail; })
      .map(function(c) {
        var info=(typeof getPartnerInfo==='function')?getPartnerInfo(c.partnerEmail):{};
        var active=(typeof currentConvPartnerEmail!=='undefined')&&currentConvPartnerEmail&&c.partnerEmail.toLowerCase()===currentConvPartnerEmail.toLowerCase();
        return { partnerEmail:c.partnerEmail, partnerName:c.partnerName||info.name||'', partnerInitial:c.partnerInitial||info.initial||'?', partnerRole:c.partnerRole||info.role||'', lastMessage:c.lastMessage||'', lastTs:c.lastTs||'', unread:active?0:(c.unread||0) };
      })
      .sort(function(a,b){ return new Date(b.lastTs||0)-new Date(a.lastTs||0); });

    if (typeof currentConvPartnerEmail!=='undefined'&&currentConvPartnerEmail) {
      var has=convs.some(function(c){ return c.partnerEmail.toLowerCase()===currentConvPartnerEmail.toLowerCase(); });
      if (!has) {
        var pi=(typeof getPartnerInfo==='function')?getPartnerInfo(currentConvPartnerEmail):{};
        convs.unshift({ partnerEmail:currentConvPartnerEmail, partnerName:pi.name||'', partnerInitial:pi.initial||'?', partnerRole:pi.role||'', lastMessage:'', lastTs:new Date().toISOString(), unread:0 });
      }
    }

    if (typeof REAL_CONVS!=='undefined') { REAL_CONVS.length=0; convs.forEach(function(c){ REAL_CONVS.push(c); }); }
    if (typeof renderConversations==='function') renderConversations();

    var total=convs.reduce(function(s,c){ return s+(c.unread||0); },0);
    var badge=document.getElementById('msgNavBadge');
    if (badge) { badge.textContent=total>0?String(total):''; badge.style.display=total>0?'':'none'; }
  });
}

/* ④ MESSAGGI */
function listenMessages(partnerEmail) {
  var el=document.getElementById('chatMessages');
  if (el) el.innerHTML='<div class="chat-skeleton"><div class="chat-skel-row"><div class="chat-skel-av"></div><div class="chat-skel-bubble"></div></div><div class="chat-skel-row sent"><div class="chat-skel-av"></div><div class="chat-skel-bubble"></div></div><div class="chat-skel-row"><div class="chat-skel-av"></div><div class="chat-skel-bubble"></div></div><div class="chat-skel-row sent"><div class="chat-skel-av"></div><div class="chat-skel-bubble"></div></div></div>';

  var ref=_db.ref('/messages/'+chatId(currentUser.email,partnerEmail));
  ref.orderByChild('ts').once('value', function(snap) {
    var val=snap.val()||{};
    var msgs=Object.keys(val).map(function(k){ return val[k]; }).filter(Boolean).sort(function(a,b){ return new Date(a.ts)-new Date(b.ts); });
    if (typeof renderChatMessages==='function') renderChatMessages(msgs, partnerEmail);
    var lastTs=msgs.length>0?msgs[msgs.length-1].ts:new Date(0).toISOString();
    if (_msgOff) { _msgOff(); _msgOff=null; }
    var newRef=ref.orderByChild('ts').startAfter(lastTs);
    var h=newRef.on('child_added', function(s) {
      var msg=s.val(); if (!msg) return;
      if (msg.from.toLowerCase()===currentUser.email.toLowerCase()) return;
      if (typeof currentConvPartnerEmail==='undefined'||currentConvPartnerEmail.toLowerCase()!==partnerEmail.toLowerCase()) return;
      if (typeof removeTypingIndicator==='function') removeTypingIndicator();
      if (typeof appendMessageToChat==='function') appendMessageToChat(msg,false);
      _db.ref('/conversations/'+encodeEmail(currentUser.email)+'/'+encodeEmail(partnerEmail)+'/unread').set(0);
    });
    _msgOff=function(){ newRef.off('child_added',h); };
  });
}

function stopMsg() { if (_msgOff){ _msgOff(); _msgOff=null; } }

/* ⑤ TYPING */
function listenTyping(partnerEmail) {
  var ref=_db.ref('/typing/'+chatId(currentUser.email,partnerEmail)+'/'+encodeEmail(partnerEmail));
  if (_typOff) { _typOff(); _typOff=null; }
  var h=ref.on('value', function(snap) {
    var d=snap.val();
    if (d&&d.isTyping) { if (typeof showTypingIndicator==='function') showTypingIndicator(); }
    else { if (typeof removeTypingIndicator==='function') removeTypingIndicator(); }
  });
  _typOff=function(){ ref.off('value',h); };
}

function stopTyp() { if (_typOff){ _typOff(); _typOff=null; } }

/* ⑥ OVERRIDE FUNZIONI GLOBALI */
window.startPresenceSystem=function(){ if(!_db||!currentUser) return; setupPresence(currentUser); listenPresence(); };
window.sendHeartbeat=function(){};
window.removePresence=function(){ if(_presRef) _presRef.update({online:false,lastSeen:firebase.database.ServerValue.TIMESTAMP}); };
window.loadConversations=function(){ if(!_db||!currentUser) return; listenConversations(currentUser); };
window.loadChatMessages=function(p){ stopMsg(); stopTyp(); listenMessages(p); listenTyping(p); };

window.sendMessage=function() {
  var input=document.getElementById('chatInput');
  var text=(input?input.value:'').trim();
  if (!text||!currentUser||!currentConvPartnerEmail) return;
  input.value='';
  if (typeof clearTypingStatus==='function') clearTypingStatus();
  var ts=new Date().toISOString();
  var msgId='msg_'+Date.now()+'_'+Math.random().toString(36).substr(2,7);
  var info=(typeof getPartnerInfo==='function')?getPartnerInfo(currentConvPartnerEmail):{};
  var partner=currentConvPartnerEmail;
  var msg={id:msgId,from:currentUser.email,fromName:currentUser.name||'',fromInitial:currentUser.initial||'?',text:text,ts:ts};
  if (typeof appendMessageToChat==='function') appendMessageToChat(msg,true);
  if (!_db) return;
  var cId=chatId(currentUser.email,partner);
  var preview=text.length>70?text.substring(0,70)+'...':text;
  _db.ref('/messages/'+cId+'/'+msgId).set(msg).then(function() {
    return _db.ref('/conversations/'+encodeEmail(partner)+'/'+encodeEmail(currentUser.email)+'/unread').once('value');
  }).then(function(s) {
    var prev=s.val()||0;
    return Promise.all([
      _db.ref('/conversations/'+encodeEmail(currentUser.email)+'/'+encodeEmail(partner)).set({ partnerEmail:partner,partnerName:info.name||'',partnerInitial:info.initial||'?',partnerRole:info.role||'',lastMessage:preview,lastTs:ts,unread:0 }),
      _db.ref('/conversations/'+encodeEmail(partner)+'/'+encodeEmail(currentUser.email)).set({ partnerEmail:currentUser.email,partnerName:currentUser.name||'',partnerInitial:currentUser.initial||'?',partnerRole:currentUser.role||'',lastMessage:preview,lastTs:ts,unread:prev+1 })
    ]);
  }).then(function() {
    if (typeof GAS_URL!=='undefined'&&GAS_URL&&GAS_URL.indexOf('YOUR_GAS')===-1) {
      fetch(GAS_URL+'?action=send_message&fromEmail='+encodeURIComponent(currentUser.email)+'&toEmail='+encodeURIComponent(partner)+'&message='+encodeURIComponent(text)+'&fromName='+encodeURIComponent(currentUser.name||'')).catch(function(){});
    }
  }).catch(function(e) {
    console.error('[Firebase] sendMessage:',e);
    if (typeof showToast==='function') showToast('red','⚠️','Errore invio messaggio.');
  });
};

window.sendTypingStatus=function(isTyping) {
  if (!_db||typeof currentConvPartnerEmail==='undefined'||!currentConvPartnerEmail||!currentUser) return;
  var ref=_db.ref('/typing/'+chatId(currentUser.email,currentConvPartnerEmail)+'/'+encodeEmail(currentUser.email));
  if (isTyping) {
    ref.set({isTyping:true,ts:firebase.database.ServerValue.TIMESTAMP});
    ref.onDisconnect().remove();
    if (_typTimer) clearTimeout(_typTimer);
    _typTimer=setTimeout(function(){ if(typeof clearTypingStatus==='function') clearTypingStatus(); },5000);
  } else {
    ref.remove();
    if (_typTimer){ clearTimeout(_typTimer); _typTimer=null; }
  }
};

window.clearTypingStatus=function() {
  if (_typTimer){ clearTimeout(_typTimer); _typTimer=null; }
  if (!_db||typeof currentConvPartnerEmail==='undefined'||!currentConvPartnerEmail||!currentUser) return;
  _db.ref('/typing/'+chatId(currentUser.email,currentConvPartnerEmail)+'/'+encodeEmail(currentUser.email)).remove();
};

window.startMessagePolling=function(){};
window.stopMessagePolling=function(){};
window.pollMessages=function(){};

var _origOpen=window.openConvByEmail;
window.openConvByEmail=function(p){ stopMsg(); stopTyp(); if(typeof clearTypingStatus==='function') clearTypingStatus(); if(typeof _origOpen==='function') return _origOpen(p); };

/* ⑦ BOOT */
function boot() {
  loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js')
    .then(function(){ return loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js'); })
    .then(function() {
      if (!window.firebase) throw new Error('Firebase SDK non trovato');
      if (!firebase.apps||!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
      _db=firebase.database();
      console.log('[Firebase] ✅ Connesso');
      var n=0, t=setInterval(function() {
        if (++n>150){ clearInterval(t); return; }
        if (typeof currentUser!=='undefined'&&currentUser&&currentUser.email) {
          clearInterval(t);
          console.log('[Firebase] 🚀 Avviato per '+currentUser.email);
          startPresenceSystem();
          loadConversations();
        }
      },200);
    }).catch(function(e){ console.error('[Firebase] ❌',e.message); });
}

if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();
