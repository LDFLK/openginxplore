export const statItems = [
    {
        "label": "Ministries",
        "value": "17"
    },
    {
        "label": "Meeting Bodies Tracked",
        "value": "67"
    },
    {
        "label": "RTI Requests Sent",
        "value": "35"
    },
    {
        "label": "RTI Requests Responded",
        "value": "22"
    },
    {
        "label": "Sets of Minutes Available",
        "value": "7"
    }
];

export const meetingBodies = [
    {
        id: "min_moe",
        title:
            "Minister of Education, Higher Education and Vocational Education",
        bodies: [
            {
                id: "body_ugc",
                name: "UGC",
                fullName: "University Grants Commission",
                enablingAct: "Universities Act, No. 16 of 1978",
                actSection: "Section 2(1)",
                chair: "Chairman of the Commission",
                composition:
                    "The Chairman of the Commission shall preside at all meetings of the Commission. In the absence of the Chairman, the Vice Chairman shall preside.",
                frequency: {
                    type: "Not Defined",
                    interval: "Monthly",
                },
                mandate: [
                    {
                        section: "Section 2(1)",
                        body: "Universities Act",
                        description:
                            "There shall be established a University Grants Commission (hereinafter referred to as the 'Commission')",
                        frequency: "Establishment",
                    },
                    {
                        section: "Section 12(1)",
                        body: "Universities Act",
                        description: "The Board shall meet at least once in every month.",
                        frequency: "Monthly",
                    },
                    {
                        section: "Section 2",
                        body: "Universities Act",
                        description:
                            "The Chairman of the Commission shall preside at all meetings of the Commission. In the absence of the Chairman from any meeting of the Commission, the Vice Chairman shall preside at such meeting",
                        frequency: "Per meeting",
                    },
                ],
                rtiHistory: [
                    {
                        dateSent: "2026-04-10",
                        dateResponded: "2026-05-21",
                        status: "rejected",
                        description:
                            "RTI request sent to UGC: last 6 meeting dates, meeting minutes, and board member list.",
                        response:
                            "Request completed (partial): last 6 meeting dates and board members provided; meeting minutes not included.",
                        files: ["requests/req_003.pdf"]
                    },
                ],
                meetingInstances: [
                    { id: "UGC Commission Meeting 2026-02-11", date: "2026-02-11", files: [] },
                    { id: "UGC Commission Meeting 2026-02-25", date: "2026-02-25", files: [] },
                    { id: "UGC Commission Meeting 2026-03-11", date: "2026-03-11", files: [] },
                    { id: "UGC Commission Meeting 2026-03-24", date: "2026-03-24", files: [] },
                    { id: "UGC Commission Meeting 2026-04-07", date: "2026-04-07", files: [] },
                    { id: "UGC Commission Meeting 2026-06-03", date: "2026-06-03", files: [] },
                ],
            },
            {
                id: "body_tvec",
                name: "TVEC",
                fullName: "Tertiary and Vocational Education Commission",
                enablingAct: "Tertiary and Vocational Education Act, No. 20 of 1990",
                actSection: "Section 2(1)",
                chair: "Chairman",
                composition:
                    "The Chairman shall preside at every meeting of the Commission. In the absence of the Chairman, members present elect one of themselves to preside.",
                frequency: {
                    type: "Defined",
                    interval: "Decided by the Commission",
                },
                mandate: [
                    {
                        section: "Section 2(1)",
                        body: "Tertiary and Vocational Education Act",
                        description:
                            "There shall be established a Commission which shall be called the Tertiary and Vocational Education Commission.",
                        frequency: "Establishment",
                    },
                    {
                        section: "Section 8(2)",
                        body: "Tertiary and Vocational Education Act",
                        description:
                            "The quorum for any meeting shall be decided by the Commission.",
                        frequency: "Decided by the Commission",
                    },
                    {
                        section: "Section 8(1)",
                        body: "Tertiary and Vocational Education Act",
                        description: "The Chairman shall preside at every meeting of the Commission.",
                        frequency: "Per meeting",
                    },
                ],
                rtiHistory: [
                    {
                        dateSent: "2026-04-10",
                        dateResponded: "2026-04-27",
                        status: "rejected",
                        description:
                            "RTI request sent to TVEC: last 3 meeting dates, meeting minutes, and board member list.",
                        response:
                            "Request completed: all requested data received.",
                        files: ["https://opendata.lk/storage/minutes/sea_156.pdf"],
                    },
                    {
                        dateSent: "2026-04-10",
                        dateResponded: "2026-04-27",
                        status: "available",
                        description:
                            "RTI request sent to TVEC: last 3 meeting dates, meeting minutes, and board member list.",
                        response:
                            "Request completed: all requested data received.",
                        files: ["https://opendata.lk/storage/minutes/sea_156.pdf"],
                    },
                    {
                        dateSent: "2026-04-10",
                        dateResponded: "2026-04-27",
                        status: "available",
                        description:
                            "RTI request sent to TVEC: last 3 meeting dates, meeting minutes, and board member list.",
                        response:
                            "Request completed: all requested data received.",
                        files: ["https://opendata.lk/storage/minutes/sea_156.pdf"],
                    },
                    {
                        dateSent: "2026-04-10",
                        dateResponded: "2026-04-27",
                        status: "rejected",
                        description:
                            "RTI request sent to TVEC: last 3 meeting dates, meeting minutes, and board member list.",
                        response:
                            "Request completed: all requested data received.",
                        files: ["https://opendata.lk/storage/minutes/sea_156.pdf"],
                    },
                    {
                        dateSent: "2026-04-10",
                        dateResponded: "2026-04-27",
                        status: "available",
                        description:
                            "RTI request sent to TVEC: last 3 meeting dates, meeting minutes, and board member list.",
                        response:
                            "Request completed: all requested data received.",
                        files: ["https://opendata.lk/storage/minutes/sea_156.pdf"],
                    },
                    {
                        dateSent: "2026-04-10",
                        dateResponded: "2026-04-27",
                        status: "available",
                        description:
                            "RTI request sent to TVEC: last 3 meeting dates, meeting minutes, and board member list.",
                        response:
                            "Request completed: all requested data received.",
                        files: ["https://opendata.lk/storage/minutes/sea_156.pdf"],
                    }
                ],
                meetingInstances: [
                    {
                        id: "Meeting ID 2025/08/306",
                        date: "2025-10-13",
                        files: ["https://opendata.lk/storage/minutes/sea_156.pdf", "https://opendata.lk/storage/minutes/sea_156.pdf"],
                    },
                    {
                        id: "Meeting ID 2025/09/307",
                        date: "2025-11-14",
                        files: ["https://opendata.lk/storage/minutes/sea_156.pdf"],
                    },
                    {
                        id: "Meeting ID 2025/10/308",
                        date: "2025-12-16",
                        files: ["https://opendata.lk/storage/minutes/sea_156.pdf"],
                    },
                    {
                        id: "Meeting ID 2026/01/309",
                        date: "2026-01-13",
                        files: ["https://opendata.lk/storage/minutes/sea_156.pdf"],
                    },
                    {
                        id: "Meeting ID 2026/02/310",
                        date: "2026-02-10",
                        files: ["https://opendata.lk/storage/minutes/sea_156.pdf"],
                    },
                    {
                        id: "Meeting ID 2026/03/311",
                        date: "2026-03-10",
                        files: ["https://opendata.lk/storage/minutes/sea_156.pdf"],
                    },
                ],
            },
        ],
    },
    {
        id: "min_moj",
        title: "Minister of Justice and National Integration",
        bodies: [
            {
                id: "body_omp",
                name: "OMP",
                fullName: "Office on Missing Persons",
                enablingAct: "Office on Missing Persons Act, No. 14 of 2016",
                actSection: "Section 3(1)",
                chair: "Chairman",
                composition:
                    "The Chairman shall preside at all meetings of the OMP. In the event of his absence, members present elect one of their membership to preside.",
                frequency: {
                    type: "discretionary",
                    interval: "Decided by the OMP",
                },
                mandate: [
                    {
                        section: "Section 3(1)",
                        body: "Office on Missing Persons Act",
                        description:
                            'There shall be established an Office which shall be called and known as the "Office on Missing Persons".',
                        frequency: "Establishment",
                    },
                    {
                        section: "Section 8(3)",
                        body: "Office on Missing Persons Act",
                        description:
                            "The OMP may make rules to regulate the procedure in regard to the conduct of meetings and the transaction of business at such meetings.",
                        frequency: "Decided by the OMP",
                    },
                    {
                        section: "Section 8(1)",
                        body: "Office on Missing Persons Act",
                        description:
                            "The Chairman shall preside at all meetings of the OMP. In the event of his absence, members present elect one to preside.",
                        frequency: "Per meeting",
                    },
                ],
                rtiHistory: [
                    {
                        dateSent: "2026-04-10",
                        dateResponded: "2026-04-11",
                        status: "available",
                        description:
                            "RTI request sent to OMP: last 3 meeting dates, meeting minutes, and board member list.",
                        response:
                            "Request completed (partial): last 3 meeting dates and board members provided; meeting minutes not included.",
                        files: ["https://opendata.lk/storage/minutes/sea_156.pdf"],
                    },
                ],
                meetingInstances: [
                    {
                        id: "157th Board Meeting",
                        date: "2026-02-18",
                        files: ["https://opendata.lk/storage/minutes/sea_156.pdf"],
                    },
                    {
                        id: "158th Board Meeting",
                        date: "2026-02-26",
                        files: ["https://opendata.lk/storage/minutes/sea_156.pdf"],
                    },
                    {
                        id: "159th Board Meeting",
                        date: "2026-03-26",
                        files: ["https://opendata.lk/storage/minutes/sea_156.pdf"],
                    },
                ],
            },
        ],
    },
    {
        id: "min_mod",
        title: "Minister of Defence",
        bodies: [
            {
                id: "body_dmc",
                name: "DMC",
                fullName: "National Disaster Management Council",
                enablingAct: "Disaster Management Act, No. 13 of 2005",
                actSection: "Section 2",
                chair: "President (Chairman)",
                composition:
                    "The President (Chairman) and the Prime Minister (Vice-Chairman), Leader of the Opposition, nominated MPs, Cabinet Ministers, and Chief Ministers of every Provincial Council.",
                frequency: {
                    type: "defined",
                    interval: "Once in every 3 months",
                },
                mandate: [
                    {
                        section: "Section 2",
                        body: "Disaster Management Act",
                        description:
                            "There shall be established a body called the National Council for Disaster Management.",
                        frequency: "Establishment",
                    },
                    {
                        section: "Section 2",
                        body: "Disaster Management Act",
                        description:
                            "The Council shall meet as often as may be necessary, but not less than once in every three months.",
                        frequency: "Quarterly",
                    },
                    {
                        section: "3(1), 3(2), and 3(3)",
                        body: "Disaster Management Act",
                        description:
                            "The President (Chairman) and the Prime Minister (Vice-Chairman) must preside, along with MPs, ministers, and provincial chief ministers.",
                        frequency: "Per meeting",
                    },
                ],
                rtiHistory: [
                    {
                        dateSent: "2026-04-10",
                        dateResponded: "2026-04-27",
                        status: "rejected",
                        description:
                            "RTI request sent to DMC: last 3 meeting dates, meeting minutes, and board member list.",
                        response:
                            "Request closed: rejected as confidential.",
                        files: ["requests/req_003.pdf"],
                    },
                ],
                meetingInstances: [],
            },
        ],
    },
];

