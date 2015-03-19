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
			expect(message).to.exist;
		});
	});
	
	describe("guid", function() {
		it("creates successfully", function() {
			expect(message.guid()).to.not.be.an('undefined');
		});

		it("is valid", function() {
			expect(message.guid()).to.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
		});
	});
});