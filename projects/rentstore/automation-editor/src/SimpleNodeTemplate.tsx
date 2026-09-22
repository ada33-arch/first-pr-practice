import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { defineNodeTemplate, Icon, type WorkflowNodeTemplateProps } from "@workflowbuilder/sdk";

// The SDK's own default WorkflowNodeTemplate renders no visible body for a
// plain (non-decision) custom node type in this SDK version (verified: a
// headless-browser check showed only the two bare Handle elements, no
// icon/label/description). Registering an explicit template per type, the
// same way the decision branch node already needs to be, sidesteps that
// and gives predictable, verified rendering for every node here.

export const SimpleNodeTemplate = defineNodeTemplate(
  memo(({ data, selected }: WorkflowNodeTemplateProps) => {
    const label = data?.properties.label ?? data?.type ?? "Node";
    const description = data?.properties.description;

    return (
      <div className={`simple-node${selected ? " simple-node--selected" : ""}`}>
        <Handle type="target" position={Position.Left} />
        <div className="simple-node__header">
          {data?.icon && <Icon name={data.icon} />}
          <span className="simple-node__label">{label}</span>
        </div>
        {description && <p className="simple-node__description">{description}</p>}
        <Handle type="source" position={Position.Right} />
      </div>
    );
  }),
);
