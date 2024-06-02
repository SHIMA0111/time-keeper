-- CREATE SCHEMA named 'time_schema' --
CREATE SCHEMA time_schema;
SET search_path TO time_schema;
SET TIME ZONE 'Asia/Tokyo';

-- CREATE TABLES --
CREATE TABLE users
(
    id                uuid   PRIMARY KEY,
    username          varchar   not null,
    email             varchar   not null unique,
    password          varchar   not null,
    created_timestamp timestamp,
    last_updated_timestamp timestamp DEFAULT NULL,
    updated_numbers   integer   DEFAULT 0,
    last_login_timestamp        timestamp DEFAULT NULL,
    login_numbers     integer   DEFAULT 0,
    is_deleted        bool      not null DEFAULT FALSE
);

CREATE TABLE records
(
    id serial PRIMARY KEY,
    user_id uuid not null,
    category_id integer not null,
    subcategory_id integer not null,
    option1_id integer not null,
    option2_id integer not null,
    total_time float,
    date date,
    start bigint,
    "end" bigint,
    pause_starts bigint[] not null,
    pause_ends bigint[] not null
);

CREATE TABLE refresh_token
(
    uid uuid PRIMARY KEY,
    token varchar not null,
    exp bigint not null,
    iat bigint not null,
    is_invalid boolean DEFAULT FALSE
);

-- CREATE USER and GRANT AUTHORITY --
CREATE ROLE app WITH LOGIN PASSWORD 'password';

SET search_path TO time_schema;
SET TIME ZONE 'Asia/Tokyo';

GRANT USAGE ON SCHEMA time_schema TO app;
GRANT USAGE, SELECT ON SEQUENCE records_id_seq TO app;

GRANT SELECT, INSERT, UPDATE ON users TO app;
GRANT SELECT, INSERT, UPDATE ON records TO app;
GRANT SELECT, INSERT, UPDATE, DELETE ON refresh_token TO app;

-- CREATE FUNCTIONS --
CREATE OR REPLACE FUNCTION update_auto_process()
RETURNS TRIGGER AS $$
BEGIN
    SET TIME ZONE 'UTC';
    IF OLD.last_login_timestamp IS DISTINCT FROM NEW.last_login_timestamp
        THEN
            NEW.login_numbers = COALESCE(OLD.login_numbers, 0) + 1;
            RETURN NEW;
    ELSE
        NEW.updated_numbers = COALESCE(OLD.updated_numbers, 0) + 1;
        NEW.last_updated_timestamp = NOW();
        RETURN NEW;
    END IF;
END
$$ LANGUAGE plpgsql;
CREATE TRIGGER update_process_trigger
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_auto_process();

CREATE OR REPLACE FUNCTION insert_auto_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    SET TIME ZONE 'UTC';
    NEW.created_timestamp = NOW();
    RETURN NEW;
END
$$ LANGUAGE plpgsql;
CREATE TRIGGER auto_created_timestamp_users
BEFORE INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION insert_auto_timestamp();

-- CREATE DATA --
INSERT INTO
    users (id, username, email, password)
VALUES
    ('debcc72a-789b-4046-b954-0825d3331861', 'user1', 'taro@example.com', '$argon2id$v=19$m=19456,t=2,p=1$AOeGaO91HfTgGSNHcxPbqA$3J/8xAuRdnp9qUM4XoLFXAAbIQzBMU3nw+8gFTy4yp8');

INSERT INTO
    refresh_token (uid, token, exp, iat)
VALUES
    ('debcc72a-789b-4046-b954-0825d3331861', 'dummy_token', 1717102316, 1716102316)
