export type Observations = Observation[];

export type Observation = {
  id_event: string;
  name_event: string;
  date_event: string;
  observers: string;
  description: string;
  direct_observation: boolean;
  id_event_type: number;
  author: string;
  date_create: string;
  picture_legend: string;
  picture_author: string;
  picture_date: string;
  picture_licence: string;
  picture_path: string;
};

export type ObservationTypes = ObservationType[];

export type ObservationType = {
  id: number;
  name: string;
  icon: string;
  tooltip: string;
  observationTypes: ObservationTypes;
};
