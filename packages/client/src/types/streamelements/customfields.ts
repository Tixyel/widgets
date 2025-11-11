export type StreamElementsFieldTypes =
  | 'button'
  | 'number'
  | 'slider'
  | 'text'
  | 'hidden'
  | 'checkbox'
  | 'dropdown'
  | 'colorpicker'
  | 'googleFont'
  | 'video-input'
  | 'image-input'
  | 'sound-input';

export type StreamElementsField = {
  type: StreamElementsFieldTypes;
  label: string;
  value?: string | number | boolean;
  group?: string;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  options?: Record<string, string>;
  multiple?: boolean;
};

export type StreamElementsFieldValue = string | number | boolean | undefined;

export type StreamElementsFieldTypeMap = Array<[string[], StreamElementsFieldTypes]>;
export type StreamElementsFieldAddonsMap = Array<[string[], Record<string, any>]>;
export type StreamElementsFieldTransformMap = Array<[string[], (value: string | number) => string | number]>;
export type StreamElementsFieldLabelMap = Array<[string[], string]>;

export type FieldSettings = {
  from?: string;
  endsWith?: string[];
  ignore?: string[];
  replace?: Record<string, string>;
  settings?: {
    types?: StreamElementsFieldTypeMap;
    addons?: StreamElementsFieldAddonsMap;
    transforms?: StreamElementsFieldTransformMap;
    labels?: StreamElementsFieldLabelMap;
  };
  subgroup?: boolean;
  template?: string;
  subgroupTemplate?: string;
};

export type NormalizedFieldSettings = Required<FieldSettings> & {
  settings: {
    types: StreamElementsFieldTypeMap;
    addons: StreamElementsFieldAddonsMap;
    transforms: StreamElementsFieldTransformMap;
    labels: StreamElementsFieldLabelMap;
  };
};
