import { test } from 'node:test';
import assert from 'node:assert/strict';
import { directChargeAmounts, platformFeeCents } from '../src/lib/finance/money.ts';

test('V4.34: Direct Charge fixture preserves 10% and exact financial decomposition',()=>{
 const transaction={amount:5000,fee:739,net:4261,currency:'brl',fee_details:[
  {type:'application_fee',amount:500,currency:'brl'}, {type:'stripe_fee',amount:239,currency:'brl'},
 ]};
 assert.equal(platformFeeCents(5000),500);
 assert.deepEqual(directChargeAmounts(5000,500,transaction),{gross:5000,platformFee:500,stripeFee:239,producerNet:4261});
 assert.throws(()=>directChargeAmounts(5000,499,transaction));
 assert.throws(()=>directChargeAmounts(5000,500,{...transaction,net:4262}));
 assert.throws(()=>directChargeAmounts(5000,500,{...transaction,fee_details:[]}));
});
