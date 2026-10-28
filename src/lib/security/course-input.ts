import { text,safeExternalUrl } from "./validation";
export function courseFields(body:Record<string,unknown>,mapping:Record<string,string>){
 const result:Record<string,unknown>={};
 for(const [input,column] of Object.entries(mapping)){
  const value=body[input];if(value===undefined)continue;
  if(value===null&&["description","content","video_url","duration_minutes","video_provider"].includes(column)){result[column]=null;continue;}
  if(["position","duration_minutes"].includes(column)){
   if(typeof value!=="number"||!Number.isSafeInteger(value)||value<0||value>100000)throw new Error("INVALID_INPUT");
   result[column]=value;
  }else if(column==="is_free"){
   if(typeof value!=="boolean")throw new Error("INVALID_INPUT");result[column]=value;
  }else if(column==="video_provider"){
   if(!["youtube","vimeo","upload","external"].includes(String(value)))throw new Error("INVALID_INPUT");result[column]=value;
  }else result[column]=column==="video_url"?(value===""?null:safeExternalUrl(value)):text(value,column==="title"?200:12000,column==="title");
 }
 return result;
}
