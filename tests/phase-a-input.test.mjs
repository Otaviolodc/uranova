import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fileType} from '../src/lib/security/files.ts';
import {exactKeys,safeExternalUrl,uuid,storedPaths} from '../src/lib/security/validation.ts';
import {courseFields} from '../src/lib/security/course-input.ts';
test('negative: mass assignment, UUID, redirect protocols and file paths',()=>{
 assert.throws(()=>exactKeys({title:'test',user_id:'other'},['title']));assert.throws(()=>uuid('missing'));
 for(const x of ['javascript:alert(1)','data:text/html,test','https://user:password@example.invalid'])assert.throws(()=>safeExternalUrl(x));
 assert.equal(safeExternalUrl('https://example.invalid/path'),'https://example.invalid/path');
 assert.throws(()=>storedPaths('["../x"]'));assert.throws(()=>courseFields({position:-1},{position:'position'}));
});
test('negative: upload content must match allowed signature; public HTML/SVG/PDF blocked',()=>{
 for(const data of ['<svg></svg>','<html>test</html>','%PDF-1.7'])assert.throws(()=>fileType(Buffer.from(data),true));
 assert.equal(fileType(Buffer.from('%PDF-1.7'),false).ext,'pdf');
 assert.equal(fileType(Buffer.from([137,80,78,71,13,10,26,10]),true).ext,'png');
});
