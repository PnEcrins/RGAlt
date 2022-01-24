-- Création de la BDD RGAlt

CREATE SCHEMA IF NOT EXISTS rgalt;

CREATE TABLE rgalt.events
(
  id_event SERIAL,
  name character varying(250),
  date_event date,
  observers character varying(250),
  description text,
  direct_observation boolean,
  id_event_type integer,
  author character varying(250),
  date_create date,
  geometry (geometry,2154)
);

