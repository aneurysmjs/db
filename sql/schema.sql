-- Applied to the test database before every test run (see src/test/global-setup.mts).
-- When you add or change a table in the dev database, make the same change here.

CREATE TABLE people (
  id INTEGER PRIMARY KEY,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  employed BOOLEAN,
  age INTEGER
);
