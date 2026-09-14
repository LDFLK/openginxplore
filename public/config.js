// adding the configs of the application in the deployement/development
// mount this to the ./public in deployement configurations

// for production
// window.configs = {
//     apiUrl: "<opengin_service>",
//     apiUrlData: "<bff_service>",
//     feedbackFormUrl: "<feedback_form_url>",
//     version: "<version>",
//     dataSources: "<data_sources>",
//     gaMeasurementId: "<google_analytics_measurement_id>"
// };

// for development
window.configs = {
    apiUrl: "https://aaf8ece1-3077-4a52-ab05-183a424f6d93-prod.e1-us-east-azure.choreoapis.dev/data-platform/read-api/v1.2", // keep empty for local development, otherwise this redirects to the OpenGIN service
    apiUrlData: "/api", // keep '/api' for local development, otherwise this redirects to the BFF service
    feedbackFormUrl: "",
    version: "ALPHA",
    dataSources: "https://data.gov.lk/",
    gazetteSources: "https://documents.gov.lk/view/egz/",
    imageStorageBaseUrl: "", // add the base url of the image storage location ex: "https://raw.githubusercontent.com/<org_name>/<repo_name>/<branch>/"
    gaMeasurementId: ""
};

// get the data to the relevant component using,
// example
// const apiUrl = window?.configs?.apiUrl ? window.configs.apiUrl : "";

// https://aaf8ece1-3077-4a52-ab05-183a424f6d93-prod.e1-us-east-azure.choreoapis.dev/data-platform/read-api/v1.2/v1/v1/entities/search
// https://aaf8ece1-3077-4a52-ab05-183a424f6d93-prod.e1-us-east-azure.choreoapis.dev/data-platform/read-api/v1.2/v1/entities/search