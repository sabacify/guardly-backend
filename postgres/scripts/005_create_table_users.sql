CREATE TABLE IF NOT EXISTS app.users
(
    id uuid NOT NULL,
    firstname text COLLATE pg_catalog."default" NOT NULL,
    lastname text COLLATE pg_catalog."default" NOT NULL,
    email text COLLATE pg_catalog."default" NOT NULL,
    code bigint NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone NOT NULL,
    phone bigint NOT NULL,
    dial_code bigint,
    country_code text COLLATE pg_catalog."default",
    CONSTRAINT users_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS app.users
    OWNER to guardly_rwuser;