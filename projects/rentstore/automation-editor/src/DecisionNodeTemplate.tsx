import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import {
  defineNodeTemplate,
  getHandleId,
  Icon,
  type NodeDataProperties,
  type WorkflowNodeTemplateProps,
} from "@workflowbuilder/sdk";
import type { decisionSchema } from "./nodeTypes";

type DecisionProperties = NodeDataProperties<typeof decisionSchema>;

export const trueHandleId = getHandleId({ handleType: "source", innerId: "true" });
export const falseHandleId = getHandleId({ handleType: "source", innerId: "false" });

export const DecisionNodeTemplate = defineNodeTemplate<DecisionProperties>(
  memo(({ data, selected }: WorkflowNodeTemplateProps<DecisionProperties>) => {
    const label = data?.properties.label ?? "Decision";
    const description = data?.properties.description;
    const trueLabel = data?.properties.trueLabel ?? "Yes";
    const falseLabel = data?.properties.falseLabel ?? "No";

    return (
      <div className={`decision-node${selected ? " decision-node--selected" : ""}`}>
        <Handle type="target" position={Position.Left} />

        <div className="decision-node__header">
          <Icon name="GitBranch" />
          <span className="decision-node__label">{label}</span>
        </div>
        {description && <p className="decision-node__description">{description}</p>}

        <div className="decision-node__branch decision-node__branch--true">
          <span>{trueLabel}</span>
          <Handle type="source" position={Position.Right} id={trueHandleId} style={{ top: "45%" }} />
        </div>
        <div className="decision-node__branch decision-node__branch--false">
          <span>{falseLabel}</span>
          <Handle type="source" position={Position.Right} id={falseHandleId} style={{ top: "75%" }} />
        </div>
      </div>
    );
  }),
);
