export const workflowsByServiceIDToList = workflowsByServiceID =>
    Object.values(workflowsByServiceID)
        .filter(s => !s.isFetching)
        .flatMap(s => Object.values(s.workflows.ingestion));
