CREATE ROLE guardly_rwuser WITH
  NOLOGIN
  NOSUPERUSER
  INHERIT
  CREATEDB
  CREATEROLE
  NOREPLICATION
  ENCRYPTED PASSWORD 'SCRAM-SHA-256$4096:kr4mGKVoA65jSC7GSAk9mQ==$OI6YFFK8Mm8fhbMuLywl1rPWEKTDJ/i6G4orMXA+a7w=:w5oFZA1RKvh9HZl78wgqb9E+zqDpsjXFi4mEXQvo26I=';