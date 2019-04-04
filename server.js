const express = require("express")
const bodyParser = require("body-parser")

const app = express()

app.use(bodyParser.json({ type: [ "application/json", "application/fhir+json" ], limit: "50mb"  }))

app.listen(3000, () => console.log("server started"))

app.get("/", (request, response) => { return response.status(200).send("Test") })

app.post("/AuthService/oauth/token", (request, response) => {

    console.log("hit")

    return response
        .status(200)
        .send({
            access_token: "test-token",
            token_type: "bearer",
            expires_in: 3600
        })
})

app.get("/FHIRService/:resource/:id?", (request, response) => {
    try {

        const { authorization } = request.headers

        console.log("hit")

        console.log(authorization)

        console.log(request.params)

        if (authorization !== "Bearer test-token") {
            return response.send(403)
        }

        const { resource, id } = request.params

        if (!resource) {
            return response.send(400)
        }

        let fhirResource

        switch(resource.toLowerCase()) {
            case "patient": {
                fhirResource = getPatient()
                break
            }
            case "practitioner": {
                fhirResource = getPractitioner()
                break
            }
            case "practitionerrole": {
                fhirResource = getPractitionerRole()
                break
            }
            case "organization": {
                fhirResource = getOrganization()
                break
            }
            default: {
                return response.send(400)
            }
        }

        if (!fhirResource) {
            return response.send(400)
        }

        return response.status(200).send(fhirResource)

    } catch {
        return response.send(500)
    }
})

function getPatient() {
    return {
        "resourceType": "Bundle",
        "id": "fc9a63a1-1d5f-44dd-bf18-5bfeed6f8f06",
        "type": "searchset",
        "link": [
            {
                "relation": "self",
                "url": "https://test:444/FHIRService/Patient?identifier=8888888888"
            }
        ],
        "entry": [
            {
                "fullUrl": "https://test:444/FHIRService/Patient/7fa060b2-ee14-4b8f-9197-f035ce3cca91",
                "search": {
                    "mode": "match"
                },
                "resource": {
                    "resourceType": "Patient",
                    "id": "7fa060b2-ee14-4b8f-9197-f035ce3cca91",
                    "identifier": [
                        {
                            "value": "8888888888",
                            "use": "official",
                            "system": "https://fhir.nhs.uk/Id/nhs-number"
                        }
                    ],
                    "name": [
                        {
                            "given": [
                                "Test"
                            ],
                            "family": "Test",
                            "prefix": [
                                "Master"
                            ],
                            "use": "official",
                            "period": {
                                "start": "2018-11-01T12:04:48.697Z"
                            },
                            "text": "Master Test Test"
                        }
                    ],
                    "telecom": [
                        {
                            "value": "+44 7777777777",
                            "system": "phone",
                            "use": "home",
                            "rank": "1",
                            "period": {
                                "start": "2018-08-01"
                            }
                        }
                    ],
                    "gender": "female",
                    "birthDate": "1905-06-13",
                    "deceasedBoolean": false,
                    "generalPractitioner": [
                        {
                            "reference": "Practitioner/69649ff7-148a-4a38-baaa-7827cb32bb69",
                            "display": "General Practitioner"
                        },
                        {
                            "reference": "Organization/d16a4add-b660-4aa3-a473-057c02b30f80",
                            "display": "Organization"
                        }
                    ]
                }
            }
        ],
        "total": 1
    }
}

function getPractitioner() {
    return {
        "resourceType": "Practitioner",
        "id": "69649ff7-148a-4a38-baaa-7827cb32bb69",
        "identifier": [
            {
                "value": "test",
                "system": "https://fhir.nhs.uk/Id/sds-user-id"
            }
        ],
        "active": true,
        "name": [
            {
                "given": [
                    "Test"
                ],
                "family": "Practitioner",
                "text": "Test Practitioner"
            }
        ]
    }
}

function getPractitionerRole() {
    return {
        "resourceType": "Bundle",
        "id": "0104f713-3e9f-4a1f-8ec2-f1847c14e8fd",
        "type": "searchset",
        "link": [
            {
                "relation": "self",
                "url": "https://test:444/FHIRService/PractitionerRole?practitioner=Practitioner/69649ff7-148a-4a38-baaa-7827cb32bb69"
            }
        ],
        "entry": [
            {
                "fullUrl": "https://test:444/FHIRService/PractitionerRole/ee35939e-6e79-4628-b69f-0ac343184aa5",
                "resource": {
                    "resourceType": "PractitionerRole",
                    "id": "ee35939e-6e79-4628-b69f-0ac343184aa5",
                    "organization": {
                        "reference": "Organization/d16a4add-b660-4aa3-a473-057c02b30f80",
                        "display": "Organization"
                    }
                },
                "search": {
                    "mode": "match"
                }
            }
        ],
        "total": 1
    }
}

function getOrganization() {
    return {
        "resourceType": "Organization",
        "id": "d16a4add-b660-4aa3-a473-057c02b30f80",
        "active": true,
        "type": [
            {
                "coding": [
                    {
                        "system": "https://fhir.hacw.nhs.uk/organization-type",
                        "code": "GPPR",
                        "display": "GP Practice"
                    }
                ],
                "text": "GP Practice"
            }
        ],
        "name": "Test Medical Centre",
        "address": [
            {
                "line": [
                    "Test Medical Centre"
                ],
                "use": "work",
                "type": "both",
                "text": "Test Medical Centre, Test Street, Test City, Test County, TR4 9TT",
                "city": "Test Street",
                "district": "Test City",
                "state": "Test County",
                "postalCode": "TR4 9TT"
            }
        ]
    }
}