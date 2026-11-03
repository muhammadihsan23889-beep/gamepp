/* siswa-picker.js — pemilih nama & kelas siswa untuk semua game.
   Taruh di folder yang sama dengan index.html portal dan siswa.json.
   Di dalam game (folder game/), pasang:
     <script src="../siswa-picker.js"></script>
     <script>SiswaPicker.ensure(function(s){ /* s.nama, s.kelas */ });</script>
*/
(function(){
  var KEY_DB='siswa_db', KEY_PILIH='siswa_dipilih';
  var SRC=document.currentScript&&document.currentScript.src;
  var BASE=SRC?SRC.replace(/[^\/]*$/,''):'';

  function muatData(){
    return fetch(BASE+'siswa.json',{cache:'no-store'})
      .then(function(r){ if(!r.ok) throw 0; return r.json(); })
      .then(function(d){ if(!d.siswa||!d.siswa.length) throw 0; return d.siswa; })
      .catch(function(){
        try{ var d=JSON.parse(localStorage.getItem(KEY_DB)||'null'); return (d&&d.siswa)||[]; }
        catch(e){ return []; }
      });
  }
  function el(t,c,x){ var e=document.createElement(t); if(c) e.className=c; if(x!==undefined) e.textContent=x; return e; }

  function css(){
    if(document.getElementById('sp-css')) return;
    var s=el('style'); s.id='sp-css';
    s.textContent=
'.sp-bg{position:fixed;inset:0;background:rgba(31,35,71,.6);display:flex;align-items:center;justify-content:center;padding:16px;z-index:99999;font-family:"Nunito",system-ui,sans-serif}'+
'.sp-box{background:#fff;color:#1f2347;width:100%;max-width:400px;border:3px solid #1f2347;border-radius:20px;box-shadow:6px 6px 0 #1f2347;padding:22px}'+
'.sp-box h2{margin:0 0 4px;font-size:1.4rem}.sp-box p{margin:0 0 14px}'+
'.sp-box label{display:block;font-weight:800;margin:12px 0 4px}'+
'.sp-box select{width:100%;font:inherit;font-weight:700;padding:11px 12px;border:3px solid #1f2347;border-radius:12px;background:#fff;color:#1f2347}'+
'.sp-box button{width:100%;margin-top:18px;font:inherit;font-weight:800;font-size:1.1rem;padding:12px;background:#ffc933;color:#1f2347;border:3px solid #1f2347;border-radius:14px;box-shadow:4px 4px 0 #1f2347;cursor:pointer}'+
'.sp-box button:disabled{opacity:.5;cursor:not-allowed}'+
'.sp-err{font-weight:700}';
    document.head.appendChild(s);
  }

  var SiswaPicker={
    get:function(){
      try{ return JSON.parse(localStorage.getItem(KEY_PILIH)||'null'); }catch(e){ return null; }
    },
    clear:function(){ try{ localStorage.removeItem(KEY_PILIH); }catch(e){} },
    open:function(cb){
      css();
      var bg=el('div','sp-bg'), box=el('div','sp-box');
      box.setAttribute('role','dialog'); box.setAttribute('aria-modal','true');
      box.append(el('h2','','Siapa kamu?'), el('p','','Pilih kelas, lalu pilih namamu.'));
      var info=el('p','sp-err','Memuat daftar siswa…'); box.append(info);
      bg.append(box); document.body.appendChild(bg);

      muatData().then(function(data){
        if(!data.length){ info.textContent='Daftar siswa belum tersedia. Mintalah guru mengunggah data siswa di portal.'; return; }
        info.remove();
        var kelas=Array.from(new Set(data.map(function(s){return s.kelas;})))
          .sort(function(a,b){return a.localeCompare(b,'id',{numeric:true});});
        var lk=el('label','','Kelas'), sk=el('select');
        sk.append(new Option('— pilih kelas —',''));
        kelas.forEach(function(k){ sk.append(new Option(k,k)); });
        var ln=el('label','','Nama'), sn=el('select'); sn.disabled=true;
        sn.append(new Option('— pilih nama —',''));
        var go=el('button','','Mulai bermain'); go.disabled=true;
        box.append(lk,sk,ln,sn,go);

        sk.addEventListener('change',function(){
          sn.replaceChildren(new Option('— pilih nama —',''));
          data.filter(function(s){return s.kelas===sk.value;})
              .map(function(s){return s.nama;})
              .sort(function(a,b){return a.localeCompare(b,'id');})
              .forEach(function(n){ sn.append(new Option(n,n)); });
          sn.disabled=!sk.value; go.disabled=true;
        });
        sn.addEventListener('change',function(){ go.disabled=!sn.value; });
        go.addEventListener('click',function(){
          var pilih={nama:sn.value,kelas:sk.value};
          try{ localStorage.setItem(KEY_PILIH,JSON.stringify(pilih)); }catch(e){}
          bg.remove();
          if(cb) cb(pilih);
        });
      });
    },
    ensure:function(cb){
      var s=this.get();
      if(s){ if(cb) cb(s); } else { this.open(cb); }
    }
  };
  window.SiswaPicker=SiswaPicker;
})();
