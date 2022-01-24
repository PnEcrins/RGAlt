-- Création de la BDD RGAlt

CREATE SCHEMA IF NOT EXISTS rgalt;

CREATE TABLE rgalt.t_event_types
(
  id_type serial NOT NULL,
  type varchar(250),
  CONSTRAINT t_event_types_pkey PRIMARY KEY (id_type)
);

CREATE TABLE rgalt.t_events
(
  id_event serial NOT NULL,
  name_event varchar(250),
  date_event date,
  observers varchar(250),
  description text,
  direct_observation boolean,
  id_event_type integer,
  author varchar(250),
  date_create date,
  geom geometry(Geometry,2154),
  CONSTRAINT t_events_pkey PRIMARY KEY (id_event),
  CONSTRAINT type_event_fkey FOREIGN KEY (id_event_type)
      REFERENCES rgalt.t_event_types (id_type) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE rgalt.t_licences
(
  id_licence SERIAL,
  licence varchar(250),
  CONSTRAINT t_licences_pkey PRIMARY KEY (id_licence)
);

CREATE TABLE rgalt.t_pictures
(
  id_picture SERIAL,
  legend varchar(250),
  author varchar(250),
  date_picture date,
  id_event integer,
  id_licence integer,
  CONSTRAINT t_pictures_pkey PRIMARY KEY (id_picture),
  CONSTRAINT event_fkey FOREIGN KEY (id_event)
      REFERENCES rgalt.t_events (id_event) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO action,
  CONSTRAINT licence_fkey FOREIGN KEY (id_licence)
      REFERENCES rgalt.t_licences (id_licence) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
);
