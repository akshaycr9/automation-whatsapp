export type MetaTemplateComponentPayload =
  | {
      type: "HEADER";
      format: "TEXT";
      text: string;
      example?: {
        header_text: string[];
      };
    }
  | {
      type: "BODY";
      text: string;
      example?: {
        body_text: string[][];
      };
    }
  | {
      type: "FOOTER";
      text: string;
    }
  | {
      type: "BUTTONS";
      buttons: Array<
        | { type: "QUICK_REPLY"; text: string }
        | { type: "URL"; text: string; url: string }
        | { type: "PHONE_NUMBER"; text: string; phone_number: string }
      >;
    };

export type MetaCreateTemplatePayload = {
  name: string;
  language: string;
  category: string;
  allow_category_change?: boolean;
  components: MetaTemplateComponentPayload[];
};

export type MetaTemplateResponse = {
  id?: string;
  name?: string;
  language?: string;
  category?: string;
  status?: string;
  quality_score?: {
    score?: string;
  };
  rejected_reason?: string;
  components?: unknown[];
};

export type MetaListTemplatesResponse = {
  data?: MetaTemplateResponse[];
};
