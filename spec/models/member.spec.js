describe("Member Model", function() {
	var member;
	
	beforeEach(function() {
		member = new Member();
	});

	afterEach(function() {
		delete member;
	});

	describe("when instantiated", function() {
		it("is valid without a value", function() {
			expect(member).toBeDefined();
		});

		it("exhibits valid attributes", function() {
			member.set({"endpointId": "tvdavis@digium.com"});
			expect(member.get("endpointId")).toEqual("tdavis@digium.com");
		});
	});
});