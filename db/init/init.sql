-- CREATE SCHEMA named 'time_schema' --
CREATE SCHEMA time_schema;
SET search_path TO time_schema;
SET TIME ZONE 'Asia/Tokyo';

-- CREATE TABLES --
CREATE TABLE users
(
    id                serial PRIMARY KEY,
    username          varchar   not null,
    email             varchar   not null unique,
    password          varchar   not null,
    created_timestamp timestamp,
    updated_timestamp timestamp,
    updated_numbers   integer            DEFAULT 0,
    last_login        timestamp,
    is_deleted        bool      not null DEFAULT FALSE
);

CREATE TABLE categories
(
    id                serial PRIMARY KEY,
    category          varchar not null,
    created_timestamp timestamp,
    is_deleted        bool      not null DEFAULT FALSE
);

CREATE TABLE subcategories
(
    id                serial PRIMARY KEY,
    subcategory       varchar not null,
    category_id       integer,
    created_timestamp timestamp,
    is_deleted        bool      not null DEFAULT FALSE,
    FOREIGN KEY (category_id) REFERENCES categories (id)
);

CREATE TABLE option1
(
    id                serial PRIMARY KEY,
    option1           varchar not null,
    subcategory_id    integer,
    created_timestamp timestamp,
    is_deleted        bool      not null DEFAULT FALSE,
    FOREIGN KEY (subcategory_id) REFERENCES subcategories (id)
);

CREATE TABLE option2
(
    id                serial PRIMARY KEY,
    option2           varchar not null,
    option1_id        integer,
    created_timestamp timestamp,
    is_deleted        bool      not null DEFAULT FALSE,
    FOREIGN KEY (option1_id) REFERENCES option1 (id)
);

CREATE TABLE records
(
    id serial PRIMARY KEY,
    user_id integer not null,
    category_id integer not null,
    subcategory_id integer not null,
    option1_id integer not null,
    option2_id integer not null,
    total_time float,
    date date,
    start bigint,
    "end" bigint,
    pause_starts bigint[] not null,
    pause_ends bigint[] not null,
    FOREIGN KEY (category_id) REFERENCES categories (id),
    FOREIGN KEY (subcategory_id) REFERENCES subcategories (id),
    FOREIGN KEY (option1_id) REFERENCES option1 (id),
    FOREIGN KEY (option2_id) REFERENCES option2 (id)
);

CREATE TABLE refresh_token
(
    id serial PRIMARY KEY,
    uid varchar not null,
    token varchar not null,
    exp bigint not null,
    iat bigint not null,
    is_invalid boolean DEFAULT FALSE,
    is_deleted boolean DEFAULT FALSE
);

-- CREATE USER and GRANT AUTHORITY --
CREATE ROLE app WITH LOGIN PASSWORD 'password';

SET search_path TO time_schema;
SET TIME ZONE 'Asia/Tokyo';

GRANT USAGE ON SCHEMA time_schema TO app;
GRANT USAGE, SELECT ON SEQUENCE users_id_seq TO app;
GRANT USAGE, SELECT ON SEQUENCE categories_id_seq TO app;
GRANT USAGE, SELECT ON SEQUENCE subcategories_id_seq TO app;
GRANT USAGE, SELECT ON SEQUENCE option1_id_seq TO app;
GRANT USAGE, SELECT ON SEQUENCE option2_id_seq TO app;
GRANT USAGE, SELECT ON SEQUENCE records_id_seq TO app;
GRANT USAGE, SELECT ON SEQUENCE refresh_token_id_seq TO app;

GRANT SELECT, INSERT, UPDATE ON users TO app;
GRANT SELECT, INSERT, UPDATE ON categories TO app;
GRANT SELECT, INSERT, UPDATE ON subcategories TO app;
GRANT SELECT, INSERT, UPDATE ON option1 TO app;
GRANT SELECT, INSERT, UPDATE ON option2 TO app;
GRANT SELECT, INSERT, UPDATE ON records TO app;
GRANT SELECT, INSERT, UPDATE ON refresh_token TO app;

-- CREATE FUNCTIONS --
CREATE OR REPLACE FUNCTION update_auto_process()
RETURNS TRIGGER AS $$
BEGIN
    SET TIME ZONE 'UTC';
    NEW.updated_numbers = COALESCE(OLD.updated_numbers, 0) + 1;
    NEW.updated_timestamp = NOW();
    RETURN NEW;
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
CREATE TRIGGER auto_created_timestamp_categories
BEFORE INSERT ON categories
FOR EACH ROW
EXECUTE FUNCTION insert_auto_timestamp();
CREATE TRIGGER auto_created_timestamp_subcategories
BEFORE INSERT ON subcategories
FOR EACH ROW
EXECUTE FUNCTION insert_auto_timestamp();
CREATE TRIGGER auto_created_timestamp_option1
BEFORE INSERT ON option1
FOR EACH ROW
EXECUTE FUNCTION insert_auto_timestamp();
CREATE TRIGGER auto_created_timestamp_option2
BEFORE INSERT ON option2
FOR EACH ROW
EXECUTE FUNCTION insert_auto_timestamp();

-- CREATE DATA --
INSERT INTO
    users (username, email, password, updated_timestamp, last_login)
VALUES
    ('user1', 'taro@example.com', 'password', NULL, NULL);

INSERT INTO
    categories (category)
VALUES
    ('general'),
    ('specific1'),
    ('specific2');

INSERT INTO
    subcategories (subcategory, category_id)
VALUES
    ('sub_general', 1),
    ('sub_specific1', 2),
    ('sub_specific2', 3),
    ('sub_all', NULL);

INSERT INTO
    option1 (option1, subcategory_id)
VALUES
    ('opt1_general', 1),
    ('opt1_specific1', 2),
    ('opt1_specific2', 3),
    ('opt1_all', NULL);

INSERT INTO
    option2 (option2, option1_id)
VALUES
    ('opt2_general', 1),
    ('opt2_specific1', 2),
    ('opt2_specific2', 3),
    ('opt2_all', NULL);

INSERT INTO
    refresh_token (uid, token, exp, iat)
VALUES
    ('dummy', 'dummy_token', 1717102316, 1716102316)
