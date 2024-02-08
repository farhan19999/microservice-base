const app = require("../index");

const request = require("supertest");

describe("GET /api/book", () => {
    beforeAll(() => {
        //here dummy database can be initialized
    });
    test("respond with json containing a list of all books", async () => {
        return request(app)
            .get("/api/book")
            .expect("Content-Type", /json/)
            .expect(300);
    });



    afterAll(() => {
        app.close();
    });
});

describe("POST /api/book", () => {
    beforeAll(() => {
        //here dummy database can be initialized
    });
    test("respond with json containing a list of all books", async () => {
        return request(app)
            .post("/api/book")
            .send({ title: "test", author: "test" })
            .expect("Content-Type", /json/)
            .expect(201)
            .then((response) => {
                expect(response.body).toEqual({ title: "test", author: "test" });
            });
    });
    afterAll(() => {
        app.close();
    });
});

describe("PUT /api/book/:id", () => {
    beforeAll(() => {
        //here dummy database can be initialized
    });
    test("respond with json containing a list of all books", async () => {
        return request(app)
            .put("/api/book/1")
            .send({ title: "test", author: "test" })
            .expect("Content-Type", /json/)
            .expect(200)
            .then((response) => {
                expect(response.body).toEqual({ title: "test", author: "test" });
            });
    });
    afterAll(() => {
        app.close();
    });
});

describe("DELETE /api/book/:id", () => {
    beforeAll(() => {
        //here dummy database can be initialized
    });
    test("respond with json containing a list of all books", async () => {
        return request(app)
            .delete("/api/book/1")
            .expect(204);
    });
    
    afterAll(() => {
        app.close();
    });
});
