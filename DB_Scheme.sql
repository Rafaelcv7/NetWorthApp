CREATE TABLE users_table
(
  id INT UNSIGNED UNIQUE NOT NULL AUTO_INCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password CHAR(60) NOT NULL,
  name TEXT NOT NULL,
  birthdate date NOT NULL,
  phone_number TEXT UNIQUE,
  income NUMERIC (28,2),
  created_at timestamp default now(),
  updated_at timestamp default now() ON UPDATE CURRENT_TIMESTAMP(),
  PRIMARY KEY(id)
);

CREATE VIEW users
AS
  SELECT
    id,
    username,
    email,
    password,
    name,
    birthdate,
    phone_number,
    income,
    created_at,
    updated_at
  FROM
    users_table;


CREATE TABLE items_table (
    id INT UNSIGNED UNIQUE NOT NULL AUTO_INCREMENT,
    user_id INT UNSIGNED NOT NULL,
    plaid_access_token TEXT UNIQUE NOT NULL,
    plaid_item_id TEXT UNIQUE NOT NULL,
    plaid_institution_id TEXT NOT NULL,
    stat TEXT NOT NULL,
    created_at TIMESTAMP default now(),
    updated_at TIMESTAMP default now() ON UPDATE CURRENT_TIMESTAMP(),
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users_table(id) ON DELETE CASCADE
);

CREATE VIEW items
AS
  SELECT
    id,
    plaid_item_id,
    user_id,
    plaid_access_token,
    plaid_institution_id,
    stat,
    created_at,
    updated_at
  FROM
    items_table;

CREATE TABLE assets_table (
    id INT UNSIGNED UNIQUE NOT NULL AUTO_INCREMENT,
    user_id INT UNSIGNED NOT NULL,
    value NUMERIC (28,2),
    description TEXT,
    created_at TIMESTAMP default now(),
    updated_at TIMESTAMP default now() ON UPDATE CURRENT_TIMESTAMP(),
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users_table(id) ON DELETE CASCADE
);

CREATE VIEW assets
AS
  SELECT
    id,
    user_id,
    value,
    description,
    created_at,
    updated_at
  FROM
    assets_table;

CREATE TABLE accounts_table (
    id INT UNSIGNED UNIQUE NOT NULL AUTO_INCREMENT,
    item_id INT UNSIGNED NOT NULL,
    plaid_account_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    mask TEXT NOT NULL,
    official_name TEXT,
    current_balance numeric(28,10),
    available_balance numeric(28,10),
    iso_currency_code TEXT,
    unofficial_currency_code TEXT,
    type TEXT NOT NULL,
    subtype TEXT NOT NULL,
    created_at TIMESTAMP default now(),
    updated_at TIMESTAMP default now() ON UPDATE CURRENT_TIMESTAMP(),
    PRIMARY KEY(id),
    FOREIGN KEY (item_id) REFERENCES items_table(id) ON DELETE CASCADE
);


CREATE VIEW accounts
AS
  SELECT
    a.id,
    a.plaid_account_id,
    a.item_id,
    i.plaid_item_id,
    i.user_id,
    a.name,
    a.mask,
    a.official_name,
    a.current_balance,
    a.available_balance,
    a.iso_currency_code,
    a.unofficial_currency_code,
    a.type,
    a.subtype,
    a.created_at,
    a.updated_at
  FROM
    accounts_table a
    LEFT JOIN items i ON i.id = a.item_id;



CREATE TABLE transactions_table (
  id INT UNSIGNED UNIQUE NOT NULL AUTO_INCREMENT,
  account_id INT UNSIGNED NOT NULL,
  plaid_transaction_id TEXT UNIQUE NOT NULL,
  plaid_category_id TEXT,
  category TEXT,
  subcategory TEXT,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  amount numeric(28,10) NOT NULL,
  iso_currency_code TEXT,
  unofficial_currency_code TEXT,
  date date NOT NULL,
  pending boolean NOT NULL,
  account_owner TEXT,
  created_at timestamp default now(),
  updated_at timestamp default now() ON UPDATE CURRENT_TIMESTAMP(),
  PRIMARY KEY(id),
  FOREIGN KEY (account_id) REFERENCES accounts_table(id) ON DELETE CASCADE
);

CREATE VIEW transactions
AS
  SELECT
    t.id,
    t.plaid_transaction_id,
    t.account_id,
    a.plaid_account_id,
    a.item_id,
    a.plaid_item_id,
    a.user_id,
    t.category,
    t.subcategory,
    t.type,
    t.name,
    t.amount,
    t.iso_currency_code,
    t.unofficial_currency_code,
    t.date,
    t.pending,
    t.account_owner,
    t.created_at,
    t.updated_at
  FROM
    transactions_table t
    LEFT JOIN accounts a ON t.account_id = a.id;


CREATE TABLE plaid_api_events_table
(
  id INT UNSIGNED UNIQUE NOT NULL AUTO_INCREMENT,
  item_id INT,
  user_id INT,
  plaid_method TEXT NOT NULL,
  arguments TEXT,
  request_id TEXT UNIQUE,
  error_type TEXT,
  error_code TEXT,
  created_at timestamp default now(),
  PRIMARY KEY(id)
);

