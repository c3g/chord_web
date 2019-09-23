const DUO_COLLABORATION_REQUIRED = "COL";
const DUO_ETHICS_APPROVAL_REQUIRED = "IRB";
const DUO_GEOGRAPHICAL_RESTRICTION = "GS";
const DUO_INSTITUTION_SPECIFIC_RESTRICTION = "IS";
export const DUO_NOT_FOR_PROFIT_USE_ONLY = "NPU";
const DUO_PROJECT_SPECIFIC_RESTRICTION = "PS";
const DUO_PUBLICATION_MORATORIUM = "MOR";
const DUO_PUBLICATION_REQUIRED = "PUB";
const DUO_RETURN_TO_DATABASE_OR_RESOURCE = "RTN";
const DUO_TIME_LIMIT_ON_USE = "TS";
const DUO_USER_SPECIFIC_RESTRICTION = "US";

export const DATA_USE_KEYS = [
    DUO_COLLABORATION_REQUIRED,
    DUO_ETHICS_APPROVAL_REQUIRED,
    DUO_GEOGRAPHICAL_RESTRICTION,
    DUO_INSTITUTION_SPECIFIC_RESTRICTION,
    DUO_NOT_FOR_PROFIT_USE_ONLY,
    DUO_PROJECT_SPECIFIC_RESTRICTION,
    DUO_PUBLICATION_MORATORIUM,
    DUO_PUBLICATION_REQUIRED,
    DUO_RETURN_TO_DATABASE_OR_RESOURCE,
    DUO_TIME_LIMIT_ON_USE,
    DUO_USER_SPECIFIC_RESTRICTION
];

export const DATA_USE_INFO = {
    [DUO_COLLABORATION_REQUIRED]: {
        icon: "team",
        title: "Collaboration Required",
        content: "This requirement indicates that the requester must agree to collaboration with the primary " +
            "study investigator(s)."
    },
    [DUO_ETHICS_APPROVAL_REQUIRED]: {
        icon: "reconciliation",
        title: "Ethics Approval Required",
        content: "This requirement indicates that the requester must provide documentation of local IRB/ERB approval."
    },
    [DUO_GEOGRAPHICAL_RESTRICTION]: {
        icon: "global",
        title: "Geographical Restriction",
        content: "This requirement indicates that use is limited to within a specific geographic region."
    },
    [DUO_INSTITUTION_SPECIFIC_RESTRICTION]: {
        icon: "bank",
        title: "Institution-Specific Restriction",
        content: "This requirement indicates that use is limited to use within an approved institution."
    },
    [DUO_NOT_FOR_PROFIT_USE_ONLY]: {
        icon: "dollar", // Gets modified below
        title: "Not-For-Profit Use Only",
        content: "This requirement indicates that use of the data is limited to not-for-profit organizations " +
            "and not-for-profit use, non-commercial use."
    },
    [DUO_PROJECT_SPECIFIC_RESTRICTION]: {
        icon: "audit",
        title: "Project-Specific Restriction",
        content: "This requirement indicates that use is limited to use within an approved project."
    },
    [DUO_PUBLICATION_MORATORIUM]: {
        icon: "exception",
        title: "Publication Moratorium",
        content: "This requirement indicates that requester agrees not to publish results of studies until a " +
            "specific date"
    },
    [DUO_PUBLICATION_REQUIRED]: {
        icon: "file-done",
        title: "Publication Required",
        content: "This requirement indicates that requester agrees to make results of studies using the data " +
            "available to the larger scientific community."
    },
    [DUO_RETURN_TO_DATABASE_OR_RESOURCE]: {
        icon: "database",
        title: "Return to Database or Resource",
        content: "This requirement indicates that the requester must return derived/enriched data to the " +
            "database/resource."
    },
    [DUO_TIME_LIMIT_ON_USE]: {
        icon: "clock-circle",
        title: "Time Limit on Use",
        content: "This requirement indicates that use is approved for a specific number of months."
    },
    [DUO_USER_SPECIFIC_RESTRICTION]: {
        icon: "user",
        title: "User-Specific Restriction",
        content: "This requirement indicates that use is limited to use by approved users."
    }
};
