/**
 * Informational external demo probe. Never turns HTTP errors into a "live demo" claim.
 * Needs ordinary outbound HTTPS; run in GitHub Actions after checkout.
 */
const url="https://msrobotika.github.io/AB-PLC-Simulator/";
let outcome="NO_VERIFICADO",code=null;
try {
  const response=await fetch(url,{redirect:"follow",signal:AbortSignal.timeout(12000)});
  code=response.status;
  const contentType=response.headers.get("content-type")??"";
  const html=contentType.includes("text/html")?await response.text():"";
  if(response.ok && /AB-PLC Simulator/i.test(html))
    outcome="DEMO_CONFIRMADA_HTTP";
  else if(response.status===404)
    outcome="NO_DESPLEGADA_HTTP_404";
  else outcome="NO_VERIFICADO_HTTP_"+response.status;
}catch(error){
  outcome="NO_VERIFICADO_RED_"+String(error?.cause?.code??error?.name??"ERROR").slice(0,80);
}
process.stdout.write(JSON.stringify({checked:url,http_status:code,result:outcome,
  disclaimer:"HTTP only; no browser functionality or hardware validation"})+"\n");
