CREATE TABLE IF NOT EXISTS app.rides
(
    id uuid NOT NULL,
    source int4range[] NOT NULL,
    destination int4range[] NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    user_id uuid NOT NULL,
    CONSTRAINT rides_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS app.rides
    OWNER to postgres;