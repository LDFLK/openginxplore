// adding the configs of the application in the deployement/development
// mount this to the ./public in deployement configurations

// for production
// window.configs = {
//     apiUrl: "<opengin_service>",
//     apiUrlData: "<bff_service>",
//     feedbackFormUrl: "<feedback_form_url>",
//     version: "<version>",
//     dataSources: "<data_sources>"
// };

// for development
window.configs = {
    apiUrl: "", // keep empty for local development, otherwise this redirects to the OpenGIN service
    apiUrlData: "/api", // keep '/api' for local development, otherwise this redirects to the BFF service
    feedbackFormUrl: "",
    version: "ALPHA",
    dataSources: "https://data.gov.lk/"
};

// get the data to the relevant component using,
// example
// const apiUrl = window?.configs?.apiUrl ? window.configs.apiUrl : "";