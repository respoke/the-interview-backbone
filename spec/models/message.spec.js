describe("Message Model", function() {
	var message;
	
	beforeEach(function() {
		message = new Message();
	});

	afterEach(function() {
		delete message;
	});

	describe("when instantiated", function() {
		it("is valid message", function() {
			expect(message).toBeDefined();
		});
	});
	
	describe("guid", function() {
		it("creates successfully", function() {
			expect(message).toBeDefined();
		});

		it("is valid", function() {
			expect(message.guid()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
		});
	});
});