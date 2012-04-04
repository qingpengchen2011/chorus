describe("newFixtures", function() {
    describe("#user", function() {
        var user;

        beforeEach(function() {
            user = newFixtures.user();
        });

        it("should create a user model", function() {
            expect(user).toBeA(chorus.models.User);
        });

        it("sets attributes of the model based on the fixtureData", function() {
            expect(window.fixtureData.user).toBeDefined();
            expect(window.fixtureData.user.userName).toBeDefined();
            expect(user.get("userName")).toBe(window.fixtureData.user.userName);
        });

        it("allows for overrides", function() {
            user = newFixtures.user({userName: "Foo Bar"});
            expect(user.get("userName")).toBe("Foo Bar");
        });

        it("does not allow overrides for non-existant attributes", function() {
            expect(function() {newFixtures.user({foo: "Bar"})}).toThrow();
        });
    });

    describe("#safeExtend", function() {
        var result, target;

        beforeEach(function() {
            target = {
                foo: "bar",
                baz: "quux",
                nestedObjectArray: [
                    {
                        name: "ryan",
                        id: 3
                    },
                    {
                        name: "bleicke",
                        id: 4
                    }
                ],
                nestedStringArray: [
                    "Bob", "Jim", "Jim-Bob"
                ],
                nestedObject: {
                    name: "joe",
                    id: 5
                }
            };
        });

        context("when no overrides are specified", function() {
            it("returns the target", function() {
                var result = window.newFixtures.safeExtend(target, undefined);
                expect(result).toEqual(target);
            });
        });

        context("when a property is overriden", function() {
            beforeEach(function() {
                result = window.newFixtures.safeExtend(target, { foo: "pizza" });
            });

            it("uses the override", function() {
                expect(result.foo).toBe("pizza");
            });

            it("preserves the other keys in the original object", function() {
                expect(result.baz).toBe("quux");
            });

            it("does not allow keys that aren't present in the original object", function() {
                expect(function() {
                    window.newFixtures.safeExtend(target, { whippedCream: "lots" });
                }).toThrow();
            });
        });

        context("when overriding a key in a nested object", function() {
            beforeEach(function() {
                result = window.newFixtures.safeExtend(target, {
                    nestedObject: {
                        name: "pizza"
                    }
                });
            });

            it("uses the override", function() {
                expect(result.nestedObject.name).toBe("pizza");
            });

            it("preserves the other keys in the original object", function() {
                expect(result.nestedObject.id).toBe(5);
            });

            it("does not allow keys that aren't present in the nested object", function() {
                expect(function() {
                    window.newFixtures.safeExtend(target, { nestedObject: { hamburger: "double" }})
                }).toThrow();
            });
        });

        context("when overriding a value in a nested array", function() {
            beforeEach(function() {
                result = window.newFixtures.safeExtend(target, {
                    nestedStringArray: [
                        "Pivotal", "Labs", "Is", "Awesome"
                    ]
                });
            });

            it("uses the new values as-is", function() {
                expect(result.nestedStringArray).toEqual(["Pivotal", "Labs", "Is", "Awesome"]);
            });
        });

        context("when overriding an object in a nested array", function() {
            context("when the length of the override array is less than or equal to the original arrays' length", function() {
                beforeEach(function() {
                    result = window.newFixtures.safeExtend(target, {
                        nestedObjectArray: [
                            { name: "bazillionaire" }
                        ]
                    });
                });

                it("uses the overridden properties", function() {
                    expect(result.nestedObjectArray[0].name).toBe("bazillionaire");
                });

                it("keeps each of the orginal objects' other properties", function() {
                    expect(result.nestedObjectArray[0].id).toBe(3);
                });

                it("keeps any elements in the original array which were not overridden", function() {
                    expect(result.nestedObjectArray[1].name).toBe('bleicke');
                    expect(result.nestedObjectArray[1].id).toBe(4);
                });
            });

            context("when the override array is longer than the original array", function() {
                beforeEach(function() {
                    result = window.newFixtures.safeExtend(target, {
                        nestedObjectArray: [
                            { name: "bazillionaire" },
                            { name: "gajillionaire" },
                            { name: "google" }
                        ]
                    });
                });

                it("uses the supplied values as-is", function() {
                    expect(result.nestedObjectArray[2]).toEqual({ name: "google" });
                });
            });
        });
    });
});
