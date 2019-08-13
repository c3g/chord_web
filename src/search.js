export const OP_EQUALS = "eq";
export const OP_LESS_THAN = "lt";
export const OP_LESS_THAN_OR_EQUAL = "eq";
export const OP_GREATER_THAN = "gt";
export const OP_GREATER_THAN_OR_EQUAL = "ge";
export const OP_CONTAINING = "co";

export const OPERATION_TEXT = {
    [OP_EQUALS]: "=",
    [OP_LESS_THAN]: "<",
    [OP_LESS_THAN_OR_EQUAL]: "\u2264",
    [OP_GREATER_THAN]: ">",
    [OP_GREATER_THAN_OR_EQUAL]: "\u2265",
    [OP_CONTAINING]: "containing"
};

export const DEFAULT_SEARCH_PARAMETERS = {
    operations: [OP_EQUALS, OP_LESS_THAN, OP_LESS_THAN_OR_EQUAL, OP_GREATER_THAN, OP_GREATER_THAN_OR_EQUAL,
        OP_CONTAINING],
    canNegate: true,
    required: false,
    type: "unlimited"
};
