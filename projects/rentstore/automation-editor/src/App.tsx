import { WorkflowBuilder, type WorkflowBuilderNodeTemplates } from "@workflowbuilder/sdk";
import "@workflowbuilder/sdk/style.css";
import "./nodes.css";
import { rentstoreNodeTypes } from "./nodeTypes";
import { DecisionNodeTemplate } from "./DecisionNodeTemplate";
import { SimpleNodeTemplate } from "./SimpleNodeTemplate";
import { initialEdges, initialNodes } from "./graph";

const nodeTemplates: WorkflowBuilderNodeTemplates = {
  decision: DecisionNodeTemplate,
  trigger: SimpleNodeTemplate,
  transform: SimpleNodeTemplate,
  lookup: SimpleNodeTemplate,
  "sheet-write": SimpleNodeTemplate,
  message: SimpleNodeTemplate,
  respond: SimpleNodeTemplate,
};

export function App() {
  return (
    <WorkflowBuilder.Root
      name="rentstore-signup-automation"
      nodeTypes={rentstoreNodeTypes}
      nodeTemplates={nodeTemplates}
      initialNodes={initialNodes}
      initialEdges={initialEdges}
    />
  );
}
