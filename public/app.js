const $ = (id) => document.getElementById(id);
let lastPayload = null;
function status(text, busy=false){ $('status').textContent=text; $('generate').disabled=busy; }
async function generate(payload=null){
  const data = payload || {
    customerMessage:$('customerMessage').value.trim(), category:$('category').value,
    tone:$('tone').value, orderContext:$('orderContext').value.trim(),
    sellerInstructions:$('sellerInstructions').value.trim(), language:'UK English'
  };
  if(!data.customerMessage){ $('customerMessage').focus(); status('Add a buyer message'); return; }
  lastPayload=data; status('Generating…',true); $('reply').value='';
  try{
    const r=await fetch('/api/reply',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
    const result=await r.json(); if(!r.ok) throw new Error(result.error||'Request failed');
    $('reply').value=result.reply; $('copy').disabled=!result.reply; $('regenerate').disabled=!result.reply; status('Ready');
  }catch(e){status('Error'); alert(e.message);} finally{$('generate').disabled=false;}
}
$('generate').onclick=()=>generate(); $('regenerate').onclick=()=>generate(lastPayload);
$('copy').onclick=async()=>{await navigator.clipboard.writeText($('reply').value);$('copy').textContent='Copied ✓';setTimeout(()=>$('copy').textContent='Copy',1200)};
$('clear').onclick=()=>{['customerMessage','orderContext','sellerInstructions','reply'].forEach(id=>$(id).value='');$('copy').disabled=true;$('regenerate').disabled=true;lastPayload=null;status('Ready')};
