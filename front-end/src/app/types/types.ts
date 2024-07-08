export type Observations = Observation[];

export type Observation = {
  uuid: string;
  name: string;
  comments: string;
  event_date: string;
  source: string;
  category: number;
  main_picture?: Picture;
  medias?: Picture[];
};

export type Picture = {
  id: number;
  uuid: string;
  legend: string;
  media_file: string;
  media_type: string;
  thumbnails: {
    small: string;
    medium: string;
    large: string;
  };
};

export type ObservationTypes = ObservationType[];

export type ObservationType = {
  id: number;
  label: string;
  description: string;
  pictogram: string;
  children: ObservationTypes;
};

export type Areas = Area[];

export type Area = {
  id: number;
  name: string;
  description: string;
  bbox: number[][];
};

export type settings = {
  categories: ObservationTypes;
  areas: Areas;
};

export type User = {
  id: number;
  uuid: string;
  email: string;
  is_superuser: boolean;
  last_name: string;
  first_name: string;
};
