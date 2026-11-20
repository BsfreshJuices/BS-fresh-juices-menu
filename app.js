const $=id=>document.getElementById(id);
const words={
 en:{switch:"العربية",heading:"Explore Our Menu",description:"Thoughtfully prepared choices for every taste.",categoryTitle:"Categories",heroTitle:"Find Your Next Favourite.",heroText:"Explore a selection of drinks and flavours, thoughtfully prepared for you.",back:"← Back to categories",empty:"Our menu is being prepared. Please check back soon.",error:"We couldn't load the menu right now. Please try again later.",soon:"COMING SOON",days:"d",hours:"h",minutes:"m",seconds:"s"},
 ar:{switch:"English",heading:"استكشف قائمتنا",description:"خيارات مختارة بعناية لتجد ما يناسب ذوقك.",categoryTitle:"الأقسام",heroTitle:"نكهات تستحق التجربة",heroText:"مجموعة من المشروبات والنكهات المحضّرة بعناية لتختار ما تحب.",back:"العودة إلى الأقسام →",empty:"قائمتنا قيد التجهيز. زورونا قريباً.",error:"تعذّر تحميل القائمة حالياً. حاولوا مرة أخرى لاحقاً.",soon:"قريباً",days:"ي",hours:"س",minutes:"د",seconds:"ث"}
};
const USD_TO_LBP=90000;
let lang="en",client=null,allProducts=[],currentCategory=null,cats=[];
function formatPrice(value,exactLbp){const usd=Number(value);if(!Number.isFinite(usd))return "";const lbp=exactLbp!==null&&exactLbp!==undefined?Number(exactLbp):Math.round(usd*USD_TO_LBP);const displayUsd=(lbp/USD_TO_LBP).toFixed(2);return '<div class="price"><span class="price-lbp">' + new Intl.NumberFormat("en-US",{maximumFractionDigits:0}).format(lbp) + (lang==="ar"?" ل.ل.":" LBP") + '</span><span class="price-usd">$' + displayUsd + '</span></div>';}
function tr(en,ar){return lang==="ar"?(ar||en):(en||ar);}
function publicImage(path){
 if(!path||!client)return "";
 return client.storage.from("menu-images").getPublicUrl(path).data.publicUrl;
}
function renderCategories(){
 currentCategory=null;document.body.classList.remove("category-open");$("back").hidden=true;$("categoryHeaderTitle").hidden=true;
 $("homeHero").hidden=false;$("categoryTitle").hidden=false;
 $("heading").textContent=words[lang].heading;$("description").textContent=words[lang].description;
 $("heroTitle").textContent=words[lang].heroTitle;$("heroText").textContent=words[lang].heroText;
 $("categoryTitle").textContent=words[lang].categoryTitle;
 const heroItems=[];
 $("homeHero").classList.toggle("no-gallery",!heroItems.length);$("heroGallery").style.display=heroItems.length?"grid":"none";$("heroGallery").innerHTML=heroItems.length?heroItems.map((p,i)=>'<img loading="lazy" src="'+escapeAttr(publicImage(p.image_path))+'" alt="'+escapeAttr(tr(p.name_en,p.name_ar))+'">').join(""):"";
 const visible=cats;
 if(!visible.length){$("content").innerHTML='<div class="notice">'+words[lang].empty+'</div>';return;}
 $("content").innerHTML='<div class="category-grid">'+visible.map(c=>{
  const photo=c.image_path?'<img loading="lazy" src="'+escapeAttr(publicImage(c.image_path))+'" alt="'+escapeAttr(tr(c.name_en,c.name_ar))+'">':'<img alt="" src="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27400%27 height=%27200%27 viewBox=%270 0 400 200%27%3E%3Cdefs%3E%3ClinearGradient id=%27g%27 x2=%271%27 y2=%271%27%3E%3Cstop stop-color=%27%23e8eee9%27/%3E%3Cstop offset=%271%27 stop-color=%27%23f5e7d2%27/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=%27400%27 height=%27200%27 fill=%27url(%23g)%27/%3E%3C/svg%3E">';
  const launch=c.launch_at?Date.parse(c.launch_at):NaN;const isSoon=!!c.coming_soon&&(!Number.isFinite(launch)||launch>Date.now());
  const soonInfo=isSoon?'<span class="soon-info"><span class="soon-badge">'+words[lang].soon+'</span>'+(Number.isFinite(launch)?'<span class="soon-countdown" data-launch="'+escapeAttr(c.launch_at)+'"></span>':'')+'</span>':'';
  return '<button class="category'+(isSoon?' coming-soon':'')+'" type="button" '+(isSoon?'disabled':'data-cat="'+c.id+'"')+'>'+photo+'<span class="category-name"><span>'+escapeHtml(tr(c.name_en,c.name_ar))+'</span>'+(isSoon?'':'<span class="category-arrow">›</span>')+'</span>'+soonInfo+'</button>';
 }).join("")+'</div>';
 document.querySelectorAll("[data-cat]").forEach(b=>b.addEventListener("click",()=>renderProducts(b.dataset.cat)));renderSoonCountdowns();
}
function renderSoonCountdowns(){
 let expired=false;document.querySelectorAll("[data-launch]").forEach(el=>{const target=Date.parse(el.dataset.launch);const diff=target-Date.now();if(diff<=0){expired=true;return;}let s=Math.floor(diff/1000);const d=Math.floor(s/86400);s%=86400;const h=Math.floor(s/3600);s%=3600;const m=Math.floor(s/60);s%=60;const pad=n=>String(n).padStart(2,"0");el.textContent=lang==="ar"?d+" "+words.ar.days+"  "+pad(h)+" "+words.ar.hours+"  "+pad(m)+" "+words.ar.minutes+"  "+pad(s)+" "+words.ar.seconds:d+" "+words.en.days+"  "+pad(h)+" "+words.en.hours+"  "+pad(m)+" "+words.en.minutes+"  "+pad(s)+" "+words.en.seconds;});if(expired)renderCategories();
}
setInterval(()=>{if(!currentCategory)renderSoonCountdowns();},1000);
function renderProducts(id){
 currentCategory=id;const cat=cats.find(c=>c.id===id);document.body.classList.add("category-open");$("homeHero").hidden=true;$("categoryTitle").hidden=true;
 const validColor=(v,f)=>/^#[0-9a-fA-F]{6}$/.test(v||"")?v:f;
 document.documentElement.style.setProperty("--view-primary",validColor(cat?.theme_primary,"#183d32"));
 document.documentElement.style.setProperty("--view-secondary",validColor(cat?.theme_secondary,"#e8eee9"));
 document.documentElement.style.setProperty("--view-accent",validColor(cat?.theme_accent,"#b88a50"));
 document.documentElement.style.setProperty("--view-bg",validColor(cat?.theme_background,"#faf9f5"));
 $("back").hidden=false;
 $("categoryHeaderTitle").hidden=false;$("categoryHeaderTitle").textContent=tr(cat?.name_en,cat?.name_ar)||words[lang].heading;
 $("heading").textContent=tr(cat?.name_en,cat?.name_ar)||words[lang].heading;
 const items=allProducts.filter(p=>p.category_id===id);
 if(!items.length){$("content").innerHTML='<div class="notice">'+words[lang].empty+'</div>';return;}
 $("content").innerHTML='<div class="products">'+items.map(p=>{
 const image=publicImage(p.image_path);
 return '<article class="product">'+(image?'<img loading="lazy" src="'+escapeAttr(image)+'" alt="'+escapeAttr(tr(p.name_en,p.name_ar))+'">':'')+
 '<div class="info"><h3>'+escapeHtml(tr(p.name_en,p.name_ar))+'</h3>'+
 ((tr(p.description_en,p.description_ar))?'<p>'+escapeHtml(tr(p.description_en,p.description_ar))+'</p>':'')+
 (p.price!==null&&p.price!==undefined?formatPrice(p.price,p.price_lbp):'')+
 '</div></article>';
 }).join("")+'</div>';
}
function escapeHtml(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function escapeAttr(v){return escapeHtml(v);}
function applyLanguage(){
 const t=words[lang];document.documentElement.lang=lang;document.documentElement.dir=lang==="ar"?"rtl":"ltr";
 $("language").textContent=t.switch;$("description").textContent=t.description;$("back").textContent=t.back;
 if(currentCategory)renderProducts(currentCategory);else renderCategories();
}
$("language").addEventListener("click",()=>{lang=lang==="en"?"ar":"en";applyLanguage();});
$("back").addEventListener("click",renderCategories);
$("year").textContent=new Date().getFullYear();
async function start(){
 if(!window.supabase||!window.BS_SUPABASE_URL||!window.BS_SUPABASE_ANON_KEY){$("content").innerHTML='<div class="notice">'+words[lang].error+'</div>';return;}
 client=window.supabase.createClient(window.BS_SUPABASE_URL,window.BS_SUPABASE_ANON_KEY);
 try{
  const [settings,categories,products]=await Promise.all([
   client.from("site_settings").select("*").eq("id",1).maybeSingle(),
   client.from("categories").select("*").eq("is_active",true).order("sort_order").order("created_at"),
   client.from("products").select("*").eq("is_active",true).order("sort_order").order("created_at")
  ]);
  if(settings.error)throw settings.error;if(categories.error)throw categories.error;if(products.error)throw products.error;
  if(settings.data){const s=settings.data;$("brand").textContent=s.brand_name||"BS FRESH JUICES";if(s.logo_path){$("brandLogo").src=publicImage(s.logo_path);$("brandLogo").hidden=false;$("brandLogo").style.display="block";}else{$("brandLogo").hidden=true;$("brandLogo").style.display="none";}$("brand").style.display="block";$("footerBrand").textContent=s.brand_name||"BS Fresh Juices";$("tagline").textContent=tr(s.tagline_en,s.tagline_ar)||words[lang].description;/* Homepage colours stay intentionally calm and premium; category pages use their own saved themes. */}
  cats=categories.data||[];allProducts=products.data||[];applyLanguage();
 }catch(err){console.error(err);$("content").innerHTML='<div class="notice">'+words[lang].error+'</div>';}
}
start();
