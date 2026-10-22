import type { NodeSchema, PaletteItem, UISchema } from "@workflowbuilder/sdk";
import { NodeType } from "@workflowbuilder/sdk";

// Seven node types, one per distinct step kind found in
// projects/rentstore/automation/01-signup-free.json (an n8n export). Each
// mirrors an n8n node type used there: webhook, code, if, googleSheets
// (lookup vs. append), httpRequest (WhatsApp), respondToWebhook.

// JsonForms renders no control for a schema property unless a matching
// uischema element names it explicitly, and this SDK's control union has
// no generic 'Control' type — only concrete ones like 'Text' (verified:
// 'Control' produced four "No renderer provided for type: Control" errors
// in the properties panel; 'Text' renders correctly).
function uischemaFor(fields: string[]): UISchema {
  return {
    type: "VerticalLayout",
    elements: fields.map((field) => ({
      type: "Text" as const,
      scope: `#/properties/${field}`,
    })),
  };
}

export const triggerSchema = {
  type: "object",
  properties: {
    label: { type: "string" },
    description: { type: "string" },
    path: { type: "string", label: "Webhook path" },
  },
} satisfies NodeSchema;

export const triggerNode: PaletteItem<typeof triggerSchema> = {
  type: "trigger",
  icon: "WebhooksLogo",
  label: "Webhook trigger",
  description: "Starts the flow when a form POSTs to this path.",
  schema: triggerSchema,
  uischema: uischemaFor(["label", "description", "path"]),
  defaultPropertiesData: {
    label: "Signup submitted",
    description: "The signup form on the site POSTs here.",
    path: "/rentstore-signup",
  },
};

export const transformSchema = {
  type: "object",
  properties: {
    label: { type: "string" },
    description: { type: "string" },
    summary: { type: "string", label: "What it does" },
  },
} satisfies NodeSchema;

export const transformNode: PaletteItem<typeof transformSchema> = {
  type: "transform",
  icon: "Code",
  label: "Transform (code)",
  description: "Runs JS to normalise or compute fields.",
  schema: transformSchema,
  uischema: uischemaFor(["label", "description", "summary"]),
  defaultPropertiesData: {
    label: "Validate and normalise",
    description: "Cleans the form input and checks it's usable.",
    summary: "Normalises name/handle/phone, flags problems, builds page_url.",
  },
};

export const decisionSchema = {
  type: "object",
  properties: {
    label: { type: "string" },
    description: { type: "string" },
    trueLabel: { type: "string", label: "\"Yes\" branch label" },
    falseLabel: { type: "string", label: "\"No\" branch label" },
  },
} satisfies NodeSchema;

export const decisionNode: PaletteItem<typeof decisionSchema> = {
  type: "decision",
  icon: "GitBranch",
  label: "Decision (if)",
  description: "Branches the flow on a true/false condition.",
  templateType: NodeType.DecisionNode,
  schema: decisionSchema,
  uischema: uischemaFor(["label", "description", "trueLabel", "falseLabel"]),
  defaultPropertiesData: {
    label: "Is it valid?",
    description: "",
    trueLabel: "Yes",
    falseLabel: "No",
  },
};

export const lookupSchema = {
  type: "object",
  properties: {
    label: { type: "string" },
    description: { type: "string" },
    sheetName: { type: "string", label: "Sheet name" },
  },
} satisfies NodeSchema;

export const lookupNode: PaletteItem<typeof lookupSchema> = {
  type: "lookup",
  icon: "Table",
  label: "Sheet lookup",
  description: "Reads a Google Sheet row by a column value.",
  schema: lookupSchema,
  uischema: uischemaFor(["label", "description", "sheetName"]),
  defaultPropertiesData: {
    label: "Look up the handle",
    description: "",
    sheetName: "sellers",
  },
};

export const sheetWriteSchema = {
  type: "object",
  properties: {
    label: { type: "string" },
    description: { type: "string" },
    sheetName: { type: "string", label: "Sheet name" },
  },
} satisfies NodeSchema;

export const sheetWriteNode: PaletteItem<typeof sheetWriteSchema> = {
  type: "sheet-write",
  icon: "Database",
  label: "Sheet append",
  description: "Appends a new row to a Google Sheet.",
  schema: sheetWriteSchema,
  uischema: uischemaFor(["label", "description", "sheetName"]),
  defaultPropertiesData: {
    label: "Create the seller row",
    description: "",
    sheetName: "sellers",
  },
};

export const messageSchema = {
  type: "object",
  properties: {
    label: { type: "string" },
    description: { type: "string" },
    channel: { type: "string", label: "Channel" },
  },
} satisfies NodeSchema;

export const messageNode: PaletteItem<typeof messageSchema> = {
  type: "message",
  icon: "WhatsappLogo",
  label: "Send message",
  description: "Sends a WhatsApp message via the Graph API.",
  schema: messageSchema,
  uischema: uischemaFor(["label", "description", "channel"]),
  defaultPropertiesData: {
    label: "WhatsApp message",
    description: "",
    channel: "WhatsApp",
  },
};

export const respondSchema = {
  type: "object",
  properties: {
    label: { type: "string" },
    description: { type: "string" },
    statusCode: { type: "number", label: "HTTP status" },
  },
} satisfies NodeSchema;

export const respondNode: PaletteItem<typeof respondSchema> = {
  type: "respond",
  icon: "ArrowUUpLeft",
  label: "Respond to webhook",
  description: "Sends the HTTP response back to the caller.",
  schema: respondSchema,
  uischema: uischemaFor(["label", "description", "statusCode"]),
  defaultPropertiesData: {
    label: "Reply",
    description: "",
    statusCode: 200,
  },
};

export const rentstoreNodeTypes = [
  {
    label: "RentStore · signup automation",
    groupItems: [
      triggerNode,
      transformNode,
      decisionNode,
      lookupNode,
      sheetWriteNode,
      messageNode,
      respondNode,
    ],
  },
];
