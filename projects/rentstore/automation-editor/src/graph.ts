import type { WorkflowBuilderEdge, WorkflowBuilderNode } from "@workflowbuilder/sdk";
import { NodeType } from "@workflowbuilder/sdk";
import { falseHandleId, trueHandleId } from "./DecisionNodeTemplate";

// Hand-mapped from projects/rentstore/automation/01-signup-free.json (an
// n8n export) onto the seven node types in ./nodeTypes.ts. Node ids below
// reuse that file's own node ids so the two stay easy to cross-reference.

export const initialNodes: WorkflowBuilderNode[] = [
  {
    id: "signup-submitted",
    type: "trigger",
    position: { x: 0, y: 220 },
    data: {
      type: "trigger",
      icon: "WebhooksLogo",
      properties: {
        label: "Signup submitted",
        description: "The signup form on the site POSTs here.",
        path: "/rentstore-signup",
      },
    },
  },
  {
    id: "validate-and-normalise",
    type: "transform",
    position: { x: 280, y: 220 },
    data: {
      type: "transform",
      icon: "Code",
      properties: {
        label: "Validate and normalise",
        description: "Cleans the form input and checks it's usable.",
        summary: "Normalises name/handle/phone, flags problems, builds page_url.",
      },
    },
  },
  {
    id: "is-it-valid",
    type: "decision",
    position: { x: 560, y: 220 },
    data: {
      type: "decision",
      icon: "GitBranch",
      templateType: NodeType.DecisionNode,
      properties: {
        label: "Is it valid?",
        description: "name, handle, and phone all pass validation?",
        trueLabel: "Valid",
        falseLabel: "Invalid",
      },
    },
  },
  {
    id: "reject-missing-fields",
    type: "respond",
    position: { x: 860, y: 420 },
    data: {
      type: "respond",
      icon: "ArrowUUpLeft",
      properties: {
        label: "Reject: missing fields",
        description: "400 invalid_input",
        statusCode: 400,
      },
    },
  },
  {
    id: "look-up-the-handle",
    type: "lookup",
    position: { x: 860, y: 60 },
    data: {
      type: "lookup",
      icon: "Table",
      properties: {
        label: "Look up the handle",
        description: "Is this handle already in the sellers sheet?",
        sheetName: "sellers",
      },
    },
  },
  {
    id: "handle-already-taken",
    type: "decision",
    position: { x: 1140, y: 60 },
    data: {
      type: "decision",
      icon: "GitBranch",
      templateType: NodeType.DecisionNode,
      properties: {
        label: "Handle already taken?",
        description: "",
        trueLabel: "Taken",
        falseLabel: "Available",
      },
    },
  },
  {
    id: "reject-handle-taken",
    type: "respond",
    position: { x: 1420, y: -80 },
    data: {
      type: "respond",
      icon: "ArrowUUpLeft",
      properties: {
        label: "Reject: handle taken",
        description: "409 handle_taken",
        statusCode: 409,
      },
    },
  },
  {
    id: "create-the-seller-row",
    type: "sheet-write",
    position: { x: 1420, y: 160 },
    data: {
      type: "sheet-write",
      icon: "Database",
      properties: {
        label: "Create the seller row",
        description: "Appends the new seller.",
        sheetName: "sellers",
      },
    },
  },
  {
    id: "whatsapp-welcome-the-seller",
    type: "message",
    position: { x: 1700, y: 60 },
    data: {
      type: "message",
      icon: "WhatsappLogo",
      properties: {
        label: "WhatsApp: welcome the seller",
        description: "Sends the seller their page link and next steps.",
        channel: "WhatsApp",
      },
    },
  },
  {
    id: "whatsapp-tell-the-owner",
    type: "message",
    position: { x: 1700, y: 260 },
    data: {
      type: "message",
      icon: "WhatsappLogo",
      properties: {
        label: "WhatsApp: tell the owner",
        description: "Notifies the owner of the new signup.",
        channel: "WhatsApp",
      },
    },
  },
  {
    id: "reply-account-created",
    type: "respond",
    position: { x: 1980, y: 60 },
    data: {
      type: "respond",
      icon: "ArrowUUpLeft",
      properties: {
        label: "Reply: account created",
        description: "200 ok",
        statusCode: 200,
      },
    },
  },
];

export const initialEdges: WorkflowBuilderEdge[] = [
  { id: "e1", source: "signup-submitted", target: "validate-and-normalise" },
  { id: "e2", source: "validate-and-normalise", target: "is-it-valid" },
  {
    id: "e3",
    source: "is-it-valid",
    sourceHandle: trueHandleId,
    target: "look-up-the-handle",
    data: { label: "valid" },
  },
  {
    id: "e4",
    source: "is-it-valid",
    sourceHandle: falseHandleId,
    target: "reject-missing-fields",
    data: { label: "invalid" },
  },
  { id: "e5", source: "look-up-the-handle", target: "handle-already-taken" },
  {
    id: "e6",
    source: "handle-already-taken",
    sourceHandle: trueHandleId,
    target: "reject-handle-taken",
    data: { label: "taken" },
  },
  {
    id: "e7",
    source: "handle-already-taken",
    sourceHandle: falseHandleId,
    target: "create-the-seller-row",
    data: { label: "available" },
  },
  { id: "e8", source: "create-the-seller-row", target: "whatsapp-welcome-the-seller" },
  { id: "e9", source: "create-the-seller-row", target: "whatsapp-tell-the-owner" },
  { id: "e10", source: "whatsapp-welcome-the-seller", target: "reply-account-created" },
];
