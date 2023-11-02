CREATE TABLE IF NOT EXISTS app.contacts
(
    id uuid NOT NULL,
    phone bigint NOT NULL,
    dial_code bigint NOT NULL,
    email text COLLATE pg_catalog."default" NOT NULL,
    firstname text COLLATE pg_catalog."default" NOT NULL,
    lastname text COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp with time zone NOT NULL,
    user_id uuid NOT NULL,
    CONSTRAINT contacts_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS app.contacts
    OWNER to postgres;