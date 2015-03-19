describe("Member Model", function() {
	var member;
	
	beforeEach(function() {
		member = new Member();
	});

	afterEach(function() {
		delete member;
	});

	describe("when instantiated", function() {
		it("is valid member", function() {
			expect(member).toBeDefined();
		});

		it("has valid endpointId", function() {
			member.set({"endpointId": "tvdavis@digium.com"});
			expect(member.get("endpointId")).toEqual("tvdavis@digium.com");
		});
		
		it("urlRoot set to /api/tokens", function() {
			expect(member.urlRoot).toEqual("/api/tokens");
		});
	});
});