// adding the configs of the application in the deployement

// mount this to the ./public in deployement configurations

//example
// window.configs = {
//     apiUrl : null ,
//     version : "rc-0.1.0",
//     apiUrlService : "http://127.0.0.1:8000"
// };

window.configs = {
    feedbackFormUrl: "https://docs.google.com/forms/d/e/1FAIpQLSc-gXC_h30DueTWzlKMI4zgNXwX9ae_88FF37G1SpSaILEbng/viewform?usp=dialog"
}

// get the data to the relevant component using ->
// example
// const apiUrl = window?.configs?.apiUrl ? window.configs.apiUrl : "/;