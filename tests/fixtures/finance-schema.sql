-- Minimal pre-migration schema matching the audited public tables and relevant constraints.
CREATE ROLE anon;
CREATE ROLE authenticated;
CREATE ROLE service_role BYPASSRLS;
GRANT USAGE ON SCHEMA public TO anon,authenticated,service_role;
CREATE TABLE profiles(id uuid PRIMARY KEY,role text DEFAULT 'user',stripe_account_id text);
CREATE TABLE products(id uuid PRIMARY KEY,user_id uuid,title text,price numeric,type text);
CREATE TABLE products_checkout(id uuid PRIMARY KEY,user_id uuid,product_id uuid REFERENCES products(id));
CREATE TABLE orders(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid,product_id uuid REFERENCES products(id),amount numeric,
 customer_name text,customer_email text,status text,created_at timestamp DEFAULT now());
CREATE TABLE payments(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid,payment_provider_id text UNIQUE,status text DEFAULT 'PENDING',
 value numeric,original_value numeric,final_value numeric,platform_fee numeric DEFAULT 0,platform_fee_percent numeric DEFAULT 10,
 stripe_fee numeric DEFAULT 0,net_value numeric DEFAULT 0,customer_name text,customer_email text,created_at timestamp DEFAULT now());
CREATE TABLE customer_products(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),customer_id uuid NOT NULL REFERENCES profiles(id),
 product_id uuid NOT NULL REFERENCES products(id),order_id uuid REFERENCES orders(id),status text NOT NULL DEFAULT 'active',expires_at timestamptz);
CREATE TABLE balances(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid UNIQUE NOT NULL REFERENCES profiles(id),
 available_balance numeric NOT NULL DEFAULT 0,pending_balance numeric NOT NULL DEFAULT 0,total_earned numeric NOT NULL DEFAULT 0,
 total_withdrawn numeric NOT NULL DEFAULT 0,updated_at timestamptz DEFAULT now());
CREATE TABLE withdrawals(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid REFERENCES profiles(id),amount numeric,pix_key text,pix_type text,
 status text DEFAULT 'pending' CHECK(status IN ('pending','approved','paid','rejected')),requested_at timestamptz DEFAULT now(),processed_at timestamptz);
CREATE TABLE stripe_webhook_events(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),event_id text UNIQUE,event_type text,status text DEFAULT 'processing',
 created_at timestamptz DEFAULT now(),processed_at timestamptz);
CREATE TABLE financial_transactions(id uuid PRIMARY KEY DEFAULT gen_random_uuid());
CREATE TABLE balance_releases(id uuid PRIMARY KEY DEFAULT gen_random_uuid());
CREATE TABLE withdraw_requests(id uuid PRIMARY KEY DEFAULT gen_random_uuid());
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON profiles TO authenticated;
INSERT INTO profiles VALUES('00000000-0000-4000-8000-000000000001','user','acct_seller'),('00000000-0000-4000-8000-000000000002','user',null);
INSERT INTO products VALUES('00000000-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000001','Product',100,'ebook');
INSERT INTO products_checkout VALUES('00000000-0000-4000-8000-000000000004','00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000003');
INSERT INTO balances(user_id,available_balance,pending_balance,total_earned) VALUES('00000000-0000-4000-8000-000000000001',171.24,-121.82,49.42);
