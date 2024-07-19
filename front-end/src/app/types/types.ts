export type observationsFeatureCollection = {
  type: 'FeatureCollection';
  features: ObservationFeature[];
};

export type ObservationFeature = {
  type: 'Feature';
  id?: string;
  geometry: {
    type: 'Point';
    coordinates: number[];
  };
  properties: Observation;
};

export type Observations = Observation[];

export type Observation = {
  uuid?: string;
  name?: string;
  comments: string;
  event_date: string;
  source?: string;
  category: number;
  picture?: string;
  main_picture?: Picture;
  medias?: Picture[];
  coordinates?: number[];
  files?: File[];
  observer?: string;
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
  min_zoom: number;
  max_zoom: number;
  offline?: boolean;
};

export type Settings = {
  categories: ObservationTypes;
  areas: Areas;
  base_maps: {
    main_map: {
      url: string;
      attribution: string;
    };
    satellite_map: {
      url: string;
      attribution: string;
    };
  };
};

export type OfflineSettings = {
  id: number;
  settings: Settings;
};

export type User = {
  id: number;
  uuid: string;
  email: string;
  is_superuser: boolean;
  last_name: string;
  first_name: string;
};

export type Icons = Icon[];

export type Icon = {
  id: number;
  pictogram: string;
  file: File;
  objectUrl?: string;
};
